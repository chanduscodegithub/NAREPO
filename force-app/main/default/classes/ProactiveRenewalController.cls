public without sharing class ProactiveRenewalController {
    
    @AuraEnabled
    public static ProactiveRenewalDataWrapper getProactiveRenewalData(String salesCycle,String sortByColumnName, String sortByOrder,String sortSectionName,String filterBySCE,String filterByCompanyName){ 
        system.debug('getProactiveRenewalData()-- start');
        system.debug('salesCycle==>'+salesCycle);
        system.debug('sortByColumnName==>'+sortByColumnName);
        system.debug('sortByOrder==>'+sortByOrder);
        system.debug('sortSectionName==>'+sortSectionName);
        system.debug('filterBySCE==>'+filterBySCE);
        system.debug('filterByCompanyName==>'+filterByCompanyName);
        ProactiveRenewalDataWrapper proactiveRenewalDataWrppr = new ProactiveRenewalDataWrapper();
        
        
        try{ 
            String loggedInUserId=UserInfo.getUserId();
            List<Opportunity> opportunityList;
            List<String> salesCycleValueList=new List<String>();
            String salesCycleValue=salesCycle;
            String srtByColmnName=sortByColumnName;
            String srtByOrdr=sortByOrder;
            
            
            Map<String,String> icmReportSettingMap=new Map<String,String>();
            List<String> lst=new List<String>();
            lst.add('Report_Default_Month');
            lst.add('Report_Start_Year');
            
            List<ICM_Report_Setting__mdt> icmReportSettingList=[Select DeveloperName,Value__c from ICM_Report_Setting__mdt where
                                                               DeveloperName in: lst];
            
            for(ICM_Report_Setting__mdt eachICMReportSetting:icmReportSettingList){
                icmReportSettingMap.put(eachICMReportSetting.DeveloperName,eachICMReportSetting.Value__c);
            }
            
            String queryStr='SELECT Id,Name,AccountId,Account.Name,EffectiveDate__c,Sold_Retained_Members__c,Proactive_Renewal_Retention__c,'+
                    		'Proactive_Renewal_Incentive_Status__c,SCE__c,SCE__r.Name,OwnerId,Owner.Name,CM_VPCR_RVP__c,Account.CMVPCRRVP__c,'+
                			'Account.Owner.Name,Account.OwnerId,GL_Membership_as_of_the_Effective_Date__c,GL_Membership_One_Year_Prior__c'+
                    		' from Opportunity where (Proactive_Renewal_Incentive_Status__c like \'%Pending Qualification%\' or Proactive_Renewal_Incentive_Status__c like \'%Fully Validated%\') and ';
                    		
            if(sortSectionName==''){
                queryStr=queryStr+'CM_VPCR_RVP__c=:loggedInUserId';
            }
            if(sortSectionName=='Current'){
                queryStr=queryStr+'(CM_VPCR_RVP__c=:loggedInUserId and Account.CMVPCRRVP__c=:loggedInUserId)';
            }else if(sortSectionName=='Previous'){
                queryStr=queryStr+'(CM_VPCR_RVP__c=:loggedInUserId and Account.CMVPCRRVP__c!=:loggedInUserId)';
            }
            
            if(filterBySCE!=null && filterBySCE!=''){
                queryStr=queryStr+' and Account.Owner.Name=:filterBySCE';
            }
            if(filterByCompanyName!=null && filterByCompanyName!=''){
                queryStr=queryStr+' and Account.Name=:filterByCompanyName';
            }
            
            
            
            if(salesCycle==''){
                
                
                Date todayDate=system.today();
                               
                String defaultSalesCycle='';

                defaultSalesCycle=GrowthIncentiveCompensationController.getDefaultSalesCycle(icmReportSettingMap.get('Report_Start_Year'),icmReportSettingMap.get('Report_Default_Month'));
               
                
                salesCycleValueList.add('IY '+string.valueof(date.parse('1/1/'+defaultSalesCycle.substring(2,4)).year()));
                salesCycleValueList.add('1/1/'+string.valueof(date.parse('1/1/'+defaultSalesCycle.substring(defaultSalesCycle.length()-2,defaultSalesCycle.length())).year()));
                System.debug('salesCycleValueList==>'+salesCycleValueList);
                
                queryStr=queryStr+' and Sales_Cycle1__c In: salesCycleValueList Order By '+srtByColmnName+' '+srtByOrdr;
                
                if(sortSectionName==''){
                    queryStr=queryStr+',Name '+sortByOrder;
                }
                
                System.debug('queryStr Proactive==>'+queryStr);
                opportunityList=Database.query(queryStr);
                
                System.debug('opportunityList length==>'+opportunityList.size());
                System.debug('opportunityList==>'+opportunityList);
                
                salesCycleValue=defaultSalesCycle;
                
            }else{
                
                salesCycleValueList.add('IY '+string.valueof(date.parse('1/1/'+salesCycle.substring(2,4)).year()));
                salesCycleValueList.add('1/1/'+string.valueof(date.parse('1/1/'+salesCycle.substring(salesCycle.length()-2,salesCycle.length())).year()));
                System.debug('salesCycleValueList==>'+salesCycleValueList);
                
            	queryStr=queryStr+' and Sales_Cycle1__c In: salesCycleValueList Order By '+srtByColmnName+' '+srtByOrdr;
                if(sortSectionName==''){
                    queryStr=queryStr+',Name '+sortByOrder;
                }
                System.debug('queryStr Proactive==>'+queryStr);
                opportunityList=Database.query(queryStr);
                
                System.debug('opportunityLineItemList==>'+opportunityList);
            
            }
            
            
            
            proactiveRenewalDataWrppr.opportunityList=opportunityList;
            proactiveRenewalDataWrppr.salesCycle=salesCycleValue;
            
            Map<String,List<String>> picklistValueMap = new Map<String,List<String>>();
            
            picklistValueMap.put('SalesCycle',GrowthIncentiveCompensationController.getSalesCyclePicklist(icmReportSettingMap.get('Report_Start_Year')));
            
            proactiveRenewalDataWrppr.picklistFieldMap=picklistValueMap;
            proactiveRenewalDataWrppr.loggedInUserTimeZone=UserInfo.getTimeZone().getID();
            proactiveRenewalDataWrppr.loggedInUserName=UserInfo.getName();
            proactiveRenewalDataWrppr.loggedInUserId=UserInfo.getUserId();
            
            
            
        }catch(Exception e){
            System.debug('Exception occured in getProactiveRenewalData() method==> '+e.getMessage());
        }
        system.debug('getProactiveRenewalData()-- end');
        return proactiveRenewalDataWrppr; 
    }
    
    
    public class ProactiveRenewalDataWrapper {
        
        @AuraEnabled
        public List<Opportunity> opportunityList {get;set;}
        
        @AuraEnabled
        public String salesCycle {get;set;}
        
        @AuraEnabled
        public Map<String, List<String>> picklistFieldMap {get;set;}
        
        @AuraEnabled
        public String loggedInUserName {get;set;}
        
         @AuraEnabled
        public String loggedInUserId{ get; set; }
        @AuraEnabled
        public String loggedInUserTimeZone{ get; set; }
        
        @AuraEnabled
        public String loggedInUserRole{ get; set; }
     
    }

}