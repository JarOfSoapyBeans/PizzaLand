// Dev server imports
import { createBareServer } from "@nebula-services/bare-server-node";
import { createServer } from "http";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { join } from "node:path";
import rspackConfig from "./rspack.config.js";
import { rspack } from "@rspack/core";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

//transports
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { bareModulePath } from "@mercuryworkshop/bare-as-module3";
import { chmodSync, mkdirSync, writeFileSync } from "fs";

const bare = createBareServer("/bare/", {
	logErrors: true,
	blockLocal: false,
});

wisp.options.allow_loopback_ips = true;
wisp.options.allow_private_ips = true;

const fastify = Fastify({
	serverFactory: (handler) => {
		return createServer()
			.on("request", (req, res) => {
				// Conditional COOP/COEP: enable only when explicitly requested
				if (process.env.ENABLE_COOP === "1") {
					res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
					res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
				}

				// Simple CORS support configurable via CORS_ORIGIN env var.
				// If CORS_ORIGIN is set, use it; otherwise reflect request origin or allow all.
				const origin = req.headers.origin;
				if (process.env.CORS_ORIGIN) {
					res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN);
				} else if (origin) {
					res.setHeader("Access-Control-Allow-Origin", origin);
					res.setHeader("Vary", "Origin");
				} else {
					res.setHeader("Access-Control-Allow-Origin", "*");
				}
				res.setHeader(
					"Access-Control-Allow-Methods",
					"GET,POST,PUT,PATCH,DELETE,OPTIONS"
				);
				res.setHeader(
					"Access-Control-Allow-Headers",
					"Content-Type, Authorization"
				);
				res.setHeader("Access-Control-Allow-Credentials", "true");

				// Handle preflight quickly
				if (req.method === "OPTIONS") {
					res.writeHead(204);
					res.end();
					return;
				}

				if (bare.shouldRoute(req)) {
					bare.routeRequest(req, res);
				} else {
					handler(req, res);
				}
			})
			.on("upgrade", (req, socket, head) => {
				if (bare.shouldRoute(req)) {
					bare.routeUpgrade(req, socket, head);
				} else {
					wisp.routeRequest(req, socket, head);
				}
			});
	},
});

fastify.register(fastifyStatic, {
	root: join(fileURLToPath(new URL(".", import.meta.url)), "./static"),
	decorateReply: false,
});
fastify.register(fastifyStatic, {
	root: join(fileURLToPath(new URL(".", import.meta.url)), "./dist"),
	prefix: "/scram/",
	decorateReply: false,
});
fastify.register(fastifyStatic, {
	root: join(fileURLToPath(new URL(".", import.meta.url)), "./assets"),
	prefix: "/assets/",
	decorateReply: false,
});
fastify.register(fastifyStatic, {
	root: baremuxPath,
	prefix: "/baremux/",
	decorateReply: false,
});
fastify.register(fastifyStatic, {
	root: epoxyPath,
	prefix: "/epoxy/",
	decorateReply: false,
});
fastify.register(fastifyStatic, {
	root: libcurlPath,
	prefix: "/libcurl/",
	decorateReply: false,
});
fastify.register(fastifyStatic, {
	root: bareModulePath,
	prefix: "/baremod/",
	decorateReply: false,
});

// Simple test endpoint for Neocities
fastify.get("/api/test", async (request, reply) => {
	return {
		ok: true,
		timestamp: new Date().toISOString(),
		message:
			"Backend is working! This is a response from your Codespace server.",
		from: "Scramjet Codespace Backend",
	};
});

fastify.options("/api/test", async (request, reply) => {
	reply.code(200).send("OK");
});

fastify.options("/api/tunnel", async (request, reply) => {
	reply.code(200).send("OK");
});

fastify.options("/api/tunnel/stop", async (request, reply) => {
	reply.code(200).send("OK");
});

fastify.options("/api/tunnel/status", async (request, reply) => {
	reply.code(200).send("OK");
});

// cloudflared tunnel management
let tunnelProcess = null;
let tunnelUrl = null;

