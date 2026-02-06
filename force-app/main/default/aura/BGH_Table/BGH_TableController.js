({
    navToRecord : function (component, event, helper) {
        var selectedItem = event.currentTarget;
        var recordId = selectedItem.dataset.record;
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": recordId
        });
        navEvt.fire();
    },
    
    removeBGH: function(component, event, helper) {    
        var deleteIconVal = component.find('deleteIcon');
        $A.util.addClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.removeClass(spinnerVal, 'slds-hide');
        
        var bghIdToRemoveVal = component.get("v.bghIdToRemove");
        var bghNameToRemoveVal = component.get("v.bghNameToRemove");
        var cmpEvent = component.getEvent("BGHTable");
        cmpEvent.setParams({"bghIdToRemove":bghIdToRemoveVal,"bghNameToRemove":bghNameToRemoveVal});
        cmpEvent.fire();
    },
    removeProcessingOnCancel : function(component, event, helper) {
        var deleteIconVal = component.find('deleteIcon');
        $A.util.removeClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.addClass(spinnerVal, 'slds-hide');
    },
    
    editRole : function(component, event, helper){
        
        var cmpEvent = component.getEvent("BGH_Role_Edit_Save");
        cmpEvent.setParams({"checkingEdit" : true, "index" : component.get('v.BGHIndex')});
        cmpEvent.fire();
        
        component.set('v.isEditable', true);
        var deleteDiv = component.find('deleteIcon');
        $A.util.addClass(deleteDiv, 'slds-hide');
        var editRoleDiv = component.find('editRole');
        $A.util.addClass(editRoleDiv, 'slds-hide');
        var saveCancelDiv = component.find('saveCancel');
        $A.util.removeClass(saveCancelDiv, 'slds-hide');
        
    },
    
    cancel : function(component, event, helper){
        component.set('v.isEditable', false);
        var saveCancelDiv = component.find('saveCancel');
        $A.util.addClass(saveCancelDiv, 'slds-hide');
        var editRoleDiv = component.find('editRole');
        $A.util.removeClass(editRoleDiv, 'slds-hide');        
        var deleteDiv = component.find('deleteIcon');
        $A.util.removeClass(deleteDiv, 'slds-hide');
    },
    
    saveRole : function(component, event, helper){
        
        component.set('v.isEditable', false);
        var saveCancelDiv = component.find('saveCancel');
        $A.util.addClass(saveCancelDiv, 'slds-hide');
        var editRoleDiv = component.find('editRole');
        $A.util.removeClass(editRoleDiv, 'slds-hide'); 
        var deleteDiv = component.find('deleteIcon');
        $A.util.removeClass(deleteDiv, 'slds-hide');
        
        var bghIdToRoleEditVal = component.get("v.bghIdToRemove");
        var bghRoleToUpdate = component.find('Role').get('v.value');
        console.log('bghRoleToUpdate-->>'+bghRoleToUpdate);

        if(component.get('v.oldPickVal') != bghRoleToUpdate){
            var cmpEvent = component.getEvent("BGH_Role_Edit_Save");
            cmpEvent.setParams({"bghIdToRoleEdit" : bghIdToRoleEditVal, "bghRoleToUpdate" : bghRoleToUpdate});
            cmpEvent.fire();    
        }
        
    },
    
    remEditCancel : function(component, event, helper){
        component.set('v.isEditable', false);
        var saveCancelDiv = component.find('saveCancel');
        $A.util.addClass(saveCancelDiv, 'slds-hide');
        var editRoleDiv = component.find('editRole');
        $A.util.removeClass(editRoleDiv, 'slds-hide');        
        var deleteDiv = component.find('deleteIcon');
        $A.util.removeClass(deleteDiv, 'slds-hide');
    }    
})