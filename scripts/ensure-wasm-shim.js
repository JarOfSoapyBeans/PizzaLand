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
fs.writeFileSync(
	wasmJs,
	`
export function initSync(config) {
  // Shim: real wasm initialization not available at build time
  globalThis.__rewriterWasmInitialized = true;
}

export class Rewriter {
  constructor(config) {
    this.config = config;
  }

  rewrite_js(code, url, source, module) {
    throw new Error(
      'WASM shim: Rewriter.rewrite_js called but real wasm module not loaded. ' +
      'This is expected at build/TS check time. At runtime, use the real wasm module.'
    );
  }

  rewrite_js_bytes(code, url, source, module) {
    throw new Error(
      'WASM shim: Rewriter.rewrite_js_bytes called but real wasm module not loaded. ' +
      'This is expected at build/TS check time. At runtime, use the real wasm module.'
    );
  }
}

export function rewrite_js(code, url) {
  throw new Error('WASM shim: rewrite_js stub');
}

export function rewrite_js_bytes(code, url) {
  throw new Error('WASM shim: rewrite_js_bytes stub');
}
`
);

const wasmDts = path.join(outDir, "wasm.d.ts");
fs.writeFileSync(
	wasmDts,
	`
export interface JsRewriterOutput {
  js: Uint8Array;
  map: any;
  scramtag: string;
  errors: any[];
}

export interface RewriterConfig {
  config: any;
  shared: any;
  flagEnabled: any;
  codec: any;
}

export class Rewriter {
  constructor(config: RewriterConfig);
  rewrite_js(code: any, url: any, source: any, module: any): JsRewriterOutput;
  rewrite_js_bytes(code: any, url: any, source: any, module: any): JsRewriterOutput;
}

export function initSync(config: any): void;
export function rewrite_js(code: any, url: any): JsRewriterOutput;
export function rewrite_js_bytes(code: any, url: any): JsRewriterOutput;
`
);

console.log("✓ WASM shim files ensured.");
