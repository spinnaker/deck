'use strict';
// @ts-check

/**
 * Migrate REST().path('foo', 'bar').path('baz').get() to REST('/foo/bar/baz').get()
 *
 * @typedef {import('estree').Arg} CallExpression
 * @typedef {import('estree').Literal} Literal
 * @typedef {import('estree').ImportSpecifier} ImportSpecifier
 */

const _ = require('lodash/fp');

const { getNodeType, getCallChain, getCallingIdentifierName } = require('../utils/utils');
const getCallName = _.get('callee.property.name');

/** @type {RuleModule} */
module.exports = {
  create(context) {
    return {
      /**
       * Look for chains of CallExpressions that are part of a REST().path() call
       * @param node {CallExpression}
       */
      CallExpression(node) {
        const callingIdentifierName = getCallingIdentifierName(node);
        if (node.parent.type === 'MemberExpression' || callingIdentifierName !== 'REST') {
          return undefined;
        }

        // an array of CallExpressions, i.e. for API.one().all().get() -> [.one, .all, .get]
        const callChain = getCallChain(node);

        // Look for a REST().path().whatever() call
        if (!callChain[1] || getCallName(callChain[1]) !== 'path') {
          return;
        }

        /** @type {CallExpression} */
        const restCall = callChain[0];
        /** @type {CallExpression} */
        const pathCall = callChain[1];
        /** @type {Literal} */
        const restArg = restCall.arguments[0];
        /** @type {Literal} */
        const firstPathArg = pathCall.arguments[0];

        // Only REST('literal').path('literal', ...)
        // Ignores: REST(variable) and REST().path(variable)
        if ((restArg && restArg.type !== 'Literal') || getNodeType(firstPathArg) !== 'Literal') {
          return undefined;
        }

        const message = `Prefer REST('/foo/bar') over REST().path('foo', 'bar')`;

        function fix(fixer) {
          const fixes = [];
          const restCallEnd = restCall.range[1];
          if (restArg) {
            // REST('/foo').path('bar')
            // Join '/foo' and '/bar' and replace the rest arg
            // REST('/foo/bar').path('bar');
            fixes.push(fixer.replaceText(restArg, `'${restArg.value}/${firstPathArg.value}'`));
          } else {
            // REST().path('foo')
            // Insert text between the parentheses
            // REST('foo').path('foo');
            fixes.push(fixer.insertTextAfterRange([restCallEnd - 1, restCallEnd - 1], `'/${firstPathArg.value}'`));
          }

          if (pathCall.arguments.length === 1) {
            // REST('foo').path('foo');
            // Remove the entire .path() call
            // REST('foo');
            fixes.push(fixer.removeRange([restCallEnd, pathCall.range[1]]));
          } else {
            /** @type {Literal} */
            const secondPathArg = pathCall.arguments[1];
            // Remove the first .path() call argument
            fixes.push(fixer.removeRange([firstPathArg.range[0], secondPathArg.range[0]]));
          }

          return fixes;
        }

        context.report({ node, message, fix });
      },
    };
  },
  meta: {
    fixable: 'code',
    type: 'problem',
    docs: {
      description: 'Migrate from API.xyz() to REST(path)',
      recommended: 'error',
    },
  },
};
