/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 01-25-2024
 * @last modified by  : Spoorthy
**/
public with sharing class FinancialsApex {
    
    /* @AuraEnabled
public static Integer [] getLastFourYears(){
Integer [] arrayOfYears = new List<Integer>();        
Integer year = Date.Today().Year();
if(year != null)
{
arrayOfYears.add(year+1);
arrayOfYears.add(year);
arrayOfYears.add(year - 1);
arrayOfYears.add(year - 2);
}
return arrayOfYears;
}*/
    
    @AuraEnabled
    public Static Map<String,Object> getfinancialsData(Id AccountId,String RecordType){
        Map<String,Object> financialReturnMap = null;
        Integer [] arrayOfYearsMed = new List<Integer>();
        Integer [] arrayOfYearsRx = new List<Integer>();
        try{
            if(AccountId != null && RecordType != null){                
                UHGAccountConstants financialConstants = new UHGAccountConstants();
                UHGAccountSOQLConstants financialSOQLConstants = new UHGAccountSOQLConstants();                
                financialReturnMap = new Map<String,Object>();
                Integer [] lastFourYearsMed = new List<Integer>();//getLastFourYears();
                Integer [] lastFourYearsRx = new List<Integer>();                
                //system.debug('Years : '+arrayOfYears);
                List<Financial__c> financialList = new List<Financial__c>();
                if(schema.sobjecttype.Financial__c.isaccessible() && schema.sobjecttype.Financial__c.isQueryable()) {                                                                                                                  
                    
                    financialList = [SELECT Membership_Type__c,Current_Year__c,Deal_years__c, Margin__c, Revenue__c, Year__c, Membership__c, Company__c,Id,Last_Updated__c, TotExp__c, TotExpRx__c FROM Financial__c where Company__c = :AccountId and Financial_Type__c = :RecordType WITH USER_MODE ORDER BY Year__c DESC, LastModifiedDate DESC];
                    system.debug('Query : '+financialList);
                }
                for(Financial__c fin1: financialList)
                {	
                    
                    //system.debug('isYearAdded : '+isYearAdded.contains(csr.Year__c));
                    if(fin1.Membership_Type__c == 'Medical' && !lastFourYearsMed.contains(fin1.Year__c.year()) && lastFourYearsMed.size() < 4){
                        lastFourYearsMed.add(fin1.Year__c.year());                                                                                
                    }else if(fin1.Membership_Type__c == 'RX' && !lastFourYearsRx.contains(fin1.Year__c.year()) && lastFourYearsRx.size() < 4){
                        lastFourYearsRx.add(fin1.Year__c.year());
                    }                        
                }
                if(lastFourYearsMed.size() <4){
                    for(Integer i=lastFourYearsMed.size();i<4;i++){
                        lastFourYearsMed.add(0);   
                    }
                }
                if(lastFourYearsRx.size() <4){
                    for(Integer i=lastFourYearsRx.size();i<4;i++){
                        lastFourYearsRx.add(0);   
                    }
                }
                lastFourYearsMed.sort();
                lastFourYearsRx.sort();
                List<Integer> finalList = new List<Integer>();
                for(Integer i = lastFourYearsMed.size()-1; i>=0;i--)
                {
                    arrayOfYearsMed.add(lastFourYearsMed.get(i));
                }
                for(Integer i = lastFourYearsRx.size()-1; i>=0;i--)
                {
                    arrayOfYearsRx.add(lastFourYearsRx.get(i));
                }
                system.debug('arrayOfYears : '+arrayOfYearsMed);
                
                List<String []> medicalList = new LIST<String []>();
                String [] membershipData = new List<String>(); 
                membershipData.add('Membership');
                String [] revenueData = new List<String>(); 
                revenueData.add('Revenue');  
                String [] marginData = new List<String>(); 
                marginData.add('Margin');  
                String [] dealYearsData = new List<String>(); 
                dealYearsData.add('Deal Years');  
                String [] currentYearsData = new List<String>(); 
                currentYearsData.add('Current Year');
                String [] LastUpdated = new List<String>(); 
                LastUpdated.add('Last Updated');
                
                List<String []> rxList = new LIST<String []>();
                String [] membershipDataRx = new List<String>(); 
                membershipDataRx.add('Membership');
                String [] revenueDataRx = new List<String>(); 
                revenueDataRx.add('Revenue');  
                String [] marginDataRx = new List<String>(); 
                marginDataRx.add('Margin'); 
                String [] LastUpdatedRx = new List<String>(); 
                LastUpdatedRx.add('Last Updated');
                // Integer i = 3;
                for(Integer i=3; i>=0; i--){
                    Boolean isRxAdded = false,isMedicalAdded = false;
                    Boolean isMedicalExist = false,isRxExist = false;
                    Decimal membershipMed=0,revenueMed=0,marginMed=0;
                    Decimal membershipRx=0,revenueRx=0,marginRx=0;
                    Date lastUpdated_Medical = date.newinstance(1700, 1, 1);
                    Date lastUpdated_Rx = date.newinstance(1700, 1, 1);
					String dealYear = '',currentYear = '';                    
                    for(Financial__c fin : financialList)
                    {                          
                        if(fin.Membership_Type__c == 'Medical'){                            
                            if(fin.Year__c.year() == arrayOfYearsMed[i]){                                
                                isMedicalExist = true;
                                /*if(fin.Membership__c != null){
                                    membershipMed = membershipMed + fin.Membership__c;
                                }
                                if(fin.Revenue__c != null){
                                    revenueMed = revenueMed + fin.Revenue__c;                               
                                }      
                                if(fin.Margin__c != null){
                                    marginMed = marginMed + fin.Margin__c;                                
                                }*/
                                if(fin.Last_Updated__c > lastUpdated_Medical){
                                    lastUpdated_Medical = fin.Last_Updated__c;
                                    if(fin.Membership__c != null){
                                    	membershipMed = fin.Membership__c;
                                    }
                                    if(fin.Revenue__c != null){
                                        revenueMed = fin.Revenue__c;                               
                                    }      
                                    if(fin.Margin__c != null){
                                        marginMed = fin.Margin__c;                                
                                    }
                                    if(fin.Deal_years__c != null){
                                        dealYear = String.valueOf(fin.Deal_years__c);
                                    }  
                                    if(fin.Current_Year__c != null){
                                        currentYear = String.valueOf(fin.Current_Year__c);
                                    }
                                }                                                                                                             
                            }                            
                        }else{
                            if(fin.Year__c.year() == arrayOfYearsRx[i]){                              
                                isRxExist = true;                                                                                                                                  
                                if(fin.Last_Updated__c > lastUpdated_Rx){
                                    lastUpdated_Rx = fin.Last_Updated__c;
                                    if(fin.Membership__c != null){
                                        membershipRx = fin.Membership__c;
                                    }  
                                    if(fin.Revenue__c != null){
                                        revenueRx = fin.Revenue__c;                               
                                    }                              
                                    if(fin.TotExp__c != null && fin.TotExpRx__c != null){
                                        /*Decimal margin_Rx = fin.TotExp__c - fin.TotExpRx__c; 
                                        marginRx = marginRx + margin_Rx;  */
                                        marginRx = fin.TotExp__c - fin.TotExpRx__c; 
                                    }
                                }                                   
                            }                           
                        }                       
                    }
                    if(!isMedicalExist){
                        membershipData.add('');
                        revenueData.add('');
                        marginData.add('');
                        dealYearsData.add('');
                        currentYearsData.add('');
                        LastUpdated.add('');
                    }else{
                        membershipData.add(membershipMed.format());
                        revenueData.add('$'+revenueMed.format());
                        marginData.add('$'+marginMed.format());
                        dealYearsData.add(dealYear);
                        currentYearsData.add(currentYear);
                        if(lastUpdated_Medical == date.newinstance(1700, 1, 1)){
                            LastUpdated.add('');
                        }else{
                            LastUpdated.add(lastUpdated_Medical.format());
                        }                        
                        
                    }
                    if(!isRxExist){
                        membershipDataRx.add('');
                        revenueDataRx.add('');
                        marginDataRx.add('');
                        LastUpdatedRx.add('');
                    }else{
                        membershipDataRx.add(membershipRx.format());
                        revenueDataRx.add('$'+revenueRx.format());
                        marginDataRx.add('$'+marginRx.format());
                        if(lastUpdated_Rx == date.newinstance(1700, 1, 1)){
                            LastUpdatedRx.add('');
                        }else{
                            LastUpdatedRx.add(lastUpdated_Rx.format());
                        }                           
                    }                    
                }
                
                medicalList.add(membershipData);
                medicalList.add(revenueData);
                medicalList.add(marginData);
                medicalList.add(dealYearsData);
                medicalList.add(currentYearsData);
                medicalList.add(LastUpdated);
                rxList.add(membershipDataRx);
                rxList.add(revenueDataRx);
                rxList.add(marginDataRx);
                rxList.add(LastUpdatedRx);
                financialReturnMap.put('Medical',medicalList);
                financialReturnMap.put('rxData',rxList);
                financialReturnMap.put('YearArrayMed',arrayOfYearsMed);
                financialReturnMap.put('YearArrayRx',arrayOfYearsRx);         
            } else{
                throw new NullPointerException();
            }
            
        }catch(NullPointerException nullPointerEx) {
            System.debug('No Access to query the Contact object from SF in FinancialsApex() '+
                         'method -> '+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Contact object from SF in FinancialsApex() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in FinancialsApex() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
        }catch(Exception e) {
            System.debug('Error occurred in FinancialsApex() method while querying the details of '+
                         'CMContacts from SF -> ' + e.getMessage());
        }      
        System.debug('Exit CMAccounts <FinancialsApex()>');     
        return financialReturnMap;        
    }
}