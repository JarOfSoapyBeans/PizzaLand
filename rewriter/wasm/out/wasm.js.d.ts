// Type declarations matching the wasm.js runtime wrapper
export interface JsRewriterOutput {
  js: any;
  map: Uint8Array | null;
  scramtag: string;
  errors: string[];
}

export interface RewriterOptions {
  config?: any;
  shared?: any;
  flagEnabled?: any;
  codec?: any;
}

export class Rewriter {
  constructor(opts: RewriterOptions);
  rewrite_js(input: string, base: string, source: string, module: boolean): JsRewriterOutput;
  rewrite_js_bytes(input: Uint8Array, base: string, source: string, module: boolean): JsRewriterOutput;
}

export function initSync(opts: { module: WebAssembly.Module }): void;

export {};
