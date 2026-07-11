const hourLabel = (row) => {
  if (row.hourLabel) return String(row.hourLabel);
  const hour = Number(row.hour ?? 0);
  const hourEnd = Number(row.hourEnd ?? hour + 1);
  return `${String(hour).padStart(2, "0")}:00–${String(hourEnd).padStart(2, "0")}:00`;
};

const slotPayload = (row, { needsPromotion }) => ({
  branchId: row.branchId,
  branchName: row.branchName,
  hour: Number(row.hour),
  hourEnd: Number(row.hourEnd ?? Number(row.hour) + 1),
  hourLabel: hourLabel(row),
  fillRate: row.fillRate,
  bookedCount: row.bookedCount ?? 0,
  capacity: row.capacity ?? 0,
  courtCount: row.courtCount ?? 0,
  needsPromotion,
  suggestion: needsPromotion
    ? "Tạo khuyến mãi cho khung giờ thấp điểm"
    : "Theo dõi thêm",
});

const peakSlotPayload = (row) => ({
  branchId: row.branchId,
  branchName: row.branchName,
  hour: Number(row.hour),
  hourEnd: Number(row.hourEnd ?? Number(row.hour) + 1),
  hourLabel: hourLabel(row),
  fillRate: row.fillRate,
  bookedCount: row.bookedCount ?? 0,
  capacity: row.capacity ?? 0,
  courtCount: row.courtCount ?? 0,
});

const customerPayload = (user, { reason, suggestedAction = null, rank = null }) => {
  const payload = {
    userId: user.userId,
    fullName: user.fullName,
    email: user.email,
    totalBookings: Number(user.totalBookings) || 0,
    ordersLast30Days: Number(user.ordersLast30Days) || 0,
    sessionsLast30Days: Number(user.sessionsLast30Days) || 0,
    daysSinceLastBooking: user.daysSinceLastBooking,
    lastBranchName: user.lastBranchName,
    reason,
  };
  if (suggestedAction) payload.suggestedAction = suggestedAction;
  if (rank != null) payload.rank = rank;
  return payload;
};

const segmentCustomers = (
  userActivity,
  { churnDays, vipMinSessions, segmentTopK, secondBookingNudgeDays },
) => {
  const vipPool = userActivity.filter(
    (user) => Number(user.sessionsLast30Days) >= vipMinSessions,
  );

  vipPool.sort((a, b) => {
    const sessionsDiff =
      Number(b.sessionsLast30Days) - Number(a.sessionsLast30Days);
    if (sessionsDiff !== 0) return sessionsDiff;
    const daysA = a.daysSinceLastBooking ?? 999;
    const daysB = b.daysSinceLastBooking ?? 999;
    return daysA - daysB;
  });

  const likelyReturn = vipPool.slice(0, segmentTopK).map((user, idx) =>
    customerPayload(user, { reason: "top_active_last_period", rank: idx + 1 }),
  );
  const vipIds = new Set(likelyReturn.map((row) => row.userId));

  const needsVoucher = [];
  for (const user of userActivity) {
    if (vipIds.has(user.userId)) continue;

    const days = user.daysSinceLastBooking;
    const total = Number(user.totalBookings) || 0;
    const sessions = Number(user.sessionsLast30Days) || 0;

    if (sessions !== 0) continue;

    if (total >= 2 && days != null && days > churnDays) {
      needsVoucher.push(
        customerPayload(user, {
          reason: "churn_risk",
          suggestedAction: "Tạo mã riêng nhắc khách quen quay lại",
        }),
      );
    } else if (total === 1 && days != null && days > secondBookingNudgeDays) {
      needsVoucher.push(
        customerPayload(user, {
          reason: "second_booking_nudge",
          suggestedAction: "Tạo mã riêng cho lần đặt thứ 2",
        }),
      );
    }
  }

  needsVoucher.sort(
    (a, b) => (b.daysSinceLastBooking ?? 0) - (a.daysSinceLastBooking ?? 0),
  );

  return {
    likelyReturn,
    needsVoucher: needsVoucher.slice(0, segmentTopK),
    likelyReturnEligibleCount: vipPool.length,
    voucherCandidateEligibleCount: needsVoucher.length,
  };
};

