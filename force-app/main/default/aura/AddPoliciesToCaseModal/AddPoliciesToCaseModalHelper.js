({
	getPolicyRecords : function(component) {
        
        var spinner = component.find("userLoadingspinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        var childData = component.get('v.Child_Data');
                
		var action = component.get("c.getPolicies");
        action.setParams({
            CaseID : childData['accountId']
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    var responseObj = response.getReturnValue();
                     component.set("v.PolicyList", responseObj);
                    if(responseObj != null && responseObj.length > 0){
                        component.set('v.hasRecords',true);
                    }else{
                        component.set('v.hasRecords',false);
                    }
                   // alert(responseObj.length);
                } else {                    
                }
                $A.util.removeClass(spinner, 'slds-show');
            	$A.util.addClass(spinner, 'slds-hide');
                
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
    /*modalGenericClose : function(component) {
       // component.set("v.scrollStyleForDevice","@media screen and (min-width: 320px) and (max-width: 1199px){.panel-content.scrollable{overflow-y: hidden !important;	-webkit-overflow-scrolling: auto !important ;}}");
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []);
        }else{
            var modalComponent = component.get("v.dynamicComponentsByAuraId");
            modalComponent = modalComponent[component.get("v.dynamicComponentAuraId")];
            modalComponent.modalClosing();
            component.set("v.dynamicComponentsByAuraId", {});
            component.set("v.dynamicComponentAuraId", '');
            component.set("v.body", []); 
        }
    }, */
    confirmClose:function (component,event){
        //var childData = component.get('v.Child_Data');       
        var compEvent = component.getEvent("CloseCasePolicyModalEvent");    
        compEvent.fire();
    }, 
    
    savePolicies:function (component,event){
        var childData = component.get('v.Child_Data');
        var PoliciesToSave = component.get('v.selectedPoliciesList');
        var compEvent = component.getEvent("IndividualPolicyChildEvent");
        compEvent.setParams({"savePolicyId":PoliciesToSave,"isSave":true});
        compEvent.fire();
    }
})