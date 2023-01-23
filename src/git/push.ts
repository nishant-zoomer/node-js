import simplegit from "simple-git";
const git = simplegit();

(async () => {
	const USER = "harshuuu18";
	const PASS = "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";
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
