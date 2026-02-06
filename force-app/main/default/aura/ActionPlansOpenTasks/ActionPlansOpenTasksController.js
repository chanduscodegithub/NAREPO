({
    doInit : function(component, event, helper) {
        debugger;
        //component.set('v.openCaseList',component.get('v.Child_Data').selectedDataList);
        var openActivities = [];
        var closedActivities = [];        
        var tasks = component.get('v.Child_Data').selectedDataList;
        if(tasks != null && tasks != undefined){
            for(var j=0;j<tasks.length;j++){
                if(tasks[j].Status === 'Open'){
                    openActivities.push(tasks[j]);
                }else{
                    closedActivities.push(tasks[j]);
                }    
            }                                          
        } 
        if(openActivities.length > 0){
            component.set('v.openCaseList',openActivities);
        }else{
            component.set('v.openCaseEmpty',true);
        }
        if(closedActivities.length > 0){
            component.set('v.closeCaseList',closedActivities);
        }else{
            component.set('v.closeCaseEmpty',true);
        }        
    },
    navigateToTaskDetailPage : function(component, event){
        var cmpEvent = component.getEvent("modalCmpCloseEvent");      
        cmpEvent.fire();
        var selectedItem = event.currentTarget;
        var recId = selectedItem.dataset.record;
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": recId
        });
        navEvt.fire();
    }
    
})