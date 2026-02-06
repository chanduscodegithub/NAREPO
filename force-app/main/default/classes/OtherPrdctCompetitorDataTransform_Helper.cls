public class OtherPrdctCompetitorDataTransform_Helper {
    
    public static List<Competitor__c> getOtherProductCompetitorListToInsert(Competitor__c othrPrdctCompetitorRec){
        
        List<Competitor__c> returnList=new List<Competitor__c>();
        
        Map<String,String> map1=new Map<String,String>();
        map1.put('Concierge Vendor','Advocacy');
        map1.put('Diabetes','Disease Management');
        map1.put('Health Risk Assessment','Rewards/Incentives Program');
        map1.put('Advocacy','Advocacy');
        map1.put('Disease Management','Disease Management');
        map1.put('Rewards/Incentives Program','Rewards/Incentives Program');
        
        if(String.isEmpty(othrPrdctCompetitorRec.TypesofOtherProductsServicesProvide__c)){
            returnList.add(buildCompetitorRecord(othrPrdctCompetitorRec,''));
        }else{
            if(!othrPrdctCompetitorRec.TypesofOtherProductsServicesProvide__c.contains(';')){
                
                if(othrPrdctCompetitorRec.TypesofOtherProductsServicesProvide__c!='International Pooling'){
                    
                    String productName='';
                    
                    if(map1.containsKey(othrPrdctCompetitorRec.TypesofOtherProductsServicesProvide__c)){
                        productName=map1.get(othrPrdctCompetitorRec.TypesofOtherProductsServicesProvide__c);
                    }else{
                        productName=othrPrdctCompetitorRec.TypesofOtherProductsServicesProvide__c;
                    }
                    
                    
                   
                    returnList.add(buildCompetitorRecord(othrPrdctCompetitorRec, productName));
                }
                
            }else{
                List<String> otherProductList=othrPrdctCompetitorRec.TypesofOtherProductsServicesProvide__c.split(';');
                boolean advocacyExists=false;
                boolean diseaseManagementExists=false;
                boolean rewardsOrIncentivesProgramExists=false;
                for(String eachOtherProduct:otherProductList){
                    if(eachOtherProduct!='International Pooling'){
                        if((eachOtherProduct=='Advocacy' || eachOtherProduct=='Concierge Vendor') 
                           && advocacyExists==false){
                            returnList.add(buildCompetitorRecord(othrPrdctCompetitorRec,'Advocacy'));
                            advocacyExists=true;
                        }else if((eachOtherProduct=='Disease Management' || eachOtherProduct=='Diabetes') 
                           && diseaseManagementExists==false){
                            returnList.add(buildCompetitorRecord(othrPrdctCompetitorRec,'Disease Management'));
                            diseaseManagementExists=true;
                        }else if((eachOtherProduct=='Rewards/Incentives Program' || eachOtherProduct=='Health Risk Assessment') 
                           && rewardsOrIncentivesProgramExists==false){
                            returnList.add(buildCompetitorRecord(othrPrdctCompetitorRec,'Rewards/Incentives Program'));
                            rewardsOrIncentivesProgramExists=true;  
                        }else if(!map1.containsKey(eachOtherProduct)){
                            returnList.add(buildCompetitorRecord(othrPrdctCompetitorRec,eachOtherProduct));
                        }
                        
                    }
                    
                }
                
            }
            
        }
        return returnList;
    }
    
    public static Competitor__c buildCompetitorRecord(Competitor__c competitorRec,String productName){
        
        Competitor__c returnRec = new Competitor__c();
        returnRec.Account__c=competitorRec.Account__c;
        returnRec.CompetitorAccount__c=competitorRec.CompetitorAccount__c;
        if(productName!=''){
            returnRec.Type_of_Products_Services_Provided__c=productName;
        }
        returnRec.Comments__c=competitorRec.Comments__c;
        returnRec.competitorclassification__c=competitorRec.competitorclassification__c;
        returnRec.type__c=competitorRec.type__c;
        returnRec.NumberOfMembersHeld__c=0;
        returnRec.ofMembersHeld__c=0;
        
        return returnRec;
                            
    }
    
}