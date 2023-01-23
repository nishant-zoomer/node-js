import Joi from "joi";

const auth = {
	login: {
		email: Joi.string().required(),
		token: Joi.string().required(),
	},
};

export default auth;
