const mysql = require("mysql");

const { Session } = require("@shopify/shopify-api/dist/auth/session");

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'shopify_app'
});

connection.connect();

let domain = '';

async function storeCallback(session) {
    try {
        let data = session;
        console.log(data);

        data.onlineAccessInfo = JSON.stringify(session.onlineAccessInfo);

        if(data.id.indexOf(`${data.shop}`) > -1) {
            domain = data.id;
        }

        connection.query(`INSERT INTO shops (shop, session_id, domain_id, accessToken, scope, state, isOnline, onlineAccessInfo) VALUES ('${data.shop}','${data.id}','${domain}','${data.accessToken}','${data.scope}','${data.state}','${data.isOnline}','${data.onlineAccessInfo}') ON DUPLICATE KEY UPDATE session_id='${data.id}',accessToken='${data.accessToken}',domain_id='${domain}',scope='${data.scope}',state='${data.state}',onlineAccessInfo='${data.onlineAccessInfo}'`,
            function(error, results, fields) {
                if(error) throw error;
            });
        return true;
    } catch(err) {
        if(err) throw err;
    }
}

async function loadCallback(id) {
    try {
        const session = new Session(id);

        let query = new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM shops WHERE session_id='${id}' OR domain_id='${id}' LIMIT 1`, 
            function(error, results, fields) {
                session.shop = results[0].shop;
                session.state = results[0].state;
                session.isOnline = results[0].isOnline == "true" ? true : false;
                session.onlineAccessInfo = results[0].onlineAccessInfo;
                session.accessToken = results[0].accessToken;
                session.scope = results[0].scope;

                const date = new Date();
                date.setDate(date.getDate() + 1);
                session.expires = date;

                resolve();
            });
        });
         

        await query;
        return session;
    } catch(err) {
        if(err) throw err;
    }
}

async function deleteCallback(id) {
    try {
        return false;
    } catch(err) {
        if(err) throw err;
    }
}

module.exports = {
    storeCallback,
    loadCallback,
    deleteCallback
}