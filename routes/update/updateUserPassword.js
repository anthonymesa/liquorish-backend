
/**
 * Comments here
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const updateUserPasswordForm = () => {
  let c = "Content-Type': 'text/html'";

  c += '<h3>Update:</h3><form action="updatePassword" method="post">';
  c += 'Use-ID: <input type="text" name="user_id" placeholder="userid"><br/><br/>';
  c += ' Current Pass: &nbsp;<input type="text" name="curr_pass_hash" placeholder="curr_pass_hash"><br/>';
  c += ' New Pass: &nbsp;<input type="text" name="new_pass_hash" placeholder="curr_pass_hash"><br/>';
  c += '<p><input type="submit" value="Update Password"></p>';
  c += '</form>';
  return c;
}

const updateUserPassword = async (request, db_connection) => {
  //user_id, curr_pass_hash, new_pass_hash  

  const userId = parseInt(request.payload.user_id);
  const currPass = request.payload.curr_pass_hash;
  const newPass = request.payload.new_pass_hash;
  const update = `UPDATE users_pass SET password = '${newPass}' WHERE users_id = ${userId} AND password='${currPass}'`;
  console.log(update);
  return new Promise((resolve, reject) => {
    //  Create dabase request to count from test table (should be 1)
    const request = new Request(update,
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

module.exports = { updateUserPasswordForm, updateUserPassword }