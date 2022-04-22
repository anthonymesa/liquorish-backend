// // 

/**
 * Returns an status and value where the value is an array of bars
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const getBarOrders = async (request, db_connection) => {

    const bar_id = request.params.bar_id;

    return await new Promise((resolve, reject) => {

        let bar_orders = []

        const sql_query = `    
            select 
                order_num,
                tab_id,
                bar_drinks.bar_drink_id,
                ready_status,
                drink.drink_id,
                price,
                drink_name,
                [description]
            from ((
            select * 
            from tab_drinks 
            where tab_id in (
                select tab_id 
                from tabs 
                where bar_id = ${bar_id}
                )
            ) as bar_orders inner join bar_drinks
            on bar_drinks.bar_drink_id = bar_orders.bar_drink_id) 
            inner join drink on drink.drink_id = bar_drinks.drink_id
        `

        const request = new Request(sql_query, (err, rowCount) => {
            if (err) {
                resolve(createResponse(-1, null));
            }
        });

        request.on('row', columns => {

            let drink = {}
            columns.forEach(element => {

                let col_name = element.metadata.colName
                let col_value = element.value

                let drink_data = { [col_name]: col_value }

                Object.assign(drink, drink_data)
            });
            bar_orders.push(drink)
        });

        request.on('doneProc', function (rowCount, more, returnStatus, rows) {
            return resolve(createResponse(0, bar_orders));
        });

        db_connection.execSql(request);
    });
}

module.exports = { getBarOrders: getBarOrders }
