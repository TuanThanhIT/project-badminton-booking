"use strict";

const removeUniqueIndexIfExists = async (queryInterface, tableName, indexName) => {
  const indexes = await queryInterface.showIndex(tableName);
  const index = indexes.find((item) => item.name === indexName && item.unique);

  if (index) {
    await queryInterface.removeIndex(tableName, indexName);
  }
};

const addIndexIfMissing = async (queryInterface, tableName, fields, name) => {
  const indexes = await queryInterface.showIndex(tableName);
  const exists = indexes.some((item) => item.name === name);

  if (!exists) {
    await queryInterface.addIndex(tableName, fields, { name });
  }
};

module.exports = {
  async up(queryInterface) {
    await addIndexIfMissing(queryInterface, "PostLikes", ["postId"], "post_likes_post_id_idx");
    await removeUniqueIndexIfExists(queryInterface, "PostLikes", "userId");
    await removeUniqueIndexIfExists(queryInterface, "PostLikes", "postId");

    await addIndexIfMissing(queryInterface, "PostShares", ["postId"], "post_shares_post_id_idx");
    await removeUniqueIndexIfExists(queryInterface, "PostShares", "userId");
    await removeUniqueIndexIfExists(queryInterface, "PostShares", "postId");
  },

  async down(queryInterface) {
    await addIndexIfMissing(queryInterface, "PostLikes", ["userId"], "userId");
    await addIndexIfMissing(queryInterface, "PostLikes", ["postId"], "postId");
    await addIndexIfMissing(queryInterface, "PostShares", ["userId"], "userId");
    await addIndexIfMissing(queryInterface, "PostShares", ["postId"], "postId");
  },
};
