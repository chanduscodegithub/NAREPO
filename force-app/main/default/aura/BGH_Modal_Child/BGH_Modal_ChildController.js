({
    Select: function(component, event, helper) {
        var BGHcheckbox = component.find('BGHcheckbox');              
        var bghcheck = BGHcheckbox.get("v.value");
        if(bghcheck){
            component.set('v.selectedBGH',false);
        }else{
            component.set('v.selectedBGH',true);
        }
        
        var compEvent = component.getEvent("BGHChildEvent");
        compEvent.setParams({"BGHId":component.get('v.BGHId'),'selectedBGH':component.get('v.selectedBGH')});
        compEvent.fire();
    }
})