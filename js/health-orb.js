const healthOrb = document.querySelector(`#health-orb`);
const orbFluid = document.querySelector(`#health-orb .orb-fluid`);
const orbNumber = document.querySelector(`#health-orb .orb-number`);

let health;
function initializeHealthOrb(characterObject){
    health = characterObject.hp;
    orbNumber.innerText = `${health.current}/${health.max}`;
    updateHealth();
}


healthOrb.addEventListener(`click`, (event) => {
  health.current++;
  updateHealth();
});

healthOrb.addEventListener(`contextmenu`, (event) => {
  event.preventDefault();
  
  health.current--;
  updateHealth();
});

function updateHealth(){
  if (health.current < 0) health.current = 0;
  if (health.current > health.max) health.current = health.max;
  
  orbFluid.style.height = (health.current/health.max) * 100 + '%';
  orbNumber.innerText = `${health.current}/${health.max}`;
}