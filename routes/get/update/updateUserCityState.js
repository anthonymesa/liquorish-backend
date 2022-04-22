
/**
 * Comments here
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../../response')

const updateUserCityStateForm = () => {
  let c = "Content-Type': 'text/html'";

  c += '<h3>Update:</h3><form action="updateCityState" method="post">';
  c += 'User-ID: <input type="text" name="userId" placeholder="User Id"><br/><br/>';
  c += ' City: &nbsp;<input type="text" name="city" placeholder="City"><br/>';
  c += ' State: &nbsp;<input type="text" name="state" placeholder="State"><br/>';
  c += '<p><input type="submit" value="Update User"></p>';
  c += '</form>';
  return c;
}

const updateUserCityState = async (request, db_connection) => {
  //user_id, city, state
  const id = parseInt(request.payload.userId);
  const city = request.payload.city;
  const state = request.payload.state;
  // const state = request.form.state;
  const update = `UPDATE users SET address_city = '${city}', address_state = '${state}' WHERE id = ${id}`;
  console.log(update);
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

module.exports = { updateUserCityStateForm, updateUserCityState }