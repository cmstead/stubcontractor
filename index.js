(function (moduleFactory) {
    let isNode = typeof module !== undefined && typeof module.exports !== undefined

    if (isNode) {
        const container = require('./container');
        module.exports = moduleFactory(container);
    } else if (typeof signet === 'object') {
        window.stubcontractor = moduleFactory(container);
    } else {
        throw new Error('The module stubcontractor requires Signet to run.');
    }

})(function (container) {
    'use strict';

    return function () {
        const stubcontract = container.build('stubcontractFactory')();

        return {
            buildFunctionFake: stubcontract.buildFunctionFake,
            getApiEndpoints: stubcontract.getApiEndpoints,
            register: stubcontract.register
        };
    };
});
