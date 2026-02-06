({    
    removeProcessingOnCancel : function(component, event, helper) {
        
        var deleteIconVal = component.find('deleteIcon');
        $A.util.removeClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.addClass(spinnerVal, 'slds-hide');
    },
 
    editAccountSalesTeamRecords : function(component, event, helper) {
        var editAuraparams = event.getParam('arguments');
        if(editAuraparams != null && editAuraparams.cancelEdit != null && 
           	editAuraparams.cancelEdit != undefined && editAuraparams.cancelEdit == true) {
            	//helper.disableFields(component, event);
            	component.set('v.isEdit', false);
        } else {
            //helper.enableFields(component, event);
            component.set('v.isEdit', true);
        }
    },
    
    updateAccountSalesTeamRecord : function(component, event, helper) {
        helper.updateNationalAccountSalesTeamrecords(component, event);
    },
    
    confirmDelete : function(component, event, helper) {
        
        var deleteIconVal = component.find('deleteIcon');
        $A.util.addClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.removeClass(spinnerVal, 'slds-hide');
        
        var cmAccountTeamHistoryIdVal = component.get("v.accountTeamHistoryId");
        var compEvent = component.getEvent("nationalAccountSalesTeamEvent");
        compEvent.setParams({'editRecord':false,'cancelRecords':false,'deleteRecord':true,'cmAccountTeamHistoryId':'','cmAccountTeamHistoryIdToBeRemoved':cmAccountTeamHistoryIdVal,'cmAccountTeamHistoryObjData':component.get("v.accountTeamHistory")});
        compEvent.fire();
    },
    
    confirmCancelForPrompt : function(component, event, helper) {
        
        component.set("v.promptMessageTextForEndDate", '');
        var confirmCancelForPromptList = component.find('promptMessageForEndDate');
        for(var i=0;i<confirmCancelForPromptList;i++) {
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
        }
    },
    
    setDataToParent : function(component, event, helper) {
    	helper.setDataToParentController(component, event);    
    },
    
    checkForStartDate : function(component, event, helper) {
        helper.validateStartDate(component, event);
    },
    
    checkForEndDate : function(component, event, helper) {
        helper.validateEndDate(component, event);
    },
    
    updateSCEPlayer : function(component, event, helper) {
		helper.validateSCEPlayerField(component, event);
    }
    
})