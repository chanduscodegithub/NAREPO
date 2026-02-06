({
    doInit:function(component, event, helper) {

        var typesOfOtherProductsVal = component.get('v.otherProductsData.Type_of_Products_Services_Provided__c');
        if(typesOfOtherProductsVal != undefined && typesOfOtherProductsVal != null) {
           /* var typesOfOtherProductsArray = typesOfOtherProductsVal.split(';');
            typesOfOtherProductsArray = typesOfOtherProductsArray.sort();
            //console.log(typesOfOtherProductsArray);
            var typesOfOtherProductsArrayString = typesOfOtherProductsArray.toString();
            //console.log('typesOfOtherProductsArrayString >>>> '+typesOfOtherProductsArrayString);
            typesOfOtherProductsArrayString = typesOfOtherProductsArrayString.replace(/,/g, ";"); */
            component.set('v.otherProductsData.Type_of_Products_Services_Provided__c', typesOfOtherProductsVal);
            var splitOtherProducts = typesOfOtherProductsVal.split(';');
            var bindOtherProducts = '';
            for(var i = 0 ; i < splitOtherProducts.length ; i++) {
                if(i == splitOtherProducts.length - 1) {
                    bindOtherProducts += splitOtherProducts[i]; 
                } else {
                    bindOtherProducts += splitOtherProducts[i] + '; '; 
                }
            }
            component.set('v.typesOfOtherProductsOrServices',bindOtherProducts);
        }
    },
    
    removeProcessingOnCancel : function(component, event, helper) {
        var deleteIconVal = component.find('deleteIcon');
        $A.util.removeClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.addClass(spinnerVal, 'slds-hide');
    },
    
    editCompetitiveRecords : function(component, event, helper) {
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
        helper.updateTypeOfOtherProductsProvided(component, event);
    },
    
    removeRecord : function(component, event, helper) {
        helper.removeOtherProductsRecords(component, event);
    },
    
    handleMultiPickList : function(component, event, helper) {
        helper.handleMultiPickList(component, event);
    },
    
})