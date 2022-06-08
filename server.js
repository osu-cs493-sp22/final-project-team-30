const express = require('express')
const morgan = require('morgan')
const api = require('./api')
const { connectToDb } = require("./lib/mongo")

//const { optionalAuthentication } = require('./lib/auth')
//const { applyRateLimit } = require('./ratelimiter')

const app = express()
const port = process.env.PORT || 8000

//app.use(applyRateLimit)
//app.use(optionalAuthentication)

app.use(morgan('dev'))
app.use(express.json())

connectToDb(async () => {
  // exports.upload = require("./lib/multer").initializeMulter()
  app.use('/', api)

  app.use('*', function (req, res, next) {
    res.status(404).json({
      error: "Requested resource " + req.originalUrl + " does not exist"
    })
  })

  app.use("*", (err, req, res, next) => {
    console.error(err)
    res.status(500).send({
      err: "An error occurred. Try again later.",
    })
  });

  app.listen(port, function() {
    console.log("== Server is running on port", port)
  })
})
