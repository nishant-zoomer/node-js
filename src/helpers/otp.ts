const { default: axios } = require("axios");
const _crypto = require("crypto");
import config from "@config/env";
/**
 * Generate password from allowed word
 */
const digits = "123456789";
const alphabets = "abcdefghijklmnopqrstuvwxyz";
const upperCase = alphabets.toUpperCase();
const specialChars = "#!&@";
const key = config.secret;

function rand(min: number, max: number) {
	const random = Math.random();
	return Math.floor(random * (max - min) + min);
}

export default {
	/**
	 * Generate OTP of the length
	 * @param  {number} length length of password.
	 * @param  {object} options
	 * @param  {boolean} options.digits Default: `true` true value includes digits in OTP
	 * @param  {boolean} options.alphabets Default: `false` true value includes alphabets in OTP
	 * @param  {boolean} options.upperCase Default: `false` true value includes upperCase in OTP
	 * @param  {boolean} options.specialChars Default: `false` true value includes specialChars in OTP
	 */
	generate: function (length: any, options: any) {
		length = length || 10;
		const generateOptions = options || {};

		generateOptions.digits = Object.prototype.hasOwnProperty.call(
			generateOptions,
			"digits",
		)
			? options.digits
			: true;
		generateOptions.alphabets = Object.prototype.hasOwnProperty.call(
			generateOptions,
			"alphabets",
		)
			? options.alphabets
			: false;
		generateOptions.upperCase = Object.prototype.hasOwnProperty.call(
			generateOptions,
			"upperCase",
		)
			? options.upperCase
			: false;
		generateOptions.specialChars = Object.prototype.hasOwnProperty.call(
			generateOptions,
			"specialChars",
		)
			? options.specialChars
			: false;

		const allowsChars =
			((generateOptions.digits || "") && digits) +
			((generateOptions.alphabets || "") && alphabets) +
			((generateOptions.upperCase || "") && upperCase) +
			((generateOptions.specialChars || "") && specialChars);
		let password = "";
		while (password.length < length) {
			if (password.length == 1 && password == "0") {
				password = "1";
			}
			const charIndex = rand(0, allowsChars.length - 1);
			password += allowsChars[charIndex];
		}
		return password.toString();
	},

	hash(phone: any, otp: any, expiresAfter = 1, algorithm = "sha256") {
		otp = otp.toString();
		const ttl = expiresAfter * 60 * 1000; //Expires after in Minutes, converteed to miliseconds
		const expires = Date.now() + ttl; //timestamp to 1 minutes in the future
		const data = `${phone}.${otp}.${expires}`; // phone.otp.expiry_timestamp
		const hashBase = _crypto
			.createHmac(algorithm, key)
			.update(data)
			.digest("hex"); // creating SHA256 hash of the data
		// Hash.expires, format to send to the user
		// you have to implement the function to send SMS yourself. For demo purpose. let's assume it's called sendSMS
		return `${hashBase}.${expires}`;
	},

	verify(phone: any, otp: any, hash: any, algorithm = "sha256") {
		otp = otp.toString();
		if (!hash.match(".")) return false; // Hash should have at least one dot
		// Separate Hash value and expires from the hash returned from the user(
		let [hashValue, expires] = hash.split(".");
		// Check if expiry time has passed
		let now = Date.now();
		if (now > expires) return false;
		// Calculate new hash with the same key and the same algorithm
		let data = `${phone}.${otp}.${expires}`;
		let newCalculatedHash = _crypto
			.createHmac(algorithm, key)
			.update(data)
			.digest("hex");
		// Match the hashes
		return newCalculatedHash === hashValue;
	},

	sendSms: async (mobile: any, otp: any) => {
		try {
			const url = `https://bulksms.analyticsmantra.com/sendsms/sendsms.php?username=SUNSURRYA&password=tech321&type=TEXT&sender=MMSTER&mobile=${mobile}&message=Use%20${otp}%20as%20OTP%20to%20login%20into%20MyMaster11&PEID=1201161650796863916&HeaderId=1205161650964871534&templateId=1207161736910206136`;
			const testUrl = "https://gorest.co.in/public/v2/users/100/posts";

			let response = await axios.get(url);
			console.log(response.data);
			return response.data;
		} catch (err) {
			console.log("Error in SMS Sending API: " + err);
		}
	},
	sendAppLink: async (mobile: any) => {
		try {
			let Text =
				"Download the exciting gaming app MyMaster11 from " +
				" and get a Cash Bonus of ₹100";
			let shareText = encodeURI(Text);

			const url = `https://bulksms.analyticsmantra.com/sendsms/sendsms.php?username=SUNSURRYA&password=tech321&type=TEXT&sender=MMSTER&mobile=${mobile}&message=${shareText}&PEID=1201161650796863916&HeaderId=1205161650964871534&templateId=1207161736910206136`;
			const testUrl = "https://gorest.co.in/public/v2/users/100/posts";

			let response = await axios.get(url);
			console.log(response.data);
			return response.data;
		} catch (err) {
			console.log("Error in SMS Sending API: " + err);
		}
	},
};
