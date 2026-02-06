public class updateOpportunityOwnerName {
	//Apex class to Update the company Owner name to the Membership Activity based on the 'status' field which has to be in 'Open'
	 @InvocableMethod
    public static void updateOwnerName(processBuildersVariables[] params){
        //This method Query all Membership Activities whose status field is Open and copies the new Owner Name
        List<Id> AccountIdList;
        List<Id> ownerIdList;
        List<Opportunity> oppListToBeUpdated = new List<Opportunity>();
        for(processBuildersVariables wp : params){
            AccountIdList = wp.accountId;
			ownerIdList = wp.ownerId;            
        }
        Map<Id, Account> queriedAccMap = new Map<Id, Account>([SELECT Id, (SELECT Id, OwnerId FROM Opportunities WHERE Status__c = 'Open') FROM Account WHERE Id IN:AccountIdList]);
        system.debug('acc Records '+queriedAccMap);
        for (Integer i = 0; i<AccountIdList.size(); i++) {
            List<Opportunity> accOpportunity = queriedAccMap.get(AccountIdList[i]).Opportunities;
            for (Opportunity oppData : accOpportunity) {
                system.debug('Opportunity Owner Id '+oppData.OwnerId+' Account Owner Id '+ownerIdList[i]);
                oppData.OwnerId = ownerIdList[i];
                oppListToBeUpdated.add(oppData);
            }
        }
        if(!oppListToBeUpdated.isEmpty()){
            update oppListToBeUpdated;
        }
    }
    
    Public class processBuildersVariables {
        
        @InvocableVariable
        Public List<Id> accountId;
        
        @InvocableVariable
        Public List<ID> ownerId;
    }
}