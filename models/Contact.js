import { Schema, model } from "mongoose";
import Joi from "joi";
import {handleMongooseError} from "../helpers/index.js"

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { versionKey: false, timestamps: true }
);

contactSchema.post("save", handleMongooseError);

export const addSchema = Joi.object({
  name: Joi.string()
    .required()
    .label("Name")
    .error(new Error("missing required name field")),
  email: Joi.string()
    .required()
    .label("Email")
    .error(new Error("missing required email field")),
  phone: Joi.string()
    .required()
    .label("Phone")
    .error(new Error("missing required phone field")),
});


export const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required().error(new Error("missing field favorite")),
});

export const Contact = model("contact", contactSchema);

