import { Session } from '@shopify/shopify-api/dist/auth/session';
import { promisify } from 'util';
const dbSetHelper = require('../../database/dbSetHelper');
const dbGetHelper = require('../../database/dbGetHelper');

class SessionHandler {

    async storeCallback(session) {
        try {
            console.log('session to store');
            console.log(session);
            if(dbSetHelper.saveSessionForShop(session.id, JSON.stringify(session))) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            // throw errors, and handle them gracefully in your application
            throw new Error(err)
        }
    }
    async loadCallback(id) {
        try {
            var reply = await dbGetHelper.getSessionForShop(id);
            if (reply) {
                const parsedJson = JSON.parse(reply);
                var newSession = new Session(parsedJson['id']);
                newSession.shop = parsedJson['shop'];
                newSession.state = parsedJson['state'];
                newSession.isOnline = parsedJson['isOnline'];
                return newSession;
            } else {
                return undefined;
            }
        } catch (err) {
            // throw errors, and handle them gracefully in your application
            throw new Error(err)
        }
    }

    async deleteCallback(id) {
        try {
            if(dbSetHelper.deleteSessionForShop(id)) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            // throw errors, and handle them gracefully in your application
            throw new Error(err)
        }
    }
}