## _ECS engine_

Always wanted to learn more about game engine design and ecs and so decided to build a simple engine to assist in prototyping game ideas

- [ ] Describe what this is, why it exists and what I want to do with it
- [ ] copy in plans and ideas from notebook
- [ ] Publish as npm package

- Implement demos for different features of ecs engine
- Implement demos of the collision system
- Implement demos for different features of ecs
- Support different collision scenarions (box - box, circle - circle, ...)
- Move to less naive implementation of collision system
- Add debug mode to view systems and their average run time
- Add ability to move viewport with a 2d camera

## todos

- [ ] Reset state of engine when it is stopped
- [ ] Some kind of logging of all major engine activity that can the be fitlered on for easy debugging
  - i.e. log systems triggered, event ocurrances, state changes, etc.

## Ideas

- Logger available to systems and engine that can be used to audit events and debug
- Debug tools
  - Searchable list of systems, events their triggered and someway to visualise when their executing
  - Searchable list of entities in the world
  - Could use https://tweakpane.github.io/docs/ for this
- Color palette tool - setup a color palette that can be reused throughout systems and components resulting in consistent good looking apps

## Resources

Useful resources discovered that contributed to making this tool what it is

- http://t-machine.org/index.php/2007/09/03/entity-systems-are-the-future-of-mmog-development-part-1/
- https://dreamnoid.itch.io/aereven-lunar-wake/devlog/274028/postmortem-part-1-the-engine
  - References lots of other useful articles
  - Describes implementation of ECS and approach to scheduling systems

## Reading list

Resources discovered that seem relevant to this project but are yet to read

- https://docs.unity3d.com/Packages/com.unity.entities@0.50/manual/system_update_order.html
- https://cowboyprogramming.com/2007/01/05/evolve-your-heirachy/
- https://www.youtube.com/watch?v=W3aieHjyNvw - Overwatch Gameplay Architecture
- https://www.youtube.com/live/9LNgSDP1zrw - Lecture 05 - Intro to ECS
- https://www.richardlord.net/blog/ecs/finite-state-machines-with-ash
- https://skypjack.github.io/page5/
- https://patterns.eecs.berkeley.edu/?page_id=609 - Task Scheduler
