(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.stubcontractorContainer.register(moduleFactory)
    }

})(function esprima() {
    'use strict';
    
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        return require('esprima');
    } else {
        return esprima;
    }
});