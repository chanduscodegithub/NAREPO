({
	getAccountBusinessGroupsData : function(component, event,Child_Data) {
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        
        var action = component.get("c.getAccountBusinessGroupsForPopup");
        action.setParams({
            "accountId" : Child_Data.accountId,
            "isContact" : component.get('v.isContact')
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue()!= null && response.getReturnValue().length > 0) {
                    component.set('v.businessGroups', response.getReturnValue());
                }else{
                    component.set('v.BusinessGroupAddPopupEmptyList', true);
                }
            } else {
                console.log("In getAccountBusinessGroupsData method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i = 0; i < ErrorMessage.length; i = i+1){
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    $A.util.removeClass(spinner, 'slds-show');
                    $A.util.addClass(spinner, 'slds-hide');
                    console.log("Unknown error");
                }
            }
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
        });
        $A.enqueueAction(action);
    }
})