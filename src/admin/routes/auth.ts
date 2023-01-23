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
import Setting from "@model/Setting";
import Store from "@model/Store";
import Unit from "@model/Unit";
import Category from "@model/Category";
import upload, { UploadedFile } from "express-fileupload";
import path from "path";

const router = express.Router();

router.get("/list-banners", cn.banner.list);

router.post("/add-banner", cn.banner.add);

router.post("/update-banner", cn.banner.update);

router.get("/update-banner-status", cn.banner.updateStatus);

router.get("/delete-banner", cn.banner.delete);

router.post("/login", cn.auth.login);

router.post("/send-otp", cn.auth.sendOtp);

router.post("/verify-otp", cn.auth.verifyOtp);

router.get(
	"/list-settings",
	asyncWrapper(async (req: Request, res: Response) => {
		const settings = await Setting.find({});

		if (!settings.length) {
			return R(res, false, "No settings", {});
		}
		return R(res, true, "All settings", settings);
	}),
);

router.post(
	"/add-setting",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			name: Joi.string().required(),
			value: Joi.any().required(),
		}).validate(req.body);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		const data = schema.value;

		const setting = await Setting.create(data);

		return R(res, true, "Setting Added Successfully", setting);
	}),
);

router.post(
	"/update-setting",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			_id: Joi.string().required(),
			name: Joi.string().required(),
			value: Joi.any().required(),
		}).validate(req.body);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		const data = schema.value;

		const setting = await Setting.findById(data._id);

		if (!setting) {
			return R(res, false, "Invalid Request", {});
		}

		delete data._id;

		await setting.update(data);
		await setting.save();

		return R(res, true, "Setting Updated Successfully", setting);
	}),
);

router.get(
	"/delete-setting",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			_id: Joi.string().required(),
		}).validate(req.query);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		const data = schema.value;

		const setting = await Setting.findByIdAndDelete(data._id);

		return R(res, true, "Setting Deleted Successfully", {});
	}),
);

router.get("/hi", (req, res, next) => {
	res.send("hello");
});

router.get("/delete/exclusive-offer", async (req, res) => {
	await Setting.deleteOne({ name: "exclusive-offer" });

	res.send("OK");
});

router.get(
	"/test/hi/hi",
	asyncWrapper(async (req: Request, res: Response) => {
		return R(res, true, "hello", { p: process.cwd() });
	}),
);

router.get(
	"/add-admin",
	asyncWrapper(async (req: Request, res: Response) => {
		let data = {
			phone: "9983396152",
			password: bcrypt.hashSync("admin", 10),
		};

		await Admin.create(data);
		return R(res, true, "Admin Created Successfully", {});
	}),
);

router.get(
	"/add-category",
	asyncWrapper(async (req: Request, res: Response) => {
		let url = "https://asset.frutocity.cf/404.png";
		let data = {
			name: "Test Category",
			description: "lorem ipsum the quick brown fox jumps over the lazy dog",
			photo: url,
		};

		await Category.create(data);
		return R(res, true, "Created Successfully", {});
	}),
);

router.get(
	"/add-unit",
	asyncWrapper(async (req: Request, res: Response) => {
		let url = "https://asset.frutocity.cf/404.png";
		let data = {
			name: "KG",
		};

		await Unit.create(data);
		return R(res, true, "Created Successfully", {});
	}),
);

router.get(
	"/add-store",
	asyncWrapper(async (req: Request, res: Response) => {
		let data = {
			name: "test Store",
			address: "test Address",
			apartment: "test apartment",
			city: "test city",
			state: "test state",
			country: "test country",
			pin_code: 123456,
			employee_count: 10,
		};

		await Store.create(data);
		return R(res, true, "Created Successfully", {});
	}),
);

router.use(upload());

router.post(
	"/upload-banner",
	asyncWrapper(async (req: Request, res: Response) => {
		const newpath = process.cwd() + "/files/banner/";
		console.log(process.cwd());
		console.log("newpath", newpath);

		const file = req.files?.file as UploadedFile;

		let filename = file?.name;
		const extensionName = path?.extname(filename ?? "");
		const allowedExtension = [".png", ".jpg", ".jpeg"];
		if (!allowedExtension.includes(extensionName)) {
			return res.json({ message: "Invalid Image", status: false });
		}

		filename = Date.now() + extensionName;

		file.mv(`${newpath}${filename}`, (err) => {
			if (err) {
				return res.json({ message: "File upload failed", status: false });
			}
			return res.json({
				message: "File Uploaded",
				status: true,
				data: `https://asset.frutocity.cf/banner/${filename}`,
			});
		});
	}),
);

export default router;
