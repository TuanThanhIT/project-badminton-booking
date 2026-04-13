import Joi from "joi";
import {
  addressField,
  districtCodeField,
  districtField,
  fullNameField,
  isDefaultField,
  labelField,
  latitudeField,
  longitudeField,
  phoneNumberField,
  provinceCodeField,
  provinceField,
  wardCodeField,
  wardField,
} from "./common/addressField.js";
import { idParams } from "./common/numberField.js";

export const addUserAddressSchema = {
  body: Joi.object({
    fullName: fullNameField.required(),
    phoneNumber: phoneNumberField.required(),
    address: addressField.required(),
    province: provinceField.required(),
    district: districtField.required(),
    ward: wardField.required(),
    provinceCode: provinceCodeField.required(),
    districtCode: districtCodeField.required(),
    wardCode: wardCodeField.required(),
    latitude: latitudeField.required(),
    longitude: longitudeField.required(),
    label: labelField.required(),
    isDefault: isDefaultField.required(),
  }),
};

export const updateUserAddressSchema = {
  body: Joi.object({
    fullName: fullNameField.optional(),
    phoneNumber: phoneNumberField.optional(),
    address: addressField.optional(),
    province: provinceField.optional(),
    district: districtField.optional(),
    ward: wardField.optional(),
    provinceCode: provinceCodeField.optional(),
    districtCode: districtCodeField.optional(),
    wardCode: wardCodeField.optional(),
    latitude: latitudeField.optional(),
    longitude: longitudeField.optional(),
    label: labelField.optional(),
    isDefault: isDefaultField.optional(),
  }),
  params: Joi.object({
    addressId: idParams("addressId"),
  }),
};

export const deleteUserAddressSchema = {
  params: Joi.object({
    addressId: idParams("addressId"),
  }),
};
