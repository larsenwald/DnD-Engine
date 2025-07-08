async function get5eToolsObject(dataFilePath) {
    let output;
    try {
        const response = await fetch(`https://larsenwald.github.io/5etools/data/${dataFilePath}`);
        output = await response.json();
    } catch (error) {
        console.log(error);
        return;
    }
    return output;
}


const itemObjectsArray = [
	{
		name: "Gold Piece", 
		value: 100, 
		source: "XPHB", 
		weight: 0.02
	} //gold pieces aren't officially considered items within 5e tools, so we make our own. we might want to just store gold separately instead of in the inventory
]
const classObjectsArray = [];
const backgroundObjectsArray = [];
const originFeatObjectsArray = [];
const speciesObjectsArray = []

let itemsObject;
(async () => {
    itemsObject = await get5eToolsObject(`items-base.json`);
    console[itemsObject ? `log` : `error`](itemsObject ? `itemsObject loaded!` : `itemsObject failed.`)
    for (let item of itemsObject.baseitem){
        itemObjectsArray.push(item)
    }
})();

let biggerItemsObject;
(async () => { //this will push a lot of the non-weapon item objects to the itemObjectsArray
	biggerItemsObject = await get5eToolsObject(`items.json`);
	console[biggerItemsObject ? `log` : `error`](biggerItemsObject ? `biggerItemsObject loaded!` : `biggerItemsObject failed.`)
	for (let item of biggerItemsObject.item){
		itemObjectsArray.push(item);
	};
	for (let item of biggerItemsObject.itemGroup){
		itemObjectsArray.push(item);
	};
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
		const classObject = await get5eToolsObject(`class/class-${className}.json`);
		classesLoaded++;
		classObject.class[1].expandedClassFeatures = classObject.classFeature.filter(ele => ele.source === 'XPHB');
		placeHolder.push(classObject.class[1])//the class property of the class object is an array that holds the phb version of the class in index 0 and the xphb version in index 1
	}
	console.log(`${classesLoaded}/${classes.length} classes loaded!`)
	classesObject = placeHolder;
	classObjectsArray.push(...classesObject);
})();

let backgroundsObject;
(async () => {
	let response = await get5eToolsObject(`backgrounds.json`);
	backgroundsObject = response.background.filter(ele => ele.source === `XPHB`)
	backgroundObjectsArray.push(...backgroundsObject);
	console[backgroundsObject ? `log` : `error`](backgroundsObject ? `backgroundsObject loaded!` : `backgroundsObject failed.`)
})();

let originFeatsObject;
(async () => {
	let response = await get5eToolsObject(`feats.json`);
	originFeatsObject = response.feat.filter(ele => ele.source === `XPHB` && ele.category === 'O');
	originFeatObjectsArray.push(...originFeatsObject);
	console[originFeatsObject ? `log` : `error`](originFeatsObject ? `originFeatsObject loaded!` : `originFeatsObject failed.`)
})();

let speciesObject;
(async () => {
	const response = await get5eToolsObject(`races.json`);
	speciesObject = response.race.filter(ele => ele.source === `XPHB`);
	console[speciesObject ? `log` : `error`](speciesObject ? `speciesObject loaded!` : `speciesObject failed.`)
	speciesObjectsArray.push(...speciesObject);
})();