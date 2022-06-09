const router = require('express').Router();
const crypto = require("crypto")
const multer = require("multer")

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
	getAssignmentSubmissions,
	saveSubmissionFile,
	updateSubmissionFileUrl
} = require('../models/submission');

const {	getCourseStudents, getCourseById } = require('../models/course');

const fileTypes = {
	'application/pdf': 'pdf',
	'image/jpeg': 'jpg',
	'image/png': 'png'
  }
  
  const upload = multer({
	  storage: multer.diskStorage({
	  destination: `${__dirname}/../uploads`,
	  filename: function(req, file, callback) {
		const ext = fileTypes[file.mimetype]
		const filename = crypto.pseudoRandomBytes(16).toString('hex')
		callback(null,`${filename}.${ext}`)
	  }
	}),
	fileFilter: function (req, file, callback) {
	  callback(null, !!fileTypes[file.mimetype])
	}
  })

/*
 * Route to post a new assignment
 */
router.post('/', optionalAuthentication, requireAuthentication, async function (req, res) {
	//check to make sure valid body before checking if auth user to make sure courseId is in body
	if (validateAgainstSchema(req.body, assignmentSchema)) {
		const course = await getCourseById(req.body.courseId)

		// Check if admin or instructor
		if ( ( req.user && req.user.role == 'admin' ) || ( req.user && req.user.id == course.instructorId ) ) {
			const id = await insertNewAssignment(req.body)
			res.status(201).json({
				id: id,
				links: {
					assignment: '/assignments/' + id
				}
			})
		} else {
			res.status(403).send({
				error: "The request was not made by an authenticated User"
			})
		}
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
router.put('/:assignmentId', optionalAuthentication, requireAuthentication, async function (req, res, next) {
	//check to make sure valid body before checking if auth user to make sure courseId is in body
	if (validateAgainstSchema(req.body, assignmentSchema)) {
		const course = await getCourseById(req.body.courseId)

		// Check if admin or instructor
		if ( ( req.user && req.user.role == 'admin' ) || ( req.user && req.user.id == course.instructorId ) ) {
			const updateSuccessful = await updateAssignmentById(req.params.assignmentId, req.body)
			if (updateSuccessful) {
				res.status(204).send();
			} else {
				next();
			}
		} else {
			res.status(403).send({
				error: "The request was not made by an authenticated User"
			})
		}
	} else {
		res.status(400).send({
			err: "Request body does not contain a valid assignment"
		})
	}
})

router.delete('/:assignmentId', optionalAuthentication, requireAuthentication, async function (req, res, next) {
	const assignment = await getAssignmentById(req.params.assignmentId)
	const course = await getCourseById(assignment.courseId)

	// check if assignment and course exists 
	if (assignment && course) {
		// Check if admin or instructor
		if ( ( req.user && req.user.role == 'admin' ) || ( req.user && req.user.id == course.instructorId ) ) {
			const deleteSuccessful = await deleteAssignmentById(req.params.assignmentId)
			if (deleteSuccessful) {
				res.status(204).end();
			} else {
				next();
			}
		} else {
			res.status(403).send({
				error: "The request was not made by an authenticated User"
			})
		}
	} else {
		next()
	}
});

/*
 * Route to post a new submission
 */
router.post('/:assignmentId/submissions', optionalAuthentication, requireAuthentication, upload.single('file'), async function (req, res) {
	const assignment = await getAssignmentById(req.params.assignmentId)
	const studentsInCourse= await getCourseStudents(assignment.courseId)

	if (assignment) {
		// Check if user is in course and is a student
		if (req.user.role != "student" && !studentsInCourse.includes(req.user.id)) {
			res.status(403).send({
				error: "The request was not made by an authenticated User"
			})
		} else {
			console.log(req.file);
			console.log(req.body.assignmentId);
			if (req.file && validateAgainstSchema(req.body, submissionSchema)) {
				try {
					// Create Timestamp
					const newTimestamp = new Date(Date.now())

					const submission = {
						assignmentId: req.body.assignmentId,
						studentId: req.body.studentId,
						timestamp: newTimestamp.toISOString(),
						filename: req.file.filename,
						mimetype: req.file.mimetype,
						path: req.file.path
					}

					// Save file and contents of submission
					const id = await saveSubmissionFile(submission)
					const url = `/media/submission/${id}.${fileTypes[req.file.mimetype]}`
					
					// Change the url of submission to download in future. 
					await updateSubmissionFileUrl(id, url)

					res.status(201).json({
						id: id
					})
				} catch (err) {
					console.error(err)
					res.status(500).send({
					error: "Error inserting photo into DB.  Please try again later."
					})
				}
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
	const assignment = await getAssignmentById(assignmentId)
	const course = await getCourseById(assignment.courseId)
	
	if (assignment && course) {

		if ( ( req.user && req.user.role == "admin" ) || ( req.user && req.user.id == course.instructorId ) ) {
			const submissions = await getAssignmentSubmissions(assignmentId)
			console.log(assignmentId);
			console.log(submissions);
	
			let page = parseInt(req.query.page) || 1;
			const numPerPage = 10;
			const lastPage = Math.ceil(submissions.length / numPerPage);
			page = page > lastPage ? lastPage : page;
			page = page < 1 ? 1 : page;
	
			const start = (page - 1) * numPerPage;
			const end = start + numPerPage;
			const pageSubmissions = submissions.slice(start, end)
	
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
			res.status(403).send({
				error: "The request was not made by an authenticated User"
			})
		}
	} else {
		next()
	}
})