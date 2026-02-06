public without sharing class GrowthIncentiveCompensationController 
{
    @AuraEnabled
    public static ReturnGrowthData getGrowthData(String loggedInUserRole,String salesCycle,String sortByColumnName, String sortByOrder){ 
        system.debug('getGrowthData(String,String,String)-- start');
        ReturnGrowthData returnGrowthDataObj = new ReturnGrowthData();
        
        
        try{ 
            String loggedInUserId=UserInfo.getUserId();
            List<OpportunityLineItem> opportunityLineItemList;
            List<String> salesCycleValueList=new List<String>();
            String salesCycleValue=salesCycle;
            String srtByColmnName=sortByColumnName;
            String srtByOrdr=sortByOrder;
            String loggedInUserName=UserInfo.getName();
            
            Map<String,String> icmReportSettingMap=new Map<String,String>();
            List<String> lst=new List<String>();
            lst.add('Report_Default_Month');
            lst.add('Report_Start_Year');
            
            List<ICM_Report_Setting__mdt> icmReportSettingList=[Select DeveloperName,Value__c from ICM_Report_Setting__mdt where
                                                               DeveloperName in: lst];
            
            for(ICM_Report_Setting__mdt eachICMReportSetting:icmReportSettingList){
                icmReportSettingMap.put(eachICMReportSetting.DeveloperName,eachICMReportSetting.Value__c);
            }
            
            
            String queryStr;
            //if(loggedInUserRole=='CM VP'){
            if(loggedInUserRole=='Specialty Benefits SVP'){    
                queryStr='SELECT Id,OpportunityId,Opportunity.EffectiveDate__c,Opportunity.Account.Name,Opportunity.Name,Product2.Name,'+
                    		'Product2.Family,Net_Results__c,Date_Submitted_for_Incentives__c,Date_sent_to_ISI_Site__c,'+
                    		'Sales_Person_1__r.Name,Sales_Person_1_split_percentage__c,Sales_Person_2__r.Name,Sales_Person_2_split_percentage__c,Product_Line__c,'+
                    		'Opportunity.OwnerId,Opportunity.Owner.Name,Will_Sales_Incentive_be_split__c from OpportunityLineItem where Net_Results__c > 0 and '+
                    		'((((Product_Line__c = \'Dental\'  AND Opportunity.Disposition_Dental__c = \'Sold\') OR (Product_Line__c ='+ 
							'\'Vision\' AND Opportunity.Disposition_Vision__c = \'Sold\')) AND Product2.Name = \'Total\') OR '+
                    		'(Product_Line__c = \'Other\' AND Eligible_for_Sales_Incentives__c=\'Yes\' AND Disposition_Other_Buy_Up_Programs__c = \'Sold\' AND Product2.Family = \'Specialty Products\')) and '+
                    		'((Sales_Person_1__c=:loggedInUserId or Sales_Person_2__c=:loggedInUserId) or (Submit_for_sales_incentives__c=false AND (Opportunity.OwnerId=:loggedInUserId or Opportunity.Specialty_Benefits_SVP__c=:loggedInUserName))'+
                    		' or (Submit_for_sales_incentives__c=true and Speciality_Benefits_SVP__c=:loggedInUserName))';
            }else{
                queryStr='SELECT Id,OpportunityId,Opportunity.EffectiveDate__c,Opportunity.Account.Name,Opportunity.Name,Product2.Name,'+
                    		'Product2.Family,Net_Results__c,Date_Submitted_for_Incentives__c,Date_sent_to_ISI_Site__c,'+
                    		'Sales_Person_1__r.Name,Sales_Person_1_split_percentage__c,Sales_Person_2__r.Name,Sales_Person_2_split_percentage__c,Product_Line__c,'+
                    		'Opportunity.OwnerId,Opportunity.Owner.Name,Will_Sales_Incentive_be_split__c from OpportunityLineItem where Net_Results__c > 0 and '+
                    		'(((((Product_Line__c = \'Medical\' AND Opportunity.Disposition_Medical__c = \'Sold\')OR (Product_Line__c = \'Pharmacy\' AND Opportunity.Disposition_Pharmacy__c = \'Sold\')'+
                    		'OR (Product_Line__c = \'Dental\'  AND Opportunity.Disposition_Dental__c = \'Sold\') OR (Product_Line__c = \'Vision\' AND Opportunity.Disposition_Vision__c = \'Sold\')) AND Product2.Name = \'Total\') OR '+
                    		'(Product_Line__c = \'Other\' AND Eligible_for_Sales_Incentives__c=\'Yes\' AND Disposition_Other_Buy_Up_Programs__c = \'Sold\' )) or Submit_for_sales_incentives__c = true) and '+
                    		'((Sales_Person_1__c=:loggedInUserId or Sales_Person_2__c=:loggedInUserId) or (Submit_for_sales_incentives__c=false AND Opportunity.OwnerId=:loggedInUserId))';
            }         
            
            if(salesCycle==''){
                
                
                Date todayDate=system.today();
              
                /*salesCycleValueList.add('IY '+todayDate.year());
                salesCycleValueList.add('1/1/'+string.valueof(todayDate.year()+1));*/
               
                
                
                
                String defaultSalesCycle='';
                //defaultSalesCycle='IY'+string.valueof(todayDate.year()).right(2)+', 1/1/'+string.valueof(todayDate.year()+1).right(2);
                defaultSalesCycle=getDefaultSalesCycle(icmReportSettingMap.get('Report_Start_Year'), icmReportSettingMap.get('Report_Default_Month'));
                
                
                
                salesCycleValueList.add('IY '+string.valueof(date.parse('1/1/'+defaultSalesCycle.substring(2,4)).year()));
                salesCycleValueList.add('1/1/'+string.valueof(date.parse('1/1/'+defaultSalesCycle.substring(defaultSalesCycle.length()-2,defaultSalesCycle.length())).year()));
                System.debug('salesCycleValueList==>'+salesCycleValueList);
                
                queryStr=queryStr+' and Opportunity.Sales_Cycle1__c In: salesCycleValueList Order By '+srtByColmnName+' '+srtByOrdr+',Opportunity.Name '+srtByOrdr;
                
                
                
                opportunityLineItemList=Database.query(queryStr);
                
                System.debug('opportunityLineItemList==>'+opportunityLineItemList.size());
                
                salesCycleValue=defaultSalesCycle;
                
            }else{
                
                salesCycleValueList.add('IY '+string.valueof(date.parse('1/1/'+salesCycle.substring(2,4)).year()));
                salesCycleValueList.add('1/1/'+string.valueof(date.parse('1/1/'+salesCycle.substring(salesCycle.length()-2,salesCycle.length())).year()));
                
            	queryStr=queryStr+' and Opportunity.Sales_Cycle1__c In: salesCycleValueList Order By '+srtByColmnName+' '+srtByOrdr;
                opportunityLineItemList=Database.query(queryStr);
                
                System.debug('opportunityLineItemList==>'+opportunityLineItemList);
            
            }
            
            if(sortByColumnName=='Product2.Name'){
                opportunityLineItemList=sortRecords(opportunityLineItemList, sortByColumnName, sortByOrder);
            }
            
            returnGrowthDataObj.opportunityLineItemList=opportunityLineItemList;
            returnGrowthDataObj.salesCycle=salesCycleValue;
            
            Map<String,List<String>> picklistValueMap = new Map<String,List<String>>();
            
            picklistValueMap.put('SalesCycle',getSalesCyclePicklist(icmReportSettingMap.get('Report_Start_Year')));
            
            returnGrowthDataObj.picklistFieldMap=picklistValueMap;
            returnGrowthDataObj.loggedInUserTimeZone=UserInfo.getTimeZone().getID();
            returnGrowthDataObj.loggedInUserName=loggedInUserName;
            returnGrowthDataObj.loggedInUserId=UserInfo.getUserId();
            
            
            
        }catch(Exception e){
            System.debug('Exception occured in getGrowthData(String,String,String) method==> '+e.getMessage());
        }
        system.debug('getGrowthData(String,String,String)-- end');
        return returnGrowthDataObj; 
    }
    
    @AuraEnabled
    public static ReturnGrowthData getGrowthDataOfCMVPCRRVP(String salesCycle,String sortByColumnName, String sortByOrder,String sortSectionName,String filterBySCE,String filterByCompanyName,Date filterByEffectiveDate){ 
        system.debug('getGrowthDataOfCMVPCRRVP(String,String,String)-- start');
        system.debug('salesCycle==>'+salesCycle);
        system.debug('sortByColumnName==>'+sortByColumnName);
        system.debug('sortByOrder==>'+sortByOrder);
        system.debug('sortSectionName==>'+sortSectionName);
        system.debug('filterBySCE==>'+filterBySCE);
        system.debug('filterByCompanyName==>'+filterByCompanyName);
        ReturnGrowthData returnGrowthDataObj = new ReturnGrowthData();
        
        
        try{ 
            String loggedInUserId=UserInfo.getUserId();
            List<OpportunityLineItem> opportunityLineItemList;
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
            
            String queryStr='SELECT Id,OpportunityId,Opportunity.EffectiveDate__c,Opportunity.Account.Name,Opportunity.Name,Product2.Name,'+
                    		'Product2.Family,Net_Results__c,Date_Submitted_for_Incentives__c,Date_sent_to_ISI_Site__c,'+
                			'Opportunity.Account.CMVPCRRVP__c,Opportunity.Account.CMVPCRRVP__r.Name,Opportunity.Account.OwnerId,Opportunity.Account.Owner.Name,'+
                    		'Sales_Person_1__c,Sales_Person_1__r.Name,Sales_Person_1_split_percentage__c,Sales_Person_2__c,Sales_Person_2__r.Name,Sales_Person_2_split_percentage__c,Product_Line__c,VPCR_RVP__c,Submit_for_sales_incentives__c,Opportunity.CM_VPCR_RVP__c'+
                    		' from OpportunityLineItem where Net_Results__c > 0 and '+
                    		'(((((Product_Line__c = \'Medical\' AND Opportunity.Disposition_Medical__c = \'Sold\')OR (Product_Line__c = \'Pharmacy\' AND Opportunity.Disposition_Pharmacy__c = \'Sold\')'+
                    		'OR (Product_Line__c = \'Dental\'  AND Opportunity.Disposition_Dental__c = \'Sold\') OR (Product_Line__c = \'Vision\' AND Opportunity.Disposition_Vision__c = \'Sold\')) AND Product2.Name = \'Total\') OR '+
                    		'(Product_Line__c = \'Other\' AND Eligible_for_Sales_Incentives__c=\'Yes\' AND Disposition_Other_Buy_Up_Programs__c = \'Sold\' )) or Submit_for_sales_incentives__c = true) and ';
                    		
            if(sortSectionName==''){
                queryStr=queryStr+'((VPCR_RVP__c=:loggedInUserId) or (Submit_for_sales_incentives__c=false AND Opportunity.CM_VPCR_RVP__c=:loggedInUserId))';
            }
            if(sortSectionName=='Current'){
                queryStr=queryStr+'((VPCR_RVP__c=:loggedInUserId and Opportunity.Account.CMVPCRRVP__c=:loggedInUserId) or (Submit_for_sales_incentives__c=false AND Opportunity.CM_VPCR_RVP__c=:loggedInUserId and Opportunity.Account.CMVPCRRVP__c=:loggedInUserId))';
            }else if(sortSectionName=='Previous'){
                queryStr=queryStr+'((VPCR_RVP__c=:loggedInUserId and Opportunity.Account.CMVPCRRVP__c!=:loggedInUserId) or (Submit_for_sales_incentives__c=false AND Opportunity.CM_VPCR_RVP__c=:loggedInUserId and Opportunity.Account.CMVPCRRVP__c!=:loggedInUserId))';
            }
            
            if(filterBySCE!=null && filterBySCE!=''){
                queryStr=queryStr+' and Opportunity.Account.Owner.Name=:filterBySCE';
            }
            if(filterByCompanyName!=null && filterByCompanyName!=''){
                queryStr=queryStr+' and Opportunity.Account.Name=:filterByCompanyName';
            }
            if(filterByEffectiveDate!=null){
                queryStr=queryStr+' and Opportunity.EffectiveDate__c=:filterByEffectiveDate';
            }
            
            
            if(salesCycle==''){
                
                
                Date todayDate=system.today();
                
                /*salesCycleValueList.add('IY '+todayDate.year());
                salesCycleValueList.add('1/1/'+string.valueof(todayDate.year()+1));*/
               
                
                String defaultSalesCycle='';
                //defaultSalesCycle='IY'+string.valueof(todayDate.year()).right(2)+', 1/1/'+string.valueof(todayDate.year()+1).right(2);
                defaultSalesCycle=getDefaultSalesCycle(icmReportSettingMap.get('Report_Start_Year'),icmReportSettingMap.get('Report_Default_Month'));
               
                
                salesCycleValueList.add('IY '+string.valueof(date.parse('1/1/'+defaultSalesCycle.substring(2,4)).year()));
                salesCycleValueList.add('1/1/'+string.valueof(date.parse('1/1/'+defaultSalesCycle.substring(defaultSalesCycle.length()-2,defaultSalesCycle.length())).year()));
                System.debug('salesCycleValueList==>'+salesCycleValueList);
                
                queryStr=queryStr+' and Opportunity.Sales_Cycle1__c In: salesCycleValueList Order By '+srtByColmnName+' '+srtByOrdr;
                
                if(sortSectionName==''){
                    queryStr=queryStr+',Opportunity.Name '+sortByOrder;
                }
                
                /*opportunityLineItemList=[SELECT Id,Opportunity.EffectiveDate__c,Opportunity.Account.Name,Opportunity.Name,Product2.Name,Product2.Family,Net_Results__c,Date_Submitted_for_Incentives__c,Date_sent_to_ISI_Site__c,Sales_Person_1__r.Name,Sales_Person_1_split_percentage__c,Sales_Person_2__r.Name,Sales_Person_2_split_percentage__c from OpportunityLineItem where Opportunity.Sales_Cycle1__c In: salesCycleValueList and Net_Results__c > 0 and (((((Product_Line__c = 'Medical' AND Opportunity.Disposition_Medical__c = 'Sold')OR (Product_Line__c = 'Pharmacy' AND Opportunity.Disposition_Pharmacy__c = 'Sold')OR (Product_Line__c = 'Dental'  AND Opportunity.Disposition_Dental__c = 'Sold') OR (Product_Line__c = 'Vision' AND Opportunity.Disposition_Vision__c = 'Sold')) AND Product2.Name = 'Total') OR (Product_Line__c = 'Other' AND Eligible_for_Sales_Incentives__c='Yes' AND Disposition_Other_Buy_Up_Programs__c = 'Sold' )) or Submit_for_sales_incentives__c = true) and 
                                         (Sales_Person_1__c=:loggedInUserId or Sales_Person_2__c=:loggedInUserId or Opportunity.OwnerId=:loggedInUserId) Order By Opportunity.EffectiveDate__c];*/
                
                opportunityLineItemList=Database.query(queryStr);
                
                System.debug('opportunityLineItemList length==>'+opportunityLineItemList.size());
                System.debug('opportunityLineItemList==>'+opportunityLineItemList);
                
                salesCycleValue=defaultSalesCycle;
                
            }else{
                
                salesCycleValueList.add('IY '+string.valueof(date.parse('1/1/'+salesCycle.substring(2,4)).year()));
                salesCycleValueList.add('1/1/'+string.valueof(date.parse('1/1/'+salesCycle.substring(salesCycle.length()-2,salesCycle.length())).year()));
                
            	queryStr=queryStr+' and Opportunity.Sales_Cycle1__c In: salesCycleValueList Order By '+srtByColmnName+' '+srtByOrdr;
                if(sortSectionName==''){
                    queryStr=queryStr+',Opportunity.Name '+sortByOrder;
                }
                opportunityLineItemList=Database.query(queryStr);
                
                System.debug('opportunityLineItemList==>'+opportunityLineItemList);
            
            }
            
            if(sortByColumnName=='Product2.Name'){
                opportunityLineItemList=sortRecords(opportunityLineItemList, sortByColumnName, sortByOrder);
            }
            
            returnGrowthDataObj.opportunityLineItemList=opportunityLineItemList;
            returnGrowthDataObj.salesCycle=salesCycleValue;
            
            Map<String,List<String>> picklistValueMap = new Map<String,List<String>>();
            
            picklistValueMap.put('SalesCycle',getSalesCyclePicklist(icmReportSettingMap.get('Report_Start_Year')));
            
            returnGrowthDataObj.picklistFieldMap=picklistValueMap;
            returnGrowthDataObj.loggedInUserTimeZone=UserInfo.getTimeZone().getID();
            returnGrowthDataObj.loggedInUserName=UserInfo.getName();
            returnGrowthDataObj.loggedInUserId=UserInfo.getUserId();
            
            
            
        }catch(Exception e){
            System.debug('Exception occured in getGrowthDataOfCMVPCRRVP(String,String,String) method==> '+e.getMessage());
        }
        system.debug('getGrowthDataOfCMVPCRRVP(String,String,String)-- end');
        return returnGrowthDataObj; 
    }
    
    
    public static List<String> getSalesCyclePicklist(String baseYear)
    {
        List<String> getSalesCyclePicklist=new List<String>();
        
        Date todayDate=system.today();
        String salesCycleValue;
        for(Integer i=Integer.valueOf(baseYear);i<=todayDate.year()+1;i++){
            salesCycleValue='IY'+string.valueof(i).right(2)+', 1/1/'+string.valueof(i+1).right(2);
            getSalesCyclePicklist.add(salesCycleValue);
        }
        
        return getSalesCyclePicklist;
        
    }
    
    public static String getDefaultSalesCycle(String baseYear,String defaultMonth)
    {
        String defaultSalesCycleValue;
        Date todayDate=System.today();
        if(Integer.valueOf(baseYear)<todayDate.year()){
            if(todayDate.month()>=Integer.valueOf(defaultMonth)){
                defaultSalesCycleValue='IY'+string.valueof(todayDate.year()).right(2)+', 1/1/'+string.valueof(todayDate.year()+1).right(2);
            }else{
                defaultSalesCycleValue='IY'+string.valueof(todayDate.year()-1).right(2)+', 1/1/'+string.valueof(todayDate.year()).right(2);
            }
            
        }else{
            String dtStr='1/1/'+baseYear;
            Date dt=Date.parse(dtStr);
           defaultSalesCycleValue='IY'+string.valueof(dt.year()).right(2)+', 1/1/'+string.valueof(dt.year()+1).right(2); 
        }
        
        
        return defaultSalesCycleValue;
        
    }
    
    public static List<OpportunityLineItem> sortRecords(List<OpportunityLineItem> listToBeSorted,String sortByColumnName,String sortByOrder)
    {
        List<OpportunityLineItem> returnList=new List<OpportunityLineItem>();
        List<OpportunityLineItemWrapper> sortedList = new List<OpportunityLineItemWrapper>();
        Boolean sortOrder = true;
        
        if(sortByOrder.equalsIgnoreCase('Desc')) {
            sortOrder = false;  
        }
        
        
        for(OpportunityLineItem eachOppLnItm : listToBeSorted) {
                sortedList.add(new OpportunityLineItemWrapper(eachOppLnItm,sortByColumnName,sortOrder));      
        }
        
        sortedList.sort();
        
        for(OpportunityLineItemWrapper obj : sortedList) {
            returnList.add(obj.oppLineItem);
        }
     
        return returnList;
    }
    
    @AuraEnabled
    public static NPSWrapper getTemplateInXML(String loggedInUserRole){                       
        NPSWrapper npsWrap = new  NPSWrapper();
        String queryString='SELECT Id, Body, BodyLength, Name FROM StaticResource where ';
        String objectName  = ''; 
        StaticResource sr;
        
        //if(loggedInUserRole=='CM VPCR/RVP' || loggedInUserRole=='CRM Administrator'){
        if(loggedInUserRole=='CM VPCR/RVP'){
            queryString=queryString+'Name = \'IC_Statement_VPCR_RVP_Growth_Template\' ';
        }//else if(loggedInUserRole=='CM VP'){
        else if(loggedInUserRole=='Specialty Benefits SVP'){
            queryString=queryString+'Name = \'IC_Statement_Spclty_SVP_Growth_Template\' ';
        }else{
            queryString=queryString+'Name = \'IC_Statement_SCE_Growth_Template\' ';
        }
        
        sr = Database.query(queryString);
        String xmlBodyString = sr.body.toString();
        
        Map<String,String> OBJECT_FILTER_RECORDS = IConstantsTemplate.OBJECT_FILTER_RECORDS;
        
        Pattern p = Pattern.compile(IConstantsTemplate.TEMPLATE_PREFIX_SUFFIX_REG_EXPRESSION);
        
        Matcher m = p.matcher(xmlBodyString);
        
        System.debug('matcher '+m);
        
        Map<String,Set<String>> objectItagesMap = new Map<String,Set<String>>();
        
        while (m.find()) {
            String itag = m.group();    
            
            system.debug('before replace prefix : '+itag);
            itag = itag.replaceAll(IConstantsTemplate.ITAG_PREFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            itag = itag.replaceAll(IConstantsTemplate.ITAG_SUFFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            //System.debug('itag '+itag);
            System.debug('itag value '+itag);
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
                System.debug('objectName  -> '+objectName);                     
                objectItagesMap.put(objectName, itagSet);
            }                         
            
        }  
        
        
        npsWrap.xmlString = xmlBodyString;       
        npsWrap.objectItags = objectItagesMap;
        
        return npsWrap;
    }
    
    
    
    public class ReturnGrowthData {
        
        @AuraEnabled
        public List<OpportunityLineItem> OpportunityLineItemList {get;set;}
        
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
    
    public class NPSWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        
        @AuraEnabled
        public String xmlString { get; set; }  
    }
}