import express, { Request, Response } from "express";
import path from "path";

const router = express.Router();
router.use("/public", express.static(path.join(process.cwd() + "/files")));

router.use("/public/*", (req, res) => {
	console.log(process.cwd() + "/files");
	res.redirect("/public/404.png");
});

export default router;
