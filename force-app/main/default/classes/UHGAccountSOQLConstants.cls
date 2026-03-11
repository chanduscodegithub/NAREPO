/**
 * @description       : 
 * @author            : Thanushree
 * @group             : 
 * @last modified on  : 01-23-2024
 * @last modified by  : Thanushree
**/
public class UHGAccountSOQLConstants {
    
    // //Contact and AccountContact Applet SOQL
    //  Constants   
    //public String queryStringForContactsTypeCmCd1 = 'SELECT Id,FirstName,LastName,Title,DecisionMakingRole__c, Role__c, UHGRelationshipwithExecutive__c, ReportsTo__c FROM Contact Where AccountId =:accountId AND Status__c =:accountStatus AND Type__c =:currentContactType ORDER BY ';
    //public String queryStringForContactsTypeCmCd2 = ' LIMIT :pageSize OFFSET :offset';
    
    public String queryStringForContactsTypeCmCd1 = 'SELECT Id,FirstName,LastName,Title,DecisionMakingRole__c, Role__c, UHGRelationshipwithExecutive__c, ReportsTo__c,Email FROM Contact Where AccountId =:accountId AND Status__c =:accountStatus AND RecordType.Id =:currentContactType ORDER BY ';
    public String queryStringForContactsTypeCmCd2 = ' LIMIT :pageSize OFFSET :offset';
    
    //Added by Vignesh
    public String queryForClientSurveyYear = 'SELECT Id, Name, LikelihoodtoRecommendScore__c, Year__c FROM ClientSurveyResults__c where type__c=\'Client Survey Results\' ORDER BY Year__c desc Limit 1';
    public String queryLRTValues = 'SELECT Id, Name, LikelihoodtoRecommendScore__c, Account__r.Name,Account__c FROM ClientSurveyResults__c where Account__c IN:accountIdList and year__c=:CSR[0].Year__c';
    
    /* Common CD and CM Applet query start */
    
    //public String queryStringForTypeCmCdContacts = 'SELECT Id,FirstName,LastName,Title,ConsultantTier__c,MailingStreet,MailingState,MailingCity,MailingCountry,MailingPostalCode,MailingAddress,DecisionMakingRole__c, Role__c, UHGRelationshipwithExecutive__c, ReportsTo__c FROM Contact Where AccountId =:accountId AND Status__c =:accountStatus AND Type__c =:currentContactType ORDER BY ';
    //public String queryStringForTypeCmCd2Contacts = ' LIMIT :pageSize OFFSET :offset';
    
    public String queryStringForTypeCmCdContacts = 'SELECT Id,FirstName,LastName,Title,AddressCFBackend__c,ConsultantTier__c,MailingStreet,MailingStateCode,MailingState,MailingCity,MailingCountry,MailingPostalCode,MailingAddress,DecisionMakingRole__c, Role__c, UHGRelationshipwithExecutive__c, ReportsTo__c, Key_Contact__c,Email,AMT_Log__c,Correspondence_Type__c,LastModifiedDate,LastModifiedBy.Name,Direct_Marketing_Target_Contact__c FROM Contact Where AccountId =:accountId AND Status__c =:accountStatus AND RecordType.Id =:currentContactType ORDER BY '; //LastModifiedDate added by Samarth
    public String queryStringForTypeCmCd2Contacts = '';//' LIMIT :pageSize OFFSET :offset';
    
    /* Common CD and CM Applet query end */
    
    /*
	 * National Account Sales Team SOQL Constants - START
	 */
    
    public String QUERY_STRING_CMACCOUNT_TEAMHISTORY = 'Select Id,Last_Name__c,Name,Case_Management_Start_Date__c,Case_Management_End_Date__c,Job_Title__c,SCE_Player_Coach_Assigned_to_Case__c,IsVPCR__c,Role__c,User__c,Account_Firm__r.OwnerId from CM_Account_Team_History__c where Account_Firm__c=:accountId ORDER By ';
    
    public String QUERY_STRING_USER = 'SELECT Id,LastName,FirstName,Title,EmployeeNumber,Email,UserRole.Name,Manager.Name,VPCR__c FROM User WHERE IsActive=:userStatus ORDER BY LastName LIMIT : pageSize OFFSET :offset';
    
    public String QUERY_STRING_USER_SEARCH = 'SELECT Id,LastName,FirstName,Title,EmployeeNumber,Email,UserRole.Name,Manager.Name,VPCR__c FROM User WHERE IsActive=:userStatus and (';
    
    public String QUERY_STRING_USER_SEARCH1 = ' LIKE :searchKey)';
    
    public String QUERY_STRING_USER_SEARCH2 = '=:searchKey)';
    
    public String QUERY_STRING_USER_SEARCH3 = ' ORDER BY LastName LIMIT :pageSize OFFSET :offset';
    
