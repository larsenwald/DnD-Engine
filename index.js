const descriptions = {
range: `A Range weapon has a range in parentheses after the Ammunition or Thrown property. The range lists two numbers. The first is the weapon's normal range in feet, and the second is the weapon's long range. When attacking a target beyond normal range, you have Disadvantage on the attack roll. You can't attack a target beyond the long range.`,
versatile: `A Versatile weapon can be used with one or two hands. A damage value in parentheses appears with the property. The weapon deals that damage when used with two hands to make a melee attack.`,
unarmedStrike: `Instead of using a weapon to make a melee attack, you can use a punch, kick, head-butt, or similar forceful blow. In game terms, this is an Unarmed Strike—a melee attack that involves you using your body to damage, grapple, or shove a target within 5 feet of you.

Whenever you use your Unarmed Strike, choose one of the following options for its effect.

Damage. You make an attack roll against the target. Your bonus to the roll equals your Strength modifier plus your Proficiency Bonus. On a hit, the target takes Bludgeoning damage equal to 1 plus your Strength modifier.

Grapple. The target must succeed on a Strength or Dexterity saving throw (it chooses which), or it has the Grappled condition. The DC for the saving throw and any escape attempts equals 8 plus your Strength modifier and Proficiency Bonus. This grapple is possible only if the target is no more than one size larger than you and if you have a hand free to grab it.

Shove. The target must succeed on a Strength or Dexterity saving throw (it chooses which), or you either push it 5 feet away or cause it to have the Prone condition. The DC for the saving throw equals 8 plus your Strength modifier and Proficiency Bonus. This shove is possible only if the target is no more than one size larger than you.`,

meleeAttack: 'An attack with the weapon in your main hand. If main hand is empty, an unarmed strike instead.',
attack: `When you take the Attack action, you can make one attack roll with a weapon or an Unarmed Strike.

Equipping and Unequipping Weapons. You can either equip or unequip one weapon when you make an attack as part of this action. You do so either before or after the attack. If you equip a weapon before an attack, you don't need to use it for that attack. Equipping a weapon includes drawing it from a sheath or picking it up. Unequipping a weapon includes sheathing, stowing, or dropping it.

Moving Between Attacks. If you move on your turn and have a feature, such as Extra Attack, that gives you more than one attack as part of the Attack action, you can use some or all of that movement to move between those attacks.`

}
class Roll{
    static d(roll, sides, adv){//function(how many dice to roll, how many sides of each die). returns array of rolls
        const output = [];
        for (let i = 0; i < roll; i++) output.push(Math.floor(Math.random() * sides) + 1);

        //if adv is 'adv', sort the array so that the highest roll is first. if adv is 'dis', sort the array so that the lowest roll is first.
        if (adv === 'adv') output.sort((a,b) => b.roll - a.roll);
        if (adv === 'dis') output.sort((a,b) => a.roll - b.roll);
        return output;
    }
}
class IdGenerator{
    constructor(initialCount){
        this.currentId = initialCount ? initialCount-1 : -1;
    }
    newId(){
        this.currentId++;
        return this.currentId;
    }
    
}

