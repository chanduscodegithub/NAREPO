({
    doInit:function (component, event, helper) 
    {
        var objectName = "Project_Task__c";
        var ipmId=component.get("v.recordId");
        var action = component.get('c.getAllFieldName');	
        action.setParams({
            "objectName": objectName,
            "ipmId" : ipmId
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS")
            { 
                var filedWrapper  = response.getReturnValue();
                
                if(filedWrapper.ipmPlanData != null && filedWrapper.ipmPlanData != '')
                {
                    if(filedWrapper.ipmPlanData.Account__c == null && filedWrapper.ipmPlanData.Template__c  == true)
                    {
                        var spinner = component.find("loadingSpinner");
                        $A.util.removeClass(spinner, 'slds-hide');
                        $A.util.addClass(spinner, 'slds-show');
                        $A.get("e.force:closeQuickAction").fire(); 
                        helper.showToast('Exporting a template is not allowed','');
                        
                        
                    }else if(filedWrapper.recordsCount == 0){
                        var spinner = component.find("loadingSpinner");
                        $A.util.removeClass(spinner, 'slds-hide');
                        $A.util.addClass(spinner, 'slds-show');
                        $A.get("e.force:closeQuickAction").fire();
                        helper.showToast('No IPM records to export',' ');
                        
                        
                    }else{
                        component.set("v.isIPMListEmpty",false);
                        //helper.exportRecord(component, event, helper);
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
    
    
    handleChange:function (component, event, helper) 
    {
        //helper.exportRecord(component, event, helper);
        component.set("v.errorMsg",'');
        
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