"use strict";

const indexExists = async (queryInterface, tableName, indexName) => {
  const indexes = await queryInterface.showIndex(tableName);
  return indexes.some((index) => index.name === indexName);
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Comments");

    if (!table.isDeleted) {
      await queryInterface.addColumn("Comments", "isDeleted", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        after: "type",
      });
    }

    if (!table.deletedAt) {
      await queryInterface.addColumn("Comments", "deletedAt", {
        type: Sequelize.DATE,
        allowNull: true,
        after: "isDeleted",
      });
    }

    if (!(await indexExists(queryInterface, "Comments", "comments_post_parent_created_idx"))) {
      await queryInterface.addIndex("Comments", ["postId", "parentId", "createdAt"], {
        name: "comments_post_parent_created_idx",
      });
    }

    if (!(await indexExists(queryInterface, "Comments", "comments_author_created_idx"))) {
      await queryInterface.addIndex("Comments", ["authorId", "createdAt"], {
        name: "comments_author_created_idx",
      });
    }
  },

  async down(queryInterface) {
    if (await indexExists(queryInterface, "Comments", "comments_author_created_idx")) {
      await queryInterface.removeIndex("Comments", "comments_author_created_idx");
    }

    if (await indexExists(queryInterface, "Comments", "comments_post_parent_created_idx")) {
      await queryInterface.removeIndex("Comments", "comments_post_parent_created_idx");
    }

    const table = await queryInterface.describeTable("Comments");
    if (table.deletedAt) {
      await queryInterface.removeColumn("Comments", "deletedAt");
    }
    if (table.isDeleted) {
      await queryInterface.removeColumn("Comments", "isDeleted");
    }
  },
};
