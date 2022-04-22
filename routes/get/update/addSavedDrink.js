
const { Request } = require("tedious");
const { createResponse } = require('../../response')

const addSavedDrink = async (request, db_connection) => {

    // const user_id = parseInt(request.payload.user_id);
    // const drink_id = parseInt(request.payload.drink_id);
    const user_id = parseInt(request.params.user_id);
    const drink_id = parseInt(request.params.drink_id);

    return await new Promise((resolve, reject) => {

        const sql_query = `
            insert into saved_drinks values (${user_id}, ${drink_id})
        `

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


module.exports = { addSavedDrink: addSavedDrink }