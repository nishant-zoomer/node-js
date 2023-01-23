import express from "express";
import cn from "@users/controllers/product";
import fileUpload from "express-fileupload";
const router = express.Router();

router.get("/test", cn.test);

router.get("/", cn.list);
router.get("/my", cn.myList);

router.get("/search/:text", cn.search);

router.get("/:_id", cn.show);

router.use(fileUpload());

router.post("/add-product", cn.add);

export default router;
