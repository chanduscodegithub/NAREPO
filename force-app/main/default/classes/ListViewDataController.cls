public without sharing class ListViewDataController {
    
    @AuraEnabled
    public static ListViewDataWrapper getListViewDataFromController(){        
        ListViewDataWrapper listViewDataWrapper =  new ListViewDataWrapper();
        
        Map<String,List<String>>  listViewDataMap = new Map<String,List<String>>();
        Map<String,String>  listViewDataIdMap = new Map<String,String>();
        
        List<String> sobjectTypeList = new List<String>();
        
        List<String> sobjectList = new List<String>();                
        
        sobjectList.add('Account');
        sobjectList.add('Contact');
        sobjectList.add('Opportunity');
        
        System.debug('listViewDataMap : '+listViewDataMap);
        
        List<ListView> listViewData = [SELECT Id, Name, SobjectType FROM ListView where SobjectType IN :sobjectList];        
        for(ListView listViewObj : listViewData){             
            listViewDataIdMap.put(listViewObj.SobjectType+'@@'+listViewObj.Name,listViewObj.Id);
            
            if(listViewDataMap.containsKey(listViewObj.SobjectType)){
                List<String> listNames = listViewDataMap.get(listViewObj.SobjectType);
                listNames.add(listViewObj.Name);
                listViewDataMap.put(listViewObj.SobjectType,listNames);
            }else{
                List<String> listNames = new List<String>();
                listNames.add('');
                listNames.add(listViewObj.Name);
                sobjectTypeList.add(listViewObj.SobjectType);
                listViewDataMap.put(listViewObj.SobjectType,listNames);
            }  
        }                            
        System.debug('listViewDataMap : '+listViewDataMap);
        listViewDataWrapper.sObjectType = sobjectTypeList;
        listViewDataWrapper.listViewDataIdMap = listViewDataIdMap;        
        listViewDataWrapper.sObjectTypeMap = listViewDataMap;        
        return listViewDataWrapper;
    }   
   
    @AuraEnabled
    public static ListViewWrapperClass getFilterQuery(String listViewId, String sObjectType){
        System.debug('listViewId '+listViewId); 
        String csvData = '';
        //RestDataWrapper restDataWrapper = new RestDataWrapper();        
        ListViewWrapperClass listViewClass = new ListViewWrapperClass();
        try{
            String ColumnQuery = '';
            HTTP http=new HTTP();
            HTTPRequest hres=new HTTPRequest();
            // Named Credential with name ListViewExportNamedCredential will get the Base URL.
            hres.setEndpoint('callout:ListViewExport_Named_Credentials'+'/services/data/v41.0/sobjects/'+sObjectType+'/listviews/'+listViewId+'/describe');
            hres.setMethod('GET');
            //hres.setHeader('Authorization','Bearer {!$Credential.OAuthToken}'); //Named Credential is referenced here to get the OAuth token automatically. 
            HttpResponse response=http.send(hres);
            System.debug(response.getBody());
            System.debug('response.getBody()'+response.getBody());            
            Map<String, Object> tokenResponse = (Map<String, Object>)          
                JSON.deserializeUntyped(response.getBody());
            String query = (String) tokenResponse.get('query');
            
            Map<String,String> columnData = new Map<String,String>();
            
            for(String key : tokenResponse.keySet()){               
                if(key.contains('columns')){
                    List<Object> colList = (List<Object>)tokenResponse.get(key);
                    for(Object obj : colList){
                        Map<String,Object> colMap = (Map<String,Object>)obj;
                        if(colMap.containsKey('hidden') && !(Boolean)colMap.get('hidden')){
                            columnData.put(String.valueOf(colMap.get('label')),String.valueOf(colMap.get('fieldNameOrPath')));
                            ColumnQuery += String.valueOf(colMap.get('fieldNameOrPath'));
                            ColumnQuery +=',';  
                        }
                    }
                }   
            }
            system.debug('Query   :' +query);
            system.debug('columnData' +columnData);            
            system.debug('ColumnQuery  :'+ColumnQuery);
            listViewClass.columnData = columnData;
            List<String> NewQuery = query.split('FROM');
            system.debug('NewQuery  :'+NewQuery[0]);
            String  updatedQuery = 'Select ' +ColumnQuery+ 'ID FROM' + NewQuery[1];
            system.debug('updatedQuery' +updatedQuery);            
            List<SObject> sobjectRecords = Database.query(updatedQuery);
            listViewClass.sobjectRecords = sobjectRecords;
            
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber());
            System.debug('Exception  '+ex.getMessage());
        }          
        return listViewClass;
    }
    
    public class ListViewDataWrapper{
        @AuraEnabled
        public list<String> sObjectType {get;set;}
        
        @AuraEnabled
        public Map<String,List<String>> sObjectTypeMap {get;set;}
        
        @AuraEnabled
        public Map<String,String>  listViewDataIdMap {get;set;}
    } 
    
    public class RestDataWrapper{
        @AuraEnabled
        public String query {get;set;}
        
        @AuraEnabled
        public Map<String,String> columnData {get;set;}  
    }
    
    public class ListViewWrapperClass{
        @AuraEnabled
        public List<SObject> sobjectRecords {get;set;}
        
        @AuraEnabled
        public Map<String,String> columnData {get;set;}  
    }
    
    
}