@isTest(SeeAllData=true)
public class PolicyControllerRestTestClass {
    
    static testMethod void testPostMethod()
    {
        RestRequest request = new RestRequest();
        RestResponse res = new RestResponse();
        request.requestUri ='services/apexrest/QueryPolicy/';
        request.httpMethod = 'POST';
        request.addHeader('Content-Type', 'application/json'); 
        
        List<PolicyControllerRest.JsonRequest> cases = new List<PolicyControllerRest.JsonRequest>();
        
        
        PolicyControllerRest.JsonRequest jsonRequest = new PolicyControllerRest.JsonRequest();
        Datetime createDate = DateTime.newInstance(2018, 5, 24);
        Datetime modifiedTime =  DateTime.newInstance(2018, 7, 12);
        
        jsonRequest.Category = 'Medical';
        jsonRequest.CreatedDate=createDate;
        jsonRequest.Internal_External='Internal';
        jsonRequest.Issue_ID='119127';
        jsonRequest.LastModifiedDate=modifiedTime;
        jsonRequest.Originator='Customer';
        jsonRequest.policyNumber='704077';
        jsonRequest.Source_System='ETS-BE';
        jsonRequest.status='Open';
        
        cases.add(jsonRequest); 
        
        PolicyControllerRest.jsonRequest jsonRequest1 = new PolicyControllerRest.jsonRequest();
        Datetime createDate1 = DateTime.newInstance(2018, 5, 24);
        Datetime modifiedTime1 =  DateTime.newInstance(2018, 7, 12);
        Date dateCompleted1 =  Date.newInstance(2018, 4, 12);
        
        jsonRequest1.Category = 'Medical';
        jsonRequest1.CreatedDate=createDate1;
        jsonRequest1.Internal_External='Internal';
        jsonRequest1.Issue_ID='12085701';
        jsonRequest1.LastModifiedDate=modifiedTime1;
        jsonRequest1.Originator='Customer';
        jsonRequest1.policyNumber='200101';
        jsonRequest1.Source_System='ETS-BE';
        jsonRequest1.status='Open';
        jsonRequest1.Date_Completed=dateCompleted1;
        
        cases.add(jsonRequest1);
        
        PolicyControllerRest.jsonRequest jsonRequest2 = new PolicyControllerRest.jsonRequest();
        Datetime createDate2 = DateTime.newInstance(2018, 5, 24);
        Datetime modifiedTime2 =  DateTime.newInstance(2018, 7, 12);
        Date dateCompleted =  Date.newInstance(2018, 4, 12);
        
        jsonRequest2.Category = 'Medical';
        jsonRequest2.CreatedDate=createDate2;
        jsonRequest2.Internal_External='Internal';
        jsonRequest2.Issue_ID='12097811';
        jsonRequest2.LastModifiedDate=modifiedTime2;
        jsonRequest2.Originator='Customer';
        jsonRequest2.policyNumber='1002001';
        jsonRequest2.Source_System='ETS-BE';
        jsonRequest2.status='Open';
        jsonRequest2.Date_Completed=dateCompleted;  
        
        cases.add(jsonRequest2); 
        
        PolicyControllerRest.jsonRequest jsonRequest3 = new PolicyControllerRest.jsonRequest();
        Datetime createDate3 = DateTime.newInstance(2018, 5, 24);
        Datetime modifiedTime3 =  DateTime.newInstance(2018, 7, 12);
        Date dateCompleted3 =  Date.newInstance(2018, 4, 12);
        
        jsonRequest3.Category = 'Medical';
        jsonRequest3.CreatedDate=createDate3;
        jsonRequest3.Internal_External='Internal';
        jsonRequest3.Issue_ID='1209989';
        jsonRequest3.LastModifiedDate=modifiedTime3;
        jsonRequest3.Originator='Customer';
        jsonRequest3.policyNumber='12343r';
        jsonRequest3.Source_System='ET';
        jsonRequest3.status='Open2es';
        jsonRequest3.Date_Completed=dateCompleted3;  
        
        cases.add(jsonRequest3); 
        
        PolicyControllerRest.jsonRequest jsonRequest4 = new PolicyControllerRest.jsonRequest();
        Datetime createDate4 = DateTime.newInstance(2018, 5, 24);
        Datetime modifiedTime4 =  DateTime.newInstance(2018, 7, 12);
        Date dateCompleted4 =  Date.newInstance(2018, 4, 12);
        
        jsonRequest4.Category = 'Medical';
        jsonRequest4.CreatedDate=createDate4;
        jsonRequest4.Internal_External='Internalsaa';
        jsonRequest4.Issue_ID='12093288';
        jsonRequest4.LastModifiedDate=modifiedTime4;
        jsonRequest4.Originator='Custom';
        jsonRequest4.policyNumber='23523';
        jsonRequest4.Source_System='ET';
        jsonRequest4.status='Open';
        jsonRequest4.Date_Completed=dateCompleted4;  
        
        cases.add(jsonRequest4);
        
        
        PolicyControllerRest.jsonRequest jsonRequest5 = new PolicyControllerRest.jsonRequest();
        Datetime createDate5 = DateTime.newInstance(2018, 5, 24);
        Datetime modifiedTime5 =  DateTime.newInstance(2018, 7, 12);
        Date dateCompleted5 =  Date.newInstance(2018, 4, 12);
        
        jsonRequest5.Category = 'Medical';
        jsonRequest5.CreatedDate=createDate5;
        jsonRequest5.Internal_External='Internal';
        jsonRequest5.Issue_ID='1209325985';
        jsonRequest5.LastModifiedDate=modifiedTime5;
        jsonRequest5.Originator='Customer';
        jsonRequest5.policyNumber='126547';
        jsonRequest5.Source_System='ET';
        jsonRequest5.status='Open';
        jsonRequest5.Date_Completed=dateCompleted5;  
        
        cases.add(jsonRequest5);
        
        
        //RestContext.request = request;
        //RestContext.response = res;
        Test.startTest();
        List<PolicyControllerRest.JsonResponse> responseList =  PolicyControllerRest.createORUpdateIssueandPolicyCaseAssociation('ETS-BE Request', 'uhg_services@naservices-naservices.cs68.force.com.naservice2', cases);
        System.debug('responseList  ==>' +responseList);
        Test.stopTest();
    } 
}