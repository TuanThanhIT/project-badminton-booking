"use strict";

const TABLE_NAME = "ConversationParticipants";
const COMPOSITE_INDEX = "conversation_participants_conversation_id_user_id";
const CONVERSATION_INDEX = "conversation_participants_conversation_id_idx";
const USER_INDEX = "conversation_participants_user_id_idx";

const showIndexes = (queryInterface) =>
  queryInterface.sequelize.query(`SHOW INDEX FROM \`${TABLE_NAME}\``).then(([rows]) => rows);

const addIndexIfMissing = async (queryInterface, fields, name, options = {}) => {
  const indexes = await showIndexes(queryInterface);
  if (indexes.some((row) => row.Key_name === name)) return;
  await queryInterface.addIndex(TABLE_NAME, fields, { ...options, name });
};

const removeIndexIfExists = async (queryInterface, name) => {
  const indexes = await showIndexes(queryInterface);
  if (!indexes.some((row) => row.Key_name === name)) return;
  await queryInterface.removeIndex(TABLE_NAME, name);
};

module.exports = {
  async up(queryInterface) {
    await addIndexIfMissing(queryInterface, ["conversationId"], CONVERSATION_INDEX);
    await addIndexIfMissing(queryInterface, ["userId"], USER_INDEX);

    const indexes = await showIndexes(queryInterface);
    const uniqueIndexes = indexes.reduce((acc, row) => {
      if (row.Non_unique !== 0 || row.Key_name === "PRIMARY") return acc;
      if (!acc[row.Key_name]) acc[row.Key_name] = [];
      acc[row.Key_name].push(row.Column_name);
      return acc;
    }, {});

    for (const [indexName, columns] of Object.entries(uniqueIndexes)) {
      const sortedColumns = [...columns].sort();
      const isCompositeParticipantIndex =
        sortedColumns.length === 2 &&
        sortedColumns[0] === "conversationId" &&
        sortedColumns[1] === "userId";

      if (
        !isCompositeParticipantIndex &&
        indexName !== CONVERSATION_INDEX &&
        indexName !== USER_INDEX
      ) {
        await queryInterface.removeIndex(TABLE_NAME, indexName);
      }
    }

    await addIndexIfMissing(queryInterface, ["conversationId", "userId"], COMPOSITE_INDEX, {
      unique: true,
    });
  },

  async down(queryInterface) {
    await removeIndexIfExists(queryInterface, COMPOSITE_INDEX);
    await removeIndexIfExists(queryInterface, CONVERSATION_INDEX);
    await removeIndexIfExists(queryInterface, USER_INDEX);
  },
};
