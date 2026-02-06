({
    myAction : function(component, event, helper) {
        var action = component.get('c.getTheDocument');
        action.setParams({
            "accId": component.get('v.recordId')
        });
        action.setCallback(this, function(response){
            
            var state = response.getState();
            
            var returnvalue = response.getReturnValue();
            console.log('returnvalue >>> '+returnvalue);
            
            if (state === "SUCCESS") {
                if(returnvalue != null){
                    component.set('v.currentContentDocumentId',returnvalue);
                    var fireEvent = $A.get("e.lightning:openFiles");
                    fireEvent.fire({
                        recordIds: [returnvalue]
                    });   
                }else{
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Error!",
                        "message": "The record Found."
                    });
                    toastEvent.fire();
                }
                
            }
        })
        $A.enqueueAction(action);
    }
})