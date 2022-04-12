
/**
 * Comments here
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const addOwnerForm = () => {
  let c = "Content-Type': 'text/html'";

  c += '<h3>Add BAr:</h3><form action="addBar" method="post">';
  c += 'User-ID: <input type="text" name="userId" placeholder="User Id"><br/><br/>';
  c += ' City: &nbsp;<input type="text" name="city" placeholder="City"><br/>';
  c += ' State: &nbsp;<input type="text" name="state" placeholder="State"><br/>';
  c += '<p><input type="submit" value="Update User"></p>';
  c += '</form>';
  return c;
}
const addOwner = async (request, db_connection) => {

  const name_first= request.payload.name_first;
  const name_last= request.payload.name_last;
  const email= request.payload.email;
 
  
    const insert = `INSERT INTO owner(name_first, name_last, email) values('${name_first}', '${name_last}', '${email}')`;
  
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


module.exports = { addOwnerForm, addOwner }