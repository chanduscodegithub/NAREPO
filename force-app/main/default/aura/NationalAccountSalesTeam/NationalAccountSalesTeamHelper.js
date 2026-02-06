({
    getUserInfo : function(component, event, operationVal) { 
    	
        var action = component.get("c.getLoggedInUerRoleInfo");
        if(action == undefined || action == null){
            return;
        }
        action.setCallback(this,function(response) {
            var state = response.getState();
            if(state == "SUCCESS") {
                component.set('v.isEditSaveDeleteButtonsEnabled', response.getReturnValue());
                var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        		if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
                	this.getCMAccountTeamHistoryData(component, event, 'onLoad');
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    getCMAccountTeamHistoryData : function(component, event, operationVal) {
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var isLoggedInUserRoleVal = component.get('v.isEditSaveDeleteButtonsEnabled');
        if(isLoggedInUserRoleVal == null || isLoggedInUserRoleVal == undefined) {
        	isLoggedInUserRoleVal = false;    
        }
        if(isLoggedInUserRoleVal) {
            component.find('addBtn').set("v.disabled", false);
        	component.find('editBtn').set("v.disabled", false);
        	$A.util.addClass(component.find("saveBtn"), 'slds-hide');
        	$A.util.addClass(component.find("cancelBtn"), 'slds-hide');
        }
        
        var action = component.get("c.getCMAccountTeamHistoryRecords");
        action.setParams({
            "accountId" : component.get('v.recordId'),
            "columnName" : 'Case_Management_End_Date__c',
            "sortType" : 'Desc',
            "operation" : operationVal
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    var responseList = response.getReturnValue();
                    component.set('v.CMAccountTeamHistoryList', responseList.cmAccountTeamHistoryList);
                    if((responseList.cmAccountTeamHistoryList == null) || (responseList.cmAccountTeamHistoryList != null && 
                        	responseList.cmAccountTeamHistoryList.length == 0)) {
                        if(isLoggedInUserRoleVal) { 
                        	$A.util.addClass(component.find("editBtn"), 'slds-hide'); 
                        }
                        component.set('v.CMAccountTeamHistoryEmptyList', true);
                        /*component.set('v.isVPCRRecordActive', false);
                        component.set('v.isRVPRecordActive', false);
                        component.set('v.isSCERecordActive', false);*/
                    } else {
                        if(isLoggedInUserRoleVal) {
                        	if($A.util.hasClass(component.find("editBtn"), 'slds-hide')) {
                        		$A.util.removeClass(component.find("editBtn"), 'slds-hide');   
                        	}   
                        }
                        component.set('v.CMAccountTeamHistoryEmptyList', false);
                        /*component.set('v.isVPCRRecordActive', responseList.vpcr);
                        component.set('v.isRVPRecordActive', responseList.rvp);
                        component.set('v.isSCERecordActive', responseList.scePlayerCoach);*/
                    }
                } else {
                    if(isLoggedInUserRoleVal) {
                    	$A.util.addClass(component.find("editBtn"), 'slds-hide');    
                    }
                    component.set('v.CMAccountTeamHistoryEmptyList', true);
                }
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                
                if(operationVal != null && operationVal == 'deleteOperation') {
                    
                    var reminderAlertForSCE = responseList.futureSCEValidationMsg;
                    reminderAlertForSCE = (reminderAlertForSCE != undefined && reminderAlertForSCE != null) ? reminderAlertForSCE : '';
                    var reminderAlertForVpcrRvp = responseList.futureVpcrRvpValidationMsg;
                    reminderAlertForVpcrRvp = (reminderAlertForVpcrRvp != undefined && reminderAlertForVpcrRvp != null) ? reminderAlertForVpcrRvp : '';
                    if(reminderAlertForSCE != '' || reminderAlertForVpcrRvp != '') {                        
                        var reminderMsg = '';                        
                        if(reminderAlertForSCE != '' && reminderAlertForVpcrRvp != '') {
                            reminderMsg = reminderAlertForSCE;
                            component.set('v.promptMessageText1', reminderAlertForVpcrRvp);
                        } else if(reminderAlertForSCE != '' && reminderAlertForVpcrRvp == '') {
                            reminderMsg = reminderAlertForSCE;
                        } else {
                            reminderMsg = reminderAlertForVpcrRvp;
                        }
                        component.set('v.promptMessageText', reminderMsg);                        
                        var promptMsgList = component.find('promptMessageForDateFields');
                        for(var i in promptMsgList) {
                            $A.util.removeClass(promptMsgList[i], 'slds-hide');
                        } 
                    }
                    
                }
                
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
                    component.set('v.CMAccountTeamHistoryList', []);
                    component.set('v.CMAccountTeamHistoryEmptyList', true);
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
    
    editCMAccountTeamHistoryRecords : function(component, event) {
        
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
    
    cancelChanges : function(component, event) {
        
        if($A.get("$Browser.isIOS")) {
            $A.util.removeClass(component.find('articleScroll'),'cScroll-table');
        }
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        component.set('v.CMAccountTeamHistoryUpdatedList', []);
        component.set('v.CMAccountTeamHistoryIdsArray', []);

        var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
            $A.util.removeClass(component.find("sortEdit"), 'hide');
            $A.util.addClass(component.find("saveCancel"), 'hide');
        } else {
            component.find('addBtn').set("v.disabled", false);
            component.find('editBtn').set("v.disabled", false);
            $A.util.addClass(component.find("saveBtn"), 'slds-hide');
        	$A.util.addClass(component.find("cancelBtn"), 'slds-hide');
        }
        
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
        
        this.getCMAccountTeamHistoryData(component, event, 'onLoad');
        
        $A.util.addClass(spinner1, 'slds-hide');
        $A.util.addClass(spinner2, 'slds-hide');
        $A.util.removeClass(appletIcon, 'slds-hide');
        $A.util.addClass(component.find('NationalAccountSalesTeam'),'slds-is-open');
    },
    
    saveCMAccountTeamHistoryRecords : function(component, event) {
        
        var cmAccountTeamHistoryListTobeUpdated = component.get("v.CMAccountTeamHistoryUpdatedList");
        var cmAccountTeamHistoryIdsArray1 = component.get("v.CMAccountTeamHistoryIdsArray");
        var cmAccountTeamHistoryList = component.get('v.CMAccountTeamHistoryList');
        if(cmAccountTeamHistoryList != null && cmAccountTeamHistoryList != undefined && 
           cmAccountTeamHistoryList.length > 0) {
            for(var i=0;i<cmAccountTeamHistoryList.length;i++) {
                if(cmAccountTeamHistoryIdsArray1 != null && 
                   cmAccountTeamHistoryIdsArray1.indexOf(cmAccountTeamHistoryList[i].Id) > -1) {
                    cmAccountTeamHistoryListTobeUpdated.push(cmAccountTeamHistoryList[i]);
                }
            }
        }
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
            $A.util.addClass(component.find("action-bar-mobile"), 'slds-hide');
        } else {
            component.find('addBtn').set("v.disabled", false);
            component.find('editBtn').set("v.disabled", false);
            $A.util.addClass(component.find("saveBtn"), 'slds-hide');
            $A.util.addClass(component.find("cancelBtn"), 'slds-hide');
        }
        
        var action = component.get("c.upsertCMAccountTeamHistoryRecords");
        action.setParams({
            "cmAccountTeamHistoryDataTobeUpserted" : cmAccountTeamHistoryListTobeUpdated,
            "accountId" : component.get('v.recordId')
        });
        action.setCallback(this,function(response) {
            
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    var responseList = response.getReturnValue();
                    component.set('v.CMAccountTeamHistoryList', responseList.cmAccountTeamHistoryList);
                    /*component.set('v.isVPCRRecordActive', responseList.vpcr);
                    component.set('v.isRVPRecordActive', responseList.rvp);
                    component.set('v.isSCERecordActive', responseList.scePlayerCoach);*/
                    component.set('v.CMAccountTeamHistoryUpdatedList', []);
                    component.set('v.CMAccountTeamHistoryIdsArray', []);
                    $A.util.addClass(spinner1, 'slds-hide');
        			$A.util.addClass(spinner2, 'slds-hide');
        			$A.util.removeClass(appletIcon, 'slds-hide');
                    /*var childCmp = component.find("childComponent");
                    if(childCmp != null && childCmp != undefined) {
                        if(Array.isArray(childCmp)) {
                            for(var i=0; i<childCmp.length; i++) {
                                childCmp[i].editFields(true);
                            } 
                        } else {
                            childCmp.editFields(true);
                        }
                    }*/
                    
                    var reminderAlertForSCE = responseList.futureSCEValidationMsg;
                    reminderAlertForSCE = (reminderAlertForSCE != undefined && reminderAlertForSCE != null) ? reminderAlertForSCE : '';
                    var reminderAlertForVpcrRvp = responseList.futureVpcrRvpValidationMsg;
                    reminderAlertForVpcrRvp = (reminderAlertForVpcrRvp != undefined && reminderAlertForVpcrRvp != null) ? reminderAlertForVpcrRvp : '';
                    if(reminderAlertForSCE != '' || reminderAlertForVpcrRvp != '') {                        
                        var reminderMsg = '';                        
                        if(reminderAlertForSCE != '' && reminderAlertForVpcrRvp != '') {
                        	reminderMsg = reminderAlertForSCE;
                            component.set('v.promptMessageText1', reminderAlertForVpcrRvp);
                        } else if(reminderAlertForSCE != '' && reminderAlertForVpcrRvp == '') {
                            reminderMsg = reminderAlertForSCE;
                        } else {
                            reminderMsg = reminderAlertForVpcrRvp;
                        }
                        component.set('v.promptMessageText', reminderMsg);                        
                        var promptMsgList = component.find('promptMessageForDateFields');
                        for(var i in promptMsgList) {
                            $A.util.removeClass(promptMsgList[i], 'slds-hide');
                        } 
                    }                                       
                }
                if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
                    $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
                    $A.util.removeClass(component.find("sortEdit"), 'hide');
                    $A.util.addClass(component.find("saveCancel"), 'hide');
                }
                
                
            } else if (state === "ERROR") {
                component.set('v.CMAccountTeamHistoryUpdatedList', []);
                component.set('v.CMAccountTeamHistoryIdsArray', []);
                component.set('v.CMAccountTeamHistoryList', component.get('v.CMAccountTeamHistoryList'));
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
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
                var errors = response.getError();
                if (errors) {
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
    
    displaySelectedUserRecord : function(component, event, isVPCR) {
        
        if($A.get("$Browser.isIOS")) {
            $A.util.removeClass(component.find('articleScroll'),'cScroll-table');
        }
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        this.modalGenericClose(component);
        
        var cmAccountTeamHistoryDataFromChildComp = event.getParam("cmAccountTeamHistoryData2");
        
        var lastName = cmAccountTeamHistoryDataFromChildComp.LastName;
        var firstName = cmAccountTeamHistoryDataFromChildComp.FirstName;
        var isVPCRVal = cmAccountTeamHistoryDataFromChildComp.VPCR__c;
        var jobTitle = cmAccountTeamHistoryDataFromChildComp.Title;
        var userRowId = cmAccountTeamHistoryDataFromChildComp.Id;
        
        if(lastName == null || lastName == undefined) {
            lastName = '';
        }
        if(firstName == null || firstName == undefined) {
            firstName = ' ';
        }
        if( isVPCRVal == null || isVPCRVal == undefined) {
            isVPCRVal = false;
        }
        if(jobTitle == null || jobTitle == undefined) {
            jobTitle = '';
        }
        if(userRowId == undefined) {
            userRowId = null;
        }
        
        var userRoleName = '';
        if(cmAccountTeamHistoryDataFromChildComp != null) {
            if(cmAccountTeamHistoryDataFromChildComp.UserRole != null && cmAccountTeamHistoryDataFromChildComp.UserRole != undefined) {
                userRoleName = cmAccountTeamHistoryDataFromChildComp.UserRole.Name;
            }
        }
        component.set('v.NewAccountTeamHistoryData', {'sobjectType':'CM_Account_Team_History__c','Account_Firm__c':component.get('v.recordId'),'Last_Name__c':lastName,'Name':firstName,'IsVPCR__c':isVPCRVal,'Role__c':userRoleName,'Job_Title__c':jobTitle,'User__c':userRowId});
        var cmAccountTeamHistoryListTobeInserted = component.get("v.CMAccountTeamHistoryDataList");
        cmAccountTeamHistoryListTobeInserted.push(component.get('v.NewAccountTeamHistoryData'));
        
        var isLoggedInUserRoleVal = component.get('v.isEditSaveDeleteButtonsEnabled');
        if(isLoggedInUserRoleVal == null || isLoggedInUserRoleVal == undefined) {
        	isLoggedInUserRoleVal = false;    
        }
            
        var action = component.get("c.upsertCMAccountTeamHistoryRecords");
        action.setParams({
            "accountId" : component.get('v.recordId'),
            "cmAccountTeamHistoryDataTobeUpserted" : cmAccountTeamHistoryListTobeInserted
        });
        action.setCallback(this,function(response){
            var state = response.getState();            
            if(state == "SUCCESS") {
                component.set('v.CMAccountTeamHistoryDataList', []);
                if(response.getReturnValue() != null) {
                    var responseList = response.getReturnValue();
                    component.set('v.CMAccountTeamHistoryList', responseList.cmAccountTeamHistoryList);
                    if((responseList.cmAccountTeamHistoryList == null) || 
                       (responseList.cmAccountTeamHistoryList != null && 
                        responseList.cmAccountTeamHistoryList.length == 0)) {
                        if(isLoggedInUserRoleVal) {
                        	$A.util.addClass(component.find("editBtn"), 'slds-hide');    
                        }
                        component.set('v.CMAccountTeamHistoryEmptyList', true);
                        /*component.set('v.isVPCRRecordActive', false);
                        component.set('v.isRVPRecordActive', false);
                        component.set('v.isSCERecordActive', false);*/
                    } else {
                        component.set('v.CMAccountTeamHistoryEmptyList', false);
                        if(isLoggedInUserRoleVal) { 
                            if($A.util.hasClass(component.find("editBtn"), 'slds-hide')) {
                        		$A.util.removeClass(component.find("editBtn"), 'slds-hide');   
                        	}
                            var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
                            if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
                                $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
                                $A.util.addClass(component.find("sortEdit"), 'hide');
                                $A.util.removeClass(component.find("saveCancel"), 'hide');
                            } else {
                                component.find('addBtn').set("v.disabled", true);
                                component.find('editBtn').set("v.disabled", true);
                                $A.util.removeClass(component.find("saveBtn"), 'slds-hide');
                                $A.util.removeClass(component.find("cancelBtn"), 'slds-hide');
                            }
                        }
                        /*component.set('v.isVPCRRecordActive', responseList.vpcr);
                        component.set('v.isRVPRecordActive', responseList.rvp);
                        component.set('v.isSCERecordActive', responseList.scePlayerCoach);*/
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
                    }
                } else {
                    if(isLoggedInUserRoleVal) {
                        $A.util.addClass(component.find("editBtn"), 'slds-hide');
                    }
                    component.set('v.CMAccountTeamHistoryEmptyList', true);
                }

                var myLabel = component.find('utilityToggle').get("v.iconName");
                if(myLabel=="utility:chevronright"){
                    var cmpTarget = component.find('NationalAccountSalesTeam');
                    $A.util.addClass(cmpTarget,'slds-is-open');
                    component.find('utilityToggle').set("v.iconName","utility:chevrondown");
                }
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                
            } else if (state === "ERROR") {
                component.set('v.CMAccountTeamHistoryDataList', []);
                component.set('v.CMAccountTeamHistoryList', component.get('v.CMAccountTeamHistoryList'));
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                var errors = response.getError();
                if (errors) {
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
            
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
        });
        $A.enqueueAction(action);
    },
    
    toggleHelper : function(component,event) {
        var toggleText = component.find("tooltip");
        $A.util.toggleClass(toggleText, "toggle");
    },
    
    sortByForEditableFields : function(component, event, fieldName, sortFieldComp) {
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var action = component.get("c.sortCMAccountTeamHistoryRecords");
        if(component.get("v."+sortFieldComp) ===  true) {
            action.setParams({
                "columnName" : fieldName,
                "sortType" : 'Desc',
                "toBeSortedList" : component.get("v.CMAccountTeamHistoryList")
            });
            component.set("v."+sortFieldComp, false);
        } else {
            action.setParams({
                "columnName" : fieldName,
                "sortType" : 'Asc',
                "toBeSortedList" : component.get("v.CMAccountTeamHistoryList")
            });
            component.set("v."+sortFieldComp, true);
        }
        
        action.setCallback(this,function(response) {
            var state = response.getState();
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
            if(state == "SUCCESS") {
                component.set('v.CMAccountTeamHistoryDataList', []);
                if(response.getReturnValue() != null) {
                    var responseList = response.getReturnValue();
                    component.set('v.CMAccountTeamHistoryList', responseList.cmAccountTeamHistoryList);
                    //component.set('v.isVPCRRecordActive', responseList.vpcr);
                    //component.set('v.isRVPRecordActive', responseList.rvp);
                    //component.set('v.isSCERecordActive', responseList.scePlayerCoach);
                    
                    var isSortCheckedVal = false;
                    var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
                    if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
                        if($A.util.hasClass(component.find("sortEdit"), 'hide') &&
                           			!$A.util.hasClass(component.find("saveCancel"), 'hide')) {
                            isSortCheckedVal = true;
                        }
                    }
                    var isEditModeEnabled = component.find("cancelBtn");
                    if(!($A.util.hasClass(isEditModeEnabled, 'slds-hide')) || isSortCheckedVal) {
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
                    }
                }
                var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
                if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
                    $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
                }
            } else {
                console.log("In sortBy method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
            }
        });        
        $A.enqueueAction(action);
    },
    
    sortBy : function(component, event, fieldName, sortFieldComp) {
        
        var isLoggedInUserRoleVal = component.get('v.isEditSaveDeleteButtonsEnabled');
        var isSortCheckedVal = true;
        if($A.util.hasClass(component.find("cancelBtn"), 'slds-hide')) {
            isSortCheckedVal = false;    
        }
        
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        
        var action = component.get("c.getCMAccountTeamHistoryRecords");
        if(component.get("v."+sortFieldComp) ===  true) {
            action.setParams({
                "accountId" : component.get('v.recordId'),
                "columnName" : fieldName,
                "sortType" : 'Desc'
            });
            component.set("v."+sortFieldComp, false);
        } else {
            action.setParams({
                "accountId" : component.get('v.recordId'),
                "columnName" : fieldName,
                "sortType" : 'Asc',
                "isSortChecked" : isSortCheckedVal,
                "sortedList" : component.get('v.CMAccountTeamHistoryList')
            });
            component.set("v."+sortFieldComp, true);
        }
        
        action.setCallback(this,function(response) {
            var state = response.getState();
            $A.util.addClass(spinner1, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.util.removeClass(appletIcon, 'slds-hide');
            if(state == "SUCCESS") {
                component.set('v.CMAccountTeamHistoryDataList', []);
                if(response.getReturnValue() != null) {
                    var responseList = response.getReturnValue();
                    component.set('v.CMAccountTeamHistoryList', responseList.cmAccountTeamHistoryList);
                    /*component.set('v.isVPCRRecordActive', responseList.vpcr);
                    component.set('v.isRVPRecordActive', responseList.rvp);
                    component.set('v.isSCERecordActive', responseList.scePlayerCoach);*/
                    var isEditModeEnabled = component.find("cancelBtn");
                    if(isLoggedInUserRoleVal != null && isLoggedInUserRoleVal && 
                       		!($A.util.hasClass(isEditModeEnabled, 'slds-hide'))) {
                        //console.log('Edited Ids->'+component.get("v.CMAccountTeamHistoryIdsArray"));
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
                    }
                } 
                var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
                if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
        			$A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
                    $A.util.removeClass(component.find("sortEdit"), 'hide');
                }
            } else {
                console.log("In sortBy method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
            }
        });        
        $A.enqueueAction(action);
    },
    
    removeCMAccountTeamHistoryRecord : function(component, event, cmAccountTeamHistoryIdToBeRemovedVal) { 
        
        if($A.get("$Browser.isIOS")) {
            $A.util.removeClass(component.find('articleScroll'),'cScroll-table');
        }
        
        var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
        	$A.util.addClass(component.find("action-bar-mobile"), 'slds-hide');
        }
        
        var confirmCancelList = component.find('confirmDelForCMAccHistoryRecord');
        for(var i=0;i<confirmCancelList.length;i++) {
            $A.util.removeClass(confirmCancelList[i], 'slds-show');
            $A.util.addClass(confirmCancelList[i], 'slds-hide');
        }
        
        /*var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');*/
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        /*var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');*/
        
        var action = component.get("c.deleteCMAccountTeamHistoryRecord");
        action.setParams({
            "accountId" : component.get('v.recordId'),
            "CMAccountTeamHistoryDelList" : component.get('v.CMAccountTeamHistoryDataList'),
            "cmAccountTeamHistoryRecordId" : cmAccountTeamHistoryIdToBeRemovedVal
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                component.set('v.cmAccountTeamHistoryIdToBeRemoved', '');
                /*$A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');*/
                this.getCMAccountTeamHistoryData(component, event, 'deleteOperation'); 
            } else if (state === "ERROR") {
                component.set('v.cmAccountTeamHistoryIdToBeRemoved', '');
                /*$A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');*/
                var errors = response.getError();
                if (errors) {
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
                if($A.get("$Browser.isIOS")) {
                    $A.util.addClass(component.find('articleScroll'),'cScroll-table');
                }
            }
        });
        $A.enqueueAction(action);
    }, 
    
    checkForDateValidation : function(component, event, cmAccountTeamHistoryObj, isStartdateRecordVal, isCurrentDate, isOnlyEndDate) {
        
        var promptMsgList = component.find('promptMessageForDateFields');
        for(var i=0;i<promptMsgList.length;i++) {
            $A.util.removeClass(promptMsgList[i], 'slds-hide');
            $A.util.removeClass(promptMsgList[i], 'slds-hide');
        }
        
        /*if(isOnlyEndDate == false) {
            var childCmp = component.find("childComponent");
            var cmAccountTeamHistoryList = component.get('v.CMAccountTeamHistoryList');
            if(childCmp != null && childCmp != undefined) {
                if(Array.isArray(childCmp)) {
                    if(cmAccountTeamHistoryList != null && cmAccountTeamHistoryList != undefined) {
                        for(var i=0; i<childCmp.length; i++) {
                            if(cmAccountTeamHistoryList[i].Id == cmAccountTeamHistoryObj.Id) {
                                childCmp[i].updateFields(isStartdateRecordVal);
                                break;
                            }
                        }
                    }
                } else {
                    childCmp.updateFields(isStartdateRecordVal);
                }
            }
        }*/         
                
        if(isStartdateRecordVal != null && isStartdateRecordVal != undefined && isStartdateRecordVal == true) {
            component.set('v.promptMessageText','The Case Management End Date cannot be earlier than the Case Management Start Date.');
        } else if(isOnlyEndDate != null && isOnlyEndDate != undefined && isOnlyEndDate == true) {
            component.set('v.promptMessageText','Only Case Management End Date cannot be given');   
        } else {
            /*if(isCurrentDate != null && isCurrentDate != undefined && isCurrentDate == true) {
                component.set('v.promptMessageText','The Case Management End Date cannot be greater than today.'); 
            } else*/
            if(isStartdateRecordVal != null && isStartdateRecordVal != undefined && isStartdateRecordVal == false) {
                component.set('v.promptMessageText','The Case Management End Date cannot be earlier than the Case Management Start Date.');
            }
        }
        
    },
    
    checkforDateFormatValidation : function(component, startDate, endDate) {                
        
        var validateDate = true;
        var promptMsgText = '';
        var isStartDate = false;
        
        if(startDate != null && startDate != undefined && startDate.trim() != ''){
            if(!this.isValidateDate(startDate)){
                promptMsgText = 'Please enter the Case Management Start Date in m/dd/yyyy format';
                validateDate = false;
                isStartDate = true;
            }
        }
        if(endDate != null && endDate != undefined && endDate.trim() != ''){
            if(!this.isValidateDate(endDate)){
                if(isStartDate) {
                    promptMsgText = 'Please enter the Case Management Start Date & the Case Management End Date in m/dd/yyyy format';
                } else {
                    promptMsgText = 'Please enter the Case Management End Date in m/dd/yyyy format';  
                } 
                validateDate = false;
            }
        }
        
        if(validateDate == false) {
            
            component.set('v.promptMessageText', promptMsgText);
            
            var promptMsgList = component.find('promptMessageForDateFields');
            for(var i=0;i<promptMsgList.length;i++) {
                $A.util.removeClass(promptMsgList[i], 'slds-hide');
                $A.util.removeClass(promptMsgList[i], 'slds-hide');
            }
        }                        
        
        return validateDate;
    },
    
    isValidateDate : function(date) {

        var valDate = date;
        var returnValue = false;
        if(valDate == null || valDate == undefined || valDate == ''){
            return false;
        }
        var regEx = /^\d{4}-\d{2}-\d{2}$/;
        
        if(!valDate.match(regEx)) {
            returnValue = false;
        } else {
            returnValue = true;
        } 
        return returnValue;
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
    }
    
})