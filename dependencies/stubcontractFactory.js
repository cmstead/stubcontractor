(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.stubcontractorContainer.register(moduleFactory)
    }

})(function stubcontractFactory(
    functionBuilder,
    signet,
    sourceReader
) {

    'use strict';

    return function (registry) {

        function buildApiFakeFromPrototype(apiObj) {
            return buildApiFake(Object.getPrototypeOf(apiObj));
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

        function getApiEndpoints(moduleName, functionNames) {
            const sourceAst = registry.getModule(moduleName);
            const functionSpecs = sourceReader.readFunctions(sourceAst, functionNames);

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
            buildApiFakeFromPrototype: signet.enforce(
                'apiObject: object => object',
                buildApiFakeFromPrototype),
            buildFunctionFake: signet.enforce(
                'originalFunction: function => functionFake: function',
                buildFunctionFake),
            getApiEndpoints: signet.enforce(
                'moduleName: string, functionNames: array<string> => apiObject: object',
                getApiEndpoints),
            getApiFunction: signet.enforce(
                'moduleName: string, functionName: string => apiFunction: function',
                getApiFunction)
        };
    }

});
