executeWhenLoaded.push(function () {


const commandInput = document.querySelector(`#command-input`);
const commandLog = document.querySelector(`#command-log`);

commandInput.addEventListener(`keydown`, (event)=>{
    if (event.key === 'Enter'){
        const input = commandInput.value;
        commandInput.value = '';

        const output = executeCommand(input);

        if (typeof output === 'object'){
            commandLog.innerHTML = `> ${output.val}<br>` + commandLog.innerHTML;
            //logic to give the innerHTML a tooltip with output.breakdown goes here
            return;
        }

        commandLog.innerHTML = `> ${output}<br>` + commandLog.innerHTML;
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

}

function executeCommand(string){
    //normalize
    string = string.toLowerCase().trim();

    if (!commandsMap[string])
        return `Hmm, I don't know that one.`;

    if (typeof currentCharacter[commandsMap[string].propertyName] === `function`)
        return currentCharacter[commandsMap[string].propertyName](...commandsMap[string].args);

    return currentCharacter[commandsMap[string]];
}


})