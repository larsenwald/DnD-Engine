executeWhenLoaded.push(function() {
    document.querySelector(`.loader`).classList.add(`hidden`);

    const characters = [
        Character.newCharacter(
            `Hector Morenis`,
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
        ),
        Character.newCharacter(
            `Exponentia Beladres`,
            `Wizard`,
            2,
            `Sage`,
            ['int', 'int', 'con'],
            'spellbook',
            ['arcana', 'history'],
            `A`,
            `B`,
            undefined,
            `elf`,
            `medium`,
            [`elvish`, `common`],
            [8, 10, 12, 14, 16, 18],
            `LN`,
            18
        ),
    ];

    const characterContainer = document.querySelector(`#character-container`);

    if (characters.length === 0)
        document.querySelector(`#no-characters-message`).classList.remove(`hidden`);
    else{
        characters.forEach(character => {
            characterContainer.innerHTML +=
                `<div class="card" data-character-name="${character.name}">
                    <img src="images/class-badges/${character.charClass.toLowerCase()}.webp" alt="${character.charClass} badge" />
                    <div class="name-and-class">
                    <h3>${character.name}</h3>
                    <p>${`Level ${character.level} ${character.subclass} ${character.charClass}`}</p>
                    </div>
                </div>`
        })

        document.querySelectorAll(`#character-container .card`).forEach(card => {
            card.addEventListener(`click`, (event)=>{
                renderCharacter(characters.find(ele => ele.name === event.currentTarget.getAttribute(`data-character-name`)));
            })
        });
    }

})

let currentCharacter;
function renderCharacter(characterObject){
    currentCharacter = characterObject;
    console.log(currentCharacter)

    document.querySelector(`#character-list-page`).classList.add(`hidden`);
    document.querySelector(`#character-page`).classList.remove(`hidden`);

    initializeHealthOrb(characterObject);
}