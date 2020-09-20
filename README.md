## :house: SSSB Scrape - Backend

This is the backend service for [SSSB Scrape Frontend](https://github.com/tasola/sssb-scrape-fe)

SSSB Scrape is a project which aims to aid students in Stockholm to find their dream student apartment. The demand on student housing in Stockholm has been incredibly high for a long time. To be able to get a decent residence the student has to be ever-present on the Stockholm Student Residents (SSSB) site, in order to make sure that they don't miss any new release.
The goal of this project is to help students carry this burden by automating the process. The SSSB Scrape-servers are checking the SSSB site for new housings 24/7, and if an apartment of the user's preference would appear it notifies the user through an email.

This project is a node server which continuously scrapes the apartments on the SSSB site, analyzes them and emails users with matching preferences.

[![CircleCI](https://circleci.com/gh/tasola/sssb-scrape-be.svg?style=shield)](https://circleci.com/gh/tasola/sssb-scrape-be)


### :rocket: Get started
To get the app up and running, simply `npm install` and then `npm run start` to start the first scrape iteration.

### :hammer_and_wrench: Built with
* [Node](https://reactjs.org/)
* [Puppeteer](https://github.com/puppeteer/puppeteer) - Web scraping tool
* [CircleCI](https://circleci.com/) - CI/CD
* [Heroku](https://www.heroku.com/) - Deployment
* [Nodemailer](https://nodemailer.com/about/) - Mailing service
* [Sendgrid](https://sendgrid.com/) - SMTP server for mail delivery
* [Mocha](https://mochajs.org/) - Test framework
* [Sinon](https://sinonjs.org/) - Stub framework for testing with Mocha

The project uses the separate service [User Matcher](https://github.com/tasola/sssb-scrape-user-matcher) to fetch users with the corresponding preferences from Firebase.
