const router = require("express").Router();

const validation = require("../lib/validation");

const {
	userSchema,
	createUser,
	validateUser,
	getUserbyEmail,
	getInstructorbyID,
	getAdminbyID,
	getStudentCoursebyID,
} = require("../models/users");
const {
	generateAuthToken,
	registrationAdminAuthentication,
	requireAuthentication,
} = require("../lib/auth");

router.post("/", registrationAdminAuthentication, async (req, res, next) => {
	if (
		req.admin == "admin" &&
		(req.body.role == "admin" || req.body.role == "instructor")
	) {
		if (validation.validateAgainstSchema(req.body, userSchema)) {
			try {
				const id = await createUser(req.body);
				res.status(201).send({ id: id });
			} catch (err) {
				res.status(500).send({ error: err });
			}
		} else {
			res.status(400).json({
				error: "Request body is not a valid user object",
			});
		}
	}
	console.log(req.admin);
	if (typeof req.admin == "undefined" && req.body.role == "student") {
		if (validation.validateAgainstSchema(req.body, userSchema)) {
			try {
				const id = await createUser(req.body);
				res.status(201).send({ id: id });
			} catch (err) {
				res.status(500).send({ error: err });
			}
		} else {
			res.status(400).json({
				error: "Request body is not a valid user object",
			});
		}
	}
	if (
		!(typeof req.admin == "undefined" && req.body.role == "student") &&
		!(
			req.admin == "admin" &&
			(req.body.role == "admin" || req.body.role == "instructor")
		)
	) {
		res.status(403).send({
			err:
				"The request was not made by an authenticate user satisfying the authorization criteria.",
		});
	}
});

router.post("/login", async (req, res, next) => {
	if (req.body && req.body.email && req.body.password) {
		try {
			const authenticated = await validateUser(
				req.body.email,
				req.body.password
			);
			if (authenticated) {
				const id = await getUserbyEmail(req.body.email, false);
				var token = generateAuthToken(id.userID, id.role);
				res.status(200).send({ token: token });
			} else {
				res.status(401).send({ error: "Invalid authentication credentials." });
			}
		} catch (err) {
			res.status(500).send({ error: err });
		}
	} else {
		res
			.status(400)
			.send({ error: "Request body needs a user ID and password" });
	}
});

/*
 * User must provide the id with the appropriate role or else no output 
 	will be provided
 */
router.get("/:id", requireAuthentication, async (req, res, next) => {
	if (req.user !== parseInt(req.params.id)) {
		res.status(403).send({
			err:
				"The request was not made by an authenticated User satisfying the authorization criteria",
		});
	}

	if (req.admin == "admin") {
		if (req.user == parseInt(req.params.id)) {
			try {
				const userDetail = await getAdminbyID(req.params.id, false);
				if (userDetail) {
					res.status(200).send(userDetail);
				} else {
					next();
				}
			} catch (err) {
				res.status(500).send({ errr: err });
			}
		}
	}

	if (req.admin == "student") {
		if (req.user == parseInt(req.params.id)) {
			try {
				const userDetail = await getStudentCoursebyID(req.params.id, false);
				if (userDetail) {
					res.status(200).send(userDetail);
				} else {
					next();
				}
			} catch (err) {
				res.status(500).send({ errr: err });
			}
		}
	}

	if (req.admin == "instructor") {
		if (req.user == parseInt(req.params.id)) {
			try {
				const userDetail = await getInstructorbyID(req.params.id, false);
				if (userDetail) {
					res.status(200).send(userDetail);
				} else {
					next();
				}
			} catch (err) {
				res.status(500).send({ errr: err });
			}
		}
	}
});
module.exports = router;
