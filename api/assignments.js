const router = require('express').Router();

const { validateAgainstSchema, extractValidFields } = require('../lib/validation');
const { requireAuthentication, optionalAuthentication } = require('../lib/auth')

exports.router = router;

const {
	insertNewAssignment,
	updateAssignmentById,
	deleteAssignmentById,
	getAssignmentById,
	assignmentSchema, 
} = require('../models/assignment');

const {
	submissionSchema,
	insertNewSubmission,
	getAssignmentSubmissions
} = require('../models/submission');

const {
	getCourseStudents
} = require('../models/course');
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

/*
 * Route to post a new submission
 */
router.post('/:assignmentId/submissions', optionalAuthentication, requireAuthentication, async function (req, res) {
	const assignment = await getAssignmentById(req.params.assignmentId)
	const studentsInCourse= await getCourseStudents(assignment.courseId)

	if (assignment) {
		// Check if user is in course and is a student
		if (req.user.role != "student" && !studentsInCourse.includes(req.user.id)) {
			res.status(403).send({
				error: "The request was not made by an authenticated User"
			})
		} else {
			if (validateAgainstSchema(req.body, submissionSchema)) {
				const id = await insertNewSubmission(req.body)
				res.status(201).json({
					id: id,
					links: {
						submission: '/submission/' + id
					}
				})
			} else {
				res.status(400).json({
					error: "Request body is not a valid submission object"
				})
			}
		}
	} else {
		next()
	}
})

/*
 * Route to get submissions
 */
router.get('/:assignmentId/submissions', optionalAuthentication, requireAuthentication, async function (req, res) {
	const assignmentId = req.params.assignmentId
	if (!req.user || req.user.role == "student") {
		res.status(403).send({
			error: "The request was not made by an authenticated User"
		})
	} else {
		const assignment = await getAssignmentById(assignmentId)
		if (assignment) {
			const submissions = await getAssignmentSubmissions(assignmentId)

			let page = parseInt(req.query.page) || 1;
			const numPerPage = 10;
			const lastPage = Math.ceil(submissions.length / numPerPage);
			page = page > lastPage ? lastPage : page;
			page = page < 1 ? 1 : page;
		
			const start = (page - 1) * numPerPage;
			const end = start + numPerPage;
			const pageSubmissions = submissions.slice(start, end);
		
			// Generate HATEOAS links for surrounding pages.
			const links = {};
			if (page < lastPage) {
				links.nextPage = `/${assignmentId}/submissions?page=${page + 1}`;
				links.lastPage = `/${assignmentId}/submissions?page=${lastPage}`;
			}
			if (page > 1) {
				links.prevPage = `/${assignmentId}/submissions?page=${page - 1}`;
				links.firstPage = `/${assignmentId}/?page=1`;
			}
		
			res.status(200).json({
				submissions: pageSubmissions,
				pageNumber: page,
				totalPages: lastPage,
				pageSize: numPerPage,
				totalCount: submissions.length,
				links: links
			});
		
		} else {
			next()
		}
	}
})