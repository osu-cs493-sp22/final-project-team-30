const router = require('express').Router();

const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

exports.router = router;

const {
	insertNewAssignment,
	updateAssignmentById,
	deleteAssignmentById,
	getAssignmentById,
	assignmentSchema, 
} = require('../models/assignment');

/*
 * Route to post a new assignment
 */
router.post('/', async function (req, res) {
	if (validateAgainstSchema(req.body, assignmentSchema)) {
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

/*
 * Route to get an assignment by ID
 */
router.get('/:assignmentId', async function (req, res, next) {
	const assignment = await getAssignmentById(req.params.assignmentId)
	if (assignment) {
		res.status(200).send(assignment)
	} else {
		next();
	}
})

/*
 * Route to update an assignment by ID
 */
router.put('/:assignmentId', async function (req, res, next) {
	if (validateAgainstSchema(req.body, assignmentSchema)) {
		const updateSuccessful = await updateAssignmentById(req.params.assignmentId, req.body)
		if (updateSuccessful) {
			res.status(204).send();
		} else {
			next();
		}
	} else {
		res.status(400).send({
			err: "Request body does not contain a valid assignment"
		})
	}
})

router.delete('/:assignmentId', async function (req, res, next) {
	const deleteSuccessful = await deleteAssignmentById(req.params.assignmentId)
	if (deleteSuccessful) {
		res.status(204).end();
	} else {
		next();
	}
});