({
	updatePrimaryId : function(component, recordIdToUpdate){
        var accountId = component.get('v.accountId');
        var action = component.get('c.updatePrimaryId');
        action.setParams({"accountId" : accountId, "recordId" : recordIdToUpdate});
        action.setCallback(this, function(response){
            if(response.getState() === "SUCCESS"){
                
            }
        });
        $A.enqueueAction(action);
    }
})