public without sharing class Membership_QA_Controller {
    
    @AuraEnabled
    public static ReturnQARelatedData getAccountRelatedOpportunityDetails(Id accountId, String category) {

        ReturnQARelatedData returnQARelatedDataObj = new ReturnQARelatedData();
        
        try { 
            
            Opportunity oppObj = new Opportunity();
            oppObj.AccountId = accountId;
            
            returnQARelatedDataObj.opportunityData = oppObj;
            
            String mandatoryFieldsMetadataRecordName = '';
            String picklistFieldsMetadataRecordName = '';
            String salesStagePicklistFieldsMetadataRecordName = '';
            String conditionallyMandatoryFieldsMetadataRecordName = '';
            String dateMandatoryFieldsRecordName = '';
            if(category == 'Client Management') {
				mandatoryFieldsMetadataRecordName = 'Mandatory_Fields';
            	picklistFieldsMetadataRecordName = 'Picklist_Fields';
            	salesStagePicklistFieldsMetadataRecordName = 'SalesStage_PicklistFields';
            	conditionallyMandatoryFieldsMetadataRecordName = 'Conditionally_Mandatory_Fields';
            } else if(category == 'Client Development') {
                mandatoryFieldsMetadataRecordName = 'Mandatory_FieldsCD';
            	picklistFieldsMetadataRecordName = 'Picklist_FieldsCD';
            	salesStagePicklistFieldsMetadataRecordName = 'SalesStage_PicklistFields';
            	conditionallyMandatoryFieldsMetadataRecordName = 'Conditionally_Mandatory_FieldsCD';
            }

            MA_GenericMapping__mdt[] genericMappingObjArray = [Select DeveloperName,Generic_Map__c,Generic_Map_Text__c from MA_GenericMapping__mdt where DeveloperName IN (:mandatoryFieldsMetadataRecordName,:picklistFieldsMetadataRecordName,:salesStagePicklistFieldsMetadataRecordName,:conditionallyMandatoryFieldsMetadataRecordName)];
			String[] salesStagePicklistFieldItags = new List<String>();
            if(genericMappingObjArray != null) {
                for(MA_GenericMapping__mdt genericMappingObj : genericMappingObjArray) {
                    if(genericMappingObj != null) {
                        if(genericMappingObj.DeveloperName != null) {
                            if(genericMappingObj.Generic_Map__c != null) {
                                if(genericMappingObj.DeveloperName == 'Mandatory_Fields' || genericMappingObj.DeveloperName == 'Mandatory_FieldsCD') {
                                    returnQARelatedDataObj.mandatoryFieldsMap = genericMappingObj.Generic_Map__c;     
                                } else if(genericMappingObj.DeveloperName == 'Picklist_Fields' || genericMappingObj.DeveloperName == 'Picklist_FieldsCD') {
                                    String picklistFieldsItagsData = genericMappingObj.Generic_Map__c;
                                    returnQARelatedDataObj.picklistFieldsItagsList = picklistFieldsItagsData.split(',');
                                } else if(genericMappingObj.DeveloperName == 'Conditionally_Mandatory_Fields' || genericMappingObj.DeveloperName == 'Conditionally_Mandatory_FieldsCD') {
                                    returnQARelatedDataObj.conditionallyMandatoryFieldsMap = genericMappingObj.Generic_Map__c; 
                                }
                            } else if(genericMappingObj.Generic_Map_Text__c != null) {
                                if(genericMappingObj.DeveloperName == 'SalesStage_PicklistFields') {
                                    salesStagePicklistFieldItags = genericMappingObj.Generic_Map_Text__c.split(',');
                                }
                            }
                        }
                    }
                }
            }
            
            Schema.sObjectType sobject_type = Opportunity.getSObjectType();
            Schema.DescribeSObjectResult sobject_describe = sobject_type.getDescribe();
            Map<String, Schema.SObjectField> field_map = sobject_describe.fields.getMap();
            if(returnQARelatedDataObj.picklistFieldsItagsList != null && returnQARelatedDataObj.picklistFieldsItagsList.size() > 0) {
            	for(String picklistItag : returnQARelatedDataObj.picklistFieldsItagsList) {
                    List<Schema.PicklistEntry> picklistDataList = field_map.get(picklistItag).getDescribe().getPickListValues();
                    List<String> picklistValuesList = new List<String>();
                    for(Schema.PicklistEntry entry : picklistDataList) {
                        picklistValuesList.add(entry.getValue());
                    }
                    returnQARelatedDataObj.picklistFieldsMap.put(picklistItag, picklistValuesList);
                } 
            }
            
            List<String> picklistValuesListSurestSVP = new List<String>();
            for(string s:System.Label.Surest_SVP_involved_CD_QA.split(';'))
                picklistValuesListSurestSVP.add(s);
            returnQARelatedDataObj.picklistFieldsMap.put('Surest_SVP_Involved__c', picklistValuesListSurestSVP);
           
            
            /**
             * Sales Stage fields Picklist Values - START
             */ 
            
            List<String> picklistValuesList = new List<String>();
            picklistValuesList.add('Lead');
            if(category == 'Client Management') {
            	picklistValuesList.add(System.Label.EmergingRiskOrNoUpside); 
            }
            
            for(String salesStageFieldItag : salesStagePicklistFieldItags) {
                returnQARelatedDataObj.picklistFieldsMap.put(salesStageFieldItag, picklistValuesList);
            }
            
            /**
             * Sales Stage Picklist Values - END
             */
            
            System.debug('returnQARelatedDataObj-'+returnQARelatedDataObj);
            
        } catch(Exception e) {
            System.debug('Exception '+e.getStackTraceString());
        }
        
        return returnQARelatedDataObj;
    }
    
    @AuraEnabled
    public static Id saveOpportunityDetails(Opportunity opportunityData) {
        try {
            System.debug('Opportunity Data which is to be Inserted - '+opportunityData);
            opportunityData.Is_Created_by_QA__c = true;
            opportunityData.StageName = 'Open';
            opportunityData.CloseDate = System.today();
            insert opportunityData;
            System.debug('Success - Opportunity has been created successfully in SF.');
        } catch(Exception e) {
            System.debug('Exception occurred in saveOpportunityDetails method while inserting the Opportuinty in SF - '+e);
            throw new AuraHandledException('Exception occurred while inserting Opportunity in SF: Line Number ---> '+e.getLineNumber() +' : Error Message ---> '+e.getMessage());
        }
        return opportunityData.Id;
    }
    
    @AuraEnabled
    public static ReturnQAData queryAccountsAndRecordTypeValues(Id accountId, String oppRecordType) {
        
        ReturnQAData returnQADataObj = new ReturnQAData();  
        try {
            String oppCategory = '';
            if(accountId != null) {
                returnQADataObj.accountData =  [SELECT Name,Category__c,Owner.Name,Owner.Id FROM Account where Id=:accountId];
                if(returnQADataObj.accountData != null) {
                    String accCategory = returnQADataObj.accountData.Category__c;
                    if(accCategory != null && accCategory != '') {
                        /*if(accCategory == 'Client Development') {
                            oppCategory = 'CD';
                        } else if(accCategory == 'Client Management') {
                            oppCategory = 'CM';
                        }*/
                        /* if/else condition commented and added below for MA creation 
                        from Company(Aggregator) Applet issue fix */
                        if(accCategory == 'Client Management') {
                            oppCategory = 'CM';
                        } else{
                            oppCategory = 'CD';
                        }
                    } 
                }
            } else {
                oppCategory = oppRecordType;
            }
            returnQADataObj.recordTypeData =  [SELECT Id FROM RecordType where DeveloperName=:oppCategory];
            
            System.debug('Account Data-'+returnQADataObj.accountData);
            System.debug('Record Type Data-'+returnQADataObj.recordTypeData);
            
        } catch(Exception e) {
            System.debug('Exception occurred in queryAccountsAndRecordTypeValues method - '+e);
        }
        return returnQADataObj; 
    }
    
    @AuraEnabled
    public static Boolean getLoggedInUerRoleInfo() {
       
        Boolean isAggregatorsToBeShown = true;
           
        try {
            
            User user = [Select UserRole.Name from User where Id=:UserInfo.getUserId()];                                    
            if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
                String loggedInUserRole = user.UserRole.Name;
                String[] roleNames = System.Label.QA_Aggregator_Roles.split(',');
                if(roleNames != null) {
                    Set<String> roleNamesSet = new Set<String>(roleNames);
                    if(roleNamesSet != null && roleNamesSet.size() > 0) {
                        if(roleNamesSet.contains(loggedInUserRole)) {
                            isAggregatorsToBeShown = false;
                        } else {
                            isAggregatorsToBeShown = true;
                        }  
                    }
                }
            }
            
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }
        
        return isAggregatorsToBeShown;
    }
    
    @AuraEnabled
    public static AccountResult getAccountRecords(String searchKeyVal, Decimal pageNumber, String searchField, String operator, Boolean isAggregator, Boolean isAggregatorsToBeShown) {
        
        System.debug('getAccountRecords(String searchKeyVal, Decimal pageNumber, String searchField, String operator) - START');
        
        System.debug('Input Parameters -> SearchKey-'+searchKeyVal+', PageNo-'+pageNumber+', SearchField-'+searchField
                     		+'and Operator-'+operator);
        
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        AccountResult accountResultObj = new AccountResult();
        
        try {
            
        	accountResultObj = AccountsController.getAccountRecords(searchKeyVal, pageNumber, searchField, operator, isAggregator, accountResultObj, isAggregatorsToBeShown);
            
        } catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Account object from SF in getAccountRecords() '+
                         	'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getAccountRecords() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         	'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception occurred ---- '+noaccessExec.getMessage());
        } catch(QueryException queryExec) {
            System.debug('Error(QueryException) occurred while querying the details of Account object from SF in '+
                         	'getAccountRecords() method -> '+queryExec.getMessage());
            System.debug('Error(QueryException) in getAccountRecords() method, the Stack Trace is -> '+queryExec.getStackTraceString());
            throw new AuraHandledException('Query Exception occurred ---- '+queryExec.getMessage());
        } catch(Exception e) {
            System.debug('Error occurred in getAccountRecords() method while querying the Account details from SF -> '+e.getMessage());
            throw new AuraHandledException('Exception occurred ---- '+e.getMessage());
        }
        
        System.debug('Output Parameters -> AccountList-'+accountResultObj.accountList+', Page-'+accountResultObj.page+
                     		', PageSize-'+accountResultObj.pageSize+'and TotalNoOfPages-'+accountResultObj.total);
        
        System.debug('getAccountRecords(String searchKeyVal, Decimal pageNumber, String searchField, String operator) - END');

        return accountResultObj;
    }
    
    public static void insertNAandTotalCompetitorsRecordsForCMMA(Id oppId, Map<String, OpportunityLineItem> totalRecordMap, String[] productTypesArray, Map<String,String> salesStagePdtTypeMap, Id accountId) {
    
        System.debug('1-'+oppId+',2-'+totalRecordMap+',3-'+productTypesArray);
        System.debug('insertNAandTotalCompetitorsRecordsForCMMA START');
        
        List<MA_Competitor__c> maCompetitorListToBeInserted = new List<MA_Competitor__c>();
        
        Map<String, Map<String,String>> numberOfMembersHeldMappingValues = ProductsAndCompetitorsAppletController.returnMap(UHGMAConstants.NATIONAL_ACCOUNTS_NOOFMEMBERS_HELD_TOTALRECORD);
        Map<String, Map<String,String>> membersInvolvedInMAMappingValues = ProductsAndCompetitorsAppletController.returnMap(UHGMAConstants.MEMBERS_INVOLVED_IN_MA);
		
        //String[] productTypesArray = selectedProductTypes.split(';');
		
        Id nationalAccountId = null;
        Id totalAccountId = null;
        Set<String> accountNames = new Set<String>();
        
        accountNames.add(Label.National_Account_Name);
        accountNames.add(Label.Total);
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
		 * To get Account Competitors List
		 */
        Map<String, List<MA_Competitor__c>> maCompetitorsMap = new Map<String, List<MA_Competitor__c>>();
        if(accountId != null) {
            String compClassificationValueToBeExcluded = 'Other';
            List<Competitor__c> accountRelatedCompetitorsList = Database.query('SELECT CompetitorAccount__c,CompetitorAccount__r.Name,NumberOfMembersHeld__c,ofMembersHeld__c,Competitorclassification__c,Competitor_Group__c,Comments__c FROM Competitor__c WHERE Account__r.Id =: accountId and CompetitorAccount__r.Name != null and CompetitorAccount__r.Name NOT IN :accountNames and Competitorclassification__c != :compClassificationValueToBeExcluded');
            if(accountRelatedCompetitorsList != null && accountRelatedCompetitorsList.size() > 0) {
                for(Competitor__c compObj : accountRelatedCompetitorsList) {
                    if(maCompetitorsMap != null && maCompetitorsMap.size() > 0 && maCompetitorsMap.containsKey(compObj.Competitorclassification__c)) {
                        List<MA_Competitor__c> maCompetitorList = maCompetitorsMap.get(compObj.Competitorclassification__c);
                        MA_Competitor__c maCompetitor = returnMACompetitorData(oppId, compObj, new MA_Competitor__c());
                        maCompetitorList.add(maCompetitor);
                        maCompetitorsMap.put(compObj.Competitorclassification__c, maCompetitorList);
                    } else {
                        List<MA_Competitor__c> maCompetitorList = new List<MA_Competitor__c>();
                        MA_Competitor__c maCompetitor = returnMACompetitorData(oppId, compObj, new MA_Competitor__c());
                        maCompetitorList.add(maCompetitor);
                        maCompetitorsMap.put(compObj.Competitorclassification__c, maCompetitorList);
                    }
                }
            }
        }
        
        for(String productType : productTypesArray) {
            
            String currentSalesStage = salesStagePdtTypeMap.get(productType);
            System.debug(productType+'->'+currentSalesStage);
            Decimal membersInvolvedInMA = returnMembersInvolvedInMA(productType, totalRecordMap, membersInvolvedInMAMappingValues, currentSalesStage);
            membersInvolvedInMA = (membersInvolvedInMA != null) ? membersInvolvedInMA : 0;
            
            if(productType != null  && productType == 'Other Buy Up Programs') {
            	productType = 'Other';    
            }
            
            MA_Competitor__c nationalAccountsCompObj = returnNationalAccountsRecordData(oppId, System.Label.NBEA, productType, currentSalesStage, nationalAccountId, totalRecordMap, numberOfMembersHeldMappingValues, membersInvolvedInMA);
            
            MA_Competitor__c totalRecordCompObj = new MA_Competitor__c();
            totalRecordCompObj.Opportunity__c = oppId;
            totalRecordCompObj.Competitor_Account__c = totalAccountId;
            totalRecordCompObj.Competitor_Classification__c = productType;
            totalRecordCompObj.Number_of_Members_Held__c = nationalAccountsCompObj.Number_of_Members_Held__c;
            totalRecordCompObj.of_Members_Held__c = nationalAccountsCompObj.of_Members_Held__c;
            totalRecordCompObj.Number_of_Members_Awarded__c = nationalAccountsCompObj.Number_of_Members_Awarded__c;
            totalRecordCompObj.of_Members_Awarded__c = nationalAccountsCompObj.of_Members_Awarded__c;
            
            maCompetitorListToBeInserted.add(nationalAccountsCompObj);
            if(maCompetitorsMap != null && maCompetitorsMap.size() > 0 && maCompetitorsMap.get(productType) != null) {
               maCompetitorListToBeInserted.addAll(maCompetitorsMap.get(productType)); 
            }
            maCompetitorListToBeInserted.add(totalRecordCompObj);
            
        }
        
        if(maCompetitorListToBeInserted != null && maCompetitorListToBeInserted.size() > 0) {
            insert maCompetitorListToBeInserted;
        }
                
        System.debug('insertNAandTotalCompetitorsRecordsForCMMA END');
    
    }
    
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
    
    public static Decimal returnMembersInvolvedInMA(String productType, Map<String, OpportunityLineItem> totalRecordMap,
                                                    Map<String, Map<String,String>> membersInvolvedInMAMappingValues, String currentSalesStage) {
        
        Decimal membersInvolvedInMA = 0;
        
        if(productType != null && !productType.equalsIgnoreCase(System.Label.Other_Buy_Up_Program)) {
            
            if(totalRecordMap != null && totalRecordMap.size() > 0) {
                
                //System.debug('membersInvolvedInMAMappingValues->'+membersInvolvedInMAMappingValues);
                System.debug('productType->'+productType);
                
                String maTypeCompetitorClassification = System.Label.NBEA+'-'+productType;
                Map<String,String> salesStageProductTotalMap = membersInvolvedInMAMappingValues.get(maTypeCompetitorClassification);
                System.debug('salesStageProductTotalMap->'+salesStageProductTotalMap);
                
                if(salesStageProductTotalMap != null && salesStageProductTotalMap.size() > 0) {
                    if(currentSalesStage != null) {
                        System.debug('salesStageProductTotalMap.get(currentSalesStage)'+salesStageProductTotalMap.get(currentSalesStage));
                        if(salesStageProductTotalMap.get(currentSalesStage) != null && salesStageProductTotalMap.get(currentSalesStage) == 'Estimated_Members_Existing_New__c') {
                            Integer existingMembers = 0;
                            Integer newMembers = 0;
                            System.debug('oppLineItemObj-'+ totalRecordMap.get(productType));
                            OpportunityLineItem oppLineItemObj = totalRecordMap.get(productType);
                            System.debug('Exist-'+Integer.valueOf(oppLineItemObj.get('Existing_Members_Involved_in_the_Bid__c')));
                            System.debug('Esti-'+Integer.valueOf(oppLineItemObj.get('Estimated_Additional_New_Members__c')));
                            if(oppLineItemObj != null) {
                                if(oppLineItemObj.get('Existing_Members_Involved_in_the_Bid__c') != null) {
                                    existingMembers = Integer.valueOf(oppLineItemObj.get('Existing_Members_Involved_in_the_Bid__c'));  
                                } 
                                if(oppLineItemObj.get('Estimated_Additional_New_Members__c') != null) {
                                    newMembers = Integer.valueOf(oppLineItemObj.get('Estimated_Additional_New_Members__c'));
                                }
                            }
                            newMembers = newMembers != null ? newMembers : 0;
                            existingMembers = existingMembers != null ? existingMembers : 0;
                            membersInvolvedInMA = newMembers + existingMembers; 
                            
                        } else {
                            System.debug('oppLineItemObj-'+ totalRecordMap.get(productType));
                            OpportunityLineItem oppLineItemObj = totalRecordMap.get(productType);
                            System.debug('Value-'+Integer.valueOf(oppLineItemObj.get(salesStageProductTotalMap.get(currentSalesStage))));
                            if(oppLineItemObj != null && salesStageProductTotalMap.get(currentSalesStage) != null && oppLineItemObj.get(salesStageProductTotalMap.get(currentSalesStage)) != null) {
                                membersInvolvedInMA = Integer.valueOf(oppLineItemObj.get(salesStageProductTotalMap.get(currentSalesStage)));
                            }
                        }
                    }
                    if(membersInvolvedInMA == null) {
                        membersInvolvedInMA = 0;
                    }
                    /*System.debug('currentSalesStage->'+totalRecordMap.get(salesStageProductTotalMap.get(currentSalesStage)));
					  System.debug('membersInvolvedInMA->'+competitorsDetailsObj.membersInvolvedInMA);
					  System.debug('Members_in_the_Proposal_Medical__c->'+opportunityObj.Members_in_the_Proposal_Medical__c);*/
                }                                    
            }
        }
        
		return  membersInvolvedInMA;
    }
    
    public static MA_Competitor__c returnNationalAccountsRecordData(Id opportunityId, String opportunityCategory, String competitorClassification, 
                                                                    String currentSalesStage, Id nationalAccountsOrTotalAccountId, 
                                                                    Map<String, OpportunityLineItem> totalRecordMap, 
                                                                    Map<String, Map<String,String>> numberOfMembersHeldMappingValues, Decimal membersInvolvedInMA)  {
        
        System.debug('returnNationalAccountsRecordData START');                                                              
        
        System.debug('Input Paremeters->Opportunity Id-'+opportunityId+', Opportunity Category-'+opportunityCategory+', Competitor Classification-'+
                     competitorClassification+', NationalAccountsOrTotalAccountId-'+nationalAccountsOrTotalAccountId+
                     ', Current SalesStage-'+currentSalesStage+', totalRecordMap-'+totalRecordMap+', NumberOfMembersHeldMappingValues-'+
                     numberOfMembersHeldMappingValues+', membersInvolvedInMA-'+membersInvolvedInMA);
        
        membersInvolvedInMA = (membersInvolvedInMA != null) ? membersInvolvedInMA : 0;
        MA_Competitor__c maCompetitorObj = new MA_Competitor__c();
        Boolean toBeUpserted = false;
        
        try {
            
            maCompetitorObj = new MA_Competitor__c();
            maCompetitorObj.Opportunity__c = opportunityId;
            maCompetitorObj.Competitor_Account__c = nationalAccountsOrTotalAccountId;
            maCompetitorObj.Competitor_Classification__c = competitorClassification;
            maCompetitorObj.Competitor_Group__c = UHGMAConstants.NATIONAL_ACCOUNTS_COMPETITOR_GROUP;
            maCompetitorObj.Comments__c = '';
            
            if(competitorClassification != null) {
                if(competitorClassification.equalsIgnoreCase('Other')) {
                    maCompetitorObj.Number_of_Members_Held__c = 0;
                    maCompetitorObj.of_Members_Held__c = 0;
                } else {
                    if(totalRecordMap != null && totalRecordMap.size() > 0) {
                        String maTypeCompetitorClassification = opportunityCategory+'-'+competitorClassification;
                        Map<String,String> salesStageProductTotalMap = numberOfMembersHeldMappingValues.get(maTypeCompetitorClassification);
                        if(salesStageProductTotalMap != null && salesStageProductTotalMap.size() > 0) {
                            if(currentSalesStage != null) {
                                //System.debug('oppLineItemObj-'+(OpportunityLineItem) totalRecordMap.get(competitorClassification));
                                OpportunityLineItem oppLineItemObj = totalRecordMap.get(competitorClassification);
                                System.debug('oppLineItemObj-'+oppLineItemObj);
                                System.debug('Val-'+Integer.valueOf(oppLineItemObj.get(salesStageProductTotalMap.get(currentSalesStage))));
                                if(oppLineItemObj != null && salesStageProductTotalMap.get(currentSalesStage) != null && oppLineItemObj.get(salesStageProductTotalMap.get(currentSalesStage)) != null) {
                                    maCompetitorObj.Number_of_Members_Held__c = Integer.valueOf(oppLineItemObj.get(salesStageProductTotalMap.get(currentSalesStage)));
                                }
                            }
                        } else {
                            maCompetitorObj.Number_of_Members_Held__c = 0;
                            maCompetitorObj.of_Members_Held__c = 0;
                        }
                    } else {
                        maCompetitorObj.Number_of_Members_Held__c = 0;
						maCompetitorObj.of_Members_Held__c = 0;
                    }
                    
                    if(membersInvolvedInMA > 0 && maCompetitorObj.Number_of_Members_Held__c != null) {
                        Decimal perOfMembersHeld = Math.round((maCompetitorObj.Number_of_Members_Held__c/membersInvolvedInMA)*100);
                        maCompetitorObj.of_Members_Held__c = perOfMembersHeld;
                    }
                }
            } else {
                maCompetitorObj.Number_of_Members_Held__c = 0;
				maCompetitorObj.of_Members_Held__c = 0;
            }
            
            maCompetitorObj.Number_of_Members_Awarded__c = 0;
            maCompetitorObj.of_Members_Awarded__c = 0;
                
        } catch(AuraHandledException ex){
            System.debug('Exception in Save '+ex.getMessage());
            throw ex;
        }catch(Exception e) {
            System.debug('Exception occurred in returnMap(Map<String, Map<String,String>>, String) method while preparing ITAG map'+
                         ' (Sets Data for the fields MembersInvolvedInMA, NatAccMembersHeld&Awarded) from the Constants ->'+e);
            throw new AuraHandledException(' Error Occurred while returnNationalAccountsRecordData : Line Number ---> '+e.getLineNumber() +' : Error Message ---> '+e.getMessage());
        }
        
        System.debug('Nat Acc Data-'+maCompetitorObj);                                                                        
        System.debug('returnNationalAccountsRecordData END');
        
        return maCompetitorObj;
    }
    
    @AuraEnabled
    public static void saveOpportunityLineItemsAndCompetitors(Id oppId, List<OpportunityLineItem> productsList, List<MA_Competitor__c> competitorsList, List<OpportunityLineItem> totalRecordsList, String[] selectedProductTypes, String oppType, List<String> salesStagesList, Id accountId) {
        
        System.debug('SaveOpportunityLineItemsAndCompetitors START');
        System.debug('Pdt Types-'+selectedProductTypes);

        try {                      
             Map<String,String> salesStagePdtTypeMap = new Map<String,String>();
                if(salesStagesList != null && salesStagesList.size() > 0) {
                    for(String salesStagepdtType : salesStagesList) {
                        String[] salesStagepdtTypeArray = salesStagepdtType.split(';;');
                        salesStagePdtTypeMap.put(salesStagepdtTypeArray[0], salesStagepdtTypeArray[1]);
                    } 
                    System.debug('salesStagePdtTypeMap-'+salesStagePdtTypeMap);
                }
            
            if(schema.sobjecttype.OpportunityLineItem.isaccessible() && schema.sobjecttype.OpportunityLineItem.isUpdateable() && schema.sobjecttype.OpportunityLineItem.iscreateable()) {              	                
                System.debug('ProductsList Size-'+productsList.size()+'->ProductsList --- '+productsList);  
                List<OpportunityLineItem> upsertProductsList = new List<OpportunityLineItem>();
                for(OpportunityLineItem opportunityProducts : productsList) {
                    opportunityProducts.OpportunityId = oppId;
                    String oppLineItemProductline = opportunityProducts.Product2.Product_Line__c;
                    oppLineItemProductline = (oppLineItemProductline != null) ? oppLineItemProductline : '';
					String salesStageVal = salesStagePdtTypeMap.get(oppLineItemProductline);
                    salesStageVal = (salesStageVal != null) ? salesStageVal : '';
                    if(oppType != null && oppType.equalsIgnoreCase(System.Label.NB)) {
                        opportunityProducts.Sales_Stage__c = 'Lead';
                    } else {
                        opportunityProducts.Sales_Stage__c = salesStageVal;
                    }
                    upsertProductsList.add(opportunityProducts);
                }
				/* Inserting TOTAL Opportunity Line Item Records to the associated MA */
                if(totalRecordsList != null && totalRecordsList.size() > 0) {
                    for(OpportunityLineItem oppLineItemObj : totalRecordsList) {  
                        
                        String totalRecordName = System.Label.Total;
                        /* Description field in OppLineItem obj is used to get the Product Type value from Helper to Apex class */
                        String productType = oppLineItemObj.Description;
                        PricebookEntry pricebookEntryObj = Database.query('SELECT Id, Product2Id FROM PricebookEntry where Product2.Name = :totalRecordName and Product2.Product_Line__c =: productType Limit 1');
                    	Product2 totalProductObj = Database.query('Select Id,Distribution_Type_Flag__c,Family,Name,Product_Line__c from Product2 where Product2.Name = :totalRecordName and Product2.Product_Line__c =: productType Limit 1');
                        
                        oppLineItemObj.OpportunityId = oppId;
                        oppLineItemObj.PricebookEntryId = pricebookEntryObj.Id;
                        oppLineItemObj.Product2Id  = pricebookEntryObj.Product2Id;
                        oppLineItemObj.Product2 = totalProductObj; 
                        String oppLineItemProductline = oppLineItemObj.Product2.Product_Line__c;
                        oppLineItemProductline = (oppLineItemProductline != null) ? oppLineItemProductline : '';
                        String salesStageVal = salesStagePdtTypeMap.get(oppLineItemProductline);
                        salesStageVal = (salesStageVal != null) ? salesStageVal : '';
                        if(oppType != null && oppType.equalsIgnoreCase(System.Label.NB)) {
                            oppLineItemObj.Sales_Stage__c = 'Lead';
                        } else {
                            oppLineItemObj.Sales_Stage__c = salesStageVal;
                        } 
                        upsertProductsList.add(oppLineItemObj);
                    }					
                }
                upsert upsertProductsList;
                System.debug('Opportunity Line Items successfully has been inserted.');
            }
            
            if(competitorsList != null && competitorsList.size() > 0) {
            	if(schema.sobjecttype.MA_Competitor__c.isaccessible() && schema.sobjecttype.MA_Competitor__c.isUpdateable() && schema.sobjecttype.MA_Competitor__c.iscreateable()) {
                    List<MA_Competitor__c> competitorsListToBeUpserted = new List<MA_Competitor__c>();
                    for(MA_Competitor__c obj : competitorsList) {
                        obj.Opportunity__c = oppId;
                        competitorsListToBeUpserted.add(obj);
                    }
                    
                    if(oppType != null && oppType.equalsIgnoreCase(System.Label.NB) && selectedProductTypes != null && selectedProductTypes.size() > 0) {

                        Id nationalAccountId = null;
                        Id totalAccountId = null;
                        Set<String> accountNames = new Set<String>();
                        
                        accountNames.add(Label.National_Account_Name);
                        accountNames.add(Label.Total);
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
                        for(String productType : selectedProductTypes) {
                            
                            if(productType != null  && productType == 'Other Buy Up Programs') {
                                productType = 'Other';    
                            }
                            
                            MA_Competitor__c natAccRecordCompObj = new MA_Competitor__c();
                            natAccRecordCompObj.Opportunity__c = oppId;
                            natAccRecordCompObj.Competitor_Account__c = nationalAccountId;
                            natAccRecordCompObj.Competitor_Classification__c = productType;
                            natAccRecordCompObj.Number_of_Members_Held__c = 0;
                            natAccRecordCompObj.of_Members_Held__c = 0;
                            natAccRecordCompObj.Number_of_Members_Awarded__c = 0;
                            natAccRecordCompObj.of_Members_Awarded__c = 0;
                            
                            MA_Competitor__c totalRecordCompObj = new MA_Competitor__c();
                            totalRecordCompObj.Opportunity__c = oppId;
                            totalRecordCompObj.Competitor_Account__c = totalAccountId;
                            totalRecordCompObj.Competitor_Classification__c = productType;
                            totalRecordCompObj.Number_of_Members_Held__c = 0;
                            totalRecordCompObj.of_Members_Held__c = 0;
                            totalRecordCompObj.Number_of_Members_Awarded__c = 0;
                            totalRecordCompObj.of_Members_Awarded__c = 0;
                            
                            competitorsListToBeUpserted.add(natAccRecordCompObj);
                            competitorsListToBeUpserted.add(totalRecordCompObj);
                        }
                    }
                    upsert competitorsListToBeUpserted;
                    System.debug('Competitors successfully has been inserted.');
                } 
            } else {
                System.debug('ELSE');
                Map<String,OpportunityLineItem> totalRecordsDataMap = new Map<String,OpportunityLineItem>();
                if(totalRecordsList != null && totalRecordsList.size() > 0) {
                    for(OpportunityLineItem oppLineItemObj : totalRecordsList) {                      
                        /* Description field in OppLineItem obj is used to get the Product Type value from Helper to Apex class */
                        totalRecordsDataMap.put(oppLineItemObj.Description, oppLineItemObj);
                    }
                    System.debug('totalRecordsDataMap-'+totalRecordsDataMap);
                }                
                //String selectedProductTypes = String.valueOf(oppObj.get('Product_Type_Involved_in_Opp__c'));
                //System.debug('PdtTypes-'+selectedProductTypes);
                insertNAandTotalCompetitorsRecordsForCMMA(oppId, totalRecordsDataMap, selectedProductTypes, salesStagePdtTypeMap, accountId);
            }
                      
        } catch(Exception ex){
            System.debug('Exception in Save '+ex.getMessage());
            throw new AuraHandledException(' Error Occurred while saving  Opportunity Products: Line Number ---> '+ex.getLineNumber() +' : Error Message ---> '+ex.getMessage());
        }
        
        System.debug('SaveOpportunityLineItemsAndCompetitors END');
    }
    
    @AuraEnabled
    public static void saveOpportunityContacts(Id oppId, List<String> consultantIds, Id accountId, Boolean isprimaryExistsVal) {
        
        System.debug('SaveOpportunityContacts START');
        System.debug('Input Params -> isprimaryExistsVal-'+isprimaryExistsVal+', oppId-'+oppId +', consultantIds-'+consultantIds);
        
        try {
            
            if(oppId != null && consultantIds != null) {
                if(schema.sobjecttype.OpportunityContactRole.isAccessible()) {
                    List<OpportunityContactRole> maConsultantsList = new List<OpportunityContactRole>();
                    for(Integer i=0; i<consultantIds.size(); i++) {
                        
                        OpportunityContactRole maRec = null;
                        if(i == 0){
                            if(isprimaryExistsVal){
                                maRec = new OpportunityContactRole(OpportunityId = oppId, ContactId = consultantIds[i], IsPrimary = true);    
                            }else{
                            	maRec = new OpportunityContactRole(OpportunityId = oppId, ContactId = consultantIds[i], IsPrimary = false);
                            }
                            
                        }else{
                            maRec = new OpportunityContactRole(OpportunityId = oppId, ContactId = consultantIds[i], IsPrimary = false);
                        }
                        maConsultantsList.add(maRec);
                    }
                    System.debug('maConsultantsList-'+maConsultantsList);
                    if(maConsultantsList != null && maConsultantsList.size() > 0) {
                        Database.SaveResult[] maConsultantsResultList = Database.insert(maConsultantsList, false);
                        system.debug('maConsultantsResultList-'+maConsultantsResultList);
                        
                        for(Database.SaveResult sr : maConsultantsResultList){
                            if(sr.isSuccess()){
                                
                                System.debug('Successfully inserted');
                                if(isprimaryExistsVal) {
                                    MA_Consultants_Class.updatePrimaryId(oppId, consultantIds[0], false, 'apex');
                                }
                                
                                List<AccountContactRelation> acrList = new List<AccountContactRelation>();
                                boolean acrRecordExists = false;
                                System.debug('accId--->>'+accountId);
                                
                                String countquery = 'SELECT count() FROM AccountContactRelation WHERE AccountId = :accountId AND IsDirect = false';
                                Integer countACRRecords = Database.countQuery(countQuery);
                                if(countACRRecords != 0){
                                    acrRecordExists = true;
                                }
                                
                                List<Contact> noDirectConsultantList =  [SELECT Id FROM Contact WHERE Contact.Status__c = 'Active' AND Name =: System.Label.No_Consultant_Name AND RecordType.Name = 'Consultant' LIMIT 1];
                                Id uhgNoDirectConsultantId;
                                if(noDirectConsultantList != null && noDirectConsultantList.size() > 0) {
                                    uhgNoDirectConsultantId = noDirectConsultantList[0].Id;
                                }

                                for(Integer i = 0; i<consultantIds.size(); i++) {
                                    AccountContactRelation acrrecord = null;
                                    Boolean isUHGNoDirectConsultantExists = false;
                                    if(uhgNoDirectConsultantId != null && uhgNoDirectConsultantId == consultantIds[i]) {
										isUHGNoDirectConsultantExists = true;  
                                    } else {
										isUHGNoDirectConsultantExists = false;  
                                    }                                    
                                    
                                    if(isUHGNoDirectConsultantExists == false) {
                                        if(i == 0){
                                            if(acrRecordExists){
                                                acrrecord = new AccountContactRelation(AccountId = accountId, ContactId = consultantIds[i]);
                                            }else{
                                                if(isprimaryExistsVal) {
                                                    acrrecord = new AccountContactRelation(AccountId = accountId, ContactId = consultantIds[i], Primary__c = true); 
                                                } else {
                                                    acrrecord = new AccountContactRelation(AccountId = accountId, ContactId = consultantIds[i]);
                                                }
                                            }
                                            
                                        }else{
                                            acrrecord = new AccountContactRelation(AccountId = accountId, ContactId = consultantIds[i]);
                                        }
                                        acrList.add(acrrecord);
                                    }                                    
                                }

                                Database.SaveResult[] acrSaveresults = Database.insert(acrList, false);
                                for(Database.SaveResult acrRes : acrSaveresults){
                                    if(acrRes.isSuccess()){
                                        System.debug('Successfully updated in Account Contact relation');
                                    }else{
                                        for(Database.Error err : acrRes.getErrors()) {
                                            System.debug('The following error has occurred.');                   
                                            System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                            System.debug('Account fields that affected this error: ' + err.getFields());
                                        }
                                    }
                                }
                            }else{
                                for(Database.Error err : sr.getErrors()) {
                                    System.debug('The following error has occurred.');                   
                                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                    System.debug('Account fields that affected this error: ' + err.getFields());
                                }
                            }
                        }
                    }
                }
            }
        } catch(Exception ex) {
            System.debug('Exception in Save '+ex.getMessage());
            throw new AuraHandledException(' Error Occurred while saving the MA Consultants: Line Number ---> '+ex.getLineNumber() +' : Error Message ---> '+ex.getMessage());
        }
        
        System.debug('SaveOpportunityContacts END');
    }
    
    /*
     * Wrapper class to return Opportunity, Metadata details
     */
    
    public class ReturnQARelatedData {
        
        @AuraEnabled
        public String mandatoryFieldsMap {get;set;}
        
        @AuraEnabled
        public String conditionallyMandatoryFieldsMap {get;set;}
        
        @AuraEnabled
        public List<String> picklistFieldsItagsList {get;set;}
        
        @AuraEnabled
        public Opportunity opportunityData {get;set;}
        
        @AuraEnabled
        public Map<String, List<String>> picklistFieldsMap {get;set;}
        
        public ReturnQARelatedData() {
         
            picklistFieldsMap = new Map<String, List<String>>();
            
        }
        
    }
    
    public class ReturnQAData { 
    
		@AuraEnabled
        public Account accountData {get;set;}
        
        @AuraEnabled
        public RecordType recordTypeData {get;set;}
        
        public ReturnQAData() {
            accountData = new Account();
            recordTypeData = new RecordType();
        }
        
    }
       
   	@AuraEnabled
    public static List<ListView> getListViews() {
        List<ListView> listviews = [SELECT Id, Name FROM ListView WHERE SobjectType = 'Opportunity'];
        // Perform isAccessible() check here
        return listviews;
    }
    
    /*
     * Wrapper class to display Users 
     */
   
    public class AccountResult {
        
    @AuraEnabled
    public List<Account> accountList{get;set;}
    
    @AuraEnabled
    public Integer pageSize {get;set;}
    
    @AuraEnabled
    public Integer page {get;set;}
    
     @AuraEnabled
    public Integer total {get;set;}
        
    }
    
}