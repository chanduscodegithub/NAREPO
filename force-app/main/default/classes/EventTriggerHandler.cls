public class EventTriggerHandler {
    public static void handleTrigger(
        List<Event> newList,
        List<Event> oldList,
        Map<Id, Event> newMap, 
        Map<Id, Event> oldMap, 
        System.TriggerOperation triggerEvent 
    ){
        switch on triggerEvent {
            when AFTER_INSERT {
                EventActivityHistoryHelper.processActivityHistoryRecords(newMap.keySet(), newMap, oldMap, false);
            }
            when AFTER_UPDATE {
                EventActivityHistoryHelper.processActivityHistoryRecords(newMap.keySet(), newMap, oldMap, true);
            }
        }
    }
}