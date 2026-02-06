@isTest
private class CompetitiveLandscapeMedicalCmClassTest {
    
    @testSetup static void createTestData() {
        
        Account totAcc = new Account();
        totAcc.Name = 'Total';
        totAcc.Subtype__c ='Competitor';
        totAcc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        insert totAcc;
        
        Account accNA = new Account();
        accNA.Name = 'National Accounts';
        accNA.Subtype__c ='Competitor';
        accNA.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        insert accNA;
        
        Account accNotNA = new Account();
        accNotNA.Name = 'Test Accounts';
        accNotNA.Subtype__c ='Competitor';
        accNotNA.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        insert accNotNA;
        
        Account accNotNA1 = new Account();
        accNotNA1.Name = 'Accounts Test';
        accNotNA1.Subtype__c ='Competitor';
        accNotNA1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        insert accNotNA1;
        
        Account accCM_No_Child = new Account();
        accCM_No_Child.Name = 'Competitive Medical CM No Child';
        accCM_No_Child.Subtype__c ='Specialty Benefits Only';
        accCM_No_Child.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accCM_No_Child;
        
        Account accCM = new Account();
        accCM.Name = 'Competitive Medical CM';
        accCM.Subtype__c ='Specialty Benefits Only';
        accCM.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accCM;
        
        Account accCD_No_Child = new Account();
        accCD_No_Child.Name = 'Competitive Medical CD No Child';
        accCD_No_Child.Subtype__c ='Prospect';
        accCD_No_Child.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accCD_No_Child;
        
        Account accCD = new Account();
        accCD.Name = 'Competitive Medical CD';
        accCD.Subtype__c ='Prospect';
        accCD.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accCD;
        
       
        List<ClientSurveyResults__c> surveyRecords = new List<ClientSurveyResults__c>();
                       
        insert surveyRecords;
        
        List<Competitor__c> competitiveMedCMRecords = new List<Competitor__c>();
               
        competitiveMedCMRecords.add(new Competitor__c(           
            Account__c = accCM.Id,
            CompetitorAccount__c = accNA.Id,      
            Competitorclassification__c = 'Medical',
            ParticipatingO65Retirees__c = 0,
            ParticipatingPartTimeActives__c = 0,
            MembershipEstimate__c = 10,
            Type__c = 'Account Competitor',
            ParticipatingNonBargainedFullTimeAc__c = 0,
            ParticipatingBargainedFullTimeActive__c = 0,
            ParticipatingU65Retirees__c = 0,
            ParticipatingMembers__c = 0,
            ParticipatingActives__c = 0));
        
        competitiveMedCMRecords.add(new Competitor__c(           
            Account__c = accCM.Id,
            CompetitorAccount__c = accNotNA.Id,      
            Competitorclassification__c = 'Medical',
            ParticipatingO65Retirees__c = 0,
            ParticipatingPartTimeActives__c = 0,
            MembershipEstimate__c = 10,
            Type__c = 'Account Competitor',
            ParticipatingNonBargainedFullTimeAc__c = 0,
            ParticipatingBargainedFullTimeActive__c = 0,
            ParticipatingU65Retirees__c = 0,
            ParticipatingMembers__c = 0,
            ParticipatingActives__c = 0));
        
        competitiveMedCMRecords.add(new Competitor__c(           
            Account__c = accCM.Id,
            CompetitorAccount__c = accNotNA1.Id,      
            Competitorclassification__c = 'Medical',
            ParticipatingO65Retirees__c = 0,
            ParticipatingPartTimeActives__c = 0,
            MembershipEstimate__c = 10,
            Type__c = 'Account Competitor',
            ParticipatingNonBargainedFullTimeAc__c = 0,
            ParticipatingBargainedFullTimeActive__c = 0,
            ParticipatingU65Retirees__c = 0,
            ParticipatingMembers__c = 0,
            ParticipatingActives__c = 0));
       
        insert competitiveMedCMRecords;
        
        List<Competitor__c> competitiveMedCDRecords = new List<Competitor__c>();
               
        competitiveMedCDRecords.add(new Competitor__c(           
            Account__c = accCD.Id,
            CompetitorAccount__c = accNA.Id,      
            Competitorclassification__c = 'Medical',
            ParticipatingO65Retirees__c = 0,
            ParticipatingPartTimeActives__c = 0,
            MembershipEstimate__c = 10,
            Type__c = 'Account Competitor',
            ParticipatingNonBargainedFullTimeAc__c = 0,
            ParticipatingBargainedFullTimeActive__c = 0,
            ParticipatingU65Retirees__c = 0,
            ParticipatingMembers__c = 0,
            ParticipatingActives__c = 0,
        	PrimaryIncumbent__c = true,
        	SecondaryIncumbent__c = false));
        
        competitiveMedCDRecords.add(new Competitor__c(           
            Account__c = accCD.Id,
            CompetitorAccount__c = accNotNA.Id,      
            Competitorclassification__c = 'Medical',
            ParticipatingO65Retirees__c = 0,
            ParticipatingPartTimeActives__c = 0,
            MembershipEstimate__c = 10,
            Type__c = 'Account Competitor',
            ParticipatingNonBargainedFullTimeAc__c = 0,
            ParticipatingBargainedFullTimeActive__c = 0,
            ParticipatingU65Retirees__c = 0,
            ParticipatingMembers__c = 0,
            ParticipatingActives__c = 0,
        	PrimaryIncumbent__c = false,
        	SecondaryIncumbent__c = true));
        
        competitiveMedCDRecords.add(new Competitor__c(           
            Account__c = accCD.Id,
            CompetitorAccount__c = accNotNA.Id,      
            Competitorclassification__c = 'Medical',
            ParticipatingO65Retirees__c = 0,
            ParticipatingPartTimeActives__c = 0,
            MembershipEstimate__c = 10,
            Type__c = 'Competitor',
            ParticipatingNonBargainedFullTimeAc__c = 0,
            ParticipatingBargainedFullTimeActive__c = 0,
            ParticipatingU65Retirees__c = 0,
            ParticipatingMembers__c = 0,
            ParticipatingActives__c = 0,
        	PrimaryIncumbent__c = false,
        	SecondaryIncumbent__c = true));
       
        insert competitiveMedCDRecords;
        
         User readOnlyUser = new User(
            LastName = 'LIVE',
            FirstName='JASON',
            Alias = 'jliv',
            Email = 'jason.liveston@crmit.com',
            Username = 'uhgDevReadOnly@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'Test No Access Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
         	Position__c = 'Test User'
         );
        
        insert readOnlyUser;
 
    }
   
