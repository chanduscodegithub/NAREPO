/*********************************************************************** 
Name: SalesDebriefSummaryController
Test Class: SalesDebriefSummaryControllerTest
Copyright © 2022 CRMIT Solutions Company Inc.
====================================================== 
======================================================  
Purpose: Query and return opportunity for the current sales season
====================================================== 
======================================================
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Manoj A M       	 	02/16/2023  		INITIAL DEVELOPMENT   		  
*********************************************************************/
public with sharing class SalesDebriefSummaryController {

    /**
     * Checks whether the current loggedin user is authorized to view the data
     * @return  `Boolean`
     */
    public static Boolean authenticateLoggedInUserByRole(){
        Set<Id> allowedUsersRolesIdSet = new Set<Id>();

        allowedUsersRolesIdSet = new Map<Id, UserRole>([        
            SELECT Id 
            FROM UserRole 
            WHERE 
                Name IN ( 'CD SVP', 'Surest CD SVP', 'CM SCE', 'Surest CM SCE', 'Surest CM SVP', 'CM VPCR/RVP' )
        ]).keySet();

        return allowedUsersRolesIdSet.contains( UserInfo.getUserRoleId() ); 
    }

    /**
     * To query Membership Activity(Opportunity) along with Comany Name(Account), Effective Date, 
     * Sales Debreif Data, Sales Debreif Status and return it back to the front end
     * @return  `ReturnSalesDebriefSummaryData`
     * @exception AuraHandledException
     */
    @AuraEnabled
    public static ReturnSalesDebriefSummaryData fetchSalesDebreiefSummaryData(){
        try {
            ReturnSalesDebriefSummaryData dataToReturn = new ReturnSalesDebriefSummaryData();
            Id userId = UserInfo.getUserId();
            String userName = UserInfo.getName();

            Date startDate = null, endDate = null;

            if( Date.today().month() < 2 ){ 
                startDate = Date.newInstance( Date.today().addYears( -1 ).year(), 1, 1 );
                endDate = Date.newInstance( Date.today().year(), 1, Date.daysInMonth( Date.today().year(), 1 ) );
            } else {
                startDate = Date.newInstance( Date.today().year(), 2, 1 );
                endDate = Date.newInstance( Date.today().addYears( 1 ).year(), 1, Date.daysInMonth( Date.today().addYears( 1 ).year(), 1 ) );
            }

            dataToReturn.isUserAuthorizedViewData = authenticateLoggedInUserByRole();

            if( dataToReturn.isUserAuthorizedViewData ){

                UserRole loggedInUserRole = [ SELECT Id, Name FROM UserRole WHERE Id = :( UserInfo.getUserRoleId() ) LIMIT 1 ];

                if( loggedInUserRole.Name == 'CM VPCR/RVP' ){
                    dataToReturn.salesDebriefSummaryList = [
                        SELECT Id, Name, EffectiveDate__c, Sales_Debrief__c, Sales_Debrief_Override__c,
                                Account.Name, ( SELECT Debrief_Complete_Incomplete__c FROM Sales_Debriefs__r ORDER BY CreatedDate DESC  )
                        FROM Opportunity
                        WHERE 
                            (
                                EffectiveDate__c >= :startDate AND 
                                EffectiveDate__c <= :endDate 
                            ) AND 
                            ( CM_VPCR_RVP__c = :userId ) AND
                            (Sales_Debrief__c IN : ( new Set<String>{'Comprehensive Medical', 'Specialty Only'} ) OR
                            Sales_Debrief_Override__c IN : ( new Set<String>{'Comprehensive Medical', 'Specialty Only'} )) And Sales_Debrief_Override__c!='N/A'
                        ORDER BY Account.Name ASC
                    ];
                } else {
                    dataToReturn.salesDebriefSummaryList = [
                        SELECT Id, Name, EffectiveDate__c, Sales_Debrief__c, Sales_Debrief_Override__c,
                                Account.Name, ( SELECT Debrief_Complete_Incomplete__c FROM Sales_Debriefs__r ORDER BY CreatedDate DESC  )
                        FROM Opportunity
                        WHERE 
                            (
                                EffectiveDate__c >= :startDate AND 
                                EffectiveDate__c <= :endDate 
                            ) AND
                            ( OwnerId = :userId ) AND
                            (Sales_Debrief__c IN : ( new Set<String>{'Comprehensive Medical', 'Specialty Only'} ) OR
                            Sales_Debrief_Override__c IN : ( new Set<String>{'Comprehensive Medical', 'Specialty Only'} )) And Sales_Debrief_Override__c!='N/A'
                        ORDER BY Account.Name ASC
                    ];
                }

            } 

            dataToReturn.startDate = startDate;
            dataToReturn.endDate = Date.newInstance( endDate.year(), endDate.month(), 1 ); // Reseting end-date to 1st JAN to match the UI requirement

            return dataToReturn;
        } catch (Exception e) {
            throw new AuraHandledException( e.getMessage() );
        }
    }
    
    //Wrapper class to hold all the queried data
    public class ReturnSalesDebriefSummaryData {
        @AuraEnabled
        public Boolean isUserAuthorizedViewData {get;set;}
        
        @AuraEnabled
        public Date startDate {get; set;}
        
        @AuraEnabled
        public Date endDate {get; set;}
        
        @AuraEnabled
        public List<Opportunity> salesDebriefSummaryList {get; set;}
    }
}