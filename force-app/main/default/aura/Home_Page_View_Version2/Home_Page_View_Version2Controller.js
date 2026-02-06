({
    doInit: function(cmp,event,helper) {
        cmp.set('v.pipelineId',$A.get("$Label.c.QL_OPEN_PIPELINES_URL"));               
        cmp.set('v.clientListId',$A.get("$Label.c.QL_CLINT_LIST_URL"));
        cmp.set('v.isIdAvailable',true);       
    },
    sectionOne : function(component, event, helper) {      
        helper.helperFun(component,event,'articleOne');
    },
    handleRecordUpdated : function(component, event, helper) {                     
        var eventParams = event.getParams();
        if(eventParams.changeType === "LOADED") {
            if(component.get('v.simpleRecord.Formula_Link__c') !== null && component.get('v.simpleRecord.Formula_Link__c') !== undefined){
                var doc = new DOMParser().parseFromString(component.get('v.simpleRecord.Formula_Link__c'),"text/xml");
                component.set('v.OpenPiplineURL',doc.firstChild.attributes.href.value);            
            }
            console.log('Link='+component.get('v.OpenPiplineURL'));
        }
    },
    handleClientRecUpdated : function(component, event, helper) {        
        if(component.get('v.clientList.Formula_Link__c') !== null && component.get('v.clientList.Formula_Link__c') !== undefined){
            var doc = new DOMParser().parseFromString(component.get('v.clientList.Formula_Link__c'),"text/xml");
            component.set('v.ClientListURL',doc.firstChild.attributes.href.value);            
        }
        console.log('Link='+component.get('v.ClientListURL'));
    }
})