({
    onLoadOfPage : function(component, event) {
        
        var accId = component.get('v.recordId');
        var action = component.get('c.getAccounts');
        
        action.setParams({
            "accountId": accId
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (component.isValid() && state === "SUCCESS") {
                if(!$A.util.isEmpty(response.getReturnValue())){
                    component.set("v.acc", response.getReturnValue());
                }
            }
        });
        $A.enqueueAction(action);   
    }, 
    
    updateAcc : function(component, event) {
        
        var inputData = component.get('v.acc');
        var accId = component.get('v.recordId');
        
        var action = component.get('c.getUpdatedAccounts');
        
        action.setParams({
            "acc": inputData,
            "accountId": accId
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (component.isValid() && state === "SUCCESS") {
                if(!$A.util.isEmpty(response.getReturnValue())){
                    component.set("v.acc", response.getReturnValue());
                }
            }
        });
        $A.enqueueAction(action);   
    }, 
})