public with sharing class AccountAPI {

    @AuraEnabled
    public static void sendPolicyData(String policyNumber, Date effectiveDate) {

        try {
            Policy_Information__c policy = [ SELECT Id, Policy__c, Company__c, Company__r.ECRS_Effective_Date__c FROM Policy_Information__c WHERE Policy__c = :policyNumber ];

            if (policy == null) {
                throw new AuraHandledException('Policy not found');
            }

            Id companyId = policy.Company__c;

            List<Opportunity> maList = [ SELECT Id, EffectiveDate__c,
                       AccountId, ( SELECT Id, Product2Id, Name, Sales_Stage__c, Product2.Name, Product2.Product_Line__c
                           FROM OpportunityLineItems WHERE Product2.Name IN ( 'Accident Protection Plan - Voluntary', 'Critical Illness Protection Plan - Voluntary' ) ) FROM Opportunity WHERE AccountId = :companyId ];

            if (maList.isEmpty()) {
                throw new AuraHandledException('MA not found for Effective Date');
            }

            /*Opportunity maRec = maList[0];

            List<OpportunityLineItem> oliList = [SELECT Id, Product2Id, Sales_Stage__c FROM OpportunityLineItem WHERE OpportunityId = :maRec.Id];*/
            
            Set<Id> oppIds = new Set<Id>();
            for (Opportunity opp : maList) {
                oppIds.add(opp.Id);
            }
           /* List<OpportunityLineItem> oliList = [SELECT Id, Product2Id,Name, Sales_Stage__c,Product2.Name,Product2.Product_Line__c  FROM OpportunityLineItem WHERE OpportunityId IN :oppIds AND Product2.Name IN (
                                                                  'Accident Protection Plan - Voluntary', 'Critical Illness Protection Plan - Voluntary')];
            Map<Id, String> productStageMap = new Map<Id, String>();
            for (OpportunityLineItem oli : oliList) {
                productStageMap.put(oli.Product2Id, oli.Sales_Stage__c);
            } */
            List<OpportunityLineItem> oliList = new List<OpportunityLineItem>();

            for (Opportunity opp : maList) {
                if (opp.OpportunityLineItems != null) {
                    oliList.addAll(opp.OpportunityLineItems);
                }
            }

            //List<Product2> products = [SELECT Id, Name, Product_Line__c FROM Product2 WHERE IsActive = true AND Name IN ( 'Accident Protection Plan - Voluntary', 'Critical Illness Protection Plan - Voluntary' )];


            PolicyWrapper wrapper = new PolicyWrapper();
            wrapper.policyNumber = policy.Policy__c;
            wrapper.effectiveDate = effectiveDate;
            wrapper.maEffectiveDate = effectiveDate;
            wrapper.accountId = companyId;
            wrapper.products = new List<ProductWrapper>();

          //  for (Product2 p : products) {
			for (OpportunityLineItem oli : oliList) {
                ProductWrapper pw = new ProductWrapper();
                pw.meritProductName = oli.Product2.Name;
                pw.meritProductId = oli.Product2Id;

               // String stage = productStageMap.get(p.Id);
                  
                if (oli.Sales_Stage__c == 'Sold') {
                    pw.isSold = 'YES';
                } else 
                    pw.isSold = 'NO';

                wrapper.products.add(pw);
            }

            JSONGenerator gen = JSON.createGenerator(true);
           // String jsonBody = JSON.serializePretty(wrapper);
            gen.writeStartObject();
            gen.writeStringField('policyNumber', wrapper.policyNumber);
            gen.writeDateField('effectiveDate', wrapper.effectiveDate);
            gen.writeDateField('maEffectiveDate', wrapper.maEffectiveDate);
           
            gen.writeStringField('accountId', wrapper.accountId);
            gen.writeFieldName('products');
            gen.writeStartArray();
            for(ProductWrapper pw : wrapper.products) { 
                gen.writeStartObject(); 
                gen.writeStringField('meritProductName', pw.meritProductName); 
                gen.writeStringField('meritProductId', pw.meritProductId); 
                gen.writeStringField('isSold', pw.isSold); 
                gen.writeEndObject(); 
            } 
            gen.writeEndArray(); 
            gen.writeEndObject(); 
            String jsonBody = gen.getAsString();
            
            System.debug('### Generated JSON ### ' + jsonBody);
            //createJsonFile(jsonBody, policy.Policy__c); 
            
            HttpRequest req = new HttpRequest();
            //req.setEndpoint('callout:API_Callout_Check/policy');
            req.setEndpoint('callout:API_Callout_Check/services/apexrest/policy');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setBody(jsonBody);
            req.setTimeout(120000);

            Http http = new Http();
            HttpResponse res = http.send(req);

            if (res.getStatusCode() < 200 || res.getStatusCode() >= 300) {
                throw new CalloutException(
                    'API Failed. Status Code: ' + res.getStatusCode() +
                    ' Response: ' + res.getBody()
                );
            }

        } catch (CalloutException ce) {
            System.debug('### Callout Error ### ' + ce.getMessage());
            throw new AuraHandledException('External API Error: ' + ce.getMessage());

        } catch (Exception e) {
            System.debug('### Unexpected Error ### ' + e.getMessage());
            throw new AuraHandledException('Unexpected Error: ' + e.getMessage());
        }
    }
    
    private static void createJsonFile(String jsonBody, String policyNumber){

        ContentVersion cv = new ContentVersion();
        cv.Title = 'Policy_API_Request_' + policyNumber;
        cv.PathOnClient = 'Policy_API_Request.json';
        cv.VersionData = Blob.valueOf(jsonBody);
        cv.IsMajorVersion = true;

        insert cv;
    }
    

    public class PolicyWrapper {
        public String policyNumber;
        public Date effectiveDate;
        public Date maEffectiveDate;
        public String accountId;
        public List<ProductWrapper> products;
    }

    public class ProductWrapper {
        public String meritProductName;
        public String meritProductId;
        public String isSold;
    }
}