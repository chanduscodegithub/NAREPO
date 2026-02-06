public class importDataFromCSVController {
    public String documentName {get;set;}
    public Blob csvFileBody{get;set;}
    public String[] competitiveDataLines {get;set;}
    public boolean readSuccess {get;set;}
    public List<String> lstFieldNames{get;set;}
    public String finalMapString{get;set;}
    public set<String> finalOnDemandDataId{get;set;}
    public String error{get;set;}
    String competitiveString;
    String fieldValue;
    Integer fieldNumber;
    Map <Integer,String> fieldNumberMap = new Map <Integer,String> ();
    public importDataFromCSVController() {
        documentName = '';
        readSuccess = FALSE;
        competitiveDataLines = new String[] {};
            lstFieldNames = new List<String>();
    }
    public void readFromFile(){
        try{
            competitiveString = csvFileBody.toString();
            System.debug('competitiveString'+competitiveString);
            Map <String,Map<String,String>> finalData = readCSVFile();
            List<Account> acc = Database.query('Select Id,Merit_Row_Id__c from Account where Merit_Row_Id__c IN :finalOnDemandDataId');
            System.debug('Size'+acc.size());
            System.debug('Size'+acc);
            Map<String,String> onDemandID = new Map<String,String>();
            for(Account getData: acc){
                onDemandID.put(getData.Merit_Row_Id__c, getData.Id);
            }
            System.debug('onDemandID'+onDemandID);
            Database.executeBatch(new compitiiveLandScapeOtherBatch(finalData,onDemandID), 200);
        }
        catch(exception e){
            readSuccess = FALSE;
            error = e.getMessage();
        }
    }    
    public Map <String,Map<String,String>> readCSVFile() {
        List<String> csvRecordData =  new List<String>();
        String picklistString = '';
        string picklistVal = '';
        Boolean result =false;
        Map < String, List<String> > fieldMap = new Map < String, List<String> > ();
        Map <String,Map<String,String>> finalMap = new Map <String, Map <String,String>> ();
        competitiveDataLines = competitiveString.split('\n');
        string[] csvFieldNames = competitiveDataLines[0].split(',');
        System.debug('csvFieldNames'+csvFieldNames);
        for (Integer i = 0; i < csvFieldNames.size(); i++) {
            fieldNumberMap.put(i,csvFieldNames[i]);
            lstFieldNames.add(csvFieldNames[i].trim());
        }
        System.debug(competitiveDataLines.size());
        for (Integer i = 1; i < competitiveDataLines.size(); i++) {
            csvRecordData = competitiveDataLines[i].split(',');
            fieldMap.put(csvRecordData[0].trim(), csvRecordData);
        }
        
        Set<String> ondemandIds = new Set<String>();
        for (String fieldName : fieldMap.keySet()){
            Map<String,String> buildString = new Map<String,String>();
            for(Integer i=1; i<fieldMap.get(fieldName).size(); i++){
                picklistVal = fieldMap.get(fieldName)[i];
                picklistVal = picklistVal.trim();
                if(picklistVal != '#N/A' && picklistVal != 'Do not migrate'){
                    /*if(buildString.containsKey(picklistVal)){
picklistString = fieldNumberMap.get(i).trim()+';'+buildString.get(picklistVal);
buildString.put(picklistVal, picklistString);
}else{
buildString.put(picklistVal, fieldNumberMap.get(i).trim());
ondemandIds.add(picklistVal);
}*/
                    if(buildString.containsKey(picklistVal)){
                        if(picklistString != null){
                            result =buildString.get(picklistVal).contains(fieldNumberMap.get(i).trim());
                            System.debug(result+'--'+buildString.get(picklistVal));
                        }
                        if(!result){
                            picklistString = fieldNumberMap.get(i).trim()+';'+buildString.get(picklistVal);
                            buildString.put(picklistVal, picklistString);
                        }    
                    }else{
                        buildString.put(picklistVal, fieldNumberMap.get(i).trim());
                        ondemandIds.add(picklistVal);
                    }
                    
                }
                
            }
            finalMap.put(fieldMap.get(fieldName)[0].trim(), buildString);
            finalOnDemandDataId = ondemandIds;
        }
        System.debug('Ondemand Id size '+ondemandIds.size());
        String mapString = String.valueOf(finalMap);
        finalMapString =  mapString;
        return finalMap;
    }
}