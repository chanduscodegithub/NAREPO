public class TaskTriggerHandler {
    public static void handleTrigger(List<Task> oldList,List<Task> newList, Map<Id, Task> oldMap, Map<Id, Task> newMap,
                                     System.TriggerOperation triggerEvent )
    {
        switch on triggerEvent {
            
            when BEFORE_INSERT{
                handleBeforeInsert(newList);
            }
            when BEFORE_UPDATE{
                handleBeforeUpdate(newList, oldMap);
            }
        }
    }
    
    public static void handleBeforeInsert(List<Task> newList){
        TaskTriggerHelper.insertTask(newList);
        TaskTriggerHelper.checkTaskWithClosedIssueStatus(newList);
    }
    
    
    public static void handleBeforeUpdate(List<Task> newList, Map<Id, Task> oldMap){
        TaskTriggerHelper.statusChangeQATeam(newList, oldMap);
        TaskTriggerHelper.updateTask(newList, oldMap);
        TaskTriggerHelper.checkTaskWithClosedIssueStatus(newList);
    }
    
    
}