({
    onChildAttributeChange : function(component, event, helper) {
		var total = 0;
        console.log("inside child field");
        var compititorsObj = component.get("v.compititorsObj");
        if(compititorsObj != null || compititorsObj != undefined){
            if(compititorsObj.ParticipatingNonBargainedFullTimeAc__c != null){                
                compititorsObj.ParticipatingNonBargainedFullTimeAc__c = parseInt(compititorsObj.ParticipatingNonBargainedFullTimeAc__c);
                if(compititorsObj.ParticipatingNonBargainedFullTimeAc__c < 0){
                    compititorsObj.ParticipatingNonBargainedFullTimeAc__c  = -compititorsObj.ParticipatingNonBargainedFullTimeAc__c 
                }
                total = total + parseInt(compititorsObj.ParticipatingNonBargainedFullTimeAc__c)
            }else{
                compititorsObj.ParticipatingNonBargainedFullTimeAc__c = 0;
            }
            if(compititorsObj.ParticipatingBargainedFullTimeActive__c != null){
                compititorsObj.ParticipatingBargainedFullTimeActive__c = parseInt(compititorsObj.ParticipatingBargainedFullTimeActive__c);
                if(compititorsObj.ParticipatingBargainedFullTimeActive__c < 0){
                    compititorsObj.ParticipatingBargainedFullTimeActive__c  = -compititorsObj.ParticipatingBargainedFullTimeActive__c;
                }
                total = total + compititorsObj.ParticipatingBargainedFullTimeActive__c;
            }else{
                compititorsObj.ParticipatingBargainedFullTimeActive__c = 0;
            }
            if(compititorsObj.ParticipatingU65Retirees__c != null){
                compititorsObj.ParticipatingU65Retirees__c = parseInt(compititorsObj.ParticipatingU65Retirees__c)
                if(compititorsObj.ParticipatingU65Retirees__c < 0){
                    compititorsObj.ParticipatingU65Retirees__c  = -compititorsObj.ParticipatingU65Retirees__c;
                }
                total = total + compititorsObj.ParticipatingU65Retirees__c;
            }else{
                compititorsObj.ParticipatingU65Retirees__c = 0;
            }
            if(compititorsObj.ParticipatingO65Retirees__c != null){
                compititorsObj.ParticipatingO65Retirees__c = parseInt(compititorsObj.ParticipatingO65Retirees__c);
                total = total + compititorsObj.ParticipatingO65Retirees__c;
                if(compititorsObj.ParticipatingO65Retirees__c < 0){
                    compititorsObj.ParticipatingO65Retirees__c  = -compititorsObj.ParticipatingO65Retirees__c;
                }
            }else{
                compititorsObj.ParticipatingO65Retirees__c = 0;
            }
            if(compititorsObj.ParticipatingPartTimeActives__c != null){
                compititorsObj.ParticipatingPartTimeActives__c = parseInt(compititorsObj.ParticipatingPartTimeActives__c);
                if(compititorsObj.ParticipatingPartTimeActives__c < 0){
                    compititorsObj.ParticipatingPartTimeActives__c = -compititorsObj.ParticipatingPartTimeActives__c;
                }
                total = total + compititorsObj.ParticipatingPartTimeActives__c;
            }else{
                compititorsObj.ParticipatingPartTimeActives__c = 0;
            }        	
			component.set('v.participatingMembers',total);
    	}
    }
})