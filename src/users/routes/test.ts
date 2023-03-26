import express from "express";
import cn from "@users/controllers/test";
import fileUpload from "express-fileupload";
const router = express.Router();

router.get("/test", cn.test);
router.get("/logs", cn.logs);


export default router;
