/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 04-23-2024
 * @last modified by  : Spoorthy
**/
({
	getFinancialRecords : function(component) {
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        var action = component.get("c.getfinancialsData");
        if(action == undefined || action == null){
            return;
        }
        action.setParams({
           AccountId : component.get('v.recordId'),
           RecordType : 'Total'           
         });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
                var finReturnMap = response.getReturnValue();
                if(finReturnMap != null){
                    component.set("v.medicalData",finReturnMap['Medical']);
                    component.set("v.rxData",finReturnMap['rxData']);                    
                    component.set("v.arrayOfYearsMed",finReturnMap['YearArrayMed']);
					component.set("v.arrayOfYearsRx",finReturnMap['YearArrayRx']);                     
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