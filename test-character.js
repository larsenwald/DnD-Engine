const c = new Character();
let character = c; //the 'character' keyword will be used throughout the codebase as a global reference to the current character

//Step 1: Choose a class
c.charClass = 'Fighter';
c.level = 1;
c.proficiencies.armor.push('Light', 'Medium', 'Heavy', 'Shields');

//Step 2: Determine origin
c.setBackground('Soldier', 'str', 'str', 'con', 'athletics', 'intimidation');
c.newFeature(`Savage Attacker`, 
    `Once per turn when you a target with a weapon, you can roll the weapon's dmg dice twice and use either result.`,
    'background'
)
c.proficiencies.tool.push(`Playing Cards`)
//you get starting equipment from both background and class

/*
the 'doing right now' stack:
-continue creating a level 1 fighter
-make a 5etools json parsing method for adding new items
*/