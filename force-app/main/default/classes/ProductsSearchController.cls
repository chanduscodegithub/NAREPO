public with sharing class ProductsSearchController {
    @AuraEnabled
    public static ProductResult queryProducts(String searchKeyVal1,String searchKeyVal2,String searchKeyVal3, Decimal pageNumber,String ProductLine) {
        String ProductType =ProductLine;
        UHGAccountSOQLConstants uhgQueryConstants = new UHGAccountSOQLConstants();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        ProductResult ProductResultObj = new ProductResult();
        
        try {
            String searchKey1 = '';
            String searchKey2 = '';
            String searchKey3 = '';
            
            if(searchKeyVal1 == null || searchKeyVal1.trim().length() ==0){
                searchKey1 = '%%';
            }else{
                searchKey1 = '%'+searchKeyVal1+'%';
            }
            
            if(searchKeyVal2 == null || searchKeyVal2.trim().length() ==0){
                searchKey2 = '%%';
            }else{
                searchKey2 = '%'+searchKeyVal2+'%';
            }
            
            /*if(searchKeyVal3 == null || searchKeyVal3.trim().length() ==0){
                searchKey3 = '%%';
            }else{
                searchKey3 = '%'+searchKeyVal3+'%';
            }*/
            ProductResultObj.surestList = getPicklistvalues('Product2','Surest_Applicable_Products__c');
            ProductResultObj.BuyupProductList = getPicklistvalues('OpportunityLineItem','Buyup_Product_Selection__c');
            ProductResultObj.FamilyPickList = getFamilyPickListValues(ProductType);
            /*if(ProductLine!='Surest')
            ProductResultObj.FamilyPickList = getFamilyPickListValues(ProductType);
            else{
                ProductType ='Other';
                ProductResultObj.FamilyPickList = getFamilyPickListValues(ProductType);
            }*/
                
            Boolean prodStatus = true;
            String prodLine = ProductType;
            Integer pageSize = uhgAccountConstants.POPUP_PAGESIZE;
            Integer offset = ((Integer)pageNumber - 1) * pageSize; 
            
            if(schema.sobjecttype.Product2.isaccessible()) {
                List<Product2> prodt = new List<Product2>();
              /* if(ProductLine=='Other'){
                    string surestOther ='Surest Only';
                    ProductResultObj.total = Database.countQuery(UHGMASOQLConstants.QUERY_STRING_PRICEBOOK_PRODUCTS_COUNT_OTHER);
                    ProductResultObj.ProductList = Database.query(UHGMASOQLConstants.QUERY_STRING_PRICEBOOK_WITH_PRODUCTS_SEARCH_OTHER);
                }else*/ if(ProductLine=='Other' || ProductLine=='Vision' || ProductLine=='Dental'){
                    List<string> surestOnly =new list<string>();
                    if(searchKeyVal3==''){
                        /*surestOnly.add('Yes - Surest Only');
                        surestOnly.add('Yes - Surest and/or UNET');
                        surestOnly.add('No - UNET/UMR');
                        surestOnly.add('Yes - Surest Only when along with UNET');*/
                        surestOnly.addAll(ProductResultObj.surestList);
                    }
                    else{
                        surestOnly.add(searchKeyVal3);
                    }
                    ProductResultObj.total = Database.countQuery(UHGMASOQLConstants.QUERY_STRING_PRICEBOOK_PRODUCTS_COUNT_SUREST);
                    ProductResultObj.ProductList = Database.query(UHGMASOQLConstants.QUERY_STRING_PRICEBOOK_WITH_PRODUCTS_SEARCH_SUREST);
                }else{
                    ProductResultObj.total = Database.countQuery(UHGMASOQLConstants.QUERY_STRING_PRICEBOOK_PRODUCTS_COUNT);
                    ProductResultObj.ProductList = Database.query(UHGMASOQLConstants.QUERY_STRING_PRICEBOOK_WITH_PRODUCTS_SEARCH);
                }
                /*if(searchKeyVal3==null || searchKeyVal3==''){
                    ProductResultObj.total = Database.countQuery(UHGMASOQLConstants.QUERY_STRING_PRICEBOOK_PRODUCTS_COUNT);
                    ProductResultObj.ProductList = Database.query(UHGMASOQLConstants.QUERY_STRING_PRICEBOOK_WITH_PRODUCTS_SEARCH);
                }else{
                    ProductResultObj.total = Database.countQuery(UHGMASOQLConstants.QUERY_STRING_PRICEBOOK_PRODUCTS_COUNT_SUREST);
                    ProductResultObj.ProductList = Database.query(UHGMASOQLConstants.QUERY_STRING_PRICEBOOK_WITH_PRODUCTS_SEARCH_SUREST);
                }*/
                ProductResultObj.page = (Integer)pageNumber;
                ProductResultObj.pageSize = pageSize;
            } else {
                throw new NoAccessException();
            }
            
        }catch(NullPointerException nullPointerEx) {
            System.debug('No Access to query the Contact object from SF in getAccountContacts() '+
                         'method -> '+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured');
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Contact object from SF in getAccountContacts() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getAccountContacts() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('You dont have permission to Create/View this record');
        } catch(QueryException queryExec){
            System.debug('Error(QueryException) occurred while querying the details of Conatct object from SF in '+
                         'getAccountContacts() method -> '+queryExec.getMessage());
            System.debug('Error(QueryException) in getAccountContacts() method, the Stack Trace is -> '
                         +queryExec.getStackTraceString());
            throw new AuraHandledException('Query Excetion Occured----');
        }catch(Exception e) {
            System.debug('Error occurred in getAccountContacts() method while querying the details of '+
                         'CMContacts from SF -> ' + e.getMessage());
            throw new AuraHandledException('Technical Exception Occured Please Contact Admin');
        }
        
        System.debug('Output Parameters -> UserList-'+ProductResultObj.ProductList+', Page-'+ProductResultObj.page+
                     ', PageSize-'+ProductResultObj.pageSize+'and TotalNoOfPages-'+ProductResultObj.total);
        
        System.debug('getUserRecords(String searchKeyVal, Decimal pageNumber, String searchField, String operator) - END');
        
        return ProductResultObj;
    }
   /* 
    @AuraEnabled
    public static void createOppLineItm(Id oppId,List<Product2> prod){
        //ProductResult productListResult = null;
        System.debug('oppId'+oppId+'prdId'+prod);
        oppId ='006g000000FNn9xAAD';
        OpportunityLineItem oppLineItm = new OpportunityLineItem();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        try{
            if(schema.sobjecttype.OpportunityLineItem.isAccessible() && schema.sobjecttype.OpportunityLineItem.isCreateable()) {
                if(oppId != null){
                    Set<Id> prdId = new Set<Id>();
                    for(Product2 prd:prod){
                        prdId.add(prd.Id);
                    }
                    System.debug('oppId'+oppId+'prdId'+prdId);
                    Pricebook2 pbook = [SELECT Id, IsStandard FROM Pricebook2 where IsStandard=true Limit 1];
                    List<PricebookEntry> pricEntry = [SELECT Id,Product2Id FROM PricebookEntry where Product2Id IN:prdId And Pricebook2Id=:pbook.Id];
                    System.debug('pbook.Id'+pricEntry);
                    List<OpportunityLineItem> oppListItm = new List<OpportunityLineItem>();
                    for(PricebookEntry pId:pricEntry) {
                        OpportunityLineItem newoppprod = new OpportunityLineItem(    
                            opportunityId = oppId,
                            Quantity = 1,
                            TotalPrice = 200,
                            Product2Id = pId.Product2Id,
                            PricebookEntryId = pId.Id
                        );
                        oppListItm.add(newoppprod);
                    }
                    System.debug('oppListItm'+oppListItm);
                    //insert oppListItm;
                    Database.SaveResult[] SR = Database.insert(oppListItm, false);
                    System.debug('SaveResult: ' + SR);
                    System.debug('accs: ' + oppListItm);
                    for(Integer i=0;i<SR.size();i++){
                        System.debug('SR[i].isSuccess()'+SR[i].isSuccess());
                        if(!SR[i].isSuccess()){
                            system.debug(SR[i].getErrors());
                            system.debug(oppListItm[i]);
                        }else{
                            System.debug('Success');
                        }
                    }
                    //productListResult = queryProducts(String searchKeyVal1,String searchKeyVal2, Decimal pageNumber,String ProductLine);
                }else{
                    throw new NullPointerException();
                }
                
            }else{
                throw new NoAccessException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('No Access to query the Contact object from SF in getAccountContacts() '+'method -> '+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured');
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Contact object from SF in getAccountContacts() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getAccountContacts() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('You dont have permission to Create/View this record');
        } catch(QueryException queryExec){
            System.debug('Error(QueryException) occurred while querying the details of Conatct object from SF in '+
                         'getAccountContacts() method -> '+queryExec.getMessage());
            System.debug('Error(QueryException) in getAccountContacts() method, the Stack Trace is -> '
                         +queryExec.getStackTraceString());
            throw new AuraHandledException('Query Excetion Occured----');
        }catch(Exception e) {
            System.debug('Error occurred in getAccountContacts() method while querying the details of '+
                         'CMContacts from SF -> ' + e.getMessage());
            throw new AuraHandledException('Technical Exception Occured Please Contact Admin');
        }
        
        //return accountTeamMembersResult;
    }  
*/
    
    public static list<string> getPicklistvalues(string objectName, string fieldName){
        List<String> optionList = new List<String>();
        Schema.SObjectType objSobjectType = Schema.getGlobalDescribe().get(objectName) ;
        Schema.DescribeSObjectResult objDescribeSobject = objSobjectType.getDescribe() ;
        Map<String,Schema.SObjectField> fields = objDescribeSobject.fields.getMap() ;
        Schema.DescribeFieldResult fieldResult = fields.get(fieldName).getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        optionList.add('');
        for( Schema.PicklistEntry pickListVal : ple){
            optionList.add(pickListVal.getValue());  
        }
        return optionList;
    }
    
    public static List<String> getFamilyPickListValues(String SelectedTab)
    {
        
        List<String> optionList = new List<String>();
        String SelectedTabStr = '';
        SelectedTabStr = 'Product_Family_'+SelectedTab;
        String mapStr = '';
        MA_GenericMapping__mdt familyPicklist = [SELECT SaleStage_Progression_Mapping__c,Generic_Map_Text__c FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c =:string.escapesinglequotes(SelectedTabStr)];
        mapStr = familyPicklist.Generic_Map_Text__c;
        if(mapStr == null || mapStr == ''){
           MA_GenericMapping__mdt familyPicklistLong = [SELECT SaleStage_Progression_Mapping__c,Generic_Map__c FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c =:string.escapesinglequotes(SelectedTabStr)];
           mapStr = familyPicklistLong.Generic_Map__c;
        }
        if(mapStr != null && mapStr.length() > 0){
            optionList.add('');
            for(string fieldName : mapStr.split(';;'))
            {
                optionList.add(fieldName.trim());                 
            }
        }        
        /*ProductResult prd = new ProductResult();
List<String> options = new List<String>();

Schema.DescribeFieldResult fieldResult =Product2.Product_Category__c.getDescribe();
List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
options.add('');
for( Schema.PicklistEntry f : ple)
{
if(f.getValue() != 'None'){
options.add(f.getValue());
}
System.debug('ple'+f.getValue()+'fieldResult'+ple);
}*/       
        return optionList;
    }
    
    
    public class ProductResult {
        
        @AuraEnabled
        public List<PricebookEntry> ProductList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
        @AuraEnabled
        public List<String> FamilyPickList { get;set; }
        
        @AuraEnabled
        public List<String> surestList { get;set; }
        @AuraEnabled
        public List<String> BuyupProductList { get;set; }
        
        
    }
}