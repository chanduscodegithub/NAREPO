public class TaskTriggerHelper {
    private static final Id QUALITY_RECORDTYPE_ID = Schema.SObjectType.Task.getRecordTypeInfosByDeveloperName().get('Quality').getRecordTypeId();
    private static final Set<String> VALID_SUBJECTS = new Set<String>{'BTB/SBC QA','BTB QA','CDS QA','ACIS QA','ID Card Design QA', 'SBC QA', 'PhBit QA', 'IMD QA', 'OBM QA','CDS QA Retro', 'CDS Part 1', 'CDS Part 2','Surest OBM','Surest OBM Part 1','Surest OBM Part 2','Surest OBM Part 1 & 2','DOC360 QA', 'BTB Policy QA'};
        private static final Set<String> VALID_SUBJECTS_SUREST = new Set<String>{'OBM QA','Surest OBM','Surest OBM Part 1','Surest OBM Part 2','Surest OBM Part 1 & 2'};
            private static final Set<Date> HOLIDAY_DATES = getHolidayDates();
    private static final Set<Id> QA_TEAMS_IDS = getQATeamIds();
    
    private static Datetime currentDateTime = Datetime.valueOf(System.now());
    private static String currentTime = currentDateTime.format('HH:mm:ss'); 
    private static String[] presentTimeArray = currentTime.split(':');
    private static Time presentTime = Time.newInstance(Integer.valueOf(presentTimeArray[0]), Integer.valueOf(presentTimeArray[1]), Integer.valueOf(presentTimeArray[2]), 0);
    private static Time after4PMTime = Time.newInstance(16, 0, 0, 0);
    private static Date presentDate = currentDateTime.date();
    
    
    private static Set<Date> getHolidayDates(){
        Set<Date> holidayDates = new Set<Date>();
        for(Holiday hol : [SELECT ActivityDate FROM Holiday]){
            holidayDates.add(hol.ActivityDate);
        }
        return holidayDates;
    }
    
    private static Set<Id> getQATeamIds(){
        Set<Id> setQATeamMemIds = new Set<Id>();
        
        Id groupId = [SELECT Id 
                      FROM Group 
                      WHERE Name = 'QA Team' 
                      LIMIT 1][0].Id;
        
        for(GroupMember member : [SELECT GroupId, UserOrGroupId 
                                  FROM GroupMember 
                                  WHERE GroupId =: groupId])
        {
            setQATeamMemIds.add(member.UserOrGroupId);
        }
        return setQATeamMemIds;
    }
    
    public static void updateTask(List<Task> newTaskList, Map<Id,Task> oldTaskMap){
        
        if(RecursiveTriggerHandler.isFirstTime){
            
            RecursiveTriggerHandler.isFirstTime = false;
            
            for(Task eachtask : newTaskList){
                if(eachtask.RecordTypeId == QUALITY_RECORDTYPE_ID){   
                    if(eachtask.OwnerId != oldTaskMap.get(eachtask.Id).OwnerId) 
                    {
                        if(!QA_TEAMS_IDS.contains(UserInfo.getUserId()) && VALID_SUBJECTS.contains(eachtask.Subject)){
                            setActivityDate(eachtask,eachtask.OwnerId);
                        }else if(!QA_TEAMS_IDS.contains(eachtask.OwnerId) && VALID_SUBJECTS.contains(eachtask.Subject)){
                            setActivityDate(eachtask,eachtask.OwnerId);
                        }
                        
                    }
                    else  if(eachtask.CustomUserLookup__c != oldTaskMap.get(eachtask.Id).CustomUserLookup__c) {
                        if(!QA_TEAMS_IDS.contains(UserInfo.getUserId()) && VALID_SUBJECTS.contains(eachtask.Subject)){
                            setActivityDate(eachtask,eachtask.CustomUserLookup__c);
                        }else if(!QA_TEAMS_IDS.contains(eachtask.OwnerId) && VALID_SUBJECTS.contains(eachtask.Subject)){
                            setActivityDate(eachtask,eachtask.CustomUserLookup__c);
                        }
                    }
                    else if(eachtask.Subject != oldTaskMap.get(eachtask.id).Subject && VALID_SUBJECTS.contains(eachtask.Subject)){
                        setActivityDate(eachtask,eachtask.OwnerId);                     
                    }  
                }
                if(eachtask.Last_Assigned_To_Date__c!=null)
                if(eachtask.Status =='Completed' || eachtask.Completed_Date__c != oldTaskMap.get(eachtask.Id).Completed_Date__c){
                    if(eachtask.Completed_Date__c!=null){
                        Integer d = eachtask.Completed_Date__c.day();
                        Integer mo = eachtask.Completed_Date__c.month();
                        Integer yr = eachtask.Completed_Date__c.year();
                        eachtask.Age__c =calculateWorkingDays(eachtask.Last_Assigned_To_Date__c,DateTime.newInstance(yr, mo, d),eachtask.OwnerId);
                    }
                    else
                        eachtask.Age__c =calculateWorkingDays(eachtask.Last_Assigned_To_Date__c,Datetime.valueOf(System.now()),eachtask.OwnerId);
                    
                }
                
            }            
        }
        
    }
    
    public static Integer calculateWorkingDays(Datetime startDate, Datetime endDate,id userId){          
        
        presentTime=presentTime.addhours(TimeConversions.getCurrentUserTZOffsetFromEastern(userId));        
        Date endDate2 = Datetime.valueOf(endDate.addhours(TimeConversions.getCurrentUserTZOffsetFromEastern(userId))).date();
        Date startDate2 =Datetime.valueOf(startDate.addhours(TimeConversions.getCurrentUserTZOffsetFromEastern(userId))).date();
        Datetime currentDateTime1 = Datetime.valueOf(startDate.addhours(TimeConversions.getCurrentUserTZOffsetFromEastern(userId)));
        String currentTime1 = currentDateTime1.format('HH:mm:ss'); 
        String[] presentTimeArray1 = currentTime1.split(':');
        Time presentTime1 = Time.newInstance(Integer.valueOf(presentTimeArray1[0]), Integer.valueOf(presentTimeArray1[1]), Integer.valueOf(presentTimeArray1[2]), 0);
        system.debug('presentTime1'+presentTime1+'currentTime1'+currentTime1);
        if(presentTime1 > after4PMTime){
            startDate2 = startDate2.addDays(1);
        }
       
        Integer workingDays = 0;  
        //DateTime dateDay = DateTime.newInstance(nextDate.year(), nextDate.month(), nextDate.day());  
        for(integer i=0; i <= startDate2.daysBetween(endDate2); i++)  
        {  
            Date dt = startDate2 + i;  
            DateTime currDate = DateTime.newInstance(dt.year(), dt.month(), dt.day());  
            String todayDay = currDate.format('EEEE');  
            system.debug(dt+'dt');
            if(todayDay != 'Saturday' && todayDay !='Sunday' && (!HOLIDAY_DATES.contains(dt)))  
            {  
                workingDays = workingDays + 1;  
            }     
            
        }  
        
        System.debug('--Working days'+workingDays);  
        return workingDays;  
    }  
    
    public static void insertTask(List<Task> newTaskList){
        
        if(RecursiveTriggerHandler.isFirstTime){
            
            RecursiveTriggerHandler.isFirstTime = false;
            for(Task eachtask : newTaskList){
                
                if(eachtask.RecordTypeId == QUALITY_RECORDTYPE_ID &&
                   eachtask.ActivityDate == null &&
                   VALID_SUBJECTS.contains(eachtask.Subject))
                {
                    setActivityDate(eachtask,eachtask.OwnerId);             
                }           
                
            }
        }
        
    }
    
    
    private static void setActivityDate(Task eachtask,id userId){
        Date dueDate;
        Integer bussinessDays = 0;
        //Added to get the present time based on the assigned user timezone 
        if(eachtask.CustomUserLookup__c!=null){
            presentTime=presentTime.addhours(TimeConversions.getCurrentUserTZOffsetFromEastern(userId));        
            presentDate = Datetime.valueOf(System.now().addhours(TimeConversions.getCurrentUserTZOffsetFromEastern(userId))).date();
        }else if(eachtask.ownerId!=null){
            presentTime=presentTime.addhours(TimeConversions.getCurrentUserTZOffsetFromEastern(userId));        
            presentDate = Datetime.valueOf(System.now().addhours(TimeConversions.getCurrentUserTZOffsetFromEastern(userId))).date();
        }
        System.debug('presentDate'+presentDate);
        if(presentTime > after4PMTime){
            presentDate = presentDate.addDays(1);
        }
        
        for(Integer i = 0; i < 50; i++){
            
           /* if(VALID_SUBJECTS_SUREST.contains(eachtask.Subject) && bussinessDays == 4){
                break;
            }
            if(!VALID_SUBJECTS_SUREST.contains(eachtask.Subject) && bussinessDays == 3){
                break;
            }
            */
            if(bussinessDays == 4){
                break;
            }
            
            Date nextDate = presentDate.addDays(i); //today's date + 0
            DateTime dateDay = DateTime.newInstance(nextDate.year(), nextDate.month(), nextDate.day());  
            String nextDay = dateDay.format('EEEE');
            
            if((!HOLIDAY_DATES.contains(nextDate)) && nextDay != 'Saturday' && nextDay != 'Sunday' ){                                       
                dueDate = nextDate;
                bussinessDays++;  
            }
        }
        system.debug(dueDate+'dueDate');
        eachtask.ActivityDate = dueDate;
    }
    
    
    public static void statusChangeQATeam(List<Task> newTaskList, Map<id,Task> oldTaskMap){
        Boolean isQAMember = false;
        Id TaskRecordTypeId = Schema.SObjectType.Task.getRecordTypeInfosByDeveloperName().get('Quality').getRecordTypeId();
        List<GroupMember> qaMembersList = new List<GroupMember>();
        Id loggedInUserId = UserInfo.getUserId();
        
        Id groupId = [SELECT Id 
                      FROM Group 
                      WHERE Name = 'QA Team' 
                      LIMIT 1][0].Id;
        
        qaMembersList = [SELECT GroupId, UserOrGroupId 
                         FROM GroupMember 
                         WHERE GroupId =: groupId];
        
        for(GroupMember gm:qaMembersList){
            if(loggedInUserId == gm.UserOrGroupId){
                isQAMember = true;
            }
        }
        
        if(!isQAMember){
            for(Task tsk:newTaskList){
                if(tsk.RecordTypeId == TaskRecordTypeId && oldTaskMap.get(tsk.Id).status == 'Completed' && tsk.Status != oldTaskMap.get(tsk.Id).status){
                    tsk.addError('Cannot change task status from complete unless you are a QA Team Member');
                }
            }
        }
    }
    
    public static void checkTaskWithClosedIssueStatus(List<Task> newList){
        
        Map<Id, Task> caseVsTask = new Map<Id, Task>();
        List<Case> caseList = new List<Case>();
        
        for(Task objTask : newList){
            if(objTask.WhatId != null){
                if(String.valueof(objTask.WhatId).startsWith('500')){
                    caseVsTask.put(objTask.WhatId, objTask);
                }
            }
            
        }
        if(!caseVsTask.isEmpty()){
            for(Case objCase: [SELECT Id, Status 
                               FROM CASE 
                               WHERE Id IN: caseVsTask.keySet() AND Status = 'Closed'])
            {
                caseVsTask.get(objCase.Id).addError('Cannot add a Task to Closed Issues');
            }
        }
        
    }
    
}