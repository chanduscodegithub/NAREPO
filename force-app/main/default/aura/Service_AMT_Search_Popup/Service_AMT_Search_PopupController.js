({
    doInit : function(component, event, helper) {
       // component.set('v.isGoButtonClicked', false);
        component.find('goBtn').set("v.disabled",true);
        component.find('searchKeywordForUsers').set('v.value','');
        component.find('SearchFieldDropDown').set('v.value','Last Name');
        component.find('SearchFilterDropDown').set('v.value','Begins With');
        component.find('searchKeywordForUsersSec').set('v.value','');
        component.find('SearchFieldDropDownSec').set('v.value','First Name');
        component.find('SearchFilterDropDownSec').set('v.value','Begins With');
    },
     onClear: function(component, event, helper){
        
        component.find('goBtn').set("v.disabled",true);
         component.find('clrBtn').set("v.disabled",true);
        component.find('searchKeywordForUsers').set('v.value','');
        component.find('SearchFieldDropDown').set('v.value','Last Name');
        component.find('SearchFilterDropDown').set('v.value','Begins With');
        component.find('searchKeywordForUsersSec').set('v.value','');
        component.find('SearchFieldDropDownSec').set('v.value','First Name');
        component.find('SearchFilterDropDownSec').set('v.value','Begins With');
        component.set("v.userSearch", null);
         component.set("v.page", 0);
        component.set("v.pages", 0);
    },
    
    enableGoBtn : function(component, event, helper) {
        
        var searchKeyText = component.find('searchKeywordForUsers').get('v.value');
        var searchKeyTextSec = component.find('searchKeywordForUsersSec').get('v.value');
        console.log('searchKeyTextSec---'+searchKeyTextSec);
        if((searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) || (searchKeyTextSec != undefined && searchKeyTextSec != null && searchKeyTextSec.trim().length > 0)) {
            component.find('goBtn').set("v.disabled",false);
            component.find('clrBtn').set("v.disabled",false);
            
        } else {
            component.find('goBtn').set("v.disabled",true);
            component.find('clrBtn').set("v.disabled",true);
        }
        
       /** if(event.getParams().keyCode == 13){                                           
            if((searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) || (searchKeyTextSec != undefined && searchKeyTextSec != null && searchKeyTextSec.trim().length > 0)) {
                component.set('v.isGoButtonClicked', true);
                var searchKeyVal = component.find('searchKeywordForUsers').get('v.value');
                var searchFieldVal = component.find('SearchFieldDropDown').get('v.value');
                var operator = component.find('SearchFilterDropDown').get('v.value');
                var searchKeyValSec = component.find('searchKeywordForUsersSec').get('v.value');
                var searchFieldValSec = component.find('SearchFieldDropDownSec').get('v.value');
                var operatorSec = component.find('SearchFilterDropDownSec').get('v.value');
                helper.getUsers(component, 1, searchKeyVal, searchFieldVal, operator);
            }            
        } **/
    },
    
    onSelectChange : function(component, event, helper) {
        var selected = component.find("SearchSelect").get("v.value");
        if(selected == 'CRM Service Users'){
            component.set('v.isUserListDisplayed', true);
            // component.set('v.isContactListDisplayed', false);
            helper.getUsers(component);
        }
        else if(selected == 'Non-CRM Users'){
            
            component.set('v.isUserListDisplayed', false);
            component.set('v.isContactListDisplayed', true);
            helper.getUsers(component);
        }
        
    },
    
    searchConsultants : function(component, event, helper){
        debugger;
        component.set('v.isGoButtonClicked', true);
        var searchKeyVal = component.find('searchKeywordForUsers').get('v.value');
        var searchFieldVal = component.find('SearchFieldDropDown').get('v.value');
        var operator = component.find('SearchFilterDropDown').get('v.value');
        var searchKeyValSec = component.find('searchKeywordForUsersSec').get('v.value');
        var searchFieldValSec = component.find('SearchFieldDropDownSec').get('v.value');
        var operatorSec = component.find('SearchFilterDropDownSec').get('v.value');
        var page = 1;
        console.log('searchKeyValSec----000--',searchKeyValSec);
        if((searchFieldVal == searchFieldValSec) && (searchKeyVal != '' ) && (searchKeyValSec != '' )){
            var promptMsgList = component.find('promptMessageForDateFields');
        	for (var i = 0; i < promptMsgList.length; i++) {
            	$A.util.removeClass(promptMsgList[i], 'slds-hide');
            	$A.util.removeClass(promptMsgList[i], 'slds-hide');
        	}
           
            component.set('v.promptMessageText','You have selected the same filter option for both search boxes – please adjust your search filters to show different values or leave one of the search boxes blank.');
            component.set("v.userSearch", null);
         	component.set("v.page", 0);
        	component.set("v.pages", 0);
        }else{
        console.log('searchFieldValSec----->'+searchFieldValSec);
        component.set("v.page",page);
        
        if (event.currentTarget != undefined) {
            var columnName = event.currentTarget.getAttribute("data-recId");
        }

        //---------------------------------------------SAMARTH---------------------------------------------
        var sortOrder;
        if (columnName == 'LastName__c') {
            if (component.get("v.sortLastNameAsc")) {
                component.set('v.sortLastNameAsc', false);
                sortOrder = 'DESC';
            }
            else {
                component.set('v.sortLastNameAsc', true);
                sortOrder = 'ASC';
            }
        }

        if (columnName == 'FirstName__c') {
            if (component.get("v.sortFirstNameAsc")) {
                component.set('v.sortFirstNameAsc', false);
                sortOrder = 'DESC';
            }
            else {
                component.set('v.sortFirstNameAsc', true);
                sortOrder = 'ASC';
            }
        }

        if (columnName == 'Title__c') {
            if (component.get("v.sortTitleAsc")) {
                component.set('v.sortTitleAsc', false);
                sortOrder = 'DESC';
            }
            else {
                component.set('v.sortTitleAsc', true);
                sortOrder = 'ASC';
            }
        }

        if (columnName == 'Email__c') {
            if (component.get("v.sortEmailAsc")) {
                component.set('v.sortEmailAsc', false);
                sortOrder = 'DESC';
            }
            else {
                component.set('v.sortEmailAsc', true);
                sortOrder = 'ASC';
            }
        }
        //---------------------------------------------SAMARTH---------------------------------------------
        
        helper.getUsers(component,page, searchKeyVal, searchFieldVal, operator, searchKeyValSec, searchFieldValSec, operatorSec, columnName, sortOrder);
        }
        },
    
    clearSearchFilterField : function(component, event, helper){
        component.find('SearchFilterDropDown').set('v.value','Begins With');
        component.find('searchKeywordForUsers').set('v.value','');
        
        var searchKeyTextSec = component.find('searchKeywordForUsersSec').get('v.value');
        console.log('searchKeyTextSec clearSearchFilterField---'+searchKeyTextSec);
        if(searchKeyTextSec != undefined && searchKeyTextSec != null && searchKeyTextSec.trim().length > 0) {
            console.log('inside if');
            component.find('goBtn').set("v.disabled",false);
            component.find('clrBtn').set("v.disabled",false);
            
        }else {
             console.log('inside else');
            component.find('goBtn').set("v.disabled",true);
            component.find('clrBtn').set("v.disabled",true);
        }
        
      
        component.set("v.page",1);
    },
    
     clearSearchFilterFieldSec : function(component, event, helper){
       
        component.find('SearchFilterDropDownSec').set('v.value','Begins With');
        component.find('searchKeywordForUsersSec').set('v.value','');
         
         var searchKeyText = component.find('searchKeywordForUsers').get('v.value');
        console.log('searchKeyText---'+searchKeyText);
        if(searchKeyText  != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
            component.find('goBtn').set("v.disabled",false);
            component.find('clrBtn').set("v.disabled",false);
            
        }else {
            component.find('goBtn').set("v.disabled",true);
            component.find('clrBtn').set("v.disabled",true);
        }
    
        
        component.set("v.page",1);
    },
    
    clearSearchField : function(component, event, helper){
        component.find('searchKeywordForUsers').set('v.value','');
       
        var searchKeyTextSec = component.find('searchKeywordForUsersSec').get('v.value');
        console.log('searchKeyTextSec clearSearchField---'+searchKeyTextSec);
        if(searchKeyTextSec != undefined && searchKeyTextSec != null && searchKeyTextSec.trim().length > 0) {
            component.find('goBtn').set("v.disabled",false);
            component.find('clrBtn').set("v.disabled",false);
            
        }else {
            component.find('goBtn').set("v.disabled",true);
            component.find('clrBtn').set("v.disabled",true);
        }
        
        
        component.set("v.page",1);
    },
    clearSearchFieldSec : function(component, event, helper){
       
        component.find('searchKeywordForUsersSec').set('v.value','');
        
         var searchKeyText = component.find('searchKeywordForUsers').get('v.value');
        console.log('searchKeyText---'+searchKeyText);
        if(searchKeyText  != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
            component.find('goBtn').set("v.disabled",false);
            component.find('clrBtn').set("v.disabled",false);
            
        }else {
            component.find('goBtn').set("v.disabled",true);
            component.find('clrBtn').set("v.disabled",true);
        }
    
        
        component.set("v.page",1);
    },
    
    pageChange: function(component, event, helper) {
       debugger;
        setTimeout(function(){ 
            var focusInputField = component.find("focusInputField");
            $A.util.removeClass(focusInputField, 'slds-hide');            	 
            focusInputField.focus();
            $A.util.addClass(focusInputField, 'slds-hide');
        }, 600); 
        var searchKeyVal = '';
         var searchKeyValSec = '';
        var isGoButtonClickedVal = component.get('v.isGoButtonClicked');
        if(isGoButtonClickedVal != null && isGoButtonClickedVal != undefined && isGoButtonClickedVal) {
            searchKeyVal = component.find('searchKeywordForUsers').get('v.value');
            searchKeyValSec = component.find('searchKeywordForUsersSec').get('v.value');
        }
        
        var direction = event.getParam("direction");
        var page= component.get("v.page") || 1;  
        page = direction === "previous" ? (page - 1) : (page + 1);
        
        if((searchKeyVal != null && searchKeyVal != '' && searchKeyVal.length > 0) || (searchKeyValSec != null && searchKeyValSec != '' && searchKeyValSec.length > 0)){
         // page = component.get("v.page") || 1;  
        }else{
          page = 1;
          component.set("v.total",0);
        }
       
        var searchFieldVal = '';
        var operator = '';
        var searchFieldValSec = '';
        var operatorSec = '';
        
        searchFieldVal = component.find('SearchFieldDropDown').get('v.value');
        operator = component.find('SearchFilterDropDown').get('v.value');
        searchFieldValSec = component.find('SearchFieldDropDownSec').get('v.value');
        operatorSec = component.find('SearchFilterDropDownSec').get('v.value');
        
        helper.getUsers(component, page, searchKeyVal, searchFieldVal, operator,searchKeyValSec, searchFieldValSec, operatorSec);
    },
    
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    },
    
    showHidecomponent : function(component,event,helper){
        var device = $A.get("$Browser.formFactor");
        
        if(device == "DESKTOP"){
            helper.showHidecomponent(component, event, 'Send an Email To HelpDesk', 'AddAmtUsers');
        }else{
            helper.showHidecomponent(component, event, 'Send an Email To HelpDesk', 'AddAmtUsers');  
        }
        event.stopPropagation();
        
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
    
    confirmCancelForPrompt : function(component, event,helper){
        component.set("v.promptMessageText", '');
     var confirmCancelForPromptList = component.find('promptMessageForDateFields');
        for(var i=0;i<confirmCancelForPromptList.length;i++) {
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
            $A.util.addClass(confirmCancelForPromptList[i], 'slds-hide');
        }
    }
})