public class Campaign_Association_Campaign_Obj {
    @InvocableMethod(label='Campaign Association from Campaign' description='Associates campaigns with contacts.')
    public static void associateCampaigns(List<ID> cmapaignId){
        Id campaignId = cmapaignId.get(0);
        List<CampaignMember> cMemberList = new List<CampaignMember>();
        UHGContactSOQLConstants uhgContactSOQLConstants = new UHGContactSOQLConstants();
        UHGContactConstants uhgContactConstants = new UHGContactConstants();
        
        System.debug('campaignId-->>'+campaignId);
        
        try{
            if(campaignId != null){
                if(schema.sobjecttype.Campaign.isAccessible() && schema.sobjecttype.Campaign.isQueryable()){
                    Campaign camp = Database.query(uhgContactSOQLConstants.QUERY_FOR_CAMPAIGN);
                    //System.debug('camp type -->>'+camp.Correspondence_Type__c);
                    //String corrType = camp.Correspondence_Type__c;
                    
                    if((camp.Status.equals(uhgContactConstants.PLANNED)) || (camp.Status.equals(uhgContactConstants.INPROGRESS))){
                        System.debug('SOQL -->>'+uhgContactSOQLConstants.QUERY_FOR_CONTACTS);
                        //String q1 = 'SELECT Id FROM Contact WHERE Correspondence_type__c = :corrType AND Status__c = \'Active\'';
                        //System.debug('q1-->>'+q1);
                        //List<Contact> contactList = Database.query(q1);
                        List<Contact> contactList = Database.query(uhgContactSOQLConstants.QUERY_FOR_CONTACTS);
                        
                       /* if(contactList.size() != 0){
                            for(Contact con : contactList){
                                CampaignMember cm = new CampaignMember(CampaignId = campaignId, ContactId = con.Id);
                                cMemberList.add(cm);
                            }
                        }
                        System.debug('Number of Contacts to associate to Campaign Id:'+campaignId+' are -->>'+contactList.size());
                        
                        if(cMemberList != null){
                            Database.SaveResult[] lsr = Database.insert(cMemberList, false);
                            
                            for (Database.SaveResult sr : lsr) {
                                if (sr.isSuccess()) {
                                    System.debug('Successfully inserted record. Record ID: ' + sr.getId());
                                }
                                else {
                                    for(Database.Error err : sr.getErrors()){
                                        System.debug('The following error has occurred.');                    
                                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                        System.debug('Fields that affected this error: ' + err.getFields());
                                    }
                                }
                            }
                        } */
                    }
                }else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Error(NullPointerException) occurred while querying the details of Campaign object from SF in '+'associateCampaigns() method ->'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Campaign object from SF in associateCampaigns() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in associateCampaigns() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
        }catch(Exception e){
            System.debug('Exception message - '+e.getLineNumber()+' Message'+e.getMessage());   
        }
    }
}