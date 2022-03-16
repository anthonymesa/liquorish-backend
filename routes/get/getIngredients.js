
/**
 * Gets the ingredients of a drink
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const getIngredients = async (request, db_connection) => {

  const drink_id = request.params.drink_id

  return await new Promise((resolve, reject) => {

    let ingredient_table = new Array();

    const sql_query = `
      select * 
      from ingredients 
      where ingredient_id in (
        select ingredients_id
        from drink_ingredients 
        where drink_id = ${drink_id}
      )
    `

    const request = new Request(sql_query, (err, rowCount) => {
      if (err) {
        resolve(createResponse(-1, null))
      }
    });

    request.on('row', columns => {

      let ingredient_data = {};
      columns.forEach(element => {
     
        let col_name = element.metadata.colName
        let col_value = element.value

        let ingredient_value_pair = {[col_name]: col_value}

        Object.assign(ingredient_data, ingredient_value_pair)
      });

      ingredient_table.push(ingredient_data);
    });

    request.on('doneProc', (rowCount, more, returnStatus, rows) => {
      return resolve(createResponse(0, ingredient_table));
    });

    db_connection.execSql(request);
  });
}

module.exports = { getIngredients }