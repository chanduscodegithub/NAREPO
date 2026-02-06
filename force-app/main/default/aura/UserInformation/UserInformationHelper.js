({
	getGeneralInformationAccessDetails : function(component,event) {              
        var action = component.get('c.getGeneralInfomationMethod');	        
        action.setParams({
            "accountId" : component.get('v.recordId'),            
        });
        console.log('getGeneralInformationAccessDetails*************');
        action.setCallback(this, function(response) {
            var state = response.getState();		                                    
            if (state === "SUCCESS") {
                var responseResult = response.getReturnValue();                    
                console.log("responseResult "+responseResult);                
                var generalAccountEvent = $A.get("e.c:GeneralInfoAccountApplicationEvent");
                generalAccountEvent.setParams({
                    "GeneralObj" : responseResult,
                    "isError" : false
                });
                generalAccountEvent.fire();
            }
            else if (state === "INCOMPLETE") {
                var generalAccountEvent = $A.get("e.c:GeneralInfoAccountApplicationEvent");
                generalAccountEvent.setParams({
                    "isError" : true
                });
                generalAccountEvent.fire();                
            }
                else if (state === "ERROR") {
                    var generalAccountEvent = $A.get("e.c:GeneralInfoAccountApplicationEvent");
                    generalAccountEvent.setParams({
                        "isError" : true
                    });
                    generalAccountEvent.fire();                
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
    },
})