function properCase(topicFolderName) {
    let pattern = new RegExp('\\s[a-z]', 'g');
    let properCaseTopic = topicFolderName.replaceAll(pattern, (x) => {
        return x.toUpperCase();
    });
    return properCaseTopic.slice(process.env.TOPIC_PREFIX_LENGTH);
}

module.exports = {
    properCase
};