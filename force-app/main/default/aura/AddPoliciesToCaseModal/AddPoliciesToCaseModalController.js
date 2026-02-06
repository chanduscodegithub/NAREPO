({
    doInit : function(component, event, helper) {        
        console.log('do init  method in case policy');                
        helper.getPolicyRecords(component);
    }  ,
    savePolicyPopup : function(component, event, helper) {
        helper.savePolicies(component);
    },
    cancelPolicyPopup: function(component, event, helper) {        
        // var device = $A.get("$Browser.formFactor");        
        helper.confirmClose(component,event,helper);    
    },
    addSelectedPolicy: function(component, event, helper) {
        //alert('inside addSelectedpolicy'+event.getParam('isSelectedPolicy'));
        var checkBoxCount = component.get('v.checkBoxCount');
        var isSelectedPolicy = event.getParam('isSelectedPolicy');
        var uncheckParent = event.getParam('uncheckParent');
        if(!uncheckParent){
            var resultCmp = component.find("box3");
            resultCmp.set("v.value",false);
        }
        var savePolicy = component.find('savePolicy');
        var selectedPoliciesList = component.get('v.selectedPoliciesList');
        var addPolicy = event.getParam('PolicyObject');
        var isFound = false;
        var index = 0;
        for(var i = 0; i < selectedPoliciesList.length ; i++ ){
            if(selectedPoliciesList[i].Id == addPolicy.Id){
                isFound = true;
                index = i;
            }
        }
        if(isSelectedPolicy && !isFound){
            // = component.get('v.accountId');
            selectedPoliciesList.push(addPolicy);
            checkBoxCount = checkBoxCount +1;
        }else{
            if(index < selectedPoliciesList.length){
                selectedPoliciesList.splice(index, 1);  
                checkBoxCount = checkBoxCount - 1;
            }             
        }
        component.set('v.checkBoxCount',checkBoxCount);
        if(checkBoxCount == 0){            
            savePolicy.set("v.disabled",true);                
        }else{                        
            savePolicy.set("v.disabled",false);
        }
        //alert('Length of List '+selectedPoliciesList.length);
    },
    Selectall : function(component, event, helper) { 
        var selectedHeaderCheck = event.getSource().get("v.value");
        var PoliciesToCaseChild = component.find('PoliciesToCaseChild');
        if(selectedHeaderCheck){
            if(!Array.isArray(PoliciesToCaseChild)){
                PoliciesToCaseChild.childMethod(true);
            }else{
                for(var i=0; i<PoliciesToCaseChild.length; i++){
                    PoliciesToCaseChild[i].childMethod(true);
                }
            } 
        }else{
            if(!Array.isArray(PoliciesToCaseChild)){
                PoliciesToCaseChild.childMethod(false);
            }else{
                for(var i=0; i<PoliciesToCaseChild.length; i++){
                    PoliciesToCaseChild[i].childMethod(false);
                }
            } 
        }       
        
    } 
})