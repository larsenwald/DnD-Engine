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
        container.innerHTML = '';

        abilityCards.forEach(card => {
            container.innerHTML += card.HTML;
        })
    }
}

function renderSheet(characterObject){
  const get = function(selector){
    return document.querySelector('#character-sheet ' + selector);
  }//helper functions to prevent having to repeat myself querying '#character-sheet'
  const c = characterObject; //for quick reference of the character object

  const picture = get('.class-icon');
  const name = get('.name');
  const level = get('.level');
  const species = get('.species');
  const charClass = get('.class');
  const subClass = get('.subclass');
  const background = get('.background');

  const inspirationBtn = get('.inspiration-btn');

  const armorClass = get('.armor-class .value');
  const initiative = get('.initiative .value');
  const speed = get('.speed .value');
  const proficiency = get('.proficiency .value');
  const size = get('.size .value');
  const passivePerception = get('.passive-perception .value');

  const currentHp = get('.health .value .current');
  const maxHp = get('.health .value .max');
  const tempHp = get('.temp .value');
  const currentHitDie = get('.hd .hit-die .value .current');
  const maxHitDie = get('.hd .hit-die .value .max');
  const hitDieType = get('.hd .hit-die .type');

  picture.src = `images/class-badges/${c.charClass}.webp`
  name.innerText = c.name;
  level.innerText = c.level;
  species.innerText = c.species;
  charClass.innerText = c.charClass;
  subClass.innerText = c.subClass;
  background.innerText = c.background.name;

  let inspired = false;
  if (c.inspiration){
    inspired = true;
    inspirationBtn.classList.add('inspired');
    inspirationBtn.innerText = 'I am inspired!';
  }
  inspirationBtn.addEventListener('click', ()=>{
    inspired = !inspired;
    c.inspiration = inspired;
    if (inspired){
      inspirationBtn.classList.add('inspired');
      inspirationBtn.innerText = 'I am inspired!';
    }else{
      inspirationBtn.classList.remove('inspired');
      inspirationBtn.innerText = 'I am not inspired.';
    }
  });
  armorClass.innerText = c.ac.val;
  initiative.innerText = c.dexterityMod.val;
  speed.innerText = c.speed;
  proficiency.innerText = c.proficiencyBonus;
  size.innerText = c.size.charAt(0).toUpperCase();
  passivePerception.innerText = c.passivePerception.val;

  currentHp.innerText = c.hp.current;
  maxHp.innerText = c.hp.max;
  tempHp.innerText = c.hp.temp;
  currentHitDie.innerText = c.hitDice.current;
  maxHitDie.innerText = c.hitDice.max;
  hitDieType.innerText = c.hitDice.type;

  //render ability cards
  const checkSaveProf = function(ability){
    if (c.proficiencies.save.includes(ability.toLowerCase().slice(0,3))) return true;
    return false;
  }
  const checkSkillProf = function(skill){
    return c.proficiencies.skill[toCamelCase(skill)].proficiency;
  }
  const strengthCard = new AbilityCard('Strength', c.strength.val, checkSaveProf('strength'), [
      {skill: 'Athletics', proficiency: checkSkillProf('Athletics')}
  ]);
  const dexterityCard = new AbilityCard('Dexterity', c.dexterity.val, checkSaveProf('dexterity'), [
      {skill: 'Acrobatics', proficiency: checkSkillProf('Acrobatics')},
      {skill: 'Sleight of Hand', proficiency: checkSkillProf('Sleight of Hand')},
      {skill: 'Stealth', proficiency: checkSkillProf('Stealth')}
  ]);
  const constitutionCard = new AbilityCard('Constitution', c.constitution.val, checkSaveProf('constitution'), []);
  const intelligenceCard = new AbilityCard('Intelligence', c.intelligence.val, checkSaveProf('intelligence'), [
      {skill: 'Arcana', proficiency: checkSkillProf('Arcana')},
      {skill: 'History', proficiency: checkSkillProf('History')},
      {skill: 'Investigation', proficiency: checkSkillProf('Investigation')},
      {skill: 'Nature', proficiency: checkSkillProf('Nature')},
      {skill: 'Religion', proficiency: checkSkillProf('Religion')}
  ]);
  const wisdomCard = new AbilityCard('Wisdom', c.wisdom.val, checkSaveProf('wisdom'), [
      {skill: 'Animal Handling', proficiency: checkSkillProf('Animal Handling')},
      {skill: 'Insight', proficiency: checkSkillProf('Insight')},
      {skill: 'Medicine', proficiency: checkSkillProf('Medicine')},
      {skill: 'Perception', proficiency: checkSkillProf('Perception')},
      {skill: 'Survival', proficiency: checkSkillProf('Survival')}
  ]);
  const charismaCard = new AbilityCard('Charisma', c.charisma.val, checkSaveProf('charisma'), [
      {skill: 'Deception', proficiency: checkSkillProf('Deception')},
      {skill: 'Intimidation', proficiency: checkSkillProf('Intimidation')},
      {skill: 'Performance', proficiency: checkSkillProf('Performance')},
      {skill: 'Persuasion', proficiency: checkSkillProf('Persuasion')}
  ]);

  AbilityCard.render('#abilities-container', [
      strengthCard,
      dexterityCard,
      constitutionCard,
      intelligenceCard,
      wisdomCard,
      charismaCard
  ]);
}

let shortRestBtn;
document.querySelectorAll('#character-sheet .rest-btns .btn').forEach(ele => {
  if (ele.innerText === 'Short Rest') shortRestBtn = ele;
});

let longRestBtn;
document.querySelectorAll('#character-sheet .rest-btns .btn').forEach(ele => {
  if (ele.innerText === 'Long Rest') longRestBtn = ele;
});

shortRestBtn.addEventListener('click', function(){
  executeCommand('short rest');
});
longRestBtn.addEventListener('click', function(){
  executeCommand('long rest');
});

tippy(`#utility-buttons .character-sheet-toggle`, {
  content: `Character Sheet`,
});

document.querySelector(`#utility-buttons .character-sheet-toggle`).addEventListener(`click`, ()=>{
  document.querySelector(`#character-sheet`).classList.toggle(`fade-in`)
  document.querySelector(`#character-sheet`).classList.toggle(`rise`)
    document.querySelector(`#character-sheet`).classList.toggle(`hidden`);
})
document.querySelector(`#character-sheet .x-btn`).addEventListener('click', ()=>{
  document.querySelector(`#character-sheet`).classList.toggle(`fade-in`)
  document.querySelector(`#character-sheet`).classList.toggle(`rise`)
  document.querySelector(`#character-sheet`).classList.toggle(`hidden`);
})