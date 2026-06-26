from __future__ import annotations

DAY_LABELS = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
]


def _hour_label(row: dict) -> str:
    if row.get("hourLabel"):
        return str(row["hourLabel"])
    hour = int(row.get("hour") or 0)
    hour_end = int(row.get("hourEnd") or hour + 1)
    return f"{hour:02d}:00–{hour_end:02d}:00"


def _slot_payload(row: dict, *, needs_promotion: bool) -> dict:
    return {
        "branchId": row["branchId"],
        "branchName": row["branchName"],
        "hour": int(row["hour"]),
        "hourEnd": int(row.get("hourEnd") or int(row["hour"]) + 1),
        "hourLabel": _hour_label(row),
        "fillRate": row["fillRate"],
        "bookedCount": row.get("bookedCount", 0),
        "capacity": row.get("capacity", 0),
        "courtCount": row.get("courtCount", 0),
        "needsPromotion": needs_promotion,
        "suggestion": "Tạo khuyến mãi cho khung giờ thấp điểm"
        if needs_promotion
        else "Theo dõi thêm",
    }


def _peak_slot_payload(row: dict) -> dict:
    return {
        "branchId": row["branchId"],
        "branchName": row["branchName"],
        "hour": int(row["hour"]),
        "hourEnd": int(row.get("hourEnd") or int(row["hour"]) + 1),
        "hourLabel": _hour_label(row),
        "fillRate": row["fillRate"],
        "bookedCount": row.get("bookedCount", 0),
        "capacity": row.get("capacity", 0),
        "courtCount": row.get("courtCount", 0),
    }


def _customer_payload(
    user: dict,
    *,
    reason: str,
    suggested_action: str | None = None,
    rank: int | None = None,
) -> dict:
    payload = {
        "userId": user["userId"],
        "fullName": user.get("fullName"),
        "email": user.get("email"),
        "totalBookings": int(user.get("totalBookings") or 0),
        "ordersLast30Days": int(user.get("ordersLast30Days") or 0),
        "sessionsLast30Days": int(user.get("sessionsLast30Days") or 0),
        "daysSinceLastBooking": user.get("daysSinceLastBooking"),
        "lastBranchName": user.get("lastBranchName"),
        "reason": reason,
    }
    if suggested_action:
        payload["suggestedAction"] = suggested_action
    if rank is not None:
        payload["rank"] = rank
    return payload


def _segment_customers(
    user_activity: list[dict],
    *,
    churn_days: int,
    vip_min_sessions: int,
    segment_top_k: int,
    second_booking_nudge_days: int,
) -> tuple[list[dict], list[dict]]:
    """Tri ân: top suất trong cửa sổ. Tái kích hoạt: 0 suất + lịch sử phù hợp."""
    vip_pool: list[dict] = []
    for user in user_activity:
        sessions = int(user.get("sessionsLast30Days") or 0)
        if sessions >= vip_min_sessions:
            vip_pool.append(user)

    vip_pool.sort(
        key=lambda u: (
            -int(u.get("sessionsLast30Days") or 0),
            u.get("daysSinceLastBooking") if u.get("daysSinceLastBooking") is not None else 999,
        )
    )
    likely_return = [
        _customer_payload(user, reason="top_active_last_period", rank=idx + 1)
        for idx, user in enumerate(vip_pool[:segment_top_k])
    ]
    vip_ids = {row["userId"] for row in likely_return}

    needs_voucher: list[dict] = []
    for user in user_activity:
        if user["userId"] in vip_ids:
            continue

        days = user.get("daysSinceLastBooking")
        total = int(user.get("totalBookings") or 0)
        sessions = int(user.get("sessionsLast30Days") or 0)

        if sessions != 0:
            continue

        if total >= 2 and days is not None and days > churn_days:
            needs_voucher.append(
                _customer_payload(
                    user,
                    reason="churn_risk",
                    suggested_action="Tạo mã riêng nhắc khách quen quay lại",
                )
            )
        elif total == 1 and days is not None and days > second_booking_nudge_days:
            needs_voucher.append(
                _customer_payload(
                    user,
                    reason="second_booking_nudge",
                    suggested_action="Tạo mã riêng cho lần đặt thứ 2",
                )
            )

    needs_voucher.sort(
        key=lambda x: x.get("daysSinceLastBooking") or 0, reverse=True
    )
    return likely_return, needs_voucher[:segment_top_k]


