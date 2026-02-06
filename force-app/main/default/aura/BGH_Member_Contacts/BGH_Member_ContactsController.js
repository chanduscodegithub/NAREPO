({
    doInit : function(component, event, helper) { 
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            component.set('v.isDesktop',true);
            /*setTimeout(function(){              
                if(!component.get('v.isGenericEventTriggered')){                
                    component.set('v.isGenericEventTriggered',true);
                    //Abhishek
                    helper.getObjectType(component, event);
                    //helper.getBusinessGroupsonHealthButton(component,event);
                }            
            }, 5000);  */         
            //helper.getObjectType(component, event);
            helper.getBGHMemberContactsButtonAccess(component,event);    
        }else{
          	//helper.getObjectType(component, event);
            helper.getBGHMemberContactsButtonAccess(component,event);    
        }     
    },
    
    BGH_Member_Contact_Popup : function(component, event, helper){
        var device = $A.get("$Browser.formFactor");
        var childData = {'accountId':component.get('v.recordId')};
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component",{attribute:true,'ModalBodyData':childData,'Modalheader':'Add Contacts','ModalBody':'BGH_Member_Contacts_Modal_Popup'}]],
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
                
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
            component.set("v.scrollStyleForDevice","");
            $A.createComponents([["c:Panel_Component",{attribute:true,'ModalBodyData':childData,'Modalheader':'Add Contacts','ModalBody':'BGH_Member_Contacts_Modal_Popup'}]],
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
            helper.getBGHMemberContacts(component,event);
        }else if(myLabel=="utility:chevrondown"){          
            component.find(iconElement).set("v.iconName","utility:chevronright");
        }      
    },
    
    modelCloseComponentEvent : function(component, event,helper) {
        if(!component.get('v.isDesktop')){
            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
        }
        helper.modalGenericClose(component);
    },
    
    addSelectedContact : function(component, event, helper) {
        helper.modalGenericClose(component);
        
        var cancel = event.getParam('clicked');
        if(cancel){
            if(!component.get('v.isDesktop')){
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
            }
            var businessMemberContacts = component.get('v.businessMemberContacts');
            
            if(businessGroups.length>0){
                component.set('v.businessMemberContacts',businessMemberContacts);
            }else{
                component.set('v.businessMemberContactsEmptyList', true);
            }
        }else{
            
            var myLabel = component.find('utilityToggle').get("v.iconName");
            if(myLabel=="utility:chevronright"){
                var cmpTarget = component.find('BGH_Applet');
                $A.util.addClass(cmpTarget,'slds-is-open');
                component.find('utilityToggle').set("v.iconName","utility:chevrondown");
            } 
            
            var spinner1 = component.find("spinner"); 
            $A.util.removeClass(spinner1, 'slds-hide'); 
            
            var spinner2 = component.find("spinner1"); 
            $A.util.removeClass(spinner2, 'slds-hide'); 
            
            var appletIcon = component.find("appletIcon"); 
            $A.util.addClass(appletIcon, 'slds-hide'); 
            
            var action = component.get('c.addContactToBGHAccount');
            action.setParams({ 'selectedContactId' : event.getParam('contactId'),
                              'accountId' : component.get('v.recordId'),
                             });
            
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    
                    console.log(JSON.stringify(response.getReturnValue().contactBusinessGroupsonHealth));
                    if(response.getReturnValue().contactBusinessGroupsonHealth != null) {
                        component.set('v.businessMemberContactsEmptyList', false);
                        component.set('v.businessMemberContacts', response.getReturnValue().contactBusinessGroupsonHealth);
                    }else{
                        component.set('v.businessMemberContactsEmptyList', true);
                    }
                    
                    $A.util.addClass(spinner1, 'slds-hide');
                    $A.util.addClass(spinner2, 'slds-hide');
                    $A.util.removeClass(appletIcon, 'slds-hide');
                    
                    if(!component.get('v.isDesktop')){
                        $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                    }
                }
                else if (state === "INCOMPLETE") {
                    // do something
                }
                    else if (state === "ERROR") {
                        
                        $A.util.addClass(spinner1, 'slds-hide');
                        $A.util.addClass(spinner2, 'slds-hide');
                        $A.util.removeClass(appletIcon, 'slds-hide');
                        var errors = response.getError();
                        if (errors) {
                            if (errors[0] && errors[0].message) {
                                component.set('v.ErrorMessage',errors[0].message);
                                var ErrorMessage = component.find('ErrorMessage');
                                for(var i = 0; i < ErrorMessage.length; i = i+1){
                                    $A.util.addClass(ErrorMessage[i], 'slds-show');
                                    $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                                }
                            }
                        } else {
                            console.log("Unknown error");
                        }
                    }
            });   
            $A.enqueueAction(action);
        }
    },
    
    confirmDelete: function(component, event, helper) {
        var removeBghId = component.get('v.BGHToBeRemovedFromApplet');
        helper.removeBGHRecordFromApplet(component, event, removeBghId);
    },
    
    confirmCancel: function(component, event, helper) {
        var deleteAcc = component.find('BusinessGroupHealth');
        for(var i = 0; i < deleteAcc.length; i = i+1){
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
    
    removeProcessingOnCancel : function(component, event, helper) {
        var deleteIconVal = component.find('deleteIcon');
        $A.util.removeClass(deleteIconVal, 'slds-hide');
        var spinnerVal = component.find('spinner');
        $A.util.addClass(spinnerVal, 'slds-hide');
    },
    
    removeRecords: function(component, event, helper) {
        var removebghId = event.getParam('bghMemberContactId');
        
        component.set('v.BGHToBeRemovedFromApplet',removebghId);
        var deleteAcc = component.find('BusinessGroupHealth');
        for(var i = 0; i < deleteAcc.length; i = i+1){
            $A.util.removeClass(deleteAcc[i], 'slds-hide');
            $A.util.addClass(deleteAcc[i], 'slds-show');
        }
    },
    
    sortFields : function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldItagsWithAuraAttrMap = '{"BGHContact__r.LastName" : "sortBGHlastNameAsc", "BGHContact__r.FirstName" : "sortBGHfirstNameAsc", "Role__c" : "sortBGHRoleAsc","BGHContact__r.Account.Name" : "sortBGHCompanyNameAsc","BGHContact__r.Account.RecordType.Name" : "sortBGHCompanyTypeNameAsc"}';
        
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        
        helper.sortBy(component, event, fieldNameToBeSorted, sortFieldCompName);
    },
    
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    },
    
    setGeneralValues: function(component, event, helper){			
        console.log('setGeneralValues');
        //return;
        if(component.get('v.isGenericEventTriggered')) return;			
        var isError = event.getParam('isError');              
        component.set('v.isGenericEventTriggered',true);
        if(!isError){
            var generalObj = event.getParam('GeneralObj');
            console.log("BGH general obj");
            console.log(generalObj);
            if(generalObj != null && !generalObj.isEmptyUserRoleName){
                if(generalObj.userEditAccessMap != null && generalObj.userEditAccessMap['BussinessGroupHealth'] != null){
                    component.set('v.isEditAccess',generalObj.userEditAccessMap['BussinessGroupHealth']);
                }else{
                    helper.getBusinessGroupsonHealthButton(component,event);
                }
            }else{
                helper.getBusinessGroupsonHealthButton(component,event);
            }  
        }else{            
            helper.getBusinessGroupsonHealthButton(component,event);
        }              
    },
    
    openSortingPopup : function(component, event, helper) {
        
        if(!component.get('v.isDesktop')){
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
        }
        
        var fieldsToSort = [{"fieldName":"BGHContact__r.LastName","fieldDisplayName":"Last Name","fieldOrder":component.get("v.sortBGHlastNameAsc")},
                            {"fieldName":"BGHContact__r.FirstName","fieldDisplayName":"First Name","fieldOrder":component.get("v.sortBGHfirstNameAsc")},
                            {"fieldName":"Role__c","fieldDisplayName":"Role","fieldOrder":component.get("v.sortBGHRoleAsc")},
							{"fieldName":"BGHContact__r.Account.Name","fieldDisplayName":"Company Name","fieldOrder":component.get("v.sortBGHCompanyNameAsc")},
							{"fieldName":"BGHContact__r.Account.RecordType.Name","fieldDisplayName":"Company Type","fieldOrder":component.get("v.sortBGHCompanyTypeNameAsc")}
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

        var isApplyVal = event.getParam('isApply');
        if(isApplyVal) {
            var fieldNameToBeSorted = event.getParam('fieldNameToBeSorted');
            component.set("v.lastSortField",fieldNameToBeSorted);
            var orderToBeSorted = event.getParam('orderToBeSorted');
            var fieldItagsWithAuraAttrMap = '{"BGHContact__r.LastName" : "sortBGHlastNameAsc", "BGHContact__r.FirstName" : "sortBGHfirstNameAsc", "Role__c" : "sortBGHRoleAsc","BGHContact__r.Account.Name" : "sortBGHCompanyNameAsc","BGHContact__r.Account.RecordType.Name" : "sortBGHCompanyTypeNameAsc"}';
            
            var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
            var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted]; 
            if(orderToBeSorted === "DESC"){
                component.set("v."+sortFieldCompName,true); 
            }else{
                component.set("v."+sortFieldCompName,false); 
            }
            helper.sortBy(component, event, fieldNameToBeSorted,sortFieldCompName);
        } else {
            if(!component.get('v.isDesktop')){
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
            }
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