class Character{
    constructor(){//modeling the constructor after the order of the steps to create a new character in the 2024 PHB
        //Step 1: Choose a class
        this.charClass = '';
        this.subclass = '';
        this.level = 1;
        //*armor training was moved to the 'proficiencies' object

        //Step 2: Determine origin
        this.background = {
            name: '',
            //these bonus parameters will take a string of the ability we want to give the background bonus to
            bonus1:'',
            bonus2:'',
            bonus3:'',
        };
        this.feats = [];
        this.proficiencies = {
            save: [],
            skill: {//proficiencies can be 'none', 'half', 'proficient', or 'expertise'
                acrobatics: {proficiency: 'none', ability: 'dex'},
                animalHandling: {proficiency: 'none', ability: 'wis'},
                arcana: {proficiency: 'none', ability: 'int'},
                athletics: {proficiency: 'none', ability: 'str'},
                deception: {proficiency: 'none', ability: 'cha'},
                history: {proficiency: 'none', ability: 'int'},
                insight: {proficiency: 'none', ability: 'wis'},
                intimidation: {proficiency: 'none', ability: 'cha'},
                investigation: {proficiency: 'none', ability: 'int'},
                medicine: {proficiency: 'none', ability: 'wis'},
                nature: {proficiency: 'none', ability: 'int'},
                perception: {proficiency: 'none', ability: 'wis'},
                performance: {proficiency: 'none', ability: 'cha'},
                persuasion: {proficiency: 'none', ability: 'cha'},
                religion: {proficiency: 'none', ability: 'int'},
                sleightOfHand: {proficiency: 'none', ability: 'dex'},
                stealth: {proficiency: 'none', ability: 'dex'},
                survival: {proficiency: 'none', ability: 'wis'},
            },
            armor: [],
            weapon: []
        }
        //choose starting equipment
        this.inventory = []; //coins will go in inventory. we'll have a method that can print how many u have
        //choose a species
        this.species = '';
        this.speciesTraits = [];
        this.size;
        this.speed;
        this.languages = [];

        //Step 3: Determine Ability Scores
        this.abilityScores = {
            str: 10,
            dex: 10,
            con: 10,
            int: 10,
            wis: 10,
            cha: 10,
        }

        //Step 4: Choose an Alignment
        this.alignment;

        //Step 5: Fill in details
        this.featuresArray = [];
        /*
        what a features object might look like (yes, we'll create a class for Features)
        {
            name: 'string',
            source: 'string', (could be 'class', 'background', 'species', 'item', etc)
            type: 'string', (either 'feat', 'feature', or 'trait. can't think of any other possibilites, but not sure)
            action: {actionType: ('action', 'bonus', 'reaction', 'free', or 'passive'), ...other properties} (we might make action objects that hold logic and get pushed to their respective playbook arrays, but that may be outside the scope of this intentioally bare implementation. we'll see though.)
            description: 'string'
        }
        */
       //Fill in numbers
       this.hp = {
        max: 0,
        current: 0,
        temporary: 0
       }

       this.playbook = {//holds all the actions, bonus actions, etc
        action: [],
        bonus: [],
        reaction: [],
        free: [],
       }
       this.playbook.action.push(
        new Action(
            'Unarmed Attack',
            `Make an attack roll against target. Bonus equals strength mod plus proficiency bonus. Damage equals 1 + strength mod.`,
            null,
            null,
            'action',
            {attackRoll: [1, 20], attackMods: ['strengthMod', 'proficiencyBonus'], dmgRoll: [1, 1], dmgMods: ['strengthMod']},
            function(ctx){
                let attackRoll = Roll.d(...ctx.attackRoll)[0];
                for (let mod of ctx.attackMods){
                    if (typeof mod === 'string') attackRoll += character[mod];
                    else if (typeof mod === 'number') attackRoll += mod;
                };
                let dmgRoll = Roll.d(...ctx.dmgRoll)[0];
                for (let mod of ctx.dmgMods){
                    if (typeof mod === 'string') dmgRoll += character[mod];
                    else if (typeof mod === 'number') dmgRoll += mod;
                }
                ctx.finalVals = {
                    attackRoll,
                    dmgRoll,
                }
                return ctx;
            }
        )
       )
       //if I give the action class a hooks property, I can use that to execute logic that modifies the action's ctx before the action is executed. The real question is, should hooks have a before and after property? Like, if whether the hook should be executed before or after the action's logic is executed.

       this.equipmentSlots = {
        head: null,
        back: null,
        armor: null,
        hands: null,
        feet: null,
        neck: null,
        ring1: null,
        ring2: null,
        mainHand: null,
        offHand: null,
        misc: [],
       }

       this.resources = {}
       this.critCeil = 20;
       this.state = {}
    }

    //for Step 3, we're also meant to write down our ability modifiers. Let's just have a method that can dynamically return it. *edit done in step 5: The skill modifiers as well.
    mod(type, name){
        if (type === 'ability') return Math.floor((this.abilityScores[name]-10) / 2);
        if (type === 'skill'){
            const skillAbility = this.proficiencies.skill[name].ability;
            const skillProficiency = this.proficiencies.skill[name].proficiency;
            const profMultiplier = skillProficiency === 'none' ? 0 : (skillProficiency === 'half' ? 0.5 : (skillProficiency === 'proficient' ? 1 : 2));
            return this.mod('ability', skillAbility) + Math.floor(this.proficiencyBonus * profMultiplier)//skill's respecive ability mod + proficiency(if proficient)
        }
    }

