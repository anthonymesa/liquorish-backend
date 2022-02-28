
/**
 * Comments here
 */

const createResponse = (status, value) => {
    return `{ "status": ${status}, "value": ${JSON.stringify(value)}}`
}

module.exports = { createResponse }