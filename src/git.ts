import simplegit from "simple-git";
const git = simplegit();

(async () => {
	const status = await git.status();
	console.log("🚀 ~ file: git.ts:6 ~ status", status);
	const add = await git.add(".");
	console.log("🚀 ~ file: git.ts:8 ~ add", add);
	const commit = await git.commit("new commit");
	console.log("🚀 ~ file: git.ts:10 ~ commit", commit);
	const push = await git.push("origin", "main");
	console.log("🚀 ~ file: git.ts:10 ~ push", push);
})();
