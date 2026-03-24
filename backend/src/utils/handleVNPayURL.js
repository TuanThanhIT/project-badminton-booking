import crypto from "crypto";
import dotenv from "dotenv";
import qs from "qs";

dotenv.config();

export const verifyVNPayURL = (data) => {
  const secureHash = data.vnp_SecureHash;

  const cloneParams = { ...data };
  delete cloneParams.vnp_SecureHash;
  delete cloneParams.vnp_SecureHashType;

  const sorted = Object.keys(cloneParams)
    .sort()
    .reduce((acc, key) => {
      acc[key] = cloneParams[key];
      return acc;
    }, {});

  const signData = qs.stringify(sorted, {
    encode: true,
    format: "RFC1738",
  });

  const hash = crypto
    .createHmac("sha512", process.env.VNP_HASH_SECRET)
    .update(signData)
    .digest("hex");

  return hash === secureHash;
};

export const buildVNPayURL = (params) => {
  const sorted = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  const signData = qs.stringify(sorted, { encode: true });

  const secureHash = crypto
    .createHmac("sha512", process.env.VNP_HASH_SECRET)
    .update(signData)
    .digest("hex");

  return `${process.env.VNP_URL}?${signData}&vnp_SecureHash=${secureHash}`;
};