    public String QUERY_STRING_ACCOUNT_RELATED_CONTACTS = 'Select id from Contact where id in (select ContactId from AccountContactRelation where AccountId=:accountId)';
    
	/*
	 * National Account Sales Team SOQL Constants - END
	*/ 
    
    /*
     * CF Consultants Constants - START
     */
    
    public String QUERY_STRING_COUNT_ACCOUNT_CONSULTANTS = 'Select count() from Contact where Type__c=\'Consultant\' and id in (select ContactId from AccountContactRelation where AccountId=:accountId)';
    
    public String QUERY_STRING_ACCOUNT_CONSULTANTS = 'Select Id,LastName,FirstName,Title,ConsultantTier__c,MailingStreet,MailingState,MailingCity,MailingCountry,MailingPostalCode,MailingAddress,Email from Contact where Type__c=\'Consultant\' and id in (select ContactId from AccountContactRelation where AccountId=:accountId) ORDER BY ';

    public String QUERY_STRING_ACCOUNT_CONSULTANTS1 = ' LIMIT : pageSize OFFSET :offset';

    public String QUERY_STRING_ACCOUNT_CONSULTANTS2 = 'Select Id,LastName,FirstName,Title,ConsultantTier__c,MailingStreet,MailingState,MailingCity,MailingCountry,MailingPostalCode,MailingAddress,Email from Contact where Type__c=\'Consultant\' and id in (select ContactId from AccountContactRelation where AccountId=:accountId)';
    
    /*
     * CF Consultants Constants - END
     */
    
    
    /*
     * Account Team Memner SOQL Constants - Start
     */
    
    
    public String QUERY_STRING_TEAM_MEMEBER_USERS = 'SELECT UserId FROM AccountTeamMember Where AccountId =:accountId';
    
    public String QUERY_STRING_ACCOUNT_TEAM_MEMBERS = 'SELECT Id,LastName,FirstName,Title,UserRole.Name,Phone FROM User Where Id In :userIds ORDER BY ';
    //public String QUERY_STRING_ACCOUNT_TEAM_MEMBERS = 'SELECT Id,LastName,FirstName,Title,UserRole.Name,Phone FROM User ORDER BY ';
    
    public String QUERY_STRING_PAGESIZE_LIMIT  = ' LIMIT :pageSize OFFSET :offset';
    
    public String QUERY_STRING_ACCOUNT_TEAM_USER = 'SELECT LastName,FirstName,EmployeeNumber,Title,Email,UserRole.Name,Manager.Name,VPCR__c FROM User WHERE IsActive=:userStatus AND Id NOT In :userIds ORDER BY LastName LIMIT : pageSize OFFSET :offset';
    //public String QUERY_STRING_ACCOUNT_TEAM_USER = 'SELECT LastName,FirstName,EmployeeNumber,Email,UserRole.Name,Manager.Name,VPCR__c FROM User WHERE IsActive=:userStatus ORDER BY LastName LIMIT : pageSize OFFSET :offset';
    
    public String QUERY_STRING_ACCOUNT_TEAM_USER_SEARCH = 'SELECT LastName,FirstName,EmployeeNumber,Email,Title,UserRole.Name,Manager.Name,VPCR__c FROM User WHERE IsActive=:userStatus AND Id NOT In :userIds and (';
    //public String QUERY_STRING_ACCOUNT_TEAM_USER_SEARCH = 'SELECT LastName,FirstName,EmployeeNumber,Email,UserRole.Name,Manager.Name,VPCR__c FROM User WHERE IsActive=:userStatus and (';
    
    public String QUERY_STRING_ACCOUNT_TEAM_USER_SEARCH1 = ' LIKE :searchKey)';
    
    public String QUERY_STRING_ACCOUNT_TEAM_USER_SEARCH2 = '=:searchKey)';
    
    public String QUERY_STRING_ACCOUNT_TEAM_USER_SEARCH3 = ' ORDER BY LastName LIMIT :pageSize OFFSET :offset';
    
    public String QUERY_STRING_ACCOUNT_TEAM_USER_COUNT = 'SELECT count() FROM User WHERE IsActive=:userStatus AND Id NOT In :userIds';
    //public String QUERY_STRING_ACCOUNT_TEAM_USER_COUNT = 'SELECT count() FROM User WHERE IsActive=:userStatus';
    
    public String QUERY_STRING_USERS = 'SELECT id FROM AccountTeamMember WHERE Userid=:userID';
    
    public String QUERY_STRING_USER_COUNT = 'SELECT count() FROM User Where Id In: userIds';
    //public String QUERY_STRING_USER_COUNT = 'SELECT count() FROM User';
    
    /*
    * Account Team Memner SOQL Constants - End
    */
    
    
    public String QUERY_STRING_CLIENT_SURVEY_RESULTS = 'SELECT Id, Name,LikelihoodtoRecommendScore__c,NetPromoterType__c,OverallSatisfactionScore__c,Year__c FROM ClientSurveyResults__c WHERE Account__c = :AccountId AND Type__c = :csrType AND (Year__c = :arrayOfYears[0] OR Year__c = :arrayOfYears[1] OR Year__c = :arrayOfYears[2] OR Year__c = :arrayOfYears[3])';
    
