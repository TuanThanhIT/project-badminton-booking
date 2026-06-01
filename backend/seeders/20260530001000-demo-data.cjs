"use strict";

const bcrypt = require("bcrypt");

const timestamp = new Date("2025-11-25T10:00:00");

const roles = [
  { id: 1, roleName: "ADMIN" },
  { id: 2, roleName: "USER" },
  { id: 5, roleName: "MANAGER" },
  { id: 3, roleName: "EMPLOYEE" },
  { id: 4, roleName: "COACH" },
];

const buildAdminUser = async () => {
  const password = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || process.env.DEMO_PASSWORD || "@Tuanthanh0708",
    10,
  );

  return {
    id: 1,
    username: process.env.ADMIN_USERNAME || "admin",
    password,
    email: process.env.ADMIN_EMAIL || "admin@gmail.com",
    isVerified: true,
    isActive: true,
    roleId: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const buildAdminProfile = (adminUserId) => ({
  id: 1,
  fullName: process.env.ADMIN_FULL_NAME || "Admin",
  dob: "2000-01-01T00:00:00",
  gender: "other",
  address: "Badminton booking system",
  phoneNumber: process.env.ADMIN_PHONE || "0900000001",
  avatar: null,
  level: "BEGINNER",
  userId: adminUserId,
  createdAt: timestamp,
  updatedAt: timestamp,
});

const upsert = async (queryInterface, tableName, rows, updateColumns) => {
  if (!rows.length) return;

  const columns = Object.keys(rows[0]);
  const placeholders = rows
    .map(() => `(${columns.map(() => "?").join(", ")})`)
    .join(", ");
  const updates = updateColumns
    .map((column) => `${column} = VALUES(${column})`)
    .join(", ");
  const replacements = rows.flatMap((row) =>
    columns.map((column) => row[column]),
  );

  await queryInterface.sequelize.query(
    `
    INSERT INTO ${tableName} (${columns.join(", ")})
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE ${updates}
    `,
    { replacements },
  );
};

const deleteByIds = async (queryInterface, tableName, ids) => {
  if (!ids.length) return;
  await queryInterface.bulkDelete(tableName, { id: ids });
};

const deleteRolesIfUnused = async (queryInterface) => {
  await queryInterface.sequelize.query(
    `
    DELETE FROM Roles
    WHERE id IN (:roleIds)
      AND id NOT IN (
        SELECT DISTINCT roleId
        FROM Users
        WHERE roleId IS NOT NULL
      )
    `,
    { replacements: { roleIds: roles.map((role) => role.id) } },
  );
};

module.exports = {
  async up(queryInterface) {
    const adminUser = await buildAdminUser();
    const adminProfile = buildAdminProfile(adminUser.id);

    await upsert(queryInterface, "Roles", roles, ["roleName"]);
    await upsert(
      queryInterface,
      "Users",
      [adminUser],
      [
        "username",
        "password",
        "email",
        "isVerified",
        "isActive",
        "roleId",
        "updatedAt",
      ],
    );
    await upsert(
      queryInterface,
      "Profiles",
      [adminProfile],
      [
        "fullName",
        "dob",
        "gender",
        "address",
        "phoneNumber",
        "avatar",
        "level",
        "userId",
        "updatedAt",
      ],
    );
  },

  async down(queryInterface) {
    await deleteByIds(queryInterface, "Profiles", [1]);
    await deleteByIds(queryInterface, "Users", [1]);
    await deleteRolesIfUnused(queryInterface);
  },
};
