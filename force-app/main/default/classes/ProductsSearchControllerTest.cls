@isTest(SeeAllData=true)
public class ProductsSearchControllerTest {

    public testMethod static void validateQueryProducts(){        
        Test.startTest();
        try{
         	ProductsSearchController.queryProducts(null, null, null, null, null);   
        }catch(Exception ex){
            System.debug('Messge '+ex.getMessage());
        }
        try{
            ProductsSearchController.queryProducts('a', 'c', 'b', 2, 'Medical'); 
        }catch(Exception ex){
            System.debug('Messge '+ex.getMessage());
        }        
        
        Test.stopTest();
    }
    
}