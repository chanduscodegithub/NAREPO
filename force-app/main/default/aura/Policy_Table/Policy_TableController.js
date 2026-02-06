({
	 removeCasePolicy: function(component, event, helper) {
        var PolicyCheckBox = component.find('deleteIcon');  
      //  var isSelectedPolicy = PolicyCheckBox.get("v.value");
		      //  alert(component.get('v.PolicyObject.Id'));
        var compEvent = component.getEvent("IndividualPolicyChildEvent");
         compEvent.setParams({"PolicyCaseId":component.get('v.PolicyObject.Id'),'isRemove':true});
        compEvent.fire();
    }   

})