const error = require('./error.js');
const topic = require('./topic.js');

module.exports = {
    fatal: error.fatal,
    properCase: topic.properCase
};