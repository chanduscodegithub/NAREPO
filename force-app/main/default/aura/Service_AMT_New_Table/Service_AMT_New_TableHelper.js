({
	getServiceAMTRecords : function(component, event, columnName, sortType) {
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        /*component.find('addBtn').set("v.disabled", false);
        component.find('editBtn').set("v.disabled", false);
        $A.util.addClass(component.find("saveBtn"), 'slds-hide');
        $A.util.addClass(component.find("cancelBtn"), 'slds-hide');*/

        columnName = columnName || 'Last_Name__c';
        sortType = sortType || 'ASC';
        
        var action = component.get("c.getServiceAMTData");
        
        action.setParams({'accId' : component.get("v.recordId"),
                          'columnName' : columnName,
                          'sortType' : sortType,
                         });
        
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    var responseList = response.getReturnValue();
                    component.set('v.ServiceAMTList', responseList.serviceAMTRecords);
                    component.set('v.userRolePLValues', responseList.roleValues1);
                    component.set('v.contactRolePLValues', responseList.roleValues2);
                                  
                    if((responseList.serviceAMTRecords == null) || (responseList.serviceAMTRecords != null && 
                        	responseList.serviceAMTRecords.length == 0)) {
                        /*if(isLoggedInUserRoleVal) { 
                        	$A.util.addClass(component.find("editBtn"), 'slds-hide'); 
                        }*/
                        component.set('v.ServiceAMTEmptyList', true);
                    } else {
                        /*if(isLoggedInUserRoleVal) {
                        	if($A.util.hasClass(component.find("editBtn"), 'slds-hide')) {
                        		$A.util.removeClass(component.find("editBtn"), 'slds-hide');   
                        	}   
                        }*/
                        component.set('v.ServiceAMTEmptyList', false);
                    }
                } else {
                    /*if(isLoggedInUserRoleVal) {
                    	$A.util.addClass(component.find("editBtn"), 'slds-hide');    
                    }*/
                    component.set('v.ServiceAMTEmptyList', true);
                }
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                
                var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        		if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
                    if(operationVal != null && operationVal == 'deleteOperation') {
                        $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
                        $A.util.removeClass(component.find("sortEdit"), 'hide');
                        $A.util.addClass(component.find("saveCancel"), 'hide');
                    } else {
                        $A.util.removeClass(component.find("action-bar-mobile"),'slds-hide');
                    }
                    var iOS = parseFloat(
                        ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
                        .replace('undefined', '3_2').replace('_', '.').replace('_', '')) || false;
                    
                    if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11) {              
                        $A.util.addClass(component.find('saveCancel'),'iosBottom');
                        $A.util.addClass(component.find('sortEdit'),'iosBottom');
                        $A.util.addClass(component.find('NationalAccountSalesTeam'),'ipadBottomIos');
                    } else {
                        $A.util.addClass(component.find('NationalAccountSalesTeam'),'ipadbottom');
                    }
                    $A.util.addClass(component.find('NationalAccountSalesTeam'),'slds-is-open');
                }
            } else if (state === "ERROR") {
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                var errors = response.getError();
                if (errors) {
                    component.set('v.ServiceAMTList', []);
                    component.set('v.ServiceAMTEmptyList', true);
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i=0;i<ErrorMessage.length;i++) {
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    console.log("Unknown error");
                }
            }
            if($A.get("$Browser.isIOS")) {
                $A.util.addClass(component.find('articleScroll'),'cScroll-table');
            }
        });
        $A.enqueueAction(action);
    },
    
    sortBy : function(component, event, columnName, page, sortFieldComp){
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var action = component.get("c.getServiceAMTData");
        
        if(component.get("v."+sortFieldComp) ===  true){
            action.setParams({"accId" : component.get('v.recordId'),
                              "pageNumber": page,
                              "columnName" : columnName,
                              "sortType" : 'DESC'    
                             });    
            component.set("v.sortOrder", 'DESC');
            component.set("v.sortField", columnName);
            component.set("v."+sortFieldComp, false);
        }else{
            action.setParams({"accId" : component.get('v.recordId'),
                              "pageNumber": page,
                              "columnName" : columnName,
                              "sortType" : 'ASC'    
                             });    
            component.set("v.sortOrder", 'ASC');
            component.set("v.sortField", columnName);
            component.set("v."+sortFieldComp, true);
        }
        
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    var responseList = response.getReturnValue();
                    component.set('v.ServiceAMTList', responseList.serviceAMTRecords);
                    if((responseList.serviceAMTRecords == null) || (responseList.serviceAMTRecords != null && responseList.serviceAMTRecords.length == 0)) {
                        component.set('v.ServiceAMTEmptyList', true);
                    } else {
                        component.set('v.ServiceAMTEmptyList', false);
                    }
                } else {
                    component.set('v.ServiceAMTEmptyList', true);
                }
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
            } else if (state === "ERROR") {
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                var errors = response.getError();
                if (errors) {
                    component.set('v.ServiceAMTList', []);
                    component.set('v.ServiceAMTEmptyList', true);
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i=0;i<ErrorMessage.length;i++) {
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    console.log("Unknown error");
                }
            }
            if($A.get("$Browser.isIOS")) {
                $A.util.addClass(component.find('articleScroll'),'cScroll-table');
            }
        });
        $A.enqueueAction(action);
        
    },
    
    modalGenericClose : function(component) {
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []);
        }else{
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []);
            component.set("v.scrollStyleForDevice","@media screen and (min-width: 320px) and (max-width: 1199px){.panel-content.scrollable{overflow-y: hidden !important;-webkit-overflow-scrolling: auto !important ;}}");
        }
    },
    
    addRecords : function(component, event, sObject, isUser){
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var action = null;
        
       
            action = component.get("c.createUserServiceAMTRecord");    
       
        
        action.setParams({
            "accId" : component.get('v.recordId'),
            "objForCreation" : sObject
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
                if(response.getReturnValue() != null) {
                    var responseList = response.getReturnValue();
                    component.set('v.ServiceAMTList', responseList.serviceAMTRecords);
                    if((responseList.serviceAMTRecords == null) || (responseList.serviceAMTRecords != null && responseList.serviceAMTRecords.length == 0)) {
                        component.set('v.ServiceAMTEmptyList', true);
                    } else {
                        component.set('v.ServiceAMTEmptyList', false);
                        this.editFields(component, event);
                    }
                }
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                $A.util.addClass(component.find('Service_AMT'),'slds-is-open');
            }
        });
        
        $A.enqueueAction(action);
    },
    
    deleteRecords : function(component, event){
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        var action = component.get('c.deleteRecords');
        
        action.setParams({"accId" : component.get('v.recordId'),
                          "recordId" : component.get('v.recIdToDelete')});
        
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
                if(response.getReturnValue() != null) {
                    var responseList = response.getReturnValue();
                    component.set('v.ServiceAMTList', responseList.serviceAMTRecords);
                    if((responseList.serviceAMTRecords == null) || (responseList.serviceAMTRecords != null && responseList.serviceAMTRecords.length == 0)) {
                        component.set('v.ServiceAMTEmptyList', true);
                    } else {
                        component.set('v.ServiceAMTEmptyList', false);
                    }
                }
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
            }
        });
        $A.enqueueAction(action);
    },
    
    editFields : function(component, event) {
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
            $A.util.addClass(component.find("sortEdit"), 'hide');
        	$A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
            $A.util.removeClass(component.find("saveCancel"), 'hide');
        } else {
            component.find('addBtn').set("v.disabled", true);
            component.find('editBtn').set("v.disabled", true);
            $A.util.removeClass(component.find("saveBtn"), 'slds-hide');
            $A.util.removeClass(component.find("cancelBtn"), 'slds-hide');
        }
        
        var childCmp = component.find("childComponent");
        if(childCmp != null && childCmp != undefined) {
            if(Array.isArray(childCmp)) {
                for(var i=0;i<childCmp.length;i++) {
                    childCmp[i].editFields();
                } 
            } else {
                childCmp.editFields();
            }
        }
        
        $A.util.addClass(spinner1, 'slds-hide');
        $A.util.addClass(spinner2, 'slds-hide');
        $A.util.removeClass(appletIcon, 'slds-hide');
    },
    
    cancelChanges : function(component, event){
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        component.find('addBtn').set("v.disabled", false);
        component.find('editBtn').set("v.disabled", false);
        $A.util.addClass(component.find("saveBtn"), 'slds-hide');
        $A.util.addClass(component.find("cancelBtn"), 'slds-hide');
        
        var childCmp = component.find("childComponent");
        if(childCmp != null && childCmp != undefined) {
            if(Array.isArray(childCmp)) {
                for(var i=0;i<childCmp.length;i++) {
                    childCmp[i].editFields(true);
                } 
            } else {
                childCmp.editFields(true);
            }
        }
        
        $A.util.addClass(spinner1, 'slds-hide');
        $A.util.addClass(spinner2, 'slds-hide');
        $A.util.removeClass(appletIcon, 'slds-hide');
        $A.util.addClass(component.find('Service_AMT'),'slds-is-open');
        
        this.getServiceAMTRecords(component, event);
    },
    
    removeConsultant : function(component, event) {
        var deleteAcc = component.find('confirmDeleteRecord');
        for(var i in deleteAcc){
            $A.util.removeClass(deleteAcc[i], 'slds-hide');
            $A.util.addClass(deleteAcc[i], 'slds-show');
        }
    },
    
    checkForDateValidation : function(component, event, cmAccountTeamHistoryObj, isStartdateRecordVal, isOnlyEndDate) {
        
        var promptMsgList = component.find('promptMessageForDateFields');
        for(var i=0;i<promptMsgList.length;i++) {
            $A.util.removeClass(promptMsgList[i], 'slds-hide');
            $A.util.removeClass(promptMsgList[i], 'slds-hide');
        }
        
        if(isStartdateRecordVal != null && isStartdateRecordVal != undefined && isStartdateRecordVal == true) {
            component.set('v.promptMessageText','The Case Management End Date cannot be earlier than the Case Management Start Date.');
        } else if(isOnlyEndDate != null && isOnlyEndDate != undefined && isOnlyEndDate == true) {
            component.set('v.promptMessageText','Only Case Management End Date cannot be given');   
        }
    },
    
    saveRecords : function(component, event){
        console.log('hello');
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        var updatedRecords = component.get('v.ServiceAMTList');
        console.log('updatedRecords >>> '+updatedRecords);
        if(updatedRecords.length > 0){
            var action = component.get('c.updateServiceAMTRecords');
            action.setParams({'accId' : component.get('v.recordId'),
                              'objToUpdate' : updatedRecords});
            action.setCallback(this, function(response){
               var state = response.getState();
                if(state === 'SUCCESS'){
                    $A.util.addClass(spinner1, 'slds-hide');
                    $A.util.addClass(spinner2, 'slds-hide');
                    $A.util.removeClass(appletIcon, 'slds-hide');
                    this.cancelChanges(component, event);
                }
            });
            $A.enqueueAction(action);
            
        }
    }
})