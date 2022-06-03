/*
 * Module for rate limiting with Redis
 */
const redis = require('redis')

const redisHost = process.env.REDIS_HOST || 'localhost'
const redisPort = process.env.REDIS_PORT || '6379'
const redisUrl =  `redis://${redisHost}:${redisPort}`

const redisClient = redis.createClient({
   url: redisUrl
})


const rateLimitWindowMS = 60000
const rateLimitMaxRequests = 5


async function connectToRedis(callback) {
   redisClient.connect().then(callback)
}
exports.connectToRedis = connectToRedis


/*
 * Express middleware that enforces a Rate limit for the API
 */
async function rateLimit(req, res, next) {
   const ip = req.ip
   const now = Date.now()
   
   // Check for cached token bucket
   let tokenBucket
   try { 
      tokenBucket = await redisClient.hGetAll(ip)
      console.log(parseFloat(tokenBucket.tokens))
   } catch (err) {
      next() // Not ideal for security but prevents entire API
      return // being unreachable without Redis
   } 
  
   // Create new token bucket of convert Redis strings to numbers
   tokenBucket = {
      tokens: parseFloat(tokenBucket.tokens) || rateLimitMaxRequests,
      last: parseInt(tokenBucket.last) || now
   }
        
   // Calculate new token quantity and elapsed time
   const ellapsedMs = now - tokenBucket.last
   tokenBucket.tokens += ellapsedMs * (rateLimitMaxRequests / rateLimitWindowMS)
   tokenBucket.tokens = Math.min(rateLimitMaxRequests, tokenBucket.tokens)
   tokenBucket.last = now
      

   if (tokenBucket.tokens >= 1) {
      // Subtract token, reinsert and continue processing request
      tokenBucket.tokens -= 1
      await redisClient.hSet(ip, [
         ['tokens', tokenBucket.tokens],
         ['last', tokenBucket.last]
      ])
      next()
   } else {
      // Reinsert token bucket, send error and stop request
      await redisClient.hSet(ip, [
         ['tokens', tokenBucket.tokens],
         ['last', tokenBucket.last]
      ])
      res.status(429).send({
         err: "Too many Requests per mintue"
      })
   }
    

}

exports.rateLimit = rateLimit
