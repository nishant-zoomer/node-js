import { initDb } from "@db/mongo";
import * as Employy from "@model/Employee";
import { Employee } from "@model/Employee";
import Order from "@model/Order";
import { User } from "@model/User";
import { Server, Socket } from "socket.io";

const io = new Server({
	transports: ["websocket", "polling"],
	cors: {
		origin: "*",
	},
});
initDb();

export interface CustomSocket extends Socket {
	user?: User; // or any other type
	boy?: Employee;
}

let userIdList: any = {};

const getUserId = (id: any) => {
	return userIdList[`${id}`] || "";
};

const setUserId = (_id: any, id: any) => {
	userIdList[`${_id}`] = id;
};

console.log("server is running.... on port 9999");

io.on("connection", (socket: CustomSocket) => {
	console.log("Socket Connection Received");

	// io.emit("first-event", "hello new user connected");

	//set user data when connected
	socket.on("set-user", (d) => {
		socket.user = d;
		setUserId(d.id, socket.id);
		console.log(d.id);
		console.log(`user saved successfully ${getUserId(d.id)} `);
	});

	socket.on("set-boy", (d) => {
		socket.boy = d;
	});

	socket.on("test-ping", (d) => {
		io.emit("test-pong", d);
	});
	/*
	 * Users' Events
	 */

	// join user into order room
	socket.on("place-order", (d) => {
		console.log("place order called", d);

		let orderId = d.order._id;
		socket.join(orderId);

		(async () => {
			let boy = await Employy.default.findOne({
				online: true,
			});
			console.log(boy);
			if (boy) {
				console.log("boy found getting user id");
				console.log(boy?._id);
				console.log(getUserId(boy?._id.toString()));
				io.to(getUserId(boy?._id)).emit("new-order", d);
			}
		})();
	});

	socket.on("accept-user-order", (d) => {
		let orderId = d.order._id;
		let boy_id = d.boy?._id;

		(async () => {
			let boy = await Employy.default.findById(boy_id);

			if (boy) {
				await Order.findByIdAndUpdate(`${orderId}`, {
					status: "PROCESSING",
					carrier: boy_id,
				});
				d.order.status = "PROCESSING";
				io.to(orderId).emit("boy-order-accepted", { ...d, boy: boy });
			}
		})();
	});

	socket.on("out-for-delivery", (d) => {
		let orderId = d.order._id;
		let boy_id = d.boy?._id;

		(async () => {
			let boy = await Employy.default.findById(boy_id);
			if (boy) {
				await Order.findByIdAndUpdate(`${orderId}`, { status: "READY" });
				d.order.status = "READY";
				io.to(orderId).emit("boy-out-for-delivery", { ...d, boy: boy });
			}
		})();
	});

	socket.on("reached-at-destination", (d) => {
		let orderId = d.order._id;
		let boy_id = d.boy?._id;

		(async () => {
			let boy = await Employy.default.findById(boy_id);
			if (boy) {
				await Order.findByIdAndUpdate(`${orderId}`, { status: "DISPATCHED" });
				d.order.status = "DISPATCHED";
				io.to(orderId).emit("boy-reached-at-destination", { ...d, boy: boy });
			}
		})();
	});

	socket.on("delivered", (d) => {
		let orderId = d.order._id;
		let boy_id = d.boy?._id;

		(async () => {
			let boy = await Employy.default.findById(boy_id);

			if (boy) {
				await Order.findByIdAndUpdate(`${orderId}`, { status: "DELIVERED" });
				d.order.status = "DELIVERED";
				io.to(orderId).emit("order-delivered", { ...d, boy: boy });
			}
		})();
	});

	socket.on("reject-user-order", (d) => {
		let orderId = d.order._id;
		let boy_id = d.boy?._id;
		(async () => {
			let boy = await Employy.default.findOne({
				online: true,
				_id: {
					$ne: boy_id,
				},
			});
			console.log(boy);
			if (boy) {
				console.log("boy found getting user id");
				console.log(boy?._id);
				console.log(getUserId(boy?._id.toString()));
				io.to(getUserId(boy?._id)).emit("new-order", d);
			}
		})();
	});

	socket.on("get_order_status", (d) => {
		let orderId = d.order._id;

		io.to(orderId).emit("give_order_status", d);
	});

	socket.on("send_order_status", (d) => {
		let orderId = d.order._id;
		io.to(orderId).emit("take_order_status", d);
	});

	/*
	 * Delivery Boy's Events
	 */

	// join user order
	socket.on("join-user-order", (d) => {
		let orderId = d.order._id;
		socket.join(orderId);
	});

	//user will create an order
	// socket.on("order", (order_id) => {
	// 	socket.join(order_id);
	// 	console.log("user created and order room", order_id);

	// 	/*
	// 	 * notify a near by delivery boy
	// 	 */

	// 	// io.to(order_id).emit("ev")

	// 	socket.on("boy_accepted", (data) => {
	// 		console.log(
	// 			`${data.data.name} has accepted your Order, and he's your delivery Partner`,
	// 		);
	// 		io.to(order_id).emit("order_accepted", {
	// 			message: `${data.data.name} has accepted your Order, and he's your delivery Partner`,
	// 		});
	// 	});

	// 	socket.on("boy_status", (data) => {
	// 		console.log(`${data.data.name} is near ${data.data.location}`);
	// 		io.to(order_id).emit("order_status", {
	// 			message: `${data.data.name} is near ${data.data.location}`,
	// 		});
	// 	});

	// 	// socket.rooms.delete(invoice_id);
	// 	// socket.leave(invoice_id);

	// 	// io.to(invoice_id).emit("invoice_status", {
	// 	//     status: false,
	// 	//     id: invoice_id,
	// 	// });
	// });

	socket.on("disconnect", (history) => {
		io.emit("disconnected", "user gone");
	});
});

io.listen(4009);
