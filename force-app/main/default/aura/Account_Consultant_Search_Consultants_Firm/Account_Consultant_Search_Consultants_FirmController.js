({
    doInit : function(component, event, helper) {
        
        component.set('v.isGoButtonClicked', false);
        
        component.find('searchKeywordForConsultantsFirm').set('v.value','');
        component.find('SearchFieldDropDown').set('v.value','Consulting Firm');
        component.find('SearchFilterDropDown').set('v.value','Begins With');
        
        helper.getConsultantsFirmsRecords(component);
        
    },
    
    enableGoBtn : function(component, event, helper) {
        
        var searchKeyText = component.find('searchKeywordForConsultantsFirm').get('v.value');
        if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
            component.find('goBtn').set("v.disabled",false);
            component.find('clrBtn').set("v.disabled",false);
        } else {
            component.find('goBtn').set("v.disabled",true);
            component.find('clrBtn').set("v.disabled",true);
        }
    },
    
    onSelectChange : function(component, event, helper) {
        var selected = component.find("SearchSelect").get("v.value");
        var cmpEvent = component.getEvent('accountConsultantSelectSearch');
        cmpEvent.setParams({'SelectSearch':selected});
        cmpEvent.fire();
    },
    
    searchConsultantFirms : function(component, event, helper){
        
        component.set('v.isGoButtonClicked', true);
        
        var searchKeyVal = component.find('searchKeywordForConsultantsFirm').get('v.value');
        var searchFieldVal = component.find('SearchFieldDropDown').get('v.value');
        var operator = component.find('SearchFilterDropDown').get('v.value');
        
        helper.getConsultantsFirmsRecords(component, 1, searchKeyVal, searchFieldVal, operator);
    },
    
    clearSearchFilterField : function(component, event, helper){
        component.find("SearchFilterDropDown").set("v.value", 'Begins With');
        component.find('searchKeywordForConsultantsFirm').set('v.value', '');
    },
    
    clearSearchField : function(component, event, helper){
        component.find('searchKeywordForConsultantsFirm').set('v.value', '');
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
            searchKeyVal = component.find('searchKeywordForConsultantsFirm').get('v.value');   
        }
        
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        
        var searchFieldVal = component.find('SearchFieldDropDown').get('v.value');
        var operator = component.find('SearchFilterDropDown').get('v.value');
        
        helper.getConsultantsFirmsRecords(component, page, searchKeyVal, searchFieldVal, operator);
    },
    
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    }
    
})