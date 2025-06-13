My D&D Engine. A personal study on OOP and game engine design.

Main ideas:

- A 'Event' class that is the parent of all things that can happen. Literally everything, from taking an action to decreasing health, will be its own class that extends the event class. The rough idea is that every event object will have an array of objects that will perform some sort of task based on some sort of condition, and that they will be ran through each time their respect object triggers. In this way, we can hope to encapsulate the expansive and edge-cased nature of D&D.
  - Example: A character equips a magical helm that gives +2 to attack rolls when below 50% hp. The helm has internal logic so that, if equipped, it sticks this 'check' object to the attack-roll event object's array so that every time the attack-roll event is triggered, its array will contain a check to see if the character's health is below 50%, and if so, will give a +2 mod to that roll.

Currently I'm:

- Implementing a basic 'character sheet CLI'. Something that provides all of the base functionality of a character sheet but without the extensive streamlining that I have planned for the engine. The end product will be an application with basic rolling functionality and character data storage (non-persistant); something that I'd be able to use in a real D&D session. ✅ DONE

- Expanding upon the basic character sheet to include streamlined actions via logic insertion (see the Feature and Action class)
