/** ######################################################################################
* @author       Prashanth S
* @date         12/12/2018
* @description  This Rest Webservices is to Associate Case and PolicyInformation with PolicyCase
*                 
*##########################################################################################    */

@RestResource(urlMapping='/QueryPolicy/*')
global class PolicyControllerRest {
    
    @HttpPost 
    global static List<JsonResponse> createORUpdateIssueandPolicyCaseAssociation(String recordTypeName,String ownerName,List<JsonRequest> cases){
        
        System.debug('queryPolicyInfo method start');
        List<JsonResponse> listOfResponses = new List<JsonResponse>();
        JsonResponse responseClass = null;
        
        Integer noRecord_Updated = 0;
        Integer noRecord_Inserted = 0;
        Integer noRecord_Failed = 0;
        Integer policyNoNotExist = 0;
        Integer policyWitoutAccount = 0;
                
        System.debug('Request size ==>'+cases.size());
        try{
            
            // queryRecordTypeId
            
            Id recordTypeId =  PolicyControllerRest.queryRecordTypeId(recordTypeName);
            
            // queryOwnerId
            
            Id ownerId = PolicyControllerRest.queryOwnerId(ownerName);
            
            List<String> policyNumbersSet = new List<String>();
            
            List<String> setOfIssueIds = new List<String>();
            
            Map<String,Map<Id,Id>> policyInformations = new Map<String,Map<Id,Id>>();
            
            Map<String,Map<Id,Id>> IssueIdANDPolicyInfoIdAndAccountIdList = new Map<String,Map<Id,Id>>();
            
            Map<String,Id> issueIdandPolicyInformationId = new Map<String,Id>();
            
            Map<String,String> policyNumberAndIssueIdList = new Map<String,String>();
            
            Map<String,String> issueIdAndPolicyNumberList = new Map<String,String>();
            
            //Map<String,Map<Id,Id>> IssueIdANDPolicyInfoIdAndAccountIdList = new Map<String,Map<Id,Id>>();
            
            Map<String,Id> IssueIdANDIssueSFIdList = new Map<String,Id>();
            
            Map<String,String> IssueSFIdANDPolicyInfoIdList = new Map<String,String>();
            
            Map<String,JsonRequest> issueIdAndCaseObjMap = new Map<String,JsonRequest>();
            
            //List<String> issueAndPolicy = new List<String>();
            
            if(cases.size() > 0){
                Set<Case> caseList = new Set<Case>();
                Integer count = 0;
                Integer i = 0;
                //  String issueIdAndPolicyNum = null;
                boolean proceedExecutionBlock = false;
                
                //System.debug('json Request cases==>'+cases);
                for(JsonRequest rs : cases){
                    
                    i=i+1;
                    count=count+1;
                    if(rs.Issue_ID != null){
                        setOfIssueIds.add(rs.Issue_ID);
                        issueIdAndPolicyNumberList.put(rs.Issue_ID,rs.policyNumber);
                        //issueIdAndCaseObjMap.put(rs.Issue_ID,rs);
                    }
                    if(rs.policyNumber!=null){
                        policyNumbersSet.add(rs.policyNumber);
                        policyNumberAndIssueIdList.put(rs.policyNumber,rs.Issue_ID);
                    }
                    
                    if(i == cases.size()){
                        proceedExecutionBlock = true;
                        
                    }else if(count == 200){
                        proceedExecutionBlock = true;                        
                    }
                    
                    if(proceedExecutionBlock){
                        
                        System.debug('<================  Start proceedExecutionBlock  ================>');
                        System.debug('policyNumbersSet ==>' + policyNumbersSet.size());
                        System.debug('policyNumbersSet ==>' + policyNumbersSet);
                        System.debug('setOfIssueIds ==>' + setOfIssueIds);
                        System.debug('policyNumberAndIssueIdList Size ==>' + policyNumberAndIssueIdList.size());
                        System.debug('policyNumberAndIssueIdList ==>' + policyNumberAndIssueIdList);
                        List<String> issueIdSet = new List<String>();
                        
                        /*for(String issueId : issueIdAndPolicyNumberList.keySet()){
                            issueIdSet.add(issueId);                                                       
                        }
                        
                        System.debug('Issue Id Set ==>'+issueIdSet.size());
                        System.debug('Issue Id Set ==>'+issueIdSet);*/
                        
                        
                        
                        System.debug('caseList size ==>'+caseList.size()); 
                        
                        //System.debug('Issue Ids ==>'+issueIdSet);   
                        
                        
                        
                        List<Policy_Information__c> PolicyInformationList = PolicyControllerRest.queryPolicyInformation(policyNumbersSet);                                               
                        
                        System.debug('PolicyInformationList after querying=>'+PolicyInformationList);
                        
                        if(PolicyInformationList.size()>0){   
                            
                            System.debug('PolicyInformationList size ==>'+PolicyInformationList.size());
                            
                            for(Policy_Information__c PolicyInformation : PolicyInformationList){
                                Map<Id,Id> policyInformationIdandAccountId = new Map<Id,Id>();
                                
                                if(PolicyInformation.Id != null){
                                    
                                    policyInformationIdandAccountId.put(PolicyInformation.Id,PolicyInformation.Company__c);
                                    System.debug('policyInformationIdandAccountId ==>'+policyInformationIdandAccountId);
                                    
                                }
                                if(PolicyInformation.Company__c == null){
                                    policyWitoutAccount++;
                                }
                                policyInformations.put(PolicyInformation.Name,policyInformationIdandAccountId);
                                System.debug('policyInformations inside loop ==>' +policyInformations);
                            }
                            
                        }else{
                            //policyNoNotExist = policyNoNotExist + policyNumbersSet.size();
                            System.debug('PolicyInformation records does not exists in salesforce');
                            responseClass = new JsonResponse('PolicyInformation','','','PolicyInformation records does not exists in Salesforce',0,0,0,0);
                            listOfResponses.add(responseClass);
                        }
                                                
                        for(String issueId : issueIdAndPolicyNumberList.keySet()){
                            String pNo = issueIdAndPolicyNumberList.get(issueId);
                            if(policyInformations.get(pNo) != null){
                                IssueIdANDPolicyInfoIdAndAccountIdList.put(issueId,policyInformations.get(pNo));
                            }                                                        
                        } 
                                                                                               
                        System.debug('policyInformations,==>'+policyInformations);
                        
                        Set<String> queriedPolicyNumbers = policyInformations.keySet();
                        
                        System.debug('QUeried policyNumbers ==>'+queriedPolicyNumbers);
                        
                        List<String> nonExistingPolicyNumbers = new  List<String>();
                        
                       /* for(String policyNum : policyNumbersSet){
                            
                            if(!queriedPolicyNumbers.contains(policyNum)){
                                nonExistingPolicyNumbers.add(policyNum);
                                responseClass = new JsonResponse('PolicyInformation',policyNumberAndIssueIdList.get(policyNum),policyNum,'Policy Number does not exists in salesforce',0,0,0,0);
                                listOfResponses.add(responseClass);
                                policyNoNotExist++;                               
                            }
                        }*/
                        for(String issId:setOfIssueIds){
                            String policyNo = issueIdAndPolicyNumberList.get(issId);
                            if(!queriedPolicyNumbers.contains(policyNo)){
                                nonExistingPolicyNumbers.add(policyNo);
                                responseClass = new JsonResponse('PolicyInformation',issId,policyNo,'Policy Number does not exists in salesforce',0,0,0,0);
                                listOfResponses.add(responseClass);
                                policyNoNotExist++; 
                            }
                        }
                        
                        
                        Set<String> issueIdForQueryingCase = new Set<String>();
                        
                        if(queriedPolicyNumbers.size()>0){
                            
                            //iterate  policyNumberAndIssueIdList
                            // add valuesfrom policyinformations map to the key issue id  IssueIdANDPolicyInfoIdAndAccountIdList map
                                                   
                            System.debug('policyNumberAndIssueIdList==>'+policyNumberAndIssueIdList);
                            
                            //List<String> issueIdsToQuery = new List<String>();
                            
                           /* for(String policyNum : queriedPolicyNumbers){
                                if(policyNumberAndIssueIdList.get(policyNum) != null && policyinformations.get(policyNum) != null){
                                    String issueId = policyNumberAndIssueIdList.get(policyNum);
                                    
                                    System.debug('issueId ==>'+issueId + 'policyNum ==>'+policyNum);
                                    System.debug('Values  =>'+policyNumberAndIssueIdList.get(policyNum));
                                    System.debug('policyinformations Values  =>'+policyinformations.get(policyNum));
                                    Map<Id,Id> returnMap = policyinformations.get(policyNum);
                                    
                                                     
                                    if(policyNumberAndIssueIdList.get(policyNum) != null){
                                        IssueIdANDPolicyInfoIdAndAccountIdList.put(issueId,returnMap);
                                    }
                                }
                            }*/
                            
                            
                            System.debug('IssueIdANDPolicyInfoIdAndAccountIdList ==>'+IssueIdANDPolicyInfoIdAndAccountIdList);
                            
                            
                            // iterate this loop and get accountId and set in caseList
                            // also add issueId and PolicyId to a map
                            
                            System.debug('IssueIdANDPolicyInfoIdAndAccountIdList values ==>' +IssueIdANDPolicyInfoIdAndAccountIdList.values());
                            issueIdForQueryingCase = IssueIdANDPolicyInfoIdAndAccountIdList.keySet();
                            
                            for(JsonRequest rs1 : cases){
                                
                                Case case11 = new Case();                         
                                if(rs1.Source_System != null){
                                    case11.Source_System__c = rs1.Source_System;
                                }if(rs1.Originator != null){
                                    case11.Originator__c=rs1.Originator;
                                }if(rs1.Internal_External != null){
                                    case11.Internal_External__c=rs1.Internal_External;
                                }if(rs1.CreatedDate != null){
                                    case11.CreatedDate=rs1.CreatedDate;
                                }if(rs1.LastModifiedDate != null){
                                    case11.LastModifiedDate=rs1.LastModifiedDate;
                                }if(rs1.Date_Completed != null){
                                    case11.Date_Completed__c=rs1.Date_Completed;
                                }if(rs1.SuppliedName != null){
                                    case11.SuppliedName=rs1.SuppliedName;
                                }if(rs1.Issue_ID != null){
                                    case11.Issue_ID__c=rs1.Issue_ID;
                                }if(rs1.Subject != null){
                                    case11.Subject=rs1.Subject;
                                }if(rs1.Issue_TAT != null){
                                    case11.Issue_TAT__c=rs1.Issue_TAT;
                                }if(rs1.Category != null){
                                    case11.Category__c=rs1.Category;
                                }if(rs1.Resolution != null){
                                    case11.Resolution__c=rs1.Resolution;
                                }if(rs1.Description != null){
                                    case11.Description=rs1.Description;
                                }if(rs1.Member_Name != null){
                                    case11.Member_Name__c=rs1.Member_Name;
                                }if(RecordTypeId != null){
                                    case11.RecordTypeId = RecordTypeId;
                                }if(OwnerId != null){
                                    case11.OwnerId = OwnerId;
                                }if(rs1.status != null){
                                    case11.Status = rs1.status;
                                }
                                //System.debug('Date_Completed__c ==>' +case11.Date_Completed__c);
                                if(case11.Date_Completed__c < case11.CreatedDate || case11.Date_Completed__c > Date.today()){
                                    //System.debug('dateCompleted is less than createdDate and greater than current date');
                                    case11.Date_Completed__c = case11.CreatedDate.date();
                                }
                                
                                if(issueIdForQueryingCase.contains(case11.Issue_ID__c)){                                    
                                    caseList.add(case11);
                                }
                                
                            }
                            //System.debug('caseList size '+caseList.size());
                            //System.debug('caseList  ==after quering policy ==>>'+caseList);
                            //System.debug('Issue Ids for Querying Case Records ==>'+issueIdForQueryingCase);
                            
                        }
                        
                        if(IssueIdANDPolicyInfoIdAndAccountIdList.size()>0){
                            
                            for(String issueId : issueIdForQueryingCase){
                                
                                if(IssueIdANDPolicyInfoIdAndAccountIdList.get(issueId) != null){
                                    //System.debug('Inside loop issueId' + issueId);
                                    //System.debug('Inside loop IssueIdANDPolicyInfoIdAndAccountIdList.get(issueId)' + IssueIdANDPolicyInfoIdAndAccountIdList.get(issueId));
                                    Map<Id,Id> returnMap1 = IssueIdANDPolicyInfoIdAndAccountIdList.get(issueId);
                                    
                                    Set<Id> policyIds = returnMap1.keySet();
                                    
                                    System.debug('policyIds ==>' + policyIds);
                                    
                                    for(Case cass : caseList){
                                        
                                        if(cass.Issue_ID__c.equals(issueId)){
                                            
                                            for(Id id : policyIds){
                                                cass.AccountId = returnMap1.get(id);
                                                issueIdandPolicyInformationId.put(issueId,id);
                                            }
                                        }
                                        
                                    }
                                }
                                
                            }
                        }
                        
                        //System.debug('issueIdandPolicyInformationId.put(issueId,policyId) ==>'+issueIdandPolicyInformationId);
                        // query Issue records In Bulk
                        
                        //System.debug('issueIdSet size ==>' + issueIdForQueryingCase.size());
                        //System.debug('issueIdSet values ==>' + issueIdForQueryingCase);
                        
                        List<Case> ListOfCases = [select Id,Issue_Id__c from Case where Issue_Id__c IN:issueIdForQueryingCase];
                        
                        Set<String> issueIdNeedsTobeInserted = new  Set<String>();
                        Set<String> issueIdNeedsTobeUpdated = new  Set<String>();
                        
                        //System.debug(' ListOfCases size ==>'+ListOfCases.size());
                        //System.debug(' ListOfCases queried ==>'+ListOfCases);
                        
                        Set<Case> updateList = new Set<Case>();
                        
                        if(ListOfCases.size()>0){
                            
                            for(Case cas : ListOfCases){
                                
                                if(cas.Id != null){
                                    
                                    // update List
                                    
                                    for(Case ca : caseList){
                                        if(ca.Issue_ID__c.equals(cas.Issue_ID__c)){
                                            // itearte this IssueIdANDPolicyInfoIdAndAccountIdList map to get policyId and accountId
                                            /*System.debug('issue_id from DB ==>' + ca.Issue_ID__c);
                                            System.debug('issue_id from SF ==>' + cas.Issue_ID__c);
                                            System.debug('Id from SF ==>' + cas.Id);*/
                                            
                                            ca.Id = cas.Id;
                                            
                                            // updateIssuesList.add(ca);
                                            if(!issueIdNeedsTobeUpdated.contains(cas.Issue_ID__c)){
                                                updateList.add(ca);
                                            }
                                            
                                            //System.debug('updateIssuesList inside ==>'+updateList);
                                            
                                            issueIdNeedsTobeUpdated.add(cas.Issue_ID__c);       
                                        }
                                    }
                                    // because we need to associate only for newly created cases
                                    
                                }
                                
                            }
                            //System.debug('issueIdNeedsTobeUpdated' + issueIdNeedsTobeUpdated);
                        }
                        
                        for(String issueid : issueIdForQueryingCase){
                            if(issueIdNeedsTobeUpdated.contains(issueid)){
                                
                            }else{
                                issueIdNeedsTobeInserted.add(issueid);
                            }
                        }
                        
                        
                        //System.debug('issueIdNeedsTobeInserted' + issueIdNeedsTobeInserted);
                        Set<Case> insertList = new Set<Case>();
                        Set<String> isAddedToList = new Set<String>();
                        
                        if(issueIdNeedsTobeInserted.size()>0){
                            
                            for(Case ca : caseList){
                                if(issueIdNeedsTobeInserted.contains(ca.Issue_ID__c)){
                                    
                                    if(!isAddedToList.contains(ca.Issue_ID__c)){
                                        insertList.add(ca);
                                        isAddedToList.add(ca.Issue_ID__c);
                                    }
                                }
                            }
                        }
                        /*System.debug('updateList Size==>' +updateList.size());
                        System.debug('updateList ==>' +updateList);
                        System.debug('insertList Size==>' +insertList.size());
                        System.debug('insertList ==>' +insertList);*/
                        
                        // update updateIssuesList;
                        
                        Set<Id> newlyUpdatedIssueIds = new Set<Id>();
                        
                        if(updateList.size()>0){
                            List<Case> updateIssuesList = new List<Case>();
                            
                            updateIssuesList.addAll(updateList);
                            //System.debug('updateIssuesList ==>' +updateIssuesList);
                            Database.SaveResult[] srList = Database.update(updateIssuesList, false);
                            
                            // Iterate through each returned result
                            Integer c = 0;
                            for (Database.SaveResult sr : srList) {                                
                                if (sr.isSuccess()) {
                                    // Operation was successful, so get the ID of the record that was processed
                                    //System.debug('Successfully updated Issue records. Issue ID: ' + sr.getId());
                                    noRecord_Updated++;
                                    newlyUpdatedIssueIds.add(sr.getId());
                                }
                                else {
                                    // Operation failed, so get all errors                
                                    for(Database.Error err : sr.getErrors()) {
                                        //System.debug('The following error has occurred while updating issue record ==>.'+updateIssuesList.get(c).Issue_ID__c);                    
                                        //System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                        //System.debug('Issue fields that affected this error: ' + err.getFields());
                                        noRecord_Failed++;
                                        responseClass = new JsonResponse('Issue',updateIssuesList.get(c).Issue_ID__c,'Issue fields that affected updation'+err.getFields(), err.getMessage(),0,0,0,0);
                                        listOfResponses.add(responseClass); 
                                    }
                                }
                                c++;
                            }                                                                                           
                        }else{
                            System.debug('No issue records to update');
                        }
                        
                        
                        System.debug('newly updated issue ids ==>' +newlyUpdatedIssueIds);
                        
                        
                        try{
                            
                            if(newlyUpdatedIssueIds.size()>0){
                                
                                List<Case> updatedCasesList = [select Id,Issue_Id__c from Case where Id IN:newlyUpdatedIssueIds];
                                
                                System.debug('createdCasesList ==>' +updatedCasesList.size());
                                
                                if(updatedCasesList.size()>0){
                                    
                                    for(Case c : updatedCasesList){
                                        
                                        //System.debug('issue id and Id ==>'+c.Issue_ID__c+ c.Id);
                                        IssueIdANDIssueSFIdList.put(c.Issue_ID__c, c.Id);
                                    }
                                }
                            }
                            
                        }catch(Exception e){
                            System.debug('error occurred while querying newly updated issue records ==>'+e);
                        }
                        
                        
                        Set<Id> newlyCreatedIssueIds = new Set<Id>();
                        
                        //insert insertIssuesList;
                        
                        if(insertList.size()>0){
                            List<Case> insertIssuesList = new List<Case>();
                            
                            insertIssuesList.addAll(insertList);
                            
                            //System.debug('insertIssuesList ==>' +insertIssuesList);
                            
                            Database.SaveResult[] srList = Database.insert(insertIssuesList, false);
                            Integer c = 0;
                            // Iterate through each returned result
                            for (Database.SaveResult sr : srList) {
                                if (sr.isSuccess()) {
                                    // Operation was successful, so get the ID of the record that was processed
                                    //System.debug('Successfully inserted Issue records. Issue ID: ' + sr.getId());
                                    
                                    newlyCreatedIssueIds.add(sr.getId());
                                    noRecord_Inserted++;
                                }
                                else {
                                    // Operation failed, so get all errors                
                                    for(Database.Error err : sr.getErrors()) {
                                        //System.debug('The following error has occurred while inserting issue record ==>.');                    
                                        //System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                        //System.debug('Issue fields that affected this error: ' + err.getFields());
                                        responseClass = new JsonResponse('Issue',insertIssuesList.get(c).Issue_ID__c,'Issue fields that affected insertion'+err.getFields(), err.getMessage(),0,0,0,0);
                                        listOfResponses.add(responseClass);
                                        noRecord_Failed++;
                                    }                                    
                                }
                                c++;
                            }                           
                        }else{
                            System.debug('No issue records to insert');
                        }
                        
                        
                        // Query inewly created issues for issue id
                        //System.debug('newly created issue ids ==>' +newlyCreatedIssueIds);
                        
                        try{
                            
                            if(newlyCreatedIssueIds.size()>0){
                                
                                List<Case> createdCasesList = [select Id,Issue_Id__c from Case where Id IN:newlyCreatedIssueIds];
                                
                                System.debug('createdCasesList ==>' +createdCasesList.size());
                                
                                if(createdCasesList.size()>0){
                                    
                                    for(Case c : createdCasesList){
                                        
                                        //System.debug('issue id and Id ==>'+c.Issue_ID__c+ c.Id);
                                        IssueIdANDIssueSFIdList.put(c.Issue_ID__c, c.Id);
                                    }
                                }
                            }
                            
                        }catch(Exception e){
                            System.debug('error occurred while querying newly created issue records ==>'+e);
                        }
                        
                        //System.debug('Issue ID(external) and issue id(SF )==>'+IssueIdANDIssueSFIdList);
                        
                        //System.debug('Issue id(external ) and policyinformationId ==>'+issueIdandPolicyInformationId);
                        
                        
                        /*   try{

if(newlyCreatedIssueIds.size()>0){

List<Case> createdCasesList = [select Id,Issue_Id__c from Case where Id IN:newlyCreatedIssueIds];

System.debug('createdCasesList ==>' +createdCasesList.size());

if(createdCasesList.size()>0){

for(Case c : createdCasesList){

System.debug('issue id and Id ==>'+c.Issue_ID__c+ c.Id);
IssueIdANDIssueSFIdList.put(c.Issue_ID__c, c.Id);
}
}
}

}catch(Exception e){
System.debug('error occurred while querying newly created issue records ==>'+e);
} */
                        
                        
                        
                        // to add caseId and PolicyInfoId for policaseAssociation
                        Map<Id,Id> associationMap = new Map<Id,Id>();
                        
                        for(String issueId:IssueIdANDIssueSFIdList.keySet()){
                            
                            Id policyInfoId = issueIdandPolicyInformationId.get(issueId);
                            Id caseId = IssueIdANDIssueSFIdList.get(issueId);
                            
                            //System.debug('policyInfoId==>'+policyInfoId +'caseId==>'+caseId);
                            associationMap.put(caseId,policyInfoId);
                            
                        }
                        
                        System.debug('associationMap ==>'+associationMap);
                        System.debug('associationMap ==>'+associationMap.size());
                        
                        //policyCase insert list
                        
                        List<PolicyCase__c> policyCaseInsertList = new List<PolicyCase__c>();
                        
                        Set<PolicyCase__c> policyCaseListToInsert = new Set<PolicyCase__c>();
                        
                        if(associationMap.size()>0){
                            
                            Set<Id> caseIds = associationMap.keySet();
                            Set<Id> policyInfoIds = new Set<Id>();
                            
                            Set<Id> policyIds = new Set<Id>();
                            for (Id key: caseIds) {
                                Id value = associationMap.get(key);
                                policyIds.add(value);
                            }
                            // query policycase existing association
                            
                            List<PolicyCase__c> queiedPolicyCaseList = [Select Id,Case__c,Policy__c from PolicyCase__c where Case__c IN: caseIds AND Policy__c IN: policyIds];
                            System.debug('Queried policy case list ==>'+queiedPolicyCaseList);
                            
                            for (Id key: caseIds) {
                                Id value = associationMap.get(key);
                                PolicyCase__c policyCase = new Policycase__c();
                                policyCase.Case__c = key;
                                policyCase.Policy__c = value;
                                
                                policyCaseInsertList.add(policyCase);
                            }
                            System.debug('policy case list  to insert==>'+policyCaseInsertList);
                            
                            
                            System.debug('policyCaseInsertList size ==>'+policyCaseInsertList.size());
                            System.debug('queiedPolicyCaseList size ==>'+queiedPolicyCaseList.size());
                            
                            if(queiedPolicyCaseList.size() > 0){
                                
                               // for(PolicyCase__c policyCasinser : policyCaseInsertList){
                                                                        
                                    for(PolicyCase__c queriedPolicyCase : queiedPolicyCaseList){
                                    
                                        boolean exists = true;
                                    for(Integer z=0;z<policyCaseInsertList.size();z++){
                                        
                                        //System.debug('policyCasinser ===>'+policyCasinser);
                                        //System.debug('queriedPolicyCase ===>'+queriedPolicyCase);
                                        if(policyCaseInsertList[z].Case__c == queriedPolicyCase.Case__c) {
                                            if(policyCaseInsertList[z].Policy__c == queriedPolicyCase.Policy__c){
                                            
                                            exists = false;
                                                policyCaseInsertList.remove(z);
                                                
                                            }
                                       
                                        }
                                        if(exists){
                                            policyCaseListToInsert.add(policyCaseInsertList[z]);
                                        }
                                     }
                                
                            }
                        }else{
                                policyCaseListToInsert.addAll(policyCaseInsertList);
                            }
                            policyCaseListToInsert.addAll(policyCaseInsertList);
                            System.debug('policyCaseInsertList ==>' +policyCaseListToInsert);
                            
                            
                            
                            //policasecase association
                            
                            if(policyCaseInsertList.size()>0){
                                
                                //insert policyCaseInsertList;
                                List<PolicyCase__c> policyCaseListToInsertIntoSF = new List<PolicyCase__c>();
                                policyCaseListToInsertIntoSF.addAll(policyCaseListToInsert);
                                System.debug('policyCaseListToInsertIntoSF ==>'+policyCaseListToInsertIntoSF);
                                
                                Database.SaveResult[] srList = Database.insert(policyCaseListToInsertIntoSF, false);
                                Integer c = 0;
                                // Iterate through each returned result
                                for (Database.SaveResult sr : srList) {
                                    if (sr.isSuccess()) {
                                        // Operation was successful, so get the ID of the record that was processed
                                        System.debug('Successfully inserted Policase records. Policase ID: ' + sr.getId());
                                    }
                                    else {
                                        // Operation failed, so get all errors                
                                        for(Database.Error err : sr.getErrors()) {
                                            /*System.debug('The following error has occurred while inserting Policase record ==>.');                    
                                            System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                            System.debug('Policase fields that affected this error: ' + err.getFields());*/
                                            
                                            responseClass = new JsonResponse('policyCase',policyCaseListToInsertIntoSF.get(c).Case__c,'Policase fields that affected this insertion: ' + err.getFields(), err.getMessage(),0,0,0,0);
                                            listOfResponses.add(responseClass);
                                        }
                                        
                                    }
                                    c++;
                                }                                
                            }                             
                            
                            
                        }else{
                            
                            System.debug('No records found to associate with policyCase');
                        }
                        count=0;
                        caseList = new Set<Case>();
                        proceedExecutionBlock = false;
                        
                        policyNumbersSet = new List<String>();
                        issueIdSet = new List<String>();
                        policyNumberAndIssueIdList = new Map<String,String>();
                        //System.debug('count value ==>' +count);
                        //System.debug('caseList Size ==>' +caseList.size());
                        //System.debug('<===========================proceedexceutionblock END=================================>');
                        
                    }// proceedexceutionblock loop
                    
                }// iterative for loop
            }else{
                System.debug('Request Payload is empty');
                responseClass = new JsonResponse('','','','Request Payload cannot be empty',0,0,0,0);
                listOfResponses.add(responseClass);
            }
            
        }catch(Exception e){
            System.debug('error occurred in Main method ==>' + e.getMessage());
            responseClass = new JsonResponse('policyInformation','','error occurred in Main method', e.getMessage(),0,0,0,0);
            listOfResponses.add(responseClass);
            
        }
        System.debug('queryPolicyInfo method End');
        responseClass = new JsonResponse('RequestResult','','','',noRecord_Inserted,noRecord_Updated,noRecord_Failed,policyNoNotExist);
        listOfResponses.add(responseClass);
        System.debug('Inserted '+noRecord_Inserted+' Updated '+noRecord_Updated+' Failed '+noRecord_Failed+' PolicyWithNoAccounts '+policyWitoutAccount+' Policy Not Exist '+policyNoNotExist);
        
        return listOfResponses;
    }
    
    
    global class JsonRequest {
        
        global String Source_System;
        global String Originator { get; set; }
        global String Internal_External;
        global String policyNumber;
        global Datetime CreatedDate;
        global Datetime LastModifiedDate;
        global Date Date_Completed;
        global String SuppliedName;
        global String Issue_ID;
        global String Subject;
        global Decimal Issue_TAT;
        global String Category;
        global String Resolution;
        global String Description;
        global String Member_Name;
        global String status;
    }
    
    global class JsonResponse {
        public String objectName;
        public String issueId;
        public String id;
        public String errorMessage;       
        Public Integer noRecord_Failed;
        Public Integer noRecord_Inserted;
        Public Integer noRecord_Updated;
        public Integer policyNoNotExist;
        
        public JsonResponse(String objectName,String issueId,String id,String errorMessage,Integer noRecord_Inserted,Integer noRecord_Updated,Integer noRecord_Failed,Integer policyNoNotExist) {
            this.objectName = objectName;
            this.issueId = issueId;
            this.id = id;
            this.errorMessage = errorMessage;               
            this.noRecord_Inserted = noRecord_Inserted;
            this.noRecord_Updated = noRecord_Updated;
            this.noRecord_Failed = noRecord_Failed;
            this.policyNoNotExist = policyNoNotExist;
        }
    }
    
    public static Id queryRecordTypeId(String recordTypeName){
        
        System.debug('queryRecordTypeId method start');
        
        List<Case> caseList;
        Id recordTypeId = null;
        try{
            System.debug('recordTypeName ==>' +recordTypeName);
            
            caseList = [Select RecordTypeId From Case Where RecordType.Name =: recordTypeName Limit 1];         
            
            for(Case cas : caseList){
                
                recordTypeId = cas.RecordTypeId;
            }
            
            
        }catch(Exception e) {
            System.debug('An unexpected error has occurred: while querying recordTypeId' + e.getMessage());
        }
        
        System.debug('queryRecordTypeId method end');
        return recordTypeId;
    }
    
    
    public static Id queryOwnerId(String ownerName){
        
        System.debug('queryOwnerId method start');
        
        List<User> userList;
        Id ownerId = null;
        try{
            System.debug('ownerName ==>' +ownerName);
            
            userList = [Select Id From User Where Username=:ownerName];
            
            for(User ur : userList){
                
                ownerId = ur.Id;
            }
            
        }catch(Exception e) {
            System.debug('An unexpected error has occurred: while querying ownerId' + e.getMessage());
            
        }
        System.debug('ownerId ==>' +ownerId);
        
        System.debug('queryOwnerId method end');
        return ownerId;
    }
    
    
    public static List<Policy_Information__c> queryPolicyInformation(List<String> policyNumbersSet){
        System.debug('queryPolicyInformation method start');
        
        List<Policy_Information__c> PolicyInformationList = new List<Policy_Information__c>();
        try{
            //System.debug('policyNumbersSet in separate method ==>'+policyNumbersSet);
            PolicyInformationList = [Select Id,Name,Company__c From Policy_Information__c Where Name IN:policyNumbersSet];
            
            //System.debug('after querying PolicyInformationList==>'+PolicyInformationList);
            
        }catch(Exception e) {
            System.debug('An error has occurred: while querying policyInformation' + e.getMessage());            
        }
        System.debug('queryPolicyInformation method end');
        return PolicyInformationList;
    }    
}