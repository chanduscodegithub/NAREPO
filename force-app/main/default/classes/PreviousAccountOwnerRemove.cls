/* Create By Prashanth.R 26-9-2018*/
// This will be used in process builder to remove the previous account owner from the related MA Team.
public class PreviousAccountOwnerRemove {
    @InvocableMethod(label='Remove Previous Account Owner' description='All Associated Team.')
    public static void removeOppTeam(List<Id> AccId){
        List<OpportunityTeamMember> accountOpportunityTeamMbr = null;
        accountOpportunityTeamMbr = new List<OpportunityTeamMember>();
        Id usrId = [Select PreviousOwner__c from Account where Id=:AccId].PreviousOwner__c;
        accountOpportunityTeamMbr = [select id from OpportunityTeamMember where userId=:usrId And Opportunity.AccountId=:AccId];
        Database.DeleteResult[] oppdbDelResultList = Database.delete(accountOpportunityTeamMbr, false);
        if(oppdbDelResultList != null && oppdbDelResultList.size() > 0) {
            // Iterate through each returned result
            for (Database.DeleteResult oppTeamDeleteResult : oppdbDelResultList) {
                if(!oppTeamDeleteResult.isSuccess()) {               
                    for(Database.Error err : oppTeamDeleteResult.getErrors()) {
                        System.debug('The following error has occurred.');                    
                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                        System.debug('Fields that affected this error: ' + err.getFields());
                    }
                }
            }
        }
    }
}