trigger UpdateIncumbent on Account (after update) {
    // trigger Account_IncumbentSync on Account (after update) {
    Set<Id> accountIds = new Set<Id>();
    // Collect accounts where any incumbent lookup fields changed
    for (Account acc : Trigger.new) {
        Account oldAcc = Trigger.oldMap.get(acc.Id);
        
        if (
            acc.IncumbentPrimaryMedical__c    != oldAcc.IncumbentPrimaryMedical__c ||
            acc.Incumbent_Primary_Pharmacy__c != oldAcc.Incumbent_Primary_Pharmacy__c ||
            acc.IncumbentPrimaryDental__c     != oldAcc.IncumbentPrimaryDental__c ||
            acc.IncumbentPrimaryVision__c     != oldAcc.IncumbentPrimaryVision__c
        ) {
            accountIds.add(acc.Id);
        }
    }
    if (accountIds.isEmpty()) return;
    // Query incumbent lookups + EBDs + anticipated children
    Map<Id, Account> accMap = new Map<Id, Account>(
        [SELECT Id, IncumbentPrimaryMedical__r.Name, Incumbent_Primary_Pharmacy__r.Name, IncumbentPrimaryDental__r.Name, IncumbentPrimaryVision__r.Name  FROM Account
         WHERE Id IN :accountIds]
    );
    List<EBD__c> ebdList = [
        SELECT Id, Company__c,
        (SELECT Id, Product__c, Incumbent__c FROM Anticipated_Bid_Cycle_for_Major_Products__r) FROM EBD__c
        WHERE Company__c IN :accountIds
    ];
    List<Anticipated_Bid_Cycle_For_Major_Products__c> anticipatedToUpdate = new List<Anticipated_Bid_Cycle_For_Major_Products__c>();
    for (EBD__c ebd : ebdList) {
        Account acc = accMap.get(ebd.Company__c);
        for (Anticipated_Bid_Cycle_For_Major_Products__c ant : ebd.Anticipated_Bid_Cycle_for_Major_Products__r) {
            String newIncumbent = null;
            
            if (ant.Product__c == 'Medical') {
                newIncumbent = acc.IncumbentPrimaryMedical__r != null ? acc.IncumbentPrimaryMedical__r.Name : null;
            } else if (ant.Product__c == 'Pharmacy') {
                newIncumbent = acc.Incumbent_Primary_Pharmacy__r != null ? acc.Incumbent_Primary_Pharmacy__r.Name : null;
            } else if (ant.Product__c == 'Dental') {
                newIncumbent = acc.IncumbentPrimaryDental__r != null ? acc.IncumbentPrimaryDental__r.Name : null;
            } else if (ant.Product__c == 'Vision') {
                newIncumbent = acc.IncumbentPrimaryVision__r != null ? acc.IncumbentPrimaryVision__r.Name : null;
            }
            
            if (newIncumbent != null && ant.Incumbent__c != newIncumbent) {
                ant.Incumbent__c = newIncumbent;
                anticipatedToUpdate.add(ant);
            }
        }
    }
    
    if (!anticipatedToUpdate.isEmpty()) {
        update anticipatedToUpdate;
    }
}