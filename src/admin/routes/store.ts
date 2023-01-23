import express, { Request, Response } from "express";
import { asyncWrapper, R } from "@helpers/response-helpers";
import Joi from "joi";
import User from "@model/User";
import { sendSms } from "@helpers/common";
import redis from "@db/redis";
import otp from "@helpers/otp";
import Admin from "@model/Admin";

import bcrypt from "bcryptjs";
import Unit from "@model/Unit";
import Category from "@model/Category";
import Store from "@model/Store";
const router = express.Router();

router.get(
	"/stores",
	asyncWrapper(async (req: Request, res: Response) => {
		const Stores = await Store.find({});

		return R(res, true, "Store List", Stores);
	}),
);

router.post(
	"/store",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			name: Joi.string().required(),
			address: Joi.string().required(),
			apartment: Joi.string().required(),
			city: Joi.string().required(),
			state: Joi.string().required(),
			pin_code: Joi.number().required(),
			employee_count: Joi.number().required(),
		}).validate(req.body);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		const data = schema.value;

		await Store.create(data);

		return R(res, true, "Store Created Successfully", data);
	}),
);

router.post(
	"/update-store",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			_id: Joi.string().required(),
			name: Joi.string().required(),
			address: Joi.string().required(),
			apartment: Joi.string().required(),
			city: Joi.string().required(),
			state: Joi.string().required(),

			pin_code: Joi.number().required(),
			employee_count: Joi.number().required(),
		}).validate(req.body);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		const data = schema.value;

		const store = await Store.findById(data._id);

		if (!store) {
			return R(res, false, "Invalid Request", {});
		}

		delete data._id;
		await store.update(data);
		await store.save();

		return R(res, true, "Store Updated Successfully", data);
	}),
);

router.get(
	"/delete-store",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			_id: Joi.string().required(),
		}).validate(req.query);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		let data = schema.value;

		await Store.findByIdAndDelete(data._id);

		return R(res, true, "Store Deleted Successfully", data);
	}),
);

export default router;
