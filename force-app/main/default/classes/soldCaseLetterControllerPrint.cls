public with Sharing class soldCaseLetterControllerPrint {

 /*   public SoldCaseLetterWrapper soldCaseLetterWrapper { get; set; }
    public Boolean isPdf{get;private set;}
    public String ContentTypeValue{get;private set;}
    
    public soldCaseLetterControllerPrint() {
        String membershipActivityId = ApexPages.currentPage().getParameters().get('membershipActivityId');
        
         soldCaseLetterWrapper = getSoldCaseDetails(membershipActivityId);
        map<String,String> UrlParameterMap = ApexPages.currentPage().getParameters();
        for(String str:UrlParameterMap.keySet()){
            if(str =='wordReport'){
                this.isPdf=true;
            }
        }
        
        if(this.isPdf == true){
            this.ContentTypeValue = 'application/msword#';
            this.ContentTypeValue += this.getWordFileName()+'.doc';
        }
    }
    
    public String getFormattedDate() {
        Date datetoday = System.today();
        String monthStr = (datetoday.month() < 10 ? '0' : '') + datetoday.month();
        String dayStr = (datetoday.day() < 10 ? '0' : '') + datetoday.day();
        String yearStr = String.valueOf(datetoday.year());        
        return monthStr + '/' + dayStr + '/' + yearStr;
    }
    
     public String getWordFileName() {         
         String sanitizedName = soldCaseLetterWrapper.soldCaseLetterQuery.Name.replaceAll('[\\.,&\\+\\/\\-]', '_');
         date datetoday = System.today();
         String monthStr = (datetoday.month() < 10 ? '0' : '') + datetoday.month();
         String dayStr = (datetoday.day() < 10 ? '0' : '') + datetoday.day();
         String yearStr = String.valueOf(datetoday.year());         
         String formattedDate = monthStr + '_' + dayStr + '_' + yearStr + '_';         
         String docName = 'UHC_ '+ formattedDate + sanitizedName;
        return docName;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static SoldCaseLetterWrapper getSoldCaseDetails(String membershipActivityId){
        SoldCaseLetterWrapper soldCaseLetterWrapper = new SoldCaseLetterWrapper();
        Opportunity soldCaseLetterQuery = null;
        
        soldCaseLetterQuery = [SELECT Id,Name,EffectiveDate__c, AccountId, OwnerId, Primary_Consulting_Firm__c,
                               Account.Name, Owner.Name, Primary_Consulting_Firm__r.Name from Opportunity where Id =: membershipActivityId];
        soldCaseLetterWrapper.soldCaseLetterQuery = soldCaseLetterQuery;
        
        return soldCaseLetterWrapper;
    }
    
    
    public class SoldCaseLetterWrapper{
      @AuraEnabled
      public Opportunity soldCaseLetterQuery {get; set;}  
    }   */
    
}