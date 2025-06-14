class Roll{
    static d(roll, sides){//function(how many dice to roll, how many sides of each die). returns array of rolls
        const output = [];
        for (let i = 0; i < roll; i++) output.push( Math.floor(Math.random() * sides) + 1 );
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
        this.charClass;
        this.level;
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
            saves: [],
            skills: {//proficiencies can be 'none', 'half', 'proficient', or 'expertise'
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
        }
        //choose starting equipment
        this.inventory = []; //coins will go in inventory. we'll have a method that can print how many u have
        //choose a species
        this.species;
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
        passive: []
       }

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
        mainHandRange: null,
        offHandRange: null,
        misc: [],
       }

       this.resources = {}
    }

    //for Step 3, we're also meant to write down our ability modifiers. Let's just have a method that can dynamically return it. *edit done in step 5: The skill modifiers as well.
    mod(type, name){
        if (type === 'ability') return Math.floor((this.abilityScores[name]-10) / 2);
        if (type === 'skill'){
            const skillAbility = this.proficiencies.skills[name].ability;
            const skillProficiency = this.proficiencies.skills[name].proficiency;
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

    addFeature(name, actionType, description, sourceType, source, actionLogic, helloLogic, goodbyeLogic){//helloLogic is logic that will be execute only ONCE when the feature is added. actionLogic is logic that will be executed when the action is used. goodbyeLogic is logic that will be executed when the feature is removed, likely to reverse whatever helloLogic did.
        const feature = new Feature(name, actionType, description, sourceType, source, actionLogic);
        helloLogic.call(this);
        feature.id = idFeature.newId();
        feature.goodbyeLogic = goodbyeLogic;
        this.featuresArray.push(feature);
        const actionObj = new Action(name, 'feature', feature.id, actionType, actionLogic);
        actionObj.id = idAction.newId();
        this.playbook[actionType].push(actionObj)//need to push an action object with name, source: 'feature', sourceId, logic
    }

    removeFeature(id){//for now, we'll only be able to delete features via their unique id
        const featureIndex = this.featuresArray.findIndex(ele => ele.id === id);
        const feature = this.featuresArray[featureIndex];

        feature.goodbyeLogic.call(this);
        const actionIndex = this.playbook[feature.actionType].findIndex(ele => ele.sourceId === feature.id);
        
        this.playbook[feature.actionType].splice(actionIndex, 1);
        this.featuresArray.splice(featureIndex, 1);
    }
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
    constructor(name, source, sourceId, actionType, logic){
        this.name = name;
        this.source = source;
        this.sourceId = sourceId;
        this.actionType = actionType; //either 'action', 'bonus', 'reaction', 'free', or 'passive'
        this.logic = logic;
    }
}

const c = new Character();