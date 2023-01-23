import { Schema, model, Document } from "mongoose";
import User from "./User";

export interface Address extends Document {
	user: Schema.Types.ObjectId;
	type: string;
	address: string;
	apartment: string;
	how_to_reach: string;
	city: string;
	state: string;
	pin_code: number;
	primary: boolean;
	geo_location: Object;
}

export enum AddressType {
	HOME = "HOME",
	OFFICE = "OFFICE",
	OTHER = "OTHER",
}

const AddressSchema: Schema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: User.modelName },
		address: { type: String },
		apartment: { type: String },
		how_to_reach: { type: String },
		city: { type: String },
		state: { type: String },
		pin_code: { type: Number },
		geo_location: { type: Object },
	},
	{ timestamps: true },
);

export default model<Address>("Address", AddressSchema);
