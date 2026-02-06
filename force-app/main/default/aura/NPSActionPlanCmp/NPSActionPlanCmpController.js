({
    generateTemplateFunc:function(component,event,helper){
        var args = event.getParam("arguments");
        var NPSId = args.NPSId;
        helper.getTemplateDesign(component,event,NPSId);
    },
    generateTemplate:function(component,event,helper){
        debugger;
        helper.getTemplateDesign(component,event);
        event.stopPropagation();
    },
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i in ErrorMessage){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
        if($A.util.isEmpty(component.get('v.accountId'))){
            $A.get("e.force:closeQuickAction").fire();
        }
        event.stopPropagation();
    },
    closeSuccess:function(component, event, helper){
        var downLoadSuccess = component.find('downLoadSuccess');
        for(var i in downLoadSuccess){
            $A.util.removeClass(downLoadSuccess[i], 'slds-show');
            $A.util.addClass(downLoadSuccess[i], 'slds-hide');
        }
        event.stopPropagation();
    }
})