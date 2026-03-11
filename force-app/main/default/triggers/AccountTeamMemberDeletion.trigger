trigger AccountTeamMemberDeletion on AccountTeamMember (after delete) {
    
    if (Trigger.isAfter) {
        if (Trigger.isDelete) {
            List<AccountTeamMember> deletedAccTeamMemberLst=Trigger.old;
            try{
            String msgText='<p>Below is the Deleted AccountTeamMember Info<br/> </p>';
            for(AccountTeamMember eachAccntTeamMember:deletedAccTeamMemberLst){
                msgText+='Id:'+eachAccntTeamMember.Id+'<br/>';
                msgText+='AccountId:'+eachAccntTeamMember.AccountId+'<br/>';
                msgText+='RemovedUserId:'+eachAccntTeamMember.UserId+'<br/>';
                msgText+='TeamMemberRole:'+eachAccntTeamMember.TeamMemberRole+'<br/>';
                msgText+='AccountAccessLevel:'+eachAccntTeamMember.AccountAccessLevel+'<br/>';
                msgText+='LastModifiedDate:'+eachAccntTeamMember.LastModifiedDate+'<br/>';
                msgText+='LastModifiedById:'+eachAccntTeamMember.LastModifiedById+'<br/>';
                 msgText+='DeletedBy:'+UserInfo.getName()+'<br/>';
            }
            
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            
            String[] toAddresses = new String[] {'pooja.u@crmit.com','shruthi.mallikarjun@crmit.com'};          
            
            mail.setToAddresses(toAddresses);
            //mail.setCcAddresses(ccAddresses);
            
            mail.setSubject('Company Team Member Deleted');
            mail.setBccSender(false);
            mail.setUseSignature(false);
            
            mail.setHtmlBody(msgText);
            
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
            }
            catch(Exception excpn){
                System.debug('Exception occured==>'+excpn.getMessage());
                
            }
        }
    }
    
}