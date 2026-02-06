/****************************************************************** ***** 
Name: GeneralStyleChecksController 
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

public with sharing class GeneralStyleChecksController {

    /**
     * @method getPrompt
     * @access InvocableMethod
     * @description
     *    This method queries all 'Proposal_Style_Guide__c' records with Type = 'General Checks',
     *    concatenates their 'Checks__c' field values into a single formatted string,
     *    and returns that as the Prompt text in the response object to prompt builder.
     *
     *
     * @return List<Response> containing a single prompt string.
     */


@InvocableMethod
    public static List<Response> getPrompt(List<Request> requests) {
        Request input = requests[0];

        // Initialize response container
        List<Response> responses = new List<Response>();
        Response output = new Response();
  
        // Query the required fields
        List<Proposal_Style_Guide__c> records = [
            SELECT Subsection_Title__c,Checks__c FROM Proposal_Style_Guide__c where Type__c = 'General Checks'
        ];

        // Generate the prompt string
        String promptText = '';

        for (Proposal_Style_Guide__c rec : records) {
            promptText +=  rec.Checks__c + '\n\n';
        }

        // Assign the generated prompt to the Response object
        output.Prompt = promptText.trim();

        // Add response to list
        responses.add(output);

		return responses;
	}


	public class Request {
        @InvocableVariable(required=true)
        public String RFP_Q_A_Chunks;
    }
    
    public class Response {
        @InvocableVariable
        public String Prompt;
    }
}