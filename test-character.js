const c = new Character();
let character = c; //the 'character' keyword will be used throughout the codebase as a global reference to the current character

//Step 1: Choose a class
c.charClass = 'Fighter';
c.level = 1;
c.proficiencies.armor.push('Light', 'Medium', 'Heavy', 'Shields');

//Step 2: Determine origin
c.setBackground('Soldier', 'str', 'str', 'con', 'athletics', 'intimidation');


/*
the 'doing right now' stack:
-Implement a 'melee attack' default action that either hits an unarmed 
strike or the weapon in the mainhand.
-Figure out how weapons are going to work and implement something
at the very least functional
*/

c.proficiencies.weapon.push('Martial')