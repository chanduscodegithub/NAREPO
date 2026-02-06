/****************************************************************** ***** 
Name: ProposalStyleGuideController 
Copyright © 2025 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
* Purpose      :  
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR                DATE                DETAIL              FEATURES/CSR/TTP  
1.0 -      CRMIT Solutions       23/06/2025      INITIAL DEVELOPMENT     

**********************************************************************/


public with sharing class ProposalStyleGuideController {
	
	@InvocableMethod
    public static List<Response> getPrompt(List<Request> requests) {
        Request input = requests[0];
        List<Response> responses = new List<Response>();
        Response output = new Response();
           // Query the required fields
        List<Proposal_Style_Guide__c> records = [SELECT Subsection_Title__c,Guideline__c FROM Proposal_Style_Guide__c where IsActive__c = true and Type__c = 'Style Guide' ];
         
        // Generate the prompt string
        String promptText = 'Below are the style guidelines:\n\n';

        for (Proposal_Style_Guide__c rec : records) {
            promptText += '- **' + rec.Subsection_Title__c + '**: '+ '\n'+ rec.Guideline__c + '\n\n';
        }

        // Assign the generated prompt to the Response object
        output.Prompt = promptText.trim();

        // Add response to list
        responses.add(output);


            return responses;
	}


	public class Request {
        @InvocableVariable(required=true)
        public RFP_Question_And_Answer__c RFP_Record;
    }
    
    public class Response {
        @InvocableVariable
        public String Prompt;
    }
}