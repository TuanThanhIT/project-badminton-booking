"use strict";

const TABLES = ["CoachApplications", "ClassRooms", "ClassEnrollments"];

const tableExists = async (queryInterface, tableName) => {
  try {
    await queryInterface.describeTable(tableName);
    return true;
  } catch {
    return false;
  }
};

const quoteIdentifier = (value) => `\`${value}\``;

const ensureTimestampColumn = async (queryInterface, Sequelize, tableName, columnName) => {
  let columns = await queryInterface.describeTable(tableName);

  if (!columns[columnName]) {
    await queryInterface.addColumn(tableName, columnName, {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }

  columns = await queryInterface.describeTable(tableName);
  const fallbackColumns = ["createdDate", "updatedDate", "createdAt", "updatedAt"]
    .filter((name) => name !== columnName && columns[name])
    .map(quoteIdentifier);

  const fallbackExpression = [quoteIdentifier(columnName), ...fallbackColumns, "NOW()"].join(", ");

  await queryInterface.sequelize.query(
    `UPDATE ${quoteIdentifier(tableName)} SET ${quoteIdentifier(columnName)} = COALESCE(${fallbackExpression}) WHERE ${quoteIdentifier(columnName)} IS NULL`,
  );

  await queryInterface.changeColumn(tableName, columnName, {
    type: Sequelize.DATE,
    allowNull: false,
  });
};

const ensureTimestamps = async (queryInterface, Sequelize, tableName) => {
  await ensureTimestampColumn(queryInterface, Sequelize, tableName, "createdAt");
  await ensureTimestampColumn(queryInterface, Sequelize, tableName, "updatedAt");
};

const createCoachApplications = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("CoachApplications", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    status: {
      type: Sequelize.ENUM("PENDING", "APPROVED", "REJECTED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    experienceYears: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    certificate: {
      type: Sequelize.STRING(500),
      allowNull: true,
    },
    certificateImages: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    introduction: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    phoneContact: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    rejectReason: {
      type: Sequelize.STRING(500),
      allowNull: true,
    },
    reviewedBy: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    reviewedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  await queryInterface.addIndex("CoachApplications", ["userId", "status"], {
    name: "idx_coach_app_user_status",
  });
};

const createClassRooms = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("ClassRooms", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    postId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "Posts", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    coachUserId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    conversationId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Conversations", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    enrollmentStatus: {
      type: Sequelize.ENUM("OPEN", "LOCKED", "ENDED"),
      allowNull: false,
      defaultValue: "OPEN",
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });
};

const createClassEnrollments = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("ClassEnrollments", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    postId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Posts", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    coachUserId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    studentUserId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    status: {
      type: Sequelize.ENUM("PENDING", "ACTIVE", "REJECTED", "COMPLETED", "CANCELLED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    source: {
      type: Sequelize.ENUM("POST_REGISTER", "COACH_MANUAL"),
      allowNull: false,
      defaultValue: "POST_REGISTER",
    },
    coachNote: {
      type: Sequelize.STRING(500),
      allowNull: true,
    },
    rejectReason: {
      type: Sequelize.STRING(500),
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  await queryInterface.addIndex("ClassEnrollments", ["postId", "studentUserId"], {
    name: "uniq_class_enrollment_post_student",
    unique: true,
  });
  await queryInterface.addIndex("ClassEnrollments", ["coachUserId", "status"], {
    name: "idx_class_enrollment_coach_status",
  });
  await queryInterface.addIndex("ClassEnrollments", ["studentUserId", "status"], {
    name: "idx_class_enrollment_student_status",
  });
};

module.exports = {
  async up(queryInterface, Sequelize) {
    if (await tableExists(queryInterface, "CoachApplications")) {
      await ensureTimestamps(queryInterface, Sequelize, "CoachApplications");
    } else {
      await createCoachApplications(queryInterface, Sequelize);
    }

    if (await tableExists(queryInterface, "ClassRooms")) {
      await ensureTimestamps(queryInterface, Sequelize, "ClassRooms");
    } else {
      await createClassRooms(queryInterface, Sequelize);
    }

    if (await tableExists(queryInterface, "ClassEnrollments")) {
      await ensureTimestamps(queryInterface, Sequelize, "ClassEnrollments");
    } else {
      await createClassEnrollments(queryInterface, Sequelize);
    }
  },

  async down() {
    // This migration repairs missing tables/columns from older local databases.
  },
};
