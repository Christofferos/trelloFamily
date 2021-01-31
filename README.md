# trelloFamily

Differences in production vs. development:
* In database/server.js change from: "./database/config/config.env" to "./config/config.env" before deploying.
* In client/src/pages/Homepage.jsx change from "localhost:3000" to "https://trello-family-backend.herokuapp.com/" before deploying.
* Btw. Pushing to this repository automatically deploys front and backend to Netlify and Heroku.