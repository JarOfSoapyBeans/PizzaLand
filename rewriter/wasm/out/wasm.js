// Minimal shim for development when the real wasm build is missing.
// The real build creates a JS wrapper and a .wasm file in this folder.
export function initSync(_opts) {
  // no-op during build; runtime code should provide REWRITERWASM or call asyncSetWasm
  // If initSync is called without a real wasm module, subsequent Rewriter usage will throw.
  return;
}

export class Rewriter {
  constructor(_opts) {
    throw new Error(
      "Rewriter wasm shim used: real wasm build not found. Run `npm run rewriter:build` or provide REWRITERWASM/WASM at runtime."
    );
  }
}

// Export a placeholder type-like object for JS imports that expect it.
export const __IS_WASM_SHIM = true;
