({
	updateTotalAndPerOfMembers : function(component, event, isNoOfMembersHeldFlag) {
        
        var numberOfMembersHeldVal = component.get('v.MACompetitorData.Number_of_Members_Held__c');
        if(numberOfMembersHeldVal != null && numberOfMembersHeldVal != undefined) {
            var valueToBeUpdated = numberOfMembersHeldVal.toString();
            if(valueToBeUpdated.indexOf('-') == 0) {
            	valueToBeUpdated = valueToBeUpdated.substring(1, valueToBeUpdated.length);
            }
            if(valueToBeUpdated.length > 13) {
                valueToBeUpdated = valueToBeUpdated.substring(0, 13);
        	}
            component.set('v.pharmacyData.NumberOfMembersHeld__c', parseInt(valueToBeUpdated));
        } else {
            component.set('v.pharmacyData.NumberOfMembersHeld__c', 0);
        }
        if(isNoOfMembersHeldFlag != null) {
            var compEvent = component.getEvent("competitorsEvent");
            if(isNoOfMembersHeldFlag) {
            	compEvent.setParams({'isNoOfMembersHeldChange':true, 'competitorClassificationName':component.get('v.MACompetitorData.Competitor_Classification__c')});
            } else if(isNoOfMembersHeldFlag == false) {
                compEvent.setParams({'isNoOfMembersAwardedChange':true, 'competitorClassificationName':component.get('v.MACompetitorData.Competitor_Classification__c')});
            }
            compEvent.fire();
        } 
	},
    
    removeCompetitorRecord : function(component, event, isNoOfMembersHeldFlag) {
        
        var compEvent = component.getEvent("competitorsEvent");
        compEvent.setParams({"competitorDataToBeRemoved":component.get('v.MACompetitorData'), "competitorRecordIndex":component.get('v.index'), "competitorClassificationName":component.get('v.MACompetitorData.Competitor_Classification__c')});
        compEvent.fire();
    }
})