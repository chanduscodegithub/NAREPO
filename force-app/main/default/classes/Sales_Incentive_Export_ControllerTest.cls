@isTest
private class Sales_Incentive_Export_ControllerTest {

    @testSetup static void setup(){

		/*Account accData = new Account(Name = 'Test Account');
        insert accData;
        system.debug('accData : '+accData);*/
        
        Account acc = new Account();
        acc.Name = 'Test Account';
        acc.Subtype__c ='Prospect';
        acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert acc;
        system.debug('accData : '+acc);
	        
        Opportunity oppData = new Opportunity();
        RecordType recordType = new RecordType();
        recordType.DeveloperName = 'CM';
        oppData.AccountId = acc.Id;
        oppData.Name = 'Test Opportunity';
        oppData.StageName = 'Open';
        oppData.CloseDate = Date.today();
        oppData.Does_this_Oppty_Risk_Involve_Exchanges__c = 'Yes';
        oppData.Exchanges_the_Company_is_Looking_At__c = 'Extend Health';
        oppData.Is_the_PEX_Team_Creating_this_Oppty_Risk__c = 'Yes';
        oppData.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        oppData.EffectiveDate__c = Date.today();
        insert oppData;
        system.debug('oppData : '+oppData);
        
        
        PriceBook2 book2 = new PriceBook2();
        book2.Name = 'Test book2';
        insert book2;
        
        
        List<Product2> prod = new List<Product2>();
        
        Product2 prod1 = new Product2(
            Name = 'Total',
            Product_Line__c='Pharmacy',
            IsActive = true
            
        );
        insert prod1;
        Product2 prod2 = new Product2(
            Name = 'Other',
            Product_Line__c='Other',
            IsActive = true
            
        );
        insert prod2;
        prod.add(prod1);
        prod.add(prod2);
        
        
        PricebookEntry pbe1 = new PricebookEntry(Pricebook2Id = book2.Id, Product2Id = prod1.Id, UnitPrice = 1000, IsActive = true);
        pbe1.Pricebook2Id = Test.getStandardPricebookId();
        insert pbe1;
        
        PricebookEntry pbe2 = new PricebookEntry(Pricebook2Id = book2.Id, Product2Id = prod2.Id, UnitPrice = 1000, IsActive = true);
        pbe2.Pricebook2Id = Test.getStandardPricebookId();
        insert pbe2;
        
        
        OpportunityLineItem oppLineData = new OpportunityLineItem();
        oppLineData.OpportunityId = oppData.Id;
        oppLineData.Submit_for_sales_incentives__c = true;
        //oppLineData.Product2.Name = 'Total';
        //oppLineData.PricebookEntry.Product2.Product_Line__c = 'Total';
        oppLineData.PricebookEntryId = pbe1.Id;
        oppLineData.Quantity = 100;
        oppLineData.UnitPrice = 12;
        insert oppLineData;
        
        
        OpportunityLineItem oppLineData2 = new OpportunityLineItem();
        oppLineData2.OpportunityId = oppData.Id;
        oppLineData2.Submit_for_sales_incentives__c = true;
        oppLineData2.PricebookEntryId = pbe2.Id;
        oppLineData2.Quantity = 100;
        oppLineData2.UnitPrice = 12;
        insert oppLineData2;
        
        OpportunityLineItem oppLineData3 = new OpportunityLineItem();
        oppLineData3.OpportunityId = oppData.Id;
        oppLineData3.Submit_for_sales_incentives__c = true;
        oppLineData3.PricebookEntryId = pbe1.Id;
        oppLineData3.Quantity = 100;
        oppLineData3.UnitPrice = 12;
        oppLineData3.Date_sent_to_ISI_Site__c = Date.today();
        insert oppLineData3;
        
        Renewal_Status__c renewalData = new Renewal_Status__c();
        renewalData.Submit_for_sales_incentives__c=true;
        renewalData.isRenewalStatusRecord__c=true;
        renewalData.Product_Line__c='Pharmacy';
        renewalData.Efective_Date__c=Date.today();
        renewalData.Company__c=acc.Id;
        renewalData.Eligible_for_Sales_Incentives__c = 'Yes';
        renewalData.Sales_Cycle__c = 'IY20, 1/1/21';
        
        insert renewalData;
        
        Renewal_Status__c renewalData2 = new Renewal_Status__c();
        renewalData2.Submit_for_sales_incentives__c=true;
        renewalData2.isRenewalStatusRecord__c=true;
        renewalData2.Product_Line__c='Pharmacy';
        renewalData2.Efective_Date__c=Date.today();
        renewalData2.Company__c=acc.Id;
        renewalData2.Eligible_for_Sales_Incentives__c = 'Yes';
        renewalData2.Sales_Cycle__c = 'IY20, 1/1/21';
        renewalData2.Date_sent_to_ISI_Site__c =  Date.today();
        
        insert renewalData2;
        
    }    
    
