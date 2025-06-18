
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
            tool: []
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
        temporary: 0
       }

       this.playbook = {//holds all the actions, bonus actions, etc
        action: [],
        bonus: [],
        reaction: [],
        free: [],
       }
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
        if (type === 'ability'){
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

    get initiative(){ return this.mod('ability', 'dex') }
    get armorClass(){ 
        const shieldBonus = (this.equipmentSlots.offHand && this.equipmentSlots.offHand.type === 'shield' ? this.equipmentSlots.offHand.ac : 0)
        const armorBonus = (this.equipmentSlots.armor ? this.equipmentSlots.armor.ac : 0)
        return 10 + this.mod('ability', 'dex') + armorBonus + shieldBonus
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


    //adding stuff
    newFeature(name, description, src){
        if (this.featuresArray.find(ele => compareStr(ele.name, name)))
            throw new Error(`A feature with the name '${name}' already exists.`);
        this.featuresArray.push(new Feature(name, description, src));
    }
    removeFeature(name){ //future me: we could potentially make it also delete all actions that have the feature's name as their source.
        const index = this.featuresArray.findIndex(ele => compareStr(ele.name, name));
        if (index === -1)
            throw new Error(`Couldn't find a feature named ${name}`);
        this.featuresArray.splice(index, 1);
    }
    newItem(name, amount = 1, note=null){//for now, to add a new item, you'll need to put its 5etools json in the jsonArray variable located in the information.js file (though currently we have an async function that fetches all the base items from 5etools and adds them to the jsonArray automatically)
        let json = jsonArray.find(ele => compareStr(JSON.parse(ele).name, name) && JSON.parse(ele).source === 'XPHB');//only looking for items from XPHB for now
        if (!json) throw new Error(`Couldn't find an item with a name of '${name} in the jsonArray.`)
        
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
}

class Feature{
    constructor(name, description, src){
        this.name = name;
        this.description = description;
        this.src = src;
        this.id = idGen.newId();
    }
}

class Item{
    constructor(json){
        Object.assign(this, JSON.parse(json));
        this.id = idGen.newId();
    }
}