trigger StaffDuplicateCheck on Staff__c (before insert) {
	// Set to store user ids
	Set <Id> userSet = new Set<Id>(); 
    
    // Iterate through each Staff and add their user id to the Set
    for (Staff__c sf:trigger.new) {
    	userSet.add(sf.Staff_Name__c);  
    }
    
    // New list to store the found users
    List <Staff__c> staffList = new List<Staff__c>();
    // Populating the list using SOQL
    staffList = [SELECT Staff_Name__c FROM Staff__c WHERE Staff_Name__c IN :userSet];
    // Iterating through each Staff record to see if the same user was found
    for (Staff__c sf:trigger.new) {
        If (staffList.size() > 0) {
        	// Displaying the error
        	sf.Staff_Name__c.adderror( 'Duplicate Staff Found. Use Existing Staff.' );
        }
    }
}