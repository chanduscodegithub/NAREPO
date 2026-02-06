({
    onActive : function(component, event, helper) {
        if(component.get('v.isEdit')){
            console.log('SalesStage_Child_Progression');
            var salesStageLead = component.get('v.ProgressionSalesStage');
            var sales_Stage_Name = component.get('v.Stage_Name');
            for(var j=0; j<salesStageLead.length; j++){
                if(sales_Stage_Name == salesStageLead[j]){
                    var ProgressChildEvent = component.getEvent("SalesStageProgressionEvt");
                    ProgressChildEvent.setParams({"rowId": component.get('v.index'),"sales_Stage_Name":component.get('v.Stage_Name')});
                    ProgressChildEvent.fire();
                }
            } 
        }
    },
    selectActiveStage: function(component, event, helper) {
        var param = event.getParam('arguments');
        console.log('salesStage_Progression');
        var progression_marker = component.find('progression_marker');
        //$A.util.removeClass(progression_marker, 'step-progress--link disabled');
        if (Array.isArray(progression_marker)){
            progression_marker = progression_marker[0];
        }
        if(param.addActiveStage){
            $A.util.addClass(progression_marker, 'step-progress--link');   
        }else{
            var progression = component.get('v.progression');
            var index =  component.get('v.index');
            if(component.get('v.progressionIndicator').length == 5){
                if(progression.length == 4 && index == 3){
                    $A.util.addClass(progression_marker, 'disabled');
                }else if(progression.length == 3 && (index == 2 || index == 3)){
                    $A.util.addClass(progression_marker, 'disabled');
                }else{
                    $A.util.removeClass(progression_marker, 'disabled');
                }
            }else{
                $A.util.removeClass(progression_marker, 'disabled');
            }
        }
    }
})