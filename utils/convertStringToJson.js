export function stringToJson(str){
    const regex = /('(?=(,\s*')))|('(?=:))|((?<=([:,]\s*))')|((?<={)')|('(?=}))/g;
    return str.replace(regex, '"');
}