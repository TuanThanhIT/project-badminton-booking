"use strict";

const bcrypt = require("bcrypt");

const timestamp = new Date("2025-11-25T10:00:00");

const roles = [
  { id: 1, roleName: "ADMIN" },
  { id: 2, roleName: "USER" },
  { id: 3, roleName: "EMPLOYEE" },
  { id: 4, roleName: "COACH" },
  { id: 5, roleName: "MANAGER" },
];

const avatarUrls = {
  admin:
    "https://res.cloudinary.com/dyjqsqkir/image/upload/v1776204749/profile_avatars/mucivyuba5wprids8kgy.jpg",
  manager:
    "https://res.cloudinary.com/dyjqsqkir/image/upload/v1770823593/profiles/esm2vvrstcbqwrevr1p5.jpg",
  employee:
    "https://res.cloudinary.com/dyjqsqkir/image/upload/v1767693865/profiles/e4xezs0wvotp9rxsgifv.jpg",
  coach:
    "https://res.cloudinary.com/dyjqsqkir/image/upload/v1767693865/profiles/e4xezs0wvotp9rxsgifv.jpg",
  user: "https://res.cloudinary.com/dyjqsqkir/image/upload/v1764228319/kznpcugyoveaxm1lanmm.jpg",
};

const demoAccountGroups = [
  {
    count: 5,
    prefix: "demo_manager",
    emailPrefix: "demo.manager",
    roleId: 5,
    avatar: avatarUrls.manager,
    fullNames: [
      "Nguyễn Minh Khang",
      "Trần Hoàng Nam",
      "Lê Quốc Bảo",
      "Phạm Gia Huy",
      "Võ Thanh Tùng",
    ],
    dobs: [
      "1988-03-12T00:00:00",
      "1990-07-24T00:00:00",
      "1986-11-08T00:00:00",
      "1992-01-19T00:00:00",
      "1989-09-30T00:00:00",
    ],
    phoneNumbers: [
      "0901100001",
      "0901100002",
      "0901100003",
      "0901100004",
      "0901100005",
    ],
  },
  {
    count: 10,
    prefix: "demo_employee",
    emailPrefix: "demo.employee",
    roleId: 3,
    avatar: avatarUrls.employee,
    fullNames: [
      "Nguyễn Thị Mai",
      "Trần Văn Phúc",
      "Lê Minh Anh",
      "Phạm Thu Hà",
      "Võ Đức Huy",
      "Đặng Ngọc Linh",
      "Bùi Tuấn Kiệt",
      "Hoàng Thanh Vy",
      "Đỗ Quang Minh",
      "Huỳnh Gia Bảo",
    ],
    dobs: [
      "1998-02-14T00:00:00",
      "1997-05-21T00:00:00",
      "1999-08-09T00:00:00",
      "2000-12-03T00:00:00",
      "1996-04-17T00:00:00",
      "1998-10-25T00:00:00",
      "1995-06-11T00:00:00",
      "2001-01-29T00:00:00",
      "1997-09-06T00:00:00",
      "1999-03-18T00:00:00",
    ],
    phoneNumbers: [
      "0901200001",
      "0901200002",
      "0901200003",
      "0901200004",
      "0901200005",
      "0901200006",
      "0901200007",
      "0901200008",
      "0901200009",
      "0901200010",
    ],
  },
  {
    count: 15,
    prefix: "demo_user",
    emailPrefix: "demo.user",
    roleId: 2,
    avatar: avatarUrls.user,
    fullNames: [
      "Nguyễn Hoài An",
      "Trần Khánh Linh",
      "Lê Đức Anh",
      "Phạm Ngọc Hân",
      "Võ Minh Quân",
      "Đặng Gia Nhi",
      "Bùi Nhật Long",
      "Hoàng Thảo Vy",
      "Đỗ Minh Châu",
      "Huỳnh Anh Khoa",
      "Ngô Bảo Ngọc",
      "Mai Thành Đạt",
      "Cao Phương Uyên",
      "Trương Hải Đăng",
      "Phan Kim Ngân",
    ],
    dobs: [
      "2002-04-05T00:00:00",
      "2001-07-16T00:00:00",
      "2000-09-22T00:00:00",
      "2003-11-13T00:00:00",
      "1999-01-27T00:00:00",
      "2002-06-08T00:00:00",
      "2001-12-19T00:00:00",
      "2000-03-30T00:00:00",
      "2003-08-24T00:00:00",
      "1998-10-02T00:00:00",
      "2002-02-11T00:00:00",
      "1999-05-26T00:00:00",
      "2001-09-14T00:00:00",
      "2000-12-07T00:00:00",
      "2003-03-21T00:00:00",
    ],
    phoneNumbers: [
      "0901300001",
      "0901300002",
      "0901300003",
      "0901300004",
      "0901300005",
      "0901300006",
      "0901300007",
      "0901300008",
      "0901300009",
      "0901300010",
      "0901300011",
      "0901300012",
      "0901300013",
      "0901300014",
      "0901300015",
    ],
  },
  {
    count: 2,
    prefix: "demo_coach",
    emailPrefix: "demo.coach",
    roleId: 4,
    avatar: avatarUrls.coach,
    fullNames: ["Nguyễn Hữu Phát", "Trần Thị Bích Ngọc"],
    dobs: ["1991-06-15T00:00:00", "1993-10-20T00:00:00"],
    phoneNumbers: ["0901400001", "0901400002"],
  },

  // Thêm 10 nhân viên mới: demo_employee11 -> demo_employee20
  {
    count: 10,
    startAt: 11,
    prefix: "demo_employee",
    emailPrefix: "demo.employee",
    roleId: 3,
    avatar: avatarUrls.employee,
    fullNames: [
      "Nguyễn Thanh Phong",
      "Trần Mỹ Duyên",
      "Lê Tuấn Anh",
      "Phạm Minh Trí",
      "Võ Hải Yến",
      "Đặng Quốc Hưng",
      "Bùi Thị Kim Ngân",
      "Hoàng Minh Nhật",
      "Đỗ Gia Hân",
      "Huỳnh Tấn Đạt",
    ],
    dobs: [
      "1998-07-12T00:00:00",
      "1999-02-25T00:00:00",
      "1997-11-03T00:00:00",
      "2000-04-18T00:00:00",
      "1998-09-09T00:00:00",
      "1996-12-21T00:00:00",
      "2001-05-14T00:00:00",
      "1997-08-30T00:00:00",
      "1999-10-07T00:00:00",
      "1998-01-16T00:00:00",
    ],
    phoneNumbers: [
      "0901200011",
      "0901200012",
      "0901200013",
      "0901200014",
      "0901200015",
      "0901200016",
      "0901200017",
      "0901200018",
      "0901200019",
      "0901200020",
    ],
  },

  // Thêm 25 khách hàng mới: demo_user16 -> demo_user40
  {
    count: 25,
    startAt: 16,
    prefix: "demo_user",
    emailPrefix: "demo.user",
    roleId: 2,
    avatar: avatarUrls.user,
    fullNames: [
      "Nguyễn Minh Thư",
      "Trần Gia Bảo",
      "Lê Phương Anh",
      "Phạm Hoàng Long",
      "Võ Ngọc Trâm",
      "Đặng Minh Khôi",
      "Bùi Khánh Vy",
      "Hoàng Đức Huy",
      "Đỗ Thảo Nguyên",
      "Huỳnh Quốc Thịnh",
      "Ngô Nhật Minh",
      "Mai Bảo Trân",
      "Cao Anh Tuấn",
      "Trương Mỹ Linh",
      "Phan Gia Hưng",
      "Nguyễn Yến Nhi",
      "Trần Quốc Việt",
      "Lê Khánh Ngọc",
      "Phạm Đức Anh",
      "Võ Minh Tâm",
      "Đặng Thùy Dương",
      "Bùi Hoàng Phúc",
      "Hoàng Kim Chi",
      "Đỗ Hải Nam",
      "Huỳnh Bảo Anh",
    ],
    dobs: [
      "2002-06-17T00:00:00",
      "2001-01-09T00:00:00",
      "2003-04-28T00:00:00",
      "2000-08-15T00:00:00",
      "2002-11-22T00:00:00",
      "1999-03-10T00:00:00",
      "2001-05-06T00:00:00",
      "2000-07-19T00:00:00",
      "2003-09-02T00:00:00",
      "1998-12-25T00:00:00",
      "2002-10-11T00:00:00",
      "2001-02-03T00:00:00",
      "1999-06-27T00:00:00",
      "2000-04-14T00:00:00",
      "2003-01-31T00:00:00",
      "2002-08-08T00:00:00",
      "1998-05-20T00:00:00",
      "2001-11-29T00:00:00",
      "2000-02-18T00:00:00",
      "1999-09-05T00:00:00",
      "2003-12-12T00:00:00",
      "2002-03-24T00:00:00",
      "2001-06-30T00:00:00",
      "1998-10-16T00:00:00",
      "2000-01-07T00:00:00",
    ],
    phoneNumbers: [
      "0901300016",
      "0901300017",
      "0901300018",
      "0901300019",
      "0901300020",
      "0901300021",
      "0901300022",
      "0901300023",
      "0901300024",
      "0901300025",
      "0901300026",
      "0901300027",
      "0901300028",
      "0901300029",
      "0901300030",
      "0901300031",
      "0901300032",
      "0901300033",
      "0901300034",
      "0901300035",
      "0901300036",
      "0901300037",
      "0901300038",
      "0901300039",
      "0901300040",
    ],
  },
];

