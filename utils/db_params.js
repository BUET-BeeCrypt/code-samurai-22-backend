
export function generateParams(len){
    let arr = [];
    for (let i = 1; i <= len ; i++) {
        arr.push(`:${i.toString()}`);
    }
    return arr.join(', ');
}