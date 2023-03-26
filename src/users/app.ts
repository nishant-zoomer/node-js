import express, { ErrorRequestHandler } from "express";
import morgan from "morgan";
import { errorHandler } from "@middleware/errorHanlder";
import config from "@config/env";
import { initDb } from "@db/mongo";
import verifyUser from "@middleware/auth";
import cors from "cors";

/**
 * @routes
 */
import test from '@users/routes/test'
import auth from "@users/routes/auth";
import product from "@users/routes/product";
import _public from "@users/routes/public";
import models from "@model/models";
import mongoose from "mongoose";
import db from "@config/db";

// app
const app = express();

// port
const PORT = config.port.user;

app.use(cors({ origin: "*" }));
app.use(express.json());

// db init
mongoose.connect(db.URI).then((d) => {
	console.log("🚀 ~ file: app.ts:29 ~ mongoose.connect ~ d", d.Collection);

	console.log(models);

	// logger
	app.use(morgan("tiny"));

	/**
	 * @handlers public
	 */
	app.use(_public);


	/**
	 * @handlers test
	 */
	app.use(test);

	/**
	 * @middleware verifyuser
	 */

	app.use(verifyUser);

	/**
	 * @handlers auth
	 */
	const auth_prefix = "/auth";
	app.use(auth_prefix, auth);

	/**
	 * @handlers product
	 */
	const product_prefix = "/product";
	app.use(product_prefix, product);

	/**
	 * @handler error
	 */
	app.use(errorHandler);

	app.listen(PORT, () => {
		console.log(`Listening On PORT ${PORT}`);
	});
});
