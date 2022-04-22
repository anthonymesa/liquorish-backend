
const { Request } = require("tedious");
const { createResponse } = require('../../response')

const deleteBar = async (request, db_connection) => {

    const id = parseInt(request.params.bar_id);
    
    return await new Promise((resolve, reject) => {

        const sql_query = `
            delete from bar where bar_id = ${id}
        `;

        const request = new Request(sql_query,
            (err, rowCount) => {
                if (err) {
                    console.log(err);
                    resolve(createResponse(-1, null));
                } else if (rowCount != 1) {
                    resolve(createResponse(-1, null));
                } else {
                    resolve(createResponse(0, null));
                }
            }
        );

        db_connection.execSql(request);
    });
}


module.exports = { deleteBar }