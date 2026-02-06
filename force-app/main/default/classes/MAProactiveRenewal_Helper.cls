public class MAProactiveRenewal_Helper {
    
    public static List<Date> getDateListToQuery(Opportunity opp){
        List<Date> returnList=new List<Date>();
        Date effectiveDate=opp.EffectiveDate__c;
        Integer numberOfDays = Date.daysInMonth(effectiveDate.year(), effectiveDate.month());
        Date lastDayOfMonth = Date.newInstance(effectiveDate.year(), effectiveDate.month(), numberOfDays);
        Integer numberOfDays1 = Date.daysInMonth(effectiveDate.year()-1, effectiveDate.month());
        Date lastDayOfMonth1 = Date.newInstance(effectiveDate.year()-1, effectiveDate.month(), numberOfDays1);
        returnList.add(lastDayOfMonth);
        returnList.add(lastDayOfMonth1);
        return returnList;
    }
   
    public static Map<String,Map<String,List<PolicyAccountMembership__c>>> processPlcyAccMmbrshpRecord(List<PolicyAccountMembership__c> plcyAccMmbrshpList){
        Map<String,Map<String,List<PolicyAccountMembership__c>>> returnMap=new Map<String,Map<String,List<PolicyAccountMembership__c>>>();
        for(PolicyAccountMembership__c eachPlcyAccMmbrshpRec:plcyAccMmbrshpList){
            if(eachPlcyAccMmbrshpRec.GLDate__c!=null){
                Integer glDateMonth=eachPlcyAccMmbrshpRec.GLDate__c.month();
                Integer glDateYear=eachPlcyAccMmbrshpRec.GLDate__c.year();
                
                Map<String,List<PolicyAccountMembership__c>> mapOfAccountIdAndPlcyAccMmbrshpLst;
                List<PolicyAccountMembership__c> plcyAccMmbrshpLst;
                
                if(returnMap!=null && returnMap.containsKey(eachPlcyAccMmbrshpRec.AccountFirm__c)){
                    
                    mapOfAccountIdAndPlcyAccMmbrshpLst=returnMap.get(eachPlcyAccMmbrshpRec.AccountFirm__c);
                    
                    if(mapOfAccountIdAndPlcyAccMmbrshpLst.containsKey(glDateMonth+'_'+glDateYear)){
                        plcyAccMmbrshpLst=mapOfAccountIdAndPlcyAccMmbrshpLst.get(glDateMonth+'_'+glDateYear);
                        plcyAccMmbrshpLst.add(eachPlcyAccMmbrshpRec);
                        
                    }else{
                        plcyAccMmbrshpLst=new List<PolicyAccountMembership__c>();
                        plcyAccMmbrshpLst.add(eachPlcyAccMmbrshpRec);
                    }
                    
                }else{
                    mapOfAccountIdAndPlcyAccMmbrshpLst=new Map<String,List<PolicyAccountMembership__c>>();
                    plcyAccMmbrshpLst=new List<PolicyAccountMembership__c>();
                    plcyAccMmbrshpLst.add(eachPlcyAccMmbrshpRec);         
                }
                mapOfAccountIdAndPlcyAccMmbrshpLst.put(glDateMonth+'_'+glDateYear,plcyAccMmbrshpLst);
                returnMap.put(eachPlcyAccMmbrshpRec.AccountFirm__c,mapOfAccountIdAndPlcyAccMmbrshpLst);
            }
            
            
        }
        
        return returnMap;
    }
    
    public static long calculateRetention(List<PolicyAccountMembership__c> currentYearPlcyAccMmbrshpList,
                                           List<PolicyAccountMembership__c> previousYearplcyAccMmbrshpList){
                                               
		//decimal retentionValue=0;
        long retentionValue=0;                                      
        
        if((currentYearPlcyAccMmbrshpList!=null && !currentYearPlcyAccMmbrshpList.isEmpty()) && 
           (previousYearplcyAccMmbrshpList!=null && !previousYearplcyAccMmbrshpList.isEmpty())){
            decimal currentYearGLMmbrshpValue=getGLMembershipValue(currentYearPlcyAccMmbrshpList);
            decimal previousYearGLMmbrshpValue=getGLMembershipValue(previousYearplcyAccMmbrshpList);
            
            if(currentYearGLMmbrshpValue>0 && previousYearGLMmbrshpValue>0){
                //retentionValue=(currentYearGLMmbrshpValue*100)/previousYearGLMmbrshpValue; 
                retentionValue=((currentYearGLMmbrshpValue*100)/previousYearGLMmbrshpValue).round(System.RoundingMode.HALF_EVEN); 
            }     
        }else{
            System.debug('Policy/Account Membership Data not available for retention calculation');
        }                                       
                                          
		return retentionValue;
    }
    
    public static decimal getGLMembershipValue(List<PolicyAccountMembership__c> plcyAccMmbrshpList){
        decimal finalGLMemberShiValue=0;
        System.debug('Inside getGLMembershipValue()==>'+plcyAccMmbrshpList);
        if(plcyAccMmbrshpList!=null && !plcyAccMmbrshpList.isEmpty()){
            for(PolicyAccountMembership__c eachPlcyAccMmbrshp:plcyAccMmbrshpList){
                if(eachPlcyAccMmbrshp.GLMembership__c!=null){
                    finalGLMemberShiValue+=eachPlcyAccMmbrshp.GLMembership__c;
                }
            }
        }
        
        return finalGLMemberShiValue;
    }
    
    public static void sendEmailNotification(String subject, String emailBody, String[] emailArray) {                
        
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(emailArray);
        //mail.setCcAddresses(ccAddresses);
               
        mail.setSubject(subject);mail.setBccSender(false);
        mail.setUseSignature(false);mail.setHtmlBody(emailBody);
        
        Messaging.SendEmailResult[] results = Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
        
        if(results[0].success) {
            system.debug('Mail sent successfully');
        }      
    } 
    
    public static List <String> getListFromValueSeparatedStr(String valueSeparatedStr, string valueSeparator)
    {
        String[] returnList=new List<String>();
        if(valueSeparatedStr!=null && valueSeparatedStr!='')
        {
            if(valueSeparatedStr.contains(valueSeparator))
            {
                returnList= valueSeparatedStr.split(valueSeparator);
                
            }
            else
            {
                returnList.add(valueSeparatedStr);
            }
            
        }
        return returnList;
    }
}