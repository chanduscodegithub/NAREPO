({
    doInit : function(component, event, helper) {  
        console.log('doinit');
        var device = $A.get("$Browser.formFactor");
        component.find('utilityToggle').set("v.iconName","utility:chevrondown");
        $A.util.addClass(component.find('NPS_Account_Strategy_and_Action_Plan_Managed_By_Sales'),'slds-is-open');
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide');
        helper.getOpenAndClosedCases(component,event,'');                
    },
    expandCollapse: function(component, event, helper) {
        console.log('expandCollapse')
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);
        var iconElement = selectedItem.getAttribute("id");
        var myLabel = component.find(iconElement).get("v.iconName");      
        if(myLabel=="utility:chevronright"){  
            var spinner1 = component.find("spinner");
            $A.util.removeClass(spinner1, 'slds-hide');
            
            var spinner2 = component.find("spinner1");
            $A.util.removeClass(spinner2, 'slds-hide');
            var appletIcon = component.find("appletIcon");
            $A.util.addClass(appletIcon, 'slds-hide');
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            helper.getOpenAndClosedCases(component,event,divId);
            $A.util.addClass(cmpTarget,'slds-is-open');
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
            $A.util.removeClass(cmpTarget,'slds-is-open');
        }
    },
    navigateToIssueDetailPage: function(component,event) {
        var selectedItem = event.currentTarget;
        var recId = selectedItem.dataset.record;
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": recId
        });
        navEvt.fire();
    },
    ViewAllOpenIssues:function(component,event,helper) {
        component.set("v.isEmtOpenCasesViewAll",true);
        var actionPlans = component.get('v.responseObj').openCaseList;
        for(var i=0;i<actionPlans.length;i++){
            var tasks = actionPlans[i].Tasks;           
            //var countOpen = 0,countClose=0;
            var count = 0;
            if(tasks != null && tasks != undefined){
                count = tasks.length;
               /* for(var j=0;j<tasks.length;j++){
                    if(tasks[j].Status === 'Open'){
                        countOpen++;
                    }else{
                        countClose++;
                    }      
                } */                                         
            }
            actionPlans[i].activities = count;
            //actionPlans[i].closeActivities = countClose;                    
        }              
        component.set('v.openCaseList',actionPlans)
    },
    createRecord : function (component, event, helper) {
        var createRecordEvent = $A.get("e.force:createRecord");
        createRecordEvent.setParams({
            "entityApiName": "Action_Service_Plan__c",
            "defaultFieldValues": {
                'Company_Name__c':component.get('v.recordId'),
                'Status__c':'Open',
                'Owner__c':component.get('v.ownerId')
            }
        }),
            createRecordEvent.fire();
    },
    modelCloseComponentEvent : function(component, event,helper) {
        helper.modalGenericClose(component);
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP"){ 
            $A.util.removeClass(component.find("action-bar-mobile"),"slds-hide"); 
        }
    },
    navigateToOpenActivities :  function (component, event, helper) {
        var selectedItem = event.currentTarget;
        var recId = selectedItem.dataset.record;
        //var status = selectedItem.dataset.status;
        var actionPlans = component.get('v.openCaseList');
        var activities = [];
        /*var header = 'Open Activities';
        if(status !== 'Open'){
            header = 'Closed Activities';
        }*/
        for(var i=0;i<actionPlans.length;i++){
            if(actionPlans[i].Id === recId){
                activities = actionPlans[i].Tasks;
               /* if(tasks != null && tasks != undefined){
                        for(var j=0;j<tasks.length;j++){
                            if(tasks[j].Status === status){
                                activities.push(tasks[j]);
                            }     
                        }                                          
                    }*/
            }
        }
        var device = $A.get("$Browser.formFactor");       
        if(device == "DESKTOP"){
            $A.createComponents([["c:Modal_Component",{attribute:true,'Modalheader':'Activities','ModalBodyData':{'currentAccountId':component.get('v.recordId'),'selectedDataList':activities},'ModalBody':'ActionPlansOpenTasks'}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0; i < newCmp.length; i++) {
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });
        }else{ 
            $A.util.addClass(component.find("action-bar-mobile"),"slds-hide");  
            $A.createComponents([["c:Panel_Component",{attribute:true,'Modalheader':'Search Competitors','ModalBodyData':{'currentAccountId':component.get('v.recordId'),'selectedDataList':component.get('v.selectedDataList'),'isMedical':true},'ModalBody':'ActionPlansOpenTasks'}]],
                                function(newCmp, status){ 
                                    if (component.isValid() && status === 'SUCCESS') {
                                        var dynamicComponentsByAuraId = {};
                                        for(var i=0; i < newCmp.length; i++) {
                                            var thisComponent = newCmp[i];
                                            dynamicComponentsByAuraId[thisComponent.getLocalId()] = thisComponent;
                                        }
                                        component.set("v.dynamicComponentsByAuraId", dynamicComponentsByAuraId);
                                        component.set("v.dynamicComponentAuraId", thisComponent.getLocalId()); 
                                        component.set("v.body", newCmp); 
                                    } 
                                });
            
        }
    },
    sortFields: function(component, event,helper) {
		var selectedItem = event.currentTarget;
        var fieldNameToBeSorted = selectedItem.dataset.record;
        
        var fieldItagsWithAuraAttrMap = '{"Status__c" : "sortStatusAsc"}';
        
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[fieldNameToBeSorted];
       // console.log('sortFieldCompName >>>'+sortFieldCompName);
        var page = 1;
        
        helper.sortBy(component, event, fieldNameToBeSorted, page, sortFieldCompName);
    }
})