import mongoose from "mongoose";
import env from "../config/db";

export const initDb = async () => {
	try {
		console.log(mongoose.connections[0].readyState);
		if (mongoose.connections[0].readyState) {
			return console.log("already connected");
		}

		const connect = await mongoose.connect(
			// "mongodb+srv://harsh:1Wx1fkJ8IxY2Z08u@cluster0.qdude.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
			// "mongodb://swagrixidb:esdabjarcoco@127.0.0.1:27017/sms9",
			env.URI,
		);

		mongoose.connection.on("connected", () => {
			console.log("Connected to mongo");
			return;
		});
		mongoose.connection.on("error", (err) => {
			return console.log("mongo err:", err);
		});
	} catch (err) {
		console.log("Error connecting to Mongo:", err);
	}
};
