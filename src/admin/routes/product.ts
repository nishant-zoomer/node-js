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
import Product from "@model/Product";
import Setting from "@model/Setting";
import { isValidObjectId } from "mongoose";
import upload, { UploadedFile } from "express-fileupload";
import path from "path";

const router = express.Router();

router.get(
	"/categories",
	asyncWrapper(async (req: Request, res: Response) => {
		const Categories = await Category.find({});

		return R(res, true, "Category List", Categories);
	}),
);
router.post(
	"/category",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			name: Joi.string().required(),
			description: Joi.string().required(),
			photo: Joi.string().required(),
			active: Joi.boolean().required(),
		}).validate(req.body);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		let data = schema.value;

		let category = await Category.create(data);

		return R(res, true, "Category List", category);
	}),
);

router.get(
	"/delete-category",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			_id: Joi.string().required(),
		}).validate(req.query);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		let data = schema.value;

		await Category.findByIdAndDelete(data._id);

		return R(res, true, "Category Deleted Successfully", {});
	}),
);

router.get(
	"/update-category-status",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			_id: Joi.string().required(),
		}).validate(req.query);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		let data = schema.value;

		const category = await Category.findById(data._id);

		if (!category) {
			return R(res, false, "Invalid Request", {});
		}

		category.active = !category.active;
		await category.save();

		return R(res, true, "Category Updated Successfully", {});
	}),
);

router.post(
	"/update-category",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			_id: Joi.string().required(),
			name: Joi.string().required(),
			description: Joi.string().required(),
			photo: Joi.string().required(),
			active: Joi.boolean().required(),
		}).validate(req.body);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		let data = schema.value;

		const category = await Category.findById(data._id);

		if (!category) {
			return R(res, false, "Invalid Request", {});
		}
		delete data._id;
		await category.update(data);
		await category.save();
		return R(res, true, "Category Updated Successfully", category);
	}),
);

router.post(
	"/add-product",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			name: Joi.string().required(),
			description: Joi.string().required(),
			photo: Joi.array().min(1).required(),
			price: Joi.number().required(), //10 rs
			unit: Joi.string().required(), //kg
			unit_value: Joi.number().required(), //1
			weight: Joi.string().required(),
			category: Joi.string().required(),
			quantity: Joi.number().required(),
			details: Joi.array().required(),
			options: Joi.array().required(),
			discount: Joi.number().required(),
			store: Joi.string().required(),
			active: Joi.boolean().required(),
		}).validate(req.body);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		const data = schema.value;

		await Product.create(data);
		return R(res, true, "Product Uploaded Successfully");
	}),
);

router.post(
	"/update-product",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			_id: Joi.string().required(),
			name: Joi.string().required(),
			description: Joi.string().required(),
			photo: Joi.array().min(1).required(),
			price: Joi.number().required(), //10 rs
			unit: Joi.string().required(), //kg
			unit_value: Joi.number().required(), //1
			weight: Joi.string().required(),
			category: Joi.string().required(),
			quantity: Joi.number().required(),
			details: Joi.array().required(),
			options: Joi.array().required(),
			discount: Joi.number().required(),
			store: Joi.string().required(),
			active: Joi.boolean().required(),
		}).validate(req.body);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		let data = schema.value;

		console.log("data.details", data.details);

		const product = await Product.findById(data._id);

		if (!product) {
			return R(res, false, "Invalid Request");
		}
		delete data._id;
		await product.update(data);
		await product.save();

		return R(res, true, "Product updated Successfully");
	}),
);

router.get(
	"/delete-product",
	asyncWrapper(async (req: Request, res: Response) => {
		let productId = req.query._id;

		if (!productId) {
			return R(res, false, "Invalid Id");
		}

		await Product.findByIdAndDelete(productId);

		return R(res, true, "Product Deleted Successfully", {});
	}),
);

