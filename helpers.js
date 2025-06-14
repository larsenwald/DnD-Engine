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