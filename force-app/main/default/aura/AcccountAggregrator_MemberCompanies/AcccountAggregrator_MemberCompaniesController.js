({
    doInit : function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            setTimeout(function(){              
                if(!component.get('v.isGenericEventTriggered')){                
                    component.set('v.isGenericEventTriggered',true);
                    //Call your respective doInit function below
                    helper.getaccountMemberCompanies(component, event);
                }            
            }, 5000);        
        }else{
            helper.getaccountMemberCompanies(component, event);
        } 
        
    },
    
    setGeneralValues: function(component, event, helper){			
        if(component.get('v.isGenericEventTriggered')) return;			
        var isError = event.getParam('isError');              
        component.set('v.isGenericEventTriggered',true);
        if(!isError){
            var generalObj = event.getParam('GeneralObj');
            if(generalObj != null && !generalObj.isEmptyUserRoleName){
                if(generalObj.userEditAccessMap != null && generalObj.userEditAccessMap['Aggregator'] != null){
                    //component.set('v.isEditAccess',generalObj.userEditAccessMap['Aggregator']);
                    helper.intializedoInitValues(component, generalObj.accountTypeForAggregator);
                }else{
                    helper.getaccountMemberCompanies(component, event);
                }
            }else{
                helper.getaccountMemberCompanies(component, event);
            }  
        }else{            
            helper.getaccountMemberCompanies(component, event);
        }              
    },
    
    expandCollapse: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(component.get('v.expandOnLoad')){
            component.get('v.sortField','Name');
            component.set('v.sortOrder','ASC');
            if(device == "DESKTOP"){
                var selectedItem = event.currentTarget;
                var divId = selectedItem.dataset.record; 
                var contactType = '';
                var cmpTarget = component.find(divId);
                $A.util.toggleClass(cmpTarget,'slds-is-open');
                var iconElement = selectedItem.getAttribute("id");
                component.set('v.isAccountContactListEmpty',false);
                var myLabel = component.find(iconElement).get("v.iconName");
                contactType = component.get('v.contactRecordTypeId');
                if(myLabel=="utility:chevronright"){            
                    component.find(iconElement).set("v.iconName","utility:chevrondown");
                    var page = 1;
                    helper.getCDAccounts(component,page,event,component.get('v.sortField'),component.get('v.sortOrder'));
                }else if(myLabel=="utility:chevrondown"){            
                    component.find(iconElement).set("v.iconName","utility:chevronright");
                } 
            }
        }
        
    },
    sortFields: function(component, event, helper) {
        var selectedItem = event.currentTarget;
        var contactType = '';
        var fieldItagsWithAuraAttrMap = '';
        var fieldNameToBeSorted = selectedItem.dataset.record;
        if(component.get('v.cvgAccount')){
            fieldItagsWithAuraAttrMap = '{"Name":"sortNameAsc","Aggregator_Membership_Status__c":"sortAggregatorMembershipStatusAsc","RecordType.Name":"sortTypeAsc","Owner.Name":"sortOwnerAsc","BillingStateCode":"sortStateAsc"}';
        }else if(component.get('v.bghAccount')){
            fieldItagsWithAuraAttrMap = '{"New_Account__r.Name":"sortNameAsc","New_Account__r.Aggregator_Membership_Status__c":"sortAggregatorMembershipStatusAsc","New_Account__r.RecordType.Name":"sortTypeAsc","New_Account__r.Owner.Name":"sortOwnerAsc","New_Account__r.BillingStateCode":"sortStateAsc"}';
        }
        contactType = component.get('v.contactRecordTypeId');
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        var page = 1;
        
        helper.sortBy(component, event, fieldNameToBeSorted,page,sortFieldCompName);
        
    },
    
    sortFieldsMobile: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
        } 
        var isApply = event.getParam('isApply');
        var fieldNameToBeSorted = event.getParam('fieldNameToBeSorted');
        if(isApply){
            if(device != "DESKTOP"){ 
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
            } 
            component.set("v.lastSortField",fieldNameToBeSorted);
            var fieldItagsWithAuraAttrMap = [];
            var contactType = '';
            var orderToBeSorted = event.getParam('orderToBeSorted');
            if(component.get('v.cvgAccount')){
                fieldItagsWithAuraAttrMap = '{"Name":"sortNameAsc","Aggregator_Membership_Status__c":"sortAggregatorMembershipStatusAsc","RecordType.Name":"sortTypeAsc","Owner.Name":"sortOwnerAsc","BillingStateCode":"sortStateAsc"}';
            }else if(component.get('v.bghAccount')){
                fieldItagsWithAuraAttrMap = '{"New_Account__r.Name":"sortNameAsc","New_Account__r.Aggregator_Membership_Status__c":"sortAggregatorMembershipStatusAsc","New_Account__r.RecordType.Name":"sortTypeAsc","New_Account__r.Owner.Name":"sortOwnerAsc","New_Account__r.BillingStateCode":"sortStateAsc"}';
            } 
            
            if(orderToBeSorted === "DESC"){
                component.set("v."+sortFieldCompName,true); 
            }else{
                component.set("v."+sortFieldCompName,false); 
            }
            contactType = component.get('v.contactRecordTypeId');
            var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
            var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
            var page = 1;
            helper.sortBy(component, event, fieldNameToBeSorted,page,sortFieldCompName);
        }else{
            if(device != "DESKTOP"){ 
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
            } 
        }
    },
    openSortingPopup : function(component, event, helper){
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
        } 
        var fieldsToSort = []; 
        console.log('test');
        if(component.get('v.cvgAccount')){
            fieldsToSort = [{"fieldName":"Name","fieldDisplayName":"Company Name","fieldOrder":component.get("v.sortNameAsc")},
                            {"fieldName":"Aggregator_Membership_Status__c","fieldDisplayName":"Aggregator Membership Status","fieldOrder":component.get("v.sortAggregatorMembershipStatusAsc")},
                            {"fieldName":"RecordType.Name","fieldDisplayName":"Sub Type","fieldOrder":component.get("v.sortTypeAsc")},
                            {"fieldName":"Owner.Name","fieldDisplayName":"Owner","fieldOrder":component.get("v.sortOwnerAsc")},
                            {"fieldName":"BillingStateCode","fieldDisplayName":"State","fieldOrder":component.get("v.sortStateAsc")}
                           ]; 
        }else if(component.get('v.bghAccount')){
            fieldsToSort = [{"fieldName":"New_Account__r.Name","fieldDisplayName":"Company Name","fieldOrder":component.get("v.sortNameAsc")},
                            {"fieldName":"New_Account__r.Aggregator_Membership_Status__c","fieldDisplayName":"Aggregator Membership Status","fieldOrder":component.get("v.sortAggregatorMembershipStatusAsc")},
                            {"fieldName":"New_Account__r.RecordType.Name","fieldDisplayName":"Sub Type","fieldOrder":component.get("v.sortTypeAsc")},
                            {"fieldName":"New_Account__r.Owner.Name","fieldDisplayName":"Owner","fieldOrder":component.get("v.sortOwnerAsc")},
                            {"fieldName":"New_Account__r.BillingStateCode","fieldDisplayName":"State","fieldOrder":component.get("v.sortStateAsc")}
                           ]; 
        }
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
    pageChange: function(component, event, helper) {
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        setTimeout(function(){ 
            var focusInputField = component.find("focusInputField");
            $A.util.removeClass(focusInputField, 'slds-hide');            	 
            focusInputField.focus();
            $A.util.addClass(focusInputField, 'slds-hide');
            
        }, 600);
        helper.getCDAccounts(component,page,event,component.get('v.sortField'),component.get('v.sortOrder'));
    },
    navigateToContactDetailPage : function(component, event, helper){
        var selectedItem = event.currentTarget;
        var recId = selectedItem.dataset.record;
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": recId,
            "slideDevName": "related",
            //"isredirect":true
        });
       navEvt.fire();
    },
    alertErrorModalClose : function(component, event,helper) {
        helper.modalGenericClose(component);
    },
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
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
                        if(component.get("v.lastCount") === component.get("v.nextLastCount")){                        	
                            component.set("v.isStopped",true);
                            $A.util.removeClass(actionBar,"slds-hide");
                            component.set("v.isScrollStop",true);
                            clearInterval(myInterval);
                        }
                    }), 250
                ); 
                
            }
        } 
    },
    
    handleRecordUpdated: function(component, event, helper){
        var eventParams = event.getParams();
        var page = 1;
        if(eventParams.changeType === "LOADED") {
            if(component.get('v.AccountListData').Subtype__c == 'Collaborative Ventures Group (CVG)'){
                component.set('v.cvgAccount',true);
                component.set('v.bghAccount',false);
            }else if(component.get('v.AccountListData').Subtype__c == 'Business Group on Health (BGH)'){
                component.set('v.cvgAccount',false);
                component.set('v.bghAccount',true);
            }
            helper.getCDAccounts(component,page,event,component.get('v.sortField'),'DESC');
        }else if(eventParams.changeType === "REMOVED") {
            
        }else if(eventParams.changeType === "ERROR") {
            
        }else if (eventParams.changeType === "CHANGED") {
            if(component.get('v.AccountListData').Subtype__c == 'Collaborative Ventures Group (CVG)'){
                component.set('v.cvgAccount',true);
                component.set('v.bghAccount',false);
            }else if(component.get('v.AccountListData').Subtype__c == 'Business Group on Health (BGH)'){
                component.set('v.cvgAccount',false);
                component.set('v.bghAccount',true);
            }
            helper.getCDAccounts(component,page,event,component.get('v.sortField'),'DESC');
        }
    }

})