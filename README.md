# Schoodle

Schoole is a simple, easy to use, free event organizing app.

The repository is the start code for the project: users will fork and clone this repository, then build upon it using HTML, CSS, SASS,Bootstrap, JS, JQuery, AJAX front-end skills, and back-end skills including Node, express, postgres and knex.

## Final Product

!["Screenshot of welcome page](https://github.com/RayCJ87/lhl_midTermProject/blob/feature_midTerm/screeshots/Screen%20Shot%20-%20welcome%20page.png)
!["Screenshot of creating an event](https://github.com/RayCJ87/lhl_midTermProject/blob/feature_midTerm/screeshots/Screen%20Shot%20-%20create%20an%20event.png)
!["Screenshot of sending the link to attendees](https://github.com/RayCJ87/lhl_midTermProject/blob/feature_midTerm/screeshots/Screen%20Shot%20-%20send%20the%20link%20to%20attendees.png)
!["Screenshot of the event page](https://github.com/RayCJ87/lhl_midTermProject/blob/feature_midTerm/screeshots/Screen%20Shot%20-%20the%20event%20page.png)

## Project Setup

1. Create your own empty repo on GitHub
2. Clone this repository (do not fork)
  - Suggestion: When cloning, specify a different folder name that is relevant to your project
3. Remove the git remote: `git remote rm origin`
4. Add a remote for your origin: `git remote add origin <your github repo URL>`
5. Push to the new origin: `git push -u origin master`
6. Verify that the skeleton code now shows up in your repo on GitHub

## Getting Started

1. Create the `.env` by using `.env.example` as a reference: `cp .env.example .env`
2. Update the .env file with your correct local information
3. Install dependencies: `npm i`
4. Fix to binaries for sass: `npm rebuild node-sass`
5. Run migrations: `npm run knex migrate:latest`
  - Check the migrations folder to see what gets created in the DB
6. Run the seed: `npm run knex seed:run`
  - Check the seeds file to see what gets seeded in the DB
7. Run the server: `npm run local`
8. Visit `http://localhost:8080/`

## Dependencies

- Node 5.10.x or above
- NPM 3.8.x or above
- Dotenv
- Bootstrap
- Body-parser
- Ejs
- Knex
- Knex-logger
- Node-sass-middleware
- Pg