def build_admin_insights(payload: dict) -> dict:
    occupancy = payload.get("occupancy") or []
    user_activity = payload.get("userActivity") or []
    low_threshold = float(payload.get("lowFillThreshold", 40))
    churn_days = int(payload.get("churnDaysThreshold", 21))
    peak_per_branch = int(payload.get("peakSlotsPerBranch", 3))
    max_peak_global = int(payload.get("maxPeakSlotsGlobal", 15))
    lookback_days = int(payload.get("lookbackDays", 30))
    customer_lookback = int(payload.get("customerLookbackDays", lookback_days))
    vip_min_sessions = int(payload.get("vipMinSessions", 2))
    segment_top_k = int(payload.get("segmentTopK", 20))
    second_booking_nudge_days = int(payload.get("secondBookingNudgeDays", 7))
    period_start = payload.get("periodStart")
    period_end = payload.get("periodEnd")

    by_branch: dict[int, dict] = {}
    for row in occupancy:
        bid = row["branchId"]
        if bid not in by_branch:
            by_branch[bid] = {
                "branchId": bid,
                "branchName": row["branchName"],
                "totalBooked": 0,
                "totalCapacity": 0,
                "hours": [],
            }
        by_branch[bid]["totalBooked"] += row.get("bookedCount", 0)
        by_branch[bid]["totalCapacity"] += row.get("capacity", 0)
        by_branch[bid]["hours"].append(row)

    branch_summary = []
    promotion_by_branch = []
    peak_slots: list[dict] = []

    for item in by_branch.values():
        fill = (
            round(item["totalBooked"] / item["totalCapacity"] * 100, 1)
            if item["totalCapacity"] > 0
            else 0
        )
        branch_summary.append(
            {
                "branchId": item["branchId"],
                "branchName": item["branchName"],
                "fillRate": fill,
                "totalBooked": item["totalBooked"],
                "totalCapacity": item["totalCapacity"],
            }
        )

        # Thấp điểm: mọi khung có % < ngưỡng (giờ nào → do data)
        low_rows = sorted(
            item["hours"],
            key=lambda x: (x.get("fillRate", 0), x.get("hour", 0)),
        )
        bottom_slots = []
        for row in low_rows:
            rate = float(row.get("fillRate", 0))
            needs = rate < low_threshold
            if needs:
                bottom_slots.append(_slot_payload(row, needs_promotion=True))

        promotion_by_branch.append(
            {
                "branchId": item["branchId"],
                "branchName": item["branchName"],
                "branchFillRate": fill,
                "totalBooked": item["totalBooked"],
                "totalCapacity": item["totalCapacity"],
                "slots": bottom_slots,
            }
        )

        # Cao điểm: top N khung % cao nhất / chi nhánh (giờ nào → do data)
        branch_peak = sorted(
            [r for r in item["hours"] if r.get("capacity", 0) > 0],
            key=lambda x: (x.get("fillRate", 0), x.get("hour", 0)),
            reverse=True,
        )[:peak_per_branch]
        peak_slots.extend(_peak_slot_payload(row) for row in branch_peak)

    branch_summary.sort(key=lambda x: x["fillRate"])
    promotion_by_branch.sort(key=lambda x: x["branchFillRate"])

    low_fill_slots = [
        slot
        for group in promotion_by_branch
        for slot in group["slots"]
        if slot["needsPromotion"]
    ]
    low_fill_slots.sort(key=lambda x: (x["fillRate"], x["hour"]))

    peak_slots = sorted(
        peak_slots,
        key=lambda x: (x["fillRate"], x["hour"]),
        reverse=True,
    )[:max_peak_global]

    likely_return, needs_voucher = _segment_customers(
        user_activity,
        churn_days=churn_days,
        vip_min_sessions=vip_min_sessions,
        segment_top_k=segment_top_k,
        second_booking_nudge_days=second_booking_nudge_days,
    )

    return {
        "fillRateByBranch": branch_summary,
        "fillRateByBranchHour": occupancy,
        "promotionByBranch": promotion_by_branch,
        "lowFillPromotionSuggestions": low_fill_slots[:25],
        "peakTimeSlots": peak_slots,
        "likelyReturnCustomers": likely_return,
        "voucherActivationCandidates": needs_voucher,
        "summary": {
            "branchCount": len(branch_summary),
            "lowFillSlotCount": len(low_fill_slots),
            "likelyReturnCount": len(likely_return),
            "voucherCandidateCount": len(needs_voucher),
            "avgFillRate": round(
                sum(b["fillRate"] for b in branch_summary) / len(branch_summary), 1
            )
            if branch_summary
            else 0,
            "lookbackDays": lookback_days,
            "customerLookbackDays": customer_lookback,
            "periodStart": period_start,
            "periodEnd": period_end,
            "vipMinSessions": vip_min_sessions,
            "segmentTopK": segment_top_k,
            "lowFillThreshold": low_threshold,
            "peakSlotsPerBranch": peak_per_branch,
        },
        "insightType": "rule_based",
    }
