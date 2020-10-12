'use strict';
const { getCallingIdentifier, getVariableInScope } = require('../utils/utils');
const { get } = require('lodash');

/**
 * No slashes in string literals passed to API.one() / API.all()
 *
 * @version 0.1.0
 * @category
 */
const rule = function (context) {
  return {
    CallExpression: function (node) {
      const { callee = {}, arguments: args = [] } = node;

      // .one() or .all()
      const propertyName = (callee.property && callee.property.name) || '';
      if (propertyName !== 'one' && propertyName !== 'all') {
        // console.log('not one or all');
        return;
      }

      // API.all('ok').one('ok', 'foo/bad', 'ok')
      // ^^^
      if ((getCallingIdentifier(node) || {}).name !== 'API') {
        // console.log(getCallingIdentifier(callee));
        // console.log('calling identifier not API');
        return;
      }

      // Get the source code and trigger the lint violation if any forward slashes are found in any of the args
      // This isn't 100% accurate, but it's good enough.
      const hasSlash = args.some((arg) => {
        //  Check if the arg expression has a / anywhere, i.e.:
        // .one(prevArg, 'foo/bar', nextarg)
        // .one(prevArg, 'foo/' + barid, nextarg)
        // .one(prevArg, `foo/${barid}`, nextarg)
        const text = context.getSourceCode().getText(arg);
        if (text.includes('/')) {
          return true;
        }

        // Check if the arg is a variable, and check if that variable was initialized with a slash somewhere
        const variable = getVariableInScope(context, arg);
        return variable && context.getSourceCode().getText(variable.init).includes('/');
      });

      if (!hasSlash) {
        // console.log('no slashes');
        return;
      }

      const message =
        `Do not include slashes in API.one() or API.all() calls because arguments to .one() and .all() get url encoded.` +
        `Instead, of API.one('foo/bar'), split into multiple arguments: API.one('foo', 'bar').`;

      const fix = (fixer) => {
        // within:
        //   API.one('foo/bad')
        // replaces:
        //   'foo/bad'
        // with:
        //   'foo', 'bad'
        const literalArgFixes = args
          .filter((arg) => arg.type === 'Literal' && arg.value.includes('/'))
          .map((arg) => {
            const varArgs = arg.value
              .split('/')
              .map((segment) => "'" + segment + "'")
              .join(', ');
            return fixer.replaceText(arg, varArgs);
          });

        // within:
        //   let myVar = 'foo/bad';
        //   API.one(myVar)
        // replaces argument:
        //   myVar
        // with:
        //   ...myVar.split('/')
        // i.e.:
        //   API.one(...myVar.split('/'))
        const variableArgFixes = args
          .filter((arg) => {
            const variable = getVariableInScope(context, arg);
            const initializer = get(variable, 'defs[0].node.init', null);
            // Gets the source code string of the actual variable initializer
            // This includes any string concatenation, template string, or function calls
            const initSource = initializer ? context.getSourceCode().getText(initializer) : '';
            return arg.type === 'Identifier' && variable && initSource.includes('/');
          })
          .map((arg) => {
            const spread = `...${arg.name}.split('/')`;
            return fixer.replaceText(arg, spread);
          });

        return literalArgFixes.concat(variableArgFixes);
      };
      context.report({ fix, node, message });
    },
  };
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: ``,
    },
    fixable: 'code',
  },
  create: rule,
};
