import { createRequire } from "module";

const require = createRequire(import.meta.url);
const utils = require("../../../seeders/helpers/staticSeedUtils.cjs");

export const RAW_PASSWORDS = utils.RAW_PASSWORDS;
export const TABLE_NAMES = utils.TABLE_NAMES;
export const hashPasswordsByRole = utils.hashPasswordsByRole;
export const upsertRows = utils.upsertRows;
export const deleteByIds = utils.deleteByIds;
export const deleteByUniqueValues = utils.deleteByUniqueValues;
export const createExampleImage = utils.createExampleImage;
export const slugify = utils.slugify;
export const chunkArray = utils.chunkArray;
export const findRowsByUniqueValues = utils.findRowsByUniqueValues;
export const validateUniqueRows = utils.validateUniqueRows;

export default utils;
