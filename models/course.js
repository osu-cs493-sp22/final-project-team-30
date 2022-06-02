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
exports.getCourseById = async function getCourseById(courseId) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('courses');

	// Search the collection for an course matching the ID
	const course = await collection.aggregate([
		{ $match: { _id: new ObjectId(courseId) } },
	]).toArray()

	return course[0]
}

/*
 * Update an course
 */
exports.updateCourseById = async function updateCourse(courseId, course) {
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
		_id: new ObjectId(courseId) },
		newCourseValues
	);

	// If > 0 then update was successful
	return result.matchedCount > 0;
}

/*
 * Delete an course from the db
 */
exports.deleteCourseById = async function deleteCourseById(courseId) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('courses');
	
	// Delete the corresponding course
	const result = await collection.deleteOne({
		_id: new ObjectId(courseId)
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
	const pageSize = 2;
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