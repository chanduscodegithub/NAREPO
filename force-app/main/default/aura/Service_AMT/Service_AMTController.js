({
    doInit : function(component, event, helper) {
        
    },
    doinit2:function(component, event, helper){ 
       
        component.set("v.selTabId","one"); //SAMARTH
        helper.defineSobject(component, event);
        var device = $A.get("$Browser.formFactor");				                   
        if(device != "DESKTOP"){ 
            $A.util.toggleClass(component.find('Service_AMT'),'slds-is-open');            
            component.set("v.isDeviceIconsToBeEnabled",true);
        }
    },
    
    saveRecords : function(component, event, helper) { 
        var device = $A.get("$Browser.formFactor"); 
        if(device != "DESKTOP"){           
            $A.util.addClass(component.find("saveCancel"),"hide");                                  				        
        } 
        if($A.get("$Browser.isIOS")) {
            $A.util.removeClass(component.find('articleScroll'),'cScroll-table');
        }
        
        //------------------------------SAMARTH------------------------------
        //var service_AMT_Record_List = component.get('v.ServiceAMTList');
        var service_AMT_Record_List = component.get('v.activeAMTList');
        console.dir('service_AMT_Record_List Log');
        console.dir(service_AMT_Record_List);
        //------------------------------SAMARTH------------------------------
        
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
        var isRoleEmpty = false;
        var accountHavePolicy = true;
        /*****SHRUTI****START********/ 
        var mapOfValues = {};
        /*****SHRUTI****END********/ 
        
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
                var startDate = service_AMT_Record_List[i].Case_Management_Start_Date__c ;
                var endDate = service_AMT_Record_List[i].Case_Management_End_Date__c;
                
                var role = service_AMT_Record_List[i].Contact_Role__c;
                /*Added Condition to Check whether Primary Role is selected when Same Role is present twice ****SHRUTI**** */
               /* var primaryValue = service_AMT_Record_List[i].Primary__c;

                if(mapOfValues[role]){
                    mapOfValues[role].push(primaryValue);
                }else{
                    mapOfValues[role] = [primaryValue];
                }
                console.log('Satisfied cond--->'+ mapOfValues[role].every(value => value === false));
                
                // mapOfValues.push(role,primaryValue);
                console.log('Map Value = ',mapOfValues);
                console.log('primaryValue in Save Record = ',primaryValue);
                console.log('role = ',role);
                console.log('Record = ',service_AMT_Record_List[i]);*/
                /****SHRUTI*******END******/
                //console.log('record id=',service_AMT_Record_List[i].Company__r.RecordTypeId);
                console.log('record name=',service_AMT_Record_List[i].Company__r.Test_Type__c);
                
                if(service_AMT_Record_List[i].Company__r.Test_Type__c == 'Existing Client'){
                    console.log('inside existing client if');
                    var policiesList = service_AMT_Record_List[i].Policy_Information_MultiChecKlist__c; 
                    console.log('policiesList------',policiesList);
                    if(policiesList == undefined || policiesList == null || policiesList == ''){
                        console.log('inside policies list if');
                        accountHavePolicy = false;
                    }
                }
                
                console.log('startDate---'+startDate);
                console.log('endDate---'+endDate);
                
                if(role == null || role == undefined || role == ''){
                    isRoleEmpty = true;
                    service_AMT_Record_List.backGroundColor = 'green';
                }else{
                    service_AMT_Record_List.backGroundColor = 'white';
                }
                
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
                var policyinfo = service_AMT_Record_List[i].Policy_Information_MultiChecKlist__c;
                if(service_AMT_Record_List[i].Contact_Role__c==null || service_AMT_Record_List[i].Contact_Role__c=="" || service_AMT_Record_List[i].Contact_Role__c==undefined ){
                    service_AMT_Record_List[i].bgcolorRole='2px solid yellow;';
                }
                else{
                    service_AMT_Record_List[i].bgcolorRole='unset;';
                }
                
                if((policyinfo == null || policyinfo == "" || policyinfo == undefined) && service_AMT_Record_List[i].Company__r.Test_Type__c == 'Existing Client'){
                    service_AMT_Record_List[i].bgcolorPolicy='2px solid yellow;';
                }
                else{
                    service_AMT_Record_List[i].bgcolorPolicy='unset;';
                }
                
            } 
        }
        component.set('v.activeAMTList',service_AMT_Record_List);
        /********SHRUTI******START*******/
        console.log('Record outside For Loop= ',service_AMT_Record_List);

        if((Object.keys(mapOfValues).some(key => mapOfValues[key].length >1 && mapOfValues[key].every(value => value === false))) || (isEndDateValue != null && isEndDateValue != undefined && isEndDateValue) ||
           (isStartdateRecordVal != null && isStartdateRecordVal != undefined && isStartdateRecordVal)||
           (isStartDatechanged != null && isStartDatechanged != undefined && isStartDatechanged)||
           (isEndDateChanged != null && isEndDateChanged != undefined && isEndDateChanged) || (isRoleEmpty == true) || (accountHavePolicy == false))  {
            console.log('Inside If Block To Check');
            helper.checkForDateValidation(component, event, null, isStartdateRecordVal, isEndDateValue,isStartDatechanged,isEndDateChanged,isRoleEmpty,accountHavePolicy,service_AMT_Record_List,mapOfValues);
            
        } else {
            helper.saveRecords(component, event);
        }
        /*****SHRUTI******END******/
    },
    
    confirmCancelForPrompt : function(component, event, helper) {
        //debugger;
        
        if(component.get("v.fromAddNewUser")){
            $A.util.removeClass(component.find("saveBtn"), 'slds-hide');
            $A.util.addClass(component.find("saveBtn"), 'slds-show');
        }else{
            
            $A.util.removeClass(component.find("saveBtn"), 'slds-hide');
            $A.util.removeClass(component.find("cancelBtn"), 'slds-hide'); 
            
            $A.util.addClass(component.find("saveBtn"), 'slds-show');
            $A.util.addClass(component.find("cancelBtn"), 'slds-show');
        }
        
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
        //debugger;
        console.log('Inside Controller Edit Method');
        
        
        if(component.get('v.selTabId') == 'one'){ //Samarth
            console.log('Inside Controller Edit Method If (tab 1 selected)');
            var device = $A.get("$Browser.formFactor");
            if(device != "DESKTOP"){ 
                $A.util.addClass(component.find("sortEdit"),"hide");           
            }
            $A.util.addClass(component.find("editBtn"),"hide");
            component.find('editBtn').set("v.disabled", true);
            
            helper.editFields(component, event);
            
            if(device != "DESKTOP"){             
                $A.util.removeClass(component.find("saveCancel"),"hide");
            } 
        } //Samarth
    },
    
    cancel : function(component, event, helper) {
        var device = $A.get("$Browser.formFactor"); 
        if(device != "DESKTOP"){           
            $A.util.addClass(component.find("saveCancel"),"hide");                                  				        
        } 
        helper.cancelChanges(component, event);
        if(device != "DESKTOP"){ 
            $A.util.removeClass(component.find("sortEdit"),"hide");           
        }
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
            var sortIconsArray = ["sortLastNameAsc","sortFirstNameAsc","sortJobTitleAsc","sortStartDateAsc","sortEndDateAsc","sortRoleAsc","sortSCECoachAsc"];
            for(var i=0;i<sortIconsArray.length;i++) {
                component.set("v."+sortIconsArray[i], true);                                
            }
            helper.getServiceAMTRecordsOnLoad(component, event);
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
        //debugger;
        
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
            console.log('inside delete event');
            var idToDelete = event.getParam('idToDelete');
            console.log('idToDelete---'+idToDelete);
            component.set('v.recIdToDelete', idToDelete);
            helper.removeConsultant(component, event);
        }else{
            var userObj = event.getParam('userObj');
            var isUser = event.getParam('isUser');
            var User_Role = event.getParam('User_Role');
            var existingSARecord = event.getParam('existingServiceAmt');
            console.log('existingSARecord===',existingSARecord);
            console.log('userObj====',userObj);
            
            if(existingSARecord.includes(userObj.Email__c)){
                
                var promptMsgList = component.find('promptMessageForDateFields');
                for (var i = 0; i < promptMsgList.length; i++) {
                    $A.util.removeClass(promptMsgList[i], 'slds-hide');
                    $A.util.removeClass(promptMsgList[i], 'slds-hide');
                }
                
                component.set('v.promptMessageText', 'This person has already been added to the Extended AMT section for this account.'); 
                
            }else{
                
                
                component.find("tabs").set('v.selectedTabId', 'one');
                helper.modalGenericClose(component);
                var myLabel = component.find('utilityToggle').get("v.iconName"); 
                if(myLabel=='utility:chevronright'){
                    component.find('utilityToggle').set("v.iconName","utility:chevrondown");
                    helper.getServiceAMTRecords(component, event);
                }
                
                
                helper.addRecords(component, event, userObj, isUser,User_Role);  
            }
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
        //debugger;
        // helper.cancelChanges(component, event);
        
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldItagsWithAuraAttrMap = '{"Last_Name__c" : "sortLastNameAsc", "First_Name__c" : "sortFirstNameAsc", "Job_Title__c" : "sortJobTitleAsc", "Case_Management_Start_Date__c" : "sortStartDateAsc", "Case_Management_End_Date__c" : "sortEndDateAsc", "Contact_Role__c" : "sortRoleAsc", "UserHierarchy__c" : "sortUserhierarchy"}';
        
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
        // console.log('sortFieldCompName >>>'+sortFieldCompName);
        var page = 1;
        if(component.get('v.selTabId')=='one'){
            if(fieldNameToBeSorted == 'Case_Management_Start_Date__c'){
                console.log('inside if sort date');
                
                if (component.get("v." + sortFieldCompName) === true) {
                    var amtList =component.get('v.activeAMTList');
                    
                    // Sort array by date in DESCENDING order
                    amtList.sort(function (f, s) {
                        console.log('inside sort--',f.Case_Management_Start_Date__c);
                        a = new Date(f.Case_Management_Start_Date__c);
                        b = new Date(s.Case_Management_Start_Date__c);
                        if (f.Case_Management_Start_Date__c == undefined) {
                            console.log('inside invalid');
                            return 1;
                        }
                        else if (s.Case_Management_Start_Date__c == undefined) {
                            console.log('inside invalid');
                            return -1;
                        }     
                            else if (a > b){
                                return -1;  
                            } 
                                else if (a < b) {
                                    return 1;
                                }
                        
                        
                    });
                    component.set("v.sortOrder", 'DESC');
                    component.set("v.sortField", fieldNameToBeSorted);
                    component.set("v." + sortFieldCompName, false);
                    component.set('v.activeAMTList',amtList);
                } else {
                    var amtList =component.get('v.activeAMTList');
                    
                    // Sort array by date in DESCENDING order
                    amtList.sort(function (f, s) {
                        console.log('inside sort--',f.Case_Management_Start_Date__c);
                        a = new Date(f.Case_Management_Start_Date__c);
                        b = new Date(s.Case_Management_Start_Date__c);
                        if (f.Case_Management_Start_Date__c == undefined) {
                            console.log('inside invalid');
                            return 1;
                        }
                        else if (s.Case_Management_Start_Date__c == undefined) {
                            console.log('inside invalid');
                            return -1;
                        }     
                            else if (a > b){
                                return 1;  
                            } 
                                else if (a < b) {
                                    return -1;
                                }
                        
                        
                    });            
                    component.set("v.sortOrder", 'ASC');
                    component.set("v.sortField", fieldNameToBeSorted);
                    component.set("v." + sortFieldCompName, true);
                    component.set('v.activeAMTList',amtList);
                }
                
                
                
                
                
            }else if(fieldNameToBeSorted == 'Case_Management_End_Date__c'){
                if (component.get("v." + sortFieldCompName) === true) {
                    var amtList =component.get('v.activeAMTList');
                    
                    // Sort array by date in DESCENDING order
                    amtList.sort(function (f, s) {
                        console.log('inside sort--',f.Case_Management_End_Date__c);
                        a = new Date(f.Case_Management_End_Date__c);
                        b = new Date(s.Case_Management_End_Date__c);
                        if (f.Case_Management_End_Date__c == undefined) {
                            console.log('inside invalid');
                            return 1;
                        }
                        else if (s.Case_Management_End_Date__c == undefined) {
                            console.log('inside invalid');
                            return -1;
                        }     
                            else if (a > b){
                                return -1;  
                            } 
                                else if (a < b) {
                                    return 1;
                                }
                        
                        
                    });
                    component.set("v.sortOrder", 'DESC');
                    component.set("v.sortField", fieldNameToBeSorted);
                    component.set("v." + sortFieldCompName, false);
                    component.set('v.activeAMTList',amtList);
                } else {
                    var amtList =component.get('v.activeAMTList');
                    
                    // Sort array by date in DESCENDING order
                    amtList.sort(function (f, s) {
                        console.log('inside sort--',f.Case_Management_End_Date__c);
                        a = new Date(f.Case_Management_End_Date__c);
                        b = new Date(s.Case_Management_End_Date__c);
                        if (f.Case_Management_End_Date__c == undefined) {
                            console.log('inside invalid');
                            return 1;
                        }
                        else if (s.Case_Management_End_Date__c == undefined) {
                            console.log('inside invalid');
                            return -1;
                        }     
                            else if (a > b){
                                return 1;  
                            } 
                                else if (a < b) {
                                    return -1;
                                }
                        
                        
                    });            
                    component.set("v.sortOrder", 'ASC');
                    component.set("v.sortField", fieldNameToBeSorted);
                    component.set("v." + sortFieldCompName, true);
                    component.set('v.activeAMTList',amtList);
                }
                
            }else if(fieldNameToBeSorted == 'Contact_Role__c'){
                if (component.get("v." + sortFieldCompName) === true) {
                    var amtList =component.get('v.activeAMTList');
                    
                    // Sort array by date in DESCENDING order
                    amtList.sort(function (f, s) {
                        console.log('inside sort--',f.Contact_Role__c);
                        a = f.Contact_Role__c;
                        b = s.Contact_Role__c;
                        if (f.Contact_Role__c == undefined) {
                            console.log('inside invalid');
                            return 1;
                        }
                        else if (s.Contact_Role__c == undefined) {
                            console.log('inside invalid');
                            return -1;
                        }     
                            else if (a > b){
                                return -1;  
                            } 
                                else if (a < b) {
                                    return 1;
                                }
                        
                        
                    });
                    component.set("v.sortOrder", 'DESC');
                    component.set("v.sortField", fieldNameToBeSorted);
                    component.set("v." + sortFieldCompName, false);
                    component.set('v.activeAMTList',amtList);
                } else {
                    var amtList =component.get('v.activeAMTList');
                    
                    // Sort array by date in DESCENDING order
                    amtList.sort(function (f, s) {
                        
                        a = f.Contact_Role__c;
                        b = s.Contact_Role__c;
                        if (f.Contact_Role__c == undefined) {
                            console.log('inside invalid');
                            return 1;
                        }
                        else if (s.Contact_Role__c == undefined) {
                            console.log('inside invalid');
                            return -1;
                        }     
                            else if (a > b){
                                return 1;  
                            } 
                                else if (a < b) {
                                    return -1;
                                }
                        
                        
                    });            
                    component.set("v.sortOrder", 'ASC');
                    component.set("v.sortField", fieldNameToBeSorted);
                    component.set("v." + sortFieldCompName, true);
                    component.set('v.activeAMTList',amtList);
                }
            }
                else if(fieldNameToBeSorted == 'First_Name__c'){
                    if (component.get("v." + sortFieldCompName) === true) {
                        var amtList =component.get('v.activeAMTList');
                        
                        // Sort array by date in DESCENDING order
                        amtList=amtList.sort((a, b) => (a.First_Name__c > b.First_Name__c ? -1 : 1));
                        component.set("v.sortOrder", 'ASC');
                        component.set("v.sortField", fieldNameToBeSorted);
                        component.set("v." + sortFieldCompName, false);
                        component.set('v.activeAMTList',amtList);
                    }else{
                        var amtList =component.get('v.activeAMTList');
                        
                        // Sort array by date in DESCENDING order
                        amtList=amtList.sort((a, b) => (a.First_Name__c > b.First_Name__c ? 1 : -1));
                        component.set("v.sortOrder", 'ASC');
                        component.set("v.sortField", fieldNameToBeSorted);
                        component.set("v." + sortFieldCompName, true);
                        component.set('v.activeAMTList',amtList);
                    }
                }
                    else if(fieldNameToBeSorted == 'Last_Name__c'){
                        if (component.get("v." + sortFieldCompName) === true) {
                            var amtList =component.get('v.activeAMTList');
                            
                            // Sort array by date in DESCENDING order
                            amtList=amtList.sort((a, b) => (a.Last_Name__c > b.Last_Name__c ? -1 : 1));
                            component.set("v.sortOrder", 'ASC');
                            component.set("v.sortField", fieldNameToBeSorted);
                            component.set("v." + sortFieldCompName, false);
                            component.set('v.activeAMTList',amtList);
                        }else{
                            var amtList =component.get('v.activeAMTList');
                            
                            // Sort array by date in DESCENDING order
                            amtList=amtList.sort((a, b) => (a.Last_Name__c > b.Last_Name__c ? 1 : -1));
                            component.set("v.sortOrder", 'ASC');
                            component.set("v.sortField", fieldNameToBeSorted);
                            component.set("v." + sortFieldCompName, true);
                            component.set('v.activeAMTList',amtList);
                        }
                    }
            
                        else{
                            //helper.sortBy(component, event, fieldNameToBeSorted, page, sortFieldCompName);
                        }
        }
        else if(component.get('v.selTabId')=='two'){
            if(fieldNameToBeSorted == 'Case_Management_Start_Date__c'){
                console.log('inside if sort date');
                
                if (component.get("v." + sortFieldCompName) === true) {
                    var amtList =component.get('v.inActiveAMTList');
                    
                    // Sort array by date in DESCENDING order
                    amtList.sort(function (f, s) {
                        console.log('inside sort--',f.Case_Management_Start_Date__c);
                        a = new Date(f.Case_Management_Start_Date__c);
                        b = new Date(s.Case_Management_Start_Date__c);
                        if (f.Case_Management_Start_Date__c == undefined) {
                            console.log('inside invalid');
                            return 1;
                        }
                        else if (s.Case_Management_Start_Date__c == undefined) {
                            console.log('inside invalid');
                            return -1;
                        }     
                            else if (a > b){
                                return -1;  
                            } 
                                else if (a < b) {
                                    return 1;
                                }
                        
                        
                    });
                    component.set("v.sortOrder", 'DESC');
                    component.set("v.sortField", fieldNameToBeSorted);
                    component.set("v." + sortFieldCompName, false);
                    component.set('v.inActiveAMTList',amtList);
                } else {
                    var amtList =component.get('v.inActiveAMTList');
                    
                    // Sort array by date in DESCENDING order
                    amtList.sort(function (f, s) {
                        console.log('inside sort--',f.Case_Management_Start_Date__c);
                        a = new Date(f.Case_Management_Start_Date__c);
                        b = new Date(s.Case_Management_Start_Date__c);
                        if (f.Case_Management_Start_Date__c == undefined) {
                            console.log('inside invalid');
                            return 1;
                        }
                        else if (s.Case_Management_Start_Date__c == undefined) {
                            console.log('inside invalid');
                            return -1;
                        }     
                            else if (a > b){
                                return 1;  
                            } 
                                else if (a < b) {
                                    return -1;
                                }
                        
                        
                    });            
                    component.set("v.sortOrder", 'ASC');
                    component.set("v.sortField", fieldNameToBeSorted);
                    component.set("v." + sortFieldCompName, true);
                    component.set('v.inActiveAMTList',amtList);
                }
                
                
                
                
                
            }else if(fieldNameToBeSorted == 'Case_Management_End_Date__c'){
                if (component.get("v." + sortFieldCompName) === true) {
                    var amtList =component.get('v.inActiveAMTList');
                    
                    // Sort array by date in DESCENDING order
                    amtList.sort(function (f, s) {
                        console.log('inside sort--',f.Case_Management_End_Date__c);
                        a = new Date(f.Case_Management_End_Date__c);
                        b = new Date(s.Case_Management_End_Date__c);
                        if (f.Case_Management_End_Date__c == undefined) {
                            console.log('inside invalid');
                            return 1;
                        }
                        else if (s.Case_Management_End_Date__c == undefined) {
                            console.log('inside invalid');
                            return -1;
                        }     
                            else if (a > b){
                                return -1;  
                            } 
                                else if (a < b) {
                                    return 1;
                                }
                        
                        
                    });
                    component.set("v.sortOrder", 'DESC');
                    component.set("v.sortField", fieldNameToBeSorted);
                    component.set("v." + sortFieldCompName, false);
                    component.set('v.inActiveAMTList',amtList);
                } else {
                    var amtList =component.get('v.inActiveAMTList');
                    
                    // Sort array by date in DESCENDING order
                    amtList.sort(function (f, s) {
                        console.log('inside sort--',f.Case_Management_End_Date__c);
                        a = new Date(f.Case_Management_End_Date__c);
                        b = new Date(s.Case_Management_End_Date__c);
                        if (f.Case_Management_End_Date__c == undefined) {
                            console.log('inside invalid');
                            return 1;
                        }
                        else if (s.Case_Management_End_Date__c == undefined) {
                            console.log('inside invalid');
                            return -1;
                        }     
                            else if (a > b){
                                return 1;  
                            } 
                                else if (a < b) {
                                    return -1;
                                }
                        
                        
                    });            
                    component.set("v.sortOrder", 'ASC');
                    component.set("v.sortField", fieldNameToBeSorted);
                    component.set("v." + sortFieldCompName, true);
                    component.set('v.inActiveAMTList',amtList);
                }
                
            }else if(fieldNameToBeSorted == 'Contact_Role__c'){
                if (component.get("v." + sortFieldCompName) === true) {
                    var amtList =component.get('v.inActiveAMTList');
                    
                    // Sort array by date in DESCENDING order
                    amtList.sort(function (f, s) {
                        console.log('inside sort--',f.Contact_Role__c);
                        a = f.Contact_Role__c;
                        b = s.Contact_Role__c;
                        if (f.Contact_Role__c == undefined) {
                            console.log('inside invalid');
                            return 1;
                        }
                        else if (s.Contact_Role__c == undefined) {
                            console.log('inside invalid');
                            return -1;
                        }     
                            else if (a > b){
                                return -1;  
                            } 
                                else if (a < b) {
                                    return 1;
                                }
                        
                        
                    });
                    component.set("v.sortOrder", 'DESC');
                    component.set("v.sortField", fieldNameToBeSorted);
                    component.set("v." + sortFieldCompName, false);
                    component.set('v.inActiveAMTList',amtList);
                } else {
                    var amtList =component.get('v.inActiveAMTList');
                    
                    // Sort array by date in DESCENDING order
                    amtList.sort(function (f, s) {
                        
                        a = f.Contact_Role__c;
                        b = s.Contact_Role__c;
                        if (f.Contact_Role__c == undefined) {
                            console.log('inside invalid');
                            return 1;
                        }
                        else if (s.Contact_Role__c == undefined) {
                            console.log('inside invalid');
                            return -1;
                        }     
                            else if (a > b){
                                return 1;  
                            } 
                                else if (a < b) {
                                    return -1;
                                }
                        
                        
                    });            
                    component.set("v.sortOrder", 'ASC');
                    component.set("v.sortField", fieldNameToBeSorted);
                    component.set("v." + sortFieldCompName, true);
                    component.set('v.inActiveAMTList',amtList);
                }
            }
                else if(fieldNameToBeSorted == 'First_Name__c'){
                    if (component.get("v." + sortFieldCompName) === true) {
                        var amtList =component.get('v.inActiveAMTList');
                        
                        // Sort array by date in DESCENDING order
                        amtList=amtList.sort((a, b) => (a.First_Name__c > b.First_Name__c ? -1 : 1));
                        component.set("v.sortOrder", 'ASC');
                        component.set("v.sortField", fieldNameToBeSorted);
                        component.set("v." + sortFieldCompName, false);
                        component.set('v.inActiveAMTList',amtList);
                    }else{
                        var amtList =component.get('v.inActiveAMTList');
                        
                        // Sort array by date in DESCENDING order
                        amtList=amtList.sort((a, b) => (a.First_Name__c > b.First_Name__c ? 1 : -1));
                        component.set("v.sortOrder", 'ASC');
                        component.set("v.sortField", fieldNameToBeSorted);
                        component.set("v." + sortFieldCompName, true);
                        component.set('v.inActiveAMTList',amtList);
                    }
                }
                    else if(fieldNameToBeSorted == 'Last_Name__c'){
                        if (component.get("v." + sortFieldCompName) === true) {
                            var amtList =component.get('v.inActiveAMTList');
                            
                            // Sort array by date in DESCENDING order
                            amtList=amtList.sort((a, b) => (a.Last_Name__c > b.Last_Name__c ? -1 : 1));
                            component.set("v.sortOrder", 'ASC');
                            component.set("v.sortField", fieldNameToBeSorted);
                            component.set("v." + sortFieldCompName, false);
                            component.set('v.inActiveAMTList',amtList);
                        }else{
                            var amtList =component.get('v.inActiveAMTList');
                            
                            // Sort array by date in DESCENDING order
                            amtList=amtList.sort((a, b) => (a.Last_Name__c > b.Last_Name__c ? 1 : -1));
                            component.set("v.sortOrder", 'ASC');
                            component.set("v.sortField", fieldNameToBeSorted);
                            component.set("v." + sortFieldCompName, true);
                            component.set('v.inActiveAMTList',amtList);
                        }
                    }
                        else{
                            //helper.sortBy(component, event, fieldNameToBeSorted, page, sortFieldCompName);
                        }
        }
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
    },
    
    handleInActive: function (component, event, helper) {
        
        if(component.get("v.sobjectusedAccount") && component.find('addBtn')){
           
            if(component.find('addBtn').get("v.disabled")){
                component.set("v.fromInActiveTab",true);
                var promptMsgList = component.find('promptMessageForDateFields');
                for (var i = 0; i < promptMsgList.length; i++) {
                    $A.util.removeClass(promptMsgList[i], 'slds-hide');
                    $A.util.removeClass(promptMsgList[i], 'slds-hide');
                }
                component.set('v.promptMessageText', 'Please Save the Record'); 
                component.set("v.selTabId","one");
            }else{
                component.set("v.fromInActiveTab",false);
                console.log('inside handleinActive');
                component.find('editBtn').set("v.disabled", true);
                component.find('addBtn').set("v.disabled", false); 
                $A.util.removeClass(component.find("saveBtn"), 'slds-show');
                $A.util.removeClass(component.find("cancelBtn"), 'slds-show');
                
                $A.util.addClass(component.find("saveBtn"), 'slds-hide');
                $A.util.addClass(component.find("cancelBtn"), 'slds-hide');
                
                helper.cancelChanges3(component, event);
            }
        }
    },
    
    handleActive: function (component, event, helper) {
        console.log('inside handleActive');
        var fromInActive = component.get("v.fromInActiveTab");
        if(!fromInActive){
            helper.cancelChanges2(component, event); 
        }else{
            //this.editRecords(component, event, helper);
        }
        
    },
    
    checkPrimaryExist : function(component, event, helper){
        
        var service_AMT_Record_List = component.get('v.activeAMTList');
        var isprimaryexists = false;
        if(service_AMT_Record_List.length > 0){
            for(var i=0;i<service_AMT_Record_List.length;i++){
                var primaryvalue = service_AMT_Record_List[i].Primary__c;
                if(primaryvalue){
                    isprimaryexists = true;
                }
            }
        }
        
        if(isprimaryexists == true){
            
            
            var childCmp = component.find("childComponent");
            console.log('childCmp',childCmp) ;
            if (childCmp != null && childCmp != undefined) {
                if (Array.isArray(childCmp)) {
                    
                    for (var i = 0; i < childCmp.length; i++) {
                        childCmp[i].makePrimaryUncheck(); 
                        
                    }
                } else {
                    console.log('inside else');
                    childCmp[i].makePrimaryUncheck(); 
                }
            }
            
            var promptMsgList = component.find('promptMessageForDateFields');
            for (var i = 0; i < promptMsgList.length; i++) {
                $A.util.removeClass(promptMsgList[i], 'slds-hide');
                $A.util.removeClass(promptMsgList[i], 'slds-hide');
            }
            
            component.set('v.promptMessageText', 'Primary Exists already, Please select one person as primary.');  
            
            
        }
        
    }
    
    
    
    
})