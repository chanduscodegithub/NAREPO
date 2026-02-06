({
    doInit : function(component, event, helper) {
        component.set('v.isSpinnertoLoad', true);
        var apiName = component.get('v.Child_Data').apiName;
        var objName = component.get('v.Child_Data').objName;
        var inputBoxValue = component.get('v.Child_Data').inputBoxValue;
        if((inputBoxValue != undefined) && (inputBoxValue != '')){
            component.set('v.selectedAddPopupDataName', inputBoxValue);
        }
        if(inputBoxValue == undefined){
            component.set('v.checkBoxCount', 0);    
        }else{
            component.set('v.checkBoxCount', component.get('v.selectedAddPopupDataName').length);
        }
        var saveBtn = component.find('saveBtn');
        var checkBoxCount = component.get('v.checkBoxCount');
        if(checkBoxCount == 0){            
            saveBtn.set("v.disabled",true);                
        }else{                        
            saveBtn.set("v.disabled",false);
        }
        console.log(apiName+'--'+objName);
        if(apiName[0] === '1'){
            component.set('v.dataToDisplay', component.get('v.Child_Data').dataToDisplay);
            setTimeout(function(){
                component.set('v.isSpinnertoLoad', false);    
            },1000);
        }else{
            var action = component.get('c.getPickListValues');
            action.setParams({'fieldApiName' : apiName,
                              'objName' : objName});
            action.setCallback(this, function(response){
                //alert(response.getReturnValue());
                component.set('v.dataToDisplay', response.getReturnValue());
                component.set('v.isSpinnertoLoad', false);
            });
            $A.enqueueAction(action);
        }
        //component.set('v.dataToDisplay', component.get('v.Child_Data').dataToDisplay);
    },
    
    addSelectedData : function(component, event){
        var saveBtn = component.find('saveBtn');
        var checkBoxCount = component.get('v.checkBoxCount');
        var selectedAddPopupDataName = component.get('v.selectedAddPopupDataName');
        if(event.getParam('selectedVal')){            
            //selectedAddPopupDataName = selectedAddPopupDataName.filter(function(e) { return e !== event.getParam('ValName') });
            component.set('v.selectedAddPopupDataName', selectedAddPopupDataName.filter(function(e) { return e !== event.getParam('ValName') }));
            checkBoxCount = checkBoxCount - 1;
        }else{
            selectedAddPopupDataName.push(event.getParam('ValName'));
            checkBoxCount = checkBoxCount +1;
        }
        component.set('v.checkBoxCount',checkBoxCount);
        if(checkBoxCount == 0){            
            saveBtn.set("v.disabled",true);
            component.set('v.selectedAddPopupDataName',[]);
            var cmpEvent = component.getEvent("modalCmpCloseEvent1");
            cmpEvent.setParams({
                "closeChildPopup" : false,
                "refresh": true,
                "values" : []});
            cmpEvent.fire();
        }else{                        
            saveBtn.set("v.disabled",false);
        }
    },
    
    saveSelectedData : function(cmp, event){
        console.log('selected values-->>'+cmp.get('v.selectedAddPopupDataName'));
        var cmpEvent = cmp.getEvent("modalCmpCloseEvent1");
        cmpEvent.setParams({
            "refresh" : cmp.get("v.refreshOnClosingModel"),
            "closeChildPopup" : true,
            "values" : cmp.get('v.selectedAddPopupDataName')});
        cmpEvent.fire();
    }
})