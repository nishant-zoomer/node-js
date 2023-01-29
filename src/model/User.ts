import { Schema, model, Document, Types } from "mongoose";
export interface User extends Document {
	name: string;
	email: string;
	email_verified: Boolean;
	phone: number;
	address: Array<Types.ObjectId>;
	device_token: string;
	geo_location: any;

	[key: string]: any;
}

const UserSchema: Schema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		email_verified: {
			type: Boolean,
			required: true,
		},
		photo: {
			type: String,
		},
		phone: {
			type: Number,
			// unique: true,
		},
		address: [{ type: Types.ObjectId, ref: "Address" }],
		device_token: {
			type: String,
		},
		geo_location: {
			type: { type: String },
			coordinates: [],
		},
	},
	{ timestamps: true },
);
UserSchema.index({ geo_location: "2dsphere" });

export default model<User>("User", UserSchema);
