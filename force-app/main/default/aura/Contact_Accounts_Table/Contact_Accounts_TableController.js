({
    navToRecord : function (component, event, helper) {
        var selectedItem = event.currentTarget;
        var accountId = selectedItem.dataset.record;
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": accountId
        });
        navEvt.fire();
    },
    
    // Added By Gurjot
    doInit: function(component, event, helper) {
        // Get the value of Client_Reference_Status__c from the accountConsultant object
        var referenceableValue = component.get("v.accountConsultant.Account.Client_Reference_Status__c");
        
        // Get the label using helper function
        var referenceableLabel = helper.getReferenceableLabel(referenceableValue);

        // Set the processed label in the referenceableLabel attribute
        component.set("v.referenceableLabel", referenceableLabel);
        
        // Get the value of Account.RecordType.Name from the accountConsultant object
        var recordTypeName = component.get("v.accountConsultant.Account.RecordType.DeveloperName");
        
        // Process the label for RecordType.Name
        var lrtLabel = helper.getLRTLabel(component,recordTypeName);
        
        component.set("v.lrtLabel", lrtLabel);
    }
    
})