import express from "express";
import {
  getAllContacts,
  getContactById,
  deleteContact,
  createContact,
  updateContact,
  updateContactFavoriteOption,
} from "../controllers/contactsControllers.js";
import isIdValid from '../middlewares/isIdValid.js';
import isTokenValid from "../middlewares/isTokenValid.js";

const contactsRouter = express.Router();

contactsRouter.get("/", isTokenValid, getAllContacts);

contactsRouter.get("/:id", isTokenValid, isIdValid, getContactById);

contactsRouter.delete("/:id", isTokenValid, isIdValid, deleteContact);

contactsRouter.post("/", isTokenValid, createContact);

contactsRouter.put("/:id", isTokenValid, isIdValid, updateContact);

contactsRouter.patch("/:id/favorite", isTokenValid, isIdValid, updateContactFavoriteOption);

export default contactsRouter;