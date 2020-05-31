const generalMessages = (username,text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generalLocationMessages = (username,url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generalMessages,
    generalLocationMessages
}