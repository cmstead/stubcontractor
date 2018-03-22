(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.container.register(moduleFactory)
    }

})(function estraverse() {
    'use strict';
    
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        return require('estraverse');
    } else {
        return estraverse;
    }
});