({
	myAction : function(component, event, helper) {
		
	},
    doInit:function (component, event, helper) 
    {
        
        var ipmId=component.get("v.recordId");
        var action = component.get('c.getIPMData');	
        action.setParams({
            "ipmId" : ipmId
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS")
            { 
                var responseData  = response.getReturnValue();
                
                if(responseData.ipmData != null && responseData.ipmData != '')
                {
                    if(responseData.ipmData.Template__c  == true)
                    {
                        var spinner = component.find("loadingSpinner");
                        $A.util.removeClass(spinner, 'slds-hide');
                        $A.util.addClass(spinner, 'slds-show');
                        $A.get("e.force:closeQuickAction").fire(); 
                        helper.showToast('Exporting a template is not allowed','');        
                    }else if(responseData.IPMFinalData.length == 0){
                        var spinner = component.find("loadingSpinner");
                        $A.util.removeClass(spinner, 'slds-hide');
                        $A.util.addClass(spinner, 'slds-show');
                        $A.get("e.force:closeQuickAction").fire();
                        helper.showToast('No IPM Dashboard records to export',' ');
					}
                       
                }
            }
            else if (state === "INCOMPLETE") {   
                console.log("getIPMData call INCOMPLETE");
                var spinner = component.find("loadingSpinner");
                $A.util.removeClass(spinner, 'slds-hide');
                $A.util.addClass(spinner, 'slds-show');
                $A.get("e.force:closeQuickAction").fire();
                helper.showToast('Error Occured, Please try again',' ');
            }
                else if (state === "ERROR") {
                    console.log("getIPMData call Unknown error");
                    var spinner = component.find("loadingSpinner");
                    $A.util.removeClass(spinner, 'slds-hide');
                    $A.util.addClass(spinner, 'slds-show');
                    $A.get("e.force:closeQuickAction").fire();
                    helper.showToast('Error Occured, Please try again',' ');
                }   
        });        
        $A.enqueueAction(action);     
    },
    handleChange:function (component, event, helper) 
    {
        helper.exportRecord(component, event, helper);
        
    },
    cancel:function (component, event, helper) 
    {
        $A.get("e.force:closeQuickAction").fire();
        
    },
    export:function (component, event, helper) 
    {
        var externalOrAll=component.get("v.value");

       if(externalOrAll=='')
       {
        	component.set("v.errorMsg",'Choose any one of the options to Export');
       }
       else
       {
           helper.exportRecord(component, event, helper,externalOrAll);
       }
        
    }
    
})