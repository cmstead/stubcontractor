(function (configFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;
    const config = configFactory();

    if (isNode) {
        module.exports = require('dject')(config);
    } else {
        window.container = djectFactory(config)
    }

})(function () {
    'use strict';

    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    return {
        cwd: isNode ? __dirname : '',
        modulePaths: [],
        allowOverride: false,
        eagerLoad: false,
        errorOnModuleDNE: true
    }
});