/*********************************************************************** 
Name: workItemsController 
Copyright © 2020 CRMIT Solutions Company Inc.  
======================================================  
======================================================  
Purpose: 
=======================================================================================================================
=======================================================================================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Mohan Sai Puttagunta 	03/17/2020  		INITIAL DEVELOPMENT   		  
2.0 -
***********************************************************************************************************************
*/

public without sharing class SoldChecklistHandler {
    
    //public static final String OPT_OUT_TXT = 'Opt Out';
  
    @AuraEnabled(cacheable=true)
    public static oppwrapperclass getClientData(String recId) {

         oppwrapperclass ow = new oppwrapperclass();
        if (recId == null) return ow;

        /* =====================================================
           INITIALIZE DEFAULTS (unchanged)
        ===================================================== */
        ow.Net_Results_Not_Zero = false;
        ow.showCPWSection = false;

        ow.isSurestProductMed = false;
        ow.isTraditionalProductMed = false;
        ow.isSurestProductPharmacy = false;
        ow.isTraditionalProductPharmacy = false;

        ow.isTradSoldDental = false;
        ow.isSurestSoldDental = false;
        ow.isTradSoldVision = false;
        ow.isSurestSoldVision = false;
        ow.isTradSoldOther = false;
        ow.isSurestSoldOther = false;

        ow.medilineitem = new List<OpportunityLineItem>();
        ow.dentallineitem = new List<OpportunityLineItem>();
        ow.visionlineitem = new List<OpportunityLineItem>();
        ow.pharmacylineitem = new List<OpportunityLineItem>();
        ow.otheropplineitems = new List<OpportunityLineItem>();

        /* =====================================================
           RECORD TYPE
        ===================================================== */
        ow.cmRecTypeId =
            Schema.SObjectType.Opportunity
                .getRecordTypeInfosByName()
                .get('CM Membership Activity (Existing Client)')
                .getRecordTypeId();
        
        Id recordId = recId;
        
        /* =====================================================
           OPPORTUNITY
        ===================================================== */
            Opportunity OppDatarec = [SELECT Id,BusinessType__c, Disposition_Dental__c, Disposition_Medical__c, Disposition_Pharmacy__c, Disposition_Vision__c, Name, Owner.Name,
                                      Anticipated_Actual_Close_Date_Medical__c, Proactive_Renewal_Underwriter__c, SCE_Assignment__c, Incumbent_Primary_Medical__r.Name,
                                      Account.Name,Account.BillingCountry, Account.BillingAddress, Account.BillingPostalCode, Account.BillingState,
                                      Account.BillingCity, Account.BillingStreet, Classification_NB_NBEA_Xfer__c, Account.Primary_Situs_State__c,
                                      EffectiveDate__c, Net_Results__c, Type_of_Funding_Specialty__c, Type_of_Funding_Medical__c, Funding_Type_Dental__c, Funding_Type_Vision__c,
                                      Account.Claim_Site__c, Account.Call_Site__c, Account.Clinical_Site__c,Trust_Involved__c,PPO_Network_Access_and_Discounts__c, Extended_Network_Access__c,
                                      Customer_Sponsored_CSP_Network__c, Group_Specific_Provider_GSP_Network__c,Passport_Connect_with_Harvard_Pilgrim__c, HP_Sold_Retained_Employees_Only__c,
                                      HP_Sold_Retained_Members__c, Physical_Health_Solutions__c, Disabled_Child_Coverage__c,Hospital_Bill_Audit_Program__c, Account.Current_Deal_Next_Renewal_Date__c,
                                      Pre_Implementation_Audit__c, Expanded_Online_Customer_Reporting__c, Sold_Retained_Members__c, Tiered_Benefits__c, Sold_Retained_Employees_Only__c,
                                      Claim_Fiduciary__c,Rx_Coalition__c,Core_Rx_Vendor__c,Stop_Loss__c,Credits_and_Allowances__c,Performance_Guarantees__c, IPM__c, IPM__r.Name, Status__c,
                                      Sales_Stage_Medical__c, Sales_Stage_Dental__c, Sales_Stage_Vision__c, Sales_Stage_Pharmacy__c, Sales_Stage_Other__c, Last_email_sent_by_sales__c,
                                      Last_email_sent_by_IPM__c, Completed_by_Sales__c, Completed_by_IPM__c, Specialty_Benefits_SVP__c, Offshore_Provisions__c,Bridge2Health_opt_out__c,
                                      Bridge2Health_Vision__c, Account.Call_Site_Type__c,Account.Claim_Site_Type__c,Account.Clinical_Site_Type__c, Incumbent_Primary_Pharmacy__c, Incumbent_Primary_Dental__c,
                                      Incumbent_Primary_Vision__c, Incumbent_Primary_Pharmacy__r.Name, Incumbent_Primary_Dental__r.Name, Incumbent_Primary_Vision__r.Name,
                                      Account.TopMarket1__c, Account.TopMarket1Records__c, Account.TopMarket2__c, Account.TopMarket2Records__c, Account.TopMarket3__c, Account.TopMarket3Records__c,
                                      Account.TopMarket4__c, Account.TopMarket4Records__c, Account.TopMarket5__c, Account.TopMarket5Records__c, Account.UMR_Client_Platform__c, Account.CVGAccount__r.Name 
                                      FROM Opportunity 
                                      WHERE Id=: recordId WITH USER_MODE]; 
        ow.oppdata = OppDatarec;

        /* =====================================================
           ACCOUNT (SINGLE QUERY)
        ===================================================== */
        ow.accrec =[ SELECT Id, Name, Claim_Site__c, Call_Site__c, Clinical_Site__c, Current_Deal_Next_Renewal_Date__c,
                                   Primary_Situs_State__c, Call_Site_Type__c, Claim_Site_Type__c, Clinical_Site_Type__c,
                                   TopMarket1__c, TopMarket1Records__c, TopMarket2__c, TopMarket2Records__c, TopMarket3__c,
                                   TopMarket3Records__c, TopMarket4__c, TopMarket4Records__c, TopMarket5__c,TopMarket5Records__c,
                                   UMR_Client_Platform__c, CVGAccount__r.Name 
                                   FROM Account 
                                   WHERE Id =: OppDatarec.AccountId WITH USER_MODE];
        /* =====================================================
           SOLD CASE CHECKLIST (SINGLE QUERY)
===================================================== */
        
        
        Map<String, Schema.SObjectField> fieldMap =
            Sold_Case_Checklist__c.SObjectType.getDescribe().fields.getMap();
        
        Set<String> systemFields = new Set<String>{
            'CreatedById','CreatedDate','LastModifiedById','LastModifiedDate',
                'SystemModstamp','LastViewedDate','LastReferencedDate','IsDeleted'
                };
                    
                    List<String> fieldList = new List<String>();
        
        for(String fieldName : fieldMap.keySet()){
            if(!systemFields.contains(fieldName)){
                fieldList.add(fieldName);
            }
        }
        
        String soql = 'SELECT ' + String.join(fieldList, ',') +
            ' ,IPM__r.Name FROM Sold_Case_Checklist__c' +
            ' WHERE Membership_Activity__c = :recordId' +
            ' LIMIT 1';
        
        Sold_Case_Checklist__c scc =
            (Sold_Case_Checklist__c)Database.query(soql);
        ow.sccData = scc;

          /* =====================================================
           OPPORTUNITY LINE ITEMS – SINGLE QUERY (ALL FIELDS)
        ===================================================== */
        List<OpportunityLineItem> allOLIs = [
          SELECT
        Id, Name, ProductCode, Product_Line__c,
        Level_2_Option__c, Level2_Info__c,
        Buyup_Product_Selection__c,
        Disposition_Other_Buy_Up_Programs__c,
        Sold_Retained_Members__c,
        Net_Results__c,
        
        /* Financial */
        R_C_Percentage__c, Physician_R_C__c, Tolerance_Level__c,Decision_Support__c,Maternity_Support__c,
        Congenital_Heart_Disease__c,Transplant_TRS_COE__c,Non_Extra_Contractual_Transplant__c,HealtheNote_Reminders__c,Physical_Health_Network__c,Physical_Health_Chiro_Clinical_Support__c,
        Asthma_VOM__c,Diabetes_VOM__c,Congestive_Heart_Failure_VOM__c,CAD_VOM__c,COPD_VOM__c,Cancer_Support_Program_VOM__c,Kidney_Solutions_VOM__c,
        Kidney_Resource_Services_VOM__c,MNRP__c,MNRP_DME__c,MNRP_Lab__c,MNRP_Default_of_Billed_Charges__c,
                                                            Facility_R_C__c,ENRP__c,ENRP_Default_of_Billed_Charge__c,Non_standard_Comments__c,MNRP_Percentage__c,MNRP_DME_Percentage__c,MNRP_Lab_Percentage__c,
        MNRP_Dfault_of_Billd_Chrges_Percentage__c,Facility_R_C_Percentage__c,ENRP_Percentage__c,ENRP_Dfault_of_Billd_Chrges_Percentage__c,MNRP_DME_Nonstd_Percentage__c,
        MNRP_Lab_Nonstd_Percentage__c,MNRP_Default_Nonstd_Percentage__c,Physician_R_C_OON__c,Physician_R_C_OON_Percentage__c,
        
        /* Pharmacy */
        ESP_Enhanced_Savings_Program_Opt_in__c,
        Vital_Medication_program_Opt_in_Opt_out__c,
        Price_Edge_Opt_in__c,
        If_Fully_Insured_include_quoted_Rx_plan__c,
        
        /* Flex */
        Flex_WriteIn__c, Flex_Options__c,
        
        /* Product */
        Product2.Name,
        Product2.Family,
        Product2.Level_2_Options__c,
        Product2.Product_Display_Order__c,
        Product2.Surest_Applicable_Products__c,
        
        /* Opportunity */
        Opportunity.RecordTypeId,
        Opportunity.Disposition_Medical__c,
        Opportunity.Disposition_Dental__c,
        Opportunity.Disposition_Pharmacy__c,
        Opportunity.Disposition_Vision__c,
        Opportunity.Sales_Stage_Medical__c,
        Opportunity.Sales_Stage_Dental__c,
        Opportunity.Sales_Stage_Vision__c,
        Opportunity.Sales_Stage_Pharmacy__c,
        Opportunity.Sales_Stage_Other__c
        
        FROM OpportunityLineItem
        WHERE OpportunityId = :recId
            AND ProductCode != 'Total'
            AND Product_Line__c IN ('Medical','Dental','Vision','Pharmacy','Other')
            WITH USER_MODE
            ORDER BY Product2.Product_Display_Order__c
        ];
        ow.OppolineItemsList = allOLIs;
 /* =====================================================
           PROCESS PRODUCTS (ALL CONDITIONS PRESERVED)
        ===================================================== */
        Boolean medicalEditAccess = false;
        Boolean dentalEditAccess = false;
        Boolean visionEditAccess = false;
        Boolean pharmacyEditAccess = false;
        Boolean otherEditAccess = false;

        for (OpportunityLineItem oli : allOLIs) {

            if (oli.Net_Results__c > 0) {
                ow.Net_Results_Not_Zero = true;
                    }

            /* ---------------- MEDICAL ---------------- */
            if (oli.Product_Line__c == 'Medical') {

                if (
                    OppDatarec.Sales_Stage_Medical__c != 'Notified'
                    && OppDatarec.Sales_Stage_Medical__c != 'Spin-Off'
                    && OppDatarec.Sales_Stage_Medical__c != 'Transfer In/Out'
                    && OppDatarec.Disposition_Medical__c != 'Dead Pending Transfer'
                    && OppDatarec.Disposition_Medical__c != 'Dead Spin-Off'
                ) {
                    ow.medilineitem.add(oli);
                }
                else if (
                    (OppDatarec.Sales_Stage_Medical__c == 'Notified'
                     && OppDatarec.Disposition_Medical__c == 'Sold'
                     && oli.Sold_Retained_Members__c != 0)
                    || (OppDatarec.Sales_Stage_Medical__c == 'Spin-Off'
                        && OppDatarec.Disposition_Medical__c == 'Spin-Off')
                    || (OppDatarec.Sales_Stage_Medical__c == 'Transfer In/Out'
                        && OppDatarec.Disposition_Medical__c == 'Transfer In')
                ) {
                    ow.medilineitem.add(oli);
                    medicalEditAccess = true;
                    if (
                        oli.Buyup_Product_Selection__c == 'Surest Only'
                        || oli.Buyup_Product_Selection__c == 'Surest & UNET'
                    ) {
                        ow.showCPWSection = true;
                    }
                    
                    
                    if (oli.Product2.Surest_Applicable_Products__c == 'Not Available for Surest') {
                        ow.isTraditionalProductMed = true;
                    }
                    if (oli.Product2.Surest_Applicable_Products__c == 'Available for Surest only') {
                        ow.isSurestProductMed = true;
                    }
                }

                /*if (
                    oli.Buyup_Product_Selection__c == 'Surest Only'
                    || oli.Buyup_Product_Selection__c == 'Surest & UNET'
                ) {
                    ow.showCPWSection = true;
                }*/
            }

            /* ---------------- DENTAL ---------------- */
            else if (oli.Product_Line__c == 'Dental') {

                if (
                    OppDatarec.Sales_Stage_Dental__c != 'Notified'
                    && OppDatarec.Sales_Stage_Dental__c != 'Spin-Off'
                    && OppDatarec.Sales_Stage_Dental__c != 'Transfer In/Out'
                    && OppDatarec.Disposition_Dental__c != 'Dead Pending Transfer'
                    && OppDatarec.Disposition_Dental__c != 'Dead Spin-Off'
                ) {
                    ow.dentallineitem.add(oli);
                }
                else if (
                    (OppDatarec.Sales_Stage_Dental__c == 'Notified'
                        && OppDatarec.Disposition_Dental__c == 'Sold'
                        && oli.Sold_Retained_Members__c != 0)
                    || (OppDatarec.Sales_Stage_Dental__c == 'Spin-Off'
                        && OppDatarec.Disposition_Dental__c == 'Spin-Off')
                    || (OppDatarec.Sales_Stage_Dental__c == 'Transfer In/Out'
                        && OppDatarec.Disposition_Dental__c == 'Transfer In')
                ) {
                    ow.dentallineitem.add(oli);
                dentalEditAccess = true;
                }

                if (oli.Buyup_Product_Selection__c == 'Surest & UNET') {
                    ow.isTradSoldDental = true;
                    ow.isSurestSoldDental = true;
                    }
                else if (oli.Buyup_Product_Selection__c == 'UNET or UMR Only') {
                    ow.isTradSoldDental = true;
                    }
                else if (oli.Buyup_Product_Selection__c == 'Surest only') {
                    ow.isSurestSoldDental = true;
                    }
                }

            /* ---------------- VISION ---------------- */
            else if (oli.Product_Line__c == 'Vision') {

                if (
                    OppDatarec.Sales_Stage_Vision__c != 'Notified'
                    && OppDatarec.Sales_Stage_Vision__c != 'Spin-Off'
                    && OppDatarec.Sales_Stage_Vision__c != 'Transfer In/Out'
                    && OppDatarec.Disposition_Vision__c != 'Dead Pending Transfer'
                    && OppDatarec.Disposition_Vision__c != 'Dead Spin-Off'
                ) {
                    ow.visionlineitem.add(oli);
                }
                else if (
                    (OppDatarec.Sales_Stage_Vision__c == 'Notified'
                        && OppDatarec.Disposition_Vision__c == 'Sold'
                        && oli.Sold_Retained_Members__c != 0)
                    || (OppDatarec.Sales_Stage_Vision__c == 'Spin-Off'
                        && OppDatarec.Disposition_Vision__c == 'Spin-Off')
                    || (OppDatarec.Sales_Stage_Vision__c == 'Transfer In/Out'
                        && OppDatarec.Disposition_Vision__c == 'Transfer In')
                ) {
                    ow.visionlineitem.add(oli);
                    visionEditAccess = true;
                }

                if (oli.Buyup_Product_Selection__c == 'Surest & UNET') {
                    ow.isTradSoldVision = true;
                    ow.isSurestSoldVision = true;
                    }
                else if (oli.Buyup_Product_Selection__c == 'UNET or UMR Only') {
                    ow.isTradSoldVision = true;
                    }
                else if (oli.Buyup_Product_Selection__c == 'Surest only') {
                    ow.isSurestSoldVision = true;
                    }
                }

            /* ---------------- PHARMACY ---------------- */
            else if (oli.Product_Line__c == 'Pharmacy') {

                if (
                    OppDatarec.Sales_Stage_Pharmacy__c != 'Notified'
                    && OppDatarec.Sales_Stage_Pharmacy__c != 'Spin-Off'
                    && OppDatarec.Sales_Stage_Pharmacy__c != 'Transfer In/Out'
                    && OppDatarec.Disposition_Pharmacy__c != 'Dead Pending Transfer'
                    && OppDatarec.Disposition_Pharmacy__c != 'Dead Spin-Off'
                ) {
                    ow.pharmacylineitem.add(oli);
                }
                else if (
                    (OppDatarec.Sales_Stage_Pharmacy__c == 'Notified'
                        && OppDatarec.Disposition_Pharmacy__c == 'Sold'
                        && oli.Sold_Retained_Members__c != 0)
                    || (OppDatarec.Sales_Stage_Pharmacy__c == 'Spin-Off'
                        && OppDatarec.Disposition_Pharmacy__c == 'Spin-Off')
                    || (OppDatarec.Sales_Stage_Pharmacy__c == 'Transfer In/Out'
                        && OppDatarec.Disposition_Pharmacy__c == 'Transfer In')
                ) {
                    ow.pharmacylineitem.add(oli);
                pharmacyEditAccess = true;
                }

                if (oli.Product2.Surest_Applicable_Products__c == 'Not Available for Surest') {
                    ow.isTraditionalProductPharmacy = true;
                    }
                if (oli.Product2.Surest_Applicable_Products__c == 'Available for Surest only') {
                    ow.isSurestProductPharmacy = true;
            }
            }

            /* ---------------- OTHER ---------------- */
            else if (oli.Product_Line__c == 'Other') {
                
                // 🔹 First handle dead exclusions
                if (
                    oli.Disposition_Other_Buy_Up_Programs__c == 'Dead Pending Transfer'
                    || oli.Disposition_Other_Buy_Up_Programs__c == 'Dead Spin-Off'
                    || oli.Disposition_Other_Buy_Up_Programs__c == 'Transfer Out'
                ) {
                    continue;
                }
                
                // 🔹 Sales Stage Dependent Filtering
                if (OppDatarec.Sales_Stage_Other__c == 'Notified'
                    || OppDatarec.Sales_Stage_Other__c == 'Spin-Off'
                    || OppDatarec.Sales_Stage_Other__c == 'Transfer In/Out') {
                        
                        if (
                            (oli.Disposition_Other_Buy_Up_Programs__c == 'Sold'
                             && oli.Sold_Retained_Members__c != 0)
                            || oli.Disposition_Other_Buy_Up_Programs__c == 'Transfer In'
                            || oli.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off'
                            || oli.Disposition_Other_Buy_Up_Programs__c == 'TBD (New Clients Only)'
                        ) {
                            ow.otheropplineitems.add(oli);
                        }
                        
                        ow.otherProductsStatus = 'Sold';
                    }
                else {
                    // Pre-notified branch
                    ow.otheropplineitems.add(oli);
                    ow.otherProductsStatus = 'TBD';
                }
                
                // 🔹 Specialty Products Rule
                if (oli.Product2.Family == 'Specialty Products'
                    && (oli.Disposition_Other_Buy_Up_Programs__c == 'Sold'
                        || oli.Disposition_Other_Buy_Up_Programs__c == 'Transfer In'
                        || oli.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off')) {
                            
                            ow.otherProductsStatus = 'Sold';
                        }
                
                // 🔹 Edit Access Rule
                if (oli.Disposition_Other_Buy_Up_Programs__c == 'Sold') {
                    otherEditAccess = true;
                }
                
                // 🔹 Buyup Product Selection Logic
                if (oli.Buyup_Product_Selection__c == 'Surest & UNET') {
                    ow.isTradSoldOther = true;
                    ow.isSurestSoldOther = true;
                    }
                else if (oli.Buyup_Product_Selection__c == 'UNET or UMR Only') {
                    ow.isTradSoldOther = true;
                    }
                else if (oli.Buyup_Product_Selection__c == 'Surest only') {
                    ow.isSurestSoldOther = true;
                    }
                }
        }

        /* =====================================================
           STATUS VALUES (TBD / SOLD / SPIN-OFF / TRANSFER)
        ===================================================== */

        // MEDICAL
        ow.MedidiscValue = 'TBD';
        if (OppDatarec.Sales_Stage_Medical__c == 'Spin-Off' && OppDatarec.Disposition_Medical__c == 'Spin-Off') {
            ow.MedidiscValue = 'Spin-Off';
        }
        if (
            OppDatarec.Sales_Stage_Medical__c == 'Transfer In/Out'
            && OppDatarec.Disposition_Medical__c == 'Transfer In'
        ) {
            ow.MedidiscValue = 'Transfer In';
        }
        if (
            OppDatarec.Sales_Stage_Medical__c == 'Notified'
            && OppDatarec.Disposition_Medical__c == 'Sold'
        ) {
            ow.MedidiscValue = 'Sold';
        }

        // DENTAL
        ow.dentdiscvalue = 'TBD';
        if (OppDatarec.Sales_Stage_Dental__c == 'Spin-Off' && OppDatarec.Disposition_Dental__c == 'Spin-Off') {
            ow.dentdiscvalue = 'Spin-Off';
        }
        if (
            OppDatarec.Sales_Stage_Dental__c == 'Transfer In/Out'
            && OppDatarec.Disposition_Dental__c == 'Transfer In'
        ) {
            ow.dentdiscvalue = 'Transfer In';
        }
        if (
            OppDatarec.Sales_Stage_Dental__c == 'Notified'
            && OppDatarec.Disposition_Dental__c == 'Sold'
        ) {
            ow.dentdiscvalue = 'Sold';
        }

        // VISION
        ow.visiondiscvalue = 'TBD';
        if (OppDatarec.Sales_Stage_Vision__c == 'Spin-Off' && OppDatarec.Disposition_Vision__c == 'Spin-Off') {
            ow.visiondiscvalue = 'Spin-Off';
        }
        if (
            OppDatarec.Sales_Stage_Vision__c == 'Transfer In/Out'
            && OppDatarec.Disposition_Vision__c == 'Transfer In'
        ) {
            ow.visiondiscvalue = 'Transfer In';
                    }
        if (
            OppDatarec.Sales_Stage_Vision__c == 'Notified'
            && OppDatarec.Disposition_Vision__c == 'Sold'
        ) {
            ow.visiondiscvalue = 'Sold';
                    }

        // PHARMACY
        ow.pharmdiscvalue = 'TBD';
        if (OppDatarec.Sales_Stage_Pharmacy__c == 'Spin-Off' && OppDatarec.Disposition_Pharmacy__c == 'Spin-Off') {
            ow.pharmdiscvalue = 'Spin-Off';
                }
        if (
            OppDatarec.Sales_Stage_Pharmacy__c == 'Transfer In/Out'
            && OppDatarec.Disposition_Pharmacy__c == 'Transfer In'
        ) {
            ow.pharmdiscvalue = 'Transfer In';
                }
        if (
            OppDatarec.Sales_Stage_Pharmacy__c == 'Notified'
            && OppDatarec.Disposition_Pharmacy__c == 'Sold'
        ) {
            ow.pharmdiscvalue = 'Sold';
        }

        // OTHER
        ow.otherProductsStatus = 'TBD';
        if (
            OppDatarec.Sales_Stage_Other__c == 'Notified'
            || OppDatarec.Sales_Stage_Other__c == 'Spin-Off'
            || OppDatarec.Sales_Stage_Other__c == 'Transfer In/Out'
        ) {
            ow.otherProductsStatus = 'Sold';
                }
        for (OpportunityLineItem oli : ow.otheropplineitems) {
            if (
                oli.Product2.Family == 'Specialty Products'
                && (
                    oli.Disposition_Other_Buy_Up_Programs__c == 'Sold'
                    || oli.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off'
                    || oli.Disposition_Other_Buy_Up_Programs__c == 'Transfer In'
					|| oli.Disposition_Other_Buy_Up_Programs__c == 'TBD (New Clients Only)'
                )
            ) {
                ow.otherProductsStatus = 'Sold';
                break;
            }
        }

        /* =====================================================
           EDIT ACCESS
        ===================================================== */
        ow.hasEditAccess =
            medicalEditAccess
            || dentalEditAccess
            || visionEditAccess
            || pharmacyEditAccess
            || otherEditAccess;

        String profileName =
            [SELECT Profile.Name FROM User WHERE Id = :UserInfo.getUserId()]
                .Profile.Name;

        if (
            profileName == 'General Executives'
            || profileName == 'Senior Executives'
            || profileName == 'Benefit Strategist'
        ) {
            ow.hasEditAccess = false;
        }

        /* =====================================================
           METADATA + FINALIZE
        ===================================================== */
        String[] specifyBankAdminList = new List<String>();
            String[] listAppliCustomList = new List<String>();
            String[] indicateVendorList = new List<String>();
            String[] providePlanCodeList = new List<String>();
            SCC_Level_2_Hover_Help__mdt[] sccHoverHelpMdt = [Select DeveloperName,Indicate_Vendor__c,List_any_applicable_customization__c,
                                                             Provide_plan_code_in_text_box__c,Specify_Bank_Administrator__c from SCC_Level_2_Hover_Help__mdt 
                                                             LIMIT: Limits.getLimitQueryRows()-Limits.getQueryRows()];
            ow.sccHoverHelp = sccHoverHelpMdt;
            
            if(sccHoverHelpMdt != null){
                for(SCC_Level_2_Hover_Help__mdt sccMdt : sccHoverHelpMdt){
                    if(sccMdt != null){
                        if(sccMdt.DeveloperName != null){
                            if(sccMdt.Indicate_Vendor__c != null){
                                indicateVendorList = sccMdt.Indicate_Vendor__c.split(';');
                            }
                            if(sccMdt.List_any_applicable_customization__c != null){
                                listAppliCustomList = sccMdt.List_any_applicable_customization__c.split(';');
                            }
                            if(sccMdt.Provide_plan_code_in_text_box__c != null){
                                providePlanCodeList = sccMdt.Provide_plan_code_in_text_box__c.split(';');
            }
                            if(sccMdt.Specify_Bank_Administrator__c != null){
                                specifyBankAdminList = sccMdt.Specify_Bank_Administrator__c.split(';');
                            }
                        }
                    }
                } 
				}

        ow.soldCaseInstructions = [
            SELECT Field_Api_Name__c, Help_Text_Value__c
                                                                               FROM Sold_Case_Check_List_Help_Texts__mdt 
        ];

        ow.auditTrailSettingList = [
            SELECT DeveloperName, Value__c
            FROM Sold_Case_Checklist_Audit_Trail_Setting__mdt
            WHERE DeveloperName IN (
                'Opportunity_ObjPrprtyFldApiName_Mapping',
                'Account_ObjPrprtyFldApiName_Mapping',
                'OppLineItem_ObjPrprtyFldApiName_Mapping'
            )
        ];

        scc.CPW__c = ow.showCPWSection;
        ow.loggedInUserId = UserInfo.getUserId();
        ow.pickListValuesList = getOppItemPickListValues('Flex_Options__c');
		
		/* =====================================================
   GLOBAL TRADITIONAL / SUREST FLAGS (RESTORED)
===================================================== */

Boolean isTraditionalProdAll =
    ow.isTraditionalProductMed
    || ow.isTraditionalProductPharmacy
    || ow.isTradSoldDental
    || ow.isTradSoldVision
    || ow.isTradSoldOther;

Boolean isSurestProdAll =
    ow.isSurestProductMed
    || ow.isSurestProductPharmacy
    || ow.isSurestSoldDental
    || ow.isSurestSoldVision
    || ow.isSurestSoldOther;

ow.isTraditionalProdAll = isTraditionalProdAll;
ow.isSurestProdAll = isSurestProdAll;

        return ow;
    }


    /* =====================================================
       HELPERS
    ===================================================== */

    private static void updateSurestFlags(
        OpportunityLineItem oli,
        oppwrapperclass ow,
        String type
    ) {
        if (oli.Buyup_Product_Selection__c == 'Surest & UNET') {
            setFlags(ow, type, true, true);
        }
        else if (oli.Buyup_Product_Selection__c == 'Surest only') {
            setFlags(ow, type, false, true);
        }
        else if (oli.Buyup_Product_Selection__c == 'UNET or UMR Only') {
            setFlags(ow, type, true, false);
        }
    }

    private static void setFlags(
        oppwrapperclass ow,
        String type,
        Boolean trad,
        Boolean surest
    ) {
        if (type == 'Dental') {
            ow.isTradSoldDental |= trad;
            ow.isSurestSoldDental |= surest;
        }
        else if (type == 'Vision') {
            ow.isTradSoldVision |= trad;
            ow.isSurestSoldVision |= surest;
        }
        else if (type == 'Other') {
            ow.isTradSoldOther |= trad;
            ow.isSurestSoldOther |= surest;
        }
    } 
    
    //-------------------------------------------SAMARTH SCC 2021-------------------------------------------
    /*@AuraEnabled
public static void updateBasePrograms(Id recId){
recId = String.escapeSingleQuotes(recId);

List<OpportunityLineItem> oliList = new List<OpportunityLineItem>();
List<Sold_Case_Checklist__c> sccUpdateList = new List<Sold_Case_Checklist__c>();

oliList = [SELECT Id, Product_Line__c, Product2.Name, OpportunityId 
FROM OpportunityLineItem 
WHERE OpportunityId =:recId AND Product_Line__c ='Other'];

Id sccId = [SELECT Id FROM Sold_Case_Checklist__c 
WHERE Membership_Activity__c =: recId ].Id;

Boolean stdComm;
Boolean wellness;
Boolean advocacy;
for(OpportunityLineItem oli : oliList){
if(oli.Product2.Name == 'Engagement Solutions'){
stdComm = true;
}

if(oli.Product2.Name == 'Wellness - Rally (Engage Buy Up)' || oli.Product2.Name == 'Wellness - Rally (Premium Buy Up)'){
wellness = true;
}

if(oli.Product2.Name == 'Advocacy - Advocate4Me - Elite - Dedicated' || oli.Product2.Name == 'Advocacy - Advocate4Me - Elite - Highly Designated' ||
oli.Product2.Name == 'Advocacy - Advocate4Me - Premier - Dedicated' || oli.Product2.Name == 'Advocacy - Advocate4Me - Premier - Highly Designated')
{
advocacy = true;
}
}

if(stdComm == true || wellness == true || advocacy == true){
Sold_Case_Checklist__c sccObj = new Sold_Case_Checklist__c();
if(sccId != null){
sccObj.Id = sccId;
}

if(stdComm == true && sccObj.Standard_Communications__c != null){
sccObj.Standard_Communications__c = String.escapeSingleQuotes(OPT_OUT_TXT);
}
if(wellness == true && sccObj.Rally_Base__c != null){
sccObj.Rally_Base__c = String.escapeSingleQuotes(OPT_OUT_TXT);
}
if(advocacy == true && sccObj.A4Me_Core__c != null){
sccObj.A4Me_Core__c = String.escapeSingleQuotes(OPT_OUT_TXT);
}
sccUpdateList.add(sccObj);
}

if(sccUpdateList.size()>0){
update sccUpdateList;
}
}*/
    //-------------------------------------------SAMARTH SCC 2021-------------------------------------------
    
    @AuraEnabled(cacheable=true)
    public static Usersearchwrapper accsearch(string searchParam, String searchField)
    {
        String ipmStandardProfile = 'IPM Standard Profile';
        String ipmAdvancedProfile = 'IPM Advanced Profile';
        Usersearchwrapper userwrap = new Usersearchwrapper();
        userwrap.LocationIcon = 'standard:user';
        
        String queryUsers = '';
        if(searchField == 'IPM') {
            queryUsers = 'SELECT Id, Name FROM User Where IsActive = true AND (Profile.Name LIKE:ipmStandardProfile OR Profile.Name LIKE:ipmAdvancedProfile) AND name like \'%'+String.escapeSingleQuotes(searchParam)+'%\' Limit 5';
        } else {
            queryUsers ='select name,id from User where IsActive = true AND name like \'%'+String.escapeSingleQuotes(searchParam)+'%\' Limit 5';
        }
        List<User> userlist = Database.Query(queryUsers);
        userwrap.UserData = userlist;
        return userwrap;
    }
    
    @AuraEnabled(cacheable=true)
    public static IncumbentSearchWrapper incumbentSearch(string searchParam, String searchField)
    {
        IncumbentSearchWrapper incWrap = new IncumbentSearchWrapper();
        incWrap.LocationIcon = 'standard:account';
        
        String queryAccs = '';
        if(searchField == 'Incumbent Primary (Medical)' || searchField == 'Incumbent Primary (Pharmacy)' || searchField == 'Incumbent Primary (Dental)' || searchField == 'Incumbent Primary (Vision)'){
            queryAccs ='select name,id from Account where name like \'%'+String.escapeSingleQuotes(searchParam)+'%\' Limit 5';
        }
        
        List<Account> acclist = Database.Query(queryAccs);
        incWrap.AccData = acclist;
        return incWrap;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static metadatawrapper metadatasearch(string searchParam)
    {  
        metadatawrapper metadatawrap = new metadatawrapper();
        metadatawrap.LocationIcon = 'standard:user';        
        string queryStr ='select Underwriter_Name__c,id from Underwriter_Data__mdt where Underwriter_Name__c like \'%'+String.escapeSingleQuotes(searchParam)+'%\' Limit 5';
        List<Underwriter_Data__mdt> metdatalist = Database.Query(queryStr);
        metadatawrap.Metadatalist = metdatalist;
        return metadatawrap;
    }
    
    @AuraEnabled
    public static Opportunity UpdateSoldCheckList(Opportunity Updateddata,Account accupdate,List<OpportunityLineItem> opplineitem,
                                                  List<Audit_Trail__c> auditTrailListToInsert,Sold_Case_Checklist__c updatedSoldCaseData)
    {
        /*system.debug('Updateddata?????'+Updateddata);
system.debug('updatedSoldCaseData '+updatedSoldCaseData);
system.debug('auditTrailListToInsert '+auditTrailListToInsert);*/
        system.debug('opplineitem = '+opplineitem);
        system.debug('updatedSoldCaseData = '+updatedSoldCaseData);
        system.debug('Updateddata = '+Updateddata);
        system.debug('accupdate = '+accupdate);
        
        //-----------------------------------------SAMARTH SCC 2021-----------------------------------------
        if(updatedSoldCaseData.Historic_Data__c != 'Medical' && updatedSoldCaseData.Historic_Data__c != 'Rx' && updatedSoldCaseData.Historic_Data__c != 'Both'){
            updatedSoldCaseData.Historic_Data_Medical_or_Rx__c = ''; 
        }
        
        if(updatedSoldCaseData.Extended_Network_Access__c != 'Yes' && updatedSoldCaseData.Extended_Network_Access__c != 'Yes'){
            updatedSoldCaseData.Extended_Network_Access_Level2__c = ''; 
        }
        
        if(updatedSoldCaseData.Pre_Implementation_Audit__c != 'Yes'){
            updatedSoldCaseData.Pre_Implementation_Audit_Level_2__c = '';
            updatedSoldCaseData.Pre_Implementation_Audit_Write_In__c = '';
        }

        if(updatedSoldCaseData.Surest_Pre_Implementation_Audit__c != 'Yes'){
            updatedSoldCaseData.Surest_Pre_Implementation_Audit_Level_2__c = '';
            updatedSoldCaseData.Surest_Pre_Implementation_Audit_Write_In__c = '';
        }
        
        if(updatedSoldCaseData.Claim_Fiduciary__c != 'Other'){
            updatedSoldCaseData.Claim_Fiduciary_Other__c = ''; 
        }
        
        if(updatedSoldCaseData.Offshore_Provisions__c != 'Level 0 Individual Functions'){
            updatedSoldCaseData.Offshore_Provisions_Level_0__c = ''; 
        }
        
        if(updatedSoldCaseData.Offshore_Provisions__c != 'Level 7 All Business Operations and It Work'){
            updatedSoldCaseData.Offshore_Provisions_Level_7__c = ''; 
        }

        if(updatedSoldCaseData.Surest_Offshore_Provisions__c != 'Level 0 Individual Functions'){
            updatedSoldCaseData.Surest_Offshore_Provisions_Level_0__c = ''; 
        }
        
        if(updatedSoldCaseData.Surest_Offshore_Provisions__c != 'Level 7 All Business Operations and It Work'){
            updatedSoldCaseData.Surest_Offshore_Provisions_Level_7__c = ''; 
        }
        
        if(updatedSoldCaseData.Rx_Coalition__c != 'Other'){
            updatedSoldCaseData.Rx_Coalition_Other__c = ''; 
        }
        
        if(updatedSoldCaseData.Passport_Connect_with_Harvard_Pilgrim__c == 'No'){
            updatedSoldCaseData.HP_Sold_Retained_Members__c = '';
            updatedSoldCaseData.HP_Alliance__c = '';
            updatedSoldCaseData.Preferred_HP__c = '';
        }
        
        if(updatedSoldCaseData.Medical_Necessity__c != 'Yes'){
            updatedSoldCaseData.Genetic_Testing_Prior_Authorization__c = '';
            updatedSoldCaseData.Inflammatory_Medication_Site_of_Care__c = '';
            updatedSoldCaseData.Functional_Endoscopic_Sinus_Surgery_FESS__c = '';
            updatedSoldCaseData.Hysterectomy__c = '';
            updatedSoldCaseData.Sinuplasty__c = '';
        }
        
        if(updatedSoldCaseData.CAA_IDR_Service_Fees__c != 'Carve-out' && updatedSoldCaseData.CAA_IDR_Service_Fees__c != 'EMT Approval'){
            system.debug('updatedSoldCaseData.CAA_IDR_Service_Fees__c '+updatedSoldCaseData.CAA_IDR_Service_Fees__c);
            updatedSoldCaseData.CAA_Service_Fees_Write_In__c = ''; 
        }
        if(updatedSoldCaseData.Surest_CAA_IDR_Service_Fees__c != 'Carve-out' && updatedSoldCaseData.Surest_CAA_IDR_Service_Fees__c != 'EMT Approval'){
            updatedSoldCaseData.Surest_CAA_IDR_Service_Fees_Write_In__c = ''; 
        }
        if (opplineitem != null && !opplineitem.isEmpty()) {
        for(OpportunityLineItem oli : opplineitem){
            //purging data of level 2 hover help - START
            if(oli.Level_2_Option__c == 'Standard' || oli.Level_2_Option__c == 'Optum Bank' || oli.Level_2_Option__c == 'Carve in - OptumRx' || 
               oli.Level_2_Option__c == 'Carve In - OneRx' || oli.Level_2_Option__c == 'Carve out Flex - OptumRx' || oli.Level_2_Option__c == 'Carve out - OptumRx'){
                   system.debug('oli.Level_2_Option__c '+oli.Level_2_Option__c);
                   oli.Level2_Info__c = '';
               }
            if(oli.Level_2_Option__c == 'Carve in - OptumRx' || oli.Level_2_Option__c == 'Carve In-OneRx' || oli.Level_2_Option__c == 'Carve in - OneRx' || oli.Level_2_Option__c == 'Carve Out'){
                oli.Pharmacy_Carve_Out_DropDown__c = '';
            }
            //purging data of level 2 hover help - END
            
            if(oli.Transplant_TRS_COE__c == 'Opt Out'){
                oli.Non_Extra_Contractual_Transplant__c = null;
            }            
            
            //purging data of OON Section - START
            if(oli.MNRP__c == 'N/A'){
                oli.MNRP_Percentage__c = null;
            }
            
            if(oli.MNRP_DME__c == 'N/A'){
                oli.MNRP_DME_Percentage__c = '';
                oli.MNRP_DME_Nonstd_Percentage__c = null;
            }
            if(oli.MNRP_DME_Percentage__c != 'Nonstandard'){
                oli.MNRP_DME_Nonstd_Percentage__c = null;
            }
            
            if(oli.MNRP_Lab__c == 'N/A'){
                oli.MNRP_Lab_Percentage__c = '';
                oli.MNRP_Lab_Nonstd_Percentage__c = null;
            }
            if(oli.MNRP_Lab_Percentage__c != 'Nonstandard'){
                oli.MNRP_Lab_Nonstd_Percentage__c = null;
            }
            
            if(oli.MNRP_Default_of_Billed_Charges__c == 'N/A'){
                oli.MNRP_Dfault_of_Billd_Chrges_Percentage__c = '';
                oli.MNRP_Default_Nonstd_Percentage__c = null;
            }
            if(oli.MNRP_Dfault_of_Billd_Chrges_Percentage__c != 'Other'){
                oli.MNRP_Default_Nonstd_Percentage__c = null;
            }
            
            if(oli.Physician_R_C_OON__c == 'N/A'){
                oli.Physician_R_C_OON_Percentage__c = null;
            }
            
            if(oli.Facility_R_C__c == 'N/A'){
                oli.Facility_R_C_Percentage__c = null;
            }
            
            if(oli.ENRP__c == 'N/A'){
                oli.ENRP_Percentage__c = null;
            }
            
            if(oli.ENRP_Default_of_Billed_Charge__c == 'N/A'){
                oli.ENRP_Dfault_of_Billd_Chrges_Percentage__c = null;
            }
            //purging data of OON Section - END
        }
        //-----------------------------------------SAMARTH SCC 2021-----------------------------------------
        }
        try{
            List<SObject> Objectupdate = new List<SObject>();
            // Objectupdate.add(Updateddata);
            // Objectupdate.add(accupdate);
            // Objectupdate.add(updatedSoldCaseData);
            // Objectupdate.addALL(opplineitem);
            if (Updateddata != null) {
                Objectupdate.add(Updateddata);
            }
        
            if (accupdate != null) {
                Objectupdate.add(accupdate);
            }
        
            if (updatedSoldCaseData != null) {
                Objectupdate.add(updatedSoldCaseData);
            }
        
            if (opplineitem != null && !opplineitem.isEmpty()) {
                Objectupdate.addALL(opplineitem);
            }
            
            /* update Updateddata;     
                update accupdate;
                update opplineitem;*/
            
            //update as USER Objectupdate;
            Database.SaveResult[] srList = Database.update(Objectupdate, false);
            
            // Iterate through each returned result
            for (Database.SaveResult sr : srList) {
                if (sr.isSuccess()) {
                    // Operation was successful, so get the ID of the record that was processed
                    System.debug('Successfully inserted account. Account ID: ' + sr.getId());
                }
                else {
                    // Operation failed, so get all errors                
                    for(Database.Error err : sr.getErrors()) {
                        System.debug('The following error has occurred.');                    
                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                        System.debug('Account fields that affected this error: ' + err.getFields());
                    }
                }
            }
            
            //--------- code added for SoldCase Audit Trail - start -----------
            if(auditTrailListToInsert!=null && !auditTrailListToInsert.isEmpty()){
                insertAuditTrailRecords(auditTrailListToInsert);
            }
            //--------- code added for SoldCase Audit Trail - end -----------
            
        }catch(Exception excpn){
            System.debug('Exception occured in UpdateSoldCheckList() method==> '+excpn.getMessage());
        }
        return Updateddata;
    }
    
    //--------- method added for SoldCase Audit Trail - start -----------
    public static void insertAuditTrailRecords(List<Audit_Trail__c> auditTrailListToInsert){
        system.debug('auditTrailListToInsert '+auditTrailListToInsert);
        List<Audit_Trail__c> uniqueRecords = new List<Audit_Trail__c>();
        
        for(Audit_Trail__c objAuditTrail : auditTrailListToInsert){
            if(objAuditTrail.New_Value__c.trim() != objAuditTrail.Original_Value__c.trim()){
                uniqueRecords.add(objAuditTrail);
            }
        }
        
        Database.SaveResult[] insertResultList = Database.insert(uniqueRecords, false);
        
        
        // Iterate through each returned result
        for (Database.SaveResult eachInsertResult : insertResultList) {
            if (eachInsertResult.isSuccess()) {
                System.debug('Successfully inserted audit trail. Audit Trail ID: ' + eachInsertResult.getId());
                
            }
            else {
                for(Database.Error err : eachInsertResult.getErrors()) {
                    System.debug('The following error has occurred.');                    
                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                    System.debug('Account fields that affected this error: ' + err.getFields());
                }
            }
            
        } 
        
        
    }
    
    
    //--------- method added for SoldCase Audit Trail - end -----------
    
    @AuraEnabled
    public static soldCaseChecklistWrapper getTemplateInXML(){
        
        soldCaseChecklistWrapper soldCaseWrapper = new soldCaseChecklistWrapper();
        String objectName  = '';  
        StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'SoldCaseChecklist_Print'];
        String xmlBodyString = sr.body.toString();
        
        //Map<String,String> OBJECT_FILTER_RECORDS = IConstantsTemplate.OBJECT_FILTER_RECORDS;
        
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
        soldCaseWrapper.xmlString = xmlBodyString;
        soldCaseWrapper.objectItags = objectItagesMap;
        
        return soldCaseWrapper;
        
    }
    
    @AuraEnabled
    public static String getSoldcasePdf(String recordId){
        PageReference pdf_page = new PageReference('/apex/SoldCaseCheckListPrint?Id='+recordId);
        Blob pdfBlob = pdf_page.getContentAsPDF();
        String base64Pdf = EncodingUtil.base64Encode(pdfBlob);
        return base64Pdf;
        
    }

    @AuraEnabled(cacheable=true)
    public static List<Policy_Information__c> getAccountPolicyInfoSurest(Id accountId) {
        List<Policy_Information__c> policyList = [SELECT Id, Name, Policy__c, Policy_Type__c, Policy_Status__c, Surest__c FROM Policy_Information__c WHERE Company__c = :accountId AND Surest__c = true AND Policy_Type__c INCLUDES ('Medical') AND Policy_Status__c = 'Active' WITH USER_MODE];
        
        return policyList;
    }

    @AuraEnabled(cacheable=true)
    public static List<Product2> getOtherBuyUpProducts() {
        List<Product2> productList = [SELECT Id,Name,Surest_Applicable_Products__c,ProductCode,Product_Category__c,Product_Line__c,Surest_Implementation_Lead_Time__c FROM Product2 WITH USER_MODE];
        
        return productList;
    }
    
    public class oppwrapperclass {
        @AuraEnabled
        public Opportunity oppdata {get;set;}
        @AuraEnabled
        public List<OpportunityLineItem> OppolineItemsList {get;set;}
        @AuraEnabled
        public List<OpportunityLineItem> otheropplineitems {get;set;}
        @AuraEnabled
        public List<OpportunityLineItem> medilineitem {get;set;}
        @AuraEnabled
        public List<OpportunityLineItem> dentallineitem {get;set;}
        @AuraEnabled
        public List<OpportunityLineItem> pharmacylineitem {get;set;}
        @AuraEnabled
        public List<OpportunityLineItem> visionlineitem {get;set;}
        @AuraEnabled
        public Account accrec {get;set;}
        @AuraEnabled
        public String MedidiscValue {get;set;}
        @AuraEnabled
        public String dentdiscvalue {get;set;}
        @AuraEnabled
        public String pharmdiscvalue {get;set;}
        @AuraEnabled
        public String visiondiscvalue {get;set;}
        
        @AuraEnabled
        public string otherProductsStatus {get;set;}
        
        @AuraEnabled
        public List<Sold_Case_Check_List_Help_Texts__mdt> soldCaseInstructions {get; set;}
        
        @AuraEnabled
        public List<SCC_Level_2_Hover_Help__mdt> sccHoverHelp {get;set;}
        
        @AuraEnabled
        public Boolean Net_Results_Not_Zero {get;set;}
        
        @AuraEnabled
        public Id cmRecTypeId {get;set;}

        @AuraEnabled
        public Boolean showCPWSection {get;set;}
        
        @AuraEnabled
        public Boolean isSurestProductMed {get;set;}

        @AuraEnabled
        public Boolean isTraditionalProductMed {get;set;}

        @AuraEnabled
        public Boolean isSurestProductPharmacy {get;set;}

        @AuraEnabled
        public Boolean isTraditionalProductPharmacy {get;set;}

        @AuraEnabled
        public Boolean isSurestSoldDental {get;set;}

        @AuraEnabled
        public Boolean isTradSoldDental {get;set;}

        @AuraEnabled
        public Boolean isSurestSoldVision {get;set;}

        @AuraEnabled
        public Boolean isTradSoldVision {get;set;}

        @AuraEnabled
        public Boolean isSurestSoldOther {get;set;}

        @AuraEnabled
        public Boolean isTradSoldOther {get;set;}

        @AuraEnabled
        public Boolean isSurestProdAll {get;set;}

        @AuraEnabled
        public Boolean isTraditionalProdAll {get;set;}
        
        /*@AuraEnabled
public List<String> specifyBankAdminList {get;set;}
@AuraEnabled
public List<String> listAppliCustomList {get;set;} 
@AuraEnabled
public List<String> indicateVendorList {get;set;} 
@AuraEnabled
public List<String> providePlanCodeList {get;set;}*/ 
        
        @AuraEnabled
        public Boolean hasEditAccess {get;set;}
        
        //--------- variables added for SoldCase Audit Trail - start -----------
        @AuraEnabled
        public String loggedInUserId{ get; set; }
        
        @AuraEnabled
        public List<Sold_Case_Checklist_Audit_Trail_Setting__mdt> auditTrailSettingList{ get; set; }
        //--------- variables added for SoldCase Audit Trail - end -----------
        
        
        //-----------------SOLD CASE CHECKLIST 2021 SAMARTH-----------------
        @AuraEnabled
        public Sold_Case_Checklist__c sccData {get; set;}
        //-----------------SOLD CASE CHECKLIST 2021 SAMARTH-----------------
        /* @AuraEnabled
public boolean isCMSCCTabVisible{ get; set; }*/
        
        @AuraEnabled
        public List<string> pickListValuesList { get; set; }
        
    }
    
    public class metadatawrapper{
        @AuraEnabled
        public string LocationIcon {get;set;}
        @AuraEnabled
        public List<Underwriter_Data__mdt> Metadatalist {get;set;}
    }
    
    public class Usersearchwrapper{
        @AuraEnabled
        public string LocationIcon {get;set;}
        @AuraEnabled
        public List<User> UserData {get;set;}
    }
    
    public class IncumbentSearchWrapper{
        @AuraEnabled
        public string LocationIcon {get;set;}
        @AuraEnabled
        public List<Account> AccData {get;set;}
    }
    
    public class soldCaseChecklistWrapper{
        
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        
        @AuraEnabled
        public String xmlString { get; set; }
        
    }
    
   
    
    public static List<string> getOppItemPickListValues(String fieldApiName){
        List<string> pickListValuesList= new List<string>();
       if(string.isNotBlank(fieldApiName)){
            Map<String, Schema.SObjectField> fieldsMap= OpportunityLineItem.getSobjectType().getDescribe().fields.getMap();
            List<Schema.PicklistEntry> ple = fieldsMap.get(fieldApiName).getDescribe().getPicklistValues();
            for(Schema.PicklistEntry pickListVal : ple){
                pickListValuesList.add(pickListVal.getValue());
            }
        }
        
        return pickListValuesList;
}
}