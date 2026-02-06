public without sharing class RetentionStatusController {
    public static String SALES_SEASON_PREFIX = 'IY';
    public static String SALES_SEASON_INFIX = ', 1/1/';
    @AuraEnabled(cacheable=true)
    public static List<SelectOption> fetchPicklist(String objectPassed,String fieldPassed) {
        List<SelectOption> options = new List<SelectOption>();
        
        Integer startYear = Integer.valueOf([SELECT DeveloperName, Value__C
                                             FROM ICM_Report_Setting__mdt 
                                             WHERE DeveloperName ='Report_Start_Year'].Value__c);
        
        Integer currentYear = Date.today().year();
        Integer currentMonth = Date.today().month();
        String salesCycle = '';
        while (startYear <= currentYear+1) {
            salesCycle = SALES_SEASON_PREFIX + String.valueOf(startYear-2000) + SALES_SEASON_INFIX + String.valueOf(startYear-1999);
            options.add(new SelectOption(salesCycle, salesCycle));
            startYear++;
        }
        
        return options;
    }
    
    /* @AuraEnabled
public static string fetchDefaultSalesSeason(){
Integer defaultMonth = Integer.valueOf([SELECT Value__C
FROM ICM_Report_Setting__mdt 
WHERE DeveloperName = 'Report_Default_Month'].Value__c);

Integer currentYear = Date.today().year();
Integer currentMonth = Date.today().month();
String defaultSalesCycle = '';
if (currentMonth >= defaultMonth) {
defaultSalesCycle = SALES_SEASON_PREFIX + String.valueOf(currentYear-2000) + SALES_SEASON_INFIX + String.valueOf(currentYear-1999);  
} else {
defaultSalesCycle = SALES_SEASON_PREFIX + String.valueOf(currentYear-2001) + SALES_SEASON_INFIX + String.valueOf(currentYear-2000);
}
return defaultSalesCycle;

}*/
    /*@AuraEnabled
public static List<SelectOption> fetchPicklist(String objectPassed,String fieldPassed) {

List<SelectOption> options = new List<SelectOption>();

List<Schema.DescribeSobjectResult> results = Schema.describeSObjects(new List<String>{objectPassed});

for(Schema.DescribeSobjectResult res : results) {
for (Schema.PicklistEntry entry : res.fields.getMap().get(fieldPassed).getDescribe().getPicklistValues()) {
if (entry.isActive()) {
options.add(new SelectOption(entry.getValue(), entry.getLabel()));
}
}
}
System.debug(options);
return options;
}*/
    @AuraEnabled
    public static List<ReturnRetentionData> GetAllRenewalData(String SalesCycle,String sortByColumnName, String sortByOrder){
        try{
            
            //String SalesCycle='IY19, 1/1/20';
            List<ReturnRetentionData> returnDataValue=new List<ReturnRetentionData>();
            List<Renewal_Status__c> getAllRenewalDatawithRequiredFilters;
            Id loggedInUserId=UserInfo.getUserId();
            
            String loggedInUserRoleName = [Select userrole.name from user where Id =: loggedInUserId].userrole.name;
            //system.debug('loggedInUserRoleName '+loggedInUserRoleName);
            
            String salesCycleValue=SalesCycle;
            String srtByColmnName=sortByColumnName;
            String srtByOrdr=sortByOrder;
            //System.debug('SalesCycle'+SalesCycle);
            //System.debug('srtByColmnName'+srtByColmnName);
            //System.debug('srtByOrdr'+srtByOrdr);
            
            Map<String,String> icmReportSettingMap=new Map<String,String>();
            List<String> lst=new List<String>();
            lst.add('Report_Default_Month');
            lst.add('Report_Start_Year');
            
            List<ICM_Report_Setting__mdt> icmReportSettingList=[Select DeveloperName,Value__c from ICM_Report_Setting__mdt where
                                                                DeveloperName in: lst];
            
            for(ICM_Report_Setting__mdt eachICMReportSetting:icmReportSettingList){
                icmReportSettingMap.put(eachICMReportSetting.DeveloperName,eachICMReportSetting.Value__c);
            }

            String queryStr='';
            
            if(loggedInUserRoleName == 'Specialty Benefits SCE'){ // Product_Line__c IN(\'Dental\',\'Vision\',\'Life\',\'Disability\')
                   
                queryStr='SELECT Id, Efective_Date__c, Company__r.name, Company__r.Owner.Name, Business_Line__c, Product_Line__c,Product_Confirmed__c,'+
                    'Renewal_Confirmed_Members_Sale__c, Date_Submitted_For_Incentives__c,Will_sales_incentives_be_split__c, Date_sent_to_ISI_Site__c, Sales_Cycle__c,'+ 
                    'Sales_Person_1_split_percentage__c,Sales_Person_2_Split_percentage__c, Sales_Person_2__r.name,'+
                    'Sales_person_1__r.name,isRenewalStatusRecord__c,Submit_For_Sales_Incentives__c FROM Renewal_Status__c  where '+ 
                    '(((Sales_person_1__c=:loggedInUserId or Sales_Person_2__c=:loggedInUserId) OR (Company__r.OwnerId=:loggedInUserId and Submit_For_Sales_Incentives__c=false and Eligible_for_Sales_Incentives__c=\'Yes\')) OR (Specialty_Benefits_SCE__c=:loggedInUserId AND Product_Line__c IN(\'Dental\',\'Vision\',\'Life\',\'Disability\'))) AND (Renewal_Confirmed_Members_Sale__c=\'Confirmed; All Members Safe\' or Renewal_Confirmed_Members_Sale__c=\'Confirmed; Partial Cancel\'  or Renewal_Confirmed_Members_Sale__c=\'Confirmed; Intersegment Transfer Out\') and isRenewalStatusRecord__c=true';
            }
            else{
                //system.debug('Entering else');
                queryStr='SELECT Id, Efective_Date__c, Company__r.name, Company__r.Owner.Name, Business_Line__c, Product_Line__c,Product_Confirmed__c,'+
                    'Renewal_Confirmed_Members_Sale__c, Date_Submitted_For_Incentives__c,Will_sales_incentives_be_split__c, Date_sent_to_ISI_Site__c, Sales_Cycle__c,'+ 
                    'Sales_Person_1_split_percentage__c,Sales_Person_2_Split_percentage__c, Sales_Person_2__r.name,'+
                    'Sales_person_1__r.name,isRenewalStatusRecord__c,Submit_For_Sales_Incentives__c FROM Renewal_Status__c  where'+ 
                    '((Sales_person_1__c=:loggedInUserId or Sales_Person_2__c=:loggedInUserId) or (Company__r.OwnerId=:loggedInUserId and Submit_For_Sales_Incentives__c=false and Eligible_for_Sales_Incentives__c=\'Yes\')) AND (Renewal_Confirmed_Members_Sale__c=\'Confirmed; All Members Safe\' or Renewal_Confirmed_Members_Sale__c=\'Confirmed; Partial Cancel\'  or Renewal_Confirmed_Members_Sale__c=\'Confirmed; Intersegment Transfer Out\') and isRenewalStatusRecord__c=true';
            }
            
               
            if(salesCycle==''){
                Date todayDate=system.today();
                String defaultSalesSeason='';
                defaultSalesSeason=GrowthIncentiveCompensationController.getDefaultSalesCycle(icmReportSettingMap.get('Report_Start_Year'), icmReportSettingMap.get('Report_Default_Month'));
                srtByColmnName='Company__r.name';
                srtByOrdr='asc';
                queryStr=queryStr+' and Sales_Cycle__c =: defaultSalesSeason Order By '+srtByColmnName+' '+srtByOrdr;
                //system.debug('queryStr2 '+queryStr);
                getAllRenewalDatawithRequiredFilters=Database.query(queryStr);
                //System.debug('getAllRenewalDatawithRequiredFilters==>'+getAllRenewalDatawithRequiredFilters);
            }
            else if(salesCycle!='' && srtByColmnName=='' && srtByOrdr==''){
                srtByColmnName='Company__r.name';
                srtByOrdr='asc';
                queryStr=queryStr+' and Sales_Cycle__c =: SalesCycle Order By '+srtByColmnName+' '+srtByOrdr;
                getAllRenewalDatawithRequiredFilters=Database.query(queryStr);    
                //System.debug('getAllRenewalDatawithRequiredFilters==>'+getAllRenewalDatawithRequiredFilters);
            }
            else{
                queryStr=queryStr+' and Sales_Cycle__c =: SalesCycle Order By '+srtByColmnName+' '+srtByOrdr;
                getAllRenewalDatawithRequiredFilters=Database.query(queryStr);
                //System.debug('getAllRenewalDatawithRequiredFilters==>'+getAllRenewalDatawithRequiredFilters);
            }
            
            //System.debug(salesCycleValue);
            //System.debug(getAllRenewalDatawithRequiredFilters);
            
            if(getAllRenewalDatawithRequiredFilters.size()>0){
                //System.debug(getAllRenewalDatawithRequiredFilters);
                for(Renewal_Status__c eachrenewalData:getAllRenewalDatawithRequiredFilters){
                    ReturnRetentionData eachreturnRenewalData=new ReturnRetentionData();
                    eachreturnRenewalData.ICMCycleLabel=System.Label.ICM_SalesCycleLabel;
                    eachreturnRenewalData.ICMHeaderLabel=System.Label.ICM_SCE_Retention_HeaderData;
                    eachreturnRenewalData.loggedInUserName=UserInfo.getName();
                    eachreturnRenewalData.salesCycle=eachrenewalData.Sales_Cycle__c;
                    //System.debug('UN'+UserInfo.getName());
                    if(eachrenewalData.Efective_Date__c!=null){
                        //System.debug('Efective_Date__c'+eachrenewalData.Efective_Date__c);
                        Date todayDate=Date.today();
                        Date effectiveDate=eachrenewalData.Efective_Date__c;
                        if(effectiveDate<todayDate && eachrenewalData.Date_Submitted_For_Incentives__c!=null){
                            //System.debug('Inside If');
                            eachreturnRenewalData.HighLightExtractedDate='Yes';
                        }
                        else{
                            //System.debug('Inside else');
                            eachreturnRenewalData.HighLightExtractedDate='No';  
                        }
                        eachreturnRenewalData.EffectiveDate=eachrenewalData.Efective_Date__c.format();
                    }
                    if(eachrenewalData.Company__c!=null){
                        //System.debug('renewalId'+eachrenewalData.Company__c);
                        eachreturnRenewalData.renewalId=eachrenewalData.Company__c;
                    }
                    if(eachrenewalData.Company__r.name!=null){
                        //System.debug('Efective_Date__c'+eachrenewalData.Company__r.name);
                        eachreturnRenewalData.CompanyName=eachrenewalData.Company__r.name;
                    }
                    //if(eachrenewalData.Company__r.Owner.Name!=null){
                    system.debug('eachrenewalData.Business_Line__c ==> '+eachrenewalData.Business_Line__c);
                        if(eachrenewalData.Business_Line__c == 'Specialty Benefits Only' || eachrenewalData.Business_Line__c == '' || eachrenewalData.Business_Line__c == null){
                            system.debug('Entering business line null');
                            eachreturnRenewalData.companyOwnerName='';
                        }
                        else{
                            system.debug('Entering business line not null');
                            eachreturnRenewalData.companyOwnerName=eachrenewalData.Company__r.Owner.Name;
                        }
                    system.debug('eachreturnRenewalData.companyOwnerName -- '+eachreturnRenewalData.companyOwnerName);
                    //}
                    if(eachrenewalData.Product_Line__c!=null){
                        //System.debug('Efective_Date__c'+eachrenewalData.Product_Line__c);
                        eachreturnRenewalData.ProductType=eachrenewalData.Product_Line__c;
                    }
                    if(eachrenewalData.Product_Confirmed__c!=null){
                        //System.debug('Efective_Date__c'+eachrenewalData.Product_Confirmed__c);
                        eachreturnRenewalData.ProductDetail=eachrenewalData.Product_Confirmed__c;
                    }
                    if(eachrenewalData.Renewal_Confirmed_Members_Sale__c!=null){
                        //System.debug('Efective_Date__c'+eachrenewalData.Renewal_Confirmed_Members_Sale__c);
                        eachreturnRenewalData.RenewalConfirmedStatus=eachrenewalData.Renewal_Confirmed_Members_Sale__c;
                    }
                    
                    if(eachrenewalData.Date_Submitted_For_Incentives__c!=null){
                        //System.debug('Efective_Date__c'+eachrenewalData.Date_Submitted_For_Incentives__c);
                        
                        DateTime getDateTime=eachrenewalData.Date_Submitted_For_Incentives__c;
                        // Date  myDate = getDateTime.date();
                        String inputDate = getDateTime.format();
                        //System.debug('inputDate notsent'+inputDate);
                        eachreturnRenewalData.ReadyToSendDate=inputDate;
                    }
                    else{
                        //System.debug('else not sent'+eachrenewalData.Date_Submitted_For_Incentives__c);
                        eachreturnRenewalData.ReadyToSendDate= 'Not Sent - Action Needed'; 
                    }
                    if(eachrenewalData.Date_sent_to_ISI_Site__c!=null){
                        //System.debug('Efective_Date__c'+eachrenewalData.Date_sent_to_ISI_Site__c);
                        DateTime getDateTime=eachrenewalData.Date_sent_to_ISI_Site__c;
                        
                        // Date myDate = getDateTime.date();
                        
                        String inputDate = getDateTime.format();
                        //System.debug('inputDate extract'+inputDate);
                        eachreturnRenewalData.ReadyToExtractDate=inputDate;
                    }
                    else{
                        //System.debug('empty Date_sent_to_ISI_Site__c'+eachrenewalData.Date_sent_to_ISI_Site__c);
                        eachreturnRenewalData.ReadyToExtractDate= 'Not Yet Extracted'; 
                    }
                    if(eachrenewalData.Sales_person_1__c!=null){
                        //System.debug('salesUserId1'+eachrenewalData.Sales_person_1__c);
                        eachreturnRenewalData.salesUserId1=eachrenewalData.Sales_person_1__c;
                    }
                    if(eachrenewalData.Sales_person_1__r.name!=null){
                        //System.debug('Efective_Date__c'+eachrenewalData.Sales_person_1__r.name);
                        eachreturnRenewalData.Salesperson1=eachrenewalData.Sales_person_1__r.name;
                    }
                    if(eachrenewalData.Sales_Person_1_split_percentage__c!=null){
                        //System.debug('Efective_Date__c'+eachrenewalData.Sales_Person_1_split_percentage__c);
                        eachreturnRenewalData.Salesperson1Percent=eachrenewalData.Sales_Person_1_split_percentage__c.intValue();
                    }
                    if(eachrenewalData.Sales_person_2__c!=null){
                        //System.debug('salesUserId2'+eachrenewalData.Sales_person_2__c);
                        eachreturnRenewalData.salesUserId2=eachrenewalData.Sales_person_2__c;
                    }
                    if(eachrenewalData.Sales_Person_2__r.name!=null){
                        //System.debug('Efective_Date__c'+eachrenewalData.Sales_Person_2__r.name);
                        eachreturnRenewalData.Salesperson2=eachrenewalData.Sales_Person_2__r.name;
                    }
                    if(eachrenewalData.Sales_Person_2_Split_percentage__c!=null){
                        //System.debug('Efective_Date__c'+eachrenewalData.Sales_Person_2_Split_percentage__c);
                        eachreturnRenewalData.Salesperson2Percent=eachrenewalData.Sales_Person_2_Split_percentage__c.intValue();
                    } 
                    if(eachrenewalData.Will_sales_incentives_be_split__c!=null){
                        if(loggedInUserRoleName == 'Specialty Benefits SCE'){
                            if(eachrenewalData.Business_Line__c == 'Specialty Benefits Only' || eachrenewalData.Business_Line__c == '' || eachrenewalData.Business_Line__c == null){
                                eachreturnRenewalData.SalesSplitExist=eachrenewalData.Will_sales_incentives_be_split__c;
                            }
                            else{
                                eachreturnRenewalData.SalesSplitExist = '';
                            }
                        }
                        else{
                            eachreturnRenewalData.SalesSplitExist=eachrenewalData.Will_sales_incentives_be_split__c; 
                        }
                    }     
                    returnDataValue.add(eachreturnRenewalData);
                    //System.debug('eachreturnRenewalData'+eachreturnRenewalData);
                }
                return returnDataValue;
            }
            else{
                returnDataValue=new List<ReturnRetentionData>();
                //System.debug('empty'+returnDataValue);
                ReturnRetentionData eachreturnRenewalData=new ReturnRetentionData();
                eachreturnRenewalData.ICMCycleLabel=System.Label.ICM_SalesCycleLabel;
                eachreturnRenewalData.ICMHeaderLabel=System.Label.ICM_SCE_Retention_HeaderData;
                eachreturnRenewalData.loggedInUserName=UserInfo.getName();
                if(salesCycle==''){
                    eachreturnRenewalData.salesCycle=GrowthIncentiveCompensationController.getDefaultSalesCycle(icmReportSettingMap.get('Report_Start_Year'), icmReportSettingMap.get('Report_Default_Month'));
                }
                else{
                    eachreturnRenewalData.salesCycle=salesCycleValue;
                }
                returnDataValue.add(eachreturnRenewalData);
                return returnDataValue;
            }
            
            
        }
        catch(Exception e){
            System.debug('Exception Occured:'+e.getMessage()+'Line Number'+e.getLineNumber());
            return null;
        }
    }
    public class SelectOption {
        public SelectOption(String value, String label) {
            this.value = value;
            this.label = label;
        }
        @AuraEnabled
        public String label { get;set; }
        @AuraEnabled
        public String value { get;set; }
    }
    @AuraEnabled
    public static List<ReturnRetentionData> GetAllRenewalDataforVPCR(String SalesCycle,String sortByColumnName, String sortByOrder,String sortSectionName,String filtersce,String Companyname,Date filtereffectiveDate){
        
        try{
            //String SalesCycle='IY19, 1/1/20';
            List<ReturnRetentionData> returnDataValue=new List<ReturnRetentionData>();
            List<Renewal_Status__c> getAllRenewalDatawithRequiredFilters;
            Id loggedInUserId=UserInfo.getUserId();
            String salesCycleValue=SalesCycle;
            String srtByColmnName=sortByColumnName;
            String srtByOrdr=sortByOrder;
            String filterscevalue=filtersce;
            String filtercompanyname=Companyname;
            Date filterDateValue=filtereffectiveDate;
            System.debug('SalesCycle'+SalesCycle);
            System.debug('srtByColmnName'+srtByColmnName);
            System.debug('srtByOrdr'+srtByOrdr);
            system.debug('sortSectionName==>'+sortSectionName);
            system.debug('filterscevalue==>'+filterscevalue);
            system.debug('filtercompanyname==>'+filtercompanyname);
            system.debug('filterDateValue==>'+filterDateValue);
            Map<String,String> icmReportSettingMap=new Map<String,String>();
            List<String> lst=new List<String>();
            lst.add('Report_Default_Month');
            lst.add('Report_Start_Year');
            
            List<ICM_Report_Setting__mdt> icmReportSettingList=[Select DeveloperName,Value__c from ICM_Report_Setting__mdt where
                                                                DeveloperName in: lst];
            
            for(ICM_Report_Setting__mdt eachICMReportSetting:icmReportSettingList){
                icmReportSettingMap.put(eachICMReportSetting.DeveloperName,eachICMReportSetting.Value__c);
            }
            String queryStr='SELECT Id, Efective_Date__c, Company__r.name,Company__r.Owner.name,Eligible_for_Sales_Incentives__c,Company__r.CMVPCRRVP__c,VPCR_RVP__c, Product_Line__c,Product_Confirmed__c,'+
                'Renewal_Confirmed_Members_Sale__c,Will_sales_incentives_be_split__c, Date_Submitted_For_Incentives__c, Date_sent_to_ISI_Site__c, Sales_Cycle__c,'+ 
                'Sales_Person_1_split_percentage__c,Sales_Person_2_Split_percentage__c, Sales_Person_2__r.name,'+
                'Sales_person_1__r.name,isRenewalStatusRecord__c,Submit_For_Sales_Incentives__c FROM Renewal_Status__c  where'+ 
                '   (Renewal_Confirmed_Members_Sale__c=\'Confirmed; All Members Safe\' or Renewal_Confirmed_Members_Sale__c=\'Confirmed; Partial Cancel\' or Renewal_Confirmed_Members_Sale__c=\'Confirmed; Intersegment Transfer Out\') and isRenewalStatusRecord__c=true AND'; 
            
            /*if(sortSectionName==''){
                queryStr=queryStr+' (VPCR_RVP__c=:loggedInUserId  or (Company__r.CMVPCRRVP__c=:loggedInUserId   and Submit_For_Sales_Incentives__c=false and Eligible_for_Sales_Incentives__c=\'Yes\'))';
                //queryStr=queryStr;
            }
            if(sortSectionName=='Current'){
                queryStr=queryStr+' ((VPCR_RVP__c=:loggedInUserId and Company__r.CMVPCRRVP__c=:loggedInUserId)  or (Company__r.CMVPCRRVP__c=:loggedInUserId  and Submit_For_Sales_Incentives__c=false and Eligible_for_Sales_Incentives__c=\'Yes\'))';
            }else if(sortSectionName=='Previous'){
                queryStr=queryStr+' (VPCR_RVP__c=:loggedInUserId and Company__r.CMVPCRRVP__c!=:loggedInUserId)';
            }*/
            
            //-----------------------------------------SAMARTH-----------------------------------------
            if(sortSectionName==''){
                queryStr=queryStr+' (VPCR_RVP__c=:loggedInUserId AND Eligible_for_Sales_Incentives__c=\'Yes\')';
            }
            if(sortSectionName=='Current'){
                queryStr=queryStr+' (VPCR_RVP__c=:loggedInUserId and Company__r.CMVPCRRVP__c=:loggedInUserId AND Eligible_for_Sales_Incentives__c=\'Yes\')';
            }
            else if(sortSectionName=='Previous'){
                queryStr=queryStr+' (VPCR_RVP__c=:loggedInUserId and Company__r.CMVPCRRVP__c!=:loggedInUserId AND Eligible_for_Sales_Incentives__c=\'Yes\')';
            }
            //-----------------------------------------SAMARTH-----------------------------------------
            
            if(filterscevalue!=null && filterscevalue!=''){
                queryStr=queryStr+' and Company__r.Owner.name=:filterscevalue';
            }
            if(filtercompanyname!=null && filtercompanyname!=''){
                queryStr=queryStr+' and Company__r.name=:filtercompanyname';
            }
            if(filterDateValue!=null){
                queryStr=queryStr+' and Efective_Date__c=:filterDateValue';
            }
            System.debug('queryStr'+queryStr);
            if(salesCycle==''){
                
                Date todayDate=system.today();
                
                
                String defaultSalesSeason='';
                //defaultSalesSeason='IY'+string.valueof(todayDate.year()).right(2)+', 1/1/'+string.valueof(todayDate.year()+1).right(2);
                defaultSalesSeason=GrowthIncentiveCompensationController.getDefaultSalesCycle(icmReportSettingMap.get('Report_Start_Year'), icmReportSettingMap.get('Report_Default_Month'));
                srtByColmnName='Company__r.name';
                srtByOrdr='ASC';
                queryStr=queryStr+' and Sales_Cycle__c =: defaultSalesSeason Order By '+srtByColmnName+' '+srtByOrdr;
                
                getAllRenewalDatawithRequiredFilters=Database.query(queryStr);
                
                System.debug('getAllRenewalDatawithRequiredFilters==>'+getAllRenewalDatawithRequiredFilters);
                
                
                
            }else if(salesCycle!='' && srtByColmnName=='' && srtByOrdr==''){
                srtByColmnName='Company__r.name';
                srtByOrdr='ASC';
                queryStr=queryStr+' and Sales_Cycle__c =: SalesCycle Order By '+srtByColmnName+' '+srtByOrdr;
                getAllRenewalDatawithRequiredFilters=Database.query(queryStr);
                
                System.debug('getAllRenewalDatawithRequiredFilters==>'+getAllRenewalDatawithRequiredFilters);
                
            }
            else{
                queryStr=queryStr+' and Sales_Cycle__c =: SalesCycle Order By '+srtByColmnName+' '+srtByOrdr;
                getAllRenewalDatawithRequiredFilters=Database.query(queryStr);
                
                System.debug('getAllRenewalDatawithRequiredFilters==>'+getAllRenewalDatawithRequiredFilters);
                
            }
            
            System.debug(getAllRenewalDatawithRequiredFilters);
            if(getAllRenewalDatawithRequiredFilters.size()>0){
                System.debug(getAllRenewalDatawithRequiredFilters);
                for(Renewal_Status__c eachrenewalData:getAllRenewalDatawithRequiredFilters){
                    ReturnRetentionData eachreturnRenewalData=new ReturnRetentionData();
                    eachreturnRenewalData.ICMCycleLabel=System.Label.ICM_SalesCycleLabel;
                    eachreturnRenewalData.ICMHeaderLabel=System.Label.ICM_SCE_Retention_HeaderData;
                    eachreturnRenewalData.loggedInUserName=UserInfo.getName();
                    eachreturnRenewalData.salesCycle=eachrenewalData.Sales_Cycle__c;
                    System.debug('UN'+UserInfo.getName());
                    if(eachrenewalData.Efective_Date__c!=null){
                        System.debug('Efective_Date__c'+eachrenewalData.Efective_Date__c);
                        
                        eachreturnRenewalData.EffectiveDate=eachrenewalData.Efective_Date__c.format();
                    }
                    if(eachrenewalData.Company__c!=null){
                        System.debug('renewalId'+eachrenewalData.Company__c);
                        eachreturnRenewalData.renewalId=eachrenewalData.Company__c;
                    }
                    if(eachrenewalData.Company__r.name!=null){
                        System.debug('Efective_Date__c'+eachrenewalData.Company__r.name);
                        eachreturnRenewalData.CompanyName=eachrenewalData.Company__r.name;
                    }
                    if(eachrenewalData.Product_Line__c!=null){
                        System.debug('Efective_Date__c'+eachrenewalData.Product_Line__c);
                        eachreturnRenewalData.ProductType=eachrenewalData.Product_Line__c;
                    }
                    if(eachrenewalData.Product_Confirmed__c!=null){
                        System.debug('Efective_Date__c'+eachrenewalData.Product_Confirmed__c);
                        eachreturnRenewalData.ProductDetail=eachrenewalData.Product_Confirmed__c;
                    }
                    if(eachrenewalData.Renewal_Confirmed_Members_Sale__c!=null){
                        System.debug('Efective_Date__c'+eachrenewalData.Renewal_Confirmed_Members_Sale__c);
                        eachreturnRenewalData.RenewalConfirmedStatus=eachrenewalData.Renewal_Confirmed_Members_Sale__c;
                    }
                    
                    if(eachrenewalData.Date_Submitted_For_Incentives__c!=null){
                        System.debug('if sent'+eachrenewalData.Date_Submitted_For_Incentives__c);
                        
                        DateTime getDateTime=eachrenewalData.Date_Submitted_For_Incentives__c;
                        // Date  myDate = getDateTime.date();
                        String inputDate = getDateTime.format();
                        System.debug('inputDate notsent'+inputDate);
                        eachreturnRenewalData.ReadyToSendDate=inputDate;
                    }
                    else{
                        System.debug('else not sent'+eachrenewalData.Date_Submitted_For_Incentives__c);
                        eachreturnRenewalData.ReadyToSendDate= 'Not Sent - Action Needed'; 
                    }
                    if(eachrenewalData.Date_sent_to_ISI_Site__c!=null){
                        System.debug('Efective_Date__c'+eachrenewalData.Date_sent_to_ISI_Site__c);
                        DateTime getDateTime=eachrenewalData.Date_sent_to_ISI_Site__c;
                        
                        String inputDate = getDateTime.format();
                        System.debug('inputDate extract'+inputDate);
                        eachreturnRenewalData.ReadyToExtractDate=inputDate;
                    }
                    else{
                        System.debug('empty Date_sent_to_ISI_Site__c'+eachrenewalData.Date_sent_to_ISI_Site__c);
                        eachreturnRenewalData.ReadyToExtractDate= 'Not Yet Extracted'; 
                    }
                    if(eachrenewalData.Sales_person_1__c!=null){
                        System.debug('salesUserId1'+eachrenewalData.Sales_person_1__c);
                        eachreturnRenewalData.salesUserId1=eachrenewalData.Sales_person_1__c;
                    }
                    if(eachrenewalData.Sales_person_1__r.name!=null){
                        System.debug('Sales_person_1__r'+eachrenewalData.Sales_person_1__r.name);
                        eachreturnRenewalData.Salesperson1=eachrenewalData.Sales_person_1__r.name;
                    }
                    if(eachrenewalData.Sales_Person_1_split_percentage__c!=null){
                        System.debug('Sales_Person_1_split_percentage__c'+eachrenewalData.Sales_Person_1_split_percentage__c);
                        eachreturnRenewalData.Salesperson1Percent=eachrenewalData.Sales_Person_1_split_percentage__c.intValue();
                    }
                    if(eachrenewalData.Sales_person_2__c!=null){
                        System.debug('salesUserId2'+eachrenewalData.Sales_person_2__c);
                        eachreturnRenewalData.salesUserId2=eachrenewalData.Sales_person_2__c;
                    }
                    if(eachrenewalData.Sales_Person_2__r.name!=null){
                        System.debug('Sales_Person_2__r'+eachrenewalData.Sales_Person_2__r.name);
                        eachreturnRenewalData.Salesperson2=eachrenewalData.Sales_Person_2__r.name;
                    }
                    if(eachrenewalData.Sales_Person_2_Split_percentage__c!=null){
                        System.debug('Sales_Person_2_Split_percentage__c'+eachrenewalData.Sales_Person_2_Split_percentage__c);
                        eachreturnRenewalData.Salesperson2Percent=eachrenewalData.Sales_Person_2_Split_percentage__c.intValue();
                    }  
                    if(eachrenewalData.VPCR_RVP__c!=null){
                        eachreturnRenewalData.renewalVpcrId=eachrenewalData.VPCR_RVP__c; 
                    }
                    if(eachrenewalData.Company__r.CMVPCRRVP__c!=null){
                        eachreturnRenewalData.accountVpcrId=eachrenewalData.Company__r.CMVPCRRVP__c;
                    }
                    if(eachrenewalData.Company__r.owner.name!=null){
                        eachreturnRenewalData.currentSCE=eachrenewalData.Company__r.owner.name;
                    }
                    if(eachrenewalData.Will_sales_incentives_be_split__c!=null){
                        eachreturnRenewalData.SalesSplitExist=eachrenewalData.Will_sales_incentives_be_split__c;
                    }
                    
                    if(eachrenewalData.Company__r.ownerId!=null){
                        eachreturnRenewalData.currentSCEId=eachrenewalData.Company__r.ownerId;
                    }
                    if(eachrenewalData.Submit_For_Sales_Incentives__c!=null){
                        eachreturnRenewalData.SubmitForSalesIncentive=eachrenewalData.Submit_For_Sales_Incentives__c;
                    }
                    if(eachrenewalData.Eligible_for_Sales_Incentives__c!=null){
                        eachreturnRenewalData.Eligibleforsales=eachrenewalData.Eligible_for_Sales_Incentives__c;
                    }
                    returnDataValue.add(eachreturnRenewalData);
                    System.debug('eachreturnRenewalData'+eachreturnRenewalData);
                }
                System.debug('returnDataValue => ' + returnDataValue);
                return returnDataValue;
            }
            else{
                returnDataValue=new List<ReturnRetentionData>();
                System.debug('empty'+returnDataValue);
                ReturnRetentionData eachreturnRenewalData=new ReturnRetentionData();
                eachreturnRenewalData.ICMCycleLabel=System.Label.ICM_SalesCycleLabel;
                eachreturnRenewalData.ICMHeaderLabel=System.Label.ICM_SCE_Retention_HeaderData;
                eachreturnRenewalData.loggedInUserName=UserInfo.getName();
                if(salesCycle==''){
                    eachreturnRenewalData.salesCycle=GrowthIncentiveCompensationController.getDefaultSalesCycle(icmReportSettingMap.get('Report_Start_Year'), icmReportSettingMap.get('Report_Default_Month'));
                }
                else{
                    eachreturnRenewalData.salesCycle=salesCycleValue;
                }
                returnDataValue.add(eachreturnRenewalData);
                System.debug('empty but having value with UN'+returnDataValue);
                return returnDataValue;
            }
            
            
        }
        catch(Exception e){
            System.debug('Exception Occured:'+e.getMessage()+'Line Number'+e.getLineNumber());
            return null;
        }
    }
    @AuraEnabled 
    public static NPSWrapper getTemplateInXML(String loggedInUserRole){   
        //system.debug('loggedInUserRole '+loggedInUserRole);
        NPSWrapper npsWrap = new  NPSWrapper();
        String queryString='SELECT Id, Body, BodyLength, Name FROM StaticResource where ';
        String objectName  = ''; 
        StaticResource sr;
        boolean isLoggedInUserVPCR=false;
        
        if(loggedInUserRole=='CM VPCR/RVP'){
            User userData = [Select Id,UserRole.Name,Profile.Name,Profile.UserLicense.Name,VPCR__c from User where Id=:UserInfo.getUserId()];
            if(userData!=null) {
                isLoggedInUserVPCR=userData.VPCR__c;
            }
        }
        
        if(loggedInUserRole=='CM VPCR/RVP' && !isLoggedInUserVPCR){
            queryString=queryString+'Name = \'IC_Statement_VPCR_RVP_Retention_Template\' ';
        }
        else if(loggedInUserRole=='CM VPCR/RVP' && isLoggedInUserVPCR){
            queryString=queryString+'Name = \'IC_Statement_VPCR_RVP_ProactiveRenewal_Template\' ';
        }
        else if(loggedInUserRole=='SBSCE'){
            queryString=queryString+'Name = \'IC_Statement_SBSCE_Retention_Template\' ';
        }
        else{
            queryString=queryString+'Name = \'IC_Statement_SCE_Retention_Template\' ';
        }
        //system.debug('queryString '+queryString);
        sr = Database.query(queryString);
        String xmlBodyString = sr.body.toString();
        
        Map<String,String> OBJECT_FILTER_RECORDS = IConstantsTemplate.OBJECT_FILTER_RECORDS;
        
        Pattern p = Pattern.compile(IConstantsTemplate.TEMPLATE_PREFIX_SUFFIX_REG_EXPRESSION);
        
        Matcher m = p.matcher(xmlBodyString);
        
        //System.debug('matcher '+m);
        
        Map<String,Set<String>> objectItagesMap = new Map<String,Set<String>>();
        
        while (m.find()) {
            String itag = m.group();    
            
            //system.debug('before replace prefix : '+itag);
            itag = itag.replaceAll(IConstantsTemplate.ITAG_PREFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            itag = itag.replaceAll(IConstantsTemplate.ITAG_SUFFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            //System.debug('itag '+itag);
            //System.debug('itag value '+itag);
            Integer dotFirstIndex = itag.indexOf('.');
            objectName = itag.substring(0,dotFirstIndex);
            String fieldName = itag.substring(dotFirstIndex+1);
            
            // System.debug('iTagFormatField '+iTagFormatField);
            
            if(objectItagesMap.containsKey(objectName)){
                Set<String> itagSet =  objectItagesMap.get(objectName);                    
                itagSet.add(fieldName);
                objectItagesMap.put(objectName, itagSet);
                
            }else{
                Set<String> itagSet = new Set<String>();
                itagSet.add(fieldName);      
                //System.debug('objectName  -> '+objectName);                     
                objectItagesMap.put(objectName, itagSet);
            }                         
            
        }  
        
        
        npsWrap.xmlString = xmlBodyString;       
        npsWrap.objectItags = objectItagesMap;
        
        return npsWrap;
    }
    
    
    
    public class ReturnRetentionData {
        @AuraEnabled
        public String ICMCycleLabel {get;set;}
        @AuraEnabled
        public String ICMHeaderLabel {get;set;}
        @AuraEnabled
        public String EffectiveDate {get;set;}
        @AuraEnabled
        public String HighLightExtractedDate {get;set;}
        
        @AuraEnabled
        public String CompanyName {get;set;}
        @AuraEnabled
        public String salesCycle {get;set;}
        @AuraEnabled
        public String ProductType {get;set;}
        @AuraEnabled
        public String SalesSplitExist {get;set;}
        @AuraEnabled
        public String ProductDetail {get;set;}
        
        
        @AuraEnabled
        public String RenewalConfirmedStatus {get;set;}
        
        @AuraEnabled
        public String  ReadyToSendDate{get;set;}
        
        @AuraEnabled
        public String  ReadyToExtractDate{get;set;}
        
        @AuraEnabled
        public String Salesperson1 {get;set;}
        
        
        @AuraEnabled
        public Integer Salesperson1Percent {get;set;}
        
        @AuraEnabled
        public String Salesperson2 {get;set;}
        @AuraEnabled
        public String loggedInUserName {get;set;}
        
        @AuraEnabled
        public Integer Salesperson2Percent {get;set;}
        
        @AuraEnabled
        public Id renewalId {get;set;}
        @AuraEnabled
        public Id salesUserId1 {get;set;}
        @AuraEnabled
        public Id salesUserId2 {get;set;}
        @AuraEnabled
        public Id currentSCEId {get;set;}
        @AuraEnabled
        public Id renewalVpcrId {get;set;}
        @AuraEnabled
        public Id accountVpcrId {get;set;}
        @AuraEnabled
        public String currentSCE {get;set;}
        @AuraEnabled
        public Boolean SubmitForSalesIncentive {get;set;}
        @AuraEnabled
        public String Eligibleforsales {get;set;}
        
        //--------SAMARTH--------
        @AuraEnabled
        public String companyOwnerName {get;set;}
        //--------SAMARTH--------
    }
    public class NPSWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        
        @AuraEnabled
        public String xmlString { get; set; }  
    }
    
}