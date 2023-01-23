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

router.post(
	"/",
	asyncWrapper(async (req: UserAuthRequest, res: Response) => {
		const schema = Joi.object({
			items: Joi.array().min(1).required(),
			address: Joi.string().required(),
		}).validate(req.body);

		if (schema.error) {
			return R(res, false, schema.error.message, {});
		}

		const data = schema.value;

		let addressExist = await Address.countDocuments({ _id: data.address });

		if (!addressExist) {
			return R(res, false, "Invalid Request", {});
		}

		data["user"] = req.user?._id;
		let orderNo = await redis.incr(redisKeys.orderNo);
		data["number"] = orderNo;
		data["status"] = OrderStatus.AWAITING;

		const order = await Order.create(data);

		return R(res, true, "Order Placed Successfully", order);
	}),
);

router.get(
	"/",
	asyncWrapper(async (req: UserAuthRequest, res: Response) => {
		const opt = {
			page: parseInt(req.query.page?.toString() || "0"),
			limit: parseInt(req.query.limit?.toString() || "10"),
		};

		let totalCount = await Order.countDocuments({});

		let orders = await Order.find({})
			.populate([
				{
					path: "user",
					select: "name email phone",
				},
				{
					path: "carrier",
					select: "name phone",
				},
			])
			.skip(opt.page * opt.limit)
			.limit(opt.limit)
			.sort({ createdAt: -1 });

		return R(res, true, "Order List", orders, {
			page: opt.page,
			total_count: totalCount,
			total_pages: totalCount / opt.limit,
		});
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
				path: "items.product",
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
