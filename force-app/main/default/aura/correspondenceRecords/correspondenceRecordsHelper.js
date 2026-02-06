({
	insertRecords : function(component, event, helper) {
		var action = component.get("c.createCorrespondenceRecords");
        action.setParams({ recordId : component.get("v.recordId")});
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('Success'+response);
                component.set('v.showMsg',true);
                var spinner = component.find("loadingSpinner");
                $A.util.removeClass(spinner, 'slds-show');
                $A.util.addClass(spinner, 'slds-hide');
                //Code to show Notification dynamically..    
                if(response.getReturnValue().indexOf('initiated') != -1) {
                	component.set('v.isSuccess',true);
                } else if(response.getReturnValue().indexOf('End Date') != -1 || response.getReturnValue().indexOf('Campaign') != -1) {
                    component.set('v.isSuccess',false);
                }       
                component.set('v.displayMsg',response.getReturnValue());
            } else if(state === 'INCOMPLETE') {
                //Incomplete method goes here...
                var spinner = component.find("loadingSpinner");
                $A.util.removeClass(spinner, 'slds-hide');
                $A.util.addClass(spinner, 'slds-show');               
                component.set('v.isSuccess',false);
                component.set('v.displayMsg',errors[0].message);
                component.set('v.showMsg',true);
            } else if (state === "ERROR") {
                var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + 
                                        errors[0].message);
                            var spinner = component.find("loadingSpinner");
                            $A.util.removeClass(spinner, 'slds-hide');
                            $A.util.addClass(spinner, 'slds-show');
                           component.set('v.isSuccess',false);
                           component.set('v.displayMsg',errors[0].message);
                           component.set('v.showMsg',true);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    $A.util.removeClass(spinner, 'slds-show');
                    $A.util.addClass(spinner, 'slds-hide');
                	
                }
        });
        $A.enqueueAction(action);
        
	} 
})