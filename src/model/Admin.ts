import { Schema, model, Document } from "mongoose";

export interface Admin extends Document {
	phone: string;
	password?: string;
	[key: string]: any;
}

const AdminSchema: Schema = new Schema(
	{
		phone: { type: String, unique: true },
		password: String,
	},
	{ timestamps: true },
);

export default model<Admin>("Admin", AdminSchema);
