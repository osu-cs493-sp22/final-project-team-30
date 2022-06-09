const router = require('express').Router()
const bcrypt = require('bcryptjs')

const { validateAgainstSchema } = require('../lib/validation')
const { userSchema, insertNewUser, getUserById, getUserByEmail } = require('../models/users')
const { generateAuthToken, requireAuthentication, optionalAuthentication } = require('../lib/auth')

exports.router = router

router.post('/', optionalAuthentication, async function (req, res) {
    if (req.user.role != "admin" && req.body.role != "student") {
        res.status(403).send({
            error: "The request was not made by an authenticated User"
        })
    } else {
        if (validateAgainstSchema(req.body, userSchema)) {
            const id = await insertNewUser(req.body)
            res.status(201).send({
                _id: id
            })
        } else {
            res.status(400).send({
                error: "Request body does not contain a valid User."
            })
        }
    }
})

router.post('/login', async function (req, res) {
    if (req.body && req.body.email && req.body.password) {
        const user = await getUserByEmail(req.body.email)
        const authenticated = user && await bcrypt.compare(
            req.body.password,
            user.password
        )
        if (authenticated) {
            const token = generateAuthToken(user._id.toString(), user.role )
            res.status(200).send({ token: token })
        } else {
            res.status(401).send({
                error: "Invalid credentials"
            })
        }
    } else {
        res.status(400).send({
            error: "The request body was either not present or did not contain all of the required fields."
        })
    }
})

router.get('/:id',optionalAuthentication, requireAuthentication, async function (req, res, next) {
    if (req.user.id != req.params.id && req.user.role != "admin") {
        res.status(403).send({
            error: "The request was not made by an authenticated User"
        })
    } else {
        const user = await getUserById(req.params.id)
        console.log("== req.headers:", req.headers)
        if (user) {
            res.status(200).send(user)
        } else {
            next()
        }
    }
})
