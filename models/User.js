import { Schema, model } from "mongoose";
import Joi from "joi";

import { handleSaveError, preUpdate } from "./hooks.js";

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, "Set password for user"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  avatarURL: String,
  token: String,
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, "Verify token is required"],
  },
});

userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate", preUpdate);

userSchema.post("findOneAndUpdate", handleSaveError);

export const userValidateSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(),
  subscription: Joi.string(),
});
export const userEmailSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
});

const User = model("user", userSchema);

export default User;