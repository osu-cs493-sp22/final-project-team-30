const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto')
const express = require('express')
const fs = require('fs')

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
router.post('/', async function (req, res) {
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
router.put('/:id', async function (req, res, next) {
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
})

/*
 * Route to delete a course by ID
 */
router.delete('/:id', async function (req, res, next) {
	const deleteSuccessful = await deleteCourseById(req.params.id)
	if (deleteSuccessful) {
		res.status(204).end();
	} else {
		next();
	}
});

/*
 * Route to get all students enrolled in a course (Currently not connectd to users)
 */
router.get('/:id/students', async function(req, res, next) {
	const students = await getCourseStudents(req.params.id)
	if(students) {
		res.status(200).send(students)
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
router.patch('/:id/students', async function(req, res, next) {
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
})

/*
 * Route to download a CSV roster for a course
 */
router.get('/:id/roster', async function(req, res, next) {
	students = await getCourseStudents(req.params.id)
	if (students) {
		csvFile = await studentToCsv(students)
		path = `${__dirname}/uploads/studentRoster.csv`

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
})
