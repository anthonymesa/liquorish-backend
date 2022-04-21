

/**
 * Returns a status and value where the value is an array of bar drinks
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const getBarDrinks = async (request, db_connection) => {

  const bar_id = request.params.bar_id;
  const bar_list = [];

  return new Promise((resolve, reject) => {

    const sql_query = `
    select
        drink_data.drink_id,
        bar_drinks.bar_drink_id,
        drink_data.drink_name,
        drink_data.description,
        bar_drinks.price
    from bar_drinks inner join (
            select *
        from drink
        where drink.drink_id in (
              select bar_drinks.drink_id
        from bar_drinks
        where bar_id = ${bar_id}
            )
          ) as drink_data
        on bar_drinks.drink_id = drink_data.drink_id
    where bar_drinks.bar_id = ${bar_id}
    `

    /**
     * Create the request
     */
    const request = new Request(sql_query, (err, rowCount) => {
      if(err)
      {
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

        let bar_drink_data = {[col_name]: col_value}

        Object.assign(row_object, bar_drink_data)
      })

      bar_list.push(row_object)
    });

    request.on('doneProc', function (rowCount, more, returnStatus, rows) {
      resolve(createResponse(0, bar_list))
    });

    db_connection.execSql(request);
  });

}

module.exports = { getBarDrinks: getBarDrinks }
