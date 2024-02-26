import express from "express";

import { register, login, logout, getCurrent, updateAvatar } from '../controllers/authControllers.js'
import isTokenValid from "../middlewares/isTokenValid.js";
import  uploadAvatar from "../middlewares/uploadAvatar.js";


const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.post("/logout", isTokenValid, logout);

authRouter.get("/current", isTokenValid, getCurrent);

authRouter.patch("/avatars", isTokenValid, uploadAvatar.single('avatar'), updateAvatar)

export default authRouter;