## Pong

Pong is a simple game but is a small step up in complexity from snake the first game I implemented. The additional complexity will challenge my ability and help me understand more complex build interactive things in the web

### Scope

- [x] Create an arena with two walls and a divider.
- [x] Add a paddle on either end of the play field. Use player inputs to move the paddles up and down.
- [x] Add a ball that moves around the playfield and bounces off of the paddles and walls.
- [x] Detect when the ball leaves the playfield. Assign a point to the player who scored.
- [x] Track and display the score for each player.
- [x] Change ball trajectory on contact with paddle (so trajectory doesn't stay the same the entire time)
- [x] Add a menu
- [x] Add an end state
- [ ] Add sound effects
- [x] Implement an _AI_
- [x] Increase difficulty as game goes on
- [x] Add ability to pause

### Ideas
- Apply curves to ball movement and other animation techniques like squash and stretch to make the game feel more interesting
- Make pong paddles rotate with the velocity of the mouse movement so that its not just hitting a flat object (make it a bit more interesting)
  - Could do this only when the player is clicking and if they're not clicking it causes the ball to spin
- Since I had to create a generic collision system it might be worth creating some demos to be able to test the different types of collisions work as expected
- Have feature flags for ones I want to show, but rather than fully hiding the stuff that is WIP from viewers of the site put it under its own WIP section

## Twenty games challenge

Pong is the first of the twenty games in the twenty games challegne. The [Twenty games challenge](https://20_games_challenge.gitlab.io/challenge/) is a guided syllabus designed to build skills in game development

My goal is to build up the skills to be able to create fun, original interactive experiences, this seems like a
great structured way to start developing these skills

Future goal: I would like to complete the [Twenty games challenge](https://20_games_challenge.gitlab.io/challenge/) to build an understanding of what it takes to make a game as well as study game design. I could achive this goal by implementing these games to demo the simple ecs engine, create use cases to implement new features and test the flexibility of its existing features
