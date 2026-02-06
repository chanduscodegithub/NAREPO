/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 03-13-2024
 * @last modified by  : Spoorthy
**/
({
    doInit : function(component, event, helper) {  
        console.log('doinit')
    	var device = $A.get("$Browser.formFactor");				                   
        if(device != "DESKTOP"){           
            helper.getMembershipByMktData(component,event);
            $A.util.toggleClass(component.find('Medical_MembershipBy_Market'),'slds-is-open');
        }
        component.set("v.LinkId",component.get("v.recordId"));
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
            helper.getMembershipByMktData(component,event);
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }else if(myLabel=="utility:chevrondown"){
            component.find(iconElement).set("v.iconName","utility:chevronright");
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }
    },
    openMap : function(component, event, helper) {                        
        var selectedItem = event.currentTarget;
        var currentRegion = selectedItem.dataset.record;
        console.log(currentRegion);
        component.set("v.currentRegion",currentRegion);
        if(currentRegion != undefined && currentRegion != null) {
            var currentRegionVal = component.get('v.'+currentRegion);
            if(currentRegionVal > 0) {
                $A.util.addClass(component.find("state_popup"), 'slds-hide');
                $A.util.removeClass(component.find("state_spin"), 'slds-hide');
                helper.getMedicalStateByMarket(component,event,currentRegion);
                $A.util.removeClass(component.find("state_popup"), 'slds-hide');
            }
        }                
    },
    openUnetDetails : function(component, event, helper) {        
        $A.util.addClass(component.find("unet_popup"), 'slds-hide');
        $A.util.removeClass(component.find("unet_spin"), 'slds-hide');
        var selectedItem = event.currentTarget;
        var currentState = selectedItem.dataset.record;
        console.log(currentState);
        component.set("v.currentState",currentState);
        helper.getMedicalUnetByMarket(component,event,currentState);        
        $A.util.removeClass(component.find("unet_popup"), 'slds-hide');
        var unetPopup = component.find("unet_popup");
        component.set("v.top", selectedItem.offsetParent.offsetTop + selectedItem.offsetTop - 16);
        component.set("v.left", selectedItem.offsetParent.offsetParent.offsetLeft + selectedItem.offsetLeft + selectedItem.offsetWidth + 20);              
	},
    confirmCancel: function(component, event, helper) {
        $A.util.addClass(component.find("unet_popup"), 'slds-hide');
    	$A.util.addClass(component.find("state_popup"), 'slds-hide');
        component.set('v.stateMap','');
    },
    cancelUnet: function(component, event, helper) {
    	$A.util.addClass(component.find("unet_popup"), 'slds-hide');
        component.set('v.unetMap','');
    }
})