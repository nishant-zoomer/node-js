import { Schema, model, Document, Types, ObjectId } from "mongoose";

export interface Category extends Document {
	name: string;
	description: string;
	photo: string;
	active: boolean;
}

const CategorySchema: Schema = new Schema(
	{
		name: { type: String },
		description: { type: String },
		photo: { type: String },
		active: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

export default model<Category>("Category", CategorySchema);
