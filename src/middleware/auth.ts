import redis from "@db/redis";
import jwt from "@helpers/jwt";
import { User } from "@model/User";
import { Request, Response, NextFunction } from "express";

const ignorePaths = [
	"/auth/verify-otp",
	"/auth/employee/verify-otp",
	"/auth/employee/send-otp",
	"/auth/send-otp",
	"/auth/register",
	"/auth/otp/send",
	"/auth/forgot-password",
	"/auth/reset",
	"/auth/reset-password",
	"/auth/verify-email",
	"/auth/version",
	"/auth/login",
	"/auth/social-login",
	"/auth/test",
];

export interface UserAuthRequest extends Request {
	user: User; // or any other type
	token: string;
	userId: string;
}

export default async function verifyUser(
	req: any,
	res: Response,
	next: NextFunction,
) {
	let token;
	const ignore = ignorePaths.indexOf(req.path) > -1;

	if (
		req.method === "OPTIONS" &&
		req.headers.hasOwnProperty("access-control-request-headers")
	) {
		res.send("No DATA");
		// const hasAuthInAccessControl = !!~req.headers[
		// 	"access-control-request-headers"
		// ]
		// 	.split(",")
		// 	.map(function (header) {
		// 		return header.trim();
		// 	})
		// 	.indexOf("authorization");

		// if (hasAuthInAccessControl) {
		// 	return next();
		// }
	}

	if (ignore) {
		return next();
	}

	if (req.headers && req.headers.authorization) {
		const parts = req.headers.authorization.split(" ");
		if (parts.length === 2) {
			const scheme = parts[0];
			const credentials = parts[1];

			if (/^Bearer$/i.test(scheme)) {
				token = credentials;
				req.token = token;
			} else {
				if (!ignore) {
					return res.json({
						status: false,
						message: "Invalid request.",
						data: null,
					});
				}
			}
		} else {
			if (!ignore) {
				return res.json({
					status: false,
					message: "Invalid request.",
					data: null,
				});
			}
		}
	}

	if (!token && !ignore) {
		return res.json({
			status: false,
			message: "No authorization token was found.",
			data: null,
		});
	}

	let user = await jwt.verifyAsync(token);

	if (!user) {
		return res.status(401).json({
			status: false,
			message: "Invalid token.",
			data: null,
		});
	}

	if (user != null) {
		try {
			req.user = user;
		} catch (e) {}
	}

	return next();
}
