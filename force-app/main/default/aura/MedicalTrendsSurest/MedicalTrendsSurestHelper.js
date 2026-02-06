({
    getMedicalData: function (component, event) {


        var action = component.get("c.getMedTrendsDetails");
        action.setParams({
            accountId: component.get('v.recordId'),
            recordType: 'Surest'
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
                    }
                }
               
                component.set('v.yearsData', yearData);
                component.set('v.medicalData', yearDataFI);
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.log(errors);
            }
        });
        $A.enqueueAction(action);
    }
})