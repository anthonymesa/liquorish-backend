
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
 * @param {*} _api_request The request object provided by Hapi
 * @param {*} _db_conn The database connection object provided by Tedious
 * @returns A Promise that resolves with the requested data from the database
 */
const getSavedDrinks = async (_api_request, _db_conn) => {

  /**
   * PULLING VARIABLES FROM GET URLs
   * 
   * The '_api_request' Request object provided by Hapi contains the variables passed
   * to the API route in the url via its 'params' attribute. The url for the documentation
   * for this is here:
   * 
   * https://hapi.dev/api/?v=20.2.1#request
   */

  const user_id = _api_request.params.user_id

  /**
   * Creates a new promise that is provided an anonymous ('lambda') function 
   * as an argument. The anonymous function has two parameters, the resolve and reject
   * objects provided to the anonymous function once it is executed.
   */
  return new Promise((resolve, reject) => {

    /**
     * This is the list that we will populate with objects, each object representing
     * a row in the table that our SQL request returns.
     */
    const saved_drinks = []

    /**
     * CREATING SQL REQUEST OBJECT
     */

    const sql_query = `
      select * from drink where drink_id in (
        select drink_id from saved_drinks where user_id = ${user_id}
      )
    `

    /**
     * Creates the tedious Request object with the sql query and an anonymous function
     * callback that will execute once tedious is finished evaluating the request.
     * 
     * The anonymous function is passed two parameters on execution, err, and rowCount.
     * If err, then this Promise needs to resolve in err. We could instead use reject,
     * which in some ways may be more accurate given the situation, but we are just 
     * using resolve for now.
     * 
     * The number of rows in the result of our request is available via the rowCount parameter.
     * 
     * We are resolving with a call to createResponse provided by response.js, where the 
     * first argument is the success value, 0 or -1, and the second argument is the 
     * data that we are returning to the front end as a result of this api call. 
     */
    const tedious_request = new Request(sql_query, (err, rowCount) => {
      if (err) {
        resolve(createResponse(-1, null))
      }
    });

    /**
     * DEFINING EVENT HANDLERS FOR SQL REQUEST OBJECT
     */

    /**
     * When the data is returned from the database API call made within tedious,
     * tedious iterates across that data and emits the 'row' event for each row 
     * inside the returned data.
     * 
     * A list of column objects, each representing a single column in the row being
     * evaluated, is passed to the anonymous function handling the event. Within
     * this function we can iterate across the columns list provided and build
     * the JavaScript object that represents the row, where each column name and
     * value is a different key/value pair.
     * 
     * Appending to the row object 'saved_drink' is done using 
     * Object.assign(original_object, new_key_value_pair). Once the object is created,
     * the row object is pushed to the saved_drinks list.
     */
    tedious_request.on('row', columns => {

      let saved_drink = {};

      /**
       * Iterates across each individual column in the list of columns returned.
       * The element object contains the column information. Here we are getting the
       * column name via the metadata to use as the key for the key/value pair.
       * The value for our key/value pair is the actual value of the column object,
       * which we get with element.value.
       */
      columns.forEach(element => {
     
        let col_name = element.metadata.colName
        let col_value = element.value

        /**
         * The [col_name] syntax allows us to define the key of the object with 
         * a variable.
         */
        let drink_value_pair = {[col_name]: col_value}

        Object.assign(saved_drink, drink_value_pair)
      });

      saved_drinks.push(saved_drink);
    });

    /**
     * This is the event emitted once all row events have been handled.
     * 
     * Since the data should now be available given all of our main logic is 
     * handled in the 'on row' event, we can simply return the saved_drinks list
     * that we have dynamically generated and which contains our requested data.
     * 
     * We resolve with a status value of 0 ('successful'), and the list itself.
     */
    tedious_request.on('doneProc', (rowCount, more, returnStatus, rows) => {
      return resolve(createResponse(0, saved_drinks));
    });

    /**
     * EXECUTING SQL REQUEST OBJECT
     * 
     * Execute the sql request that we have created above now that we have defined 
     * all of our event handlers. We do this by passing the request object as an
     * argument to the database connection object's execSql call.
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