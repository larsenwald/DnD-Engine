executeWhenLoaded.push(function () {


const commandInput = document.querySelector(`#command-input`);
const commandLog = document.querySelector(`#command-log`);

commandInput.addEventListener(`keydown`, (event)=>{
    if (event.key === 'Enter'){
        const input = commandInput.value;
        commandInput.value = '';

        commandLog.innerHTML = !compareStr(input, 'clear') ? `> ${executeCommand(input)}<br>` + commandLog.innerHTML : '';
    }
})

const commandsMap = {
    'strength check': {propertyName: 'check', args: [`ability`, `str`]},
}

function executeCommand(string){
    if (!commandsMap[string])
        return `Hmm, I don't know that one.`;

    if (typeof currentCharacter[commandsMap[string].propertyName] === `function`)
        return currentCharacter[commandsMap[string].propertyName](...commandsMap[string].args);

    return currentCharacter[commandsMap[string].propertyName];
}


})