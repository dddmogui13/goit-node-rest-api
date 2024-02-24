import express from "express";
import {
  getAllContacts,
  getContactById,
  deleteContact,
  createContact,
  updateContact,
  updateContactFavoriteOption,
} from "../controllers/contactsControllers.js";
import isIdValid from '../middlewares/isIdValid.js'

const contactsRouter = express.Router();

contactsRouter.get("/", getAllContacts);

contactsRouter.get("/:id", isIdValid, getContactById);

contactsRouter.delete("/:id", isIdValid, deleteContact);

contactsRouter.post("/", createContact);

contactsRouter.put("/:id", isIdValid, updateContact);

contactsRouter.patch("/:id/favorite", isIdValid, updateContactFavoriteOption);

export default contactsRouter;