# dravitzki.com

The idea of this repo is to have a single place I can experiment and publish small projects focused around learning how to build fun and original interactive experiences

They say the first 10 games you make are not going to be good, this is is a place to experiment and learn the kind of skills to make unique fun interactive things

## Projects

The `src/` folder contains all of the projects. Each project contains a `README.md` file describing what it is aswell as its scope and progress

## General repository work

### The site

- [ ] Analytics
- [ ] Basic design centered around a cool logo
- [ ] Some way of communicating what each project is and how to interact with them
- [ ] Mobile friendly
- [ ] Implement more extensible approach to adding new games to the site
- [ ] Someway for any viewers to give feedback
- [ ] Ability to visibility of projects within site

### Maintence and maintainability

All the things that need to be done to support building and maintain these projects

- [ ] Linting
- [ ] Dependency bot
- [ ] Publish coverage reports (using codecov?)
- [x] Unit test runner
- [x] Formatting

### Continuous Integration

- [ ] Automate linting in the CI
- [x] Automate unit tests in the CI

### Continuous deployment

- [ ] Smoke tests to validate deployment was successful
- [x] Define infrastrcuture using IaC and apply changes on commit to `main`
- [x] Automate deployment on commit to `main`
- [x] Move from github pages to Azure
  - swa supports route fallbacks

### Development environment

- [x] Use GitHub codespaces making a portable development environment
