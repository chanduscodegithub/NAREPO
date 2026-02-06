/** ######################################################################################
* @author       Ram Mohan Reddy
* @date         23/02/2018
* @description  This invocable class is to create National Account and total Competitor 
*               records for CM account Creation or CD Account change to CM Account
*                 
*##########################################################################################    */

public with sharing class CreateCompetitorRecordsForCMAccount {

	

	@InvocableMethod(label='Create National Account Records' description='Creating National Account Record for CM Account')
	public static void CreateCompetitorRecords (List<string> inputParams) {
		
	
		List<Competitor__c> competitorFinalList = new List<Competitor__c>();
		string accountName = Label.National_Account_Name;
       	Id nationalAccountId = null;
        Id uhcOptumId = null;
        Id optumRxId = null;
        Id totalAccountId;
		
		try {
       		
            Set<String> accountNames = new Set<String>();
            accountNames.add(Label.National_Account_Name);
            //accountNames.add(Label.UHC_Optum_Name);
            accountNames.add(Label.Optum_Rx_Name);
            accountNames.add(Label.Total);
            
			/*
			 * To get National Accounts, Optum Accounts, UHC/Optum Accounts & Total Account Id's 
			 */ 
            Decimal uhcMedicalMem = 0;
            Map<String,Decimal> uhcMedMap = new Map<String,Decimal>(); 
             List<Account> accountQueryResult = Database.query('Select Id,Name,UHC_Medical_Members__c from Account where Id = :inputParams');
            if(accountQueryResult.size() > 0){	
                for(Account acc : accountQueryResult) {
                    uhcMedMap.put(acc.Id, acc.UHC_Medical_Members__c);
                }
            }
            
                 List<Account> accountList = Database.query('Select Id,Name,UHC_Medical_Members__c from Account where Name IN :accountNames ORDER BY CreatedDate Asc');
	        system.debug('inputParams=='+inputParams);
            system.debug('accountList=='+accountList);
            if(accountList != null && accountList.size() > 0) {
                for(Account accObj : accountList) {
                     if(accObj.UHC_Medical_Members__c != 0) {
                       uhcMedicalMem = accObj.UHC_Medical_Members__c; 
                         system.debug('uhcMedicalMem1=='+uhcMedicalMem);
                    } 
                    if(accObj.Name == Label.National_Account_Name) {
                       nationalAccountId = accObj.Id; 
                    } 
                    else if(accObj.Name == Label.Optum_Rx_Name) {
                       optumRxId = accObj.Id; 
                    }
                    else if(accObj.Name == Label.UHC_Optum_Name) {
                       uhcOptumId = accObj.Id; 
                    }
                        else if(accObj.Name == Label.Total) {
                       totalAccountId = accObj.Id;
                    }
                }
	        }
            
            
            // To get Competitor Clasification picklist values
	        Schema.DescribeFieldResult fieldResult = Competitor__c.Competitorclassification__c.getDescribe();
	        List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
	        String totalRec = '';
	        //Id accId = inputParams[i];
            String accCategory = '';

	        // To get competitor list for the CM account
	        List<Competitor__c> competitorList = Database.query('SELECT Id, Account__r.Category__c, Competitorclassification__c, CompetitorAccount__c FROM Competitor__c WHERE Account__c IN: inputParams AND (CompetitorAccount__c =: nationalAccountId OR CompetitorAccount__c =: totalAccountId OR CompetitorAccount__c =: optumRxId OR CompetitorAccount__c =: uhcOptumId )');

	        System.debug('Competitor list..'+competitorList);
	        Map<String,Competitor__c> competitorMap = new Map<String,Competitor__c>();

	        // creating competitor map to avode duplicate competitor creation
            if(competitorList.size() > 0 ) {
                accCategory = competitorList[0].Account__r.Category__c;
                for(Competitor__c com : competitorList) {
                    if(com.CompetitorAccount__c != null ) {
                        //System.debug('Inside For IF Competitor list..'+accId+''+com.CompetitorAccount__c+''+com.Competitorclassification__c);
                        competitorMap.put(com.Account__c+''+com.CompetitorAccount__c+''+com.Competitorclassification__c, com);
                    } else {
                        //System.debug('Inside For Else Competitor list..'+accId+''+com.Competitorclassification__c);
                        competitorMap.put(com.Account__c+''+com.Competitorclassification__c, com);
                    }
                }                
            }
            else{
            List<Account> account = Database.query('Select Id,Category__c from Account where Id IN: inputParams'); 
                accCategory = account[0].Category__c;
                
            }
			System.debug('Account Category '+accCategory);
	        // competitor record preparation
            for(Integer i = 0 ; i < inputParams.size() ; i++) {
                if(picklistValues.size() > 0) {
                    for (Schema.PicklistEntry picklistValue : picklistValues) {
                        if(nationalAccountId != null && accCategory == 'Client Management') {
                            
                            if(!competitorMap.containsKey(inputParams[i]+''+nationalAccountId+''+picklistValue.getValue())) {
                                String accId = inputParams[i];
                                
                                    uhcMedicalMem = uhcMedMap.get(accId);
                                
								system.debug('uhcMedicalMemaccc===='+uhcMedicalMem);
                                if(picklistValue.getValue() != 'Pharmacy' && picklistValue.getValue() != 'Other'){
                                    //System.debug('Inside Picklist For IF national Account..');
                                    createCompetitor(inputParams[i] , nationalAccountId, picklistValue.getValue(),competitorFinalList,uhcMedicalMem);
                                }	
                            }
                        }
                        
                        
                        if(optumRxId != null && accCategory == 'Client Management') {
                            
                            if(!competitorMap.containsKey(inputParams[i]+''+optumRxId+''+picklistValue.getValue())) {
                                //System.debug('Inside Picklist For IF optumRx Account..');
                                if(picklistValue.getValue() == 'Pharmacy'){
                                    createCompetitor(inputParams[i] , optumRxId, picklistValue.getValue(),competitorFinalList,uhcMedicalMem);
                                }	 
                            }
                        }
                        
                        if(uhcOptumId != null && accCategory == 'Client Management') {
                            
                            if(!competitorMap.containsKey(inputParams[i]+''+uhcOptumId+''+picklistValue.getValue())) {
                                //System.debug('Inside Picklist For IF Uhc/Optum Account..');
                                if(picklistValue.getValue() == 'Other'){
                                    createCompetitor(inputParams[i] , uhcOptumId, picklistValue.getValue(),competitorFinalList,uhcMedicalMem);
                                }
                            }	        					
                        }
                        
                        if(totalAccountId != null) {
                            if(!competitorMap.containsKey(inputParams[i]+''+totalAccountId+''+picklistValue.getValue())) {
                                //System.debug('Inside Picklist For IF Total Account..');
                                if(picklistValue.getValue() != 'Other') {
                                    createCompetitor(inputParams[i] , totalAccountId, picklistValue.getValue(), competitorFinalList,uhcMedicalMem);
                                }
                            }
                        }
                    }
                }
            }
			
            System.debug('competitorFinalList '+competitorFinalList.size());
            System.debug('competitorFinalList '+competitorFinalList);
	        // inserting competitor records
	        if(competitorFinalList.size() > 0) {
	        	//System.debug('competitorFinalList..'+competitorFinalList.size());
	        	insert competitorFinalList;
	        }
       
	    } catch(Exception e) {
	        System.debug('Error occurred in CreateCompetitorRecords class - '+e);
	    }

		
	}

/* #############################################################################
createCompetitor method is to create National Account / Total competitor records for CM account

	

################################################################################*/
	private static void  createCompetitor(Id accountId, Id nationalOrTotalAccountId, String clasificationValue, List<Competitor__c> competitorList,Decimal uhcMedicalMem) {

		Competitor__c competitor = new Competitor__c();

		competitor.CompetitorAccount__c = nationalOrTotalAccountId;
		competitor.Account__c = accountId;
		competitor.Type__c = 'Account Competitor';
		competitor.Competitorclassification__c = clasificationValue;
system.debug('uhcMedicalMem1=='+uhcMedicalMem);
		if(clasificationValue == 'Medical') {
			competitor.ParticipatingO65Retirees__c = 0;
			competitor.ParticipatingPartTimeActives__c = 0;
			competitor.ParticipatingNonBargainedFullTimeAc__c = 0;
            competitor.ParticipatingBargainedFullTimeActive__c = 0;
            competitor.ParticipatingU65Retirees__c = 0;
            competitor.MembershipEstimate__c = uhcMedicalMem;
		} else {
			competitor.NumberOfMembersHeld__c = 0;
			competitor.ofMembersHeld__c = 0;
		}
		competitorList.add(competitor);
	} 
	
}