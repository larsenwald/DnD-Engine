const healthOrb = document.querySelector(`#health-orb`);
const orbFluid = document.querySelector(`#health-orb .orb-fluid`);
const orbNumber = document.querySelector(`#health-orb .orb-number`);
const tempHealthShield = document.querySelector(`#temp-health-shield`);
const tempHealthNumber = document.querySelector(`#temp-health-number`);

tippy(tempHealthShield, {
  content: `Temporary Health`,
});

//MAIN LOGIC START
let health;
function initializeHealthOrb(characterObject){
    health = characterObject.hp;
    orbNumber.innerText = `${health.current}/${health.max}`;
    tempHealthNumber.innerText = health.temp;
    updateHealth();
}


healthOrb.addEventListener(`click`, (event) => {
  executeCommand('heal');
  executeCommand('1');
});

healthOrb.addEventListener(`contextmenu`, (event) => {
  event.preventDefault();
  
  if (health.temp > 0){
    executeCommand('lose temp hp');
    executeCommand('1')
  }
  else {
    executeCommand('harm');
    executeCommand('1')
  }
});

tempHealthShield.addEventListener(`click`, (event) => {
  executeCommand('gain temp hp');
  executeCommand('1');
});
tempHealthShield.addEventListener(`contextmenu`, (event) => {
  event.preventDefault();
  if (health.temp > 0){
    executeCommand('lose temp hp');
    executeCommand('1');
  }
});

function updateHealth(){
  if (health.current < 0) health.current = 0;//clamp
  if (health.current > health.max) health.current = health.max;//clamp
  
  orbFluid.style.height = (health.current/health.max) * 100 + '%';
  orbNumber.innerText = `${health.current}/${health.max}`;
  tempHealthNumber.innerText = health.temp;
}
//MAIN LOGIC END