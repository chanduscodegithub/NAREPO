({
	doInit : function(component, event, helper) {
        if(component.get('v.Child_Data.isAggregator') != undefined && component.get('v.Child_Data.isAggregator') != null) {
          	component.set('v.IsAggregator', component.get('v.Child_Data.isAggregator')); 
            var isAggregatorVal = component.get('v.IsAggregator');
            if(isAggregatorVal != undefined && isAggregatorVal != null && isAggregatorVal) {
                $A.util.addClass(component.find("searchLabel"), 'search-label');
            } else {
                $A.util.removeClass(component.find("searchLabel"), 'search-label');
            }
        }
        if(component.get('v.Child_Data.isAggregatorsToBeShownVal') != undefined && component.get('v.Child_Data.isAggregatorsToBeShownVal') != null) {
          	component.set('v.isAggregatorsToBeShown', component.get('v.Child_Data.isAggregatorsToBeShownVal'));  
        }
        console.log('load Search');
        component.set('v.isGoButtonClicked', false);
        component.find('searchKey').set('v.value','');
        component.find('SearchDropDown').set('v.value','LastName');
        component.find('SearchDropDown1').set('v.value','Begins With');
        helper.getAccountRecordsDetails(component);
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
                helper.getAccountRecordsDetails(component, 1, searchKeyVal, searchFieldVal, operator);
            }            
        }
    },
                                              
    clearSearchKeyValues : function(component, event, helper) {
        component.find('searchKey').set('v.value','');
    },
    
    addAccountData : function(component, event, helper) {
        var cmpEvent = component.getEvent("modalCmpCloseEvent");
        cmpEvent.setParams({"isAccount":true,"isRecordCreated":true});
        cmpEvent.fire();
        console.log('addAccountData');
        var accountData = event.getParam('AccountData');
        var compEvent = component.getEvent("QA_Event");
        compEvent.setParams({"AccountData":accountData});
        compEvent.fire();
    },
    
    pageChange: function(component, event, helper) {
        
        setTimeout(function() { 
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
        var searchFieldVal = component.find('SearchDropDown').get('v.value');
        var operator = component.find('SearchDropDown1').get('v.value');
		var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        helper.getAccountRecordsDetails(component, page, searchKeyVal, searchFieldVal, operator);
	},
    
    searchUserRecords : function(component, event, helper) {
        component.set('v.isGoButtonClicked', true);
        var searchKeyVal = component.find('searchKey').get('v.value');
        var searchFieldVal = component.find('SearchDropDown').get('v.value');
        var operator = component.find('SearchDropDown1').get('v.value');
        helper.getAccountRecordsDetails(component, 1, searchKeyVal, searchFieldVal, operator);
    },
    
    closeErrorModal: function(component, event, helper) {
        var ErrorMessage = component.find('ErrorMessage');
        for(var i=0;i<ErrorMessage.cmAccountTeamHistoryObj;i++){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    }
})