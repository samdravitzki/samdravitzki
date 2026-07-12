## Drums 🟡

_The rough idea is as follows, I want to refine it to a few succinct bullet points that are easy to understand_
I want this drums project to be a tool that turns mostly mindless tapping on the keyboard while focused on something else into music or at least drum beats acting like a kind of musical fidget toy.

Ideally it should work in a way that is predictable where if you tap the keyboard in the same way it creates the same drum beat where each tap makes at least one drum sound i.e. high hat, kick, tom tom. If the user finds makes something they like they should be able to recreate the same thing again in the same way if they remember how. Depending on the way the tapping is done or as they tapping is done consistently over time baselines, melodies, effects or samples could be introduced giving it an aspect of exploration and discovery. Ultimately while it should have aspects of complexity and discovery the user should always be able to tap away mindlessly focusing on something else and have something playing that sounds good, assuming this is possible to do

### The element of discovery

I think we can also develop the element of discovery further by adding other instruments
into the background if the beat is played at a consistent tempo and could change
other variables depending on where the pattern is played on the keyboard or what
keys are in the pattern.

### Visualisation

Not sure yet how to go about this but I want the visuals to reinforce to the user
that when they are playing a pattern that they should keep repeating it and to communicate
to the user when they have changed the pattern. I also like the idea of it mimicing the
design of a drum machine. I also think its important to communicate to the user what
loop they are playing, this should have the name of the loop but more importantly something
visual to represent the loop

### Notes

- Used Drumhaus (https://github.com/mxfng/drumhaus/tree/main) an in browser drum machine based on tonejs alot as a reference for this
- Can learn alot about how to make dynamic music with code from [Strudel](https://strudel.cc/#JDogcygiW2JkIDxoaCBvaD5dKjIiKS5iYW5rKCJ0cjkwOSIpLmRlYyguNCk%3D)
- Strudel describes music using something called [mini-notation](https://tidalcycles.org/docs/reference/mini_notation/) which comes from a Haskell tool called [Tidal Cycles](https://tidalcycles.org/docs/)
- If it makes sense for the project I should start with a single genre as I don't know much about music in general. Lofi hip hop could be a good idea because it is simple and is a genere I like and people already listen to while focused on other things which aligns with the idea of the project.
- Good wikipedia article to learn about [Scales](<https://en.wikipedia.org/wiki/Scale_(music)>) in music. It describes the different types of scales and the different genres of music that utilise them
- The way the drums vary in [Ryoach! - Overpade](https://www.youtube.com/watch?v=9apkVO8Eav4&list=OLAK5uy_nOqxkbhr5AB_iStTdaHfRE2Wua6DE9GJE) is like how I imagine the drums would follow as the user taps different patterns. I also like how the chords follow along with the drums in this song.
- Slightly different idea would be rather than playing a drum sound when tap you play a section of a drum break sample (i.e. amen break) where pressing different buttons plays different sections of the sample. By tapping random buttons you could generate random chops of the break
