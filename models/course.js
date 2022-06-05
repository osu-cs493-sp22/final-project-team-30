const { ObjectID, GridFSBucket, ObjectId } = require('mongodb')

const { getDbReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields for a course object
 */
const courseSchema = {
	subject: {required: true},
	courseCode: {required: true}, 
	section: {required: true},
	name: {required: true},
	description: {required: true},
	teacher: {required: true},
	students: {required: false}
}

/*
 * Schema describing fields for updating student enrollment
 */
const studentUpdateSchema = {
	add: {required: true},
	remove: {required: true}
}

exports.studentUpdateSchema = studentUpdateSchema
exports.courseSchema = courseSchema

/*
 * Insert an course into the db
 */
exports.insertNewCourse = async function insertNewCourse(course) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('courses');

	// Get only valid information
	course = extractValidFields(course, courseSchema);

	// Put into the db and return the id of the inserted course
	const result = await collection.insertOne(course)
	return result.insertedId
}

/*
 * Get information about an course
 */
exports.getCourseById = async function getCourseById(id) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('courses');

	if (!ObjectId.isValid(id)) {
        return null
	}

	// Search the collection for an course matching the ID
	const course = await collection.aggregate([
		{ $match: { _id: new ObjectId(id) } },
	]).toArray()

	return course[0]
}

/*
 * Update an course
 */
exports.updateCourseById = async function updateCourse(id, course) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('courses');

	if (!ObjectId.isValid(id)) {
        return null
	}

	const newCourseValues = {
		subject: course.subject,
		courseCode: course.courseCode,
		section: course.section,
		name: course.name,
		description: course.description,
		teacher: course.teacher,
		students: course.students
	}
	
	// Update
	const result = await collection.replaceOne({
		_id: new ObjectId(id) },
		newCourseValues
	);

	// If > 0 then update was successful
	return result.matchedCount > 0;
}

/*
 * Delete an course from the db
 */
exports.deleteCourseById = async function deleteCourseById(id) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('courses');

    if (!ObjectId.isValid(id)) {
        return null
	}
	
	// Delete the corresponding course
	const result = await collection.deleteOne({
		_id: new ObjectId(id)
	});

	// If > 0 then delete was successful
	return result.deletedCount > 0;
}

/*
 * Get a page when the user requests to see course list
 */
exports.getCoursePage = async function getCoursePage(page) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('courses');

	// Count the total # of courses in the DB
	const count = await collection.countDocuments();

	// Calculate pagination values
	const pageSize = 10;
	const lastPage = Math.ceil(count / pageSize);
	page = page < 1 ? 1 : page;
	const offset = (page - 1) * pageSize;

	// Get page
	const results = await collection.find({})
		.sort({ _id: 1 })
		.skip(offset)
		.limit(pageSize)
		.toArray();

	return {
		courses: results,
		page: page,
		totalPages: lastPage,
		pageSize: pageSize,
		count: count
	};	
}

/*
 * Lists the userId's of students taking a course
 */
exports.getCourseStudents = async function getCourseStudents(id) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('courses');

    if (!ObjectId.isValid(id)) {
        return null
	}

	// Find the
	const courseStudents = await collection.aggregate([
		{ $match: { _id: new ObjectId(id) } }
	]).toArray()

	// Check if there was any result, if not this will go to 404
	if (courseStudents[0] === undefined) {
		return null
	}

	// Check if there are any students in the course, if not return empty arr
	if (courseStudents[0].students === undefined) {
		return []
	}
	
	// If we get here there should be students
	return courseStudents[0].students
}

/*
 * Lists the assignments in a given course
 */
exports.getCourseAssignments = async function getCourseAssignments(id) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('courses');	

    if (!ObjectId.isValid(id)) {
        return null
	}

	// Find the course
	const course = await collection.aggregate([
		{ $match: { _id: new ObjectId(id) } },
		{
			$lookup: {
				from: "assignments",
				localField: "_id",
				foreignField: "courseId",
				as: "assignments"
			}
		}
	]).toArray()

	return course[0].assignments
}

/*
 * Updates student enrollments in a course
 */
exports.updateCourseStudents = async function updateCourseStudents(id, studentArr) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('courses');

    if (!ObjectId.isValid(id)) {
        return null
	}
	// Delete students from existing course
	const remResult = await collection.updateOne(
		{ _id: new ObjectId(id ) },
		{ $pull: { students: { $in: studentArr.remove}}}
	)

	// Add student arr to existing course
	const addResult = await collection.updateOne(
		{ _id: new ObjectId(id) },
		{ $push: { students: { $each: studentArr.add }} }
	)

	return (remResult.matchedCount > 0 && addResult.matchedCount > 0)
}