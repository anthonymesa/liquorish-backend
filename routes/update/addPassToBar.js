
/**
 * Comments here
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const addPassToBarForm = () => {
  let c = "Content-Type': 'text/html'";

  c += '<h3>Add BAr:</h3><form action="addBar" method="post">';
  c += 'User-ID: <input type="text" name="userId" placeholder="User Id"><br/><br/>';
  c += ' City: &nbsp;<input type="text" name="city" placeholder="City"><br/>';
  c += ' State: &nbsp;<input type="text" name="state" placeholder="State"><br/>';
  c += '<p><input type="submit" value="Update User"></p>';
  c += '</form>';
  return c;
}
const addPassToBar = async (request, db_connection) => {
  //user_id, city, state
 // const id = parseInt(request.payload.userId);

  const id= request.payload.bar_id;
  const pass= request.payload.password;
  
 
  // const state = request.form.state;
  
    const insert = `INSERT INTO bar_pass(bar_id, password) values (${bar_id}, '${password}')`;  

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


module.exports = { addPassToBarForm, addPassToBar }