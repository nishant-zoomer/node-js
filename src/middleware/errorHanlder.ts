import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	// console.table(err);
	// console.log(err.message, err.statusCode);
	// if (res.headersSent) {
	// 	return next(err);
	// }
	console.error(err)

	res.status(err.statusCode || 500).json({
		status: false,
		message: err.message || "An Unknown Error",
		data: err.stack,
	});
};
