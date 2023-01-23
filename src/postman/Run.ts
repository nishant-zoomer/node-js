import { Collection, Item, Header } from "postman-collection";

import fs from "fs";

class PostMan {
	postmanCollection: Collection;
	rawHeaderString: string;
	rawHeaders: any;
	requestHeader: any;
	apiEndpoint: string;
	constructor() {
		this.postmanCollection = new Collection({
			info: {
				// Name of the collection
				name: "Sample Postman collection",
			},
			// Requests in this collection
			item: [],
		});

		// This string will be parsed to create header
		this.rawHeaderString =
			"Authorization:\nContent-Type:application/json\ncache-control:no-cache\n";

		// Parsing string to postman compatible format
		this.rawHeaders = Header.parse(this.rawHeaderString);

		// Generate headers
		this.requestHeader = this.rawHeaders.map((h: any) => new Header(h));

		// API endpoint
		this.apiEndpoint = "https://admin.frutocity.ml";
	}

	addPostRequest(
		name: any,
		host: any,
		path: any,
		query: any,

		method: any,
		body: any,
	) {
		const postmanRequest = new Item({
			name: `${name}`,
			request: {
				header: this.requestHeader,
				url: {
					host: host,
					path: path,
					query: query,
				},
				method: method,
				body: {
					mode: "raw",
					raw: JSON.stringify(body),
				},
			},
		});

		// Add the reqest to our empty collection
		this.postmanCollection.items.add(postmanRequest);

		const collectionJSON = this.postmanCollection.toJSON();

		// Create a colleciton.json file. It can be imported to postman
		fs.writeFile("./collection.json", JSON.stringify(collectionJSON), (err) => {
			if (err) {
				console.log(err);
			}
			console.log("File saved");
		});
	}

	addGetRequest(
		name: any,
		host: any,
		path: any,
		query: any,

		method: any,
		body: any,
	) {
		const postmanRequest = new Item({
			name: `${name}`,
			request: {
				header: this.requestHeader,
				url: {
					host: host,
					path: path,
					query: query,
				},

				method: method,
			},
		});

		// Add the reqest to our empty collection
		this.postmanCollection.items.add(postmanRequest);

		const collectionJSON = this.postmanCollection.toJSON();

		// Create a colleciton.json file. It can be imported to postman
		fs.writeFile("./collection.json", JSON.stringify(collectionJSON), (err) => {
			if (err) {
				console.log(err);
			}
			console.log("File saved");
		});
	}
}

export default PostMan;
