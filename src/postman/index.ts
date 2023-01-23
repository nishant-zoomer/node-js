import PostMan from "./Run";
import { NextFunction, Request, Response } from "express";

const p = new PostMan();

export default function CreateCollection(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	req.on("end", () => {
		let path = req.url;
		path = path.split("/").join("");
		let name = path.split("-").join(" ");
		path = req.url;

		let host = req.headers.host;
		let method = req.method;
		let query = req.query;
		let body = req.body;
		let _path = req.baseUrl + req.path;

		if (method == "POST") {
			p.addPostRequest(name, host, _path, query, method, body);
		} else if (method == "GET") {
			p.addGetRequest(name, host, _path, query, method, body);
		}
	});
	next();
}
