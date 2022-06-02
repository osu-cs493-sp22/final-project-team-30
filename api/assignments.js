const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto')

const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

const {
	insertNewAssignment,
	updateAssignmentById,
	deleteAssignmentById,
	getAssignmentById,
	assignmentSchema, 
} = require('../models/assignment');

exports.router = router;

/*
 * Route to post a new assignment
 */
router.post('/', async function (req, res) {
	if (validateAgainstSchema(req.body, assignmentSchema)) {
		const assignment = extractValidFields(req.body, assignmentSchema);
		const id = await insertNewAssignment(req.body)
		res.status(201).json({
			id: id,
			links: {
				assignment: '/assignments/' + id
			}
		})
	} else {
		res.status(400).json({
			error: "Request body is not a valid assignment object"
		})
	}
})
