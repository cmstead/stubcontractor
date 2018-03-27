(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.container.register(moduleFactory)
    }

})(function stubcontractFactory(
    fileLoaderFactory,
    functionBuilder,
    signet,
    sourceReader
) {

    'use strict';

    return function (fileLoader) {
        let registry = {};

        function register(moduleName, source) {
            registry[moduleName] = source;
        }

        function buildApiFake(apiObj) {
            return {
                test: buildFunctionFake(apiObj.test)
            };
        }

        function addFunctionTo(functionSpecs) {
            return function addFunction(result, key) {
                result[key] = functionBuilder.buildFunction(functionSpecs[key]);
                return result;
            }
        }

        function getModuleFromRegistry(moduleName) {
            if(typeof registry[moduleName] === 'undefined') {
                registry[moduleName] = fileLoader.loadSource(moduleName);
            }

            return registry[moduleName];
        }

        function getApiEndpoints(moduleName, functionNames) {
            const source = getModuleFromRegistry(moduleName);
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

            return functionBuilder.buildFunction(functionSpec);
        }

        return {
            buildApiFake: signet.enforce(
                'apiObject: object => object',
                buildApiFake),
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
