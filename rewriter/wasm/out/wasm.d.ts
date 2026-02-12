
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
