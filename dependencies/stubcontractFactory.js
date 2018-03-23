(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.container.register(moduleFactory)
    }

})(function stubcontractFactory(
    signet,
    sourceReader
) {

    'use strict';

    return function () {
        let registry = {};

        function register(moduleName, source) {
            registry[moduleName] = source;
        }

        function buildFunction(functionSpec) {
            return function () {
                if (arguments.length !== functionSpec.argumentCount) {
                    const message = `Function ${functionSpec.name} was called with ${arguments.length} arguments but expected ${functionSpec.argumentCount}`;
                    throw new Error(message);
                }
            };
        }

        function addFunctionTo(functionSpecs) {
            return function addFunction(result, key) {
                result[key] = buildFunction(functionSpecs[key]);
                return result;
            }
        }

        function getApiEndpoints(moduleName, functionNames) {
            const source = registry[moduleName];
            const functionSpecs = sourceReader.readFunctions(source, functionNames);

            return Object
                .keys(functionSpecs)
                .reduce(addFunctionTo(functionSpecs), {});
        }

        function buildFunctionFake(fn) {
            const functionSpec = {
                name: fn.name,
                argumentCount: fn.length
            };

            return buildFunction(functionSpec);
        }

        return {
            buildFunctionFake: signet.enforce(
                'originalFunction: function => functionFake: function',
                buildFunctionFake),
            register: signet.enforce(
                'moduleName: string, source: string => undefined',
                register),
            getApiEndpoints: signet.enforce(
                'moduleName: string, functionNames: array<string> => apiObject: object',
                getApiEndpoints)
        };
    }

});