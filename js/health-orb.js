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
  health.current++;
  updateHealth();
});

healthOrb.addEventListener(`contextmenu`, (event) => {
  event.preventDefault();
  
  if (health.temp > 0) 
    health.temp--;
  else 
    health.current--;

  updateHealth();
});

tempHealthShield.addEventListener(`click`, (event) => {
  health.temp++;
  updateHealth();
});
tempHealthShield.addEventListener(`contextmenu`, (event) => {
  event.preventDefault();
  if (health.temp > 0){
    health.temp--;
    updateHealth();
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