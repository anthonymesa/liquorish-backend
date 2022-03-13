
/**
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const getIngredients = async (request, db_connection) => {

  return await new Promise((resolve, reject) => {

    let ingredient_table = new Array();
    const sql_query = `
            select * from ingredients
        `

    const request = new Request(sql_query, (err, rowCount) => {
      if (err) {
        resolve(createResponse(-1, null))
      }
    });

    request.on('row', columns => {
      let ingredient_data = new Array();

      columns.forEach(element => {
        ingredient_data.push(element.value);
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