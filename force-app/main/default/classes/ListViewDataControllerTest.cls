@isTest(SeeAllData=true)
public class ListViewDataControllerTest {
    
    public testMethod static void validateGetListViewDataFromController(){  
        Test.startTest();
        try{
            ListViewDataController.getListViewDataFromController(); 
        }catch(Exception ex){
            System.debug('ex '+ex.getMessage());
        }
            
        Test.stopTest();        
    }
    public testMethod static void validateGetFilterQuery(){  
        Test.startTest();
            Id listViewId = [select id from ListView where SobjectType = 'Account' Limit 1].Id;
        if (test.isRunningTest()) Test.setMock(HttpCalloutMock.class, new ListMockHttpResGenerator());
        ListViewDataController.getFilterQuery(listViewId, 'Account');
        Test.stopTest();        
    }
}