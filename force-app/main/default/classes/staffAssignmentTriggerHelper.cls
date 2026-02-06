/*** Purpose     : 1.Update Staffing Assignment field with respective staff when Staff User Assignment changed
				2. Create staff record when there is no staff available for the use
				3. Update Case management end date(Obj: Service AMT) with start date of staff assignment
* Class       : staffAssignmentTriggerHelper
* Test class  : staffAssignmentTriggerHelperTest
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
public class staffAssignmentTriggerHelper {
    public static boolean isRunUpdate= false;
    public static boolean isRunUpdate2= false;
    public static boolean isRunInsert = false;
    
    public static Id ipmAssignmentId = Schema.SObjectType.Staff_Assignment__c.getRecordTypeInfosByName().get('IPM Assignment').getRecordTypeId();
    public static Id policyAssignmentId = Schema.SObjectType.Staff_Assignment__c.getRecordTypeInfosByName().get('Policy Assignment').getRecordTypeId();
    public static Id csiSTaffId = Schema.SObjectType.Staff__c.getRecordTypeInfosByName().get('CSI Staff').getRecordTypeId();
    public static Id specialProjectId = Schema.SObjectType.Staff_Assignment__c.getRecordTypeInfosByName().get('Special Project').getRecordTypeId();
    
    /**
     * Name:staffAssignmentUpdate
     * Parameters: Map<Id,Staff_Assignment__c> newStaffAssignment,Map<Id,Staff_Assignment__c> oldStaffAssignment
     * Return: Void
     * Purpose: Update Staffing Assignment field with respective staff when Staff User Assignment changed
     * 
     * */
    public static void staffAssignmentUpdate(Map<Id,Staff_Assignment__c> newStaffAssignment,Map<Id,Staff_Assignment__c> oldStaffAssignment ){
        isRunUpdate=true;
        Map<Id,Staff_Assignment__c> filteredStaffAssignment = new Map<Id,Staff_Assignment__c>();
        Map<Id,Staff_Assignment__c> filteredStaffAssignment2 = new Map<Id,Staff_Assignment__c>();
        Map<Id, Id> staffMap = new Map<Id,Id>();
        Map<Id, Id> staffMap2 = new Map<Id,Id>();
        
        List<Staff_Assignment__c> finalStaffAssignmentList = new List<Staff_Assignment__c>();
        
        Map<Id, List<Policy_Information__c>> accVsPolicy = new Map<Id, List<Policy_Information__c>>();
        Map<Id , Policy_Information__c> idVsPolicy = new Map<Id , Policy_Information__c> ();
        Set<Id> companyIds = new Set<Id>();
        Set<Id> policyIds = new Set<Id>();
        List<Staff_Assignment__c> ipmStaffASsignments = new List<Staff_Assignment__c>();
        
        for(Staff_Assignment__c objStaff : newStaffAssignment.values()){
            companyIds.add(objStaff.Customer_Name__c);
            policyIds.add(objStaff.Medical_Policy_Number__c);
        }
        
        for(Policy_Information__c objPolicy : [SELECT Policy__c, Name,Company__c FROM Policy_Information__c WHERE Company__c IN: companyIds AND Policy_Status__c = 'Active']){
            if(objPolicy.Company__c != null ){
                if(accVsPolicy.get(objPolicy.Company__c) == null)
                    accVsPolicy.put(objPolicy.Company__c, new List<Policy_Information__c>());
                accVsPolicy.get(objPolicy.Company__c).add(objPolicy);
            }
            
            idVsPolicy.put(objPolicy.Id, objPolicy);
        }
        
        for( Id staffAssignment : newStaffAssignment.keySet() ){
            
            if(newStaffAssignment.get(staffAssignment).Medical_Policy_Number__c != null){
                Id policyId = newStaffAssignment.get(staffAssignment).Medical_Policy_Number__c;
                
                if(idVsPolicy.get(policyId) != null){
                    newStaffAssignment.get(staffAssignment).Related_Policy__c = idVsPolicy.get(policyId).Name;
                }else{
                    if(((newStaffAssignment.get(staffAssignment).Staff_User_Assignment__c != oldStaffAssignment.get(staffAssignment).Staff_User_Assignment__c && newStaffAssignment.get(staffAssignment).Staff_User_Assignment__c != null && newStaffAssignment.get(staffAssignment).Should_Extended_AMT_be_updated__c == true) ||
                       (newStaffAssignment.get(staffAssignment).Should_Extended_AMT_be_updated__c != oldStaffAssignment.get(staffAssignment).Should_Extended_AMT_be_updated__c && newStaffAssignment.get(staffAssignment).Should_Extended_AMT_be_updated__c == true && newStaffAssignment.get(staffAssignment).Staff_User_Assignment__c != null)) && 
                        newStaffAssignment.get(staffAssignment).RecordTypeId == policyAssignmentId){
                           newStaffAssignment.get(staffAssignment).Medical_Policy_Number__c.addError('Please select active policy.'); 
                       }
                }
            }else{
                
                
                if(accVsPolicy != null && accVsPolicy.get(newStaffAssignment.get(staffAssignment).Customer_Name__c)!=null && accVsPolicy.get(newStaffAssignment.get(staffAssignment).Customer_Name__c).size() > 0){
                    List<Policy_Information__c> relatedPolicyIfm = accVsPolicy.get(newStaffAssignment.get(staffAssignment).Customer_Name__c);
                    String policyInformation = '';
                    for( Policy_Information__c policy : relatedPolicyIfm ){
                        policyInformation = policy.Name+';'+policyInformation;
                    }
                    if(policyInformation != ''){
                        system.debug('inside remove');
                        policyInformation = policyInformation.removeEnd(';');
                    }
                    system.debug('policyInformation=='+policyInformation); 
                    newStaffAssignment.get(staffAssignment).Related_Policy__c  = policyInformation;
                }else{
                    if(newStaffAssignment.get(staffAssignment).Assignment_Type__c!='Special Project' && newStaffAssignment.get(staffAssignment).Customer_Name__c != null){
                    Id accId = newStaffAssignment.get(staffAssignment).Customer_Name__c;
                    Account account = [select Test_Type__c from Account where Id = :accId];
                    system.debug('type==='+account.Test_Type__c);
                    if(account.Test_Type__c == 'Existing Client'){
                        if(((newStaffAssignment.get(staffAssignment).Staff_User_Assignment__c != oldStaffAssignment.get(staffAssignment).Staff_User_Assignment__c && newStaffAssignment.get(staffAssignment).Staff_User_Assignment__c != null && newStaffAssignment.get(staffAssignment).Should_Extended_AMT_be_updated__c == true) ||
                           (newStaffAssignment.get(staffAssignment).Should_Extended_AMT_be_updated__c != oldStaffAssignment.get(staffAssignment).Should_Extended_AMT_be_updated__c && newStaffAssignment.get(staffAssignment).Should_Extended_AMT_be_updated__c == true && newStaffAssignment.get(staffAssignment).Staff_User_Assignment__c != null)) && 
                            newStaffAssignment.get(staffAssignment).RecordTypeId == policyAssignmentId){
                               newStaffAssignment.get(staffAssignment).Customer_Name__c.addError('Associated company does not have any active policies.');
                           }
                    }else{
                        newStaffAssignment.get(staffAssignment).Related_Policy__c  = ''; 
                    }
                    }
                }
                
            }
        }
       
        
        for( Id staffAssignment : newStaffAssignment.keySet() ){
            if(newStaffAssignment.get( staffAssignment ).RecordTypeId == policyAssignmentId){
                if(newStaffAssignment.get( staffAssignment ).Staff_User_Assignment__c!=null){
                    filteredStaffAssignment.put(newStaffAssignment.get( staffAssignment ).Staff_User_Assignment__c,newStaffAssignment.get( staffAssignment ));
                }else{
                    filteredStaffAssignment2.put(staffAssignment , newStaffAssignment.get( staffAssignment ));
                }
            }
            else if(newStaffAssignment.get( staffAssignment ).RecordTypeId == ipmAssignmentId){
                ipmStaffASsignments.add(newStaffAssignment.get( staffAssignment ));
            }
        }
        createIpmStaff(ipmStaffASsignments);
        if(!filteredStaffAssignment.isEmpty() && filteredStaffAssignment.size()>0){
            list<Staff__c>  staffList = [select Id, Staff_Name__c from Staff__c where Staff_Name__c in:filteredStaffAssignment.keyset() AND RecordTypeId =: csiSTaffId];
            if( staffList.size()>0){
                for(Integer i=0;i<staffList.size();i++){
                    staffMap.put(staffList[i].Staff_Name__c, staffList[i].Id);
                }
            }
        }
        for(id s : filteredStaffAssignment.keySet()){
            filteredStaffAssignment.get(s).Staffing_Assignment__c= staffMap.get(filteredStaffAssignment.get(s).Staff_User_Assignment__c);
        }
        if(!filteredStaffAssignment2.isEmpty() && filteredStaffAssignment2.size()>0){
            list<Staff__c>  staffList = [select Id, Staff_Name__c from Staff__c where Staff_Name__c in:filteredStaffAssignment2.keyset() AND RecordTypeId =: csiSTaffId];
            if( staffList.size()>0){
                for(Integer i=0;i<staffList.size();i++){
                    staffMap2.put(staffList[i].Staff_Name__c, staffList[i].Id);
                }
            }
        }
        for(id s : filteredStaffAssignment2.keySet()){
            filteredStaffAssignment2.get(s).Staffing_Assignment__c= staffMap2.get(filteredStaffAssignment2.get(s).Staff_User_Assignment__c);
        }
    }
    /**
     * Name:staffAssignmentInsert
     * Parameters: list<Staff_Assignment__c> newStaffAssignmentList
     * Return: Void
     * Purpose: create staff record when there is no staff available for the user
     * 
     * */
    public static void staffAssignmentInsert(list<Staff_Assignment__c> newStaffAssignmentList){
        isRunInsert=true;
        Map<Id,Staff_Assignment__c> filteredStaffAssignment = new Map<Id,Staff_Assignment__c>();
        Map<Id,Staff_Assignment__c> filteredStaffAssignment2 = new Map<Id,Staff_Assignment__c>();
        Map<Id,Staff_Assignment__c> filteredStaffAssignment3 = new Map<Id,Staff_Assignment__c>();
        Map<Id,Id> newStaffMap = new Map<Id,Id>();
        Map<Id,Id> existingStaffMap = new Map<Id,Id>(); 
        
        Map<Id, List<Policy_Information__c>> accVsPolicy = new Map<Id, List<Policy_Information__c>>();
        Map<Id , Policy_Information__c> idVsPolicy = new Map<Id , Policy_Information__c> ();
        Set<Id> policyIds = new Set<Id>();
        Set<Id> companyIds = new Set<Id>();
        List<Staff_Assignment__c> ipmStaffASsignments = new List<Staff_Assignment__c>();

        
        for(Staff_Assignment__c objStaff : newStaffAssignmentList){
            policyIds.add(objStaff.Medical_Policy_Number__c);
            companyIds.add(objStaff.Customer_Name__c);
            
            if(objStaff.RecordTypeId == ipmAssignmentId || objStaff.RecordTypeId == specialProjectId){
                ipmStaffASsignments.add(objStaff);
            }
        }
        createIpmStaff(ipmStaffASsignments);
        
        for(Policy_Information__c objPolicy : [SELECT Policy__c, Name,Company__c FROM Policy_Information__c WHERE (Company__c IN: companyIds OR Id IN: policyIds) AND Policy_Status__c = 'Active']){
            if(objPolicy.Company__c !=null ){
                if(accVsPolicy.get(objPolicy.Company__c) == null){
                    accVsPolicy.put(objPolicy.Company__c, new List<Policy_Information__c>());
                }
                accVsPolicy.get(objPolicy.Company__c).add(objPolicy);
            }
            idVsPolicy.put(objPolicy.Id, objPolicy);
        }
        
        for(Staff_Assignment__c s : newStaffAssignmentList){
            
            if(s.Medical_Policy_Number__c != null){
                Id policyId = s.Medical_Policy_Number__c;
                if(idVsPolicy.get(policyId) != null){
                    s.Related_Policy__c = idVsPolicy.get(policyId).Name; 
                }else{
                    if(s.Staff_User_Assignment__c != null && s.Should_Extended_AMT_be_updated__c == true && s.RecordTypeId == policyAssignmentId){
                        s.Medical_Policy_Number__c.addError('Please select active policy.'); 
                    }
                }
                
            }else{
                Id accountId = s.Customer_Name__c;
                
                if(accVsPolicy != null && accVsPolicy.get(s.Customer_Name__c)!= null && accVsPolicy.get(s.Customer_Name__c).size() > 0){
                    List<Policy_Information__c> relatedPolicyIfm = accVsPolicy.get(s.Customer_Name__c);
                    String policyInformation = '';
                    for( Policy_Information__c policy : relatedPolicyIfm ){
                        policyInformation = policy.Name+';'+policyInformation;
                    }
                    system.debug('policyInformation=='+policyInformation);
                    if(policyInformation != ''){
                        policyInformation = policyInformation.removeEnd(';');
                    }
                    
                    s.Related_Policy__c  = policyInformation;
                }else{
                    if(s.Assignment_Type__c!='Special Project' && s.Customer_Name__c != null && s.RecordTypeId == policyAssignmentId){
                        Id accId = s.Customer_Name__c;
                        Account account = [select Test_Type__c from Account where Id = :accId];
                        system.debug('type==='+account.Test_Type__c);
                        if(account.Test_Type__c == 'Existing Client'){
                            if(s.Staff_User_Assignment__c != null && s.Should_Extended_AMT_be_updated__c == true){
                                s.Customer_Name__c.addError('Associated company does not have any active policies.');   
                            }
                        }else{
                            s.Related_Policy__c  = ''; 
                        }
                    }
                }
                
            }
        }
        
        
        
        for(Staff_Assignment__c s : newStaffAssignmentList){
            if(s.RecordTypeId == policyAssignmentId){
                if(s.Staff_User_Assignment__c!=null && s.Staffing_Assignment__c !=null){
                    system.debug('Staff Id:'+s.Staffing_Assignment__r.Staff_Name__c+' Staff User Id: '+s.Staff_User_Assignment__c);
                    filteredStaffAssignment.put(s.Staff_User_Assignment__c,s);                            
                }else if(s.Staffing_Assignment__c ==null && s.Staff_User_Assignment__c!=null){
                    system.debug('Staff Id:'+s.Staffing_Assignment__c+' Staff User Id: '+s.Staff_User_Assignment__c);
                    filteredStaffAssignment3.put(s.Staff_User_Assignment__c,s);
                }else if(s.Staff_User_Assignment__c==null && s.Staffing_Assignment__c !=null){
                    filteredStaffAssignment2.put(s.Staffing_Assignment__c,s);
                }else if(s.Staff_User_Assignment__c==null && s.Staffing_Assignment__c==null){
                    s.Staff_User_Assignment__c.addError('Please select staff for the assignment.');
                }
            }
        }
        Map<Id, Id> staffMap = new Map<Id,Id>();
        Map<Id, Id> staffMap2 = new Map<Id,Id>();
        /** When user is available in staff assignment*/
        if(!filteredStaffAssignment.isempty() && filteredStaffAssignment.size()>0){
            list<Staff__c>  staffList = [select Id, Staff_Name__c from Staff__c where Staff_Name__c in:filteredStaffAssignment.keyset() AND RecordTypeId =: csiSTaffId];
            system.debug('staffList===='+staffList);
            if( staffList.size()>0){
                for(Integer i=0;i<staffList.size();i++){
                    staffMap.put(staffList[i].Staff_Name__c, staffList[i].Id);
                }
            }
            system.debug('staffMap====='+staffMap);
            for(Staff_Assignment__c s1: newStaffAssignmentList){
                system.debug('s1.Staff_User_Assignment__c====='+s1.Staff_User_Assignment__c);
                if(s1.Staffing_Assignment__c != staffMap.get(s1.Staff_User_Assignment__c)){
                    s1.Staff_User_Assignment__c.addError('Please select matching staff or leave this field blank.');
                }/*else{
                    s1.Staffing_Assignment__c=staffMap.get(s1.Staff_User_Assignment__c);
                } */               
            }
        }
        /** When user is not available in staff assignment*/
        if(!filteredStaffAssignment2.isempty() && filteredStaffAssignment2.size()>0){
            list<Staff__c>  staffList2 = [select Id, Staff_Name__c from Staff__c where Id in:filteredStaffAssignment2.keyset() AND RecordTypeId =: csiSTaffId];
            if( !staffList2.isempty() && staffList2.size()>0){
                for(Integer i=0;i<staffList2.size();i++){
                    staffMap2.put(staffList2[i].Id,staffList2[i].Staff_Name__c);
                }
                for(Staff_Assignment__c s1: newStaffAssignmentList){
                    s1.Staff_User_Assignment__c=staffMap2.get(s1.Staffing_Assignment__c);
                }
            }
        }
        /** when staff is not availabel*/
        if(!filteredStaffAssignment3.isempty() && filteredStaffAssignment3.size()>0){
            system.debug('User Keyset: '+filteredStaffAssignment3.keyset());
            list<Staff__c> existingStaff = [select Id, Staff_Name__c from Staff__c where Staff_Name__c in:filteredStaffAssignment3.keyset() AND RecordTypeId =: csiSTaffId];
            for(Staff__c es:existingStaff){
                existingStaffMap.put(es.Staff_Name__c,es.Id);           
            }
            system.debug('existingStaffMap = '+existingStaffMap);
            list<Staff__c> staffinfoList2 = new list<Staff__c>();
			            
            for(integer i=0;i<filteredStaffAssignment3.size();i++){
                if(existingStaffMap.get(filteredStaffAssignment3.values()[i].Staff_User_Assignment__c) == null){
                    Staff__c st = new Staff__c();
                    st.Staff_Name__c=filteredStaffAssignment3.values()[i].Staff_User_Assignment__c;
                    st.RecordTypeId = csiSTaffId;
                    staffinfoList2.add(st);
                }               
            }
            insert staffinfoList2;
            for(Staff__c sa :staffinfoList2){
                existingStaffMap.put(sa.Staff_Name__c, sa.Id);
            }
            system.debug('existingStaffMap2 '+existingStaffMap);
            for(Staff_Assignment__c s1: newStaffAssignmentList){
                system.debug('existingStaffMap.get(s1.Staff_User_Assignment__c) '+existingStaffMap.get(s1.Staff_User_Assignment__c));
                s1.Staffing_Assignment__c=existingStaffMap.get(s1.Staff_User_Assignment__c);
                system.debug('s1.Staffing_Assignment__c '+s1.Staffing_Assignment__c);
            }
        }
    }
    /**
     * Name:serviceAMTEndDateUpdate
     * Parameters: Map<Id,Staff_Assignment__c> newStaffAssignment,Map<Id,Staff_Assignment__c> oldStaffAssignment
     * Return: Void
     * Purpose: Update Case management end date(Obj: Service AMT) with start date of staff assignment
     * 
     * */
   /*** public static void serviceAMTEndDateUpdate(Map<Id,Staff_Assignment__c> newStaffAssignment,Map<Id,Staff_Assignment__c> oldStaffAssignment){
        isRunUpdate2=true;
        if(test.isRunningTest()){
            isRunUpdate2=false;
        }
        List<Staff_Assignment__c> filteredStaffAssignmentList = new List<Staff_Assignment__c>();
        serviceAMTWrapper sw = new serviceAMTWrapper();
        for(Staff_Assignment__c stNew: newStaffAssignment.values()){
            for(Staff_Assignment__c stOld: oldStaffAssignment.values()){
                system.debug('stNew.Should_Extended_AMT_be_updated__c@@@'+stNew.Should_Extended_AMT_be_updated__c);
                system.debug('stOld.Should_Extended_AMT_be_updated__c @@@'+stOld.Should_Extended_AMT_be_updated__c );
                system.debug('stNew.Who_is_being_replaced__c @@@'+stNew.Who_is_being_replaced__c );
                if(stNew.Should_Extended_AMT_be_updated__c != stOld.Should_Extended_AMT_be_updated__c && stNew.Who_is_being_replaced__c != null){
                    sw.name = new list<string>();
                    sw.role = new list<string>();
                    sw.company = new list<string>();
                    sw.recId = new list<string>();
                    sw.name.add(stNew.Staff_assignment_list_search__c);
                    sw.role.add(stNew.Role_on_Case__c);
                    sw.company.add(stNew.Customer_Name__c);
                    sw.recId.add(stNew.Customer_Name__c);
                    sw.name.add(stNew.Staff_assignment_list_search__c);
                    filteredStaffAssignmentList.add(stNew);
                }
            }
            
        }
        
        if(sw.company!=null){
            
            list<Service_AMT__c> serviceList = [select id,Case_Management_End_Date__c,Company__c ,Contact_Role__c , Name
                                                from Service_AMT__c where Company__c in:sw.company 
                                                and Contact_Role__c in:sw.role and Name in:sw.Name]; 
            system.debug('serviceList@@@'+serviceList);
            list<Service_AMT__c> serviceAMTList = new List<Service_AMT__c>();
            map<id,Service_AMT__c> serMap = new map<id,Service_AMT__c>();

            for(Staff_Assignment__c stEach :filteredStaffAssignmentList){
                for(Service_AMT__c samt:serviceList){
                    if(samt.Company__c ==stEach.Customer_Name__c  && samt.Contact_Role__c == stEach.Role_on_Case__c && samt.Name== stEach.Staff_assignment_list_search__c){
                        samt.Case_Management_End_Date__c = stEach.Start_Date__c;
                        serviceAMTList.add(samt);
                    }
                    
                    
                }
                //stEach.Should_Extended_AMT_be_updated__c=false;
            }
            serMap.putAll(serviceAMTList);
            update serMap.values();
        }
    }**/
     public static void calculateTotalHoursOfComplexity(List<Staff_Assignment__c> staffAssignments) {
        // Collect Staff Assignment Ids and related User Ids
        /*Set<Id> staffAssignmentIds = new Set<Id>();

        for (Staff_Assignment__c sa : staffAssignments) {
            staffAssignmentIds.add(sa.Id);
        }

        // Get the sum of Hours of Complexity from related IPM_Information__c records
        Map<Id, Decimal> complexitySumMap = getComplexitySumMap(staffAssignmentIds);
	
         system.debug('staffAssignmentIds = '+staffAssignmentIds);
         
       //Map<Id, Staff_Assignment__c> staffAssignmentMap = new Map<Id, Staff_Assignment__c>([SELECT Id,Staffing_Assignment__r.IPM_Years_of_Experience_Score__c FROM Staff_Assignment__c WHERE Id =: staffAssignmentIds]);
        // Calculate Total_Hours_of_Complexity__c for each Staff Assignment
        for (Staff_Assignment__c sa : staffAssignments) {
            Decimal totalComplexity = complexitySumMap.get(sa.Id) != null ? complexitySumMap.get(sa.Id) : 0;
            system.debug('totalComplexity = '+totalComplexity);
            Decimal experienceScore = sa.Staff_Years_Of_Experience_Backend__c;
            sa.Total_Hours_of_Complexity__c = totalComplexity + experienceScore;
        }*/
    }

    /*private static Map<Id, Decimal> getComplexitySumMap(Set<Id> staffAssignmentIds) {
        Map<Id, Decimal> complexitySumMap = new Map<Id, Decimal>();
        if(staffAssignmentIds != null){
            // Query the sum of Hours_of_Complexity__c from related IPM_Information__c records
            for (AggregateResult ar : [SELECT Staff_Assignment__c, SUM(Hours_of_Complexity__c) totalComplexity
                                       FROM IPM_Information__c 
                                       WHERE Staff_Assignment__c IN :staffAssignmentIds WITH USER_MODE
                                       GROUP BY Staff_Assignment__c]) {
                                           complexitySumMap.put((Id)ar.get('Staff_Assignment__c'), (Decimal)ar.get('totalComplexity'));
                                           system.debug('complexitySumMap = '+complexitySumMap);
                                       }
            
            
        }
        return complexitySumMap;
        
    }*/
    
    //**************************************Changes by Varun*********************************************//
    public static void calculateHoc(List<Staff_Assignment__c> staffAssignments){
        
        //List<Staff_Assignment__c> saWithIPM = new List<Staff_Assignment__c>();
        List<Staff_Assignment__c> saWithoutIPM = new List<Staff_Assignment__c>();
        List<Staff_Assignment__c> specialProjects = new List<Staff_Assignment__c>();
        
        for(Staff_Assignment__c sa:staffAssignments){
            if(sa.Assignment_Type__c != null && sa.Assignment_Type__c == 'Special Project'){
                specialProjects.add(sa);
            }
            /*if(sa.IPM_Information__c != null){
                saWithIPM.add(sa);
            }
            else{
                saWithoutIPM.add(sa);
            }
            
            if(!saWithIPM.isEmpty()){
                hocForSaWithIPM(saWithIPM);
            }*/
            if(!specialProjects.isEmpty()){
                hocForSpecialProjects(specialProjects);
            }
            /*if(!saWithoutIPM.isEmpty()){
                hocForSaWithoutIPM(saWithoutIPM);
            }*/
    	}
    }

    public static void calculateStaffHoc(List<Staff_Assignment__c> staffAssignments){
        system.debug(' Inside After Update staff assignment');
        Set<Id> staffIds = new Set<Id>();
        List<Staff__c> staffList = new List<Staff__c>();
        
        for(Staff_Assignment__c sa:staffAssignments){
            if(sa.Staffing_Assignment__c != null){
                staffIds.add(sa.Staffing_Assignment__c);
            }
        }
        /*List<Staff_Assignment__c> ipmList = [SELECT Id, Case_FTE_s__c FROM Staff_Assignment__c WHERE Staffing_Assignment__c = 'a0jdh000001grovAAA'];
        for(Staff_Assignment__c s:ipmList){
            system.debug('s = '+s);
        }
        for(AggregateResult ar: [SELECT Id,Sum(Hours_Of_Complexity_Backend__c) HoursComplexity,Sum(Case_FTE_s__c) caseFte,Staffing_Assignment__c FROM Staff_Assignment__c WHERE Staffing_Assignment__c =: staffIds GROUP BY Staffing_Assignment__c,Id]){
            system.debug('ar = '+ar);
        }*/
        
        for(AggregateResult ar: [SELECT Sum(Total_of_hours_Backend__c) TotalHours, Sum(Months_Implementing_Backend__c) MonthImp,Sum(Hours_Of_Complexity_Backend__c) HoursComplexity,Sum(Case_FTE_s__c) caseFte,Staffing_Assignment__c FROM Staff_Assignment__c WHERE Staffing_Assignment__c =: staffIds AND RecordTypeId IN (:specialProjectId, :ipmAssignmentId) GROUP BY Staffing_Assignment__c]){
            Id staffId = (Id) ar.get('Staffing_Assignment__c');
            Decimal THC = (Decimal) ar.get('HoursComplexity');
            Decimal caseFtes = (Decimal) ar.get('caseFte');
            //Added by Vignesh - Capacity Model 2025s
            Decimal TH = (Decimal) ar.get('TotalHours');
            Decimal MOI = (Decimal) ar.get('MonthImp');
            
            Staff__c st = new Staff__c();
            st.Id = staffId;
            st.Hours_Of_Complexity_Backend__c = THC;
            st.IPM_BOB_Case_FTE__c = caseFtes;
            //Added by Vignesh - Capacity Model 2025s
            st.Total_of_hours_Backend__c = TH;
            st.Months_Implementing_Backend__c = MOI;
            
            staffList.add(st);
        }
        if(!staffList.isEmpty()){
            update staffList;
        }
    }
    
    /*public static void hocForSaWithoutIPM(List<Staff_Assignment__c> staffAssignments){
        
        Set<Id> companyIds = new Set<Id>();
        Set<Id> policyIds = new Set<Id>();
        Map<Id,Decimal> hocRollupMap = new Map<Id,Decimal>();
        Map<Id,Decimal> hocPolicyRollupMap = new Map<Id,Decimal>();
        
        for (Staff_Assignment__c sa: staffAssignments){
            if(sa.Medical_Policy_Number__c != null){
                policyIds.add(sa.Medical_Policy_Number__c);
            }
            else if(sa.Customer_Name__c != null){
                companyIds.add(sa.Customer_Name__c);
            }
        }
        
        
        List<AggregateResult> policyIpmList = [SELECT Policy_Information__c, SUM(Hours_of_Complexity__c) totalComplexity FROM IPM_Information__c WHERE Policy_Information__c =:policyIds GROUP BY Policy_Information__c];
        for (AggregateResult ar : policyIpmList){
            Id policyId = (Id) ar.get('Policy_Information__c');
            Decimal totalComplexity = (Decimal) ar.get('totalComplexity');
            hocPolicyRollupMap.put(policyId, totalComplexity);
        }
       
        List<AggregateResult> arList = [SELECT Company__c, SUM(IPM_Hours_Of_Complexity__c) totalComplexity FROM Policy_Information__c WHERE Company__c =:companyIds AND Policy_Status__c = 'Active' GROUP BY Company__c];
        for (AggregateResult ar : arList){
            Id companyId = (Id) ar.get('Company__c');
            Decimal totalComplexity = (Decimal) ar.get('totalComplexity');
            hocRollupMap.put(companyId, totalComplexity);
        }
        
        for(Staff_Assignment__c sa: staffAssignments){
            if(sa.Customer_Name__c != null && sa.Medical_Policy_Number__c == null){
                sa.Hours_Of_Complexity_Backend__c = hocRollupMap.get(sa.Customer_Name__c);
            }
            if(sa.Medical_Policy_Number__c != null){
                sa.Hours_Of_Complexity_Backend__c = hocPolicyRollupMap.get(sa.Medical_Policy_Number__c);
            }
        }
    }
    
    public static void hocForSaWithIPM(List<Staff_Assignment__c> staffAssignments){
        Set<Id> ipmInfoId = new Set<Id>();
        for(Staff_Assignment__c sa: staffAssignments){
            if(sa.IPM_Information__c != null){
                ipmInfoId.add(sa.IPM_Information__c);
            }
        }
        if(!ipmInfoId.isEmpty()){
         	Map<Id,IPM_Information__c> ipmInfoMap = new Map<Id,IPM_Information__c>([SELECT Id,Hours_of_Complexity__c FROM IPM_Information__c WHERE Id =: ipmInfoId]); 
            for(Staff_Assignment__c sa: staffAssignments){
                if(sa.IPM_Information__c != null){
                    IPM_Information__c ipm = ipmInfoMap.get(sa.IPM_Information__c);
                    sa.Hours_Of_Complexity_Backend__c = ipm.Hours_of_Complexity__c;
                }
            }
        }
    }*/
    
    public static void hocForSpecialProjects(List<Staff_Assignment__c> staffAssignments){
        
        for(Staff_Assignment__c sa:staffAssignments){
           sa.Hours_Of_Complexity_Backend__c = sa.Meetings_Score__c;
        }
    }
    
    private static void createIpmStaff(List<Staff_Assignment__c> newStaffAssignments){
        
        Id recordTypeId = Schema.SObjectType.Staff__c.getRecordTypeInfosByName().get('IPM Staff').getRecordTypeId();
        Map<Id,Staff_Assignment__c> filteredStaffAssignment = new Map<Id,Staff_Assignment__c>();
        Map<Id,Staff_Assignment__c> filteredStaffAssignment2 = new Map<Id,Staff_Assignment__c>();
        Map<Id,Staff_Assignment__c> filteredStaffAssignment3 = new Map<Id,Staff_Assignment__c>();
        Map<Id,Id> newStaffMap = new Map<Id,Id>();
        Map<Id,Id> existingStaffMap = new Map<Id,Id>(); 
        
        for(Staff_Assignment__c s : newStaffAssignments){
                if(s.Staff_User_Assignment__c!=null && s.Staffing_Assignment__c !=null){
                    filteredStaffAssignment.put(s.Staff_User_Assignment__c,s);
                    
                }else if(s.Staffing_Assignment__c ==null && s.Staff_User_Assignment__c!=null){
                    filteredStaffAssignment3.put(s.Staff_User_Assignment__c,s);
                    
                }else if(s.Staff_User_Assignment__c==null && s.Staffing_Assignment__c !=null){
                    filteredStaffAssignment2.put(s.Staffing_Assignment__c,s);
                }else if(s.Staff_User_Assignment__c==null && s.Staffing_Assignment__c==null){
                    s.Staff_User_Assignment__c.addError('Please select staff for the assignment.');
                }
        }
        Map<Id, Id> staffMap = new Map<Id,Id>();
        Map<Id, Id> staffMap2 = new Map<Id,Id>();
        /** When user is available in staff assignment*/
        if(!filteredStaffAssignment.isempty() && filteredStaffAssignment.size()>0){
            list<Staff__c>  staffList = [select Id, Staff_Name__c,RecordTypeId from Staff__c where RecordTypeId =: recordTypeId AND Staff_Name__c in:filteredStaffAssignment.keyset()];
            system.debug('staffList===='+staffList);
            if( staffList.size()>0){
                for(Integer i=0;i<staffList.size();i++){
                    staffMap.put(staffList[i].Staff_Name__c, staffList[i].Id);
                }
            }
            system.debug('staffMap====='+staffMap);
            for(Staff_Assignment__c s1: newStaffAssignments){
                system.debug('s1.Staff_User_Assignment__c====='+s1.Staff_User_Assignment__c);
                if(s1.Staffing_Assignment__c != staffMap.get(s1.Staff_User_Assignment__c)){
                    s1.Staff_User_Assignment__c.addError('Please select matching staff or leave this field blank.');
                }/*else{
                    s1.Staffing_Assignment__c=staffMap.get(s1.Staff_User_Assignment__c);
                } */               
            }
        }
        /** When user is not available in staff assignment*/
        if(!filteredStaffAssignment2.isempty() && filteredStaffAssignment2.size()>0){
            list<Staff__c>  staffList2 = [select Id, Staff_Name__c from Staff__c where RecordTypeId =: recordTypeId AND Id in:filteredStaffAssignment2.keyset()];
            if( !staffList2.isempty() && staffList2.size()>0){
                for(Integer i=0;i<staffList2.size();i++){
                    staffMap2.put(staffList2[i].Id,staffList2[i].Staff_Name__c);
                }
                for(Staff_Assignment__c s1: newStaffAssignments){
                    s1.Staff_User_Assignment__c=staffMap2.get(s1.Staffing_Assignment__c);
                }
            }
        }
        /** when staff is not availabel*/
        if(!filteredStaffAssignment3.isempty() && filteredStaffAssignment3.size()>0){
            system.debug('User Keyset: '+filteredStaffAssignment3.keyset());
            list<Staff__c> existingStaff = [select Id, Staff_Name__c from Staff__c where RecordTypeId =: recordTypeId AND Staff_Name__c in:filteredStaffAssignment3.keyset()];
            for(Staff__c es:existingStaff){
                existingStaffMap.put(es.Staff_Name__c,es.Id);           
            }
            
            list<Staff__c> staffinfoList2 = new list<Staff__c>();
			            
            for(integer i=0;i<filteredStaffAssignment3.size();i++){
                if(existingStaffMap.get(filteredStaffAssignment3.values()[i].Staff_User_Assignment__c) == null){
                    Staff__c st = new Staff__c();
                    st.Staff_Name__c=filteredStaffAssignment3.values()[i].Staff_User_Assignment__c;
                    st.RecordTypeId = recordTypeId;
                    st.Primary_Role__c = 'IPM';
                    staffinfoList2.add(st);
                }               
            }
            insert staffinfoList2;
            for(Staff__c sa :staffinfoList2){
                existingStaffMap.put(sa.Staff_Name__c, sa.Id);
            }
            for(Staff_Assignment__c s1: newStaffAssignments){
                s1.Staffing_Assignment__c=existingStaffMap.get(s1.Staff_User_Assignment__c);
            }
        }
        
    }
   //**************************************Changes by Varun*********************************************//
    public class serviceAMTWrapper{
        public list<string> recId;
        public list<string> name;
        public list<string> role;
        public list<string> company;
    }
}