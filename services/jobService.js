const Queue = require('bull');

let workQueue = new Queue('work', process.env.REDIS_URL);

async function queueJob(projectName, projectURL) {
    let job = await workQueue.add({
        projectName,
        projectURL
    });
    return job.id;
}

module.exports = {
    queueJob
};
