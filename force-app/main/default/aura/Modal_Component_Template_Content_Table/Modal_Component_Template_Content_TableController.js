({
	Select: function(component, event, helper) {
        var valueCheckbox = component.find('valueCheckbox');              
        var valCheck = valueCheckbox.get("v.value");
        if(valCheck){
            component.set('v.selectedVal',false);
        }else{
            component.set('v.selectedVal',true);
        }
        
        var compEvent = component.getEvent("MultiCheckDataSelect");
        compEvent.setParams({"ValName":component.get('v.dataToDisplayObj'),'selectedVal':component.get('v.selectedVal')});
        compEvent.fire();
    }
})