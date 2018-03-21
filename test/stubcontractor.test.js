'use strict';

const assert = require('chai').assert;
const prettyJson = require('./test-utils/prettyJson');
const sinon = require('sinon');

const stubcontractor = require('../index.js');

describe('stubcontractor', function () {
    require('./test-utils/approvals-config');
});
