({
	getClientSurveyRecords : function(component) {
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        var action = component.get("c.getClientSurveyRecords");
        if(action == undefined || action == null){
            return;
        }
        action.setParams({
           AccountId : component.get('v.recordId')           
         });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
                var csrReturnMap = response.getReturnValue();
                if(csrReturnMap != null){
                    component.set("v.clientSurveys",csrReturnMap['CSRFinalList']);    
                    component.set("v.YearArray",csrReturnMap['LastFourYears']);
                    if(csrReturnMap['MeritId'] != null && csrReturnMap['MeritId'] != ''){
                        component.set("v.LinkId",csrReturnMap['MeritId']); 
                    }else{
                        component.set("v.LinkId",component.get("v.recordId")); 
                    }
                    component.set("v.AccountType",csrReturnMap['AccountType']);
                }               
             }else if(state === "ERROR") {               
                var errors = response.getError(); 
                if(errors){
                   if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i=0; i < ErrorMessage.length; i++) {  
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                }
                console.log("In getClientSurveyRecords method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
            }   
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');  
        });
        $A.enqueueAction(action);
	}	
})