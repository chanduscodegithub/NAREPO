({
    doInit : function(component, event, helper) {
        
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP") {
            component.set("v.isDeviceIconsToBeEnabled", true);
        }else{
            component.set('v.isDesktop',true);
        }
        
        var editRecordVal = event.getParam("editRecord");
        var cancelRecordsVal = event.getParam("cancelRecords");
        var deleteRecordVal = event.getParam("deleteRecord");
        var cmAccountTeamHistoryIdVal = event.getParam("cmAccountTeamHistoryId");
        var cmAccountTeamHistoryIdToBeRemovedVal = event.getParam("cmAccountTeamHistoryIdToBeRemoved");
        var cmAccountTeamHistoryObj = event.getParam("cmAccountTeamHistoryObjData");
        var isStartdateRecordVal = event.getParam("isStartDateValidation");
        var isCurrentDate = event.getParam("isCurrentDateValidation");
        
        if(cancelRecordsVal != null && cancelRecordsVal != undefined && 
           		cancelRecordsVal != '' && cancelRecordsVal == true) {
            
            component.set('v.CMAccountTeamHistoryUpdatedList', []);
            component.set('v.CMAccountTeamHistoryIdsArray', []);
            
        } else if(editRecordVal != null && editRecordVal != undefined && 
                  		editRecordVal != '' && editRecordVal == true) {
            
            if($A.util.hasClass(component.find('saveBtn'), 'slds-hide')) {
            	$A.util.removeClass(component.find("saveBtn"), 'slds-hide');   
            }
            
            var cmAccountTeamHistoryIdsArray = component.get("v.CMAccountTeamHistoryIdsArray");
            //console.log('Array Values from Child Comp ->'+cmAccountTeamHistoryIdsArray);            
            if(cmAccountTeamHistoryIdsArray == null || cmAccountTeamHistoryIdsArray == undefined || 
               cmAccountTeamHistoryIdsArray.length == 0) {
                cmAccountTeamHistoryIdsArray.push(cmAccountTeamHistoryIdVal);
            } else {
                if(Array.isArray(cmAccountTeamHistoryIdsArray)) {
                    if(cmAccountTeamHistoryIdsArray.indexOf(cmAccountTeamHistoryIdVal) < 0) {
                        cmAccountTeamHistoryIdsArray.push(cmAccountTeamHistoryIdVal);
                    }
                }
            }
           	//console.log('Event Vals -> '+cmAccountTeamHistoryIdsArray);
            component.set("v.CMAccountTeamHistoryIdsArray",cmAccountTeamHistoryIdsArray);
            $A.util.removeClass(component.find("saveBtn"), 'slds-hide');
            
        } else if(deleteRecordVal != null && deleteRecordVal != undefined && 
                  deleteRecordVal != '' && deleteRecordVal == true) {
            
            var confirmDelList = component.find('confirmDelForCMAccHistoryRecord');
            for(var i=0;i<confirmDelList.length;i++) {
                $A.util.removeClass(confirmDelList[i], 'slds-hide');
            }
            
            component.set('v.cmAccountTeamHistoryIdToBeRemoved', cmAccountTeamHistoryIdToBeRemovedVal);
            
        } else {
            
            if(device == "DESKTOP") {
                setTimeout(function(){              
                    if(!component.get('v.isGenericEventTriggered')){                
                        component.set('v.isGenericEventTriggered',true);
                        helper.getUserInfo(component, event);
                    }            
                }, 5000);           
            } else {
                helper.getUserInfo(component, event, 'doInit');
            }
        }
        /*else if(isStartdateRecordVal != null && isStartdateRecordVal != undefined &&
                  		cmAccountTeamHistoryObj != null && cmAccountTeamHistoryObj != undefined) {
            
            helper.checkForDateValidation(component, event, cmAccountTeamHistoryObj, isStartdateRecordVal, isCurrentDate, false);
            
        } else {
            var sortIconsArray = ["sortLastNameAsc","sortFirstNameAsc","sortJobTitleAsc","sortStartDateAsc","sortEndDateAsc","sortSCECoachAsc"];
            for(var i in sortIconsArray) {
               component.set("v."+sortIconsArray[i], true);                                
            }
            helper.getCMAccountTeamHistoryData(component, event);
        }*/
    },
    
    setGeneralValues: function(component, event, helper) {			
        if(component.get('v.isGenericEventTriggered')) return;			
        var isError = event.getParam('isError');              
        component.set('v.isGenericEventTriggered',true);
        if(!isError){
            var generalObj = event.getParam('GeneralObj');
            if(generalObj != null && !generalObj.isEmptyUserRoleName){
                if(generalObj.userEditAccessMap != null && generalObj.userEditAccessMap['NationalAccountSalesTeam'] != null){
                    component.set('v.isEditSaveDeleteButtonsEnabled',generalObj.userEditAccessMap['NationalAccountSalesTeam']);
                } else {
                    helper.getUserInfo(component, event);
                }
            }else{
                helper.getUserInfo(component, event);
            }  
        }else{            
            helper.getUserInfo(component, event);
        }              
    },
    
    editRecords : function(component, event, helper) {
        helper.editCMAccountTeamHistoryRecords(component, event);
    },
    
    saveRecords : function(component, event, helper) { 
        
        if($A.get("$Browser.isIOS")) {
            $A.util.removeClass(component.find('articleScroll'),'cScroll-table');
        }
        
		var cmAccountTeamHistoryList = component.get('v.CMAccountTeamHistoryList');
        var isEndDateValue = null;
        var isStartdateRecordVal = null;
        //var isCurrentDate = null;
        
        var currentDate = new Date();
        var date = currentDate.getDate();
        var month = currentDate.getMonth()+1;
		var startDate;
        var endDate;
        
        if(date < 10) {
            date = '0'+date
        }
        if(month < 10) {
            month = '0'+month;   
        }
        currentDate = currentDate.getFullYear()+'-'+month+'-'+date;
        
        if(cmAccountTeamHistoryList != null && cmAccountTeamHistoryList != undefined && 
           		cmAccountTeamHistoryList.length > 0) {
            
            var validateDate = true;
            for(var i=0;i<cmAccountTeamHistoryList.length;i++) {
                
                startDate = cmAccountTeamHistoryList[i].Case_Management_Start_Date__c ;
        		endDate = cmAccountTeamHistoryList[i].Case_Management_End_Date__c;
                
                var validateDate = helper.checkforDateFormatValidation(component, startDate, endDate);
                
                if(validateDate) {
                    
                    if(startDate != null && startDate != undefined && startDate.trim() != '' && startDate.indexOf('T') > 0) {
                        startDate = startDate.substring(0, startDate.indexOf('T'));
                    }
                    if(endDate != null && endDate != undefined && endDate.trim() != '' && endDate.indexOf('T') > 0) {
                        endDate = endDate.substring(0, endDate.indexOf('T'));
                    }
                    if(endDate != null && endDate != undefined && endDate.trim() != '') {                    
                        if(startDate == null || (startDate != null && startDate != undefined && 
                                                 startDate.trim() == '')) {
                            isEndDateValue = true;
                            break;
                        } else if(startDate != null && startDate != undefined && 
                                  startDate.trim() != '' && startDate > endDate) {
                            isStartdateRecordVal = true;
                            break;
                        } else if(endDate > currentDate) {
                            //isCurrentDate = true;
                            //break;
                        } 
                    }                    
                } else {
                    break;
                }                               
            } 
        }

        if((isEndDateValue != null && isEndDateValue != undefined && isEndDateValue) ||
           (isStartdateRecordVal != null && isStartdateRecordVal != undefined && isStartdateRecordVal)) {
           
            //} || (isCurrentDate != null && isCurrentDate != undefined && isCurrentDate) ) {
            
            //helper.checkForDateValidation(component, event, null, isStartdateRecordVal, isCurrentDate, isEndDateValue);
            helper.checkForDateValidation(component, event, null, isStartdateRecordVal, null, isEndDateValue);
            
        } else if(validateDate) {
            
            /*var rvpRoleName = $A.get("$Label.c.CM_RVP");
            var sceRoleName = $A.get("$Label.c.CM_SCE");
            var isVPCRActive = 0;
            var isRVPActive = 0;
            var isSCEPlayerActive = 0;
            
            if(cmAccountTeamHistoryList != null && cmAccountTeamHistoryList != undefined && 
           			cmAccountTeamHistoryList.length > 0) {
                
                for(var i in cmAccountTeamHistoryList) {
                    var roleName = cmAccountTeamHistoryList[i].Role__c;
              		if(roleName != null && roleName != undefined) {
                        var startDate = cmAccountTeamHistoryList[i].Case_Management_Start_Date__c ;
                    	var endDate = cmAccountTeamHistoryList[i].Case_Management_End_Date__c;
                    	if((startDate != null && startDate != undefined && startDate.trim() != '') &&
                           	(endDate == null)) {
                            var isVPCR = cmAccountTeamHistoryList[i].IsVPCR__c;
                             var isSCEPlayerCoach = cmAccountTeamHistoryList[i].SCE_Player_Coach_Assigned_to_Case__c;
                            if(roleName == rvpRoleName && isVPCR != null && isVPCR != undefined) {
                                if(isVPCR) {
                                    isVPCRActive = isVPCRActive + 1;
                                    if(isVPCRActive > 1) {
                                        var promptMsgList = component.find('promptMessageForDateFields');
                                        for(var i in promptMsgList) {
                                            $A.util.removeClass(promptMsgList[i], 'slds-hide');
                                            $A.util.removeClass(promptMsgList[i], 'slds-hide');
                                        }
                                        component.set('v.promptMessageText','Only one VPCR National Account Sales Team record can be active at a time.');
                                        break;
                                    }
                                } else if(isVPCR == false){
                                    isRVPActive = isRVPActive + 1;
                                    if(isRVPActive > 1) {
                                        var promptMsgList = component.find('promptMessageForDateFields');
                                        for(var i in promptMsgList) {
                                            $A.util.removeClass(promptMsgList[i], 'slds-hide');
                                            $A.util.removeClass(promptMsgList[i], 'slds-hide');
                                        }
                                        component.set('v.promptMessageText','Only one RVP National Account Sales Team record can be active at a time.');
                                        break;
                                    }
                                }                            
                            } else if(roleName == sceRoleName && isSCEPlayerCoach != null &&
                                   		isSCEPlayerCoach != undefined && isSCEPlayerCoach) {
                                isSCEPlayerActive = isSCEPlayerActive + 1;
                                if(isSCEPlayerActive > 1) {
                                    var promptMsgList = component.find('promptMessageForDateFields');
                                    for(var i in promptMsgList) {
                                        $A.util.removeClass(promptMsgList[i], 'slds-hide');
                                        $A.util.removeClass(promptMsgList[i], 'slds-hide');
                                    }
                                    component.set('v.promptMessageText','Only one SCE National Account Sales Team record can be active at a time.');
                                    break;
                                }
                                
                            }
						} 
					}
                } 
        	}
            
            if(isVPCRActive < 2 && isRVPActive < 2 && isSCEPlayerActive < 2) {
            	helper.saveCMAccountTeamHistoryRecords(component, event);    
            }*/
            helper.saveCMAccountTeamHistoryRecords(component, event);
        }
        
    },

	removeRecords : function(component, event, helper) {        
        helper.removeCMAccountTeamHistoryRecord(component, event, component.get('v.cmAccountTeamHistoryIdToBeRemoved'));
    },
    
    addRecords : function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP") {
            
            $A.createComponents([["c:Modal_Component",{attribute:true,'ModalBody':'NationalAccountSalesTeam_AddPopUp','Modalheader':'Search for a User'}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0;i<newCmp.length;i++) {
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });
        } else {
            
            component.set("v.scrollStyleForDevice","");
            $A.util.addClass(component.find("action-bar-mobile"), 'slds-hide');
            $A.util.addClass(component.find("sortEdit"), 'hide');
            $A.util.addClass(component.find("saveCancel"), 'hide');
            
            $A.createComponents([["c:Panel_Component",{attribute:true,'ModalBody':'NationalAccountSalesTeam_AddPopUp','Modalheader':'Search for a User'}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0;i<newCmp.length;i++) {
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
    
    selectedUserRecords : function(component, event, helper) {

        //helper.modalGenericClose();
        
        /*var userDataToBeInserted = event.getParam("cmAccountTeamHistoryData2");
        var isVPCRRecordActiveVal = component.get('v.isVPCRRecordActive');
        var isRVPRecordActiveVal = component.get('v.isRVPRecordActive');
        var isSCERecordActiveVal = component.get('v.isSCERecordActive');
        
        if(userDataToBeInserted != null && userDataToBeInserted.UserRole != null && userDataToBeInserted.UserRole != undefined &&
          		userDataToBeInserted.UserRole.Name != null && userDataToBeInserted.UserRole.Name != undefined) {
            
            var rvpRoleName = $A.get("$Label.c.CM_RVP");
            var sceroleName = $A.get("$Label.c.CM_SCE");
            if(userDataToBeInserted.UserRole.Name == rvpRoleName) {
                if(isVPCRRecordActiveVal != null && isVPCRRecordActiveVal != undefined &&
                   	isVPCRRecordActiveVal == true && userDataToBeInserted.VPCR__c != null &&
                  		userDataToBeInserted.VPCR__c != undefined && userDataToBeInserted.VPCR__c == true) {
                    var promptMsgList = component.find('promptMessageForDateFields');
                    for(var i in promptMsgList) {
                        $A.util.removeClass(promptMsgList[i], 'slds-hide');
                        $A.util.removeClass(promptMsgList[i], 'slds-hide');
                    }
                    component.set('v.promptMessageText','Only one VPCR National Account Sales Team record can be active at a time.');
                } else if(isRVPRecordActiveVal != null && isRVPRecordActiveVal != undefined &&
                   			isRVPRecordActiveVal == true && userDataToBeInserted.VPCR__c != null &&
                  				userDataToBeInserted.VPCR__c != undefined && userDataToBeInserted.VPCR__c == false) {
                    var promptMsgList = component.find('promptMessageForDateFields');
                    for(var i in promptMsgList) {
                        $A.util.removeClass(promptMsgList[i], 'slds-hide');
                        $A.util.removeClass(promptMsgList[i], 'slds-hide');
                    }
                    component.set('v.promptMessageText','Only one RVP National Account Sales Team record can be active at a time.');
                    
                } else {
                   helper.displaySelectedUserRecord(component, event); 
                }
                
            } else if(userDataToBeInserted.UserRole.Name == sceroleName) {
            	if(isSCERecordActiveVal != null && isSCERecordActiveVal != undefined &&
                		isSCERecordActiveVal == true) {
                	var promptMsgList = component.find('promptMessageForDateFields');
                    for(var i in promptMsgList) {
                        $A.util.removeClass(promptMsgList[i], 'slds-hide');
                        $A.util.removeClass(promptMsgList[i], 'slds-hide');
                    }
                    component.set('v.promptMessageText','Only one SCE National Account Sales Team record can be active at a time.');   
                } else {
                   helper.displaySelectedUserRecord(component, event); 
                }
            } else {
                helper.displaySelectedUserRecord(component, event);
            }
        } else {
            helper.displaySelectedUserRecord(component, event);
        }*/
        
        helper.displaySelectedUserRecord(component, event);
    },
    
    expandCollapse: function(component, event, helper) {
        
        if(component.get("v.isDeviceIconsToBeEnabled"))return;
        
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);
        $A.util.toggleClass(cmpTarget,'slds-is-open');
        var iconElement = selectedItem.getAttribute("id");
        
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            //On Expansion of Applet, the data will be loaded.
            var sortIconsArray = ["sortLastNameAsc","sortFirstNameAsc","sortJobTitleAsc","sortStartDateAsc","sortEndDateAsc","sortSCECoachAsc"];
            for(var i=0;i<sortIconsArray.length;i++) {
               component.set("v."+sortIconsArray[i], true);                                
            }
            helper.getCMAccountTeamHistoryData(component, event, 'onLoad');
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
            var isLoggedInUserRoleVal = component.get('v.isEditSaveDeleteButtonsEnabled');
            if(isLoggedInUserRoleVal != null && isLoggedInUserRoleVal) {
            	component.find('addBtn').set("v.disabled", false);
                component.find('editBtn').set("v.disabled", false);
                $A.util.addClass(component.find("saveBtn"), 'slds-hide');
                $A.util.addClass(component.find("cancelBtn"), 'slds-hide');    
            }
        }
    },
    
    display : function(component, event, helper) {
        helper.toggleHelper(component, event);
    },
    
    displayOut : function(component, event, helper) {
        helper.toggleHelper(component, event);
    },
    
    sortFields : function(component, event, helper) {
        
        var isEditSaveDeleteButtonsEnabledVal = component.get('v.isEditSaveDeleteButtonsEnabled');
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldItagsWithAuraAttrMap = '{"Role__c":"sortJobRoleAsc","Last_Name__c":"sortLastNameAsc","Name":"sortFirstNameAsc","Job_Title__c":"sortJobTitleAsc","Case_Management_Start_Date__c":"sortStartDateAsc","Case_Management_End_Date__c":"sortEndDateAsc","SCE_Player_Coach_Assigned_to_Case__c":"sortSCECoachAsc"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        
        /* 
         * To retain the default sorting value for all the fields 
         * except the field which is clicked for Sorting. 
         */
        var sortIconsArray = ["sortFirmPrimaryAsc","sortConsultantTierAsc","sortLastNameAsc","sortFirstNameAsc","sortJobTitleAsc","sortMailingAddressAsc",'sortJobRoleAsc'];
        var indexOfSortField = sortIconsArray.indexOf(sortFieldCompName);
        sortIconsArray.splice(indexOfSortField, 1);
        for(var i=0;i<sortIconsArray.length;i++) {
            component.set("v."+sortIconsArray[i], true);                                
        }

        var isSortCheckedVal = true;
        var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
            if($A.util.hasClass(component.find("saveCancel"), 'hide') && 
            		!$A.util.hasClass(component.find("sortEdit"), 'hide') && 
               			!$A.util.hasClass(component.find("action-bar-mobile"), 'slds-hide')) {
                isSortCheckedVal = false;
            }
        } else {
            if($A.util.hasClass(component.find("cancelBtn"), 'slds-hide')) {
                isSortCheckedVal = false;    
            }
        }
        
        var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
        	$A.util.addClass(component.find("action-bar-mobile"), 'slds-hide');
        }
        
        if(isEditSaveDeleteButtonsEnabledVal != null && isEditSaveDeleteButtonsEnabledVal && isSortCheckedVal) {
           helper.sortByForEditableFields(component, event, fieldNameToBeSorted, sortFieldCompName); 
        } else {
           helper.sortBy(component, event, fieldNameToBeSorted, sortFieldCompName); 
        }

    },
    
    cancel : function(component, event, helper) {
        helper.cancelChanges(component, event);
    },
    
    confirmCancel : function(component, event, helper) {
        
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
        
        component.set('v.cmAccountTeamHistoryIdToBeRemoved', '');
        var confirmCancelList = component.find('confirmDelForCMAccHistoryRecord');
        for(var i=0;i<confirmCancelList.length;i++) {
            $A.util.addClass(confirmCancelList[i], 'slds-hide');
        }         
    },
    
    confirmCancelForPrompt : function(component, event, helper) {
        
        component.set("v.promptMessageText", '');
        component.set("v.promptMessageText1", '');
        var confirmCancelForPromptList = component.find('promptMessageForDateFields');
        for(var i=0;i<confirmCancelForPromptList.length;i++) {
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
        }
    },
    
    modelCloseComponentEvent : function(component, event,helper) {
        
      	var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
		if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) { 
            $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
            $A.util.removeClass(component.find("sortEdit"), 'hide');
            $A.util.addClass(component.find("saveCancel"), 'hide');
        }
      	helper.modalGenericClose(component);
    },
    
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i=0;i<ErrorMessage.length;i++) {
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    },
    
    openSortingPopup : function(component, event, helper) {
        
        var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
        if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
            $A.util.addClass(component.find("action-bar-mobile"),'slds-hide');
            $A.util.addClass(component.find("sortEdit"), 'hide');
            $A.util.addClass(component.find("saveCancel"),'slds-hide');
        }
        
        var fieldsToSort = [{"fieldName":"Last_Name__c","fieldDisplayName":"Last Name","fieldOrder":component.get("v.sortLastNameAsc")},
                            {"fieldName":"Name","fieldDisplayName":"First Name","fieldOrder":component.get("v.sortFirstNameAsc")},
                            {"fieldName":"Job_Title__c","fieldDisplayName":"Job Title","fieldOrder":component.get("v.sortJobTitleAsc")},
                            {"fieldName":"Case_Management_Start_Date__c","fieldDisplayName":"Case Management Start Date","fieldOrder":component.get("v.sortStartDateAsc")},
                            {"fieldName":"Case_Management_End_Date__c","fieldDisplayName":"Case Management End Date","fieldOrder":component.get("v.sortEndDateAsc")},
                            //{"fieldName":"SCE_Player_Coach_Assigned_to_Case__c","fieldDisplayName":"SCE Player/Coach","fieldOrder":component.get("v.sortSCECoachAsc")}
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
        	var isEditSaveDeleteButtonsEnabledVal = component.get('v.isEditSaveDeleteButtonsEnabled');
            var fieldNameToBeSorted = event.getParam('fieldNameToBeSorted');
            component.set("v.lastSortField",fieldNameToBeSorted);
            var orderToBeSorted = event.getParam('orderToBeSorted');
      
            var fieldItagsWithAuraAttrMap = '{"Last_Name__c":"sortLastNameAsc","Name":"sortFirstNameAsc","Job_Title__c":"sortJobTitleAsc","Case_Management_Start_Date__c":"sortStartDateAsc","Case_Management_End_Date__c":"sortEndDateAsc","SCE_Player_Coach_Assigned_to_Case__c":"sortSCECoachAsc"}';
            var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
            var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
            
            /* 
             * To retain the default sorting value for all the fields 
             * except the field which is clicked for Sorting. 
             */
            var sortIconsArray = ["sortFirmPrimaryAsc","sortConsultantTierAsc","sortLastNameAsc","sortFirstNameAsc","sortJobTitleAsc","sortMailingAddressAsc"];
            var indexOfSortField = sortIconsArray.indexOf(sortFieldCompName);
            sortIconsArray.splice(indexOfSortField, 1);
            for(var i=0;i<sortIconsArray.length;i++) {
                component.set("v."+sortIconsArray[i], true);                                
            }
            
            var isSortCheckedVal = true;
            if($A.util.hasClass(component.find("cancelBtn"), 'slds-hide')) {
                isSortCheckedVal = false;    
            }
            if(orderToBeSorted === "DESC"){
                component.set("v."+sortFieldCompName,true); 
            }else{
                component.set("v."+sortFieldCompName,false); 
            }
            
            if(isEditSaveDeleteButtonsEnabledVal != null && isEditSaveDeleteButtonsEnabledVal && isSortCheckedVal) {
                helper.sortByForEditableFields(component, event, fieldNameToBeSorted, sortFieldCompName); 
            } else {
                helper.sortBy(component, event, fieldNameToBeSorted, sortFieldCompName); 
            }   
        } else {
            var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
            if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) {
        		$A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
                $A.util.removeClass(component.find("sortEdit"), 'hide');
            	$A.util.addClass(component.find("saveCancel"), 'hide');
            }
        }
        
    },
    
    scrollBottom: function(component, event, helper) {
        
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