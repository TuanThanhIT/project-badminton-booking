"use strict";

const tableExists = async (queryInterface, tableName) => {
  try {
    await queryInterface.describeTable(tableName);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    if (await tableExists(queryInterface, "ClassEnrollments")) return;

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
        references: {
          model: "Posts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      coachUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      studentUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
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
  },

  async down(queryInterface) {
    if (await tableExists(queryInterface, "ClassEnrollments")) {
      await queryInterface.dropTable("ClassEnrollments");
    }
  },
};
