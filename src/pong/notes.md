# Notes

Notes on things I have discovered as I have been working on this game

## Conditional Systems

Implementations of ECS all seem to eventually need a way to orchestrate in what situations
systems will run. Both Unity and Bevy implement a mechanism for doing this with Unitys being
Component System Groups and Bevys being States

_Reference_

- https://docs.unity3d.com/Packages/com.unity.entities@1.0/manual/systems-update-order.html
- https://github.com/bevyengine/bevy/blob/main/examples/games/game_menu.rs

Currently I am running into an issue where I want the game to have a pause menu and a main menu,
but in each menu you want different systems to run and others to stop. It looks like I will need
to introduce a similiar concept to orchestrate functions into this codebase to introduce menus.
The goal is I should end up with something that can stop the game systems when opening the pause
menu, trigger some systems to run to setup the menu and run systems while the menu is open. Then
when the menu is closed a set of systems runs to close the menu and unpause. This should also
be generalised so that it can be applied to other scenarios in which I want to conditionally run
systems

These states could be modeled in a simlar way to how they are in react?

An alternative approach to conditional systems is to have multiple worlds and conditions for determining
which world is available to the user. The issue for me with this tho is it is almost exactly the same
as doing conditional systems except for if you can't have the same systems that run no matter whether
the game is paused or not meaning its just seems less flexible

## Resources

Global state shared between systems that is not associated with any
entity in particular

Resources add the flexibility to break out of the ecs pattern adding
the ability to implement solutions in different ways that may be more
appropiate to solve the problem at hand

Examples of this type of state could be score or the current key pressed

_Reference_

- https://bevy-cheatbook.github.io/programming/res.html
- https://www.gamedev.net/forums/topic/710271-where-should-shared-resources-live-in-an-ecs-engine/
