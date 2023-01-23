import jsonwebtoken, { SignCallback } from "jsonwebtoken";
import env from "@config/env";

const jwt = {
	signAsync: async (payload: any) => {
		return new Promise((resolve, reject) => {
			jsonwebtoken.sign(payload, env.secret, (err: any, token: any) => {
				if (err) {
					return reject(err);
				}
				resolve(token);
			});
		});
	},
	verifyAsync: async (token: any) => {
		return new Promise((resolve, reject) => {
			jsonwebtoken.verify(token, env.secret, (err: any, payload: any) => {
				if (err) {
					return reject(err);
				}

				resolve(payload);
			});
		});
	},
};

export default jwt;
