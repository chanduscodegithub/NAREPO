({
    gotoURL:function(component, event) {

        var qaData = event.getParam('QADataFromChildComponent');

        var accountCategory = qaData.category;
        var accountCategoryName = '';
        var componentName = '';
        var displayName = '';
        if(accountCategory != undefined && accountCategory != null && accountCategory != '') {
            if(accountCategory == 'Client Management') {
                accountCategoryName = 'Client Management';
                componentName = 'MembershipActivityCM_QA';
                displayName = 'CM Membership Activity Q&A';
            } else {
                accountCategoryName = 'Client Development';
                componentName = 'MembershipActivityCD_QA';
                displayName = 'CD Membership Activity Q&A';
            }
        }
        
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component",
                                  {attribute:true, 
                                   'Modalheader':displayName,
                                   'ModalBody':componentName,
                                   'ModalBodyData':{'accountName':qaData.accountName,
                                                    'accountId':qaData.accountId,
                                                    'recordTypeId':qaData.recordTypeId,
                                                    'category':accountCategoryName,
                                                    'ownerName':qaData.ownerName,
                                            		'ownerId':qaData.ownerId,
                                                    'isQA':true,
                                                    'isAccount':false,
                                                    'isOpp':true}}]],
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
            
        } else {
            
            $A.createComponents([["c:Panel_Component",
                                  {attribute:true, 
                                   'Modalheader':'MembershipActivity QA',
                                   'ModalBody':'MembershipActivity_QA',
                                   'ModalBodyData':{'accountType':'Client Management',
                                                    'recordTypeId':qaData.RecordTypeId,
                                                    'isQA':true,
                                                    'isAccount':false,
                                                    'isOpp':true}}]],
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
    
    modalGenericClose1 : function(component, event) {
            
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

        
    },
    
    modalGenericClose : function(component, event) {
        if(event.getParam('isAccount') != undefined && event.getParam('isAccount') != null && !event.getParam('isAccount')) {
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