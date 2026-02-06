public without sharing class ClientSurveyDML {

    public static Database.SaveResult[] updateContacts(List<Contact> listTobeUpdated){
        Database.SaveResult[] dbUpdateResultList = Database.update(listTobeUpdated, false);
        return dbUpdateResultList;
    }

    public static ProductMix__c updateProductMix(ProductMix__c ProductMix){
        update productMix;
        return productMix;
    }
}