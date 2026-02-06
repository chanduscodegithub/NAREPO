({
    SaveUser : function(component, event) {
        component.set('v.isSpinnertoLoad', true);
        var lastName = component.find('lastName').get('v.value');
        var firstName = component.find('firstName').get('v.value');
        var middleName = component.find('account').get('v.value');
        var phone = component.find('phone').get('v.value');
        var email = component.find('email').get('v.value');
        var emailvalidationtrigger = true;
        if(email != null && email != ''){
            var regExpEmailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(!email.match(regExpEmailformat)){
                emailvalidationtrigger = false;  
            }   
        }
        if(emailvalidationtrigger){
            var action = component.get('c.sendMailFromApex');
            action.setParams({'lName' : lastName,
                              'fName' : firstName,
                              'mName' :middleName,
                              'phone' : phone,
                              'email' : email,
                             });
            action.setCallback(this, function(response){
                var state = response.getState();
                if(state === 'SUCCESS'){
                    var resp = response.getReturnValue();
                    if(resp){
                        component.set('v.errorMsg',  'Mail Sent successfully to add New AMT Member.');
                        component.set('v.alertHeader', 'SUCCESS');
                        this.showToast(component, event);
                        var cmpEvent = component.getEvent("modalCmpCloseEvent1");
                        cmpEvent.setParams({
                            "refresh" : component.get("v.refreshOnClosingModel"),
                            "closeChildPopup" : true});
                        cmpEvent.fire();
                        component.set('v.isSpinnertoLoad', false);
                    }
                }else{
                    component.set('v.errorMsg', 'Could not add AMT Member. Please contact administrator ');
                    component.set('v.alertHeader', 'Error');
                    this.showToast(component, event);
                    component.set('v.isSpinnertoLoad', false);
                }
            });
            
            $A.enqueueAction(action); 
        }else{
            $A.util.addClass(component.find('email'), "mandatoryFields");
            $A.util.addClass(component.find('emailDiv'), "slds-has-error");
            $A.util.removeClass(component.find('emailDiv1'), "slds-hide");
            component.set('v.isSpinnertoLoad', false);
        }
        
    },
    
    showToast : function(component, event) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": component.get('v.alertHeader'),
            "message": component.get('v.errorMsg')
        });
        toastEvent.fire();
    },
    handlehide : function(component, event){
        var cmpEvent = component.getEvent("modalCmpCloseEvent");
        cmpEvent.setParams({
            "refresh" : component.get("v.refreshOnClosingModel"),
            "closeChildPopup" : true});
        cmpEvent.fire();
    }
    
})