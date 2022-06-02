const router = require('express').Router();

const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

exports.router = router

const {
	insertNewCourse,
	updateCourseById,
	deleteCourseById,
	getCourseById,
	getCoursePage,
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
 * Route to get a course by ID
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
 * Route to update a course by ID
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

/*
 * Route to delete a course by ID
 */
router.delete('/:courseId', async function (req, res, next) {
	const deleteSuccessful = await deleteCourseById(req.params.courseId)
	if (deleteSuccessful) {
		res.status(204).end();
	} else {
		next();
	}
});

/*
 * Route to get a page for a course
 */
router.get('/', async function(req, res) {
	// Get page based on results
	const results = await getCoursePage(parseInt(req.query.page) || 1);
	coursePage = results.courses
	currPage = results.page
	lastPage = results.lastPage
	numPerPage = results.pageSize
	totalCount = results.totalCount

	
	// Generate HATEOAS links for surrounding pages.
	const links = {};
	if (currPage < lastPage) {
		links.nextPage = `/courses?page=${currPage + 1}`;
		links.lastPage = `/courses?page=${lastPage}`;
	}
	if (currPage > 1) {
		links.prevPage = `/courses?page=${currPage - 1}`;
		links.firstPage = '/courses?page=1';
	}

	// Send back response
	res.status(200).json({
		courses: coursePage,
		pageNumber: currPage,
		totalPages: lastPage,
		pageSize: numPerPage,
		totalCount: totalCount,
		links: links
	  });
})