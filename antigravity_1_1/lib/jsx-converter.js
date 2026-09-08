/**
 * == ANTIGRAVITY RECOVERED v2.1 — LIB/JSX-CONVERTER.JS ==
 * Converte chamadas de runtime minificadas (_jsx, _jsxs, e.jsx, React.createElement)
 * em elementos JSX sintáticos reais (<tag attr={val}>children</tag>).
 */

import * as t from '@babel/types';

function buildJSXName(tagName) {
  if (typeof tagName === 'string') {
    return t.jsxIdentifier(tagName);
  }
  if (t.isIdentifier(tagName)) {
    return t.jsxIdentifier(tagName.name);
  }
  if (t.isMemberExpression(tagName)) {
    const object = buildJSXName(tagName.object);
    const property = t.jsxIdentifier(tagName.property.name);
    return t.jsxMemberExpression(object, property);
  }
  return t.jsxIdentifier('Component');
}

function valueToJSXAttributeValue(valueNode) {
  if (t.isStringLiteral(valueNode)) {
    return valueNode;
  }
  return t.jsxExpressionContainer(valueNode);
}

function exprToJSXChild(expr) {
  if (t.isStringLiteral(expr)) {
    return t.jsxText(expr.value);
  }
  if (t.isJSXElement(expr) || t.isJSXFragment(expr)) {
    return expr;
  }
  return t.jsxExpressionContainer(expr);
}

export function convertCallToJSX(callPath) {
  const node = callPath.node;
  const callee = node.callee;

  // Verifica se é _jsx / _jsxs / e.jsx / React.createElement
  const isJSXCall =
    t.isIdentifier(callee, { name: '_jsx' }) ||
    t.isIdentifier(callee, { name: '_jsxs' }) ||
    (t.isMemberExpression(callee) && (callee.property.name === 'jsx' || callee.property.name === 'jsxs' || callee.property.name === 'createElement'));

  if (!isJSXCall || node.arguments.length === 0) {
    return;
  }

  const firstArg = node.arguments[0];
  const propsArg = node.arguments[1];

  let jsxName;
  if (t.isStringLiteral(firstArg)) {
    jsxName = t.jsxIdentifier(firstArg.value);
  } else if (t.isIdentifier(firstArg)) {
    jsxName = t.jsxIdentifier(firstArg.name);
  } else if (t.isMemberExpression(firstArg)) {
    jsxName = buildJSXName(firstArg);
  } else {
    jsxName = t.jsxIdentifier('Fragment');
  }

  const attributes = [];
  let children = [];

  if (t.isObjectExpression(propsArg)) {
    for (const prop of propsArg.properties) {
      if (t.isObjectProperty(prop)) {
        const keyName = prop.key.name || prop.key.value;
        if (keyName === 'children') {
          const childVal = prop.value;
          if (t.isArrayExpression(childVal)) {
            children = childVal.elements.filter(Boolean).map(exprToJSXChild);
          } else {
            children = [exprToJSXChild(childVal)];
          }
        } else if (keyName) {
          const attrName = t.jsxIdentifier(keyName);
          const attrVal = valueToJSXAttributeValue(prop.value);
          attributes.push(t.jsxAttribute(attrName, attrVal));
        }
      }
    }
  }

  const openingElement = t.jsxOpeningElement(jsxName, attributes, children.length === 0);
  const closingElement = children.length === 0 ? null : t.jsxClosingElement(jsxName);
  const jsxElement = t.jsxElement(openingElement, closingElement, children, children.length === 0);

  callPath.replaceWith(jsxElement);
}
