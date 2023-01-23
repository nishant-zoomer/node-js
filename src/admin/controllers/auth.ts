import express, { Request, Response } from "express";
import { asyncWrapper, R } from "@helpers/response-helpers";
import Joi from "joi";
import cn from "@admin/controllers/auth";
import Banner from "@model/Banner";
import User from "@model/User";
import { sendSms } from "@helpers/common";
import redis from "@db/redis";
import otp from "@helpers/otp";
import Admin from "@model/Admin";
import bcrypt from "bcryptjs";

export default {
	banner: {
		list: asyncWrapper(async (req: Request, res: Response) => {
			const banners = await Banner.find({});

			if (!banners.length) {
				return R(res, false, "No banners", {});
			}
			return R(res, true, "All Banners", banners);
		}),
		add: asyncWrapper(async (req: Request, res: Response) => {
			const schema = Joi.object({
				image: Joi.string().required(),
				active: Joi.boolean().required(),
				type: Joi.string().required(),
				value: Joi.string().required(),
				link: Joi.string().required(),
			}).validate(req.body);

			if (schema.error) {
				return R(res, false, schema.error.message);
			}

			const data = schema.value;

			const banner = await Banner.create(data);

			return R(res, true, "Banner Added Successfully", banner);
		}),
		update: asyncWrapper(async (req: Request, res: Response) => {
			const schema = Joi.object({
				_id: Joi.string().required(),
				image: Joi.string().required(),
				active: Joi.boolean().required(),
				type: Joi.string().required(),
				value: Joi.string().required(),
				link: Joi.string().required(),
			}).validate(req.body);

			if (schema.error) {
				return R(res, false, schema.error.message);
			}

			const data = schema.value;

			const banner = await Banner.findById(data._id);

			if (!banner) {
				return R(res, false, "Invalid Request", {});
			}

			delete data._id;

			await banner.update(data);
			await banner.save();

			return R(res, true, "Banner Updated Successfully", banner);
		}),
		updateStatus: asyncWrapper(async (req: Request, res: Response) => {
			const schema = Joi.object({
				_id: Joi.string().required(),
			}).validate(req.query);

			if (schema.error) {
				return R(res, false, schema.error.message);
			}

			const data = schema.value;

			const banner = await Banner.findById(data._id);

			if (!banner) {
				return R(res, false, "Invalid Request", {});
			}

			banner.active = !banner.active;

			await banner.save();

			return R(res, true, "Banner's Status Updated Successfully", banner);
		}),
		delete: asyncWrapper(async (req: Request, res: Response) => {
			const schema = Joi.object({
				_id: Joi.string().required(),
			}).validate(req.query);

			if (schema.error) {
				return R(res, false, schema.error.message);
			}

			const data = schema.value;

			const banner = await Banner.findByIdAndDelete(data._id);

			return R(res, true, "Banner Deleted Successfully", {});
		}),
	},
	auth: {
		login: asyncWrapper(async (req: Request, res: Response) => {
			const schema = Joi.object({
				phone: Joi.string().required(),
				password: Joi.string().required(),
			}).validate(req.body);

			if (schema.error) {
				return R(res, false, schema.error.message);
			}

			const data = schema.value;

			let admin = await Admin.findOne({ phone: data.phone });

			if (admin) {
				if (bcrypt.compareSync(data.password, admin.password ?? "")) {
					admin = admin.toObject();
					const token =
						admin._id +
						"|" +
						otp.generate(50, { alphabets: true, upperCase: true });
					delete admin.password;
					admin["token"] = token;
					await redis.set("admin_auth:" + token, JSON.stringify(admin));

					R(res, true, "Logged in Successfully", admin);
				} else {
					return R(res, false, "Invalid Request", {});
				}
			} else {
				return R(res, false, "Invalid Request", {});
			}
		}),
		sendOtp: asyncWrapper(async (req: Request, res: Response) => {
			const schema = Joi.object({
				phone: Joi.string().required(),
			}).validate(req.body);

			if (schema.error) {
				return R(res, false, schema.error.message);
			}

			const data = schema.value;

			const key = "OTP:" + data.phone;
			const allowedRequestPerMinute = 5;
			const expire = 60;

			if (await redis.exists(key)) {
				await redis.incr(key);
				const totalRequests = (await redis.get(key)) || 0;

				if (totalRequests > allowedRequestPerMinute) {
					return R(
						res,
						false,
						"You've already reached your requests limit.",
						{},
					);
				}
			} else {
				await redis.set(key, 1);
				await redis.expire(key, expire);
			}

			// Generate OTP and hash
			const code = otp.generate(4, {});
			const hash = otp.hash(data.phone, code);
			console.log("OTP is: " + code);

			sendSms(data.phone);

			return R(res, true, "OTP sent to your mobile no.", {
				phone: data.phone,
				hash,
				otp: code,
			});
		}),
		verifyOtp: asyncWrapper(async (req: Request, res: Response) => {
			const schema = Joi.object({
				phone: Joi.string().required(),
				otp: Joi.number().required(),
				hash: Joi.string().required(),
			}).validate(req.body);

			if (schema.error) {
				return R(res, false, schema.error.message);
			}

			const data = schema.value;

			if (!otp.verify(data.phone, data.otp, data.hash)) {
				return res.json({
					status: false,
					message: "Invalid OTP",
					data: null,
				});
			}
			let user = await User.findOne({ phone: data.phone });

			if (!user) {
				let createUser = new User({
					phone: data.phone,
				});
				await createUser.save();
				const token =
					createUser._id +
					"|" +
					otp.generate(50, { alphabets: true, upperCase: true });

				createUser["token"] = token;

				await redis.set("auth:" + token, JSON.stringify(createUser));

				return R(res, true, "Registered Successfully.", createUser);
			} else {
				const token =
					user._id +
					"|" +
					otp.generate(50, { alphabets: true, upperCase: true });

				user["token"] = token;
				await redis.set("auth:" + token, JSON.stringify(user));

				return R(res, true, "Logged in Successfully.", user);
			}
		}),
	},
};
