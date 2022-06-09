const router = require('express').Router();
const crypto = require('crypto');
const e = require('express');
const fs = require('fs');
const { optionalAuthentication, requireAuthentication } = require('../lib/auth');

const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

exports.router = router

const {
	insertNewCourse,
	updateCourseById,
	deleteCourseById,
	getCourseById,
	getCoursePage,
	courseSchema,
	getCourseStudents,
	getCourseAssignments,
	updateCourseStudents,
	studentUpdateSchema,
	studentToCsv
} = require('../models/course');

/*
 * Route to post a new course
 */
router.post('/', optionalAuthentication, requireAuthentication, async function (req, res) {
	//Check if user is admin
	if (req.user && req.user.role == 'admin') {

		if (validateAgainstSchema(req.body, courseSchema)) {
			const id = await insertNewCourse(req.body)
			res.status(201).json({
				id: id,
				links: {
					course: '/courses/' + id
				}
			})
		} else {
			res.status(400).json({
				error: "Request body is not a valid course object"
			})
		}
	} else {
		res.status(403).send({
            error: "The request was not made by an authenticated User"
        })
	}
})

/*
 * Route to get a page for a course
 */
router.get('/', async (req, res) => {
  try {
	// Get page
    const coursePage = await getCoursePage(parseInt(req.query.page) || 1);

	// Generate HATEOAS links for surrounding pages.
    coursePage.links = {};
    if (coursePage.page < coursePage.totalPages) {
      coursePage.links.nextPage = `/courses?page=${coursePage.page + 1}`;
      coursePage.links.lastPage = `/courses?page=${coursePage.totalPages}`;
    }
    if (coursePage.page > 1) {
      coursePage.links.prevPage = `/courses?page=${coursePage.page - 1}`;
      coursePage.links.firstPage = '/courses?page=1';
    }
    
	// Send Page
    res.status(200).send(coursePage);
  } catch (err) {
		console.error(err);
		res.status(500).send({
			error: "Error fetching courses list.  Please try again later."
		})
  	}
})


/*
 * Route to get a course by ID
 */
router.get('/:id', async function (req, res, next) {
	const course = await getCourseById(req.params.id)
	if (course) {
		res.status(200).send(course)
	} else {
		next();
	}
})

/*
 * Route to update a course by ID
 */
router.put('/:id', optionalAuthentication, requireAuthentication, async function (req, res, next) {
	// Check if admin or instructor
	if ( req.user.role == 'admin' || req.user.id.toString() == req.body.instructorId ) {
		if (validateAgainstSchema(req.body, courseSchema)) {
			const updateSuccessful = await updateCourseById(req.params.id, req.body)
			if (updateSuccessful) {
				res.status(204).send();
			} else {
				next();
			}
		} else {
			res.status(400).send({
				err: "Request body does not contain a valid course"
			})
		}
	} else {
		res.status(403).send({
            error: "The request was not made by an authenticated User"
        })
	}
})

/*
 * Route to delete a course by ID
 */
router.delete('/:id', optionalAuthentication, requireAuthentication, async function (req, res, next) {
	if (req.user.role == 'admin') {
		const deleteSuccessful = await deleteCourseById(req.params.id)
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
});

/*
 * Route to get all students enrolled in a course (Currently not connectd to users)
 */
router.get('/:id/students', optionalAuthentication, requireAuthentication, async function (req, res, next) {
	const course = await getCourseById(req.params.id)
	//Check if course exists
	if (course) {

		// Check if admin or instructor
		if ( ( req.user && req.user.role == 'admin' ) || ( req.user && req.user.id == course.instructorId) ) {

			const students = await getCourseStudents(req.params.id)
			if(students) {
				res.status(200).json({
					students: students
				})
			} else {
				next()
			}
		} else {
			res.status(403).send({
				error: "The request was not made by an authenticated User"
			})
		}
	} else {
		next()
	}
})

/*
 * Route to get all assignments connected to a course
 */
router.get('/:id/assignments', async function(req, res, next) {
	const assignments = await getCourseAssignments(req.params.id)
	if (assignments) {
		res.status(200).json({
			assignments: assignments
		})
	} else {
		next()
	}
})

/*
 * Route to update students enrolled in a course
 */
router.patch('/:id/students', optionalAuthentication, requireAuthentication, async function(req, res, next) {
	const course = await getCourseById(req.params.id)
	//Check if course exists
	if (course) {
		// Check if admin or instructor
		if ( req.user.role == 'admin' || req.user.id.toString() == course.instructorId ) {
			if (validateAgainstSchema(req.body, studentUpdateSchema)) {
				const updateSuccessful = await updateCourseStudents(req.params.id, req.body)
				if (updateSuccessful) {
					res.status(200).send()
				} else {
					next()
				}
			} else {
				res.status(400).json({
					err: "The request body was either not present or did not contain proper fields"
				})
			}
		} else {
			res.status(403).send({
				error: "The request was not made by an authenticated User"
			})
		}
	} else {
		next()
	}
})

/*
 * Route to download a CSV roster for a course
 */
router.get('/:id/roster', optionalAuthentication, requireAuthentication, async function(req, res, next) {
	const courseId = req.params.id
	const course = await getCourseById(courseId)
	//Check if course exists
	if (course) {

		// Check if admin or instructor
		if ( req.user.role == 'admin' || req.user.id.toString() == course.instructorId) {

			students = await getCourseStudents(courseId)
			if (students) {
				/* Prepare csv file */
				csvFile = await studentToCsv(students)
				randomStuff = crypto.pseudoRandomBytes(16).toString('hex')
				path = `${__dirname}/downloads/studentRoster` + randomStuff + `.csv`

				/* Create dir if doesnt already exists */
				if (!fs.existsSync(`${__dirname}/downloads`)){
					fs.mkdirSync(`${__dirname}/downloads`)
				}

				/* Write the file to the server so we can download it as a csv*/
				fs.writeFile(path, csvFile, 'utf8', function(err) {
					if (err) {
						res.status(500).json({
							err: "There was a problem writing the csv file",
							errorMessage: err
						})
					} else {
						/* Send the data along with the file as the attachment */
						res.attachment(path)
						res.status(200).send(csvFile)				
					}
				})
			} else {
				next()
			}

		} else {
			res.status(403).send({
				error: "The request was not made by an authenticated User"
			})
		}

	} else {
		next()
	}
})
