const c = new Character();
let character = c; //the 'character' keyword will be used throughout the codebase as a global reference to the current character

let tries = 0;
const waitForLoad = setInterval(() => { //setting a interval to make the characterTesting() wait for async fetches to complete
    if (!itemsObject || !biggerItemsObject/*&& !otherObject || !anotherObject */){ //our check to see if all the async variables our character depends on have actually loaded
        tries++;
        if (tries > 50){
            console.error(`Still waiting for something to load! Timed out.`)
            clearInterval(waitForLoad)
        }
    }else{
//success!
//now let's dump all of that js object data to be garbage collected
itemsObject = null;
biggerItemsObject = null;
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
c.proficiencies.weapon.push('Simple', 'Martial');

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
c.newItem(`trinket`, 1, `a mummified goblin hand (entry #1 on the 'Trinkets' d100 table)`)

//choose a species
c.species = `Orc`;
c.size = `Medium`;
c.speed = 30;
c.newFeature(`Adrenaline Rush`, 
    `You can Dash as a bonus action a number of times equal to your proficiency bonus (refreshing upon short or long rest). 
    When you dash like this, gain temporary hp equal to your profiency bonus.`,
    `species`
)
c.newFeature(`Darkvision`, `You have darkvision with a range of 120ft.`, `species`);
c.newFeature(`Relentless Endurance`, `When reduced to 0 hp but not immediately killed, you can drop to 1 hp instead. Can only use once; refreshes on long rest.`, `species`);
//Choose Languages (common is statically added in the default Character class)
c.languages.push(`Orc`, `Giant`)

//Step 3: Determine Ability Scores (generate ability scores, apply ability scores, take background bonuses into account, write down your ability modifiers)
//for now i'm just going to manually use standard array. modifiers from the background are already programmatically applied, so we can statically enter the values without worry
c.abilityScores.str.value = 14;
c.abilityScores.dex.value = 13;
c.abilityScores.con.value = 15;
c.abilityScores.int.value = 12;
c.abilityScores.wis.value = 10;
c.abilityScores.cha.value = 8;

//Step 4: Choose an Alignment
c.alignment = 'CG';

//Step 5: Fill in the details
//class features
c.newFeature(`Fighting Style`, `Pick a fighting style feat. Whenever you gain a fighter level, you can switch it out for another.`, `fighter 1`);
c.newFeature(`Defense`, `While wearing light, medium, or heavy armor, you have a +1 to ac.`, `Fighting Style`, c.featuresArray.find(ele => compareStr(ele.name, `fighting style`)).id);
c.newFeature(
    `Second Wind`, 
    `As a bonus action, regain hp equal to 1d10 plus fighter level. 
    You can use the feature twice; you regain one charge on short rest and regain all charges on long rest`,
    `fighter 1`
)
c.newFeature(
    `Weapon Mastery`, 
    `Gain the weapon masteries of three kinds of simple or martial weapons. Once per long rest, you can swap one mastery out for another.`,
    `fighter 1`
)
c.proficiencies.weaponMastery.push(`Greatsword`, `shortbow`, `javelin`);

//Fill in Numbers (saving throws, skills, passive perception, hp, hit dice, initiative, ac, attacks, spellcasting, spell slots, cantrips/prepared spells)
c.proficiencies.save.push(`str`, `con`)
//saving throw roll and skill check methods implemented
//passive perception method implemented
c.hp = 10 + c.mod(`ability`, `con`);
//initiative getter implemented
//ac getter implemented

//name your characters
}



/*
the 'doing right now' stack:
-continue creating a level 1 fighter
-implement an attack action
*/