const Redis = require("ioredis");
const { Store } = require("koa-session2");
const {Session} = require("@shopify/shopify-api/dist/auth/session");
class RedisStore extends Store {
    constructor() {
        super();
        this.redis = new Redis();
    }
    async storeCallback(session,  { sid =  this.loadCallback(24), maxAge = 1000000 } = {}, ctx) {
        try {
            console.log(session.id);
            console.log('session');
            // let reply =   await this.redis.set(`SESSION:${session.id}`, JSON.stringify(session));

            let reply =   await this.redis.set(session.id, JSON.stringify(session));

            console.log(reply); return true;
            // Use redis set EX to automatically drop expired sessions
            return reply;
        } catch (err) {
            throw new Error(err)
        }
        return sid;
    }

    async loadCallback(id) {
        try {
        console.log('loadCallback');
        console.log(id);
        let reply = await this.redis.get(`SESSION:${id}`);
        // let reply = await this.redis.get(id);
        console.log(reply);
        if (reply) {
            return JSON.parse(reply);
        } else {
            return JSON.parse([])
        }
        } catch (err) {
            throw new Error(err)
        }

    }






    async deleteCallback(id, ctx) {
        try {
        // return await this.redis.del(`SESSION:${id}`);
        return await this.redis.del(id);
    } catch (err) {
        throw new Error(err)
    }
    }

}

module.exports = RedisStore;