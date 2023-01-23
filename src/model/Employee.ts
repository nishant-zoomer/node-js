import { Schema, model, Document } from "mongoose";
import Role from "./Role";
import Store from "./Store";

export interface Employee extends Document {
	name: string;
	phone: string;
	store: Schema.Types.ObjectId;
	extra_salary: number;
	working_hours: number;
	from_time: number; //24 hrs
	to_time: number; // 24 hrs
	role: Schema.Types.ObjectId;
	joining: Date;
	active: boolean;
	online: boolean;
}

const EmployeeSchema: Schema = new Schema(
	{
		name: { type: String },
		phone: { type: String },
		store: { type: Schema.Types.ObjectId, ref: Store.modelName },
		extra_salary: { type: Number },
		working_hours: { type: Number },
		from_time: { type: Number },
		to_time: { type: Number },
		role: { type: Schema.Types.ObjectId, ref: Role.modelName },
		joining: { type: Date, default: new Date() },
		active: { type: Boolean, default: true },
		online: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

export default model<Employee>("Employee", EmployeeSchema);
