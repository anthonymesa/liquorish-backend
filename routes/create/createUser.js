const { Request } = require("tedious");
const { createResponse } = require('../../response')

const createSavedDrink = async (request, db_connection) => {

    const username = request.payload.username;
    const name_first = request.payload.name_first;
    const name_last = request.payload.name_last;
    const birth_date = request.payload.birth_date;
    const address_city = request.payload.address_city;
    const address_state = request.payload.address_state;

    return await new Promise((resolve, reject) => {

        const sql_query = `
            insert into users(username,name_first,name_last,birth_date,address_city,address_state)
            values( '${username}', '${name_first}', '${name_last}', '${birth_date}','${address_city}','${address_state}' )
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


module.exports = { createUser }