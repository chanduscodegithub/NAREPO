({
	doInit : function(component, event, helper) {
        
        var modalComponentPHONE = component.find('contact_History_Modal_PHONE');
        $A.util.addClass(modalComponentPHONE, 'open');
        
        $A.createComponents([["c:"+component.get('v.ModalBody'),{'tableBodyHeight':'','Child_Data':component.get('v.ModalBodyData'),attribute:true}]],
                            function(newCmp, status){ 
                                if (component.isValid() && status === 'SUCCESS') { 
                                    component.set("v.body", newCmp); 
                                } 
                            });
    },
    
    fireComponentEvent : function(cmp, event) {
        var cmpEvent = cmp.getEvent("modalCmpCloseEvent");
        cmpEvent.setParams({
            "refresh" : cmp.get("v.refreshOnClosingModel") });
        cmpEvent.fire();
    },
    
    modalClose : function(component, event, helper) {          
        component.set("v.body", []);
        var modalComponent = component.find('contact_History_Modal_PHONE');
        $A.util.removeClass(modalComponent, 'open');            
    }
})