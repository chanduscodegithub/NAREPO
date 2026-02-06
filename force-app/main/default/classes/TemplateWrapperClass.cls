public class TemplateWrapperClass {    
    @AuraEnabled
    public string xmlTempleteString { get;set; }   
    
    @AuraEnabled
    public string parentObj { get;set; }   
    
    @AuraEnabled
    	public Map<String,Set<String>> objectItagesMap { get;set; } 
    
    @AuraEnabled
    public List<ReadAndGenerateXML.SobjectRecordWrapperClass> sobjectRecordWrapperClassList { get;set; } 
        
     @AuraEnabled
    public Map<String,String> CUSTOM_OBJECT_MAP { get;set; } 
    
    @AuraEnabled
    public Map<String,String> OBJECT_FILTER_RECORDS { get;set; } 
}