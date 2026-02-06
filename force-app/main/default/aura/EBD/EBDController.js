({
    doInit: function (cmp, event, helper) {
        helper.getEBDRecords(cmp,event);
    },
    handleUpload: function (cmp, event, helper) {
        helper.getEBDRecords(cmp);
    },
    closeModal: function(component, event, helper) {
        var copuUrl = component.find('copuUrl');
        for(var i=0; i< copuUrl.length; i++){
            $A.util.addClass(copuUrl[i], 'slds-hide');
            $A.util.removeClass(copuUrl[i], 'slds-show');
        }
    },
    AddCreateEbd: function(component, event, helper) {
        component.find('EBDName').set('v.value',''); 
        component.find('yearData').set('v.value','');
        component.find('nameerr').set('v.value','');
        var modalHide = component.find('modalHide');
        $A.util.addClass(modalHide,'slds-show');
        $A.util.removeClass(modalHide,'slds-hide');
    },
    createEBD: function(component, event, helper) {
        var EBDName = component.find('EBDName').get('v.value'); 
        var yearData = component.find('yearData').get('v.value'); 
        component.find('nameerr').set('v.value','');
        EBDName = EBDName.trim();
        if(EBDName == null || EBDName == undefined || EBDName == ''){
            component.find('nameerr').set('v.value','Name is Mandatory');
            return;
        }
        var ebddata = {'sobjectType':'EBD__c','Name':EBDName,'Year__c':yearData,'Company__c':component.get('v.recordId')};
        var modalHide = component.find('modalHide');
        $A.util.addClass(modalHide,'slds-hide');
        $A.util.removeClass(modalHide,'slds-show');
        helper.insertNewEBD(component, event,ebddata,false);
    },
    closeModal: function(component, event, helper) {
        var modalHide = component.find('modalHide');
        $A.util.addClass(modalHide,'slds-hide');
        $A.util.removeClass(modalHide,'slds-show');
    },
    handelEvent: function(component, event, helper) {
        if(event.getParam('isDelete')){
            component.set('v.isDelete',true);
            component.set('v.ebdId',event.getParam('EBDId'))
            var EBDConfirm = component.find('EBDConfirm');
            for(var i=0; i< EBDConfirm.length; i++){
                $A.util.addClass(EBDConfirm[i], 'slds-show');
                $A.util.removeClass(EBDConfirm[i], 'slds-hide');
            }
        }else if(event.getParam('isSave')){
            helper.insertNewEBD(component,event,event.getParam('EBData'),event.getParam('isDelete'));
        }else{
            helper.getEBDRecords(component);
        }
    },
    confirmDelete: function(component, event, helper) {
        var EBDConfirm = component.find('EBDConfirm');
        for(var i=0; i< EBDConfirm.length; i++){
            $A.util.addClass(EBDConfirm[i], 'slds-hide');
            $A.util.removeClass(EBDConfirm[i], 'slds-show');
        }
        helper.insertNewEBD(component,event,component.get('v.ebdId'),component.get('v.isDelete'));
    },
    confirmCancel: function(component, event, helper) {
        var EBDConfirm = component.find('EBDConfirm');
        for(var i=0; i< EBDConfirm.length; i++){
            $A.util.addClass(EBDConfirm[i], 'slds-hide');
            $A.util.removeClass(EBDConfirm[i], 'slds-show');
        }
    }
})