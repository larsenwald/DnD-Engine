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
-continue creating a level 1 fighter
*/


/*
put a pin in:
{
-Implement a 'melee attack' default action that either hits an unarmed 
strike or the weapon in the mainhand.
-Figure out how weapons are going to work and implement something at 
the very least functional
-Figure out how to track something like 'Finesse'
-Make weapons smarter. An item is added to inventory, store into it the
ability mod that it'll use, keeping finesse in mind. Have the add item
method parse the item json in such a way that it can do this. Also, 
extend addItem equipmentSlot parameter to take multiple values since
an item could potentially be stored in more than one equipment slot.
This means we'll probably have to take a look at the equip function 
as well.
- Modularize both weapon masteries and weapon properties
- Create an addWeapon method that will parse the 5e.tools json of a weapon and clean it, greatly simplifying the weapon object.
}
*/
c.proficiencies.weapon.push('Martial')