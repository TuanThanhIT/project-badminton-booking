import { QueryTypes } from "sequelize";

export const syncClassRoomColumns = async (sequelize) => {
  const cols = await sequelize.query(
    "SHOW COLUMNS FROM ClassRooms LIKE 'enrollmentStatus'",
    { type: QueryTypes.SELECT },
  );

  if (cols.length === 0) {
    await sequelize.query(
      "ALTER TABLE ClassRooms ADD COLUMN enrollmentStatus ENUM('OPEN','LOCKED','ENDED') NOT NULL DEFAULT 'OPEN'",
      { type: QueryTypes.RAW },
    );
    console.log("Added ClassRooms.enrollmentStatus column");
  }
};
