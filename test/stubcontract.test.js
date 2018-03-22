'use strict';

const container = require('../container');

const prettyJson = require('./test-utils/prettyJson');
const assert = require('chai').assert;
const sinon = require('sinon');

describe('stubcontract', function () {
    require('./test-utils/approvals-config');

    let stubcontract;

    beforeEach(function () {
        stubcontract = container.build('stubcontract');
    });

});
