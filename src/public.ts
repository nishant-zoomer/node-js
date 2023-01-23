import express from "express";

const app = express();
const PORT = 4003;
app.use(express.static(process.cwd() + "/files"));

app.get("*", (req, res) => {
	return res.redirect("/404.png");
});
app.listen(PORT, () => {
	console.log(`Listening On PORT ${PORT}`);
});
