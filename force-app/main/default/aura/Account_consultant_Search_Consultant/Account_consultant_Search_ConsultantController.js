({
    doInit : function(component, event, helper) {
        
        component.set('v.isGoButtonClicked', false);
        
        if(component.get('v.isConsultantsListDisplayed')){
            component.find('searchKeywordForConsultants').set('v.value','');
            component.find('SearchFieldDropDown').set('v.value','LastName');
            component.find('SearchFilterDropDown').set('v.value','Begins With');
            
            helper.getConsultantsRecords(component);
        }else if(component.get('v.isConsultingFirmListDisplayed')){
            component.find('searchKeywordForConsultantsFirm').set('v.value','');
            component.find('SearchFieldDropDown1').set('v.value','Consulting Firm');
            component.find('SearchFilterDropDown1').set('v.value','Begins With');
            
            helper.getConsultantsFirmsRecords(component);
            
        }
        
    },
    
    enableGoBtn : function(component, event, helper) {
        
        if(component.get('v.isConsultantsListDisplayed')){
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
                    helper.getConsultantsRecords(component, 1, searchKeyVal, searchFieldVal, operator);
                }            
            } 
            
            
        }else if(component.get('v.isConsultingFirmListDisplayed')){
            var searchKeyText = component.find('searchKeywordForConsultantsFirm').get('v.value');
            if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
                component.find('goBtn1').set("v.disabled",false);
                component.find('clrBtn1').set("v.disabled",false);
            } else {
                component.find('goBtn1').set("v.disabled",true);
                //component.find('clrBtn1').set("v.disabled",true);
            }
            
            if(event.getParams().keyCode == 13){                                           
                if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
                    component.set('v.isGoButtonClicked', true);
                    var searchKeyVal = component.find('searchKeywordForConsultantsFirm').get('v.value');
                    var searchFieldVal = component.find('SearchFieldDropDown1').get('v.value');
                    var operator = component.find('SearchFilterDropDown1').get('v.value');
                    helper.getConsultantsFirmsRecords(component, 1, searchKeyVal, searchFieldVal, operator);
                }            
            } 
        }
        
        
    },
    
    onSelectChange : function(component, event, helper) {
        var selected = component.find("SearchSelect").get("v.value");
        if(selected == 'Consultants'){
            component.set('v.isConsultantsListDisplayed', true);
            component.set('v.isConsultingFirmListDisplayed', false);
            helper.getConsultantsRecords(component);
        }
        else if(selected == 'Consulting Firm'){
            
            component.set('v.isConsultantsListDisplayed', false);
            component.set('v.isConsultingFirmListDisplayed', true);
            helper.getConsultantsFirmsRecords(component);
        }
        
    },
    
    searchConsultants : function(component, event, helper){
        
        component.set('v.isGoButtonClicked', true);
        if(component.get('v.isConsultantsListDisplayed')){
            var searchKeyVal = component.find('searchKeywordForConsultants').get('v.value');
            var searchFieldVal = component.find('SearchFieldDropDown').get('v.value');
            var operator = component.find('SearchFilterDropDown').get('v.value');
            helper.getConsultantsRecords(component, 1, searchKeyVal, searchFieldVal, operator);
        }else if(component.get('v.isConsultingFirmListDisplayed')){
            var searchKeyVal = component.find('searchKeywordForConsultantsFirm').get('v.value');
            var searchFieldVal = component.find('SearchFieldDropDown1').get('v.value');
            var operator = component.find('SearchFilterDropDown1').get('v.value');
            helper.getConsultantsFirmsRecords(component, 1, searchKeyVal, searchFieldVal, operator);
        }
    },
    
    clearSearchFilterField : function(component, event, helper){
        if(component.get('v.isConsultantsListDisplayed')){
            component.find('SearchFilterDropDown').set('v.value','Begins With');
            component.find('searchKeywordForConsultants').set('v.value','');
        }else if(component.get('v.isConsultingFirmListDisplayed')){
            component.find('SearchFilterDropDown1').set('v.value','Begins With');
            component.find('searchKeywordForConsultantsFirm').set('v.value','');
        }
    },
    
    clearSearchField : function(component, event, helper){
        if(component.get('v.isConsultantsListDisplayed')){
            component.find('searchKeywordForConsultants').set('v.value','');
        }else if(component.get('v.isConsultingFirmListDisplayed')){
            component.find('searchKeywordForConsultantsFirm').set('v.value','');
        }
    },
    
    pageChange: function(component, event, helper){
        setTimeout(function(){
            var focusInputField = component.find("focusInputField");
            $A.util.removeClass(focusInputField, 'slds-hide');  
            try{
                focusInputField.focus();    
            }catch(err){
                console.log('focus ');
            }       	 
            $A.util.addClass(focusInputField, 'slds-hide');
        }, 600);
        var searchKeyVal = '';
        var isGoButtonClickedVal = component.get('v.isGoButtonClicked');
        if(isGoButtonClickedVal != null && isGoButtonClickedVal != undefined && isGoButtonClickedVal) {
            if(component.get('v.isConsultantsListDisplayed')){
                searchKeyVal = component.find('searchKeywordForConsultants').get('v.value');   
            }else if(component.get('v.isConsultingFirmListDisplayed')){
                searchKeyVal = component.find('searchKeywordForConsultantsFirm').get('v.value');   
            }
        }
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        
        var searchFieldVal = '';
        var operator = '';
        
        if(component.get('v.isConsultantsListDisplayed')){
            searchFieldVal = component.find('SearchFieldDropDown').get('v.value');
            operator = component.find('SearchFilterDropDown').get('v.value');
        }else if(component.get('v.isConsultingFirmListDisplayed')){
            searchFieldVal = component.find('SearchFieldDropDown1').get('v.value');
            operator = component.find('SearchFilterDropDown1').get('v.value');
        }
        
        if(component.get('v.isConsultantsListDisplayed')){
            helper.getConsultantsRecords(component, page, searchKeyVal, searchFieldVal, operator);
        }else if(component.get('v.isConsultingFirmListDisplayed')){
            helper.getConsultantsFirmsRecords(component, page, searchKeyVal, searchFieldVal, operator);
        }
    },
    
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    },
    openMailPopup : function(component, event, helper){
        console.log('hello')
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
   
    
})