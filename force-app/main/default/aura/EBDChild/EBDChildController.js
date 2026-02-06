({
    previewRecord: function (cmp, event, helper) {
        var selectedItem = event.currentTarget;
        var recId = selectedItem.dataset.record;
        $A.get('e.lightning:openFiles').fire({
            recordIds: [recId]
        });
    },
    handleUploadFinished: function (cmp, event,helper) {
        // Get the list of uploaded files
        var uploadedFiles = event.getParam("files");
        console.log("Files uploaded : " + uploadedFiles.length);
        var event = cmp.getEvent('ebdEvent');
        event.setParams({"isDelete":false,"isSave":false,"EBDId":cmp.get('v.EBDdata.EBDObj.Id').Id});
        event.fire();
    },
    RemoveRecord: function (cmp, event,helper) {
        var event = cmp.getEvent('ebdEvent');
        event.setParams({"isDelete":true,"isSave":false,"EBDId":{'sobjectType':'EBD__c','Id':cmp.get('v.EBDdata.EBDObj.Id')}});
        event.fire();
    },
    editRecord: function (cmp, event,helper) {
        cmp.set('v.isEdit',true);
    },
    cancelRecord: function (cmp, event,helper) {
        cmp.set('v.isEdit',false);
        cmp.find('nameerr').set('v.value','');
        var event = cmp.getEvent('ebdEvent');
        event.setParams({"isDelete":false,"isSave":false});
        event.fire();
    },
    saveRecord: function (cmp, event,helper) {
        var EBDName = cmp.find('ebdname').get('v.value');  
        cmp.find('nameerr').set('v.value','');
        EBDName = EBDName.trim();
        if(EBDName == null || EBDName == undefined || EBDName == ''){
            cmp.find('nameerr').set('v.value','Name is Mandatory');
            return;
        }
        var event = cmp.getEvent('ebdEvent');
        event.setParams({"isDelete":false,"isSave":true,"EBData":cmp.get('v.EBDdata.EBDObj')});
        event.fire();
    },
    onSelectChange: function (cmp, event,helper) {
        cmp.set('v.EBDdata.EBDObj.Year__c',cmp.find('yearVal').get('v.value'));
    }
})