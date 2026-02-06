({
    doInit : function(component, event, helper) { 
        console.log('doinit')
        var device = $A.get("$Browser.formFactor");				                   
        if(device != "DESKTOP"){           
            helper.getMedicalData(component,event);
            $A.util.toggleClass(component.find('client_Survey_Results'),'slds-is-open');
        }
        
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
            helper.getMedicalData(component,event);
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }
    }
})