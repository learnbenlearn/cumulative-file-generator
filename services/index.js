const jobService = require('./jobService.js');
const workerService = require('./workerService.js');

module.exports = {
    queueJob: jobService.queueJob,
    orchestrate: workerService.orchestrate
};