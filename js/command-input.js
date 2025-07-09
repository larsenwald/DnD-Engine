const commandInput = document.querySelector(`#command-input`);
const commandLog = document.querySelector(`#command-log`);

commandInput.addEventListener(`keydown`, (event)=>{
    if (event.key === 'Enter'){
        const input = commandInput.value;
        commandInput.value = '';

        commandLog.innerHTML = `> ${input}<br>` + commandLog.innerHTML;
    }
})