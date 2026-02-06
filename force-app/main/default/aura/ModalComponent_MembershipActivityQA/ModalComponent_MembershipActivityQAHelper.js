({
    createRecord : function (component, event, helper) {
        
        var accountId = null;
        var recordTypeId = null;
        if(component.get('v.ModalData') != undefined && component.get('v.ModalData') != null) {
            if(component.get('v.ModalData.accountId') != undefined && component.get('v.ModalData.accountId') != null) {
                accountId = component.get('v.ModalData.accountId');
            }
            if(component.get('v.ModalData.recordTypeId') != undefined && component.get('v.ModalData.recordTypeId') != null) {
                recordTypeId = component.get('v.ModalData.recordTypeId');
            }
        }
        
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        var today = yyyy+'-'+mm+'-'+dd;
        
        var createRecordEvent = $A.get("e.force:createRecord");
        createRecordEvent.setParams({
            "entityApiName": "Opportunity",
            'defaultFieldValues': {
                "AccountId": accountId,
                "StageName" : "Open",
                "CloseDate": today
            },
            'recordTypeId':recordTypeId
        });
        createRecordEvent.fire();
    },
    
    navigateToListView : function(component, event, helper) {
        
        var action = component.get("c.getListViews");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var listviews = response.getReturnValue();
                console.log('ListView'+listviews);
                var navEvent = $A.get("e.force:navigateToList");
                navEvent.setParams({
                    "listViewId": listviews[0].Id,
                    "listViewName": listviews[0].Name,
                    "scope": "Opportunity"
                });
                navEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },
    
    getrecordTypeDetails : function(component, event, recordTypeName, accountId) {
        
        var action = component.get('c.queryAccountsAndRecordTypeValues');	    
        action.setParams({
            "accountId" : accountId,
            "oppRecordType" : recordTypeName 
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {                
                var responseObj = response.getReturnValue();
                var accountName = '';
                if(accountId != undefined && accountId != null) {
                    if(responseObj.accountData != undefined && responseObj.accountData != null) {
                        accountName = responseObj.accountData.Name;
                        component.set('v.ModalData.AccountName', accountName);
                        component.set('v.ModalData.category', responseObj.accountData.Category__c);
                        component.set('v.ModalData.category', responseObj.accountData.Category__c);
                        component.set('v.ModalData.OwnerName', responseObj.accountData.Owner.Name);
                        component.set('v.ModalData.OwnerId', responseObj.accountData.Owner.Id);
                    }
                }
                if(responseObj.recordTypeData != undefined && responseObj.recordTypeData != null) {
                    component.set('v.ModalData.recordTypeId', responseObj.recordTypeData.Id);
                }
                /*var changeValue = component.get('v.selectedOptionValue');
                if(changeValue == 'Assisted MA Creation') {
                    var cmpEvent = component.getEvent("modalQACmpCloseEvent");
                    cmpEvent.setParams({
                        "assistedMACreation":true,
                        "isQA":true,
                        "isAccount":false,
                        "QADataFromChildComponent":{'AccountName':accountName,
                                                        'RecordTypeId':component.get('v.ModalData.recordTypeId')
					}});
                    /*if(accountId != undefined && accountId != null) {
                        cmpEvent.setParams({
                            "assistedMACreation":true,
                            "isQA":true,
                            "isAccount":false,
                            "QADataFromChildComponent":{'AccountName':accountName,
                                                        'RecordTypeId':component.get('v.ModalData.recordTypeId')
						}});  
                    } else {
                        cmpEvent.setParams({
                            "assistedMACreation":true,
                            "isQA":true,
                            "isAccount":false,
                            "QADataFromChildComponent":{'RecordTypeId':component.get('v.ModalData.recordTypeId')
						}}); 
                    }
                    cmpEvent.fire();
                } else if(changeValue == 'Create New Record') {
                    this.createRecord(component, event);
                } else if(changeValue == 'Go To List View') {
                    this.navigateToListView(component, event);
                }*/
            }
            else if (state === "INCOMPLETE") { 
                
            } else if (state === "ERROR") {                    
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        alert("Error message: " + errors[0].message);
                        //this.showAlert(component,errors[0].message,component.get('v.exceptionType'));
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });        
        $A.enqueueAction(action);
        
    },
    
    modalGenericClose : function(component, event) {
        if(event.getParam('isAccount') != undefined && event.getParam('isAccount') != null && event.getParam('isAccount')) {
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []);
            
            var isVal = event.getParam('assistedMACreation');
            var isRecordCreated = event.getParam('isRecordCreated');
            if(component.get('v.isDesktop')) {
                if(isVal != undefined && isVal != null && isVal) {
                    this.gotoURL(component, event);
                } else if(isRecordCreated == undefined || isRecordCreated == null || isRecordCreated == false) {
                    this.navigateToListView(component, event);
                } 
            }
        }
    }    
})