"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const row = {
      code: "BHUB_WALLET_10",
      campaignKey: "BHUB_WALLET_PAYMENT",
      type: "PERCENT",
      applyType: "ALL",
      value: 10,
      maxDiscount: 50000,
      minAmount: 0,
      usageLimit: null,
      usageCount: 0,
      isActive: true,
      startDate: "2026-01-01",
      endDate: "2099-12-31",
      visibility: "PUBLIC",
      branchId: null,
      startHour: null,
      endHour: null,
      applicationMode: "AUTOMATIC",
      requiredPaymentMethod: "WALLET",
      usageLimitPerUser: 5,
      usageLimitPeriod: "MONTHLY",
      allowStacking: false,
      createdAt: now,
      updatedAt: now,
    };

    const existing = await queryInterface.sequelize.query(
      `
        SELECT id, usageCount
        FROM Discounts
        WHERE campaignKey = :campaignKey OR code = :code
        LIMIT 1
      `,
      {
        replacements: {
          campaignKey: row.campaignKey,
          code: row.code,
        },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    if (existing.length) {
      const { createdAt, ...updateRow } = row;
      await queryInterface.bulkUpdate(
        "Discounts",
        {
          ...updateRow,
          usageCount: existing[0].usageCount || 0,
        },
        { id: existing[0].id },
      );
      return;
    }

    await queryInterface.bulkInsert("Discounts", [row]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Discounts", {
      campaignKey: "BHUB_WALLET_PAYMENT",
      code: "BHUB_WALLET_10",
    });
  },
};
