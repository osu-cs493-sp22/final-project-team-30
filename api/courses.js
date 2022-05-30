const router = require("express").Router();

const { validateAgainstSchema } = require("../lib/validation");
const fastcsv = require("fast-csv");
const fs = require("fs");
const ws = fs.createWriteStream("out.csv");

const {
	CourseSchema,
	getCoursesPage,
	CreateNewCourse,
	getCourseById,
	updateCourse,
	deleteCourse,
	getStudentById,
	getEnrollmentById,
	enrollStudentbyID,
	unenrollStudentbyID,
	updateEnrollmentById,
	getAssignmentByCourseId,
	getCourseByInsId,
	getCourseByStuId,
	generateStudentsCSVById,
	getAssignmentIDByCourseID,
	saveCSVFile,
	getStudentsByCourseID,
	getCSVDownloadStreamById,
} = require("../models/courses");

const { requireAuthentication } = require("../lib/auth.js");

// fetch the list of all courses
// get /courses
router.get("/", async (req, res) => {
	try {
		const coursePage = await getCoursesPage(parseInt(req.query.page) || 1);

		coursePage.links = {};
		if (coursePage.page < coursePage.totalPages) {
			coursePage.links.nextPage = `/courses?page=${coursePage.page + 1}`;
			coursePage.links.lastPage = `/courses?page=${coursePage.totalPages}`;
		}
		if (coursePage.page > 1) {
			coursePage.links.prevPage = `/courses?page=${coursePage.page - 1}`;
			coursePage.links.firstPage = `/courses?page=1`;
		}
		res.status(200).send(coursePage);
	} catch (err) {
		console.error(err);
		res.status(500).send({
			error: "Error fetching courses list. Plsase try again.",
		});
	}
});

// create new course
// post /courses
router.post("/", requireAuthentication, async (req, res) => {
	if (req.admin != "admin") {
		if (parseInt(req.body.courseID) !== req.user) {
			res
				.status(403)
				.send({ error: "unauthorized to access the specified resources" });
		}
	} else {
		if (validateAgainstSchema(req.body, CourseSchema)) {
			try {
				const id = await CreateNewCourse(req.body);
				res.status(201).send({
					id: id,
					links: {
						course: `/courses/${id}`,
					},
				});
			} catch (err) {
				console.error(err);
				res.status(403).send({
					error: "Error inserting course into DB.  Please try again later.",
				});
			}
		} else {
			res.status(400).send({
				error: "Request body is not a valid course object.",
			});
		}
	}
});

// fetch data about a specific course
// get /courses/{id}
router.get("/:id", async (req, res, next) => {
	try {
		const course = await getCourseById(parseInt(req.params.id));
		if (course) {
			res.status(200).send(course);
		} else {
			next();
		}
	} catch (err) {
		console.error(err);
		res.status(500).send({
			error: "Unable to fetch course.  Please try again later.",
		});
	}
});

// update data for a specific course
// patch /courses/{id}
router.patch("/:id", requireAuthentication, async (req, res, next) => {
	if (!req.admin) {
		if (parseInt(req.params.courseID) !== req.user) {
			res
				.status(403)
				.send({ error: "unauthorized to access the specified resources" });
		}
	}
	if (validateAgainstSchema(req.body, CourseSchema)) {
		try {
			const id = parseInt(req.params.id);
			const updateSuccessful = await updateCourse(id, req.body);
			if (updateSuccessful) {
				res.status(200).send({
					links: {
						course: `/courses/${id}`,
					},
				});
			} else {
				next();
			}
		} catch (err) {
			console.error(err);
			res.status(500).send({
				error: "Unable to update course.  Please try again later.",
			});
		}
	} else {
		res.status(400).send({
			error: "Request body is not a valid course object",
		});
	}
});

// remove a specific course from the database
// delete /courses/{id}
router.delete("/:id", requireAuthentication, async (req, res, next) => {
	if (!req.admin) {
		if (parseInt(req.body.courseID) !== req.user) {
			res
				.status(403)
				.send({ error: "unauthorized to access the specified resources" });
		}
	}
	try {
		const deleteSuccessful = await deleteCourse(parseInt(req.params.id));
		if (deleteSuccessful) {
			res.status(204).end();
		} else {
			next();
		}
	} catch (err) {
		console.error(err);
		res.status(404).send({
			error: "Unable to delete course.  Please try again later.",
		});
	}
});

// fetch a list of the students enrolled in the course
// get/courses/{id}/students
router.get("/:id/students", requireAuthentication, async (req, res, next) => {
	if (req.admin != "admin" && req.user != req.params.id) {
		res
			.status(403)
			.send({ error: "unauthorized to access the specified resources" });
	}
	try {
		const id = parseInt(req.params.id);
		const studentID = await getStudentById(id);
		res.status(200).send({ students: studentID });
	} catch (err) {
		console.error(err);
		res.status(404).send({
			error: "Error for find student in this course. Please try again later.",
		});
	}
});

// post/ coures/{id}/students
// update enrollment for a course
// post/ coures/{id}/students
router.post(
	"/:courseid/students",
	requireAuthentication,
	async (req, res, next) => {
		if (req.admin != "admin" && req.user != req.params.id) {
			res
				.status(403)
				.send({ error: "unauthorized to access the specified resources" });
		} else {
			const results = {};
			results.add = [];
			results.remove = [];
			if (req.body.add) {
				console.log(req.body.add.length);
				for (var i = 0; i < req.body.add.length; i++) {
					var body = {
						studentID: req.body.add[i],
						courseID: req.params.courseid,
					};
					try {
						const id = await enrollStudentbyID(body);
						results.add.push({ id: id + " enroll success" });
					} catch (err) {
						res.status(500).send({ err: err });
					}
				}
			}
			if (req.body.remove) {
				for (var i = 0; i < req.body.remove.length; i++) {
					try {
						const id = await unenrollStudentbyID(req.body.remove[i]);
						results.remove.push({ id: id + " unenroll success" });
					} catch (err) {
						res.status(500).send({ err: err });
					}
				}

				if (results.add || results.remove) {
					res.status(200).send(results);
				} else {
					res.status(200).send(results, { notice: "empty results" });
				}
			}
		}
	}
);

// fetch a CSV file containing list of the students enrolled int the course
// get/courses/{id}/router
router.get(
	"/:courseID/roster",
	requireAuthentication,
	async (req, res, next) => {
		if (req.admin != "admin") {
			// && req.user != req.params.id
			res.status(403).send({
				error: "unauthorized to access the specified resources",
			});
		} else {
			const csv = await getStudentsByCourseID(req.params.courseID);
			if (!csv) {
				next();
			} else {
				const id = await saveCSVFile(csv);
				fastcsv.write(csv, { headers: false }).pipe(ws);
				console.log(id);
				if (!id) {
					next();
				} else {
					getCSVDownloadStreamById(id)
						.on("file", (file) => {
							res.status.prototype("text/csv");
						})
						.on("error", (err) => {
							if (err.code === "ENOENT") {
								next();
							} else {
								next(err);
							}
						})
						.pipe(res);
				}
			}
		}
	}
);

// fetch a list of the assignments for the course
// get courses/{id}/assignments
router.get("/:courseID/assignments", async (req, res, next) => {
	try {
		const result = await getAssignmentIDByCourseID(req.params.courseID);
		res.status(200).send(result);
	} catch (err) {
		res.status(500).send({ err: err });
	}
});

module.exports = router;
