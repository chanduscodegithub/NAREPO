public class SpecialCharacterBatchMetadataQuery {
    @AuraEnabled
    Public Static SpclCharValues getApiNames(String objename){
        String apiname = '';
        SpclCharValues splCharVal = new SpclCharValues();
        String BuildQueryStr = '';
        Special_character_batch_MTD__mdt specialcharscterMdt = [SELECT Itag_value__c,Object_value__c  FROM Special_character_batch_MTD__mdt where Object_value__c =: objename ];
        System.debug('Itag_value__c'+specialcharscterMdt.Itag_value__c);
        if(specialcharscterMdt.Itag_value__c == null || specialcharscterMdt.Itag_value__c == ''){
            specialcharscterMdt = [SELECT Itag_value_long__c,Object_value__c  FROM Special_character_batch_MTD__mdt where Object_value__c =: objename ]; 
            apiname = specialcharscterMdt.Itag_value_long__c; 
        }else{
            apiname = specialcharscterMdt.Itag_value__c;  
        }
        System.debug('apiname'+apiname);
        List<String> apiNames = new List<String>();
        List<sObject>  genData = new List<sObject>();
        if(apiname != null && apiname != ''){
            apiNames = apiname.split(','); 
        }
        if(apiNames.size() > 0){
            splCharVal.apiList = apiNames; 
            for(String itag:apiNames){
                if(String.isEmpty(BuildQueryStr)){
                    BuildQueryStr = itag;
                }else{
                    BuildQueryStr = BuildQueryStr+','+itag;
                }
            }
            string query = 'Select '+BuildQueryStr+' from '+ objename;
            System.debug('query'+query);
            genData = Database.query(query);
            splCharVal.genListData = genData;
        }
        return splCharVal;
    }
    @AuraEnabled
    public static String getobjectNames( ){
        String objNames = '';
        List<Special_character_batch_MTD__mdt> specialcharscterMdt = [SELECT Object_value__c  FROM Special_character_batch_MTD__mdt ]; 
        for(Special_character_batch_MTD__mdt Str : specialcharscterMdt ){
            If(objNames != '' && objNames != null){
                objNames = objNames+','+Str.Object_value__c;
                System.debug('objNames >>> in else '+objNames); 
            }else{
                objNames = ''+','+Str.Object_value__c;
                System.debug('objNames >>>  in if'+objNames);
                
            }
            
            System.debug('objNames >>> '+objNames);
        }
        return objNames; 
    }
    
    public class SpclCharValues {
        
        @AuraEnabled
        public List<sObject> genListData { get;set; }
        
        @AuraEnabled
        public List<String> apiList { get;set;}
        
        
    }
    
}