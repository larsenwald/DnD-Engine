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

const commands = {
    'strength check': {propertyName: 'check', args: [`ability`, `str`]},
}

function executeCommand(string){
    if (!commands[string])
        return `Hmm, I don't know that one.`;

    if (typeof currentCharacter[commands[string].propertyName] === `function`)
        return currentCharacter[commands[string].propertyName](...commands[string].args);

    return currentCharacter[commands[string].propertyName];
}


})