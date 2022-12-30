# ![tmpauth js](https://raw.githubusercontent.com/tmpim/tmpauth-client-js/master/tmpauth-js.png)
simple abstract tmpauth client for javascript

runs anywhere, minimal dependencies, 100% test coverage

## supported runtimes
 - cloudflare workers ([example](https://github.com/tmpim/tmpauth-client-js/tree/master/examples/cloudflare-workers-hono/hono.ts))
 - nodejs ([example](https://github.com/tmpim/tmpauth-client-js/tree/master/examples/nodejs-express/app.ts))
 - aws lambda ([example](https://github.com/tmpim/tmpauth-client-js/tree/master/examples/aws-lambda-api-gateway/app.ts))
 - bun (no example cuz bun is a meme)

## supported web frameworks
 - hono ([example](https://github.com/tmpim/tmpauth-client-js/tree/master/examples/cloudflare-workers-hono/hono.ts))
 - express ([example](https://github.com/tmpim/tmpauth-client-js/tree/master/examples/nodejs-express/app.ts))
 - api gateway ([example](https://github.com/tmpim/tmpauth-client-js/tree/master/examples/aws-lambda-api-gateway/app.ts))
 - itty router (maybe later)

## supported identity caches
 - cloudflare workers kv ([example](https://github.com/tmpim/tmpauth-client-js/blob/master/examples/cloudflare-workers-hono/hono.ts#L16))
 - dynamodb ([example](https://github.com/tmpim/tmpauth-client-js/tree/master/examples/aws-lambda-api-gateway/app.ts#L12))

## todo (prs welcome)
 - more identity cache implementations
   - memory
   - redis
 - more web frameworks / examples thereof
 - status endpoint
