({
    doInit: function(component, event, helper) {
        
        helper.CurrentProductHelper(component, 1, event, helper);
        helper.LoggedInUser(component, event, helper);
    },
    
    expandCollapse: function(component, event, helper) {
        
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP") { 
            return;
        }
        
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);
        var iconElement = selectedItem.getAttribute("id");        
        var myLabel = component.find(iconElement).get("v.iconName");
        var page = component.get('v.page');
        
        if(myLabel=="utility:chevronright"){            
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            var body = component.find("TableBody");
            $A.util.toggleClass(body,'slds-hide');
            helper.CurrentProductHelper(component, page, event, helper);
        } else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
            var body = component.find("TableBody");
            $A.util.toggleClass(body,'slds-hide');
        }
    },
    
    handleaction : function (component, event, helper) {

        var selectedItem = event.detail.menuItem.get("v.accesskey");
        var tempid = event.getSource().get("v.class");

        switch(selectedItem){
            case '1' :
            	helper.Edit(component, event, helper, tempid);
                break;
            case '2' :
                var rowId = event.detail.menuItem.get("v.value");
                component.set('v.delrecordId',rowId);
                component.set('v.ShowComponent',true);		
                break;                
        }
    },
    
    refreshAll: function (component, event, helper) {

        var eventType = event.getParam('type');
        var page = component.get('v.page');
        if(eventType == 'SUCCESS'){
            helper.CurrentProductHelper(component, page, event, helper);
        }
    },    
    
    handleMyCurrentproductEvent : function(component, event, helper){

        var tempId = event.getParam('CPId');
        helper.Delete(component, event, helper, tempId);
    },
    
    openRelatedList: function(component, _event){
        
       /* var relatedListEvent = $A.get("e.force:navigateToRelatedList");
        relatedListEvent.setParams({
            "relatedListId": "Product_Mixes__r",
            "parentRecordId": component.get("v.recordId")
        });
        relatedListEvent.fire(); */
        console.log('Reserved for future use');
    },
    
    NavigateToSObject : function(component, event, helper) {

        var navEvt = $A.get("e.force:navigateToSObject");
        var selectedItem = event.currentTarget;
        var Id = selectedItem.dataset.record;   
        navEvt.setParams({
            "recordId": Id,
            "slideDevName": "related"
        });
        navEvt.fire();   
    },
    
    pageChange: function(component, event, helper) {
		var page = component.get("v.page") || 1;
        var direction = event.getParam("direction");
        page = direction === "previous" ? (page - 1) : (page + 1);
        helper.CurrentProductHelper(component, page, event, helper);
	}
    
})