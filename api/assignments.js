const router = require("express").Router();
const validation = require("../lib/validation");
const multer = require("multer");
const {
	generateAuthToken,
	registrationAdminAuthentication,
	requireAuthentication,
} = require("../lib/auth");
const {
	assignmentSchema,
	createAssignment,
	getAssignmentbyID,
	getCoursebyID,
	getassignmentPage,
	updateAssignment,
	deleteAssignment,
	getInstructorIDbyAssignmentID,
	getSubmitbyID,
	createSubmit,
	saveSubmit,
	updateAssignments,
} = require("../models/assignments");
const crypto = require("crypto");

const upload = multer({
	storage: multer.diskStorage({
		destination: `${__dirname}/uploads`,
		filename: (req, file, callback) => {
			const basename = crypto.pseudoRandomBytes(16).toString("hex");
			const extension = "pdf";
			callback(null, `${basename}.${extension}`);
		},
	}),
	fileFilter: (req, file, callback) => {
		callback(null, file.mimetype.includes("pdf"));
	},
});

// create a new assignment
router.post("/", requireAuthentication, async (req, res, next) => {
	if (req.admin == "admin") {
		if (validation.validateAgainstSchema(req.body, assignmentSchema)) {
			try {
				const id = await createAssignment(req.body);
				res.status(201).send({
					id: id,
				});
			} catch (err) {
				res.status(500).send({
					error: err,
				});
			}
		} else {
			res.status(400).json({
				error: "request body is not a valid object",
			});
		}
	}
});

// fetch data about a specific assignment
router.get("/:id", async (req, res) => {
	const id = parseInt(req.params.id);
	const assignment = await getAssignmentbyID(id);
	res.status(200).send(assignment);
});

// update data about a specific assignment
router.patch("/:id", requireAuthentication, async (req, res) => {
	if (req.admin == "instructor") {
		if (req.body.courseId) {
			console.log("instructor can update assignments");
			try {
				const id = parseInt(req.params.id);
				const assignmentID = await getAssignmentbyID(id);
				const courseID = parseInt(assignmentID.courseID);
				const course = await updateAssignments(courseID);

				if (course.instructor == req.user) {
					const results = await updateAssignment(
						req.body,
						parseInt(req.params.id)
					);
					if (results) {
						res.status(200).send({
							id: id,
						});
					}
				}
			} catch (err) {
				res.status(500).send({
					error: err,
				});
			}
		} else {
			res.status(401).send({
				error: "You do not have permission to update assignments",
			});
		}
	}
	if (req.admin == "admin") {
		try {
			if (validation.validateAgainstSchema(req.body, assignmentSchema)) {
				results = await updateAssignment(req.body, parseInt(req.params.id));
				if (results) {
					console.log("ADS");
					const id = parseInt(req.params.id);
					res.status(200).send({
						id: id,
					});
				}
			} else {
				res.status(400).send({
					error: "request body is not a valid object",
				});
			}
		} catch (err) {
			res.status(500).send({
				error: err,
			});
		}
	}
});
// remove a specific assignment from the database
router.delete("/:id", requireAuthentication, async (req, res, next) => {
	if (req.admin == "admin") {
		const id = parseInt(req.params.id);
		const results = await deleteAssignment(id);
		if (results) {
			res.status(204).end();
		}
	}
	if (req.admin == "instructor") {
		const id = parseInt(req.params.id);
		const assignmentID = getAssignmentbyID(id);
		const courseID = parseInt(assignmentID.courseID);
		const course = await getCoursebyID(courseID);
		if (parseInt(course.instructor) == parseInt(req.user)) {
			const results = await deleteAssignment(id);
			if (results) {
				res.status(204).end();
			}
		}
	}
});
// fetch the list of all submissions for an assignment
// skip
router.get("/:id/submissions", requireAuthentication, async (req, res) => {
	const id = parseInt(req.params.id);
	const assignmentID = await getAssignmentbyID(id);
	console.log(assignmentID);
	const courseID = parseInt(assignmentID.courseId);
	const course = await getCoursebyID(courseID);
	console.log("asd");
	if (
		req.admin == "admin" ||
		parseInt(course.instructor) == parseInt(req.user)
	) {
		try {
			const assignmentPage = await getassignmentPage(
				parseInt(req.query.page) || 1,
				req.params.id,
				req.body.studentID
			);
			assignmentPage.links = {};
			if (assignmentPage.page < assignmentPage.totalPages) {
				assignmentPage.links.nextPage = `assignments?page=${
					assignmentPage.page + 1
				}`;
				assignmentPage.links.lastPage = `/assignments?page=${assignmentPage.totalPages}`;
			}
			if (assignmentPage.page > 1) {
				assignmentPage.links.prevPage = `/assignments?page=${
					assignmentPage.page - 1
				}`;
				assignmentPage.links.firstPage = `/assignments?page=${(assignmentPage.page = 1)}`;
			}
			res.status(200).send(assignmentPage);
		} catch (err) {
			console.error(err);
			res.status(500).send({
				error: "cannot insert assignments.",
			});
		}
	} else {
		res.status(401).send({
			error: "error for getting submissions",
		});
	}
});
// submit assignments
/*router.post("/:studentId/:assignmentid/submission", requireAuthentication, upload.single('assignment'), async (req, res) => {
	if(req.admin == "student"){
		try{
			const assignment = {
				path: req.file.path,
				filename: req.file.filename,
				contentType: req.file.mimetype,
				assignmentID: req.body.assignmentID,
				studentID: req.body.studentID,
				timestamp: req.body.timestamp
			};
			console.log(assignment);
			const id = await createSubmit(assignment);
			if(id){
				res.status(200).send({
					file: req.file
				});
			}
		} catch (err){
			console.log(err);
			res.status(400).send({error: err});
		}
	}
	else {
		res.status(403).send({
			error: "only students can submit assignments",
		});
	}
} )*/

