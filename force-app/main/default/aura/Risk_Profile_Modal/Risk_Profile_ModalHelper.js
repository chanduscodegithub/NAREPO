({
    getRiskprofileMdtfromController : function(component,event) {              
        var action = component.get('c.getRiskProfileMetaDate');	
        action.setParams({
            "riskType" : 'Risk Tracked by SCE'
        });
        action.setCallback(this, function(response) {
            var state = response.getState();		            
            if (state === "SUCCESS") {
                var responseResult = response.getReturnValue();    
                if(responseResult != null){                                        
                    component.set("v.RiskTypeValues",responseResult.riskTypePickSet);
                    component.set("v.RiskTypeMap",responseResult.riskProfileMetaDataWrapperClass);                    
                }
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
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
    saveRiskProfileData : function(component,event,riskProfileList) {
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        var action = component.get('c.saveRiskProfile');	
        var today = new Date();
        action.setParams({
            "riskProfileList" : riskProfileList,
            "today" : today
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
            if (state === "SUCCESS") {
                var responseResult = response.getReturnValue();    
                var cmpEvent = component.getEvent("addorCancelRiskEvent");
                cmpEvent.setParams({"clicked":"save","riskProfileObjArray":responseResult});
                cmpEvent.fire();
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
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
        });        
        $A.enqueueAction(action);
    }
})