import express, { Request, Response } from "express";
import { asyncWrapper, R } from "@helpers/response-helpers";
import Joi from "joi";
import User from "@model/User";
import { sendSms } from "@helpers/common";
import redis from "@db/redis";
import otp from "@helpers/otp";
import Product from "@model/Product";
import { UploadedFile } from "express-fileupload";
import path from "path";
import { UserAuthRequest } from "@middleware/auth";
import models from "@model/models";
import fs from 'fs'
import { log, readLog } from "@helpers/logger";

export default {
	test: asyncWrapper(async (req: Request, res: Response) => {
		await log.odds("SHE SAID YES");

		return R(res, true, "SHE SAID YES", {});
	}),
	logs: asyncWrapper(async (req: Request, res: Response) => {
		await readLog(res, 'odds');
	}),
};
