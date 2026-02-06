public with sharing class SalesDebriefPrintCtrl {
    public List<SalesDebriefPrintWrapper> sdpwList{get;set;}
    public String accountName{get;set;}
    public String membershipActivityName{get;set;}
    public Integer effectiveDateYear{get;set;}
    public DateTime todayDate{get;set;}
    public String salesDebriefType{get;set;}
    
    public Double offset{
        get{
            TimeZone tz = UserInfo.getTimeZone();
            //Milliseconds to Day
            return tz.getOffset(DateTime.now()) / (1000 * 3600 * 24.0);
        }
    }
    
    //Constructor. Queries Print Data from Sales_Debrief__c object and deserializes it.
    public SalesDebriefPrintCtrl(){
        //system.debug('sdpwList '+sdpwList);
        String printData;
        sdpwList = new List<SalesDebriefPrintWrapper>();
        todayDate = System.now();
        List<Opportunity> oppList = new List<Opportunity>();
        String oppRecordId = ApexPages.currentPage().getParameters().get('Id');
        String printData1 = [SELECT Id,Print_Data__c FROM Sales_Debrief__c WHERE Membership_Activity__c =: String.escapeSingleQuotes(oppRecordId) LIMIT 1][0].Print_Data__c;
        String printData2 = [SELECT Id,Print_Data_2__c FROM Sales_Debrief__c WHERE Membership_Activity__c =: String.escapeSingleQuotes(oppRecordId) LIMIT 1][0].Print_Data_2__c;
        
        if(printData2 != null){
            printData = printData1+printData2;
            system.debug('printData if '+printData);
        }
        else{
            printData = printData1;
            system.debug('printData else '+printData);
        }
        
        oppList = [SELECT id,Name,EffectiveDate__c,Sales_Season1__c,Account.Name,Sales_Debrief__c,Sales_Debrief_Override__c FROM Opportunity WHERE Id =: oppRecordId LIMIT 1];
        accountName = oppList[0].Account.Name;
        membershipActivityName = oppList[0].Name;
        effectiveDateYear = Integer.valueOf(oppList[0].Sales_Season1__c.substring(3));
        System.debug(oppList[0].Sales_Debrief_Override__c);
        if(oppList[0].Sales_Debrief_Override__c!=null){
            salesDebriefType = oppList[0].Sales_Debrief_Override__c;
        }else
        salesDebriefType = oppList[0].Sales_Debrief__c;
        
        sdpwList = new List<SalesDebriefPrintWrapper>();
        sdpwList = (List<SalesDebriefPrintWrapper>)JSON.deserialize(printData,List<SalesDebriefPrintWrapper>.class);
        
    }
    
    public class SalesDebriefPrintWrapper {
        public String sectionName{get;set;}
        public String question{get;set;}
        public String answer{get;set;}
        public String writeInValue{get;set;}
        public String shortForm{get;set;}
        public String apiName{get;set;}
        public String otherContent{get;set;}
    }
}