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
	
	// Delete the corresponding course
	const result = await collection.deleteOne({
		_id: new ObjectId(id)
	});

	// If > 0 then delete was successful
	return result.deletedCount > 0;
}

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

exports.getCourseStudents = async function getCourseStudents(id) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('courses');

	// Without this if someone enters a wrong id thats less chars it crashes..
	if (id.length < 24) {
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

exports.getCourseAssignments = async function getCourseAssignments(id) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('courses');	

	// Without this if someone enters a wrong id thats less chars it crashes..
	if (id.length < 24) {
		return null
	}

	// Find the
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

	return course[0]
}
