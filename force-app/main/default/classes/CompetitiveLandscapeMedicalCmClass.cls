/****************************************************************** ***** 
Name: CompetitiveLandscapeMedicalCmClass 
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Compitative Landscape Medical CM will be queried All the competitor of type account compititor the from Custom object Competitor__c
====================================================== 
======================================================  
History 
 ------- 
	VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
	1.0 -   	 Jnanesh Avaradi  	 	26/07/2017  		INITIAL DEVELOPMENT   		  
	2.0 -
*********************************************************************
*/
public without sharing class CompetitiveLandscapeMedicalCmClass {
     /******************************************************************
    * 
     Purpose: Call the queryCompetitiveLandscapeMedicalCmRecords method to get all the competitors if result returns no records then it will call addDefaultCompititorsToAccount to add default competitors 
     Parameters: accountId
     Returns: clmList
     Throws [Exceptions]: [optional] 
     
    *******************************************************************
    */ 
    
    @AuraEnabled
    public static  List<Competitor__c> getCompetitiveLandscapeMedicalCmRecords(Id accountId,String accountType,Boolean isEditAccess){
        List<Competitor__c> clmList = null;
        System.debug('Account Id CM : '+accountId);
        if(accountId != null){
            clmList = queryCompetitiveLandscapeMedicalCmRecords(accountId,accountType);
             System.debug('Account Id CM List Size: '+clmList.size());
            if(clmList.size() == 0 && isEditAccess == true){
                addDefaultCompititorsToAccount(accountId,accountType);
                clmList = queryCompetitiveLandscapeMedicalCmRecords(accountId,accountType);                                           
            }else if(accountType == 'cd' && clmList.size() > 0 && isEditAccess == true) {            
                addDefaultCompititorsToCDAccount(accountId,accountType,clmList);
				clmList = queryCompetitiveLandscapeMedicalCmRecords(accountId,accountType);                
            }         
        } else{
            throw new NullPointerException();
        }              
        return clmList;        
    }
    
    
     /******************************************************************
    * 
     Purpose: Call the queryCompetitiveLandscapeMedicalCmRecords method to get all the competitors if result returns no records then it will call addDefaultCompititorsToAccount to add default competitors 
     Parameters: accountId
     Returns: clmList
     Throws [Exceptions]: [optional] 
     
    *******************************************************************
    */ 
    
    @AuraEnabled
    public static List<Competitor__c> checkDefaultCmCdRecords(Id accountId,String accountType,Boolean isEditAccess){
        List<Competitor__c> clmList = null;
        System.debug('Account Id CM : '+accountId);
        if(accountId != null){
            clmList = queryCompetitiveLandscapeMedicalCmRecords(accountId,accountType);
             System.debug('Account Id CM List Size: '+clmList.size());
            if(clmList.size() == 0 && isEditAccess == true){
                addDefaultCompititorsToAccount(accountId,accountType);                                                        
            }else if(accountType == 'cd' && clmList.size() > 0 && isEditAccess == true) {            
                addDefaultCompititorsToCDAccount(accountId,accountType,clmList);				                
            }         
        } else{
            throw new NullPointerException();
        }
        return clmList;
    }
    
    /******************************************************************
    * 
     Purpose: Query All the competitors of type Account Competitor from Competitor__c custom object
     Parameters: AccountId
     Returns: csrReturnMap
     Throws [Exceptions]: [optional] 
     
    *******************************************************************
    */ 
    
    @AuraEnabled
    public static  List<Competitor__c> queryCompetitiveLandscapeMedicalCmRecords(Id AccountId,String accountType){
        List<Competitor__c> clmList = null;
        List<Competitor__c> sortingList = new List<Competitor__c>();
        try{              
            UHGAccountConstants clmCmConstants = new UHGAccountConstants();
            //UHGAccountSOQLConstants clmCmSOQLConstants = new UHGAccountSOQLConstants();
            String clmCmType = clmCmConstants.COMPETITOR_TYPE;
            String competitorClassification = clmCmConstants.COMPETITOR_CLASIFICATION_MEDICAL;
            clmList = new List<Competitor__c>();
            if(schema.sobjecttype.Competitor__c.isaccessible() && schema.sobjecttype.Competitor__c.isQueryable()) {
                clmList = Database.query(UHGAccountSOQLConstants.QUERY_COMPETITORS_CM_CD);                    
                if(clmList != null && accountType.equalsIgnoreCase('cm')){
                    for(Competitor__c compe : clmList){
                        if(compe.CompetitorAccount__r != null && compe.CompetitorAccount__r.Name != null && compe.CompetitorAccount__r.Name.equals('National Accounts')){
                            sortingList.add(compe);                            
                        }
                    }
                    for(Competitor__c compe : clmList){
                        if(!(compe.CompetitorAccount__r != null && compe.CompetitorAccount__r.Name != null && compe.CompetitorAccount__r.Name.equals('National Accounts'))){
                            sortingList.add(compe);                             
                        }
                    }
                    clmList = sortingList;
                }
            }else {
                throw new NoAccessException();
            }           
        }catch(Exception e) {
            System.debug('Error occurred in queryCompetitiveLandscapeMedicalCmRecords() method while querying the details of '+
                         'Competitors from SF -> ' + e.getMessage());
            throw new AuraHandledException('Excetion Occured : '+e.getMessage());
        }      
        System.debug('Exit  < queryCompetitiveLandscapeMedicalCmRecords()>');     
        return clmList;        
    }
    
    
      /******************************************************************
    * 
    Purpose: This method will inserts the default 'National Accounts' & 'Total' Competitor__c records into SF Account.
    Parameters: currentAccountId
    Returns: 
    Throws [Exceptions]: [optional] 
    
    *******************************************************************
    */ 
    @AuraEnabled    
    public static void addDefaultCompititorsToCDAccount(Id currentAccountId,String accountType,List<Competitor__c> clmList){
        
        System.debug('addDefaultCompititorsToCDAccount(Id currentAccountId) - START');
        
        System.debug('Input Parameters -> AccountId-'+currentAccountId);
        
        List<Competitor__c> competitorsList = new List<Competitor__c>();
        UHGAccountConstants constants = new UHGAccountConstants();
        try{
            if(currentAccountId != null){
                if(schema.sobjecttype.Competitor__c.isaccessible() && schema.sobjecttype.Competitor__c.isCreateable()) {
                    Boolean totalExist = false;
					Decimal c1 = 0,c2 = 0,c3 = 0,c4 = 0,c5 = 0,c6 = 0,c7=0;                    
                    for(Competitor__c cdCompititor : clmList){
                        if(cdCompititor.CompetitorAccount__r != null && cdCompititor.CompetitorAccount__r.Name != null && cdCompititor.CompetitorAccount__r.Name == 'Total'){
                            totalExist = true;
                        }else{
                            if(cdCompititor.ParticipatingNonBargainedFullTimeAc__c != null){
                                c1 = c1 + cdCompititor.ParticipatingNonBargainedFullTimeAc__c;
                            }
							if(cdCompititor.ParticipatingBargainedFullTimeActive__c != null){
                                c2 = c2 + cdCompititor.ParticipatingBargainedFullTimeActive__c;
                            }
                            if(cdCompititor.ParticipatingPartTimeActives__c != null){
                                c3 = c3 + cdCompititor.ParticipatingPartTimeActives__c;
                            }
                            if(cdCompititor.ParticipatingU65Retirees__c != null){
                                c4 = c4 + cdCompititor.ParticipatingU65Retirees__c;
                            }
                            if(cdCompititor.ParticipatingO65Retirees__c != null){
                                c5 = c5 + cdCompititor.ParticipatingO65Retirees__c;
                            }
                            if(cdCompititor.MembershipEstimate__c != null){                        
                            	c6 = c6 + cdCompititor.MembershipEstimate__c;
                            }
                            if(cdCompititor.ParticipatingActives__c != null){
                            	c7 = c7 + cdCompititor.ParticipatingActives__c;
                            }                                                                                                              
                        }
                    }
                    if(totalExist == false){
                        Competitor__c competitorTotal = new Competitor__c();
                        competitorTotal.Account__c = currentAccountId;
                        String totalAccName = 'Total';
                        Account accTotal = [SELECT id FROM Account WHERE Name=:totalAccName LIMIT 1];
                    	competitorTotal.CompetitorAccount__c = accTotal.Id;
                        competitorTotal.Competitorclassification__c = constants.COMPETITOR_CLASIFICATION_MEDICAL;
                        competitorTotal.ParticipatingO65Retirees__c = c5;
                        competitorTotal.ParticipatingPartTimeActives__c = c3;                    
                        competitorTotal.Type__c = constants.NATIONAL_ACCOUNTS_COMPETITOR_TYPE;
                        competitorTotal.ParticipatingNonBargainedFullTimeAc__c = c1;
                        competitorTotal.ParticipatingBargainedFullTimeActive__c = c2;
                        competitorTotal.ParticipatingU65Retirees__c = c4;
                        competitorTotal.MembershipEstimate__c = c6;
                        competitorTotal.ParticipatingActives__c = c7;
                        competitorsList.add(competitorTotal);
    
                        insert competitorsList;           
                    }                                                
                }else {
                    throw new NoAccessException();
                }
            } else{
                throw new NullPointerException();
            }
        }catch(Exception e) {
            System.debug('Error occurred in addDefaultCompititorsToCDAccount() method while inserting the default records to '+
                         'Competitor__c -> ' + e.getMessage());
            throw new AuraHandledException('Excetion Occured : '+e.getMessage());
        }      
        
        System.debug('addDefaultCompititorsToCDAccount(Id currentAccountId) - END');       	               
    }
    
    

    /******************************************************************
    * 
    Purpose: This method will inserts the default 'National Accounts' & 'Total' Competitor__c records into SF Account.
    Parameters: currentAccountId
    Returns: 
    Throws [Exceptions]: [optional] 
    
    *******************************************************************
    */ 
    @AuraEnabled    
    public static void addDefaultCompititorsToAccount(Id currentAccountId,String accountType){
        
        System.debug('addDefaultCompititorsToAccount(Id currentAccountId) - START');
        
        System.debug('Input Parameters -> AccountId-'+currentAccountId);
        
        List<Competitor__c> competitorsList = new List<Competitor__c>();
        UHGAccountConstants constants = new UHGAccountConstants();
        try{
            if(currentAccountId != null){
                if(schema.sobjecttype.Competitor__c.isaccessible() && schema.sobjecttype.Competitor__c.isCreateable()) {
                    if(accountType == 'cm'){
                        String nationalAccName = constants.NATIONAL_ACCOUNTS_COMPETITOR_NAME;
                        Account accRecord = [SELECT id FROM Account WHERE Name=:nationalAccName LIMIT 1];
                    	Competitor__c competitorNA = new Competitor__c();
                        competitorNA.Account__c = currentAccountId;
                        competitorNA.CompetitorAccount__c = accRecord.Id;
                        //competitorNA.CompetitorAccount__r.Name = constants.NATIONAL_ACCOUNTS_COMPETITOR_NAME;
                        competitorNA.Competitorclassification__c = constants.COMPETITOR_CLASIFICATION_MEDICAL;
                        competitorNA.ParticipatingO65Retirees__c = 0;
                        competitorNA.ParticipatingPartTimeActives__c = 0;
                        competitorNA.MembershipEstimate__c = 0;
                        competitorNA.Type__c = constants.NATIONAL_ACCOUNTS_COMPETITOR_TYPE;
                        competitorNA.ParticipatingNonBargainedFullTimeAc__c = 0;
                        competitorNA.ParticipatingBargainedFullTimeActive__c = 0;
                        competitorNA.ParticipatingU65Retirees__c = 0;
                        competitorNA.ParticipatingActives__c = 0;
                        competitorsList.add(competitorNA);    
                    }
                                       
                    Competitor__c competitorTotal = new Competitor__c();
                    competitorTotal.Account__c = currentAccountId;
                    String totalAccName = 'Total';
                    Account accTotal = [SELECT id FROM Account WHERE Name=:totalAccName LIMIT 1];
                    competitorTotal.CompetitorAccount__c = accTotal.Id;
                    competitorTotal.Competitorclassification__c = constants.COMPETITOR_CLASIFICATION_MEDICAL;
                    competitorTotal.ParticipatingO65Retirees__c = 0;
                    competitorTotal.ParticipatingPartTimeActives__c = 0;
                    competitorTotal.MembershipEstimate__c = 0;
                    competitorTotal.Type__c = constants.NATIONAL_ACCOUNTS_COMPETITOR_TYPE;
                    competitorTotal.ParticipatingNonBargainedFullTimeAc__c = 0;
                    competitorTotal.ParticipatingBargainedFullTimeActive__c = 0;
                    competitorTotal.ParticipatingU65Retirees__c = 0;
                    competitorTotal.ParticipatingActives__c = 0;
                    competitorsList.add(competitorTotal);

                    insert competitorsList;                                       
                }else {
                    throw new NoAccessException();
                }
            } else{
                throw new NullPointerException();
            }
        }catch(Exception e) {
            System.debug('Error occurred in addDefaultCompititorsToAccount() method while inserting the default records to '+
                         'Competitor__c -> ' + e.getMessage());
            throw new AuraHandledException('Excetion Occured : '+e.getMessage());
        }      
        
        System.debug('addDefaultCompititorsToAccount(Id currentAccountId) - END');       	               
    }
      
    /******************************************************************
    * 
    Purpose: This method below method deletes/disassociates the Competitor__c records from SF Account.
    Parameters: compititorRecordId,currentAccountId,deletedCompititorsList
    Returns: 
    Throws [Exceptions]: [optional] 
    
    *******************************************************************
    */ 
    @AuraEnabled
    public static void deleteCompititorsFromApplet(Id compititorRecordId,Id currentAccountId,List<Competitor__c> deletedCompititorsList,String accountType) {
        
        System.debug('deleteCompititorsFromApplet(Id compititorRecordId,Id currentAccountId,List<Competitor__c> deletedCompititorsList) - START');
        
        System.debug('Input Parameters -> compititorRecordId-'+compititorRecordId+',currentAccountId-'+currentAccountId);        
        
        //List<Competitor__c> deletedCompititorsList = new List<Competitor__c>();
        List<Competitor__c> updatedCompititorsList = new List<Competitor__c>();
        
        try {
            if(schema.sobjecttype.Competitor__c.isaccessible() && schema.sobjecttype.Competitor__c.isUpdateable()) {
                String incumbentPrimary = null;                
                String incumbentSecondary = null;
                String incumbentPrimaryRowId = null;                
                String incumbentSecondaryRowId = null;
                if(compititorRecordId != null && currentAccountId !=null) {                    
                   
                    Competitor__c deleteCompititor = new Competitor__c();
					deleteCompititor.Id = compititorRecordId;                    
                    delete deleteCompititor;                    
                   
                    System.debug('After Delete Record Size : '+deletedCompititorsList.size());
                    
                    List<Competitor__c> totalRecordToBeUpdated = new List<Competitor__c>();
                    Competitor__c cmCompititorTotal = null;
                    Competitor__c cmCompititorDeleted = null;
                    if(deletedCompititorsList != null) {
                        //Decimal c1 = 0,c2 = 0,c3 = 0,c4 = 0,c5 = 0,c6 = 0,c7=0;
                        for(Competitor__c cmCompititor : deletedCompititorsList){
                            if(cmCompititor.Id == compititorRecordId){                            	
                                cmCompititorDeleted = cmCompititor;
                            }else if(cmCompititor.CompetitorAccount__r != null && cmCompititor.CompetitorAccount__r.Name != null && cmCompititor.CompetitorAccount__r.Name == 'Total'){
                                cmCompititorTotal = cmCompititor;
                            }else if(accountType == 'cd'){
                                if(cmCompititor.PrimaryIncumbent__c){
                                    incumbentPrimary = cmCompititor.CompetitorAccount__r.Name;
                                    incumbentPrimaryRowId = cmCompititor.CompetitorAccount__c;
                                }
                                if(cmCompititor.SecondaryIncumbent__c){
                                    incumbentSecondary = cmCompititor.CompetitorAccount__r.Name;
                                    incumbentSecondaryRowId = cmCompititor.CompetitorAccount__c;
                                }
                            }
                        }
                        if(cmCompititorTotal != null && cmCompititorDeleted != null){
                        	cmCompititorTotal.ParticipatingNonBargainedFullTimeAc__c -= cmCompititorDeleted.ParticipatingNonBargainedFullTimeAc__c;
                            cmCompititorTotal.ParticipatingBargainedFullTimeActive__c -= cmCompititorDeleted.ParticipatingBargainedFullTimeActive__c;
                            cmCompititorTotal.ParticipatingPartTimeActives__c -= cmCompititorDeleted.ParticipatingPartTimeActives__c;
                            cmCompititorTotal.ParticipatingU65Retirees__c -= cmCompititorDeleted.ParticipatingU65Retirees__c;
                            cmCompititorTotal.ParticipatingO65Retirees__c -= cmCompititorDeleted.ParticipatingO65Retirees__c;
                            if(accountType == 'cm' && cmCompititorDeleted.MembershipEstimate__c != null){
                                cmCompititorTotal.MembershipEstimate__c -= cmCompititorDeleted.MembershipEstimate__c;
                            }else{
                                if(cmCompititorDeleted.MembershipEstimate__c != null){
                                    cmCompititorTotal.MembershipEstimate__c -= cmCompititorDeleted.MembershipEstimate__c;
                                }                                
                                if(cmCompititorDeleted.ParticipatingActives__c != null){
                                	cmCompititorTotal.ParticipatingActives__c -= cmCompititorDeleted.ParticipatingActives__c;
                                }
                            }                                                        
                            totalRecordToBeUpdated.add(cmCompititorTotal);    
                        }
                                     
                        update totalRecordToBeUpdated;
                        if(accountType == 'cm'){
                            updateAccountFields(deletedCompititorsList,currentAccountId,compititorRecordId);
                        }else{
                            Account accRecord = [SELECT id,Name FROM Account WHERE id=:currentAccountId];                                       
                            if(incumbentPrimaryRowId != null){                               
                                accRecord.IncumbentPrimaryMedical__c = incumbentPrimaryRowId;
                            }else{                              
                                accRecord.IncumbentPrimaryMedical__c = null;
                            }	
                            if(incumbentSecondaryRowId != null){                               
                                accRecord.IncumbentSecondaryMedical__c = incumbentSecondaryRowId;
                            }else{                               
                                accRecord.IncumbentSecondaryMedical__c = null;
                            }	
                            update accRecord;
                        }                        
                    }                   
                } 
            } else {
                throw new NoAccessException();      
            }                   
        } catch(Exception e){
            System.debug('Error occurred in deleteCompititorsFromApplet while deleting the details of '+
                         'Competitor__c from SF -> ' + e.getMessage());
            throw new AuraHandledException('Excetion Occured : '+e.getMessage());
        }
        
        System.debug('deleteCompititorsFromApplet(Id compititorRecordId,Id currentAccountId,List<Competitor__c> deletedCompititorsList) - END');
        
        //return updatedCompititorsList;
    }
    
    /******************************************************************
    * 
    Purpose: This method will upsert the Competitor__c records to SF Account.
    Parameters: Id AccountId,List<Competitor__c> finalData
    Returns: 
    Throws [Exceptions]: [optional] 
    
    *******************************************************************
    */ 
    @AuraEnabled
   public static List<Competitor__c> saveCompititiveLandscapeMedicalRecords(Id AccountId,List<Competitor__c> finalData,String accountType,List<String> deleteCompList) {
        
        System.debug('saveCompititiveLandscapeMedicalRecords(Id AccountId,List<Competitor__c> finalData) - START');
        
        System.debug('Input Parameters -> AccountId-'+AccountId);        
        
        List<Competitor__c> updatedCompititorsList = new List<Competitor__c>();
        
        try {
            if(schema.sobjecttype.Competitor__c.isaccessible() && schema.sobjecttype.Competitor__c.isUpdateable()) {
                
                System.debug('Before Delete Record Size Bulk: '+deleteCompList);
                Competitor__c[] deletedCompList = [SELECT Id, Name FROM Competitor__c WHERE Id IN:deleteCompList]; 
    			delete deletedCompList;
                System.debug('After Delete Record Size Bulk: '+deletedCompList.size());

                System.debug('Save Compititor AccountId'+AccountId);
                List<Competitor__c> compititorslistToBeUpdated = new List<Competitor__c>();
                String incumbentPrimary = null;                
                String incumbentSecondary = null;
                String incumbentPrimaryRowId = null;                
                String incumbentSecondaryRowId = null;
                Competitor__c compititor = null;                              
                for(Competitor__c cmCompititor : finalData){
                    compititor = (Competitor__c)cmCompititor;
                    if(accountType == 'cd'){
                        if(compititor.PrimaryIncumbent__c){
                            incumbentPrimary = compititor.CompetitorAccount__r.Name;
                            incumbentPrimaryRowId = compititor.CompetitorAccount__c;
                        }
                        if(compititor.SecondaryIncumbent__c){
                            incumbentSecondary = compititor.CompetitorAccount__r.Name;
                            incumbentSecondaryRowId = compititor.CompetitorAccount__c;
                        }
                    }
                    compititorslistToBeUpdated.add(compititor);
                }
                Database.upsert(compititorslistToBeUpdated, false);
                
                Id compId = AccountId;
                if(accountType == 'cm'){
                 	updateAccountFields(finalData,AccountId,compId);   
                }else if(accountType == 'cd'){
                    Account accRecord = [SELECT id,Name FROM Account WHERE id=:AccountId];
                    
       				System.debug('Input incumbentPrimaryRowId -> '+incumbentPrimaryRowId); 
                    System.debug('Input incumbentSecondaryRowId -> '+incumbentSecondaryRowId); 
                    
                    if(incumbentPrimaryRowId != null){
                        //accRecord.IncumbentPrimaryMedicalRowId__c = incumbentPrimaryRowId;
                        accRecord.IncumbentPrimaryMedical__c = incumbentPrimaryRowId;
                    }else{
                        //accRecord.IncumbentPrimaryMedicalRowId__c = null;
                        accRecord.IncumbentPrimaryMedical__c = null;
                    }	
                    if(incumbentSecondaryRowId != null){
                        //accRecord.IncumbentSecondaryMedicalRowId__c = incumbentSecondaryRowId;
                        accRecord.IncumbentSecondaryMedical__c = incumbentSecondaryRowId;
                    }else{
                        //accRecord.IncumbentSecondaryMedicalRowId__c = null;
                        accRecord.IncumbentSecondaryMedical__c = null;
                    }	
                    update accRecord;
                }                
                
                updatedCompititorsList = queryCompetitiveLandscapeMedicalCmRecords(AccountId,accountType);                
            } else {
                throw new NoAccessException();      
            }                   
        }catch(Exception e){
            System.debug('Error occurred in saveCompititiveLandscapeMedicalRecords while upserting the details of '+
                         'Competitor__c to SF -> ' + e.getMessage());
            throw new AuraHandledException('Excetion Occured : '+e.getMessage());
        }
        
        System.debug('Output Parameters -> updated Compititors List-'+updatedCompititorsList);
        
        System.debug('saveCompititiveLandscapeMedicalRecords(Id accountBGHRecordId,Id currentRecordId) - END');
        
        return updatedCompititorsList;
    }
    
    
    /******************************************************************
    * 
     Purpose: This method will update the Incumbent_Primary_Medical__c,Incumbent_Secondary_Medical__c and Participating_US_Members__c to Account
     Parameters: List<Competitor__c> finalDataList,Id AccountId,Id competitorId
     Returns: 
     Throws [Exceptions]: [optional] 
     
    *******************************************************************
    */ 
    @AuraEnabled
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
    
    @AuraEnabled
    public static void updateAccountFields(List<Competitor__c> finalDataList,Id AccountId,Id competitorId){
        try{           
            if(schema.sobjecttype.Account.isaccessible() && schema.sobjecttype.Account.isQueryable()) {               
                 if(AccountId !=null) {
                    Decimal largestRetirees = 0;                
                    Decimal secLargestRetirees = 0;
                    String incumbentPrimary = null;
                    String incumbentSecondary = null;
                    String incumbentPrimaryRowId = null;                
                	String incumbentSecondaryRowId = null;
                    Decimal totalParticipatingMembers = 0;             
                    for(Competitor__c compititor : finalDataList){
                        List<string> sortList = new List<string>();
                        if((compititor.CompetitorAccount__r != null && compititor.CompetitorAccount__r.Name != null && compititor.CompetitorAccount__r.Name != 'Total') && compititor.Id != competitorId  && compititor.MembershipEstimate__c > 0 && compititor.MembershipEstimate__c >= largestRetirees){                            
                            if(incumbentPrimary != null){
                                sortList.add(incumbentPrimary.toUpperCase());
                            }
							sortList.add((compititor.CompetitorAccount__r.Name).toUpperCase());                            
                            if(compititor.MembershipEstimate__c == largestRetirees && incumbentPrimary != null && compareNames(sortList,incumbentPrimary.toUpperCase())){
                                secLargestRetirees = largestRetirees;
                            	incumbentSecondary = incumbentPrimary;
                                incumbentSecondaryRowId = incumbentPrimaryRowId;
                            	largestRetirees = compititor.MembershipEstimate__c;
                            	incumbentPrimary = compititor.CompetitorAccount__r.Name;
                                incumbentPrimaryRowId = compititor.CompetitorAccount__c;
                            }else if(compititor.MembershipEstimate__c > largestRetirees){
                                secLargestRetirees = largestRetirees;
                            	incumbentSecondary = incumbentPrimary;
                                incumbentSecondaryRowId = incumbentPrimaryRowId;
                            	largestRetirees = compititor.MembershipEstimate__c;
                            	incumbentPrimary = compititor.CompetitorAccount__r.Name;
                                incumbentPrimaryRowId = compititor.CompetitorAccount__c;
                            }else if(compititor.MembershipEstimate__c >= secLargestRetirees){
                                sortList = new List<string>();
                                if(incumbentSecondary != null){
                                sortList.add(incumbentSecondary.toUpperCase());
                                } 
                                sortList.add((compititor.CompetitorAccount__r.Name).toUpperCase());
                                if(compititor.MembershipEstimate__c == secLargestRetirees && incumbentSecondary != null && compareNames(sortList,incumbentSecondary.toUpperCase())){
                                    secLargestRetirees = compititor.MembershipEstimate__c;
                                    incumbentSecondary = compititor.CompetitorAccount__r.Name;                                
                                    incumbentSecondaryRowId = compititor.CompetitorAccount__c;
                                }else if(compititor.MembershipEstimate__c > secLargestRetirees){
                                    secLargestRetirees = compititor.MembershipEstimate__c;
                                    incumbentSecondary = compititor.CompetitorAccount__r.Name;
                                    incumbentSecondaryRowId = compititor.CompetitorAccount__c;
                                }					
                            }                           
                        }else if((compititor.CompetitorAccount__r != null && compititor.CompetitorAccount__r.Name != null && compititor.CompetitorAccount__r.Name != 'Total') && compititor.Id != competitorId && compititor.MembershipEstimate__c > 0 && compititor.MembershipEstimate__c >= secLargestRetirees){                            
                            sortList = new List<string>();
                            if(incumbentSecondary != null){
                                sortList.add(incumbentSecondary.toUpperCase());
                            } 
                            sortList.add((compititor.CompetitorAccount__r.Name).toUpperCase());
                            if(compititor.MembershipEstimate__c == secLargestRetirees && incumbentSecondary != null && compareNames(sortList,incumbentSecondary.toUpperCase())){
                                secLargestRetirees = compititor.MembershipEstimate__c;
                            	incumbentSecondary = compititor.CompetitorAccount__r.Name;                                
                                incumbentSecondaryRowId = compititor.CompetitorAccount__c;
                            }else if(compititor.MembershipEstimate__c > secLargestRetirees){
                                secLargestRetirees = compititor.MembershipEstimate__c;
                            	incumbentSecondary = compititor.CompetitorAccount__r.Name;
                                incumbentSecondaryRowId = compititor.CompetitorAccount__c;
                            }						                                                        
                        }
                        if(compititor.CompetitorAccount__r != null && compititor.CompetitorAccount__r.Name != null && compititor.CompetitorAccount__r.Name == 'Total'){
                            totalParticipatingMembers = compititor.MembershipEstimate__c;
                        }                     
                    }
                    system.debug('incumbentPrimaryRowId :'+incumbentPrimaryRowId);
                    system.debug('incumbentSecondaryRowId :'+incumbentSecondaryRowId);
                     
                    Account accRecord = [SELECT id,Name FROM Account WHERE id=:AccountId];
                    
                    /*if(incumbentPrimary != null){
                        accRecord.Incumbent_Primary_Medical__c = incumbentPrimary;
                    }else{
                        accRecord.Incumbent_Primary_Medical__c = null;
                    }
                    if(incumbentSecondary != null){
                        accRecord.Incumbent_Secondary_Medical__c = incumbentSecondary;
                    }else{
                        accRecord.Incumbent_Secondary_Medical__c = null;
                    }*/
                    if(incumbentPrimaryRowId != null){
                        //accRecord.IncumbentPrimaryMedicalRowId__c = incumbentPrimaryRowId;
                        accRecord.IncumbentPrimaryMedical__c = incumbentPrimaryRowId;
                    }else{
                        //accRecord.IncumbentPrimaryMedicalRowId__c = null;
                        accRecord.IncumbentPrimaryMedical__c = null;
                    }
                    if(incumbentSecondaryRowId != null){
                        //accRecord.IncumbentSecondaryMedicalRowId__c = incumbentSecondaryRowId;
                        accRecord.IncumbentSecondaryMedical__c = incumbentSecondaryRowId;
                    }else{
                        //accRecord.IncumbentSecondaryMedicalRowId__c = null;
                        accRecord.IncumbentSecondaryMedical__c = null;
                    }
					accRecord.Participating_US_Members__c = totalParticipatingMembers;   
                    system.debug('incumbentSecondaryRowId :'+accRecord);
                    update accRecord;                   
                } 
            }else {
                throw new NoAccessException();
            }           
        }catch(Exception e) {
            System.debug('Error occurred in updateAccountFields() method while updating the details of '+
                         'Account from SF -> ' + e.getMessage());
            throw new AuraHandledException('Excetion Occured : '+e.getMessage());
        }      
        System.debug('Exit <updateAccountFields()>');          
    }
    
    
       /*
    * The below method returns the boolean value which is used to be enable Add, Edit & Delete buttons to the specific Roles.
    */
    
    @AuraEnabled
    public static Boolean getLoggedInUerRoleInfo(String accountId) {
       
        Boolean isLoggedInUserRoleToBeEnabled = false;
           
        try {
            
           /* User user = [Select UserRole.Name from User where Id=:UserInfo.getUserId()];                                    
            if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
                String loggedInUserRole = user.UserRole.Name;
                String[] roleNames = new List<String>();
                if(accountType == 'cm'){
                    roleNames = System.Label.Competitive_Landscape_Medical_CM_Roles_To_EnableAddOrEditButtons.split(',');
                }else{
                    roleNames = System.Label.Competitive_Landscape_Medical_CD_Roles_To_EnableAddOrEditButtons.split(',');
                }
                 
                Set<String> roleNamesSet = new Set<String>(roleNames);
                if(roleNamesSet.contains(loggedInUserRole)) {
                    isLoggedInUserRoleToBeEnabled = true;
                } else {
                    isLoggedInUserRoleToBeEnabled = false;
                }
            }*/
            isLoggedInUserRoleToBeEnabled = UserInformationClass.hasEditAccessToRecord(accountId);
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }
        
        return isLoggedInUserRoleToBeEnabled;
    }
    
}