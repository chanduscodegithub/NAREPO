/** ######################################################################################
* @author       Sudarshan reddy M
* @date         08/05/2018
* @description  This invocable class is to calculate  Targeted completion Date for New Created Case
*                 
*##########################################################################################    */
public class CaseTargetCompletionDateCalculation{
    
    @InvocableMethod(label='Issue Target Completion Date Calculation' description='Case Target Completion Date Calculation for New Cases based on Holidays and Business Houres')
    public static void TargetCompletionDateCalculation (List<string> inputParams) {
        //TODO: update method return type and input parameters (they do need to be List)
        
        List<Case> results = new List<Case>();
        Integer  tatDays;
        Long intervalMilliseconds ;
        Map<String,Integer> tatMap = new Map<String,Integer>();
        Map<String,Integer> tatSBSMap = new Map<String,Integer>();
        Boolean visibilityCheck = true;
        Datetime newDate; 
        Datetime creation_date;
        
        try
        {
            // Getting Business Hours Record Id
            BusinessHours bh = [SELECT ID, Name, IsDefault, IsActive 
                                From BusinessHours 
                                WHERE IsDefault = true ];
            
            // Getting Case details from the list of case ID's
            List<Case> caseList = [SELECT Id, RecordTypeId, Category__c, Sub_Category__c, Visibility__c,  Target_Completion__c, CreatedDate 
                                   FROM Case 
                                   WHERE Id in :inputParams];
            
            // Getting SBS Support recordType Id of Case
            ID SBSSupportRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('SBS Support').getRecordTypeId();
            
            // Getting  SBS Suppport MetaData values 
            List<SBS_Support__mdt> tatList = [SELECT Category__c, Sub_Category__c, Days__c, Type__c, Visibility__c
                                              FROM SBS_Support__mdt];
            
            if(tatList.size() > 0)
            {
                for(SBS_Support__mdt tat : tatList)
                {
                    if(tat.Type__c == 'Visibility' && tat.Visibility__c != null){
                        tatMap.put(tat.Visibility__c, Integer.valueOf(tat.Days__c));
                    }
                    else if(tat.Category__c != null && tat.Days__c !=null)
                    {
                        tatMap.put(tat.Category__c, Integer.valueOf(tat.Days__c));
                    }
                }
            }
            
            
            for (Case currentCase : caseList)
            {
                tatDays = 0;
                visibilityCheck = true;
                if(currentCase.RecordTypeId == SBSSupportRecordTypeId){
                    
                    if(currentCase.Category__c != null && currentCase.Category__c == 'Document Review Board')
                    {
                        if(tatMap.containsKey(currentCase.Category__c))
                        {
                            tatDays = tatMap.get(currentCase.Category__c);
                        }
                        visibilityCheck = false;
                    }else if(currentCase.Category__c != null && currentCase.Category__c != 'Document Review Board'){
                        if(tatMap.containsKey(currentCase.Category__c))
                        {
                            tatDays = tatMap.get(currentCase.Category__c);
                        }
                        visibilityCheck = false;
                    }
                    
                    if (currentCase.Visibility__c != null  && visibilityCheck)
                    {
                        if(tatMap.containsKey(currentCase.Visibility__c)){
                            tatDays = tatMap.get(currentCase.Visibility__c); // Converting string to integer
                        } 
                    }
                } 
                else if(currentCase.RecordTypeId != SBSSupportRecordTypeId){
                    If (currentCase.Visibility__c != null )
                    {
                        if(tatMap.containsKey(currentCase.Visibility__c)){
                            tatDays = tatMap.get(currentCase.Visibility__c); // Converting string to integer
                        } 
                    }
                }
                
                intervalMilliseconds = (tatDays) * 9 * 60 * 60 * 1000 ; // converting into milliseconds
                
                System.debug('intervalMilliseconds...'+intervalMilliseconds);
                System.debug('tatDays...'+tatDays);
                
                // calculating target date using SF defalt BusinessHours class
                if(tatDays > 1)
                {
                    creation_date = currentCase.CreatedDate + 1; // this is to exclude creation date
                }else if(tatDays == 0){
                    creation_date = null;
                }
                else{
                    creation_date = currentCase.CreatedDate;
                }
                
                newDate = Datetime.newInstance(creation_date.year(),creation_date.month(),creation_date.day(),9,0,0); // this is to set 9 am is starting business hours
                Datetime dueDate = BusinessHours.add(bh.Id, newDate, intervalMilliseconds );
                System.debug('currentCase.CreatedDate...'+newDate);
                System.debug('dueDate...'+dueDate);
                
                if(currentCase.Target_Completion__c == NULL){
                    currentCase.Target_Completion__c = date.newinstance(dueDate.year(),dueDate.month(), dueDate.day());
                    results.add(currentCase);
                } 
                else if(currentCase.Target_Completion__c != NULL){
                    currentCase.Target_Completion__c = currentCase.Target_Completion__c;
                    results.add(currentCase);
                }
            }
            
            if(results.size() > 0)
            {
                System.debug('Inside Result');
                // updating Case list with Target Completion Date
                update results;
            }
            
        }catch (Exception e)
        {
            System.debug('Error occurred in CaseTargetCompletionDateCalculation class - '+e);
        }
    }
}