public class AccountStrategyMemoHandler {

    public static void updateStrategyMemos(List<Account> newList, Map<Id, Account> oldMap) {

        /**********************************************
         * 1. Account → Strategy Memo mappings
         **********************************************/
        List<FieldMapping> mappings = new List<FieldMapping>{
            new FieldMapping('BusinessPressures__c', 'Business_Pressures__c'),
            new FieldMapping('Comments__c', 'Business_Overview__c'),
            new FieldMapping('PotentialCompellingEvent__c', 'Potential_Compelling_Event__c'),
            new FieldMapping('OurPotentialUniqueBusinessValue__c', 'Unique_Business_Value__c'),
            new FieldMapping('KeyRiskstoourUBV__c', 'Key_Risks_to_our_UBV__c'),
            new FieldMapping('OutcomeDrivers__c', 'Outcome_Drivers__c'),
            new FieldMapping('ApproachStrategy__c', 'Approach_Strategy__c'),
            new FieldMapping('Surest_Last_Action_Taken__c', 'Surest_Last_Action_Taken__c'),
            new FieldMapping('Surest_Next_Action_to_be_Taken__c', 'Surest_Next_Action_to_be_Taken__c'),
            new FieldMapping('Surest_Approach_Strategy__c', 'Surest_Approach_Strategy__c'),
            new FieldMapping('Surest_Network_Constraints__c', 'Surest_Netwok__c'),
            new FieldMapping('Surest_Comments__c', 'Surest_Comments__c'),
            new FieldMapping('Network_Contracting_Issue_Other__c', 'Network_Contracting_Issue_Other__c'),
            new FieldMapping('Private_Equity_Relationship__c', 'Private_Equity_Relationship__c'),
			new FieldMapping('CVGAccount__c', 'CVG_Association__c', true),
            new FieldMapping('Coveted_Account__c', 'Coveted_Account_SVP__c'),
            new FieldMapping('Web_Address__c', 'Website_URL__c'),
            new FieldMapping('Primary_Situs_State__c', 'Primary_Situs_State__c'),
            new FieldMapping('BillingAddress', 'Address__c'),
            new FieldMapping('BillingCity', 'Headquarters_City__c'),
            new FieldMapping('Health_Plan_Manager_Industry__c', 'Health_Plan_Manager_Industry__c'),
            new FieldMapping('AnnualRevenue__c', 'Annual_Revenue__c'),
            new FieldMapping('X2nd_Blues_Bid_Comments__c', 'Bidding_Blue_Plans__c'),
            new FieldMapping('Eligible_for_2nd_Blues_Bid__c', 'Eligible_for_second_Blues_bid__c')
        };

        /**********************************************
         * 2. Detect changed Accounts
         **********************************************/
        Set<Id> changedAccIds = new Set<Id>();

        for (Account accNew : newList) {
            Account accOld = oldMap.get(accNew.Id);
            for (FieldMapping m : mappings) {
                if (accNew.get(m.accountField) != accOld.get(m.accountField)) {
                    changedAccIds.add(accNew.Id);
                    break;
                }
            }
        }
        if (changedAccIds.isEmpty()) return;

        /**********************************************
         * 3. Fetch Opportunities (Medical Stage != Notified)
         **********************************************/
        List<Opportunity> oppList = [
            SELECT Id, AccountId
            FROM Opportunity
            WHERE AccountId IN :changedAccIds
            AND Sales_Stage_Medical__c != 'Notified'
        ];
        if (oppList.isEmpty()) return;

        Set<Id> oppIds = new Set<Id>();
        for (Opportunity o : oppList) oppIds.add(o.Id);

        /**********************************************
         * 4. Fetch Strategy Memos
         **********************************************/
        List<Strategy_Memo__c> memoList = [
            SELECT Id, Membership_Activity__c
            FROM Strategy_Memo__c
            WHERE Membership_Activity__c IN :oppIds
        ];
        if (memoList.isEmpty()) return;

        /**********************************************
         * 5. Query Accounts with lookup relationships
         **********************************************/
        Map<Id, Account> accMap = new Map<Id, Account>([
            SELECT Id,CVGAccount__c,
                   CVGAccount__r.Name,
                   BillingAddress,
                   BusinessPressures__c,
                   Comments__c,
                   PotentialCompellingEvent__c,
                   OurPotentialUniqueBusinessValue__c,
                   KeyRiskstoourUBV__c,
                   OutcomeDrivers__c,
                   ApproachStrategy__c,
                   Surest_Last_Action_Taken__c,
                   Surest_Next_Action_to_be_Taken__c,
                   Surest_Approach_Strategy__c,
                   Surest_Network_Constraints__c,
                   Surest_Comments__c,
                   Network_Contracting_Issue_Other__c,
                   Private_Equity_Relationship__c,
                   Coveted_Account__c,
                   Web_Address__c,
                   Primary_Situs_State__c,
                   BillingCity,
                   Health_Plan_Manager_Industry__c,
                   AnnualRevenue__c,
                   X2nd_Blues_Bid_Comments__c,
                   Eligible_for_2nd_Blues_Bid__c
            FROM Account
            WHERE Id IN :changedAccIds
        ]);

        /**********************************************
         * 6. Opp → Account map
         **********************************************/
        Map<Id, Id> oppToAcc = new Map<Id, Id>();
        for (Opportunity o : oppList) {
            oppToAcc.put(o.Id, o.AccountId);
        }

        /**********************************************
         * 7. Apply mappings
         **********************************************/
        List<Strategy_Memo__c> memosToUpdate = new List<Strategy_Memo__c>();

        for (Strategy_Memo__c memo : memoList) {
            Id accId = oppToAcc.get(memo.Membership_Activity__c);
            if (accId == null) continue;

            Account acc = accMap.get(accId);
            if (acc == null) continue;

            for (FieldMapping m : mappings) {

                // ===== LOOKUP NAME =====
                if (m.isLookup) {
                    SObject rel = acc.getSObject(m.accountField.replace('__c', '__r'));
                    if (rel != null && rel.get('Name') != null) {
                        memo.put(m.memoField, rel.get('Name'));
                    }
                    continue;
                }

                Object val = acc.get(m.accountField);
                if (val == null) continue;

                Schema.DescribeFieldResult targetDescribe =
                    Strategy_Memo__c.SObjectType.getDescribe()
                        .fields.getMap().get(m.memoField).getDescribe();

                Schema.DisplayType targetType = targetDescribe.getType();

                // ===== BOOLEAN =====
                if (targetType == Schema.DisplayType.Boolean) {
                    if (val instanceof Boolean)
                        memo.put(m.memoField, (Boolean) val);
                    else if (val instanceof String)
                        memo.put(m.memoField,
                            ((String) val).toLowerCase() == 'yes' ||
                            ((String) val).toLowerCase() == 'true');
                    continue;
                }

                // ===== STRING / TEXT / TEXTAREA =====
                if (targetType == Schema.DisplayType.String ||
                    targetType == Schema.DisplayType.TextArea) {

                    if (val instanceof Address) {
                        Address a = (Address) val;
                        String addr = '';
                        if (a.street != null) addr += a.street + ', ';
                        if (a.city != null) addr += a.city + ', ';
                        if (a.state != null) addr += a.state + ', ';
                        if (a.postalCode != null) addr += a.postalCode + ', ';
                        if (a.country != null) addr += a.country;
                        memo.put(m.memoField, addr.trim());
                    } else {
                        memo.put(m.memoField, String.valueOf(val));
                    }
                    continue;
                }

                // ===== DATE =====
                if (targetType == Schema.DisplayType.Date && val instanceof Date) {
                    memo.put(m.memoField, (Date) val);
                    continue;
                }

                // ===== DATETIME =====
                if (targetType == Schema.DisplayType.DateTime && val instanceof Datetime) {
                    memo.put(m.memoField, (Datetime) val);
                    continue;
                }

                // ===== NUMBER =====
                if (targetType == Schema.DisplayType.Currency ||
                    targetType == Schema.DisplayType.Double ||
                    targetType == Schema.DisplayType.Percent ||
                    targetType == Schema.DisplayType.Integer) {

                    if (val instanceof Decimal) memo.put(m.memoField, (Decimal) val);
                    else if (val instanceof Integer) memo.put(m.memoField, (Integer) val);
                    else if (val instanceof Double) memo.put(m.memoField, (Double) val);
                }
            }

            memosToUpdate.add(memo);
        }

        if (!memosToUpdate.isEmpty()) {
            update memosToUpdate;
        }
    }

    /**********************************************
     * Helper Mapping Class
     **********************************************/
    public class FieldMapping {
        public String accountField;
        public String memoField;
        public Boolean isLookup;

        public FieldMapping(String accFld, String memoFld) {
            accountField = accFld;
            memoField = memoFld;
            isLookup = false;
        }

        public FieldMapping(String accFld, String memoFld, Boolean lookup) {
            accountField = accFld;
            memoField = memoFld;
            isLookup = lookup;
        }
    }
}