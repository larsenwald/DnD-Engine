function compareStr(...strings){
    if (strings.length < 2) 
        throw new Error('You must enter at least two strings for comparison.');
    //convert each string to lowercase
    for (let i = 0; i < strings.length; i++){
        if (typeof strings[i] !== 'string')
            throw new TypeError(`This function can ONLY take 'string' arguments.`);
        strings[i] = strings[i].toLowerCase();
    }
    //compare each of them incrementally
    for (let i = 0; i < strings.length - 1; i++) {
        if (strings[i] !== strings[i + 1]) return false;
    }
    return true;
}
function toTitleCase(string){
    let strings = string.trim().split(' ');
    for (let i = 0; i < strings.length; i++){
        strings[i] = strings[i].charAt(0).toUpperCase() + strings[i].slice(1);
    }
    return strings.join(' ');
}

function toCamelCase(string){
    let normalizedString =
    string.split(' ')
    .map(ele => ele = ele.charAt(0).toUpperCase() + ele.slice(1).toLowerCase())
    .join('');

    normalizedString = normalizedString.charAt(0).toLowerCase() + normalizedString.slice(1);
    
    return normalizedString;
}

function randomIntegerBetween(num1, num2){
    return Math.floor(Math.random() * (num2 - num1 + 1)) + num1;
}