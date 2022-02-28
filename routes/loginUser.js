
/**
 * Comments here
 * 
 * returns either null, or the client id.
 */

const { Request } = require("tedious");
const { createResponse } = require('../response')

const loginUser = async (request, db_connection) => {

    const username = request.params.username;
    const password = request.params.password;
    let user_id = null;

    return await new Promise((resolve, reject) => {

        const sql_query = `
            select users_id from users_pass where users_id = (
                select id from users where username = '${username}'
            ) and password = '${password}' group by users_id
        `
        
        const request = new Request(sql_query, (err, rowCount) => {
            if (err) {
                resolve(createResponse(-1, null));
            }
        });
        
        request.on('row', columns => {
            user_id = columns[0].value;
        });

        request.on('doneProc', (rowCount, more, returnStatus, rows) => {
            if(user_id > 0){
                return resolve(createResponse(0, { 
                    "client id": user_id 
                }));
            } else {
                return resolve(createResponse(-1, null));
            }
        });

        db_connection.execSql(request);
    });
}

module.exports = { loginUser }