import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { User } from "../models/users.js";
import HttpError from "../helpers/HttpError.js";

dotenv.config();
const { SECRET_KEY } = process.env;

const isTokenValid = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    next(HttpError(401));
  }
  try {
    const { id } = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(id);

    if (!user || !user.token || user.token !== token) {
      next(HttpError(401));
    }
    req.user = user;
    next();
    
  } catch (error) {
    next(HttpError(401, 'No access'));
  }
};

export default isTokenValid;
