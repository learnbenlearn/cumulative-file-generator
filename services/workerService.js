const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const {FOLDER_PATTERN} = require('../config');
const {fatal, properCase} = require('../util');

async function orchestrate(projectName, projectURL) {
    if(fs.existsSync(`./${projectName}`)) {
        changeToProjectDirectory(projectName);
        await pullChanges();
    } else {
        await cloneRepo(projectURL);
        changeToProjectDirectory(projectName);
    }
    await configureLocalRepo(projectName);
    await generateNewCumulativeFiles();
    await pushChanges();
}

async function cloneRepo(projectURL) {
    const {stderr} = await exec(
        `git clone ${process.env.PROTOCOL}${process.env.GITLAB_USERNAME}:${process.env.GITLAB_TOKEN}@${projectURL.slice(process.env.PROTOCOL.length)} -q`
    );
    if(stderr) {
        fatal('cloneRepo()', stderr);
    }
}

async function configureLocalRepo() {
    let stderr;

    ({_, stderr} = await exec(`git config user.email ${process.env.GIT_USER_EMAIL}`));
    if(stderr) {
        fatal('cloneRepo()', stderr);
    }

    ({_, stderr} = await exec(`git config user.name ${process.env.GIT_USER_NAME}`));
    if(stderr) {
        fatal('cloneRepo()', stderr);
    }
}

async function generateNewCumulativeFiles() {
    const {stdout, stderr} = await exec(`git diff HEAD^ --name-only`);
    if(stderr) {
        fatal('generateNewCumulativeFile()', stderr);
    }

    let updatedTopics = new Set();
    for(let changedFile of stdout.split('\n')) {
        let moduleFolderName = changedFile.slice(
            process.env.MODULE_PATH_PREFIX.length + 1, 
            changedFile.indexOf(process.env.FILE_PATH_DELIMITER, process.env.MODULE_PATH_PREFIX.length + 1)
        );
        let topicFolderName = changedFile.slice(
            changedFile.indexOf(moduleFolderName) + moduleFolderName.length + 1, 
            changedFile.indexOf(
                process.env.FILE_PATH_DELIMITER,
                process.env.MODULE_PATH_PREFIX.length + moduleFolderName.length + process.env.FILE_PATH_DELIMITER.length + 1
            )
        );

        moduleFolderName.replaceAll('/', '');
        topicFolderName.replaceAll('/', '');
        
        if(changedFile.startsWith(process.env.MODULE_PATH_PREFIX) && FOLDER_PATTERN.test(moduleFolderName) && FOLDER_PATTERN.test(topicFolderName)) {
            updatedTopics.add(
                `${process.env.MODULE_PATH_PREFIX}${process.env.FILE_PATH_DELIMITER}${moduleFolderName}${process.env.FILE_PATH_DELIMITER}${topicFolderName}`
            );
        }
    }

    for(topic of updatedTopics) {
        writeCumulativeFile(topic);
    }
}

function writeCumulativeFile(topic) {
    const prerequisitesLearningObjectives = fs.readFileSync(
        `${topic}${process.env.FILE_PATH_DELIMITER}${process.env.PREREQUISITES_LEARNING_OBJECTIVES_FILENAME}`, 
        {encoding: 'utf-8'}
    );
    const description = fs.readFileSync(`${topic}${process.env.FILE_PATH_DELIMITER}${process.env.DESCRIPTION_FILENAME}`, {encoding: 'utf-8'});
    const realWorldApplication = fs.readFileSync(`${topic}${process.env.FILE_PATH_DELIMITER}${process.env.REAL_WORLD_APPLICATION_FILENAME}`, {encoding: 'utf-8'});
    const implementation = fs.readFileSync(`${topic}${process.env.FILE_PATH_DELIMITER}${process.env.IMPLEMENTATION_FILENAME}`, {encoding: 'utf-8'});
    const summary = fs.readFileSync(`${topic}${process.env.FILE_PATH_DELIMITER}${process.env.SUMMARY_FILENAME}`, {encoding: 'utf-8'});
    
    let topicFolderName = topic.slice(topic.lastIndexOf('/') + 1);
    let topicName = topicFolderName.replaceAll('-', ' ')
    fs.writeFileSync(
        `${topic}${process.env.FILE_PATH_DELIMITER}${process.env.CUMULATIVE_FILENAME}`,
        `# Cumulative for ${properCase(topicName)}
        
<details><summary>Prerequisites and Learning Objectives</summary>
${prerequisitesLearningObjectives.slice(prerequisitesLearningObjectives.indexOf('\n') + 1)}
</details>

<details><summary>Description</summary>
${description.slice(description.indexOf('\n') + 1)}
</details>

<details><summary>Real-World Application</summary>
${realWorldApplication.slice(realWorldApplication.indexOf('\n') + 1)}
</details>

<details><summary>Implementation</summary>
${implementation.slice(implementation.indexOf('\n') + 1)}
</details>

<details><summary>Summary</summary>
${summary.slice(summary.indexOf('\n') + 1)}
</details>

<details><summary>Practice Questions</summary>
[Practice Questions](./${process.env.QUIZ_FILENAME})
</details>`
);
}

async function pushChanges() {
    let stderr;
    
    ({_, stderr} = await exec('git add .'));
    if(stderr) {
        fatal('pushChanges()', stderr);
    }

    ({_, stderr} = await exec(`git commit -m "${process.env.COMMIT_MESSAGE}"`));
    if(stderr) {
        fatal('pushChanges()', stderr);
    }

    ({_, stderr} = await exec('git push'));
    if(stderr) {
        fatal('pushChanges()', stderr);
    }
}

async function pullChanges() {
    const {_, stderr} = await exec('git pull');
    if(stderr) {
        fatal('pullChanges()', stderr);
    }
}

function changeToProjectDirectory(projectName) {
    try {
        process.chdir(projectName);
    } catch(err) {
        fatal('changeToProjectDirectory()', err);
    }
}

module.exports = {
    orchestrate
}