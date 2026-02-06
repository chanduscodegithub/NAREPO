public class taskDueDatePopulateTriggerHandler {
    
    private static final Id QUALITY_RECORDTYPE_ID = Schema.SObjectType.Task.getRecordTypeInfosByDeveloperName().get('Quality').getRecordTypeId();
    private static final Set<String> VALID_SUBJECTS = new Set<String>{'BTB/SBC QA','BTB QA','CDS QA','ACIS QA','ID Card Design QA', 'SBC QA', 'PhBit QA', 'IMD QA', 'CDS QA Retro', 'CDS Part 1', 'CDS Part 2'};
    private static final Set<Date> HOLIDAY_DATES = getHolidayDates();
    private static final Set<Id> QA_TEAMS_IDS = getQATeamIds();
    
    private static Datetime currentDateTime = Datetime.valueOf(System.now());
    private static String currentTime = currentDateTime.format('HH:mm:ss');
    private static String[] presentTimeArray = currentTime.split(':');
    private static Time presentTime = Time.newInstance(Integer.valueOf(presentTimeArray[0]), Integer.valueOf(presentTimeArray[1]), Integer.valueOf(presentTimeArray[2]), 0);
    private static Time after5PMTime = Time.newInstance(17, 0, 0, 0);
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
                    if(eachtask.OwnerId != oldTaskMap.get(eachtask.Id).OwnerId){
                        
                        if(!QA_TEAMS_IDS.contains(UserInfo.getUserId()) && VALID_SUBJECTS.contains(eachtask.Subject)){
                            setActivityDate(eachtask);
                        }else if(!QA_TEAMS_IDS.contains(eachtask.OwnerId) && VALID_SUBJECTS.contains(eachtask.Subject)){
                            setActivityDate(eachtask);
                        }
                        
                    }
                    else if(eachtask.Subject != oldTaskMap.get(eachtask.id).Subject && VALID_SUBJECTS.contains(eachtask.Subject)){
                        setActivityDate(eachtask);                     
                    }  
                }
            }            
        }
        
    }
    
    public static void insertTask(List<Task> newTaskList){
        
        if(RecursiveTriggerHandler.isFirstTime){
            
            RecursiveTriggerHandler.isFirstTime = false;
            for(Task eachtask : newTaskList){
                
                if(eachtask.RecordTypeId == QUALITY_RECORDTYPE_ID &&
                   eachtask.ActivityDate == null &&
                   VALID_SUBJECTS.contains(eachtask.Subject))
                {
                    setActivityDate(eachtask);             
                }         	
                
            }
        }
        
    }
    
    
    private static void setActivityDate(Task eachtask){
        Date dueDate;
        Integer bussinessDays = 0;
        Date presentDate = currentDateTime.date(); //30 june
        
        if(presentTime > after5PMTime){
            presentDate = presentDate.addDays(1);
        }
        
        for(Integer i = 0; i < 50; i++){
            
            if(eachtask.Subject == 'BTB/SBC QA' && bussinessDays == 4){ //this if
                break;
            }
            
            if( eachtask.Subject != 'BTB/SBC QA' && bussinessDays == 3){
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
    
}