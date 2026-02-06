/*
 ************************************************************************************************************************* 
Name: CompetitiveLandscape_OthersClass 
Copyright © 2017 CRMIT Solutions Company Inc.  
==========================================================================================================================
==========================================================================================================================
Purpose: Apex Controller for all the related SF operations in CompetitiveLandscape-Phamrcy/Specialty/OtherProducts Applet.
========================================================================================================================== 
==========================================================================================================================
History 
 ------- 
	VERSION      AUTHOR            DATE                DETAIL   	 				FEATURES/CSR/TTP  
	1.0 -   	 Yogitha  	 	26/07/2017  		INITIAL DEVELOPMENT   		  
	2.0 -
**************************************************************************************************************************
*/


/*
 * 
 */ 
public without sharing class CompetitiveLandscape_OthersClass {

    /*
    * The below method returns the boolean value which is used to be enable Add, Edit & Delete buttons to the specific Roles.
    */
    
    @AuraEnabled
    public static Boolean getLoggedInUerRoleInfo(String accountId) {
       
        Boolean isLoggedInUserRoleToBeEnabled = false;
           
        try {
            
			/*User user = [Select UserRole.Name from User where Id=:UserInfo.getUserId()];                                    
            if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
            String loggedInUserRole = user.UserRole.Name;
            System.debug('LoggedInUser Role Name-'+loggedInUserRole);
            String[] roleNames = System.Label.CompetitiveLandscape_Roles_To_DisableAddOrEditButtons.split(',');
            System.debug('Configured Role Names which is to be disabled in Competitive Landscape-'+roleNames);
            Set<String> roleNamesSet = new Set<String>(roleNames);
            if(roleNamesSet.contains(loggedInUserRole)) {
            isLoggedInUserRoleToBeEnabled = false;
            } else {
            isLoggedInUserRoleToBeEnabled = true;
            }
            System.debug('Competitive Landscape applet to be enabled-'+isLoggedInUserRoleToBeEnabled);
            }  */   
            
            isLoggedInUserRoleToBeEnabled = UserInformationClass.hasEditAccessToRecord(accountId);
            
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }
        
        return isLoggedInUserRoleToBeEnabled;
    }
    
    
    /*
     * The below method returns the Account Category based on the Account Id.
     */
    
    /******************************************************************
    * 
     Purpose: Returns the Account related data based on the Account ID.
     Parameters: accountId
     Returns: AccountResult(Pojo of Account details)
     Throws [Exceptions]: [optional] 
     
    *******************************************************************
    */ 
    
    @AuraEnabled    
    public static AccountResult getAccountType(Id accountId) {
        
        System.debug('getAccountType(Id accountId) - START');
        System.debug('Input Parameters in getAccountType() method -> '+accountId);
        
        AccountResult accountResultData = new AccountResult();

        try {
            
            if(accountId != null) {
                
                if(schema.sobjecttype.Account.isaccessible() && schema.sobjecttype.Account.isQueryable()) {
                    
                    Account accountData = [SELECT Category__c from Account where Id=:accountId];
                    if(accountData != null) {
                    	accountResultData.accountType = accountData.Category__c;   
                    }
                    
                } else {
                    throw new NoAccessException();
                }
            }
            
        } catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Account object from SF in getAccountType() method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getAccountType() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         	'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
        } catch(Exception e) {
            System.debug('Exception occurred while querying the data from Account in getAccountType() method - '+e);
        }
        
        System.debug('Ouput Parameters in getAccountType() method -> '+accountResultData);
        System.debug('getAccountType(Id accountId) - END');
        
        return accountResultData;
    }
    
    
    /******************************************************************
    * 
     Purpose: Returns the Competitors data of the associated Account from SF.
     Parameters: accountId, accountType, operation
     Returns: CompetitorResult(Pojo of Competitors details)
     Throws [Exceptions]: [optional] 
     
    *******************************************************************
    */ 
    @AuraEnabled
    public static CompetitorResult getAccountCompetitorRecords(Id accountId, String accountType, String operation, Boolean isButtonsEnabled) {
        
        CompetitorResult competitorResultObj = new CompetitorResult();
        AccountResult accountResultObj = new AccountResult();
        UHGAccountSOQLConstants uhgAccountSOQLConstants = new UHGAccountSOQLConstants();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        Id userId = userInfo.getUserId();
        //User loggedinUser = [SELECT Id, Name, Profile.Name , Position__c FROM User WHERE Id =: userId LIMIT 1];
        //String[] userPoistion = System.Label.Competitive_Other_Product_Section_User_Position_Access.split(',');
        competitorResultObj.isCsiUser = Competitive_Other_Prod_Controller.checkEditAccess(accountId);
        competitorResultObj.recordEditAccess  = [SELECT RecordId, HasEditAccess FROM UserRecordAccess WHERE RecordId = :accountId AND UserId =:userId Limit 1].HasEditAccess;
        
        System.debug('getAccountCompetitorRecords(Id accountId, String accountType, String operation) - START');
        
        System.debug('Input Parameters in getAccountCompetitorRecords() method -> Account Id-'+accountId+', Account Type-'+accountType);
        
        try {
            
            accountType = accountType != null ? accountType.trim() : '';
            isButtonsEnabled =  isButtonsEnabled != null ? isButtonsEnabled : false;
            
            //if(Schema.DescribeFieldResult.isaccessible()) {
                
            	/*
                 * Get the Business Model picklist values of Account from SF
                 */ 
                Schema.DescribeFieldResult businessModelSchemaData = Account.PharmacyBusinessModel__c.getDescribe();
                List<Schema.PicklistEntry> businessModelPicklistValues = businessModelSchemaData.getPicklistValues();
                List<String> businessModelValuesList = new List<String>();
                for(Schema.PicklistEntry entry : businessModelPicklistValues) {
                    businessModelValuesList.add(entry.getValue());
                }
                competitorResultObj.businessModelPicklistValuesList = businessModelValuesList;
                
				
            	/*
                 * Get the Coalition Model picklist values of Account from SF
                 */ 
                Schema.DescribeFieldResult pharmacyCoalitionSchemaData = Competitor__c.Coalition_if_applicable__c.getDescribe();
                List<Schema.PicklistEntry> pharmacyCoalitionPicklistValues = pharmacyCoalitionSchemaData.getPicklistValues();
                List<String> pharmacyCoalitionValuesList = new List<String>();
                for(Schema.PicklistEntry entry : pharmacyCoalitionPicklistValues) {
                    pharmacyCoalitionValuesList.add(entry.getValue());
                }
                competitorResultObj.pharmacyCoalitionPicklistValuesList = pharmacyCoalitionValuesList;
            
                /*
                 * Get the Dental Funding Type picklist values of Account from SF
                 */ 
                Schema.DescribeFieldResult dentalFundingTypeSchemaData = Account.DentalFundingType__c.getDescribe();
                List<Schema.PicklistEntry> dentalFundingTypePicklistValues = dentalFundingTypeSchemaData.getPicklistValues();
                List<String> dentalFundingTypeValuesList = new List<String>();
                for(Schema.PicklistEntry entry : dentalFundingTypePicklistValues) {
                    dentalFundingTypeValuesList.add(entry.getValue());
                }
                competitorResultObj.dentalFundingTypePicklistValuesList = dentalFundingTypeValuesList;
            
                /*
    			 * Get the Vision Funding Type picklist values of Account from SF
    			 */ 
                Schema.DescribeFieldResult visionFundingTypeSchemaData = Account.VisionFundingType__c.getDescribe();
                List<Schema.PicklistEntry> visionFundingTypePicklistValues = visionFundingTypeSchemaData.getPicklistValues();
                List<String> visionFundingTypeValuesList = new List<String>();
                for(Schema.PicklistEntry entry : visionFundingTypePicklistValues) {
                    visionFundingTypeValuesList.add(entry.getValue());
                }
                competitorResultObj.visionFundingTypePicklistValuesList = visionFundingTypeValuesList;            
            	
            	/*
                 * Get the Funding Type picklist values of Competitor from SF
                 */ 
                Schema.DescribeFieldResult typeOfOtherProductsSchemaData = Competitor__c.Type_of_Products_Services_Provided__c.getDescribe();
                List<Schema.PicklistEntry> typeOfOtherProductsPicklistValues = typeOfOtherProductsSchemaData.getPicklistValues();
                List<String> typeOfOtherProductsValuesList = new List<String>();
                for(Schema.PicklistEntry entry : typeOfOtherProductsPicklistValues) {
                    typeOfOtherProductsValuesList.add(entry.getValue());
                }
                competitorResultObj.typeOfOtherProductsProvided = typeOfOtherProductsValuesList;
            	
            //}
            
            if(Schema.sobjecttype.Competitor__c.isaccessible() && Schema.sobjecttype.Competitor__c.isQueryable()) {
                
                if(accountId != null) {
                    competitorResultObj.accountDataObj = [SELECT PharmacyBusinessModel__c,DentalFundingType__c,VisionFundingType__c from Account where Id=:accountId];
                    //List<Competitor__c> competitorsList = new List<Competitor__c>();
                    List<Competitor__c> competitorsList = Database.query(uhgAccountSOQLConstants.QUERY_STRING_CM_COMPETITORS);

                    //------------------------------------------changes made by Varun as per Case #3495--------------------------------------------------------------//
                    if(competitorResultObj.isCsiUser){
                        competitorData cmpClass = new competitorData();
                        competitorsList = cmpClass.getCompetitorsData(accountId);
                    }
                    else{
                        competitorsList = Database.query(uhgAccountSOQLConstants.QUERY_STRING_CM_COMPETITORS);
                    }
                   
                    //-------------------------------------------Case #3495 changes end ----------------------------------------------------------------------------------------//
                    
                    /* Logic to swap records based on 'UHC-Optum' comes at first - START */
                    List<Competitor__c> sortedCompetitorsList = new List<Competitor__c>();
                    List<Competitor__c> nonUhcOptumRecords = new List<Competitor__c>();
                    for(Integer i = 0 ; i < competitorsList.size() ; i++) {
                        if(competitorsList[i].CompetitorAccount__r != null && competitorsList[i].CompetitorAccount__r.Name == 'UHC-Optum') {
                            sortedCompetitorsList.add(competitorsList[i]);
                            //competitorsList.remove(i);
                        } else {
                            nonUhcOptumRecords.add(competitorsList[i]);
                        }
                    }
                    
                    if(sortedCompetitorsList.size() > 0 && nonUhcOptumRecords.size() > 0) {
                        sortedCompetitorsList.addAll(nonUhcOptumRecords);
                    } else if (sortedCompetitorsList.size() == 0 && nonUhcOptumRecords.size() > 0) {
                        sortedCompetitorsList.addAll(nonUhcOptumRecords);
                    }
                    /* Logic to swap records based on 'UHC-Optum' comes at first - END */
                    
                    if(sortedCompetitorsList != null && sortedCompetitorsList.size() > 0) {
                    
                        if(accountType.length() > 0) { 
                            if(accountType.equalsIgnoreCase(System.Label.Client_Management)) { 
                                competitorResultObj = returnCMAccountCompetitorsData(sortedCompetitorsList, competitorResultObj);
                                /*if(competitorResultObj != null) {
                                	List<Competitor__c> competitorList = new List<Competitor__c>();
                                    competitorList = getNationalAccountsRecordsData(competitorResultObj, accountId, competitorList);
                                    competitorList = getTotalRecordsData(competitorResultObj, accountId, competitorList);  
                                    if(competitorList != null && competitorList.size() > 0) {
                                        Database.insert(competitorList, false);
                                        List<Competitor__c> competitorsList1 = Database.query(uhgAccountSOQLConstants.QUERY_STRING_CM_COMPETITORS);
                                        competitorResultObj = returnCMAccountCompetitorsData(competitorsList1, competitorResultObj);
                                    }  
                                }*/
                            } else if(accountType.equalsIgnoreCase(System.Label.Client_Development) || 
                                      		accountType.equalsIgnoreCase(System.Label.Aggregator)) {
                                competitorResultObj = returnCDAccountCompetitorsData(sortedCompetitorsList, competitorResultObj);
                                /*if(competitorResultObj != null) {
                                    List<Competitor__c> competitorList = new List<Competitor__c>();
                                    competitorList = getTotalRecordsData(competitorResultObj, accountId, competitorList);  
                                    if(competitorList != null && competitorList.size() > 0) {
                                        Database.insert(competitorList, false);
                                        //List<Competitor__c> competitorsList1 = Database.query(uhgAccountSOQLConstants.QUERY_STRING_CM_COMPETITORS);
                                        competitorResultObj = returnCDAccountCompetitorsData(competitorList, competitorResultObj);
                                    }
                                }*/
                            }
                        }
                        
                        if(competitorResultObj != null && (operation.equalsIgnoreCase('UpsertOperation') || 
								operation.equalsIgnoreCase('DeleteOperation'))) {
                            
                            if(accountType.equalsIgnoreCase(System.Label.Client_Management)) { 
                                
                                if(competitorResultObj.pharmacyCompetitorList != null && competitorResultObj.pharmacyCompetitorList.size() > 0) {
                            	
                                    competitorResultObj = returnIncumbentRecords(competitorResultObj.pharmacyCompetitorList, competitorResultObj);
                                
                                    competitorResultObj.incumbentPrimaryPharmacyId = competitorResultObj.incumbentPrimaryId;
                                    competitorResultObj.incumbentSecondaryPharmacyId = competitorResultObj.incumbentSecondaryId;
                            	}
                                    
                                if(competitorResultObj.dentalCompetitorList != null && competitorResultObj.dentalCompetitorList.size() > 0) {
                                    
                                    competitorResultObj = returnIncumbentRecords(competitorResultObj.dentalCompetitorList, competitorResultObj);
                                
                                    competitorResultObj.incumbentPrimaryDentalId = competitorResultObj.incumbentPrimaryId;
                                    competitorResultObj.incumbentSecondaryDentalId = competitorResultObj.incumbentSecondaryId;
                                }
                                
                                if(competitorResultObj.visionCompetitorList != null && competitorResultObj.visionCompetitorList.size() > 0) {
                                    
                                    competitorResultObj = returnIncumbentRecords(competitorResultObj.visionCompetitorList, competitorResultObj);
                                    competitorResultObj.incumbentPrimaryVisionId = competitorResultObj.incumbentPrimaryId;
                                    competitorResultObj.incumbentSecondaryVisionId = competitorResultObj.incumbentSecondaryId;
                                    
                                }
                            }
                            
                            Account acc = new Account();
                            
                            acc.Id = accountId;
                            acc.Incumbent_Primary_Pharmacy__c = competitorResultObj.incumbentPrimaryPharmacyId;
                            acc.Incumbent_Secondary_Pharmacy__c = competitorResultObj.incumbentSecondaryPharmacyId;
                            acc.IncumbentPrimaryDental__c = competitorResultObj.incumbentPrimaryDentalId;
                            acc.Incumbent_Secondary_Dental__c = competitorResultObj.incumbentSecondaryDentalId;
                            acc.IncumbentPrimaryVision__c = competitorResultObj.incumbentPrimaryVisionId;
                            acc.Incumbent_Secondary_Vision__c = competitorResultObj.incumbentSecondaryVisionId;
                            
                            update acc;
                            
                        }
                    
                    } /*else {
                        
                        if(competitorResultObj != null && accountType.length() > 0) {
                            
                            if(accountType.equalsIgnoreCase(System.Label.Client_Management)) {
                                if(isButtonsEnabled) {
                                    List<Competitor__c> competitorList = new List<Competitor__c>();
                                	competitorList = getNationalAccountsRecordsData(competitorResultObj, accountId, competitorList);
                                	competitorList = getTotalRecordsData(competitorResultObj, accountId, competitorList);  
                                    if(competitorList != null && competitorList.size() > 0) {
                                        Database.insert(competitorList, false);
                                        List<Competitor__c> competitorsList1 = Database.query(uhgAccountSOQLConstants.QUERY_STRING_CM_COMPETITORS);
                                        competitorResultObj = returnCMAccountCompetitorsData(competitorsList1, competitorResultObj);
                                    }
                                }
                            } else if(accountType.equalsIgnoreCase(System.Label.Client_Development) || 
                                      		accountType.equalsIgnoreCase(System.Label.Aggregator)) {
                                if(isButtonsEnabled) {
                            		List<Competitor__c> competitorList = new List<Competitor__c>();
                                	competitorList = getTotalRecordsData(competitorResultObj, accountId, competitorList);  
                                    if(competitorList != null && competitorList.size() > 0) {
                                        Database.insert(competitorList, false);
                                        List<Competitor__c> competitorsList1 = Database.query(uhgAccountSOQLConstants.QUERY_STRING_CM_COMPETITORS);
                                    	competitorResultObj = returnCDAccountCompetitorsData(competitorsList1, competitorResultObj);
                                	}
                            	}
                        	}
                    	}
                	}*/
                
                }
            }
            
        } catch(Exception e) {
            system.debug('Error Line = '+e.getLineNumber());
            System.debug('Error occurred in getAccountCompetitorRecords() method while querying the details of '+
                         	'Account Competitors from SF -> ' + e.getMessage());
            throw new AuraHandledException('Exception occurred ---- '+e.getMessage()); 
            
        }
        
        System.debug('Output Parameters in getAccountCompetitorRecords() method -> Pharmacy List-'+ competitorResultObj.pharmacyCompetitorList +
					 ', Dental List - '+competitorResultObj.dentalCompetitorList+', Vision List - '+competitorResultObj.visionCompetitorList+
                     ', OtherProductsList - '+competitorResultObj.otherproductsCompetitorList+', Business Model Values - '+competitorResultObj.businessModelPicklistValuesList +
                     'Dental Funding Type Values - '+competitorResultObj.dentalFundingTypePicklistValuesList+',Vision Funding Type Values - '+
                     competitorResultObj.visionFundingTypePicklistValuesList+', Other Products/Services provided Values - '+competitorResultObj.typeOfOtherProductsProvided);
        System.debug('OtherProductsList '+competitorResultObj.otherproductsCompetitorList);
        System.debug('getAccountCompetitorRecords(Id accountId, String accountType, String operation) - END');
        
        return competitorResultObj;
    } 
     
    
    /******************************************************************
    * 
     Purpose: Returns the CM Competitors data of the associated Account.
     Parameters: competitorsList, competitorResultObj
     Returns: CompetitorResult(Wrapper Class Obj of Competitors details)
     Throws [Exceptions]: [optional] 
     
    *******************************************************************
    */ 
    public static CompetitorResult returnCMAccountCompetitorsData(List<Competitor__c>competitorsList, CompetitorResult competitorResultObj) {
        
        System.debug('returnCMAccountCompetitorsData(List<Competitor__c>'+competitorsList+' CompetitorResult competitorResultObj) - START');
        
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        /*List<Competitor__c> pharmacyCompetitorsList = new List<Competitor__c>();
        List<Competitor__c> dentalCompetitorsList = new List<Competitor__c>();
        List<Competitor__c> visionCompetitorsList = new List<Competitor__c>();
        List<Competitor__c> othersCompetitorsList = new List<Competitor__c>();
        
        competitorResultObj.pharmacyCompetitorList = new List<Competitor__c>();
        competitorResultObj.dentalCompetitorList = new List<Competitor__c>();
        competitorResultObj.visionCompetitorList = new List<Competitor__c>();
        competitorResultObj.otherproductsCompetitorList = new List<Competitor__c>();*/
        List<Competitor__c> pharmacyOptumRxRecords = new List<Competitor__c>();
        List<Competitor__c> pharmacyOtherRecords = new List<Competitor__c>();
        List<Competitor__c> dentalNationalRecords = new List<Competitor__c>();
        List<Competitor__c> dentalNonNationalRecords = new List<Competitor__c>();
        List<Competitor__c> visionNationalRecords = new List<Competitor__c>();
        List<Competitor__c> visionNonNationalRecords = new List<Competitor__c>();
        
        
        try {
            
        	for(Competitor__c competitorObj : competitorsList) {
            
                if(competitorObj != null && competitorObj.Comments__c == null) {
                	competitorObj.Comments__c = '';    
                }
                if(competitorObj != null && competitorObj.Competitorclassification__c != null && competitorObj.Competitorclassification__c.trim().length() > 0 &&
                  		competitorObj.CompetitorAccount__r.Name != null && competitorObj.CompetitorAccount__r.Name != null) {
                       
                    if(competitorObj.Competitorclassification__c.equalsIgnoreCase(uhgAccountConstants.PHARMACY)) {
                          
                        if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase(uhgAccountConstants.TOTAL)) {
                            competitorResultObj.pharmacyTotalCompetitorObj = competitorObj;
                        } else if(competitorObj.CompetitorAccount__r.Name == 'Optum Rx') {
                            //competitorResultObj.pharmacyCompetitorList.add(competitorObj);
                            pharmacyOptumRxRecords.add(competitorObj);
                        } else {
                            pharmacyOtherRecords.add(competitorObj);
                        }
                            
                        /*if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase(uhgAccountConstants.TOTAL)) {
                            competitorResultObj.isTotalActiveInPharmacy = true;
                            competitorResultObj.pharmacyTotalCompetitorObj = competitorObj;
                        } else if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase(uhgAccountConstants.NATIONAL_ACCOUNTS_RECORD)) {
                            competitorResultObj.isNationalAccountsActiveInPharmacy = true;
                            competitorResultObj.businessModelValueForNationalAccounts = competitorObj.BusinessModelforPharmacy__c;
                            competitorResultObj.pharmacyCompetitorList.add(competitorObj);
                        } else {
                            competitorResultObj.pharmacyCompetitorList.add(competitorObj);
                        }*/
                           
                    } else if(competitorObj.Competitorclassification__c.equalsIgnoreCase(uhgAccountConstants.DENTAL)) {
                          
                        if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase(uhgAccountConstants.TOTAL)) {
                            competitorResultObj.dentalTotalCompetitorObj = competitorObj;
                        } else if(competitorObj.CompetitorAccount__r.Name == 'National Accounts'){
                            //competitorResultObj.dentalCompetitorList.add(competitorObj);
                            dentalNationalRecords.add(competitorObj);
                        } else {
                            dentalNonNationalRecords.add(competitorObj);
                        }
                            
                        /*if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase(uhgAccountConstants.TOTAL)) {
							competitorResultObj.isTotalActiveInDental = true;
							competitorResultObj.dentalTotalCompetitorObj = competitorObj;
						} else if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase(uhgAccountConstants.NATIONAL_ACCOUNTS_RECORD)) {
                            competitorResultObj.isNationalAccountsActiveInDental = true;
                            competitorResultObj.fundingTypeValueForNationalAccountsInDental = competitorObj.FundingType__c;
                            competitorResultObj.dentalCompetitorList.add(competitorObj);
                        } else {
                            competitorResultObj.dentalCompetitorList.add(competitorObj);
                        }*/
                        
                    } else if(competitorObj.Competitorclassification__c.equalsIgnoreCase(uhgAccountConstants.VISION)) {
                           
                        if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase(uhgAccountConstants.TOTAL)) {
                            competitorResultObj.visionTotalCompetitorObj = competitorObj;
                        } else if(competitorObj.CompetitorAccount__r.Name == 'National Accounts') {
                            //competitorResultObj.visionCompetitorList.add(competitorObj);
                            visionNationalRecords.add(competitorObj);
                        } else {
                            visionNonNationalRecords.add(competitorObj);
                        }
                            
                        /*if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase(uhgAccountConstants.TOTAL)) {
                            competitorResultObj.isTotalActiveInVision = true;
                            competitorResultObj.visionTotalCompetitorObj = competitorObj;
                        } else if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase(uhgAccountConstants.NATIONAL_ACCOUNTS_RECORD)) {
                            competitorResultObj.isNationalAccountsActiveInVision = true;
                            competitorResultObj.fundingTypeValueForNationalAccountsInVision = competitorObj.FundingType__c;
                            competitorResultObj.visionCompetitorList.add(competitorObj);
                        } else {
                            competitorResultObj.visionCompetitorList.add(competitorObj);
                        }*/
                           
                    } else if(competitorObj.Competitorclassification__c.equalsIgnoreCase(uhgAccountConstants.OTHERS)) {
                         
                        if(competitorObj.Type_of_Products_Services_Provided__c == null) {
                       		competitorObj.Type_of_Products_Services_Provided__c = '';
                        }
						competitorResultObj.otherproductsCompetitorList.add(competitorObj);
                        competitorResultObj.OtherProductsCompetitorsListBackup.add(competitorObj);
                        
                        /*if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase(uhgAccountConstants.NATIONAL_ACCOUNTS_RECORD)) {
                            competitorResultObj.isNationalAccountsActiveInOthers = true;
                            competitorResultObj.otherproductsCompetitorList.add(competitorObj);    
                        } else {
                            competitorResultObj.otherproductsCompetitorList.add(competitorObj);
                        }*/
                        
                    } else if(competitorObj.Competitorclassification__c.equalsIgnoreCase(uhgAccountConstants.MEDICAL)) {
                        if(competitorObj.CompetitorAccount__r.Name != null && competitorObj.CompetitorAccount__r.Name.trim().length() > 0 && 
                           		competitorObj.CompetitorAccount__r.Name != System.Label.TOTAL) { 
                       		competitorResultObj.medicalCompetitorList.add(competitorObj);
                       }
                    }
                }
        	}
            
             /* Logic written to sort records based on Optum RX, National Accounts - START */
            
            if(pharmacyOptumRxRecords != null && pharmacyOptumRxRecords.size() > 0) {
                competitorResultObj.pharmacyCompetitorList.addAll(pharmacyOptumRxRecords);
            }
            if(pharmacyOtherRecords != null && pharmacyOtherRecords.size() > 0) {
                competitorResultObj.pharmacyCompetitorList.addAll(pharmacyOtherRecords);
            }
            
            if(dentalNationalRecords != null && dentalNationalRecords.size() > 0) {
                competitorResultObj.dentalCompetitorList.addAll(dentalNationalRecords);
            }
            if(dentalNonNationalRecords != null && dentalNonNationalRecords.size() > 0) {
                competitorResultObj.dentalCompetitorList.addAll(dentalNonNationalRecords);
            }
            
            if(visionNationalRecords != null && visionNationalRecords.size() > 0) {
                competitorResultObj.visionCompetitorList.addAll(visionNationalRecords);
            }
            if(visionNonNationalRecords != null && visionNonNationalRecords.size() > 0) {
                competitorResultObj.visionCompetitorList.addAll(visionNonNationalRecords);
            }
            
            /* Logic written to sort records based on Optum RX, National Accounts - END */
            
        } catch(Exception e) {
            System.debug('Exception occurred in returnCMAccountCompetitorsData method - '+e);
            throw e;
        }
        
        /*competitorResultObj.pharmacyCompetitorList.addAll(pharmacyCompetitorsList);
        competitorResultObj.dentalCompetitorList.addAll(dentalCompetitorsList);
        competitorResultObj.visionCompetitorList.addAll(visionCompetitorsList);
        competitorResultObj.otherproductsCompetitorList.addAll(othersCompetitorsList);*/
        
        System.debug('returnCMAccountCompetitorsData(List<Competitor__c>competitorsList, CompetitorResult competitorResultObj) - END');
        
        
        return competitorResultObj;
    }
    
    
    public static CompetitorResult returnIncumbentRecords(List<Competitor__c> competitorsList, CompetitorResult competitorResultObj) {
        
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        
        try {
            
            Decimal largestRetirees = 0;                
            Decimal secLargestRetirees = 0;
            String incumbentPrimary = null;
            String incumbentSecondary = null;
            Id incumbentPrimaryRowId = null;                
            Id incumbentSecondaryRowId = null;
            
            for(Competitor__c competitorObj : competitorsList) {
                
                List<string> sortList = new List<string>();
                
                if(!competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase(uhgAccountConstants.TOTAL) && competitorObj.NumberOfMembersHeld__c != null) { 
                    
                    if(competitorObj.NumberOfMembersHeld__c > 0 && competitorObj.NumberOfMembersHeld__c >= largestRetirees) {
                        
                        if(incumbentPrimary != null) {
                            sortList.add(incumbentPrimary.toUpperCase());
                        }
                        sortList.add((competitorObj.CompetitorAccount__r.Name).toUpperCase());                            
                        if(competitorObj.NumberOfMembersHeld__c == largestRetirees && incumbentPrimary != null && 
                           compareNames(sortList,incumbentPrimary.toUpperCase())) {
                               secLargestRetirees = largestRetirees;
                               incumbentSecondary = incumbentPrimary;
                               incumbentSecondaryRowId = incumbentPrimaryRowId;
                               largestRetirees = competitorObj.NumberOfMembersHeld__c;
                               incumbentPrimary = competitorObj.CompetitorAccount__r.Name;
                               incumbentPrimaryRowId = competitorObj.CompetitorAccount__c;
                           } else if(competitorObj.NumberOfMembersHeld__c > largestRetirees) {
                               secLargestRetirees = largestRetirees;
                               incumbentSecondary = incumbentPrimary;
                               incumbentSecondaryRowId = incumbentPrimaryRowId;
                               largestRetirees = competitorObj.NumberOfMembersHeld__c;
                               incumbentPrimary = competitorObj.CompetitorAccount__r.Name;
                               incumbentPrimaryRowId = competitorObj.CompetitorAccount__c;
                           } else if(competitorObj.NumberOfMembersHeld__c >= secLargestRetirees){
                               sortList = new List<string>();
                               if(incumbentSecondary != null){
                                   sortList.add(incumbentSecondary.toUpperCase());
                               } 
                               sortList.add((competitorObj.CompetitorAccount__r.Name).toUpperCase());
                               if(competitorObj.NumberOfMembersHeld__c == secLargestRetirees && incumbentSecondary != null && compareNames(sortList,incumbentSecondary.toUpperCase())){
                                   secLargestRetirees = competitorObj.NumberOfMembersHeld__c;
                                   incumbentSecondary = competitorObj.CompetitorAccount__r.Name;                                
                                   incumbentSecondaryRowId = competitorObj.CompetitorAccount__c;
                               }else if(competitorObj.NumberOfMembersHeld__c > secLargestRetirees){
                                   secLargestRetirees = competitorObj.NumberOfMembersHeld__c;
                                   incumbentSecondary = competitorObj.CompetitorAccount__r.Name;
                                   incumbentSecondaryRowId = competitorObj.CompetitorAccount__c;
                               }					
                            }                           
                    } else if(competitorObj.NumberOfMembersHeld__c > 0 && competitorObj.NumberOfMembersHeld__c >= secLargestRetirees) {                            
                        if(incumbentSecondary != null){
                            sortList.add(incumbentSecondary.toUpperCase());
                        } 
                        sortList.add((competitorObj.CompetitorAccount__r.Name).toUpperCase());
                        if(competitorObj.NumberOfMembersHeld__c == secLargestRetirees && incumbentSecondary != null && compareNames(sortList,incumbentSecondary.toUpperCase())){
                            secLargestRetirees = competitorObj.NumberOfMembersHeld__c;
                            incumbentSecondary = competitorObj.CompetitorAccount__r.Name;                                
                            incumbentSecondaryRowId = competitorObj.CompetitorAccount__c;
                        }else if(competitorObj.NumberOfMembersHeld__c > secLargestRetirees){
                            secLargestRetirees = competitorObj.NumberOfMembersHeld__c;
                            incumbentSecondary = competitorObj.CompetitorAccount__r.Name;
                            incumbentSecondaryRowId = competitorObj.CompetitorAccount__c;
                        }						                                                        
                    }
                }
            }
            
            competitorResultObj.incumbentPrimaryId = incumbentPrimaryRowId;
            competitorResultObj.incumbentSecondaryId = incumbentSecondaryRowId;
            
            System.debug('Incumbent Primary Name-'+incumbentPrimary+', Incumbent Primary Id-'+incumbentPrimaryRowId+
                         ', Incumbent Secondary Name-'+incumbentSecondary+', Incumbent Secondary Id-'+incumbentSecondaryRowId);
            
        } catch(Exception e) {
          	System.debug('Exception occurred in the returnIncumbentRecords() method -> '+e);  
        }
        
        return competitorResultObj;
    }
    
    
    public static Boolean compareNames(List<String> dataList, String Name){
        System.debug('Before Sorting '+dataList.get(0)+','+dataList.get(1));
        Boolean retVal = false;
        dataList.sort();
        String sortedName = dataList.get(0);
        System.debug('After Sorting '+dataList.get(0)+','+dataList.get(1));
        if(sortedName != Name){
            retVal = true;
        }
        return retVal;
    }
    
    /******************************************************************
    * 
     Purpose: Returns the CD Competitors data of the associated Account.
     Parameters: accountId, competitorsList, competitorResultObj
     Returns: CompetitorResult(Pojo of Competitors details)
     Throws [Exceptions]: [optional] 
     
    *******************************************************************
    */
    public static CompetitorResult returnCDAccountCompetitorsData(List<Competitor__c>competitorsList, CompetitorResult competitorResultObj) {
        
		System.debug('returnCDAccountCompetitorsData(List<Competitor__c>'+competitorsList+'CompetitorResult competitorResultObj) - START');
        
		UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        
        competitorResultObj.pharmacyCompetitorList = new List<Competitor__c>();
        competitorResultObj.dentalCompetitorList = new List<Competitor__c>();
        competitorResultObj.visionCompetitorList = new List<Competitor__c>();
        competitorResultObj.otherproductsCompetitorList = new List<Competitor__c>();
        competitorResultObj.medicalCompetitorList = new List<Competitor__c>();
        
        List<Competitor__c> pharmacyOptumRxRecords = new List<Competitor__c>();
        List<Competitor__c> pharmacyOtherRecords = new List<Competitor__c>();
        List<Competitor__c> dentalNationalRecords = new List<Competitor__c>();
        List<Competitor__c> dentalNonNationalRecords = new List<Competitor__c>();
        List<Competitor__c> visionNationalRecords = new List<Competitor__c>();
        List<Competitor__c> visionNonNationalRecords = new List<Competitor__c>();
        
        for(Competitor__c competitorObj : competitorsList) {
             
            if(competitorObj != null && competitorObj.Comments__c == null) {
                	competitorObj.Comments__c = '';    
            }
            if(competitorObj != null && competitorObj.Competitorclassification__c != null && competitorObj.Competitorclassification__c.trim().length() > 0 &&
                  		competitorObj.CompetitorAccount__r.Name != null && competitorObj.CompetitorAccount__r.Name != null) {
                   
                   if(competitorObj.Competitorclassification__c.equalsIgnoreCase(uhgAccountConstants.PHARMACY)) {
                       
                      if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase(uhgAccountConstants.TOTAL)) {
                           //competitorResultObj.isTotalActiveInPharmacy = true;
                           competitorResultObj.pharmacyTotalCompetitorObj = competitorObj;
                       } else if(competitorObj.CompetitorAccount__r.Name == 'Optum Rx') {
                            //competitorResultObj.pharmacyCompetitorList.add(competitorObj);
                            pharmacyOptumRxRecords.add(competitorObj);
                        } else {
                            pharmacyOtherRecords.add(competitorObj);
                        }
                       
                       if(competitorObj.PrimaryIncumbent__c != null && competitorObj.PrimaryIncumbent__c) {
                           competitorResultObj.incumbentPrimaryPharmacy = competitorObj.CompetitorAccount__r.Name; 
                           competitorResultObj.incumbentPrimaryPharmacyId = competitorObj.CompetitorAccount__c;
                       } 
                       if(competitorObj.SecondaryIncumbent__c != null && competitorObj.SecondaryIncumbent__c) {
                           competitorResultObj.incumbentSecondaryPharmacy = competitorObj.CompetitorAccount__r.Name;
                           competitorResultObj.incumbentSecondaryPharmacyId = competitorObj.CompetitorAccount__c;
                       }
                          
                   } else if(competitorObj.Competitorclassification__c.equalsIgnoreCase(uhgAccountConstants.DENTAL)) {
                       
                  		if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase(uhgAccountConstants.TOTAL)) {
                        	//competitorResultObj.isTotalActiveInDental = true;
                            competitorResultObj.dentalTotalCompetitorObj = competitorObj;	
                       	} else if(competitorObj.CompetitorAccount__r.Name == 'National Accounts'){
                            //competitorResultObj.dentalCompetitorList.add(competitorObj);
                            dentalNationalRecords.add(competitorObj);
                        } else {
                            dentalNonNationalRecords.add(competitorObj);
                        }
                       
                   		if(competitorObj.PrimaryIncumbent__c != null && competitorObj.PrimaryIncumbent__c) {
                           competitorResultObj.incumbentPrimaryDental = competitorObj.CompetitorAccount__r.Name;
                            competitorResultObj.incumbentPrimaryDentalId = competitorObj.CompetitorAccount__c;
                        } 
                        if(competitorObj.SecondaryIncumbent__c != null && competitorObj.SecondaryIncumbent__c) {
                            competitorResultObj.incumbentSecondaryDental = competitorObj.CompetitorAccount__r.Name;
                            competitorResultObj.incumbentSecondaryDentalId = competitorObj.CompetitorAccount__c;
                        }

                   } else if(competitorObj.Competitorclassification__c.equalsIgnoreCase(uhgAccountConstants.VISION)) {
                       
                   		if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase(uhgAccountConstants.TOTAL)) {
                        	//competitorResultObj.isTotalActiveInVision = true;
                            competitorResultObj.visionTotalCompetitorObj = competitorObj;	
                       	} else if(competitorObj.CompetitorAccount__r.Name == 'National Accounts') {
                            //competitorResultObj.visionCompetitorList.add(competitorObj);
                            visionNationalRecords.add(competitorObj);
                        } else {
                            visionNonNationalRecords.add(competitorObj);
                        }
                       
                        if(competitorObj.PrimaryIncumbent__c != null && competitorObj.PrimaryIncumbent__c) {
                           competitorResultObj.incumbentPrimaryVision = competitorObj.CompetitorAccount__r.Name;
                           competitorResultObj.incumbentPrimaryVisionId = competitorObj.CompetitorAccount__c;
                        } 
                        if(competitorObj.SecondaryIncumbent__c != null && competitorObj.SecondaryIncumbent__c) {
                            competitorResultObj.incumbentSecondaryVision = competitorObj.CompetitorAccount__r.Name;
                            competitorResultObj.incumbentSecondaryVisionId = competitorObj.CompetitorAccount__c;
                        }
                       
                   } else if(competitorObj.Competitorclassification__c.equalsIgnoreCase(uhgAccountConstants.OTHERS)) {
                       
                        if(competitorObj.Type_of_Products_Services_Provided__c == null) {
                       		competitorObj.Type_of_Products_Services_Provided__c = '';
                        }
                       System.debug('competitorObj before ADD '+competitorObj);
                   	   competitorResultObj.otherproductsCompetitorList.add(competitorObj);
                       competitorResultObj.OtherProductsCompetitorsListBackup.add(competitorObj);
                       
                   } else if(competitorObj.Competitorclassification__c.equalsIgnoreCase(uhgAccountConstants.MEDICAL)) {
                       
                       if(competitorObj.CompetitorAccount__r.Name != null && competitorObj.CompetitorAccount__r.Name.trim().length() > 0 && 
                          		competitorObj.CompetitorAccount__r.Name != System.Label.TOTAL) { 
                       		competitorResultObj.medicalCompetitorList.add(competitorObj);
                       }
                   }
               }
		}
        
        /* Logic written to sort records based on Optum RX, National Accounts - START */
            
            if(pharmacyOptumRxRecords != null && pharmacyOptumRxRecords.size() > 0) {
                competitorResultObj.pharmacyCompetitorList.addAll(pharmacyOptumRxRecords);
            }
            if(pharmacyOtherRecords != null && pharmacyOtherRecords.size() > 0) {
                competitorResultObj.pharmacyCompetitorList.addAll(pharmacyOtherRecords);
            }
            
            if(dentalNationalRecords != null && dentalNationalRecords.size() > 0) {
                competitorResultObj.dentalCompetitorList.addAll(dentalNationalRecords);
            }
            if(dentalNonNationalRecords != null && dentalNonNationalRecords.size() > 0) {
                competitorResultObj.dentalCompetitorList.addAll(dentalNonNationalRecords);
            }
            
            if(visionNationalRecords != null && visionNationalRecords.size() > 0) {
                competitorResultObj.visionCompetitorList.addAll(visionNationalRecords);
            }
            if(visionNonNationalRecords != null && visionNonNationalRecords.size() > 0) {
                competitorResultObj.visionCompetitorList.addAll(visionNonNationalRecords);
            }
            
            /* Logic written to sort records based on Optum RX, National Accounts - END */
        
		/*if(competitorResultObj != null) {
            if(isButtonsEnabled != null && isButtonsEnabled) {
            	insertTotalRecords(competitorResultObj, accountId, accountType, operation, isButtonsEnabled);
            }
        }*/
        
        System.debug('returnCDAccountCompetitorsData(List<Competitor__c>competitorsList, CompetitorResult competitorResultObj) - END');
		
		return competitorResultObj;  
    }
    
    
    /*public static Id returnNationalAccountsOrTotalAccountId(String accountName, Id nationalAccountsOrTotalAccountId) {
       
        try {
            
            List<Account> accountList = Database.query('Select Id from Account where Name=:accountName ORDER BY CreatedDate Asc LIMIT 1');
            if(accountList != null && accountList.size() > 0) {
                nationalAccountsOrTotalAccountId = accountList[0].Id;           
            }
            
        } catch(Exception e) {
            System.debug('Error occurred while querying the Account Id of National Accounts or Total Account record - '+e);
        }
        
        return nationalAccountsOrTotalAccountId;
    }*/
    
    
    /******************************************************************
    * 
     Purpose: Inserts the National Accounts records into the Competitor Object in SF.
     Parameters: competitorResultObj, accountId
     Returns: CompetitorResult(Pojo of Competitors details)
     Throws [Exceptions]: [optional] 
     
    *******************************************************************
    *
    
    public static List<Competitor__c> getNationalAccountsRecordsData(CompetitorResult competitorResultObj, Id accountId, List<Competitor__c> competitorsList) {
        
        System.debug('getNationalAccountsRecordsData(CompetitorResult competitorResultObj, Id accountId, List<Competitor__c> competitorsList) - START');
        
        System.debug('Input Parameters -> isNationalAccountsActiveInPharmacy-'+competitorResultObj.isNationalAccountsActiveInPharmacy+
                     ', isNationalAccountsActiveInDental-'+competitorResultObj.isNationalAccountsActiveInDental+
                     ', isNationalAccountsActiveInVision-'+competitorResultObj.isNationalAccountsActiveInVision+
                     ', isNationalAccountsActiveInOthers-'+competitorResultObj.isNationalAccountsActiveInOthers);
        
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        Id nationalAccountsAccountId = null;
        List<Competitor__c> nationalAccountsCompetotorsListToBeInserted = new List<Competitor__c>();
        
        try {
            
           //Check whether the National Accounts record is available in the Competitor object associated to Pharmacy.
           if(competitorResultObj.isNationalAccountsActiveInPharmacy == null ||
				(competitorResultObj.isNationalAccountsActiveInPharmacy != null && 
                	competitorResultObj.isNationalAccountsActiveInPharmacy == false)) {
                
				if(nationalAccountsAccountId == null) {
					nationalAccountsAccountId = returnNationalAccountsOrTotalAccountId(uhgAccountConstants.NATIONAL_ACCOUNTS_RECORD, nationalAccountsAccountId);
               	}
               	Competitor__c competitorObj = returnCompetitorDataObject(accountId, 'Account Competitor', uhgAccountConstants.PHARMACY, 
                                                                         0, 0, nationalAccountsAccountId, uhgAccountConstants.NATIONAL_ACCOUNTS_COMPETITOR_GROUP);
                if(competitorObj != null) {
					nationalAccountsCompetotorsListToBeInserted.add(competitorObj);
                }
            }
            
           //Check whether the National Accounts record is available in the Competitor object associated to Dental.
           if(competitorResultObj.isNationalAccountsActiveInDental == null ||
				(competitorResultObj.isNationalAccountsActiveInDental != null && 
                	competitorResultObj.isNationalAccountsActiveInDental == false)) {
                        
                if(nationalAccountsAccountId == null) {
					nationalAccountsAccountId = returnNationalAccountsOrTotalAccountId(uhgAccountConstants.NATIONAL_ACCOUNTS_RECORD, nationalAccountsAccountId);
               	}
               	Competitor__c competitorObj = returnCompetitorDataObject(accountId, 'Account Competitor', uhgAccountConstants.DENTAL, 
                                                                         0, 0, nationalAccountsAccountId, uhgAccountConstants.NATIONAL_ACCOUNTS_COMPETITOR_GROUP);
                if(competitorObj != null) {
					nationalAccountsCompetotorsListToBeInserted.add(competitorObj);
                }
            }
            
           //Check whether the National Accounts record is available in the Competitor object associated to Vision.
           if(competitorResultObj.isNationalAccountsActiveInVision == null ||
				(competitorResultObj.isNationalAccountsActiveInVision != null && 
                	competitorResultObj.isNationalAccountsActiveInVision == false)) {
                
                if(nationalAccountsAccountId == null) {
					nationalAccountsAccountId = returnNationalAccountsOrTotalAccountId(uhgAccountConstants.NATIONAL_ACCOUNTS_RECORD, nationalAccountsAccountId);
               	}
               	Competitor__c competitorObj = returnCompetitorDataObject(accountId, 'Account Competitor', uhgAccountConstants.VISION, 
                                                                         0, 0, nationalAccountsAccountId, uhgAccountConstants.NATIONAL_ACCOUNTS_COMPETITOR_GROUP);
                if(competitorObj != null) {
					nationalAccountsCompetotorsListToBeInserted.add(competitorObj);
                }
            }
            
            ////Check whether the National Accounts record is available in the Competitor object associated to Other Product/Services.
           if(competitorResultObj.isNationalAccountsActiveInOthers == null ||
				(competitorResultObj.isNationalAccountsActiveInOthers != null && 
                	competitorResultObj.isNationalAccountsActiveInOthers == false)) {
                
                
                if(nationalAccountsAccountId == null) {
					nationalAccountsAccountId = returnNationalAccountsOrTotalAccountId(uhgAccountConstants.NATIONAL_ACCOUNTS_RECORD, nationalAccountsAccountId);
               	}
               	Competitor__c competitorObj = returnCompetitorDataObject(accountId, 'Account Competitor', uhgAccountConstants.OTHERS, 
                                                                         0, 0, nationalAccountsAccountId, uhgAccountConstants.NATIONAL_ACCOUNTS_COMPETITOR_GROUP);
                if(competitorObj != null) {
                    competitorObj.Type_of_Products_Services_Provided__c = '';
					nationalAccountsCompetotorsListToBeInserted.add(competitorObj);
                }
                
            }
            
           if(nationalAccountsCompetotorsListToBeInserted != null && nationalAccountsCompetotorsListToBeInserted.size() > 0) {
           		competitorsList.addAll(nationalAccountsCompetotorsListToBeInserted);     
           }
                    
        } catch(Exception e) {
        	System.debug('Exception occurred in insertNationalAccountsRecord() method while inserting the '+
                         	'National Accounts record in the Competitor object in SF - '+e);    
            throw e;
        }
        
        System.debug('National Accounts Competitors List to be inserted  -> '+ nationalAccountsCompetotorsListToBeInserted);
        
        System.debug('getNationalAccountsRecordsData(CompetitorResult competitorResultObj, Id accountId, List<Competitor__c> competitorsList) - END');
        
        return competitorsList;
    }
    
    
    /******************************************************************
    * 
     Purpose: Returns the Total records.
     Parameters: competitorResultObj, accountId
     Returns: CompetitorsList
     Throws [Exceptions]: [optional] 
     
    *******************************************************************
    *
    
    public static List<Competitor__c> getTotalRecordsData(CompetitorResult competitorResultObj, Id accountId, List<Competitor__c> competitorsList) {
        
        System.debug('getTotalRecordsData(CompetitorResult competitorResultObj, Id accountId, List<Competitor__c> competitorsList) - START');
        
        System.debug('Input Parameters -> isTotalActiveInPharmacy-'+competitorResultObj.isTotalActiveInPharmacy+
                     ', isTotalActiveInDental-'+competitorResultObj.isTotalActiveInDental+
                     ', isTotalActiveInVision-'+competitorResultObj.isTotalActiveInVision);
        
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        List<Competitor__c> totalCompetotorsListToBeInserted = new List<Competitor__c>();
        Id totalAccountId = null;
        
        try {
            
           //Check whether the Total record is available in the Competitor object associated to Pharmacy in SF.
           if(competitorResultObj.isTotalActiveInPharmacy == null || (competitorResultObj.isTotalActiveInPharmacy != null && 
                	competitorResultObj.isTotalActiveInPharmacy == false)) {
                        
				if(totalAccountId == null) {
					totalAccountId = returnNationalAccountsOrTotalAccountId(uhgAccountConstants.TOTAL, totalAccountId);
				}
				Competitor__c competitorObj = returnCompetitorDataObject(accountId, 'Account Competitor', uhgAccountConstants.PHARMACY, 
                                                                         0, 0, totalAccountId, '');
				if(competitorObj != null) {
                    totalCompetotorsListToBeInserted.add(competitorObj);
                }                
            }
            
           //Check whether the Total record is available in the Competitor object associated to Dental in SF.
           if(competitorResultObj.isTotalActiveInDental == null || (competitorResultObj.isTotalActiveInDental != null && 
                	competitorResultObj.isTotalActiveInDental == false)) {
                        
                if(totalAccountId == null) {
					totalAccountId = returnNationalAccountsOrTotalAccountId(uhgAccountConstants.TOTAL, totalAccountId);
				}
                Competitor__c competitorObj = returnCompetitorDataObject(accountId, 'Account Competitor', uhgAccountConstants.DENTAL, 
                                                                         0, 0, totalAccountId, '');
				if(competitorObj != null) {
                    totalCompetotorsListToBeInserted.add(competitorObj);
                }
            }
            
           //Check whether the Total record is available in the Competitor object associated to Vision in SF.
           if(competitorResultObj.isTotalActiveInVision == null || (competitorResultObj.isTotalActiveInVision != null && 
					competitorResultObj.isTotalActiveInVision == false)) {
                        
				if(totalAccountId == null) {
					totalAccountId = returnNationalAccountsOrTotalAccountId(uhgAccountConstants.TOTAL, totalAccountId);
				}
           		Competitor__c competitorObj = returnCompetitorDataObject(accountId, 'Account Competitor', uhgAccountConstants.VISION, 
                                                                         0, 0, totalAccountId, '');
                if(competitorObj != null) {
                    totalCompetotorsListToBeInserted.add(competitorObj);
                }
                        
           }
            
            if(totalCompetotorsListToBeInserted != null && totalCompetotorsListToBeInserted.size() > 0) {
           		competitorsList.addAll(totalCompetotorsListToBeInserted);     
           }
                    
        } catch(Exception e) {
        	System.debug('Exception occurred in getTotalRecordsData() method while inserting the Total record in the Competitor object in SF - '+e);  
            throw e;
        }
        
        System.debug('Total Competitors List to be inserted -> '+totalCompetotorsListToBeInserted);
        
        System.debug('getTotalRecordsData(CompetitorResult competitorResultObj, Id accountId, List<Competitor__c> competitorsList) - END');
        
        return competitorsList;
       
    }*/
    
    
    /*
     *  The below method builds the Competitor object for the National Accounts & Total records
     *  which is used to insert these data as records in Competitor only in case if these records are not available in SF.
     *

    public static Competitor__c returnCompetitorDataObject(Id accountId, String competitorType, String competitorClassificationValue,
			Integer noOfMembers, Double OfMemebersHeld, Id competitorAccountId, String competitorGroup) {
      
		UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
   		Competitor__c competitorObj = new Competitor__c();
         
		if(competitorAccountId != null) {
        	competitorObj.CompetitorAccount__c = competitorAccountId;            
		}
        competitorObj.Account__c = accountId;
        competitorObj.Type__c = competitorType;
		competitorObj.Competitorclassification__c = competitorClassificationValue;
        competitorObj.NumberOfMembersHeld__c = noOfMembers;
        competitorObj.ofMembersHeld__c = OfMemebersHeld;
        competitorObj.Comments__c = '';
               
        return competitorObj;
    }*/
    
    
   /******************************************************************
    * 
     Purpose: Upserts the Competitors data in SF.
     Parameters: BusinessModelValue, FundingTypeDentalValue, FundingTypeVisionValue, pharmacyCompetitorsListToBeUpserted,
				 dentalCompetitorsListToBeUpserted, visionCompetitorsListToBeUpserted, otherProductsCompetitorListToBeUpserted, pharmacyTotalRecordsData,
				 dentalTotalRecordsData, visionTotalRecordsData
     Returns: 
     Throws [Exceptions]: [optional] 
     
    *******************************************************************
    */
    @AuraEnabled
    public static void upsertAccountCompetitorRecords(String BusinessModelValue, String FundingTypeDentalValue, String FundingTypeVisionValue, 
						List<Competitor__c> competitorsListToBeUpserted, Id accountId, List<Competitor__c> competitorsListToBeRemoved) {

		System.debug('upsertAccountCompetitorRecords - START');
                            
		System.debug('Input Parameters -> BusinessModelValue-'+BusinessModelValue+', FundingTypeDentalValue-'+FundingTypeDentalValue+', FundingTypeVisionValue-'+
				FundingTypeVisionValue+' and competitorsListToBeUpserted-'+competitorsListToBeUpserted+', competitorsListToBeRemoved-'+competitorsListToBeRemoved);
        
                         
		try {
             
            List<Competitor__c> listToBeUpserted = new List<Competitor__c>();
            
            if(competitorsListToBeRemoved != null && competitorsListToBeRemoved.size() > 0) {
               
                delete competitorsListToBeRemoved;
                System.debug('Record deleted successfully in upsertAccountCompetitorRecords() method.');
            }
            
            /* OtherProductsCompetitorsList to be inserted logic - START */
            /*if(deleteOtherProductsCompetitorsList != null && deleteOtherProductsCompetitorsList.size() > 0) {
               
                delete deleteOtherProductsCompetitorsList;
                System.debug('Other Product Competitors Record deleted successfully in upsertAccountCompetitorRecords() method.');
            }*/
            
            /* OtherProductsCompetitorsList to be inserted logic - END */
                
            if(competitorsListToBeUpserted != null && competitorsListToBeUpserted.size() > 0) {
                //List<Competitor__c> competitorsListData = new List<Competitor__c>();
                for(Competitor__c obj : competitorsListToBeUpserted) {
                    System.debug('Obj in LOOP \n'+obj);
                    if(obj != null){
                     	listToBeUpserted.add((Competitor__c)obj);
                    }
                }
            }            
            
			if(listToBeUpserted != null && listToBeUpserted.size() > 0) {
            
                Database.UpsertResult[] dbUpsertResultList = Database.upsert(listToBeUpserted, false);
                    
                if(dbUpsertResultList != null && dbUpsertResultList.size() > 0) {
                    // Iterate through each returned result
                    String errorMsg = '';
                    for (Database.UpsertResult cmUpdtResult : dbUpsertResultList) {
                        if(!cmUpdtResult.isSuccess()) {
                            // Operation failed, so get all errors  
                            for(Database.Error err : cmUpdtResult.getErrors()) {
                                errorMsg = errorMsg+' '+err.getMessage();
                                System.debug('The following error has occurred.');                    
                                System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                System.debug('Fields that affected this error: ' + err.getFields());
                            }
                            throw new MyException(errorMsg);
                        }
                    }
                }
            }
            
            if(accountId != null) {
                
                Account accObj = new Account();
                accObj.Id = accountId;
                accObj.PharmacyBusinessModel__c = BusinessModelValue;
                accObj.DentalFundingType__c = FundingTypeDentalValue;
                accObj.VisionFundingType__c = FundingTypeVisionValue;
                
                update accObj;
            }
            
            
        } catch(Exception e) {
            System.debug('Error occurred in upsertAccountCompetitorRecords() method while upserting the details' +
                         	' into Competitors from SF -> ' + e.getMessage());
            system.debug(e.getLineNumber());
            throw new AuraHandledException('Exception occurred ---- '+e.getMessage());
        }
        
		System.debug('upsertAccountCompetitorRecords - END');
    }
	
	
    /******************************************************************
    * 
     Purpose: Deletes the Competitors in SF.
     Parameters: dropDownValue, competitorDataToBeRemoved, competitorsListToBeUpserted, competitorsTotalListToBeUpserted
     Returns: 
     Throws [Exceptions]: [optional] 
     
    *******************************************************************
    */
    @AuraEnabled
    public static void deleteAccountCompetitorRecord(String accountType, List<Competitor__c> competitorsListToBeRemoved, List<Competitor__c> comptrsList, 
                                                     Competitor__c compTotalDataObj) {
        
        System.debug('deleteAccountCompetitorRecord(Id accountCompetitorId) - START');
        
        System.debug('Input Parameters -> accountType-'+accountType+ ', CompetitorsListToBeRemoved-'+competitorsListToBeRemoved+', compTotalDataObj-'+compTotalDataObj);
                                                              
        try {
            if(schema.sobjecttype.Competitor__c.isaccessible() && schema.sobjecttype.Competitor__c.isDeletable()) {
                
                if(competitorsListToBeRemoved != null && competitorsListToBeRemoved.size() > 0) {
                    
                    accountType = accountType != null ? accountType.trim() : '';
                    
                    delete  competitorsListToBeRemoved;
                    System.debug('Record deleted successfully.');
                    
                    if(compTotalDataObj != null) {
                        comptrsList.add(compTotalDataObj);    
                    }
                    if(comptrsList != null && comptrsList.size() > 0) {                                                
                        upsertAccountCompetitorRecords('', '', '', comptrsList, null, null);                       
                    }
                }
                
            } else {
                throw new MyException('No Access for this User to delete the Competitor Record.');  
            }
                                              
        } catch(Exception e){
            System.debug('Error occurred in deleteAccountCompetitorRecord while deleting the details of '+
                         	'Competitor from SF -> ' + e.getMessage()+'-'+e.getLineNumber());
            throw new AuraHandledException('Exception occurred ---- '+e.getMessage());
        }
        
        System.debug('deleteAccountCompetitorRecord(Id accountCompetitorId) - END');
    }
  	
     @AuraEnabled
    public static CompetitorDataExportWrapper getTemplateInXML(String accountId,String accountType){                       
        CompetitorDataExportWrapper competitorDataExportWrapper = new  CompetitorDataExportWrapper();
        String queryString;
        String objectName  = ''; 
        String templateName='';
        if(accountType==System.Label.Client_Management){
           templateName='CM_CompetitiveLandscape_Template'; 
        }else if(accountType==System.Label.Client_Development){
            templateName='CD_CompetitiveLandscape_Template';
        }
        StaticResource sr = [SELECT Id, Body, BodyLength,Name FROM StaticResource where Name =:templateName];
        String xmlBodyString = sr.body.toString();
        
        
        
        Pattern p = Pattern.compile(IConstantsTemplate.TEMPLATE_PREFIX_SUFFIX_REG_EXPRESSION);
        
        Matcher m = p.matcher(xmlBodyString);
        
        System.debug('matcher '+m);
        
        Map<String,Set<String>> objectItagesMap = new Map<String,Set<String>>();
        
        while (m.find()) {
            String itag = m.group();    
            
            system.debug('before replace prefix : '+itag);
            itag = itag.replaceAll(IConstantsTemplate.ITAG_PREFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            itag = itag.replaceAll(IConstantsTemplate.ITAG_SUFFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            //System.debug('itag '+itag);
            System.debug('itag value '+itag);
            Integer dotFirstIndex = itag.indexOf('.');
            objectName = itag.substring(0,dotFirstIndex);
            String fieldName = itag.substring(dotFirstIndex+1);
            
            // System.debug('iTagFormatField '+iTagFormatField);
            
            if(objectItagesMap.containsKey(objectName)){
                Set<String> itagSet =  objectItagesMap.get(objectName);                    
                itagSet.add(fieldName);
                objectItagesMap.put(objectName, itagSet);
                
            }else{
                Set<String> itagSet = new Set<String>();
                itagSet.add(fieldName);      
                System.debug('objectName  -> '+objectName);                     
                objectItagesMap.put(objectName, itagSet);
            }                         
            
        }  
        
        queryString='SELECT Id,Account__c,Account__r.Name,CompetitorAccount__r.Name,CompetitorAccount__c,NumberOfMembersHeld__c,ofMembersHeld__c,Comments__c,BusinessModelforPharmacy__c,FundingType__c,Competitorclassification__c,PrimaryIncumbent__c,SecondaryIncumbent__c,AssociatedMedicalCarrier__c, Type_of_Products_Services_Provided__c, Coalition_if_applicable__c, Hub_vendor__c, Type_of_File__c, Special_MyUhc_com_Customization_column__c FROM Competitor__c where Account__c=:accountId and CompetitorAccount__r.Name!= \'UHC-Optum\'  and Type__c=\'Account Competitor\'and ((Competitorclassification__c!=\'Medical\' and Competitorclassification__c!=\'Other\') or (Competitorclassification__c=\'Other\' and OtherPrdctCompetitorRecordTobeDeleted__c=false and Inactive_Competitor_Status__c = false)) ORDER BY Competitorclassification__c, CompetitorAccount__r.Name Asc';
        List<Competitor__c> competitorData = Database.query(queryString);
        
        List<String> nonOtherProductList=new List<String>{'Dental','Medical','Pharmacy','Vision'};
        List<String> otherProductPicklist=getselectOptions('Competitor__c','Type_of_Products_Services_Provided__c');
        
        if(otherProductPicklist!=null && !otherProductPicklist.isEmpty()){
            for(String eachNonOtherProduct:nonOtherProductList){
                Integer nonOtherProductIndex= otherProductPicklist.indexOf(eachNonOtherProduct);
                if(nonOtherProductIndex != -1){
                    otherProductPicklist.remove(nonOtherProductIndex);
                }
                
            }
        }

        competitorDataExportWrapper.xmlString = xmlBodyString;
        competitorDataExportWrapper.competitorData = competitorData;
        competitorDataExportWrapper.objectItags = objectItagesMap;
        competitorDataExportWrapper.otherProductPicklist=otherProductPicklist;
        
        return competitorDataExportWrapper;
    }
    
     public static List < String > getselectOptions(String objectName, string fld)
    {
        
        System.debug('objectName,fld==>'+objectName+' '+fld);
        List < String > allOpts = new list < String > ();
        //allOpts.add('');
        
        // Get the object type of the SObject.
        Schema.SObjectType objType = Schema.getGlobalDescribe().get(objectName);
        
        
        // Schema.sObjectType objType = objObject.getSObjectType();
        
        // Describe the SObject using its object type.
        Schema.DescribeSObjectResult objDescribe = objType.getDescribe();
        
        // Get a map of fields for the SObject
        map < String, Schema.SObjectField > fieldMap = objDescribe.fields.getMap();
        
        // Get the list of picklist values for this field.
        list < Schema.PicklistEntry > values =
            fieldMap.get(fld).getDescribe().getPickListValues();
        
        // Add these values to the selectoption list.
        for (Schema.PicklistEntry a: values) {
            allOpts.add(a.getValue());
        }
        system.debug('allOpts ---->' + allOpts);
        //allOpts.sort();
        return allOpts;
    }
    
    public class CompetitorDataExportWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        @AuraEnabled
        public List<Competitor__c> competitorData { get; set; }
        
        @AuraEnabled
        public String xmlString { get; set; }
        
        @AuraEnabled
        public List<String> otherProductPicklist { get; set; }
        
    }    
    
    /*
     * Wrapper class to display Competitor Records
     */
   
    public class CompetitorResult {
        
        @AuraEnabled
        public List<Competitor__c> pharmacyCompetitorList { get;set; }
        
        @AuraEnabled
        public List<Competitor__c> dentalCompetitorList { get;set; }
        
        @AuraEnabled
        public List<Competitor__c> visionCompetitorList { get;set; }
        
        @AuraEnabled
        public List<Competitor__c> otherproductsCompetitorList { get;set; }
        
        @AuraEnabled
        public List<Competitor__c> OtherProductsCompetitorsListBackup {get;set;}
        
        @AuraEnabled
        public List<Competitor__c> medicalCompetitorList { get;set; }
        
        @AuraEnabled        
        public List<String> businessModelPicklistValuesList { get;set; }
        
        @AuraEnabled        
        public List<String> pharmacyCoalitionPicklistValuesList { get;set; }
        
        @AuraEnabled        
        public List<String> dentalFundingTypePicklistValuesList { get;set; }
        
        @AuraEnabled        
        public List<String> visionFundingTypePicklistValuesList { get;set; }
        
        @AuraEnabled        
        public List<String> typeOfOtherProductsProvided { get;set; }
        
        @AuraEnabled
        public Boolean isNationalAccountsActiveInPharmacy;
        
        @AuraEnabled
		public Boolean isNationalAccountsActiveInDental;
        
        @AuraEnabled
		public Boolean isNationalAccountsActiveInVision;
        
        @AuraEnabled
		public Boolean isNationalAccountsActiveInOthers;
        
        @AuraEnabled
        public Boolean isTotalActiveInPharmacy;
        
        @AuraEnabled
		public Boolean isTotalActiveInDental;
        
        @AuraEnabled
		public Boolean isTotalActiveInVision;
        
        @AuraEnabled
        public Competitor__c pharmacyTotalCompetitorObj { get;set; }
        
        @AuraEnabled
        public Competitor__c dentalTotalCompetitorObj { get;set; }
        
        @AuraEnabled
        public Competitor__c visionTotalCompetitorObj { get;set; }
        
        @AuraEnabled
        public String businessModelValueForNationalAccounts { get;set; }
        
        @AuraEnabled
        public String fundingTypeValueForNationalAccountsInDental { get;set; }
        
        @AuraEnabled
        public String fundingTypeValueForNationalAccountsInVision { get;set; }
        
        @AuraEnabled
        public String incumbentPrimaryPharmacy { get; set; }
        
        @AuraEnabled
        public Id incumbentPrimaryPharmacyId { get; set; }
        
        @AuraEnabled
        public String incumbentSecondaryPharmacy { get; set; }
        
         @AuraEnabled
        public Id incumbentSecondaryPharmacyId { get; set; }
        
        @AuraEnabled
        public String incumbentPrimaryDental { get; set; }
        
        @AuraEnabled
        public Id incumbentPrimaryDentalId { get; set; }
        
        @AuraEnabled
        public String incumbentSecondaryDental { get; set; }
        
        @AuraEnabled
        public Id incumbentSecondaryDentalId { get; set; }
        
        @AuraEnabled
        public String incumbentPrimaryVision { get; set; }
        
        @AuraEnabled
        public Id incumbentPrimaryVisionId { get; set; }
        
        @AuraEnabled
        public String incumbentSecondaryVision { get; set; }
        
        @AuraEnabled
        public Id incumbentSecondaryVisionId { get; set; }
        
        @AuraEnabled
        public Id incumbentPrimaryId { get; set; }
        
        @AuraEnabled
        public Id incumbentSecondaryId { get; set; }
        
        @AuraEnabled
        public Account accountDataObj { get; set; }  
        
        @AuraEnabled
        public Boolean isCsiUser { get;set; }
        
		@AuraEnabled
        public Boolean recordEditAccess { get;set; }
        
        public CompetitorResult() {
            
            pharmacyCompetitorList = new List<Competitor__c>();
            dentalCompetitorList = new List<Competitor__c>();
            visionCompetitorList = new List<Competitor__c>();
            otherproductsCompetitorList = new List<Competitor__c>();
            OtherProductsCompetitorsListBackup = new List<Competitor__c>();
            medicalCompetitorList = new List<Competitor__c>();
            businessModelPicklistValuesList = new List<String>();
            pharmacyCoalitionPicklistValuesList = new List<String>();
            dentalFundingTypePicklistValuesList = new List<String>();
            visionFundingTypePicklistValuesList = new List<String>();
            typeOfOtherProductsProvided = new List<String>();
            isNationalAccountsActiveInPharmacy = false;
        	isNationalAccountsActiveInDental = false;
        	isNationalAccountsActiveInVision = false;
        	isNationalAccountsActiveInOthers = false;
            businessModelValueForNationalAccounts = '';
            fundingTypeValueForNationalAccountsInDental = '';
            fundingTypeValueForNationalAccountsInVision = '';
            isTotalActiveInPharmacy = false;
            isTotalActiveInDental = false;
            isTotalActiveInVision = false;
            pharmacyTotalCompetitorObj = new Competitor__c();
            dentalTotalCompetitorObj = new Competitor__c();
            visionTotalCompetitorObj = new Competitor__c();
            incumbentPrimaryPharmacy = '';
            incumbentSecondaryPharmacy = '';
            incumbentPrimaryDental = '';
            incumbentSecondaryDental = '';
            incumbentPrimaryVision = '';
            incumbentSecondaryVision = '';
            accountDataObj = new Account();
        }
    
    }
    
    
    /*
     * Wrapper class to display Account Details
     */
    
    public class AccountResult {
        
        @AuraEnabled
        public String accountType { get; set; }
        
    }
    
    //------------------------------------------changes made by Varun as per Case #3495--------------------------------------------------------------//
    public without sharing class competitorData {
        
        public Competitor__c[] getCompetitorsData(Id accountId){
            UHGAccountSOQLConstants uhgAccountSOQLConstants = new UHGAccountSOQLConstants();
            return Database.query(uhgAccountSOQLConstants.QUERY_STRING_CM_COMPETITORS);
        }
    }
    //-------------------------------------------Case #3495 changes end ----------------------------------------------------------------------------------------//
    
}