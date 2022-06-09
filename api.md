# The Tarpaulin API

> Version 1.0.0

API for an "alternative" to Canvas.

## Path Table

| Method | Path | Description |
| --- | --- | --- |
| POST | [/users](#postusers) | Create a new User. |
| POST | [/users/login](#postuserslogin) | Log in a User. |
| GET | [/users/{id}](#getusersid) | Fetch data about a specific User. |
| GET | [/courses](#getcourses) | Fetch the list of all Courses. |
| POST | [/courses](#postcourses) | Create a new course. |
| GET | [/courses/{id}](#getcoursesid) | Fetch data about a specific Course. |
| PATCH | [/courses/{id}](#patchcoursesid) | Update data for a specific Course. |
| DELETE | [/courses/{id}](#deletecoursesid) | Remove a specific Course from the database. |
| GET | [/courses/{id}/students](#getcoursesidstudents) | Fetch a list of the students enrolled in the Course. |
| POST | [/courses/{id}/students](#postcoursesidstudents) | Update enrollment for a Course. |
| GET | [/courses/{id}/roster](#getcoursesidroster) | Fetch a CSV file containing list of the students enrolled in the Course. |
| GET | [/courses/{id}/assignments](#getcoursesidassignments) | Fetch a list of the Assignments for the Course. |
| POST | [/assignments](#postassignments) | Create a new Assignment. |
| GET | [/assignments/{id}](#getassignmentsid) | Fetch data about a specific Assignment. |
| PATCH | [/assignments/{id}](#patchassignmentsid) | Update data for a specific Assignment. |
| DELETE | [/assignments/{id}](#deleteassignmentsid) | Remove a specific Assignment from the database. |
| GET | [/assignments/{id}/submissions](#getassignmentsidsubmissions) | Fetch the list of all Submissions for an Assignment. |
| POST | [/assignments/{id}/submissions](#postassignmentsidsubmissions) | Create a new Submission for an Assignment. |

## Reference Table

| Name | Path | Description |
| --- | --- | --- |
| User | [#/components/schemas/User](#componentsschemasuser) | An object representing information about a Tarpaulin application user.
 |
| Course | [#/components/schemas/Course](#componentsschemascourse) | An object representing information about a specific course.
 |
| Assignment | [#/components/schemas/Assignment](#componentsschemasassignment) | An object representing information about a single assignment.
 |
| Submission | [#/components/schemas/Submission](#componentsschemassubmission) | An object representing information about a single student submission for an Assignment.
 |
| Error | [#/components/schemas/Error](#componentsschemaserror) | An object representing an error response from the API.
 |

## Path Details

***

### [POST]/users

- Summary  
Create a new User.

- Description  
Create and store a new application User with specified data and adds it to the application's database.  Only an authenticated User with 'admin' role can create users with the 'admin' or 'instructor' roles.  


#### RequestBody

- application/json

```ts
// An object representing information about a Tarpaulin application user.
// 
{
  // Full name of the User.
  name?: string
  // Email address for the User.  This is required to be unique among all Users.
  // 
  email?: string
  // The User's plain-text password.  This is required when creating a new User and when logging in.
  // 
  password?: string
  // Permission role of the User.  Can be either 'admin', 'instructor', or 'student'.
  // 
  role?: string
}
```

#### Responses

- 201 New User successfully added

`application/json`

```ts
{
  // Unique ID of the created User.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
  // 
  id?: integer | string
}
```

- 400 The request body was either not present or did not contain a valid User object.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 403 The request was not made by an authenticated User satisfying the authorization criteria described above.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

***

### [POST]/users/login

- Summary  
Log in a User.

- Description  
Authenticate a specific User with their email address and password.  


#### RequestBody

- application/json

```ts
// An object representing information about a Tarpaulin application user.
// 
{
  // Full name of the User.
  name?: string
  // Email address for the User.  This is required to be unique among all Users.
  // 
  email?: string
  // The User's plain-text password.  This is required when creating a new User and when logging in.
  // 
  password?: string
  // Permission role of the User.  Can be either 'admin', 'instructor', or 'student'.
  // 
  role?: string
}
```

#### Responses

- 200 Success

`application/json`

```ts
{
  // A JWT authentication token.
  // 
  token?: string
}
```

- 400 The request body was either not present or did not contain all of the required fields.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 401 The specified credentials were invalid.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 500 An internal server error occurred.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

***

### [GET]/users/{id}

- Summary  
Fetch data about a specific User.

- Description  
Returns information about the specified User.  If the User has the 'instructor' role, the response should include a list of the IDs of the Courses the User teaches (i.e. Courses whose `instructorId` field matches the ID of this User).  If the User has the 'student' role, the response should include a list of the IDs of the Courses the User is enrolled in.  Only an authenticated User whose ID matches the ID of the requested User can fetch this information.  


#### Responses

- 200 Success

`application/json`

```ts
// An object representing information about a Tarpaulin application user.
// 
{
  // Full name of the User.
  name?: string
  // Email address for the User.  This is required to be unique among all Users.
  // 
  email?: string
  // The User's plain-text password.  This is required when creating a new User and when logging in.
  // 
  password?: string
  // Permission role of the User.  Can be either 'admin', 'instructor', or 'student'.
  // 
  role?: string
}
```

- 403 The request was not made by an authenticated User satisfying the authorization criteria described above.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 404 Specified Course `id` not found.

`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

***

### [GET]/courses

- Summary  
Fetch the list of all Courses.

- Description  
Returns the list of all Courses.  This list should be paginated.  The Courses returned should not contain the list of students in the Course or the list of Assignments for the Course.  


#### Parameters(Query)

```ts
page?: integer
```

```ts
subject?: string
```

```ts
number?: string
```

```ts
term?: string
```

#### Responses

- 200 Success

`application/json`

```ts
{
  // An object representing information about a specific course.
  // 
  courses: {
    // Short subject code.
    subject?: string
    // Course number.
    number?: string
    // Course title.
    title?: string
    // Academic term in which Course is offered.
    term?: string
    // ID for Course instructor.  Exact type/format will depend on your implementation but will likely be either an integer or a string.  This ID must correspond to a User with the 'instructor' role.
    // 
    instructorId?: integer | string
  }[]
}
```

***

### [POST]/courses

- Summary  
Create a new course.

- Description  
Creates a new Course with specified data and adds it to the application's database.  Only an authenticated User with 'admin' role can create a new Course.  


#### RequestBody

- application/json

```ts
// An object representing information about a specific course.
// 
{
  // Short subject code.
  subject?: string
  // Course number.
  number?: string
  // Course title.
  title?: string
  // Academic term in which Course is offered.
  term?: string
  // ID for Course instructor.  Exact type/format will depend on your implementation but will likely be either an integer or a string.  This ID must correspond to a User with the 'instructor' role.
  // 
  instructorId?: integer | string
}
```

#### Responses

- 201 New Course successfully added

`application/json`

```ts
{
  // Unique ID of the created Course.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
  // 
  id?: integer | string
}
```

- 400 The request body was either not present or did not contain a valid Course object.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 403 The request was not made by an authenticated User satisfying the authorization criteria described above.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

***

### [GET]/courses/{id}

- Summary  
Fetch data about a specific Course.

- Description  
Returns summary data about the Course, excluding the list of students enrolled in the course and the list of Assignments for the course.  


#### Responses

- 200 Success

`application/json`

```ts
// An object representing information about a specific course.
// 
{
  // Short subject code.
  subject?: string
  // Course number.
  number?: string
  // Course title.
  title?: string
  // Academic term in which Course is offered.
  term?: string
  // ID for Course instructor.  Exact type/format will depend on your implementation but will likely be either an integer or a string.  This ID must correspond to a User with the 'instructor' role.
  // 
  instructorId?: integer | string
}
```

- 404 Specified Course `id` not found.

`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

***

### [PATCH]/courses/{id}

- Summary  
Update data for a specific Course.

- Description  
Performs a partial update on the data for the Course.  Note that enrolled students and assignments cannot be modified via this endpoint.  Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the `instructorId` of the Course can update Course information.  


#### RequestBody

- application/json

```ts
// An object representing information about a specific course.
// 
{
  // Short subject code.
  subject?: string
  // Course number.
  number?: string
  // Course title.
  title?: string
  // Academic term in which Course is offered.
  term?: string
  // ID for Course instructor.  Exact type/format will depend on your implementation but will likely be either an integer or a string.  This ID must correspond to a User with the 'instructor' role.
  // 
  instructorId?: integer | string
}
```

#### Responses

- 200 Success

- 400 The request body was either not present or did not contain any fields related to Course objects.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 403 The request was not made by an authenticated User satisfying the authorization criteria described above.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 404 Specified Course `id` not found

`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

***

### [DELETE]/courses/{id}

- Summary  
Remove a specific Course from the database.

- Description  
Completely removes the data for the specified Course, including all enrolled students, all Assignments, etc.  Only an authenticated User with 'admin' role can remove a Course.  


#### Responses

- 204 Success

- 403 The request was not made by an authenticated User satisfying the authorization criteria described above.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 404 Specified Course `id` not found

`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

***

### [GET]/courses/{id}/students

- Summary  
Fetch a list of the students enrolled in the Course.

- Description  
Returns a list containing the User IDs of all students currently enrolled in the Course.  Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the `instructorId` of the Course can fetch the list of enrolled students.  


#### Responses

- 200 Array of User IDs for students enrolled in the Course.  Exact type/format of IDs will depend on your implementation but each will likely be either an integer or a string.


`application/json`

```ts
{
  // An object representing information about a Tarpaulin application user.
  // 
  students: {
    // Full name of the User.
    name?: string
    // Email address for the User.  This is required to be unique among all Users.
    // 
    email?: string
    // The User's plain-text password.  This is required when creating a new User and when logging in.
    // 
    password?: string
    // Permission role of the User.  Can be either 'admin', 'instructor', or 'student'.
    // 
    role?: string
  }[]
}
```

- 403 The request was not made by an authenticated User satisfying the authorization criteria described above.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 404 Specified Course `id` not found.

`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

***

### [POST]/courses/{id}/students

- Summary  
Update enrollment for a Course.

- Description  
Enrolls and/or unenrolls students from a Course.  Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the `instructorId` of the Course can update the students enrolled in the Course.  


#### RequestBody

- application/json

```ts
{
  add?: integer | string[]
  remove?: integer | string[]
}
```

#### Responses

- 200 Success

- 400 The request body was either not present or did not contain the fields described above.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 403 The request was not made by an authenticated User satisfying the authorization criteria described above.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 404 Specified Course `id` not found.

`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

***

### [GET]/courses/{id}/roster

- Summary  
Fetch a CSV file containing list of the students enrolled in the Course.

- Description  
Returns a CSV file containing information about all of the students currently enrolled in the Course, including names, IDs, and email addresses.  Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the `instructorId` of the Course can fetch the course roster.  


#### Responses

- 200 A CSV file containing information about all of the students currently enrolled in the Course, including names, IDs, and email addresses.


`text/csv`

```ts
{
  "type": "string",
  "example": "123,\"Jane Doe\",doej@oregonstate.edu\n...\n"
}
```

- 403 The request was not made by an authenticated User satisfying the authorization criteria described above.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 404 Specified Course `id` not found.

`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

***

### [GET]/courses/{id}/assignments

- Summary  
Fetch a list of the Assignments for the Course.

- Description  
Returns a list containing the Assignment IDs of all Assignments for the Course.  


#### Responses

- 200 Array of Assignment IDs for all of the Course's Assignments.  Exact type/format of IDs will depend on your implementation but each will likely be either an integer or a string.


`application/json`

```ts
{
  // An object representing information about a single assignment.
  // 
  assignments: {
    // ID of the Course associated with the Assignment.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
    // 
    courseId?: integer | string
    // Assignment description.
    title?: string
    // Possible points for the Assignment.
    points?: integer
    // Date and time Assignment is due.  Should be in ISO 8601 format.
    // 
    due?: string
  }[]
}
```

- 404 Specified Course `id` not found.

`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

***

### [POST]/assignments

- Summary  
Create a new Assignment.

- Description  
Create and store a new Assignment with specified data and adds it to the application's database.  Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the `instructorId` of the Course corresponding to the Assignment's `courseId` can create an Assignment.  


#### RequestBody

- application/json

```ts
// An object representing information about a single assignment.
// 
{
  // ID of the Course associated with the Assignment.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
  // 
  courseId?: integer | string
  // Assignment description.
  title?: string
  // Possible points for the Assignment.
  points?: integer
  // Date and time Assignment is due.  Should be in ISO 8601 format.
  // 
  due?: string
}
```

#### Responses

- 201 New Assignment successfully added

`application/json`

```ts
{
  // Unique ID of the created Assignment.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
  // 
  id?: integer | string
}
```

- 400 The request body was either not present or did not contain a valid Assignment object.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 403 The request was not made by an authenticated User satisfying the authorization criteria described above.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

***

### [GET]/assignments/{id}

- Summary  
Fetch data about a specific Assignment.

- Description  
Returns summary data about the Assignment, excluding the list of Submissions.  


#### Responses

- 200 Success

`application/json`

```ts
// An object representing information about a single assignment.
// 
{
  // ID of the Course associated with the Assignment.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
  // 
  courseId?: integer | string
  // Assignment description.
  title?: string
  // Possible points for the Assignment.
  points?: integer
  // Date and time Assignment is due.  Should be in ISO 8601 format.
  // 
  due?: string
}
```

- 404 Specified Assignment `id` not found.

`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

***

### [PATCH]/assignments/{id}

- Summary  
Update data for a specific Assignment.

- Description  
Performs a partial update on the data for the Assignment.  Note that submissions cannot be modified via this endpoint.  Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the `instructorId` of the Course corresponding to the Assignment's `courseId` can update an Assignment.  


#### RequestBody

- application/json

```ts
// An object representing information about a single assignment.
// 
{
  // ID of the Course associated with the Assignment.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
  // 
  courseId?: integer | string
  // Assignment description.
  title?: string
  // Possible points for the Assignment.
  points?: integer
  // Date and time Assignment is due.  Should be in ISO 8601 format.
  // 
  due?: string
}
```

#### Responses

- 200 Success

- 400 The request body was either not present or did not contain any fields related to Assignment objects.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 403 The request was not made by an authenticated User satisfying the authorization criteria described above.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 404 Specified Assignment `id` not found

`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

***

### [DELETE]/assignments/{id}

- Summary  
Remove a specific Assignment from the database.

- Description  
Completely removes the data for the specified Assignment, including all submissions.  Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the `instructorId` of the Course corresponding to the Assignment's `courseId` can delete an Assignment.  


#### Responses

- 204 Success

- 403 The request was not made by an authenticated User satisfying the authorization criteria described above.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 404 Specified Assignment `id` not found

`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

***

### [GET]/assignments/{id}/submissions

- Summary  
Fetch the list of all Submissions for an Assignment.

- Description  
Returns the list of all Submissions for an Assignment.  This list should be paginated.  Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the `instructorId` of the Course corresponding to the Assignment's `courseId` can fetch the Submissions for an Assignment.  


#### Parameters(Query)

```ts
page?: integer
```

```ts
studentId?: integer | string
```

#### Responses

- 200 Success

`application/json`

```ts
{
  // An object representing information about a single student submission for an Assignment.
  // 
  submissions: {
    // ID of the Assignment to which the Submission corresponds.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
    // 
    assignmentId?: integer | string
    // ID of the Student who created the submission.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
    // 
    studentId?: integer | string
    // Date and time Submission was made.  Should be in ISO 8601 format.
    // 
    timestamp?: string
    // The grade, in points, assigned to the student for this sumbission, if one is assigned.  Should not be accepted during submission creation, only via update.
    // 
    grade?: number
    // When the Submission is being created, this will be the binary data contained in the submitted file.  When Submission information is being returned from the API, this will contain the URL from which the file can be downloaded.
    // 
    file?: string
  }[]
}
```

- 403 The request was not made by an authenticated User satisfying the authorization criteria described above.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 404 Specified Assignment `id` not found.

`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

***

### [POST]/assignments/{id}/submissions

- Summary  
Create a new Submission for an Assignment.

- Description  
Create and store a new Assignment with specified data and adds it to the application's database.  Only an authenticated User with 'student' role who is enrolled in the Course corresponding to the Assignment's `courseId` can create a Submission.  


#### RequestBody

- multipart/formdata

```ts
// An object representing information about a single student submission for an Assignment.
// 
{
  // ID of the Assignment to which the Submission corresponds.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
  // 
  assignmentId?: integer | string
  // ID of the Student who created the submission.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
  // 
  studentId?: integer | string
  // Date and time Submission was made.  Should be in ISO 8601 format.
  // 
  timestamp?: string
  // The grade, in points, assigned to the student for this sumbission, if one is assigned.  Should not be accepted during submission creation, only via update.
  // 
  grade?: number
  // When the Submission is being created, this will be the binary data contained in the submitted file.  When Submission information is being returned from the API, this will contain the URL from which the file can be downloaded.
  // 
  file?: string
}
```

#### Responses

- 201 New Submission successfully added

`application/json`

```ts
{
  // Unique ID of the created Submission.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
  // 
  id?: integer | string
}
```

- 400 The request body was either not present or did not contain a valid Submission object.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 403 The request was not made by an authenticated User satisfying the authorization criteria described above.


`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

- 404 Specified Assignment `id` not found.

`application/json`

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```

## References

### #/components/schemas/User

```ts
// An object representing information about a Tarpaulin application user.
// 
{
  // Full name of the User.
  name?: string
  // Email address for the User.  This is required to be unique among all Users.
  // 
  email?: string
  // The User's plain-text password.  This is required when creating a new User and when logging in.
  // 
  password?: string
  // Permission role of the User.  Can be either 'admin', 'instructor', or 'student'.
  // 
  role?: string
}
```

### #/components/schemas/Course

```ts
// An object representing information about a specific course.
// 
{
  // Short subject code.
  subject?: string
  // Course number.
  number?: string
  // Course title.
  title?: string
  // Academic term in which Course is offered.
  term?: string
  // ID for Course instructor.  Exact type/format will depend on your implementation but will likely be either an integer or a string.  This ID must correspond to a User with the 'instructor' role.
  // 
  instructorId?: integer | string
}
```

### #/components/schemas/Assignment

```ts
// An object representing information about a single assignment.
// 
{
  // ID of the Course associated with the Assignment.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
  // 
  courseId?: integer | string
  // Assignment description.
  title?: string
  // Possible points for the Assignment.
  points?: integer
  // Date and time Assignment is due.  Should be in ISO 8601 format.
  // 
  due?: string
}
```

### #/components/schemas/Submission

```ts
// An object representing information about a single student submission for an Assignment.
// 
{
  // ID of the Assignment to which the Submission corresponds.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
  // 
  assignmentId?: integer | string
  // ID of the Student who created the submission.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
  // 
  studentId?: integer | string
  // Date and time Submission was made.  Should be in ISO 8601 format.
  // 
  timestamp?: string
  // The grade, in points, assigned to the student for this sumbission, if one is assigned.  Should not be accepted during submission creation, only via update.
  // 
  grade?: number
  // When the Submission is being created, this will be the binary data contained in the submitted file.  When Submission information is being returned from the API, this will contain the URL from which the file can be downloaded.
  // 
  file?: string
}
```

### #/components/schemas/Error

```ts
// An object representing an error response from the API.
// 
{
  // A message describing the Error.
  error?: string
}
```