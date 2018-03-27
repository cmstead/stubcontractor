(function (moduleFactory) {
    window.stubcontractorContainer.register(moduleFactory)
})(function () {
    
    return function () {
        function loadSource () {
            throw new Error('Stubcontractor cannot currently manage file loading from the client');
        }

        return {
            loadSource: loadSource
        }
    }
});