@IsTest
Public class ChecklistMetadataServiceTest {
    
    @IsTest
    static void testFetchChecklistMappings() {
        // Act
        Test.startTest();
        List<ChecklistMetadataService.ChecklistMapping> mappings = ChecklistMetadataService.fetchChecklistMappings();
        Test.stopTest();
        
        // Assert
        System.assertNotEquals(null, mappings, 'Returned mapping list should not be null');
        
        if (!mappings.isEmpty()) {
            ChecklistMetadataService.ChecklistMapping firstMapping = mappings[0];
            
            System.assertNotEquals(null, firstMapping.productCode, 'Product Code should not be null');
            System.assertNotEquals(null, firstMapping.fieldApiName, 'Field API Name should not be null');
            System.assertNotEquals(null, firstMapping.label, 'Label should not be null');
            System.assertNotEquals(null, firstMapping.isDual, 'IsDual should not be null');
            System.assertNotEquals(null, firstMapping.yesNoOnly, 'YesNoOnly should not be null');
            System.assertNotEquals(null, firstMapping.sortOrder, 'Sort Order should not be null');
        }
    }
}