   /*
     * Account Business Group on Health - START
     */
    public String QUERY_FOR_BUSINESS_GROUPS_ON_HEALTH = 'SELECT Name,New_Account__c,BGH_Account__c,BGH_Account__r.Name FROM BGH__c Where New_Account__c =:accountId AND BGH_Account__c!=null AND BGH_Account__r.Subtype__c=\'Business Group on Health (BGH)\' ORDER By ';
    
    public String QUERY_AND_REMOVE_DUPLICATE_BGH_FROM_POPUP = 'SELECT Name FROM Account Where Category__c = \'Aggregator\' AND Subtype__c = \'Business Group on Health (BGH)\' AND Id NOT IN :removeDuplicate';     
    
    public String QUERY_ACCOUNT_CATEGORY = 'SELECT Name,Category__c FROM Account where Id=:accountId';
    
    public String QUERY_BGH_ACCOUNT = 'SELECT BGH_Account__c FROM BGH__c Where New_Account__c =:accountId';
    /*
     * Account Business Group on Health - END
     */
    
    
    /*
     * Account Membership Policy Details - START
     */
    public String QUERY_ACCOUNT_MEMBERSHIP_POLICY_DETAILS = 'SELECT Id, Name,Surest_Policy_No__c, LastModifiedDate, PolicyName__c, AccountFirm__c, GLDate__c, MembershipType__c, GLMembership__c,BIND_Membership__c FROM PolicyAccountMembership__c Where AccountFirm__c =:accountId AND MembershipType__c=\'Medical\' AND Name!=\'Total GL Membership\' ORDER BY GLDate__c Desc,PolicyName__c Asc';
    
    public String QUERY_ACCOUNT_MEMBERSHIP_REVENUE_VALUES = 'SELECT Id, Name,Surest_Policy_No__c, GLDate__c, AccountFirm__c, GLMembership__c,BIND_Membership__c FROM PolicyAccountMembership__c where AccountFirm__c=:accountId AND Name=\'Total GL Membership\' ORDER BY GLDate__c Desc LIMIT 4';
    
    public String QUERY_DENTAL_VISION_REVENUE_VALUES = 'SELECT Id, Name,Surest_Policy_No__c, LastModifiedDate, PolicyName__c, AccountFirm__c, GLDate__c, MembershipType__c, GLMembership__c,BIND_Membership__c FROM PolicyAccountMembership__c Where AccountFirm__c =:accountId AND MembershipType__c IN (\'Dental\',\'Vision\')  ORDER BY GLDate__c Desc';
    /*
     * Account Membership Policy Details - END
     */
    
    /*
     * Accounts and Membership Activity - START
     */
    public String QUERY_ACCOUNTS_CURRENT_RELATIONSHIPS = 'SELECT Id, AccountFirm__c,AccountFirm__r.Name,AccountFirm__r.RecordType.Name,AccountFirm__r.Owner.Name,AccountFirm__r.RecordType.DeveloperName, AccountFirm__r.Client_Reference_Status__c FROM AccountCFJunction__c where ConsultingFirm__c =:accountId AND AccountFirm__c != null ORDER By';
    
    public String QUERY_ACCOUNTS_CURRENT_RELATIONSHIPS2 = 'SELECT Id, Account.Id, Account.Name, Account.Category__c,Account.RecordType.Name,Account.Owner.Name,Account.RecordType.DeveloperName, Account.Client_Reference_Status__c FROM AccountContactRelation where Contact.Account.Id =:accountId AND IsDirect = false AND Contact.Status__c=\'Active\' ORDER By';
    
    
    //public String QUERY_MEMBERSHIP_ACTIVITIES = 'SELECT Opportunity.Name,Opportunity.Sales_Stage_Pharmacy__c,Opportunity.Sales_Stage_Vision__c,Opportunity.Sales_Stage_Other__c,Opportunity.Sales_Stage_Medical__c,Opportunity.Sales_Stage_Dental__c,Opportunity.EffectiveDate__c,Opportunity.EstimatedMedicalMembershipatRisk__c,Opportunity.ActualMedicalMembershipLoss__c,Opportunity.SoldMembers__c,Opportunity.Estimated_Additional_New_Members__c,Opportunity.Existing_Mbrs__c from OpportunityContactRole where Contact.Account.Id=:accountId ORDER By';
    
    public String QUERY_MEMBERSHIP_ACTIVITIES = 'SELECT Opportunity.Id, Opportunity.Name, Opportunity.Membership_Activity_Type__c,Opportunity.Account.Name,Opportunity.EffectiveDate__c, Opportunity.Status__c,Opportunity.Owner.Name,Opportunity.Disposition_Medical__c, Opportunity.Product_Type_Involved_in_Opp__c from OpportunityContactRole where Contact.Account.Id=:accountId AND Opportunity.Membership_Activity_Type__c = \'Traditional\' ORDER By';
    
