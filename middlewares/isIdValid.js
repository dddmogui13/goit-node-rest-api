import { isValidObjectId } from 'mongoose';
import HttpError from '../helpers/HttpError.js';

const isIdValid = (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    next(HttpError(400, `Id ${id} is not valid!`));
  }
  next();
};

export default isIdValid;