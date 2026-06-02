public class UHGContactSOQLConstants {

    /* Accounts Starts Here */
    
    public String queryForCount = 'SELECT count() FROM AccountContactRelation WHERE ContactId = :contactId AND IsDirect=false';
    /* Added as part of CR on 08th Oct 2024 */
    public String queryForExistingClientCount = 'SELECT count() FROM AccountContactRelation WHERE ContactId = :contactId AND IsDirect=false AND Account.RecordType.DeveloperName = \'Existing_Client\'';
    /* End of CR Modification */
    /* Added by Vignesh */
    public String queryForAllProspectCount = 'SELECT count() FROM AccountContactRelation WHERE ContactId = :contactId AND IsDirect=false AND Account.RecordType.DeveloperName = \'Prospect\'';
    public String queryForAllCompaniesCount = 'SELECT count() FROM AccountContactRelation WHERE ContactId = :contactId AND IsDirect=false';
    //Changes on 25/11/24
    public String queryForClientSurveyYear = 'SELECT Id, Name, LikelihoodtoRecommendScore__c, Year__c FROM ClientSurveyResults__c where type__c=\'Client Survey Results\' ORDER BY Year__c desc Limit 1';
    public String queryLRTValues = 'SELECT Id, Name, LikelihoodtoRecommendScore__c, Account__r.Name,Account__c FROM ClientSurveyResults__c where Account__c IN:accountIdList and year__c=:CSR[0].Year__c';    
    /* End */
    public String queryStringForRelatedAccounts1 = 'SELECT AccountId,Account.Name, Primary__c, Account.RecordType.Name,Account.RecordType.DeveloperName, Account.Owner.Name, Account.Client_Reference_Status__c FROM AccountContactRelation WHERE ContactId = :contactId AND IsDirect=false ORDER BY ';
    public String queryStringForRelatedAccounts2 = ' LIMIT :pageSize OFFSET :offset';
    
    /*public String QUERY_FOR_PRIMARY_RECORDS = 'SELECT Account.Name, Primary__c FROM AccountContactRelation WHERE ContactId = :contactId AND IsDirect=false AND Primary__c = true ORDER BY Account.Name';
    
    public String QUERY_FOR_NON_PRIMARY_RECORDS = 'SELECT Account.Name, Primary__c FROM AccountContactRelation WHERE ContactId = :contactId AND IsDirect=false AND Primary__c = false ORDER BY Account.Name';*/
    
    /* Accounts Ends Here */
    
    /* Contact MA Starts Here */
    
    public String queryForMACount = 'SELECT count() FROM OpportunityContactRole WHERE ContactId = :contactId';
    //public String queryStringForRelatedMA1 = 'SELECT IsPrimary, Opportunity.Id, Opportunity.Name, Opportunity.Account.Name, Opportunity.EffectiveDate__c, Opportunity.Sales_Stage_Medical__c, Opportunity.Disposition_Medical__c FROM OpportunityContactRole  WHERE ContactId = :contactId ORDER BY ';
    public String queryStringForRelatedMA1 = 'SELECT IsPrimary, Opportunity.Id, Opportunity.Name, Opportunity.Membership_Activity_Type__c, Opportunity.Account.Name, Opportunity.EffectiveDate__c, Opportunity.Status__c, Opportunity.Product_Type_Involved_in_Opp__c,Opportunity.Owner.Name,Opportunity.Disposition_Medical__c FROM OpportunityContactRole  WHERE ContactId = :contactId ORDER BY ';
    public String queryStringForRelatedMA2 = ' LIMIT :pageSize OFFSET :offset';
    
    /* Contact MA Ends Here */
    
    /* Correpondence - STARTS */
    
    public String QUERY_FOR_CAMPAIGN = 'SELECT Status, Correspondence_type__c FROM Campaign WHERE Id =: campaignId';
    
    public String QUERY_FOR_CONTACTS = 'SELECT Id FROM Contact WHERE Correspondence_type__c INCLUDES (:corrType) AND Status__c = \'Active\'';
    
     public String QUERY_FOR_CONTACTS_DETAILS = 'SELECT Status__c, Correspondence_type__c, Correspondence_Previous__c FROM Contact WHERE Id IN :params';
    
    public String QUERY_FOR_CAMPAIGNS_TO_ADD = 'SELECT Id FROM Campaign WHERE Correspondence_Type__c = :addMapKey AND Status IN :campaignStatus';
    
    public String QUERY_FOR_CAMPAIGNS_TO_REMOVE = 'SELECT Id FROM Campaign WHERE Correspondence_Type__c = :removeMapKey AND Status IN :campaignStatus';
    
    /* Correpondence - ENDS */
    
    
    /*
     * Contact Business Group on Health - START
     */
    public String QUERY_FOR_BUSINESS_GROUPS_ON_HEALTH_CONTACT = 'SELECT Name,BGHContact__c,CompanyBGH__c,CompanyBGH__r.Name,Role__c FROM BGHContact__c Where BGHContact__c =:accountId AND CompanyBGH__c!=null ORDER By ';
    
    public String QUERY_AND_REMOVE_DUPLICATE_BGH_FROM_POPUP_CONTACT = 'SELECT Name FROM Account Where Category__c = \'Aggregator\' AND Subtype__c = \'Business Group on Health (BGH)\' AND Id NOT IN :removeDuplicate';     
    
    public String QUERY_BGH_CONTACT = 'SELECT CompanyBGH__c FROM BGHContact__c Where BGHContact__c =:accountId';
    
    public String QUERY_BGH_RECORD = 'SELECT Id FROM BGHContact__c WHERE Id =: bghContactRecordId';
    
    /*
     * Contact Business Group on Health - END
     */
    
    
     /*
     * Business Member Contacts - START
     */
    public String QUERY_FOR_BGH_MEMBER_CONTACTS = 'SELECT Id, BGHContact__r.LastName, BGHContact__r.FirstName,Role__c, BGHContact__r.Account.Name,  BGHContact__r.Account.RecordType.Name FROM BGHContact__c WHERE CompanyBGH__c = :accountId AND BGHContact__r.Status__c = \'Active\' ORDER By ';
    
    public String QUERY_AND_REMOVE_DUPLICATE_BGH_FROM_POPUP_CONTACT_BGH_MEMBER_CONTACT_COUNT = 'SELECT count() FROM Contact Where Status__c = \'Active\' AND Id NOT IN :removeDuplicate';     
    
    public String QUERY_AND_REMOVE_DUPLICATE_BGH_FROM_POPUP_CONTACT_BGH_MEMBER_CONTACT = 'SELECT LastName, FirstName, Title, Email FROM Contact WHERE AccountId != :accountId AND Status__c = \'Active\' AND Id NOT IN :removeDuplicate ORDER BY LastName LIMIT : pageSize OFFSET :offset';
    
    public String QUERY_AND_REMOVE_DUPLICATE_BGH_FROM_POPUP_CONTACT_BGH_MEMBER_CONTACT_SEARCH = 'SELECT LastName, FirstName, Title, Email FROM Contact WHERE AccountId != :accountId AND Status__c = \'Active\' AND Id NOT IN :removeDuplicate AND (';     
    
    public String QUERY_BGH_CONTACT_BGH_MEMBER_CONTACTS = 'SELECT BGHContact__c FROM BGHContact__c Where CompanyBGH__c =:accountId';
    
    public String QUERY_BGH_RECORD_BGH_MEMBER_CONTACTS = 'SELECT Id FROM BGHContact__c WHERE Id =: bghContactRecordId';
    
    public String QUERY_BGH_MEMBER_CONTACTS_EQUALS = '=:searchKey)';   
    
    public String QUERY_BGH_MEMBER_CONTACTS_CONTAINS_LIKE = ' LIKE :searchKey)';
    
    public String QUERY_BGH_MEMBER_CONTACTS_PAGINATION_OFFSET = ' ORDER BY LastName LIMIT :pageSize OFFSET :offset';
    
    /*
     * Business Member Contacts - END
     */
    
     /* MA CR Starts Here */
    
    public String COUNT_QUERY_RR = 'SELECT count() FROM Refferal_Request__c WHERE MembershipActivity__c = :maId';
    public String QUERY_STRING_FOR_RR = 'SELECT Id,Applicable_for__c, RefCompany__r.Name, CreatedBy.Name, Ref_Status__c, Notes__c, RefCompany__r.Id FROM Refferal_Request__c WHERE MembershipActivity__c = :maId ORDER BY ';
    public String QUERY_STRING_FOR_RR_NO_ORDERBY = 'SELECT Id,Applicable_for__c,RefCompany__r.Name, CreatedBy.Name, Ref_Status__c, Notes__c, RefCompany__r.Id FROM Refferal_Request__c WHERE MembershipActivity__c = :maId ORDER BY ';
    public String QUERY_SUFFIX = ' LIMIT :pageSize OFFSET :offset';
    
    /* MA CR Ends Here */
    
}