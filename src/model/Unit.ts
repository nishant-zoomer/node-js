import { Schema, model, Document } from "mongoose";

export interface Unit extends Document {
	name: string;
}

const UnitSchema: Schema = new Schema(
	{
		name: { type: String, unique: true },
	},
	{ timestamps: true },
);

export default model<Unit>("Unit", UnitSchema);
