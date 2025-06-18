const c = new Character();
let character = c; //the 'character' keyword will be used throughout the codebase as a global reference to the current character

let tries = 0;
const waitForLoad = setInterval(() => { //setting a interval to make the characterTesting() wait for async fetches to complete. awful but it works for now
    if (!itemsObject || !biggerItemsObject/*&& !otherObject || !anotherObject */){ //our check to see if all the async variables our character depends on have actually loaded
        tries++;
        if (tries > 50){
            console.error(`Still waiting for something to load! Timed out.`)
            clearInterval(waitForLoad)
        }
    }else{
//success!
characterTesting();
//kill the interval, we only need this stuff to run once
clearInterval(waitForLoad);
    }
}, 100);



function characterTesting(){ //putting everything that gets called in the waitForLoad interval into a function to keep the code cleaner

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

//background starting equipment
c.newItem(`spear`);
c.newItem(`shortbow`);
c.newItem(`arrow`, 20);
c.newItem(`playing cards`);
c.newItem(`healer's kit`);
c.newItem(`quiver`);
c.newItem(`traveler's clothes`);
c.newItem(`gold piece`, 14);
//class starting equipment
c.newItem(`chain mail`);
c.newItem(`Greatsword`)
c.newItem(`Flail`)
c.newItem(`Javelin`, 8)
c.newItem(`Dungeoneer's Pack`)
c.newItem(`gold piece`, 4)
}



/*
the 'doing right now' stack:
-continue creating a level 1 fighter
*/