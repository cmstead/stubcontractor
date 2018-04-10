(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.stubcontractorContainer.register(moduleFactory)
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
            return Object.keys(apiObj)
                .filter(key => typeof apiObj[key] === 'function')
                .reduce(function (apiFake, key) {
                    apiFake[key] = buildFunctionFake(apiObj[key]);
                    return apiFake;
                }, {});
        }

        function addFunctionTo(functionSpecs) {
            return function addFunction(result, key) {
                result[key] = functionBuilder.buildFunction(functionSpecs[key]);
                return result;
            }
        }

        function getModuleFromRegistry(moduleName) {
            if (typeof registry[moduleName] === 'undefined') {
                const loadedModule = fileLoader.loadSource(moduleName);

                if (typeof loadedModule === 'string') {
                    registry[moduleName] = loadedModule;
                } else {
                    throw new Error(`Cannot load ${moduleName}, it does not exist in known file paths`);
                }
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

        function getApiFunction(moduleName, functionName) {
            const apiObject = getApiEndpoints(moduleName, [functionName]);
            return apiObject[functionName];
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
                getApiEndpoints),
            getApiFunction: signet.enforce(
                'moduleName: string, functionName: string => apiFunction: function',
                getApiFunction)
        };
    }

});
