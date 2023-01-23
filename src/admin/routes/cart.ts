import express, { Request, Response } from "express";
import { asyncWrapper, R } from "@helpers/response-helpers";
import Joi from "joi";
import User from "@model/User";
import { sendSms } from "@helpers/common";
import redis from "@db/redis";
import otp from "@helpers/otp";
import Product from "@model/Product";
import Category from "@model/Category";
import Order, { OrderStatus } from "@model/Order";
import { UserAuthRequest } from "@middleware/auth";
import redisKeys from "@config/redis.keys";
import Address from "@model/Address";
const router = express.Router();

router.get(
	"/add/:_id",
	asyncWrapper(async (req: UserAuthRequest, res: Response) => {
		const _id = [req.params._id];

		const key = redisKeys.userCart + req.user?._id;

		let data: any = await redis.get(key);
		console.log("data", data);

		if (!data) {
			await redis.set(key, JSON.stringify(_id));
		} else {
			data = JSON.parse(data);
			let arr = [...data, ..._id];
			await redis.set(key, JSON.stringify(arr));
		}

		return R(res, true, "Added to Cart", {});
	}),
);

router.get(
	"/",
	asyncWrapper(async (req: UserAuthRequest, res: Response) => {
		const key = redisKeys.userCart + req.user?._id;

		let data: any = await redis.get(key);

		if (!data) {
			return R(res, false, "Invalid Request", {});
		}

		data = JSON.parse(data);

		const items = await Product.find({ _id: { $in: data } });

		if (!items.length) {
			return R(res, false, "Invalid Request", {});
		}
		let products = [];
		for (let i of items) {
			i = i.toObject();

			i.count = data.filter((f: any) => f == i._id).length;

			products.push(i);
		}

		return R(res, true, "My Cart", products);
	}),
);

router.get(
	"/:_id",
	asyncWrapper(async (req: Request, res: Response) => {
		const _id = req.params._id;
		let order = await Order.findById(_id).populate([
			{
				path: "user",
			},
			{
				path: "items",
				populate: [{ path: "category" }, { path: "store" }, { path: "unit" }],
			},
			{
				path: "carrier",
			},
			{
				path: "address",
			},
		]);

		if (!order) {
			return R(res, false, "Invalid Request", {});
		}

		const data = order;

		return R(res, true, "Order Data with Products", data);
	}),
);

router.get(
	"/test",
	asyncWrapper(async (req: Request, res: Response) => {
		return R(res, true, "hello", {});
	}),
);

export default router;
