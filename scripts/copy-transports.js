import { cpSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const publicDir = join(rootDir, "public");

try {
	// Import transport package paths
	const { epoxyPath } = await import("@mercuryworkshop/epoxy-transport");
	const { libcurlPath } = await import("@mercuryworkshop/libcurl-transport");
	const { bareModulePath } = await import("@mercuryworkshop/bare-as-module3");

	// Copy transports to public
	const transports = [
		{ src: epoxyPath, dest: "epoxy" },
		{ src: libcurlPath, dest: "libcurl" },
		{ src: bareModulePath, dest: "baremod" },
	];

	for (const { src, dest } of transports) {
		const destPath = join(publicDir, dest);
		mkdirSync(destPath, { recursive: true });
		cpSync(src, destPath, { recursive: true, force: true });
		console.log(`✓ Copied ${dest} transport`);
	}

	console.log("✓ All transports copied successfully");
} catch (err) {
	console.error("Failed to copy transports:", err.message);
	process.exit(1);
}
