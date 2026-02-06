({
    navToRecord : function (component, event, helper) {
        var selectedItem = event.currentTarget;
        var recordId = selectedItem.dataset.record;
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": recordId,
            // "isredirect":true
        });
        navEvt.fire();
    },
    
    removeBGH: function(component, event, helper) {    
        var deleteIconVal = component.find('deleteIcon');
        $A.util.addClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.removeClass(spinnerVal, 'slds-hide');
        
        var bghMemberContactIdVal = component.get("v.bghIdToRemove");
        var cmpEvent = component.getEvent("BGHMemberContacts");
        cmpEvent.setParams({"bghMemberContactId" : bghMemberContactIdVal});
        cmpEvent.fire();
    },
    
    removeProcessingOnCancel : function(component, event, helper) {
        var deleteIconVal = component.find('deleteIcon');
        $A.util.removeClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.addClass(spinnerVal, 'slds-hide');
    }    
})