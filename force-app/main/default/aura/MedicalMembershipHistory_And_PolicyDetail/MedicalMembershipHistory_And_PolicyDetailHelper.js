({
    getAccountMembershipPolicyDetail : function(component, event) {
        if($A.get("$Browser.isIOS")){
            $A.util.removeClass(component.find('articleClass'),'cScroll-table');
        }
        var spinner1 = component.find("spinner");
        $A.util.removeClass(spinner1, 'slds-hide');
        
        var spinner2 = component.find("spinner1");
        $A.util.removeClass(spinner2, 'slds-hide');
        
        var appletIcon = component.find("appletIcon");
        $A.util.addClass(appletIcon, 'slds-hide'); 
        
        var action = component.get("c.getAccountMembershipPolicyDetailsOnAppletLoad");
        if(action == undefined || action == null){
			return;
		}
        action.setParams({
            "accountId" : component.get('v.recordId')       
        });
        action.setCallback(this,function(response){
            if($A.get("$Browser.isIOS")){
                $A.util.addClass(component.find('articleClass'),'cScroll-table');
            }
            var state = response.getState();
            if(state == "SUCCESS") {
                component.set('v.membershipByMarket', response.getReturnValue().membershipByMarketList);
                
                if(response.getReturnValue().policyList != null && response.getReturnValue().policyList.length > 0) {
                    
                    component.set('v.previousYearRevenueList', response.getReturnValue().previousTotalMemberRevenue);
                    component.set('v.accMembershipData', response.getReturnValue().policyList);  
                    component.set('v.currentGlDate', response.getReturnValue().latestMonthAndYear);  
                    component.set('v.startingGLdate', response.getReturnValue().previousFebYear);
                    
                    component.set('v.totalStartingGLdate', response.getReturnValue().totalStartingGLrevenue);
                    component.set('v.totalCurrentGlDate', response.getReturnValue().totalCurrentGLrevenue);
                    component.set('v.totalYTD', response.getReturnValue().totalYTD);
                }else{
                    component.set('v.PolicyEmptyList', true);
                }
                
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                
                if(!component.get('v.isDesktop')){   
                    var iOS = parseFloat(
                        ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
                        .replace('undefined', '3_2').replace('_', '.').replace('_', '')) || false;
                    
                    if($A.get("$Browser.isIOS") && iOS != false && parseInt(iOS) < 11){  
                        $A.util.addClass(component.find('Policy_Accounts'),'ipadBottomIos');
                    }else{
                        $A.util.addClass(component.find('Policy_Accounts'),'ipadbottom');
                    }
                    
                    component.set('v.isExpand',true);            
                    $A.util.toggleClass(component.find('Policy_Accounts'),'slds-is-open');
                }
            } else {
                
                $A.util.addClass(spinner1, 'slds-hide');
                $A.util.addClass(spinner2, 'slds-hide');
                $A.util.removeClass(appletIcon, 'slds-hide');
                
                console.log("In getAccountMembershipPolicyDetail method, Failed with state: " + state + " and the Error reason is -> " + response.getError());
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        component.set('v.ErrorMessage',errors[0].message);
                        var ErrorMessage = component.find('ErrorMessage');
                        for(var i = 0; i < ErrorMessage.length; i = i+1){
                            $A.util.addClass(ErrorMessage[i], 'slds-show');
                            $A.util.removeClass(ErrorMessage[i], 'slds-hide');
                        }
                    }
                } else {
                    console.log("Unknown error");
                }
            }
          //  $A.util.removeClass(spinner, 'slds-show');
          //  $A.util.addClass(spinner, 'slds-hide');
        });
        $A.enqueueAction(action);
    }
})