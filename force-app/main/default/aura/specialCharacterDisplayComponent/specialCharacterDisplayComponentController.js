({
    onSelectRoleChangeFunction : function(component, event, helper) {
        debugger;
        var object = component.find('object').get('v.value');
        component.set('v.objectName',object);
        component.set('v.NoRecords','');
    },
    doInit : function(component, event,helper){
        var action = component.get("c.getobjectNames"); 
        component.set('v.metadataRecordName','');
        action.setCallback(this,function(response){
            var state = response.getState();
            console.log(state);
            if(state == "SUCCESS") {
                console.log( response.getReturnValue());
                var metadataRecordNameList ='';
                metadataRecordNameList =  response.getReturnValue();
                var metadataRecordName = [];
                metadataRecordName = metadataRecordNameList.split(',');
                if(metadataRecordName != null && metadataRecordName != undefined){
                    component.set('v.metadataRecordName',metadataRecordName);
                }  
            }
        });
        $A.enqueueAction(action);
    },
    download: function(component, event,helper){
        if(component.get('v.objectName') != null && component.get('v.objectName') != undefined && component.get('v.objectName') != ''){
            helper.queryAndDownloadCsv(component, event);
        }
    }
})