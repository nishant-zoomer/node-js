import express, { ErrorRequestHandler } from "express";
import mongoose from "mongoose";

import auth from "@admin/routes/auth";
import cart from "@admin/routes/cart";
import product from "@admin/routes/product";
import store from "@admin/routes/store";
import user from "@admin/routes/user";
import order from "@admin/routes/order";

import morgan from "morgan";

import { errorHandler } from "@middleware/errorHanlder";
import config from "@config/env";
import { initDb } from "@db/mongo";
import verifyUser from "@middleware/admin.auth";
import cors from "cors";
import Cors from "@middleware/Cors.";
const app = express();
const PORT = config.port.admin;

app.use(cors({ origin: "*" }));
app.use(Cors);

app.use(express.json());
initDb();
app.use(morgan("tiny"));

app.use(verifyUser);
const authPrefix = "/auth";
app.use(authPrefix, auth);

const cartPrefix = "/cart";
app.use(cartPrefix, cart);

const productPrefix = "/product";
app.use(productPrefix, product);

const storePrefix = "/store";
app.use(storePrefix, store);

const userPrefix = "/user";
app.use(userPrefix, user);

const orderPrefix = "/order";
app.use(orderPrefix, order);

app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Listening On PORT ${PORT}`);
});
