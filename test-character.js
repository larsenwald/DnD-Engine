const c = new Character();
let character = c; //this will be for the code to be able to reference the global character object when we can't access it easily via 'this'

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