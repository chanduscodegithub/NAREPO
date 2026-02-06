({
    doInit : function(component, event, helper) {
        console.log('Test');
        component.set('v.isGoButtonClicked', false);
        
        component.find('searchKeywordForConsultants').set('v.value','');
        component.find('SearchFieldDropDown').set('v.value','LastName');
        component.find('SearchFilterDropDown').set('v.value','Begins With');
        
        component.set('v.isFromQA', component.get('v.Child_Data').isFromQA);
        component.set('v.existingConIds', component.get('v.Child_Data').existingConIds);
        component.set('v.opportunityData',component.get('v.Child_Data').opportunityData);
        
        var isFromQAVal = component.get('v.Child_Data').isFromQA;
        isFromQAVal = (isFromQAVal != undefined && isFromQAVal != null) ? isFromQAVal : false;
        if(isFromQAVal) {
            $A.util.removeClass(component.find('searchSelect'), 'slds-large-size_5-of-12');
            $A.util.addClass(component.find('searchSelect'), 'slds-large-size_4-of-12');
            $A.util.addClass(component.find('searchSelect'), 'search-select');
            $A.util.removeClass(component.find('selCnsltCount'), 'slds-col');
            $A.util.addClass(component.find('selCnsltCount'), 'slds-large-size_2-of-12');
            $A.util.addClass(component.find('formAuraId'), 'consultant-popup--form');
            $A.util.removeClass(component.find('linkId'), 'slds-p-left_medium');
           
        } else {
            $A.util.removeClass(component.find('searchSelect'), 'slds-large-size_5-of-12');
            $A.util.addClass(component.find('searchSelect'), 'slds-large-size_4-of-12');
            $A.util.addClass(component.find('searchSelect'), 'slds-large-size_4-of-12');
            $A.util.removeClass(component.find('selCnsltCount'), 'slds-col');
            $A.util.addClass(component.find('selCnsltCount'), 'slds-col');
            $A.util.removeClass(component.find('formAuraId'), 'consultant-popup--form');
            
            
        }
        
        if(component.get('v.isConsultantsListDisplayed')){
            helper.getConsultantsRecords(component);
        }else if(component.get('v.isConsultingFirmListDisplayed')){
            helper.getAllConsultants(component);
        }
        
    },
    
    openMailPopup : function(component, event, helper){
        var device = $A.get("$Browser.formFactor");
        
        if(device == "DESKTOP"){
            helper.openMailPopup(component, event, 'Send an Email to the CRM Help Desk', 'MA_Consultants_Send_Mail_Popup');
        }else{
            helper.openMailPopup(component, event, 'Send an Email to the CRM Help Desk', 'MA_Consultants_Send_Mail_Popup');  
        }
        
        event.stopPropagation();  
    },
    
    modelCloseComponentEvent : function(component, event,helper){
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
    
    handleRemoveOnly : function(component, event, helper){
        event.preventDefault();
        var selectedConId = event.getParam('name');
        var selectedContacts = component.get('v.selectedContacts');
        var updatedList = [];
        var saveBtn = null;
        if(component.get('v.isFromQA')){
            saveBtn = component.find('addBtn');
        }else{
            saveBtn = component.find('saveBtn');
        }
        
        var pill_section = component.find('pill-section');
        var allContact = '';
        
        var selectedContactIds = component.get('v.selectedContactIds');
        
        var checkBoxCount = component.get('v.checkBoxCount');
        
        selectedContactIds = selectedContactIds.filter(function(e) { return e !== selectedConId});
        checkBoxCount = checkBoxCount - 1;
        
        component.set('v.checkBoxCount',checkBoxCount);
        if(checkBoxCount == 0){            
            $A.util.addClass(pill_section, 'slds-hide');
            saveBtn.set("v.disabled",true);                
        }else{
            $A.util.removeClass(pill_section, 'slds-hide');
            saveBtn.set("v.disabled",false);
        }
        component.set('v.selectedContactIds',selectedContactIds);
        
        if(component.get('v.isAllContactList')){
            allContact = 'Id';
        }else{
            allContact = 'ContactId';
        }
        
        for(var i = 0; i<selectedContacts.length; i++){
            if(selectedContacts[i][allContact] != selectedConId){
                updatedList.push(selectedContacts[i]);
            }
        }
        component.set('v.selectedContacts', updatedList);
        
        var ConsultantPopup = component.find('ConsultantPopup');
        if(ConsultantPopup != undefined){
            if(Array.isArray(ConsultantPopup)){
                for(var i=0; i< ConsultantPopup.length; i++){
                    if(selectedConId == ConsultantPopup[i].get('v.consultingSearchArray')[allContact]) {
                        ConsultantPopup[i].removeSelectedRecord();
                        break;
                    }
                }
            }else{
                if(selectedConId == ConsultantPopup.get('v.consultingSearchArray')[allContact]){
                    ConsultantPopup.removeSelectedRecord();
                }
            }
        }
    },
    
    enableGoBtn : function(component, event, helper) {
        
        var searchKeyText = component.find('searchKeywordForConsultants').get('v.value');
        if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
            component.find('goBtn').set("v.disabled",false);
            component.find('clrBtn').set("v.disabled",false);
        } else {
            component.find('goBtn').set("v.disabled",true);
            // component.find('clrBtn').set("v.disabled",true);
        }
        
        if(event.getParams().keyCode == 13){                                           
            if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
                component.set('v.isGoButtonClicked', true);
                var searchKeyVal = component.find('searchKeywordForConsultants').get('v.value');
                var searchFieldVal = component.find('SearchFieldDropDown').get('v.value');
                var operator = component.find('SearchFilterDropDown').get('v.value');
                if(component.get('v.isConsultantsListDisplayed')){
                    helper.getConsultantsRecords(component, 1, searchKeyVal, searchFieldVal, operator);
                }else if(component.get('v.isConsultingFirmListDisplayed')){
                    helper.getAllConsultants(component, 1, searchKeyVal, searchFieldVal, operator);
                }
            }            
        }
    },
    
    onSelectChange : function(component, event, helper) {
        component.find('searchKeywordForConsultants').set('v.value','');
        component.find('SearchFieldDropDown').set('v.value','LastName');
        component.find('SearchFilterDropDown').set('v.value','Begins With');
        
        component.set('v.selectedContactIds', []);
        component.set('v.checkBoxCount', 0);
        component.set('v.consultingSearch', []);
        component.set('v.selectedContacts', []);
        
        var selected = component.find("SearchSelect").get("v.value");
        if(selected == 'Consultants Associated with the Company'){
            component.set('v.isConsultantsListDisplayed', true);
            component.set('v.isConsultingFirmListDisplayed', false);
            component.set('v.isAllContactList', false);
            helper.getConsultantsRecords(component);
        }
        else if(selected == 'All Consultants'){
            
            component.set('v.isConsultantsListDisplayed', false);
            component.set('v.isConsultingFirmListDisplayed', true);
            component.set('v.isAllContactList', true);
            helper.getAllConsultants(component);
        }
        
    },
    
    searchConsultants : function(component, event, helper){
        
        component.set('v.isGoButtonClicked', true);
        var searchKeyVal = component.find('searchKeywordForConsultants').get('v.value');
        var searchFieldVal = component.find('SearchFieldDropDown').get('v.value');
        var operator = component.find('SearchFilterDropDown').get('v.value');
        
        if(component.get('v.isConsultantsListDisplayed')){
            helper.getConsultantsRecords(component, 1, searchKeyVal, searchFieldVal, operator);
        }else if(component.get('v.isConsultingFirmListDisplayed')){
            helper.getAllConsultants(component, 1, searchKeyVal, searchFieldVal, operator);
        }
    },
    
    clearSearchFilterField : function(component, event, helper){
        component.find('SearchFilterDropDown').set('v.value','Begins With');
        component.find('searchKeywordForConsultants').set('v.value','');
    },
    
    clearSearchField : function(component, event, helper){
        component.find('searchKeywordForConsultants').set('v.value','');
    },
    
    pageChange: function(component, event, helper) {
        setTimeout(function(){ 
            var focusInputField = component.find("focusInputField");
            $A.util.removeClass(focusInputField, 'slds-hide');            	 
            focusInputField.focus();
            $A.util.addClass(focusInputField, 'slds-hide');
        }, 600); 
        var searchKeyVal = '';
        var isGoButtonClickedVal = component.get('v.isGoButtonClicked');
        if(isGoButtonClickedVal != null && isGoButtonClickedVal != undefined && isGoButtonClickedVal) {
            if(component.get('v.isConsultantsListDisplayed')){
                searchKeyVal = component.find('searchKeywordForConsultants').get('v.value');   
            }else if(component.get('v.isConsultingFirmListDisplayed')){
                searchKeyVal = component.find('searchKeywordForConsultants').get('v.value');   
            }
        }
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        
        var searchFieldVal = component.find('SearchFieldDropDown').get('v.value');
        var operator = component.find('SearchFilterDropDown').get('v.value');
        
        if(component.get('v.isConsultantsListDisplayed')){
            helper.getConsultantsRecords(component, page, searchKeyVal, searchFieldVal, operator);
        }else if(component.get('v.isConsultingFirmListDisplayed')){
            helper.getAllConsultants(component, page, searchKeyVal, searchFieldVal, operator);
        }
    },
    
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    },
    
    addSelectedContactIds : function(component, event, helper){
        var saveBtn = null;
        if(component.get('v.isFromQA')){
            saveBtn = component.find('addBtn');
        }else{
            saveBtn = component.find('saveBtn');
        }
        var pill_section = component.find('pill-section');
        var selectedContactIds = component.get('v.selectedContactIds');
        var contactObj = event.getParam('contactObj');
        
        var checkBoxCount = component.get('v.checkBoxCount');
        if(event.getParam('selectedContact')){            
            selectedContactIds = selectedContactIds.filter(function(e) { return e !== event.getParam('consultantId') });
            checkBoxCount = checkBoxCount - 1;
        }else{
            selectedContactIds.push(event.getParam('consultantId'));
            checkBoxCount = checkBoxCount +1;
        }
        component.set('v.checkBoxCount',checkBoxCount);
        if(checkBoxCount == 0){            
            $A.util.addClass(pill_section, 'slds-hide');
            saveBtn.set("v.disabled",true);                
        }else{
            $A.util.removeClass(pill_section, 'slds-hide');
            saveBtn.set("v.disabled",false);
        }
        component.set('v.selectedContactIds',selectedContactIds);
        
        var isFound = false;
        var isContactSelected = event.getParam('selectedContact');
        var selectedContacts = component.get('v.selectedContacts');
        var conId = '';
        var allContact = '';
        if(component.get('v.isAllContactList')){
            conId = contactObj.Id;
            allContact = 'Id';
        }else{
            conId = contactObj.Contact.Id;
            allContact = 'ContactId';
        }
        if(!isContactSelected){
            if(selectedContacts != undefined){
                for(var i =0; i<selectedContacts.length; i++){
                    if(selectedContacts[i].Id === conId){
                        isFound = true;
                        break;
                    }
                }    
                if(!isFound){
                    selectedContacts.push(contactObj);
                    component.set('v.selectedContacts', selectedContacts);
                }
            }
        }else{
            var updatedList = [];
            for(var i = 0; i<selectedContacts.length; i++){
                if(selectedContacts[i][allContact] != conId){
                    updatedList.push(selectedContacts[i]);
                }
            }
            component.set('v.selectedContacts', updatedList);
        }
    },
    
    saveSelectedConIds : function(component, event, helper){
        //alert('-->>'+JSON.stringify(component.get('v.selectedContactIds')));
        var cmpEvent = component.getEvent("addSelectedConsultants");
        if(component.get('v.isFromQA')){
            var selectedContacts = component.get('v.selectedContacts');
            if(component.get('v.isAllContactList')){
                var finalContactArray = [];
                for(var i = 0; i<selectedContacts.length; i++){
                    var finalContactObj = {};
                    if((i == 0) && (component.get('v.existingConIds').length == 0)){
                        finalContactObj["IsPrimary"] = true;
                    }else{
                        finalContactObj["IsPrimary"] = false;
                    }
                    finalContactObj["Name"] = selectedContacts[i].Name;
                    finalContactObj["LastName"] = selectedContacts[i].LastName;
                    finalContactObj["FirstName"] = selectedContacts[i].FirstName;
                    finalContactObj["AccountId"] = selectedContacts[i].AccountId;
                    finalContactObj["RecordTypeId"] = selectedContacts[i].RecordTypeId;
                    finalContactObj["Id"] = selectedContacts[i].Id;
                    finalContactObj["Account"] = {};
                    var finalContactObj1 = finalContactObj.Account;
                    finalContactObj1["Name"] = selectedContacts[i].Account.Name;
                    finalContactObj1["Id"] = selectedContacts[i].Account.Id;
                    
                    finalContactArray.push(finalContactObj);
                }
                selectedContacts = finalContactArray;
            }else{
                var finalContactArray = [];
                for(var i = 0; i<selectedContacts.length; i++){
                    var finalContactObj = {};
                    if((i == 0) && (component.get('v.existingConIds').length == 0)){
                        finalContactObj["IsPrimary"] = true;
                    }else{
                        finalContactObj["IsPrimary"] = false;
                    }
                    finalContactObj["Name"] = selectedContacts[i].Contact.Name;
                    finalContactObj["LastName"] = selectedContacts[i].Contact.LastName;
                    finalContactObj["FirstName"] = selectedContacts[i].Contact.FirstName;
                    finalContactObj["AccountId"] = selectedContacts[i].Contact.AccountId;
                    finalContactObj["RecordTypeId"] = selectedContacts[i].Contact.RecordTypeId;
                    finalContactObj["Id"] = selectedContacts[i].Contact.Id;
                    finalContactObj["Account"] = {};
                    var finalContactObj1 = finalContactObj.Account;
                    finalContactObj1["Name"] = selectedContacts[i].Contact.Account.Name;
                    finalContactObj1["Id"] = selectedContacts[i].Contact.Account.Id;
                    
                    finalContactArray.push(finalContactObj);
                }
                selectedContacts = finalContactArray;
            }
            
            var list1 = [];
            var list2 = [];
            for(var j = 0; j<selectedContacts.length; j++){
                if(j == 0){
                    list1.push(selectedContacts[j]);
                }else{
                    list2.push(selectedContacts[j]);   
                }
            }
            
            list2.sort(function(a,b){
                var t1 = a['LastName'] == b['LastName'],
                    t2 = a['LastName'] > b['LastName'];
                return t1? 0: (true?-1:1)*(t2?-1:1);
            });
            
            var finalList = list1.concat(list2);
            
            cmpEvent.setParams({"consultantsArrayForQA" : finalList,
                                "clicked" : false,
                                "isAllContactList" : component.get('v.isAllContactList')});
            cmpEvent.fire();
        }else{
            cmpEvent.setParams({"selectedContactIdList":component.get('v.selectedContactIds'),
                                "clicked":false,
                                "isAllContactList" : component.get('v.isAllContactList')});
            cmpEvent.fire();
        }
    }, 
    
    cancelNClose : function(component, event, helper){
        var cmpEvent = component.getEvent("addSelectedConsultants");
        cmpEvent.setParams({"clicked":true});
        cmpEvent.fire();
    }
    
})