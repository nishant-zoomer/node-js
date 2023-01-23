import ioredis from "ioredis";

// class CustomRedis extends Redis {
// 	jsonGet?: any;
// 	jsonSet?: any;
// }

// const redis: any = new ioredis();

// redis.getJson = async function (key: string) {
// 	let data: any = await redis.get(key);
// 	return JSON.parse(data);
// };

// redis.setJson = async function (key: string, value: any) {
// 	return await redis.set(key, JSON.stringify(value));
// };
const redis: any = {};

export default redis;
