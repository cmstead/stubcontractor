(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.stubcontractorContainer.register(moduleFactory)
    }

})(function sourceReader(
    astNodeHelper,
    estraverse
) {
    'use strict';

    const {
        nodeTypes,
        getAcceptableNodeType,
        isAcceptableFunctionNode
    } = astNodeHelper;

    function functionReader(functionMap, ast) {
        const functionDefinitions = {};

        estraverse.traverse(ast, {
            enter: function (node) {
                const nodeType = getAcceptableNodeType(node);

                if (nodeType !== null) {
                    const name = nodeTypes[nodeType].getNodeName(node);
                    const functionNode = nodeTypes[nodeType].getFunctionNode(node);

                    if (functionMap[name] && isAcceptableFunctionNode(functionNode)) {
                        const params = nodeTypes[nodeType].getFunctionParams(node);

                        functionDefinitions[name] = {
                            name: name,
                            argumentCount: params.length
                        }
                    }
                }
            }

        });

        return functionDefinitions;
    }

    function readFunctions(ast, functionNames) {
        const functionMap = functionNames
            .reduce((result, key) => (result[key] = true, result), {});

        const functionDefinitions = functionReader(functionMap, ast);

        return functionDefinitions;
    }

    return {
        readFunctions: readFunctions
    };

});
