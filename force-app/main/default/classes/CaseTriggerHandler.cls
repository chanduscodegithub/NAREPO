public class CaseTriggerHandler {
    
    public static void updateUtilization(id userId, string comments){
        
        Map<String, String> params = new Map<String, String>();
        params.put('UserId',userId);
        params.put('IssueCreated',comments);
        Flow.Interview.Utilization_Metric_Flow utilizationFlow = new Flow.Interview.Utilization_Metric_Flow(params);
        utilizationFlow.start();           
        
    }
    
}