(function () {
    function noArguments() { }

    function oneArgument(a) { }

    const assignedFunctionExpression = function (a) { };

    let lateAssignedFunctionExpression;
    lateAssignedFunctionExpression = function (b) {}

    const arrowFunctionExpression = (a) => {};

    class MyTest {
        classFunction (c) {}
    }

    const myObj = {
        objectMethod: function (foo) {}
    };

    return {
        noArguments: noArguments,
        oneArgument: oneArgument,
        assignedFunctionExpression: assignedFunctionExpression,
        lateAssignedFunctionExpression: lateAssignedFunctionExpression,
        arrowFunctionExpression: arrowFunctionExpression,
        MyTest: MyTest
    };
})();
