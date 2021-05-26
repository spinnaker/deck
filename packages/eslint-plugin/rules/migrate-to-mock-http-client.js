'use strict';

// @ts-check

/**
 * Import AST Types from 'estree'
 * @typedef {import('estree').CallExpression} CallExpression
 * @typedef {import('estree').ImportSpecifier} ImportSpecifier
 */

import _ from 'lodash/fp';

import { getProgram } from '../utils/utils';

/** @type {RuleModule} */
module.exports = {
  create(context) {
    const text = (node) => context.getSourceCode().getText(node);

    return {
      /** @param node {CallExpression} */
      CallExpression(node) {
        /** it(() => {}) */
        const isItBlock = node.callee.type === 'Identifier' && node.callee.name === 'it';

        if (isItBlock) {
          const itBlockText = text(node);
          const testFunction = node.arguments[1];

          const doesFunctionIncludeHttpBackend = !!testFunction && itBlockText.includes('$httpBackend');

          if (doesFunctionIncludeHttpBackend) {
            const isFirstArgAFunction = ['FunctionExpression', 'ArrowFunctionExpression'].includes(testFunction.type);

            if (isFirstArgAFunction) {
              // Fix 1: make the test 'async'
              if (testFunction.async !== true) {
                return context.report({
                  node,
                  message: 'Migrate to MockHttpClient (step 1): make test function async',
                  fix: (fixer) => fixer.insertTextBefore(testFunction, 'async '),
                });
              }

              // Fix 2: Add a 'http' variable
              if (
                testFunction.body.type === 'BlockStatement' &&
                !text(testFunction.body.body[0]).includes('mockHttpClient')
              ) {
                const program = getProgram(node);
                const allImports = program.body.filter((item) => item.type === 'ImportDeclaration');
                /** @type {Array<ImportSpecifier>} */
                const importSpecifiers = allImports
                  .map((decl) => decl.specifiers)
                  .reduce((acc, x) => acc.concat(x), []);

                const mockHttpClientImmport = importSpecifiers.find((specifier) => {
                  return specifier.imported && specifier.imported.name === 'mockHttpClient';
                });

                return context.report({
                  node,
                  message: 'Migrate to MockHttpClient (step 2): Create a MockHttpClient named "http"',
                  fix: (fixer) => {
                    const insertHttp = fixer.insertTextBefore(
                      testFunction.body.body[0],
                      'const http = mockHttpClient();\n',
                    );

                    let insertImport = fixer.insertTextBeforeRange(
                      [0, 0],
                      `import { mockHttpClient } from 'core/api/mock/jasmine';\n`,
                    );

                    // Put after 'use strict'
                    const sourcecode = text(program);
                    const [preamble] = /^['"]use strict['"];?/.exec(sourcecode) || [];
                    if (preamble) {
                      const insertPos = preamble.length;
                      insertImport = fixer.insertTextAfterRange(
                        [insertPos, insertPos],
                        `\nimport { mockHttpClient } from 'core/api/mock/jasmine';`,
                      );
                    }

                    if (mockHttpClientImmport) {
                      return insertHttp;
                    } else {
                      return [insertHttp, insertImport];
                    }
                  },
                });
              }

              // Fix 3:
              // - replace "$httpBackend.when('GET'" with "$httpBackend.expectGET("
              // - replace "$httpBackend.whenGET" with "$httpBackend.expectGET"
              // - replace "$httpBackend" with "http"
              return context.report({
                node,
                message: 'Migrate to MockHttpClient (step 3): replace $httpBackend with http',
                fix: (fixer) => {
                  const newItBlockText = itBlockText
                    .replace(/(this\.)?\$httpBackend\.when(GET|POST|PUT|PATCH|DELETE)/g, '$httpBackend.expect$2')
                    .replace(
                      /(this\.)?\$httpBackend\.when\(['"](GET|POST|PUT|PATCH|DELETE)['"], /g,
                      '$httpBackend.expect$2(',
                    )
                    .replace(/(this\.)?\$httpBackend/g, 'http')
                    .replace(/http.flush/g, 'await http.flush')
                    .replace(/await await /g, 'await ');

                  return fixer.replaceText(node, newItBlockText);
                },
              });
            }
          }
        }
      },
    };
  },
  meta: {
    fixable: 'code',
    type: 'problem',
    docs: {
      description: 'Do not import API',
    },
  },
};
