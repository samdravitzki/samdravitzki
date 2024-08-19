# dravitzki.com
The idea of this app is to have a single place I can experiment and publish various small projects focused around learning to build fun and original interactive experiences (games)

They say the first 10 games you make are not going to be good, this is is a place for me to learn and experiment and learn the kind
of skills to make unique fun interactive things

# Projects

The status of the project is indicated by the following a traffic light system where...
* ⚪ = not started
* 🔴 = abandoned
* 🟡 = in progress
* 🟢 = complete


## Simple snake 🟢
### Brief
I want to understand what it takes to publish a working interactive experiment, so I am going to begin really simple with an implementation of snake and then try do something orginal with it

### Scope
The implementation of snake doesn't have to be anything special but there has to be some kind of original twist

### TODO
- [ ] Implement basic snake game
    - [x] Snack self collisions
    - [x] Track score
    - [ ] Increase the speed when snack is eaten
    - [x] Hide the snake game somewhere in the page
- [ ] Snake controlled by gravity
    - [ ] control gradient of background with input

### Bugs
- [ ] appears to be a little lag when the snake is about to eat the snack
- [ ] when snack was eaten another snack was not rendered on the screen
- [ ] Snack sometimes generates in the same position as the snake

### Ideas
* Could be cool if the snake can break out of the canvas into the html page 
* For the aesthetic it would be cool to see if I could make it work in isometric view
* I would like to add some kind of original idea to snake. Maybe something like adding momentum or a third dimension could be cool?
* Support mobile

## Twenty games challenge 🟡
Twenty games challenge is a guided syllabus designed to build skills in game development

My goal is to build up the skills to be able to create fun, original interactive experiences, this seems like a
great structured way to start developing these skills

### Scope
Complete "The Challenge" defined in https://20_games_challenge.gitlab.io/challenge/

### TODO
    - [ ] Implement pong (Game #1)
        - [x] Implement basic game
        - [ ] Add a menu
        - [ ] Add and end state
        - [ ] Add sound effects
        - [ ] Implement an AI
        - [ ] Increase difficulty as game goes on
        - [ ] Clamp the paddles to only fit within the walls
    - [ ] Implement breakout (Game #2)
    - [ ] Implement the rest of the 10 games

### Resources
- The challenge - https://20_games_challenge.gitlab.io/challenge/

### Ideas
* Make pong paddles rotate with the velocity of the mouse movement so that its not just hitting a flat object (make it a bit more interesting)
    * Could do this only when the player is clicking and if they're not clicking it causes the ball to spin
* Since I had to create a generic collision system it might be worth creating some demos to be able to test the different types of collisions work as expected

### Notes
Since I have to create so many different games I saw this as an opportunity to look into learn about game engine design. This lead to introducing a bit of 
abstraction creating a simple and basic structural implementation of ecs and a collision system


## Wave function collapse ⚪
I have always wanted to build an implementation of wave function collapse and I have tried to do it a few different times before but could never figure it all out

At the moment I am thinking I want this project to include...
1. A simple tile editor
    * Where you can define the tiles and it encodes how the created tile relates to other tiles 
    * I am thinking either pixel based or a simple grid-based vector line style
2. A tile placement system
3. 2D implementation of WFC algorithm
4. Simple WFC visualisation (does not have to be as detailed as Oksta)

### TODO
- [ ] Implement bitmap variation of wave function collapse
- [ ] Implement tile map variation of wave function collapse

### References
* Wave function collapse algorithm - https://github.com/mxgmn/WaveFunctionCollapse?tab=readme-ov-file#algorithm
* Oksta - https://x.com/OskSta
* Oksta WFC visualisation - https://x.com/OskSta/status/865200072685912064?lang=en
* Boris the brave - https://www.boristhebrave.com/

## Maintenance and Other stuff
All the things that need to be done to support building and maintain these projects

### TODO
- [x] Add unit test runner
- [x] Automate unit tests in the CI
- [ ] Add linter
- [ ] Automate linting in the CI
- [ ] Look into introducing a dependency updating bot into the repository
- [ ] Integrate GitHub code spaces to make development on this more portable
- [ ] Implement more extensible approach to adding new games to the site 
    - that also don't require the use of dynamic module imports
    - and have a better method for toggling the visibility of the games

# Technical debt
- [x] base option required in Vite config to get it to work with GitHub pages
- [ ] Redesign the snake code and make it more readable, testable and maintainable
- [ ] Unit test the snake code