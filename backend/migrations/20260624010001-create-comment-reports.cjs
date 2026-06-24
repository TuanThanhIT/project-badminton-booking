"use strict";

const hasTable = async (queryInterface, tableName) => {
  const tables = await queryInterface.showAllTables();
  return tables
    .map((table) => (typeof table === "object" ? table.tableName || table.name : table))
    .includes(tableName);
};

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await hasTable(queryInterface, "CommentReports"))) {
      await queryInterface.createTable("CommentReports", {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        commentId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "Comments", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        reporterId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "Users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        reason: {
          type: Sequelize.ENUM(
            "SPAM",
            "OFFENSIVE",
            "UNAUTHORIZED_AD",
            "HARASSMENT",
            "OTHER",
          ),
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        status: {
          type: Sequelize.ENUM("PENDING", "RESOLVED", "REJECTED"),
          allowNull: false,
          defaultValue: "PENDING",
        },
        handledBy: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: "Users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        handledAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        adminNote: {
          type: Sequelize.TEXT,
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
    }

    await queryInterface.addIndex("CommentReports", ["commentId", "reporterId"], {
      unique: true,
      name: "idx_comment_reports_comment_reporter",
    }).catch(() => {});
    await queryInterface.addIndex("CommentReports", ["commentId", "status"], {
      name: "idx_comment_reports_comment_status",
    }).catch(() => {});
    await queryInterface.addIndex("CommentReports", ["reporterId"], {
      name: "idx_comment_reports_reporter",
    }).catch(() => {});
  },

  async down(queryInterface) {
    if (await hasTable(queryInterface, "CommentReports")) {
      await queryInterface.dropTable("CommentReports");
    }
  },
};
