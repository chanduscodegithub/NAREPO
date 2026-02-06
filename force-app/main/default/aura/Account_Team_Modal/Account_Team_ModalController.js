({
    doInit : function(component, event, helper) {
        component.set('v.isGoButtonClicked', false);
        component.find('searchKey').set('v.value','');
        component.set('v.ModalPagination',component.get('v.Child_Data').ModalPagination);
        component.find('SearchDropDown').set('v.value','LastName');
        component.find('SearchDropDown1').set('v.value','Begins With');
        helper.getUserRecordDetails(component);
    },
    enableGoBtn : function(component, event, helper) {
        
        var searchKeyText = component.find('searchKey').get('v.value');
        if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
            component.find('goBtn').set("v.disabled",false);
        } else {
            component.find('goBtn').set("v.disabled",true);
        }
        
        if(event.getParams().keyCode == 13){                                           
            if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
                component.set('v.isGoButtonClicked', true);
                var searchKeyVal = component.find('searchKey').get('v.value');
                var searchFieldVal = component.find('SearchDropDown').get('v.value');
                var operator = component.find('SearchDropDown1').get('v.value');                
                helper.getUserRecordDetails(component, 1, searchKeyVal, searchFieldVal, operator);
            }            
        } 
        
    },
    clearSearchKeyValues : function(component, event, helper) {
        component.find('searchKey').set('v.value','');
    },
    
    pageChange: function(component, event, helper) {
        var searchKeyVal = '';
        var isGoButtonClickedVal = component.get('v.isGoButtonClicked');
        if(isGoButtonClickedVal != null && isGoButtonClickedVal != undefined && isGoButtonClickedVal) {
            searchKeyVal = component.find('searchKey').get('v.value');   
        }
        var searchFieldVal = component.find('SearchDropDown').get('v.value');
        var operator = component.find('SearchDropDown1').get('v.value');
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        setTimeout(function(){ 
            var focusInputField = component.find("focusInputField");
            $A.util.removeClass(focusInputField, 'slds-hide');            	 
            focusInputField.focus();
            $A.util.addClass(focusInputField, 'slds-hide');
            
        }, 600);
        helper.getUserRecordDetails(component, page, searchKeyVal, searchFieldVal, operator);
    },
    
    searchUserRecords : function(component, event, helper) {
        component.set('v.isGoButtonClicked', true);
        var searchKeyVal = component.find('searchKey').get('v.value');
        var searchFieldVal = component.find('SearchDropDown').get('v.value');
        var operator = component.find('SearchDropDown1').get('v.value');
        helper.getUserRecordDetails(component, 1, searchKeyVal, searchFieldVal, operator);
    }
})