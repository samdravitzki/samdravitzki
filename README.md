# dravitzki.com

The idea of this app is to have a single place I can experiment and publish various small projects focused around learning to build fun and original interactive experiences (games)

They say the first 10 games you make are not going to be good, this is is a place for me to learn and experiment and learn the kind
of skills to make unique fun interactive things

# Projects

## Simple snake 🟢

### Brief

I want to understand what it takes to publish a working interactive experiment, so I am going to begin really simple with an implementation of snake and then try do something orginal with it

### Scope

The implementation of snake doesn't have to be anything special but there has to be some kind of original twist

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

- Could be cool if the snake can break out of the canvas into the html page
- For the aesthetic it would be cool to see if I could make it work in isometric view
- I would like to add some kind of original idea to snake. Maybe something like adding momentum or a third dimension could be cool?
- Support mobile

## Twenty games challenge 🟡

Twenty games challenge is a guided syllabus designed to build skills in game development

My goal is to build up the skills to be able to create fun, original interactive experiences, this seems like a
great structured way to start developing these skills

### Scope

Complete "The Challenge" defined in https://20_games_challenge.gitlab.io/challenge/

- [ ] Implement pong (Game #1)
  - [x] Create an arena with two walls and a divider.
  - [x] Add a paddle on either end of the play field. Use player inputs to move the paddles up and down.
  - [x] Add a ball that moves around the playfield and bounces off of the paddles and walls.
  - [x] Detect when the ball leaves the playfield. Assign a point to the player who scored.
  - [x] Track and display the score for each player.
  - [x] Change ball trajectory on contact with paddle (so trajectory doesn't stay the same the entire time)
  - [x] Add a menu
  - [x] Add an end state
  - [ ] Add sound effects
  - [x] Implement an AI
  - [x] Increase difficulty as game goes on
  - [x] Add ability to pause
- [ ] Implement breakout (Game #2)
- [ ] Implement the rest of the 10 games

### Resources

- The challenge - https://20_games_challenge.gitlab.io/challenge/

### Ideas

- Make pong paddles rotate with the velocity of the mouse movement so that its not just hitting a flat object (make it a bit more interesting)
  - Could do this only when the player is clicking and if they're not clicking it causes the ball to spin
- Since I had to create a generic collision system it might be worth creating some demos to be able to test the different types of collisions work as expected
- Have feature flags for ones I want to show, but rather than fully hiding the stuff that is WIP from viewers of the site put it under its own WIP section

### Notes

Since I have to create so many different games I saw this as an opportunity to look into learn about game engine design. This lead to introducing a bit of
abstraction creating a simple and basic structural implementation of ecs and a collision system

## Poisson Disc Sampling 🟡

I want to learn to different algorithms useful for procgen, poisson disc sampling is an interesting algorithm because of how it generates data that seems random but also looks good due to how uniform it is. I also want to develop my skills at implementing and using unique algorithms like this, pds felt like a great place to start because it is relativly simple but still have a few hidden challenges

## Drums 🟡

_The rough idea is as follows, I want to refine it to a few succinct bullet points that are easy to understand_
I want this drums project to be a tool that turns mostly mindless tapping on the keyboard while focused on something else into music or atleast drum beats acting like a kind of musical fidget toy. Ideally it should work in a way that is predictable where if you tap the keyboard in the same way it creates the same drum beat where each tap makes atleast one drum sound i.e. high hat, kick, tom tom. If the user finds makes something they like they should be able to recreate the same thing again in the same way if they remember how. Depending on the way the tapping is done or as they tapping is done consistently over time baselines, melodys, effects or samples could be introduced giving it an aspect of exploration and discovery. Ultimately while it should have aspects of complextity and discovery the user should always be able to tap away mindlessly focusing on something else and have something playing that sounds good, assuming this is possible to do

Notes:

- Can learn alot about how to make dynamic music with code from [Strudel](https://strudel.cc/#JDogcygiW2JkIDxoaCBvaD5dKjIiKS5iYW5rKCJ0cjkwOSIpLmRlYyguNCk%3D)
- If it makes sense for the project I should start with a single genre as I don't know much about music in general. Lofi hip hop could be a good idea because it is simple and is a genere I like and people already listen to while focused on other things which aligns with the idea of the project.

## Wave function collapse ⚪

I have always wanted to build an implementation of wave function collapse and I have tried to do it a few different times before but could never figure it all out

At the moment I am thinking I want this project to include...

1. A simple tile editor
   - Where you can define the tiles and it encodes how the created tile relates to other tiles
   - I am thinking either pixel based or a simple grid-based vector line style
2. A tile placement system
3. 2D implementation of WFC algorithm
4. Simple WFC visualisation (does not have to be as detailed as Oksta)

### TODO

- [ ] Implement bitmap variation of wave function collapse
- [ ] Implement tile map variation of wave function collapse

### References

- Wave function collapse algorithm - https://github.com/mxgmn/WaveFunctionCollapse?tab=readme-ov-file#algorithm
- Oksta - https://x.com/OskSta
- Oksta WFC visualisation - https://x.com/OskSta/status/865200072685912064?lang=en
- Boris the brave - https://www.boristhebrave.com/

## Maintenance and Other stuff

All the things that need to be done to support building and maintain these projects

- [x] Add unit test runner
- [x] Automate unit tests in the CI
- [ ] Add linter
- [ ] Automate linting in the CI
- [x] Add formatter
- [ ] Mobile friendly
- [ ] Contact form to give feedback on each app
- [ ] Look into introducing a dependency updating bot into the repository
- [ ] Integrate GitHub code spaces to make development on this more portable
- [ ] Implement more extensible approach to adding new games to the site
  - that also don't require the use of dynamic module imports
  - and have a better method for toggling the visibility of the games
- [ ] Analytics
- [ ] Move from github pages to Azure (swa supports route fallbacks and can add analytics with application insights service)
  - [x] Apply IaC to provision the swa
- [ ] Reset state of engine when it is stopped
- [ ] Canvases dont look good as just squares in the middle of your screen
- [ ] Dependabot for pnpm (or anything else for managing updating dependencies)
- [ ] Publish test coverage (using codecov?)
- [ ] Update this readme to just describe the repo and move the docs for each project to where the its source code is located

# Appendix

The status of the project is indicated by the following a colour system where...

- ⚪ = not started
- 🔴 = abandoned
- 🟡 = in progress
- 🟢 = complete
