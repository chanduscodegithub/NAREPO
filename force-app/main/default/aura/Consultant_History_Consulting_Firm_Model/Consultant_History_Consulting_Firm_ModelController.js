({
	doInit : function(component, event, helper) {
        component.set('v.isGoButtonClicked', false);
        component.find('searchKey').set('v.value','');        
        component.find('SearchDropDown').set('v.value','LastName');
        component.find('SearchDropDown1').set('v.value','Begins With');
        helper.getAllContactOfTypeConsultantFromController(component);        
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
                helper.getAllContactOfTypeConsultantFromController(component, 1, searchKeyVal, searchFieldVal, operator);
            }            
        }                
    },
    addSelectedComponent : function(component, event, helper) {
        var contactId = event.getParam('contactOfTypeConsultantObjId')      
       
        var cmpEvent = component.getEvent("searchConsultantEvent");
        cmpEvent.setParams({"contactOfTypeConsultantObjId":contactId});
        cmpEvent.fire();
    },
    clearSearchKeyValues : function(component, event, helper) {
        component.find('searchKey').set('v.value','');
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
            searchKeyVal = component.find('searchKey').get('v.value');   
        }
        //var searchKeyVal = component.find('searchKey').get('v.value');
        var searchFieldVal = component.find('SearchDropDown').get('v.value');
        var operator = component.find('SearchDropDown1').get('v.value');
		var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        helper.getAllContactOfTypeConsultantFromController(component, page, searchKeyVal, searchFieldVal, operator);
	},
    searchUserRecords : function(component, event, helper) {
        component.set('v.isGoButtonClicked', true);
        var searchKeyVal = component.find('searchKey').get('v.value');
        var searchFieldVal = component.find('SearchDropDown').get('v.value');
        var operator = component.find('SearchDropDown1').get('v.value');
        helper.getAllContactOfTypeConsultantFromController(component, 1, searchKeyVal, searchFieldVal, operator);
    },
    clearDropDown : function(component, event, helper) {
        component.find('searchKey').set('v.value','');
        component.find('SearchDropDown1').set('v.value','');
    },
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i = 0; i < ErrorMessage.length ; i=i+1){        
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    }
})