    public String QUERY_PAGINATION_DETAILS = ' LIMIT : pageSize OFFSET :offset';
    
    public String LIMIT_DISPALY_RECORDS = ' LIMIT 10';
    
    public String QUERY_STRING_ACCOUNTS_CURRENT_RELATIONSHIPS_COUNT = 'SELECT Count() FROM AccountCFJunction__c where ConsultingFirm__c =:accountId';
    
    public String QUERY_STRING_MEMBERSHIP_ACTIVITIES_COUNT = 'SELECT Count() FROM OpportunityContactRole where Contact.Account.Id=:accountId';
    /*
     * Accounts and Membership Activity - END
     */

     /*
     * Membership Activities - START
     */
    //public String QUERY_MEMBERSHIP_ACTIVITIES_CMCD = 'SELECT Id, Name, AccountId, Account.Name, SoldMembers__c, EstimatedMedicalMembershipatRisk__c, ActualMedicalMembershipLoss__c, EffectiveDate__c, Estimated_Additional_New_Members__c, Sales_Stage_Dental__c, Sales_Stage_Medical__c, Sales_Stage_Other__c, Sales_Stage_Pharmacy__c, Sales_Stage_Vision__c, Existing_Mbrs__c  FROM Opportunity where Opportunity.Account.Id =:accountId ORDER By';
    public String QUERY_MEMBERSHIP_ACTIVITIES_CMCD = 'SELECT Id, Name,Membership_Activity_Type__c,EffectiveDate__c,Status__c,Product_Type_Involved_in_Opp__c FROM Opportunity where Opportunity.Account.Id =:accountId ORDER By';
    
    public String QUERY_MA_PAGINATION_DETAILS = ' LIMIT : pageSize OFFSET :offset';
    
    public String LIMIT_MA_DISPALY_RECORDS = ' LIMIT 10';
    
    public String QUERY_STRING_MEMBERSHIP_ACTIVITIES_CMCD_COUNT = 'SELECT Count() FROM Opportunity where Opportunity.Account.Id=:accountId';
    /*
     * Membership Activities - END
     */
    
    /*
     * Senior UHG Executives Engaged - START
     */
	public String QUERY_SENIOR_UHG = 'SELECT Account__c,Name, EnterpriseExecutiveSponsorName__c,EnterpriseExecutiveSponsorResponsibiliti__c, OptumExecutiveSponsorName__c, OptumExecutiveSponsorResponsibilities__c, OtherExecutiveName1__c, OtherExecutiveName2__c, OtherExecutiveName3__c, OtherExecutiveName4__c, OtherExecutiveName5__c, OtherExecutiveResponsibilities1__c, OtherExecutiveResponsibilities2__c, OtherExecutiveResponsibilities3__c, OtherExecutiveResponsibilities4__c, OtherExecutiveResponsibilities5__c, OtherExecutiveTitle1__c, OtherExecutiveTitle2__c, OtherExecutiveTitle3__c, OtherExecutiveTitle4__c, OtherExecutiveTitle5__c, UHCExecutiveSponsorName__c, UHCExecutiveSponsorResponsibilities__c,SurestExecutiveSponsorName__c,SurestExecutiveSponsorResponsibilities__c FROM SeniorUHGExecutivesEngaged__c WHERE Account__c=: accountId';
    
    public String QUERY_ENTERPRISE_EXECUTIVE_NAMES = 'SELECT EnterpriseExecutiveSponsorName__c FROM SeniorUHGExecutivesEngaged__c WHERE EnterpriseExecutiveSponsorName__c LIKE: searchKeyWord';
    
    public String QUERY_OPTUM_EXECUTIVE_NAMES = 'SELECT OptumExecutiveSponsorName__c FROM SeniorUHGExecutivesEngaged__c WHERE OptumExecutiveSponsorName__c LIKE: searchKeyWord';
    
    public String QUERY_UHC_EXECUTIVE_NAMES = 'SELECT UHCExecutiveSponsorName__c FROM SeniorUHGExecutivesEngaged__c WHERE UHCExecutiveSponsorName__c LIKE: searchKeyWord';
    
    public String QUERY_UHC_SUREST_EXECUTIVE_NAMES = 'SELECT SurestExecutiveSponsorName__c FROM SeniorUHGExecutivesEngaged__c WHERE SurestExecutiveSponsorName__c LIKE: searchKeyWord';

    /*
     * Senior UHG Executives Engaged - END
     */
    
