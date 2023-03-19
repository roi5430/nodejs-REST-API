const { Schema, model } = require("mongoose");
const Joi = require("joi");

const { mongooseError } = require("../helpers");

const contactSchema = new Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
    required: [true, "Set phone for contact"],
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  // owner: {
  //   type: SchemaTypes.ObjectId,
  //   ref: "user",
  // },
});

const Contact = model("contact", contactSchema);

const JoiSchema = Joi.object({
  name: Joi.string().min(2).required(),
  favorite: Joi.boolean(),
  phone: Joi.string().required(),
  email: Joi.string().required().email({
    minDomainSegments: 2,
  }),
});

const updateContactSchema = Joi.object({
  name: Joi.string().min(2),
  favorite: Joi.boolean(),
  phone: Joi.string(),
  email: Joi.string().email({
    minDomainSegments: 2,
  }),
});

const favoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

contactSchema.post("save", mongooseError);

module.exports = { Contact, JoiSchema, updateContactSchema, favoriteSchema };
