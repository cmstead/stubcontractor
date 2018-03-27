(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.stubcontractorContainer.register(moduleFactory)
    }

})(function astNodeHelper(signet) {
    'use strict';

    const nodeTypes = {
        AssignmentExpression: {
            getFunctionNode: node => node.right,
            getNodeName: node => node.left.name,
            getFunctionParams: node => node.right.params
        },
        FunctionDeclaration: {
            getFunctionNode: node => node,
            getNodeName: node => node.id.name,
            getFunctionParams: node => node.params
        },
        MethodDefinition: {
            getFunctionNode: node => node.value,
            getNodeName: node => node.key.name,
            getFunctionParams: node => node.value.params
        },
        Property: {
            getFunctionNode: node => node.value,
            getNodeName: node => node.key.name,
            getFunctionParams: node => node.value.params
        },
        VariableDeclarator: {
            getFunctionNode: node => node.init,
            getNodeName: node => node.id.name,
            getFunctionParams: node => node.init.params
        }
    };

    const functionTypes = {
        ArrowFunctionExpression: true,
        FunctionDeclaration: true,
        FunctionExpression: true,
        MethodDefinition: true
    };

    function getAcceptableNodeType(node) {
        return nodeTypes[node.type] ? node.type : null;
    }

    function isAcceptableFunctionNode(node) {
        return node !== null && Boolean(functionTypes[node.type]);
    }

    return {
        nodeTypes: nodeTypes,

        getAcceptableNodeType: signet.enforce(
            'astNode: object => nodeType: variant<string, null>',
            getAcceptableNodeType),
        isAcceptableFunctionNode: signet.enforce(
            'astNode: object => boolean',
            isAcceptableFunctionNode)
    };
});