export const buildAdminInsights = (payload = {}) => {
  const occupancy = payload.occupancy || [];
  const userActivity = payload.userActivity || [];
  const lowThreshold = Number(payload.lowFillThreshold ?? 40);
  const churnDays = Number(payload.churnDaysThreshold ?? 21);
  const peakPerBranch = Number(payload.peakSlotsPerBranch ?? 3);
  const maxPeakGlobal = Number(payload.maxPeakSlotsGlobal ?? 15);
  const lookbackDays = Number(payload.lookbackDays ?? 30);
  const customerLookback = Number(payload.customerLookbackDays ?? lookbackDays);
  const vipMinSessions = Number(payload.vipMinSessions ?? 2);
  const segmentTopK = Number(payload.segmentTopK ?? 20);
  const secondBookingNudgeDays = Number(payload.secondBookingNudgeDays ?? 7);
  const periodStart = payload.periodStart;
  const periodEnd = payload.periodEnd;

  const byBranch = new Map();
  for (const row of occupancy) {
    const bid = row.branchId;
    if (!byBranch.has(bid)) {
      byBranch.set(bid, {
        branchId: bid,
        branchName: row.branchName,
        totalBooked: 0,
        totalCapacity: 0,
        hours: [],
      });
    }
    const item = byBranch.get(bid);
    item.totalBooked += row.bookedCount ?? 0;
    item.totalCapacity += row.capacity ?? 0;
    item.hours.push(row);
  }

  const branchSummary = [];
  const promotionByBranch = [];
  const peakSlots = [];

  for (const item of byBranch.values()) {
    const fill =
      item.totalCapacity > 0
        ? Math.round((item.totalBooked / item.totalCapacity) * 1000) / 10
        : 0;

    branchSummary.push({
      branchId: item.branchId,
      branchName: item.branchName,
      fillRate: fill,
      totalBooked: item.totalBooked,
      totalCapacity: item.totalCapacity,
    });

    const lowRows = [...item.hours].sort(
      (a, b) =>
        Number(a.fillRate ?? 0) - Number(b.fillRate ?? 0) ||
        Number(a.hour ?? 0) - Number(b.hour ?? 0),
    );
    const bottomSlots = [];
    for (const row of lowRows) {
      const rate = Number(row.fillRate ?? 0);
      if (rate < lowThreshold) {
        bottomSlots.push(slotPayload(row, { needsPromotion: true }));
      }
    }

    promotionByBranch.push({
      branchId: item.branchId,
      branchName: item.branchName,
      branchFillRate: fill,
      totalBooked: item.totalBooked,
      totalCapacity: item.totalCapacity,
      slots: bottomSlots,
    });

    const branchPeak = item.hours
      .filter((row) => Number(row.capacity ?? 0) > 0)
      .sort(
        (a, b) =>
          Number(b.fillRate ?? 0) - Number(a.fillRate ?? 0) ||
          Number(b.hour ?? 0) - Number(a.hour ?? 0),
      )
      .slice(0, peakPerBranch)
      .map(peakSlotPayload);
    peakSlots.push(...branchPeak);
  }

  branchSummary.sort((a, b) => a.fillRate - b.fillRate);
  promotionByBranch.sort((a, b) => a.branchFillRate - b.branchFillRate);

  const lowFillSlots = promotionByBranch
    .flatMap((group) => group.slots)
    .filter((slot) => slot.needsPromotion)
    .sort(
      (a, b) =>
        Number(a.fillRate) - Number(b.fillRate) || Number(a.hour) - Number(b.hour),
    );

  const sortedPeakSlots = peakSlots
    .sort(
      (a, b) =>
        Number(b.fillRate) - Number(a.fillRate) || Number(b.hour) - Number(a.hour),
    )
    .slice(0, maxPeakGlobal);

  const {
    likelyReturn,
    needsVoucher,
    likelyReturnEligibleCount,
    voucherCandidateEligibleCount,
  } = segmentCustomers(userActivity, {
    churnDays,
    vipMinSessions,
    segmentTopK,
    secondBookingNudgeDays,
  });

  return {
    fillRateByBranch: branchSummary,
    fillRateByBranchHour: occupancy,
    promotionByBranch,
    lowFillPromotionSuggestions: lowFillSlots.slice(0, 25),
    peakTimeSlots: sortedPeakSlots,
    likelyReturnCustomers: likelyReturn,
    voucherActivationCandidates: needsVoucher,
    summary: {
      branchCount: branchSummary.length,
      lowFillSlotCount: lowFillSlots.length,
      likelyReturnCount: likelyReturn.length,
      voucherCandidateCount: needsVoucher.length,
      likelyReturnEligibleCount,
      voucherCandidateEligibleCount,
      avgFillRate:
        branchSummary.length > 0
          ? Math.round(
              (branchSummary.reduce((sum, b) => sum + b.fillRate, 0) /
                branchSummary.length) *
                10,
            ) / 10
          : 0,
      lookbackDays,
      customerLookbackDays: customerLookback,
      periodStart,
      periodEnd,
      vipMinSessions,
      segmentTopK,
      lowFillThreshold: lowThreshold,
      peakSlotsPerBranch: peakPerBranch,
    },
    insightType: "rule_based",
  };
};

export default {
  buildAdminInsights,
};