router.post(
	"/:id/submissions",
	requireAuthentication,
	upload.single("assignment"),
	async (req, res) => {
		if (req.admin == "student" && req.body.studentID) {
			try {
				const assignment = {
					path: req.file.path,
					filename: req.file.filename,
					contentType: req.file.mimetype,
					assignmentID: req.body.assignmentID,
					studentID: req.body.studentID,
					timestamp: req.body.timestamp,
				};
				console.log(assignment);
				const id = await saveSubmit(assignment);
				if (id) {
					res.status(200).send({
						file: req.file,
					});
				}
			} catch (err) {
				console.log(err);
				res.status(400).send({ error: err });
			}
		} else {
			res.status(403).send({
				error: "only students can submit assignments",
			});
		}
	}
);

router.get(
	"/:studentId/:assignmentid/submission",
	requireAuthentication,
	async (req, res, next) => {
		if (req.admin == "admin" || req.admin == "instructor") {
			const instructorID = await getInstructorIDbyAssignmentID(
				req.params.assignmentid,
				req.params.studentId
			);

			if (req.admin == "admin") {
				try {
					const submissionPage = await getassignmentPage(
						req.query.page || 1,
						req.params.studentId,
						req.params.assignmentid
					);
					res.status(200).send({ submissionPage });
				} catch (err) {
					console.log(err);
					res.status(400).send({ err: err });
				}
			}

			if (parseInt(req.user) == parseInt(instructorID.instructorId)) {
				try {
					const submissionPage = await getassignmentPage(
						req.query.page || 1,
						req.params.studentId,
						req.params.assignmentid
					);
					res.status(200).send({ submissionPage });
				} catch (err) {
					console.log(err);
					res.status(400).send({ err: err });
				}
			} else {
				res.status(403).send({
					err:
						"The request was not made by an authenticated User satisfying the authorization criteria described above.",
				});
			}
		} else {
			res.status(403).send({
				err:
					"The request was not made by an authenticated User satisfying the authorization criteria described above.",
			});
		}
	}
);

// create a new submission for an assignment
router.post(
	"/:id/submissions",
	requireAuthentication,
	upload.single("file"),
	async (req, res) => {
		assignmentID = parseInt(req.params.id);
		if (req.file) {
			try {
				console.log(req.body);
				const submissionID = await createSubmit(req.body);
				res.status(201).send({
					submissionID: submissionID,
				});
			} catch (err) {
				res.status(500).send({
					error: err,
				});
			}
		} else {
			res.status(400).send({
				error: "request body is not a valid object",
			});
		}
	}
);

module.exports = router;
