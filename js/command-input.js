executeWhenLoaded.push(function () {


const commandInput = document.querySelector(`#command-input`);
const commandLog = document.querySelector(`#command-log`);

commandInput.addEventListener(`keydown`, (event)=>{
    if (event.key === 'Enter' && commandInput.value.trim() !== ''){
        const input = commandInput.value;
        commandInput.value = '';

        if (input === 'clear')
            return commandLog.innerHTML = '';

        const output = executeCommand(input);

        if (typeof output === 'object'){
            const ele = document.createElement(`p`);
            ele.innerHTML = `> ${output.val}`;

            if (output.breakdown){
                tippy(ele, {
                    content: output.breakdown
                });
            };

            commandLog.prepend(ele);
            //commandLog.innerHTML = `> ${output.val}<br>` + commandLog.innerHTML;
            //logic to give the innerHTML a tooltip with output.breakdown goes here
            return;
        }

        const ele = document.createElement('p')
        ele.innerHTML = `<p>> ${output}</p>`
        commandLog.prepend(ele);
    }
})

const commandsMap = {
    'passive perception': 'passivePerception',
    'initiative': 'initiative',
    'armor class': 'ac',
    'ac': 'ac',
    'proficiency bonus': 'proficiencyBonus',

    'strength': 'strength',
    'str': 'strength',
    'dexterity': 'dexterity',
    'dex': 'dexterity',
    'constitution': 'constitution',
    'con': 'constitution',
    'intelligence': 'intelligence',
    'int': 'intelligence',
    'wisdom': 'wisdom',
    'wis': 'wisdom',
    'charisma': 'charisma',
    'cha': 'charisma',

    'strength mod': 'strengthMod',
    'str mod': 'strengthMod',
    'dexterity mod': 'dexterityMod',
    'dex mod': 'dexterityMod',
    'constitution mod': 'constitutionMod',
    'con mod': 'constitutionMod',
    'intelligence mod': 'intelligenceMod',
    'int mod': 'intelligenceMod',
    'wisdom mod': 'wisdomMod',
    'wis mod': 'wisdomMod',
    'charisma mod': 'charismaMod',
    'cha mod': 'charismaMod',

    'spell save dc': 'spellSaveDC',
    'spell save': 'spellSaveDC',
    'spell attack bonus': 'spellAttackBonus',
    'spell attack': 'spellAttackBonus',

    'strength save': {propertyName: 'savingThrow', args: ['strength']},
    'str save': {propertyName: 'savingThrow', args: ['strength']},
    'dexterity save': {propertyName: 'savingThrow', args: ['dexterity']},
    'dex save': {propertyName: 'savingThrow', args: ['dexterity']},
    'constitution save': {propertyName: 'savingThrow', args: ['constitution']},
    'con save': {propertyName: 'savingThrow', args: ['constitution']},
    'intelligence save': {propertyName: 'savingThrow', args: ['intelligence']},
    'int save': {propertyName: 'savingThrow', args: ['intelligence']},
    'wisdom save': {propertyName: 'savingThrow', args: ['wisdom']},
    'wis save': {propertyName: 'savingThrow', args: ['wisdom']},
    'charisma save': {propertyName: 'savingThrow', args: ['charisma']},
    'cha save': {propertyName: 'savingThrow', args: ['charisma']},

    'strength check': {propertyName: 'check', args: ['ability', 'strength']},
    'str check': {propertyName: 'check', args: ['ability', 'strength']},
    'dexterity check': {propertyName: 'check', args: ['ability', 'dexterity']},
    'dex check': {propertyName: 'check', args: ['ability', 'dexterity']},
    'constitution check': {propertyName: 'check', args: ['ability', 'constitution']},
    'con check': {propertyName: 'check', args: ['ability', 'constitution']},
    'intelligence check': {propertyName: 'check', args: ['ability', 'intelligence']},
    'int check': {propertyName: 'check', args: ['ability', 'intelligence']},
    'wisdom check': {propertyName: 'check', args: ['ability', 'wisdom']},
    'wis check': {propertyName: 'check', args: ['ability', 'wisdom']},
    'charisma check': {propertyName: 'check', args: ['ability', 'charisma']},
    'cha check': {propertyName: 'check', args: ['ability', 'charisma']},

    'acrobatics check': {propertyName: 'check', args: ['skill', 'acrobatics']},
    'animal handling check': {propertyName: 'check', args: ['skill', 'animalHandling']},
    'arcana check': {propertyName: 'check', args: ['skill', 'arcana']},
    'athletics check': {propertyName: 'check', args: ['skill', 'athletics']},
    'deception check': {propertyName: 'check', args: ['skill', 'deception']},
    'history check': {propertyName: 'check', args: ['skill', 'history']},
    'insight check': {propertyName: 'check', args: ['skill', 'insight']},
    'intimidation check': {propertyName: 'check', args: ['skill', 'intimidation']},
    'investigation check': {propertyName: 'check', args: ['skill', 'investigation']},
    'medicine check': {propertyName: 'check', args: ['skill', 'medicine']},
    'nature check': {propertyName: 'check', args: ['skill', 'nature']},
    'perception check': {propertyName: 'check', args: ['skill', 'perception']},
    'performance check': {propertyName: 'check', args: ['skill', 'performance']},
    'persuasion check': {propertyName: 'check', args: ['skill', 'persuasion']},
    'religion check': {propertyName: 'check', args: ['skill', 'religion']},
    'sleight of hand check': {propertyName: 'check', args: ['skill', 'sleightOfHand']},
    'stealth check': {propertyName: 'check', args: ['skill', 'stealth']},
    'survival check': {propertyName: 'check', args: ['skill', 'survival']},

    'attack': {propertyName: 'attack', args: []},
    'new turn': {propertyName: 'newTurn', args: []},
    'short rest': {propertyName: 'shortRest', args: []},
    'long rest': {propertyName: 'longRest', args: []},
}

//MULTI STEP COMMANDS START
const multiStepCommands = {
    'heal': {
        borderColor: `green`, 
        propertyName: 'heal',
        placeholderText: 'Enter amount to heal',
        onEnter: (val) => {
            const output = currentCharacter.changeHp(Math.abs(val));
            updateHealth();
            return output;
        }
    },
    'damage': {
        borderColor: `red`, 
        propertyName: 'damage', 
        placeholderText: 'Enter amount of damage',
        onEnter: (val) => {
            const output = currentCharacter.changeHp(-Math.abs(val));
            updateHealth();
            return output;
        }
    },
    'roll': {
        borderColor: `goldenrod`,
        propertyName: 'roll',
        placeholderText: 'Enter roll (e.g. 1d20+5)',
        onEnter: (val) => {
            return Roll.string(val);
        }
    }
}
const multiStepCommandToggle = {
    command: null,
}
//if a multi step command is in the input, hitting space will toggle it
commandInput.addEventListener('keydown', (event)=>{
    if (event.key === ' ' && Object.keys(multiStepCommands).includes(commandInput.value)){
        event.preventDefault(); //prevent space from being added to input
        executeCommand(commandInput.value);
        commandInput.value = '';
    }
});
//if a multi step command is active, hitting escape will turn it off
commandInput.addEventListener('keydown', (event)=>{
    if (event.key === 'Escape' && multiStepCommandToggle.command){
        multiStepCommandToggle.command = null;
        commandInput.style.boxShadow = '';
        commandInput.value = '';
        commandInput.placeholder = 'Enter a command...';
    }
})
//MULTI STEP COMMANDS END

function executeCommand(string){
    string = string.toLowerCase().trim(); //normalize

    if (multiStepCommandToggle.command){
        const command = multiStepCommandToggle.command;
        multiStepCommandToggle.command = null;

        commandInput.placeholder = 'Enter a command...';

        commandInput.style.boxShadow = '';

        return multiStepCommands[command].onEnter(string);
    }

    if (!commandsMap[string] && !multiStepCommands[string])
        return `Hmm, I don't know that one.`;

    if (multiStepCommands[string]){
        multiStepCommandToggle.command = string;

        let boxShadow = getComputedStyle(commandInput).boxShadow;
        boxShadow = boxShadow.replace(/rgba\(.*\)/, multiStepCommands[string].borderColor);

        commandInput.placeholder = multiStepCommands[string].placeholderText;

        commandInput.style.boxShadow = boxShadow;
        return `${multiStepCommands[string].propertyName} mode active`;
    }

    if (typeof currentCharacter[commandsMap[string].propertyName] === `function`)
        return currentCharacter[commandsMap[string].propertyName](...commandsMap[string].args);

    return currentCharacter[commandsMap[string]];
}

// START OF AUTOCOMPLETE LOGIC
const autoComplete = document.querySelector('#command-input-autocomplete');
const allCommands = [
    ...Object.keys(commandsMap), 
    ...Object.keys(multiStepCommands),
    'clear',
];
commandInput.addEventListener('input', autoCompleteEventListenerLogic);

//clear auto complete when tab or enter is pressed. if tab, concatenate the commandInput and autoComplete strings
commandInput.addEventListener('keydown', autoCompleteTabOrEnter);

function autoCompleteEventListenerLogic(event){
    if (commandInput.value !== ''){
        const currentInput = commandInput.value;
        const strLength = currentInput.length;

        const regex = new RegExp(`^` + currentInput, 'm');
        const matches = allCommands.filter(command => regex.test(command));

        if (matches[0])
            autoComplete.innerHTML = space(strLength) + matches[0].slice(strLength);
        else
            autoComplete.innerHTML = '';

        return;
    }

    if (commandInput.value === '')
        autoComplete.innerHTML = '';
}

function autoCompleteTabOrEnter(event){
    if (event.key === 'Tab'){
        event.preventDefault();

        commandInput.value = 
            commandInput.value + 
            autoComplete.innerHTML.replaceAll('&nbsp;', ''); //get rid of the HTML friendly spaces

        autoComplete.innerHTML = '';
        return;
    }

    if (event.key === 'Enter')
        autoComplete.innerHTML = '';
}

function space(amount=1){ //helper to return HTML friendly 'space' characters
    return '&nbsp;'.repeat(amount);
}
//END OF AUTOCOMPLETE LOGIC

})