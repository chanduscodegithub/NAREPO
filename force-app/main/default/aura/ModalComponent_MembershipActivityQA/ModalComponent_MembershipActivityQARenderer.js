({
	afterRender: function (component,event) {
        this.superAfterRender();
        if(component.get('v.ModalData') != undefined && component.get('v.ModalData') != null) {
            if(component.get('v.ModalData.accountId') == undefined || component.get('v.ModalData.accountId') == null) {
                component.set('v.isRecordType', true);
            } else {
                event.getrecordTypeDetails(component, event, '', component.get('v.ModalData.accountId'));
            }
        } else {
            component.set('v.isRecordType', true);
        }
        var isRecordTypeVal = component.get('v.isRecordType');
        var accountNameDivComp = component.find('AccountNameDiv');
        if(isRecordTypeVal != undefined && isRecordTypeVal != null && isRecordTypeVal && 
           		accountNameDivComp != undefined && accountNameDivComp != null) {
            $A.util.addClass(accountNameDivComp, 'accName--ronly');
        }
        
        var action = component.get('c.getLoggedInUerRoleInfo');
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {                
                var isAggregatorsToBeShownVal = response.getReturnValue();
                isAggregatorsToBeShownVal = (isAggregatorsToBeShownVal != undefined && isAggregatorsToBeShownVal != null) ? isAggregatorsToBeShownVal : true;
                component.set('v.isAggregatorsToBeShown', isAggregatorsToBeShownVal);
            }
            else if (state === "INCOMPLETE") { 
                
            } else if (state === "ERROR") {                    
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });        
        $A.enqueueAction(action);
        
    }
})