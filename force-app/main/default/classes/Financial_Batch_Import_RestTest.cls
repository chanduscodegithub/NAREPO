@isTest(SeeAllData=true)
private class Financial_Batch_Import_RestTest {
    
    @isTest static void validateAccountType(){
        RestRequest request = new RestRequest();
        RestResponse res = new RestResponse();
        request.requestUri ='services/apexrest/FinancialDataImport/';
        request.httpMethod = 'POST';
        request.addHeader('Content-Type', 'application/json'); 
        
        List<Financial_Batch_Import_Rest.JsonRequest> financials = new List<Financial_Batch_Import_Rest.JsonRequest>();
        Financial_Batch_Import_Rest.JsonRequest f1 = new Financial_Batch_Import_Rest.JsonRequest();
       
        f1.revenue_Rx = '0';
        f1.name_Medical = 'A.O. SMITH CORPORATION';
        f1.currentYear_Medical = '2';
        f1.dealYears_Medical = '3';
        f1.totExpRx_Rx = '0';
        f1.membership_Rx = '0';
        f1.revenue_Medical = '1676425.32';
        f1.company_Rx = '710542';
        f1.externalUniqueId_Medical = '10962';
        f1.year_Medical = Date.valueOf('2011-01-01');
        f1.companyId_Medical = '710542';
        f1.margin_Medical = '161851.9039';
        f1.lastUpdated_Medical = Date.valueOf('2011-09-06');
        f1.name_Rx = 'A.O. SMITH CORPORATION';
        f1.lastUpdated_Rx = Date.valueOf('2011-09-06');
        f1.externalUniqueId_Rx = '10962';        
        f1.membership_Medical = '8509';
        f1.year_Rx = Date.valueOf('2011-01-01');
        financials.add(f1);
        
        Financial_Batch_Import_Rest.JsonRequest f2 = new Financial_Batch_Import_Rest.JsonRequest();
        f2.revenue_Rx = '0';
        f2.name_Medical = 'A.O. SMITH CORPORATION';
        f2.currentYear_Medical = '2';
        f2.dealYears_Medical = '3';
        f2.totExpRx_Rx = '0';
        f2.membership_Rx = '0';
        f2.revenue_Medical = '1676425.32';
        f2.company_Rx = '710542';
        //f2.externalUniqueId_Medical = '10962';
        f2.year_Medical = Date.valueOf('2011-01-01');
        f2.companyId_Medical = '710542';
        f2.margin_Medical = '161851.9039';
        f2.lastUpdated_Medical = Date.valueOf('2011-09-06');
        f2.name_Rx = 'A.O. SMITH CORPORATION';
        f2.lastUpdated_Rx = Date.valueOf('2011-09-06');
        f2.externalUniqueId_Rx = '61742';        
        f2.membership_Medical = '7367';
        f2.year_Rx = Date.valueOf('2011-01-02');
        financials.add(f2); 
        
        Test.startTest();
        List<Financial_Batch_Import_Rest.JsonResponse> responseList =  Financial_Batch_Import_Rest.createORUpdateFinancialRecords(financials);
        System.debug('responseList  ==>' +responseList);
        Test.stopTest();                    
    }          
}