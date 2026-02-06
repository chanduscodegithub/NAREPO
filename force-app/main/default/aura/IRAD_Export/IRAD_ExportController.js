({
    doInit:function (component, event, helper) 
    {
        var objectName = "IRAD__c";
        var accountId=component.get("v.recordId");
        var action = component.get('c.getAllFieldName');	
        action.setParams({
            "objectName": objectName,
            "accountId" : accountId
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS")
            { 
                var filedWrapper  = response.getReturnValue();
                
                if(filedWrapper.impPlanData != null && filedWrapper.impPlanData != '')
                {
                    if(filedWrapper.impPlanData.Account__c == null && filedWrapper.impPlanData.Template__c  == true)
                    {
                        var spinner = component.find("loadingSpinner");
                        $A.util.removeClass(spinner, 'slds-hide');
                        $A.util.addClass(spinner, 'slds-show');
                        $A.get("e.force:closeQuickAction").fire(); 
                        helper.showToast('Can\'t export  the IRAD records since the implementation plan is not a project ','Can\'t Export');
                        
                        
                    }
                    else if(filedWrapper.recordsCount == 0)
                    {
                        var spinner = component.find("loadingSpinner");
                        $A.util.removeClass(spinner, 'slds-hide');
                        $A.util.addClass(spinner, 'slds-show');
                        $A.get("e.force:closeQuickAction").fire();
                        helper.showToast('No IRAD records to export',' ');
                        
                        
                    }
                        else
                        {
                            //helper.exportRecord(component, event, helper);
                            component.set("v.isIRADListEmpty",false);
                        }
                }
                
                
                
                
                
                
                
                
                
            }
            else if (state === "INCOMPLETE") {   
                console.log("getAllFieldName call INCOMPLETE");
            }
                else if (state === "ERROR") {
                    console.log("getAllFieldName call Unknown error");   
                }   
        });        
        $A.enqueueAction(action);     
    },
    
    cancel:function (component, event, helper) 
    {
        $A.get("e.force:closeQuickAction").fire();
        
    },
    
    handleChange:function (component, event, helper) 
    {
        component.set("v.errorMsg",'');
        
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