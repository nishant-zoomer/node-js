import { Schema, model, Document } from "mongoose";

export interface Mails extends Document {
	email: string;
}

const MailsSchema: Schema = new Schema(
	{
		email: { type: String },
	},
	{ timestamps: true },
);

export default model<Mails>("Mails", MailsSchema);
