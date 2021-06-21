require('isomorphic-fetch');
require('typescript-require');
const dotenv = require('dotenv');
const Koa = require('koa');
const next = require('next');
const {default: createShopifyAuth} = require('@shopify/koa-shopify-auth');
const {verifyRequest} = require('@shopify/koa-shopify-auth');
const {default: Shopify, ApiVersion} = require('@shopify/shopify-api');
const Router = require('koa-router');
require('./routes/route');
// const { storeCallback, loadCallback, deleteCallback } = require("./database");
// const session = require('koa-generic-session');
// const redisStore = require('koa-redis');
// import {RedisStore} from './redis-store';
// const sessionStorage = require('./redis-store');
// const sessionStorage = new RedisStore();
//  require('./redis-store');
// const sessionStorage = new RedisStore();
// Import our custom storage class
// import RedisStore from './redis-store';

dotenv.config();


const RedisStore = require('./redis-store-2');
const sessionStorage=new RedisStore();




console.log('here');
Shopify.Context.initialize({
    API_KEY: process.env.SHOPIFY_API_KEY,
    API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
    SCOPES: process.env.SHOPIFY_API_SCOPES.split(","),
    HOST_NAME: process.env.SHOPIFY_APP_URL.replace(/https:\/\//, ""),
    API_VERSION: '2021-04',
    IS_EMBEDDED_APP: true,
    // SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
    SESSION_STORAGE: new Shopify.Session.CustomSessionStorage(
        sessionStorage.storeCallback,
        sessionStorage.loadCallback,
        sessionStorage.deleteCallback,
    ),
});

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev: dev});
const handle = app.getRequestHandler();

const ACTIVE_SHOPIFY_SHOPS = {};

app.prepare().then(() => {
    const server = new Koa();
    const router = new Router();
    server.keys = [Shopify.Context.API_SECRET_KEY];

    server.use(
        createShopifyAuth({
            accessMode: 'offline',
            afterAuth(ctx) {
                const {shop, scope} = ctx.state.shopify;
                ACTIVE_SHOPIFY_SHOPS[shop] = scope;

                if( ACTIVE_SHOPIFY_SHOPS[shop] ) {
                    ctx.redirect(`https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}/`);
                }else {
                    ctx.redirect(`/?shop=${shop}`);
                }


            },
        }),
    );

    const handleRequest = async (ctx) => {
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
        ctx.res.statusCode = 200;
    };




    router.get("(/_next/static/.*)", handleRequest);
    router.get("/_next/webpack-hmr", handleRequest);
    router.get("(.*)", verifyRequest(), handleRequest);

    server.use(router.allowedMethods());
    server.use(router.routes());

    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});