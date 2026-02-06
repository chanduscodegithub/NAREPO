({
    getServiceAMTRecords: function (component, event, columnName, sortType) {
       
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        columnName = columnName || 'Last_Name__c';
        sortType = sortType || 'ASC';
        var action = component.get("c.getServiceAMTData");
        
        action.setParams({
            'accId': component.get("v.recordId"),
            'columnName': columnName,
            'sortType': sortType
        });
        
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state == "SUCCESS") {
                if (response.getReturnValue() != null) {
                    var responseList = response.getReturnValue();
                    let backupActiveAMTList = {};
                    for(let i=0; i<responseList.activeAMTList.length;i++){
                        backupActiveAMTList[responseList.activeAMTList[i].Id] = Object.assign({},responseList.activeAMTList[i]);
                    }
                    
                    component.set('v.backupActiveAMTList', backupActiveAMTList);
                    component.set('v.PoliciesList', responseList.PolicyId);
                    // Added null check - Case:2216 -- START
                    if (responseList.PolicyId != undefined && responseList.PolicyId != null &&
                        responseList.PolicyId.length > 0) {
                        component.set('v.accId', responseList.PolicyId[0].Company__c);
                        component.set('v.policyId', responseList.PolicyId[0].Id);
                    }
                    // Added null check - Case:2216 -- END
                    component.set('v.isPolicyAMT', responseList.PolicyAmtApplet);
                    // component.set('v.ServiceAMTList', []);
                    //component.set('v.ServiceAMTList', responseList.serviceAMTRecords);
                    component.set('v.activeAMTList', responseList.activeAMTList);
                    component.set('v.inActiveAMTList', responseList.inActiveAMTList);
                    console.log(responseList.activeAMTList);
                    console.log(responseList.inActiveAMTList);
                    component.set('v.ExternalServiceAMTList', responseList.externalServiceAMTRecords);
                    component.set('v.userRolePLValues', responseList.roleValues1);
                    component.set('v.contactRolePLValues', responseList.roleValues2);
                   
                    
                    if ((responseList.activeAMTList == null) || (responseList.activeAMTList != null &&
                                                                 responseList.activeAMTList.length == 0)) {
                        /*if(isLoggedInUserRoleVal) { 
                            $A.util.addClass(component.find("editBtn"), 'slds-hide'); 
                        }*/
                        component.set('v.isActiveAMTEmptyList', true);
                        $A.util.removeClass(component.find('editBtn'), 'slds-show');
                        $A.util.addClass(component.find('editBtn'), 'slds-hide');
                        
                    } else {
                        /*if(isLoggedInUserRoleVal) {
                            if($A.util.hasClass(component.find("editBtn"), 'slds-hide')) {
                                $A.util.removeClass(component.find("editBtn"), 'slds-hide');   
                            }   
                        }*/
                        component.set('v.isActiveAMTEmptyList', false);
                        $A.util.removeClass(component.find('editBtn'), 'slds-hide');
                        $A.util.addClass(component.find('editBtn'), 'slds-show');
                        
                        
                    }
                    if ((responseList.inActiveAMTList == null) || (responseList.inActiveAMTList != null &&
                                                                   responseList.inActiveAMTList.length == 0)) {
                        /*if(isLoggedInUserRoleVal) { 
                            $A.util.addClass(component.find("editBtn"), 'slds-hide'); 
                        }*/
                        component.set('v.isInactiveAMTEmptyList', true);
                        
                        
                    } else {
                        /*if(isLoggedInUserRoleVal) {
                            if($A.util.hasClass(component.find("editBtn"), 'slds-hide')) {
                                $A.util.removeClass(component.find("editBtn"), 'slds-hide');   
                            }   
                        }*/
                        component.set('v.isInactiveAMTEmptyList', false);
                        
                        
                        
                    }
                    
                    
                } else {
                    /*if(isLoggedInUserRoleVal) {
                        $A.util.addClass(component.find("editBtn"), 'slds-hide');    
                    }*/
                    component.set('v.ServiceAMTEmptyList', true);
                    component.set('v.isActiveAMTEmptyList', true);
                    component.set('v.isInactiveAMTEmptyList', true);
                }
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                if ((component.get('v.ServiceAMTEmptyList')) || (component.get('v.isActiveAMTEmptyList'))) {
                    $A.util.removeClass(component.find("saveCancel"), 'hide');
                    $A.util.addClass(component.find("saveCancel"), 'show');
                }
                
                //var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
                var device = $A.get("$Browser.formFactor");
                if (device != "DESKTOP") {
                    $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
                    $A.util.removeClass(component.find("sortEdit"), 'hide');
                    $A.util.addClass(component.find("saveCancel"), 'hide');
                    
                    var iOS = parseFloat(
                        ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0, ''])[1])
                        .replace('undefined', '3_2').replace('_', '.').replace('_', '')) || false;
                    
                    if ($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11) {
                        $A.util.addClass(component.find('saveCancel'), 'iosBottom');
                        $A.util.addClass(component.find('sortEdit'), 'iosBottom');
                        $A.util.addClass(component.find('NationalAccountSalesTeam'), 'ipadBottomIos');
                    } else {
                        $A.util.addClass(component.find('NationalAccountSalesTeam'), 'ipadbottom');
                    }
                    $A.util.addClass(component.find('NationalAccountSalesTeam'), 'slds-is-open');
                }
            } else if (state === "ERROR") {
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                var errors = response.getError();
                if (errors) {
                    //component.set('v.ServiceAMTList', []);
                    //component.set('v.ServiceAMTEmptyList', true);
                    component.set('v.isActiveAMTEmptyList', true);
                    component.set('v.isInactiveAMTEmptyList', true);
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage', errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for (var i = 0; i < ErrorMessage.length; i++) {
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    console.log("Unknown error");
                }
            }
            if ($A.get("$Browser.isIOS")) {
                $A.util.addClass(component.find('articleScroll'), 'cScroll-table');
            }
        });
        $A.enqueueAction(action);
    },
    
    sortBy: function (component, event, columnName, page, sortFieldComp) {
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var action = component.get("c.getServiceAMTData");
        
        if (component.get("v." + sortFieldComp) === true) {
            action.setParams({
                "accId": component.get('v.recordId'),
                "pageNumber": page,
                "columnName": columnName,
                "sortType": 'DESC'
            });
            component.set("v.sortOrder", 'DESC');
            component.set("v.sortField", columnName);
            component.set("v." + sortFieldComp, false);
        } else {
            action.setParams({
                "accId": component.get('v.recordId'),
                "pageNumber": page,
                "columnName": columnName,
                "sortType": 'ASC'
            });
            component.set("v.sortOrder", 'ASC');
            component.set("v.sortField", columnName);
            component.set("v." + sortFieldComp, true);
        }
        
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state == "SUCCESS") {
                if (response.getReturnValue() != null) {
                    var responseList = response.getReturnValue();
                    //component.set('v.ServiceAMTList', responseList.serviceAMTRecords);
                    //alert('ServiceAMTList'+JSON.stringify(responseList.serviceAMTRecords));
                    /* if ((responseList.serviceAMTRecords == null) || (responseList.serviceAMTRecords != null && responseList.serviceAMTRecords.length == 0)) {
                        component.set('v.ServiceAMTEmptyList', true);
                    }
                    else {
                        component.set('v.ServiceAMTEmptyList', false);
                    }*/
                    
                    //----------------------------------------------SAMARTH----------------------------------------------
                    if (component.get('v.selTabId') == 'one') {
                        console.log('responseList.activeAMTList---',responseList.activeAMTList);
                        component.set('v.activeAMTList', responseList.activeAMTList);
                        if ((responseList.activeAMTList == null) || (responseList.activeAMTList != null && responseList.activeAMTList.length == 0)) {
                            component.set('v.isActiveAMTEmptyList', true);
                        }
                        else {
                            component.set('v.isActiveAMTEmptyList', false);
                        }
                    }
                    else if (component.get('v.selTabId') == 'two') {
                        component.set('v.inActiveAMTList', responseList.inActiveAMTList);
                        if ((responseList.inActiveAMTList == null) || (responseList.inActiveAMTList != null && responseList.inActiveAMTList.length == 0)) {
                            component.set('v.isInactiveAMTEmptyList', true);
                        }
                        else {
                            component.set('v.isInactiveAMTEmptyList', false);
                        }
                    }
                    //----------------------------------------------SAMARTH----------------------------------------------
                }
                else {
                    component.set('v.ServiceAMTEmptyList', true);
                    //-----------------SAMARTH-----------------
                    component.set('v.isActiveAMTEmptyList', true);
                    component.set('v.isInactiveAMTEmptyList', true);
                    //-----------------SAMARTH-----------------
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
                    //component.set('v.ServiceAMTList', []);
                    component.set('v.ServiceAMTEmptyList', true);
                    component.set('v.isActiveAMTEmptyList', true);
                    component.set('v.isInactiveAMTEmptyList', true);
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage', errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for (var i = 0; i < ErrorMessage.length; i++) {
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    console.log("Unknown error");
                }
            }
            if ($A.get("$Browser.isIOS")) {
                $A.util.addClass(component.find('articleScroll'), 'cScroll-table');
            }
        });
        $A.enqueueAction(action);
        
    },
    
    modalGenericClose: function (component) {
        var device = $A.get("$Browser.formFactor");
        if (device == "DESKTOP") {
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []);
        } else {
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []);
            component.set("v.scrollStyleForDevice", "@media screen and (min-width: 320px) and (max-width: 1199px){.panel-content.scrollable{overflow-y: hidden !important;-webkit-overflow-scrolling: auto !important ;}}");
        }
    },
    
    addRecords: function (component, event, sObject, isUser) {
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var action = null;
        
        
        action = component.get("c.createUserServiceAMTRecord");
        
        
        action.setParams({
            "accId": component.get('v.recordId'),
            "objForCreation": sObject
        });
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                if (response.getReturnValue() != null) {
                    var responseList = response.getReturnValue();
                    component.set('v.activeAMTList', responseList.activeAMTList);
                    let backupActiveAMTList = {};
                    for(let i=0; i<responseList.activeAMTList.length;i++){
                        backupActiveAMTList[responseList.activeAMTList[i].Id] = Object.assign({},responseList.activeAMTList[i]);
                    }
                    console.log(' updated backupActiveAMTList on add');
                    console.log(backupActiveAMTList);
                    component.set('v.backupActiveAMTList', backupActiveAMTList);
                    if ((responseList.activeAMTList == null) || (responseList.activeAMTList != null && responseList.activeAMTList.length == 0)) {
                        component.set('v.ServiceAMTEmptyList', true);
                        component.set('v.isActiveAMTEmptyList', true);
                        //component.set('v.isInactiveAMTEmptyList', true);
                        $A.util.removeClass(component.find('saveBtn'), 'slds-show');
                        $A.util.removeClass(component.find('cancelBtn'), 'slds-show');
                        
                        $A.util.addClass(component.find('saveBtn'), 'slds-hide');
                        $A.util.addClass(component.find('cancelBtn'), 'slds-hide');
                        //$A.util.removeClass(component.find('editBtn'),'slds-show');
                        //$A.util.addClass(component.find('editBtn'),'slds-hide');
                        
                    } else {
                        component.set('v.ServiceAMTEmptyList', false);
                        component.set('v.isActiveAMTEmptyList', false);
                        //component.set('v.isInactiveAMTEmptyList', true);
                        $A.util.removeClass(component.find('saveBtn'), 'slds-hide');
                        // $A.util.removeClass(component.find('cancelBtn'), 'slds-hide');
                        
                        $A.util.addClass(component.find('saveBtn'), 'slds-show');
                        //$A.util.addClass(component.find('cancelBtn'), 'slds-show');
                        
                        //$A.util.removeClass(component.find('editBtn'),'slds-hide');
                        //$A.util.addClass(component.find('editBtn'),'slds-show');
                        // component.find('editBtn').set("v.disabled", true);
                        
                        component.set('v.fromAddNewUser', true);
                        
                        this.editFieldsOnAddNewRecord(component, event);
                    }
                }
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                $A.util.addClass(component.find('Service_AMT'), 'slds-is-open');
            }
        });
        
        $A.enqueueAction(action);
    },
    
    editFieldsOnAddNewRecord : function(component,event){
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        
        var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if (isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
            component.find('editBtn').set("v.disabled", true);
            $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
            $A.util.removeClass(component.find("saveCancel"), 'hide');
        } else {
            component.find('addBtn').set("v.disabled", true);
            component.find('editBtn').set("v.disabled", true);
            $A.util.removeClass(component.find("saveBtn"), 'slds-hide');
            // $A.util.removeClass(component.find("cancelBtn"), 'slds-hide');
        }
        
        var childCmp = component.find("childComponent");
        console.log('childCmp---',childCmp);
        //if(component.get('v.selTabId') == 'one'){ //Samarth
        if (childCmp != null && childCmp != undefined) {
            if (Array.isArray(childCmp)) {
                for (var i = 0; i < childCmp.length; i++) {
                    childCmp[i].editFields();
                }
            } else {
                childCmp.editFields();
            }
        }
        //} //Samarth
        
        $A.util.addClass(spinner1, 'slds-hide');
        $A.util.addClass(spinner2, 'slds-hide');
        $A.util.removeClass(appletIcon, 'slds-hide');
        
    },
    
    deleteRecords: function (component, event) {
        //debugger;
        
        var action = component.get('c.deleteRecords');
        
        action.setParams({
            "accId": component.get('v.recordId'),
            "recordId": component.get('v.recIdToDelete')
        });
        
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                debugger;
                if (response.getReturnValue() != null) {
                    var responseList = response.getReturnValue();
                    component.set('v.activeAMTList', responseList.activeAMTList);
                    let backupActiveAMTList = {};
                    for(let i=0; i<responseList.activeAMTList.length;i++){
                        backupActiveAMTList[responseList.activeAMTList[i].Id] = Object.assign({},responseList.activeAMTList[i]);
                    }
                    console.log(' updated backupActiveAMTList on delete');
                    console.log(backupActiveAMTList);
                    component.set('v.backupActiveAMTList', backupActiveAMTList);
                    /* component.set('v.ServiceAMTList', responseList.serviceAMTRecords);
                    if ((responseList.ServiceAMTList == null) || (responseList.ServiceAMTList != null && responseList.ServiceAMTList.length == 0)) {
                        component.set('v.ServiceAMTEmptyList', true);
                    }*/
                    if ((responseList.activeAMTList == null) || (responseList.activeAMTList != null && responseList.activeAMTList.length == 0)) {
                        //component.set('v.ServiceAMTEmptyList', true);
                        component.set('v.isActiveAMTEmptyList', true);
                        //component.set('v.isInactiveAMTEmptyList', true);
                        $A.util.removeClass(component.find("editBtn"), 'slds-show');
                        $A.util.addClass(component.find("editBtn"), 'slds-hide');
                        
                    } else {
                        component.set('v.ServiceAMTEmptyList', false);
                        component.set('v.isActiveAMTEmptyList', false);
                        //component.set('v.isInactiveAMTEmptyList', true);
                        $A.util.removeClass(component.find("editBtn"), 'slds-hide');
                        $A.util.addClass(component.find("editBtn"), 'slds-show');
                    }
                }
                $A.util.addClass(component.find("spinner"), 'slds-hide');
                $A.util.addClass(component.find("spinner1"), 'slds-hide');
                $A.util.removeClass(component.find("appletIcon"), 'slds-hide');
            }
        });
        $A.enqueueAction(action);
    },
    
    editFields: function (component, event) {
        console.log('Inside Helper Edit Method');
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        
        var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if (isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
            component.find('editBtn').set("v.disabled", true);
            $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
            $A.util.removeClass(component.find("saveCancel"), 'hide');
        } else {
            component.find('addBtn').set("v.disabled", true);
            component.find('editBtn').set("v.disabled", true);
            $A.util.removeClass(component.find("saveBtn"), 'slds-hide');
            $A.util.removeClass(component.find("cancelBtn"), 'slds-hide');
        }
        
        var childCmp = component.find("childComponent");
        
        //if(component.get('v.selTabId') == 'one'){ //Samarth
        if (childCmp != null && childCmp != undefined) {
            if (Array.isArray(childCmp)) {
                for (var i = 0; i < childCmp.length; i++) {
                    childCmp[i].editFields();
                }
            } else {
                childCmp.editFields();
            }
        }
        //} //Samarth
        
        $A.util.addClass(spinner1, 'slds-hide');
        $A.util.addClass(spinner2, 'slds-hide');
        $A.util.removeClass(appletIcon, 'slds-hide');
    },
    
    cancelChanges: function (component, event) {
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        component.find('addBtn').set("v.disabled", false);
        component.find('editBtn').set("v.disabled", false);
        $A.util.removeClass(component.find("saveBtn"), 'slds-show');
        $A.util.removeClass(component.find("cancelBtn"), 'slds-show');
        
        $A.util.addClass(component.find("saveBtn"), 'slds-hide');
        $A.util.addClass(component.find("cancelBtn"), 'slds-hide');
        
        var childCmp = component.find("childComponent");
        
        if (childCmp != null && childCmp != undefined) {
            if (Array.isArray(childCmp)) {
                for (var i = 0; i < childCmp.length; i++) {
                    childCmp[i].cancelFields(true);
                }
            } else {
                childCmp.cancelFields(true);
            }
        }
        
        $A.util.addClass(spinner1, 'slds-hide');
        $A.util.addClass(spinner2, 'slds-hide');
        $A.util.removeClass(appletIcon, 'slds-hide');
        $A.util.addClass(component.find('Service_AMT'), 'slds-is-open');
        this.getServiceAMTRecordsOnLoad(component, event);//getServiceAMTRecords
    },
    
    removeConsultant: function (component, event) {
        var deleteAcc = component.find('confirmDeleteRecord');
        for (var i in deleteAcc) {
            $A.util.removeClass(deleteAcc[i], 'slds-hide');
            $A.util.addClass(deleteAcc[i], 'slds-show');
        }
    },
    
    checkForDateValidation: function (component, event, cmAccountTeamHistoryObj, isStartdateRecordVal, isOnlyEndDate, isStartDatechanged, isEndDateChanged, isRoleEmpty,accountHavePolicy,service_AMT_Record_List,mapOfValues) {
        var promptMsgList = component.find('promptMessageForDateFields');
        for (var i = 0; i < promptMsgList.length; i++) {
            $A.util.removeClass(promptMsgList[i], 'slds-hide');
            $A.util.removeClass(promptMsgList[i], 'slds-hide');
        }
        var emsg="One or more of the AMT members is missing policy information. Please ensure that all AMT members have at least one policy assigned to them. Refer to the fields highlighted in yellow for missing information."+'<br/><br/>'+"The role field is mandatory. Please make sure to select a role for each AMT member listed. Refer to the fields highlighted in yellow for missing information.";
        //alert(emsg)
        // component.set('v.highlightRow','green');
        /*Added If Condition to throw error message when user do not select primary role for two same role ****SHRUTI**** */
       /* console.log('mapOfValues----->',mapOfValues);
       if(Object.keys(mapOfValues).some(key => mapOfValues[key].length >1 && mapOfValues[key].every(value => value === false))){
            component.set('v.promptMessageText', 'There are two or more members with same role, please flag one AMT member as a main for this role.');  
            component.set('v.activeAMTList', service_AMT_Record_List);
            console.log('Record Details On Check Data Validation--->'+component.get('v.activeAMTList'));
            return;
        }*/
        /******SHRUTI******END*******/
        if(isRoleEmpty == true && accountHavePolicy == false){  
            component.set('v.promptMessageText',emsg);
            return;
        }
        
        if(isRoleEmpty == true){
            component.set('v.promptMessageText', 'The role field is mandatory. Please make sure to select a role for each AMT member listed. Refer to the fields highlighted in yellow for missing information.');  
            component.set('v.activeAMTList', service_AMT_Record_List);
            return;
        }
        
        if(accountHavePolicy == false){
            component.set('v.promptMessageText', 'One or more of the AMT members is missing policy information. Please ensure that all AMT members have at least one policy assigned to them. Refer to the fields highlighted in yellow for missing information.');  
            return;
        }
        
        if (isStartdateRecordVal != null && isStartdateRecordVal != undefined && isStartdateRecordVal == true) {
            component.set('v.promptMessageText', $A.get("$Label.c.AMTEndDateCannotBeEarlierthanStartDate"));
            return;
        } else if (isOnlyEndDate != null && isOnlyEndDate != undefined && isOnlyEndDate == true) {
            component.set('v.promptMessageText', $A.get("$Label.c.AMTStartAndEndDateMandatoryBeforeSaving"));
            return;
        }
        
        
        if (isStartDatechanged != null && isStartDatechanged != undefined && isStartDatechanged == true) {
            component.set('v.promptMessageText', $A.get("$Label.c.AMTStartDateFormatValidation"));
            return;
        } else if (isEndDateChanged != null && isEndDateChanged != undefined && isEndDateChanged == true) {
            component.set('v.promptMessageText', $A.get("$Label.c.AMTEndDateNotValid"));
            return;
        }
        
        
        
    },
    checkpolicy: function (component, event, ispolicynull) {
        var promptMsgList = component.find('promptMessageForDateFields');
        for (var i = 0; i < promptMsgList.length; i++) {
            $A.util.removeClass(promptMsgList[i], 'slds-hide');
            $A.util.removeClass(promptMsgList[i], 'slds-hide');
        }
        if (ispolicynull == null) {
            component.set('v.promptMessageText', 'The Policy field cannot be empty. Please Select a value.');
        }
    },
    
    saveRecords: function (component, event) {
        $A.util.removeClass(component.find("saveBtn"), 'slds-show');
        $A.util.removeClass(component.find("cancelBtn"), 'slds-show');
        
        $A.util.addClass(component.find("saveBtn"), 'slds-hide');
        $A.util.addClass(component.find("cancelBtn"), 'slds-hide');
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        //------------------------------SAMARTH------------------------------
        //var updatedRecords = component.get('v.ServiceAMTList');
        var updatedRecords = component.get('v.activeAMTList');
        //------------------------------SAMARTH------------------------------
        
        
        let recordsToUpdate=[];
        let backupActiveAMTList = component.get("v.backupActiveAMTList");
        console.table(updatedRecords);
        console.table(backupActiveAMTList);
        
        for(let i =0; i<updatedRecords.length; i++){
            let oldRecord = backupActiveAMTList[updatedRecords[i].Id];
            console.log(oldRecord);
            let isChanged = false;
            for(let key in updatedRecords[i]){
                
                
                if((key != 'Company__r' && key !='bgcolorRole' && key !='bgcolorPolicy' ) 
                   &&( oldRecord[key] != updatedRecords[i][key] || oldRecord[key] == undefined)){
                    console.log(key+'==> '+oldRecord[key]+' === '+ updatedRecords[i][key]);
                    isChanged = true;
                }
            }
            if(isChanged){
                delete updatedRecords[i].Company__c;
                delete updatedRecords[i].Company__r;
                recordsToUpdate.push(updatedRecords[i]);
            }
        }
        console.log('recordsToUpdate');
        console.log(recordsToUpdate);
        
        if (updatedRecords.length > 0) {
            var action = component.get('c.updateServiceAMTRecords');
            action.setParams({
                'accId': component.get('v.recordId'),
                //'objToUpdate': updatedRecords
                'objToUpdate': recordsToUpdate
            });
            action.setCallback(this, function (response) {
                var state = response.getState();
                if (state === 'SUCCESS') {
                    var device = $A.get("$Browser.formFactor");
                    if (device != "DESKTOP") {
                        $A.util.removeClass(component.find("sortEdit"), "hide");
                    }
                    $A.util.addClass(spinner1, 'slds-hide');
                    $A.util.addClass(spinner2, 'slds-hide');
                    $A.util.removeClass(appletIcon, 'slds-hide');
                    component.set("v.fromAddNewUser", false);
                    this.cancelChanges2(component, event);
                }
            });
            $A.enqueueAction(action);
            
        } else {
            
        }
    },
    
    defineSobject: function (component, event) {
        var action = component.get("c.defineSobjectType");
        //alert('accId'+component.get("v.recordId"));
        action.setParams({
            'accId': component.get("v.recordId")
        });
        action.setCallback(this, function (response) {
            var state = response.getState();
            var res = response.getReturnValue();
            if (state === 'SUCCESS') {
                component.set('v.isSalesProfile', res.isSalesProfile);
                if (res.isSalesProfile) {
                    //-----------------------SAMARTH-----------------------
                    /*component.set('v.isEditable', res.isAccountEnabled);
                    component.set('v.isEditSaveDeleteButtonsEnabled',res.isAccountEnabled);*/
                    
                    if (component.get('v.selTabId') == 'one') {
                        console.log('Entering 1 if');
                        component.set('v.isEditable', res.isAccountEnabled);
                    }
                    else if (component.get('v.selTabId') == 'two') {
                        console.log('Entering 1 else');
                        component.set('v.isEditable', false);
                    }
                    if (component.get('v.selTabId') == 'one') {
                        console.log('Entering 2 if');
                        component.set('v.isEditSaveDeleteButtonsEnabled', res.isAccountEnabled);
                    }
                    else if (component.get('v.selTabId') == 'two') {
                        console.log('Entering 2 else');
                        component.set('v.isEditSaveDeleteButtonsEnabled', false);
                    }
                    //-----------------------SAMARTH-----------------------
                }
                console.log('res.sobjectType---',res.sobjectType);
                if (res.sobjectType != 'Account') {
                    console.log('in policy object');
                    component.set('v.sobjectusedAccount', false);
                    component.set('v.roleWidth'," ");
                    component.set('v.startDateWidth',"15%");
                    component.set('v.endDateWidth',"15%");
                    component.set('v.deleteIconHeaderWidth',"0%");
                    $A.util.addClass(component.find("divToHide"), 'slds-hide');
                    //$A.util.addClass(component.find("addbtnhide"), 'slds-hide');
                    $A.util.addClass(component.find("editbtntabhide"), 'slds-hide');
                    $A.util.addClass(component.find("addBtn"), 'slds-hide');
                    console.log('last line of if');
                }
                else {
                    console.log('in account object');
                    component.set('v.roleWidth',"15%");
                    component.set('v.startDateWidth',"10%");
                    component.set('v.endDateWidth',"10%");
                    component.set('v.deleteIconHeaderWidth',"5%");
                    
                    $A.util.removeClass(component.find("divToHide"), 'slds-hide');
                    $A.util.addClass(component.find("divToHide"), 'slds-show');
                    $A.util.removeClass(component.find("addbtnhide"), 'slds-hide');
                    $A.util.addClass(component.find("addbtnhide"), 'slds-show');
                    $A.util.removeClass(component.find("editbtnhide"), 'slds-hide');
                    $A.util.addClass(component.find("editbtnhide"), 'slds-show');
                    
                }
                
            }
        });
        $A.enqueueAction(action);
        
        
    },
    
    cancelChanges2: function (component, event) {
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        if(component.get("v.sobjectusedAccount")){
            if(component.find('addBtn')){
                component.find('addBtn').set("v.disabled", false);
            }
            if(component.find('editBtn')){
                component.find('editBtn').set("v.disabled", false);
            }
        }
        
        $A.util.removeClass(component.find("saveBtn"), 'slds-show');
        $A.util.removeClass(component.find("cancelBtn"), 'slds-show');
        
        $A.util.addClass(component.find("saveBtn"), 'slds-hide');
        $A.util.addClass(component.find("cancelBtn"), 'slds-hide');
        
        var childCmp = component.find("childComponent");
        
        if (childCmp != null && childCmp != undefined) {
            if (Array.isArray(childCmp)) {
                for (var i = 0; i < childCmp.length; i++) {
                    childCmp[i].cancelFields(true);
                }
            } else {
                childCmp.cancelFields(true);
            }
        }
        
        $A.util.addClass(spinner1, 'slds-hide');
        $A.util.addClass(spinner2, 'slds-hide');
        $A.util.removeClass(appletIcon, 'slds-hide');
        this.getServiceAMTRecordsOnLoad(component, event);
    },
    
    cancelChanges3: function (component, event) {
        component.find('addBtn').set("v.disabled", false); 
    },
    
    getServiceAMTRecordsOnLoad : function(component, event){
        console.log('inside getServiceAMTRecordsOnLoad');
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
        
        columnName = 'Last_Name__c';
        sortType = 'ASC';
        //
        //alert(component.get('v.sobjectusedAccount')+'in get Amt records');
        
        
        var action = component.get("c.getServiceAMTDataOnload");
        
        action.setParams({
            'accId': component.get("v.recordId"),
            'columnName': columnName,
            'sortType': sortType
        });
        
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state == "SUCCESS") {
                if (response.getReturnValue() != null) {
                    var responseList = response.getReturnValue();
                    console.log('before policy list set');
                    component.set('v.PoliciesList', responseList.PolicyId);
                    console.log('after policy list set');
                    // Added null check - Case:2216 -- START
                    if (responseList.PolicyId != undefined && responseList.PolicyId != null &&
                        responseList.PolicyId.length > 0) {
                        component.set('v.accId', responseList.PolicyId[0].Company__c);
                        component.set('v.policyId', responseList.PolicyId[0].Id);
                    }
                    // Added null check - Case:2216 -- END
                    component.set('v.isPolicyAMT', responseList.PolicyAmtApplet);
                    // component.set('v.ServiceAMTList', []);
                    //component.set('v.ServiceAMTList', responseList.serviceAMTRecords);
                    component.set('v.activeAMTList', responseList.activeAMTList);
                    
                    
                    let backupActiveAMTList = {};
                    for(let i=0; i<responseList.activeAMTList.length;i++){
                        backupActiveAMTList[responseList.activeAMTList[i].Id] = Object.assign({},responseList.activeAMTList[i]);
                    }
                    console.log('backupActiveAMTList');
                    console.log(backupActiveAMTList);
                    
                    component.set('v.backupActiveAMTList', backupActiveAMTList);
                    
                    component.set('v.inActiveAMTList', responseList.inActiveAMTList);
                    console.log(responseList.activeAMTList);
                    console.log(responseList.inActiveAMTList);
                    component.set('v.ExternalServiceAMTList', responseList.externalServiceAMTRecords);
                    component.set('v.userRolePLValues', responseList.roleValues1);
                    component.set('v.contactRolePLValues', responseList.roleValues2);
                    //component.set('v.contactRolePLValues', responseList.roleValues2);
                    // if (component.get('v.isSalesProfile') == true) {
                    //component.set('v.width100', '14%');
                    //component.set('v.width120', '15%');
                    //component.set('v.width150', '19%');
                    //}
                    
                    if ((responseList.activeAMTList == null) || (responseList.activeAMTList != null &&
                                                                 responseList.activeAMTList.length == 0)) {
                        /*if(isLoggedInUserRoleVal) { 
                            $A.util.addClass(component.find("editBtn"), 'slds-hide'); 
                        }*/
                        component.set('v.isActiveAMTEmptyList', true);
                        $A.util.removeClass(component.find('editBtn'), 'slds-show');
                        $A.util.addClass(component.find('editBtn'), 'slds-hide');
                        
                    } else {
                        /*if(isLoggedInUserRoleVal) {
                            if($A.util.hasClass(component.find("editBtn"), 'slds-hide')) {
                                $A.util.removeClass(component.find("editBtn"), 'slds-hide');   
                            }   
                        }*/
                        component.set('v.isActiveAMTEmptyList', false);
                        $A.util.removeClass(component.find('editBtn'), 'slds-hide');
                        $A.util.addClass(component.find('editBtn'), 'slds-show');
                        
                        
                    }
                    if ((responseList.inActiveAMTList == null) || (responseList.inActiveAMTList != null &&
                                                                   responseList.inActiveAMTList.length == 0)) {
                        /*if(isLoggedInUserRoleVal) { 
                            $A.util.addClass(component.find("editBtn"), 'slds-hide'); 
                        }*/
                        component.set('v.isInactiveAMTEmptyList', true);
                        
                        
                    } else {
                        /*if(isLoggedInUserRoleVal) {
                            if($A.util.hasClass(component.find("editBtn"), 'slds-hide')) {
                                $A.util.removeClass(component.find("editBtn"), 'slds-hide');   
                            }   
                        }*/
                        component.set('v.isInactiveAMTEmptyList', false);
                        
                        
                        
                    }
                    
                    
                }else {
                    /*if(isLoggedInUserRoleVal) {
                        $A.util.addClass(component.find("editBtn"), 'slds-hide');    
                    }*/
                    component.set('v.ServiceAMTEmptyList', true);
                    component.set('v.isActiveAMTEmptyList', true);
                    component.set('v.isInactiveAMTEmptyList', true);
                }
                console.log('after onload execution');
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                if ((component.get('v.ServiceAMTEmptyList')) || (component.get('v.isActiveAMTEmptyList'))) {
                    $A.util.removeClass(component.find("saveCancel"), 'hide');
                    $A.util.addClass(component.find("saveCancel"), 'show');
                }
                
                //var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
                var device = $A.get("$Browser.formFactor");
                if (device != "DESKTOP") {
                    $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
                    $A.util.removeClass(component.find("sortEdit"), 'hide');
                    $A.util.addClass(component.find("saveCancel"), 'hide');
                    
                    var iOS = parseFloat(
                        ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0, ''])[1])
                        .replace('undefined', '3_2').replace('_', '.').replace('_', '')) || false;
                    
                    if ($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11) {
                        $A.util.addClass(component.find('saveCancel'), 'iosBottom');
                        $A.util.addClass(component.find('sortEdit'), 'iosBottom');
                        $A.util.addClass(component.find('NationalAccountSalesTeam'), 'ipadBottomIos');
                    } else {
                        $A.util.addClass(component.find('NationalAccountSalesTeam'), 'ipadbottom');
                    }
                    $A.util.addClass(component.find('NationalAccountSalesTeam'), 'slds-is-open');
                }
            } else if (state === "ERROR") {
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                var errors = response.getError();
                if (errors) {
                    //component.set('v.ServiceAMTList', []);
                    //component.set('v.ServiceAMTEmptyList', true);
                    component.set('v.isActiveAMTEmptyList', true);
                    component.set('v.isInactiveAMTEmptyList', true);
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage', errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for (var i = 0; i < ErrorMessage.length; i++) {
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    console.log("Unknown error");
                }
            }
            if ($A.get("$Browser.isIOS")) {
                $A.util.addClass(component.find('articleScroll'), 'cScroll-table');
            }
        });
        $A.enqueueAction(action);
        
    }
    
    
})