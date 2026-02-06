public class SalesIssuesApexClass {
    
    @AuraEnabled
    public static wrapLists getOpenClosedCases(Id accountId){
        list<Case> openList = new list<Case>();
        list<Case> closedList = new list<Case>();
        List<case> openPartialList =  new List<Case>();
        List<case> closePartialList =  new List<Case>();
        for(Case caseObj : [SELECT Id,Status,Owner.Name,Category__c,Visibility__c,Priority,Extended_Description__c,CreatedDate,ClosedDate,Case_Screenshots__c,Target_Completion__c,Issue_ID__c,RecordType.DeveloperName, CaseNumber FROM Case WHERE AccountId = : accountId And RecordType.DeveloperName !='ETS_BE_Request' And Category__c != 'service plan' Order By Priority Desc]){
            if(caseObj.Status == 'Open'){
                openList.add(caseObj);  
                if(openPartialList.size() < 5){
                    openPartialList.add(caseObj);
                }
                //System.debug('open Case List'+openList);
            } 
            else if(caseObj.Status == 'Closed'){
                closedList.add(caseObj);
                if(closePartialList.size() < 5){
                    closePartialList.add(caseObj);
                }
                System.debug('open Case List'+closedList);
            }
            
        }	
        wrapLists wrap = new wrapLists(openList, closedList,openPartialList,closePartialList);
        System.debug('Cases -->'+wrap.openCaseList);
        System.debug ('Closed Cases -->'+wrap.closedCaseList);
        return wrap;
        
    }
    public class wrapLists {
        @AuraEnabled
        public list<Case> openCaseList;
        
        @AuraEnabled
        public list<Case> closedCaseList;
        
        @AuraEnabled
        public list<Case> openCasePartialList;
        
        @AuraEnabled
        public list<Case> closeCasePartialList;
        
        public wrapLists(list<Case> openCsList, list<Case> closedCsList,list<Case> openCasePartialList, list<Case> closeCasePartialList){
            this.openCaseList = openCsList; 
            this.closedCaseList = closedCsList;
            this.openCasePartialList = openCasePartialList; 
            this.closeCasePartialList = closeCasePartialList;
        }
    }
}