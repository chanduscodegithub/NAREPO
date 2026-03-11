trigger SBS_Support_Issue_TeamMembers on Case (after insert) {
    
    Id ctrId = [SELECT Id,Name FROM CaseTeamRole where Name = 'Team Member' Limit 1].Id;
    Id recordTypeId = [SELECT Id, Name FROM RecordType where name = 'SBS Support' and SobjectType = 'Case' Limit 1].Id;    
    
    List<CaseTeamMember> ctmList = new List<CaseTeamMember>();
    for(Case caseObj : trigger.new){        
        if(caseObj.RecordTypeId == recordTypeId){
            CaseTeamMember ctm = new CaseTeamMember();
            ctm.ParentId = caseObj.Id;
            ctm.MemberId = caseObj.CreatedById;
            ctm.TeamRoleId = ctrId;            
            ctmList.add(ctm);   
        }        
    }    
    insert ctmList;
}