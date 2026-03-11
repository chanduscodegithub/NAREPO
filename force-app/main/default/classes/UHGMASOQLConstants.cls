public class UHGMASOQLConstants {
    
    /*
     *  Competitors Applet - START
     */
    
    public static String QUERY_STRING_CM_COMPETITORS = 'SELECT Id,Competitor_Account__r.Name,Competitor_Account__c,Number_of_Members_Held__c,of_Members_Held__c,Number_of_Members_Awarded__c,of_Members_Awarded__c,Comments__c,Competitor_Classification__c FROM MA_Competitor__c where Opportunity__c=:opportunityId and Competitor_Classification__c IN :selectedProductTypesSet  AND Competitor_Account__r.Name !=:optumRx ORDER BY CreatedDate Asc';
    
    public static String QUERY_STRING_NATIONALACCOUNT_COMPETITORS = 'SELECT Id,Competitor_Account__r.Name,Competitor_Account__c,Number_of_Members_Held__c,of_Members_Held__c,Number_of_Members_Awarded__c,of_Members_Awarded__c,Comments__c,Competitor_Classification__c FROM MA_Competitor__c where Opportunity__c=:opportunityId and Competitor_Classification__c=:competitorClassification AND Competitor_Account__r.Name=:nationalAccounts ORDER BY CreatedDate Asc LIMIT 1';

	public static String QUERY_STRING_UNKNOWN_ACCOUNT_COMPETITOR = 'SELECT Id,Name,Type,Product_Types_Offered__c,Top_Competitor__c,The_Blues_and_their_Affiliates__c,Exchange_Competitors__c,CompetitorGroup__c FROM Account WHERE Category__c=\'Competitor\' and Name =: unknownAccCmptrName and CompetitorStatus__c = :competitorStatus LIMIT 1';
    
    /*
     *  Competitors Add PopUp Applet - START
     */
    //public static String QUERY_STRING_ACCOUNT_SEARCH = 'SELECT Id,Name,Product_Line__c,Family FROM Product2 where IsActive =:prodStatus And Product_Line__c=:prodLine And (Product_Line__c Like :searchKey1 And Name Like :searchKey2) LIMIT :pageSize OFFSET :offset';
   
    //public static String QUERY_STRING_ACCOUNT = 'SELECT id FROM AccountTeamMember WHERE Userid=:userID';
    
    public static String QUERY_STRING_ACCOUNT_COMPETITORS = 'SELECT Id,Name,Type,Product_Types_Offered__c,Top_Competitor__c,The_Blues_and_their_Affiliates__c,Exchange_Competitors__c,CompetitorGroup__c FROM Account WHERE Category__c=\'Competitor\' and Name NOT IN (\'National Accounts\',\'Total\') and CompetitorStatus__c = :competitorStatus ';
	
    public static String QUERY_STRING_ACCOUNT_COMPETITORS2 = ' Order By Name LIMIT :pageSize OFFSET :offset';
        
    public static String QUERY_COUNT_STRING_ACCOUNT_COMPETITORS = 'SELECT count() FROM Account WHERE Category__c=\'Competitor\' and Name!=\'National Accounts\' and CompetitorStatus__c = :competitorStatus ';
    /*
     *  Competitors Add PopUp Applet - END
     */
        
    /*
     * Competitors Applet - END
     */ 
    
    /*
     * QA Account PopUp - START
     */
    
    public static String QUERY_STRING_ACCOUNT = 'SELECT Id,Name,Category__c,Owner.Name,Owner.Id FROM Account WHERE Category__c';
    
    public static String QUERY_STRING_ACCOUNT1 = ' ORDER BY Name LIMIT : pageSize OFFSET :offset';
    
    public static String QUERY_STRING_ACCOUNT_SEARCH = 'SELECT Id,Name,Category__c,Owner.Name,Owner.Id FROM Account WHERE Category__c';
    
    public static String QUERY_STRING_ACCOUNT_SEARCH1 = ' LIKE :searchKey)';
    
    public static String QUERY_STRING_ACCOUNT_SEARCH2 = '=:searchKey)';
    
    public static String QUERY_STRING_ACCOUNT_SEARCH3 = ' ORDER BY Name LIMIT :pageSize OFFSET :offset';
    
    /*
     * QA Account PopUp - END
     */
    
    
    /*
     *  Products Applet - START
     */
    public static String OPP_ITAGS_FOR_OPP_LINE_ITEMS = 'Medical_Products_Involved__c;Members_QUOTED_in_the_Proposal_Medical__c;DistributionTypecalculated__c;isProductCompValidated__c;isMAtab__c;AccountId;Membership_Activity_Type__c;Distribution_Type__c;CI_AP_HII__c;Sold_New_Mbrs__c;Termed_Mbrs__c;Estimated_Members_Existing_New__c;Overall_New_Membership_Impact__c;Estimated_Additional_New_Members__c;Existing_Members_Involved_in_the_Bid__c;Existing_Members_Retained_Pinnacle__c;Existing_Members_Retained__c;Existing_Membership_at_Risk__c;Members_Trans_From_or_To_Another_Segment__c;Net_Results__c;Sold_Retained_Members__c;Incumbent_Primary_Medical__c;Incumbent_Secondary_Medical__c;Incumbent_Primary_Pharmacy__c;Incumbent_Secondary_Pharmacy__c;Incumbent_Primary_Dental__c;Incumbent_Secondary_Dental__c;Incumbent_Primary_Vision__c;Incumbent_Secondary_Vision__c;Incumbent_Primary_Other_Buy_Up_Programs__c;Incumbent_Secondary_Other_Buy_Up__c;Winner_Primary_Medical__c;Winner_Secondary_Medical__c;Winner_Primary_Pharmacy__c;Winner_Secondary_Pharmacy__c;Winner_Primary_Dental__c;Winner_Secondary_Dental__c;Winner_Primary_Vision__c;Winner_Secondary_Vision__c;Winner_Primary_Other_Buy_Up_Programs__c;Winner_Secondary_Other_Buy_Up_Programs__c;Estimated_Membership_Impact__c;Membership_Activity_Type__c;EffectiveDate__c';
    
    public static String TOTAL_OBJECT_FIELDS = 'Existing_Members_Involved_in_the_Bid__c,Mbrs_Transferred_From_To_Another_Segment__c,Estimated_Additional_New_Members__c,Members_Quoted_in_the_Proposal__c,Existing_Membership_at_Risk__c,Sold_Retained_Members__c,Net_Results__c';

    public static Set<String> TOTAL_OBJECT_KEYSETS = new Set<String>();
    
    static{
        for(String value : TOTAL_OBJECT_FIELDS.split(',')){
            TOTAL_OBJECT_KEYSETS.add(value);
        }
    }
    
    /*
     *  Products Applet - END
     */
    
      /*
     * Product Member SOQL Constants - Start
     */

    public static String QUERY_STRING_Product_SEARCH = 'SELECT Id,Name,Product_Line__c,Family FROM Product2 where IsActive =:prodStatus And Product_Line__c=:prodLine And (Family Like :searchKey1 And Name Like :searchKey2) LIMIT :pageSize OFFSET :offset';

    public static String QUERY_STRING_Product_COUNT = 'SELECT count() FROM Product2 WHERE IsActive=:prodStatus And Product_Line__c=:prodLine And (Product_Line__c Like :searchKey1 And Name Like :searchKey2)';
    
    public static String QUERY_STRING_PRICEBOOK_PRODUCTS_COUNT = 'SELECT count() FROM PricebookEntry where IsActive = :prodStatus AND Product2.Product_Line__c=:prodLine AND (Product2.Name Like :searchKey1 AND Product2.Family Like :searchKey2)';
   
    public static String QUERY_STRING_PRICEBOOK_WITH_PRODUCTS_SEARCH = 'SELECT Id,Product2.Id,Product2.Name,Product2.Product_Line__c,Product2.Surest_Applicable_Products__c,Product2.Distribution_Type_Flag__c,Product2.Funding_Type__c,Product2.Product_Display_Order__c,Product2.Considered_For_StepWise_Integration__c,Product2.Family,Product2.Do_Not_Include_in_Total__c,Product2.Eligible_for_Sales_Incentives__c,Product2.Underwriting_Validation__c,Product2.Reporting_Product_Type__c,Product2.Surest_Implementation_Lead_Time__c FROM PricebookEntry where IsActive = :prodStatus AND Product2.Product_Line__c=:prodLine AND Product2.Product_Display_Order__c != \'\' AND (Product2.Name Like :searchKey1 AND Product2.Family Like :searchKey2) ORDER BY Product2.Product_Display_Order__c ASC LIMIT :pageSize OFFSET :offset';
    
    public static String QUERY_STRING_PRICEBOOK_PRODUCTS_COUNT_SUREST = 'SELECT count() FROM PricebookEntry where IsActive = :prodStatus AND Product2.Product_Line__c=:prodLine AND (Product2.Name Like :searchKey1 AND Product2.Family Like :searchKey2 AND Product2.Surest_Applicable_Products__c in:surestOnly)';
   
    public static String QUERY_STRING_PRICEBOOK_WITH_PRODUCTS_SEARCH_SUREST = 'SELECT Id,Product2.Id,Product2.Name,Product2.Product_Line__c,Product2.Surest_Applicable_Products__c,Product2.Distribution_Type_Flag__c,Product2.Funding_Type__c,Product2.Product_Display_Order__c,Product2.Considered_For_StepWise_Integration__c,Product2.Family,Product2.Do_Not_Include_in_Total__c,Product2.Eligible_for_Sales_Incentives__c,Product2.Underwriting_Validation__c,Product2.Reporting_Product_Type__c,Product2.Surest_Implementation_Lead_Time__c FROM PricebookEntry where IsActive = :prodStatus AND Product2.Product_Line__c=:prodLine AND Product2.Product_Display_Order__c != \'\' AND (Product2.Name Like :searchKey1 AND Product2.Family Like :searchKey2 AND Product2.Surest_Applicable_Products__c in:surestOnly) ORDER BY Product2.Product_Display_Order__c ASC LIMIT :pageSize OFFSET :offset';
    
    //public static String QUERY_STRING_PRICEBOOK_PRODUCTS_COUNT_OTHER = 'SELECT count() FROM PricebookEntry where IsActive = :prodStatus AND Product2.Product_Line__c=:prodLine AND (Product2.Name Like :searchKey1 AND Product2.Family Like :searchKey2 And Product2.Surest_Applicable_Products__c!=:surestOther)';
   
    //public static String QUERY_STRING_PRICEBOOK_WITH_PRODUCTS_SEARCH_OTHER = 'SELECT Id,Product2.Id,Product2.Name,Product2.Product_Line__c,Product2.Surest_Applicable_Products__c,Product2.Distribution_Type_Flag__c,Product2.Funding_Type__c,Product2.Product_Display_Order__c,Product2.Considered_For_StepWise_Integration__c,Product2.Family,Product2.Do_Not_Include_in_Total__c,Product2.Eligible_for_Sales_Incentives__c,Product2.Underwriting_Validation__c,Product2.Reporting_Product_Type__c FROM PricebookEntry where IsActive = :prodStatus AND Product2.Product_Line__c=:prodLine AND Product2.Product_Display_Order__c != \'\' AND (Product2.Name Like :searchKey1 AND Product2.Family Like :searchKey2 AND Product2.Surest_Applicable_Products__c !=:surestOther) ORDER BY Product2.Product_Display_Order__c ASC LIMIT :pageSize OFFSET :offset';
    
    
    public static String QUERY_STRING_Product = 'SELECT id FROM AccountTeamMember WHERE Userid=:userID';

    /*
    * Product Member SOQL Constants - End
    */
    
     /*
     * MA Consultant - START
     */
    
   // public String QUERY_FOR_MA_CONSULTANTS = 'SELECT Primary__c, Consultant__r.LastName, Consultant__r.FirstName, Consultant__r.Account.Name, Consultant__r.MailingCity, MembershipActivity__c FROM MAContactJunction__c WHERE MembershipActivity__c =:maId ORDER BY ';
    
    public String QUERY_FOR_MA_CONSULTANTS_COUNT = 'SELECT count() FROM OpportunityContactRole WHERE OpportunityId =:maId';
    
    public String QUERY_FOR_MA_CONSULTANTS = 'SELECT Id, OpportunityId, Opportunity.Name, ContactId, Contact.FirstName, Contact.LastName, Contact.Account.Name, Contact.MailingCity, IsPrimary FROM OpportunityContactRole WHERE OpportunityId =:maId  ORDER BY ';
    
    public String QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_COUNT = 'SELECT count() FROM AccountContactRelation Where AccountId = :maParentAccId AND Contact.RecordType.Id =: contactRecordTypeId AND Contact.Status__c = \'Active\' AND IsDirect = false AND Contact.Id NOT IN :contactIds';     
    
    public String QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_COUNT_ALLCONSULTANTS = 'SELECT count() FROM Contact Where  RecordType.Id =: contactRecordTypeId AND Status__c = \'Active\' AND Id NOT IN :contactIds';     
    
    public String QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_CONTACT = 'SELECT Contact.Name, Contact.LastName, Contact.FirstName, Contact.Account.Name, Contact.MailingCity, Contact.MailingState FROM AccountContactRelation WHERE AccountId = :maParentAccId AND Contact.Status__c = \'Active\' AND Contact.RecordType.Id =: contactRecordTypeId AND IsDirect = false  AND Contact.Id NOT IN :contactIds ORDER BY Contact.LastName LIMIT : pageSize OFFSET :offset';

    public String QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_SEARCH = 'SELECT Contact.Name, Contact.LastName, Contact.FirstName, Contact.Account.Name, Contact.MailingCity, Contact.MailingState FROM AccountContactRelation WHERE AccountId = :maParentAccId  AND Contact.Status__c = \'Active\' AND Contact.RecordType.Id =: contactRecordTypeId AND IsDirect = false  AND Contact.Id NOT IN :contactIds AND (';     
    
    public String QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_CONTACT_ALLCONSULTANTS = 'SELECT Name, LastName, FirstName, Account.Name, MailingCity, MailingState FROM Contact WHERE RecordType.Id =: contactRecordTypeId AND Status__c = \'Active\' AND Id NOT IN :contactIds ORDER BY LastName LIMIT : pageSize OFFSET :offset';

    public String QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_SEARCH_ALLCONSULTANTS = 'SELECT Name, LastName, FirstName, Account.Name, MailingCity, MailingState FROM Contact WHERE RecordType.Id =: contactRecordTypeId AND Status__c = \'Active\' AND Id NOT IN :contactIds AND (';     
    
    public String QUERY_MA_CONSULTANTS_EQUALS = '=:searchKey)';   
    
    public String QUERY_MA_CONSULTANTS_CONTAINS_LIKE = ' LIKE :searchKey)';
    
    public String QUERY_MA_CONSULTANTS_PAGINATION_OFFSET = ' ORDER BY LastName LIMIT :pageSize OFFSET :offset';
    
    public String QUERY_MA_CONSULTANTS_PAGINATION_OFFSET1 = ' ORDER BY Contact.LastName LIMIT :pageSize OFFSET :offset';
    
    public String QUERY_FOR_MA_CONSULTANTS_PAGESIZE = ' LIMIT :pageSize OFFSET :offset';
    
    
    /*
     * MA Consultant - END
     */
    
    /*
     *  Work Items - START
     */ 
    
    public String QUERY_FOR_WORK_ITEMS = 'Select Id,Name,AccountId,Account.Name,OwnerId,Owner.Name,Comments__c,Comments_Last_Modified__c,CM_VPCR_RVP__r.Name from Opportunity where Status__c=\'Open\' AND MACategory__c=\'Client Management\'';
        
    /*
     *  Work Items - END
     */  
    
}