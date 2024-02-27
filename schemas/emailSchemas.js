import Joi from "joi";

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export const emailSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
});