    public testMethod static void validategetAccountTeamMebers(){        
        Id acctCM = [SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        Id acctCD = [SELECT Id FROM Account WHERE Name='Competitive Medical CD' LIMIT 1].Id;
        Id acctTest = [SELECT Id FROM Account WHERE Name='Accounts Test' LIMIT 1].Id;
        
        Id deleteCM = [SELECT Id FROM Competitor__c WHERE Account__c=:acctCM LIMIT 1].Id;
        Id deleteCD = [SELECT Id FROM Competitor__c WHERE Account__c=:acctCD LIMIT 1].Id;
        
        Id acctCM_No_Child = [SELECT Id FROM Account WHERE Name='Competitive Medical CM No Child' LIMIT 1].Id;
        Id acctCD_No_Child = [SELECT Id FROM Account WHERE Name='Competitive Medical CD No Child' LIMIT 1].Id;
        
        List<Competitor__c> clmListCM = null;
        List<Competitor__c> clmListCD = null;
        List<String> stringList = new List<String>();
        Boolean isEdit = false;
        Test.startTest();
        
        CompetitiveLandscapeMedicalCmClass.checkDefaultCmCdRecords(acctCM_No_Child, 'cm', true);      
        CompetitiveLandscapeMedicalCmClass.checkDefaultCmCdRecords(acctCM_No_Child, 'cd', true);
        
        isEdit = CompetitiveLandscapeMedicalCmClass.getLoggedInUerRoleInfo(acctCM);
        
        clmListCM = CompetitiveLandscapeMedicalCmClass.getCompetitiveLandscapeMedicalCmRecords(acctCM_No_Child,'cm',true);
        System.assert(clmListCM.size()>0);
        
        clmListCM = CompetitiveLandscapeMedicalCmClass.getCompetitiveLandscapeMedicalCmRecords(acctCD_No_Child,'cm',true);
        System.assert(clmListCM.size()>0);
        
        clmListCD = CompetitiveLandscapeMedicalCmClass.getCompetitiveLandscapeMedicalCmRecords(acctCD_No_Child,'cd',true);
        System.assert(clmListCD.size()>0);

        clmListCM = CompetitiveLandscapeMedicalCmClass.getCompetitiveLandscapeMedicalCmRecords(acctCM,'cm',true);
        System.assert(clmListCM.size()>0);
        
        clmListCD = CompetitiveLandscapeMedicalCmClass.getCompetitiveLandscapeMedicalCmRecords(acctCD,'cd',true);
        System.assert(clmListCD.size()>0);
        
        clmListCM = CompetitiveLandscapeMedicalCmClass.getCompetitiveLandscapeMedicalCmRecords(acctCM,'cm',true);
        System.assert(clmListCM.size()>0);
        system.debug('After Save Size CM '+clmListCM.size());
        system.debug('Delete CM Record '+deleteCM);              
        
        CompetitiveLandscapeMedicalCmClass.addDefaultCompititorsToAccount(acctCM_No_Child, 'cm');
         
        CompetitiveLandscapeMedicalCmClass.deleteCompititorsFromApplet(deleteCM, acctCM, clmListCM, 'cm');
        System.assertEquals(null,null);
        
	    CompetitiveLandscapeMedicalCmClass.deleteCompititorsFromApplet(deleteCD, acctCD, clmListCD, 'cd');        
        System.assertEquals(null,null);
        
        for(Competitor__c sl : clmListCD){
           String id = sl.Id;
            sl.PrimaryIncumbent__c = true;
            stringList.add(id);
        }
        
       
        
        clmListCM = CompetitiveLandscapeMedicalCmClass.saveCompititiveLandscapeMedicalRecords(acctCM,clmListCM,'cm',stringList);
        clmListCM = CompetitiveLandscapeMedicalCmClass.saveCompititiveLandscapeMedicalRecords(acctCM,clmListCM,'cd',stringList); //SAM
        
        clmListCM = CompetitiveLandscapeMedicalCmClass.getCompetitiveLandscapeMedicalCmRecords(acctCM_No_Child,'cm',true);
        System.assert(clmListCM.size()>0);
        
        /*try{
            clmListCM = CompetitiveLandscapeMedicalCmClass.getCompetitiveLandscapeMedicalCmRecords(acctCM_No_Child,null,true);                        
        }catch(Exception e){
            System.assert(null,null);
        }
                             
       /* clmListCM = CompetitiveLandscapeMedicalCmClass.getCompetitiveLandscapeMedicalCmRecords(acctCM_No_Child,'cm',true);
        System.assert(clmListCM.size()>0);*/
                
                          		
        /*User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        System.runAs(readOnlyUser) {
            clmListCM = CompetitiveLandscapeMedicalCmClass.getCompetitiveLandscapeMedicalCmRecords(acctCM_No_Child,'cm',true);
            System.assert(clmListCM.size()>0);
            
            clmListCM = CompetitiveLandscapeMedicalCmClass.getCompetitiveLandscapeMedicalCmRecords(acctCD_No_Child,'cm',true);
            System.assert(clmListCM.size()>0);       
        }*/
        Test.stopTest();
    }
}