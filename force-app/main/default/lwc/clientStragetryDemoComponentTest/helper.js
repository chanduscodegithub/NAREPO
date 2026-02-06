// export function checkForAdvocacySolutionsAgainstUMR( quest, opportunityData, questionAndAnswerRecords ){
//     if( ( opportunityData.Platforms_Quoted__c && opportunityData.Platforms_Quoted__c.split(';').length === 1 && 
//             opportunityData.Platforms_Quoted__c === 'UMR' 
//         ) || (
//             questionAndAnswerRecords['Final_Platform__c'] && 
//             questionAndAnswerRecords['Final_Platform__c'].split(';').length === 1 &&
//             questionAndAnswerRecords['Final_Platform__c'] === 'UMR' 
//         )
//     ){
//         return false;
//     } 
//     return true;  
// }

//--------------------Changes by Varun---------------------------------// 
export function checkForAdvocacySolutionsAgainstUMR(quest, opportunityData, questionAndAnswerRecords) {
    if ((opportunityData.Platforms_Quoted__c && opportunityData.Platforms_Quoted__c.split(';').length === 1 &&
        opportunityData.Platforms_Quoted__c === 'UMR') ||
        (
            questionAndAnswerRecords['Final_Platform__c'] &&
            questionAndAnswerRecords['Final_Platform__c'].split(';').includes('UMR')
        )
    ) {
        return false;
    }
    return true;
}
//--------------------Changes by Varun---------------------------------//