import { asyncWrapper, R } from "@helpers/response-helpers";
import { UserAuthRequest } from "@middleware/auth";
import Address from "@model/Address";
import Banner from "@model/Banner";
import Employee from "@model/Employee";
import Product from "@model/Product";
import Setting from "@model/Setting";
import express, { Response, Request } from "express";
import Joi from "joi";
import User from "@model/User";
import { sendSms } from "@helpers/common";
import redis from "@db/redis";
import otp from "@helpers/otp";
import Mails from "@model/Mails";
import { Validate } from "validation/utils/validator";
import validation from "validation";
import * as google from "@helpers/google";
import models from "@model/models";
import jwt from "@helpers/jwt";
interface GoogleLoginData {
	iss: "https://accounts.google.com";
	nbf: 1657717895;
	aud: "1027287126016-7sspf54kahiag1renibpt9vnvi7nph84.apps.googleusercontent.com";
	sub: "105923223757405800131";
	email: "harsh.dqot@gmail.com";
	email_verified: true;
	azp: "1027287126016-7sspf54kahiag1renibpt9vnvi7nph84.apps.googleusercontent.com";
	name: "harsh raj";
	picture: "https://lh3.googleusercontent.com/a/AItbvml0Bnstraa4CW4Jq3pLATkAZKaWhqhyFMWXwitD=s96-c";
	given_name: "harsh";
	family_name: "raj";
	iat: 1657718195;
	exp: 1657721795;
	jti: "416e52c3bff460b96d71b16aa924887ef58fb794";
}

