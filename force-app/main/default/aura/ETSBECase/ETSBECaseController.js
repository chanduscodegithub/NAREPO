({
    doInit: function (cmp, event, helper) {
        var page = 1;
        helper.getETSRecords(cmp,page,event,cmp.get('v.sortField'),cmp.get('v.sortOrder'));
    },
    pageChange: function(component, event, helper) {
        var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        setTimeout(function(){ 
            var focusInputField = component.find("focusInputField");
            $A.util.removeClass(focusInputField, 'slds-hide');            	 
            focusInputField.focus();
            $A.util.addClass(focusInputField, 'slds-hide');
            
        }, 600);
        helper.getETSRecords(component,page,event,component.get('v.sortField'),component.get('v.sortOrder'));
    },
    navigateToIssueDetailPage : function(component, event, helper){
        var selectedItem = event.currentTarget;
        var recId = selectedItem.dataset.record;
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": recId,
            "slideDevName": "related",
            //"isredirect":true
        });
        navEvt.fire();
    },
    newButtonOnclick : function(component, event, helper){
        helper.newButtonOnclick(component, event);
    },
    CloseRecordTypeModal:function(component,event,helper){
        var copuUrl = component.find('recordTypeModal');
        for(var i=0; i< copuUrl.length; i++){
            $A.util.addClass(copuUrl[i], 'slds-hide');
            $A.util.removeClass(copuUrl[i], 'slds-show');
        }
    },
    handleChange : function(component,event,helper){
        var selctedValue = event.getSource().get("v.value");
        component.set('v.recordTypeId',selctedValue); 
    },
    createCaseRecord : function(component,event,helper){
        var createRecordEvent = $A.get("e.force:createRecord");
        createRecordEvent.setParams({
            "entityApiName": "Case",
            'defaultFieldValues': {
                'AccountId':component.get('v.recordId')
            },
            'recordTypeId':component.get('v.recordTypeId')
        });
        createRecordEvent.fire();
        var copuUrl = component.find('recordTypeModal');
        for(var i=0; i< copuUrl.length; i++){
            $A.util.addClass(copuUrl[i], 'slds-hide');
            $A.util.removeClass(copuUrl[i], 'slds-show');
        }
    },
    sortFields: function(component,event,helper){
        var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        var fieldItagsWithAuraAttrMap = '{"Owner.Name":"sortAssignedToAsc","Status":"sortStatusAsc","RecordType.Name":"sortRecordTypeAsc"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];       
        var page = 1;
        helper.sortBy(component, event, fieldNameToBeSorted,page,sortFieldCompName);
    }
})