import { initDb } from "@db/mongo";
import Product from "@model/Product";
import mongoose from "mongoose";

(async () => {
	await initDb();
	const search = "hello";

	let product = await Product.find({
		// $match: {
		$or: [
			{
				name: {
					$regex: new RegExp(search),
				},
			},
			{
				description: {
					$regex: new RegExp(search),
				},
			},
			{
				weight: {
					$regex: new RegExp(search),
				},
			},
		],
		// },
	});
	if (!product.length) {
		return console.log("no data");
	}

	for (let p of product) {
		console.log(`Products: ${p.name}, ${p.price}, ${p._id}`);
	}
})();
