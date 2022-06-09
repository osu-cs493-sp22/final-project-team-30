# Tarpaulin API

CS 493 Final Project - Team 30

## Actions and Endpoints

| Method | Path | Description |
| --- | --- | --- |
| POST | /users | Create a new User. |
| POST | /users/login | Log in a User. |
| GET | /users/{id} | Fetch data about a specific User. |
| GET | /courses | Fetch the list of all Courses. |
| POST | /courses | Create a new course. |
| GET | /courses/{id} | Fetch data about a specific Course. |
| PATCH | /courses/{id} | Update data for a specific Course. |
| DELETE | /courses/{id} | Remove a specific Course from the database. |
| GET | /courses/{id}/students | Fetch a list of the students enrolled in the Course. |
| POST | /courses/{id}/students | Update enrollment for a Course. |
| GET | /courses/{id}/roster | Fetch a CSV file containing list of the students enrolled in the Course. |
| GET | /courses/{id}/assignments | Fetch a list of the Assignments for the Course. |
| POST | /assignments | Create a new Assignment. |
| GET | /assignments/{id} | Fetch data about a specific Assignment. |
| PATCH | /assignments/{id}] | Update data for a specific Assignment. |
| DELETE | /assignments/{id} | Remove a specific Assignment from the database. |
| GET | /assignments/{id}/submission | Fetch the list of all Submissions for an Assignment. |
| POST | /assignments/{id}/submissions | Create a new Submission for an Assignment. |

## Data Schema

### Users

```
// An object representing information about a Tarpaulin application user.
{
  // Full name of the User.
  name: string,

  // Email address for the User.  This is required to be unique among all Users.
  email: string,

  // The User's plain-text password.  This is required when creating a new User and when logging in.
  password: string,

  // Permission role of the User.  Can be either 'admin', 'instructor', or 'student'.
  role: string
}
```

### Courses

```
// An object representing information about a specific course. 
{
  // Short subject code.
  subject: string,

  // Course number.
  number: string,

  // Course title.
  title: string,

  // Academic term in which Course is offered.
  term: string,
    
  // ID for Course instructor.  Exact type/format will depend on your implementation but will likely be either an integer or a string.  This ID must correspond to a User with the 'instructor' role. 
  instructorId: string

}
```

### Assignments

```
// An object representing information about a single assignment. 
{
  // ID of the Course associated with the Assignment.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
  courseId: string,
  
  // Assignment description.
  title: string,

  // Possible points for the Assignment.
  points: integer,

  // Date and time Assignment is due.  Should be in ISO 8601 format. 
  due: string
}
```

###  Submissions

```
// An object representing information about a single student submission for an Assignment.
{
  // ID of the Assignment to which the Submission corresponds.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
  assignmentId: string,
  
  // ID of the Student who created the submission.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
  studentId: string,

  // Date and time Submission was made.  Should be in ISO 8601 format.
  timestamp: string,
    
  // The grade, in points, assigned to the student for this sumbission, if one is assigned.  Should not be accepted during submission creation, only via update. 
  grade: number,
    
  // When the Submission is being created, this will be the binary data contained in the submitted file.  When Submission information is being returned from the API, this will contain the URL from which the file can be downloaded.
  file: string
}
```

## Docker Compose 

The docker compose specification for this project allows the API server to be spun up with any dependent services. 
Further, this specidication is geared towards development so it will mount you repository, install the node dependencies in it and monitor the directory for changes. This specifaction should be launched with:
```
$ docker-compose up
```
Should more dependencies be needed to complete a task, they can be installed by running a onetime service and install that dependency. 
This will also change your package.json file, so if you do not want to add it as an official project dependency make sure to include the --no-save option. This can be done by substituting your dependency for nodemon below: 

```
$ docker-compose run api bash
> # npm install nodemon
> # npm install --no-save nodemon
> # exit
$
```
This development environment is mainly meant to handle changes to the api server and any files belonging to it. 
Should it not work, need to be changed or stopped, bringing the compose services down is important in making sure that there are not multiple verions of the same service running, which can be annoying: 

```
$ docker-compose down
```

## Branching Strategy

Having a branching strategy will allow us to efficiently work on a repository together without creating merge issues each time we commit code. Then we can create pull requests and approve major components as they are completed. 

The [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow) branching strategy was recommended and is simple and easy to manage for the scope of the assignment. 

To do this I opened the README and added all of this nonsense, and then ran the following commands: 

```
$ git checkout -B documentation
$ git add README.md 
$ git commit
$ git push -u origin documentation

```

After this, or whenever the changes are ready to be merged a [pull request](https://github.com/osu-cs493-sp22/final-project-team-30/pulls) can be made on the Github repository page. If it is merged into the main branch and no more changes are needed, the branch can be [deleted](https://github.com/osu-cs493-sp22/final-project-team-30/branches) through Github (and locally).

## Team Members

| Name | Github | ONID | Responsibilities |
| ---  | --- | --- | --- |
| Garett Goodlake | pyrothei | goodlakg\@oregonstate.edu | Course Entity Endpoint, Assignment Entity, Course Roster Download |
| Benjiman Walsh | walshb421  | walshb\@oregonstate.edu | Docker and Docker Compose, Testing/Demo Workflow, Rate Limiting |
| Timur Ermoshkin | ermoshkt | ermoshkt\@oregonstate.edu | Set up Basic API server and Directory Structure, Pagination, Example Data |
| Eric Hoang | hoanger9 | hoanger\@oregonstate.edu | User Entity, User authentication, Submission entity |
