(function (moduleFactory) {
    let isNode = typeof module !== undefined && typeof module.exports !== undefined

    if (isNode) {
        const container = require('./container');
        module.exports = moduleFactory(container);
    } else if (typeof signet === 'object') {
        window.stubcontractor = moduleFactory(stubcontractorContainer);
        
        window.stubcontractorContainer = undefined;
        delete window.stubcontractorContainer;
    } else {
        throw new Error('The module stubcontractor requires Signet to run.');
    }

})(function (container) {
    'use strict';

    return function (config) {
        let isNode = typeof module !== undefined && typeof module.exports !== undefined;

        const fileLoader = isNode
            ? container.build('fileLoaderFactory')(config)
            : container.build('clientFileLoaderFactory')(config);

        const stubcontract = container.build('stubcontractFactory')(fileLoader);

        return {
            buildApiFake: stubcontract.buildApiFake,
            buildFunctionFake: stubcontract.buildFunctionFake,
            getApiEndpoints: stubcontract.getApiEndpoints,
            register: stubcontract.register
        };
    };
});