router.get(
	"/update-product-status",
	asyncWrapper(async (req: Request, res: Response) => {
		let productId = req.query._id;

		if (!productId) {
			return R(res, false, "Invalid Id");
		}

		const product = await Product.findById(productId);

		if (!product) {
			return R(res, false, "Invalid Request", {});
		}

		product.active = !product.active;
		await product.save();

		return R(res, true, "Product Status Updated Successfully", {});
	}),
);

router.get(
	"/list-products",
	asyncWrapper(async (req: Request, res: Response) => {
		let products = await Product.find({}).populate([
			{ path: "category" },
			{ path: "store" },
			{ path: "unit" },
		]);

		return R(res, true, "Product Uploaded Successfully", products);
	}),
);

router.get(
	"/exclusive-offer",
	asyncWrapper(async (req: Request, res: Response) => {
		const setting = await Setting.findOne({
			name: "exclusive-offer",
		});

		if (!setting) {
			await Setting.create({
				name: "exclusive-offer",
				value: [],
			});
			return R(res, false, "Invalid Request", {});
		}

		const ids = setting.value;

		if (!ids) {
			return R(res, false, "Invalid Request", {});
		}

		const data = await Product.find({ _id: { $in: ids } });

		if (!data.length) {
			return R(res, false, "Invalid Request", {});
		}

		return R(res, true, "Exclusive Offers", data);
	}),
);

router.get(
	"/add/exclusive-offer",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			_id: Joi.string().required(),
		}).validate(req.query);

		if (schema.error) {
			return R(res, false, schema.error.message, {});
		}

		const data = schema.value;

		if (!isValidObjectId(data._id)) {
			return R(res, false, "not a valid Product Id", {});
		}

		const setting = await Setting.findOne({
			name: "exclusive-offer",
		});

		if (!setting) {
			return R(res, false, "Invalid Request", {});
		}

		let ids = setting.value;

		if (!ids) {
			return R(res, false, "Invalid Request", {});
		}

		setting.value = [...ids, data._id];
		await setting.save();

		return R(res, true, "Added to Exclusive Offers", data);
	}),
);

router.get(
	"/remove/exclusive-offer",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			_id: Joi.string().required(),
		}).validate(req.query);

		if (schema.error) {
			return R(res, false, schema.error.message, {});
		}

		const data = schema.value;

		const setting = await Setting.findOne({
			name: "exclusive-offer",
		});

		if (!setting) {
			return R(res, false, "Invalid Request", {});
		}

		let ids = setting.value;

		if (!ids) {
			return R(res, false, "Invalid Request", {});
		}

		setting.value = ids.filter((f: any) => f != data._id);

		await setting.save();

		return R(res, true, "Removed from Exclusive Offers", data);
	}),
);

router.get(
	"/best-selling",
	asyncWrapper(async (req: Request, res: Response) => {
		const setting = await Setting.findOne({
			name: "best-selling",
		});

		if (!setting) {
			await Setting.create({
				name: "best-selling",
				value: [],
			});
			return R(res, false, "Invalid Request", {});
		}

		const ids = setting.value;

		if (!ids) {
			return R(res, false, "Invalid Request", {});
		}

		const data = await Product.find({ _id: { $in: ids } });

		if (!data.length) {
			return R(res, false, "Invalid Request", {});
		}

		return R(res, true, "Best Selling Products", data);
	}),
);

router.get(
	"/add/best-selling",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			_id: Joi.string().required(),
		}).validate(req.query);

		if (schema.error) {
			return R(res, false, schema.error.message, {});
		}

		const data = schema.value;

		if (!isValidObjectId(data._id)) {
			return R(res, false, "not a valid Product Id", {});
		}

		const setting = await Setting.findOne({
			name: "best-selling",
		});

		if (!setting) {
			return R(res, false, "Invalid Request", {});
		}

		let ids = setting.value;

		if (!ids) {
			return R(res, false, "Invalid Request", {});
		}

		setting.value = [...ids, data._id];
		await setting.save();

		return R(res, true, "Added to Best Sellings", data);
	}),
);

