import { Schema, model, Document } from "mongoose";
import User from "./User";

export interface Product extends Document {
	user: Schema.Types.ObjectId;
	name: string;
	photo: Array<string>;
	price: number; //10 rs
	active: boolean;
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
	},
	{ timestamps: true },
);

export default model<Product>("Product", ProductSchema);