    /*
     * Consultant History - START
     */
    
    
    public static String SINGLE_QUOTE = '\'';    
    public static String SPACE = ' ';
    public static String QUERY_SPACE = ' ';
    public static String QUERY_LIKE = ' LIKE ';
    public static String QUERY_LIMIT = ' LIMIT ';
    public static String QUERY_OFFSET = ' OFFSET ';
    public static String QUERY_ORDER_BY = ' ORDER BY ';
    public static String EQUALS_CONDITION = '=';                        
    public static String WHERE_CONDITION = ' WHERE ';
    public static String AND_CONDITION = ' AND ';
    
    // Consultant History Quires
    
    public static String QUERY_CONSULTANT_HISTORY = 'SELECT Id,Name,LastName__c, JobTitle__c, StartDate__c, EndDate__c, Status__c,Consultant_ID__c, StatusReason__c FROM ConsultantHistory__c Where Id  = ';
    public static String QUERY_CONSULTANT_HISTORY_ASSOCIATED_WITH_ACCOUNT = 'SELECT Id,Name,LastName__c, JobTitle__c, StartDate__c, EndDate__c, Status__c,Consultant_ID__c, StatusReason__c FROM ConsultantHistory__c Where CompanyName__c  = ';
    public static String QUERY_COUNT_CONSULTANT_HISTORY_ASSOCIATED_WITH_ACCOUNT = 'SELECT count() FROM ConsultantHistory__c Where CompanyName__c =';
    public static String QUERY_CONTACT_OF_TYPE_CONSULTANT = 'SELECT Id, FirstName,LastName,Title,Account.Name,MailingCity,MailingState,InactiveStatusReason__c,InactiveDate__c FROM Contact Where RecordType.Name = \'Consultant\'';
    public static String QUERY_COUNT_CONTACT_OF_TYPE_CONSULTANT = 'SELECT count() FROM Contact WHERE RecordType.Name = \'Consultant\'';
    public static String QUERY_CONTACT_ON_ID = 'SELECT Id, FirstName,LastName,Title,Account.Name,Status__c,InactiveStatusReason__c,InactiveDate__c FROM Contact WHERE Id = '; 
    
    /*
     * Consultant History - END
     */
    
/*
     * MemberCompanies - Start
     */   
    public String queryStringForAccountTypeCVG = 'SELECT Id, Name,Aggregator_Membership_Status__c, Subtype__c, Owner.Name,CM_SCE__c ,BillingState, RecordType.Name, BillingStateCode FROM Account Where CVGAccount__c =:accountId ORDER BY ';
    public String queryStringForAccountTypeCVG1 = ' LIMIT :pageSize OFFSET :offset';
                                                  
    public String queryStringForAccountTypeBGH = 'SELECT Id,New_Account__r.Id, New_Account__r.Name,New_Account__r.Aggregator_Membership_Status__c ,New_Account__r.Subtype__c,New_Account__r.Owner.Name ,New_Account__r.CM_SCE__c  ,New_Account__r.BillingState, New_Account__r.RecordType.Name, New_Account__r.BillingStateCode  FROM BGH__c Where BGH_Account__c =:accountId ORDER BY ';
    public String queryStringForAccountTypeBGH1 = ' LIMIT :pageSize OFFSET :offset';
    /*
     * MemberCompanies - End
     */
    
    /*
     * CM/ CD Consultants Constants - START
     */
    
    public String ACCOUNT_COMMON_QUERY_STATEMENT = 'SELECT Name FROM Account WHERE Id= :accountId';
    
    public String CONTACT_COMMON_QUERY_STATEMENT= 'SELECT AccountId FROM Contact WHERE Id=: recId';
    
    public String QUERY_FOR_CONTACT_DETAILS_STATEMENT = 'SELECT Name, Account.Id, Account.Name, Account.Primary_Consulting_Firm_Group_Formula__c, Account.ConsultingFirmGroup__c FROM Contact where Id=: consultantId';
    
    public String ACCOUNT_CONTACT_RELATION_COMMON_QUERY_STATEMENT = 'SELECT Id FROM AccountContactRelation WHERE AccountId =: accountId';
    
    public String ACCOUNT_CONTACT_RELATION_QUERY_DELETE = 'SELECT AccountId, ContactId FROM AccountContactRelation WHERE AccountId =: accountId AND ContactId=: recordId';
    
    public String ACCOUNT_CF_JUNCTION_QUERY_DELETE= 'SELECT AccountFirm__c, ConsultingFirm__c FROM AccountCFJunction__c WHERE AccountFirm__c =:accountId AND ConsultingFirm__c =: recordId';
    
    public String QUERY_STRING_CMCD_ACCOUNT_CONSULTANTS_PRIMARY = 'SELECT Primary__c, Contact.Id, Contact.FirstName, Contact.LastName, Contact.Title, Contact.ConsultantTier__c, Contact.MailingCountry, Contact.MailingCity, Contact.MailingState, Contact.Account.Name, Contact.Account.Id,Contact.Email , Contact.MailingStateCode FROM AccountContactRelation WHERE AccountId =: accountId AND IsDirect=false AND Contact.Status__c=: status AND Primary__c = true AND Contact.RecordTypeId=: contactRecordType';
        
