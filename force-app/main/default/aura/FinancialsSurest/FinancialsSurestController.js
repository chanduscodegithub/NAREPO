({
    doInit : function(component, event, helper) {  
        console.log('doinit')
    	var device = $A.get("$Browser.formFactor");				                   
        if(device != "DESKTOP"){           
            helper.getFinancialRecords(component);
            $A.util.toggleClass(component.find('client_Survey_Results'),'slds-is-open');
        }
        component.set("v.TableauLinkId",component.get("v.recordId"));
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
            helper.getFinancialRecords(component);
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }
    }
})