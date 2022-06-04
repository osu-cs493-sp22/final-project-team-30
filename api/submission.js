const router = require('express').Router()

const { validateAgainstSchema } = require('../lib/validation')
const { submissionSchema, insertNewSubmission, getSubmissionById, updateSubmissionGrade } = require('../models/submission')
const { requireAuthentication, optionalAuthentication } = require('../lib/auth')

exports.router = router

router.get('/:id', optionalAuthentication, requireAuthentication, async function (req, res, next) {
	const submission = await getSubmissionById(req.params.id)

	if (submission) {
		if (req.user.id != submission.studentId || req.user.role != "admin") {
			res.status(403).send({
				error: "The request was not made by an authenticated User"
			})
		} else {
			res.status(200).send(submission)
		}
	} else {
		next()
	}
})

router.put('/:id', optionalAuthentication, requireAuthentication, async function (req, res, next) {
	const submission = await getSubmissionById(req.params.id)

	if (submission) {
		if (req.user.role == "student") {
			res.status(403).send({
				error: "The request was not made by an authenticated User"
			})
		} else {
			if (validateAgainstSchema(req.body, submissionSchema) && req.body.grade) {
				const updateSuccessful = await updateSubmissionGrade(req.params.id, req.body.grade)
				if (updateSuccessful) {
					res.status(204).send();
				} else {
					next();
				}
			} else {
				res.status(400).send({
					err: "Request body does not contain a valid submission"
				})
			}
		}
	} else {
		next()
	}
})
