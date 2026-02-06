({
    doInit : function(component, event, helper) {
        
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            component.set('v.isDesktop',true);
            helper.getaccountCategoryType(component, event);
          /*  setTimeout(function(){              
                if(!component.get('v.isGenericEventTriggered')){                
                    component.set('v.isGenericEventTriggered',true);
                    //Call your respective doInit function below
                    helper.getaccountCategoryType(component, event);
                }            
            }, 5000);  */          
        }else{ 
            helper.getaccountCategoryType(component, event);
       } 
    },
    
    setGeneralValues: function(component, event, helper){	
        return;
        if(component.get('v.isGenericEventTriggered')) return;			
        var isError = event.getParam('isError');              
        component.set('v.isGenericEventTriggered',true);
        if(!isError){
            var generalObj = event.getParam('GeneralObj');
            if(generalObj != null && !generalObj.isEmptyUserRoleName){
                if(generalObj.userEditAccessMap != null && generalObj.userEditAccessMap['CdAccounts'] != null){
                    //component.set('v.isEditAccess',generalObj.userEditAccessMap['CdAccounts']);
                    helper.initializedoInitValues(component,generalObj.contactTypeId,generalObj.userEditAccessMap['CdAccounts'],generalObj.accountType);
                }else{
                    helper.getaccountCategoryType(component, event);
                }
            }else{
                helper.getaccountCategoryType(component, event);
            }  
        }else{            
            helper.getaccountCategoryType(component, event);
        }              
    },
    expandCollapse: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            var isExpandVal = component.get('v.isExpandVal');
            if(isExpandVal != undefined && isExpandVal != null && isExpandVal == false) {
                return;
            }
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
                helper.getCDAccounts(component,page,event,component.get('v.sortField'),component.get('v.sortOrder'),contactType);
            }else if(myLabel=="utility:chevrondown"){            
                component.find(iconElement).set("v.iconName","utility:chevronright");
            } 
        }
        
    },
    sortFields: function(component, event, helper) {
        var selectedItem = event.currentTarget;
        var contactType = '';
        var fieldItagsWithAuraAttrMap = '';
        var fieldNameToBeSorted = selectedItem.dataset.record;
        if(component.get('v.cmAccountType')){
            //contactType = 'CM Contact';
            fieldItagsWithAuraAttrMap = '{"LastName":"sortLastNameAsc","FirstName":"sortFirstNameAsc","Title":"sortJobTitleAsc","Role__c":"sortRoleAsc","UHGRelationshipwithExecutive__c":"sortUhgRelationshipWithExecutiveAsc","ReportsTo__c":"sortReportsToAsc","Key_Contact__c":"sortKeyContact","AMT_Log__c":"sortAMTLog"}';
        }else if(component.get('v.cdAccountType')){
            // contactType = 'CD Contact';
            fieldItagsWithAuraAttrMap = '{"LastName":"sortLastNameAsc","FirstName":"sortFirstNameAsc","Title":"sortJobTitleAsc","Email":"sortEmail","DecisionMakingRole__c":"sortDecisionMakingRole","LastModifiedDate":"sortLastModifiedDate"}';
        }else if(component.get('v.cfAccountType')){
            //contactType = 'Consultant';
            fieldItagsWithAuraAttrMap = '{"ConsultantTier__c":"sortConsultantTierAsc","LastName":"sortLastNameAsc","FirstName":"sortFirstNameAsc","Title":"sortJobTitleAsc","Email":"sortEmail"}';
        } 
        contactType = component.get('v.contactRecordTypeId');
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        var page = 1;
        
        helper.sortBy(component, event, fieldNameToBeSorted,page,sortFieldCompName,contactType);
        
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
            var orderToBeSorted = event.getParam('orderToBeSorted');
            if(component.get('v.cmAccountType')){
                //contactType = 'CM Contact';
                fieldItagsWithAuraAttrMap = '{"LastName":"sortLastNameAsc","FirstName":"sortFirstNameAsc","Title":"sortJobTitleAsc","Key_Contact__c":"sortKeyContact","Role__c":"sortRoleAsc","UHGRelationshipwithExecutive__c":"sortUhgRelationshipWithExecutiveAsc","ReportsTo__c":"sortReportsToAsc","AMT_Log__c":"sortAMTLog"}';
            }else if(component.get('v.cdAccountType')){
                // contactType = 'CD Contact';
                fieldItagsWithAuraAttrMap = '{"LastName":"sortLastNameAsc","FirstName":"sortFirstNameAsc","Title":"sortJobTitleAsc","Email":"sortEmail","DecisionMakingRole__c":"sortDecisionMakingRole","LastModifiedDate":"sortLastModifiedDate"}';
            }else if(component.get('v.cfAccountType')){
                //contactType = 'Consultant';
                fieldItagsWithAuraAttrMap = '{"ConsultantTier__c":"sortConsultantTierAsc","LastName":"sortLastNameAsc","FirstName":"sortFirstNameAsc","Title":"sortJobTitleAsc"}';
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
            
            helper.sortBy(component, event, fieldNameToBeSorted,page,sortFieldCompName,contactType);
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
        if(component.get('v.cmAccountType')){
            fieldsToSort = [{"fieldName":"LastName","fieldDisplayName":"Last Name","fieldOrder":component.get("v.sortLastNameAsc")},
                            {"fieldName":"FirstName","fieldDisplayName":"First Name","fieldOrder":component.get("v.sortFirstNameAsc")},
                            {"fieldName":"Title","fieldDisplayName":"Job Title","fieldOrder":component.get("v.sortJobTitleAsc")},
                            {"fieldName":"Key_Contact__c","fieldDisplayName":"Key Contact","fieldOrder":component.get("v.sortKeyContact")},
                            {"fieldName":"Role__c","fieldDisplayName":"User Role","fieldOrder":component.get("v.sortRoleAsc")},
                            {"fieldName":"UHGRelationshipwithExecutive__c","fieldDisplayName":"UHGRelationship with Executive","fieldOrder":component.get("v.sortUhgRelationshipWithExecutiveAsc")},
                            {"fieldName":"ReportsTo__c","fieldDisplayName":"Reports To","fieldOrder":component.get("v.sortReportsToAsc")},
                            {"fieldName":"AMT_Log__c","fieldDisplayName":"AMT Log","fieldOrder":component.get("v.sortAMTLog")},
                           ]; 
        }else if(component.get('v.cdAccountType')){
            fieldsToSort = [{"fieldName":"LastName","fieldDisplayName":"Last Name","fieldOrder":component.get("v.sortLastNameAsc")},
                            {"fieldName":"FirstName","fieldDisplayName":"First Name","fieldOrder":component.get("v.sortFirstNameAsc")},
                            {"fieldName":"Title","fieldDisplayName":"Job Title","fieldOrder":component.get("v.sortJobTitleAsc")},
                            {"fieldName":"DecisionMakingRole__c","fieldDisplayName":"Decision Making Role","fieldOrder":component.get("v.sortDecisionMakingRole")},
                            {"fieldName":"Email","fieldDisplayName":"Email","fieldOrder":component.get("v.sortEmail")},
                            {"fieldName":"LastModifiedDate","fieldDisplayName":"LastModifiedDate","fieldOrder":component.get("v.sortDecisionMakingRole")}
                           ]; 
        }else if(component.get('v.cfAccountType')){
            fieldsToSort = [{"fieldName":"ConsultantTier__c","fieldDisplayName":"Consultant Tier","fieldOrder":component.get("v.sortConsultantTierAsc")},
                            {"fieldName":"LastName","fieldDisplayName":"Last Name","fieldOrder":component.get("v.sortLastNameAsc")},
                            {"fieldName":"FirstName","fieldDisplayName":"First Name","fieldOrder":component.get("v.sortFirstNameAsc")},
                            {"fieldName":"Title","fieldDisplayName":"Job Title","fieldOrder":component.get("v.sortJobTitleAsc")}
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
        var contactType = '';
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        setTimeout(function(){ 
            var focusInputField = component.find("focusInputField");
            $A.util.removeClass(focusInputField, 'slds-hide');            	 
            focusInputField.focus();
            $A.util.addClass(focusInputField, 'slds-hide');
            
        }, 600);
        contactType = component.get('v.contactRecordTypeId');
        helper.getCDAccounts(component,page,event,component.get('v.sortField'),component.get('v.sortOrder'),contactType);
    },
    createRecord : function (component, event, helper) {
        
        component.set('v.scrollStyleForDevice','');
        
        var createRecordEvent = $A.get("e.force:createRecord");
        var contactType = '';
        contactType = component.get('v.contactRecordTypeId');
        createRecordEvent.setParams({
            "entityApiName": "Contact",
            'defaultFieldValues': {
                'AccountId':component.get('v.recordId')
                //'Type__c':contactTypez
            },
            'recordTypeId':contactType
        });
        createRecordEvent.fire();
        event.stopPropagation();
    },
    navigateToContactDetailPage : function(component, event, helper){
        console.log("Inside Navigation");
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
    }
})