const throng = require('throng');
const Queue = require('bull');

const { orchestrate } = require('./services');

let workers = process.env.WEB_CONCURRENCY || 1;

function start() {
    let workQueue = new Queue('work', process.env.REDIS_URL);
    console.log('Worker started.');

    workQueue.process(async(job) => {
        console.log('Job received.');
        await orchestrate(job.data.projectName, job.data.projectURL);
    });
}

throng({ workers, start });