    @isTest static void getOpprtntyPrdctAndRnwlStatusRecordsTest() {
        
         String selCategoryVal = 'NB and NBEA';
         String selectCategoryVal = 'Renewal';
         Date fromDate = Date.today();
         Date toDate = Date.today();
         List<String> productList = new List<String>();
         productList.add('Medical');
         productList.add('Pharmacy');
        productList.add('Other – Underwriter Validation Required');
        productList.add('Other – Financial Accounts');
        productList.add('Other – Retiree');
        productList.add('Other – All Other');
        
        List<String> nonOtherProductList = new List<String>();
        nonOtherProductList.add('Medical');
        
         
         List<String> renewalList = new List<String>();
         renewalList.add('Pharmacy');
         renewalList.add('Dental');
         
         Sales_Incentive_Export_Controller.getOpprtntyPrdctAndRnwlStatusRecords(1,selCategoryVal,fromDate,toDate,productList);
        Sales_Incentive_Export_Controller.getOpprtntyPrdctAndRnwlStatusRecords(1,selCategoryVal,fromDate,toDate,nonOtherProductList);
        Sales_Incentive_Export_Controller.getOpprtntyPrdctAndRnwlStatusRecords(1,'NB',fromDate,toDate,nonOtherProductList);
        Sales_Incentive_Export_Controller.getOpprtntyPrdctAndRnwlStatusRecords(1,'NBEA',fromDate,toDate,nonOtherProductList);
         Sales_Incentive_Export_Controller.getOpprtntyPrdctAndRnwlStatusRecords(1,'Renewal',fromDate,toDate,renewalList);
    } 
    
    @isTest static void getTemplateInXMLTest() {
        
        String filterType = 'Renewal';
        Sales_Incentive_Export_Controller.getTemplateInXML(filterType);
        Sales_Incentive_Export_Controller.getTemplateInXML('NB and NBEA');
        
    }
    
    @isTest static void getselectOptionsTest() {
        
        String objectName = 'Opportunity';
        string fieldName = 'Category__c';
        Sales_Incentive_Export_Controller.getselectOptions(objectName,fieldName);
    }
    
    @isTest static void getOpprtntyPrdctAndRnwlStatusRecordsToExportTest() {
        List<ID> idList = new List<ID>(); 
        String recordType = 'Renewal';
       /* if(recordType == 'Renewal'){
            Sales_Incentive_Export_Controller.getOpprtntyPrdctAndRnwlStatusRecordsToExport(idList,recordType);
        }else{
            Sales_Incentive_Export_Controller.getOpprtntyPrdctAndRnwlStatusRecordsToExport(idList,'NB\\NBEA');
        }*/
         Sales_Incentive_Export_Controller.getOpprtntyPrdctAndRnwlStatusRecordsToExport(idList,recordType);
         Sales_Incentive_Export_Controller.getOpprtntyPrdctAndRnwlStatusRecordsToExport(idList,'NB\\NBEA');
        
    }
    
