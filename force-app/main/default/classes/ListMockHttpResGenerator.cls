/*------------------------------------------------------------
Author:        Prashanth.R 
Company:       CRMIT
Description:   Mock response for ListView Class              
History
<Date>      <Authors Name>     <Brief Description of Change>
26/09/2018   Prashanth.R       Created.
------------------------------------------------------------*/
@isTest
global class ListMockHttpResGenerator implements HttpCalloutMock {
    // Implement this interface method
    global HTTPResponse respond(HTTPRequest req) {
        // Create a fake response
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{"columns":[{"ascendingLabel":"Z-A","descendingLabel":"A-Z","fieldNameOrPath":"Name","hidden":false,"label":"Company Name","selectListItem":"Name","sortDirection":"ascending","sortIndex":0,"sortable":true,"type":"string"}],'+
                    '"id":"00B6A000007H3kO",'+
                    '"orderBy":['+
                        '{"fieldNameOrPath":"Name","nullsPosition":"first","sortDirection":"ascending"},'+
                        '{"fieldNameOrPath":"Id","nullsPosition":"first","sortDirection":"ascending"}],'+
                    '"query":"SELECT Name, RecordType.Name, OwnerName__c, toLabel(Company_Tier_Medical__c), EligibleUSEEsandRetirees__c, IncumbentPrimaryMedical__r.Name, IncumbentSecondaryMedical__r.Name, Incumbent_Primary_Pharmacy__r.Name, Incumbent_Secondary_Pharmacy__r.Name, IncumbentPrimaryDental__r.Name, Incumbent_Secondary_Dental__r.Name, IncumbentPrimaryVision__r.Name, Incumbent_Secondary_Vision__r.Name, ParticipatingUSMembers__c, Id, RecordTypeId, CreatedDate, LastModifiedDate, SystemModstamp, IncumbentPrimaryMedical__c, IncumbentSecondaryMedical__c, Incumbent_Primary_Pharmacy__c, Incumbent_Secondary_Pharmacy__c, IncumbentPrimaryDental__c, Incumbent_Secondary_Dental__c, IncumbentPrimaryVision__c, Incumbent_Secondary_Vision__c FROM Account WHERE RecordTypeId = \'0126A000000T7jI\' OR RecordTypeId = \'0126A000000T7jJ\' OR RecordTypeId = \'0126A000000T7jL\' ORDER BY Name ASC NULLS FIRST, Id ASC NULLS FIRST",'+
                    '"scope":"everything",'+
                    '"sobjectType":"Account",'+
                    '"whereCondition":{'+
                        '"conditions":[{"field":"RecordTypeId","operator":"equals","values":["\'0126A000000T7jI\'"]}],"conjunction":"or"}}');
        res.setStatusCode(200);
        return res;
    }
}