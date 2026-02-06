({
    doInit : function(component, event, helper) {
        var timeOut = 5000;
        var recId = component.get('v.recordId');
        if(recId.substring(0,3) === '006'){
            component.set('v.isOpportunity', true);
            timeOut = 1000;
        }
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            component.set('v.isDesktop',true);
            setTimeout(function(){              
                if(!component.get('v.isGenericEventTriggered')){                
                    component.set('v.isGenericEventTriggered',true);
                    //Call your respective doInit function below
                    helper.getAccTeamRole(component, event);
                }            
            }, timeOut);       
        }else{
            helper.getAccTeamRole(component, event);
        } 
        
    },
    
    setGeneralValues: function(component, event, helper){			
        if(component.get('v.isGenericEventTriggered')) return;			
        var isError = event.getParam('isError');              
        component.set('v.isGenericEventTriggered',true);
        if(!isError){
            var generalObj = event.getParam('GeneralObj');
            if(generalObj != null && !generalObj.isEmptyUserRoleName){
                if(generalObj.recordIdObjectType === 'Opportunity'){
                    component.set('v.isOpportunity', true);
                }
                if(generalObj.HasEditAccess != null){                                                            
                    helper.initializedoInitValues(component,generalObj.HasEditAccess);
                }else{
                    helper.getAccTeamRole(component, event);
                }
            }else{
                helper.getAccTeamRole(component, event);
            }  
        }else{            
            helper.getAccTeamRole(component, event);
        }              
    },
    
    modelCloseComponentEvent : function(component, event,helper) {
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
        }
        helper.modalGenericClose(component);
    },
    
    Account_Team_Applet : function(component, event, helper){
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
        } 
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component",{attribute:true,'Modalheader':'Search for a User','ModalBodyData':{'accountId':component.get('v.recordId'),'ModalPagination':true},'ModalBody':'Account_Team_Modal'}]],
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
            component.set('v.scrollStyleForDevice','');            
            $A.createComponents([["c:Panel_Component",{attribute:true,'Modalheader':'Search for a User','ModalBodyData':{'accountId':component.get('v.recordId'),'ModalPagination':true},'ModalBody':'Account_Team_Modal'}]],
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
   
    openSortingPopup : function(component, event, helper){
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
        } 
        var fieldsToSort = [{"fieldName":"LastName","fieldDisplayName":"Last Name","fieldOrder":component.get("v.sortLastNameAsc")},
                            {"fieldName":"FirstName","fieldDisplayName":"First Name","fieldOrder":component.get("v.sortFirstNameAsc")},
                            {"fieldName":"Title","fieldDisplayName":"Job Title","fieldOrder":component.get("v.sortJobTitleAsc")},
                            {"fieldName":"UserRole","fieldDisplayName":"User Role","fieldOrder":component.get("v.sortUserRoleAsc")}
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
    sortFields: function(component, event, helper) {
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        var fieldItagsWithAuraAttrMap = '{"LastName":"sortLastNameAsc","FirstName":"sortFirstNameAsc","Title":"sortJobTitleAsc","UserRole":"sortUserRoleAsc"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];       
        var page = 1;
        helper.sortBy(component, event, fieldNameToBeSorted,page,sortFieldCompName);
        
    },
    sortFieldsMobile: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        var isApply = event.getParam('isApply');
        var fieldNameToBeSorted = event.getParam('fieldNameToBeSorted');
        if(isApply){
            component.set("v.lastSortField",fieldNameToBeSorted);
            var orderToBeSorted = event.getParam('orderToBeSorted');
            var fieldItagsWithAuraAttrMap = '{"LastName":"sortLastNameAsc","FirstName":"sortFirstNameAsc","Title":"sortJobTitleAsc","UserRole":"sortUserRoleAsc"}';
            var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
            var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted]; 
            if(orderToBeSorted === "DESC"){
                component.set("v."+sortFieldCompName,true); 
            }else{
                component.set("v."+sortFieldCompName,false); 
            }
            var page = 1;
            helper.sortBy(component, event, fieldNameToBeSorted,page,sortFieldCompName);
        }else{
            if(device != "DESKTOP"){ 
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
            } 
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
            var cmpTarget = component.find(divId);
            $A.util.toggleClass(cmpTarget,'slds-is-open');
            var iconElement = selectedItem.getAttribute("id");
            
            var myLabel = component.find(iconElement).get("v.iconName");
            
            if(myLabel=="utility:chevronright"){
                component.find(iconElement).set("v.iconName","utility:chevrondown");
                var page = 1;
                helper.getAccountTeamMembers(component,page,event,component.get('v.sortField'),component.get('v.sortOrder'));
            }else if(myLabel=="utility:chevrondown"){
                component.find(iconElement).set("v.iconName","utility:chevronright");
            }
        }
        
    },
    addSelectedUserToAccountTeam : function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
        }        
        var myLabel = component.find('utilityToggle').get("v.iconName");
        if(myLabel=="utility:chevronright"){
            var cmpTarget = component.find('Account_Team');
            $A.util.toggleClass(cmpTarget,'slds-is-open');
            component.find('utilityToggle').set("v.iconName","utility:chevrondown");
        }
        var userId = event.getParam('selectedUserData').Id;
        helper.insertRemoveAccountTeamMembers(component, event,userId,'Insert');
    },
    confirmDelete: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
        }
        var deleteAcc = component.find('AccountTeam');
        var userID = component.get('v.AccountTeamId');
        for(var i in deleteAcc){
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }
        helper.insertRemoveAccountTeamMembers(component, event,userID,'Delete');
    },
    confirmCancel: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
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
        var deleteAcc = component.find('AccountTeam');
        for(var i in deleteAcc){
            $A.util.removeClass(deleteAcc[i], 'slds-show');
            $A.util.addClass(deleteAcc[i], 'slds-hide');
        }
    },
    removeRecords: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");
        }
        var userID = event.getParam('AccountTeamId');
        component.set('v.AccountTeamId',userID);
        var deleteAcc = component.find('AccountTeam');
        for(var i in deleteAcc){
            $A.util.removeClass(deleteAcc[i], 'slds-hide');
            $A.util.addClass(deleteAcc[i], 'slds-show');
        }
    },
    pageChange: function(component, event, helper) {
        if(!event.getParam('ModalPagination')){
            var page = component.get("v.page") || 1;
            var direction = event.getParam("direction");
            page = direction === "previous" ? (page - 1) : (page + 1);
            setTimeout(function(){ 
                var focusInputField = component.find("focusInputField");
                $A.util.removeClass(focusInputField, 'slds-hide');            	 
                focusInputField.focus();
                $A.util.addClass(focusInputField, 'slds-hide');
                
            }, 600);
            helper.getAccountTeamMembers(component,page,event,component.get('v.sortField'),component.get('v.sortOrder'));
        }  
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