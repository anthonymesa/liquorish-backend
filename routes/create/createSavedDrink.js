
/**
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const createSavedDrink = async (request, db_connection) => {

    const id = parseInt(request.payload.user_id);
    const drink = parseInt(request.payload.drink);
    return await new Promise((resolve, reject) => {

        const sql_query = `
            insert into saved_drinks(user_id,drink_id) values( ${id}, ${drink} )
        `;
        
        return new Promise((resolve, reject) => {
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

            db_connection.execSql(sql_query);
        });
    });
}


module.exports = { createSavedDrink }