    public String QUERY_STRING_CMCD_ACCOUNT_CONSULTANTS_NON_PRIMARY = 'SELECT Primary__c, Contact.Id, Contact.FirstName, Contact.LastName, Contact.Title, Contact.ConsultantTier__c, Contact.MailingCountry, Contact.MailingCity, Contact.MailingState, Contact.Account.Name, Contact.Account.Id,Contact.Email, Contact.MailingStateCode FROM AccountContactRelation WHERE AccountId =: accountId AND IsDirect=false AND Contact.Status__c=: status AND Primary__c = false AND Contact.RecordTypeId=: contactRecordType ORDER BY Contact.LastName ASC';
    
    public String QUERY_STRING_CMCD_ACCOUNT_CONSULTANT_FIRM = 'SELECT AccountFirm__c, ConsultingFirm__c FROM AccountCFJunction__c WHERE AccountFirm__c=: accountId AND ConsultingFirm__c != null AND ConsultingFirm__c != \'\'';
    
    public String QUERY_STRING_COUNT_CMCD_ACCOUNT_CONSULTANTS_COUNT = 'Select count() from Contact where RecordType.Id =: contactRecordTypeId AND Status__c = \'Active\' AND Id NOT In :contactIds';
    
    public String QUERY_STRING_COUNT_CMCD_ACCOUNT_CONSULTANTS_COUNT2 = 'Select count() from Contact where AccountId =: accountId AND RecordType.Id =: contactRecordTypeId AND Status__c = \'Active\' AND Id NOT In :contactIds';
    
    public String QUERY_STRING_COUNT_CMCD_ACCOUNT_CONSULTANT_FIRM_COUNT = 'Select count() from Account where Category__c=\'Consulting Firm\' AND Id NOT In :addedAccIds';
    
    public String QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS = 'Select Id,LastName,FirstName,Account.Name,Title,MailingState,MailingCity,MailingCountry,Email from Contact where RecordType.Id =: contactRecordTypeId AND Status__c=\'Active\' AND Id NOT In :contactIds ORDER BY LastName LIMIT : pageSize OFFSET :offset';
    
    public String QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS2 = 'Select Id,LastName,FirstName,Account.Name,Title,MailingState,MailingCity,MailingCountry,Email from Contact where AccountId =: accountId AND RecordType.Id =: contactRecordTypeId AND Status__c=\'Active\' AND Id NOT In :contactIds ORDER BY LastName LIMIT : pageSize OFFSET :offset';
    
    //public String QUERY_STRING_ACCOUNT_CMCD_CONSULTANT_FIRM = 'Select Id, Name, BillingCity, BillingState from Account where Category__c=\'Consulting Firm\' AND Id NOT In :addedAccIds ORDER BY Name LIMIT : pageSize OFFSET :offset';
    
    public String QUERY_STRING_ACCOUNT_CMCD_CONSULTANT_FIRM_UNIQUE = 'Select Id, Name, BillingCity, BillingState, BillingStateCode from Account where Category__c=\'Consulting Firm\' AND Id NOT In :addedAccIds ORDER BY Name LIMIT : pageSize OFFSET :offset';
    
    public String QUERY_STRING_ACCOUNT_CMCD_CONSULTANT_FIRM_SEARCH = 'Select Id, Name, BillingCity, BillingState, BillingStateCode from Account where Category__c=\'Consulting Firm\' AND Id NOT In :addedAccIds and (';
    
    public String QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH = 'Select Id,LastName,FirstName,Account.Name,Title,MailingState,MailingStateCode, MailingCity,MailingCountry,Email from Contact where RecordType.Id =: contactRecordTypeId AND Status__c=\'Active\' AND Id NOT In :contactIds and (';

    public String QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH22 = 'Select Id,LastName,FirstName,Account.Name,Title,MailingState,MailingCity,MailingCountry,Email from Contact where AccountId =: accountId AND RecordType.Id =: contactRecordTypeId AND Status__c=\'Active\' AND Id NOT In :contactIds and (';
    
    public String QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH1 = ' LIKE :searchKey)';
    
    public String QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH2 = ' LIMIT : pageSize OFFSET :offset';
    
    public String QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH3 = ' ORDER BY LastName LIMIT :pageSize OFFSET :offset';
    
    public String QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH4 = '=:searchKey)';

    public String QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_FIRM_SEARCH = ' ORDER BY Name LIMIT :pageSize OFFSET :offset';
    
    /*
     * CM/ CD Consultants Constants - END
     */
    
