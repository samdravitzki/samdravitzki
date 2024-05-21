# dravitzki.com
The idea of this app is to have a single place I can experiment and publish various small projects

# Projects

The status of the project is indicated by the following a trtaffic light system where...
* ⚪ = not started
* 🔴 = abandoned
* 🟡 = in progress
* 🟢 = complete

## Simple snake 🟡
I want to understand what it takes to publish a working interactive experiement, so I am going to begin really simple with an implementation of snake

The implementation of snake doesn't have to be anything special 

### TODO
- [ ] Snack self collisions
- [ ] Track score
- [ ] Increase the speed when snack is eaten
- [ ] Support mobile

### Ideas
* Could be cool if the snake can break out of the canvas into the html page 


## Wave function collapse ⚪
I have always wanted to build an implementation of wave function collapse and I have tried to do it a few different times before but could never figure it all out

At the moment I am thinking I want this project to include...
1. A simple tile editor
    * Where you can define the tiles and it encodes how the created tile relates to other tiles 
    * I am thinking either pixel based or a simple grid-based vector line style
2. A tile placement system
3. 2D implementation of WFC algorithm
4. Simple WFC visualisation (does not have to be as detailed as Oksta)

### References
* Oksta - https://x.com/OskSta
* Oksta WFC visualisation - https://x.com/OskSta/status/865200072685912064?lang=en
* Boris the brave - https://www.boristhebrave.com/

## Maintence and Other stuff
All the things that need to be done to support building and maintaing these projects

### TODO
- [x] Add unit test runner
- [x] Automate unit tests in the CI
- [x] Add linter
- [x] Automate linting in the CI

# Technical debt
- [x] base option required in vite config to get it to work with github pages
- [ ] Redesign the snake code and make it more readable, testable and maintainable
- [ ] Unit test the snake code