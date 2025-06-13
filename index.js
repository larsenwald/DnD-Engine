class Roll{
    static d(roll, sides){//function(how many dice to roll, how many sides of each die). returns array of rolls
        const output = [];
        for (let i = 0; i < roll; i++) output.push( Math.floor(Math.random() * sides) + 1 );
        return output;
    }
}

class Character{
    constructor(){//modeling the constructor after the order of the steps to create a new character in the 2024 PHB
        //Step 1: Choose a class
        this.charClass;
        this.level;
        this.armorTraining = [];

        //Step 2: Determine origin
        this.background;
        this.feats = [];
        this.proficiencies = [];
        this.proficiencyBonus;
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
            str,
            dex,
            con,
            int,
            wis,
            cha,
        }
    }
}