class AbilityCard{
    constructor(ability, score, skills=[]){
        this.ability = ability;
        this.score = score;

        this.mod = Math.floor((score - 10) / 2);

        this.skills = skills;
    }

    get HTML(){
        console.log(this.ability, this.skills);
        console.log(this.skillsToHtml());
        return `          
            <div class="ability-card">
            <h3>${this.ability}</h3>
            <div class="ability-save-skills">
              <div class="ability">
                <p class="score">${this.score}</p>
                <div class="mod-container"><span class="mod">${this.mod > 0 ? '+' : (this.mod === 0 ? '' : '-')}${Math.abs(this.mod)}</span></div>
              </div>
              <div class="save-skills">
                <div class="saving-throw">
                  <p class="bold italicized">Saving Throw</p>
                  <p class="mod">${this.mod}</p>
                </div>
                <div class="skills">
                    ${this.skillsToHtml()}
                </div>
              </div>
            </div>
          </div>
          `
    }

    skillsToHtml(){
        let output = '';
        this.skills.forEach(skill => {
            output += `
            <div class="skill">
            <p>${skill}</p>
            <p class="mod">${this.mod}</p>
            </div>
            `
        });
        return output;
    }

    static render(domContainerSelector, abilityCards=[]){
        const container = document.querySelector(domContainerSelector);

        abilityCards.forEach(card => {
            container.innerHTML += card.HTML;
        })
    }
}

const strengthCard = new AbilityCard('Strength', 16, ['Athletics']);
const dexterityCard = new AbilityCard('Dexterity', 14, ['Acrobatics', 'Sleight of Hand', 'Stealth']);
const constitutionCard = new AbilityCard('Constitution', 12);
const intelligenceCard = new AbilityCard('Intelligence', 10, ['Arcana', 'History', 'Investigation', 'Nature', 'Religion']);
const wisdomCard = new AbilityCard('Wisdom', 8, ['Animal Handling', 'Insight', 'Medicine', 'Perception', 'Survival']);
const charismaCard = new AbilityCard('Charisma', 18, ['Deception', 'Intimidation', 'Performance', 'Persuasion']);

AbilityCard.render('#abilities-container', [
    strengthCard,
    dexterityCard,
    constitutionCard,
    intelligenceCard,
    wisdomCard,
    charismaCard
]);