class IdGenerator{
    constructor(initialCount){
        this.currentId = initialCount ? initialCount-1 : -1;
    }
    newId(){
        this.currentId++;
        return this.currentId;
    }
    
}
const idGen = new IdGenerator();

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
            weapon: [],
            weaponMastery: [],
            tool: []
        }
        //choose starting equipment
        this.inventory = []; //coins will go in inventory. we'll have a method that can print how many u have
        //choose a species
        this.species = '';
        //this.speciesTraits = [];  //decided to just let the featuresArray hold on to species traits for now
        this.size;
        this.speed;
        this.languages = [`Common`];

        //Step 3: Determine Ability Scores
        this.abilityScores = {
            str: {value: 10, mods: []},
            dex: {value: 10, mods: []},
            con: {value: 10, mods: []},
            int: {value: 10, mods: []},
            wis: {value: 10, mods: []},
            cha: {value: 10, mods: []},
        }

        //Step 4: Choose an Alignment
        this.alignment;

        //Step 5: Fill in details
        this.featuresArray = [];
       //Fill in numbers
       this.hp = {
        max: 0,
        current: 0,
        temp: 0
       }

       //spellCasting
       this.spellCasting = {
        ability: '',
        cantripsAllowed: {}, //`wizard: 3` or `druid: 4` for example
        preparedSpellsAllowed: 0,
        spellSlots: {},//`lvl1: 2`, `lvl2: 1` etc
       };

       this.actions = [];

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

       this.resources = []
       this.critCeil = 20;
       this.state = {}
       this.hooks = [
        new Hook(
            'crit',
            'attack',
            'after',
            function(ctx){
                const critCheck = /: \{[0-9]+!\}/;
                if (critCheck.test(ctx.attackResult)){
                    const getDice = /[0-9]+d[0-9]+/g;
                    const damageDice = ctx.damageResult.match(getDice);
                    let beforeColon = ''
                    damageDice.forEach(roll => {
                        beforeColon += `+ ${roll} (crit)`;
                    });
                    let afterColon = '';
                    let toBeAdded = 0;
                    damageDice.forEach(roll => {
                        let parsedRoll = Roll.string(roll);
                        afterColon += `+ ${parsedRoll.match(/\(?\{.+\}\)?/)[0]}`;
                        toBeAdded += Number(parsedRoll.match(/= [0-9]+/)[0].match(/[0-9]+/)[0]);
                    })
                    const colonIndex = ctx.damageResult.indexOf(':');
                    beforeColon = ctx.damageResult.slice(0, colonIndex) + ` ${beforeColon}`;
                    const equalsIndex = ctx.damageResult.indexOf('=');
                    afterColon = ctx.damageResult.slice(colonIndex+1, equalsIndex) + `${afterColon}`;
                    let grandTotal = Number(ctx.damageResult.slice(equalsIndex+1)) + toBeAdded;
                    ctx.damageResult = beforeColon + ':' + afterColon + ` = ${grandTotal}`;
                    console.log()
                    return;
                }
            },
            null)
        ];
         this.hooks.push(...WeaponRegistry.properties); //adding the weapon properties hooks to the character's hooks array
         this.hooks.push(...WeaponRegistry.masteries); //

         this.inspiration = false;

         this.hitDice = {
            type: '',
            max: this.level,
            current: this.level,
        }

        this.exhaustionLevel = 0;
    }

    //for Step 3, we're also meant to write down our ability modifiers. Let's just have a method that can dynamically return it. *edit done in step 5: The skill modifiers as well.
    mod(type, name){
        if (type === 'ability'){
            name = name.toLowerCase().trim().slice(0, 3);
            let abilityScore = this.abilityScores[name].value;
            const abilityMods = this.abilityScores[name].mods;
            for (let mod of abilityMods) abilityScore += mod.value;
            return Math.floor((abilityScore-10) / 2);            
        };
        if (type === 'skill'){
            const skillAbility = this.proficiencies.skill[name].ability;
            const skillProficiency = this.proficiencies.skill[name].proficiency;
            const profMultiplier = skillProficiency === 'none' ? 0 : (skillProficiency === 'half' ? 0.5 : (skillProficiency === 'proficient' ? 1 : 2));
            return this.mod('ability', skillAbility) + Math.floor(this.proficiencyBonus * profMultiplier)//skill's respecive ability mod + proficiency(if proficient)
        }
    }

    //for Step 5, we need to write down passive perception. Figured I might as well make it dynamically called.
    get passivePerception(){ return 10 + this.mod('skill', 'perception') }

    get initiative(){ return Roll.d(1, 20)[0].val + this.mod('ability', 'dex') };
    get ac(){ 
        const shieldBonus = (this.equipmentSlots.offHand && this.equipmentSlots.offHand.type.charAt(0) === 'S' ? this.equipmentSlots.offHand.ac : 0)
        let armorBonus = null;
        if (this.equipmentSlots.armor && this.equipmentSlots.armor.type.slice(0, 2) === "LA")
            armorBonus = (this.equipmentSlots.armor.ac - 10) + this.mod(`ability`, `dex`);
        if (this.equipmentSlots.armor && this.equipmentSlots.armor.type.slice(0, 2) === "MA")
            armorBonus = (this.equipmentSlots.armor.ac - 10) + Math.min(this.mod(`ability`, `dex`), 2);
        if (this.equipmentSlots.armor && this.equipmentSlots.armor.type.slice(0, 2) === "HA")
            armorBonus = this.equipmentSlots.armor.ac - 10;
        const ctx = {
            components: [10, (armorBonus !== null ? armorBonus : this.mod('ability', 'dex')), shieldBonus]
        }
        this.hooks.forEach(hook => {
            if (hook.meantFor === `ac`) hook.logic(ctx);
        })
        return ctx.components.reduce((total, current) => total + current)
    }
    
    get proficiencyBonus(){ return Math.ceil(this.level / 4) + 1 }

    setBackground(name, bonus1, bonus2, bonus3, ...skillProfiencies){
        if (bonus1 === bonus2 && bonus1 === bonus3) 
            throw new Error('You can either have 3 different ability bonuses, or 2 of the same and one different. You cannot have all 3 the same.');
        this.background.name = name;
        this.background.bonus1 = bonus1;
        this.background.bonus2 = bonus2;
        this.background.bonus3 = bonus3;
        this.abilityScores[bonus1].mods.push({value: 1, src: `background: ${name}`});
        this.abilityScores[bonus2].mods.push({value: 1, src: `background: ${name}`});
        this.abilityScores[bonus3].mods.push({value: 1, src: `background: ${name}`});
        for (let prof of skillProfiencies) 
            this.proficiencies.skill[prof].proficiency = 'proficient';
    }


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
        return this.abilityScores.str.mods.reduce((val, current) => val + current.value, this.abilityScores.str.value);
    };
    get dexterity(){
        return this.abilityScores.dex.mods.reduce((val, current) => val + current.value, this.abilityScores.dex.value);
    };
    get constitution(){
        return this.abilityScores.con.mods.reduce((val, current) => val + current.value, this.abilityScores.con.value);
    };
    get intelligence(){
        return this.abilityScores.int.mods.reduce((val, current) => val + current.value, this.abilityScores.int.value);
    };
    get wisdom(){
        return this.abilityScores.wis.mods.reduce((val, current) => val + current.value, this.abilityScores.wis.value);
    };
    get charisma(){
        return this.abilityScores.cha.mods.reduce((val, current) => val + current.value, this.abilityScores.cha.value);
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

    spellSaveDc(){
        if (!this.spellCasting.ability)
            throw new Error(`Character does not have spellcasting ability.`);
        const ctx = {
            character: this,
            base: 8,
            mods: [
                `${this.mod(`ability`, this.spellCasting.ability)} [${this.spellCasting.ability}]`,
                `${this.proficiencyBonus} [proficiency]`
            ],
            notes: ''
        }
        this.hooks.filter(hook => hook.meantFor === 'spell save dc').forEach(hook => hook.logic(ctx));

        let rollString = ctx.base + '';
        ctx.mods.forEach(mod => rollString += `+ ${mod}`);

        return Roll.string(rollString) + `\nNotes: ${ctx.notes}`;
    }

    spellAttackMod(){
        if (!this.spellCasting.ability)
            throw new Error(`Character does not have spellcasting ability.`);
        const ctx = {
            character: this,
            base: this.mod(`ability`, this.spellCasting.ability) + `[${this.spellCasting.ability}]`,
            mods: [`${this.proficiencyBonus} [proficiency]`],
            notes: ''
        }
        this.hooks.filter(hook => hook.meantFor === 'spell attack mod').forEach(hook => hook.logic(ctx));

        let rollString = ctx.base;
        ctx.mods.forEach(mod => rollString += `+ ${mod}`);

        return Roll.string(rollString) + `\nNotes: ${ctx.notes}`;
    }

    //checks
    savingThrow(type){ //accounts for first three letters of string input. for example, it can take 'str' or 'strength'
        const normalizedType = type.toLowerCase().trim().slice(0, 3);
        return this.mod(`ability`, normalizedType) + Roll.d(1, 20)[0].val + (this.proficiencies.save.includes(normalizedType) ? this.proficiencyBonus : 0);
    }
    check(type, name){// (skill||ability, acrobatics||animal handling||dexterity, etc)
        return Roll.d(1,20)[0].val + this.mod(type, name);
    }

    attack(){
        let ctx;
        if (this.equipmentSlots.mainHand){
            const weapon = this.equipmentSlots.mainHand
            ctx = {
                character: this,
                weapon: weapon,
                attackRoll: [
                    `d20`,
                    `${this.proficiencies.weapon.find(prof => compareStr(prof, weapon.weaponCategory)) ? this.proficiencyBonus : 0} [proficiency]`,
                    `${this.mod(`ability`, `strength`)} [strength]`
                ],
                damageRoll: [
                    weapon.dmg1,
                ],
                notes: [],
            }
            //run 'before' hooks
            this.hooks.forEach(hook => {
                if (hook.meantFor === 'attack' && hook.when === 'before') hook.logic(ctx);
            });
            if (ctx.cancelled) return `attack cancelled by hook '${ctx.cancelled}'`;
            let attackRoll = ctx.attackRoll[0];
            for (let i = 1; i < ctx.attackRoll.length; i++) attackRoll += `+ ${ctx.attackRoll[i]}`;
            let damageRoll = ctx.damageRoll[0];
            for (let i = 1; i < ctx.damageRoll.length; i++) damageRoll += `+ ${ctx.damageRoll[i]}`;
            attackRoll = Roll.string(attackRoll);
            damageRoll = Roll.string(damageRoll);
            ctx.attackResult = attackRoll;
            ctx.damageResult = damageRoll;
            //run 'after' hooks
            this.hooks.forEach(hook => {
                if (hook.meantFor === 'attack' && hook.when === 'after') hook.logic(ctx);
            });
            let output = `${ctx.attackResult}\n${ctx.damageResult}`;
            for (let note of ctx.notes) output += `\n${note}`;
            return output;
        }
        return `no weapon`; //we need to change this to be an unarmed strike action if the character has no weapon equipped in the main hand
    }

    newTurn(){
        this.hooks.forEach(hook => {
            if (hook.meantFor === 'new turn') hook.logic();
        });
    }

    shortRest(){
        if (this.hp.current < 1)
            throw new Error(`To start a short rest, you must have at least 1 hit point.`)

        const userPrompt = `Would you like to spend some of your hit point dice to regain hit points? You currently have ${this.hitDice.current}. If yes, enter the number you'd like to use. Otherwise, you can just leave this blank.`
        const ctx = {
            character: this,
            hitDiceToUse: Math.floor(this.hitDice.current > 0 ? prompt(userPrompt) : 0) || 0,
        }
        while (ctx.hitDiceToUse > this.hitDice.current)
            ctx.hitDiceToUse = Math.floor(prompt(`You don't have that many hit dice. Please enter a value equal to or less than ${this.hitDice.current}`)) || 0;
        ctx.roll = `${ctx.hitDiceToUse}${this.hitDice.type} [hit dice] + ${this.mod(`ability`, `con`) * ctx.hitDiceToUse} [con-mod times number-of-hit-dice]`;
        ctx.minHealthGain = ctx.hitDiceToUse;

        this.hooks.forEach(hook => {
            if (hook.meantFor === 'short rest') hook.logic(ctx);
        })

        let shortRestOutput = 'no hit dice used';
        if (ctx.hitDiceToUse > 0){
            shortRestOutput = Roll.string(ctx.roll);
            const healthGained = Number(shortRestOutput.match(/= [0-9]+/)[0].match(/[0-9]+/)[0]);
            const minHealthRegain = ctx.hitDiceToUse;
            this.changeHp(healthGained < minHealthRegain ? minHealthRegain : healthGained);
            if (healthGained < minHealthRegain) shortRestOutput += `\nGained a minimum of ${minHealthRegain} health. (minimum of 1 health per die spent)`
            this.hitDice.current -= ctx.hitDiceToUse;
        }
        return shortRestOutput;
    }

    longRest(){
        if (this.hp.current < 1)
            throw new Error(`To start a long rest, you must have at least 1 hit point.`)

        const ctx = {
            character: this,
            setHpTo: this.hp.max,
            setHitDiceTo: this.hitDice.max,
            exhaustionReducedBy: 1,
            notes: null
        }

        this.hooks.forEach(hook => {
            if (hook.meantFor === 'long rest') hook.logic(ctx);
        })

        this.hp.current = ctx.setHpTo;
        this.hitDice.current = ctx.setHitDiceTo;
        let exhaustionReduced;
        if (this.exhaustionLevel > 0){
            this.exhaustionLevel -= ctx.exhaustionReducedBy;
            exhaustionReduced = true;
        }

        return `Health set to ${ctx.setHpTo}, hit dice set to ${ctx.setHitDiceTo}${exhaustionReduced ? `, exhaustion reduced by ${ctx.exhaustionReducedBy}.` : `.`}${ctx.notes ? `\n${ctx.notes}` : ''}`;
    }
    
    changeHp(negativeOrPositiveNumber){
        const ctx = {
            change: negativeOrPositiveNumber,
            max: this.hp.max,
            current: this.hp.current,
            temp: this.hp.temp,
        }
        if (ctx.change < 0 && ctx.temp > 0){
            const difference = ctx.temp + ctx.change;
            if (difference >= 0) this.hp.temp = difference;
            else if (difference < 0) {
                this.hp.current += difference;
                this.hp.temp = 0;
            }
        }
        else this.hp.current += ctx.change;
        if (this.hp.current > this.hp.max) this.hp.current = this.hp.max;
        this.hooks.forEach(hook => {
            if (hook.meantFor === 'change hp') hook.logic(ctx);
        })
        console.log(`${ctx.change > 0 ? 'Gained' : 'Lost'} ${ctx.change} health.`)
    }

    //adding stuff
    newFeature(name, description, src, srcId=null){
        if (this.featuresArray.find(ele => compareStr(ele.name, name)))
            throw new Error(`A feature with the name '${name}' already exists.`);
        this.featuresArray.push(new Feature(name, description, src, srcId));
    }
    removeFeature(name){ //future me: we could potentially make it also delete all actions that have the feature's name as their source.
        const index = this.featuresArray.findIndex(ele => compareStr(ele.name, name));
        if (index === -1)
            throw new Error(`Couldn't find a feature named ${name}`);
        this.featuresArray.splice(index, 1);
    }
    newItem(name, amount = 1, note=null){
        let itemObj = itemObjectsArray.find(ele => compareStr(ele.name, name) && ele.source === 'XPHB');//only looking for items from XPHB for now
        if (!itemObj) throw new Error(`Couldn't find an item with a name of '${name}' in the itemsArray.`)

        //if it's armor or a weapon, just push it immediately the amount of times equal to the amount value (recall each item will have a unique ID)
        if (itemObj.armor || itemObj.weapon) {
            for (let i = 0; i < amount; i++){
                const item = new Item(itemObj);
                item.note = note;
                this.inventory.push(item);
            }
            return;
        }

        //if it's neither armor or weapon, first check if it's in the inventory. if it is, increment the stack a number of times equal to the amount value
        let index = this.inventory.findIndex(ele => compareStr(itemObj.name, ele.name));
        if (index !== -1){
            this.inventory[index].amount += amount;
            return;
        }

        //if it's not in the inventory, create a new item object, add a 'amount' property with a value equal to the amount argument
        const item = new Item(itemObj);
        item.amount = amount;
        item.note = note;
        this.inventory.push(item);
    }
    equip(itemId, slot){
        const index = this.inventory.findIndex(ele => ele.id === itemId);
        if (index === -1)
            throw new Error (`Couldn't find an item with an id of ${itemId} to equip.`);
        
        //if slot already full, unequip the item inside it first
        if (this.equipmentSlots[slot])
            this.unequip(this.equipmentSlots[slot]);

        this.equipmentSlots[slot] = this.inventory.splice(index, 1)[0];
        this.equipmentSlots[slot].logic?.();
    }
    unequip(slot){
        const slotId = this.equipmentSlots[slot].id;
        this.inventory.push(this.equipmentSlots[slot]);
        this.equipmentSlots[slot] = null;

        this.featuresArray = this.featuresArray.filter(ele => ele.srcId !== slotId);
        this.actions = this.actions.filter(ele => ele.srcId !== slotId);
        this.hooks = this.hooks.filter(ele => ele.srcId !== slotId);
        this.resources = this.resources.filter(ele => ele.srcId !== slotId);
    }

    newResource(name, srcId, charges, hook){
        const resource = new Resource(name, srcId, charges);
        if (hook){
            const hookObj = hook;
            this.hooks.push(hookObj);
        }
        this.resources.push(resource)
    }
    newHook(name, meantFor, when, logic, srcId){
        const hook = new Hook(name, meantFor, when, logic, srcId);
        this.hooks.push(hook);
    }
    newAction(name, type, srcId, logic){
        const action = new Action(name, type, srcId, logic);
        this.actions.push(action);
    }
    newWeaponMastery(srcId = null, ...type){
        for (let t of type) this.proficiencies.weaponMastery.push(new WeaponMastery(t, srcId));
    }


    //helper methods
    feature(name){
        const feature = this.featuresArray.find(ele => compareStr(ele.name, name));
        if (!feature) throw new Error (`Couldn't find a feature with a name of '${name}'.`)
        return feature;
    }
    get logInventory(){
        this.inventory.forEach(ele => console.log(`Name: ${ele.name}\nId: ${ele.id}\namount: ${ele.amount ? ele.amount : 1}`))
    }
    logItem(name){
        let itemsFound = 0;
        this.inventory.forEach(ele => {
            if (compareStr(name, ele.name)){
                console.log(`Name: ${ele.name}\nId: ${ele.id}\namount: ${ele.amount ? ele.amount : 1}`);
                itemsFound++;
            }
        });
        if (itemsFound === 0) console.error(`Couldn't find an item with the name of '${name}'.`);
    }
    get logEquipment(){
        Object.keys(this.equipmentSlots).forEach(key => console.log(`${key}: ${this.equipmentSlots[key] ? this.equipmentSlots[key].name : null}`));
    }

    //static
    static newCharacter(
        className, 
        level = 1, 
        backgroundName, 
        backgroundBonuses = [], 
        variableToolSelection, //a background may allow you to choose a tool proficiency from a list of options. if so, user must pass in their choice through the variableToolSelection argument
        classSkillProfChoices = [],//must be an array of two skills
        backgroundStartingEquipmentLetter,
        classStartingEquipmentLetter,
        trinketTableNumber, //will be random if undefined
        speciesName,
        chosenSize,
        knownLanguages = [],
        baseAbilityScores = [],
        alignment,
        maxHp,

    ){
        //validate className
        if (!classObjectsArray.find(ele => compareStr(ele.name, className)))
            throw new Error(`Couldn't find a class with a name of ${className} in the classObjectsArray.`);
        const classObj = classObjectsArray.find(ele => compareStr(ele.name, className));

        //validate level
        if (level < 1 || level > 20)
            throw new Error(`Please choose a level between 1 and 20. ${level} is not a valid option.`);

        //validate background name
        if (!backgroundObjectsArray.find(ele => compareStr(ele.name, backgroundName)))
            throw new Error(`Couldn't find a background with a name of ${backgroundName} in the backgroundObjectsArray.`);
        const backgroundObj = backgroundObjectsArray.find(ele => compareStr(ele.name, backgroundName));

        //validate background bonuses: there are three ability scores && they are the right ones for the specific background && there are not three identical ones
        if (!Array.isArray(backgroundBonuses) || backgroundBonuses.length !== 3)
            throw new Error (`The background bonuses argument must be an array that has exactly three ability scores to increase by 1.`)
        let abilityScoreImprovementChoicePool = [];
        backgroundObj.ability.find(ele => ele.choose.weighted.from).choose.weighted.from.forEach(ele => abilityScoreImprovementChoicePool.push(ele));
        backgroundBonuses.forEach(bonus => {
            if (!abilityScoreImprovementChoicePool.includes(bonus))
                throw new Error(`${bonus} is not one of the three ability scores you can increase for the ${backgroundName} background. You can only increase: ${[...abilityScoreImprovementChoicePool]}`)
        });
        if (backgroundBonuses[0] === backgroundBonuses[1] && backgroundBonuses[1] === backgroundBonuses[2])
            throw new Error (`You cannot have three identical bonuses. Only two of same and one different, or all three different.`);

        //validate species name
        if (!speciesObjectsArray.find(ele => compareStr(ele.name, speciesName)))
            throw new Error(`Couldn't find a species with a name of ${speciesName} in the speciesObjectsArray.`);
        const speciesObj = speciesObjectsArray.find(ele => compareStr(ele.name, speciesName));
        
        
        const c = new Character(); 

        //write your level
        c.level = level;
        //note armor training
        if (classObj.startingProficiencies.armor){
            classObj.startingProficiencies.armor.forEach(prof => {
                c.proficiencies.armor.push(prof)
            });
        };
        //Choose your background
        //record your feat
        const originFeat = toTitleCase(Object.keys(backgroundObj.feats[0])[0].match(/[a-z]+ *[a-z]*;* *[a-z]*/i)[0]);
        const originFeatNormalized = originFeat.match(/[a-z]+ *[a-z]*/i)[0];
        let originFeatDescription = '';
        originFeatObjectsArray.find(ele => compareStr(ele.name, originFeatNormalized)).entries.forEach(ele => {
            if (typeof ele === 'string') originFeatDescription += ele + `\n`;
            else if (typeof ele === 'object') originFeatDescription += ele.entries[0] + '\n';
        })
        c.newFeature(
            originFeat,
            originFeatDescription,
            'background',
        );
        //note proficiencies
        const backgroundSkillProfsArray = backgroundObj.entries[0].items.find(ele => /skill proficiencies/i.test(ele.name)).entry.match(/(?<=@skill )[a-z ]*(?=\|)/ig)//should return an array with both profs (i.e. ['Deception', 'Sleight of Hand'])
        Object.keys(c.proficiencies.skill).forEach(skill => {
            let regex = new RegExp(skill, 'i');
            if (regex.test(backgroundSkillProfsArray[0]) || regex.test(backgroundSkillProfsArray[1]))
               c.proficiencies.skill[skill].proficiency = 'proficient';
        });

        //gotta circle back to tool proficiencies when I get the chance
        const backgroundToolProf = Object.keys(backgroundObj.toolProficiencies[0])[0]
        console.warn(`*Remember to circle back to tool proficiency logic*`);

        const classSaveProficiencies = classObj.proficiency; //array ['str', 'con']
        classSaveProficiencies.forEach(saveProf => c.proficiencies.save.push(saveProf));

        //choosing 2 skill proficiencies offered by class
        const validSkills = classObj.startingProficiencies.skills[0].choose.from; //array of class skill profs to choose from
        if (classSkillProfChoices.length !== 2)
            throw new Error(`You must choose *two* skill proficiencies from the available list your chosen class provides: ${validSkills.join(', ')}`)
        if (classSkillProfChoices.some(ele => ele.length < 3))
            throw new Error(`Both skill proficiency choices must be at least 3 characters long.`);

        const userInputSkill1 = classSkillProfChoices[0];
        const userInputSkill2 = classSkillProfChoices[1];

        let trueSkill1 = validSkills.find(ele => new RegExp(`^${userInputSkill1}`, 'i').test(ele));
        if (!trueSkill1)
            throw new Error (`'${userInputSkill1}' is not a valid skill available in your pool of skill proficiency choices. Available choices: ${validSkills.join(', ')}`);
        trueSkill1 = toCamelCase(trueSkill1);
        c.proficiencies.skill[trueSkill1].proficiency = 'proficient';

        let trueSkill2 = validSkills.find(ele => new RegExp(`^${userInputSkill2}`, 'i').test(ele));
        if (!trueSkill2)
            throw new Error(`'${userInputSkill2}' is not a valid skill available in your pool of skill proficiency choices. Available choices: ${validSkills.join(', ')}`);
        trueSkill2 = toCamelCase(trueSkill2);
        if (trueSkill2 === trueSkill1)
            throw new Error(`You cannot pick the same class skill proficiency ('${trueSkill2}') twice`);
        c.proficiencies.skill[trueSkill2].proficiency = 'proficient';

        //background and class both provide starting equipment
        backgroundObj.startingEquipment[0][backgroundStartingEquipmentLetter].forEach(item => {
            if (item.value){
                c.newItem(`Gold Piece`, item.value/100);
                return;
            }
            c.newItem(item.item.match(/^[^|]+/)[0], item.quantity ? item.quanitity : undefined)
        })

        classObj.startingEquipment.defaultData[0][classStartingEquipmentLetter].forEach(item => {
            if (item.value){
                c.newItem(`Gold Piece`, item.value/100);
                return;
            }
            c.newItem(item.item.match(/^[^|]+/)[0], item.quantity ? item.quanitity : undefined)
        });

        //trinket logic (the free trinket that all characters get at level 1)
        const trinketDescription = itemObjectsArray.find(ele => ele.name === 'Trinket' && ele.source === 'XPHB').entries[1].rows[trinketTableNumber ? trinketTableNumber - 1 : randomIntegerBetween(0, 99)][1];
        c.newItem(`Trinket`, undefined, trinketDescription);
        
        //species
        //record species traits
        speciesEntriesToMarkdownArray(speciesObj.entries).forEach(ele => {
            c.newFeature(ele.match(/(?<=^### )[^\n]*(?=\n)/)[0], ele.match(/^.*?\n(.*)$/s)[1], `species`);
        })
        //record size
        if (chosenSize && !speciesObj.size.includes(chosenSize.charAt(0).toUpperCase()))
            throw new Error (`Chosen size of '${chosenSize}' not one of the available options for species. Options are: ${[...speciesObj.size].join(`\n`)}.`)
        c.size = chosenSize ?? speciesObj.size[0];
        if (c.size.toLowerCase() === 'm')
            c.size = 'Medium';
        if (c.size.toLowerCase() === 's')
            c.size = 'Small';
        //record speed
        c.speed = speciesObj.speed;
        
        //choose languages
        if (knownLanguages.length > 0){
            knownLanguages.forEach(ele => {
                c.languages.push(ele);
            })
        };

        //Determine Ability Scores
        if (baseAbilityScores.length !== 6 || baseAbilityScores.some(ele => ele > 18 || ele < 3))
            throw new Error (`For baseAbilityScores: expected 6 ability scores between 3 (lowest possible roll) and 18 (highest possible roll)`);
        let index = 0;
        for (let key in c.abilityScores){
            c.abilityScores[key].value = baseAbilityScores[index];
            index++;
        }
        c.setBackground(toTitleCase(backgroundName), backgroundBonuses[0], backgroundBonuses[1], backgroundBonuses[2])

        //write down class features
        let classFeatureArray = classFeaturesToMarkdownArray(classObj.expandedClassFeatures);
        for (let i = 0; i < classFeatureArray.length; i++){
            if (classFeatureArray[i].match(/(?<=### Lv )\d+(?= –)/)[0] <= level){
                c.newFeature(classFeatureArray[i].match(/(?<=^### )[^\n]*(?=\n)/)[0], classFeatureArray[i].match(/^.*?\n(.*)$/s)[1], `class`);
            }
        }

        //hp and hitdice logic
        const classBaseHp = classObj.hd.faces + c.mod(`ability`, `con`);
        if (level > 1 && (!maxHp || !Number.isInteger(maxHp) || maxHp < classBaseHp))
            throw new Error (`Level is above 1; expected a 'maxHp' argument that is an integer greater than the class's base hp.`);

        if (level === 1)
            c.hp.max = classBaseHp;
        else
            c.hp.max = maxHp;

        c.hp.current = c.hp.max;

        c.hitDice.max = level;
        c.hitDice.current = level;
        c.hitDice.type = 'd' + classObj.hd.faces;

        //spellCasting
        if (classObj.spellcastingAbility){
            c.spellCasting.ability = classObj.spellcastingAbility;
            c.spellCasting.cantripsAllowed[className] = classObj.cantripProgression[level-1];
            c.spellCasting.preparedSpellsAllowed = classObj.preparedSpellsProgression[level-1]

            let normalSpellSlotTable = false;
            classObj.classTableGroups.find(ele => ele.title?.includes('Spell Slots'))?.rowsSpellProgression[level-1].forEach((slot, i) => {
            if (slot > 0)
                c.spellCasting.spellSlots['lvl' + (i+1)] = slot;
            normalSpellSlotTable = true;
            });

            if (!normalSpellSlotTable && compareStr(className, `warlock`))
                c.spellCasting.spellSlots['lvl' + classObj.classTableGroups[0].rows[level-1][4]] = classObjectsArray[7].classTableGroups[0].rows[level-1][3];
            else if (!normalSpellSlotTable) throw new Error (`Couldn't find the table of spell slots and levels for this class.`)
        }
        return c;
    }
}

class Feature{
    constructor(name, description, src, srcId = null){
        this.name = name;
        this.description = description;
        this.src = src;
        this.srcId = srcId;
        this.id = idGen.newId();
    }
}

class Item{
    constructor(itemObj){
        Object.assign(this, itemObj);
        this.id = idGen.newId();
    }

    static giveItemEquipLogic(item, logic){
        item.logic = logic;
    }
}

class Hook{
    constructor(name, meantFor, when, logic, srcId){
        this.name = name;
        this.meantFor = meantFor; //what is this hook meant for? (e.g. 'attack', 'check2', etc)
        this.when = when; //when is this hook meant to be executed? (e.g. 'before', 'after')
        this.logic = logic; //the logic that will be executed when the hook is called
        this.srcId = srcId; //the id of the thing that this hook is attached to (e.g. a feature, an item, etc)
    }
}

class Resource{
    constructor(name, srcId, charges){
        this.name = name;
        this.srcId = srcId;
        this.charges = charges;
    }
}

class Action{
    constructor(name, type, srcId, logic){
        this.name = name;
        this.type = type; //'action', 'bonus', 'reaction'
        this.srcId = srcId;
        this.logic = logic;
    }
}

class WeaponRegistry{
    static get properties(){
        return [
            new Hook(
                `Heavy`,
                `attack`,
                `before`,
                (ctx) => {
                    if (ctx.character.equipmentSlots.mainHand.property.find(prop => prop.charAt(0) === 'H')) {
                        const meleeOrRanged = ctx.character.equipmentSlots.mainHand.type;
                        const strengthScore = ctx.character.strength;
                        const dexScore = ctx.character.dexterity;

                        if (meleeOrRanged.charAt(0) === 'M' && strengthScore < 13)
                            ctx.attackRoll[0] = `d20dis [Heavy]`;
                        if (meleeOrRanged.charAt(0) === 'R' && dexScore < 13)
                            ctx.attackRoll[0] = `d20dis [Heavy]`;
                    }
                },
                null
            ),
            new Hook(
                `Two-Handed`,
                `attack`,
                `before`,
                (ctx) => {
                    if (ctx.character.equipmentSlots.mainHand.property.find(prop => prop.charAt(0) === '2')){
                        if (ctx.character.equipmentSlots.mainHand && ctx.character.equipmentSlots.offHand){
                            alert(`This weapon is two-handed! You cannot wield it with a shield or another weapon in your off-hand.`);
                            ctx.cancelled = `Two-Handed`;
                        }
                    }
                },
                null
            )
        ]
    }

    static get masteries(){
        return [
            new Hook(
                `Graze`,
                `attack`,
                `after`,
                (ctx) => {
                    if (/Graze/.test(ctx.weapon.mastery[0]) && ctx.character.proficiencies.weaponMastery.find(mastery => compareStr(mastery.type, ctx.weapon.name))){
                        ctx.notes.push(`You have the graze mastery on this weapon. Even if you miss the attack, deal ${ctx.character.mod('ability', ctx.attackRoll[2].match(/\[[a-z]+\]/)[0].match(/[a-z]+/)[0])} '${ctx.weapon.dmgType}' damage`);
                    }
                },
                null
            )
        ]
    }
}

class WeaponMastery{
    constructor(type, srcId){
        this.type = type;
        this.srcId = srcId;
    }
}