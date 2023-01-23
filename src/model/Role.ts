import { Schema, model, Document } from "mongoose";

export interface Role extends Document {
	name: string;
	salary: number;
}

const RoleSchema: Schema = new Schema(
	{
		name: { type: String },
		salary: { type: Number },
	},
	{ timestamps: true },
);

export default model<Role>("Role", RoleSchema);