    // Competitive Landscape Medical CM and CD Queries - START
     public static String QUERY_COMPETITORS_CM_CD = 'SELECT Id,CompetitorAccount__c, CompetitorAccount__r.Name,ParticipatingO65Retirees__c,ParticipatingPartTimeActives__c,MembershipEstimate__c,ParticipatingNonBargainedFullTimeAc__c,ParticipatingBargainedFullTimeActive__c,ParticipatingU65Retirees__c,Comments__c,Account__c,PrimaryIncumbent__c,SecondaryIncumbent__c,ParticipatingMembers__c,ParticipatingActives__c FROM Competitor__c WHERE Account__c = :AccountId AND Competitorclassification__c = :competitorClassification ORDER BY CreatedDate ASC';
    
    // Competitive Landscape Medical CM and CD Queries - END
    
    
     /*
     * Competitive Landscape - ADD PopUp SOQL Constants - START
     */
    
    public String QUERY_COUNT_STRING_ACCOUNT_COMPETITORS = 'SELECT count() FROM Account WHERE Category__c = :AccountType ';
    
    public String QUERY_COUNT_STRING_ACCOUNT_COMPETITORS1 = ' AND CompetitorStatus__c = :competitorStatus AND Name != :nationalAccounts ';
    
    public String QUERY_STRING_ACCOUNT_COMPETITORS = 'SELECT Id, Name,Type,Product_Types_Offered__c,Top_Competitor__c,The_Blues_and_their_Affiliates__c,Exchange_Competitors__c,CompetitorGroup__c FROM Account WHERE Category__c = :AccountType AND CompetitorStatus__c = :competitorStatus ';
    
    public String QUERY_STRING_ACCOUNT_COMPETITORS1 = ' AND Name != :nationalAccounts AND Name != :UHC_OPTUM_RECORD AND Name != :OPTUM_RX AND Name != :TOTAL ';

    public String QUERY_STRING_ACCOUNT_COMPETITORS2 = ' ORDER BY Name LIMIT :pageSize OFFSET :offset';
    
    public String QUERY_STRING_ACCOUNT_COMPETITORS3 = 'AND Product_Types_Offered__c INCLUDES (\'Medical\')';
        
    /*
     * Competitive Landscape - ADD PopUp SOQL Constants - END
     */
    
    /*
     * Competitive Landscape - Pharmacy/Specialty/OtherProducts SOQL Constants - START
     */
    
    //public String QUERY_STRING_CM_COMPETITORS = 'SELECT CompetitorAccount__r.Name,CompetitorAccount__c,NumberOfMembersHeld__c,ofMembersHeld__c,Comments__c,BusinessModelforPharmacy__c,FundingType__c,Competitorclassification__c,PrimaryIncumbent__c,SecondaryIncumbent__c,AssociatedMedicalCarrier__c,TypesofOtherProductsServicesProvide__c FROM Competitor__c where Account__c=:accountId  and Type__c=\'Account Competitor\' ORDER BY CreatedDate Asc';
    
    public String QUERY_STRING_CM_COMPETITORS = 'SELECT CompetitorAccount__r.Name,CompetitorAccount__c,NumberOfMembersHeld__c,ofMembersHeld__c,Comments__c,BusinessModelforPharmacy__c,FundingType__c,Competitorclassification__c,PrimaryIncumbent__c,SecondaryIncumbent__c,AssociatedMedicalCarrier__c,Account__c, Type_of_Products_Services_Provided__c, Coalition_if_applicable__c FROM Competitor__c where Account__c=:accountId  and Type__c=\'Account Competitor\'and (Competitorclassification__c!=\'Other\' or (Competitorclassification__c=\'Other\' and OtherPrdctCompetitorRecordTobeDeleted__c=false)) ORDER BY CompetitorAccount__r.Name, Type_of_Products_Services_Provided__c Asc';
    
    /*
     * Competitive Landscape - Pharmacy/Specialty/OtherProducts SOQL Constants - END
     */

    
     /*
     * Risk Profile - START
     */
    public static string RISK_TRACKED_BY_SCE = 'Risk Tracked by SCE';    
    public static string ADDITIONAL_RISK_FACTOR = 'Additional Risk Factor';
    public static string QUERY_RISK_PROFILE_METADATA = 'SELECT Id, Language, NamespacePrefix,Impact__c, Label, QualifiedApiName, Risk_Profile_Type__c, Order__c, Data_Type__c, Additional_Information__c, Weight_Multiplier__c, Raw_Score__c,HelpText__c, MasterLabel FROM Risk_Profile__mdt';
    public static string QUERY_ACCOUNT_RISK_PROFILE = 'SELECT Id, SCEReviewedDate__c, OverallRiskScore__c FROM Account WHERE Id =:accountId';    
    public static string QUERY_RISK_PROFILE_OF_TYPE_ADDITIONAL_RISK = 'Select SCERiskTypeAddlRiskFactorType__c FROM RiskProfile__c WHERE RiskProfileType__c = \''+ADDITIONAL_RISK_FACTOR+'\' AND AccountFirm__c =:accountId';    
    public static string QUERY_RISK_PROFILE_DATA = 'SELECT RiskProfileType__c, RiskFactorValue__c, AdditionalInformation1__c, Comments__c, DateRiskClosed__c, DateRiskAdded__c, DateRiskModified__c, RawScore__c, RiskFactorasof__c, RiskScore__c, SCERiskTypeAddlRiskFactorType__c, WeightMultiplier__c, Impact__c, ExternalUniqueID__c, Id, Name, AccountFirm__c,AccountFirm__r.OverallRiskScore__c,AccountFirm__r.SCEReviewedDate__c FROM RiskProfile__c WHERE AccountFirm__c  = :accountId ORDER BY DateRiskClosed__c Desc,DateRiskModified__c Desc';    
    public static string QUERY_RISK_TYPE_VALUE = ' Risk_Profile_Type__c = ';        
    public static string QUERY_ORDER_BY_NUMBER = 'ORDER BY Order__c Asc';
     /*
     * Risk Profile - END
     */
    
