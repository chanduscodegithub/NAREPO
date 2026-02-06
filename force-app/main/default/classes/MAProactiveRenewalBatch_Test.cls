@isTest
private class MAProactiveRenewalBatch_Test {
    @testSetup
    static void createTestData(){
        List<Account> accListToInsert=new List<Account>();
        
        for(integer i=1;i<=10;i++){
            accListToInsert.add(new Account(Name='MAProactive Renewal Batch Test Acc - '+i,
                                            Subtype__c='Specialty Benefits Only',
                                            RecordTypeId=Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId()
                                           ));
        }
        
        insert accListToInsert;
        
        List<Opportunity> oppListToInsert=new List<Opportunity>();
        Integer count=0;
        for(integer i=1;i<=5;i++){
            Opportunity opp=new Opportunity();
            opp.Name='MAProactive Renewal Batch Test Opp - '+i;
            opp.EffectiveDate__c=Date.newInstance(2020, 1, 1);
            opp.AccountId=accListToInsert[i-1].Id;
            opp.StageName='Qualification';
            opp.CloseDate=System.today();
            opp.Does_this_Oppty_Risk_Involve_Exchanges__c = 'No';
            opp.Reason_for_the_Opportunity_Risk__c = 'Proactive Renewal';
            opp.Product_Type_Involved_in_Opp__c = 'Pharmacy;Medical;Other Buy Up Programs';
            opp.Has_a_Formal_RFP_Been_Issued__c = 'No';
            opp.Is_There_Existing_Membership_at_Risk__c  = 'No';
            opp.Is_Created_by_QA__c = true;
            opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId();
            opp.Expected_Date_of_RFP__c = System.today();
            opp.Disposition_Pharmacy__c='Sold';opp.Disposition_Medical__c='Sold'; 
            opp.Proactive_Renewal_Incentive_Status__c='SS 2021 (First Year) - Pending Qualification';
            /*opp.Does_this_Oppty_Risk_Involve_Consultant__c='No';
            opp.BusinessType__c='Client Management';
            opp.Sales_Stage_Medical__c='Notified';
            opp.Existing_Members_Risk_Outcome_Medical__c='Retained';
            opp.Proactive_Renewal_Additional_Info__c='Medical Contract WAS Extended for at Least 2 Years';
            opp.Competitive_Non_Competitive_Indicator__c='Non Competitive';*/
            count++;
            oppListToInsert.add(opp);
        }
        for(integer i=6;i<=8;i++){
            Opportunity opp=new Opportunity();
            opp.Name='MAProactive Renewal Batch Test Opp - '+i;
            opp.EffectiveDate__c=Date.newInstance(2021, 1, 1);
            opp.AccountId=accListToInsert[i-1].Id;
            opp.StageName='Qualification';
            opp.CloseDate=System.today();
            opp.Does_this_Oppty_Risk_Involve_Exchanges__c = 'No';
            opp.Reason_for_the_Opportunity_Risk__c = 'Proactive Renewal';
            opp.Product_Type_Involved_in_Opp__c = 'Pharmacy;Medical;Other Buy Up Programs';
            opp.Has_a_Formal_RFP_Been_Issued__c = 'No';
            opp.Is_There_Existing_Membership_at_Risk__c  = 'No';
            opp.Is_Created_by_QA__c = true;
            opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId();
            opp.Expected_Date_of_RFP__c = System.today();
            opp.Disposition_Pharmacy__c='Sold';opp.Disposition_Medical__c='Sold'; 
            opp.Proactive_Renewal_Incentive_Status__c='SS 2022 (Second Year) - Pending Qualification';
            /*opp.Does_this_Oppty_Risk_Involve_Consultant__c='No';
            opp.BusinessType__c='Client Management';
            opp.Sales_Stage_Medical__c='Notified';
            opp.Existing_Members_Risk_Outcome_Medical__c='Retained';
            opp.Proactive_Renewal_Additional_Info__c='Medical Contract WAS Extended for at Least 2 Years';
            opp.Competitive_Non_Competitive_Indicator__c='Non Competitive';*/
            count++;
            oppListToInsert.add(opp);
        }
        for(integer i=9;i<=10;i++){
            Opportunity opp=new Opportunity();
            opp.Name='MAProactive Renewal Batch Test Opp - '+i;
            opp.EffectiveDate__c=Date.newInstance(2022, 1, 1);
            opp.AccountId=accListToInsert[i-1].Id;
            opp.StageName='Qualification';
            opp.CloseDate=System.today();
            opp.Does_this_Oppty_Risk_Involve_Exchanges__c = 'No';
            opp.Reason_for_the_Opportunity_Risk__c = 'Proactive Renewal';
            opp.Product_Type_Involved_in_Opp__c = 'Pharmacy;Medical;Other Buy Up Programs';
            opp.Has_a_Formal_RFP_Been_Issued__c = 'No';
            opp.Is_There_Existing_Membership_at_Risk__c  = 'No';
            opp.Is_Created_by_QA__c = true;
            opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId();
            opp.Expected_Date_of_RFP__c = System.today();
            opp.Disposition_Pharmacy__c='Sold';opp.Disposition_Medical__c='Sold'; 
            opp.Proactive_Renewal_Incentive_Status__c='SS 2023 (Third Year) - Pending Qualification';
            /*opp.Does_this_Oppty_Risk_Involve_Consultant__c='No';
            opp.BusinessType__c='Client Management';
            opp.Sales_Stage_Medical__c='Notified';
            opp.Existing_Members_Risk_Outcome_Medical__c='Retained';
            opp.Proactive_Renewal_Additional_Info__c='Medical Contract WAS Extended for at Least 2 Years';
            opp.Competitive_Non_Competitive_Indicator__c='Non Competitive';*/
            count++;
            oppListToInsert.add(opp);
        }
        
        insert oppListToInsert;
        
        List<PolicyAccountMembership__c> plcyAccMmbrshList=new List<PolicyAccountMembership__c>();
        Integer count1=0;
        for(integer i=1;i<=5;i++){
            count1++;
            PolicyAccountMembership__c plcyAccMmbrsh=new PolicyAccountMembership__c();
            plcyAccMmbrsh.Name='Test PlcyAccMmbrshp - '+count1;
            plcyAccMmbrsh.AccountFirm__c=accListToInsert[i-1].Id;
            plcyAccMmbrsh.MembershipType__c='Medical';
            Date effectiveDate=oppListToInsert[i-1].EffectiveDate__c;
            Integer numberOfDays = Date.daysInMonth(effectiveDate.year(), effectiveDate.month());
            Date lastDayOfMonth = Date.newInstance(effectiveDate.year(), effectiveDate.month(), numberOfDays);
            plcyAccMmbrsh.GLDate__c=lastDayOfMonth;
            plcyAccMmbrsh.GLMembership__c=2000;
            
            count1++;
            PolicyAccountMembership__c plcyAccMmbrsh1=plcyAccMmbrsh.clone(false,false,false,false);
            plcyAccMmbrsh1.Name='Test PlcyAccMmbrshp - '+(count1);
            plcyAccMmbrsh1.GLMembership__c=3000;
            Integer numberOfDays1 = Date.daysInMonth(effectiveDate.year()-1, effectiveDate.month());
            Date lastDayOfMonth1 = Date.newInstance(effectiveDate.year()-1, effectiveDate.month(), numberOfDays1);
            plcyAccMmbrsh1.GLDate__c=lastDayOfMonth1;
            
            plcyAccMmbrshList.add(plcyAccMmbrsh);
            plcyAccMmbrshList.add(plcyAccMmbrsh1);
            
        }
        
        for(integer i=6;i<=8;i++){
            count1++;
            PolicyAccountMembership__c plcyAccMmbrsh=new PolicyAccountMembership__c();
            plcyAccMmbrsh.Name='Test PlcyAccMmbrshp - '+count1;
            plcyAccMmbrsh.AccountFirm__c=accListToInsert[i-1].Id;
            plcyAccMmbrsh.MembershipType__c='Medical';
            Date effectiveDate=oppListToInsert[i-1].EffectiveDate__c;
            Integer numberOfDays = Date.daysInMonth(effectiveDate.year(), effectiveDate.month());
            Date lastDayOfMonth = Date.newInstance(effectiveDate.year(), effectiveDate.month(), numberOfDays);
            plcyAccMmbrsh.GLDate__c=lastDayOfMonth;
            plcyAccMmbrsh.GLMembership__c=5000;
            
            count1++;
            PolicyAccountMembership__c plcyAccMmbrsh1=plcyAccMmbrsh.clone(false,false,false,false);
            plcyAccMmbrsh1.Name='Test PlcyAccMmbrshp - '+(count1);
            plcyAccMmbrsh1.GLMembership__c=3000;
            Integer numberOfDays1 = Date.daysInMonth(effectiveDate.year()-1, effectiveDate.month());
            Date lastDayOfMonth1 = Date.newInstance(effectiveDate.year()-1, effectiveDate.month(), numberOfDays1);
            plcyAccMmbrsh1.GLDate__c=lastDayOfMonth1;
            
            plcyAccMmbrshList.add(plcyAccMmbrsh);
            plcyAccMmbrshList.add(plcyAccMmbrsh1);
            
        }
        
        for(integer i=9;i<10;i++){
            count1++;
            PolicyAccountMembership__c plcyAccMmbrsh=new PolicyAccountMembership__c();
            plcyAccMmbrsh.Name='Test PlcyAccMmbrshp - '+count1;
            plcyAccMmbrsh.AccountFirm__c=accListToInsert[i-1].Id;
            plcyAccMmbrsh.MembershipType__c='Medical';
            Date effectiveDate=oppListToInsert[i-1].EffectiveDate__c;
            Integer numberOfDays = Date.daysInMonth(effectiveDate.year(), effectiveDate.month());
            Date lastDayOfMonth = Date.newInstance(effectiveDate.year(), effectiveDate.month(), numberOfDays);
            plcyAccMmbrsh.GLDate__c=lastDayOfMonth;
            plcyAccMmbrsh.GLMembership__c=3000;
            
            count1++;
            PolicyAccountMembership__c plcyAccMmbrsh1=plcyAccMmbrsh.clone(false,false,false,false);
            plcyAccMmbrsh1.Name='Test PlcyAccMmbrshp - '+(count1);
            plcyAccMmbrsh1.GLMembership__c=1000;
            Integer numberOfDays1 = Date.daysInMonth(effectiveDate.year()-1, effectiveDate.month());
            Date lastDayOfMonth1 = Date.newInstance(effectiveDate.year()-1, effectiveDate.month(), numberOfDays1);
            plcyAccMmbrsh1.GLDate__c=lastDayOfMonth1;
            
            PolicyAccountMembership__c plcyAccMmbrsh2=plcyAccMmbrsh.clone(false,false,false,false);
            plcyAccMmbrsh2.Name='Test PlcyAccMmbrshp1 - '+(count1);
            plcyAccMmbrsh2.GLMembership__c=1000;
            Integer numberOfDays2 = Date.daysInMonth(effectiveDate.year()-1, effectiveDate.month());
            Date lastDayOfMonth2 = Date.newInstance(effectiveDate.year()-1, effectiveDate.month(), numberOfDays2);
            plcyAccMmbrsh2.GLDate__c=lastDayOfMonth2;
            
            
            
            plcyAccMmbrshList.add(plcyAccMmbrsh);
            plcyAccMmbrshList.add(plcyAccMmbrsh1);
            plcyAccMmbrshList.add(plcyAccMmbrsh2);
            
        }
        
        insert plcyAccMmbrshList;
    }
    
    @isTest static void testBatch(){
        
        Test.startTest();
        MAProactiveRenewal_Batch batchObj = new MAProactiveRenewal_Batch();
        Id batchId = Database.executeBatch(batchObj);
        Test.stopTest();
    }
    
    @isTest static void testBatchWithoutPolicyAccntMmbrshpRcrds(){
        List<PolicyAccountMembership__c> lst=[Select Id from PolicyAccountMembership__c];
        delete lst;
        Test.startTest();
        MAProactiveRenewal_Batch batchObj = new MAProactiveRenewal_Batch();
        Id batchId = Database.executeBatch(batchObj);
        Test.stopTest();
    }
    
    @isTest static void testBatchScheduler(){        
        Test.startTest();
        Datetime dt = Datetime.now().addMinutes(1);
        String CRON_EXP = '0 '+ dt.minute() + ' * ' + dt.day() + ' ' + dt.month() + ' ? ' + dt.year();
        System.schedule('MAProactive Renewal Batch Test', CRON_EXP, new MAProactiveRenewal_BatchSchedule() );   
        Test.stopTest();
    }
    
}