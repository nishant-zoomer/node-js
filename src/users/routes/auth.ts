import { asyncWrapper, R } from "@helpers/response-helpers";
import { UserAuthRequest } from "@middleware/auth";
import Address from "@model/Address";
import Employee from "@model/Employee";
import express, { Response } from "express";
import Joi from "joi";
import cn from "@users/controllers/auth";

const { address, banner, home, login: otp, user, test } = cn;

const router = express.Router();

// test
router.get("/test", test.check);

// login
router.post("/social-login", otp.socialLogin);

// user
router.get("/me", user.me);

router.post("/update-me", user.updateMe);
router.post("/update-my-location", user.updateMyLocation);

export default router;
