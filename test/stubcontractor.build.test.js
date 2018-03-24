'use strict';

const fs = require('fs');

const assert = require('chai').assert;
const sinon = require('sinon');

const prettyJson = require('./test-utils/prettyJson');
require('./test-utils/approvals-config')();

const stubcontractorFactory = require('../index.js');

describe('stubcontractor', function () {

    describe('getApiEndpoints', function () {

        let stubcontractor;
        let testSource;

        beforeEach(function () {
            const config = {};
            stubcontractor = stubcontractorFactory(config);

            testSource = fs.readFileSync(__dirname + '/fixtures/api-fixture.js', { encoding: 'utf8' });

            stubcontractor.register('api-fixture', testSource);
        });

        it('should load a single function', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['noArguments']);

            this.verify(prettyJson(apiStub));
        });

        it('should load two functions', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['noArguments', 'oneArgument']);

            this.verify(prettyJson(apiStub));
        });


        it('should load a variable-assigned function expression', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['assignedFunctionExpression']);

            this.verify(prettyJson(apiStub));
        });

        it('should load a variable-assigned function expression which is assigned after declaration', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['lateAssignedFunctionExpression']);

            this.verify(prettyJson(apiStub));
        });

        it('should load a variable-assigned lambda expression', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['arrowFunctionExpression']);

            this.verify(prettyJson(apiStub));
        });

        it('should load a method in a class', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['classFunction']);

            this.verify(prettyJson(apiStub));
        });

        it('should load a method from an object', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['objectMethod']);

            this.verify(prettyJson(apiStub));
        });

        it('should not throw an error if function is called correct number of arguments', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['noArguments']);

            assert.doesNotThrow(() => apiStub.noArguments());
        });

        it('should throw an error if function is called with too many arguments', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['noArguments']);

            assert.throws(() => apiStub.noArguments('oh no!'));
        });

        it('should throw an error if function is called with too few arguments', function () {
            const apiStub = stubcontractor.getApiEndpoints('api-fixture', ['oneArgument']);

            assert.throws(() => apiStub.oneArgument());
        });

    });

    describe('buildFunctionFake', function () {

        let stubcontractor;

        beforeEach(function () {
            const config = {};

            stubcontractor = stubcontractorFactory(config);
        });

        it('should return a function', function () {
            function test() { }

            const functionFake = stubcontractor.buildFunctionFake(test);

            assert.equal(typeof functionFake, 'function');
        });

        it('should enforce required argument count', function () {
            function test(a, b, c) { }

            const functionFake = stubcontractor.buildFunctionFake(test);

            const message = 'Function test was called with 2 arguments but expected 3';
            assert.throws(() => functionFake(1, 2), message);
        })


    });


    describe('functionFake.onCall', function () {
        let stubcontractor;

        beforeEach(function () {
            const config = {};

            stubcontractor = stubcontractorFactory(config);
        });

        it('should provide a function the fake function should call when the fake is called', function () {
            function test(a, b, c) { }

            const functionFake = stubcontractor.buildFunctionFake(test);
            const onCallSpy = sinon.spy();

            functionFake.onCall(onCallSpy);

            functionFake(1, 2, 3);

            this.verify(prettyJson(onCallSpy.args));
        });


        it('should throw an error if trying to register a non-function', function () {
            function test(a, b, c) { }

            const functionFake = stubcontractor.buildFunctionFake(test);

            const message = 'Cannot register null as function to call from function test';
            assert.throws(() => functionFake.onCall(null), message);
        });



    });


    describe('file loading', function () {
        let stubcontractor;

        beforeEach(function () {
            const config = {
                cwd: __dirname + '/fixtures',
                sourceDirectories: [
                    './'
                ]
            };
            stubcontractor = stubcontractorFactory(config);
        });


        it('should load a file dynamically if not preregistered', function () {
            const apiFake = stubcontractor.getApiEndpoints('api-fixture', [
                'noArguments',
                'oneArgument',
                'assignedFunctionExpression',
                'lateAssignedFunctionExpression',
                'arrowFunctionExpression'
            ]);

            this.verify(prettyJson(apiFake));
        });

    });


});
