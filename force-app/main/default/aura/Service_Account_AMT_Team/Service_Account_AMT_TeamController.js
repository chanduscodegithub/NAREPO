({
    doInit : function(component, event, helper) {
   
    },
    doinit2:function(component, event, helper){
        helper.defineSobject(component, event);
    },
    
    saveRecords : function(component, event, helper) { 
        debugger
        if($A.get("$Browser.isIOS")) {
            $A.util.removeClass(component.find('articleScroll'),'cScroll-table');
        }
        
        var service_AMT_Record_List = component.get('v.ServiceAMTList');
        
        for(var i=0;i<service_AMT_Record_List.length;i++){
            var userHierarchy = service_AMT_Record_List[i].UserHierarchy__c;
            //console.log('userHierarchy in controller'+userHierarchy);
            if(userHierarchy == null){
                service_AMT_Record_List[i].UserHierarchy__c = '';
            }
        }
        
        var isEndDateValue = null;
        var isStartdateRecordVal = null;
        var isCurrentDate = null;
        var ispolicynull = null;
        var isStartDatechanged =null;
        var isEndDateChanged = null;
        
        var currentDate = new Date();
        var date = currentDate.getDate();
        var month = currentDate.getMonth()+1;
        
      
        
        if(date < 10) {
            date = '0'+date
        }
        if(month < 10) {
            month = '0'+month;   
        }
        currentDate = date+'-'+month+'-'+ currentDate.getFullYear();
        
        if(service_AMT_Record_List != null && service_AMT_Record_List != undefined && service_AMT_Record_List.length > 0) {
            $A.util.addClass(component.find('saveBtn'),'slds-hide');
            $A.util.addClass(component.find('cancelBtn'),'slds-hide');
            
            for(var i=0;i<service_AMT_Record_List.length;i++) {
               
                debugger;
                var startDate = service_AMT_Record_List[i].Case_Management_Start_Date__c ;
                var endDate = service_AMT_Record_List[i].Case_Management_End_Date__c;
               
                 if (startDate != null && startDate != undefined && startDate.trim() != '' && startDate.match(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/)){
                   
                 }else if(startDate != null && startDate != undefined && startDate.trim() != ''){
                      isStartDatechanged = true;
                     break;
                 }
                 if (endDate != null && endDate != undefined && endDate.trim() != '' && endDate.match(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/)){
                   
                 }else if(endDate != null && endDate != undefined && endDate.trim() != ''){
                      isEndDateChanged = true;
                    break;
                 }
                                     
                
                
                if(startDate != null && startDate != undefined && startDate.trim() != '' && startDate.indexOf('T') > 0 ) {
                    startDate = startDate.substring(0, startDate.indexOf('T'));
                }
                if(startDate != null && startDate != undefined && startDate.trim() != '' &startDate.length < 10){
                    
                }
                
                if(endDate != null && endDate != undefined && endDate.trim() != '' && endDate.indexOf('T') > 0 ) {
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
                var policyinfo = service_AMT_Record_List[i].Policy_Information__c;
                if(policyinfo != null && policyinfo != undefined){
                    
                }else{
                    // helper.checkpolicy(component,event,ispolicynull); 
                }
                ;
            } 
        }
        
        
        if((isEndDateValue != null && isEndDateValue != undefined && isEndDateValue) ||
           (isStartdateRecordVal != null && isStartdateRecordVal != undefined && isStartdateRecordVal)||
           (isStartDatechanged != null && isStartDatechanged != undefined && isStartDatechanged)||
           (isEndDateChanged != null && isEndDateChanged != undefined && isEndDateChanged)) {
            
            helper.checkForDateValidation(component, event, null, isStartdateRecordVal, isEndDateValue,isStartDatechanged,isEndDateChanged);
            
        } else {
            helper.saveRecords(component, event);
        }
    },
    
    confirmCancelForPrompt : function(component, event, helper) {
        debugger;
        $A.util.removeClass(component.find("saveBtn"), 'slds-hide');
        $A.util.removeClass(component.find("cancelBtn"), 'slds-hide'); 
        
        $A.util.addClass(component.find("saveBtn"), 'slds-show');
        $A.util.addClass(component.find("cancelBtn"), 'slds-show');
        
        component.find('addBtn').set("v.disabled", true);
        component.find('editBtn').set("v.disabled", true);
        
        component.set("v.promptMessageText", '');
        var confirmCancelForPromptList = component.find('promptMessageForDateFields');
        for(var i=0;i<confirmCancelForPromptList.length;i++) {
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
        }
    },
    
    editRecords : function(component, event, helper) {
        debugger;
       
        component.find('editBtn').set("v.disabled", true); 
       
        helper.editFields(component, event);
    },
    
    cancel : function(component, event, helper) {
        helper.cancelChanges(component, event);
    },
    
    expandCollapse: function(component, event, helper) {
        
        if(component.get("v.isDeviceIconsToBeEnabled"))return;
       // console.log('hello')
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
        debugger;
        
        var device = $A.get("$Browser.formFactor");
        var contactRecordType = component.get('v.contactRecordTypeId');
        
        
        var childData = {'contactRecordType' : contactRecordType, 'maRecordId' : component.get('v.recordId')};
        if(device == "DESKTOP") {
            $A.createComponents([["c:Modal_Component",{attribute:true, 'ModalBodyData':childData, 'ModalBody':'Service_AMT_Search_Popup','Modalheader':'Search for AMT Members'}]],
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
                                    else{
                                        
                                        
                                        if (errors) {
                                            if (errors[0] && errors[0].message) {
                                                component.set('v.ErrorMessage',errors[0].message);
                                                var ErrorMessage = component.find('ErrorMessage');
                                                for(var i=0;i<ErrorMessage.length;i++) {
                                                    $A.util.addClass(ErrorMessage[i], 'slds-show');
                                                    $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                                                }
                                            }
                                        } 
                                    }
                                    
                                });
        }
        else {
            
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
                                    }  else{
                                        if (errors[0] && errors[0].message) {
                                            component.set('v.ErrorMessage',errors[0].message);
                                            var ErrorMessage = component.find('ErrorMessage');
                                            for(var i=0;i<ErrorMessage.length;i++) {
                                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                                            }
                                        } 
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
            var myLabel = component.find('utilityToggle').get("v.iconName"); 
            if(myLabel=='utility:chevronright'){
                component.find('utilityToggle').set("v.iconName","utility:chevrondown");
                helper.getServiceAMTRecords(component, event);
            }
            var userObj = event.getParam('userObj');
            var isUser = event.getParam('isUser');
            var User_Role = event.getParam('User_Role');
           // console.log(User_Role);
            helper.addRecords(component, event, userObj, isUser,User_Role);   
        }
    },
    
    confirmDelete : function(component, event, helper){
        $A.util.removeClass(component.find("saveBtn"), 'slds-show');
        $A.util.removeClass(component.find("cancelBtn"), 'slds-show');
        
        $A.util.addClass(component.find("saveBtn"), 'slds-hide');
        $A.util.addClass(component.find("cancelBtn"), 'slds-hide'); 
        component.find('addBtn').set("v.disabled", false);
        component.find('editBtn').set("v.disabled", false);
        
        
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
        debugger;
        // helper.cancelChanges(component, event);
        
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldItagsWithAuraAttrMap = '{"Last_Name__c" : "sortLastNameAsc", "First_Name__c" : "sortFirstNameAsc", "Job_Title__c" : "sortJobTitleAsc", "Case_Management_Start_Date__c" : "sortStartDateAsc", "Case_Management_End_Date__c" : "sortEndDateAsc", "UserHierarchy__c" : "sortUserhierarchy"}';
        
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
       // console.log('sortFieldCompName >>>'+sortFieldCompName);
        var page = 1;
        
        helper.sortBy(component, event, fieldNameToBeSorted, page, sortFieldCompName);
    },
    modalClose : function(component, event,helper){
        component.set("v.scrollStyleForDevice","@media screen and (min-width: 320px) and (max-width: 1199px){.panel-content.scrollable{overflow-y: hidden !important;-webkit-overflow-scrolling: auto !important ;}}");
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
            $A.util.removeClass(component.find("sortEdit"),"hide");
        }  
    },
   closeErrorModal :function(component, event, helper) {
        var confirmCancelForPromptList = component.find('ErrorMessage');
        for(var i=0;i<confirmCancelForPromptList.length;i++) {
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
        }
    },
    
    
})