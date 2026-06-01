import { QueryTypes } from "sequelize";

export const syncCoachProfileColumns = async (sequelize) => {
  const cols = await sequelize.query(
    "SHOW COLUMNS FROM CoachProfiles LIKE 'certificateImages'",
    { type: QueryTypes.SELECT },
  );

  if (cols.length === 0) {
    await sequelize.query(
      "ALTER TABLE CoachProfiles ADD COLUMN certificateImages JSON NULL",
      { type: QueryTypes.RAW },
    );
    console.log("Added CoachProfiles.certificateImages column");
  }
};
