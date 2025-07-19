class AbilityCard{
    constructor(
      ability, 
      score, 
      saveProf = false, 
      skills=[/*{skill: athletics, proficiency: 'half'||'proficient'||'expertise'}*/]
    ){
        this.ability = ability;
        this.score = score;
        this.saveProf = saveProf;

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
                  <p class="bold italicized">Saving Throw${this.saveProf ? `<span class='star'>★</span>` : ''}</p>
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
            <p>
              ${skill.skill}
              ${
                skill.proficiency === 'half' ? `<span class='star'>⯪</span>` :
                (skill.proficiency === 'proficient' ? `<span class='star'>★</span>`:
                (skill.proficiency === 'expertise' ? `<span class='star'>★★</span>` :
                ''))
              }
            </p>
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
//example usage
const strengthCard = new AbilityCard('Strength', 16, true, [
    {skill: 'Athletics', proficiency: 'proficient'}
]);
const dexterityCard = new AbilityCard('Dexterity', 14, false, [
    {skill: 'Acrobatics', proficiency: 'half'},
    {skill: 'Sleight of Hand', proficiency: 'expertise'},
    {skill: 'Stealth', proficiency: 'proficient'}
]);
const constitutionCard = new AbilityCard('Constitution', 15, true, []);
const intelligenceCard = new AbilityCard('Intelligence', 12, false, [
    {skill: 'Arcana', proficiency: 'half'},
    {skill: 'History', proficiency: 'half'},
    {skill: 'Investigation', proficiency: 'half'},
    {skill: 'Nature', proficiency: 'half'},
    {skill: 'Religion', proficiency: 'half'}
]);
const wisdomCard = new AbilityCard('Wisdom', 10, false, [
    {skill: 'Animal Handling', proficiency: 'expertise'},
    {skill: 'Insight', proficiency: 'half'},
    {skill: 'Medicine', proficiency: 'half'},
    {skill: 'Perception', proficiency: 'proficient'},
    {skill: 'Survival', proficiency: 'half'}
]);
const charismaCard = new AbilityCard('Charisma', 8, false, [
    {skill: 'Deception', proficiency: 'half'},
    {skill: 'Intimidation', proficiency: 'proficient'},
    {skill: 'Performance', proficiency: 'half'},
    {skill: 'Persuasion', proficiency: 'half'}
]);

AbilityCard.render('#abilities-container', [
    strengthCard,
    dexterityCard,
    constitutionCard,
    intelligenceCard,
    wisdomCard,
    charismaCard
]);