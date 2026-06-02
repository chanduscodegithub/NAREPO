/*------------------------------------------------------------
 * Author:          Ashutosh
 * Company:         CRMIT
 * Description:     This class is used for generating and sending pdf of client survey    
 * History:
 * 2021-06-15
 * ------------------------------------------------------------*/
public with sharing class GenerateClientSurveyController {
   
    public String cmSCELastName{get;set;}
    public String cmSCEFirstName{get;set;}
    public String specialitySCEInFN{get;set;}
    public String specialitySCEInLN{get;set;}    
    public String CM_CMC_Validation_By{get;set;}
    public DateTime CM_CMC_Validation_DateTime{get;set;}
    public String SCE_Validation_By{get;set;}
    public DateTime SCE_Validation_DateTime{get;set;}
    public String accountName{get;set;}
    public List<Service_AMT__c> surveyAMTList{get;set;}
    public ProductMix__c productMix{get;set;}    
    public ClientSurveyCtrl.WorkItemsClass_Wrapper workItems{get;set;}
    public List<Contact> lstContact{get;set;}    
    public Map<String , List<TeamMembers>> roleVsMember{get;set;}
	public Set<String> roleSequence{get;set;}
    public String timeZoneShort{get;set;}
    public Boolean excludeSpecialtyBenefitsSCESurvey{get;set;}
    public Boolean showSpecialistSCE{get;set;} //Added vignesh
    public Double offset{get{
        TimeZone tz = UserInfo.getTimeZone();
        return tz.getOffset(DateTime.now()) / (1000 * 3600 * 24.0);
    }}
   
    /*------------------------------------------------------------------
    Author:         Ashutosh
    Name:           GenerateClientSurveyController()
    Description:    constructor method to get record
    Date:           2021-06-15
    -------------------------------------------------------------------*/
    public GenerateClientSurveyController(){
        
        String displayName = String.ValueOf(UserInfo.getTimeZone().getDisplayName());
        timeZoneShort = '';
        if(displayName.containsIgnoreCase('Eastern Daylight Time')){
        	timeZoneShort = 'EDT';
        }else if(displayName.containsIgnoreCase('Eastern Standard Time')){
            timeZoneShort = 'EST';
        }else if(displayName.containsIgnoreCase('Central Standard Time')){
            timeZoneShort = 'CST';
        }else if(displayName.containsIgnoreCase('Central Daylight Time')){
            timeZoneShort = 'CDT';
        }else if(displayName.containsIgnoreCase('Pacific Standard Time')){
            timeZoneShort = 'PST';
        }
        else if(displayName.containsIgnoreCase('Pacific Daylight Time')){
            timeZoneShort = 'PDT';
        }
        else if(displayName.containsIgnoreCase('India Standard Time')){
            timeZoneShort = 'IST';
        }
            
		
        String recordId = apexpages.currentpage().getparameters().get('recordId');
       
        surveyAMTList = new List<Service_AMT__c>();
        roleVsMember  = new Map<String , List<TeamMembers>>();
        /* Removed Static role Sequence value and fetched from Custom Metadata Types ****SHRUTI****START**** */
		/*roleSequence  = new Set<String>{'Specialty Benefits Consultant','Client Manager','Client Management Consultant','Service Account Manager',
                                        'UHC Medical Director','Clinical Account Executive','Health Analytics Consultant','Engagement Solutions Consultant',
                                        'UMR Client Manager','UMR Care Management Consultant','UMR Customer Specialist','UMR Plan Analyst',
                                        'OptumRx National Account Executive','Optum Client Executive/Manager','Rally Account Executive',
                                        'Retiree Account Executive','Retiree Client Manager','Retiree Service Account Manager'};*/
                                            
        
       
        
        lstContact = ClientSurveyCtrl.getContactRecords(recordId);
        for(Contact con:lstContact){
            if (con.Contact_Source__c != null) {
                
                // Split into list
                List<String> sources = con.Contact_Source__c.split(';');
                
                // Trim spaces (important before sorting)
                for (Integer i = 0; i < sources.size(); i++) {
                    sources[i] = sources[i].trim();
                }
                
                // Sort alphabetically
                sources.sort();
                
                // Join back with proper spacing
                con.Contact_Source__c = String.join(sources, '; ');
            }
            if(con.Correspondence_Type__c != null){
                con.Correspondence_Type__c = con.Correspondence_Type__c.replace(';','; ');
            }
             if(con.Correspondence_Type__c != null){
                 
                if (con.Correspondence_Type__c.containsIgnoreCase('Customer Survey - Primary')) {
                    
                    con.Correspondence_Type__c = 'Customer Survey - Primary';
                   
                } else if (con.Correspondence_Type__c.containsIgnoreCase('Customer Survey - Secondary')) {
                    
                    con.Correspondence_Type__c = 'Customer Survey - Secondary';
                    
                }
            	
            }
                
        }
        workItems  = ClientSurveyCtrl.getAccountsandOpportunities(true,false,'','','Name','ASC',recordId);
        
        roleSequence = new Set<String>();
        List<String> finalAMTRole = new List<String>();
        List < Roles_For_AcctTeamMembers_Section__mdt > fetchMeta =new List < Roles_For_AcctTeamMembers_Section__mdt >();
        List < Roles_For_AMT_SBC_Client_Survey__mdt > fetchMetaSBC =new List < Roles_For_AMT_SBC_Client_Survey__mdt >();
        if(workItems.getAMTList[0].Subtype__c!='Specialty Benefits Only'){
            fetchMeta = [SELECT Id, MasterLabel, AMT_Role__c, DeveloperName, Order__c FROM Roles_For_AcctTeamMembers_Section__mdt where active__c=true Order by Order__c ASC];
            for(Roles_For_AcctTeamMembers_Section__mdt amtRole:fetchMeta){
                roleSequence.add(amtRole.AMT_Role__c);
            }
        }
        else{
            fetchMetaSBC = [SELECT Id, MasterLabel, AMT_Role__c, DeveloperName, Order__c FROM Roles_For_AMT_SBC_Client_Survey__mdt where active__c=true Order by Order__c ASC];
            for(Roles_For_AMT_SBC_Client_Survey__mdt amtRole:fetchMetaSBC){
                roleSequence.add(amtRole.AMT_Role__c);
            }
        }
       // List < Roles_For_AcctTeamMembers_Section__mdt > fetchMeta = [SELECT Id, MasterLabel, AMT_Role__c, DeveloperName, Order__c FROM Roles_For_AcctTeamMembers_Section__mdt where active__c=true Order by Order__c ASC];
        /*for(Roles_For_AcctTeamMembers_Section__mdt amtRole:fetchMeta){
            roleSequence.add(amtRole.AMT_Role__c);
        }*/
        System.debug('roleSequence>>>>'+roleSequence);
        //roleSequence  = new Set<String>{finalAMTRole};
        /* ****SHRUTI****END**** */
        productMix	  = new ProductMix__c();
		
		Set<String> hideExcludeAMTCheckbox =  new Set<String>{'Client Manager','Client Management Consultant'};


        Set<String> primaryRoles = new Set<String>{'Client Manager','Client Management Consultant','Service Account Manager'};

        for(String role:roleSequence){
            TeamMembers teamTemp = new TeamMembers();
            teamTemp.isDummyRow = true;
            if(primaryRoles.contains(role)){
                teamTemp.grayOut = false;
            }else{
                teamTemp.grayOut = true;
            }
            roleVsMember.put(role, new List<TeamMembers>{teamTemp});
        }
        
      
        excludeSpecialtyBenefitsSCESurvey = workItems.getAMTList[0].Exclude_Specialty_Benefits_SCE_Survey__c;
        productMix = workItems.getCurrentProduct;
        cmsceFirstName = workItems.getAMTList[0].CM_SCE__r.FirstName;
        cmSCELastName  = workItems.getAMTList[0].CM_SCE__r.LastName;
        accountName	   = workItems.getAMTList[0].Name;
         showSpecialistSCE = workItems.getAMTList[0].Subtype__c=='Specialty Benefits Only'?false:true; //Added Vignesh
     
        if(workItems.getAMTList[0].Specialty_SCE__c != null){
           // String[] splits   = workItems.getAMTList[0].Specialty_SCE_Involved__c.split(' ');
           // specialitySCEInFN = splits[0];
           // specialitySCEInLN = splits[1];
           specialitySCEInFN =workItems.getAMTList[0].Specialty_SCE__r.FirstName;
            specialitySCEInLN =workItems.getAMTList[0].Specialty_SCE__r.LastName;
        }else{
            specialitySCEInFN = '';
            specialitySCEInLN = '';
        }
        surveyAMTList 	  = workItems.getAMTList[0].Service_AMT__r;
        
        CM_CMC_Validation_By 		= workItems.getAMTList[0].CM_CMC_Validation_By__r.Name;
        CM_CMC_Validation_DateTime  = workItems.getAMTList[0].CM_CMC_Validation_DateTime__c;
        SCE_Validation_By			= workItems.getAMTList[0].SCE_Validation_By__r.Name;
        SCE_Validation_DateTime 	= workItems.getAMTList[0].SCE_Validation_DateTime__c;
        
        for(Service_AMT__c amtObj : workItems.getAMTList[0].Service_AMT__r){
            system.debug(amtObj.Contact_Role__c);
            system.debug(roleSequence);
            if(amtObj.Contact_Role__c != null && roleSequence.contains(amtObj.Contact_Role__c)){
                
				TeamMembers objTemp = new TeamMembers();
				objTemp.Url 		= '/'+amtObj.Id;
				objTemp.firstName 	= amtObj.First_Name__c;
				objTemp.lastName 	= amtObj.Last_Name__c;
				objTemp.role 		= amtObj.Contact_Role__c;
                /* ****SHRUTI **** START **** */
				//objTemp.primary 	= amtObj.Primary__c ? 'Main' : '';
				objTemp.primary 	= amtObj.Primary__c;
                /* ****SHRUTI **** END **** */
                objTemp.exclude		= amtObj.Exclude_AMT_Role_from_Survey__c;
                objTemp.isDummyRow	= false;
				objTemp.grayOut     = amtObj.Primary__c;
                objTemp.ShowExcludeAMTCheckBox = !hideExcludeAMTCheckbox.contains(amtObj.Contact_Role__c);
                objTemp.grayOut = false;
				/*if (!primaryRoles.contains(amtObj.Contact_Role__c)) {
					objTemp.primary = '';
                    objTemp.grayOut = true;
				}else{
                    objTemp.grayOut = false;
                }*/
				
				if(roleVsMember.get(amtObj.Contact_Role__c).size() == 1 && roleVsMember.get(amtObj.Contact_Role__c)[0].isDummyRow){
                    roleVsMember.put(amtObj.Contact_Role__c, new List<TeamMembers>{objTemp});
                }else{
                    if(!amtObj.Primary__c){
                        roleVsMember.get(amtObj.Contact_Role__c).add(objTemp);
                    }else{
                        List<TeamMembers> temp = new List<TeamMembers>{objTemp};
                        temp.addAll(roleVsMember.get(amtObj.Contact_Role__c));
                        roleVsMember.put(amtObj.Contact_Role__c, temp);
                    }
                }
                
            }
        }
                    
    }
    
    public class TeamMembers{
        public String url{get;set;}
        public String firstName{get;set;}
        public String lastName{get;set;}
        public String role{get;set;}
        /* ****SHRUTI **** START **** */
        //public String primary{get;set;}
        public Boolean primary{get;set;}
        /* ****SHRUTI **** END **** */
        public Boolean isDummyRow{get;set;}
        public Boolean exclude{get;set;}
        public Boolean grayOut{get;set;}
        public Boolean ShowExcludeAMTCheckBox{get;set;}
    }

}