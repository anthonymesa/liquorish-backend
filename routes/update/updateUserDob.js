
/**
 * Comments here
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const updateUserDobForm = () => {
  let c = "Content-Type': 'text/html'";

  c += '<h3>Update:</h3><form action="updateDOB" method="post">';
  c += 'Use-ID: <input type="text" name="userId" placeholder="userid"><br/><br/>';
  c += ' DOB: &nbsp;<input type="text" name="dob" placeholder="dob"><br/>';
  c += '<p><input type="submit" value="Update Birthdate"></p>';
  c += '</form>';
  return c;
}

const updateUserDob = async (request, db_connection) => {
  //user_id, city, state
  const userId = parseInt(request.payload.userId);
  const dob = request.payload.dob;
  // const state = request.form.state;
  const update = `UPDATE users SET birth_date = '${dob}' WHERE id = ${userId}`;
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

module.exports = { updateUserDobForm, updateUserDob }