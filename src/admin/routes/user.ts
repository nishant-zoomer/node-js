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
import Employee from "@model/Employee";
import Role from "@model/Role";
const router = express.Router();

router.post(
	"/",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			name: Joi.string().required(),
			store: Joi.string().required(),
			role: Joi.string().required(),
			phone: Joi.string().required(),
		}).validate(req.body);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		const data = schema.value;

		await Employee.create(data);

		return R(res, true, "Employee Created Successfully", {});
	}),
);

router.get(
	"/sdlgjsdlgjsldkjg",
	asyncWrapper(async (req: Request, res: Response) => {
		await Employee.remove();

		return R(res, true, "Employee Deleted Successfully", {});
	}),
);

router.post(
	"/add-role",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			name: Joi.string().required(),
			salary: Joi.number().required(),
		}).validate(req.body);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		let data = schema.value;
		data.name = data.name.toLowerCase();

		let exist = await Role.countDocuments({
			name: data.name,
		});

		if (exist > 0) {
			return R(res, false, "Role Already Exists");
		}

		await Role.create(data);

		return R(res, true, "Role Created Successfully", {});
	}),
);

router.get(
	"/",
	asyncWrapper(async (req: Request, res: Response) => {
		const users = await User.find({});

		return R(res, true, "User List", users);
	}),
);

router.get(
	"/employee",
	asyncWrapper(async (req: Request, res: Response) => {
		const users = await Employee.find({});

		return R(res, true, "Employee List", users);
	}),
);

router.get(
	"/role",
	asyncWrapper(async (req: Request, res: Response) => {
		const users = await Role.find({});

		return R(res, true, "Role List", users);
	}),
);

export default router;
