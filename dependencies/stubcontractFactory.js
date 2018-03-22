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
                if(arguments.length !== functionSpec.argumentCount) {
                    const message = `Function ${functionSpec.name} was called with ${arguments.length} arguments but expected ${functionSpec.argumentCount}`;
                    throw new Error(message);
                }
            };
        }

        function getApiEndpoints(moduleName, functionNames) {
            const source = registry[moduleName];
            const functionSpecs = sourceReader.readFunctions(source, functionNames);

            function addFunction(result, key) {
                result[key] = buildFunction(functionSpecs[key]);
                return result;  
            }

            return Object
                .keys(functionSpecs)
                .reduce(addFunction, {});
        }

        return {
            register: signet.enforce(
                'moduleName: string, source: string => undefined',
                register),
            getApiEndpoints: signet.enforce(
                'moduleName: string, functionNames: array<string> => apiObject: object',
                getApiEndpoints)
        };
    }

});
