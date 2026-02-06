@isTest
public class Task_DueDate_Trigger_TestClass {
    @isTest 
    public static void insertTask(){
        
        Id TaskRecordTypeId = Schema.SObjectType.Task.getRecordTypeInfosByDeveloperName().get('Quality').getRecordTypeId();
        
        Account acc = new Account(Name = 'TestAcct',Subtype__c = 'National Accounts - East',Type ='National Accounts Client');
        insert acc;
       
        Case caseInsert = new Case();
        caseInsert.AccountId = acc.Id;
        caseInsert.Sub_Category__c = 'Change';
        caseInsert.RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Quality').getRecordTypeId();
        insert caseInsert;
        
        Task task = new Task();
        
        task.RecordTypeId=TaskRecordTypeId;
        task.Priority = 'Low';
        task.Subject = 'BTB QA';    
        task.Status = 'Open';
       	task.RecordTypeId = TaskRecordTypeId;  
        task.WhatId =  caseInsert.Id;
        task.Number_of_New_Sets_ID_Cards__c = 10;
        
        insert task;
   
    }
    
     @isTest 
    public static void updateTask(){
        
        Id TaskRecordTypeId = Schema.SObjectType.Task.getRecordTypeInfosByDeveloperName().get('Quality').getRecordTypeId();
        
         Account acc = new Account(Name = 'TestAcct',Subtype__c = 'National Accounts - East',Type ='National Accounts Client');
        insert acc;
       
        Case caseInsert = new Case();
        caseInsert.AccountId = acc.Id;
        caseInsert.Sub_Category__c = 'Change';
        caseInsert.RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Quality').getRecordTypeId();
        insert caseInsert;
        
        Task task = new Task();
        
        task.RecordTypeId=TaskRecordTypeId;
        task.Priority = 'Low';
        task.Subject = 'BTB QA';    
        task.Status = 'Open';
       	task.RecordTypeId = TaskRecordTypeId;  
		task.WhatId =  caseInsert.Id;        
        task.Number_of_New_Sets_ID_Cards__c = 10;
        
        insert task;
        
        List<User> userList = [Select Id,Name from User];
        RecursiveTriggerHandler.isFirstTime = true;
        task.Subject = 'BTB/SBC QA';
        
        update task;
        
         RecursiveTriggerHandler.isFirstTime = true;
        
        task.OwnerId = userList[1].Id;
        
        update task;
   
    }
}