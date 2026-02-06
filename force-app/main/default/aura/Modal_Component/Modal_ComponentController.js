({
    doInit : function(component, event, helper) { 
        //component.set("v.modalcssStyle", ".slds-global-header_container{position:static} body.desktop{overflow:hidden} .forceStyle.desktop .viewport .stage{position:relative;z-index: 99}");        
        var modalComponent = component.find('contact_History_Modal');
        for(var i in modalComponent){
            $A.util.removeClass(modalComponent[i], 'slds-backdrop--hide');
            $A.util.addClass(modalComponent[i], 'slds-backdrop--open');
        }
        
        $A.createComponents([["c:"+component.get('v.ModalBody'),{'tableBodyHeight':'fixed-body-height','Child_Data':component.get('v.ModalBodyData'),attribute:true}]],
                            function(newCmp, status){ 
                                if (component.isValid() && status === 'SUCCESS') { 
                                    component.set("v.body", newCmp); 
                                } 
                            });
    },
    fireComponentEvent : function(cmp, event) {
        var cmpEvent = cmp.getEvent("modalCmpCloseEvent");
        cmpEvent.setParams({
            "refresh" : cmp.get("v.refreshOnClosingModel"),
            "isQA":cmp.get("v.ModalBodyData.isQA"),
            "isAccount":cmp.get("v.ModalBodyData.isAccount") });
        cmpEvent.fire();
    },
    modalClose : function(component, event, helper) {
        console.log('close modal');
        //component.set("v.modalcssStyle", ".slds-global-header_container{position:fixed} body.desktop{overflow:visible} .forceStyle.desktop .viewport .stage{position:relative;z-index: 2}");        
        component.set("v.body", []);
        var modalComponent = component.find('contact_History_Modal');
        for(var i in modalComponent){
            $A.util.addClass(modalComponent[i], 'slds-backdrop--hide');
            $A.util.removeClass(modalComponent[i], 'slds-backdrop--open');
        }        
    },
})