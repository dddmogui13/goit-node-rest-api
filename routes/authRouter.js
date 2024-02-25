import express from "express";

import { register, login, logout, getCurrent } from '../controllers/authControllers.js'
import isTokenValid from "../middlewares/isTokenValid.js";


const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.post("/logout", isTokenValid, logout);

authRouter.get("/current", isTokenValid, getCurrent);

export default authRouter;