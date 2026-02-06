public class CurrentProductApex {
    
    @AuraEnabled
    public static ProductMix fetchdata(Id recordId, Decimal pageNumber){
        
        System.debug('fetchdata(Id recordId, Decimal pageNumber) in CurrentProductApex - START');
        System.debug('Id-'+recordId+', pageNumber-'+pageNumber);
        
        ProductMix productMixObj = new ProductMix();
        Integer pageSize = 5;
        Integer offset = ((Integer)pageNumber - 1) * pageSize;
        System.debug('offset-'+offset);

        try {
            
            //productMixObj.AllCPList = [SELECT Id, Name ,Current_Product_Name__c,AccountFirm__c,AccountFirm__r.Name FROM ProductMix__c  WHERE AccountFirm__c =: recordId];
            productMixObj.total = Database.countQuery('SELECT count() FROM ProductMix__c WHERE AccountFirm__c =: recordId');  
            productMixObj.currentProductsList = [SELECT Id, Name ,Current_Product_Name__c,AccountFirm__c,AccountFirm__r.Name FROM ProductMix__c  WHERE AccountFirm__c =: recordId LIMIT : pageSize OFFSET :offset];                      
            productMixObj.page = (Integer)pageNumber;
            productMixObj.pageSize = pageSize;
            
            System.debug('Current Products List -> '+productMixObj.currentProductsList); 
            System.debug('Number of Current Products '+productMixObj.total);
                        
        } catch(Exception ex){
            System.debug('exception Occured'+ex.getMessage());
        }
        
        System.debug('fetchdata(Id recordId) in CurrentProductApex - END');        
        return productMixObj;
    }
    
    @AuraEnabled
    public static void DeleteRecord(Id tempId){
        
        System.debug('DeleteRecord in CurrentProductApex - START');
        
        try {
            
            if(schema.sobjecttype.ProductMix__c.isaccessible() && schema.sobjecttype.ProductMix__c.isDeletable()) {
                
                System.debug('Id received to delete '+tempId);
                if(tempId != null) {
                    
                    ProductMix__c[] IdtobeDeleted = [SELECT id FROM ProductMix__c WHERE id=:tempId]; 
                    Database.DeleteResult[] dbDelResultList = Database.delete(IdtobeDeleted, false);
                    
                    Boolean isRecordDeleted = true;
                    if(dbDelResultList != null && dbDelResultList.size() > 0) {
                        for (Database.DeleteResult DelResult : dbDelResultList) {
                            if(!DelResult.isSuccess()) {
                                isRecordDeleted = false;            
                                for(Database.Error err : DelResult.getErrors()) {
                                    System.debug('The following error has occurred.');                    
                                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                    System.debug('Fields that affected this error: ' + err.getFields());
                                }
                            }
                        }
                    }
                }
            } else {
                throw new NoAccessException();      
            }       
            
        } catch(NoAccessException noaccessExec) {
            System.debug('No Access to an Product Mix/Current Product object in SF in DeleteRecord() method -> '+
                         noaccessExec.getMessage());
            System.debug('Error in DeleteRecord() method, the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception occurred ---- '+noaccessExec.getMessage());
        } catch(Exception e) {
            System.debug('Error occurred while deleting the record -> '+e);
        }
        
        System.debug('DeleteRecord in CurrentProductApex - END');
    }
    
    @AuraEnabled
    public static Boolean getUserRole(Id recordId) {
        
        Boolean loggedInUserRole = false;
        System.debug('getUserRole in CurrentProductApex - START');
        
        try {
            Id profileId=userinfo.getProfileId();
            String profileName=[Select Id,Name from Profile where Id=:profileId].Name;
            system.debug('ProfileName retrived '+profileName);
            if(profileName == 'System Administrator'){
                loggedInUserRole = true;
                system.debug('Logged in user set to '+loggedInUserRole);
            }
            
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        } 
        System.debug('getUserRole in CurrentProductApex - END');
        return loggedInUserRole;
    }
    
    public class ProductMix {
                      
        @AuraEnabled 
        public List<ProductMix__c> currentProductsList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
        public ProductMix() {            
            currentProductsList = new List<ProductMix__c>();
        }
        
    }
    
}