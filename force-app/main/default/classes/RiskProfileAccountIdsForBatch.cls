public class RiskProfileAccountIdsForBatch {
    
    public static Set<String> getRiskProfileIdsFromSR(String fileName){
        try{
            // RiskProfileAccountList - SR name
            Set<String> accountIdList = new Set<String>();
            StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = :fileName];
            String xmlBodyString = sr.body.toString();
            String[] accountIdArray = xmlBodyString.split('\n');
            Integer startIndex = 0;        
            if(accountIdArray != null && accountIdArray.size() > 0) {
                for(Integer i = startIndex; i < accountIdArray.size() ; i++){                       
                    accountIdList.add(accountIdArray.get(i).trim());                    
                }                        
            }
            System.debug('accountIdList Size-'+accountIdList.size());
            System.debug('accountIdList-'+accountIdList);        
            return accountIdList;
        }catch(Exception ex){
            System.debug('Ex : '+ex.getMessage());
        }
        return null;
    }
}