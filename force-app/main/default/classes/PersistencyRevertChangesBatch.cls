global class PersistencyRevertChangesBatch implements Database.Batchable<PolicyAccountMembership__c> {
    
    /*Date dateVal =date.today();
    Integer yearVal =dateVal.year();
    Integer monthVal =2;
    Integer numberOfDays = Date.daysInMonth(yearVal, 2);
    Date currLastDayOfMonth = Date.newInstance(yearVal, 2, numberOfDays);
    public Database.QueryLocator start(Database.BatchableContext bc) {
        string query ='Select Id,GLDate__c,AccountFirm__c,Prior_Business_Line__c,GL_Membership_Status__c,Business_Line__c,MembershipType__c,Prior_Year_GL_Membership__c,Transfer_In__c,Transfer_Out__c,Adjusted_Prior_Year_GL_Membership__c,Adjusted_Current_GL_Membership__c, GLMembership__c,Membership_Persistency__c,Override_Current_GL_Membership__c,Override_Membership_Persistency__c from PolicyAccountMembership__c where Name=\'Total GL Membership\' and MembershipType__c=\'Medical\' and  GL_Membership_Status__c!=\'Termed Business\'';
        query=query+' and GLDate__c='+currLastDayOfMonth;
        system.debug(query);
        return Database.getQueryLocator(query);*/
        
    Date dateVal =date.today();
    Integer yearVal =dateVal.year();
    Integer monthVal =2;
    Integer numberOfDays = Date.daysInMonth(yearVal, 2);
    Date currLastDayOfMonth = Date.newInstance(yearVal, 2, numberOfDays);
    global Iterable<PolicyAccountMembership__c> start (Database.BatchableContext BC) {
        list<PolicyAccountMembership__c> listOfPAM =new list<PolicyAccountMembership__c>();
        listOfPAM =[Select Id,GLDate__c,AccountFirm__c,GL_Membership_Status__c,Business_Line__c,MembershipType__c,Prior_Year_GL_Membership__c,Transfer_In__c,Transfer_Out__c,Adjusted_Prior_Year_GL_Membership__c,
                    Adjusted_Current_GL_Membership__c, GLMembership__c,Membership_Persistency__c,Override_Current_GL_Membership__c,Override_Membership_Persistency__c from PolicyAccountMembership__c 
                    where Name='Total GL Membership' and MembershipType__c='Medical' and GLDate__c=:currLastDayOfMonth];
        
        return listOfPAM;
     
    }
    
    public void execute(Database.BatchableContext bc, List<PolicyAccountMembership__c> scope){
        
        list<PolicyAccountMembership__c> listOfPAM =new list<PolicyAccountMembership__c>();
        list<PolicyAccountMembership__c> deleteList =new list<PolicyAccountMembership__c>();
        for(PolicyAccountMembership__c pam:scope){
            if(pam.GL_Membership_Status__c!='Termed Business'){
                pam.Transfer_In__c=null;
                pam.Transfer_Out__c =null;
                pam.Adjusted_Current_GL_Membership__c=null;
                pam.Adjusted_Prior_Year_GL_Membership__c =null;
                pam.Prior_Year_GL_Membership__c=null;
                pam.GL_Membership_Status__c=null;
                pam.Prior_Business_Line__c =null;
                listOfPAM.add(pam);
            }else if(pam.GL_Membership_Status__c=='Termed Business'){
                deleteList.add(pam);
            }
            
        }
        
        update listOfPAM;
        delete deleteList;
    }
    public void finish(Database.BatchableContext bc){
        
    }
}