
/**
 * Returns an status and value where the value is an array of bars
 * 
 */

 const { Request } = require("tedious");
 const { createResponse } = require('../../response')
 
 const getIsSaved = async (request, db_connection) => {
 
   const user_id = request.params.user_id;
   const drink_id = request.params.drink_id;
 
   return await new Promise((resolve, reject) => {
  
     const sql_query = `    
     select 
        * 
     from 
        saved_drinks 
    where user_id = ${user_id} and drink_id = ${drink_id}
     where tabs.user_id = 2 and bar_drinks.bar_id = 2
     `
 
     const request = new Request(sql_query, (err, rowCount) => {
       if (err) {
         resolve(createResponse(-1, null));
       } else if (rowCount == 0){
            resolve(createResponse(0, false))
       } else if (rowCount == 1) {
           resolve(createResponse(0, true))
       }
     });
 
     db_connection.execSql(request);
   });
 }
 
 module.exports = { getIsSaved: getIsSaved }
 