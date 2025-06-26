const c = new Character();

let tries = 0;
const waitForLoad = setInterval(() => { //setting a interval to make the characterTesting() wait for async fetches to complete
    if (!itemsObject || !biggerItemsObject || !classesObject/*&& !otherObject || !anotherObject */){ //our check to see if all the async variables our character depends on have actually loaded
        tries++;
        if (tries > 100){ //if we try for 10 seconds and it still hasn't loaded, something's probably wrong
            console.error(`Still waiting for something to load! Timed out.`)
            clearInterval(waitForLoad)
        }
    }else{
//success!
//now let's dump all of that js object data to be garbage collected
itemsObject = null;
biggerItemsObject = null;
characterTesting(level1Fighter);
console.log(`Character generation successful!`);
//kill the interval, we only need this stuff to run once
clearInterval(waitForLoad);
    }
}, 100);

function characterTesting(character){//putting everything that gets called in the waitForLoad interval into a function to keep the code cleaner
    character();
}

function level1Fighter(){ 
//Step 1: Choose a class
c.charClass = 'Fighter';
c.level = 1;
c.proficiencies.armor.push('Light', 'Medium', 'Heavy', 'Shields');
c.proficiencies.weapon.push('Simple', 'Martial');

//Step 2: Determine origin
c.setBackground('Soldier', 'str', 'str', 'con', 'athletics', 'intimidation');

c.newFeature(`Savage Attacker`, 
    `Once per turn when you hit a target with a weapon, you can roll the weapon's dmg dice twice and use either result.`,
    'background'
)
c.newResource('Savage Attacker',  c.featuresArray.find(feature => compareStr(feature.name, 'savage attacker')).id, 1, new Hook(
    null, 
    'new turn', 
    null,
    function(){
        c.resources.find(ele => ele.name === 'Savage Attacker').charges = 1;
    },
    )
)
c.newHook(
    `Savage Attacker`, 
    'attack', 
    'after', 
    function(ctx){
         if (c.resources.find(ele => ele.name === 'Savage Attacker').charges > 0 && compareStr(prompt('Use savage attacker? y/n'), 'y')){
             let roll2 = ctx.damageResult.match(/[+-]?\s*(?:\d+d\d+|\d+)(?=[^:]*:)/g);
             let rollString = '';
             roll2.forEach(roll => rollString+= roll);
             roll2 = Roll.string(rollString);
             ctx.notes.push(`Savage Attacker damage reroll (pick this one or the original): ${roll2}`);
             c.resources.find(ele => ele.name === 'Savage Attacker').charges--;
         }
    }, 
    c.featuresArray.find(ele => ele.name === 'Savage Attacker').id
);

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
c.newResource(
    `Adrenaline Rush`, 
    c.featuresArray.find(ele => ele.name === `Adrenaline Rush`).id,
    c.proficiencyBonus,
    new Hook(
        `Adrenaline Rush`,
        `short rest`,
        null,
        function(){
            c.resources.find(ele => ele.name === `Adrenaline Rush`).charges = c.proficiencyBonus;
        },
        c.featuresArray.find(ele => ele.name === `Adrenaline Rush`).id
    )
)
c.newAction(
    `Adrenaline Rush`, 
    `bonus`, 
    c.featuresArray.find(ele => ele.name === `Adrenaline Rush`).id,
    function(){
        if (c.resources.find(ele => ele.name === `Adrenaline Rush`).charges > 0){
            c.hp.temp += c.proficiencyBonus;
            return `Base speed '${c.speed}' doubled to '${c.speed*2}' for this turn!`;
        }
    }
)

c.newFeature(`Darkvision`, `You have darkvision with a range of 120ft.`, `species`);
c.darkvision = '120ft';

c.newFeature(
    `Relentless Endurance`, 
    `When reduced to 0 hp but not immediately killed, you can drop to 1 hp instead. Can only use once; refreshes on long rest.`, 
    `species`
);
c.newResource(
    `Relentless Endurance`, 
    c.featuresArray.find(ele => ele.name === `Relentless Endurance`).id, 
    1, 
    new Hook(
        `Relentless Endurance reset`, 
        'long rest', 
        null,
        function(){
            c.resources.find(ele => ele.name === `Relentless Endurance`).charges = 1;
        },
        c.featuresArray.find(ele => ele.name === `Relentless Endurance`).id
    )
);
c.newHook(
    `Relentless Endurance`, 
    `change hp`, 
    null, 
    function(ctx){
        if (ctx.temp + ctx.current + ctx.change <= 0){
            if (
                c.resources.find(ele => ele.name === 'Relentless Endurance').charges > 0
                &&
                compareStr(prompt(`About to go down to zero health! Use relentless endurance? y/n`), 'y')
            ){
                c.hp.current = 1;
                c.resources.find(ele => ele.name === 'Relentless Endurance').charges--;
            }
        }
    }, 
    c.feature(`relentless endurance`).id
);
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
c.newHook(
    `Defense`, 
    `ac`, 
    null, 
    (ctx)=>{
        const armorSlot = c.equipmentSlots.armor;
        if (armorSlot && /[A-Z]A/i.test(armorSlot.type))
            ctx.components.push(1);
    }, 
    c.featuresArray.find(feature => compareStr(feature.name, `defense`)).id
);

c.newFeature(
    `Second Wind`, 
    `As a bonus action, regain hp equal to 1d10 plus fighter level. 
    You can use the feature twice; you regain one charge on short rest and regain all charges on long rest`,
    `fighter 1`
)
c.newResource(
    `Second Wind`, 
    c.feature(`Second Wind`).id, 
    2, 
    new Hook(
        `Second Wind recharge short rest`, 
        'short rest', 
        null,
        () => {
            c.resources.find(ele => ele.name === `Second Wind`).charges ++;
            if (c.resources.find(ele => ele.name === `Second Wind`).charges > 2)
                c.resources.find(ele => ele.name === `Second Wind`).charges = 2;
        },
        c.feature(`Second Wind`).id
    )
)
c.newHook(
    `Second Wind recharge long rest`,
    `long rest`,
    null,
    () => {
        c.resources.find(ele => ele.name === `Second Wind`).charges = 2;
    },
    c.feature(`Second Wind`).id
)
c.newAction(
    `Second Wind`, 
    `bonus`, 
    c.feature(`Second Wind`).id,
    () => {
        if (c.resources.find(ele => ele.name === `Second Wind`).charges > 0){
            const roll = Roll.string(`1d10 + ${c.level} [level]`);
            const rollValue = roll.match(/= [0-9]+/)[0].match(/[0-9]+/)[0];
            c.resources.find(ele => ele.name === `Second Wind`).charges--;
            c.changeHp(Number(rollValue));
            return `healed for ${rollValue}`
        }
    }
)
c.newFeature(
    `Weapon Mastery`, 
    `Gain the weapon masteries of three kinds of simple or martial weapons. Once per long rest, you can swap one mastery out for another.`,
    `fighter 1`
)
c.newWeaponMastery(c.feature(`Weapon Mastery`).id, `Greatsword`, `Shortbow`, `Javelin`);
c.newHook(
    `Weapon Mastery switch`, 
    `long rest`, 
    null, 
    (ctx)=>{
        let userPrompt = `Would you like to switch out one of these weapon masteries for another? If yes, type in the one you wish to replace. If no, leave blank.`;
        const masteries = ctx.character.proficiencies.weaponMastery.filter(mastery => mastery.srcId === c.feature(`Weapon Mastery`).id);
        masteries.forEach(mastery => userPrompt += ` ${mastery.type} |`);

        let response = prompt(userPrompt);
        if (!response) return;
        while (!masteries.find(mastery => compareStr(mastery.type, response))){
            let notFound = `You don't have a mastery with a name of '${response}'. Either enter one of these masteries or leave it blank.`
            masteries.forEach(mastery => notFound += ` ${mastery.type} |`);
            response = prompt(notFound);
            if (!response) return;
        }
        let replacement = prompt(`Enter the ${response} mastery's replacement.`)
        ctx.character.proficiencies.weaponMastery.find(ele => compareStr(ele.type, `greatsword`) && ele.srcId === ctx.character.feature(`Weapon Mastery`).id).type = replacement;
    }, 
    c.feature(`Weapon Mastery`).id
);

//Fill in Numbers (saving throws, skills, passive perception, hp, hit dice, initiative, ac, attacks, spellcasting, spell slots, cantrips/prepared spells)
c.proficiencies.save.push(`str`, `con`)
//saving throw roll and skill check methods implemented
//passive perception method implemented
c.hp.max = 10 + c.mod(`ability`, `con`);
c.hp.current = c.hp.max;
c.hitDice = {
    type: `d10`,
    max: c.level,
    current: c.level,
}
//initiative getter implemented
//ac getter implemented
//default attack action implemented
//name your character
}

function wizard(){
    c.charClass = `wizard`;
}


/*
the 'doing right now' stack:
-continue automating the level 1 fighter functions
*/