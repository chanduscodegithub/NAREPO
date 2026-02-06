({
    Select: function(component, event, helper) {
        
        
        var PolicyCheckBox = component.find('PolicyCheckBox');  
        var isSelectedPolicy = PolicyCheckBox.get("v.value");
        var uncheckParent = false;
        if(isSelectedPolicy){
            uncheckParent =  true;
        }
        var compEvent = component.getEvent("PolicyChildEvent");
        compEvent.setParams({"PolicyObject":component.get('v.PolicyObject'),'isSelectedPolicy':isSelectedPolicy,'uncheckParent':uncheckParent});
        compEvent.fire();
    },
    checkboxSelect: function(component, event, helper) {
        var selectedRec = event.getSource().get("v.value");
    },
    executeMyMethod: function(component, event, helper) {
        console.log('test');
        var params = event.getParam('arguments');
        var resultCmp = component.find("PolicyCheckBox");
        resultCmp.set("v.value",params.selectedeachpolicy);
        var PolicyCheckBox = component.find('PolicyCheckBox');  
        var isSelectedPolicy = PolicyCheckBox.get("v.value");
        var uncheckParent = false;
        if(isSelectedPolicy){
            uncheckParent =  true;
        }
        var compEvent = component.getEvent("PolicyChildEvent");
        compEvent.setParams({"PolicyObject":component.get('v.PolicyObject'),'isSelectedPolicy':isSelectedPolicy,'uncheckParent':uncheckParent});
        compEvent.fire();
    },
})