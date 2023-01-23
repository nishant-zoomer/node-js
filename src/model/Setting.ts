import { Schema, model, Document } from "mongoose";

export interface Setting extends Document {
	name: string;
	value: any;
}

const SettingSchema: Schema = new Schema(
	{
		name: { type: String },
		value: { type: Schema.Types.Mixed },
	},
	{ timestamps: true },
);

export default model<Setting>("Setting", SettingSchema);
