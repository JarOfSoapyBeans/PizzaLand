
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
