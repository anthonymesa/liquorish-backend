
/**
 * Returns an status and value where the value is an array of bars
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const getTabDrinks = async (request, db_connection) => {

  const user_id = request.params.user_id;
  const bar_id = request.params.bar_id;

  return await new Promise((resolve, reject) => {

    let tab_drinks = []

    const sql_query = `    
    select
        drink.drink_id,
        drink.drink_name,
        drink.description,
        bar_drinks.price,
        tab_drinks.ready_status
    from 
        (((drink inner join bar_drinks 
            on drink.drink_id = bar_drinks.drink_id)
        inner join tabs 
            on tabs.bar_id = bar_drinks.bar_id)
        inner join tab_drinks on 
            tabs.tab_id = tab_drinks.tab_id and 
            bar_drinks.bar_drink_id = tab_drinks.bar_drink_id)
    where tabs.user_id = 2 and bar_drinks.bar_id = 2`

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

        let drink_data = {[col_name]: col_value}

        Object.assign(drink, drink_data)
      });
      tab_drinks.push(drink)
    });

    request.on('doneProc', function (rowCount, more, returnStatus, rows) {
      return resolve(createResponse(0, tab_drinks));
    });

    db_connection.execSql(request);
  });
}

module.exports = { getTabDrinks: getTabDrinks }
