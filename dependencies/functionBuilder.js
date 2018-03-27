(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.stubcontractorContainer.register(moduleFactory)
    }

})(function functionBuilder(signet) {
    'use strict';

    function buildSignature(argCount) {
        const postfix = ' => result: *';
        let argumentList = [];

        for (let i = 0; i < argCount; i++) {
            argumentList.push(`arg${i + 1}: *`);
        }

        if (argumentList.length === 0) {
            argumentList.push('*');
        }

        return argumentList.join(', ') + postfix;
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

        fakeFunction.getOnCallAction = function () {
            return localVars.callable;
        }

        fakeFunction.signature = buildSignature(functionSpec.argumentCount);

        return fakeFunction;
    }
    
    return {
        buildFunction: signet.enforce(
            'functionSpec: object => function',
            buildFunction)
    };
});
