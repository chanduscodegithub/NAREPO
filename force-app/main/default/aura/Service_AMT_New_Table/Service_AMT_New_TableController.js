({
	doInit : function(component, event, helper) {
		
	},
    
    saveRecords : function(component, event, helper) { 
        
        if($A.get("$Browser.isIOS")) {
            $A.util.removeClass(component.find('articleScroll'),'cScroll-table');
        }
        
		var service_AMT_Record_List = component.get('v.ServiceAMTList');
        var isEndDateValue = null;
        var isStartdateRecordVal = null;
        var isCurrentDate = null;
        
        var currentDate = new Date();
        var date = currentDate.getDate();
        var month = currentDate.getMonth()+1;

        if(date < 10) {
            date = '0'+date
        }
        if(month < 10) {
            month = '0'+month;   
        }
        currentDate = currentDate.getFullYear()+'-'+month+'-'+date;
        
        if(service_AMT_Record_List != null && service_AMT_Record_List != undefined && service_AMT_Record_List.length > 0) {
            for(var i=0;i<service_AMT_Record_List.length;i++) {
                var startDate = service_AMT_Record_List[i].Case_Management_Start_Date__c ;
        		var endDate = service_AMT_Record_List[i].Case_Management_End_Date__c;
                if(startDate != null && startDate != undefined && startDate.trim() != '' && startDate.indexOf('T') > 0) {
                    startDate = startDate.substring(0, startDate.indexOf('T'));
                }
                if(endDate != null && endDate != undefined && endDate.trim() != '' && endDate.indexOf('T') > 0) {
                    endDate = endDate.substring(0, endDate.indexOf('T'));
                }
                if(endDate != null && endDate != undefined && endDate.trim() != '') {
                    if(startDate == null || (startDate != null && startDate != undefined && startDate.trim() == '')) {
                        isEndDateValue = true;
                        break;
                    } else if(startDate != null && startDate != undefined && startDate.trim() != '' && startDate > endDate) {
						isStartdateRecordVal = true;
                        break;
                    } 
                }
            } 
        }

        if((isEndDateValue != null && isEndDateValue != undefined && isEndDateValue) ||
          		(isStartdateRecordVal != null && isStartdateRecordVal != undefined && isStartdateRecordVal)) {
            
            helper.checkForDateValidation(component, event, null, isStartdateRecordVal, isEndDateValue);
            
        } else {
            helper.saveRecords(component, event);
        }
    },
    
    confirmCancelForPrompt : function(component, event, helper) {
        
        component.set("v.promptMessageText", '');
        var confirmCancelForPromptList = component.find('promptMessageForDateFields');
        for(var i=0;i<confirmCancelForPromptList.length;i++) {
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
        }
    },
    
    editRecords : function(component, event, helper) {
        helper.editFields(component, event);
    },
    
    cancel : function(component, event, helper) {
        helper.cancelChanges(component, event);
    },
    
    expandCollapse: function(component, event, helper) {
        
        if(component.get("v.isDeviceIconsToBeEnabled"))return;
        console.log('hello')
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
            helper.getServiceAMTRecords(component, event);
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
            var isLoggedInUserRoleVal = component.get('v.isEditSaveDeleteButtonsEnabled');
            //if(isLoggedInUserRoleVal != null && isLoggedInUserRoleVal) {
                if(component.find('addBtn') != undefined && component.find('addBtn') != null) {
                	component.find('addBtn').set("v.disabled", false); 
                }
            	if(component.find('editBtn') != undefined && component.find('editBtn') != null) {
                	component.find('editBtn').set("v.disabled", false); 
                }
                $A.util.addClass(component.find("saveBtn"), 'slds-hide');
                $A.util.addClass(component.find("cancelBtn"), 'slds-hide');    
            //}
        }
    },
    
    addRecords : function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        var childData = {'accountId' : component.get('v.recordId')};
        if(device == "DESKTOP") {
            
            $A.createComponents([["c:Modal_Component",{attribute:true, 'ModalBodyData':childData, 'ModalBody':'Service_AMT_Search_Popup','Modalheader':'Search for CRM Service/ Non-CRM Users'}]],
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
            
            $A.createComponents([["c:Panel_Component",{attribute:true, 'ModalBodyData':childData, 'ModalBody':'Service_AMT_Search_Popup','Modalheader':'Search for CRM Service/ Non-CRM Users'}]],
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
    
    modelCloseComponentEvent : function(component, event,helper) {
        
      	var isDeviceIconsToBeEnabled = component.get("v.isDeviceIconsToBeEnabled");
		if(isDeviceIconsToBeEnabled != null && isDeviceIconsToBeEnabled) { 
            $A.util.removeClass(component.find("action-bar-mobile"), 'slds-hide');
            $A.util.removeClass(component.find("sortEdit"), 'hide');
            $A.util.addClass(component.find("saveCancel"), 'hide');
        }
      	helper.modalGenericClose(component);
    },
    
    addToServiceAMT : function(component, event, helper){
        if(event.getParam('isDelete')){
            var idToDelete = event.getParam('idToDelete');
            component.set('v.recIdToDelete', idToDelete);
            helper.removeConsultant(component, event);
        }else{
            helper.modalGenericClose(component);
            var userObj = event.getParam('userObj');
            var isUser = event.getParam('isUser');
            var User_Role = event.getParam('User_Role');
            helper.addRecords(component, event, userObj, isUser,User_Role);   
        }
    },
    
    confirmDelete : function(component, event, helper){
        var deleteAcc = component.find('confirmDeleteRecord');
        for(var i in deleteAcc){
            $A.util.addClass(deleteAcc[i], 'slds-hide');
            $A.util.removeClass(deleteAcc[i], 'slds-show');
        }  
        helper.deleteRecords(component, event);
    },
    
    confirmCancel : function(component, event){
        var deleteAcc = component.find('confirmDeleteRecord');
        for(var i in deleteAcc){
            $A.util.addClass(deleteAcc[i], 'slds-hide');
            $A.util.removeClass(deleteAcc[i], 'slds-show');
        }  
    },
    
    sortFields : function(component, event, helper) {
        helper.cancelChanges(component, event);
        
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldItagsWithAuraAttrMap = '{"Last_Name__c" : "sortLastNameAsc", "First_Name__c" : "sortFirstNameAsc", "Job_Title__c" : "sortJobTitleAsc", "Case_Management_Start_Date__c" : "sortStartDateAsc", "Case_Management_End_Date__c" : "sortEndDateAsc", "Type__c" : "sortTypeAsc"}';
        
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        var page = 1;
        
        helper.sortBy(component, event, fieldNameToBeSorted, page, sortFieldCompName);
    },
    
})