async function startCloudflaredTunnel(localPort, timeoutMs = 10000) {
	if (tunnelProcess) {
		return { url: tunnelUrl, alreadyRunning: true };
	}

	const bin =
		process.env.CLOUDFLARED_BIN || process.env.HOME + "/bin/cloudflared";
	const args = ["tunnel", "--url", `http://localhost:${localPort}`];

	const cp = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
	tunnelProcess = cp;
	tunnelUrl = null;

	return await new Promise((resolve, reject) => {
		let finished = false;
		const onError = (err) => {
			if (finished) return;
			finished = true;
			tunnelProcess = null;
			tunnelUrl = null;
			reject(err);
		};

		const onSuccess = (url) => {
			if (finished) return;
			finished = true;
			tunnelUrl = url;
			resolve({ url, alreadyRunning: false });
		};

		const timer = setTimeout(() => {
			if (!finished) {
				if (tunnelUrl) onSuccess(tunnelUrl);
				else onError(new Error("timed out waiting for cloudflared URL"));
			}
		}, timeoutMs);

		const handleData = (chunk) => {
			const s = String(chunk);
			// match quick tunnel URLs more precisely (must contain trycloudflare)
			const m = s.match(/https?:\/\/([\w-]+\.)?trycloudflare\.com\/?/i);
			if (m && m[0]) {
				clearTimeout(timer);
				onSuccess(m[0].trim());
			}
		};

		cp.stdout.on("data", handleData);
		cp.stderr.on("data", handleData);

		cp.on("exit", (code) => {
			if (finished) return;
			clearTimeout(timer);
			finished = true;
			tunnelProcess = null;
			tunnelUrl = null;
			reject(new Error("cloudflared exited with code " + code));
		});
		cp.on("error", onError);
	});
}

function stopCloudflaredTunnel() {
	if (!tunnelProcess) return false;
	try {
		tunnelProcess.kill();
	} catch {}
	tunnelProcess = null;
	tunnelUrl = null;
	return true;
}

fastify.post("/api/tunnel", async (request, reply) => {
	try {
		const { url, alreadyRunning } = await startCloudflaredTunnel(
			process.env.PORT ? parseInt(process.env.PORT) || 1337 : 1337,
			15000
		);
		return { ok: true, url, alreadyRunning };
	} catch (err) {
		reply.code(500);
		return { ok: false, error: String(err) };
	}
});

fastify.post("/api/tunnel/stop", async (request, reply) => {
	const stopped = stopCloudflaredTunnel();
	return { ok: true, stopped };
});

fastify.get("/api/tunnel/status", async (request, reply) => {
	return { ok: true, running: !!tunnelProcess, url: tunnelUrl };
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) || 1337 : 1337;

async function startServer() {
	let port = PORT;
	const maxAttempts = 5;
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		try {
			await fastify.listen({ port, host: "0.0.0.0" });
			console.log(`Listening on http://localhost:${port}/`);
			return;
		} catch (err) {
			if (err && err.code === "EADDRINUSE") {
				console.warn(`Port ${port} in use, trying ${port + 1}`);
				port += 1;
				continue;
			}
			console.error("Failed to start server:", err);
			process.exit(1);
		}
	}
	console.error(`Unable to bind to a port after ${maxAttempts} attempts.`);
	process.exit(1);
}

startServer();

process.on("uncaughtException", (err) => {
	console.error("Uncaught exception:", err && err.stack ? err.stack : err);
	process.exit(1);
});
process.on("unhandledRejection", (reason) => {
	console.error("Unhandled promise rejection:", reason);
});

fastify.setNotFoundHandler((request, reply) => {
	console.error("PAGE PUNCHED THROUGH SW - " + request.url);
	reply.code(593).send("punch through");
});
// console.log is handled by startServer()
if (!process.env.CI) {
	try {
		writeFileSync(
			".git/hooks/pre-commit",
			"pnpm format\ngit update-index --again"
		);
		chmodSync(".git/hooks/pre-commit", 0o755);
	} catch {}

	const compiler = rspack(rspackConfig);
	compiler.watch({}, (err, stats) => {
		console.log(
			stats
				? stats.toString({
						preset: "minimal",
						colors: true,
						version: false,
					})
				: ""
		);
	});
}
