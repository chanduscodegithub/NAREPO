({
    remove: function(component, event, helper) {   
        var deleteIconVal = component.find('deleteIcon');
        $A.util.addClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.removeClass(spinnerVal, 'slds-hide');
        var cmpEvent = component.getEvent("Account_Team_Table");
        cmpEvent.setParams({"AccountTeamId":component.get('v.AccountTeamId')});
        cmpEvent.fire();        
    },
    removeProcessingOnCancel : function(component, event, helper) {
        var deleteIconVal = component.find('deleteIcon');
        $A.util.removeClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.addClass(spinnerVal, 'slds-hide');
    }
})