({
    doInit : function(component, event, helper){
        console.log(JSON.stringify(component.get('v.selectedContactIds')));
        if(component.get('v.selectedContactIds').length > 0 || component.get('v.selectedContactIds') != undefined){
            if(component.get('v.selectedContactIds').indexOf(component.get('v.consultantId')) > -1 ){
                var selectedConsultant = component.find('selectedConsultant');              
                var selectedConsultantcheck = selectedConsultant.set("v.value", true);
            }   
        }  
    },
    
    removeSelectedRecord : function(component, event){
        var selectedConsultant = component.find('selectedConsultant');
        selectedConsultant.set('v.value', false);
    },
    
	Select : function(component, event, helper) {
        //alert(component.get('v.consultantId'));
        var selectedConsultant = component.find('selectedConsultant');     
        var selectedConsultantcheck = selectedConsultant.get("v.value");
        
        if(selectedConsultantcheck){
            component.set('v.selectedContact',false);
        }else{
            component.set('v.selectedContact',true);
        }
        
        var compEvent = component.getEvent("maConsultantPopupEvent");
        compEvent.setParams({"consultantId":component.get('v.consultantId'),
                             "selectedContact":component.get('v.selectedContact'),
                             "contactObj" : component.get('v.consultingSearchArray')});
        compEvent.fire();
	},
    
    relatedSelect : function(component, event, helper) {
        var selectedItem = event.currentTarget;
     	var contactIDToAdd = selectedItem.dataset.record;

		var cmpEvent = component.getEvent("maConsultantPopupEvent");
        cmpEvent.setParams({'consultantId' : contactIDToAdd, 'isAllContact': false});
        cmpEvent.fire();
	}
})