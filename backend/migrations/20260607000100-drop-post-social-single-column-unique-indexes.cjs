"use strict";

const ensureIndex = async (queryInterface, tableName, fields, name) => {
  const indexes = await queryInterface.showIndex(tableName);
  if (!indexes.some((index) => index.name === name)) {
    await queryInterface.addIndex(tableName, fields, { name });
  }
};

const dropIndex = async (queryInterface, tableName, name) => {
  const indexes = await queryInterface.showIndex(tableName);
  if (indexes.some((index) => index.name === name)) {
    await queryInterface.sequelize.query(`ALTER TABLE \`${tableName}\` DROP INDEX \`${name}\``);
  }
};

module.exports = {
  async up(queryInterface) {
    await ensureIndex(queryInterface, "PostLikes", ["postId"], "post_likes_post_id_idx");
    await ensureIndex(queryInterface, "PostShares", ["postId"], "post_shares_post_id_idx");

    await dropIndex(queryInterface, "PostLikes", "userId");
    await dropIndex(queryInterface, "PostLikes", "postId");
    await dropIndex(queryInterface, "PostShares", "userId");
    await dropIndex(queryInterface, "PostShares", "postId");
  },

  async down(queryInterface) {
    await ensureIndex(queryInterface, "PostLikes", ["userId"], "userId");
    await ensureIndex(queryInterface, "PostLikes", ["postId"], "postId");
    await ensureIndex(queryInterface, "PostShares", ["userId"], "userId");
    await ensureIndex(queryInterface, "PostShares", ["postId"], "postId");
  },
};
