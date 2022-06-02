const router = require('express').Router();

const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

exports.router = router

const {
	insertNewCourse,
	updateCourseById,
	deleteCourseById,
	getCourseById,
	courseSchema
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
 * Route to get an course by ID
 */
router.get('/:courseId', async function (req, res, next) {
	const course = await getCourseById(req.params.courseId)
	if (course) {
		res.status(200).send(course)
	} else {
		next();
	}
})

/*
 * Route to update an course by ID
 */
router.put('/:courseId', async function (req, res, next) {
	if (validateAgainstSchema(req.body, courseSchema)) {
		const updateSuccessful = await updateCourseById(req.params.courseId, req.body)
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

router.delete('/:courseId', async function (req, res, next) {
	const deleteSuccessful = await deleteCourseById(req.params.courseId)
	if (deleteSuccessful) {
		res.status(204).end();
	} else {
		next();
	}
});