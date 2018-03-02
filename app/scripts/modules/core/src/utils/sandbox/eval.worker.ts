// tslint:disable:no-eval
self.onmessage = (e: MessageEvent) => {
  'use strict';
  const ctx: Worker = self as any;
  if (e.data.context && e.data.expression) {
    let toEval = '';

    Object.keys(e.data.context).forEach(k => {
      toEval += `var ${k} = ${JSON.stringify(e.data.context[k])};\n`;
    });
    toEval += ` !!(${e.data.expression})`;
    ctx.postMessage({
      id: e.data.id,
      result: eval(toEval)
    });
  } else {
    ctx.postMessage({
      id: e.data.id,
      result: false,
    });
  }
  return;
};
