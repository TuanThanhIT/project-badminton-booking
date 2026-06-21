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

SLOTS_PER_BRANCH = 5


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
        "needsPromotion": needs_promotion,
        "suggestion": "Tạo khuyến mãi cho khung giờ thấp điểm"
        if needs_promotion
        else "Theo dõi thêm",
    }


def build_admin_insights(payload: dict) -> dict:
    occupancy = payload.get("occupancy") or []
    user_activity = payload.get("userActivity") or []
    low_threshold = float(payload.get("lowFillThreshold", 40))
    churn_days = int(payload.get("churnDaysThreshold", 21))

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

        sorted_hours = sorted(
            item["hours"],
            key=lambda x: (x.get("fillRate", 0), x.get("hour", 0)),
        )
        bottom_slots = []
        for row in sorted_hours[:SLOTS_PER_BRANCH]:
            needs = float(row.get("fillRate", 0)) < low_threshold
            bottom_slots.append(_slot_payload(row, needs_promotion=needs))

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
        [
            {
                "branchId": row["branchId"],
                "branchName": row["branchName"],
                "hour": int(row["hour"]),
                "hourEnd": int(row.get("hourEnd") or int(row["hour"]) + 1),
                "hourLabel": _hour_label(row),
                "fillRate": row["fillRate"],
                "bookedCount": row.get("bookedCount", 0),
                "capacity": row.get("capacity", 0),
            }
            for row in occupancy
            if row.get("capacity", 0) > 0
        ],
        key=lambda x: x["fillRate"],
        reverse=True,
    )[:15]

    likely_return = []
    needs_voucher = []

    for user in user_activity:
        days = user.get("daysSinceLastBooking")
        total = user.get("totalBookings", 0)

        base = {
            "userId": user["userId"],
            "fullName": user.get("fullName"),
            "email": user.get("email"),
            "totalBookings": total,
            "daysSinceLastBooking": days,
            "lastBranchName": user.get("lastBranchName"),
        }

        if total >= 2 and days is not None and days <= 14:
            likely_return.append({**base, "reason": "recent_active_customer"})
        elif total >= 2 and days is not None and days > churn_days:
            needs_voucher.append(
                {
                    **base,
                    "reason": "churn_risk",
                    "suggestedAction": "Gửi voucher kích hoạt lại",
                }
            )
        elif total == 1 and days is not None and days > 7:
            needs_voucher.append(
                {
                    **base,
                    "reason": "second_booking_nudge",
                    "suggestedAction": "Ưu đãi lần đặt thứ 2",
                }
            )

    likely_return.sort(key=lambda x: x.get("daysSinceLastBooking") or 999)
    needs_voucher.sort(
        key=lambda x: x.get("daysSinceLastBooking") or 0, reverse=True
    )

    return {
        "fillRateByBranch": branch_summary,
        "fillRateByBranchHour": occupancy,
        "promotionByBranch": promotion_by_branch,
        "lowFillPromotionSuggestions": low_fill_slots[:25],
        "peakTimeSlots": peak_slots,
        "likelyReturnCustomers": likely_return[:20],
        "voucherActivationCandidates": needs_voucher[:20],
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
        },
        "insightType": "rule_based",
    }
