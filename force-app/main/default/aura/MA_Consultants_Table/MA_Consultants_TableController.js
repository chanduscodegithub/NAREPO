({
    navToRecord : function(component, event, helper) {
        var selectedItem = event.currentTarget;
        var recordId = selectedItem.dataset.record;
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": recordId
        });
        navEvt.fire();
    },
    
    QARadioClick : function(component, event, helper) {
        
        var isCheckedPrimary = component.find('MAPrimary').get('v.value');
        var cmpEvent = component.getEvent("updatePrimaryId");
        
        if(isCheckedPrimary){
            component.find('MAPrimary').set('v.value', false);
            cmpEvent.setParams({"selectedIdForQA" : ''});
        }else if(!isCheckedPrimary){
            component.find('MAPrimary').set('v.value', true);
            cmpEvent.setParams({"selectedIdForQA" : component.get('v.maConsultant').Id});            
        }
        cmpEvent.fire();
    },
    
    removeProcessingOnCancel : function(component, event, helper) {
        var deleteIconVal = component.find('deleteIcon');
        $A.util.removeClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.addClass(spinnerVal, 'slds-hide');
    },
    
    remove: function(component, event, helper) {
        
        var deleteIconVal = component.find('deleteIcon');
        $A.util.addClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.removeClass(spinnerVal, 'slds-hide');
        
        var selectedItem = event.currentTarget;
        var recId = selectedItem.dataset.record;
        
        var cmpEvent = component.getEvent("removeMAConsultant");
        cmpEvent.setParams({"consultantId": recId});
        cmpEvent.fire();
    },
    
    editPrimary: function(component, event, helper) {
        
        var cmpEvent = component.getEvent("updatePrimaryId");
        cmpEvent.setParams({"checkingEdit" : true,
                            "checkingCancel" : false,
                            "removeClass" : true,
                            "index" : component.get('v.maConsulatantIndex')});
        cmpEvent.fire();
        
        var editPrimaryRow = component.find('MAPrimary');
        editPrimaryRow.set("v.disabled","false");
        
        var isChecked = editPrimaryRow.get("v.value");
        if(isChecked){
            component.set('v.isMAPrimary', true);
            component.set('v.isPrimaryThen', true);
        }else{
            component.set('v.isMAPrimary', false);
            component.set('v.isPrimaryThen', false);
        }
        
        var inlineEdit = component.find("inlineEdit");
        $A.util.addClass(inlineEdit,'slds-show');
        $A.util.removeClass(inlineEdit,'slds-hide');
        
        var editIcon = component.find("editIcon");
        $A.util.addClass(editIcon,'slds-hide');
        
        var thAuraId = component.find("thAuraId");
        $A.util.removeClass(thAuraId,'slds-cell-shrink');
        
        var deleteIcon = component.find("deleteIcon");
        $A.util.removeClass(deleteIcon, 'slds-show');
        $A.util.addClass(deleteIcon, 'slds-hide');
        
    },
    
    savePrimary: function(component, event, helper) {
        
        var isCheckedOld = component.get('v.isPrimaryThen');
        var isCheckedNow = component.find('MAPrimary').get('v.value');
        
        var oldPrimaryId = component.get('v.primaryId');
        var selectedItem = event.currentTarget;
        var recordIdToUpdate = selectedItem.dataset.record;
        
        var accountId = component.get('v.accountId');
        var cmpEvent = component.getEvent("updatePrimaryId");
        
        if(oldPrimaryId == recordIdToUpdate){
            if(isCheckedOld == isCheckedNow){
                //alert('do NOTHING!!!');    
                cmpEvent.setParams({"sameRecordSave" : true});
                cmpEvent.fire();
            }else{
                cmpEvent.setParams({"consultantId" : oldPrimaryId, "primaryCheck" : isCheckedOld, "removeClass" : false});   
                cmpEvent.fire();
            }	
        }else if(oldPrimaryId != recordIdToUpdate){
            if(!isCheckedNow){
                cmpEvent.setParams({"consultantId" : oldPrimaryId, "primaryCheck" : true, "removeClass" : false});   
                cmpEvent.fire();
            }else{
                cmpEvent.setParams({"consultantId" : recordIdToUpdate, "primaryCheck" : false, "removeClass" : false});
                cmpEvent.fire();    
            }
            
        }
        
        var editPrimaryRow = component.find('MAPrimary');
        editPrimaryRow.set("v.disabled","true");
        var inlineEdit = component.find("inlineEdit");
        $A.util.addClass(inlineEdit,'slds-hide');
        $A.util.removeClass(inlineEdit,'slds-show');
        
        var thAuraId = component.find("thAuraId");
        $A.util.addClass(thAuraId,'slds-cell-shrink');
        
        var editIcon = component.find("editIcon");
        $A.util.removeClass(editIcon,'slds-hide');
        
        var deleteIcon = component.find("deleteIcon");
        $A.util.removeClass(deleteIcon, 'slds-hide');
        $A.util.addClass(deleteIcon, 'slds-show');
    },
    
    cancelPrimary: function(component, event, helper) {
        
        var editPrimaryRow = component.find('MAPrimary');
        editPrimaryRow.set("v.disabled","true");
        var inlineEdit = component.find("inlineEdit");
        $A.util.addClass(inlineEdit,'slds-hide');
        $A.util.removeClass(inlineEdit,'slds-show');

		var thAuraId = component.find("thAuraId");
        $A.util.addClass(thAuraId,'slds-cell-shrink');
		        
        var editIcon = component.find("editIcon");
        $A.util.removeClass(editIcon,'slds-hide');
        
        var deleteIcon = component.find("deleteIcon");
        $A.util.removeClass(deleteIcon, 'slds-hide');
        $A.util.addClass(deleteIcon, 'slds-show');
        
        var cmpEvent = component.getEvent("updatePrimaryId");
        cmpEvent.setParams({"checkingCancel" : true,"checkingEdit" : false, "removeClass" : false});
        cmpEvent.fire();
        
    },
    
    checkVal : function(component, event, helper){
        var isCheckedPrimary = component.get('v.isMAPrimary');
        
        if(isCheckedPrimary){
            component.find('MAPrimary').set('v.value', false);
            component.set('v.isMAPrimary', false);
        }else if(!isCheckedPrimary){
            component.find('MAPrimary').set('v.value', true);
            component.set('v.isMAPrimary', true);
        }
    },
    
    removeEditCancel: function(component, event, helper){
        if(component.find('MAPrimary') != undefined){
            component.find('MAPrimary').set('v.value', false);
            var params = event.getParam('arguments');
            if (params) {
                var enablePrimary = params.enablePrimary;
                var fromCancel = params.fromCancel;
                var fromEdit = params.fromEdit;
                if(fromCancel){
                    component.find('MAPrimary').set('v.value', enablePrimary);
                }else if(fromEdit){
                    component.find('MAPrimary').set('v.value', enablePrimary);
                }
            }
            
            var editPrimaryRow = component.find('MAPrimary');
            editPrimaryRow.set("v.disabled","true");
            var inlineEdit = component.find("inlineEdit");
            $A.util.addClass(inlineEdit,'slds-hide');
            $A.util.removeClass(inlineEdit,'slds-show');
            
            var thAuraId = component.find("thAuraId");
            $A.util.addClass(thAuraId,'slds-cell-shrink');
            
            var editIcon = component.find("editIcon");
            $A.util.removeClass(editIcon,'slds-hide');
            
            var deleteIcon = component.find("deleteIcon");
            $A.util.removeClass(deleteIcon, 'slds-hide');
            $A.util.addClass(deleteIcon, 'slds-show');
        }
    }
})