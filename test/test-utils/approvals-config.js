'use strict';

const approvalsLocation = __dirname + '/../approvals';

const approvalsConfigFactory = require('approvals-config-factory');
const approvalsConfig = approvalsConfigFactory.buildApprovalsConfig({
    reporter: 'kdiff3'
});

module.exports = () => require('approvals')
    .configure(approvalsConfig)
    .mocha(approvalsLocation);
