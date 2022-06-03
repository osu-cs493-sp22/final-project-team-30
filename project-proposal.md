**CS 493 -** Rob Hess

Final Project Proposal

Team 30: Garett Goodlake, Benjiman Walsh,

Timur Ermoshkin, Eric Hoang

Team Members
============

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

Tarpaulin API Schema
====================

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

![](media/image1.png){width="6.5in" height="4.208333333333333in"}
=================================================================

Services
========

-   MongoDB

-   Redis

-   Node

Project Specification
=====================

Actions and their Endpoints
---------------------------

Course roster download

-   CSV format

-   GET /courses/{id}/roster

Assignment submission creation

-   POST /assignments/{id}/submissions

-   GET /assignments/{id}/submissions

User data fetching

-   GET /users/{id}

Course information fetching

-   GET /courses

-   GET /courses/{id}

-   GET /courses/{id}/students

-   GET /courses/{id}/assignments
