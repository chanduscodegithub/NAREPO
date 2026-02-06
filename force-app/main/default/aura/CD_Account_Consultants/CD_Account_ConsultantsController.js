({
    navToRecord : function (component, event, helper) {
        var selectedItem = event.currentTarget;
        var recordId = selectedItem.dataset.record;
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": recordId,
            //"isredirect":true
        });
        navEvt.fire();
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
        var objectType = recId[0];
        recId = recId.substr(1, recId.length);
        var cmpEvent = component.getEvent("accountConsultantTable");
        if(objectType == "a"){
            cmpEvent.setParams({"accConsulatantIndex": recId, "Remove":true,"consultingFirm":true});
        }else if(objectType == "c"){
            cmpEvent.setParams({"accConsulatantIndex" : recId, "Remove" : true});
        }
        cmpEvent.fire();
    },
    
    editPrimary: function(component, event, helper) {
        
        var cmpEvent = component.getEvent("updatePrimaryId");
        cmpEvent.setParams({"checkingEdit" : true,"checkingCancel" : false, "index" : component.get('v.cdConsulatantIndex')});
        cmpEvent.fire();
        
        var editPrimaryRow = component.find('AccountPrimary');
        editPrimaryRow.set("v.disabled","false");
        
        var isChecked = editPrimaryRow.get("v.value");
        if(isChecked){
            component.set('v.isAccountPrimary', true);
            component.set('v.isPrimaryThen', true);
        }else{
            component.set('v.isAccountPrimary', false);
            component.set('v.isPrimaryThen', false);
        }
        
        var inlineEdit = component.find("inlineEdit");
        $A.util.addClass(inlineEdit,'slds-show');
        $A.util.removeClass(inlineEdit,'slds-hide');
        
        var editIcon = component.find("editIcon");
        $A.util.addClass(editIcon,'slds-hide');
        
        var deleteIcon = component.find("deleteIcon");
        $A.util.removeClass(deleteIcon, 'slds-show');
        $A.util.addClass(deleteIcon, 'slds-hide');
        
    },
    
    savePrimary: function(component, event, helper) {
        
        var isCheckedOld = component.get('v.isPrimaryThen');
        var isCheckedNow = component.find('AccountPrimary').get('v.value');
        
        var oldPrimaryId = component.get('v.primaryId');
        var selectedItem = event.currentTarget;
        var recordIdToUpdate = selectedItem.dataset.record;
        
        var accountId = component.get('v.accountId');
        var cmpEvent = component.getEvent("updatePrimaryId");
        
        if(oldPrimaryId == recordIdToUpdate){
            if(isCheckedOld == isCheckedNow){
                //alert('do NOTHING!!!');    
            }else{
                cmpEvent.setParams({"consultantId" : oldPrimaryId, "primaryCheck" : isCheckedOld});   
                cmpEvent.fire();
            }	
        }else if(oldPrimaryId != recordIdToUpdate){
            if(!isCheckedNow){
                cmpEvent.setParams({"consultantId" : oldPrimaryId, "primaryCheck" : true});   
                cmpEvent.fire();
            }else{
                cmpEvent.setParams({"consultantId" : recordIdToUpdate});  
                cmpEvent.fire();    
            }
            
        }
        
        var editPrimaryRow = component.find('AccountPrimary');
        editPrimaryRow.set("v.disabled","true");
        var inlineEdit = component.find("inlineEdit");
        $A.util.addClass(inlineEdit,'slds-hide');
        $A.util.removeClass(inlineEdit,'slds-show');
        
        var editIcon = component.find("editIcon");
        $A.util.removeClass(editIcon,'slds-hide');
        
        var deleteIcon = component.find("deleteIcon");
        $A.util.removeClass(deleteIcon, 'slds-hide');
        $A.util.addClass(deleteIcon, 'slds-show');
    },
    
    cancelPrimary: function(component, event, helper) {
        
        var editPrimaryRow = component.find('AccountPrimary');
        editPrimaryRow.set("v.disabled","true");
        var inlineEdit = component.find("inlineEdit");
        $A.util.addClass(inlineEdit,'slds-hide');
        $A.util.removeClass(inlineEdit,'slds-show');
        
        var editIcon = component.find("editIcon");
        $A.util.removeClass(editIcon,'slds-hide');
        
        var deleteIcon = component.find("deleteIcon");
        $A.util.removeClass(deleteIcon, 'slds-hide');
        $A.util.addClass(deleteIcon, 'slds-show');
        
        var cmpEvent = component.getEvent("updatePrimaryId");
        cmpEvent.setParams({"checkingCancel" : true,"checkingEdit" : false});
        cmpEvent.fire();
        
        /*var cmpEventCancel = component.getEvent("cancelEditingPrimaryId");
        cmpEventCancel.fire();*/
    },
    
    addSelectedData: function(component, event, helper) {
        component.set('v.accountConsultant',{"LastName":"Chapman","FirstName":"steven","JobTitle":"HR Benefits Sourcing","ConsultingFirm":"WWT-BOS_TW","OfficeLocation":"Boston, MA"});
    },
    
    find:function(component, event, helper){
        
        var selectedItem = event.currentTarget;
        var accountId = selectedItem.dataset.record;
        console.log('accountId --- >>>');
        var cmpEvent = component.getEvent("accountConsultantTable");
        cmpEvent.setParams({"accConsulatantIndex": accountId, "Find":true});
        cmpEvent.fire();
    },
    
    checkVal : function(component, event, helper){
        var isCheckedPrimary = component.get('v.isAccountPrimary');
        //var isCheckedPrimary = component.find('v.AccountPrimary');
        
        if(isCheckedPrimary){
            component.find('AccountPrimary').set('v.value', false);
            component.set('v.isAccountPrimary', false);
        }else if(!isCheckedPrimary){
            component.find('AccountPrimary').set('v.value', true);
            component.set('v.isAccountPrimary', true);
        }
    },
    
    removeEditCancel: function(component, event, helper){
        console.log('removeEditCancel CD_Account');
        if(component.find('AccountPrimary') != undefined){
            component.find('AccountPrimary').set('v.value', false);
            var params = event.getParam('arguments');
            if (params) {
                var enablePrimary = params.enablePrimary;
                var fromCancel = params.fromCancel;
                var fromEdit = params.fromEdit;
                if(fromCancel){
                    component.find('AccountPrimary').set('v.value', enablePrimary);
                }else if(fromEdit){
                    component.find('AccountPrimary').set('v.value', enablePrimary);
                }
            }
            
            var editPrimaryRow = component.find('AccountPrimary');
            editPrimaryRow.set("v.disabled","true");
            var inlineEdit = component.find("inlineEdit");
            $A.util.addClass(inlineEdit,'slds-hide');
            $A.util.removeClass(inlineEdit,'slds-show');
            
            var editIcon = component.find("editIcon");
            $A.util.removeClass(editIcon,'slds-hide');
            
            var deleteIcon = component.find("deleteIcon");
            $A.util.removeClass(deleteIcon, 'slds-hide');
            $A.util.addClass(deleteIcon, 'slds-show');
        }
        
    }
})