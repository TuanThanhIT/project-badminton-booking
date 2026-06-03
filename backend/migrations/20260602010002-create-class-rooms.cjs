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
    if (await tableExists(queryInterface, "ClassRooms")) return;

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
      conversationId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Conversations",
          key: "id",
        },
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
  },

  async down(queryInterface) {
    if (await tableExists(queryInterface, "ClassRooms")) {
      await queryInterface.dropTable("ClassRooms");
    }
  },
};
