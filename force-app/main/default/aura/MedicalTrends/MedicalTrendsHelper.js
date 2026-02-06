/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 01-30-2024
 * @last modified by  : Spoorthy
**/
({
    getMedicalData: function (component, event) {


        var action = component.get("c.getMedTrendsDetails");
        console.log('action---' + JSON.stringify(action));
        action.setParams({
            accountId: component.get('v.recordId'),
            recordType: 'Traditional'
        });
        action.setCallback(this, function (response) {
            console.log('inside call back');
            var state = response.getState();

            if (state === 'SUCCESS') {

                let year1Value = '';
                let year2Value = '';
                let year3Value = '';
                let year4Value = '';
                let lastYear;
                let yearData=['','','',''];
                console.log(response.getReturnValue());
                let medList = response.getReturnValue();
                if (medList.length>0) {
                    lastYear = new Date(Math.max.apply(null, medList.map(function (e) {
                        return new Date(e.Year__c);
                    })));
                    var d = new Date(lastYear);
                    var n = d.getFullYear();
                    //yearData = [n - 3, n - 2, n - 1, n];
                   
                }else{
                    yearData = ['','','',''];
                }

               let yearDataFI = ['','','',''];
                for (var i = 0; i < medList.length; i++) {
                    if (i == 4) break;
                    let yearVal =parseInt(medList[i].Year__c);//(new Date(medList[i].Year__c)).getFullYear();//medList[i].Extract_Year__c;//
                    yearData[3-i]=yearVal;
                    if (medList[i].Policy_level_medical_trends__c != undefined) {
                        yearDataFI[3-i] =medList[i].Policy_level_medical_trends__c + '%';
                        /*if (n == yearVal) {
                            // this.year1 =yearVal;
                            year1Value = medList[i].Policy_level_medical_trends__c + '%';
                        } else if (yearVal == n - 1) {
                            // this.year2 =yearVal;
                            year2Value = medList[i].Policy_level_medical_trends__c + '%';
                        } else if (yearVal == n - 2) {
                            //this.year3 =yearVal;
                            year3Value = medList[i].Policy_level_medical_trends__c + '%';
                        } else if (yearVal == n - 3) {
                            //this.year4 =yearVal;
                            year4Value = medList[i].Policy_level_medical_trends__c + '%';
                        }*/
                    }
                }
               // let yearDataFI = [];
               /* let medData = [year4Value, year3Value, year2Value, year1Value];
                for(var i=0;i<medData.length;i++){
                    if(medData[i]=='' ){
                        yearDataFI.push('');
                    }else{
                        yearDataFI.push(yearData[i]);
                    }
                }*/
                component.set('v.yearsData', yearData);
                component.set('v.medicalData', yearDataFI);
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.log(errors);
                //alert(errors);
            }
        });
        $A.enqueueAction(action);
    }
})