
const { Request } = require("tedious");
const { createResponse } = require('../../response')

const deleteTabDrink = async (request, db_connection) => {

    const order_num = parseInt(request.params.order_num);
    
    return await new Promise((resolve, reject) => {

        const sql_query = `
            delete from tab_drinks where order_num = ${order_num}
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


module.exports = { deleteTabDrink }