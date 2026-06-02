({
	 getReferenceableLabel: function(referenceableValue) {
        if (referenceableValue === 'Red - Not Currently Suitable') {
            return 'Red';
        } else if (referenceableValue === 'Yellow - Possible Reference (with qualifications)') {
            return 'Yellow';
        } else if (referenceableValue === 'Green - Good Reference') {
            return 'Green';
        } else if (referenceableValue === 'Unwilling to Provide Reference') {
            return 'Unwilling';
        }else {
            return ' ';
        }
    },
    
    getLRTLabel: function (component,recordTypeName) {
        if (recordTypeName === 'Existing_Client') {
            return component.get('v.accountConsultant.Account.NPS__c'); // Display the record type name
        } else {
            return ' '; // Empty if not "Existing_Client"
        }
    }
})