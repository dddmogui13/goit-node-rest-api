import express from "express";
import { promises as fs } from "fs";
import path from "path";
import bcryptjs from 'bcryptjs';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import gravatar from "gravatar";
import Jimp from "jimp";
import { nanoid } from "nanoid";

import { User } from "../models/users.js";
import HttpError from "../helpers/HttpError.js";
import { registerSchema } from "../schemas/userSchemas.js";
import sendEmail from "../helpers/sendEmail.js";
import { emailSchema } from "../schemas/emailSchemas.js";

dotenv.config();

const { SECRET_KEY, BASE_URL } = process.env;
const avatarDir = path.resolve("public", "avatars");

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

    const hashPassword = await bcryptjs.hash(password, 10);
    const verificationToken = nanoid();
    const avatarURL = gravatar.url(email);

    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });

    const verifyUserEmail = {
      to: email,
      subject: "Email Verification",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Please click here to verify your email</a>`,
    };

    await sendEmail(verifyUserEmail);

    res.status(201).json({
      user: { email: newUser.email, subscription: newUser.subscription },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw HttpError(404, "User not found");
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: "",
    });

    res.json({
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
};

export const resendverifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw HttpError(400, "missing required field email");
    }
    const { error } = emailSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const user = await User.findOne({ email });

    if (user.verify) {
      throw HttpError(400, "Verification has already been passed");
    }

    const verifyUserEmail = {
      to: email,
      subject: "Email Verification",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Please click here to verify your email</a>`,
    };

    await sendEmail(verifyUserEmail);

    res.json({
      message: "Verification email sent",
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

    if (!user.verify) {
      throw HttpError(401, "Please verify your email before login.");
    }

    const passwordCompare = await bcryptjs.compare(password, user.password);
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
      throw HttpError(401);
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

export const updateAvatar = async (req, res, next) => {
  try {
    const { _id } = req.user;

    if (!req.file) {
      throw HttpError(400, "To change the avatar, please attach the file.");
    }

    const { path: tempUpload, originalname } = req.file;

    const fileName = `${_id}_${originalname}`;
    const resultUpload = path.resolve(avatarDir, fileName);

    const avatar = await Jimp.read(tempUpload);
    avatar.resize(250, 250).write(resultUpload);

    await fs.unlink(tempUpload);

    const avatarURL = path.join("avatars", fileName);
    await User.findByIdAndUpdate(_id, { avatarURL });

    res.json({
      avatarURL,
    });
  } catch (error) {
    next(error);
  }
};
