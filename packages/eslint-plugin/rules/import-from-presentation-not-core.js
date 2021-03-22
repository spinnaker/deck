'use strict';

const migratedPresentationModules = ['Icon', 'IconNames', 'Illustration', 'IllustrationName'];

const removeImportFromCore = (context, importSpecifierNode, fixer) => {
  const sourceCode = context.getSourceCode();
  const fixes = [];

  if (importSpecifierNode.parent.specifiers.length === 1) {
    // The node is the only import specifier in the declaration, so remove the whole import
    // declaration.
    fixes.push(fixer.remove(importSpecifierNode.parent));
  } else {
    // Remove the import specifier.
    fixes.push(fixer.remove(importSpecifierNode));
    const isNextTokenComma = sourceCode.getTokenAfter(importSpecifierNode).value === ',';
    if (isNextTokenComma) {
      // Remove the trailing comma in the import specifier as well.
      fixes.push(fixer.remove(sourceCode.getTokenAfter(importSpecifierNode)));
    }
  }

  return fixes;
};

const addImportToPresentation = (context, importSpecifierNode, fixer) => {
  const sourceCode = context.getSourceCode();
  const fixes = [];

  // Use the alias if it is available in the old import specifier.
  const importSpecifierText =
    importSpecifierNode.local.name === importSpecifierNode.imported.name
      ? importSpecifierNode.imported.name
      : `${importSpecifierNode.imported.name} as ${importSpecifierNode.local.name}`;

  // Check if @spinnaker/presentation is already imported.
  const spinnakerPresentationImport = sourceCode.ast.body.find(
    (node) => node.type === 'ImportDeclaration' && node.source.value === '@spinnaker/presentation',
  );

  if (spinnakerPresentationImport) {
    // If @spinnaker/presentation is already imported, then append our import specifier to the last
    // import specifier in this import declaration.
    const lastSpecifier = spinnakerPresentationImport.specifiers[spinnakerPresentationImport.specifiers.length - 1];
    fixes.push(fixer.insertTextAfter(lastSpecifier, `, ${importSpecifierText}`));
  } else {
    // If @spinnaker/presentation import is not available, then add one as the last import declaration
    // along with our module's import specifier.
    const importDeclarations = sourceCode.ast.body.filter((node) => node.type === 'ImportDeclaration');
    const lastImportDeclaration = importDeclarations[importDeclarations.length - 1];

    fixes.push(
      fixer.insertTextAfter(lastImportDeclaration, `\nimport {${importSpecifierText}} from '@spinnaker/presentation';`),
    );
  }

  return fixes;
};

const moveImportToPresentation = (context, node, fixer) => [
  ...removeImportFromCore(context, node, fixer),
  ...addImportToPresentation(context, node, fixer),
];

const rule = (context) => {
  return {
    ImportSpecifier(node) {
      if (migratedPresentationModules.includes(node.imported.name) && node.parent.source.value === '@spinnaker/core') {
        const message = `${node.imported.name} must be imported from @spinnaker/presentation`;
        const fix = (fixer) => moveImportToPresentation(context, node, fixer);
        context.report({
          node,
          message,
          fix,
        });
      }
    },
  };
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: `Enforces import of presentation modules from @spinnaker/presentation`,
    },
    fixable: 'code',
  },

  create: rule,
};
