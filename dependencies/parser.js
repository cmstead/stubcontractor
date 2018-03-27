(function (moduleFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if (isNode) {
        module.exports = moduleFactory;
    } else {
        window.stubcontractorContainer.register(moduleFactory)
    }

})(function parser(esprima) {
    'use strict';

    function parse(sourceText) {
        const options = {
            loc: true,
            jsx: true
        };

        try {
            return esprima.parseScript(sourceText, options);
        } catch (e) {
            return esprima.parseModule(sourceText, options);
        }
    }

    return {
        parse: parse
    };
});
