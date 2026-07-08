"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex("BookingDetails", ["playDate"], {
      name: "idx_booking_details_play_date",
    });
    await queryInterface.addIndex(
      "BookingDetails",
      ["bookingId", "playDate"],
      { name: "idx_booking_details_booking_play_date" },
    );
    await queryInterface.addIndex("Bookings", ["userId", "bookingStatus"], {
      name: "idx_bookings_user_status",
    });
    await queryInterface.addIndex("Bookings", ["branchId", "bookingStatus"], {
      name: "idx_bookings_branch_status",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "BookingDetails",
      "idx_booking_details_play_date",
    );
    await queryInterface.removeIndex(
      "BookingDetails",
      "idx_booking_details_booking_play_date",
    );
    await queryInterface.removeIndex("Bookings", "idx_bookings_user_status");
    await queryInterface.removeIndex("Bookings", "idx_bookings_branch_status");
  },
};
