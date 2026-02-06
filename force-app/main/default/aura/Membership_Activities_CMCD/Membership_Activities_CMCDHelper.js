({    
    getMembershipActivities : function(component,page,event) {
        var spinner = component.find("spinnerMA");
        $A.util.removeClass(spinner, 'slds-hide');
        
        var spinner2 = component.find("spinner");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        page = page || 1;
        var Action = component.get('c.getMembershipActivitiesCMCDOnAppletLoad');	
        Action.setParams({
            "accountId" : component.get('v.recordId'),
            "pageNumber": page,
            "columnName" : 'EffectiveDate__c',
            "sortType" : 'Desc'            
        });
        Action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                if(response.getReturnValue().MembershipActivityList != null && response.getReturnValue().MembershipActivityList.length > 0) {
                    component.set('v.membershipActivitiesDataArray', response.getReturnValue().MembershipActivityList);
                    component.set("v.page", response.getReturnValue().page);
                    component.set("v.total", response.getReturnValue().total);
                    component.set("v.pages", Math.ceil(response.getReturnValue().total/response.getReturnValue().pageSize));
                }else{
                    component.set('v.MembershipActivityEmptyList', true);
                    component.set("v.page", response.getReturnValue().page);
                    component.set("v.total", response.getReturnValue().total);
                    component.set("v.pages", Math.ceil(response.getReturnValue().total/response.getReturnValue().pageSize));
                }               
            }
            else if (state === "SUCCESS") {  
                component.set('v.ErrorMessage',$A.get("$Label.c.Internerconnectionfail"));
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
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
                }
            //var state = response.getState();
           
            $A.util.addClass(spinner, 'slds-hide');            
        	$A.util.addClass(spinner2, 'slds-hide');
        });        
        $A.enqueueAction(Action);
    },
    
    sortBy : function(component, event, fieldName,page,sortFieldComp) {
        page = page || 1;
        var spinner = component.find("spinnerMA");
        $A.util.removeClass(spinner, 'slds-hide');
        
        var spinner2 = component.find("spinner");
        $A.util.removeClass(spinner2, 'slds-hide');
      
        var Action = component.get("c.getMembershipActivitiesCMCDOnAppletLoad");
        if(component.get("v."+sortFieldComp) ===  true) {
            Action.setParams({
                "accountId" : component.get('v.recordId'),
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'ASC'
            });
            component.set("v."+sortFieldComp, false);
        } else {
            Action.setParams({
                "accountId" : component.get('v.recordId'),
                "pageNumber": page,
                "columnName" : fieldName,
                "sortType" : 'DESC'
            });
            component.set("v."+sortFieldComp, true);
        }
        
        Action.setCallback(this,function(response) {
            var state = response.getState();      
            $A.util.addClass(spinner, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-hide');
            if (state === "SUCCESS") {    
                if(response.getReturnValue().MembershipActivityList != null && response.getReturnValue().MembershipActivityList.length > 0) {
                    component.set('v.MembershipActivityEmptyList', false);
                    component.set('v.membershipActivitiesDataArray', response.getReturnValue().MembershipActivityList);
                    component.set("v.page", response.getReturnValue().page);
                    component.set("v.total", response.getReturnValue().total);
                    component.set("v.pages", Math.ceil(response.getReturnValue().total/response.getReturnValue().pageSize));
                }else{
                    component.set('v.MembershipActivityEmptyList', true);
                    component.set("v.page", response.getReturnValue().page);
                    component.set("v.total", response.getReturnValue().total);
                    component.set("v.pages", Math.ceil(response.getReturnValue().total/response.getReturnValue().pageSize));
                }               
            }
            else if (state === "INCOMPLETE") {  
                component.set('v.ErrorMessage',$A.get("$Label.c.Internerconnectionfail"));
                            var ErrorMessage = component.find('ErrorMessage');
                            for(var i in ErrorMessage){
                                $A.util.addClass(ErrorMessage[i], 'slds-show');
                                $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                            }
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
                }
        });        
        $A.enqueueAction(Action);
    },
    
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
            
            $A.createComponents([["c:Panel_Component",{attribute:true,'Modalheader':'MembershipActivity QA','ModalBody':'MembershipActivity_QA'}]],
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
    
    modalGenericClose1 : function(component, event) {
            
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []);
            
            var isVal = event.getParam('assistedMACreation');
            var isRecordCreated = event.getParam('isRecordCreated');
            //if(component.get('v.isDesktop')) {
                if(isVal != undefined && isVal != null && isVal) {
                    this.gotoURL(component, event);
                }
            //}

        
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
                } 
            }
        }
    },
    
    checkEditAccesToThisUser : function(component, event) {
        var action = component.get("c.getLoggedInUerRoleInfo"); 
         if(action == undefined || action == null){
            return;
        }
        action.setCallback(this,function(response) {
            var state = response.getState();
            if(state == "SUCCESS") {
                component.set('v.isEditAccess', response.getReturnValue());                     
            }else{
                component.set('v.isEditAccess', false);
            }
        });
        $A.enqueueAction(action);
    },
})