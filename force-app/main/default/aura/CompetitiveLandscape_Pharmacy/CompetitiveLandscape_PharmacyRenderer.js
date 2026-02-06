({
    afterRender: function (component, event) {

        this.superAfterRender();
        
        /*
		 * Set the Business Model picklist values to the Dropdown dynamically in Pharmacy Section.
		 */
        var accountType = component.get('v.accountType');
        accountType = (accountType != undefined && accountType != null) ? accountType : '';
        if(accountType === $A.get("$Label.c.Client_Development") || accountType === $A.get("$Label.c.Aggregator")) {
            
            var assMedCarriersValuesArray = [];
            var assMedCarrierNamesArray = [];
            var assMedCarriersList = component.get('v.competitorsAttributes.AssociatedMedicalCarriers');
            
            var selAssMedCarriersValuesFromSF = component.get('v.pharmacyData.AssociatedMedicalCarrier__c');
            if(assMedCarriersList != null && assMedCarriersList != undefined && assMedCarriersList.length > 0) {
                for(var i=0;i<assMedCarriersList.length;i++) {
                    if(!assMedCarrierNamesArray.includes(assMedCarriersList[i].CompetitorAccount__r.Name)) {
                        assMedCarrierNamesArray.push(assMedCarriersList[i].CompetitorAccount__r.Name);
                        var assMedCarrierToBeAdded = '';
                        if(selAssMedCarriersValuesFromSF != undefined && selAssMedCarriersValuesFromSF != null &&
                           selAssMedCarriersValuesFromSF.length > 0 && selAssMedCarriersValuesFromSF.includes(assMedCarriersList[i].CompetitorAccount__r.Name)) {
                            assMedCarrierToBeAdded = { text:assMedCarriersList[i].CompetitorAccount__r.Name, value:assMedCarriersList[i].CompetitorAccount__r.Name, selected:"true"};                                                                     
                        } else {
                            assMedCarrierToBeAdded = { text:assMedCarriersList[i].CompetitorAccount__r.Name, value:assMedCarriersList[i].CompetitorAccount__r.Name};                      
                        }
                        assMedCarriersValuesArray.push(assMedCarrierToBeAdded);
                    }
                }
            }
            component.find("multipleSelect").set("v.options", assMedCarriersValuesArray);
            
        }
    }
})