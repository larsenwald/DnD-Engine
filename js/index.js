const characters = [
    {name: `Hector Morenis`, class: `Fighter`, subclass: `Champion`, level: 3}
];

const characterContainer = document.querySelector(`#character-container`);

if (characters.length === 0)
    document.querySelector(`#no-characters-message`).classList.remove(`hidden`);
else{
    characters.forEach(character => {
        const cardEle = document.createElement(`div`);
        cardEle.classList.add(`card`);
        characterContainer.appendChild(cardEle);

        const img = document.createElement(`img`);
        cardEle.appendChild(img);

        const nameAndClass = document.createElement(`div`);
        cardEle.appendChild(nameAndClass);

        const h3 = document.createElement(`h3`);
        h3.innerText = character.name;
        nameAndClass.appendChild(h3);

        const p = document.createElement(`p`);
        p.innerText = `Level ${character.level} ${character.subclass} ${character.class}`;
        nameAndClass.appendChild(p);
        
    })
}