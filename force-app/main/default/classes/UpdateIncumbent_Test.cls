@isTest
public class UpdateIncumbent_Test {
    
    @testSetup
    static void setupData() {
        // Create some incumbent Accounts (these will be referenced in lookup fields)
        Account medicalInc = new Account(Name = 'Medical Incumbent',SubType__c ='CVG');
        Account pharmacyInc = new Account(Name = 'Pharmacy Incumbent',SubType__c ='CVG');
        Account dentalInc = new Account(Name = 'Dental Incumbent',SubType__c ='CVG');
        Account visionInc = new Account(Name = 'Vision Incumbent',SubType__c ='CVG');
        insert new List<Account>{ medicalInc, pharmacyInc, dentalInc, visionInc };
        
        // Create parent Company Account
        Account company = new Account(
            Name = 'Test Company',
            SubType__c ='CVG',
            IncumbentPrimaryMedical__c = medicalInc.Id,
            Incumbent_Primary_Pharmacy__c = pharmacyInc.Id,
            IncumbentPrimaryDental__c = dentalInc.Id,
            IncumbentPrimaryVision__c = visionInc.Id
        );
        insert company;
        
        // Create EBD linked to Company
        EBD__c ebd = new EBD__c(
            //Name = 'EBD 2025',
            Company__c = company.Id
        );
        insert ebd;
        
        // Create anticipated child records for each product
        List<Anticipated_Bid_Cycle_For_Major_Products__c> anticipatedList = new List<Anticipated_Bid_Cycle_For_Major_Products__c>{
            new Anticipated_Bid_Cycle_For_Major_Products__c(
                Name = 'Medical Anticipated',
                Product__c = 'Medical',
                EBD__c = ebd.Id
            ),
            new Anticipated_Bid_Cycle_For_Major_Products__c(
                Name = 'Pharmacy Anticipated',
                Product__c = 'Pharmacy',
                EBD__c = ebd.Id
            ),
            new Anticipated_Bid_Cycle_For_Major_Products__c(
                Name = 'Dental Anticipated',
                Product__c = 'Dental',
                EBD__c = ebd.Id
            ),
            new Anticipated_Bid_Cycle_For_Major_Products__c(
                Name = 'Vision Anticipated',
                Product__c = 'Vision',
                EBD__c = ebd.Id
            )
        };
        insert anticipatedList;
    }
    
    @isTest
    static void testIncumbentSync() {
        // Query company
        Account company = [SELECT Id FROM Account WHERE Name = 'Test Company' LIMIT 1];
        
        // Create new incumbent Accounts for update
        Account newMedical = new Account(Name = 'New Medical Incumbent',SubType__c ='CVG');
        Account newPharmacy = new Account(Name = 'New Pharmacy Incumbent',SubType__c ='CVG');
        Account newDental = new Account(Name = 'New Dental Incumbent',SubType__c ='CVG');
        Account newVision = new Account(Name = 'New Vision Incumbent',SubType__c ='CVG');
        insert new List<Account>{ newMedical, newPharmacy, newDental, newVision };
        
        // Update incumbent lookups on company
        
        company.IncumbentPrimaryMedical__c = newMedical.Id;
        company.Incumbent_Primary_Pharmacy__c = newPharmacy.Id;
        company.IncumbentPrimaryDental__c = newDental.Id;
        company.IncumbentPrimaryVision__c = newVision.Id;
        update company; 
        
        // Query anticipated children after trigger
        List<Anticipated_Bid_Cycle_For_Major_Products__c> anticipatedList = [
            SELECT Id, Product__c, Incumbent__c
            FROM Anticipated_Bid_Cycle_For_Major_Products__c
        ];
        
        Map<String, String> productToIncumbent = new Map<String, String>();
        for (Anticipated_Bid_Cycle_For_Major_Products__c ant : anticipatedList) {
            productToIncumbent.put(ant.Product__c, ant.Incumbent__c);
        }
        
        //  Assertions
        System.assertEquals('New Medical Incumbent',  productToIncumbent.get('Medical'));
        System.assertEquals('New Pharmacy Incumbent', productToIncumbent.get('Pharmacy'));
        System.assertEquals('New Dental Incumbent',   productToIncumbent.get('Dental'));
        System.assertEquals('New Vision Incumbent',   productToIncumbent.get('Vision'));
    }
}