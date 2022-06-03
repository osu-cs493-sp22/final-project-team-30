# Tarpaulin API

CS 493 Final Project - Team 30

## Data Schema

-   Users

    -   ID

    -   name

    -   role

    -   email

-   Courses

    -   subject

    -   code

    -   Section

    -   Name

    -   description

    -   teacher

    -   students

-   Assignments

    -   id

    -   Due

    -   Name

    -   description

    -   courseID

-   Submissions

    -   studentID

    -   assignmentID

    -   Time submitted

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

Garett Goodlake
---------------

**Email:** goodlakg\@oregonstate.edu

**GitHub:** pyrothei

**Responsible For:**

Endpoint Implementation

Benjiman Walsh
--------------

**Email:** walshb\@oregonstate.edu

**GitHub:** walshb421

**Responsible For: **

Repository Maintenance

Docker and Docker Compose

Testing/Demo Workflow

Timur Ermoshkin
---------------

**Email: ermoshkt\@oregonstate.edu**

**GitHub:** ermoshkt

**Responsible For:**

Endpoint Implementation

Eric Hoang
----------

**Email:** hoanger\@oregonstate.edu

**GitHub:** hoanger9

**Responsible For:**

Endpoint Implementation
