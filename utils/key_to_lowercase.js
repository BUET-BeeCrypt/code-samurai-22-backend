export function objectKeysToLC(givenObj){
    let generatedObj = {};
    for (let key of Object.keys(givenObj)) {
        let lc_key = key.toLowerCase();
        generatedObj[lc_key] = givenObj[key];
    }
    return generatedObj;
}