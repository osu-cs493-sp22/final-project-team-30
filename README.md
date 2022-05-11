# CS 493 Final Project - Team 30


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