const buildDemoAccounts = async () => {
  const password = await bcrypt.hash(
    process.env.DEMO_PASSWORD || "@Tuanthanh0708",
    10,
  );

  let userId = 2;
  let profileId = 2;
  const users = [];
  const profiles = [];

  demoAccountGroups.forEach((group) => {
    Array.from({ length: group.count }, (_, index) => {
      const number = (group.startAt || 1) + index;
      const currentUserId = userId;

      users.push({
        id: currentUserId,
        username: `${group.prefix}${number}`,
        password,
        email: `${group.emailPrefix}${number}@bhub.local`,
        isVerified: true,
        isActive: true,
        roleId: group.roleId,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      profiles.push({
        id: profileId,
        fullName: group.fullNames[index],
        dob: group.dobs[index],
        gender: number % 2 === 0 ? "female" : "male",
        address: "B-Hub Badminton Center",
        phoneNumber: group.phoneNumbers[index],
        avatar: group.avatar,
        level: "BEGINNER",
        userId: currentUserId,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      userId += 1;
      profileId += 1;
    });
  });

  return { users, profiles };
};

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
  dob: "1995-07-08T00:00:00",
  gender: "other",
  address: "Badminton booking system",
  phoneNumber: process.env.ADMIN_PHONE || "0901000001",
  avatar: avatarUrls.admin,
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
    const { users: demoUsers, profiles: demoProfiles } =
      await buildDemoAccounts();

    await upsert(queryInterface, "Roles", roles, ["roleName"]);

    await upsert(
      queryInterface,
      "Users",
      [adminUser, ...demoUsers],
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
      [adminProfile, ...demoProfiles],
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
    const demoProfileIds = Array.from({ length: 67 }, (_, index) => index + 2);
    const demoUserIds = Array.from({ length: 67 }, (_, index) => index + 2);

    await deleteByIds(queryInterface, "Profiles", [1, ...demoProfileIds]);
    await deleteByIds(queryInterface, "Users", [1, ...demoUserIds]);
    await deleteRolesIfUnused(queryInterface);
  },
};
