({
    doInit : function(component, event, helper){
        debugger;
        var oppMap = new Map();
        component.set("v.opportunityMap", oppMap);
    },
    
    navigateToAccountPage : function(component, event, helper) {
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": component.get('v.WorkItemsDataobj.AccountId'),
            "slideDevName": "detail",
            "isredirect":true
        });
        navEvt.fire();
    },
    
    navigateToMAPage : function(component, event, helper) {
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": component.get('v.WorkItemsDataobj.Id'),
            "slideDevName": "detail",
            "isredirect":true
        });
        navEvt.fire();
    },
    
    editPopUp : function(component, event, helper) {
        console.log('test');
        var enableButtonsEvent = component.getEvent("workItemEvents");
        enableButtonsEvent.setParams({
            //"enableSaveCancelButton" : true,
            "editOnlyOneRecord" : true
        });
        enableButtonsEvent.fire();
        component.set("v.maCommets",component.get("v.WorkItemsDataobj.Comments__c"));
        component.set("v.oldComments",component.get("v.WorkItemsDataobj.Comments__c"));
        $A.util.removeClass(component.find("updateComment"), "slds-hide");
    },
    
    confirmCancel : function(component, event, helper){
        $A.util.addClass(component.find("updateComment"), "slds-hide");
        component.set("v.WorkItemsDataobj.Comments__c",component.get("v.maCommets"));
        
    },
    updateChanges: function(component, event, helper){
        debugger;
        $A.util.addClass(component.find("updateComment"), "slds-hide");
        $A.util.removeClass(component.find("childSpinner"), "slds-hide");
        var oldComments = component.get("v.oldComments");
        var newComments = component.get("v.WorkItemsDataobj.Comments__c");        
        if(oldComments === newComments) { 
            component.set("v.saveUpdatedWorkItemList", []);
            $A.util.addClass(component.find("childSpinner"), "slds-hide");                
        }
        else{ 
            /*var updateMap = component.getEvent("workItemEvents");
            updateMap.setParams({
                "updatedOpp" : component.get("v.WorkItemsDataobj")
            });
            updateMap.fire();*/
            var updateOppList = component.get("v.saveUpdatedWorkItemList");
            var updateOpp = component.get("v.WorkItemsDataobj");
            delete updateOpp.CM_VPCR_RVP__r;
            delete updateOpp.Account;
            updateOppList.push(updateOpp);
            var updateOppRecods = component.get('c.updateOppRecods');
            updateOppRecods.setParams({
                "opplist" : updateOppList,
            });
            updateOppRecods.setCallback(this, $A.getCallback(function (response) {
                debugger;
                var state = response.getState();
                var isUpdated;
                
                if (state === "SUCCESS") {
                    
                    isUpdated = response.getReturnValue();
                    if(isUpdated){ 
                        component.set("v.saveUpdatedWorkItemList", []);
                    }
                    $A.util.addClass(component.find("childSpinner"), "slds-hide");
                    var updateMap = component.getEvent("workItemEvents");
                    updateMap.fire();
                    
                } else if (state === "ERROR") {
                    var errors = response.getError();
                    console.error(errors);
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Error!",
                        "type": "error",
                        "message":errors
                    });
                    toastEvent.fire();
                }
                
            }));
            $A.enqueueAction(updateOppRecods);
        }
    },
    closeAllEditPopup : function(component, event, helper){
        $A.util.addClass(component.find("updateComment"), "slds-hide");
    }
})