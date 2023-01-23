import { Schema, model, Document } from "mongoose";
import Address from "./Address";
import Employee from "./Employee";
import Product from "./Product";
import User from "./User";

export interface Order extends Document {
	user: Schema.Types.ObjectId;
	number: number;
	items: Array<Items>;
	carrier: Schema.Types.ObjectId;
	status: string;
	address: Schema.Types.ObjectId;
}

// order created > finding delivery boy near by > assign them > update real time until get delivered

export interface Items {
	product: Schema.Types.ObjectId;
	option: Object;
	quantity: number;
}

export enum OrderStatus {
	AWAITING = "AWAITING",
	PROCESSING = "PROCESSING",
	READY = "READY",
	DISPATCHED = "DISPATCHED",
	DELIVERED = "DELIVERED",
}

const ItemSchema: Schema = new Schema({
	product: { type: Schema.Types.ObjectId, ref: Product.modelName },
	option: { type: Object },
	quantity: { type: Number },
});

const OrderSchema: Schema = new Schema(
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

export default model<Order>("Order", OrderSchema);
