async function get5eToolsObject(url) {
    let output;
    try {
        const response = await fetch(`https://corsproxy.io/?${url}`);
        output = await response.json();
    } catch (error) {
        console.log(error);
        return;
    }
    return output;
}


const jsonItemsArray = [
`{
"name": "Gold Piece", 
"value": 100, 
"source": "XPHB", 
"weight": 0.02
}` //gold pieces aren't officially considered items within 5e tools, so we make our own. we might want to just store gold separately instead of in the inventory

]
const classObjectsArray = [];
const backgroundsObjectArray = [];
const originFeatsObjectArray = [];

let itemsObject;
(async () => {
    itemsObject = await get5eToolsObject(`https://5e.tools/data/items-base.json`);
    console[itemsObject ? `log` : `error`](itemsObject ? `itemsObject loaded!` : `itemsObject failed.`)
    for (let item of itemsObject.baseitem){//push all of the baseItem objects as json instead of js objects to the jsonItemsArray
        jsonItemsArray.push(JSON.stringify(item))
    }
})();

let biggerItemsObject;
(async () => { //this will push a lot of the non-weapon item json to the jsonItemsArray
	biggerItemsObject = await get5eToolsObject(`https://5e.tools/data/items.json`);
	console[biggerItemsObject ? `log` : `error`](biggerItemsObject ? `biggerItemsObject loaded!` : `biggerItemsObject failed.`)
	for (let item of biggerItemsObject.item){
		jsonItemsArray.push(JSON.stringify(item));
	}
})();

const classes = [
	`wizard`,
	`fighter`,
	`rogue`,
	`cleric`,
	`ranger`,
	`bard`,
	`sorcerer`,
	`warlock`,
	`druid`,
	`monk`,
	`paladin`,
	`barbarian`
];

let classesObject;
(async () => {
	let placeHolder = [];
	let classesLoaded = 0;
	for (let className of classes) {
		const classObject = await get5eToolsObject(`https://5e.tools/data/class/class-${className}.json`);
		classesLoaded++;
		placeHolder.push(classObject.class[1])//the class property of the class object is an array that holds the phb version of the class in index 0 and the xphb version in index 1
	}
	console.log(`${classesLoaded}/${classes.length} classes loaded!`)
	classesObject = placeHolder;
	classObjectsArray.push(...classesObject);
})();

let backgroundsObject;
(async () => {
	let response = await get5eToolsObject(`https://5e.tools/data/backgrounds.json`);
	backgroundsObject = response.background.filter(ele => ele.source === `XPHB`)
	backgroundsObjectArray.push(...backgroundsObject);
	console[backgroundsObject ? `log` : `error`](backgroundsObject ? `backgroundsObject loaded!` : `backgroundsObject failed.`)
})();

let originFeatsObject;
(async () => {
	let response = await get5eToolsObject(`https://5e.tools/data/feats.json`);
	originFeatsObject = response.feat.filter(ele => ele.source === `XPHB` && ele.category === 'O');
	originFeatsObjectArray.push(...originFeatsObject);
	console[originFeatsObject ? `log` : `error`](originFeatsObject ? `originFeatsObject loaded!` : `originFeatsObject failed.`)
})();