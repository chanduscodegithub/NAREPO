({
    doInit: function(component,event,helper) {
    	helper.getRelatedCasePolicies(component,event);
    },
    addPolicies : function(component,event,helper){                        
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component",{attribute:true,'Modalheader':'Add Policies','ModalBody':'AddPoliciesToCaseModal','ModalBodyData':{'accountId':component.get('v.recordId')}}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0; i < newCmp.length; i++){
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });
        }
        event.stopPropagation();
    },
    adddeleteSelectedPolicy: function(component,event,helper) {
        // alert('Policy Id : '+event.getParam('savePolicyId'));        
        // alert(' Delete Policy Id : '+event.getParam('PolicyCaseId'));        
      //  console.log('**************8');
        // alert('Inside deleteSelectedPolicy');
        var dbOperation = '';
        debugger;
        if(event.getParam('isSave')){
            dbOperation = 'INSERT';
            component.set('v.dbOperation',dbOperation);
            var spinner2 = component.find("spinner1");
            $A.util.removeClass(spinner2, 'slds-hide');
            $A.util.addClass(spinner2, 'slds-show');
            
            helper.deleteCasePolicies(component,event,dbOperation,event.getParam('PolicyCaseId'),event.getParam('savePolicyId'));
           
            $A.util.removeClass(spinner2, 'slds-show');
            $A.util.addClass(spinner2, 'slds-hide');
            $A.get('e.force:refreshView').fire();
        }else if(event.getParam('isRemove')){
            dbOperation = 'REMOVE';
            component.set('v.dbOperation',dbOperation);
            component.set('v.PolicyCaseId',event.getParam('PolicyCaseId'));
            component.set('v.savePolicyId',event.getParam('savePolicyId'));
            var casePolicyAlert = component.find('casePolicyAlert');
            for(var i in casePolicyAlert){
                $A.util.addClass(casePolicyAlert[i], 'slds-show');
                $A.util.removeClass(casePolicyAlert[i], 'slds-hide');
            }
        }
    },
    confirmDelete : function(component,event,helper) {
      var dbOperation = component.get('v.dbOperation');  
       var PolicyCaseId= component.get('v.PolicyCaseId');
         var savePolicyId=component.get('v.savePolicyId');
        helper.deleteCasePolicies(component,event,dbOperation,PolicyCaseId,savePolicyId);
        var casePolicyAlert = component.find('casePolicyAlert');
            for(var i in casePolicyAlert){
                $A.util.removeClass(casePolicyAlert[i], 'slds-show');
                $A.util.addClass(casePolicyAlert[i], 'slds-hide');
            }
        }, 
     confirmClose: function(component,event,helper) {
      var casePolicyAlert = component.find('casePolicyAlert');
      for(var i in casePolicyAlert){
                $A.util.removeClass(casePolicyAlert[i], 'slds-show');
                $A.util.addClass(casePolicyAlert[i], 'slds-hide');
            }
        },
    expandCollapse: function(component,event,helper) {
        /* if(!component.get('v.isDesktop')){
            return;
        } */
        
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);   
        $A.util.toggleClass(cmpTarget,'slds-is-open');
        var iconElement = selectedItem.getAttribute("id");
        
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            helper.getRelatedCasePolicies(component,event);
            //$A.util.toggleClass(cmpTarget,'slds-is-open');
        }else if(myLabel=="utility:chevrondown"){          
            component.find(iconElement).set("v.iconName","utility:chevronright");
            //$A.util.toggleClass(cmpTarget,'slds-is-open');
        }      
    },
    addSelectedPolicy : function(component,event,helper) {
        helper.modalGenericClose(component);
        
        var cancel = event.getParam('clicked');
        if(cancel){
            if(!component.get('v.isDesktop')){
                $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
            }
            var businessGroups = null;
            if(component.get('v.isContact')){
                businessGroups = component.get('v.businessGroupsContact');
            }else{
                businessGroups = component.get('v.businessGroups');
            }
            
            if(businessGroups.length>0){
                component.set('v.businessGroups',businessGroups);
            }else{
                component.set('v.BusinessGroupEmptyList', true);
            }
        }else{
            
            var myLabel = component.find('utilityToggle').get("v.iconName");
            if(myLabel=="utility:chevronright"){
                var cmpTarget = component.find('BGH_Applet');
                $A.util.addClass(cmpTarget,'slds-is-open');
                component.find('utilityToggle').set("v.iconName","utility:chevrondown");
            }
            
            var spinner1 = component.find("spinner");
            $A.util.removeClass(spinner1, 'slds-hide');
            
            var spinner2 = component.find("spinner1");
            $A.util.removeClass(spinner2, 'slds-hide');
            
            var appletIcon = component.find("appletIcon");
            $A.util.addClass(appletIcon, 'slds-hide');
            
            var action = component.get('c.addBusinessGroupsToAccount');
            action.setParams({ 'selectedBGHId' : event.getParam('selectedBusinessGroup'),
                              'accountId' : component.get('v.recordId'),
                              'isContact' : component.get('v.isContact')
                             });
            
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    
                    if(component.get('v.isContact')){
                        console.log(JSON.stringify(response.getReturnValue().contactBusinessGroupsonHealth));
                        if(response.getReturnValue().contactBusinessGroupsonHealth != null) {
                            component.set('v.BusinessGroupEmptyList', false);
                            component.set('v.businessGroupsContact', response.getReturnValue().contactBusinessGroupsonHealth);
                        }else{
                            component.set('v.BusinessGroupEmptyList', true);
                        }
                    }else{
                        if(response.getReturnValue().accountBusinessGroupsonHealth != null) {
                            component.set('v.BusinessGroupEmptyList', false);
                            component.set('v.businessGroups', response.getReturnValue().accountBusinessGroupsonHealth);
                        }else{
                            component.set('v.BusinessGroupEmptyList', true);
                        }    
                    }   
                    
                    $A.util.addClass(spinner1, 'slds-hide');
                    $A.util.addClass(spinner2, 'slds-hide');
                    $A.util.removeClass(appletIcon, 'slds-hide');
                    
                    if(!component.get('v.isDesktop')){
                        $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide");
                    }
                }
                else if (state === "INCOMPLETE") {
                    // do something
                }
                    else if (state === "ERROR") {
                        
                        $A.util.addClass(spinner1, 'slds-hide');
                        $A.util.addClass(spinner2, 'slds-hide');
                        $A.util.removeClass(appletIcon, 'slds-hide');
                        var errors = response.getError();
                        if (errors) {
                            if (errors[0] && errors[0].message) {
                                component.set('v.ErrorMessage',errors[0].message);
                                var ErrorMessage = component.find('ErrorMessage');
                                for(var i = 0; i < ErrorMessage.length; i = i+1){
                                    $A.util.addClass(ErrorMessage[i], 'slds-show');
                                    $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                                }
                            }
                        } else {
                            //    $A.util.removeClass(spinner, 'slds-show');
                            //     $A.util.addClass(spinner, 'slds-hide');
                            console.log("Unknown error");
                        }
                    }
                //  $A.util.removeClass(spinner, 'slds-show');
                //  $A.util.addClass(spinner, 'slds-hide');
            });   
            $A.enqueueAction(action);
        }
    },
    modelCloseComponentEvent : function(component,event,helper) {
        helper.modalGenericClose(component,event);      
    },
    closeErrorModal: function(component,event,helper){
        var casePolicyAlert = component.find('casePolicyAlert');
        for(var i in casePolicyAlert){
            $A.util.removeClass(casePolicyAlert[i], 'slds-show');
            $A.util.addClass(casePolicyAlert[i], 'slds-hide');
        }
    }
})