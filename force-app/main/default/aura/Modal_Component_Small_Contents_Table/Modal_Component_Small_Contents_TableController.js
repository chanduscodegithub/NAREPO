({
    doInit : function(component, event){
        var selectedVals = component.get('v.inputBoxValue');
        if(selectedVals != undefined){
            if(selectedVals.length > 0){
                if(selectedVals.indexOf(component.get('v.dataToDisplayObj')) > -1){
                    component.find('valueCheckbox').set('v.value', true);
                }
            }    
        }
    },
    
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