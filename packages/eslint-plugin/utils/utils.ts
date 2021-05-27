import { Rule, Scope } from 'eslint';
import { CallExpression, Expression, Identifier, MemberExpression, Node, Program, SpreadElement } from 'estree';
import * as _ from 'lodash/fp';

export const getNodeType = (obj: Node) => obj && obj.type;
const isIdentifier = (obj: Node): obj is Identifier => obj?.type === 'Identifier';
const isCallExpression = (obj: Node): obj is CallExpression => obj?.type === 'CallExpression';
const isMemberExpression = (obj: Node): obj is MemberExpression => obj?.type === 'MemberExpression';

/**
 * Recursively grab the callee until an Identifier is found.
 *
 * API.all().all().one('foo/bar');
 *
 * var calleeOne = ...
 * getCallingIdentifier(calleeOne).name === 'API'
 */
export function getCallingIdentifier(calleeObject: Node): Identifier {
  if (isIdentifier(calleeObject)) {
    return calleeObject;
  }

  if (isCallExpression(calleeObject)) {
    const target = isMemberExpression(calleeObject.callee) ? calleeObject.callee.object : calleeObject.callee;
    return getCallingIdentifier(target);
  }

  return undefined;
}

export function getCallingIdentifierName(calleeObject: Node) {
  return getCallingIdentifier(calleeObject)?.name;
}

/**
 * given an identifier, finds its Variable in the enclosing scope
 */
export function getVariableInScope(context: Rule.RuleContext, identifier: Identifier): Scope.Variable {
  if (!isIdentifier(identifier)) {
    return undefined;
  }

  const { references } = context.getScope();
  const ref = references.find((r) => r.identifier.name === identifier.name);
  return ref ? ref.resolved : undefined;
}

export const getVariableInitializer = _.get('defs[0].node.init');

export function getProgram(node: Node): Program {
  let _node = node as Node & Rule.NodeParentExtension;
  while (_node.parent) {
    if (_node.parent.type === 'Program') {
      return _node.parent;
    }
    _node = _node.parent;
  }
  return undefined;
}

/**
 * Given a CallExpression: API.one().two().three().get();
 * Returns an array of the chained CallExpressions: [.one(), .two(), .three(), .get()]
 */
export const getCallChain = (node: Node): CallExpression[] => {
  if (isCallExpression(node) && isMemberExpression(node.callee) && isCallExpression(node.callee.object)) {
    return getCallChain(node.callee.object).concat(node);
  } else if (isCallExpression(node)) {
    return [node];
  }
  return [];
};

export function getArgsText(context: Rule.RuleContext, args: Array<Expression | SpreadElement>) {
  const sourceCode = context.getSourceCode();
  return (args || []).map((arg) => sourceCode.getText(arg)).join(', ');
}
