
/**
 * Comments here
 * 
 */

 const { Request } = require("tedious");
 const { createResponse } = require('../../response')
 
 const updateTab = async (request, db_connection) => {
 
     const tab_id = parseInt(request.payload.tab_id);
     const bdId = parseInt(request.payload.bar_drink_id);
 
     const update = `insert into tab_drinks (tab_id, bar_drink_id) values (${tab_id}, ${bdId} )`;
     
     return new Promise((resolve, reject) => {
         //  Create dabase request to count from test table (should be 1)
         const request = new Request(update,
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
 
 module.exports = { updateTab: updateTab }