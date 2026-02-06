({
    onChangeOfNoOfMembersHeld : function(component, event, helper) {
		helper.updateTotalAndPerOfMembers(component, event, true);
	},
    
    onChangeOfNoOfMembersAwarded : function(component, event, helper) {
		helper.updateTotalAndPerOfMembers(component, event, false);
	},
    
    removeRecord : function(component, event, helper) {
        helper.removeCompetitorRecord(component, event);
    },
    
    navigateToCompetitorDetailPage : function(component, event) {
        
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
          "recordId": component.get('v.MACompetitorData.Id')
        });
        navEvt.fire();
    }
})