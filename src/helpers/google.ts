import { OAuth2Client } from "google-auth-library";
import env from "@config/env";

const client = new OAuth2Client(env.google.client_id);

export async function verify(token: any): Promise<any> {
	try {
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: env.google.client_id, // Specify the CLIENT_ID of the app that accesses the backend
			// Or, if multiple clients access the backend:
			//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
		});
		const payload = ticket.getPayload();

		if (!payload) {
			return null;
		}
		const userid = payload["sub"];
		return payload;
		// If request specified a G Suite domain:
		// const domain = payload['hd'];
	} catch (err) {
		console.log(err);
		return err;
	}
}

// {
// 	iss: 'https://accounts.google.com',
// 	azp: '746901103264-3tv44a0uh1mujl94hf13ukf512m4496t.apps.googleusercontent.com',
// 	aud: '746901103264-knc71fg51qvbig6vmimjogofjcmu4jv3.apps.googleusercontent.com',
// 	sub: '101440695783254684738',
// 	email: 'harshraj.swami1@gmail.com',
// 	email_verified: true,
// 	name: 'Harsh Raj Swami',
// 	picture: 'https://lh3.googleusercontent.com/a/AEdFTp4mW_O5ZOH7fC4ZSupDFBLWPagyYUbLBLXOBYyC=s96-c',
// 	given_name: 'Harsh Raj',
// 	family_name: 'Swami',
// 	locale: 'en',
// 	iat: 1674279414,
// 	exp: 1674283014
//   }

export interface GoogleLoginData {
	iss: "https://accounts.google.com";
	nbf: 1657717895;
	aud: "1027287126016-7sspf54kahiag1renibpt9vnvi7nph84.apps.googleusercontent.com";
	sub: "105923223757405800131";
	email: "harsh.dqot@gmail.com";
	email_verified: true;
	azp: "1027287126016-7sspf54kahiag1renibpt9vnvi7nph84.apps.googleusercontent.com";
	name: "harsh raj";
	picture: "https://lh3.googleusercontent.com/a/AItbvml0Bnstraa4CW4Jq3pLATkAZKaWhqhyFMWXwitD=s96-c";
	given_name: "harsh";
	family_name: "raj";
	iat: 1657718195;
	exp: 1657721795;
	jti: "416e52c3bff460b96d71b16aa924887ef58fb794";
}
