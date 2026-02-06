({
    doInit : function(component, event, helper) {
     var device = $A.get("$Browser.formFactor");
        if(device == "DESKTOP"){
            component.set('v.isDesktop',true);
            setTimeout(function(){              
                if(!component.get('v.isGenericEventTriggered')){                
                    component.set('v.isGenericEventTriggered',true);
                    helper.getAccountMembershipPolicyDetail(component,event);
                }            
            }, 5000);           
        }else{
            helper.getAccountMembershipPolicyDetail(component,event);
        }
    },
    expandCollapse: function(component, event, helper) {
        console.log('expand');
        if(!component.get('v.isDesktop')){
            return;
        }
        var selectedItem = event.currentTarget;
        var divId = selectedItem.dataset.record;      
        var cmpTarget = component.find(divId);      
        var iconElement = selectedItem.getAttribute("id");
        
        var myLabel = component.find(iconElement).get("v.iconName");
        
        if(myLabel=="utility:chevronright"){
            component.find(iconElement).set("v.iconName","utility:chevrondown");
            helper.getAccountMembershipPolicyDetail(component,event);
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        }else if(myLabel=="utility:chevrondown"){          
            component.find(iconElement).set("v.iconName","utility:chevronright");
            $A.util.toggleClass(cmpTarget,'slds-is-open');
        } 
    },
    closeErrorModal: function(component, event, helper){
        var ErrorMessage = component.find('ErrorMessage');
        for(var i = 0; i < ErrorMessage.length; i = i+1){
            $A.util.removeClass(ErrorMessage[i], 'slds-show');
            $A.util.addClass(ErrorMessage[i], 'slds-hide');
        }
    },
    scrollBottom: function(component, event, helper){	        
        var device = $A.get("$Browser.formFactor");
        if(device != "DESKTOP" && $A.get("$Browser.isIOS")){            
        	var isScrollStop = component.get("v.isScrollStop");
        	component.set("v.isStop",component.get("v.isStop")+1);                    
        	if(isScrollStop){                       
            
            var actionBar = component.find("action-bar-mobile");               	           
            $A.util.addClass(actionBar,"slds-hide");    
                        
                component.set("v.isScrollStop",false); 
                var myInterval = window.setInterval(
                    $A.getCallback(function() {
                        console.log('inside interval')
                        component.set("v.nextLastCount",component.get("v.lastCount"));
                        component.set("v.lastCount",component.get("v.isStop"));                         
                        if(component.get("v.lastCount") === component.get("v.nextLastCount")){                        	component.set("v.isStopped",true);
                            $A.util.removeClass(actionBar,"slds-hide");
                            component.set("v.isScrollStop",true);
                            clearInterval(myInterval);
                        }
                    }), 250
                ); 
                                              
            }
        } 
    }
})