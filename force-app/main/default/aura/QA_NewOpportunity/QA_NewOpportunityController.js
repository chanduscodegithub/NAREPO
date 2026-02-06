({
    doInit : function(component, event, helper) {
       
        var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP") {
        	component.set('v.isDesktop', true);   
        } else {
            component.set('v.isDesktop', false);
        }
        
        $A.createComponents([["c:ModalComponent_MembershipActivityQA",{'ModalData':{'recordTypeId':component.get('v.recordId')}}]],
                            function(newCmp, status){ 
                                if (component.isValid() && status === 'SUCCESS') {
                                    var dynamicComponentsByAuraId = {};
                                    for(var i=0;i<newCmp.length;i++) {
                                        var thisComponent = newCmp[i];
                                        dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                    }
                                    component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                    component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                    component.set("v.body", newCmp); 
                                } 
                            });
    },
    
    modelCloseComponentEvent : function(component, event,helper) {
        helper.modalGenericClose(component, event);
    },
    
    modelCloseQAComponentEvent : function(component, event,helper) {
        helper.modalGenericClose1(component, event);
    }
})