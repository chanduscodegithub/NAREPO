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
            helper.getObjectType(component, event);
        }else{
          	helper.getObjectType(component, event);
            //helper.getBusinessGroupsonHealthButton(component,event);    
        }     
    },
    
    saveEditRoleBGH : function(component, event, helper){
        
        var indexForEdit = event.getParam('index');
        var checkingEdit = event.getParam('checkingEdit');
        var BGH_Contacts = component.find('contactBGH');
        if(checkingEdit){
            if(BGH_Contacts != null && BGH_Contacts != undefined) {
                if(Array.isArray(BGH_Contacts)){
                    for(var i = 0; i<BGH_Contacts.length; i++){
                        if(i != indexForEdit){
                            BGH_Contacts[i].remEditCancel();
                        }
                    }	
                }else{
                    BGH_Contacts.remEditCancel();
                }
            }
            
        }else{
            var editRoleBGHId = event.getParam('bghIdToRoleEdit'); 
            var updatedRole = event.getParam('bghRoleToUpdate');
            
            helper.saveUpdatedRoleBGH(component, event, editRoleBGHId, updatedRole);
        }
    },
    
    Business_Group_On_Health : function(component, event, helper){
        var device = $A.get("$Browser.formFactor");
        var childData = {'accountId':component.get('v.recordId'), 'isContact' : component.get('v.isContact')};
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component",{attribute:true,'ModalBodyData':childData,'Modalheader':'Add Business Groups on Health/Coalitions','ModalBody':'BGH_Modal'}]],
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
            $A.createComponents([["c:Panel_Component",{attribute:true,'Modalheader':'Add Business Groups on Health/Coalitions','ModalBodyData':childData,'ModalBody':'BGH_Modal'}]],
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
            helper.getBusinessGroupsonHealth(component,event);
            //$A.util.toggleClass(cmpTarget,'slds-is-open');
        }else if(myLabel=="utility:chevrondown"){          
            component.find(iconElement).set("v.iconName","utility:chevronright");
            //$A.util.toggleClass(cmpTarget,'slds-is-open');
        }      
    },
    
    modelCloseComponentEvent : function(component, event,helper) {
        if(!component.get('v.isDesktop')){
            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
        }
        helper.modalGenericClose(component);
    },
    
    addSelectedBG : function(component, event, helper) {
        helper.modalGenericClose(component);
        
        var cancel = event.getParam('clicked');
        if(cancel){
            if(!component.get('v.isDesktop')){
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
            }
            var businessGroups = null;
            if(component.get('v.isContact')){
                businessGroups = component.get('v.businessGroupsContact');
            }else{
                businessGroups = component.get('v.businessGroups');
            }
            
            if(businessGroups.length>0){
                component.set('v.businessGroups',businessGroups);
            }else{
                component.set('v.BusinessGroupEmptyList', true);
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
            
            var action = component.get('c.addBusinessGroupsToAccount');
            action.setParams({ 'selectedBGHId' : event.getParam('selectedBusinessGroup'),
                              'accountId' : component.get('v.recordId'),
                              'isContact' : component.get('v.isContact')
                             });
            
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    
                    if(component.get('v.isContact')){
                    console.log(JSON.stringify(response.getReturnValue().contactBusinessGroupsonHealth));
                    if(response.getReturnValue().contactBusinessGroupsonHealth != null) {
                        component.set('v.BusinessGroupEmptyList', false);
                        component.set('v.businessGroupsContact', response.getReturnValue().contactBusinessGroupsonHealth);
                    }else{
                        component.set('v.BusinessGroupEmptyList', true);
                    }
                }else{
                    if(response.getReturnValue().accountBusinessGroupsonHealth != null) {
                        component.set('v.BusinessGroupEmptyList', false);
                        component.set('v.businessGroups', response.getReturnValue().accountBusinessGroupsonHealth);
                    }else{
                        component.set('v.BusinessGroupEmptyList', true);
                    }    
                }   
                    
                    $A.util.addClass(spinner1, 'slds-hide');
                    $A.util.addClass(spinner2, 'slds-hide');
                    $A.util.removeClass(appletIcon, 'slds-hide');
                    
                    if(!component.get('v.isDesktop')){
                        $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                    }
                }
                else if (state === "INCOMPLETE") {
                    $A.util.addClass(spinner1, 'slds-hide');
                    $A.util.addClass(spinner2, 'slds-hide');
                    $A.util.removeClass(appletIcon, 'slds-hide');
                    component.set('v.ErrorMessage',$A.get("$Label.c.Internerconnectionfail"));
                    var ErrorMessage = component.find('ErrorMessage');
                    for(var i = 0; i < ErrorMessage.length; i = i+1){
                        $A.util.addClass(ErrorMessage[i], 'slds-show');
                        $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                    }
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
                            //    $A.util.removeClass(spinner, 'slds-show');
                            //     $A.util.addClass(spinner, 'slds-hide');
                            console.log("Unknown error");
                        }
                    }
                //  $A.util.removeClass(spinner, 'slds-show');
                //  $A.util.addClass(spinner, 'slds-hide');
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
        
        var childCmp = null;
        if(component.get('v.isContact')){
        	childCmp = component.find("contactBGH");    
        }else{
            childCmp = component.find("childComponent");
        }
        
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
        var removebghId = event.getParam('bghIdToRemove');
        var removebghName = event.getParam('bghNameToRemove');
        component.set('v.BGHToBeRemovedFromApplet',removebghId);
        component.set('v.BGHNameToBeRemovedFromApplet',removebghName);
        var deleteAcc = component.find('BusinessGroupHealth');
        for(var i = 0; i < deleteAcc.length; i = i+1){
            $A.util.removeClass(deleteAcc[i], 'slds-hide');
            $A.util.addClass(deleteAcc[i], 'slds-show');
        }
    },
    
    sortFields : function(component, event, helper) {
        
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        if(component.get('v.isContact')){
            var fieldItagsWithAuraAttrMap = '{"CompanyBGH__r.Name":"sortBGHNameAsc", "Role__c" : "sortBGHRoleAsc"}';
        }else{
        	var fieldItagsWithAuraAttrMap = '{"BGH_Account__r.Name":"sortBGHNameAsc"}';    
        }
        
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
        if(component.get('v.isGenericEventTriggered')) return;			
        var isError = event.getParam('isError');              
        component.set('v.isGenericEventTriggered',true);
        if(!isError){
            var generalObj = event.getParam('GeneralObj');
            console.log("BGH general obj");
            console.log(generalObj);
            if(generalObj != null && !generalObj.isEmptyUserRoleName){
                /**if(generalObj.userEditAccessMap != null && generalObj.userEditAccessMap['BussinessGroupHealth'] != null){
                    component.set('v.isEditAccess',generalObj.userEditAccessMap['BussinessGroupHealth']);
                }*/if(generalObj.HasEditAccess != null){ 
                    component.set('v.isEditAccess',generalObj.HasEditAccess);                                        
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
        
        if(component.get('v.isContact')){
            var fieldsToSort = [{"fieldName":"CompanyBGH__r.Name","fieldDisplayName":"Name","fieldOrder":component.get("v.sortBGHNameAsc")},
                                {"fieldName":"Role__c","fieldDisplayName":"Role","fieldOrder":component.get("v.sortBGHRoleAsc")}];        
        }else{
        	var fieldsToSort = [{"fieldName":"BGH_Account__r.Name","fieldDisplayName":"Name","fieldOrder":component.get("v.sortBGHNameAsc")}];            
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
    
    sortFieldsMobile: function(component, event, helper) {

        var isApplyVal = event.getParam('isApply');
        if(isApplyVal) {
            var fieldNameToBeSorted = event.getParam('fieldNameToBeSorted');
            component.set("v.lastSortField",fieldNameToBeSorted);
            var orderToBeSorted = event.getParam('orderToBeSorted');
            if(component.get('v.isContact')){
                var fieldItagsWithAuraAttrMap = '{"CompanyBGH__r.Name":"sortBGHNameAsc", "Role__c" : "sortBGHRoleAsc"}';
            }else{
            	var fieldItagsWithAuraAttrMap = '{"BGH_Account__r.Name":"sortBGHNameAsc"}';    
            }
            
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