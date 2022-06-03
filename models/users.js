const { ObjectID, GridFSBucket, ObjectId } = require('mongodb')

const { getDbReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const bcrypt = require('bcryptjs')

/*
 * Schema describing required/optional fields for a user object
 */
const userSchema = {
	name: {required: true},
	email: {required: true},
	password: {required: true}, 
	role: {required: true}
}

exports.userSchema = userSchema

/*
 * Insert new user
 */
exports.insertNewUser = async function insertNewUser(user) {
	// Open up the db
	const db = getDbReference();
	const collection = db.collection('users');

	// Get valid user information and hash password
    const userToInsert = extractValidFields(user, userSchema)
    userToInsert.password = await bcrypt.hashSync(userToInsert.password, 8)

	// Put into the db and return the id of the inserted course
	const result = await collection.insertOne(userToInsert)
	return result.insertedId
}
/*
 *  Get a user by Id 
 */
exports.getUserById = async function (id) {
    const db = getDbReference()
    const collection = db.collection('users')
    if (!ObjectId.isValid(id)) {
        return null
    } else {
        const user = await collection
            .findOne({ _id: new ObjectId(id) }, {projection: {password: 0}})
        const role = user.role
        let results = null
        
        if (role == "instructor") {
            results = await collection.aggregate([
                { $match: { _id: new ObjectId(id) } },
                {
                    $lookup: {
                        from: "courses",
                        localField: "_id",
                        foreignField: "instructor",
                        pipeline: [{ $project: {_id: 1}}],
                        as: "courses"
                    },
                    // $project: {"_id": "$_id"}
                }
            ]).toArray()
            return results[0]
        } else if (role == "student") {
            results = await collection.aggregate([
                { $match: { _id: new ObjectId(id) } },
                {
                    $lookup: {
                        from: "courses",
                        localField: "_id",
                        foreignField: "_id",
                        pipeline: [{ $project: {_id: 1}}],
                        as: "courses"
                    }
                },
                { $project: { password: 0 }}
            ]).toArray()
            return results[0]
        } else {
            return user
        }
    }
}

/*
 *  Get a user by Email 
 */
exports.getUserByEmail = async function(email) {
    const db = getDbReference()
    const collection = db.collection('users')
    const user = await collection
        .findOne({ email: email })
    return user
}
