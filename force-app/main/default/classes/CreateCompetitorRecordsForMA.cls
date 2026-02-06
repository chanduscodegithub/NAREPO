/** ######################################################################################
* @author       Ram Mohan Reddy
* @date         15/03/2018
* @description  This invocable class is to create National Account and total Competitor 
*               records for MA Creation or MA Update
*                 
*##########################################################################################    */

public without sharing class CreateCompetitorRecordsForMA {

	

	@InvocableMethod(label='Create National Account Records for MA' description='Creating Nationa Account Record for MA')
	public static void CreateCompetitorRecords (List<string> inputParams) {
		

		List<MA_Competitor__c> competitorFinalList = new List<MA_Competitor__c>();
		
		try {
       		
            /*
             *  Input Parameters & Parameters Initialization
             */
            Id maId = inputParams[0];
            Id accountId;
            String selectedProductTypes = '';
            Id nationalAccountId;
            Id totalAccountId;
            
            Set<String> accountNames = new Set<String>();
            accountNames.add(Label.National_Account_Name);
            accountNames.add(Label.Total);
            
			/*
			 * To get National Accounts & Total Account Id's
			 */ 
	        List<Account> accountList = Database.query('Select Id,Name from Account where Name IN :accountNames ORDER BY CreatedDate Asc');
	        if(accountList != null && accountList.size() > 0) {
                for(Account accObj : accountList) {
                    if(accObj.Name == Label.National_Account_Name) {
                       nationalAccountId = accObj.Id; 
                    } else if(accObj.Name == Label.Total) {
                       totalAccountId = accObj.Id;
                    }
                }
	        }
                
            /* 
             * To get MA Competitors List
             */ 
            List<MA_Competitor__c> maCompetitorList = Database.query('SELECT Id, Competitor_Classification__c, Competitor_Account__c,Opportunity__r.Product_Type_Involved_in_Opp__c,Opportunity__r.AccountId,Opportunity__r.MACategory__c FROM MA_Competitor__c WHERE Opportunity__c =: maId AND (Competitor_Account__c =: nationalAccountId OR Competitor_Account__c =: totalAccountId)');
            
            /* 
             * To get MA Product Types & Account Id
             */
            if(maCompetitorList != null && maCompetitorList.size() > 0) {
                String maCategory = maCompetitorList[0].Opportunity__r.MACategory__c;
                if(maCategory != null && maCategory == 'Client Management') {
                   accountId = maCompetitorList[0].Opportunity__r.AccountId; 
                }
               selectedProductTypes = maCompetitorList[0].Opportunity__r.Product_Type_Involved_in_Opp__c;
            } else {
                /* To get the Product types & Account Id from Opportunity if there are no associated Competitors */ 
            	List<Opportunity> opportunityList = Database.query('Select AccountId,Product_Type_Involved_in_Opp__c,MACategory__c from Opportunity where Id=:maId');
                if(opportunityList != null && opportunityList.size() > 0) {
					String maCategory = opportunityList[0].MACategory__c;
                    if(maCategory != null && maCategory == 'Client Management') {
                        accountId = opportunityList[0].AccountId;
                    }
                    selectedProductTypes = opportunityList[0].Product_Type_Involved_in_Opp__c;
                }
            }
            
            /* 
             * To get Account Competitors List
             */
            List<Competitor__c> accountRelatedCompetitors = new List<Competitor__c>();
            if(accountId != null) {
                String compClassificationValueToBeExcluded = 'Other';
                accountRelatedCompetitors = Database.query('SELECT CompetitorAccount__c,CompetitorAccount__r.Name,NumberOfMembersHeld__c,ofMembersHeld__c,Competitorclassification__c,Competitor_Group__c,Comments__c FROM Competitor__c WHERE Account__r.Id =: accountId and CompetitorAccount__r.Name != null and CompetitorAccount__r.Name NOT IN :accountNames and Competitorclassification__c != :compClassificationValueToBeExcluded');
            }
            
	        /*
	         * To get MA Competitor Classification Picklist values
	         */ 
	        Schema.DescribeFieldResult fieldResult = MA_Competitor__c.Competitor_Classification__c.getDescribe();
	        List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
	        String totalRec = '';

	        System.debug('MA Competitors list -- '+maCompetitorList);
	        Map<String,MA_Competitor__c> competitorMap = new Map<String,MA_Competitor__c>();

            /* 
	         * Preparation of Competitors Map for the Account related Competitors
			 */
            Map<String, List<MA_Competitor__c>> maCompetitorsMap = new Map<String, List<MA_Competitor__c>>();
            if(accountRelatedCompetitors != null && accountRelatedCompetitors.size() > 0) {
                for(Competitor__c compObj : accountRelatedCompetitors) {
                    if(selectedProductTypes.contains(compObj.Competitorclassification__c)) {
                        if(maCompetitorsMap != null && maCompetitorsMap.size() > 0 && maCompetitorsMap.containsKey(compObj.Competitorclassification__c)) {
                            List<MA_Competitor__c> maCompetitorsList = maCompetitorsMap.get(compObj.Competitorclassification__c);
                            MA_Competitor__c maCompetitor = returnMACompetitorData(maId, compObj, new MA_Competitor__c());
                            maCompetitorsList.add(maCompetitor);
                            maCompetitorsMap.put(compObj.Competitorclassification__c, maCompetitorsList);
                        } else {
                            List<MA_Competitor__c> maCompetitorsList = new List<MA_Competitor__c>();
                            MA_Competitor__c maCompetitor = returnMACompetitorData(maId, compObj, new MA_Competitor__c());
                            maCompetitorsList.add(maCompetitor);
                            maCompetitorsMap.put(compObj.Competitorclassification__c, maCompetitorsList);
                        }
                    }
                }
            }

	        /* 
	         * Preparation of Competitors Map to avoid duplicate Competitor Creation 
			 */
            if(maCompetitorList.size() > 0) {
                for (MA_Competitor__c com : maCompetitorList) {
                    if(com.Competitor_Account__c != null) {
                        System.debug('Inside For IF Competitor list..'+maId+''+com.Competitor_Account__c+''+com.Competitor_Classification__c);
                        competitorMap.put(maId+''+com.Competitor_Account__c+''+com.Competitor_Classification__c, com);
                    } else {
                        System.debug('Inside For Else Competitor list..'+maId+''+com.Competitor_Classification__c);
                        competitorMap.put(maId+''+com.Competitor_Classification__c, com);
                    }
                }
            }

	        /*
	         * Building MA Competitors Data for National & Total Competitors records
	         */ 
            if(picklistValues.size() > 0) {
                for (Schema.PicklistEntry picklistValue : picklistValues) {
                    if(selectedProductTypes.contains(picklistValue.getValue())) {
                        if(nationalAccountId != null) {
                            if(!competitorMap.containsKey(inputParams[0]+''+nationalAccountId+''+picklistValue.getValue())) {
                                System.debug('Inside Picklist For IF national Account..');
                                createCompetitor(inputParams[0] , nationalAccountId, false, picklistValue.getValue(),competitorFinalList);
                                if(maCompetitorsMap != null && maCompetitorsMap.size() > 0 && maCompetitorsMap.get(picklistValue.getValue()) != null) {
                                    competitorFinalList.addAll(maCompetitorsMap.get(picklistValue.getValue()));
                                }
                            }
                        }
                        if(totalAccountId != null) {
                            if(!competitorMap.containsKey(inputParams[0]+''+totalAccountId+''+picklistValue.getValue())){
                                System.debug('Inside Picklist For IF Total Account..');
                                createCompetitor(inputParams[0] , totalAccountId, true, picklistValue.getValue(), competitorFinalList);
                            }
                        }
                    }
                }                
            }

	        /*
	         * Inserting MA Competitor records
	         */ 
	        if(competitorFinalList != null && competitorFinalList.size() > 0) {
	        	System.debug('CompetitorFinalList..'+competitorFinalList.size());
                System.debug('CompetitorFinalList..'+competitorFinalList);
	        	insert competitorFinalList;
	        }
       
	    } catch(Exception e) {
	        System.debug('Error occurred in CreateCompetitorRecordsForMA APEX Class - '+e);
	    }

		
	}

    /*
	 * Creates National Account / Total competitor records for CM & CD Opportunities
	 */
    private static void createCompetitor(Id opportunityId, Id accountId, Boolean totalRecord, String clasificationValue, List<MA_Competitor__c> competitorList) {
        
        MA_Competitor__c competitor = new MA_Competitor__c();
        
        if(!totalRecord) {
            competitor.Competitor_Group__c = UHGMAConstants.NATIONAL_ACCOUNTS_COMPETITOR_GROUP;
        }
        
        competitor.Competitor_Account__c = accountId;
        competitor.Opportunity__c = opportunityId;
        competitor.Competitor_Classification__c = clasificationValue;
        competitor.Comments__c = '';
        competitor.Number_of_Members_Held__c = 0;
        competitor.of_Members_Held__c = 0;
        competitor.Number_of_Members_Awarded__c = 0;
        competitor.of_Members_Awarded__c = 0;
        
        competitorList.add(competitor);		
        
    } 
    
    /*
	 * Copy Account's National Account/Total Competitor Records data to MA National Account/Total Competitor Records data for CM Opportunity 
	 */
    public static MA_Competitor__c returnMACompetitorData(Id oppId, Competitor__c compObj, MA_Competitor__c maCompObj) {
        
        maCompObj.Competitor_Account__c = compObj.CompetitorAccount__c;  
        maCompObj.Opportunity__c = oppId;
        maCompObj.Competitor_Group__c = compObj.Competitor_Group__c;
        maCompObj.Competitor_Classification__c = compObj.Competitorclassification__c;
        maCompObj.Comments__c = '';
        maCompObj.Number_of_Members_Held__c = 0;
        maCompObj.of_Members_Held__c = 0;
        maCompObj.Number_of_Members_Awarded__c = 0;
        maCompObj.of_Members_Awarded__c = 0;
        
        return maCompObj;
        
    }	
}