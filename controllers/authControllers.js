import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { User } from "../models/users.js";
import HttpError from "../helpers/HttpError.js";
import { registerSchema } from "../schemas/userSchemas.js";

dotenv.config();
const { SECRET_KEY } = process.env;

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { error } = registerSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const user = await User.findOne({ email });

    if (user) {
      throw HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ ...req.body, password: hashPassword });

    res.status(201).json({
      user: { email: newUser.email, subscription: newUser.subscription },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { error } = registerSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(401, "Invalid email or password. Please try again.");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw HttpError(401, "Invalid email or password. Please try again.");
    }

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id);

    if (!user) {
      throw HttpError(401, "Not a middle");
    }

    await User.findByIdAndUpdate(_id, { token: "" });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getCurrent = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;

    res.json({
      email,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};
