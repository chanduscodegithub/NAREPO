/**
 * @description       : 
 * @author            : Thanushree
 * @group             : 
 * @last modified on  : 02-12-2024
 * @last modified by  : Thanushree
**/
public with sharing class HomePageReportController {                
    @AuraEnabled
    public static WorkItemsClass_Wrapper getAccountReportData(Boolean OnLoad , Boolean OnFilter, String cmvcpfilter , String ownerfilter) {
        
        System.debug('getAccountsandOpportunities Start-->');
        WorkItemsClass_Wrapper workitem = new WorkItemsClass_Wrapper();
        try {           
            workitem = LoggedInUserData(cmvcpfilter,ownerfilter, workitem);
        } catch(Exception e){
            System.debug('Error occurred in getAccountsandOpportunities method - '+e);
        }
        
        System.debug('getAccountsandOpportunities End-->');
        System.debug('workitem-->'+workitem);
        return workitem;        
    }       
    
    @AuraEnabled
    public static WorkItemsClass_Wrapper LoggedInUserData(String cmvcpfilter, String ownerfilter, WorkItemsClass_Wrapper workitem) {
        
        System.debug('WorkItemsClass_Wrapper >> START');
        
        UHGMASOQLConstants uhgMASOQLConstantsObj = new UHGMASOQLConstants();
        
        cmvcpfilter = (cmvcpfilter != null) ? cmvcpfilter : '';
        ownerfilter = (ownerfilter != null) ? ownerfilter : '';        
        
        List<Account> accList = new List<Account>();
        String queryVal = '';
        
       // queryVal = 'SELECT Id,UHC_Medical_Members__c,UHC_Dental_Members__c,UHC_Vision_Members__c,Optum_Rx_Members__c,Primary_Consulting_Firm_Group_Formula__c,CM_SCE__r.Name,CMVPCRRVP__r.Name,RecordType.Name,Subtype__c FROM Account where (RecordType.Name=\'Existing Client\' OR RecordType.Name=\'Client Subsidiary\') AND (UHC_Medical_Members__c > 0 OR UHC_Dental_Members__c > 0 OR UHC_Vision_Members__c > 0) order by Primary_Consulting_Firm_Group_Formula__c nulls last';    
        queryVal = 'SELECT Id,UHC_Medical_Members__c,UHC_Dental_Members__c,UHC_Vision_Members__c,Optum_Rx_Members__c,Primary_Consulting_Firm_Group_Formula__c,CM_SCE__r.Name,CMVPCRRVP__r.Name,RecordType.Name,Subtype__c,Surest_Members__c FROM Account where (RecordType.Name=\'Existing Client\' OR RecordType.Name=\'Client Subsidiary\') AND (UHC_Medical_Members__c > 0 OR UHC_Dental_Members__c > 0 OR UHC_Vision_Members__c > 0 OR Optum_Rx_Members__c > 0 OR UHC_APP_Members__c > 0 OR UHC_CI_Members__c > 0 OR UHC_HI_Members__c > 0 OR UHC_Life_Members__c > 0 OR UHC_STD_Members__c > 0 OR UHC_LTD_Members__c > 0 OR Pet_Insurance_FIGO_Members__c > 0 OR Surest_Members__c > 0) order by Primary_Consulting_Firm_Group_Formula__c nulls last';                                    
        accList = Database.query(queryVal);   
       
        if(accList != null) {
            
            set<String> accSCESet = new set<String>();
            set<String> accCMVPCRRVPSet = new set<String>();
            
            set<String> consultingFirms = new set<String>();
            
            Map<String,set<String>> vpcrSCEMap = new Map<String,set<String>>();
            
            Map<String,set<Account>> resultMapByFirm = new Map<String,set<Account>>();
            
            Map<String,set<Account>> resultMapByBL = new Map<String,set<Account>>();
            Map<String,set<Account>> resultMapByBLSorted = new Map<String,set<Account>>();
            
            for(Account obj : accList) {
                if(vpcrSCEMap != null && vpcrSCEMap.size() > 0 && vpcrSCEMap.containsKey(obj.CMVPCRRVP__r.Name)) {
                    set<String> sceOwnersList = vpcrSCEMap.get(obj.CMVPCRRVP__r.Name);
                    sceOwnersList.add(obj.CM_SCE__r.Name);
                    vpcrSCEMap.put(obj.CMVPCRRVP__r.Name, sceOwnersList);
                } else {
                    set<String> sceOwnersList = new set<String>();
                    sceOwnersList.add(obj.CM_SCE__r.Name);
                    vpcrSCEMap.put(obj.CMVPCRRVP__r.Name, sceOwnersList);
                }
                
                accSCESet.add(obj.CM_SCE__r.Name);
                accCMVPCRRVPSet.add(obj.CMVPCRRVP__r.Name);
                
                if(resultMapByFirm != null && resultMapByFirm.size() > 0 && resultMapByFirm.containsKey(obj.Primary_Consulting_Firm_Group_Formula__c)) {
                    set<Account> listByFirm = resultMapByFirm.get(obj.Primary_Consulting_Firm_Group_Formula__c);
                    listByFirm.add(obj);
                    resultMapByFirm.put(obj.Primary_Consulting_Firm_Group_Formula__c, listByFirm);
                } else {
                    set<Account> listByFirm = new set<Account>();
                    listByFirm.add(obj);
                    resultMapByFirm.put(obj.Primary_Consulting_Firm_Group_Formula__c, listByFirm);
                }
                
                if(resultMapByBL != null && resultMapByBL.size() > 0 && resultMapByBL.containsKey(obj.Subtype__c)) {
                    set<Account> listByBL = resultMapByBL.get(obj.Subtype__c);
                    listByBL.add(obj);
                    resultMapByBL.put(obj.Subtype__c, listByBL);
                } else {
                    set<Account> listByBL = new set<Account>();
                    listByBL.add(obj);
                    resultMapByBL.put(obj.Subtype__c, listByBL);
                }
                //consultingFirms.add(obj.Primary_Consulting_Firm_Group_Formula__c);              
            }
            List<String> resultListByBLSorted = new List<String>();
			resultListByBLSorted.addAll(resultMapByBL.keySet());
			resultListByBLSorted.sort();
            for(String key: resultListByBLSorted){
                resultMapByBLSorted.put(key, resultMapByBL.get(key));
            }
            
            List<String> accCMVPCRRVPSetSorted = new List<String>(accCMVPCRRVPSet);
			accCMVPCRRVPSetSorted.sort();
            List<String> accSCESetSorted = new List<String>(accSCESet);
			accSCESetSorted.sort();
            workitem.resultMapByFirm = resultMapByFirm;
            workitem.resultMapByBL = resultMapByBLSorted;
            if(accSCESetSorted !=null && accSCESetSorted.size() > 0) {
                workitem.cmSCE_PickList = accSCESetSorted;
            }
            if(accCMVPCRRVPSetSorted != null && accCMVPCRRVPSetSorted.size() > 0){
                workitem.cmVPCRRVP_PickList = accCMVPCRRVPSetSorted;
            }
            if(vpcrSCEMap !=null && vpcrSCEMap.size() > 0) {
                workitem.cmVPCRRVP_SCE_Map =vpcrSCEMap;
            }                   
        }       
        System.debug('WorkItemsClass_Wrapper >> END');
        
        return workitem;
        
    }       
    
    public class WorkItemsClass_Wrapper {               
               
        @AuraEnabled
        public List<String> cmSCE_PickList { get;set; }
        
        @AuraEnabled
        public List<String> cmVPCRRVP_PickList { get;set; }
        
        @AuraEnabled
        public Map<String,set<String>> cmVPCRRVP_SCE_Map { get;set; }
               
        @AuraEnabled
        public Map<String,set<Account>> resultMapByFirm { get;set; }
        
        @AuraEnabled
        public Map<String,set<Account>> resultMapByBL { get;set; }
    }
}