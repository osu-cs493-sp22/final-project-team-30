const { ObjectID, GridFSBucket, ObjectId } = require('mongodb')

const { getDbReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields for an assignment object.
 */
const assignmentSchema = {
	dueDate: {required: true},
	courseId: {required: true},
	title: {required: true},
	description: {required: false}
}

exports.assignmentSchema = assignmentSchema

/*
 * Insert an assignment into the db
 */
exports.insertNewAssignment = async function insertNewAssignment(assignment) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('assignments');

	// Get only valid information
	assignment = extractValidFields(assignment, assignmentSchema);

	// Put into the db and return the id of the inserted assignment
	const result = await collection.insertOne(assignment)
	return result.insertedId
}

/*
 * Get information about an assignment
 */
exports.getAssignmentById = async function getAssignmentById(assignmentId) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('assignments');

	// Search the collection for an assignment matching the ID
	const assignment = await 
}

/*
 * Update an assignment
 */
exports.updateAssignmentById = async function updateAssignment(id, assignment) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('assignments');

	const newAssignmentValues = {
		dueDate: assignment.dueDate,
		courseId: assignment.courseId,
		title: assignment.title,
		description: assignment.description
	}

	// Find the old assignment
	const oldAssignment = await collection.aggregate([
		{ $match: { _id: new ObjectId(id) } }, 
	]).toArray()

	// Check to make sure course ids are consistent. Change if not.
	if (oldAssignment) {
		if (oldAssignment[0].courseId != newAssignmentValues.courseId) {
			newAssignmentValues.courseId = oldAssignment[0].courseId
		}
	}

	// Finally, update
	const result = await collection.replaceOne({
		_id: new ObjectId(id) },
		newAssignmentValues
	);
	
	// If > 0 then update was successful
	return result.matchedCount > 0;
}

/*
 * Delete an assignment from the db
 */
exports.deleteAssignmentById = async function deleteAssignmentById(id) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('assignments');
	
	// Delete the corresponding assignment
	const result = await collection.deleteOne({
		_id: new ObjectId(id)
	});

	// If > 0 then delete was successful
	return result.deletedCount > 0;
}
