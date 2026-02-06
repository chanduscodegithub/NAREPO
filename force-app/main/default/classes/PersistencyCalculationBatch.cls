global class PersistencyCalculationBatch implements Database.Batchable<PolicyAccountMembership__c> {
    String emailString = System.Label.Persistency_Email;
    Date dateVal =date.today();
    Integer yearVal =dateVal.year();
    Integer monthVal =2;
    Integer preYear =yearVal-1;
    Integer numberOfDays = Date.daysInMonth(yearVal, 2);
    Integer prevYearnumberOfDays = Date.daysInMonth(preYear, 2);
    Date currLastDayOfMonth = Date.newInstance(yearVal, 2, numberOfDays);
    Date PrevLastDayOfMonth = Date.newInstance(preYear, 2, prevYearnumberOfDays);
    
    global Iterable<PolicyAccountMembership__c> start (Database.BatchableContext BC) {
        //Query the records which are Policy No='Total GL Membership' and Membership ='Medical'
        List<PolicyAccountMembership__c> polCurrentAccList = new List<PolicyAccountMembership__c>();
        List<PolicyAccountMembership__c> polPrevAccList = new List<PolicyAccountMembership__c>();
        List<account> accList = new List<account>();
        List<string> accIdList = new List<string>();
        List<string> policyIdList = new List<string>();
        List<string> accPrevIdList = new List<string>();
        map<id,list<Opportunity>> oppMap = new map<id,list<Opportunity>>();
        list<string> tlist =new list<string>();
        tlist.add('Transfer In');
        tlist.add('Transfer Out');
        list<opportunity> oppList =new list<opportunity>();
        list<opportunity> oppObjList =new list<opportunity>();
        map<id,list<PolicyAccountMembership__c>> accPolicyMap =new map<id,list<PolicyAccountMembership__c>>();
        list<PolicyAccountMembership__c> listOfPAM =new list<PolicyAccountMembership__c>();
        listOfPAM =[Select Id,GLDate__c,AccountFirm__c,GL_Membership_Status__c,Business_Line__c,MembershipType__c,Prior_Year_GL_Membership__c,Transfer_In__c,Transfer_Out__c,Adjusted_Prior_Year_GL_Membership__c,
                    Adjusted_Current_GL_Membership__c, GLMembership__c,Membership_Persistency__c,Override_Current_GL_Membership__c,Override_Membership_Persistency__c from PolicyAccountMembership__c 
                    where Name='Total GL Membership' and MembershipType__c='Medical' and (GLDate__c=:currLastDayOfMonth or GLDate__c=:PrevLastDayOfMonth)];
        for (PolicyAccountMembership__c polAccObj: listOfPAM) {
            Integer yearPol = polAccObj.GLDate__c.Year();
            Integer monthPol = polAccObj.GLDate__c.month();
            accIdList.add(polAccObj.AccountFirm__c);
            //Current Year Policy/Account membership records
            if(yearPol==yearVal && monthPol==2){
                
                polCurrentAccList.add(polAccObj);
                //policyIdList.add(polAccObj.Id);
            }
            //Current Previous Policy/Account membership records
            if(yearPol==preYear && monthPol==2){
                polPrevAccList.add(polAccObj);
                accPrevIdList.add(polAccObj.AccountFirm__c);
                //policyIdList.add(polAccObj.Id);
            }
        }
        string conDate = string.valueOf(yearVal);
        map<id,string> accBusinessList =new map<id,string>();
        accList =[SELECT id,Subtype__c,(select id,AccountId,Members_Trans_From_or_To_Another_Segment__c,EffectiveDate__c,Disposition_Medical__c,Sales_Season1__c,SalesStageDisposition__c	 from Opportunities where SalesStageDisposition__c	 in:tlist) FROM Account where id in:accIdList];
        for(account aa:accList){
            list<opportunity> oL =new list<opportunity>();
            accBusinessList.put(aa.Id,aa.Subtype__c);
            if(aa.Opportunities.size()>0){
                for(opportunity opp:aa.Opportunities){
                    String yearValOpp=opp.Sales_Season1__c;
                    //fetching only the current year opp from  Sales_Season1__c
                    if(yearValOpp.contains(conDate)){
                        oL.add(opp);
                    }
                }
            }
            oppMap.put(aa.Id,oL);
        }
        
        
        map<id,Decimal> accTransferInMap =new map<id,Decimal>();
        map<id,Decimal> accTransferOutMap =new map<id,Decimal>();
        for(PolicyAccountMembership__c pobj:polCurrentAccList){
            pobj.Transfer_Out__c =0;
            pobj.Transfer_In__c =0;
            pobj.Adjusted_Current_GL_Membership__c = pobj.GLMembership__c;
            
            
            if(oppMap.containsKey(pobj.AccountFirm__c)){
                list<opportunity> oppMapList= oppMap.get(pobj.AccountFirm__c);
                system.debug('size opp'+oppMapList.size());
                for(opportunity oppObj:oppMapList){
                    if(oppObj.Disposition_Medical__c =='Transfer In'){
                        pobj.Transfer_In__c =pobj.Transfer_In__c+oppObj.Members_Trans_From_or_To_Another_Segment__c;
                        /* if(pobj.Adjusted_Current_GL_Membership__c!=null){
pobj.Adjusted_Current_GL_Membership__c = (pobj.Adjusted_Current_GL_Membership__c-oppObj.Members_Trans_From_or_To_Another_Segment__c);
}else*/
                        pobj.Adjusted_Current_GL_Membership__c = (pobj.GLMembership__c-pobj.Transfer_In__c+pobj.Transfer_Out__c);
                    }else if(oppObj.Disposition_Medical__c =='Transfer Out'){
                        pobj.Transfer_Out__c =pobj.Transfer_Out__c+oppObj.Members_Trans_From_or_To_Another_Segment__c;
                        /* if(pobj.Adjusted_Current_GL_Membership__c!=null){
pobj.Adjusted_Current_GL_Membership__c = (pobj.Adjusted_Current_GL_Membership__c+oppObj.Members_Trans_From_or_To_Another_Segment__c);

}else*/
                        pobj.Adjusted_Current_GL_Membership__c = (pobj.GLMembership__c+pobj.Transfer_Out__c-pobj.Transfer_In__c);
                    }
                }                
            }
            accTransferInMap.put(pobj.AccountFirm__c,pobj.Transfer_In__c);
            accTransferOutMap.put(pobj.AccountFirm__c,pobj.Transfer_Out__c);
            boolean isNewRec =true;
            for(PolicyAccountMembership__c pp:polPrevAccList){
                if(pp.AccountFirm__c ==pobj.AccountFirm__c){
                    isNewRec=false;
                    break;
                }
            }
            if(isNewRec){
                pobj.GL_Membership_Status__c='New Business';
            }
            
        }
        list<PolicyAccountMembership__c> newPolicyList = new list<PolicyAccountMembership__c>();
        //Iterating over previous year records
        for(PolicyAccountMembership__c pp:polPrevAccList){
            
            
            Decimal Transfer_Out =0;
            Decimal Transfer_In =0;
            //pobj.Adjusted_Current_GL_Membership__c = pobj.GLMembership__c;
            
            
            if(oppMap.containsKey(pp.AccountFirm__c)){
                list<opportunity> oppMapList= oppMap.get(pp.AccountFirm__c);
                system.debug('size opp'+oppMapList.size());
                for(opportunity oppObj:oppMapList){
                    if(oppObj.Disposition_Medical__c =='Transfer In'){
                        Transfer_In =Transfer_In+oppObj.Members_Trans_From_or_To_Another_Segment__c;
                    }else if(oppObj.Disposition_Medical__c =='Transfer Out'){
                        Transfer_Out =Transfer_Out+oppObj.Members_Trans_From_or_To_Another_Segment__c;
                    }
                }                
            }
            accTransferInMap.put(pp.AccountFirm__c,Transfer_In);
            accTransferOutMap.put(pp.AccountFirm__c,Transfer_Out);
            
            list<PolicyAccountMembership__c> samePlList =new list<PolicyAccountMembership__c>();
            samePlList.add(pp);
            boolean isCurrentRec =false;
            if(pp.GL_Membership_Status__c=='Termed Business'){
                isCurrentRec =true;
            }
            //Iterating over current year records
            for(PolicyAccountMembership__c ppc:polCurrentAccList){
                //Check if the previous year record is availble in current year with same account. if yes copy Business line of previous year value
                //to the current year Prior year business line.
                if(pp.AccountFirm__c ==ppc.AccountFirm__c){
                    if(ppc.GL_Membership_Status__c=='Termed Business'){
                        isCurrentRec =true;
                        break;
                    }
                    if((pp.GLMembership__c!=0 && pp.GLMembership__c!=null)){
                        ppc.Prior_Year_GL_Membership__c =pp.GLMembership__c;
                        //pobj.GL_Membership_Status__c ='New Business';
                    }
                    ppc.Adjusted_Prior_Year_GL_Membership__c =ppc.Prior_Year_GL_Membership__c;
                    /*  if(ppc.Adjusted_Current_GL_Membership__c!=null && ppc.Adjusted_Prior_Year_GL_Membership__c!=null && ppc.Adjusted_Current_GL_Membership__c!=0)
ppc.Membership_Persistency__c =(ppc.Adjusted_Current_GL_Membership__c/ppc.Adjusted_Prior_Year_GL_Membership__c)*100;
if(ppc.Override_Current_GL_Membership__c!=null &&ppc.Override_Current_GL_Membership__c!=0 && ppc.Adjusted_Prior_Year_GL_Membership__c!=null){
ppc.Override_Membership_Persistency__c =(ppc.Override_Current_GL_Membership__c/ppc.Adjusted_Prior_Year_GL_Membership__c)*100;
}*/
                    ppc.Prior_Business_Line__c =pp.Business_Line__c; //api name changed from Prior_Year_Business_Line__c to Prior_Business_Line__c by Samarth
                    samePlList.add(ppc);
                    accPolicyMap.put(ppc.AccountFirm__c,samePlList);
                    isCurrentRec =true;
                    break;
                }
            }
            
            //If there is no current year record found, then insert new record.
            if(!isCurrentRec){
                PolicyAccountMembership__c newCurrentYearRecord =new PolicyAccountMembership__c();
                newCurrentYearRecord.Name ='Total GL Membership';
                newCurrentYearRecord.PolicyName__c ='Total GL Membership';
                newCurrentYearRecord.GLDate__c =currLastDayOfMonth;//date.newInstance(yearVal, 2, numberOfDays);
                newCurrentYearRecord.AccountFirm__c =pp.AccountFirm__c;
                newCurrentYearRecord.Adjusted_Prior_Year_GL_Membership__c =pp.GLMembership__c;
                newCurrentYearRecord.Prior_Year_GL_Membership__c =pp.GLMembership__c;
                newCurrentYearRecord.MembershipType__c='Medical';
                newCurrentYearRecord.GL_Membership_Status__c='Termed Business';
                if(accBusinessList.get(pp.AccountFirm__c)!=null){
                    newCurrentYearRecord.Business_Line__c =accBusinessList.get(pp.AccountFirm__c);
                }
                newCurrentYearRecord.Transfer_In__c=accTransferInMap.get(pp.AccountFirm__c);
                newCurrentYearRecord.Transfer_Out__c=accTransferOutMap.get(pp.AccountFirm__c);
                newCurrentYearRecord.GLMembership__c=0;
                if(newCurrentYearRecord.Transfer_Out__c-newCurrentYearRecord.Transfer_In__c>0){
                    newCurrentYearRecord.Adjusted_Current_GL_Membership__c=newCurrentYearRecord.Transfer_Out__c-newCurrentYearRecord.Transfer_In__c;
                }else
                    newCurrentYearRecord.Adjusted_Current_GL_Membership__c=0;
                newCurrentYearRecord.Prior_Business_Line__c =pp.Business_Line__c;
                polCurrentAccList.add(newCurrentYearRecord);
            }
        }
        
        
        return polCurrentAccList;
        
    }
    
    global void execute (Database.BatchableContext BC, List<PolicyAccountMembership__c> scope) {
        upsert scope;
    }
    
    global void finish(Database.BatchableContext BC) {
        string name;
        list<Organization> org = [select id,IsSandbox from Organization limit 1];
        if(org[0].IsSandbox == true){
            name ='Sandbox';
        }else
        {
            name ='Production';
        }
        //Query the AsyncApexJob object to retrieve the current job's information.
        AsyncApexJob apexJob = [SELECT Id, Status, NumberOfErrors, JobItemsProcessed, TotalJobItems, CreatedBy.Email
                                FROM AsyncApexJob WHERE Id =: BC.getJobId()];
        
        //Send an email to the Apex job's submitter notifying of job completion.
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        String[] toAddress = new String[] {emailString};
            system.debug('apexJob.CreatedBy.Email : '+apexJob.CreatedBy.Email);
        mail.setToAddresses(toAddress);
        mail.setSubject('Persistency Apex Job Status ');// + apexJob.Status
        mail.setHtmlBody('The persistency batch job has successfully completed with '+ apexJob.NumberOfErrors + ' failures. <br/><br/>'+'Organization: '+name);
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
    }
    
}