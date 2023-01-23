import { Schema, model, Document } from "mongoose";
import Address from "./Address";
import Employee from "./Employee";
import Product from "./Product";
import User from "./User";

export interface Order2 extends Document {
	user: Schema.Types.ObjectId;
	number: number;
	items: Array<ItemS>;
	carrier: Schema.Types.ObjectId;
	status: string;
	address: Schema.Types.ObjectId;
}

export interface ItemS {
	id: Schema.Types.ObjectId;
	option: Object;
}

// Order2 created > finding delivery boy near by > assign them > update real time until get delivered

export enum Order2Status {
	AWAITING = "AWAITING",
	PROCESSING = "PROCESSING",
	READY = "READY",
	DISPATCHED = "DISPATCHED",
	DELIVERED = "DELIVERED",
}
const ItemSchema: Schema = new Schema({
	_id: { type: Schema.Types.ObjectId, ref: Product.modelName },
	option: { type: Object },
});
const Order2Schema: Schema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: User.modelName },
		number: { type: Number },
		items: [ItemSchema],
		carrier: { type: Schema.Types.ObjectId, ref: Employee.modelName },
		status: { type: String },
		address: { type: Schema.Types.ObjectId, ref: Address.modelName },
	},
	{ timestamps: true },
);

export default model<Order2>("Order2", Order2Schema);