    //for Step 5, we need to write down passive perception. Figured I might as well make it dynamically called.
    get passivePerception(){ return 10 + this.mod('skill', 'perception') }

    get initiative(){ return this.mod('ability', 'dex') }
    get armorClass(){ 
        const shieldBonus = (this.equipmentSlots.offHand && this.equipmentSlots.offHand.type === 'shield' ? this.equipmentSlots.offHand.ac : 0)
        const armorBonus = (this.equipmentSlots.armor ? this.equipmentSlots.armor.ac : 0)
        return 10 + this.mod('ability', 'dex') + armorBonus + shieldBonus
    }
    
    get proficiencyBonus(){ return Math.ceil(this.level / 4) + 1 }

    get features(){
        let output = ``;
        for (let feature of this.featuresArray) output += `id: ${feature.id} '${feature.name}'\n`;
        return output;
    }

    addFeature(name, description, sourceType, source, helloLogic, goodbyeLogic){//helloLogic is logic that will be execute only ONCE when the feature is added. actionLogic is logic that will be executed when the action is used. goodbyeLogic is logic that will be executed when the feature is removed, likely to reverse whatever helloLogic did.
        const feature = new Feature(name, actionType, description, sourceType, source, actionLogic);
        feature.id = idFeature.newId();
        helloLogic();
        feature.goodbyeLogic = goodbyeLogic;
        this.featuresArray.push(feature);
    }

    removeFeature(id){//for now, we'll only be able to delete features via their unique id
        const featureIndex = this.featuresArray.findIndex(ele => ele.id === id);
        const feature = this.featuresArray[featureIndex];

        feature.goodbyeLogic();

        this.featuresArray.splice(featureIndex, 1);
    }

    setBackground(name, bonus1, bonus2, bonus3, ...skillProfiencies){
        if (bonus1 === bonus2 && bonus1 === bonus3) 
            throw new Error('You can either have 3 different ability bonuses, or 2 of the same and one different. You cannot have all 3 the same.');
        this.background.name = name;
        this.background.bonus1 = bonus1;
        this.background.bonus2 = bonus2;
        this.background.bonus3 = bonus3;
        this.abilityScores[bonus1]++;
        this.abilityScores[bonus2]++;
        this.abilityScores[bonus3]++;
        for (let prof of skillProfiencies) 
            this.proficiencies.skill[prof].proficiency = 'proficient';
    }

    addItem(json, equipmentSlot){
        const item = JSON.parse(json);
        if (equipmentSlot)
            item.equipmentSlot = equipmentSlot;
        this.inventory.push(item);
    }

    equip(name){
        const gearPiece = this.inventory.find(ele => ele.name === name);
        if (!gearPiece)
            throw new Error(`Couldn't find an item with a name of '${name}' in inventory.`);
        if (!gearPiece.equipmentSlot)
            throw new Error(`'${gearPiece}' is not an equippable item.`);
        if (this.equipmentSlots[gearPiece.equipmentSlot])//if the equipment slot is full, push the item to be replaced to the inventory array--
            this.inventory.push(this.equipmentSlots[gearPiece.equipmentSlot]);
        this.equipmentSlots[gearPiece.equipmentSlot] = gearPiece;//--and THEN replace it with the new item
        this.inventory.splice(this.inventory.findIndex(ele => ele.name === name), 1);//delete the copy of the now equipped item
    }

