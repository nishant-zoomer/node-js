import dotenv from "dotenv";
dotenv.config();
import simplegit from "simple-git";
import chilprocess from "child_process";
const git = simplegit({ config: [] });

(async () => {
	const USER = "harshuuu18";
	const PASS = process.env.GIT_USER_TOKEN || "";
	const REPO = "github.com/nishant-zoomer/node-js";

	const remote = `https://${USER}:${PASS}@${REPO}`;

	console.log("🚀 ~ file: pull.ts:11 ~ remote", remote);

	const stash = await git.stash();
	console.log("🚀 ~ file: pull.ts:7 ~ stash", stash);

	const pull = await git.pull(remote, "main");
	console.log("🚀 ~ file: pull.ts:9 ~ pull", pull);

	chilprocess.exec("npm run permission", (err) => {
		if (!err) {
			chilprocess.exec("npm run build", (err) => {
				chilprocess.exec("pm2 reload all");
			});
		}
	});
})();
