(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.container.register(moduleFactory)
    }

})(function signet() {
    'use strict';
    
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        return require('../../signet-types');
    } else {
        return signet;
    }
});