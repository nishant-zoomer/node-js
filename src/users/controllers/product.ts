import express, { Request, Response } from "express";
import { asyncWrapper, R } from "@helpers/response-helpers";
import Joi from "joi";
import User from "@model/User";
import { sendSms } from "@helpers/common";
import redis from "@db/redis";
import otp from "@helpers/otp";
import Product from "@model/Product";
import { UploadedFile } from "express-fileupload";
import path from "path";
import { UserAuthRequest } from "@middleware/auth";
import models from "@model/models";

export default {
	test: asyncWrapper(async (req: Request, res: Response) => {
		return R(res, true, "hello", {});
	}),
	list: asyncWrapper(async (req: UserAuthRequest, res: Response) => {
		let user = await User.findById(req.user?._id);

		if (!user) {
			return R(res, false, "No user found");
		}
		if (!user.geo_location) {
			return R(res, false, "No user found");
		}
		console.log(user.geo_location);
		let latitude = user.geo_location.coordinates?.[0];
		let longitude = user.geo_location.coordinates?.[1];

		// latitude = 28.6448;
		// longitude = 77.216721;

		let distance = 0;

		let products = await Product.aggregate([
			{
				$match: {
					user: {
						$ne: req.user?._id,
					},
				},
			},
			{
				$geoNear: {
					near: {
						type: "Point",
						coordinates: [longitude, latitude],
					},
					key: "geo_location",
					maxDistance: 1000 * 16e9,
					distanceField: "dist.calculated",
					spherical: true,
				},
			},
		]);

		// let products = await Product.find({
		// 	user: { $ne: req.user?._id },
		// 	geo_location: {
		// 		$nearSphere: {
		// 			$geometry: {
		// 				type: "Point",
		// 				coordinates: [
		// 					(longitude * Math.PI) / 180,
		// 					(latitude * Math.PI) / 180,
		// 				],
		// 			},
		// 			$maxDistance: distance,
		// 		},
		// 	},
		// }).populate([
		// 	{
		// 		path: "user",
		// 		select: "name phone",
		// 	},
		// ]);

		await Product.populate(products, [{ path: "user", select: "name phone" }]);

		console.log("products count: ", products.length);

		return R(res, true, "Product List", products);
	}),
	myList: asyncWrapper(async (req: UserAuthRequest, res: Response) => {
		let products = await Product.find({
			user: req.user._id,
		});

		return R(res, true, "Product List", products);
	}),
	search: asyncWrapper(async (req: Request, res: Response) => {
		const search = new RegExp(req.params.text);
		console.log(search);
		let product = await Product.find({
			$or: [
				{
					name: {
						$regex: search,
					},
				},
				{
					description: {
						$regex: search,
					},
				},
				{
					weight: {
						$regex: search,
					},
				},
			],
		}).populate([{ path: "category" }, { path: "store" }, { path: "unit" }]);

		if (!product) {
			return R(res, false, "Invalid search term", {});
		}

		return R(res, true, "Product Search Data", product);
	}),
	show: asyncWrapper(async (req: Request, res: Response) => {
		const _id = req.params._id;
		let product = await Product.findById(_id).populate([
			{ path: "category" },
			{ path: "store" },
			{ path: "unit" },
		]);

		if (!product) {
			return R(res, false, "Invalid Request", {});
		}

		return R(res, true, "Product Data", product);
	}),
	add: asyncWrapper(async (req: UserAuthRequest, res: Response) => {
		let user = await User.findById(req.user?._id);

		if (!user) {
			return R(res, false, "Invalid User");
		}

		if (!user.geo_location) {
			return R(res, false, "Invalid User Location");
		}

		const newpath = process.cwd() + "/files/";
		console.log(process.cwd());
		console.log("newpath", newpath);

		console.log(req.user);
		let title = req.body?.title;
		let price = req.body?.price;

		if (!title || !price) {
			return R(res, false, "Invalid Request", {});
		}

		const file = req.files?.file as UploadedFile;

		let filename = file?.name;
		const extensionName = path?.extname(filename ?? "");
		const allowedExtension = [".png", ".jpg", ".jpeg"];
		if (!allowedExtension.includes(extensionName)) {
			return res.json({ message: "Invalid Image", status: false });
		}

		filename = Date.now() + extensionName;

		file.mv(`${newpath}${filename}`, async (err) => {
			if (err) {
				return res.json({ message: "File upload failed", status: false });
			}
			let product = await models.Product.create({
				user: req?.user?._id,
				name: title,
				price: parseFloat(price),
				photo: [filename],
				geo_location: user?.geo_location,
				// "geo_location": {
				// 	"type": "Point",
				// 	"coordinates": [-73.97, 40.77]
				// }
			});

			return res.json({
				message: "File Uploaded",
				status: true,
				data: product,
			});
		});
	}),
};
