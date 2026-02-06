({
    removeProcessingOnCancel : function(component, event, helper) {
    	var deleteIconVal = component.find('deleteIcon');
        $A.util.removeClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.addClass(spinnerVal, 'slds-hide');
    },
    
	editDentalRecords : function(component, event, helper) {
		var editAuraparams = event.getParam('arguments');
        if(editAuraparams != null && editAuraparams.cancelEdit != null && 
           	editAuraparams.cancelEdit != undefined && editAuraparams.cancelEdit == true) {
            	helper.disableFields(component, event);
            	component.set('v.isEdit', false);
        } else {
            helper.enableFields(component, event);
            component.set('v.isEdit', true);
        }
	},
    
    onChangeValues : function(component, event, helper) {
        helper.updateAssociatedMedicalCarrierValues(component, event);
    },
    
    onChangeOfNoOfMembersHeld : function(component, event, helper) {
    	helper.updateTotalAndPerOfMembers(component, event);
    },
    
    removeRecord : function(component, event, helper) {
        helper.removeDentalRecords(component, event);
    },
    
    onChangeOfNoOfMembersHeldCD : function(component, event, helper) {
    	helper.showreminderPopUp(component, event);
    },
    
    clearFields : function(component, event, helper) {
    	
        var editAuraparams = event.getParam('arguments');
        if(editAuraparams != null && editAuraparams.isPrimaryIncumbent != null && 
           		editAuraparams.isPrimaryIncumbent != undefined) {
            if(editAuraparams.isPrimaryIncumbent) {
                helper.clearPrimaryIncumbentButtonValue(component, event);
            } else if(editAuraparams.isPrimaryIncumbent == false) {
            	helper.clearSecondaryIncumbentButtonValue(component, event);
        	}
        }
    },
    
    updatePriValue : function(component, event, helper) {
        helper.updatePrimaryIncumbentButtonValue(component, event);
    },
    
    updateSecValue : function(component, event, helper) {
    	helper.updateSecondaryIncumbentButtonValue(component, event);
	},
    
    handleMultiPickList : function(component, event, helper) {
        helper.handleMultiPickList(component, event);
    },
})