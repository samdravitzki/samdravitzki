# dravitzki.com
The idea of this app is to have a single place I can experiment and publish various small projects

# Projects

The status of the project is indicated by the following a trtaffic light system where...
* ⚪ = not started
* 🔴 = abandoned
* 🟡 = in progress
* 🟢 = complete

They say the first 10 games you make are not going to be good, this is is a place for me to learn and experiement and learn the kind
of skills to make unique fun interactive things

## Simple snake 🟡
I want to understand what it takes to publish a working interactive experiement, so I am going to begin really simple with an implementation of snake

The implementation of snake doesn't have to be anything special 

### TODO
- [x] Snack self collisions
- [ ] Track score
- [ ] Increase the speed when snack is eaten
- [ ] Support mobile

## Bugs
- [ ] appears to be a little lag when the snake is about to eat the snack
- [ ] when snack was eaten another snack was not rendered on the screen

### Ideas
* Could be cool if the snake can break out of the canvas into the html page 
* For the aestheic it would be cool to see if I could make it work in isometric view
* I would like to add some kind of original idea to snake. Maybe something like adding momentum or a third dimension could be cool?


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

## Maintenance and Other stuff
All the things that need to be done to support building and maintaing these projects

### TODO
- [ ] Add unit test runner
- [ ] Automate unit tests in the CI
- [ ] Add linter
- [ ] Automate linting in the CI
- [ ] Look into introducing a dependency updating bot into the repository
- [ ] Integrate github codepspaces to make development on this more portable

# Technical debt
- [x] base option required in vite config to get it to work with github pages
- [ ] Redesign the snake code and make it more readable, testable and maintainable
- [ ] Unit test the snake code