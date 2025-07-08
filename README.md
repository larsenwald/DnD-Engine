# My D&D Engine.

A personal study on OOP and game engine design.

## Main ideas

Everything that happens in the game (i.e. taking an action, modifying HP, checking for a bonus) should be an _event-like process_. Initially, I started with an `Event` class, but now I'm looking into an alternative hook-based approach.

### Original idea: An 'Event' Class

- An 'Event' class that is the parent of all things that can happen. Literally everything, from taking an action to decreasing health, will be its own class that extends the event class. The rough idea is that every event object will have an array of objects that will perform some sort of task based on some sort of condition, and that they will be ran through each time their respect object triggers. In this way, we can hope to encapsulate the expansive and edge-cased nature of D&D.

**Example:**  
A character equips a magical helm that gives +2 to attack rolls when below 50% HP.  
→ The helm attaches a condition-checking object to the `AttackRollEvent`.  
→ When the event runs, it checks HP and applies the bonus if the condition is met.

### Revised Idea: Hook + Context Model

- Ditching the universal `Event` class.
- Every major event (i.e. attackRoll(), savingThrow(), get hp()) is a method on the character.
- These methods:
  - Create a default `ctx` object.
  - Run all relevant `hooks`, which:
    - Specify whether they fire **before** or **after** the main logic.
    - Include a `logic(ctx)` function that mutates the context.

This could potentially give us a far more straightforward implementation than a universal 'Event' class while still giving us the modularity we're looking for.

## Currently I'm:

- Implementing a basic 'character sheet CLI'. Something that provides all of the base functionality of a character sheet but without the extensive automation that I have planned for the engine. The end product will be an application with basic rolling functionality and character data storage (non-persistant); something that I'd be able to use in a real D&D session. ✅ DONE

- Expanding upon the basic character sheet to include streamlined actions via logic insertion (see the Feature and Action class) ✅ DONE

- Continue adding any other functionality to make the transition from CLI to GUI as seamless as possible. ✅ DONE

- Implementing a basic GUI for the character sheet. This will be an interface that allows users to create and manage characters, play the game, and interact with the engine in a more visual way. Biggest to do is to implement an input/output system with a UI design similar to Apple's 'Spotlight' search.