export default {
	test: {
		addMail: asyncWrapper(async (req: Request, res: Response) => {
			const email = req.params.mail;

			let mail = await Mails.create({ email: email });

			return R(res, true, "Thanks You!", mail);
		}),
		check: asyncWrapper(async (req: Request, res: Response) => {
			console.log(await models.User.find({}));
			return R(res, true, "hello", {});
		}),
	},
	address: {
		list: asyncWrapper(async (req: UserAuthRequest, res: Response) => {
			const address = await Address.find({ user: req.user._id });

			if (!address.length) {
				return R(res, false, "You didn't create any Address", address);
			}

			return R(res, true, "User's Address List", address);
		}),
		add: asyncWrapper(async (req: UserAuthRequest, res: Response) => {
			const schema = Joi.object({
				type: Joi.string().required(),
				address: Joi.string().required(),
				apartment: Joi.string().required(),
				how_to_reach: Joi.string().required(),
				city: Joi.string().required(),
				state: Joi.string().required(),
				pin_code: Joi.number().required(),
				geo_location: Joi.object().allow(null).allow({}).optional(),
			}).validate(req.body);

			if (schema.error) {
				return R(res, false, schema.error.message);
			}

			const data = schema.value;

			data["user"] = req.user?._id;

			const address = await Address.create(data);

			return R(res, true, "Address Added Successfully", address);
		}),
		update: asyncWrapper(async (req: UserAuthRequest, res: Response) => {
			const schema = Joi.object({
				_id: Joi.string().required(),
				type: Joi.string().required(),
				address: Joi.string().required(),
				apartment: Joi.string().required(),
				how_to_reach: Joi.string().required(),
				city: Joi.string().required(),
				state: Joi.string().required(),
				pin_code: Joi.number().required(),
				geo_location: Joi.object().allow(null).allow({}).optional(),
			}).validate(req.body);

			if (schema.error) {
				return R(res, false, schema.error.message);
			}

			const data = schema.value;

			const address = await Address.findById(data._id);

			if (!address) {
				return R(res, false, "Invalid Request", {});
			}

			delete data._id;

			await address.updateOne(data);

			return R(res, true, "Address Updated Successfully", {});
		}),
		setPrimary: asyncWrapper(async (req: UserAuthRequest, res: Response) => {
			const _id = req.params._id;

			const primaryAddress = await Address.findOne({
				user: req.user._id,
				primary: true,
			});

			if (primaryAddress) {
				primaryAddress.primary = false;

				await primaryAddress.save();
			}

			const address = await Address.findOne({
				_id: _id,
				user: req.user._id,
				primary: false,
			});

			if (!address) {
				return R(res, false, "Invalid Request", {});
			}

			address.primary = true;
			await address.save();

			return R(res, true, "Address set as Primary", address);
		}),
		primaryAddress: asyncWrapper(
			async (req: UserAuthRequest, res: Response) => {
				let primaryAddress = await Address.findOne({
					user: req.user._id,
					primary: true,
				});

				if (!primaryAddress) {
					primaryAddress = await Address.findOne({ user: req.user._id });
				}

				if (!primaryAddress) {
					return R(res, false, "You don't have any Address yet", {});
				}

				return R(res, true, "Address set as Primary", primaryAddress);
			},
		),
		onlineEmployee: asyncWrapper(
			async (req: UserAuthRequest, res: Response) => {
				let status = req.query.status;

				if (!status) {
					return R(res, false, "Invalid Request", {});
				}

				let employee = await Employee.findOne({
					id: req.user._id,
				});

				if (!employee) {
					return R(res, false, "Invalid Request", {});
				}

				if (status == "on") {
					employee.online = true;
				} else if (status == "off") {
					employee.online = false;
				}

				await employee.save();

				return R(res, true, "Address set as Primary", {});
			},
		),
		employeeMe: asyncWrapper(async (req: UserAuthRequest, res: Response) => {
			let employee = await Employee.findOne({
				id: req.user._id,
			});

			if (!employee) {
				return R(res, false, "Invalid Request", {});
			}

			return R(res, true, "Employee data", employee);
		}),
	},
	banner: {
		list: asyncWrapper(async (req: UserAuthRequest, res: Response) => {
			const banners = await Banner.find({});

			if (!banners.length) {
				return R(res, false, "no Banners", banners);
			}

			return R(res, true, "User's banners List", banners);
		}),
	},
	home: {
		exclusiveOffer: asyncWrapper(async (req: Request, res: Response) => {
			const setting = await Setting.findOne({
				name: "exclusive-offer",
			});

			if (!setting) {
				return R(res, false, "Invalid Request", {});
			}

			const ids = setting.value;

			if (!ids) {
				return R(res, false, "Invalid Request", {});
			}

			const data = await Product.find({ _id: { $in: ids } }).populate([
				{ path: "category" },
				{ path: "store" },
				{ path: "unit" },
			]);

			for (let d of data) {
				d.details = d.details.filter((f: any) => f != null);
			}

			if (!data.length) {
				return R(res, false, "Invalid Request", {});
			}

			return R(res, true, "Exclusive Offers", data);
		}),
		bestSelling: asyncWrapper(async (req: Request, res: Response) => {
			const setting = await Setting.findOne({
				name: "best-selling",
			});

			if (!setting) {
				return R(res, false, "Invalid Request", {});
			}

			const ids = setting.value;

			if (!ids) {
				return R(res, false, "Invalid Request", {});
			}

			const data = await Product.find({ _id: { $in: ids } }).populate([
				{ path: "category" },
				{ path: "store" },
				{ path: "unit" },
			]);

			if (!data.length) {
				return R(res, false, "Invalid Request", {});
			}

			for (let d of data) {
				d.details = d.details.filter((f: any) => f != null);
			}

			return R(res, true, "Best Selling Products", data);
		}),
		mostPopular: asyncWrapper(async (req: Request, res: Response) => {
			const setting = await Setting.findOne({
				name: "most-popular",
			});

			if (!setting) {
				return R(res, false, "Invalid Request", {});
			}

			const ids = setting.value;

			if (!ids) {
				return R(res, false, "Invalid Request", {});
			}

			const data = await Product.find({ _id: { $in: ids } }).populate([
				{ path: "category" },
				{ path: "store" },
				{ path: "unit" },
			]);

			if (!data.length) {
				return R(res, false, "Invalid Request", {});
			}
			for (let d of data) {
				d.details = d.details.filter((f: any) => f != null);
			}

			return R(res, true, "Most Popular Products", data);
		}),
	},
	login: {
		socialLogin: asyncWrapper(async (req: Request, res: Response) => {
			const body = await Validate(res, [], validation.auth.login, req.body, {});

			console.log(body);

			const verify: GoogleLoginData = await google.verify(body.token);

			if (!verify || !verify?.email_verified) {
				return R(res, false, "Invalid Login Creds");
			}

			let user = await models.User.findOne({
				email: verify.email,
			});

			if (!user) {
				user = await models.User.create({
					email: verify.email,
					email_verified: verify.email_verified,
					name: verify.name,
					...(verify.picture && { photo: verify.picture }),
				});
			}

			let token = await jwt.signAsync({
				_id: user?._id,
				email: user.email,
				name: user?.name,
			});

			user = user.toObject();

			user.token = token;

			return R(res, true, "Logged In Successfully", user);
		}),
	},
	user: {
		me: asyncWrapper(async (req: UserAuthRequest, res: Response) => {
			const user = await User.findById(req.user?._id).select("-password");
			console.log("🚀 ~ file: auth.ts:462 ~ me:asyncWrapper ~ user", user);

			if (!user) {
				return R(res, false, "Invalid User", {});
			}

			return R(res, true, "User Data", user);
		}),
		updateMe: asyncWrapper(async (req: UserAuthRequest, res: Response) => {
			const schema = Joi.object({
				name: Joi.string().required(),
				phone: Joi.number().required(),
			}).validate(req.body);

			if (schema.error) {
				return R(res, false, schema.error.message);
			}

			const data = schema.value;

			const user = await User.findById(req.user?._id);

			if (!user) {
				return R(res, false, "Invalid User", {});
			}

			user.name = data.name;
			user.phone = data.phone;

			await user.save();

			return R(res, true, "data updated Successfully", user);
		}),

		updateMyLocation: asyncWrapper(
			async (req: UserAuthRequest, res: Response) => {
				const schema = Joi.object({
					latitude: Joi.number().required(),
					longitude: Joi.number().required(),
				}).validate(req.body);

				if (schema.error) {
					return R(res, false, schema.error.message);
				}

				const data = schema.value;

				const user = await User.findById(req.user?._id);

				if (!user) {
					return R(res, false, "Invalid User", {});
				}

				user.geo_location = {
					type: "Point",
					coordinates: [data.longitude, data.latitude],
				};

				await user.save();

				return R(res, true, "location updated Successfully", user);
			},
		),
	},
};
