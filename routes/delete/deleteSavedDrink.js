
const { Request } = require("tedious");
const { createResponse } = require('../../response')

const deleteSavedDrink = async (request, db_connection) => {

    const id = parseInt(request.payload.user_id);
    const drink = parseInt(request.payload.drink);
    return await new Promise((resolve, reject) => {

        const sql_query = `
            delete from saved_drinks where user_id = ${id} and drink_id = ${drink}
        `;

        return new Promise((resolve, reject) => {
            const request = new Request(sql_query,
                (err, rowCount) => {
                    if (err) {
                        console.log(err);
                        resolve(createResponse(-1, null));
                    } else {
                        console.log(rowCount);
                        resolve(createResponse(0, rowCount == 1));
                    }
                }
            );

            db_connection.execSql(sql_query);
        });
    });
}


module.exports = { deleteSavedDrink }