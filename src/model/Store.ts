import { Schema, model, Document } from "mongoose";

export interface Store extends Document {
	name: string;
	address: string;
	apartment: string;
	city: string;
	state: string;
	pin_code: number;
	employee_count: number;
}

const StoreSchema: Schema = new Schema(
	{
		name: { type: String },
		address: { type: String },
		apartment: { type: String },
		city: { type: String },
		state: { type: String },
		pin_code: { type: Number },
		employee_count: { type: Number },
	},
	{ timestamps: true },
);

export default model<Store>("Store", StoreSchema);
