({
    deleteCasePolicies : function(component,event,dbOperation,deleteID,saveId) {
        var action = '';   
       
        if(dbOperation == "INSERT"){
            this.modalGenericClose(component);
            action = component.get("c.savePolicyList");
            action.setParams({
                CaseID : component.get('v.recordId'),
                PolicyList : saveId
            });
        }else if(dbOperation == "REMOVE"){
            action = component.get("c.deletePolicyList");
            action.setParams({
                CaseID :component.get('v.recordId'),
                PolicyId : deleteID
            });
        }
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                $A.get('e.force:refreshView').fire();
                this.getRelatedCasePolicies(component,event);
            } else if (state === "ERROR") {                
                var errors = response.getError();
                if (errors) {                    
                    if (errors[0] && errors[0].message) {                                                
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    },
    modalGenericClose : function(component,event) {
        /*   component.set("v.scrollStyleForDevice","@media screen and (min-width: 320px) and (max-width: 1199px){.panel-content.scrollable{overflow-y: hidden !important;-webkit-overflow-scrolling: auto !important ;}}");
        var device = $A.get("$Browser.formFactor"); */
        var device = $A.get("$Browser.formFactor"); 
        if(device == "DESKTOP"){
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []);
        }
    },
    
    getRelatedCasePolicies : function(component,event){
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        
        var caseid = component.get("v.recordId");
        var action = component.get("c.RelatedCasePoliciesList");
        action.setParams({ CaseID : component.get("v.recordId") });
        action.setCallback(this,function(response){
            
            var state = response.getState();
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
            if(state == "SUCCESS") {
                //alert(response);
               // component.set("v.CasePolicyList", response.getReturnValue());
                console.log('one'+response.getReturnValue());
                 if(response.getReturnValue() != null) {
                    var responseObj = response.getReturnValue();
                    component.set("v.CasePolicyList", response.getReturnValue());
                    if(responseObj != null && responseObj.length > 0){
                        component.set('v.hasRecords',true);
                    }else{
                        component.set('v.hasRecords',false);
                    }
                   // alert(responseObj.length);
                } 
            }
            // $A.util.removeClass(spinner, 'slds-show');
            //$A.util.addClass(spinner, 'slds-hide');
            /*      
            } else if (state === "ERROR") {                
                var errors = response.getError();
                if (errors) {                    
                    if (errors[0] && errors[0].message) {                                                
                    }
                } else {
                    console.log("Unknown error");
                }
            }*/
            console.log('Success Object:'+component.get("v.CasePolicyList"));
            console.log('State Success'+state);
            
        });
        $A.enqueueAction(action);
        
    }
})