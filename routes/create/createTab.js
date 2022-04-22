const { Request } = require("tedious");
const { createResponse } = require('../../response');
const getTabID = require("../get/getTabID");


const createTabForm = () => {
    let c = "Content-Type': 'text/html'";

    c += '<h3>Update:</h3><form action="createTab" method="post">';
    c += 'user_id: <input type="text" name="user_id" placeholder="User Id"><br/><br/>';
    c += 'bar_id: &nbsp;<input type="text" name="bar_id" placeholder="Bar ID"><br/>';
    c += '<p><input type="submit" value="create Tab"></p>';
    c += '</form>';
    return c;
}



const createTab = async (request, db_connection) => {

    const bar_id = parseInt(request.payload.bar_id);
    const user_id = parseInt(request.payload.user_id);
    let tabObject = {};

    return await new Promise((resolve, reject) => {
        const sql_query = `
            insert into tabs(bar_id,user_id) values( ${bar_id}, ${user_id} )`;
        
        return new Promise((resolve, reject) => {
            let retVal = -1;
            const request = new Request(sql_query,
                (err, rowCount) => {
                    if (err) {
                        console.log(err);
                        resolve(createResponse(-1, null));
                    } else if (rowCount != 1) {
                        resolve(createResponse(-1, null));
                    } else {
                        console.log("This ran so far");
                        request.addParameter("user_id", String,`${user_id}`)
                        request.addParameter("bar_id", String, `${bar_id}`)
                        resolve(createResponse(0,getTabID(request, db_connection)));
                        //resolve(createResponse(0, retVal));
                    }
                }
            );
            db_connection.execSql(sql_query);
        });
    });
}



module.exports = { createTab, createTabForm}