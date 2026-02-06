({
    doInit : function(component, event, helper) {  
        console.log('doinit')
    	helper.getOpenAndClosedCases(component,event);
    },
 	expandCollapse: function(component, event, helper) {
    	console.log('expandCollapse')
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);
        var iconElement = selectedItem.getAttribute("id");
        
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){            
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            //helper.getClientSurveyRecords(component);
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }
    },
    expandCollapseSection : function (component, event, helper){
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;
        var iconElement = selectedItem.getAttribute("id");
        var myLabel = component.find(iconElement).get("v.iconName");
        helper.getOpenAndClosedCases(component,event,divId);
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            $A.util.removeClass(component.find(divId), 'slds-hide');
        } else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
            $A.util.addClass(component.find(divId), 'slds-hide');
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
    ViewAllCloseIssues:function(component,event,helper) {
        component.set("v.isEmtClosedCasesViewAll",true);
        component.set('v.closedCaseList',component.get('v.responseObj').closedCaseList)
    },
    ViewAllOpenIssues:function(component,event,helper) {
         component.set("v.isEmtOpenCasesViewAll",true);
        component.set('v.openCaseList',component.get('v.responseObj').openCaseList)
    }
})