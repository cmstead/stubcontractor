(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.container.register(moduleFactory)
    }

})(function stubcontractFactory(
    fileLoaderFactory,
    signet,
    sourceReader
) {

    'use strict';

    return function (fileLoader) {
        let registry = {};

        function register(moduleName, source) {
            registry[moduleName] = source;
        }

        function buildFunction(functionSpec) {
            let localVars = {
                callable: function () { }
            };

            function fakeFunction(...args) {
                if (arguments.length !== functionSpec.argumentCount) {
                    const message = `Function ${functionSpec.name} was called with ${arguments.length} arguments but expected ${functionSpec.argumentCount}`;
                    throw new Error(message);
                }

                localVars.callable.apply(null, args);
            }

            fakeFunction.onCall = function (callable) {
                if (typeof callable === 'function') {
                    localVars.callable = callable;
                } else {
                    const setCallableMessage = `Cannot register ${callable} as function to call from function ${functionSpec.name}`;
                    throw new Error(setCallableMessage);
                }
            };

            return fakeFunction;
        }

        function addFunctionTo(functionSpecs) {
            return function addFunction(result, key) {
                result[key] = buildFunction(functionSpecs[key]);
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
