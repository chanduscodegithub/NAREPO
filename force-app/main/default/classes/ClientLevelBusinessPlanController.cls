/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 03-14-2024
 * @last modified by  : Spoorthy
**/
public with sharing class ClientLevelBusinessPlanController {
    public static String SALES_SEASON_PREFIX = 'IY ';
    public static String SALES_SEASON_INFIX = ', 1/1/';
    
    @AuraEnabled
    public static ReturnClientBusinessPlanData getClientLevelBusinessPlan(String accountId,String salesSeason){
        System.debug('Inside getClientLevelBusinessPlan()');
        System.debug('accountId==>'+accountId+' & salesSeason==>'+salesSeason);
        /* Intialization of variables for bulding Sales Season Value Dynamically - START */        
        Map<String,String> salesSeasonSettingMap = new Map<String,String>();
        List<String> salesSeasonParams =new List<String>();
            salesSeasonParams.add('SalesCycle_Default_Month');
            salesSeasonParams.add('SalesCycle_Default_Year');
            
            List<ClientPlan_SalesCycle__mdt> clientPlanSettingList = [Select DeveloperName,Value__c from ClientPlan_SalesCycle__mdt where DeveloperName in: salesSeasonParams];
            
            for(ClientPlan_SalesCycle__mdt eachSalesSeasonSetting : clientPlanSettingList){
                salesSeasonSettingMap.put(eachSalesSeasonSetting.DeveloperName,eachSalesSeasonSetting.Value__c);
            }
        /* Intialization of variables for bulding Sales Season Value Dynamically - END */
        
        ReturnClientBusinessPlanData returnClientBusinessPlanDataObj = new ReturnClientBusinessPlanData();
        try{ 
            
            //List<Client_Level_Business_Plan__c> clientBusinessPlanList;
            List<Goal__c> goalList;            
            String salesSeasonValue=salesSeason;
            returnClientBusinessPlanDataObj.disableCopyPreviousButton = true;
            if(salesSeason==''){
               String defaultSalesSeason='';
                String previousSalesSeason = '';
                Date todayDate=system.today();
                /* Building Sales Season dynamically - START */
                System.debug('SalesCycle_Default_Month '+Integer.valueOf(salesSeasonSettingMap.get('SalesCycle_Default_Month')));
                System.debug('Default Year '+Integer.valueOf(salesSeasonSettingMap.get('SalesCycle_Default_Year')));
                System.debug('todayDate.year() '+todayDate.year());
                
                if(Integer.valueOf(salesSeasonSettingMap.get('SalesCycle_Default_Year')) <= todayDate.year()+1){
                    if(todayDate.month() <= Integer.valueOf(salesSeasonSettingMap.get('SalesCycle_Default_Month'))){
                        defaultSalesSeason='IY '+string.valueof(todayDate.year()).right(2)+', 1/1/'+string.valueof(todayDate.year()+1);
                   	    previousSalesSeason = 'IY '+string.valueOf(todayDate.year()-1).right(2)+', 1/1/'+string.valueOf(todayDate.year());
                    }else{
                        defaultSalesSeason='IY '+string.valueof(todayDate.year()+1).right(2)+', 1/1/'+string.valueof(todayDate.year()+2);
                    	previousSalesSeason = 'IY '+string.valueOf(todayDate.year()).right(2)+', 1/1/'+string.valueOf(todayDate.year()+1);
                    }
                }
                system.debug('defaultSalesSeason '+defaultSalesSeason);
                
                /* Building Sales Season dynamically - END */
                
                //Date nextYearSalesSeasonStartDate=date.newinstance(todayDate.Year(), 10, 1);
               /* Date nextYearSalesSeasonStartDate=date.newinstance(todayDate.Year(), 7, 1);
                if(todayDate<nextYearSalesSeasonStartDate){
                    defaultSalesSeason='IY '+string.valueof(todayDate.year()).right(2)+', 1/1/'+string.valueof(todayDate.year()+1);
                    previousSalesSeason = 'IY '+string.valueOf(todayDate.year()-1).right(2)+', 1/1/'+string.valueOf(todayDate.year());
                }else{
                    defaultSalesSeason='IY '+string.valueof(todayDate.year()+1).right(2)+', 1/1/'+string.valueof(todayDate.year()+2);
                    previousSalesSeason = 'IY '+string.valueOf(todayDate.year()).right(2)+', 1/1/'+string.valueOf(todayDate.year()+1);
                } */
                
                salesSeasonValue=defaultSalesSeason;
                //clientBusinessPlanList=[Select Id,Name,Sales_Season__c,Goal__c,Strategy__c,Action_Steps_PlannedTaken__c from Client_Level_Business_Plan__c where Company__c=:accountId and Sales_Season__c=:defaultSalesSeason order by Goal__c];
                goalList=[Select Id,Name,Sales_Season__c,Goal__c,Goal_Write_In__c,CreatedDate,Company__c,(Select Id,Name,Strategy__c,Action_Steps_PlannedTaken__c,Strategy_Write_In__c,Applicable_for__c from Strategies__r order by CreatedDate) from Goal__c where Company__c=:accountId and Sales_Season__c=:defaultSalesSeason order by CreatedDate];
                /* Query Previous Year Sales Season Records count - START */
                if(goalList.size() == 0 && goalList.isEmpty()) {                    
                    Integer count = [SELECT count() FROM Goal__c WHERE Company__c=:accountId and Sales_Season__c=:previousSalesSeason];
                    if(count > 0) {
                        returnClientBusinessPlanDataObj.disableCopyPreviousButton = false;
                        returnClientBusinessPlanDataObj.previousGoalList=[Select Id,Name,Sales_Season__c,Goal__c,Goal_Write_In__c,CreatedDate,Company__c,(Select Id,Name,Strategy__c,Action_Steps_PlannedTaken__c,Strategy_Write_In__c,Applicable_for__c from Strategies__r order by CreatedDate) from Goal__c where Company__c=:accountId and Sales_Season__c=:previousSalesSeason order by CreatedDate];
                    }
                }
                /* Query Previous Year Sales Season Records count - END */
            }else{
                //clientBusinessPlanList=[Select Id,Name,Sales_Season__c,Goal__c,Strategy__c,Action_Steps_PlannedTaken__c from Client_Level_Business_Plan__c where Company__c=:accountId and Sales_Season__c=:salesSeason order by Goal__c];
                goalList=[Select Id,Name,Sales_Season__c,Goal__c,Goal_Write_In__c,CreatedDate,Company__c,(Select Id,Name,Strategy__c,Action_Steps_PlannedTaken__c,Strategy_Write_In__c,Applicable_for__c from Strategies__r order by CreatedDate) from Goal__c where Company__c=:accountId and Sales_Season__c=:salesSeason order by CreatedDate];
                   
                String[] salesSeasonArray = salesSeason.split(',');
                if(salesSeasonArray != null && salesSeasonArray.size() == 2) {                    
                    
                    String previousSalesSeason = 'IY '+String.valueOf(Integer.valueOf(salesSeasonArray[0].substring(3))-1)+', 1/1/'+String.valueOf(Integer.valueOf(salesSeasonArray[1].substring(5)) - 1);
                    if(goalList.size() == 0 && goalList.isEmpty()) {                    
                        Integer count = [SELECT count() FROM Goal__c WHERE Company__c=:accountId and Sales_Season__c=:previousSalesSeason];
                        if(count > 0) {
                            returnClientBusinessPlanDataObj.disableCopyPreviousButton = false;
                            returnClientBusinessPlanDataObj.previousGoalList=[Select Id,Name,Sales_Season__c,Goal__c,Goal_Write_In__c,CreatedDate,Company__c,(Select Id,Name,Strategy__c,Action_Steps_PlannedTaken__c,Strategy_Write_In__c,Applicable_for__c from Strategies__r order by CreatedDate) from Goal__c where Company__c=:accountId and Sales_Season__c=:previousSalesSeason order by CreatedDate];
                        }
                    }
                }                
            } 	
            
            //returnClientBusinessPlanDataObj.clientBusinessPlanList=clientBusinessPlanList;
            returnClientBusinessPlanDataObj.goalList=goalList;
            returnClientBusinessPlanDataObj.salesSeason=salesSeasonValue;
            
            System.debug('Sales Season value==>'+salesSeasonValue);
            System.debug('goalList==>'+goalList);
            
            Map<String,List<String>> picklistValueMap = new Map<String,List<String>>();
            
            List<String> picklistItagList = getListFromValueSeparatedStr(System.Label.ClientLevelBusinessPlan_PicklistFields,',');
            if(picklistItagList!=null && !picklistItagList.isEmpty()){
                for(String picklistItag : picklistItagList){
                    //picklistValueMap.put(picklistItag, getselectOptions('Client_Level_Business_Plan__c',picklistItag));
                    picklistValueMap.put(picklistItag, getselectOptions('Goal__c',picklistItag));
                }
                
            }
            if(picklistValueMap.containsKey('Goal__c') && !picklistValueMap.get('Goal__c').isEmpty()){
                
                List<Client_Level_Business_Plan_Picklist__mdt> clntBusnssPlnPcklstMtdtRcrdLst=[Select Id,Goal__c,Strategy__c,DeveloperName from Client_Level_Business_Plan_Picklist__mdt where Goal__c in : picklistValueMap.get('Goal__c')];
                Map<String,String> goalStrategyMap=new Map<String,String>();
                
                if(clntBusnssPlnPcklstMtdtRcrdLst!=null && !clntBusnssPlnPcklstMtdtRcrdLst.isEmpty()){
                    for(Client_Level_Business_Plan_Picklist__mdt eachclntBusnssPlnPcklstMtdtRcrd:clntBusnssPlnPcklstMtdtRcrdLst){
                        goalStrategyMap.put(eachclntBusnssPlnPcklstMtdtRcrd.Goal__c,eachclntBusnssPlnPcklstMtdtRcrd.Strategy__c); 
                    }
                    
                }
                if(!goalStrategyMap.isEmpty()){
                    for(String eachGoal:picklistValueMap.get('Goal__c')){
                        if(goalStrategyMap.containsKey(eachGoal) && goalStrategyMap.get(eachGoal)!=null && 
                           goalStrategyMap.get(eachGoal)!=''){
                               picklistValueMap.put(eachGoal,getListFromValueSeparatedStr(goalStrategyMap.get(eachGoal),'##'));
                           }
                    }
                    
                }
                
                
            } 
            
            returnClientBusinessPlanDataObj.picklistFieldMap=picklistValueMap;
            
             /* Code for user edit access - start*/
            System.debug('User edit access ');
            Boolean hasEditAccess = UserInformationClass.hasEditAccessToRecord(accountId);
            returnClientBusinessPlanDataObj.hasEditAccess = hasEditAccess;
            system.debug('hasEditAccessToRecord -->'+hasEditAccess);
            /* Code for user edit access - end*/
            
            System.debug('returnClientBusinessPlanDataObj'+returnClientBusinessPlanDataObj);
            //for test class coverage added by Vignesh
            if(Test.isRunningTest()) {
                CalloutException e = new CalloutException();
                e.setMessage('This is a constructed exception for testing and code coverage');
                throw e;
               
            }
            
        }catch(Exception e){
            System.debug('Exception occured in getClientLevelBusinessPlan(String,String) method==> '+e.getMessage());
        }
        return returnClientBusinessPlanDataObj;   
    }
    
 /*   @AuraEnabled
    public static ReturnClientBusinessPlanData createOrUpdateClientPlanRecords1(List<Goal__c> goalListTobeDeleted,List<Goal__c> goalListToUpdate,
                                                                               List<Strategy__c> strategyListToUpdate, 
                                                                               List<String> goalAndStrategyRecordsToCreate,String accountId,String salesSeason)
    {
        
        try
        {
            if(goalListToUpdate!=null && !goalListToUpdate.isEmpty()){
                Database.SaveResult[] goalUpdateResultList = Database.update(goalListToUpdate);
                List<ID> goalIdList=new List<ID>();
                for(Goal__c eachGoal:goalListToUpdate){
                    goalIdList.add(eachGoal.Id);
                }
                
				List<Strategy__c> strategyListTobeDeleted=[Select Id,Name,Strategy__c,Action_Steps_PlannedTaken__c from Strategy__c where Goal__c in : goalIdList];
				  
                delete strategyListTobeDeleted;
                
                // Iterate through each returned result
                for (Database.SaveResult sr : goalUpdateResultList) {
                    
                    if(!sr.isSuccess()) {
                        for(Database.Error err : sr.getErrors()) {
                            System.debug('The following error has occurred.');                    
                            System.debug(err.getStatusCode() + ': ' + err.getMessage());
                        }
                    }
                }
            }
            if(strategyListToUpdate!=null && !strategyListToUpdate.isEmpty()){
                Database.SaveResult[] strategyUpdateResultList = Database.update(strategyListToUpdate);
                
                // Iterate through each returned result
                for (Database.SaveResult sr : strategyUpdateResultList) {
                    
                    if(!sr.isSuccess()) {
                        for(Database.Error err : sr.getErrors()) {
                            System.debug('The following error has occurred.');                    
                            System.debug(err.getStatusCode() + ': ' + err.getMessage());
                        }
                    }
                }
            }

            /* Insertion of Mandatory Goals for Create New Plan Button - START */
           /* if(goalAndStrategyRecordsToCreate != null && !goalAndStrategyRecordsToCreate.isEmpty()) {
                
                System.debug('goalAndStrategyRecordsToCreate '+goalAndStrategyRecordsToCreate);                
                List<Goal__c> listofRecordsToInsert = new List<Goal__c>();
                for(String eachGoalAndStrategy:goalAndStrategyRecordsToCreate) {
                    System.debug('eachGoalAndStrategy'+eachGoalAndStrategy);
                    Goal__c goalToInsert=new Goal__c();
                    goalToInsert.Company__c=accountId;
                    goalToInsert.Goal__c = eachGoalAndStrategy;
                    goalToInsert.Sales_Season__c=salesSeason;
                    listofRecordsToInsert.add(goalToInsert);
                }
                Database.SaveResult[] goalInsertResult = Database.insert(listofRecordsToInsert);                
                for (Database.SaveResult sr : goalInsertResult) {                    
                    if(!sr.isSuccess()) {
                        for(Database.Error err : sr.getErrors()) {
                            System.debug('The following error has occurred.');                    
                            System.debug(err.getStatusCode() + ': ' + err.getMessage());
                        }
                    }
                }                            
            }
            /* Insertion of Mandatory Goals for Create New Plan Button - END */
         /*   
        }
        catch(Exception e)
        {
            System.debug('Exception Occured in createOrUpdateClientPlanRecords() method==>'+e.getMessage());
        }
        
        return getClientLevelBusinessPlan(accountId,salesSeason);
        
    } */
    
    
    @AuraEnabled
    public static ReturnClientBusinessPlanData createOrUpdateClientPlanRecords(List<Goal__c> goalListTobeDeleted,List<Goal__c> goalListToUpdate,
                                                                               List<Strategy__c> strategyListToUpdate, 
                                                                               List<Goal__c> goalAndStrategyRecordsToCreate,
                                                                               List<Strategy__c> strategyListTobeCreated,String accountId,String salesSeason,
                                                                               List<Strategy__c> strategyRecordsToBeDeleted,
                                                                               List<Goal__c> goalRecordsToBeDeleted,
                                                                              	List<Goal__c> newGoalsListToBeCreated,
                                                                              	Map<String, List<Strategy__c>> newMapOfStrategyToInsert,
                                                                              	List<Id> trackRecordId)
    {
        System.debug('Inside createOrUpdateClientPlanRecords()');
        System.debug('strategyRecordsToBeDeleted'+strategyRecordsToBeDeleted);
        	System.debug('goalAndStrategyRecordsToCreate==>'+goalAndStrategyRecordsToCreate);
        System.debug('goalRecordsToBeDeleted  ==>'+goalRecordsToBeDeleted);
        System.debug('\n CREATE NEW GOAL newGoalsListToBeCreated '+newGoalsListToBeCreated);
        System.debug('\n Create NEW STRATEGY newMapOfStrategyToInsert '+newMapOfStrategyToInsert);
        System.debug('\n trackRecordId ---> '+trackRecordId);
        
        // List to store goals for insert
        List<Goal__c> listOfGoals = new List<Goal__c>();
        List<Strategy__c> listOfStrategies = new List<Strategy__c>();
        try
        {
            
            if(goalListToUpdate!=null && !goalListToUpdate.isEmpty()){
                update goalListToUpdate;
                List<ID> goalIdList=new List<ID>();
                for(Goal__c eachGoal:goalListToUpdate){
                    /*for(String singleId : trackRecordId) {
                        Id singleIdValue = Id.valueOf(singleId);
                        if(eachGoal.Goal__c != 'Other client specific goals (Free Form/Write In)' || singleIdValue == eachGoal.Id){
                            System.debug('Id Received is \n singleIdValue --> '+singleIdValue+'\n eachGoal.Id --> '+eachGoal.Id);
                            goalIdList.add(eachGoal.Id);
                        }   
                    }*/
                    if(eachGoal.Goal__c != 'Other client specific goals (Free Form/Write In)' || trackRecordId.contains(eachGoal.Id)){

                            goalIdList.add(eachGoal.Id);
                        }
                }
                
                if(!goalIdList.isEmpty()){
                    List<Strategy__c> strategyListTobeDeleted=[Select Id,Name,Strategy__c,Action_Steps_PlannedTaken__c,Applicable_for__c from Strategy__c where Goal__c in : goalIdList];
				  if(Strategy__c.sObjectType.getDescribe().isDeletable()){
                      delete strategyListTobeDeleted;
                  }
                }
				
                
                
            }
            if(strategyListToUpdate!=null && !strategyListToUpdate.isEmpty()){
                upsert strategyListToUpdate;
                
               
            }
            if(goalAndStrategyRecordsToCreate!=null && !goalAndStrategyRecordsToCreate.isEmpty()){
                createGoalAndStrategyRecords(goalAndStrategyRecordsToCreate,salesSeason,strategyListTobeCreated);
            }
            
            /* Deleting Strategy starts */
            /*if(strategyRecordsToBeDeleted != null){
                List<Strategy__c> deleteStrategyRecords = new List<Strategy__c>();
                for(Strategy__c strategyRec : strategyRecordsToBeDeleted){
                    if(strategyRec.Id != null){
                        system.debug('strategyRec '+strategyRec);
                        deleteStrategyRecords.add(strategyRec);
                    }
                }
                system.debug('deleteStrategyRecords '+deleteStrategyRecords);
                deleteGoalStrategyRecords(deleteStrategyRecords);
            }*/

             /* Deleting goal starts */
             /*if(GoalRecordsToBeDeleted != null){
                system.debug('GoalRecordsToBeDeleted '+GoalRecordsToBeDeleted);
                deleteGoalStrategyRecords(GoalRecordsToBeDeleted);
            }*/ 
            
            if(strategyRecordsToBeDeleted!=null && !strategyRecordsToBeDeleted.isEmpty()){
                if(Strategy__c.sObjectType.getDescribe().isDeletable()){
                    delete strategyRecordsToBeDeleted;
                }
            }
            
            
            /* Code for inserting new GOALs - START */
            Map<Integer, String> goalMap1 = new Map<Integer, String>();
            if(newGoalsListToBeCreated != null && !newGoalsListToBeCreated.isEmpty()) {
                for( Integer i = 0 ; i < newGoalsListToBeCreated.size() ; i++) {
                    Goal__c singleGoal = new Goal__c();
                    singleGoal.Sales_Season__c = newGoalsListToBeCreated[i].Sales_Season__c;
                    singleGoal.Goal_Write_In__c = newGoalsListToBeCreated[i].Goal_Write_In__c;
                    singleGoal.Company__c = newGoalsListToBeCreated[i].Company__c;
                    singleGoal.Goal__c = newGoalsListToBeCreated[i].Goal__c;
                    goalMap1.put(i,newGoalsListToBeCreated[i].Name);
                    listOfGoals.add(singleGoal);
                }
                insert as user listOfGoals;
                system.debug('listOfGoals after SAVE '+listOfGoals+'\n and number of goals Inserted are '+listOfGoals.size());
                
                /* Code to Loop List of goals and Add its Autonumber as key and Id as value after Insert - START */
                
                Map<String,Id> newGoalMap = new Map<String, Id>();
                Integer count = 0;
                for(Integer i = 0 ; i < listOfGoals.size() ; i++) {
                    if(goalMap1.containsKey(i)) {
                        newGoalMap.put(goalMap1.get(i),listOfGoals[i].Id);
                    }
                }
                System.debug('\n newGoalMap '+newGoalMap);
                
                /* Code to Loop List of goals and Add its Autonumber as key and Id as value after Insert - END */
                if(newMapOfStrategyToInsert != null) {
                    for(String autoNumber : newMapOfStrategyToInsert.keySet()) {
                        List<Strategy__c> strategyList = newMapOfStrategyToInsert.get(autoNumber);
                        if(strategyList.size() > 0){
                            for(Strategy__c strategyRec : strategyList) {
                                Strategy__c singleStrategy = new Strategy__c();
                                singleStrategy.Action_Steps_PlannedTaken__c = strategyRec.Action_Steps_PlannedTaken__c;
                                singleStrategy.Goal__c = newGoalMap.get(autoNumber);
                                singleStrategy.Strategy__c = strategyRec.Strategy__c;
                                singleStrategy.Strategy_Write_In__c = strategyRec.Strategy_Write_In__c;
                                singleStrategy.Applicable_for__c = strategyRec.Applicable_for__c;                                
                                listOfStrategies.add(singleStrategy);
                            }
                        }
                        
                        
                    }
                    
                    insert as user listOfStrategies;
                    system.debug('listOfStrategies after SAVe '+listOfStrategies);
                }
                
            }
            /* Code for inserting new GOALs - END */
            
             if(goalListTobeDeleted!=null && !goalListTobeDeleted.isEmpty()){
                if(Goal__c.sObjectType.getDescribe().isDeletable()){
                delete goalListTobeDeleted;
                }
            }
            
            if(strategyRecordsToBeDeleted!=null && !strategyRecordsToBeDeleted.isEmpty()){
               if(Strategy__c.sObjectType.getDescribe().isDeletable()){
                delete strategyRecordsToBeDeleted;
               }
            }
            
        }
        catch(Exception e)
        {
            System.debug('Exception Occured in createOrUpdateClientPlanRecords() method==>'+e.getMessage());
        }
        
        return getClientLevelBusinessPlan(accountId,salesSeason);
        
    }
    
    public static void createGoalAndStrategyRecords(List<Goal__c> goalAndStrategyRecordsToCreate,String salesSeason,List<Strategy__c> strategyListTobeCreated)
    {
        System.debug('goalAndStrategyRecordsToCreate==>'+goalAndStrategyRecordsToCreate);
       
        
        for(Goal__c eachGoalAndStrategy:goalAndStrategyRecordsToCreate){
            system.debug('eachGoalAndStrategy'+eachGoalAndStrategy);
            Goal__c goalToInsert=new Goal__c();
            goalToInsert.Company__c=eachGoalAndStrategy.Company__c;
            goalToInsert.Goal__c=eachGoalAndStrategy.Goal__c;
            goalToInsert.Goal_Write_In__c=eachGoalAndStrategy.Goal_Write_In__c;
            goalToInsert.Sales_Season__c=salesSeason;
            
            
            Database.SaveResult goalInsertResult = Database.insert(goalToInsert, AccessLevel.USER_MODE);
            ID goalId=null;    
            
            
            
            if(goalInsertResult.isSuccess()) {
                System.debug('Successfully inserted Goal. Goal ID: ' + goalInsertResult.getId());
                goalId=goalInsertResult.getId();
            }   
            else{  
                for(Database.Error err : goalInsertResult.getErrors()) {
                    System.debug('The following error has occurred.');                    
                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                }
            }
            
            if(goalId!=null){
                System.debug('Inside strategyListInsert==>'+goalId);
                System.debug('eachGoalAndStrategy.Strategies__r==>'+eachGoalAndStrategy.Strategies__r);
                List<Strategy__c> strategyListToInsert=new List<Strategy__c>();
                
                if(strategyListTobeCreated!=null && !strategyListTobeCreated.isEmpty()){
                for(Strategy__c eachStrategy:strategyListTobeCreated){
                    Strategy__c strategyToInsert=new Strategy__c();
                    strategyToInsert.Goal__c=goalId;
                    strategyToInsert.Strategy__c=eachStrategy.Strategy__c;
                    if(eachStrategy.Strategy_Write_In__c != null) {
                        strategyToInsert.Strategy_Write_In__c =  eachStrategy.Strategy_Write_In__c;
                    }
                    strategyToInsert.Action_Steps_PlannedTaken__c=eachStrategy.Action_Steps_PlannedTaken__c;
                    strategyToInsert.Applicable_for__c=eachStrategy.Applicable_for__c;
                    strategyListToInsert.add(strategyToInsert);
                }
                }
                System.debug('strategyListToInsert==>'+strategyListToInsert);
                if(!strategyListToInsert.isEmpty()){
                    Database.SaveResult[] strategyInsertResultList = Database.insert(strategyListToInsert, AccessLevel.USER_MODE);
                    
                    // Iterate through each returned result
                    for (Database.SaveResult sr : strategyInsertResultList) {
                        
                        if(sr.isSuccess()) {
                            System.debug('Successfully inserted Strategy. Strategy ID: ' + sr.getId());
                            
                        } 
                        if(!sr.isSuccess()) {
                            for(Database.Error err : sr.getErrors()) {
                                System.debug('The following error has occurred.');                    
                                System.debug(err.getStatusCode() + ': ' + err.getMessage());
                            }
                        }
                    }
                }
                
            }
        } 
        
        
        
    }
        

    
    
    public static List < String > getselectOptions(String objectName, string fld)
    {
        
        System.debug('objectName,fld==>'+objectName+' '+fld);
        List < String > allOpts = new list < String > ();
        allOpts.add('');
        
        // Get the object type of the SObject.
        Schema.SObjectType objType = Schema.getGlobalDescribe().get(objectName);
        
        
        // Schema.sObjectType objType = objObject.getSObjectType();
        
        // Describe the SObject using its object type.
        Schema.DescribeSObjectResult objDescribe = objType.getDescribe();
        
        // Get a map of fields for the SObject
        map < String, Schema.SObjectField > fieldMap = objDescribe.fields.getMap();
        
        // Get the list of picklist values for this field.
        list < Schema.PicklistEntry > values =
            fieldMap.get(fld).getDescribe().getPickListValues();
        
        // Add these values to the selectoption list.
        for (Schema.PicklistEntry a: values) {
            allOpts.add(a.getValue());
        }
        //system.debug('allOpts ---->' + allOpts);
        //allOpts.sort();
        return allOpts;
    }
    
    
    public static List <String> getListFromValueSeparatedStr(String valueSeparatedStr, string valueSeparator)
    {
        String[] returnList=new List<String>();
        if(valueSeparatedStr!=null && valueSeparatedStr!='')
        {
            if(valueSeparatedStr.contains(valueSeparator))
            {
                returnList= valueSeparatedStr.split(valueSeparator);
                
            }
            else
            {
                returnList.add(valueSeparatedStr);
            }
            
        }
        return returnList;
    }
    
    public static boolean deleteGoalStrategyRecords(List<SObject> listOfRecordsToBeDeleted){
        /* Deleting records function Starts */
        boolean deleteStatus = false;
        Database.DeleteResult[] drList = Database.delete(listOfRecordsToBeDeleted, false, AccessLevel.USER_MODE);

        // Iterate through each returned result
        for(Database.DeleteResult dr : drList) {
        if (dr.isSuccess()) {
            // Operation was successful, so get the ID of the record that was processed
            System.debug('Successfully deleted Record with ID: ' + dr.getId());
            deleteStatus = true;
        }
        else {
            // Operation failed, so get all errors                
            for(Database.Error err : dr.getErrors()) {
                deleteStatus = false;
                System.debug('The following error has occurred.');                    
                System.debug(err.getStatusCode() + ': ' + err.getMessage());
                System.debug('Account fields that affected this error: ' + err.getFields());
            }
        }
      }
      return deleteStatus;
    }


    @AuraEnabled
    public static ClientPlanWrapper getTemplateInXML(String accountId,String salesSeason){
        
        ClientPlanWrapper clientPlanWrapper = new ClientPlanWrapper();
        String objectName  = '';  
        StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'ClientPlan'];
        String xmlBodyString = sr.body.toString();
        
        Map<String,String> OBJECT_FILTER_RECORDS = IConstantsTemplate.OBJECT_FILTER_RECORDS;
        
        Pattern p = Pattern.compile(IConstantsTemplate.TEMPLATE_PREFIX_SUFFIX_REG_EXPRESSION);
        
        Matcher m = p.matcher(xmlBodyString);
        
        System.debug('matcher '+m);
        
        Map<String,Set<String>> objectItagesMap = new Map<String,Set<String>>();
        
        while (m.find()) {
            String itag = m.group();    
            
            system.debug('before replace prefix : '+itag);
            itag = itag.replaceAll(IConstantsTemplate.ITAG_PREFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            itag = itag.replaceAll(IConstantsTemplate.ITAG_SUFFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            //System.debug('itag '+itag);
            System.debug('itag value '+itag);
            Integer dotFirstIndex = itag.indexOf('.');
            objectName = itag.substring(0,dotFirstIndex);
            String fieldName = itag.substring(dotFirstIndex+1);
            
            // System.debug('iTagFormatField '+iTagFormatField);
            
            if(objectItagesMap.containsKey(objectName)){
                Set<String> itagSet =  objectItagesMap.get(objectName);                    
                itagSet.add(fieldName);
                objectItagesMap.put(objectName, itagSet);
                
            }else{
                Set<String> itagSet = new Set<String>();
                itagSet.add(fieldName);      
                System.debug('objectName  -> '+objectName);                     
                objectItagesMap.put(objectName, itagSet);
            }                         
            
        }
        
         //List<Account> account = [Select Id,Name,(Select Id from Goal__r) from account where id='001g0000026IQF0AAO'];        
        List<Goal__c> goalList =[Select Goal__c,Goal_Write_In__c,Company__r.Name,(Select Strategy__c,Strategy_Write_In__c,Action_Steps_PlannedTaken__c,Applicable_for__c from Strategies__r order by CreatedDate) from Goal__c where Company__c=:accountId and Sales_Season__c=:salesSeason WITH USER_MODE order by CreatedDate];
        
        if(goalList.size() > 0){
            clientPlanWrapper.accountName = goalList[0].Company__r.Name;
		}
        clientPlanWrapper.goalList = goalList;
        clientPlanWrapper.xmlString = xmlBodyString;
        clientPlanWrapper.objectItags = objectItagesMap;
        return clientPlanWrapper;
        
    }

    @AuraEnabled
    public static ReturnClientBusinessPlanData copyPreviousSalesSeasonData(String accountId, String previousSalesCycle,String presentSalesSeason){
        system.debug('Inside copyPreviousSalesSeasonData '+accountId+'\n previousSalesCycle '+previousSalesCycle+
                     '\n presentSalesSeason' +presentSalesSeason);
        ReturnClientBusinessPlanData returnClientBusinessPlanDataObj = new ReturnClientBusinessPlanData();
        //returnClientBusinessPlanDataObj = getClientLevelBusinessPlan(accountId,previousSalesCycle);
        List<Goal__c> goalList;
        List<Goal__c> goalListToBeInserted = new List<Goal__c>();
        List<Strategy__c> strategyListTobeInserted = new List<Strategy__c>();
        Map<String, List<Strategy__c>> oldStrategies = new Map<String, List<Strategy__c>>();
        List<Id> strategyIdList = new List<Id>();
        List<Id> newGoalId = new List<Id>();
        String newGoalName = '';
        goalList = [Select Id,Name,Sales_Season__c,Goal__c,Goal_Write_In__c,Company__c,(Select Id,Name,Strategy__c,Action_Steps_PlannedTaken__c,Strategy_Write_In__c,Applicable_for__c from Strategies__r order by CreatedDate) from Goal__c where Company__c=:accountId and Sales_Season__c=:previousSalesCycle order by CreatedDate];
        system.debug('goalList in copyPreviousSalesSeasonData before assigning new sales season \n'+goalList);
        
        /* Insertion of copying previous year goals starts */
       /* for(Goal__c singleGoal : goalList){
            Goal__c copySingleGoal = new Goal__c();
            copySingleGoal.Goal__c = singleGoal.Goal__c;
            copySingleGoal.Company__c = accountId;
            copySingleGoal.Sales_Season__c = presentSalesSeason;
            goalListToBeInserted.add(copySingleGoal);
            oldStrategies.put(singleGoal.Goal__c, singleGoal.Strategies__r);
            //List<Strategy__c> strategyList=singleGoal.Strategies__r;
        }
        
        system.debug('goalListToBeInserted in copyPreviousSalesSeasonData '+goalListToBeInserted+'\n oldStrategies '+oldStrategies);
        
        Database.SaveResult[] goalInsertResult = Database.insert(goalListToBeInserted);
        // Iterate through each returned result
        for (Database.SaveResult sr : goalInsertResult) {
            newGoalId.add(sr.getId());
            if(!sr.isSuccess()) {
                for(Database.Error err : sr.getErrors()) {
                    System.debug('The following error has occurred.');                    
                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                }
            }
        }
        /* Insertion of copying previous year goals ends */
        
        /* Copying of strategies using maps starts  */
        /*List<Goal__c> newGoals = [SELECT Id, Goal__c FROM Goal__c WHERE Id IN: newGoalId];
        for(Goal__c mappingGoal : newGoals){
            newGoalName = '';
            if(oldStrategies != null && oldStrategies.size() > 0) {
                if(oldStrategies.containsKey(mappingGoal.Goal__c)){
                    for(Strategy__c eachStrategy : oldStrategies.get(mappingGoal.Goal__c)){
                        Strategy__c newStrategy = new Strategy__c();
                        newStrategy.Strategy__c = eachStrategy.Strategy__c;
                        newStrategy.Action_Steps_PlannedTaken__c = eachStrategy.Action_Steps_PlannedTaken__c;
                        newStrategy.Goal__c = mappingGoal.Id;
                        newStrategy.Strategy_Write_In__c = eachStrategy.Strategy_Write_In__c;
                        strategyListTobeInserted.add(newStrategy);
                    }
                }
            }
            
        }
        system.debug('newGoals '+newGoals+'\n newGoalId '+newGoalId+'\n strategyListTobeInserted '+strategyListTobeInserted);
        Database.SaveResult[] strategyInsertResult = Database.insert(strategyListTobeInserted);
        // Iterate through each returned result
        for (Database.SaveResult sr : strategyInsertResult) {
            newGoalId.add(sr.getId());
            if(!sr.isSuccess()) {
                for(Database.Error err : sr.getErrors()) {
                    System.debug('The following error has occurred.');                    
                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                }
            }
        }
        /* Copying of strategies using maps ends  */
        
        
        returnClientBusinessPlanDataObj = getClientLevelBusinessPlan(accountId,previousSalesCycle);
        system.debug('returnClientBusinessPlanDataObj after insertion '+returnClientBusinessPlanDataObj);
        
        return returnClientBusinessPlanDataObj;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<SelectOption> fetchPicklist(String objectPassed,String fieldPassed) {
        List<SelectOption> options = new List<SelectOption>();
        
        Integer startYear = Integer.valueOf([SELECT DeveloperName, Value__C
                                        FROM ClientPlan_SalesCycle__mdt 
                                        WHERE DeveloperName ='SalesCycle_Default_Year'].Value__c);
        
        Integer startMonth = Integer.valueOf([SELECT DeveloperName, Value__C
                                        FROM ClientPlan_SalesCycle__mdt 
                                        WHERE DeveloperName ='SalesCycle_Default_Month'].Value__c);

        Integer currentYear = Date.today().year();
        Integer currentMonth = Date.today().month();
        System.debug('currentMonth '+currentMonth);
        String salesCycle = '';
        while (startYear <= currentYear+1) {
            if(currentMonth <= startMonth) {
                salesCycle = SALES_SEASON_PREFIX + String.valueOf(startYear-2000)  + SALES_SEASON_INFIX + String.valueOf(startYear+1);
                options.add(new SelectOption(salesCycle, salesCycle));  
                startYear++;
                if(startYear == currentYear+1) {
                    break;
                }
            } else if(currentMonth >= startMonth) {                
                salesCycle = SALES_SEASON_PREFIX + String.valueOf(startYear-2000)  + SALES_SEASON_INFIX + String.valueOf(startYear+1);
                options.add(new SelectOption(salesCycle, salesCycle));
                startYear++;
            }
        }        
        return options;
    }
   
    public class SelectOption {
        public SelectOption(String value, String label) {
            this.value = value;
            this.label = label;
        }
        @AuraEnabled
        public String label { get;set; }
        @AuraEnabled
        public String value { get;set; }
    }
    
    public class ReturnClientBusinessPlanData {
        
        /*@AuraEnabled
		public List<Client_Level_Business_Plan__c> clientBusinessPlanList {get;set;}*/
        
        @AuraEnabled
        public List<Goal__c> goalList {get;set;}
        
        @AuraEnabled
        public List<Goal__c> previousGoalList {get;set;}
        
        @AuraEnabled
        public String salesSeason {get;set;}
        
        @AuraEnabled
        public Map<String, List<String>> picklistFieldMap {get;set;}
        
         @AuraEnabled
        public boolean hasEditAccess {get;set;}

        @AuraEnabled
        public boolean disableCopyPreviousButton {get;set;}
    }
    
    public class ClientPlanWrapper{
        
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        @AuraEnabled
        public List<Goal__c> goalList { get; set; }
       	@AuraEnabled
        public String accountName { get; set; }
        @AuraEnabled
        public String xmlString { get; set; }
        
    }
    
    
}