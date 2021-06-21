
'use strict';
const {Session} = require("@shopify/shopify-api/dist/auth/session");

const redis = require("redis");
const { promisify } = require("util");


const client = redis.createClient();
client.on("error", function(error) {
    console.error(error);
});

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);
module.exports =class RedisStore {

    //     getAsync;
    //     setAsync;
    //     delAsync;
    //
    // constructor() {
    //     // Create a new redis client
    //     this.client = redis.createClient();
    //
    //
    //     // Use Node's `promisify` to have redis return a promise from the client methods
    //     this.getAsync = promisify(this.client.get).bind(this.client);
    //     this.setAsync = promisify(this.client.set).bind(this.client);
    //     this.delAsync = promisify(this.client.del).bind(this.client);
    // }


    /*
      The storeCallback takes in the Session, and sets a stringified version of it on the redis store
      This callback is used for BOTH saving new Sessions and updating existing Sessions.
      If the session can be stored, return true
      Otherwise, return false
    */

    async storeCallback(session, {sid = this.loadCallback(24), maxAge = 1000000} = {}, ctx) {
        try {

            // let reply =   await this.redis.set(`SESSION:${session.id}`, JSON.stringify(session));

            let reply = await  setAsync(session.id, JSON.stringify(session))

            console.log(session);
            return true;
            // Use redis set EX to automatically drop expired sessions
            return reply;
        } catch (err) {
            throw new Error(err);
        }

    }


    /*
      The loadCallback takes in the id, and uses the getAsync method to access the session data
       If a stored session exists, it's parsed and returned
       Otherwise, return undefined
    */

    async loadCallback(id) {
        try {

            let reply = await getAsync(id);
            // let reply = await this.redis.get(id);
            console.log(reply);
            if (reply) {
                return JSON.parse(reply);
            } else {
                return false;
            }

        } catch (err) {
            throw new Error(err);
        }
    };

    /*
      The deleteCallback takes in the id, and uses the redis `del` method to delete it from the store
      If the session can be deleted, return true
      Otherwise, return false
    */


    async deleteCallback(id, ctx) {
        try {
            // return await this.redis.del(`SESSION:${id}`);
            return await delAsync(id)
        } catch (err) {
            throw new Error(err);
        }
    }
}

