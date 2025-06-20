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
        return 10 + (armorBonus !== null ? armorBonus : this.mod('ability', 'dex')) + shieldBonus;
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

    //checks
    savingThrow(type){ //accounts for first three letters of string input. for example, it can take 'str' or 'strength'
        const normalizedType = type.toLowerCase().trim().slice(0, 3);
        return this.mod(`ability`, normalizedType) + Roll.d(1, 20)[0].val + (this.proficiencies.save.includes(normalizedType) ? this.proficiencyBonus : 0);
    }
    check(type, name){// (skill||ability, acrobatics||animal handling||dexterity, etc)
        return Roll.d(1,20)[0].val + this.mod(type, name);
    }
    /*
    check2(type, name){//going to experiment with ctx and hook design by implementing a check method that has a ctx object with an array of functions to be executed before and after the check is made. This way, we can have features that modify the check's ctx before the check is made, and features that trigger off of the check's result after the check is made.
        const ctx = {
            rolls: [[1, 20]], 
            mods: [{val: this.mod(type, name), label: 'mod'}], 
            result: {grandTotal: 0, rolls: []}
        };
        //run all 'before' hooks
        this.hooks.forEach(hook => {
            if (hook.for === 'check2' && hook.type === 'before') hook.logic(ctx)
        });
        //do the rolls now
        ctx.rolls.forEach(rollObject => {
            const rolls = Roll.d(...rollObject);
            ctx.result.rolls.push(...rolls)
        })
        //run all 'after' hooks
        this.hooks.forEach(hook =>{
            if (hook.for === 'check2' && hook.type === 'after') hook.logic(ctx)
        })
        
        ctx.result.rolls.forEach(roll => ctx.result.grandTotal += roll.val);
        ctx.mods.forEach(mod => ctx.result.grandTotal += mod.val);

        return ctx;
    }
    */

    attack(){
        let ctx;
        if (this.equipmentSlots.mainHand){
            const weapon = this.equipmentSlots.mainHand
            ctx = {
                weapon: weapon,
                attackRoll: [
                    `d20`,
                    `${this.proficiencies.weapon.find(prof => compareStr(prof, weapon.weaponCategory)) ? this.proficiencyBonus : 0} [proficiency]`,
                    `${this.mod(`ability`, `strength`)} [strength]`
                ],
                damageRoll: [
                    weapon.dmg1,
                ]
            }
            //run 'before' hooks
            this.hooks.forEach(hook => {
                if (hook.meantFor === 'attack' && hook.when === 'before') hook.logic(ctx);
            });
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
            return `${ctx.attackResult}\n${ctx.damageResult}`
        }
        return `no weapon`; //we need to change this to be an unarmed strike action if the character has no weapon equipped in the main hand
    }

    newTurn(){
        this.hooks.forEach(hook => {
            if (hook.meantFor === 'new turn') hook.logic();
        });
    }

    shortRest(){
        this.hooks.forEach(hook => {
            if (hook.meantFor === 'short rest') hook.logic;
        })
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
    newItem(name, amount = 1, note=null){//for now, to add a new item, you'll need to put its 5etools json in the jsonItemsArray variable located in the information.js file (though currently we have an async function that fetches all the base items from 5etools and adds them to the jsonItemsArray automatically)
        let json = jsonItemsArray.find(ele => compareStr(JSON.parse(ele).name, name) && JSON.parse(ele).source === 'XPHB');//only looking for items from XPHB for now
        if (!json) throw new Error(`Couldn't find an item with a name of '${name} in the jsonItemsArray.`)
        
        //if it's armor or a weapon, just push it immediately the amount of times equal to the amount value (recall each item will have a unique ID)
        if (JSON.parse(json).armor || JSON.parse(json).weapon) {
            for (let i = 0; i < amount; i++){
                const item = new Item(json);
                item.note = note;
                this.inventory.push(item);
            }
            return;
        }

        //if it's neither armor or weapon, first check if it's in the inventory. if it is, increment the stack a number of times equal to the amount value
        let index = this.inventory.findIndex(ele => compareStr(JSON.parse(json).name, ele.name));
        if (index !== -1){
            this.inventory[index].amount += amount;
            return;
        }

        //if it's not in the inventory, create a new item object, add a 'amount' property with a value equal to the amount argument
        const item = new Item(json);
        item.amount = amount;
        item.note = note;
        this.inventory.push(item);
    }
    newResource(name, srcId, charges, hook){
        const resource = new Resource(name, srcId, charges);
        if (hook){
            const hookObj = hook;
            hookObj.srcId = resource.id;
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
    constructor(json){
        Object.assign(this, JSON.parse(json));
        this.id = idGen.newId();
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