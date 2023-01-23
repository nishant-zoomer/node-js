import { Schema, model, Document } from "mongoose";

export interface Banner extends Document {
	image: string;
	active: boolean;
	type: string;
	value: string;
	link: string;
}

export enum BannerType {
	EXT = "EXTERNAL",
	INT = "INTERNAL",
}

const BannerSchema: Schema = new Schema(
	{
		image: String,
		active: Boolean,
		type: String,
		value: String,
		link: String,
	},
	{ timestamps: true },
);

export default model<Banner>("Banner", BannerSchema);
