({
    navigateToAccountPage: function(component, event, helper){  
        if(component.get('v.isModalBody')){
            var closeEvt = component.getEvent("modalCmpCloseEvent");
            closeEvt.fire();
        }
        var selectedItem = event.currentTarget;
        var accountId = selectedItem.dataset.record;
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": accountId,
            //"isredirect":false
        });
        navEvt.fire();
    }
})