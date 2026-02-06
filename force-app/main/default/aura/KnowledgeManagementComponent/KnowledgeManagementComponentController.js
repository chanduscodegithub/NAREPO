({
    doInit: function (cmp, event, helper) {
        helper.getKMRecords(cmp);
    },
    downloadKMRecord: function (cmp, event, helper) {
        var selectedItem = event.currentTarget;
        var recId = selectedItem.dataset.record;
        helper.DownloadKMAttch(cmp,recId,false);
    },
    previewRecord: function (cmp, event, helper) {
        var selectedItem = event.currentTarget;
        var recId = selectedItem.dataset.record;
        $A.get('e.lightning:openFiles').fire({
            recordIds: [recId]
        });
    },
    handleUpload: function (cmp, event, helper) {
        helper.getKMRecords(cmp);
    },
    handleUploadFinished: function (cmp, event,helper) {
        // Get the list of uploaded files
        var uploadedFiles = event.getParam("files");
        helper.getKMRecords(cmp);
        console.log("Files uploaded : " + uploadedFiles.length);
    },
    copy : function(component, event, helper) {
        var selectedItem = event.currentTarget;
        var recId = selectedItem.dataset.record;
        helper.DownloadKMAttch(component,recId,true);
    },
    closeModal: function(component, event, helper) {
        var copuUrl = component.find('copuUrl');
        for(var i=0; i< copuUrl.length; i++){
            $A.util.addClass(copuUrl[i], 'slds-hide');
            $A.util.removeClass(copuUrl[i], 'slds-show');
        }
    },
    copyToClipBoard: function(component, event, helper) {
        var holdtxt = document.getElementById("holdtext");
        holdtxt.select();
        document.execCommand('copy');
        var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Copied!",
                "message": "Document Link Copied!."
            });
        toastEvent.fire();
    }
})