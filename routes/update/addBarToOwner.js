
/**
 * Comments here
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const addBarToOwnerForm = () => {
  let c = "Content-Type': 'text/html'";

  c += '<h3>Add BAr:</h3><form action="addBar" method="post">';
  c += 'User-ID: <input type="text" name="userId" placeholder="User Id"><br/><br/>';
  c += ' City: &nbsp;<input type="text" name="city" placeholder="City"><br/>';
  c += ' State: &nbsp;<input type="text" name="state" placeholder="State"><br/>';
  c += '<p><input type="submit" value="Update User"></p>';
  c += '</form>';
  return c;
}
const addBarToOwner = async (request, db_connection) => {
  //user_id, city, state
 // const id = parseInt(request.payload.userId);

  const owner_id= request.payload.owner_id;
  const bar_id= request.payload.bar_id;
  
 
  // const state = request.form.state;
  
  const insert = "INSERT INTO [dbo].[bar_owner](owner_id, bar_id)";
  const values = `${owner_id}, ${bar_id})`;
  

//    const update = `UPDATE users SET address_city = '${city}', address_state = '${state}' WHERE id = ${id}`;
  console.log(insert);
  return new Promise((resolve, reject) => {
    //  Create dabase request to count from test table (should be 1)
    const request = new Request(insert,
      (err, rowCount) => {
        if (err) {
          console.log(err);
          resolve(createResponse(-1, null));
        } else {
          console.log(rowCount);
          resolve(createResponse(0, rowCount == 1));
        }
      }
    );

    db_connection.execSql(request);
  });
}


module.exports = { addBarToOwnerForm, addBarToOwner }