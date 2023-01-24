import simplegit from "simple-git";
const git = simplegit();

(async () => {
	const USER = "harshuuu18";
	const PASS =
		"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";
	const REPO = "github.com/nishant-zoomer/node-js";

	const remote = `https://${USER}:${PASS}@${REPO}`;

	const status = await git.status();
	console.log("🚀 ~ file: git.ts:6 ~ status", status);
	const add = await git.add(".");
	console.log("🚀 ~ file: git.ts:8 ~ add", add);
	const commit = await git.commit("order list api added");
	console.log("🚀 ~ file: git.ts:10 ~ commit", commit);
	const push = await git.push(remote, "main");
	console.log("🚀 ~ file: git.ts:10 ~ push", push);
})();
