@isTest
public class IPMNotificationEmailTest {
    
    @testSetup
    public static void createData(){
        Datetime dt = System.now()+3;
        Date todayDate = Date.today()+3;
        Boolean isWeekEnd = true;
        while(isWeekEnd){
                if(dt.format('EEEE') == 'Sunday' || dt.format('EEEE') == 'Saturday'){
                    dt = dt+1;
                    todayDate = todayDate+1;
                }else{
                    isWeekEnd = false;
                }
            }
        
        System.debug('todayDate'+todayDate);
        Account acc= new Account();
        acc.Name = 'Dummy Company';
        acc.Subtype__c = 'Enterprise Strategic Accounts';
        insert acc;

        Id userProfileId= [select Id, Name from Profile where name = 'Standard User' limit 1].id;
        List<user> testUserRecords = new List<user>();
        for(Integer i=0;i<10;i++) {
            testUserRecords.add(new user(LastName = 'TestAcct'+i,FirstName='testFirstNAme'+i,
                                         Alias = 'jliv',
                                         Email = 'jason.liveston@crmit.com',
                                         Username = 'uhgDevWithoutId'+i+'@crmit.com',
                                         ProfileId = userProfileId,
                                         TimeZoneSidKey = 'GMT',
                                         Position__c = 'Test User',
                                         LanguageLocaleKey = 'en_US',
                                         IsActive = true,
                                         EmailEncodingKey = 'UTF-8',
                                         LocaleSidKey = 'en_US'));
        }
        insert testUserRecords;
        
        Project_Template__c projectTemplate= new Project_Template__c();
        projectTemplate.Template__c= false;
        projectTemplate.Name = 'project';
        projectTemplate.Start_Date__c =Date.Today();
        projectTemplate.Effective_Date__c = Date.Today();
        projectTemplate.Account__c = acc.id;
        insert projectTemplate;
        
        Project_Task__c projectTask= new Project_Task__c();
        projectTask.PRT_Name__c= projectTemplate.id;
        projectTask.Project_Task_Name__c = 'New task';
        projectTask.Actual_Finish__c = Date.Today();
        projectTask.WBS_Code__c = '1';
        projectTask.Start_Date__c= Date.Today()+1;
        projectTask.End_Date__c= todayDate;
        projectTask.Duration__c=1;
        projectTask.priority__c ='low';
        projectTask.predecessors__c = '2SF+0days';
        projectTask.Project_Type__c = 'task';
        projectTask.Checked__c = true;
        projectTask.Progress__c = 100;
        projectTask.Notes__c = 'test notes';
        projectTask.Dashboard__c = true;
        projectTask.Mark_as_Milestone__c = true;
        projectTask.Parent__c = '0';
        projectTask.Row_Number__c = 1;
        projectTask.Resource_Id__c = 'Ipmteam.id';
        projectTask.OwnerId=testUserRecords.get(0).id;
        insert projectTask; 
        
        Messaging.InboundEmail email = new Messaging.InboundEmail();
        Messaging.InboundEnvelope envelope = new Messaging.InboundEnvelope();
        envelope.fromAddress= 'user@fmr.com';
        
    }
    public testMethod static void validateBatch(){        
        Test.startTest();
        Datetime dt = Datetime.now().addMinutes(1);
        String CRON_EXP = '0 '+ dt.minute() + ' * ' + dt.day() + ' ' + dt.month() + ' ? ' + dt.year();
        System.schedule('Notification email Batch', CRON_EXP, new IPMNotificationEmail() );   
        Test.stopTest();
    }
    
    //IPMNotificationEmail notification = new IPMNotificationEmail();
    //String jobId = System.schedule('testBasicScheduledApex',IPMNotificationEmail.CRON_EXP, new IPMNotificationEmail());
    //notification.execute(notification);
    
}