    //this is a version of the hasProficiency method that only needs a name
    /*hasProficiency(name){
        const normalizedName = name.trim().toLowerCase();
        const profs = this.proficiencies;
        if (profs.skill[normalizedName])
            return (profs.skill[normalizedName].proficiency === 'proficient' || profs.skill[normalizedName].proficiency === 'expertise');
        for (let key in profs){
            if (Array.isArray(profs[key])){
                for (let prof of profs[key]){
                    if (compareStr(normalizedName, prof))
                        return true;
                }
            }
        }
        return false;
    }*/
    hasProficiency(proficiencyType, name){
        if (!this.proficiencies[proficiencyType])
            throw new Error('This category of proficiencies does not exist.');
        if (proficiencyType === 'skill'){
            if (!this.proficiencies.skill[name])
                throw new Error('This skill does not exist.');
            return this.proficiencies.skill[name].proficiency === 'proficient' || this.proficiencies.skill[name].proficiency === 'expertise';
        }

        for (let prof of this.proficiencies[proficiencyType]){
            if (compareStr(name, prof))
                return true;
        }
        return false;
    }

    //ability getters
    get strength(){
        return this.abilityScores.str;
    };
    get dexterity(){
        return this.abilityScores.dex;
    };
    get constitution(){
        return this.abilityScores.con;
    };
    get intelligence(){
        return this.abilityScores.int;
    };
    get wisdom(){
        return this.abilityScores.wis;
    };
    get charisma(){
        return this.abilityScores.cha;
    };
    //ability mod getters
    get strengthMod(){
        return this.mod('ability', 'str');
    };
    get dexterityMod(){
        return this.mod('ability', 'dex');
    };
    get constitutionMod(){
        return this.mod('ability', 'con');
    };
    get intelligenceMod(){
        return this.mod('ability', 'int');
    };
    get wisdomMod(){
        return this.mod('ability', 'wis');
    };
    get charismaMod(){
        return this.mod('ability', 'cha');
    };

}

const idFeature = new IdGenerator();
class Feature{
    constructor(name, actionType, description, sourceType, source, actionLogic){
        this.name = name;
        this.actionType = actionType; //either 'action', 'bonus', 'reaction', 'free', or 'passive'
        this.description = description;
        this.sourceType = sourceType; //either 'class', 'background', 'species', 'item', etc
        this.source = source; //the name of the source
        this.actionLogic = actionLogic; //a function that holds the logic of the feature. The logic will be pushed to the respective playbook array, but that'll be done via a method. I doubt this constructor will be called directly.
    }
}

const idAction = new IdGenerator();
class Action{
    constructor(name, description, source, sourceId, actionType, ctx, logic){
        this.name = name;
        this.description = description;
        this.source = source;
        this.sourceId = sourceId;
        this.actionType = actionType; //either 'action', 'bonus', 'reaction', 'free'
        this.ctx = ctx;
        this.logic = logic;
        this.hooks = {before: [], after: []};
        this.id = idAction.newId();
    }
}

//putting a pin in the weapon logic for now
/*class Weapon{
    constructor(name, range, rarity, weight, value, weaponCategory, properties, weaponMastery, dmg1, dmg2, dmgType, helloLogic, goodbyeLogic){
        this.name = name;
        this.range = range;
        this.rarity = rarity;
        this.weight = weight;
        this.value = value;
        this.type = weaponCategory; //either 'simple' or 'martial'
        this.properties = properties; //array of properties
        this.mastery = weaponMastery;
        this.dmg1 = dmg1; //damage die for 1-handed use
        if (dmg2) this.dmg2 = dmg2;
        this.dmgType = dmgType;
        this.helloLogic = helloLogic;
        this.goodbyeLogic = goodbyeLogic;
    }

    // properties can expect a context object with the following:
    // notes
    // attackRoll to be rolled
    // dmgRoll to be rolled
    // dmg1 (default)
    // dmg2
    static properties = {
        versatile: {
            description: descriptions.versatile,
            logic: function(ctx){
                if ((character.equipmentSlots.mainHand && !character.equipmentSlots.offHand) || character.equipmentSlots.offHand && !character.equipmentSlots.mainHand)
                    ctx.dmg1 = ctx.dmg2;
            }
        },
        range: {
            description: descriptions.range,
            logic: function(ctx){
                const isFar = prompt(`Target further than ranged weapon's normal range? yes/no`);
                ctx.attackRoll = isFar.trim().charAt(0).toLowerCase === 'y' ? [2, 20, 'dis'] : ctx.attackRoll;
            }
        },

    }
}*/