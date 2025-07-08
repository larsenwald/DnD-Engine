function executeWhenLoaded(){
    document.querySelector(`.loader`).classList.add(`hidden`);

    const characters = [
        Character.newCharacter(
            `Hector`,
            `Fighter`,
            3,
            `Soldier`,
            ['str', 'str', 'con'],
            'dice set',
            ['athletics', 'insight'],
            `B`,
            `C`,
            undefined,
            `human`,
            `medium`,
            [`orc`, `elvish`],
            [15, 14, 13, 12, 10, 8],
            `NG`,
            26
        )
    ];

    const characterContainer = document.querySelector(`#character-container`);

    if (characters.length === 0)
        document.querySelector(`#no-characters-message`).classList.remove(`hidden`);
    else{
        characters.forEach(character => {
            characterContainer.innerHTML +=
                `<div class="card">
                    <img src="" alt="" />
                    <div class="name-and-class">
                    <h3>${character.name}</h3>
                    <p>${`Level ${character.level} ${character.subclass} ${character.charClass}`}</p>
                    </div>
                </div>`
        })
    }
}