     /*
     * Contact Business Group on Health - START
     */
    public String QUERY_FOR_BUSINESS_GROUPS_ON_HEALTH_CONTACT = 'SELECT Name,BGHContact__c,CompanyBGH__c,CompanyBGH__r.Name,Role__c FROM BGHContact__c Where BGHContact__c =:accountId AND CompanyBGH__c!=null AND CompanyBGH__r.Subtype__c=\'Business Group on Health (BGH)\' ORDER By ';
    
    public String QUERY_AND_REMOVE_DUPLICATE_BGH_FROM_POPUP_CONTACT = 'SELECT Name FROM Account Where Category__c = \'Aggregator\' AND Subtype__c = \'Business Group on Health (BGH)\' AND Id NOT IN :removeDuplicate';     
    
    public String QUERY_BGH_CONTACT = 'SELECT CompanyBGH__c FROM BGHContact__c Where BGHContact__c =:contactId';
    
    public String QUERY_BGH_RECORD = 'SELECT Id FROM BGHContact__c WHERE Id =: bghContactRecordId';
    
    /*
     * Contact Business Group on Health - END
     */
    
     /*
     * MA Account Team - START
	*/
    public String QUERY_STRING_OPTY_TEAM_MEMEBER_USERS = 'SELECT UserId FROM OpportunityTeamMember Where OpportunityId =:optyId';
    
    public String QUERY_STRING_USERS_OPTY = 'SELECT id FROM OpportunityTeamMember WHERE Userid=:userID AND OpportunityId=:opptyId';
    
     /*
     * MA Account Team - END
     */
    
     /*
     * MA Consultant - START
     */
    
   // public String QUERY_FOR_MA_CONSULTANTS = 'SELECT Primary__c, Consultant__r.LastName, Consultant__r.FirstName, Consultant__r.Account.Name, Consultant__r.MailingCity, MembershipActivity__c FROM MAContactJunction__c WHERE MembershipActivity__c =:maId ORDER BY ';
    
    public String QUERY_FOR_MA_CONSULTANTS_COUNT = 'SELECT count() FROM OpportunityContactRole WHERE OpportunityId =:maId';
    
    public String QUERY_FOR_MA_CONSULTANTS = 'SELECT Id, OpportunityId, Opportunity.Name, ContactId, Contact.FirstName, Contact.LastName, Contact.Account.Name, Contact.MailingCity, IsPrimary FROM OpportunityContactRole WHERE OpportunityId =:maId ORDER BY ';
    
    public String QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_COUNT = 'SELECT count() FROM AccountContactRelation Where AccountId = :maParentAccId AND Contact.RecordType.Id =: contactRecordTypeId AND IsDirect = false AND Contact.Status__c = \'Active\' AND Contact.Id NOT IN :contactIds';     
    
    public String QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_COUNT_ALLCONSULTANTS = 'SELECT count() FROM Contact Where Status__c = \'Active\' AND RecordType.Id =: contactRecordTypeId AND Id NOT IN :contactIds';     
    
    public String QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_CONTACT = 'SELECT Contact.Name, Contact.LastName, Contact.FirstName, Contact.Account.Name, Contact.MailingCity, Contact.MailingState FROM AccountContactRelation WHERE AccountId = :maParentAccId AND Contact.RecordType.Id =: contactRecordTypeId AND IsDirect = false AND Contact.Status__c = \'Active\' AND Contact.Id NOT IN :contactIds ORDER BY Contact.LastName LIMIT : pageSize OFFSET :offset';

    public String QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_SEARCH = 'SELECT Contact.Name, Contact.LastName, Contact.FirstName, Contact.Account.Name, Contact.MailingCity, Contact.MailingState FROM AccountContactRelation WHERE AccountId = :maParentAccId AND Contact.RecordType.Id =: contactRecordTypeId AND IsDirect = false AND Contact.Status__c = \'Active\' AND Contact.Id NOT IN :contactIds AND (';     
    
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
    

    
}