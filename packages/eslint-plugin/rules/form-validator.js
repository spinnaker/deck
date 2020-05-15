'use strict';

const { get, isNil, isEqual } = require('lodash');

const matchPaths = criteria => arg =>
  criteria.every(([path, expected]) => {
    const value = get(arg, path);
    if (typeof expected === 'function') {
      return expected(value);
    } else {
      return isEqual(value, expected);
    }
  });

function findEnclosingBlock(node) {
  // find enclosing block
  let block = node;
  while (block && block.parent && block.type !== 'BlockStatement') {
    block = block.parent;
  }
  return block;
}

/**
 * A codemod rule to migrate to a new FormValidator api
 *
 * @version 0.0.1
 * @category codemod
 */
const rule = function(context) {
  const blocks = new Map();
  return {
    NewExpression: function(node) {
      // locate and keep track of new FormValidator()
      const matches = matchPaths([
        ['type', 'NewExpression'],
        ['callee.name', 'FormValidator'],
        ['arguments[0].name', val => !isNil(val)],
      ])(node);

      if (matches) {
        const valuesVariable = node.arguments[0].name;
        const args = node.arguments;
        const block = findEnclosingBlock(node);
        if (block) {
          blocks.set(block, { valuesVariable, args });
        }
      }
    },

    CallExpression: function(node) {
      // Find .validateForm() calls that match a new FormValidator(values)
      // Migrate to new FormValidator().validateForm(values)
      function checkValidateFormCall() {
        const blockData = blocks.get(findEnclosingBlock(node)) || {};
        const { args, valuesVariable } = blockData;

        if (valuesVariable) {
          const message =
            `Migrate from 'new FormValidator(${valuesVariable}).validateForm()' ` +
            `to 'new FormValidator().validate(${valuesVariable})'`;

          const fix = fixer => {
            const pos = node.callee.property.range[1];
            return [
              fixer.replaceText(args[0], ''),
              fixer.insertTextAfterRange([pos + 1, pos + 1], valuesVariable),
              fixer.replaceText(node.callee.property, 'validate'),
            ];
          };
          context.report({ fix, node, message });
        }
      }

      function checkWithValidatorsCall() {
        // Find and remove empty .withValidators() calls
        if (node.arguments.length === 0) {
          const message = `remove empty .withValidators() calls`;
          const fix = fixer => {
            const startDelete = node.callee.object.range[1];
            const endDelete = node.range[1];
            return fixer.replaceTextRange([startDelete, endDelete], '');
          };
          context.report({ fix, node: node.callee.property, message });
        }

        // Find and migrate .withValidators(arrayForEach(itemBuilder => itemBuilder...))
        const bareArg = node.arguments.find(
          matchPaths([
            ['type', 'CallExpression'],
            ['callee.type', 'Identifier'],
            ['callee.name', 'arrayForEach'],
          ]),
        );
        const propertyArg = node.arguments.find(
          matchPaths([
            ['type', 'CallExpression'],
            ['callee.property.type', 'Identifier'],
            ['callee.property.name', 'arrayForEach'],
          ]),
        );
        const match = bareArg || propertyArg;

        // Found an argument that looks like arrayForEach(...)
        if (match) {
          const message = `Migrate from 'validator.withValidators(arrayForEach(v2 => {}) to validator.arrayForEach(v2 => {})`;

          const fix = fixer => {
            const sourceCode = context.getSourceCode();
            // Save the actual arrayForEach code so we can move it
            const arrayForEachText = sourceCode
              .getText()
              .slice(propertyArg ? match.callee.property.range[0] : match.range[0], match.range[1]);
            // Determine how to remove arrayForEach() call from the arguments list
            let [deleteStart, deleteEnd] = match.range;
            const tokenBefore = sourceCode.getTokenBefore(match);
            const tokenAfter = sourceCode.getTokenAfter(match);
            if (tokenAfter.type === 'Punctuator' && tokenAfter.value === ',') {
              // Expand range to delete the comma after the argument, if it exists.
              deleteEnd = tokenAfter.range[1];
            } else if (tokenBefore.type === 'Punctuator' && tokenBefore.value === ',') {
              // Otherwise, expand range to delete the comma before the argument, if it exists.
              deleteStart = tokenBefore.range[0];
            }

            return [
              fixer.replaceTextRange([deleteStart, deleteEnd], ''),
              fixer.insertTextAfter(node, '.' + arrayForEachText),
            ];
          };

          context.report({ fix, node, message });
        }
      }

      // Find and remove all .item('label') calls
      // These calls came from arrayForEach(itemBuilder => itemBuilder.item())
      function checkItemBuilderDotCall() {
        if (get(node, 'callee.object.type') === 'Identifier') {
          const scope = context.getScope(node);
          const identifier = node.callee.object.name;
          const variable = scope.variables.find(v => v.name === identifier);

          const isInForEachBlock = get(variable, 'scope.block.parent.callee.property.name') === 'arrayForEach';
          const firstParam = get(variable, 'scope.block.params[0].name');

          if (isInForEachBlock && firstParam === identifier) {
            const message = `Migrate from itemBuilder to path => new FormValidator(path)`;
            const fix = fixer => {
              const isItemCall = node.callee.property.name === 'item';
              const validatorName = variable.name;
              const params0 = get(variable, 'scope.block.parent.arguments[0].params[0]');
              let newParam0 = 'path';
              while (scope.variables.find(v => v.name === newParam0)) {
                newParam0 += '1'; // heh
              }
              const itemLabel = isItemCall ? context.getSourceCode().getText(node.arguments[0]) : `'Item'`;
              const startDeleteItemCall = node.callee.object.range[1];
              const endDeleteItemCall = node.range[1];

              const statements = variable.scope.block.body.body;
              const firstToken = statements[0];
              const lastToken = context.getLastToken(statements[statements.length - 1]);

              const fixes = [
                // create a new FormValidator
                fixer.insertTextBefore(
                  firstToken,
                  `const ${validatorName} = new FormValidator(${newParam0}, ${itemLabel});\n`,
                ),
                // return it at the end of the callback
                fixer.insertTextAfter(lastToken, `\nreturn ${validatorName};`),
                // Change the first callback parameter to 'path'
                fixer.replaceText(params0, newParam0),
              ];

              if (isItemCall) {
                // Remove the .item()
                fixes.push(fixer.replaceTextRange([startDeleteItemCall, endDeleteItemCall], ''));
              }

              return fixes;
            };
            context.report({ fix, node, message });
          }
        }
      }

      const isItemBuilderDotItem = matchPaths([
        ['callee.type', 'MemberExpression'],
        ['callee.property.name', 'item'],
        ['arguments', args => args.length === 1],
      ])(node);

      const isItemBuilderDotField = matchPaths([
        ['callee.type', 'MemberExpression'],
        ['callee.property.name', 'field'],
        ['arguments', args => args.length === 2],
      ])(node);

      const isValidateFormCall = matchPaths([
        ['callee.type', 'MemberExpression'],
        ['callee.property.name', 'validateForm'],
        ['arguments', []],
      ])(node);

      const isWithValidatorsCall = matchPaths([
        ['callee.type', 'MemberExpression'],
        ['callee.property.type', 'Identifier'],
        ['callee.property.name', 'withValidators'],
      ])(node);

      if (isValidateFormCall) {
        checkValidateFormCall();
      } else if (isWithValidatorsCall) {
        checkWithValidatorsCall();
      } else if (isItemBuilderDotItem || isItemBuilderDotField) {
        checkItemBuilderDotCall();
      }
    },
  };
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: `Helps migrate to new FormValidator API`,
    },
    fixable: 'code',
  },
  create: rule,
};
