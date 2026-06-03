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
    if (await tableExists(queryInterface, "CoachApplications")) return;

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
        references: {
          model: "Users",
          key: "id",
        },
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
        references: {
          model: "Users",
          key: "id",
        },
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
  },

  async down(queryInterface) {
    if (await tableExists(queryInterface, "CoachApplications")) {
      await queryInterface.dropTable("CoachApplications");
    }
  },
};
