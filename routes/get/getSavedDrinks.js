
/**
 * getSavedDrinks.js
 * Author: Anthony Mesa
 * 
 * The getSavedDrinks function gets a list of the user's favorited drinks. 
 * 
 * First, what SQL query will we need to do this? We can log into the Azure
 * Portal and connect to the query editor to write/test for the correct SQL:
 * 
 *  select * from drink where drink_id in (
 *    select drink_id from saved_drinks where user_id = 2
 *  )
 * 
 * Next, we create the getSavedDrinks function and its export function.
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

/**
 * getSavedDrinks will be exported as a module and available for reference in 
 * server.js where it will be assigned to an API route.
 * 
 * This function asynchronously creates and returns a Promise object that will
 * be resolved when the database call is complete. This avoids returning the call
 * before the data has been obtained from the database call.
 * 
 * In the Promise, a Request object provided by the 'tedious' library - unrelated
 * to this function's '_api_request' parameter - is created. Then event handlers 
 * are defined for the Request so that once the request is run using the '_db_conn'
 * database connection object, the request is able to build our data dynamically
 * and, once finished, resolve the promise with said data.
 * 
 * Inside this funciton you will see how it is split into 4 major parts. That is:
 * 
 * 1. PULLING THE VARIABLES FROM GET URL
 * 2. CREATING SQL REQUEST OBJECT
 * 3. DEFINING EVENT HANDLERS FOR SQL REQUEST OBJECT
 * 4. EXECUTING SQL REQUEST OBJECT
 * 
 * @param {*} _api_request 
 * @param {*} _db_conn 
 * @returns 
 */
const getSavedDrinks = async (_api_request, _db_conn) => {

  /**
   * PULLING VARIABLES FROM GET URL
   */
  const user_id = _api_request.params.user_id

  return new Promise((resolve, reject) => {

    /**
     * CREATING SQL REQUEST OBJECT
     */

    const sql_query = `
      select * from drink where drink_id in (
        select drink_id from saved_drinks where user_id = ${user_id}
      )
    `
    const tedious_request = new Request(sql_query, (err, rowCount) => {
      if (err) {
        resolve(createResponse(-1, null))
      }
    });

    /**
     * DEFINING EVENT HANDLERS FOR SQL REQUEST OBJECT
     */

    const saved_drinks = []

    tedious_request.on('row', columns => {

      let saved_drink = {};

      columns.forEach(element => {
     
        let col_name = element.metadata.colName
        let col_value = element.value

        let drink_value_pair = {[col_name]: col_value}

        Object.assign(saved_drink, drink_value_pair)
      });

      saved_drinks.push(saved_drink);
    });

    tedious_request.on('doneProc', (rowCount, more, returnStatus, rows) => {
      return resolve(createResponse(0, saved_drinks));
    });

    /**
     * EXECUTING SQL REQUEST OBJECT
     */

    _db_conn.execSql(tedious_request);
  })
}

/**
 * EXPORT GET SAVED DRINKS FOR USE IN SERVER.JS
 * 
 * The value to the left will be the reference used in server.js, where the right
 * value is the name of the function we are trying to export.
 */

module.exports = { getSavedDrinks: getSavedDrinks }