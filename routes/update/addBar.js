
/**
 * Comments here
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const addBarForm = () => {
  let c = "Content-Type': 'text/html'";

  c += '<h3>Add BAr:</h3><form action="addBar" method="post">';
  c += 'User-ID: <input type="text" name="userId" placeholder="User Id"><br/><br/>';
  c += ' City: &nbsp;<input type="text" name="city" placeholder="City"><br/>';
  c += ' State: &nbsp;<input type="text" name="state" placeholder="State"><br/>';
  c += '<p><input type="submit" value="Update User"></p>';
  c += '</form>';
  return c;
}
const addBar = async (request, db_connection) => {
  //user_id, city, state
 // const id = parseInt(request.payload.userId);

  const bar_name= request.payload.barName;
  const address_street= request.payload.addressStreet;
  const address_city= request.payload.addressCity;
  const address_state= request.payload.addressState;
  const address_zip= request.payload.addressZip;
  const gps_lat= request.payload.gpsLat;
  const gps_lon= request.payload.gpsLon;
  const description= request.payload.description;
  const password = request.payload.password;
  // const state = request.form.state;
  console.log("Bar Name", request.payload);
  const insert = "INSERT INTO bar (bar_name, address_street, address_city, address_state, address_zip, gps_lat, gps_lon, description)";
  const values = `VALUES ('${bar_name}', '${address_street}', '${address_city}', '${address_state}', '${address_zip}', '${gps_lat}', '${gps_lon}', '${description}')`;
  

//    const update = `UPDATE users SET address_city = '${city}', address_state = '${state}' WHERE id = ${id}`;
  console.log(values);
  return new Promise((resolve, reject) => {
    //  Create dabase request to count from test table (should be 1)
    const request = new Request(insert+values,
      (err, rowCount) => {
        if (err) {
          console.log(err);
          resolve(createResponse(-1, null));
        } else {
          console.log(rowCount);
          resolve(async() =>{
             getLastInsertID(request,db_connection);
          });
        }
      }
    );

    db_connection.execSql(request);
  });
}


module.exports = { addBarForm, addBar }