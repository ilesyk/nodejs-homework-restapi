import express from "express";
import ctrl from "../controllers/contacts.js";
import { authenticate, isEmptyBody, isValidId, validateBody } from "../middlewares/index.js";
import { addSchema, updateFavoriteSchema } from "../models/Contact.js";

const contactsRouter = express.Router();

contactsRouter.use(authenticate);
contactsRouter.get("/", ctrl.listContacts);
contactsRouter.get("/:id", isValidId, ctrl.getContactById);
contactsRouter.post("/", isEmptyBody, validateBody(addSchema), ctrl.addContact);
contactsRouter.put("/:id", isValidId, isEmptyBody, ctrl.updateContact);
contactsRouter.patch("/:id/favorite", isValidId, isEmptyBody, validateBody(updateFavoriteSchema), ctrl.updateStatusContact);
contactsRouter.delete("/:id", isValidId, ctrl.removeContact);

export default contactsRouter;
