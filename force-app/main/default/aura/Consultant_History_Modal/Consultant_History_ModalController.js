({
    doInit : function(component, event, helper) {
        helper.getConsultantHistoryDataFromController(component,1,event);
    },
    removeRecords: function(component, event, helper) {                        
        var consultantHistoryId = event.getParam('consultingHistoryModalIndx');
        component.set('v.consultantHistoryId',consultantHistoryId);        
        var deleteAcc = component.find('removeconsultantHistory');
        for(var i = 0; i < deleteAcc.length ; i=i+1){
            $A.util.removeClass(deleteAcc[i], 'slds-hide');
            $A.util.addClass(deleteAcc[i], 'slds-show');
        }                  
    },
    display : function(component, event, helper) {
        helper.toggleHelper(component, event);
    },
    
    displayOut : function(component, event, helper) {
        helper.toggleHelper(component, event);
    },
    
    deleteCH: function(component, event, helper) {                
        var consultantHistoryId = event.getParam('consultantHistoryId');
        helper.deleteOrUpdateConsultantRecordInController(component, event,consultantHistoryId,'DELETE');
    },
    confirmCancel: function(component, event, helper) {
        var deleteAcc = component.find('removeconsultantHistory');
        for(var i = 0; i < deleteAcc.length ; i=i+1){
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }        
    },
    pageChange: function(component, event, helper) {        
        setTimeout(function(){ 
            var focusInputField = component.find("focusInputField");
            $A.util.removeClass(focusInputField, 'slds-hide');            
            focusInputField.focus();
            $A.util.addClass(focusInputField, 'slds-hide');
            
        }, 600);        
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        helper.getConsultantHistoryDataFromController(component,page,event);
    },
    sortFields: function(component, event, helper) {
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;       
        var fieldItagsWithAuraAttrMap = '{"LastName__c":"sortLastNameAsc","Name":"sortFirstNameAsc","JobTitle__c":"sortJobTitleAsc","StartDate__c":"sortStartDateAsc","EndDate__c":"sortEndDateAsc","Status__c":"sortStatusAsc","StatusReason__c":"sortStatusReasonAsc"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        var page = 1;
        
        helper.sortBy(component, event, fieldNameToBeSorted,page,sortFieldCompName);        
    } ,
    alertEventMethod: function(component, event, helper) {   
        if(event.getParam("isShowFullListPage")){
            if(event.getParam('alertMessage') != null && event.getParam('alertMessage').length > 0){
                var promptMsgList = component.find('promptMessageForDateFields');             
                component.set('v.alertBoxMessage',event.getParam('alertMessage'));
                for(var i = 0; i < promptMsgList.length ; i=i+1){                
                    $A.util.removeClass(promptMsgList[i], 'slds-hide');
                    $A.util.removeClass(promptMsgList[i], 'slds-hide');			                        
                }   
            }else if(event.getParam('errorMessage') != null && event.getParam('errorMessage').length > 0){                
                component.set('v.ErrorMessage',event.getParam('errorMessage'));
                var ErrorMessage = component.find('ErrorMessage');
                for(var i = 0; i < ErrorMessage.length ; i=i+1){                
                    $A.util.addClass(ErrorMessage[i], 'slds-show');
                    $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                }
            }
        }                         	        
    },
    confirmCancelForPrompt: function(component, event, helper) {               
        var confirmCancelForPromptList = component.find('promptMessageForDateFields');
        for(var i = 0; i < confirmCancelForPromptList.length ; i=i+1){        
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
        }	                
    },   
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i = 0; i < ErrorMessage.length ; i=i+1){        
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    },
    openSortingPopup : function(component, event, helper){
        
        $A.util.addClass(component.find("consultantHisTableId"),"slds-hide");
        
        var fieldsToSort = [{"fieldName":"LastName__c","fieldDisplayName":"Last Name","fieldOrder":component.get("v.sortLastNameAsc")},
                            {"fieldName":"Name","fieldDisplayName":"First Name","fieldOrder":component.get("v.sortFirstNameAsc")},
                            {"fieldName":"JobTitle__c","fieldDisplayName":"Job Title","fieldOrder":component.get("v.sortJobTitleAsc")},
                            {"fieldName":"StartDate__c","fieldDisplayName":"Start Date","fieldOrder":component.get("v.sortStartDateAsc")},
                            {"fieldName":"EndDate__c","fieldDisplayName":"End Date","fieldOrder":component.get("v.sortEndDateAsc")},
                            {"fieldName":"Status__c","fieldDisplayName":"Status","fieldOrder":component.get("v.sortStatusAsc")},
                            {"fieldName":"StatusReason__c","fieldDisplayName":"Status Reason","fieldOrder":component.get("v.sortStatusReasonAsc")}
                           ];        
        $A.createComponents([["c:Panel_Component_Sorting",{attribute:true,'FieldsToSort':fieldsToSort,'lastSortField':component.get("v.lastSortField"),'isChildComponent':true}]],
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
    sortFieldsMobile: function(component, event, helper) {   
        
        $A.util.removeClass(component.find("consultantHisTableId"),"slds-hide");
        
        if(!event.getParam('isApply')) {
            if(!component.get("v.isDesktop")) {
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                return;
            }
        }     
        
        var fieldNameToBeSorted = event.getParam('fieldNameToBeSorted');
        component.set("v.lastSortField",fieldNameToBeSorted);
        var orderToBeSorted = event.getParam('orderToBeSorted');
        var fieldItagsWithAuraAttrMap = '{"LastName__c":"sortLastNameAsc","Name":"sortFirstNameAsc","JobTitle__c":"sortJobTitleAsc","StartDate__c":"sortStartDateAsc","EndDate__c":"sortEndDateAsc","Status__c":"sortStatusAsc","StatusReason__c":"sortStatusReasonAsc"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted]; 
        if(orderToBeSorted === "DESC"){
            component.set("v."+sortFieldCompName,true); 
        }else{
            component.set("v."+sortFieldCompName,false); 
        }
        var page = 1;
        helper.sortBy(component, event, fieldNameToBeSorted,page,sortFieldCompName);
        
    },
})