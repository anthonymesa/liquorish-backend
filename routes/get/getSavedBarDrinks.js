/**
 * Returns a status and value where the value is an array of bar drinks
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const getSavedBarDrinks = async (request, db_connection) => {

    const user_id = request.params.user_id;
    const bar_id = request.params.bar_id;

    const saved_bar_drinks = [];

    return new Promise((resolve, reject) => {

        const sql_query = `
            select * from bar_drinks where bar_id = ${bar_id} and drink_id in (select drink_id from saved_drinks where saved_drinks.user_id = ${user_id})
        `

        /**
         * Create the request
         */
        const request = new Request(sql_query, (err, rowCount) => {
            if (err) {
                resolve(createResponse(-1, null));
            }
        });

        /**
         * the event that is fired on every row of data that is returned from the sql call.
         */
        request.on('row', columns => {

            const row_object = {};

            columns.forEach((element) => {

                /**
                 * Getting the key value pairs to be appended to the row_object
                 */
                let col_name = element.metadata.colName
                let col_value = element.value

                let bar_drink_data = { [col_name]: col_value }

                Object.assign(row_object, bar_drink_data)
            })

            saved_bar_drinks.push(row_object)
        });

        request.on('doneProc', function (rowCount, more, returnStatus, rows) {
            resolve(createResponse(0, saved_bar_drinks))
        });

        db_connection.execSql(request);
    });

}

module.exports = { getSavedBarDrinks: getSavedBarDrinks }
