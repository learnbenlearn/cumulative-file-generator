const { queueJob } = require('../services');

async function handlePost(req, res) {
    if(process.env.GITLAB_SECRET !== req.get(process.env.HEADER_TOKEN)) {
        res.status(403).send({
            body: process.env['403_STATUS_MESSAGE']
        });
    } else if(
        (req.get(process.env.HEADER_EVENT) === process.env.INVOCATION_EVENT) && 
        (req.body.object_attributes.action === process.env.INVOCATION_ACTION) &&
        (req.body.object_attributes.target_branch === process.env.INVOCATION_BRANCH)){
            let projectURL = req.body.project.git_http_url;
            let jobId = await queueJob(
                projectURL.slice(projectURL.lastIndexOf(process.env.URL_DELIMITER) + 1, projectURL.length - process.env.HTTP_URL_SUFFIX.length), 
                projectURL
            );
            res.status(200).send({
                body: jobId
            });
    } else {
        res.status(204).send({
            body: process.env['204_STATUS_MESSAGE']
        })
    }
}

module.exports = {
    handlePost
};