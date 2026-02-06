@isTest
private class OthrPrdctCompetitorDataTrnsfrmBatch_Test {
    
    @testSetup 
    static void createTestData() {
        List<Account> testAccRecords = new List<Account>();
        testAccRecords.add(new Account(Name='Test CM Account 1',Subtype__c ='Specialty Benefits Only',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId()));
        testAccRecords.add(new Account(Name='Test CD Account 1',Subtype__c ='Prospect',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()));
        /*testAccRecords.add(new Account(Name='Aetna',Subtype__c ='Competitor',
                           RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        testAccRecords.add(new Account(Name='Cigna',Subtype__c ='Competitor',
                           RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        testAccRecords.add(new Account(Name='Blue',Subtype__c ='Competitor',
                           RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));*/
        testAccRecords.add(new Account(Name='UHC-Optum',Subtype__c ='Competitor',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        testAccRecords.add(new Account(Name='Optum Rx',Subtype__c ='Competitor',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        testAccRecords.add(new Account(Name='National Accounts',Subtype__c ='Competitor',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        testAccRecords.add(new Account(Name='Total',Subtype__c ='Competitor',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        
        for(integer i=1;i<=10;i++){
            testAccRecords.add(new Account(Name='Test Competitor Acc '+i,Subtype__c ='Competitor',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        }

        insert testAccRecords;
        Map<String,String> accNameAndIdMap=new Map<String,String>();
        List<String> nonCompetitorAccountNameList=new List<String>{'Test CM Account 1','Test CD Account 1','UHC-Optum','Optum Rx','National Accounts','Total'};
        List<String> productNameList=new List<String>{'Medical','Pharmacy','Dental','Vision','Other'};
        for(Account eachAcc:testAccRecords){
            accNameAndIdMap.put(eachAcc.Name,eachAcc.Id);
        }
        List<Competitor__c> testCompetitorRecords=new List<Competitor__c>();
        
        for(String accName:accNameAndIdMap.keySet()){
            if(!nonCompetitorAccountNameList.contains(accName)){
                for(String eachProductName:productNameList){
                 	Competitor__c competitorAssociatedToCMAcc=new Competitor__c();
                    Competitor__c competitorAssociatedToCDAcc=new Competitor__c();
                    Competitor__c otherCompetitorAssctdToCMAccTobeDeleted=new Competitor__c();
                    Competitor__c otherCompetitorAssctdToCDAccTobeDeleted=new Competitor__c();
                    //-------------------
                    competitorAssociatedToCMAcc.Account__c=accNameAndIdMap.get('Test CM Account 1');
                    competitorAssociatedToCMAcc.CompetitorAccount__c=accNameAndIdMap.get(accName);
                    competitorAssociatedToCMAcc.competitorclassification__c=eachProductName;
                    competitorAssociatedToCMAcc.type__c='Account Competitor';
                    if(eachProductName=='Other'){
                        competitorAssociatedToCMAcc.TypesofOtherProductsServicesProvide__c='401(k) Administrator;Advocacy';
                        otherCompetitorAssctdToCMAccTobeDeleted=competitorAssociatedToCMAcc.clone(false,false,false,false);
                        otherCompetitorAssctdToCMAccTobeDeleted.OtherPrdctCompetitorRecordTobeDeleted__c=true;
                        testCompetitorRecords.add(otherCompetitorAssctdToCMAccTobeDeleted);
                    }
                    
                    //-----------------
                    
                    //-------------------
                    competitorAssociatedToCDAcc.Account__c=accNameAndIdMap.get('Test CD Account 1');
                    competitorAssociatedToCDAcc.CompetitorAccount__c=accNameAndIdMap.get(accName);
                    competitorAssociatedToCDAcc.competitorclassification__c=eachProductName;
                    competitorAssociatedToCDAcc.type__c='Account Competitor';
                    if(eachProductName=='Other'){
                        competitorAssociatedToCDAcc.TypesofOtherProductsServicesProvide__c='401(k) Administrator';
                        otherCompetitorAssctdToCDAccTobeDeleted=competitorAssociatedToCDAcc.clone(false,false,false,false);
                        otherCompetitorAssctdToCDAccTobeDeleted.OtherPrdctCompetitorRecordTobeDeleted__c=true;
                        testCompetitorRecords.add(otherCompetitorAssctdToCDAccTobeDeleted);
                    }
                    
                    //-----------------
                    
                    
                    testCompetitorRecords.add(competitorAssociatedToCMAcc);
                    testCompetitorRecords.add(competitorAssociatedToCDAcc);
                    
                }
                
            }
            
        }
        
        
        testCompetitorRecords.add(new Competitor__c(Account__c=accNameAndIdMap.get('Test CD Account 1'),CompetitorAccount__c=accNameAndIdMap.get('Test Competitor Acc 1'),
                                                    type__c='Account Competitor'));
        testCompetitorRecords.add(new Competitor__c(Account__c=accNameAndIdMap.get('Test CD Account 1'),CompetitorAccount__c=accNameAndIdMap.get('Test Competitor Acc 1'),
                                                    competitorclassification__c='Other',type__c='Account Competitor',
                                                    TypesofOtherProductsServicesProvide__c=''));
        testCompetitorRecords.add(new Competitor__c(Account__c=accNameAndIdMap.get('Test CD Account 1'),CompetitorAccount__c=null,
                                                    competitorclassification__c='Other',type__c='Account Competitor',
                                                    TypesofOtherProductsServicesProvide__c=''));
        testCompetitorRecords.add(new Competitor__c(Account__c=accNameAndIdMap.get('Test CD Account 1'),CompetitorAccount__c=accNameAndIdMap.get('Test Competitor Acc 1'),
                                                    competitorclassification__c='',type__c='Account Competitor',
                                                    TypesofOtherProductsServicesProvide__c=''));
        
        insert testCompetitorRecords;
        
        
    }
    
    static testmethod void UpsertTest() {        
        Test.startTest();
        OtherPrdctCompetitorDataTransform_Batch batchObj = new OtherPrdctCompetitorDataTransform_Batch('Upsert');
        Id batchId = Database.executeBatch(batchObj);
        Test.stopTest();
        
    }
    
    static testmethod void DeleteTest() {        
        Test.startTest();
        OtherPrdctCompetitorDataTransform_Batch batchObj = new OtherPrdctCompetitorDataTransform_Batch('Delete');
        Id batchId = Database.executeBatch(batchObj);
        Test.stopTest();
    }
    

}