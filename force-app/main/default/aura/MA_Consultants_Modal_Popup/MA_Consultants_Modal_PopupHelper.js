({
    getAllConsultants : function(component, page, searchKey, searchFieldVal, operatorVal){
        component.set('v.isSpinnertoLoad1', true);
        
        var contactRecordTypeId = component.get('v.Child_Data').contactRecordType;
        var recordId = component.get('v.Child_Data').maRecordId;
        console.log('recordId >>>> '+recordId);
    
        page = page || 1; 
        searchKey = searchKey || "";
        searchFieldVal = searchFieldVal || "";
        operatorVal = operatorVal || "";
        
		var action = component.get("c.getConsultants");
        action.setParams({
            "searchKeyVal": searchKey,
            "pageNumber": page,
            "searchField":searchFieldVal,
            "operator":operatorVal,
            "contactRecordTypeId":'',
            "maID":recordId,
            "allContacts":true, 
            "existingConIds" :component.get('v.existingConIds')
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    var responseObj = response.getReturnValue();
					console.log('responseObj.consultantList--->>'+JSON.stringify(responseObj.consultantList));
                    var searchKeyText = component.find('searchKeywordForConsultants').get('v.value');
                        if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
                            component.find('goBtn').set("v.disabled",false);
                            component.find('clrBtn').set("v.disabled",false);
                        } else {
                            component.find('goBtn').set("v.disabled",true);
                            //component.find('clrBtn').set("v.disabled",true);
                        }
                    console.log('responseObj.consultantList.length >>>>> '+responseObj.consultantList.length);
                    if((responseObj.consultantList == null) || (responseObj.consultantList != null && responseObj.consultantList.length == 0)) {
                        component.set('v.isConsultantsListEmpty', true);
                    } else {
                        component.set('v.isConsultantsListEmpty', false);
                    }
                    component.set("v.consultingSearch", responseObj.consultantList);
                    component.set("v.page", responseObj.page);
                    component.set("v.total", responseObj.total);
                    component.set("v.pages", Math.ceil(responseObj.total/responseObj.pageSize));
                    component.set("v.isPrimaryExists", responseObj.recordExists);
                } else {
                    component.set('v.isConsultantsListEmpty', true);
                }
                component.set('v.isSpinnertoLoad1', false);
            }
            else if (state === "INCOMPLETE") {  
                component.set('v.isSpinnertoLoad1', false);
            }
                else if (state === "ERROR") {
                    console.log('Error stage');
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    component.set('v.isSpinnertoLoad1', false);
				}
        });
        $A.enqueueAction(action);
    },
    
    getConsultantsRecords : function(component, page, searchKey, searchFieldVal, operatorVal) {
    	component.set('v.isSpinnertoLoad1', true);
        
        var contactRecordTypeId = component.get('v.Child_Data').contactRecordType;
        var recordId = component.get('v.Child_Data').maRecordId;
    
        page = page || 1; 
        searchKey = searchKey || "";
        searchFieldVal = searchFieldVal || "";
        operatorVal = operatorVal || "";
        
		var action = component.get("c.getConsultants");
        action.setParams({
            "searchKeyVal": searchKey,
            "pageNumber": page,
            "searchField":searchFieldVal,
            "operator":operatorVal,
            "contactRecordTypeId":'',
            "maID":recordId,
            "allContacts":false,
            "existingConIds" :component.get('v.existingConIds')
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    var responseObj = response.getReturnValue();
					console.log('responseObj.relatedConsultantList--->>'+JSON.stringify(responseObj.relatedConsultantList));
                    var searchKeyText = component.find('searchKeywordForConsultants').get('v.value');
                        if(searchKeyText != undefined && searchKeyText != null && searchKeyText.trim().length > 0) {
                            component.find('goBtn').set("v.disabled",false);
                            component.find('clrBtn').set("v.disabled",false);
                        } else {
                            component.find('goBtn').set("v.disabled",true);
                            //component.find('clrBtn').set("v.disabled",true);
                        }
                    if((responseObj.relatedConsultantList == null) || (responseObj.relatedConsultantList != null && responseObj.relatedConsultantList.length == 0)) {
                        component.set('v.isConsultantsListEmpty', true);
                    } else {
                        component.set('v.isConsultantsListEmpty', false);
                    }
                    component.set("v.consultingSearch", responseObj.relatedConsultantList);
                    component.set("v.page", responseObj.page);
                    component.set("v.total", responseObj.total);
                    component.set("v.pages", Math.ceil(responseObj.total/responseObj.pageSize));
                    component.set("v.isPrimaryExists", responseObj.recordExists);
                } else {
                    component.set('v.isConsultantsListEmpty', true);
                }
                component.set('v.isSpinnertoLoad1', false);
            }
            else if (state === "INCOMPLETE") {  
                component.set('v.isSpinnertoLoad1', false);
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            component.set('v.ErrorMessage',errors[0].message);
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
                        }
                    } else {
                        console.log("Unknown error");
                    }
                    component.set('v.isSpinnertoLoad1', false);
				}
        });
        $A.enqueueAction(action);
	},
    
    openMailPopup : function(component, event, header, cmp){
       debugger;
        var childData ='';
        if(component.get('v.isFromQA')){
            childData = {'opportunityData' : component.get('v.opportunityData'),'isFromQA': component.get('v.isFromQA')} 
        }else{
            childData = {'maId' :component.get('v.Child_Data').maRecordId,'isFromQA': component.get('v.isFromQA'),'opportunityData' : ''}
        }
         //childData = {'maId' :component.get('v.Child_Data').maRecordId,'opportunityData' : component.get('v.opportunityData'),'isFromQA': component.get('v.isFromQA')}
        $A.createComponents([["c:Modal_Component_Small",{attribute:true, 'ModalBodyData':childData, 'Modalheader':header,'ModalBody':cmp}]],
                            function(newCmp, status){ 
                                
                                if (component.isValid() && status === 'SUCCESS') {
                                    var dynamicComponentsByAuraId = {};
                                    for(var i=0; i < newCmp.length; i++) {
                                        var thisComponent = newCmp[i];
                                        dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                    }
                                    component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                    component.set("v.dynamicComponentAuraId", thisComponent.getLocalId());
                                    component.set("v.body", newCmp);
                                } 
                            });
    }
})