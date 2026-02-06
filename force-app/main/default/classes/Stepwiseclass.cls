public with sharing class Stepwiseclass{
    @AuraEnabled
    public static Map<String, String> generateXMLFile(List<Id> SelectedId,String maType){
        
        Map<String, String> xmlStringMap = new Map<String, String>();
        try{
            String parent = 'Opportunity';    
            String xmlString='';
            Map<String,Set<String>> itagsMap = new  Map<String,Set<String>>();
            xmlString  = Stepwiseclass.returnXMLString(maType); 
            itagsMap = Stepwiseclass.getObjectMapWithItags(xmlString,parent);  
            String query = Stepwiseclass.returnquery(itagsMap,parent,SelectedId,maType);
            
            List<Opportunity> opp = Database.query(query);
            if(maType.equals('CmType')) {
                xmlStringMap = Stepwiseclass.buildXmlFileCM(opp,xmlString,itagsMap,parent,maType); 
            }
            else if(maType.equals('CDType')){
                xmlStringMap = Stepwiseclass.buildXmlFileCD(opp,xmlString,itagsMap,parent,maType); 
            }
            
            
        }
        catch(Exception ex){
            system.debug(ex.getLineNumber());
            system.debug(ex.getMessage());
            system.debug(ex.getStackTraceString());
            
        }
        return xmlStringMap;
    }
    @AuraEnabled
    // public static  List<Opportunity> returnListOfOpportunitiesForDisplay(String maType,Decimal page){
    public static StepwisePojo returnListOfOpportunitiesForDisplay(String maType,Decimal page){
        
        String query='';
        List<Opportunity> returnList = new List<Opportunity>();
        Set<Opportunity> oppSet = new Set<Opportunity>();
        Integer pageSize = 20;  
        Integer totalSize = 0;
        StepwisePojo stepwisepojo = new StepwisePojo();
        if(maType.equals('CmType')){
            //Integer offset = ((Integer)page - 1) * pageSize;
            
            // stepwisepojo.total = [SELECT count() FROM Opportunity where (RecordType.Name = 'CM Membership Activity (Existing Client)') AND (Membership_Activity_Type__c = 'Traditional')] ;
            query = 'Select Id,Name,Account.Name,Existing_Membership_at_Risk__c,(Select Id,Existing_Membership_at_Risk__c,Estimated_Members_Existing_New__c, Existing_Members_Involved_in_the_Bid__c,Name,Product2.Name,Product_Line__c,Product2.StepWise_Product_RowID__c,Product2.StepWise_Product_Name__c,Product2.Considered_For_StepWise_Integration__c,Product2.Reporting_Product_Type__c from OpportunityLineItems where Product_Line__c In (\'Vision\',\'Dental\',\'Other\') and Product2.Considered_For_StepWise_Integration__c = \'Yes\'),'+ StepWiseConstants.STEPWISE_FIELDS+','+StepWiseConstants.MISSING_FIELDS+' From Opportunity where '+StepWiseConstants.QUERY_CONDITIONS ; 
        } else if(maType.equals('CDType')){
            // Integer offset = ((Integer)page - 1) * pageSize;
            //stepwisepojo.total = [SELECT count() FROM Opportunity where (RecordType.Name = 'CD Membership Activity  (Prospect or Aggregator)') AND (Membership_Activity_Type__c = 'Traditional')] ;
            query = 'Select Id,Name,Account.Name,Existing_Membership_at_Risk__c,(Select Id,Existing_Membership_at_Risk__c,Estimated_Members_Existing_New__c, Existing_Members_Involved_in_the_Bid__c,Name,Product2.Name,Product2.StepWise_Product_Name__c,Product2.StepWise_Product_RowID__c,Product_Line__c,Product2.Considered_For_StepWise_Integration__c,Product2.Reporting_Product_Type__c from OpportunityLineItems where Product_Line__c In (\'Vision\',\'Dental\',\'Other\') and Product2.Considered_For_StepWise_Integration__c = \'Yes\'),'+ StepWiseConstants.STEPWISE_FIELDS+','+StepWiseConstants.MISSING_FIELDS+' From Opportunity where '+StepWiseConstants.QUERY_CONDITIONS_CD  ;
        }
        system.debug('  query'+query);
        List<Opportunity> opportunity = null;
        try{
            opportunity = Database.query(query) ;
        }catch(Exception ex){
            system.debug(ex.getLineNumber());
            system.debug(ex.getMessage());
            system.debug(ex.getStackTraceString());
        }
        //List<Opportunity> opportunity = Database.query(query) ;
        for(Opportunity opp : opportunity ) {
            
            List<OpportunityLineItem> opl = new List<OpportunityLineItem>();
            if(maType.equals('CmType'))
            {
                opl= Stepwiseclass.filterConditionCM(opp);
            }
            else if(maType.equals('CDType')){
                opl= Stepwiseclass.filterConditionCD(opp);
            }
            if(!(opl.isEmpty())){
                oppSet.add(opp);
            }
        }
        if(!(oppSet.isEmpty())){
            for(Opportunity op : oppSet){
                returnList.add(op);
            }
            
        }
        stepwisepojo.opportunityList = returnList ;
        return stepwisepojo;
        
    }
    
    public Static List<OpportunityLineItem> filterConditionCM(Opportunity op/*,OpportunityLineItem oppLineItems*/){
        Set<OpportunityLineItem> opliSet = new Set<OpportunityLineItem>();
        List<OpportunityLineItem> opliList = new List<OpportunityLineItem>();
        for(OpportunityLineItem oppLineItems : op.OpportunityLineItems ){
            String salesStageOther = String.valueof(oppLineItems.Product_Line__c);
            if(salesStageOther != null && salesStageOther != ''){
                
                
                String salesStage = '';
                String SalesStage1= '';
                if(salesStageOther != null && salesStageOther != '' && !salesStageOther.equalsIgnoreCase('Medical') && !salesStageOther.equalsIgnoreCase('Pharmacy')){
                    salesStage =String.valueOf(op.get('Sales_Stage_'+salesStageOther+'__c'));
                }
                String stage = '';
                String total ='';
                if(salesStageOther != null && salesStageOther != '' &&  (salesStageOther.equalsIgnoreCase('Dental') || salesStageOther.equalsIgnoreCase('Vision'))){
                    stage = 'Employees_in_the_Proposal_'+salesStageOther+'__c'; 
                    total = 'Retirees_in_the_Proposal_'+salesStageOther+'__c';
                }
                else if(salesStageOther != null && salesStageOther != '' && salesStageOther.equalsIgnoreCase('other')){
                    stage = 'Employees_in_the_Proposal_CI_AP_HI__c'; 
                    total = 'Retirees_in_the_Proposal_CI_AP_HI__c'; 
                } 
                
                Integer i =0;
                Integer t=0;
                Integer sum = 0;
                
                if((stage != null && stage != '' ) && (total != null && total != '') ){
                    
                    
                    if(op.get(stage)!= null)
                    {
                        i =(Integer.valueOf(op.get(stage.trim())));  
                    }else{
                        i=0;
                    }
                    if(op.get(total) != null)
                    {
                        t =(Integer.valueOf(op.get(total.trim()))); 
                    }else{
                        t=0;
                    }
                    sum = i+t;
                }
                if(oppLineItems.Product2.StepWise_Product_Name__c != null && oppLineItems.Product2.StepWise_Product_RowID__c  != null && oppLineItems.Product2.Considered_For_StepWise_Integration__c == 'Yes' ){
                    if(salesStageOther.equalsIgnorecase('other')){
                        if((( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'CI' ) && !(op.DateTime_Sent_to_StepWise_CIPP__c != null))
                           || (( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)=='APP') && !(op.DateTime_Sent_to_StepWise_APP__c != null ))
                           || (( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'HI') && !(op.DateTime_Sent_to_StepWise_HIPP__c != null ))
                           || (( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'Life') && !(op.DateTime_Sent_to_Stepwise_Life__c != null ))
                           || (( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'STD') && !(op.DateTime_Sent_to_Stepwise_STD__c != null ))
                           || (( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'LTD') && !(op.DateTime_Sent_to_Stepwise_LTD__c != null ))
                           || (( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'Leave') && !(op.DateTime_Sent_to_Stepwise_Leave__c != null ))){
                            if(op.Date_the_CI_APP_HIPP_Quote_is_Needed__c != null  ){
                                if(salesStage != null && salesStage != '' &&(salesStage.contains('Emerging Risk') && sum > 0 && oppLineItems.Existing_Membership_at_Risk__c > 0 )){
                                    opliSet.add(oppLineItems);
                                }
                                else if(salesStage != null && salesStage != '' && ((salesStage.equalsIgnorecase('In Review'))||(salesStage.equalsIgnorecase('Proposal'))||(salesStage.equalsIgnorecase('Finalist'))) && ((Integer.valueOf(oppLineItems.Estimated_Members_Existing_New__c )>0 ))){
                                    opliSet.add(oppLineItems);
                                }
                                
                            }
                        }
                        
                    }
                    else if(salesStageOther.equalsIgnorecase('Dental')||salesStageOther.equalsIgnorecase('Vision')){
                        if( date.valueof(op.get('Date_the_'+String.valueOf(oppLineItems.Product_Line__c)+'_Quote_is_Needed_from_UW__c')) != null && !(String.valueOf(op.get('DateTime_Sent_to_StepWise_'+String.valueOf(oppLineItems.Product_Line__c)+'__c')) != null)){
                            if((salesStage != null && salesStage.contains('Emerging Risk'))  && sum > 0 && Integer.valueof(oppLineItems.Existing_Membership_at_Risk__c) > 0 ){
                                opliSet.add(oppLineItems);
                                
                            }
                            else if((salesStage != null && salesStage.equalsIgnorecase('Proposal')) && ((Integer.valueOf(oppLineItems.Estimated_Members_Existing_New__c) )>0 )){
                                opliSet.add(oppLineItems);
                                
                            }
                        }
                    }
                }
            }}
        for(OpportunityLineItem opli : opliSet){
            opliList.add(opli);
        }
        return opliList ;
    }
    
    public Static List<OpportunityLineItem> filterConditionCD(Opportunity op/*,OpportunityLineItem oppLineItems*/){
        Set<OpportunityLineItem> opliSet = new Set<OpportunityLineItem>();
        List<OpportunityLineItem> opliList = new List<OpportunityLineItem>();
        
        for(OpportunityLineItem oppLineItems : op.OpportunityLineItems ){
            String salesStageOther = oppLineItems.Product_Line__c;
            
            String salesStage = '';
            String SalesStage1= '';
            if(salesStageOther != null && salesStageOther != '' && salesStageOther != 'Medical' && salesStageOther != 'Pharmacy'){
                salesStage =String.valueOf(op.get('Sales_Stage_'+String.valueof(oppLineItems.Product_Line__c)+'__c'));
                
                /* else if(salesStageOther != null && salesStageOther != 'Medical' && salesStageOther != 'Pharmacy'){
salesStage =String.valueOf(op.get('Sales_Stage_'+String.valueof(oppLineItems.Product_Line__c)+'__c'));  
}*/
                
                String stage = '';
                String total ='';
                if(salesStageOther.equalsIgnoreCase('Dental')||salesStageOther.equalsIgnoreCase('Vision')){
                    stage = 'Employees_in_the_Proposal_'+String.valueof(oppLineItems.Product_Line__c)+'__c';  
                    total = 'Retirees_in_the_Proposal_'+String.valueof(oppLineItems.Product_Line__c)+'__c'; 
                    
                }
                else{
                    stage = 'Employees_in_the_Proposal_CI_AP_HI__c'; 
                    total = 'Retirees_in_the_Proposal_CI_AP_HI__c'; 
                    
                    
                } 
                
                Integer i =0;
                Integer t=0;
                Integer sum = 0;
                // if(stage != '' && total != ''){
                // if((op.get(stage) != null )||((op.get(total) != null))){
                if((stage != null && stage != '' ) && (total != null && total != '') ){
                    if((Integer.valueOf(op.get(stage))) != null)
                    {
                        i =Integer.valueOf(op.get(stage.trim()));  
                    }else{
                        i=0;
                    }
                    if(Integer.valueOf(op.get(total)) != null)
                    {
                        t =(Integer.valueOf(op.get(total.trim()))); 
                    }else{
                        t=0;
                    }
                    /* }else{
i=0;
t=0;
}*/
                }
                sum = i+t;
                
                if(oppLineItems.Product2.StepWise_Product_Name__c != null && oppLineItems.Product2.StepWise_Product_RowID__c  != null && oppLineItems.Product2.Considered_For_StepWise_Integration__c == 'Yes' ){
                    if(salesStageOther.equalsIgnorecase('other') ){
                        if(salesStage!=null)
                            if(salesStage.equalsIgnoreCase('Proposal') ||salesStage.equalsIgnoreCase('In Review')||salesStage.equalsIgnoreCase('Finalist') ){
                               /* if((( String.valueOf(oppLineItems.Product2.Name) == StepWiseConstants.CRITICAL_ILLNESS_PROTECTION_PLAN_PRODUCT1 || String.valueOf(oppLineItems.Product2.Name)== StepWiseConstants.CRITICAL_ILLNESS_PROTECTION_PLAN_PRODUCT2 )&& !(op.DateTime_Sent_to_StepWise_CIPP__c != null))
                                   || (( String.valueOf(oppLineItems.Product2.Name)== StepWiseConstants.ACCIDENT_PROTECTION_PLAN_PRODUCT1 || String.valueOf( oppLineItems.Product2.Name)== StepWiseConstants.ACCIDENT_PROTECTION_PLAN_PRODUCT2) && !(op.DateTime_Sent_to_StepWise_APP__c != null ))
                                  || (( String.valueOf(oppLineItems.Product2.Name)== StepWiseConstants.HOSPITAL_INDEMNITY_VOLUNTARY_PRODUCT1) && !(op.DateTime_Sent_to_StepWise_HIPP__c != null ))){*/
                                if((( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'CI' ) && !(op.DateTime_Sent_to_StepWise_CIPP__c != null))
                                   || (( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)=='APP') && !(op.DateTime_Sent_to_StepWise_APP__c != null ))
                                   || (( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'HI') && !(op.DateTime_Sent_to_StepWise_HIPP__c != null ))
                                   || (( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'Life') && !(op.DateTime_Sent_to_Stepwise_Life__c != null ))
                                   || (( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'STD') && !(op.DateTime_Sent_to_Stepwise_STD__c != null ))
                                   || (( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'LTD') && !(op.DateTime_Sent_to_Stepwise_LTD__c != null ))
                                   || (( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'Leave') && !(op.DateTime_Sent_to_Stepwise_Leave__c != null ))){
                                       if(op.Proposal_Due_Date_Other__c != null){
                                           if(sum > 0 ){
                                            opliSet.add(oppLineItems);
                                        }
                                    }
                                }
                            }
                        
                    } if(salesStageOther.equalsIgnorecase('Dental')||salesStageOther.equalsIgnorecase('Vision')){
                        if(salesStage!=null)
                            if(salesStage.equalsIgnoreCase('Proposal')){
                                if(op.get('Proposal_Due_Date_'+String.valueOf(oppLineItems.Product_Line__c)+'__c') != null && (String.valueOf(op.get('DateTime_Sent_to_StepWise_'+String.valueOf(oppLineItems.Product_Line__c)+'__c')) == null )){
                                    // 
                                    if( sum > 0 ){
                                        opliSet.add(oppLineItems);
                                    }
                                    
                                }
                            }
                    }
                }
            }
        }
        for(OpportunityLineItem opli : opliSet){
            opliList.add(opli);
        }
        return opliList ;
    }
    
    public static  Map<String,String> buildXmlFileCM(List<Opportunity> sobj1,String xmlString,Map<String,Set<String>> itagsMap,String objectName,String maType){
        List<String> xmlStrings = new List<String>();
        Map<String,String> xmlStringMap = new Map<String,String>();
        Set<String> xmlSetString = new Set<String>();
        Set<String> replaceItags = itagsMap.get(objectName);
        set<OpportunityLineItem> opli = new Set<OpportunityLineItem>();
        List<Opportunity> sobj = new List<Opportunity>();
        list<opportunity> opList =new list<Opportunity>();
        String objName = objectName;
        for(Opportunity op : sobj1){
            
            Boolean createme = true;
            Boolean createRen = false;
            Boolean CreateNb = false;
            String sa = '';
            boolean createup = false;
            boolean creaternup = false;
            List<OpportunityLineItem> opplineit = new List<OpportunityLineItem>();
            opplineit = Stepwiseclass.filterConditionCM(op);
            if(!(opplineit.isEmpty())){
                for(OpportunityLineItem oppLineItems : opplineit){
                    String suf = '';
                    String idfield = '';
                    String salesStageOther = oppLineItems.Product_Line__c;
                    String salesStage = '';
                    String replaceuwdate = '';
                    String stage ='';
                    String OpportunityName = '';
                    String medical = '';
                    String opportunityType = '';
                    String eligees = '';
                    
                    
                    if(String.valueof(oppLineItems.Product2.Considered_For_StepWise_Integration__c)== 'Yes'){
                        // OpportunityLineItem oppLineItems = filterConditionCM(op,oppLineItem);
                        String oppProductId = '';
                        String productName = String.valueOf(oppLineItems.Product2.StepWise_Product_Name__c);
                        oppProductId = String.valueof(oppLineItems.Product2.StepWise_Product_RowID__c );
                        
                        if(oppLineItems != null){
                            sa = xmlString;
                            if(salesStageOther != 'Medical' && salesStageOther != 'Pharmacy'){
                                salesStage =String.valueOf(op.get('Sales_Stage_'+oppLineItems.Product_Line__c+'__c'));  
                            }
                            
                            if(String.valueOf(oppLineItems.Product_Line__c) == 'Dental'||String.valueOf(oppLineItems.Product_Line__c) == 'Vision'){
                                stage = 'Employees_in_the_Proposal_'+oppLineItems.Product_Line__c+'__c';  
                            }
                            else{
                                stage = 'Employees_in_the_Proposal_CI_AP_HI__c';  
                            } 
                            String total ='';
                            if(String.valueOf(oppLineItems.Product_Line__c) == 'Dental'||String.valueOf(oppLineItems.Product_Line__c) == 'Vision'){
                                total = 'Retirees_in_the_Proposal_'+oppLineItems.Product_Line__c+'__c';  
                            }
                            else{
                                total = 'Retirees_in_the_Proposal_CI_AP_HI__c ';  
                            }
                            Integer i=0;
                            Integer t=0;
                            if(((op.get(stage.trim())) != null )||((op.get(total.trim())) != null)){
                                
                                if(Integer.valueOf(op.get(stage.trim())) != null)
                                {
                                    i =(Integer.valueOf(op.get(stage.trim())));  
                                }else{
                                    i=0;
                                }
                                if(Integer.valueOf(op.get(total.trim())) != null)
                                {
                                    t =(Integer.valueOf(op.get(total.trim()))); 
                                }else{
                                    t=0;
                                }
                            }else{
                                i=0;
                                t=0;
                            }
                            
                            Integer  sum = i+t;
                            if(oppLineItems.Product_Line__c == 'Dental' || oppLineItems.Product_Line__c == 'Vision'){
                                DateTime dT = (Datetime)op.get('Date_the_'+String.valueOf(oppLineItems.Product_Line__c)+'_Quote_is_Needed_from_UW__c');
                                
                                if(dT != null){
                                    replaceuwdate = Stepwiseclass.getDateFormatted(dT.addDays(1));   
                                }
                                else{
                                    replaceuwdate = '';
                                }
                            }
                            else{
                                DateTime dT = (Datetime)op.Date_the_CI_APP_HIPP_Quote_is_Needed__c ;
                                
                                if(dT != null){
                                    replaceuwdate = Stepwiseclass.getDateFormatted(dT.addDays(1));   
                                }
                                else{
                                    replaceuwdate = '';
                                }
                                
                            }
                            if(/*op.Category__c == 'NBEA' && */op.Account.UHC_Medical_Members__c != null && Double.valueOf(op.Account.UHC_Medical_Members__c) > 0){
                                medical = 'Yes' ;
                                sa=sa.replace('<!--Medical-->',medical); 
                            }else{
                                medical = 'No';
                                sa=sa.replace('<!--Medical-->',medical); 
                            }
                            
                            if(productName != null ||productName != '' ){
                                sa=sa.replace('<!--ProdiName-->',productName);
                            }
                            else{
                                sa=sa.replace('<!--ProdiName-->', String.valueof(oppLineItems.Product2.Name));
                            }
                            oppProductId = String.valueof(oppLineItems.Product2.StepWise_Product_RowID__c );
                            
                            if(oppProductId != null || oppProductId != '')
                            {
                                sa=sa.replace('<!--ProdiID-->', oppProductId);
                            }
                            else{
                                sa=sa.replace('<!--ProdiID-->', String.valueof(oppLineItems.Product2Id));
                            }
                            
                            if(replaceuwdate != null){
                                sa=sa.replace('<!--UDueDate-->',replaceuwdate);
                                
                            }
                            else{
                                sa=sa.replace('<!--UDueDate-->',''); 
                            }
                            
                            if(String.valueOf(oppLineItems.Product_Line__c) == 'Dental'){
                                op.DateTime_Sent_to_StepWise_Dental__c = System.now();
                            }if(String.valueOf(oppLineItems.Product_Line__c) == 'Vision' ){
                                op.DateTime_Sent_to_StepWise_Vision__c = System.now();
                            }
                            /*if(String.valueOf(oppLineItems.Product_Line__c)== 'Other' && ( String.valueOf(oppLineItems.Product2.Name)== StepWiseConstants.CRITICAL_ILLNESS_PROTECTION_PLAN_PRODUCT1 || String.valueOf(oppLineItems.Product2.Name)== StepWiseConstants.CRITICAL_ILLNESS_PROTECTION_PLAN_PRODUCT2)){
                                op.DateTime_Sent_to_StepWise_CIPP__c =System.now();
                            }if(String.valueOf(oppLineItems.Product_Line__c)== 'Other' &&( String.valueOf(oppLineItems.Product2.Name)== StepWiseConstants.ACCIDENT_PROTECTION_PLAN_PRODUCT1 || String.valueOf(oppLineItems.Product2.Name)== StepWiseConstants.ACCIDENT_PROTECTION_PLAN_PRODUCT2)){
                                op.DateTime_Sent_to_StepWise_APP__c =System.now();
                            }if(String.valueOf(oppLineItems.Product_Line__c)== 'Other' &&( String.valueOf(oppLineItems.Product2.Name)== StepWiseConstants.HOSPITAL_INDEMNITY_VOLUNTARY_PRODUCT1)){
                                op.DateTime_Sent_to_StepWise_HIPP__c =System.now();
                            }*/
                            if( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'CI' && String.valueOf(oppLineItems.Product_Line__c)== 'Other'){
                                op.DateTime_Sent_to_StepWise_CIPP__c =System.now();
                            }
                            if( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'APP' && String.valueOf(oppLineItems.Product_Line__c)== 'Other'){
                                op.DateTime_Sent_to_StepWise_APP__c =System.now();
                            }
                            if( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'HI' && String.valueOf(oppLineItems.Product_Line__c)== 'Other'){
                                op.DateTime_Sent_to_StepWise_HIPP__c =System.now();
                            }
                            if( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'Life' && String.valueOf(oppLineItems.Product_Line__c)== 'Other'){
                                op.DateTime_Sent_to_Stepwise_Life__c =System.now();
                            }
                            if( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'STD' && String.valueOf(oppLineItems.Product_Line__c)== 'Other'){
                                op.DateTime_Sent_to_Stepwise_STD__c =System.now();
                            }
                            if( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'LTD' && String.valueOf(oppLineItems.Product_Line__c)== 'Other'){
                                op.DateTime_Sent_to_Stepwise_LTD__c =System.now();
                            }
                            if( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'Leave' && String.valueOf(oppLineItems.Product_Line__c)== 'Other'){
                                op.DateTime_Sent_to_Stepwise_Leave__c =System.now();
                            }
                           
                            
                            DateTime dT1 = (Datetime)op.EffectiveDate__c;
                            String myDate =Stepwiseclass.getDateFormatted(dT1.addDays(1));
                            
                            if(( salesStage.equalsIgnoreCase('Proposal')||salesStage.equalsIgnoreCase('In Review')||salesStage.equalsIgnoreCase('Finalist')) && ( (oppLineItems.Existing_Members_Involved_in_the_Bid__c != null) && (Integer.valueOf(oppLineItems.Existing_Members_Involved_in_the_Bid__c )> 0)) ){
                                opportunityType = 'Renewal';
                                OpportunityName = op.Account.Name+' - '+'RNW'+' - '+String.valueof(op.Reason_for_the_Opportunity_Risk__c)+' - '+myDate;
                                sa=sa.replace('<!--OpportunityType-->',opportunityType);
                                suf = 'RNW' ;
                            }else If(salesStage.contains('Emerging Risk')){
                                opportunityType = 'Renewal';
                                OpportunityName = op.Account.Name+' - '+'RNW'+' - '+String.valueof(op.Reason_for_the_Opportunity_Risk__c)+' - '+myDate;
                                sa=sa.replace('<!--OpportunityType-->',opportunityType);
                                suf ='RNW' ;
                            }
                            else {
                                opportunityType = 'New Business';
                                OpportunityName = op.Account.Name+' - '+'NB'+' - '+String.valueof(op.Reason_for_the_Opportunity_Risk__c)+' - '+myDate;
                                sa=sa.replace('<!--OpportunityType-->',opportunityType);
                                suf = 'NB';
                                
                            }
                            String name = '';
                            if(opportunityType.equalsIgnoreCase('Renewal') && op.CreateRen__c == false && createRen == false){
                                name = 'Create_Merit';
                                // opprt.createOrUpdate = 'Create_Merit';
                                sa=sa.replace('<!--Value-->','"CreateQuote"');
                                sa=sa.replace('<!--Status-->','New');
                                createRen = true;
                                creaternup = true;                                                                
                            }else if(opportunityType.equalsIgnoreCase('Renewal')){
                                name ='Add_Merit';
                                sa=sa.replace('<!--Value-->','"AddQuoteProducts"');
                                // opprt.createOrUpdate = 'Add_Merit';
                                sa=sa.replace('<!--Status-->','Update');
                            }
                            
                            if(opportunityType.equalsIgnoreCase('New Business') && op.CreateNB__c == false && createNb == false ){
                                name ='Create_Merit';
                                sa=sa.replace('<!--Value-->','"CreateQuote"');
                                // opprt.createOrUpdate = 'Add_Merit';
                                sa=sa.replace('<!--Status-->','New');
                                createNb = true;
                                createup = true;                                
                            }else if(opportunityType.equalsIgnoreCase('New Business')){
                                name ='Add_Merit';
                                sa=sa.replace('<!--Value-->','"AddQuoteProducts"');
                                // opprt.createOrUpdate = 'Add_Merit';
                                sa=sa.replace('<!--Status-->','Update');
                            }
                            /* if(op.EstimatedMedicalMembershipatRisk__c != null )
{
sa=sa.replace('<!--EstimatedMbr-->',String.valueOf(op.EstimatedMedicalMembershipatRisk__c));    
}else{*/
                            sa=sa.replace('<!--EstimatedMbr-->',''); 
                            // }
                            String re =   String.valueOf(sum); 
                            if(re!=null){
                                sa=sa.replace('<!--EligEE-->',re ); 
                                sa=sa.replace('<!--EligEE-->',re );
                            }  
                            else{
                                sa=sa.replace('<!--EligEE-->','' ); 
                                sa=sa.replace('<!--EligEE-->','' ); 
                                
                            } 
                            sa=sa.replace('<!--AccountId-->',String.valueOf(op.AccountId)+' - '+suf);
                            //sa=sa.replace('<!--TeamEmail-->',String.valueOf(op.Owner.Email));
                            
                            for(String replacet : replaceItags){
                                if(replacet == 'Owner.Name'){
                                    sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueOf(op.Owner.Name));  
                                }else if(replacet == 'Name'){
                                    sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,OpportunityName);  
                                }else if(replacet == 'EffectiveDate__c'){
                                    
                                    sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(myDate)); 
                                }else if(replacet == 'Account.Merit_Row_Id__c'){
                                    if(op.Account.Merit_Row_Id__c  != null ){
                                        sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(op.Account.Merit_Row_Id__c)); 
                                        //idfield = String.valueof(op.Id)+'-'+suf;
                                    }
                                    else{
                                        sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(op.AccountId)); 
                                        //idfield = String.valueof(op.AccountId)+'-'+suf;
                                    }
                                }
                                else if(replacet == 'Id'){                                    
                                    sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(Op.Id)+' - '+suf); 
                                    idfield = String.valueof(op.Id)+'-'+suf;
                                }else if(replacet == 'AccountId'){
                                    
                                    sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(Op.AccountId)); 
                                }
                                else if(replacet == 'Existing_Membership_at_Risk__c'){
                                    if(salesStage.contains('Emerging Risk')){
                                        sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(oppLineItems.Existing_Membership_at_Risk__c)); 
                                    }else{
                                        sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(oppLineItems.Estimated_Members_Existing_New__c)); 
                                    }
                                    
                                }else if(replacet == 'CASESAFEID__c'){
                                    if(op.Merit_Row_Id__c != null){
                                        sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(op.Merit_Row_Id__c)+'-'+suf); 
                                    }else{
                                        sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(op.CASESAFEID__c)+'-'+suf); 
                                    }                            
                                }else if(replacet == 'SCE__r.Name'){                                                                       
                                    if(op.SCE__r.Name != null && op.SCE__r.Name != ''){
                                        sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,op.SCE__r.Name); 
                                    }else{
                                        sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,Op.Owner.Name); 
                                    }
                                    
                                }else if(replacet == 'Owner.Email'){
                                    if(op.SCE__r.Name == null){
                                        sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(op.Owner.Email)); 
                                    }else{
                                        List<User> sce_User = [select name,email from user where name=:op.SCE__r.Name limit 1];
                                        if(sce_User != null && sce_User.size() > 0 && sce_User[0].email != null){
                                            sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(sce_User[0].email));
                                        }else{
                                            sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,'');
                                        }                                 
                                    }
                                }
                                else {
                                    String parent = replacet.substringBefore('.');
                                    String child = replacet.substringAfter('.');
                                    if(child.trim() == null || child.trim() == '' || child.trim() == ' ' ){
                                        String replaceme = String.valueOf(op.get(parent.trim()));
                                        if(replaceme == null || replaceme.trim() == '' ){
                                            sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,'');
                                        }else{
                                            sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,replaceme);  
                                        }
                                        
                                    }else{
                                        String  replaceme = String.valueOf(op.getSobject(parent.trim()).get(child.trim()));
                                        if(replaceme == null || replaceme.trim() == '' ){
                                            sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,'');
                                        }else{
                                            sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,replaceme);  
                                        }
                                    }  
                                }
                            }
                            //op.CreateNB__c = createup ;
                            //op.CreateRen__c = creaternup;
                            DateTime d = System.now();
                            String dt = d.format('YYYYMMdd_HHmmss');
                            sa=sa.replaceAll('&', '&amp;');
                            String fileName = '';
                            if(name != null){
                                fileName = name+StepWiseConstants.DELIMITER_UNDERSCORE+idfield+StepWiseConstants.DELIMITER_UNDERSCORE+dt+StepWiseConstants.DELIMITER_UNDERSCORE+oppProductId;  
                            }
                            if(fileName != null && (fileName.startsWith(name)) ){
                                if( xmlStringMap.containsKey(fileName)){
                                    
                                }else{
                                    xmlStringMap.put(fileName, sa);
                                }
                                
                            }
                            
                            //opport.add(opprt);
                            Attachment attachmentxml = new Attachment();
                            attachmentxml.parentId = op.Id;
                            attachmentxml.Name = fileName + '.xml';
                            attachmentxml.body =  Blob.valueof(sa); //This creates the PDF content
                            insert attachmentxml;
                        }
                    }
                }    
            }
            if(op.CreateNB__c == false){
                op.CreateNB__c = createup;
            }
            if(op.CreateRen__c == false){
                op.CreateRen__c = creaternup;
            }                       
            opList.add(op); 
        }
        update opList;
        
        return xmlStringMap;
    }
    
    public static  Map<String,String> buildXmlFileCD(List<Opportunity> sobj1,String xmlString,Map<String,Set<String>> itagsMap,String objectName,String maType){
        List<String> xmlStrings = new List<String>();
        Map<String,String> xmlStringMap = new Map<String,String>();
        Set<String> xmlSetString = new Set<String>();
        Set<String> replaceItags = itagsMap.get(objectName);
        set<OpportunityLineItem> opli = new Set<OpportunityLineItem>();
        List<Opportunity> sobj = new List<Opportunity>();
        list<opportunity> opList =new list<Opportunity>();
        String objName = objectName;
        for(Opportunity op : sobj1){
            Boolean createme = false;
            Boolean createNew = false;
            String sa = '';
            List<OpportunityLineItem> opplineit = new List<OpportunityLineItem>(); 
            opplineit = filterConditionCD(op);
            if(!opplineit.isEmpty()){
                for(OpportunityLineItem oppLineItems : opplineit){
                    String suf = 'NB';
                    String idfield = '';
                    String salesStageOther = oppLineItems.Product_Line__c;
                    String salesStage = '';
                    String replaceuwdate = '';
                    String stage ='';
                    String OpportunityName = '';
                    String medical = '';
                    String opportunityType = '';
                    String eligees = '';
                    String name = '';
                    
                    String oppProductId = '';
                    String productName = String.valueOf(oppLineItems.Product2.StepWise_Product_Name__c);
                    oppProductId = String.valueof(oppLineItems.Product2.StepWise_Product_RowID__c );
                    
                    sa = xmlString;
                    String total ='';
                    if(salesStageOther != 'Medical' && salesStageOther != 'Pharmacy'){
                        salesStage =String.valueOf(op.get('Sales_Stage_'+oppLineItems.Product_Line__c+'__c'));  
                    }
                    
                    if(String.valueOf(oppLineItems.Product_Line__c) == 'Dental'||String.valueOf(oppLineItems.Product_Line__c) == 'Vision'){
                        stage = 'Employees_in_the_Proposal_'+oppLineItems.Product_Line__c+'__c';  
                        total = 'Retirees_in_the_Proposal_'+oppLineItems.Product_Line__c+'__c';  
                    }
                    else if(String.valueOf(oppLineItems.Product_Line__c).contains('Other')){
                        stage = 'Employees_in_the_Proposal_CI_AP_HI__c'; 
                        total = 'Retirees_in_the_Proposal_CI_AP_HI__c ';  
                    } 
                    
                    Integer i = (Integer.valueOf(op.get(stage.trim())));
                    Integer t = (Integer.valueOf(op.get(total.trim())));
                    if(i == null){
                        i=0;
                    }if(t == null){
                        t=0;
                    }
                    Integer sum = i+t;
                    if(oppLineItems.Product_Line__c == 'Dental' || oppLineItems.Product_Line__c == 'Vision'){
                        Date dT = Date.valueOf(op.get('Proposal_Due_Date_'+String.valueOf(oppLineItems.Product_Line__c)+'__c'));
                        if(dT != null){
                            Datetime dtt1= Stepwiseclass.getPriorDate(dT);
                            //Date myDate = date.newinstance(dtt1.year(), dtt1.month(), dtt1.day());
                            replaceuwdate = Stepwiseclass.getDateFormatted(dtt1);
                            /* if(myDate > System.today()){
//system.debug('inside if 703');
replaceuwdate = Stepwiseclass.getDateFormatted(dtt1+1);     
}
else{
//system.debug('inside else 707');
Date dayToday = System.today();
//system.debug('dayToday >> '+dayToday);
Datetime formDate = getPostDate(dayToday);
replaceuwdate = Stepwiseclass.getDateFormatted(formDate);


}*/
                            
                        }
                        else{
                            replaceuwdate = '';
                        }
                    }
                    else{
                        Date dT = Date.valueOf(op.Proposal_Due_Date_Other__c) ;
                        if(dT != null){
                            Datetime dtt1= Stepwiseclass.getPriorDate(dT);
                            replaceuwdate = Stepwiseclass.getDateFormatted(dtt1);
                            /*Date myDate = date.newinstance(dtt1.year(), dtt1.month(), dtt1.day());
if(myDate > System.today()){
replaceuwdate = Stepwiseclass.getDateFormatted(dtt1+1);     
}
else{
Date dayToday = System.today();
Datetime formDate = getPostDate(dayToday);
replaceuwdate = Stepwiseclass.getDateFormatted(formDate);

}*/
                            
                            
                        } else{
                            replaceuwdate = '';
                        }
                        
                    }
                    sa=sa.replace('<!--Medical-->','No');
                    if(productName != null ||productName != '' ){
                        sa=sa.replace('<!--ProdiName-->',productName);
                    }
                    else{
                        sa=sa.replace('<!--ProdiName-->', String.valueof(oppLineItems.Product2.Name));
                    }
                    oppProductId = String.valueof(oppLineItems.Product2.StepWise_Product_RowID__c );
                    
                    if(oppProductId != null || oppProductId != '')
                    {
                        sa=sa.replace('<!--ProdiID-->', oppProductId);
                    }
                    else{
                        sa=sa.replace('<!--ProdiID-->', String.valueof(oppLineItems.Product2Id));
                    }
                    
                    if(replaceuwdate != null){
                        sa=sa.replace('<!--UDueDate-->',replaceuwdate);
                        
                    }
                    else{
                        sa=sa.replace('<!--UDueDate-->',''); 
                    }
                    sa=sa.replace('<!--AccountId-->',String.valueOf(op.AccountId)+' - '+suf);
                    //sa=sa.replace('<!--TeamEmail-->',String.valueOf(op.Owner.Email));
                    
                    if(String.valueOf(oppLineItems.Product_Line__c) == 'Dental'){
                        op.DateTime_Sent_to_StepWise_Dental__c = System.now();
                    }if(String.valueOf(oppLineItems.Product_Line__c) == 'Vision' ){
                        op.DateTime_Sent_to_StepWise_Vision__c = System.now();
                    }
                    /*if(String.valueOf(oppLineItems.Product_Line__c)== 'Other' && ( String.valueOf(oppLineItems.Product2.Name)== StepWiseConstants.CRITICAL_ILLNESS_PROTECTION_PLAN_PRODUCT1 || String.valueOf(oppLineItems.Product2.Name)== StepWiseConstants.CRITICAL_ILLNESS_PROTECTION_PLAN_PRODUCT2)){
                        op.DateTime_Sent_to_StepWise_CIPP__c =System.now();
                    } if(String.valueOf(oppLineItems.Product_Line__c)== 'Other' &&( String.valueOf(oppLineItems.Product2.Name)== StepWiseConstants.ACCIDENT_PROTECTION_PLAN_PRODUCT1 || String.valueOf(oppLineItems.Product2.Name)== StepWiseConstants.ACCIDENT_PROTECTION_PLAN_PRODUCT2)){
                        op.DateTime_Sent_to_StepWise_APP__c =System.now();
                    }if(String.valueOf(oppLineItems.Product_Line__c)== 'Other' &&( String.valueOf(oppLineItems.Product2.Name)== StepWiseConstants.HOSPITAL_INDEMNITY_VOLUNTARY_PRODUCT1)){
                        op.DateTime_Sent_to_StepWise_HIPP__c =System.now();
                    }*/
                    if( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'CI' && String.valueOf(oppLineItems.Product_Line__c)== 'Other'){
                        op.DateTime_Sent_to_StepWise_CIPP__c =System.now();
                    }
                    if( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'APP' && String.valueOf(oppLineItems.Product_Line__c)== 'Other'){
                        op.DateTime_Sent_to_StepWise_APP__c =System.now();
                    }
                    if( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'HI' && String.valueOf(oppLineItems.Product_Line__c)== 'Other'){
                        op.DateTime_Sent_to_StepWise_HIPP__c =System.now();
                    }
                    if( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'Life' && String.valueOf(oppLineItems.Product_Line__c)== 'Other'){
                        op.DateTime_Sent_to_Stepwise_Life__c =System.now();
                    }
                    if( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'STD' && String.valueOf(oppLineItems.Product_Line__c)== 'Other'){
                        op.DateTime_Sent_to_Stepwise_STD__c =System.now();
                    }
                    if( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'LTD' && String.valueOf(oppLineItems.Product_Line__c)== 'Other'){
                        op.DateTime_Sent_to_Stepwise_LTD__c =System.now();
                    }
                    if( String.valueOf(oppLineItems.Product2.Reporting_Product_Type__c)== 'Leave' && String.valueOf(oppLineItems.Product_Line__c)== 'Other'){
                        op.DateTime_Sent_to_Stepwise_Leave__c =System.now();
                    }
                    
                    sa=sa.replace('<!--OpportunityType-->','New Business');
                    DateTime dT1 = (Datetime)op.EffectiveDate__c;
                    /*   if(dT1 < System.now()){
dT1= System.now();
dT1.addDays(1);
}*/
                    String myDate =Stepwiseclass.getDateFormatted(dT1.addDays(1));
                    
                    if(createme == false && op.CreateNB__c == false){
                        name = 'Create_Merit';
                        //opprt.createOrUpdate = 'Create_Merit';
                        sa=sa.replace('<!--Value-->','"CreateQuote"');
                        sa=sa.replace('<!--Status-->','New');
                        createme = true;  
                    }else{
                        name ='Add_Merit';
                        sa=sa.replace('<!--Value-->','"AddQuoteProducts"');
                        // opprt.createOrUpdate = 'Add_Merit';
                        sa=sa.replace('<!--Status-->','Update');
                    }
                    if(op.Reason_for_the_Opportunity_Risk__c != null){                        
                        OpportunityName = op.Account.Name+ ' - NB - '+String.valueof(op.Reason_for_the_Opportunity_Risk__c)+' - '+ String.valueof(myDate);   
                    }else{
                        OpportunityName = op.Account.Name+ ' - NB - '+ String.valueof(myDate);
                    }
                    
                    String re =   String.valueOf(sum); 
                    if(re!=null){
                        sa=sa.replace('<!--EstEE-->',re ); 
                        sa=sa.replace('<!--EstEE-->',re );
                    }  
                    else{
                        sa=sa.replace('<!--EstEE-->','' ); 
                        sa=sa.replace('<!--EstEE-->','' ); 
                        
                    } 
                    for(String replacet : replaceItags){
                        if(replacet == 'Owner.Name'){
                            sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueOf(op.Owner.Name));  
                        }else if(replacet == 'Name'){
                            sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,OpportunityName);  
                        }else if(replacet == 'EffectiveDate__c'){
                             
                            sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(myDate)); 
                        }else if(replacet == 'Account.Merit_Row_Id__c'){
                            if(op.Account.Merit_Row_Id__c != null){
                                sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(op.Account.Merit_Row_Id__c));                                
                            }else{
                                sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(op.AccountId));                                 
                            }
                        }
                        else if(replacet == 'Id'){
                            if(op.Id  != null){
                                sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(Op.Id)+' - '+suf);
                                idfield = String.valueof(op.Id)+' - '+suf;
                            }else{
                                idfield = String.valueof(op.AccountId)+' - '+suf;
                            }
                            
                        }else if(replacet == 'AccountId'){
                            
                            sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(Op.AccountId)); 
                        }
                        else if(replacet == 'Existing_Membership_at_Risk__c'){
                            if(salesStage.contains('Emerging Risk')){
                                sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(oppLineItems.Existing_Membership_at_Risk__c)); 
                            }else{
                                sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(oppLineItems.Estimated_Members_Existing_New__c)); 
                            }                            
                        }else if(replacet == 'CASESAFEID__c'){
                            if(op.Merit_Row_Id__c != null){
                                sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(op.Merit_Row_Id__c)); 
                            }else{
                                sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(op.CASESAFEID__c)); 
                            }                            
                        }else if(replacet == 'Specialty_Benefits_SVP__c'){
                            if(op.Specialty_Benefits_SVP__c != null){
                                sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(op.Specialty_Benefits_SVP__c)); 
                            }else{
                                sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(op.Owner.Name));                               
                            }                            
                        }else if(replacet == 'Owner.Email'){
                            if(op.Specialty_Benefits_SVP__c == null){
                                sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(op.Owner.Email)); 
                            }else{
                                List<User> spec_User = [select name,email from user where name=:op.Specialty_Benefits_SVP__c limit 1];
                                if(spec_User != null && spec_User.size() > 0 && spec_User[0].email != null){
                                    sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,String.valueof(spec_User[0].email));
                                }else{
                                    sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,'');
                                }                                 
                            }
                        }
                        else {
                            String parent = replacet.substringBefore('.');
                            String child = replacet.substringAfter('.');
                            if(child.trim() == null || child.trim() == '' || child.trim() == ' ' ){
                                String replaceme = String.valueOf(op.get(parent.trim()));
                                if(replaceme == null || replaceme.trim() == '' ){
                                    sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,' ');
                                }else{
                                    sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,replaceme);  
                                }
                                
                            }else{
                                String  replaceme = String.valueOf(op.getSobject(parent.trim()).get(child.trim()));
                                if(replaceme == null || replaceme.trim() == '' ){
                                    sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,' ');
                                }else{
                                    sa=sa.replace(StepWiseConstants.COMMENT_PREFIX+objName+StepWiseConstants.DOT_SEPARATOR+replacet.trim()+StepWiseConstants.COMMENT_SUFFIX,replaceme);  
                                }
                            }  
                        }
                    }
                    DateTime d = System.now();
                    String dt = d.format('YYYYMMdd_HHmmss');
                    sa=sa.replaceAll('&', '&amp;');
                    String fileName = '';
                    if(name != null){
                        fileName = name+StepWiseConstants.DELIMITER_UNDERSCORE+idfield+StepWiseConstants.DELIMITER_UNDERSCORE+dt+StepWiseConstants.DELIMITER_UNDERSCORE+oppProductId;  
                    }
                    if(fileName != null && (fileName.startsWith(name)) ){
                        if( xmlStringMap.containsKey(fileName)){
                            
                        }else{
                            xmlStringMap.put(fileName, sa);
                        }
                        
                    }
                    
                    //opport.add(opprt);
                    Attachment attachmentxml = new Attachment();
                    attachmentxml.parentId = op.Id;
                    attachmentxml.Name = fileName + '.xml';
                    attachmentxml.body =  Blob.valueof(sa); //This creates the PDF content
                    insert attachmentxml;
                    
                    
                }    
            }
            if(op.CreateNB__c == false){
                op.CreateNB__c = createme;
            }
            opList.add(op); 
        }       
        update opList;
        return xmlStringMap;
    }
    
    public static String getDateFormatted(Datetime formatDate){      
        String dateOutput = formatDate.format('M/d/yyyy');
        return dateOutput;
    }
    
    public static Map<String,Set<String>> getObjectMapWithItags(String xmlBodyString,String parentObj){                       
        // Map<String,String> OBJECT_FILTER_RECORDS = StepWiseConstants.OBJECT_FILTER_RECORDS;
        Pattern p = Pattern.compile(StepWiseConstants.REG_EXPRESSION);
        Matcher m = p.matcher(xmlBodyString);
        Map<String,Set<String>> itagsMap = new Map<String,Set<String>>();
        
        while (m.find()) {
            String itag = m.group();	
            itag = itag.replaceAll(StepWiseConstants.ITAG_PREFIX,
                                   StepWiseConstants.EMPTY_STRING);
            
            itag = itag.replaceAll(StepWiseConstants.ITAG_SUFFIX,
                                   StepWiseConstants.EMPTY_STRING);
            
            
            Integer dotFirstIndex = itag.indexOf('.');
            String objectName = itag.substring(0,dotFirstIndex);
            String fieldName = itag.substring(dotFirstIndex+1);
            
            
            if(itagsMap.containsKey(objectName)){
                Set<String> itagSet =  itagsMap.get(objectName);                    
                itagSet.add(fieldName);
                itagsMap.put(objectName, itagSet);
                
            }else{
                Set<String> itagSet = new Set<String>();
                itagSet.add(fieldName);      
                itagsMap.put(objectName, itagSet);
            }                         
            
        }                        
        return itagsMap;
    }
    
    public static String returnquery(Map<String,Set<String>> itagsMap,String parentObj,List<Id> SelectedId,String maType){
        String finalSOQLquery='';
        
        finalSOQLquery  = 'Select parentItagsSet'+','+StepWiseConstants.STEPWISE_FIELDS+','+StepWiseConstants.CHILD_QUERY+','+StepWiseConstants.MISSING_FIELDS+' from '+parentObj+' Where Id In :SelectedId';                      
        
        
        for (String objectName : itagsMap.keySet()) {
            if((objectName.equals(parentObj) || objectName.equals('Opportunity'))){
                String queryItagString = '';
                Set<String> itagSet = itagsMap.get(objectName);
                itagSet.add('Id');
                
                for(String itag : itagSet){
                    queryItagString += itag+',';
                }
                queryItagString = queryItagString.removeEnd(',');
                finalSOQLquery = finalSOQLquery.replace('parentItagsSet', queryItagString);
            }
        }            
        
        return finalSOQLquery;
    }
    
    public static string returnXMLString(String stepwiseXmlFileName){
        StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = :stepwiseXmlFileName LIMIT 1];
        String xmlString = sr.body.toString();
        return xmlString;
    }
    
    public static DateTime getPriorDate(Date proposalDate){
        Datetime dt = DateTime.newInstance(proposalDate, Time.newInstance(0, 0, 0, 0));
        //Datetime dt = (DateTime)proposalDate;     	
        if(dt.format('EEEE')=='Sunday'){
            dt=dt-1;
        }
        dt = dt.addDays(-2);
        
        If(dt.format('EEEE')=='Saturday'){
            dt=dt-2;
        }
        if(dt.format('EEEE')=='Sunday'){
            dt=dt-2;
        }
        
        return dt;
    }
    
    public static DateTime getPostDate(Date proposalDate){
        Datetime dt = DateTime.newInstance(proposalDate, Time.newInstance(0, 0, 0, 0));
        String dayOfWeek=dt.format('EEEE');
        
        if(dayOfWeek.equalsIgnoreCase('Saturday')){
            dt=dt.addDays(2);
            
        }
        else if (dayOfWeek.equalsIgnoreCase('Friday')){
            dt=dt.addDays(3);
            
        }
        else {
            dt=dt.addDays(1);
            
        }
        
        
        return dt;
    }
    
    public class StepwisePojo{
        
        @AuraEnabled
        public List<Opportunity> opportunityList{ get;set;}
    }
    
}