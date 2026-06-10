"use strict";

const bcrypt = require("bcrypt");

const ADMIN_USER_ID = 1;
const DEFAULT_ADMIN_PASSWORD = "@Admin123456";

module.exports = {
  async up(queryInterface) {
    const password = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
      10,
    );

    await queryInterface.bulkUpdate(
      "Users",
      {
        password,
        updatedAt: new Date(),
      },
      {
        id: ADMIN_USER_ID,
      },
    );
  },

  async down() {
    // Password seeds are intentionally one-way. Run this seeder again with
    // another ADMIN_PASSWORD value if the admin password needs to change.
  },
};
