public with sharing class AccountsController {
    
    public static Membership_QA_Controller.AccountResult getAccountRecords(String searchKeyVal, Decimal pageNumber, String searchField, String operator, Boolean isAggregator, Membership_QA_Controller.AccountResult accountResultObj, Boolean isAggregatorsToBeShown) { 
        
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        
        String searchKey = '';
        
        isAggregatorsToBeShown = (isAggregatorsToBeShown != null) ? isAggregatorsToBeShown : true;
            
        if(searchKeyVal != null && searchKeyVal.trim().length() > 0 &&
           searchField != null && searchField.trim().length() > 0 && 
           operator != null && operator.trim().length() > 0) {    
               if(searchField.equalsIgnoreCase('Category')) {
                   searchField = 'Category__c';       
               }
               
               if(operator.equalsIgnoreCase(uhgAccountConstants.BEGINS_WITH)) {
                   searchKey = searchKeyVal + '%';
               } else if(operator.equalsIgnoreCase(uhgAccountConstants.CONTAINS)) {
                   searchKey = '%' + searchKeyVal + '%';
               } else if(operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)) {
                   searchKey = searchKeyVal;
               }
           }
        
        String accountCategoryKey = '';
        String accountCategorySearchKey = '';
        if(isAggregator != null && isAggregator) {
            /*accountCategoryKey = '=\'Aggregator\' and Subtype__c=\'Collaborative Ventures Group (CVG)\'';
            accountCategorySearchKey = '=\'Aggregator\' and Subtype__c=\'Collaborative Ventures Group (CVG)\' and (';*/
            accountCategoryKey = '=\'Aggregator\'';
            accountCategorySearchKey = '=\'Aggregator\' and (';
        } else { 
            if(isAggregatorsToBeShown == false) {
                accountCategoryKey = ' IN (\'Client Management\',\'Client Development\')';
                accountCategorySearchKey = ' IN (\'Client Management\',\'Client Development\') and ('; 
            } else {
                accountCategoryKey = ' IN (\'Client Management\',\'Client Development\',\'Aggregator\')';
                accountCategorySearchKey = ' IN (\'Client Management\',\'Client Development\',\'Aggregator\') and (';
            }
        }
        Integer pageSize = uhgAccountConstants.POPUP_PAGESIZE;
        Integer offset = ((Integer)pageNumber - 1) * pageSize; 
        
        if(schema.sobjecttype.Account.isaccessible()) {
            if(searchKey != null && searchKey.trim().length() > 0) {
                accountResultObj.total = Database.countQuery('SELECT count() FROM Account WHERE Category__c '+accountCategoryKey+' and '+searchField+' LIKE :searchKey');
                System.debug('Total No of Records-'+accountResultObj.total);
                if(operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)) {
                    System.debug('QueryStrForEquals-'+UHGMASOQLConstants.QUERY_STRING_ACCOUNT_SEARCH+accountCategorySearchKey+searchField+UHGMASOQLConstants.QUERY_STRING_ACCOUNT_SEARCH2+UHGMASOQLConstants.QUERY_STRING_ACCOUNT_SEARCH3);
                    accountResultObj.accountList = Database.query(UHGMASOQLConstants.QUERY_STRING_ACCOUNT_SEARCH+accountCategorySearchKey+searchField+UHGMASOQLConstants.QUERY_STRING_ACCOUNT_SEARCH2+UHGMASOQLConstants.QUERY_STRING_ACCOUNT_SEARCH3);
                } else {
                    System.debug('QueryStrForOther-'+UHGMASOQLConstants.QUERY_STRING_ACCOUNT_SEARCH+accountCategorySearchKey+searchField+UHGMASOQLConstants.QUERY_STRING_ACCOUNT_SEARCH1+UHGMASOQLConstants.QUERY_STRING_ACCOUNT_SEARCH3);
                    accountResultObj.accountList = Database.query(UHGMASOQLConstants.QUERY_STRING_ACCOUNT_SEARCH+accountCategorySearchKey+searchField+UHGMASOQLConstants.QUERY_STRING_ACCOUNT_SEARCH1+UHGMASOQLConstants.QUERY_STRING_ACCOUNT_SEARCH3); 
                }
                
            } else {
                accountResultObj.total = Database.countQuery('SELECT count() FROM Account WHERE Category__c '+accountCategoryKey);
                accountResultObj.accountList = Database.query(UHGMASOQLConstants.QUERY_STRING_ACCOUNT+accountCategoryKey+UHGMASOQLConstants.QUERY_STRING_ACCOUNT1);
            }
            
            accountResultObj.page = (Integer)pageNumber;
            accountResultObj.pageSize = pageSize;
            
        } else {
            throw new NoAccessException();
        }
        
        return accountResultObj;
    }
    
}