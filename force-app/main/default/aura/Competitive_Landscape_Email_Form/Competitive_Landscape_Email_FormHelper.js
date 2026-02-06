({
    sendMailToHelpDesk : function(component, event) {
        component.set('v.isSpinnertoLoad', true);
        var companyName = component.find('CompanyName').get('v.value');
        var webAddress = component.find('webAddress').get('v.value');
        var prodTypesOffered = component.get('v.productsOffered');
        if(prodTypesOffered == undefined || prodTypesOffered == null){
            prodTypesOffered = '';
        }
        var address = component.find('address').get('v.value');
        var additionalComments = component.find('additionalComments').get('v.value');               
        
        var action = component.get('c.sendMailCompetitor');
        action.setParams({'companyName' : companyName,                      
                          'webAddress' : webAddress,
                          'prodTypesOffered' : prodTypesOffered,
                          'address' : address,
                          'additionalComments' : additionalComments,               
                          'compRowId' : component.get('v.Child_Data').currentAccountId                        
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