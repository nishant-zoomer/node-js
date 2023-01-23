import { Request, Response, NextFunction } from "express";
import PostMan from "postman/Run";
const p = new PostMan();

export function R(
	res: Response,
	status: boolean,
	message: String,
	data?: any,
	meta?: any,
) {
	if (status) {
		ADD(res);
	}
	res.status(200).json({
		status: status,
		message: message,
		data: data ?? {},
		meta: meta ?? {},
	});
}

function ADD(res: Response) {
	let path = res.req.url;
	path = path.split("/").join("");
	let name = path.split("-").join(" ");
	path = res.req.url;

	let host = res.req.headers.host;
	let method = res.req.method;
	let query = res.req.query;
	let body = res.req.body;
	let _path = res.req.baseUrl + res.req.path;

	if (method == "POST") {
		p.addPostRequest(name, host, _path, query, method, body);
	} else if (method == "GET") {
		p.addGetRequest(name, host, _path, query, method, body);
	}
}

export function asyncWrapper(callback: any) {
	return function (req: Request, res: Response, next: NextFunction) {
		callback(req, res, next).catch((err: any) => next(err));
	};
}

export const _asyncWrapper =
	(fn: Function) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			return fn(req, res, next);
		} catch (e) {
			console.log("AsyncWrapper Error", e);
			next();
		}
	};
