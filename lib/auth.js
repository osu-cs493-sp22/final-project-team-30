const jwt = require("jsonwebtoken");
const secretKey = "SuperSecret123";

exports.generateAuthToken = function (userId, adminAccess) {
	const payload = { sub: userId, role: adminAccess };
	return jwt.sign(payload, secretKey, { expiresIn: "24h" });
};

exports.requireAuthentication = function (req, res, next) {
	/*
	 * Authorization: Bearer <token>
	 */
	const authHeader = req.get("Authorization") || "";
	const authHeaderParts = authHeader.split(" ");
	const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null;

	try {
		const payload = jwt.verify(token, secretKey);
		req.user = payload.sub;
		req.admin = payload.role;
		next();
	} catch (err) {
		res.status(401).send({ error: "Invalid authentication token. " });
	}
};

exports.registrationAdminAuthentication = function (req, res, next) {
	/*
	 * Authorization: Bearer <token>
	 */
	if (req.body.role == "admin" || req.body.role == "instructor") {
		const authHeader = req.get("Authorization") || "";
		const authHeaderParts = authHeader.split(" ");
		const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null;
		try {
			const payload = jwt.verify(token, secretKey);
			req.user = payload.sub;
			req.admin = payload.role;
		} catch (err) {
			res.status(401).send({ error: "Invalid authentication token. " });
		}
	}

	if (req.body.role != "admin" || req.body.role != "instructor") {
		next();
	}
};

exports.studentAuthentication = function (req, res, next) {
	if (req.body.role == "student") {
		console.log("Checker is student");
		next();
	}
	if (req.body.role == "admin") {
		console.log("Checker is admin");
		next();
	}
	if (req.body.role == "instructor") {
		console.log("Checker is instructor");
		next();
	}
	if (
		req.body.role != "student" ||
		req.body.role != "admin" ||
		req.body.role == "instructor"
	) {
		res.status(400).send({ error: "Invalid input of role value in body" });
	}
};
