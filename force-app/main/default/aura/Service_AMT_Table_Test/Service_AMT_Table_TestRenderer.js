({
    rerender: function(component, event, helper) {        
        if(component.get('v.serviceAMTObj.Type__c') === 'User'){
            component.set('v.RolePicklist', component.get('v.userRolePLValues'));
        }else{
            component.set('v.RolePicklist', component.get('v.contactRolePLValues'));
            
        }
        
    },
    afterRender: function (component, event) {
        
        this.superAfterRender();
        
        /*
		 * Set the Business Model picklist values to the Dropdown dynamically in Pharmacy Section.
		 */ if(component.get('v.sobjectusedAccount')){
             var policyCarriersValuesArray = [];
             var policyCarrierNamesArray = [];
             
             var policyCarriersList = component.get('v.serviceAMTObj.PolicyId');
             
             var selAssMedCarriersValuesFromSF = component.get('v.serviceAMTObj.PolicyInfoSelected');
             if(policyCarriersList != null && policyCarriersList != undefined && policyCarriersList.length > 0) {
                 for(var i=0;i<policyCarriersList.length;i++) {
                     if(!policyCarrierNamesArray.includes(policyCarriersList[i].Policy_Information__r.Name)) {
                         policyCarrierNamesArray.push(policyCarriersList[i].Policy_Information__r.Name);
                         var policyCarrierToBeAdded = '';
                         if(selAssMedCarriersValuesFromSF != undefined && selAssMedCarriersValuesFromSF != null &&
                            selAssMedCarriersValuesFromSF.length > 0 && selAssMedCarriersValuesFromSF.includes(policyCarriersList[i].Policy_Information__r.Name)) {
                             policyCarrierToBeAdded = { text:policyCarriersList[i].Policy_Information__r.Name, value:policyCarriersList[i].Policy_Information__r.Name, selected:"true"};                                                                     
                         } else {
                             policyCarrierToBeAdded = { text:policyCarriersList[i].Policy_Information__r.Name, value:policyCarriersList[i].Policy_Information__r.Name};                      
                         }
                         policyCarriersValuesArray.push(policyCarrierToBeAdded);
                     }
                 }
             }
            // component.find("multipleSelect").set("v.PoliciesList", policyCarriersValuesArray);
             
         }   
    }
})