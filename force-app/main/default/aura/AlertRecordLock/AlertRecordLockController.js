({
    doInit: function(cmp){       
    },
    confirmOk: function(component, event, helper) {
        var resetConfirm = component.find('resetConfirm');
        for(var i = 0; i < resetConfirm.length ; i=i+1){
            $A.util.removeClass(resetConfirm[i], 'slds-show');
            $A.util.addClass(resetConfirm[i], 'slds-hide');
        }  
    }
})