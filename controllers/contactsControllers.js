import express from "express";

import { Contact } from "../models/contact.js";
import HttpError from "../helpers/HttpError.js";
import {
  createContactSchema,
  updateContactSchema,
  updateContactFavoriteSchema,
} from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const contacts = await Contact.find({ owner });

    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
};

export const getContactById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id: owner } = req.user;
    const contact = await Contact.findById(id).where("owner").equals(owner);

    if (!contact) {
      throw HttpError(404);
    }

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id: owner } = req.user;
    const deletedContact = await Contact.findByIdAndDelete(id).where("owner").equals(owner);

    if (!deletedContact) {
      throw HttpError(404, "Not found");
    }

    res.status(200).json(deletedContact);
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const { error } = createContactSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { _id: owner } = req.user;
    const newContact = await Contact.create({ ...req.body, owner });
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    if (!Object.keys(req.body).length > 0) {
      throw HttpError(400, "Body must have at least one field");
    }
    const { error } = updateContactSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { id } = req.params;
    const { _id: owner } = req.user;
    
    const updatedContact = await Contact.findByIdAndUpdate(id, req.body, {
      new: true,
    }).where("owner").equals(owner);
    if (!updatedContact) {
      throw HttpError(404, "Not found");
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

export const updateContactFavoriteOption = async (req, res, next) => {
  try {
    if (!("favorite" in req.body)) {
      throw HttpError(400, "Missing field: favorite");
    }

    const { error } = updateContactFavoriteSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { id } = req.params;
    const { _id: owner } = req.user;

    const updatedContact = await Contact.findByIdAndUpdate(id, req.body, {
      new: true,
    }).where("owner").equals(owner);
    if (!updatedContact) {
      throw HttpError(404, "Not found");
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};
