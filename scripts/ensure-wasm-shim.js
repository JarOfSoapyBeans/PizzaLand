#!/usr/bin/env node
// Ensure wasm shim files exist for build compatibility
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../rewriter/wasm/out");
if (!fs.existsSync(outDir)) {
	fs.mkdirSync(outDir, { recursive: true });
}

const wasmJs = path.join(outDir, "wasm.js");
if (!fs.existsSync(wasmJs)) {
	fs.writeFileSync(
		wasmJs,
		`
export function initSync(buffer) {
  throw new Error('WASM shim: initSync called but real wasm module not available');
}

export class Rewriter {
  rewrite_js(js, url) {
    throw new Error('WASM shim: rewrite_js called but real wasm module not available');
  }
  rewrite_js_bytes(js, url) {
    throw new Error('WASM shim: rewrite_js_bytes called but real wasm module not available');
  }
}

export function rewrite_js(js, url) {
  throw new Error('WASM shim: rewrite_js called but real wasm module not available');
}

export function rewrite_js_bytes(js, url) {
  throw new Error('WASM shim: rewrite_js_bytes called but real wasm module not available');
}
`
	);
}

const wasmDts = path.join(outDir, "wasm.d.ts");
if (!fs.existsSync(wasmDts)) {
	fs.writeFileSync(
		wasmDts,
		`
export interface Rewriter {
  rewrite_js(js: string, url: string): any;
  rewrite_js_bytes(js: Uint8Array, url: string): any;
}

export function initSync(buffer: ArrayBuffer): void;
export function rewrite_js(js: string, url: string): any;
export function rewrite_js_bytes(js: Uint8Array, url: string): any;

export interface JsRewriterOutput {
  code: string;
}
`
	);
}

console.log("✓ WASM shim files ensured.");
