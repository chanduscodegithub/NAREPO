/*********************************************************************** 
Name: NewRFPTemplateController
Test Class: NewRFPTemplateControllerTest
Copyright © 2022 CRMIT Solutions Company Inc.
====================================================== 
======================================================  
Purpose: Query and return opportunity to map all the XML variabeles with user requested data
====================================================== 
======================================================
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Manoj A M       	 	02/16/2023  		INITIAL DEVELOPMENT   		  
*********************************************************************/
public with sharing class NewRFPTemplateController {
    
    /**
     * Checks whether the current loggedin user is authorized to generate the datad
     * @param userId
     * @param recordId
     * @return  `Boolean`
     */
    public static Boolean authenticateLoggedInUserByRole( String userId, String recordId ){
        UserRecordAccess userAccess = [   
            SELECT RecordId, HasEditAccess 
            FROM UserRecordAccess 
            WHERE UserId = :userId AND RecordId = :recordId
            WITH USER_MODE
            LIMIT 1 
        ];
        
        return userAccess.HasEditAccess;
    }

    /**
     * @param recordId 
     * @return  `ReturnNewRFPTemplate`
     * @exception AuraHandledException
     */
    @AuraEnabled
    public static ReturnNewRFPTemplate fetchNewRFPTemplate( String recordId ){
        try {
            List<Schema.DisplayType> oppFieldsToFormat = new List<Schema.DisplayType>{ 
                Schema.DisplayType.DATE, Schema.DisplayType.MULTIPICKLIST, Schema.DisplayType.BOOLEAN, Schema.DisplayType.DOUBLE
            };
            List<Schema.DisplayType> accFieldsToFormat = new List<Schema.DisplayType>{ 
                Schema.DisplayType.DATE, Schema.DisplayType.CURRENCY, Schema.DisplayType.BOOLEAN, Schema.DisplayType.DOUBLE, Schema.DisplayType.ADDRESS
            };

            ReturnNewRFPTemplate dataToReturn = new ReturnNewRFPTemplate();
            Id userId = UserInfo.getUserId();
            //String userName = UserInfo.getName();

            dataToReturn.isUserAuthorizedViewData = authenticateLoggedInUserByRole( userId, recordId );

            if( !dataToReturn.isUserAuthorizedViewData ){
                return dataToReturn;
            }

            // A Static resource which is sent to client(JS) to be modified later
            StaticResource sr = [ SELECT Body FROM StaticResource WHERE Name = 'NewRFPTemplate' WITH USER_MODE];
            dataToReturn.newRFPTemplateXML = sr.Body.toString();
            
            // Map of Regex Expressions to extract the variables from XML
            dataToReturn.templateRegxExpression = new Map<String, String>{
                'toFindOppAndAccVarialbes'      => '[%%]+[a-zA-Z0-9_.]*[@@]+',
                'toFindOppWithIndexVariables'   => '[%%]+\\[[0-9]*\\]+[.]+[a-zA-Z0-9_]*[@@]+',
                'toFindAllVariables'            => '[%%]+[a-zA-Z0-9_\\[\\].]*[@@]+'
            };

            // Looping part identifier
            dataToReturn.bidHistoryLoopStartIdentifier = '<!-- Bid History Loop Start -->';
            dataToReturn.bidHistoryLoopEndIdentifier   = '<!-- Bid History Loop End -->';

            // Data to replace extracted XML variable(s)
            dataToReturn.documentGeneratedDate = Date.today().format();
            
            if(Pattern.matches('[a-zA-Z0-9]{18}', recordId) && !String.isEmpty(recordId)){
                dataToReturn.memberShipActivityWithAccountData = [
                    SELECT Name, Product_Type_Involved_in_Opp__c, Platforms_Quoted__c, EffectiveDate__c, Status__c,
                    Employees_in_the_Proposal_Medical__c, AccountId, Membership_Activity_Type__c, Members_in_the_Proposal_Medical__c, 
                    Anticipated_Close_Decision_Date_for_Me__c, Existing_Members_Involved_in_the_Bid__c, Estimated_Members_Existing_New__c,
                    Comments__c, Proposal_Received_Date_Medical__c, Proposal_Due_Date_Medical__c, Anticipated_Actual_Close_Date_Medical__c,
                    // Account Fields
                    Account.BillingAddress, Account.BillingStreet, Account.BillingCity, Account.BillingState, Account.BillingCountry, Account.BillingPostalCode,
                    Account.BillingStateCode, Account.Health_Plan_Manager_Industry__c, Account.Coveted_Account__c,
                    Account.CVGAccount__r.Name, Account.CVG_Top_10__c, Account.Private_Equity_Relationship__c, Account.Previous_Customer__c,
                    Account.Cancellation_Date__c, Account.Members_at_Term__c, Account.ReasonforTermMedical__c, 
                    Account.Eligible_US_EEs__c, Account.AnnualB2BSpend__c, Account.Web_Address__c, Account.SVP_Top_10__c,
                    Account.B2BServiceSolution__c, Account.Direct_Marketing_Target__c, Account.Reason_for_Term_Comments__c,
                    //Others
                    Primary_Consulting_Firm__r.Name, PrimaryConsultant__r.Name, Owner.Name, Incumbent_Primary_Medical__r.Name,
                    Incumbent_Secondary_Medical__r.Name
                    FROM Opportunity
                    WHERE Id =: recordId
                    WITH USER_MODE
                ];                
            }

            dataToReturn.listOfBidHistory = [
                SELECT Name, Membership_Activity_Type__c, EffectiveDate__c, Status__c, Product_Type_Involved_in_Opp__c
                FROM Opportunity
                WHERE 
                    AccountId =: ( dataToReturn.memberShipActivityWithAccountData.AccountId ) AND
                    Status__c = 'Closed'
                WITH USER_MODE
                ORDER BY EffectiveDate__c DESC
            ];

            // Map of Object to field names(API) which is used to identify Date datatype in the clientside and format it accordingly 
            dataToReturn.fieldsToFormat = new Map<String, Map<String, Map<String, Object>>>{
                'Opportunity' => new Map<String,  Map<String, Object>>(), 'Account' => new Map<String,  Map<String, Object>>()
            };
        
            for( Schema.SObjectField oppField : Schema.getGlobalDescribe().get('Opportunity').getDescribe().fields.getMap().values() ){
                if( oppFieldsToFormat.contains( oppField.getDescribe().getType() ) ){
                    Map<String, Map<String, Object>> oppFieldsMap = dataToReturn.fieldsToFormat.get('Opportunity');
                    oppFieldsMap.put( oppField.getDescribe().getName(), new Map<String, Object>{
                        'dataType' => oppField.getDescribe().getType().name(),
                        'decimalScale' => oppField.getDescribe().getScale()
                    });
                    dataToReturn.fieldsToFormat.put( 'Opportunity', oppFieldsMap );
                }
            }

            for( Schema.SObjectField accField : Schema.getGlobalDescribe().get('Account').getDescribe().fields.getMap().values() ){
                if( accFieldsToFormat.contains( accField.getDescribe().getType() ) ){
                    Map<String, Map<String, Object>> accFieldsMap = dataToReturn.fieldsToFormat.get('Account');
                    accFieldsMap.put( accField.getDescribe().getName(), new Map<String, Object>{
                        'dataType' => accField.getDescribe().getType().name(),
                        'decimalScale' => accField.getDescribe().getScale()
                    });
                    dataToReturn.fieldsToFormat.put( 'Account', accFieldsMap );
                }
            }

            return dataToReturn;

        } catch (Exception e) {
            throw new AuraHandledException( e.getMessage() );
        }
    }

    //Wrapper class to hold all the queried data
    public class ReturnNewRFPTemplate {
        @AuraEnabled
        public Boolean isUserAuthorizedViewData {get;set;}

        @AuraEnabled
        public String newRFPTemplateXML {get;set;}

        @AuraEnabled
        public Map<String, String> templateRegxExpression {get; set;}

        @AuraEnabled
        public Opportunity memberShipActivityWithAccountData {get; set;}

        @AuraEnabled
        public List<Opportunity> listOfBidHistory {get; set;}

        @AuraEnabled
        public String bidHistoryLoopStartIdentifier {get; set;}

        @AuraEnabled
        public String bidHistoryLoopEndIdentifier {get; set;}

        @auraEnabled
        public String documentGeneratedDate {get; set;}

        @AuraEnabled
        public Map<String, Map<String, Map<String, Object>>> fieldsToFormat {get; set;}
    }

}