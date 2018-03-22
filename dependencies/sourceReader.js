(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.container.register(moduleFactory)
    }

})(function sourceReader(
    parser,
    estraverse
) {
    'use strict';

    function functionReader(functionMap, source) {
        const ast = parser.parse(source);
        const functionDefinitions = {};

        estraverse.traverse(ast, {
            enter: function (node) {
                const functionToCapture = node.type === 'FunctionDeclaration'
                    && functionMap[node.id.name] === null;

                if (functionToCapture) {
                    const name = node.id.name;

                    functionDefinitions[name] = {
                        name: name,
                        argumentCount: node.params.length
                    };
                }
            }
        });

        return functionDefinitions;
    }

    function readFunctions(source, functionNames) {
        const functionMap = functionNames
            .reduce((result, key) => (result[key] = null, result), {});

        const functionDefinitions = functionReader(functionMap, source);

        return functionDefinitions;
    }

    return {
        readFunctions: readFunctions
    };

});
