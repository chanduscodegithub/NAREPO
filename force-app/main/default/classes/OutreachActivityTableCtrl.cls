/***************************************************************************************************** 
Name: OutreachActivityTableApexcls  
====================================================== 
======================================================
Purpose: Fetching the data for Outreach/Activity Table in Prior Client Details Tab.
====================================================== 
======================================================  
History 
------- 
VERSION     AUTHOR                DATE                 DETAIL                       
1.0 -       Vignesh             05/02/2024          INITIAL DEVELOPMENT           
******************************************************************************************************
*/


public with sharing class OutreachActivityTableCtrl {
    
    @AuraEnabled(cacheable=true)
    public static AccountWrapper fetchAccountData(string recId) {
        
        
        List<Account> accounts = [SELECT Id, Name,Cancellation_Date__c FROM Account where Id = :recId AND Cancellation_Date__c != null WITH USER_MODE];
        if (accounts.isEmpty()) {
            return null;
        }
        Date cancellationDate = accounts[0].Cancellation_Date__c;
        
        List<Event> events = [SELECT Id, Who.Name,WhatId,What.Name, Subject,EndDate,CreatedBy.Name, Type, ActivityDate,Action_Items__c, (select id, Relation.name, RelationId, EventId from EventRelations WHERE Relation.Type = 'Contact')  FROM Event WHERE ( AccountId =:recId)  AND EndDate >= :cancellationDate AND RecordType.Name =: 'Event CD Activities' WITH USER_MODE];
        
        List<Task> tasks = [SELECT Id, Who.Name, Subject,What.Name,WhatId, Type,CreatedBy.Name, ActivityDate, Action_Items__c, (select id, Relation.name, RelationId, TaskId from TaskRelations WHERE Relation.Type = 'Contact') FROM Task WHERE (AccountId =:recId) AND ActivityDate >= :cancellationDate AND RecordType.Name =: 'CD Activities' WITH USER_MODE];
        
        
        AccountWrapper aw =new AccountWrapper();
        aw.eventList =events;
        aw.taskList =tasks;
        return aw;        
        
    }
    
    public class AccountWrapper {
        @AuraEnabled
        public list<event> eventList;
        @AuraEnabled
        public list<task> taskList;
        
    }
    
    
}