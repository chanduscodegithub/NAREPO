public class TaskTriggerHandler {
    public static void handleTrigger(List<Task> oldList,List<Task> newList, Map<Id, Task> oldMap, Map<Id, Task> newMap,
                                     System.TriggerOperation triggerEvent )
    {
        switch on triggerEvent {
            
            when BEFORE_INSERT {
                handleBeforeInsert(newList);
            }
            when BEFORE_UPDATE {
                handleBeforeUpdate(newList, oldMap);
            }
            when AFTER_INSERT {
                handleAfterInsert(newList,newMap);
            }
            when AFTER_UPDATE {
                handleAfterUpdate(newList,newMap, oldMap);
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

    public static void handleAfterInsert(List<Task> newList,Map<Id, Task> newMap){
        Set<Id> taskIds = new Set<Id>();
        for (Task t : newList) {
            taskIds.add(t.Id);
        }
        TaskActivityHistoryHelper.processActivityHistoryRecords(taskIds, newMap, new Map<Id, Task>(), false);
    }

    public static void handleAfterUpdate(List<Task> newList,Map<Id, Task> newMap, Map<Id, Task> oldMap){
        Set<Id> taskIds = new Set<Id>();
        for (Task t : newList) {
            taskIds.add(t.Id);
        }
        TaskActivityHistoryHelper.processActivityHistoryRecords(taskIds, newMap, oldMap, true);
    }
}