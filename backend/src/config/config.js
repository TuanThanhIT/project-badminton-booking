import dotenv from "dotenv";

dotenv.config();

const baseConfig = {
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456789",
  database: process.env.DB_NAME || "badminton_booking",
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  dialect: "mysql",
  timezone: "+07:00",
};

export default {
  development: {
    ...baseConfig,
  },
  test: {
    ...baseConfig,
    database: process.env.DB_NAME_TEST || `${baseConfig.database}_test`,
    logging: false,
  },
  production: {
    ...baseConfig,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    logging: false,
  },
};
