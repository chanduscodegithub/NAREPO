/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 04-18-2024
 * @last modified by  : Spoorthy
**/
public with sharing class MedicalMemByMarket {
    
    @AuraEnabled
    public static Map<String,Object> getMedicalMemByMarket(Id AccountId){
        Map<String,Object> memByMktData = new Map<String,Object>();
        Map<String,Double> memByMktMap = new Map<String,Double>();
        String glDate = '';
        List<MembershipbyMkt__c> memMktObj = [SELECT Members__c,Region__c,State__c,GL_Date__c FROM MembershipbyMkt__c where AccountFirm__c=:AccountId WITH USER_MODE]; 
        double northEast = 0,southEast = 0,central = 0,west = 0,other = 0,total=0;
        for(MembershipbyMkt__c mktObj : memMktObj)
        {   
            if(mktObj.Region__c != null && mktObj.Members__c != null){
                if(mktObj.Region__c == 'Northeast'){          
                	northEast = northEast + Double.valueOf(mktObj.Members__c);
                }else if(mktObj.Region__c == 'Southeast'){
                    southEast = southEast + Double.valueOf(mktObj.Members__c);
                }else if(mktObj.Region__c == 'Central'){
                    central = central + Double.valueOf(mktObj.Members__c);
                }else if(mktObj.Region__c == 'West'){
                    west = west + Double.valueOf(mktObj.Members__c);
                }else if(mktObj.Region__c == 'Other'){
                    other = other + Double.valueOf(mktObj.Members__c);
                }
                total = total + Double.valueOf(mktObj.Members__c);
            }
            if(glDate == '' && mktObj.GL_Date__c != null){
                glDate = String.valueOf(mktObj.GL_Date__c);
            }
        }
        memByMktMap.put('Northeast',northEast);
        memByMktMap.put('Southeast',southEast);
        memByMktMap.put('Central',central);
        memByMktMap.put('West',west);
        memByMktMap.put('Other',other);
        memByMktMap.put('Total',total);
        memByMktData.put('RegionsData',memByMktMap);
        memByMktData.put('GL_Date',glDate);
        return memByMktData;
    }
    // @AuraEnabled
    // public static Map<String,Double> getMedicalStateByMarket(Id AccountId,String region){       
    //     Map<String,Double> memByMktStateMap = new Map<String,Double>();
    //     AggregateResult[] memMktObj = [SELECT State__c,sum(Members__c) FROM MembershipbyMkt__c where AccountFirm__c=:AccountId And Region__c =:region group by State__c Order By sum(Members__c) desc]; 
    //     double northEast = 0,southEast = 0,central = 0,west = 0,other = 0,total=0;
    //     for(AggregateResult mktObj : memMktObj)
    //     {   
    //        memByMktStateMap.put(String.valueOf(mktObj.get('State__c')),Double.valueOf(mktObj.get('expr0')));                               
    //     }             
    //     return memByMktStateMap;
    // }

    @AuraEnabled
    public static Map<String, Map<String, Object>> getMedicalStateByMarket(Id AccountId, String region) {
    Map<String, Map<String, Object>> memByMktStateMap = new Map<String, Map<String, Object>>();
    AggregateResult[] memMktObjTotal = [
        SELECT State__c, 
            SUM(Members__c) totalMembers,
            SUM(Surest_Market_Members__c) surestMembers,
            SUM(UNET_Market_Members__c) unetMembers,
            SUM(UMR_Market_Members__c) umrMembers
        FROM MembershipbyMkt__c 
        WHERE AccountFirm__c = :AccountId 
        AND Region__c = :region WITH USER_MODE
        GROUP BY State__c 
        ORDER BY SUM(Members__c) DESC
    ]; 
        for (AggregateResult mktObj : memMktObjTotal) {
            String state = String.valueOf(mktObj.get('State__c'));
            Double totalMembers = (Double)mktObj.get('totalMembers');
            Double surestMembers = (Double)mktObj.get('surestMembers');
            Double unetMembers = (Double)mktObj.get('unetMembers');
            Double umrMembers = (Double)mktObj.get('umrMembers');
            
            Map<String, Object> fieldValues = new Map<String, Object>();
            fieldValues.put('Members__c', totalMembers);
            fieldValues.put('Surest_Market_Members__c', surestMembers);
            fieldValues.put('UNET_Market_Members__c', unetMembers);
            fieldValues.put('UMR_Market_Members__c', umrMembers);
            
            memByMktStateMap.put(state, fieldValues);
        }             
        return memByMktStateMap;
    }

    
    @AuraEnabled
    public static Map<String,Double> getMedicalUnetsByMarket(Id AccountId,String region,String state){       
        Map<String,Double> memByMktUnetMap = new Map<String,Double>();
        AggregateResult[] memMktObj = [SELECT UNETMarket__c, sum(Members__c) FROM MembershipbyMkt__c where AccountFirm__c=:AccountId And Region__c =:region AND State__c=:state WITH USER_MODE group by UNETMarket__c Order By sum(Members__c) desc]; 
        double northEast = 0,southEast = 0,central = 0,west = 0,other = 0,total=0;
        for(AggregateResult mktObj : memMktObj)
        {   
           memByMktUnetMap.put(String.valueOf(mktObj.get('UNETMarket__c')),Double.valueOf(mktObj.get('expr0')));                               
        }             
        return memByMktUnetMap;
    }

    @AuraEnabled
    public static Map<String,Object> getMedicalMemByMarketSurest(Id AccountId){
        Map<String,Object> memByMktData = new Map<String,Object>();
        Map<String,Double> memByMktMap = new Map<String,Double>();
        String glDate = '';
        List<MembershipbyMkt__c> memMktObj = [SELECT Members__c,Surest_Market_Members__c,Region__c,State__c,GL_Date__c FROM MembershipbyMkt__c where AccountFirm__c=:AccountId WITH USER_MODE]; 
        double northEast = 0,southEast = 0,central = 0,west = 0,other = 0,total=0;
        for(MembershipbyMkt__c mktObj : memMktObj)
        {   
            if(mktObj.Region__c != null && mktObj.Surest_Market_Members__c != null){
                if(mktObj.Region__c == 'Northeast'){          
                	northEast = northEast + Double.valueOf(mktObj.Surest_Market_Members__c);
                }else if(mktObj.Region__c == 'Southeast'){
                    southEast = southEast + Double.valueOf(mktObj.Surest_Market_Members__c);
                }else if(mktObj.Region__c == 'Central'){
                    central = central + Double.valueOf(mktObj.Surest_Market_Members__c);
                }else if(mktObj.Region__c == 'West'){
                    west = west + Double.valueOf(mktObj.Surest_Market_Members__c);
                }else if(mktObj.Region__c == 'Other'){
                    other = other + Double.valueOf(mktObj.Surest_Market_Members__c);
                }
                total = total + Double.valueOf(mktObj.Surest_Market_Members__c);
            }
            if(glDate == '' && mktObj.GL_Date__c != null){
                glDate = String.valueOf(mktObj.GL_Date__c);
            }
        }
        memByMktMap.put('Northeast',northEast);
        memByMktMap.put('Southeast',southEast);
        memByMktMap.put('Central',central);
        memByMktMap.put('West',west);
        memByMktMap.put('Other',other);
        memByMktMap.put('Total',total);
        memByMktData.put('RegionsData',memByMktMap);
        memByMktData.put('GL_Date',glDate);
        return memByMktData;
    }
    @AuraEnabled
    public static Map<String,Double> getMedicalStateByMarketSurest(Id AccountId,String region){       
        Map<String,Double> memByMktStateMap = new Map<String,Double>();
        AggregateResult[] memMktObj = [SELECT State__c,sum(Surest_Market_Members__c) FROM MembershipbyMkt__c where AccountFirm__c=:AccountId And Region__c =:region WITH USER_MODE group by State__c Order By sum(Surest_Market_Members__c) desc]; 
        double northEast = 0,southEast = 0,central = 0,west = 0,other = 0,total=0;
        for(AggregateResult mktObj : memMktObj)
        {   
           memByMktStateMap.put(String.valueOf(mktObj.get('State__c')),Double.valueOf(mktObj.get('expr0')));                               
        }             
        return memByMktStateMap;
    }
    
    @AuraEnabled
    public static Map<String,Double> getMedicalUnetsByMarketSurest(Id AccountId,String region,String state){       
        Map<String,Double> memByMktUnetMap = new Map<String,Double>();
        AggregateResult[] memMktObj = [SELECT UNETMarket__c, sum(Surest_Market_Members__c) FROM MembershipbyMkt__c where AccountFirm__c=:AccountId And Region__c =:region AND State__c=:state WITH USER_MODE group by UNETMarket__c Order By sum(Surest_Market_Members__c) desc]; 
        double northEast = 0,southEast = 0,central = 0,west = 0,other = 0,total=0;
        for(AggregateResult mktObj : memMktObj)
        {   
           memByMktUnetMap.put(String.valueOf(mktObj.get('UNETMarket__c')),Double.valueOf(mktObj.get('expr0')));                               
        }             
        return memByMktUnetMap;
    }

}