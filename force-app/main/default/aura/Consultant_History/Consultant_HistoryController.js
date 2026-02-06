({
    doInit : function(component, event, helper) {        
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            component.set("v.isDesktop",true);
            setTimeout(function(){
                component.set('v.isDesktop',true);
                if(!component.get('v.isGenericEventTriggered')){                
                    component.set('v.isGenericEventTriggered',true);
                    helper.checkEditAccesToThisUser(component, event);
                }        
            }, 5000);       
        }else{
            component.set("v.isDesktop",false);
            helper.checkEditAccesToThisUser(component, event);            
            
        }        
    },
     testMethod : function(component, event, helper) {        
      console.log('testesres'); 
    },
    
    modelCloseComponentEvent : function(component, event,helper) {
        helper.modalGenericClose(component);
        var isNeedRefresh = event.getParam("refresh");              
        if(isNeedRefresh == 'true'){            
            helper.getConsultantHistoryDataFromController(component,1,event);
        }
    },
    removeRecords: function(component, event, helper) {        
        var consultantHistoryId = event.getParam('consultingHistoryIndx');        
        component.set('v.consultantHistoryId',consultantHistoryId);        
        var deleteAcc = component.find('consultantHistory');
        for(var i = 0; i < deleteAcc.length ; i=i+1){
            $A.util.removeClass(deleteAcc[i], 'slds-hide');
            $A.util.addClass(deleteAcc[i], 'slds-show');
        }
    },    
    removeRecordsInPopUp: function(component, event, helper) {                
        var consultantHistoryId = event.getParam('consultingHistoryModalIndx');        
        component.set('v.consultantHistoryId',consultantHistoryId);        
        var deleteAcc = component.find('deleteChildAlert');
        for(var i = 0; i < deleteAcc.length ; i=i+1){
            $A.util.removeClass(deleteAcc[i], 'slds-hide');
            $A.util.addClass(deleteAcc[i], 'slds-show');
        }
    },
    AddConsultants: function(component, event, helper) {        
        
        if(!component.get("v.isDesktop")) {         
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
        }        
        
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component",{attribute:true,'Modalheader':'Search for a Consultant','ModalBody':'Consultant_History_Consulting_Firm_Model'}]],
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
        }else{
            
            component.set("v.scrollStyleForDevice","");
            
            $A.createComponents([["c:Panel_Component",{attribute:true,'Modalheader':'Search for a Consultant/ConsultingFirm','ModalBody':'Consultant_History_Consulting_Firm_Model'}]],
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
            
        }
        
        event.stopPropagation();
    },
    
    expandCollapse: function(component, event, helper) {
        
        if(!component.get('v.isDesktop')){
            return;
        }
        
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);
        $A.util.toggleClass(cmpTarget,'slds-is-open');
        var iconElement = selectedItem.getAttribute("id");
        
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");            
            helper.getConsultantHistoryDataFromController(component,1,event);
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
        }
    },
    showFullConsultantHistoryList : function(component, event, helper){        
        
        if(!component.get("v.isDesktop")) {         
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
        }
        
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component",{attribute:true,'Modalheader':'Consultants History','ModalBodyData':{'accountId':component.get('v.recordId')},'ModalBody':'Consultant_History_Modal','refreshOnClosingModel':'true'}]],
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
        }else{
            component.set("v.scrollStyleForDevice","");
            $A.createComponents([["c:Panel_Component",{attribute:true,'Modalheader':'Consultant History','ModalBodyData':{'accountId':component.get('v.recordId')},'ModalBody':'Consultant_History_Modal','refreshOnClosingModel':'true'}]],
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
        }
        
        
    },
    
    addSelectedConsultantHistory : function(component, event, helper) {                     
        var cmpTarget = component.find('contact_History');
        $A.util.addClass(cmpTarget,'slds-is-open');            
        component.find('utilityToggle').set("v.iconName","utility:chevrondown");
        var contactConsultantId = event.getParam('contactOfTypeConsultantObjId');                     
        helper.createOrDeleteConsultantRecordInController(component, event,contactConsultantId,'CREATE');
    },
    confirmChildDelete: function(component, event, helper) {
        var deleteAcc = component.find('deleteChildAlert');
        for(var i = 0; i < deleteAcc.length ; i=i+1){
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }                
        var appEvent = $A.get("e.c:Consultant_Hisotry_Delete_Child_Event");
        appEvent.setParams({
            "consultantHistoryId" : component.get('v.consultantHistoryId')
        });
        appEvent.fire();
        
    },
    confirmChildCancel: function(component, event, helper) {
        var deleteAcc = component.find('deleteChildAlert');
        for(var i = 0; i < deleteAcc.length ; i=i+1){
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }         
    },
    confirmDelete: function(component, event, helper) {
        var deleteAcc = component.find('consultantHistory');
        for(var i = 0; i < deleteAcc.length ; i=i+1){
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }        
        helper.createOrDeleteConsultantRecordInController(component, event,component.get('v.consultantHistoryId'),'DELETE');
    },
    confirmCancel: function(component, event, helper) {
        var deleteAcc = component.find('consultantHistory');
        for(var i = 0; i < deleteAcc.length ; i=i+1){
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }
        
        var childCmp = component.find("childComponent");
        if(childCmp != null && childCmp != undefined) {
            if(Array.isArray(childCmp)) {
                for(var j=0; j<childCmp.length; j++) {
                    childCmp[j].removeProcessingIcon();
                } 
            } else {
                childCmp.removeProcessingIcon();
            }
        }
        
    },
    display : function(component, event, helper) {
        helper.toggleHelper(component, event);
    },
    
    displayOut : function(component, event, helper) {
        helper.toggleHelper(component, event);
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
        if(!event.getParam("isShowFullListPage")){
            
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
        }else{
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
    navigateToObjectMethod : function(component, event, helper) {
        helper.modalGenericClose(component);
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": event.getParam("recordId")
        });
        navEvt.fire();
    },
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i = 0; i < ErrorMessage.length ; i=i+1){        
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    },
    openSortingPopup : function(component, event, helper){
        
        if(!component.get("v.isDesktop")) {         
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
        }                
        
        var fieldsToSort = [{"fieldName":"LastName__c","fieldDisplayName":"Last Name","fieldOrder":component.get("v.sortLastNameAsc")},
                            {"fieldName":"Name","fieldDisplayName":"First Name","fieldOrder":component.get("v.sortFirstNameAsc")},
                            {"fieldName":"JobTitle__c","fieldDisplayName":"Job Title","fieldOrder":component.get("v.sortJobTitleAsc")},
                            {"fieldName":"StartDate__c","fieldDisplayName":"Start Date","fieldOrder":component.get("v.sortStartDateAsc")},
                            {"fieldName":"EndDate__c","fieldDisplayName":"End Date","fieldOrder":component.get("v.sortEndDateAsc")},
                            {"fieldName":"Status__c","fieldDisplayName":"Status","fieldOrder":component.get("v.sortStatusAsc")},
                            {"fieldName":"StatusReason__c","fieldDisplayName":"Status Reason","fieldOrder":component.get("v.sortStatusReasonAsc")}
                           ];        
        $A.createComponents([["c:Panel_Component_Sorting",{attribute:true,'FieldsToSort':fieldsToSort,'lastSortField':component.get("v.lastSortField")}]],
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
        
        if(event.getParam('isChildComponent')) {
            return; 
        }
        
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
    setGeneralValues: function(component, event, helper){        
        if(component.get('v.isGenericEventTriggered')) return;
        
        var isError = event.getParam('isError');              
        component.set('v.isGenericEventTriggered',true);
        if(!isError){
            var generalObj = event.getParam('GeneralObj');
            if(generalObj != null && !generalObj.isEmptyUserRoleName){
                if(generalObj.HasEditAccess != null){                                        
                    if(generalObj.HasEditAccess){
                        component.set('v.isEditAccess',true);
                    }else{
                        component.set('v.isEditAccess',false);
                    }                    
                }else{
                    helper.checkEditAccesToThisUser(component, event);
                }
            }else{
                helper.checkEditAccesToThisUser(component, event);
            }  
        }else{            
            helper.checkEditAccesToThisUser(component, event);
        }              
    },
      scrollBottom: function(component, event, helper){	        
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP" && $A.get("$Browser.isIOS")){            
        	var isScrollStop = component.get("v.isScrollStop");
        	component.set("v.isStop",component.get("v.isStop")+1);                    
        	if(isScrollStop){                       
            
            var actionBar = component.find("action-bar-mobile");               	           
            $A.util.addClass(actionBar,"slds-hide");    
                        
                component.set("v.isScrollStop",false); 
                var myInterval = window.setInterval(
                    $A.getCallback(function() {
                        console.log('inside interval')
                        component.set("v.nextLastCount",component.get("v.lastCount"));
                        component.set("v.lastCount",component.get("v.isStop"));                         
                        if(component.get("v.lastCount") === component.get("v.nextLastCount")){                        	component.set("v.isStopped",true);
                            $A.util.removeClass(actionBar,"slds-hide");
                            component.set("v.isScrollStop",true);
                            clearInterval(myInterval);
                        }
                    }), 250
                ); 
                                              
            }
        } 
    }
})