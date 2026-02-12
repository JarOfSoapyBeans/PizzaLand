
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
