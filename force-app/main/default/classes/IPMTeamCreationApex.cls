public with sharing class IPMTeamCreationApex {
    
    private static final List<String> IPM_ROLES_PICKLIST = getActiveRoles();
    
    @InvocableMethod(label='IPM Teams Creation' description='Creating IPM Team for a project from associated Company(Company Contacts, National Accounts and Service AMT) Records')
    public static void IPTeamCreationForProject(invocableVariablesClass[] IpmAndCompanyIds){
        
        String customerRole = 'Customer';
        String vendorRole = 'Vendor';
        String amtRole = 'Senior Client Manager';
        String amtTitleSCE = 'Strategic Client Executive';
        String surestCMSCE ='Surest Account Partner';
        String clientManager = 'Client Manager';
        String contactStatus = 'Active';
        Set<ID> companyIdsList = new Set<Id>();
        List<ID> projectIdsList = new List<Id>();
        List<IPM_Team__c> ipmTeamToBeInserted = new List<IPM_Team__c>();
        
        for(invocableVariablesClass invocableVariable : IpmAndCompanyIds){
            companyIdsList.addall(invocableVariable.companyIds);
            projectIdsList.addall(invocableVariable.projectIds);
        }
        
        Date currentDate = System.today();
        List<Account> accountsList = [SELECT Id, Name,
                                      (SELECT Id FROM Project_Templates__r),
                                      
                                      (SELECT Id, First_Name__c, Last_Name__c, Contact_Role__c FROM Service_AMT__r 
                                       WHERE (Case_Management_End_Date__c = null or Case_Management_End_Date__c >= :currentDate)),
                                      
                                      (SELECT Id, Name, Last_Name__c, Job_Title__c FROM CM_Account_Team_Historys__r 
                                       WHERE (Job_Title__c='Strategic Client Executive' )AND (Case_Management_End_Date__c = null or Case_Management_End_Date__c >= :currentDate)),
                                      
                                      (SELECT Id, FirstName, LastName, Title, status__c FROM Contacts)
                                      FROM Account 
                                      WHERE Id IN:companyIdsList];
        
        
        if(accountsList != null && accountsList.size() > 0) {
            
            for(Account acc :accountsList) {
                
                List<Project_Template__c> ipmList = acc.Project_Templates__r;
                List<CM_Account_Team_History__c> naSalesTeamList = acc.CM_Account_Team_Historys__r;
                List<Service_AMT__c> serviceAMTList = acc.Service_AMT__r;
                List<Contact> companyContactsList = acc.Contacts;
                
                if(projectIdsList != null && projectIdsList.size() > 0 && ipmList != null && ipmList.size() > 0) {
                    
                    for(Project_Template__c ipm : ipmList) {
                        if(projectIdsList.contains(ipm.Id)) {
                            
                            if(naSalesTeamList != null && naSalesTeamList.size() > 0){
                                for(CM_Account_Team_History__c amt : acc.CM_Account_Team_Historys__r) {
                                    if(IPM_ROLES_PICKLIST.contains(amt.Job_Title__c)){
                                        IPM_Team__c ipmTeam = new IPM_Team__c();
                                        ipmTeam.Project_Template__c = ipm.Id;
                                        ipmTeam.First_Name__c = amt.Name;
                                        ipmTeam.Last_Name__c = amt.Last_Name__c;
                                        ipmTeam.IPM_Roles__c  = amt.Job_Title__c;
                                        ipmTeamToBeInserted.add(ipmTeam);
                                    }
                                } 
                            }
                            
                            if(serviceAMTList != null && serviceAMTList.size() > 0){
                                for(Service_AMT__c amt : acc.Service_AMT__r) {
                                    //if(ipmteamRoles.Contains(amt.Contact_Role__c)){ AMT Roles and IPM Roles are using same global picklist. conditin not required
                                    //&& IPM_ROLES_PICKLIST.contains(amtRole) removed.
                                    if(amt.Contact_Role__c != amtRole  && amt.Contact_Role__c != surestCMSCE  && IPM_ROLES_PICKLIST.contains(amt.Contact_Role__c)){
                                        IPM_Team__c ipmTeam = new IPM_Team__c();
                                        ipmTeam.Project_Template__c = ipm.Id;
                                        ipmTeam.First_Name__c = amt.First_Name__c;
                                        ipmTeam.Last_Name__c = amt.Last_Name__c;
                                        ipmTeam.IPM_Roles__c  = amt.Contact_Role__c;
                                        ipmTeamToBeInserted.add(ipmTeam);
                                        
                                    }
                                    if(amt.Contact_Role__c == amtRole && IPM_ROLES_PICKLIST.contains(amtRole)){
                                        IPM_Team__c ipmTeam2 = new IPM_Team__c();
                                        ipmTeam2.Project_Template__c = ipm.Id;
                                        ipmTeam2.First_Name__c = amt.First_Name__c;
                                        ipmTeam2.Last_Name__c = amt.Last_Name__c;
                                        ipmTeam2.IPM_Roles__c  = clientManager;
                                        ipmTeamToBeInserted.add(ipmTeam2);
                                    }
                                     if(amt.Contact_Role__c == surestCMSCE && IPM_ROLES_PICKLIST.contains(surestCMSCE)){
                                        IPM_Team__c ipmTeam3 = new IPM_Team__c();
                                        ipmTeam3.Project_Template__c = ipm.Id;
                                        ipmTeam3.First_Name__c = amt.First_Name__c;
                                        ipmTeam3.Last_Name__c = amt.Last_Name__c;
                                        ipmTeam3.IPM_Roles__c  = surestCMSCE;
                                        ipmTeamToBeInserted.add(ipmTeam3);
                                    }
                                } 
                            }
                            
                            if(companyContactsList != null && companyContactsList.size() > 0){
                                for(Contact con : acc.Contacts) {
                                    if(con.status__c == contactStatus && IPM_ROLES_PICKLIST.contains(customerRole)){
                                        IPM_Team__c ipmTeam = new IPM_Team__c();
                                        ipmTeam.Project_Template__c = ipm.Id;
                                        ipmTeam.First_Name__c = con.FirstName;
                                        ipmTeam.Last_Name__c = con.LastName;
                                        ipmTeam.IPM_Roles__c  = customerRole; 
                                        ipmTeamToBeInserted.add(ipmTeam);
                                    }
                                }
                                
                            }
                            
                            if(IPM_ROLES_PICKLIST.contains(customerRole)){
                                IPM_Team__c ipmTeamCustomer = new IPM_Team__c();
                                ipmTeamCustomer.Project_Template__c = ipm.Id;
                                ipmTeamCustomer.First_Name__c = acc.Name;
                                ipmTeamCustomer.IPM_Roles__c  = customerRole;
                                ipmTeamToBeInserted.add(ipmTeamCustomer);
                            }
                            
                            if(IPM_ROLES_PICKLIST.contains(vendorRole)){
                                IPM_Team__c ipmTeamVendor = new IPM_Team__c();
                                ipmTeamVendor.Project_Template__c = ipm.Id;
                                ipmTeamVendor.IPM_Roles__c  = vendorRole;
                                ipmTeamToBeInserted.add(ipmTeamVendor);
                            }
                            
                        }                  
                    }
                }                
            }
        }
        
        if(ipmTeamToBeInserted != null && ipmTeamToBeInserted.size() > 0) {
            insert as user ipmTeamToBeInserted;
        }
    }
    
    private static List<String> getActiveRoles(){
       List<String> pickListValuesList= new List<String>();
		Schema.DescribeFieldResult fieldResult = IPM_Team__c.IPM_Roles__c.getDescribe();
		List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
		for( Schema.PicklistEntry pickListVal : ple){
			pickListValuesList.add(pickListVal.getLabel());
            system.debug(pickListVal.getLabel());
		}     
        
		return pickListValuesList;
    }
    
    public class invocableVariablesClass{
        
        @InvocableVariable
        Public List<ID> projectIds;
        
        @InvocableVariable
        Public List<ID> companyIds;
    }
    
}