router.get(
	"/remove/best-selling",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			_id: Joi.string().required(),
		}).validate(req.query);

		if (schema.error) {
			return R(res, false, schema.error.message, {});
		}

		const data = schema.value;

		const setting = await Setting.findOne({
			name: "best-selling",
		});

		if (!setting) {
			return R(res, false, "Invalid Request", {});
		}

		let ids = setting.value;

		if (!ids) {
			return R(res, false, "Invalid Request", {});
		}

		setting.value = ids.filter((f: any) => f != data._id);

		await setting.save();

		return R(res, true, "Removed from Best Sellings", data);
	}),
);

router.get(
	"/most-popular",
	asyncWrapper(async (req: Request, res: Response) => {
		const setting = await Setting.findOne({
			name: "most-popular",
		});

		if (!setting) {
			await Setting.create({
				name: "most-popular",
				value: [],
			});
			return R(res, false, "Invalid Request", {});
		}

		const ids = setting.value;

		if (!ids) {
			return R(res, false, "Invalid Request", {});
		}

		const data = await Product.find({ _id: { $in: ids } });

		if (!data.length) {
			return R(res, false, "Invalid Request", {});
		}

		return R(res, true, "Most Popular Products", data);
	}),
);

router.get(
	"/add/most-popular",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			_id: Joi.string().required(),
		}).validate(req.query);

		if (schema.error) {
			return R(res, false, schema.error.message, {});
		}

		const data = schema.value;

		if (!isValidObjectId(data._id)) {
			return R(res, false, "not a valid Product Id", {});
		}

		const setting = await Setting.findOne({
			name: "most-popular",
		});

		if (!setting) {
			return R(res, false, "Invalid Request", {});
		}

		let ids = setting.value;

		if (!ids) {
			return R(res, false, "Invalid Request", {});
		}

		setting.value = [...ids, data._id];
		await setting.save();

		return R(res, true, "Added to Most Popular", data);
	}),
);

router.get(
	"/remove/most-popular",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			_id: Joi.string().required(),
		}).validate(req.query);

		if (schema.error) {
			return R(res, false, schema.error.message, {});
		}

		const data = schema.value;

		const setting = await Setting.findOne({
			name: "most-popular",
		});

		if (!setting) {
			return R(res, false, "Invalid Request", {});
		}

		let ids = setting.value;

		if (!ids) {
			return R(res, false, "Invalid Request", {});
		}

		setting.value = ids.filter((f: any) => f != data._id);

		await setting.save();

		return R(res, true, "Removed from Most Popular", data);
	}),
);

router.get(
	"/units",
	asyncWrapper(async (req: Request, res: Response) => {
		const units = await Unit.find({});

		return R(res, true, "Units' List", units);
	}),
);

router.post(
	"/unit",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			name: Joi.string().required(),
		}).validate(req.body);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		let data = schema.value;

		await Unit.create(data);

		return R(res, true, "Unit Created Successfully", {});
	}),
);

router.get(
	"/delete-unit",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			_id: Joi.string().required(),
		}).validate(req.query);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		let data = schema.value;

		await Unit.findByIdAndDelete(data._id);

		return R(res, true, "Unit Deleted Successfully", {});
	}),
);

router.post(
	"/update-unit",
	asyncWrapper(async (req: Request, res: Response) => {
		const schema = Joi.object({
			_id: Joi.string().required(),
			name: Joi.string().required(),
		}).validate(req.body);

		if (schema.error) {
			return R(res, false, schema.error.message);
		}

		let data = schema.value;

		await Unit.findByIdAndUpdate(data._id, { name: data.name });

		return R(res, true, "Unit Updated Successfully", {});
	}),
);

router.use(upload());

router.post(
	"/upload-file",
	asyncWrapper(async (req: Request, res: Response) => {
		const newpath = process.cwd() + "/files/";
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
				data: `https://asset.frutocity.cf/${filename}`,
			});
		});
	}),
);

export default router;
