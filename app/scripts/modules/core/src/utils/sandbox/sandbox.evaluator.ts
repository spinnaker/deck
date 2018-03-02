import Evaluator = require('worker-loader!./eval.worker');

let counter = 0;
const resolves: {[key: number]: Function} = {};

/**
 * Allows evaluation of arbitrary JS expression, run within a supplied context
 * @param {string} expression the expression to evaluate; the result will be coerced to a boolean, e.g.
 *    "parameters.region === 'us-east-1'"
 * @param context the context to be made available to the expression, e.g.
 *   { parameters: { region: 'us-east-1' } }
 * @return {Promise<boolean>}
 */
export const evaluate = (expression: string, context: any): Promise<boolean> => {
  const evaluator = new Evaluator();
  counter++;
  const result = new Promise<boolean>((resolve) => {
    resolves[counter] = resolve;
  });

  evaluator.postMessage({ id: counter, expression, context });
  evaluator.addEventListener('message', (e: MessageEvent) => {
    resolves[e.data.id](e.data.result === true);
    delete resolves[e.data.id];
  });

  return result;
};
