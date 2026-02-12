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
}

const wasmDts = path.join(outDir, "wasm.d.ts");
if (!fs.existsSync(wasmDts)) {
	fs.writeFileSync(
		wasmDts,
		`
export interface JsRewriterOutput {
  js: Uint8Array | string;
  map: string | null;
  scramtag: string;
  errors: any[];
}

export interface RewriterConfig {
  config: any;
  shared: any;
  flagEnabled: (flag: string, base: any) => boolean;
  codec: {
    encode: (str: string) => string;
    decode: (str: string) => string;
  };
}

export class Rewriter {
  constructor(config: RewriterConfig);
  rewrite_js(
    code: string,
    url: string,
    source: string,
    module: any
  ): JsRewriterOutput;
  rewrite_js_bytes(
    code: Uint8Array,
    url: string,
    source: string,
    module: any
  ): JsRewriterOutput;
}

export function initSync(config: { module: WebAssembly.Module }): void;
export function rewrite_js(code: string, url: string): JsRewriterOutput;
export function rewrite_js_bytes(code: Uint8Array, url: string): JsRewriterOutput;
`
	);
}

console.log("✓ WASM shim files ensured.");
