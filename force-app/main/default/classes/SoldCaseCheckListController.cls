public with sharing class SoldCaseCheckListController {
    @AuraEnabled
    public Static String getTheXMLFileFromSR(Id recordId){
        
        Map<String,String> productNameandProductCode = new Map<String,String>();
        Map<String,String> productNameandFamily = new Map<String,String>();
        set<String> productName = new Set<String>();
        Set<String> headerName = new Set<String>();
        Set<String> replaceItags = new Set<String>();
        Id oppId = recordId;
        System.debug('oppId >>>'+oppId);
        String query = 'Select ';
        String itags ;
        String s= '';
        
        List<StaticResource> sr = [Select Name,Body from StaticResource where Name In ('SCCL','customMetadata') Limit  2];
        for(StaticResource staticResource : sr){
            String fileName = staticResource.Name;
            String fileBody = staticResource.body.toString();
            String[] filelines = new String[]{};
                if(fileName == 'customMetadata' ){
                    filelines = fileBody.split('\n');
                   // System.debug('filelines >>>>'+filelines);
                    for (Integer i=1;i<filelines.size();i++)
                    {
                        String[] inputvalues = new String[]{};
                        inputvalues = filelines[i].split(',');
                        String name = inputvalues[0];
                        String family = inputvalues[1];
                        String values = inputvalues[2];
                         system.debug('@@@@ family -->'+family+' name ==>'+name+' values '+values);
                       if(name != null && name != '' && family != null && family != ''){
                           system.debug('@@@@ family -->'+family+' name ==>'+name);
                           productNameandFamily.put(name, family); 
                           
                        }
                        if(name != null && name != '' && values != null && values != ''){
                            system.debug('name ==>'+name+'@@@@@ values @@@@@ '+values);
                             productNameandProductCode.put(name.trim(), values.trim());
                        }
                       
                    }
                } else{
                    s = staticResource.Body.toString();
                }      
            
            String regex =  '[##]+[a-zA-Z0-9_.]*[@@]+';
            Pattern regexPattern = Pattern.compile(regex);
            Matcher regexMatcher = regexPattern.matcher(s);
            //system.debug('regexMatcher@@@'+regexMatcher);
            while (regexMatcher.find())
            {
                // System.debug('inside while loop');
                String itag=regexMatcher.group();
                System.debug('itag'+itag);
                itag = itag.replaceAll('@@','');
                itag = itag.replaceAll('##Opportunity.','');
                //  system.debug('itag@@'+itag);
                //replaceTheseTagsMap.put(itag, '');
                replaceItags.add(itag);
                if(itags != null ){
                    itags=itags+','+itag; 
                    
                }else{
                    itags = itag;
                }
            }
            System.debug('itag >> '+itags);
            /*query ='Select '+itags+','+'(SELECT Id,Name, Product2.Name, Product2.ProductCode,Product2.Family,Sold_Retained_Members__c  FROM OpportunityLineItems) from Opportunity where Id =:oppId';
System.debug('query'+query);
List<Opportunity> oppp = Database.query(query);*/
            List<Opportunity> oppp = [Select Id,Name,Category__c,SCE__c,Medical_SVP__c ,BusinessType__c,Owner.Name,CloseDate,Incumbent_Primary_Medical__r.Name,Account.Name,Account.BillingState,Account.BillingStreet,Account.BillingCity,Account.BillingCountry,Account.BillingPostalCode,Account.Primary_Situs_State__c,EffectiveDate__c,SoldMembers__c from Opportunity where Id =:oppId WITH USER_MODE ];
            List<OpportunityLineItem> oplit = [SELECT Id,Name, Product2.Name, Product2.ProductCode,Product2.Family,Sold_Retained_Members__c  FROM OpportunityLineItem where OpportunityId =:oppId and sold_Retained_Members__c > 0 WITH USER_MODE];
            System.debug('oplit >>> size'+oplit.size());
            for(OpportunityLineItem oppLI :oplit ){
                System.debug('inside the loop'+oppLI.Product2.Name+'>>>>>>'+oppLI.Product2.Family+'abcgdjcdjdbvj');
                productName.add(oppLI.Product2.Name);
                System.debug('productName >>>>>> '+productName);
                    headerName.add(oppLI.Product2.Family);
                   
            }
            
         /*   for(String headerNames1 : headerName)
            {
                system.debug('Inside the for loop of header '+productNameandProductCode.containsKey(headerNames1));
                if(productNameandProductCode.containsKey(headerNames1)){
                    string productheader = productNameandProductCode.get(headerNames1).trim();
                    if(productheader != null && productheader !=''){
                      s= s.replace('<!--'+productheader+'-->', '<Data ss:Type="String">'+'Yes'+'</Data>');   
                    }
                    
                    //s= s.replace('<!--CON-DRI-->','<Data ss:Type="String">'+'Yes'+'</Data>');
                    System.debug('headerNameandvalue.get(headerNames)'+ productNameandProductCode.get(headerNames1));
                }
            }*/
            for(String productNames :productName ){
                if(productNameandProductCode.containsKey(productNames))
                {
                    s= s.replace('<!--'+productNameandProductCode.get(productNames).trim()+'-->', '<Data ss:Type="String">'+'Yes'+'</Data>'); 
                    System.debug('productNameandProductCode.get(productNames) <!--'+(productNameandProductCode.get(productNames)).trim()+'-->');
                    String familyName = productNameandFamily.get(productNames).trim();
                    if(familyName != null && familyName != ''){
                    if(productNameandProductCode.containsKey(familyName)){
                        System.debug('familyName >> '+familyName+' productNameandProductCode.get(productNames).trim() '+productNameandProductCode.get(familyName).trim());
                       s= s.replace('<!--'+productNameandProductCode.get(familyName).trim()+'-->', '<Data ss:Type="String">'+'Yes'+'</Data>');    
                    }
                    //s= s.replace('<!--'+productNameandFamily.get(productNames).trim()+'-->', '<Data ss:Type="String">'+'Yes'+'</Data>');   
                }
                 }
            }
            for(Opportunity op : oppp){
                /* System.debug('op '+op.get('Name'));
System.debug('owner name '+op.Owner.Name);
//Owner  ow = new Owner();
System.debug('owner name '+op.get('Account'));
SYstem.debug('888888888888888888888888888888888888888888888888888888888888888888888888');*/
                for(String itagRepl : replaceItags){
                    String firstName,lastName;
                    lastName=itagRepl.substringAfter('.');
                    firstName=itagRepl.substringBefore('.');
                    System.debug('firstName >>  '+firstName +'Last Name >>>  '+lastName);
                    
                    if(firstName==''||firstName == null){
                        system.debug('inside the if condition');
                    }
                    
                    //System.debug('op[itagRepl]'+op.get(itagRepl));
                    //s = s.replace('##Opportunity.'+itagRepl+'@@',String.valueOf(op.get(itagRepl)));
                    //s = s.replace('##Opportunity.'+itagRepl+'@@',String.valueOf(op.));
                    //s = s.replace('',String.valueOf(op.get(itagRepl)));
                    //s=s.replace('op[itagRepl]'+);
                    Datetime dt =(DateTime) op.CloseDate;
                    String closeDate = getDateFormatted(dt.addDays(1));
                    if(String.valueof(op.BusinessType__c) == 'Client Management'){
                       // if(op.Medical_SVP__c  != null ){
                            s= s.replace('##Opportunity.SCE__c@@', String.valueof(op.Owner.Name));
                       /* }
                        else{
                            s= s.replace('##Opportunity.SCE__c@@','');
                        }*/
                        s= s.replace('##Opportunity.Medical_SVP__c@@', '');
                        s=s.replace('##Opportunity.BusinessType__c@@','NBEA');
                    }else if(String.valueof(op.BusinessType__c )== 'Client Development'){
                       /* if(op.Medical_SVP__c  != null )
                        {*/
                            s= s.replace('##Opportunity.Medical_SVP__c@@',String.valueof(op.Owner.Name));
                       /* }
                        else{s= s.replace('##Opportunity.Medical_SVP__c@@','');}*/
                        s= s.replace('##Opportunity.SCE__c@@', '');
                        s=s.replace('##Opportunity.BusinessType__c@@','NB');
                    }
                    //  s= s.replace('##Opportunity.Owner.Name@@', op.Owner.Name);
                    
                    if(closeDate != null){
                        s=s.replace('##Opportunity.CloseDate@@',closeDate);
                    }else{
                        s=s.replace('##Opportunity.CloseDate@@','');
                    }
                    
                    if(op.Incumbent_Primary_Medical__r.Name != null ){
                        s= s.replace('##Opportunity.Incumbent_Primary_Medical__r.Name@@',String.valueof(op.Incumbent_Primary_Medical__r.Name));
                    }else{
                        s= s.replace('##Opportunity.Incumbent_Primary_Medical__r.Name@@',' ' );
                    }  
                    
                    s= s.replace('##Opportunity.Account.Name@@', op.Account.Name);
                    String address = ' ';
                   if(op.Account.BillingStreet != null){
                        if(address != null || address != ''){
                            address=address+','+op.Account.BillingStreet;  
                        }else{
                            address = op.Account.BillingStreet ;  
                        }
                    }
                    
                    if (op.Account.BillingCity != null){
                        if(address != null || address != ''){
                            address=address+','+op.Account.BillingCity;  
                        }else{
                            address = op.Account.BillingCity ;  
                        }
                    }                   
                    if(op.Account.BillingState != null){
                        if(address != null || address != ''){
                            address=address+','+op.Account.BillingState;  
                        }else{
                            address = op.Account.BillingState ;  
                        }
                    }
                    
                    
                    if(op.Account.BillingCountry!= null){
                        if(address != null || address != ''){
                            address=address+','+op.Account.BillingCountry;  
                        }else{
                            address = op.Account.BillingCountry ;  
                        }
                        
                    }if(op.Account.BillingPostalCode != null){
                        if(address != null || address != ''){
                            address=address+','+op.Account.BillingPostalCode;  
                        }else{
                            address = op.Account.BillingPostalCode ;  
                        }
                    }
                    
                     
                    if(address != null || address != ''){
                        s= s.replace('##Opportunity.Account.BillingAddress@@',address);   
                    }else{
                        s= s.replace('##Opportunity.Account.BillingAddress@@',' ');
                    }
                    Datetime dt1 =(DateTime) op.EffectiveDate__c;
                    String effectiveDate = '';
                    if(dt1 != null ){
                        effectiveDate = getDateFormatted(dt1.addDays(1));
                    }
                    
                    if(effectiveDate != null){
                        s= s.replace('##Opportunity.EffectiveDate__c@@', effectiveDate);  
                    }
                    else{
                        s= s.replace('##Opportunity.EffectiveDate__c@@', '');  
                    }
                    
                    
                    if(op.SoldMembers__c != null ){
                        s= s.replace('##Opportunity.SoldMembers__c@@', String.valueOf(op.SoldMembers__c)); 
                    }else{
                        s= s.replace('##Opportunity.SoldMembers__c@@', ' ');
                    }
                    
                    if(op.Account.Primary_Situs_State__c != null && op.Account.Primary_Situs_State__c != '' && op.Account.Primary_Situs_State__c != ' '){
                        s= s.replace('##Opportunity.Account.Primary_Situs_State__c@@', op.Account.Primary_Situs_State__c);  
                    }else{
                        s= s.replace('##Opportunity.Account.Primary_Situs_State__c@@', ' ');  
                    }                   
                }
            }
            System.debug(s);
            blob csvBlob = Blob.valueOf(s);
            string csvname= 'Account.xls';
            //System.debug('string'+s);
        }return s;
    }
    public static String getDateFormatted(Datetime formatDate){
        //DateTime d = System.now();
        DateTime yourDate = formatDate;
        String dateOutput = yourDate.format('M/d/yyyy');
        System.debug('Debug: '+dateOutput);
        return dateOutput;
        
    }
}