({
	doInit : function (component, event, helper) {
        var modalComponent = component.find('QASelection_Modal');
        for(var i in modalComponent){
            $A.util.removeClass(modalComponent[i], 'slds-backdrop--hide');
            $A.util.addClass(modalComponent[i], 'slds-backdrop--open');
        }
    },
    
    handleChange: function (component, event, helper) {
        
        component.set('v.selectedOptionValue', event.getParam("value"));
        if(component.get('v.ModalData.AccountName') != undefined && component.get('v.ModalData.AccountName') != null &&
           		component.get('v.ModalData.AccountName') != '' && component.get('v.selectedOptionValue') != undefined &&
           			component.get('v.selectedOptionValue') != null && component.get('v.selectedOptionValue') != '') {
            component.find('nextBtn').set('v.disabled', false); 
        }
    },
    
    nextPage : function(component, event, helper) {

        /*var selectedRecordType = component.get('v.selectedRecordTypeValue');
        if(selectedRecordType != undefined && selectedRecordType != null && selectedRecordType != '') {
            var selectedRecordTypeVal = '';
            if(selectedRecordType == 'CM Membership Activity (Existing Client)') {
                selectedRecordTypeVal = 'CM'
            } else {
                selectedRecordTypeVal = 'CD';
            }
            helper.getrecordTypeDetails(component, event, selectedRecordTypeVal);
        } else {
            var accountId = component.get('v.ModalData.accountId');
            helper.getrecordTypeDetails(component, event, '', accountId);
        }*/
        
        var changeValue = component.get('v.selectedOptionValue');
        if(changeValue == 'Assisted MA Creation') {
            var cmpEvent = component.getEvent("modalQACmpCloseEvent");
            cmpEvent.setParams({
                "assistedMACreation":true,
                "isQA":true,
                "isAccount":false,
                "QADataFromChildComponent":{'accountId':component.get('v.ModalData.accountId'),
                    						'accountName':component.get('v.ModalData.AccountName'),
                                            'recordTypeId':component.get('v.ModalData.recordTypeId'),
                                            'category':component.get('v.ModalData.category'),
                                            'ownerName':component.get('v.ModalData.OwnerName'),
                                            'ownerId':component.get('v.ModalData.OwnerId')
			}});
            cmpEvent.fire();
        }else if(changeValue == 'Create New Record') {
            helper.createRecord(component, event);
        } /*else if(changeValue == 'Go To List View') {
            helper.navigateToListView(component, event);
        }*/
    },
    
    selectAccount  : function(component, event, helper) {
        
        $A.createComponents([["c:Modal_Component",{attribute:true,'ModalBody':'QA_AccountSearch_PopUp',
                                                   'Modalheader':'Search for a Company',
                                                   'ModalBodyData':{
                                                       'isQA': false,
                                                       'isAccount':true,
                                                       'isAggregatorsToBeShownVal':component.get('v.isAggregatorsToBeShown')}}]],
                            function(newCmp, status){ 
                                if (component.isValid() && status === 'SUCCESS') {
                                    var dynamicComponentsByAuraId = {};
                                    for(var i=0; i < newCmp.length; i++) {
                                        var thisComponent = newCmp[i];
                                        dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                    }
                                    component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                    component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                    component.set("v.body", newCmp); 
                                } 
                            });
    },
    
    getAccountData : function(component, event, helper) {
        
        component.set('v.AccountData',event.getParam('AccountData'));
        var accountData = event.getParam('AccountData');
        if(accountData != undefined && accountData != null) {
            component.set('v.ModalData.AccountName', accountData.Name);
            component.set('v.ModalData.accountId', accountData.Id); 
            component.set('v.ModalData.category', accountData.Category__c);
            component.set('v.ModalData.OwnerName', accountData.Owner.Name);
            component.set('v.ModalData.OwnerId', accountData.Owner.Id);
            if(component.get('v.ModalData.AccountName') != undefined && component.get('v.ModalData.AccountName') != null &&
               		component.get('v.ModalData.AccountName') != '' && component.get('v.selectedOptionValue') != undefined &&
                		component.get('v.selectedOptionValue') != null && component.get('v.selectedOptionValue') != '') {
                component.find('nextBtn').set('v.disabled', false); 
            }
            var selectedRecordType = accountData.Category__c;
            var selectedRecordTypeVal = '';
            if(selectedRecordType == 'Client Management') {
                selectedRecordTypeVal = 'CM'
            } else {
                selectedRecordTypeVal = 'CD';
            }
            helper.getrecordTypeDetails(component, event, selectedRecordTypeVal);
        }
    },
    
    fireComponentEvent : function(cmp, event) {
        var cmpEvent = cmp.getEvent("modalQACmpCloseEvent");
        cmpEvent.fire();
    },
    
    modalClose : function(component, event, helper) {
        var modalComponent = component.find('QASelection_Modal');
        for(var i=0; i<modalComponent.length; i++) {
            $A.util.addClass(modalComponent[i], 'slds-backdrop--hide');
            $A.util.removeClass(modalComponent[i], 'slds-backdrop--open');
        }        
    },
    
    modelCloseComponentEvent : function(component, event,helper) {
        helper.modalGenericClose(component, event);
    }
})