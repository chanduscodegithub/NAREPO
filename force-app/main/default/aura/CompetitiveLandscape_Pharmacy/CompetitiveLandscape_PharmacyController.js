({
    
    removeProcessingOnCancel : function(component, event, helper) {
    	var deleteIconVal = component.find('deleteIcon');
        $A.util.removeClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.addClass(spinnerVal, 'slds-hide');
    },
    
    restrictMinusSymbol : function(component, event, helper) {
        console.log('Minus');
        var numberOfMembersHeldVal = component.get('v.pharmacyData.NumberOfMembersHeld__c');
        if(numberOfMembersHeldVal != null && numberOfMembersHeldVal != undefined) {
            numberOfMembersHeldVal = numberOfMembersHeldVal.toString();
            if((event.getParams().keyCode == 189) && (numberOfMembersHeldVal.indexOf('-') == 0)) {
                    var valueToBeUpdated = numberOfMembersHeldVal.substring(1, numberOfMembersHeldVal.length);
                    component.set('v.pharmacyData.NumberOfMembersHeld__c', parseInt(valueToBeUpdated));
            }
		}
	},
    
	editPharmacyRecords : function(component, event, helper) {
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
        helper.removePharmacyRecords(component, event);
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
    
    onSingleSelectChange : function(component, event, helper) {
        var result = event.getSource().get('v.value');
        component.set('v.pharmacyData.Coalition_if_applicable__c',result);
    },
    
    handleMultiPickList : function(component, event, helper) {
        helper.handleMultiPickList(component, event);
    },
})