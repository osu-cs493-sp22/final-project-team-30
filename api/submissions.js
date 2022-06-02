const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto')

exports.router = router

/*
 * Multer will allow us to store files on the api server
 */ 
const upload = multer({
	storage: multer.diskStorage({
		destination: `${__dirname}/uploads`,
		filename: function (req, file, callback) {
		const ext = fileTypes[file.mimetype]
		const filename = crypto.pseudoRandomBytes(16).toString('hex')
		callback(null, `${filename}.${ext}`)
		}
	}),
	fileFilter: function (req, file, callback) {
		callback(null, !!fileTypes[file.mimetype])
	}
})

const fileTypes = {
	'application/pdf': 'pdf'
}

/* Assignment Submissions Endpoints Below */
