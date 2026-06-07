"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("PostLikes");
    if (!table.reactionType) {
      await queryInterface.addColumn("PostLikes", "reactionType", {
        type: Sequelize.ENUM("LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"),
        allowNull: false,
        defaultValue: "LIKE",
        after: "postId",
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("PostLikes");
    if (table.reactionType) {
      await queryInterface.removeColumn("PostLikes", "reactionType");
    }
  },
};
