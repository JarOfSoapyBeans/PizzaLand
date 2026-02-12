
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
