({   
    doInit : function(component, event, helper) {
       
    },
    handleRecordUpdated: function(component, event, helper) {
         console.log('handleRecordUpdated');
         var eventParams = event.getParams();
    	 if(eventParams.changeType === "LOADED") {
            component.set('v.MA_Data',component.get('v.oppRecord'));                                  
         }
         if(eventParams.refresh_ES === true) {
            //setTimeout(function())
         	component.find("recordLoader").reloadRecord();
         }
         console.log("Executive Summary");
        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");      
        var action = component.get('c.getTabularReportResponse');	    
        action.setParams({
            "opportunityId" : component.get('v.recordId')           
        });
        
        action.setCallback(this, function(response) {
            //this.stopProcessing(component);
            var state = response.getState();            
            if (state === "SUCCESS") {
                helper.getCompetitorsReport(component,event);
            	var reportResponse = response.getReturnValue();
                helper.buildSummaryTable(component,reportResponse);                
            }
            else if (state === "INCOMPLETE") {                
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            alert('Error'); 
                            $A.util.removeClass(spinner, "slds-hide");
                        }
                    } else {
                        //console.log("Unknown error");
                    }
                }
        });        
        $A.enqueueAction(action);
    }
})