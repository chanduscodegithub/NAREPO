({
	getSelectedValues: function(component){
    var options = component.get("v.options_");
    var values = [];
    options.forEach(function(element) {
      if (element.selected) {
        values.push(element.value);
      }
    });
    return values;
  },
    getSelectedLabels: function(component){
    var options = component.get("v.options_");
    var labels = [];
    options.forEach(function(element) {
      if (element.selected) {
        labels.push(element.label);
      }
    });
    return labels;
  },
    searchHelper : function(component,event,getInputkeyWord) {
       
     var action = component.get("c.fetchLookUpValues");
        action.setParams({
            'searchKeyWord': getInputkeyWord,
           'accountId': component.get('v.accountId'),
          });
        action.setCallback(this, function(response) {
          $A.util.removeClass(component.find("mySpinner"), "slds-show");
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                if (storeResponse.length == 0) {
                    component.set("v.Message", 'No Result Found...');
                } else {
                    component.set("v.Message", '');
                }
                component.set("v.listOfSearchRecords", storeResponse);
            }
 
        });
        $A.enqueueAction(action);
   
},
    searchHelper2 : function(component,event,getInputkeyWord2) {
       
     var action = component.get("c.fetchLookUpValues");
        action.setParams({
            'searchKeyWord': getInputkeyWord2,
           'accountId': component.get('v.accountId'),
          });
        action.setCallback(this, function(response) {
          $A.util.removeClass(component.find("mySpinner"), "slds-show");
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                if (storeResponse.length == 0) {
                    component.set("v.Message", 'No Result Found...');
                } else {
                    component.set("v.Message", '');
                }
                component.set("v.listOfSearchRecords2", storeResponse);
            }
 
        });
        $A.enqueueAction(action);
   
},
    
    setInfoText: function(component, values) {
    var values1=[];
      for(var i in values) 
      {
          if(values[i]!='')
          {
             values1.push(values[i]); 
          }
      }
     
    if (values1.length == 0) {
      component.set("v.infoText", "Select an option...");
    }
    if (values1.length == 1) {
      //component.set("v.infoText", values1[0]);
      component.set("v.infoText", values1.length + " product selected");
    }
    else if (values1.length > 1) {
      component.set("v.infoText", values1.length + " products selected");
    }
  },
    
    isMapEmpty1:function(map1)
    {
        var isMapEmpty=true;
        if(map1!=undefined)
        {
            for ( var key in map1 ) {
                isMapEmpty=false;
            }
        }
        
        return isMapEmpty;
    },
    
    
    isRenewalConfirmed:function(renewalConfirmedValue){
        var isRenewalConfirmed=false;
     	var renewalStatusMemberSafeFieldTriggerValueStr = $A.get("$Label.c.Renewal_Status_MemberSafe_field_trigger_value"); 
       var renewalStatusMemberSafeFieldTriggerValueList=[];
        if(renewalStatusMemberSafeFieldTriggerValueStr!=undefined &&
         renewalStatusMemberSafeFieldTriggerValueStr!=null &&
          renewalStatusMemberSafeFieldTriggerValueStr!=''){
           if(renewalStatusMemberSafeFieldTriggerValueStr.indexOf('##') !== -1){
                renewalStatusMemberSafeFieldTriggerValueList=renewalStatusMemberSafeFieldTriggerValueStr.split('##');
            }
            else{
                renewalStatusMemberSafeFieldTriggerValueList = renewalStatusMemberSafeFieldTriggerValueStr;
            }  
       } 
        
        if(renewalConfirmedValue!=undefined && renewalConfirmedValue!=null && renewalConfirmedValue!=''){
        for(var i in renewalStatusMemberSafeFieldTriggerValueList){
            if(renewalConfirmedValue==renewalStatusMemberSafeFieldTriggerValueList[i])
            {
                isRenewalConfirmed=true;
			}
        }
       }
       return isRenewalConfirmed; 
    },
    
    isPrdctTypeEnabledForPrdctDtl:function(prdctLine){
      	var isprdctTypeEnabledForPrdctDtl=false;
       	var pdtTypesEnabledForPrdctDtlStr = $A.get("$Label.c.PdtsConfirmed_PdtTypes_ToBeEnabled"); 
        var pdtTypesEnabledForPrdctDtlLst=[];
        if(pdtTypesEnabledForPrdctDtlStr!='' && pdtTypesEnabledForPrdctDtlStr!=undefined 
           && pdtTypesEnabledForPrdctDtlStr!=null){
            if(pdtTypesEnabledForPrdctDtlStr.indexOf(',') !== -1){
                pdtTypesEnabledForPrdctDtlLst=pdtTypesEnabledForPrdctDtlStr.split(',');
            }
            else{
                pdtTypesEnabledForPrdctDtlLst = pdtTypesEnabledForPrdctDtlStr;
            }  
        }
        
        if(prdctLine!=undefined && prdctLine!=null && prdctLine!=''){
            for(var i in pdtTypesEnabledForPrdctDtlLst){
                if(prdctLine==pdtTypesEnabledForPrdctDtlLst[i]){
                 isprdctTypeEnabledForPrdctDtl=true;   
                }
            }
        }
        return isprdctTypeEnabledForPrdctDtl;
    },
    
})