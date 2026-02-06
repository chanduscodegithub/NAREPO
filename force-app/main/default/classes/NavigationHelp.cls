public class NavigationHelp {
    @AuraEnabled
    public static Id getTheDocument(Id accId){
        String sobjectname = accId.getSObjectType().getDescribe().getName();
        System.debug('sobjectname >>> '+sobjectname);
        String filtercriteria = '';
        if(sobjectname.equalsIgnoreCase('Account')){
            Account acc = [Select Id,Category__c from Account where Id=:accId];
            filtercriteria = (String)acc.Category__c;
        }else if(sobjectname.equalsIgnoreCase('Opportunity')){
            Opportunity opp = [Select Id,MACategory__c  from Opportunity where Id=:accId];
            filtercriteria = (String)opp.MACategory__c;
        }else if(sobjectname.equalsIgnoreCase('Contact')){
            Contact con = [SELECT Id, RecordType.DeveloperName FROM Contact where Id=:accId];
            filtercriteria = (String)con.RecordType.DeveloperName;
        }
        System.debug('filtercriteria >>> '+filtercriteria);
        if(filtercriteria.containsIgnoreCase('CM')){
            filtercriteria = 'Client Management';  
        }else if(filtercriteria.containsIgnoreCase('CD')){
            filtercriteria = 'Client Development'; 
        }else if(filtercriteria.containsIgnoreCase('Aggregator')){
            filtercriteria = 'Aggregators';
        }
        else if(filtercriteria.containsIgnoreCase('Consultant')||filtercriteria.containsIgnoreCase('Consulting Firm')){
            filtercriteria = 'Consulting Firms-Consultants';
        }
        else if(filtercriteria.containsIgnoreCase('Competitor')){
            filtercriteria = 'Competitors';
        }
        if(filtercriteria.equalsIgnoreCase('Client Management')||filtercriteria.equalsIgnoreCase('Client Development')||filtercriteria.equalsIgnoreCase('Aggregators')||filtercriteria.equalsIgnoreCase('Consulting Firms-Consultants')||filtercriteria.equalsIgnoreCase('Competitors')){
            String cid = 'SELECT ContentDocumentId FROM ContentDocumentLink where LinkedEntityId in ( SELECT Id FROM JobAid__c where IsActive__c = true and DocumentType__c = \''+filtercriteria+'\') and LinkedEntity.Type=\'JobAid__c\' ';
            System.debug('cid >>> '+cid);
            ContentDocumentLink contentdocument= Database.query(cid); 
            return contentdocument.ContentDocumentId; 
        }else{
            return null;
        }    
        
        
    }
    
    
    
}