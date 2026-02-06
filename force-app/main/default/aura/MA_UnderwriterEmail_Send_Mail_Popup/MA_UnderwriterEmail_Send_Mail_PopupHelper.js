({
    sendMailToHelpDesk : function(component, event) {
        component.set('v.isSpinnertoLoad', true);
        var lastName = component.find('lastName').get('v.value');
        var firstName = component.find('firstName').get('v.value');
        //var account = component.find('account').get('v.value');
        //var address = component.find('address').get('v.value');
        //var phone = component.find('phone').get('v.value');
        //var email = component.find('email').get('v.value');
        var emailvalidationtrigger = true;
        var maId =  component.get('v.maId');
      
       /* if(email != null && email != ''){
            var regExpEmailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(!email.match(regExpEmailformat)){
                emailvalidationtrigger = false;  
            }   
        } */
        
        var opData = component.get('v.opportunityData');
        var accName= ''; 
        if(opData != null){
          accName =  opData.AccountName;
        }
        if(emailvalidationtrigger){
            var action = component.get('c.sendMailFromApex');
            action.setParams({'lName' : lastName,
                              'fName' : firstName,
                              'maId' : maId,
                             });
            action.setCallback(this, function(response){
                var state = response.getState();
                if(state === 'SUCCESS'){
                    var resp = response.getReturnValue();
                    if(resp){
                        component.set('v.errorMsg', 'Mail sent successfully!!');
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
                     component.set('v.errorMsg', 'Mail not sent. Please contact administrator ');
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
    }
})