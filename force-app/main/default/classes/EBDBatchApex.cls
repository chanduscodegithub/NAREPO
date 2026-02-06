global class EBDBatchApex implements Database.Batchable<SObject> {

    /* =========================
       CONSTANTS
    ========================== */
    private static final String SOURCE_YEAR = '2025';
    private static final String TARGET_YEAR = '2026';

    private static final Set<String> CM_ACCOUNT_RT_DEV_NAMES = new Set<String>{
        'Pending_Transfer_In_Client',
        'Sold_Client',
        'Existing_Client',
        'Client_Subsidiary'
    };

    /* =========================
       START – ALL CM ACCOUNTS
    ========================== */
   /* global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(
            'SELECT Id, Name ' +
            'FROM Account ' +
            'WHERE RecordType.DeveloperName IN :CM_ACCOUNT_RT_DEV_NAMES'
        );
    }*/
        
        global Database.QueryLocator start(Database.BatchableContext bc) {
    return Database.getQueryLocator([
        SELECT Id, Name
        FROM Account
        WHERE RecordType.DeveloperName IN (
            'Pending_Transfer_In_Client',
            'Sold_Client',
            'Existing_Client',
            'Client_Subsidiary'
        )
    ]);
}


    /* =========================
       EXECUTE
    ========================== */
    global void execute(Database.BatchableContext bc, List<SObject> scope) {

        if (scope.isEmpty()) return;

        List<Account> accounts = (List<Account>) scope;
        Set<Id> accountIds = new Set<Id>();

        for (Account a : accounts) {
            accountIds.add(a.Id);
        }

        /* ---- Fetch 2025 EBDs ---- */
        Map<Id, EBD__c> accTo2025Ebd = new Map<Id, EBD__c>();

        for (EBD__c ebd : [
            SELECT Id, Company__c, Name,
                   Brief_Company_Description__c,
                   Involvement_In_CAC__c,
                   X5_Savings_Plan__c,
                   X10_Savings_Plan__c,
                   X20_Savings_Plan__c,
                   Additional_Comments__c,Client_s_Interest__c, Relationship_History__c, UHC_Services__c
            FROM EBD__c
            WHERE Year__c = :SOURCE_YEAR
            AND Company__c IN :accountIds
        ]) {
            accTo2025Ebd.put(ebd.Company__c, ebd);
        }

        /* ---- Create 2026 EBDs ---- */
        List<EBD__c> newEbds = new List<EBD__c>();
        Map<Id, Id> oldToNewEbdMap = new Map<Id, Id>();

        for (Account acc : accounts) {

            if (accTo2025Ebd.containsKey(acc.Id)) {
                EBD__c oldEbd = accTo2025Ebd.get(acc.Id);
                EBD__c newEbd = oldEbd.clone(false, true, false, false);
                newEbd.Year__c = TARGET_YEAR;
                newEbd.Name = buildEbdName(acc.Name, TARGET_YEAR);
                newEbds.add(newEbd);
            } else {
                EBD__c newEbd = new EBD__c();
                newEbd.Company__c = acc.Id;
                newEbd.Year__c = TARGET_YEAR;
                newEbd.Name = buildEbdName(acc.Name, TARGET_YEAR);
                newEbds.add(newEbd);
            }
        }

        insert newEbds;

        /* ---- Map old → new EBD IDs ---- */
        Integer i = 0;
        for (Account acc : accounts) {
            if (accTo2025Ebd.containsKey(acc.Id)) {
                oldToNewEbdMap.put(
                    accTo2025Ebd.get(acc.Id).Id,
                    newEbds[i].Id
                );
            }
            i++;
        }

        /* ---- Clone Children ---- */
        if (!oldToNewEbdMap.isEmpty()) {
            cloneEntertainment(oldToNewEbdMap);
            cloneNPS(oldToNewEbdMap);
            cloneClientPriority(oldToNewEbdMap);
            cloneB2B(oldToNewEbdMap);
            cloneAdvocacy(oldToNewEbdMap);
            cloneAnticipatedBid(oldToNewEbdMap);
        }
    }

    /* =========================
       CHILD CLONE METHODS
    ========================== */

    private static void cloneEntertainment(Map<Id, Id> mapIds) {
        List<Entertainment__c> src = [
            SELECT Id, EBD__c,
                   Client_Representative_s__c,
                   UHG_Representative_s__c,
                   Event__c,
                   Timing__c
            FROM Entertainment__c
            WHERE EBD__c IN :mapIds.keySet()
        ];
        List<Entertainment__c> clones = new List<Entertainment__c>();
        for (Entertainment__c r : src) {
            Entertainment__c c = r.clone(false, true, false, false);
            c.EBD__c = mapIds.get(r.EBD__c);
            clones.add(c);
        }
        if (!clones.isEmpty()) insert clones;
    }

    private static void cloneNPS(Map<Id, Id> mapIds) {
        List<EBD_NPS__c> src = [
            SELECT Id, EBD__c,
                   Strategy__c,
                   Other_Strategy__c,
                   Action_Steps_Planned_Taken__c,
                   Estimated_Completion_Date__c
            FROM EBD_NPS__c
            WHERE EBD__c IN :mapIds.keySet()
        ];
        List<EBD_NPS__c> clones = new List<EBD_NPS__c>();
        for (EBD_NPS__c r : src) {
            EBD_NPS__c c = r.clone(false, true, false, false);
            c.EBD__c = mapIds.get(r.EBD__c);
            clones.add(c);
        }
        if (!clones.isEmpty()) insert clones;
    }

    private static void cloneClientPriority(Map<Id, Id> mapIds) {
        List<Client_Priority__c> src = [
            SELECT Id, EBD__c,
                   UHG_Strategy__c,
                   Client_Priority__c
            FROM Client_Priority__c
            WHERE EBD__c IN :mapIds.keySet()
        ];
        List<Client_Priority__c> clones = new List<Client_Priority__c>();
        for (Client_Priority__c r : src) {
            Client_Priority__c c = r.clone(false, true, false, false);
            c.EBD__c = mapIds.get(r.EBD__c);
            clones.add(c);
        }
        if (!clones.isEmpty()) insert clones;
    }

    private static void cloneB2B(Map<Id, Id> mapIds) {
        List<B2B__c> src = [
            SELECT Id, EBD__c, Name,
                   UHG_Business_Segment__c,
                   Service_Solution__c,
                   UHG_Buyer_or_Decision_Make__c,
                   Revenue__c
            FROM B2B__c
            WHERE EBD__c IN :mapIds.keySet()
        ];
        List<B2B__c> clones = new List<B2B__c>();
        for (B2B__c r : src) {
            B2B__c c = r.clone(false, true, false, false);
            c.EBD__c = mapIds.get(r.EBD__c);
            clones.add(c);
        }
        if (!clones.isEmpty()) insert clones;
    }

    private static void cloneAdvocacy(Map<Id, Id> mapIds) {
        List<Advocacy__c> src = [
            SELECT Id, EBD__c, Name,
                   Vendor_Model__c,
                   Site_if_in_house__c,
                   Service__c
            FROM Advocacy__c
            WHERE EBD__c IN :mapIds.keySet()
        ];
        List<Advocacy__c> clones = new List<Advocacy__c>();
        for (Advocacy__c r : src) {
            Advocacy__c c = r.clone(false, true, false, false);
            c.EBD__c = mapIds.get(r.EBD__c);
            clones.add(c);
        }
        if (!clones.isEmpty()) insert clones;
    }

    private static void cloneAnticipatedBid(Map<Id, Id> mapIds) {
        List<Anticipated_Bid_Cycle_For_Major_Products__c> src = [
            SELECT Id, EBD__c, Name,
                   Product__c,
                   Incumbent__c,
                   Deal_Cycle__c,
                   Status__c
            FROM Anticipated_Bid_Cycle_For_Major_Products__c
            WHERE EBD__c IN :mapIds.keySet()
        ];
        List<Anticipated_Bid_Cycle_For_Major_Products__c> clones = new List<Anticipated_Bid_Cycle_For_Major_Products__c>();
        for (Anticipated_Bid_Cycle_For_Major_Products__c r : src) {
            Anticipated_Bid_Cycle_For_Major_Products__c c =
                r.clone(false, true, false, false);
            c.EBD__c = mapIds.get(r.EBD__c);
            clones.add(c);
        }
        if (!clones.isEmpty()) insert clones;
    }

    /* =========================
       NAME BUILDER
    ========================== */
    private static String buildEbdName(String companyName, String year) {
        if (String.isBlank(companyName)) companyName = 'Company';
        companyName = companyName.trim();
        if (companyName.length() > 35) {
            companyName = companyName.substring(0, 35);
        }
        return companyName + '-' + year;
    }

    /* =========================
       FINISH
    ========================== */
    global void finish(Database.BatchableContext bc) {
        System.debug('EBD batch completed for ' + TARGET_YEAR);
    }
}