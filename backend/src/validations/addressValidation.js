import Joi from "joi";
import {
  addressField,
  districtIdField,
  districtNameField,
  fullNameField,
  isDefaultField,
  labelField,
  latitudeField,
  longitudeField,
  phoneNumberField,
  provinceIdField,
  provinceNameField,
  wardCodeField,
  wardNameField,
} from "./common/addressField.js";
import { idParams } from "./common/numberField.js";

export const addUserAddressSchema = {
  body: Joi.object({
    fullName: fullNameField.required(),
    phoneNumber: phoneNumberField.required(),
    address: addressField.required(),
    provinceName: provinceNameField.required(),
    districtName: districtNameField.required(),
    wardName: wardNameField.required(),
    provinceId: provinceIdField.required(),
    districtId: districtIdField.required(),
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
    provinceName: provinceNameField.optional(),
    districtName: districtNameField.optional(),
    wardName: wardNameField.optional(),
    provinceId: provinceIdField.optional(),
    districtId: districtIdField.optional(),
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
