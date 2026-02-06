/** ######################################################################################
* @author       Sudarshan Reddy
* @date         05/05/2018
* @description  This invocable class is to calculate and update Targeted completion Date for Case Created from Email
*                 
*##########################################################################################    */
public with sharing class CaseTargetCompletionDateforEmailCase {
    
    @InvocableMethod(label='Case from Email:Target Completion Date Calculation' description='Case From Email :Target Completion Date Calculation based on Holidays and Business Houres')
    public static void TargetCompletionDateCalculation (List<string> inputParams) {
        //TODO: update method return type and input parameters (they do need to be List)
        
        List<Case> results = new List<Case>();
        Integer  tatDays;
        Long intervalMilliseconds ;
        Datetime newDate;
        Datetime creation_date;
        
        try
        {
            // Getting Business Hours Record Id
            BusinessHours bh = [SELECT ID, Name, IsDefault, IsActive 
                                From BusinessHours 
                                WHERE IsDefault = true ];
            
            // Getting Case details from the list of case ID's
            List<Case> caseList = [SELECT Id, Category__c, Sub_Category__c, Visibility__c,  Target_Completion__c, CreatedDate 
                                   FROM Case 
                                   WHERE Id in :inputParams];
            
            for (Case currentCase : caseList)
            {
                
                intervalMilliseconds = 3 * 9 * 60 * 60 * 1000 ; // converting into milliseconds
                
                System.debug('intervalMilliseconds...'+intervalMilliseconds);
                
                System.debug('tatDays...'+tatDays);
                // calculating target date using SF defalt BusinessHours class
                creation_date = currentCase.CreatedDate + 1; // this is to exclude creation date
                
                newDate = Datetime.newInstance(creation_date.year(),creation_date.month(),creation_date.day(),9,0,0); // this is to set 9 am is starting business hours
                Datetime dueDate = BusinessHours.add(bh.Id, newDate, intervalMilliseconds );
                System.debug('currentCase.CreatedDate...'+newDate);
                System.debug('dueDate...'+dueDate);
                currentCase.Target_Completion__c = date.newinstance(dueDate.year(),dueDate.month(), dueDate.day());
                currentCase.Visibility__c = 'Personal';
                results.add(currentCase);
                
            }
            
            if(results.size() > 0)
            {
                System.debug('Inside Result');
                // updating Case list with Target Completion Date
                update results;
            }
            
        }catch (Exception e)
        {
            System.debug('Error occurred in CaseTargetCompletionDateforEmailCase class - '+e);
        }
    }
}