({
    getKMRecords : function(component) {
        var spinner = component.find("userLoadingspinner");
        $A.util.removeClass(spinner, 'slds-hide');
        $A.util.addClass(spinner, 'slds-show');
        var action = component.get("c.getKnowledgeManagement");
        action.setParams({
            "linkId":component.get('v.recordId')
        });
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS") {
                if(response.getReturnValue() != null) {
                    console.log('data');
                    var responseObj = response.getReturnValue().kmDataList;
                    component.set('v.hasAccess',response.getReturnValue().hasAccess);
                    component.set('v.hasUploadAccess',response.getReturnValue().hasUploadAccess);
                    if((responseObj != null && responseObj.length == 0)) {
                        component.set('v.isEmpty', true);
                        if(!component.get('v.hasAccess')){
                            component.set('v.colSpan',5);
                        }else{
                            component.set('v.colSpan',6);
                        }
                    } else {
                        component.set('v.isEmpty', false);
                    }
                    component.set('v.FilesCount',responseObj.length);
                    component.set("v.KMdata", responseObj);
                } else {
                    component.set('v.isEmpty', true);
                }
            } else {
                console.log("In getUserRecordDetails method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
            }
            $A.util.removeClass(spinner, 'slds-show');
            $A.util.addClass(spinner, 'slds-hide');
        });
        $A.enqueueAction(action);
    },
    DownloadKMAttch : function(cmp,recId,copy) {
        var action = cmp.get("c.DownloadAttachment");
        action.setParams({ DownloadAttachmentID : recId });
        action.setCallback(this, function(response) {
            var state = response.getState();
            var urlString = response.getReturnValue();
            if (state === "SUCCESS") {
                if(!copy){
                    var urlEvent = $A.get("e.force:navigateToURL");
                    urlEvent.setParams({
                        "url": urlString
                    });
                    urlEvent.fire();
                }else{
                    cmp.set('v.copyUrlStr',urlString);
                    var copuUrl = cmp.find('copuUrl');
                    for(var i=0; i< copuUrl.length; i++){
                        $A.util.addClass(copuUrl[i], 'slds-show');
                        $A.util.removeClass(copuUrl[i], 'slds-hide');
                    }
                }
            }
            else if (state === "INCOMPLETE") {
                // do something
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + 
                                        errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });
        
        $A.enqueueAction(action); 
    }
})