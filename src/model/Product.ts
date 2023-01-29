import { Schema, model, Document } from "mongoose";
import User from "./User";

export interface Product extends Document {
	user: Schema.Types.ObjectId;
	name: string;
	photo: Array<string>;
	price: number; //10 rs
	active: boolean;
	geo_location: any;
	[key: string]: any;
}

/*
	title:"100 gram"
	price: 100 rs
 */

const ProductSchema: Schema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: User.modelName },
		name: { type: String },
		photo: { type: Array },
		price: { type: Number },
		// unit: { type: String },
		active: Boolean,
		geo_location: {
			type: { type: String },
			coordinates: [],
		},
	},
	{ timestamps: true },
);
ProductSchema.index({ geo_location: "2dsphere" });

export default model<Product>("Product", ProductSchema);