    @isTest static void upsertRecordsTest() {
        
        List<OpportunityLineItem> oppLineUpdateList = [select Id from OpportunityLineItem where Date_sent_to_ISI_Site__c != null limit 1];
        //Sales_Incentive_Export_Controller.upsertRecords(filterType);
        List<Renewal_Status__c> renewalUpdateList = [select Id from Renewal_Status__c where Date_sent_to_ISI_Site__c != null Limit 1];
        
        String fileName = 'ISI Export 06_12_2019 11_58_55 AM NBNBEA';
        String fileDate = '7_15_2019';
        
        String fileContent = '<?xml version="1.0"?>'+
                             '<?mso-application progid="Excel.Sheet"?>'+
            				 '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"'+
            				 'xmlns:o="urn:schemas-microsoft-com:office:office"'+
            				 'xmlns:x="urn:schemas-microsoft-com:office:excel"'+
            				 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"'+
            				 'xmlns:html="http://www.w3.org/TR/REC-html40">'+
            				 '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">'+
            				 '<Created>2015-06-05T18:17:20Z</Created>'+
            				 '<LastSaved>2019-06-26T09:59:07Z</LastSaved>'+
            				 '<Version>15.00</Version>'+
            				 ' </DocumentProperties>'+
            				 '<OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office">'+
            				 '<AllowPNG/>'+
            				 '<RemovePersonalInformation/>'+
            				 '</OfficeDocumentSettings>'+
            				 '<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">'+
                              '<WindowHeight>12650</WindowHeight>'+
                              '<WindowWidth>22260</WindowWidth>'+
                              '<WindowTopX>0</WindowTopX>'+
                              '<WindowTopY>0</WindowTopY>'+
                              '<ProtectStructure>False</ProtectStructure>'+
                              '<ProtectWindows>False</ProtectWindows>'+
                             '</ExcelWorkbook>'+
                             '<Styles>'+
                              '<Style ss:ID="Default" ss:Name="Normal">'+
                               '<Alignment ss:Vertical="Bottom"/>'+
                               '<Borders/>'+
                               '<Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>'+
                               '<Interior/>'+
                               '<NumberFormat/>'+
                               '<Protection/>'+
                              '</Style>'+
                              '<Style ss:ID="s16">'+
                               '<Alignment ss:Vertical="Bottom" ss:WrapText="1"/>'+
                               '<Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000" ss:Bold="1"/>'+
                               '<NumberFormat ss:Format="@"/>'+
                              '</Style>'+
                              '<Style ss:ID="s17">'+
                               '<Alignment ss:Vertical="Bottom" ss:WrapText="1"/>'+
                               '<NumberFormat ss:Format="@"/>'+
                              '</Style>'+
                             '</Styles>'+
                             '<Worksheet ss:Name="Sheet1">'+
                              '<Table ss:ExpandedColumnCount="23" ss:ExpandedRowCount="4" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="14.5">'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="109.5"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="114.5"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="72.5" ss:Span="1"/>'+
                               '<Column ss:Index="5" ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="127"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="153.5"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="124.5"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="119"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="123"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="136"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="132.5"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="110.5"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="143.5"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="142"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="108.5"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="125"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="107.5"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="136"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="132"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="209.5"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="150"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="125.5"/>'+
                               '<Column ss:StyleID="s17" ss:AutoFitWidth="0" ss:Width="78"/>'+
                               '<Row>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Company Name</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Company ID</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">CLP#</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Effective Date</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Type (NB\NBEA\Renewal)</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Product Name</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Renewal Product Detail</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Product ID</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Sales Person 1</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Sales Person 1 Employee ID</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Sales Person 1 Split Percent</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Sales Person 2</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Sales Person 2 Employee ID</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Sales Person 2 Split Percent</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">VPCR\RVP</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">VPCR\RVP Employee ID</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Underwriter</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Underwriter Email Address</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Membership (Net Results)</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Date Ready to Send to IncentiveComp Team</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Membership Activity Name</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Membership Activity ID</Data></Cell>'+
                                '<Cell ss:StyleID="s16"><Data ss:Type="String">Date</Data></Cell>'+
                               '</Row>'+
                               '<Row ss:AutoFitHeight="0" ss:Height="72.5">'+
                                '<Cell><Data ss:Type="String">Columbia University</Data></Cell>'+
                                '<Cell><Data ss:Type="String">0016A00000U4nCcQAJ</Data></Cell>'+
                                '<Cell><Data ss:Type="String">0712790</Data></Cell>'+
                                '<Cell><Data ss:Type="String">1/1/2019</Data></Cell>'+
                                '<Cell><Data ss:Type="String">NBEA</Data></Cell>'+
                                '<Cell><Data ss:Type="String">Dental</Data></Cell>'+
                                '<Cell><Data ss:Type="String"></Data></Cell>'+
                                '<Cell><Data ss:Type="String">01t6A000003PTOEQA4</Data></Cell>'+
                                '<Cell><Data ss:Type="String">Paul Buttacavoli</Data></Cell>'+
                                '<Cell><Data ss:Type="String">000722354</Data></Cell>'+
                                '<Cell><Data ss:Type="String">100</Data></Cell>'+
                                '<Cell><Data ss:Type="String"></Data></Cell>'+
                                '<Cell><Data ss:Type="String"></Data></Cell>'+
                                '<Cell><Data ss:Type="String"></Data></Cell>'+
                                '<Cell><Data ss:Type="String">David Lardieri</Data></Cell>'+
                                '<Cell><Data ss:Type="String">000096564</Data></Cell>'+
                                '<Cell><Data ss:Type="String"></Data></Cell>'+
                                '<Cell><Data ss:Type="String"></Data></Cell>'+
                                '<Cell><Data ss:Type="String">100</Data></Cell>'+
                                '<Cell><Data ss:Type="String">6/6/2019  7:28 PM</Data></Cell>'+
                                '<Cell><Data ss:Type="String">Columbia University 1/1/19 RFP MeVi</Data></Cell>'+
                                '<Cell><Data ss:Type="String">0066A00000B5mYTQAZ</Data></Cell>'+
                                '<Cell><Data ss:Type="String">06/27/2019</Data></Cell>'+
                               '</Row>'+
                              '</Table>'+
                              '<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">'+
                               '<PageSetup>'+
                                '<Header x:Margin="0.3"/>'+
                                '<Footer x:Margin="0.3"/>'+
                                '<PageMargins x:Bottom="0.75" x:Left="0.7" x:Right="0.7" x:Top="0.75"/>'+
                               '</PageSetup>'+
                               '<Print>'+
                                '<ValidPrinterInfo/>'+
                                '<HorizontalResolution>600</HorizontalResolution>'+
                                '<VerticalResolution>600</VerticalResolution>'+
                               '</Print>'+
                               '<Selected/>'+
                               '<ProtectObjects>False</ProtectObjects>'+
                               '<ProtectScenarios>False</ProtectScenarios>'+
                              '</WorksheetOptions>'+
                             '</Worksheet>'+
                            '</Workbook>';
        Sales_Incentive_Export_Controller.upsertRecords(oppLineUpdateList,renewalUpdateList,fileContent,fileName,fileDate);
        
    }
}