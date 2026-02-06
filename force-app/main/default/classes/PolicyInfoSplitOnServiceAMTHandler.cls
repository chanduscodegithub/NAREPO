public class PolicyInfoSplitOnServiceAMTHandler {
    
    public static void policySplit(list<service_amt__c> saList,map<string,string> policyTypeMap){   //Added by Vignesh -- Capacity Model 2025s
        list<string> policyTypes =new list<string>{'Medical','OptumRx','Dental','Vision','Accident Protection','Critical Illness','Hospital Indemnity','Life/Di','FSA','CERA','HRA','HRA Account','HRA Standalone','Ret / URS', 'Flexwork'};
        string otherPol ='';
        for(service_amt__c sa:saList){
            set<string> policySet =new set<string>();
            if(sa.Policy_Information_MultiChecKlist__c!=null){
                policySet =new set<string>();
                otherPol='';
                for(string policyType:policyTypes){
                    for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
                        if(policySet.size()<20){
                            if(policyTypeMap.get(policy.trim())!=null)
                                if(policyTypeMap.get(policy.trim()).contains(policyType)){
                                    policySet.add(policy);
                                }
                        }
                    }
                }
                
                /*
if(policySet.size()<20)
for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
if(policySet.size()<20){
if(policyTypeMap.get(policy)!=null)
if(policyTypeMap.get(policy).contains('OptumRx')){
policySet.add(policy);
}
}
}

if(policySet.size()<20)
for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
if(policySet.size()<20){
if(policyTypeMap.get(policy)!=null)
if(policyTypeMap.get(policy).contains('Dental')){
policySet.add(policy);
}
}

}

if(policySet.size()<20)
for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
if(policySet.size()<20){
if(policyTypeMap.get(policy)!=null)
if(policyTypeMap.get(policy).contains('Vision')){
policySet.add(policy);
}
}

}

if(policySet.size()<20)
for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
if(policySet.size()<20){
if(policyTypeMap.get(policy)!=null)
if(policyTypeMap.get(policy).contains('Accident Protection')){
policySet.add(policy);
}
}

}
if(policySet.size()<20)
for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
if(policySet.size()<20){
if(policyTypeMap.get(policy)!=null)
if(policyTypeMap.get(policy).contains('Critical Illness')){
policySet.add(policy);
}
}

}

if(policySet.size()<20)
for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
if(policySet.size()<20){
if(policyTypeMap.get(policy)!=null)
if(policyTypeMap.get(policy).contains('Hospital Indemnity')){
policySet.add(policy);
}
}

}
if(policySet.size()<20)
for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
if(policySet.size()<20){
if(policyTypeMap.get(policy)!=null)
if(policyTypeMap.get(policy).contains('Life/Di')){
policySet.add(policy);
}
}

}
if(policySet.size()<20)
for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
if(policySet.size()<20){
if(policyTypeMap.get(policy)!=null)
if(policyTypeMap.get(policy).contains('FSA')){
policySet.add(policy);
}
}

}
if(policySet.size()<20)
for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
if(policySet.size()<20){
if(policyTypeMap.get(policy)!=null)
if(policyTypeMap.get(policy).contains('CERA')){
policySet.add(policy);
}
}

}
if(policySet.size()<20)
for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
if(policySet.size()<20){
if(policyTypeMap.get(policy)!=null)
if(policyTypeMap.get(policy).contains('HRA')){
policySet.add(policy);
}
}

}
if(policySet.size()<20)
for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
if(policySet.size()<20){
if(policyTypeMap.get(policy)!=null)
if(policyTypeMap.get(policy).contains('HRA Account')){
policySet.add(policy);
}
}

}
if(policySet.size()<20)
for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
if(policySet.size()<20){
if(policyTypeMap.get(policy)!=null)
if(policyTypeMap.get(policy).contains('HRA Standalone')){
policySet.add(policy);
}
}

}
if(policySet.size()<20)
for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
if(policySet.size()<20){
if(policyTypeMap.get(policy)!=null)
if(policyTypeMap.get(policy).contains('Ret / URS')){
policySet.add(policy);
}
}

}
*/
                if(policySet.size()<20){
                    for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
                        if(policyTypeMap.get(policy.trim())==null)
                            if(policySet.size()<20 ){
                                policySet.add(policy);
                            }
                    }
                }
                if(policySet.size()==20 && otherPol=='' ){
                    for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
                        if(!(policySet.contains(policy.trim()))){
                            if(otherPol!='')
                                otherPol =otherPol+';'+policy;
                            else 
                                otherPol =policy;
                        }
                    }
                }
            }
            // policySet.add(otherPol);
            
            list<string> policyList =new list<string>(policySet);
            if(policyList.size()<21)
                for(integer j=(policyList.size()-1);j<21;j++){
                    policyList.add('');
                }
            sa.Policy1__c =policyList[0];
            sa.Policy2__c =policyList[1];
            sa.Policy3__c =policyList[2];
            sa.Policy4__c =policyList[3];
            sa.Policy5__c =policyList[4];
            sa.Policy6__c =policyList[5];
            sa.Policy7__c =policyList[6];
            sa.Policy8__c =policyList[7];
            sa.Policy9__c =policyList[8];
            sa.Policy10__c =policyList[9];
            sa.Policy11__c =policyList[10];
            sa.Policy12__c =policyList[11];
            sa.Policy13__c =policyList[12];
            sa.Policy14__c =policyList[13];
            sa.Policy15__c =policyList[14];
            sa.Policy16__c =policyList[15];
            sa.Policy17__c =policyList[16];
            sa.Policy18__c =policyList[17];
            sa.Policy19__c =policyList[18];
            sa.Policy20__c =policyList[19];
            sa.Policy_Other__c =otherPol;
        }
    }
}