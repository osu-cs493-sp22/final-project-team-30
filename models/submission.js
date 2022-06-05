const { ObjectId } = require('mongodb')

const { getDbReference } = require('../lib/mongo');

/*
 * Schema describing required/optional fields for a submission object
 */
const submissionSchema = {
	assignmentId: {required: true}, 
	studentId: {required: true},
	timestamp: {required: false},
    grade: {required: false},
    file: {require: true}
}

exports.submissionSchema = submissionSchema

// /*
//  * Insert new submission
//  */
// exports.insertNewSubmission = async function insertNewSubmission(submission) {
// 	// Open up the db
// 	const db = getDbReference();
// 	const collection = db.collection('submission');

// 	// Get valid submission information
//     const submissionToInsert = extractValidFields(submission, submissionSchema)
// 	const newTimestamp = new Date(Date.now())
// 	submissionToInsert.timestamp = newTimestamp.toISOString()

// 	// Put into the db and return the id of the inserted course
// 	const result = await collection.insertOne(submissionToInsert)
// 	return result.insertedId
// }

// /*
//  *  Get a submission by Id 
//  */
// exports.getSubmissionById = async function (id) {
//     const db = getDbReference()
//     const collection = db.collection('submission')
//     if (!ObjectId.isValid(id)) {
//         return null
//     } else {
//         const result = await collection
//             .findOne({ _id: new ObjectId(id) })
//         return result
//     }
// }

// /*
//  *  Delete a submission by Id 
//  */
// exports.deleteSubmissionById = async function (id) {
//     const db = getDbReference()
//     const collection = db.collection('submission')
//     if (!ObjectId.isValid(id)) {
//         return null
//     } else {
//         const result = await collection
//             .deleteOne({ _id: new ObjectId(id) })
//         return result
//     }
// }

// /*
//  *  Update a submission grade
//  */
// exports.updateSubmissionGrade = async function (id, grade) {
//     const db = getDbReference()
//     const collection = db.collection('submission')
//     if (!ObjectId.isValid(id)) {
//         return null
//     } else {
//         const result = await collection
//             .updateOne(
// 				{ _id: new ObjectId },
// 				{ $set: { grade: grade } })
//     }
// 	return result
// }

// /*
//  *  Update a submission 
//  */
// exports.updateSubmission = async function (id, submission) {
//     const db = getDbReference()
//     const collection = db.collection('submission')
//     if (!ObjectId.isValid(id)) {
//         return null
//     } else {
// 		const submissionToUpdate = extractValidFields(submission, submissionSchema)
// 		const result = await collection.replaceOne({
// 			_id: new ObjectId(id) },
// 			submissionToUpdate
// 		);
// 		return result
//     }
// }

/*
 *  Save Submission file
 */
exports.saveSubmissionFile = function (submission) {
    return new Promise(function (resolve, reject) {
        const db = getDbReference()
        const bucket = new GridFSBucket(db, { bucketName: 'submission' })
        const metadata = {
            submissionId: submission.submissionId,
            mimetype: submission.mimetype
        }
        const uploadStream = bucket.openUploadStream(submission.filename, {
            metadata: metadata
        })

        fs.createReadStream(submission.path).pipe(uploadStream)
        .on('error', function (err) {
            reject(err)
        })
        .on('finish', function (result) {
            console.log("== stream result:", result)
            resolve(result._id)
        })
    })
}

/*
 *  Get submission 
 */
exports.getSubmissionById = async function (id) {
    const db = getDbReference()
    const bucket = new GridFSBucket(db, { bucketName: 'submission' })
    if (!ObjectId.isValid(id)) {
        return null
    } else {
        const result = await bucket
            .findOne({ _id: new ObjectId(id) })
        return result
    }
}

/*
 *  Get submissions associated with an Assignment
 */
exports.getAssignmentSubmissions = async function (id) {
    const db = getDbReference()
    const bucket = new GridFSBucket(db, { bucketName: 'submission' })
    if (!ObjectId.isValid(id)) {
        return null
    } else {
        const result = await bucket
            .find({ assignmentId: new ObjectId(id) })
			.toArray()
        return result[0]
    }
}

/*
 *  Update a submission file download url
 */
exports.updateSubmissionFileUrl = async function (id, url) {
    const db = getDbReference()
    const collection = db.collection('submission.files')
    if (!ObjectId.isValid(id)) {
        return null
    } else {
        const result = await collection
            .updateOne(
				{ _id: new ObjectId(id) },
				{ $set: { "metadata.file": url } }
            )
        return result.matchedCount > 0
    }
}

/*
 *  Update a submission grade
 */
exports.updateSubmissionGrade = async function (id, grade) {
    const db = getDbReference()
    const collection = db.collection('submission.files')
    if (!ObjectId.isValid(id)) {
        return null
    } else {
        const result = await collection
            .updateOne(
				{ _id: new ObjectId },
				{ $set: { "metadata.grade": grade } }
            )
        return result.matchedCount > 0
    }
}

/*
 *  Download a submission file by Id
 */
exports.getSubmissionDownloadStreamById = function (id) {
    const db = getDbReference()
    const bucket = new GridFSBucket(db, { bucketName: 'submission' })
    if (!ObjectId.isValid(id)) {
        return null
    } else {
        return bucket.openDownloadStream(new ObjectId(id))
    }
}

