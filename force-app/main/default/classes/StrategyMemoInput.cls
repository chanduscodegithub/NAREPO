/****************************************************************** ***** 
Name: StrategyMemoInput 
Copyright © 2025 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
* Purpose      : 
======================================================  
History 
------- 
VERSION      AUTHOR                DATE                DETAIL              FEATURES/CSR/TTP  
1.0 -      CRMIT Solutions       23/06/2025      INITIAL DEVELOPMENT     

**********************************************************************/


public with sharing class StrategyMemoInput {

    @InvocableMethod
    public static List<Response> getPromptInput(List<Request> requests) {
        List<Response> responses = new List<Response>();

        for (Request input : requests) {

            Response output = new Response();

            // Query Strategy Memo record
            List<Strategy_Memo__c> records = [
                SELECT People__c,
                       Company_Name_as_per_RFP__c,
                       Business_Overview__c,
                       Business_Pressures__c,
                       Potential_Compelling_Event__c,
                       Unique_Business_Value__c,
                       Key_Risks_to_our_UBV__c,
                       Outcome_Drivers__c,
                       Surest_Approach_Strategy__c
                FROM Strategy_Memo__c 
                WHERE Id = :input.Strategy_Memo_Input
            ];

            if (!records.isEmpty()) {
                Strategy_Memo__c rec = records[0];
                String promptString = '';

                if (rec.Business_Overview__c != null) promptString += '*Business Overview*: ' + rec.Business_Overview__c + '\n\n';
                if (rec.Business_Pressures__c != null) promptString += '*Business Pressures*: ' + rec.Business_Pressures__c + '\n\n';
                if (rec.Potential_Compelling_Event__c != null) promptString += '*Potential Compelling Event*: ' + rec.Potential_Compelling_Event__c + '\n\n';
                if (rec.Unique_Business_Value__c != null) promptString += '*Unique Business Value*: ' + rec.Unique_Business_Value__c + '\n\n';
                if (rec.Key_Risks_to_our_UBV__c != null) promptString += '*Key Risks to our UBV*: ' + rec.Key_Risks_to_our_UBV__c + '\n\n';
                if (rec.Outcome_Drivers__c != null) promptString += '*Outcome Drivers*: ' + rec.Outcome_Drivers__c + '\n\n';
                if (rec.Surest_Approach_Strategy__c  != null) promptString += '*Surest Approach Strategy*: ' + rec.Surest_Approach_Strategy__c  + '\n\n';

                output.Prompt = promptString; // Remove trailing newline
            } else {
                output.Prompt = 'No Strategy Memo found for the provided Membership Activity.';
            }

            responses.add(output);
        }
        return responses; 
    }

    public class Request {
        @InvocableVariable        
        public String Strategy_Memo_Input ;
        @InvocableVariable
        public String RFP_Question_and_Answer;
    }

    public class Response {
        @InvocableVariable
        public String Prompt;
    }
}