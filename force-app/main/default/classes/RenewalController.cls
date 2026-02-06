public without sharing class RenewalController {
    public static String SALES_SEASON_PREFIX = 'IY';
    public static String SALES_SEASON_INFIX = ', 1/1/';
    
    @AuraEnabled
    public static List<ReturnProactiveData> proactiveRenewal(String SalesCycle,String sortByColumnName, String sortByOrder){
        Id curntUserId = UserInfo.getUserId();
        system.debug('current user id '+curntUserId);
        system.debug('inside proactive renewal method');
        List<ReturnProactiveData> proactiveWrapperList = new List<ReturnProactiveData>();
        List<Opportunity> oppList = new List<Opportunity>();
        List<String> salesCycleValueList=new List<String>();
        
        String pq = 'Pending Qualification';
        String fv = 'Fully Validated';
        Id currentUserId = UserInfo.getUserId();
        
        //-----------PARAMETERS-----------
        String salesCycleValue=SalesCycle;
        String srtByColmnName=sortByColumnName;
        String srtByOrdr=sortByOrder;
        //-----------PARAMETERS-----------
        
        if(srtByColmnName == 'Company__r.name' || srtByColmnName == 'Efective_Date__c' || srtByColmnName == 'Product_Line__c'){
            srtByColmnName = '';
            srtByOrdr = '';
        }
        
        Map<String,String> icmReportSettingMap=new Map<String,String>(); //custom mdt data is put in this map
        List<String> lst=new List<String>();
        lst.add('Report_Default_Month');
        lst.add('Report_Start_Year');
        system.debug('lst ' + lst);
        
        //Querying Report_Default_Month and Report_Start_Year from custom mdt
        List<ICM_Report_Setting__mdt> icmReportSettingList=[Select DeveloperName,Value__c from ICM_Report_Setting__mdt where
                                                            DeveloperName in: lst]; //querying value from MDT where Developer Name is in List 'lst'
        system.debug('icmReportSettingList ' + icmReportSettingList);
        //Querying Report_Default_Month and Report_Start_Year from custom mdt
        
        
        //iterating the custom mdt list and putting into map
        for(ICM_Report_Setting__mdt eachICMReportSetting:icmReportSettingList){ //iterating the MDT list
            icmReportSettingMap.put(eachICMReportSetting.DeveloperName,eachICMReportSetting.Value__c); //putting name and value in a map
        }
        //iterating the custom mdt list and putting into map
        
        system.debug('icmReportSettingMap -- ' + icmReportSettingMap);
        
        
        String proAct='SELECT Id,name,Account.Name,AccountId,EffectiveDate__c,Proactive_Renewal_Documents_Attached__c,Proactive_Renewal_Incentive_Status__c,Sold_Retained_Members__c,Proactive_Renewal_Retention__c,Sales_Cycle1__c,GL_Membership_One_Year_Prior__c,GL_Membership_as_of_the_Effective_Date__c '+
            'FROM Opportunity WHERE (Proactive_Renewal_Incentive_Status__c LIKE \'%' + pq+ '%\' OR Proactive_Renewal_Incentive_Status__c LIKE \'%' + fv + '%\') '+
            'AND OwnerId =:currentUserId';
        
        system.debug('proAct ' + proAct);
        
        //oppList = Database.query(proAct);
        
        
        if(salesCycle==''){ //if salesCycle is empty
            system.debug('inside if');
            
            String defaultSalesCycle='';
            defaultSalesCycle=GrowthIncentiveCompensationController.getDefaultSalesCycle(icmReportSettingMap.get('Report_Start_Year'), icmReportSettingMap.get('Report_Default_Month'));
            System.debug('defaultSalesCycle==>'+defaultSalesCycle);
            
            salesCycleValueList.add('IY '+string.valueof(date.parse('1/1/'+defaultSalesCycle.substring(2,4)).year()));
            salesCycleValueList.add('1/1/'+string.valueof(date.parse('1/1/'+defaultSalesCycle.substring(defaultSalesCycle.length()-2,defaultSalesCycle.length())).year()));
            System.debug('salesCycleValueList in if==>'+salesCycleValueList);
            
            srtByColmnName='Account.name';
            srtByOrdr='asc';
            
            proAct=proAct+' and Sales_Cycle1__c In: salesCycleValueList Order By '+srtByColmnName+' '+srtByOrdr;
            oppList=Database.query(proAct);
            system.debug('proAct ' + proAct);
            system.debug('oppList ' + oppList);
            
            salesCycleValue=defaultSalesCycle;
            system.debug('salesCycleValue in if '+salesCycleValue);
        }
        else if(salesCycle!='' && srtByColmnName=='' && srtByOrdr==''){
            system.debug('inside else if');
            system.debug('salesCycle ' + salesCycle);
            
            salesCycleValueList.add('IY '+string.valueof(date.parse('1/1/'+salesCycle.substring(2,4)).year()));
            salesCycleValueList.add('1/1/'+string.valueof(date.parse('1/1/'+salesCycle.substring(salesCycle.length()-2,salesCycle.length())).year()));
            System.debug('salesCycleValueList in else if==>'+salesCycleValueList);
            
            srtByColmnName='Account.name';
            srtByOrdr='asc';
            
            proAct=proAct+' and Sales_Cycle1__c In: salesCycleValueList Order By '+srtByColmnName+' '+srtByOrdr;            
            oppList=Database.query(proAct);
            system.debug('proAct ' + proAct);
            system.debug('oppList ' + oppList);
        }
        else{
            system.debug('inside else');
            system.debug('salesCycle ' + salesCycle);
            
            salesCycleValueList.add('IY '+string.valueof(date.parse('1/1/'+salesCycle.substring(2,4)).year()));
            salesCycleValueList.add('1/1/'+string.valueof(date.parse('1/1/'+salesCycle.substring(salesCycle.length()-2,salesCycle.length())).year()));
            System.debug('salesCycleValueList in else==>'+salesCycleValueList);
            
            proAct=proAct+' and Sales_Cycle1__c In: salesCycleValueList Order By '+srtByColmnName+' '+srtByOrdr;
            oppList=Database.query(proAct);
            system.debug('proAct ' + proAct);
            system.debug('oppList ' + oppList);
        }
        
        system.debug('oppList ' + oppList);
        
        if(oppList.size()>0){
            system.debug('oppList.size() ' + oppList.size());
            for(Opportunity opp : oppList){
                system.debug('inside mapping for');
                ReturnProactiveData rpd = new ReturnProactiveData();
                rpd.salesCycle = salesCycleValue;
                rpd.oppLink = '/'+ opp.Id; 
                
                if(opp.Account.Name != NULL){
                    rpd.CompanyName = opp.Account.Name;
                }
                if(opp.EffectiveDate__c != NULL){
                    rpd.EffectiveDate = opp.EffectiveDate__c.format();
                }
                if(opp.Proactive_Renewal_Incentive_Status__c != NULL){
                    rpd.IncentiveStatus = opp.Proactive_Renewal_Incentive_Status__c;
                }
                if(opp.Proactive_Renewal_Documents_Attached__c != NULL){
                    if(opp.Proactive_Renewal_Documents_Attached__c == TRUE){
                        rpd.AreDocumentsAttached = 'Yes';
                    }
                    else{
                        rpd.AreDocumentsAttached = 'No';
                    }
                    
                }
                if(opp.Sold_Retained_Members__c != NULL){
                    rpd.SoldRetainedMembers = opp.Sold_Retained_Members__c.intValue();
                }
                if(opp.Proactive_Renewal_Retention__c != NULL){
                    Integer retPer = opp.Proactive_Renewal_Retention__c.intValue();
                    rpd.RetentionPercentage = String.valueOf(retPer)+'%';
                    
                    //rpd.RetentionPercentage = opp.Proactive_Renewal_Retention__c.intValue();
                }
                if(opp.Name != NULL){
                    rpd.MembershipActivityName = opp.Name;
                }
                
                if(opp.GL_Membership_as_of_the_Effective_Date__c != null) {
                    rpd.GLMembershipAsOfTheEffectiveDate = Integer.valueOf(opp.GL_Membership_as_of_the_Effective_Date__c);
                } else {
                    rpd.GLMembershipAsOfTheEffectiveDate = 0;
                }
                system.debug('GLMembershipAsOfTheEffectiveDate '+opp.GL_Membership_as_of_the_Effective_Date__c);
                system.debug('GL_Membership_One_Year_Prior__c '+opp.GL_Membership_One_Year_Prior__c);
                if(opp.GL_Membership_One_Year_Prior__c != null) {
                    rpd.GLMembershipOneYearPrior = Integer.valueOf(opp.GL_Membership_One_Year_Prior__c);
                } else {
                    rpd.GLMembershipOneYearPrior = 0;
                }
                proactiveWrapperList.add(rpd);
            } //end of for
        } //end of if
        
        return proactiveWrapperList;
    }
    
    public class ReturnProactiveData {     
        @AuraEnabled
        public String oppLink {get;set;}
        
        @AuraEnabled
        public String salesCycle {get;set;}
        
        @AuraEnabled
        public String CompanyName {get;set;}
        
        @AuraEnabled
        public String EffectiveDate {get;set;}
        
        @AuraEnabled
        public String IncentiveStatus {get;set;}
        
        @AuraEnabled
        public String AreDocumentsAttached {get;set;}
        
        @AuraEnabled
        public Integer SoldRetainedMembers {get;set;}
        
        /*@AuraEnabled
        public Integer RetentionPercentage {get;set;}*/
        
        @AuraEnabled
        public String RetentionPercentage {get;set;}
        
        @AuraEnabled
        public String MembershipActivityName {get;set;}
        
        @AuraEnabled
        public Integer GLMembershipAsOfTheEffectiveDate {get;set;}
        
        @AuraEnabled
        public Integer GLMembershipOneYearPrior {get;set;}
    }
}