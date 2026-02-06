import { LightningElement, api, wire } from 'lwc';




export default class FinancialsComp extends LightningElement {

    @api recordId;
   
    @api headerLabel;

financialMedicalList=[];
financialrxDataList=[];
isFinancialsDataEmpty = true;
year2018Med='';
year2019Med='';
year2020Med='';
year2021Med='';
year2018Rx='';
year2019Rx='';
year2020Rx='';
year2021Rx='';

financialsData = {};

@api
get financialData() {

    return this.financialsData;
}
set financialData(value) {
    
 this.financialsData = value;
 let financialsData = this.financialsData ;
console.log('value-f-----'+value);
console.log('ssssssssssssssssssssss'+JSON.stringify(this.financialsData));
console.log('checking for no data');
if(!Object.keys(this.financialsData).length) {
    
    console.log('inside fin no data');
    let jsonList = [];

    let finMedJsonDataWenNoData1 = {}   
    finMedJsonDataWenNoData1['coloumn0Data'] = 'Membership';
    jsonList.push(finMedJsonDataWenNoData1);

    let finMedJsonDataWenNoData2= {}
    finMedJsonDataWenNoData2['coloumn0Data'] = 'Revenue';
    jsonList.push(finMedJsonDataWenNoData2);

    let finMedJsonDataWenNoData3 = {}
    finMedJsonDataWenNoData3['coloumn0Data'] = 'Margin';
    jsonList.push(finMedJsonDataWenNoData3);
    
    //console.log('finJsonData==='+JSON.stringify(finMedJsonDataWenNoData));
   
    this.financialMedicalList = jsonList;
    this.financialrxDataList = jsonList;
}
    if(financialsData.hasOwnProperty('Medical')){
        this.isFinancialsDataEmpty = false;
        let finMedList = financialsData.Medical;
        let jsonList = [];
        for(let i in finMedList){
           
            let financialMemberShipTypeMed = finMedList[i];
            let finMedJsonData = {}
            for(let k in financialMemberShipTypeMed ){
                finMedJsonData['coloumn'+k+'Data'] = financialMemberShipTypeMed[k];
            }
            console.log('finJsonData==='+JSON.stringify(finMedJsonData));
            jsonList.push(finMedJsonData);
        }
        console.log('jsonList last===='+JSON.stringify(jsonList));
        this.financialMedicalList = jsonList;
    }
    if(financialsData.hasOwnProperty('rxData')){
       
        let finRxList = financialsData.rxData;
        let jsonList = [];
        for(let i in finRxList){
           
            let financialMemberShipTypeRx = finRxList[i];
            let finRxJsonData = {}
            for(let k in financialMemberShipTypeRx ){
                finRxJsonData['coloumn'+k+'Data'] = financialMemberShipTypeRx[k];
            }
            console.log('finRxJsonData==='+JSON.stringify(finRxJsonData));
            jsonList.push(finRxJsonData);
        }
        console.log('jsonList last===='+JSON.stringify(jsonList));
        this.financialrxDataList = jsonList;
    }
    console.log(financialsData);
    if(financialsData.hasOwnProperty('YearArrayMed')){

       
       if( this.year2018Med != '' ){
        if(financialsData.YearArrayMed[3] != 0){
             this.year2018Med = financialsData.YearArrayMed[3];
         }else{
             this.year2018Med = ''; 
         }
     }else{
         if(financialsData.YearArrayMed[3] != 0){
             this.year2018Med = financialsData.YearArrayMed[3];
         }else{
            this.year2018Med = ''; 
        }
     }


      
       if( this.year2019Med != '' ){
        if(financialsData.YearArrayMed[2] != 0){
             this.year2019Med = financialsData.YearArrayMed[2];
         }else{
             this.year2019Med = ''; 
         }
     }else{
         if(financialsData.YearArrayMed[2] != 0){
             this.year2019Med = financialsData.YearArrayMed[2];
         }else{
            this.year2019Med = ''; 
        }
     }



       if( this.year2020Med != '' ){
        if(financialsData.YearArrayMed[1] != 0){
             this.year2020Med = financialsData.YearArrayMed[1];
         }else{
             this.year2020Med = ''; 
         }
     }else{
         if(financialsData.YearArrayMed[1] != 0){
             this.year2020Med = financialsData.YearArrayMed[1];
         }else{
            this.year2020Med = ''; 
        }
     }
    console.log('financialsData.YearArrayMed[0]====='+financialsData.YearArrayMed[0])
     if( this.year2021Med != '' ){
        if(financialsData.YearArrayMed[0] != 0){
             this.year2021Med = financialsData.YearArrayMed[0];
         }else{
             this.year2021Med = ''; 
         }
     }else{
         if(financialsData.YearArrayMed[0] != 0){
             this.year2021Med = financialsData.YearArrayMed[0];
         }else{
            this.year2021Med = ''; 
        }
     }

     
       
    }else{

        this.year2018Med='';
        this.year2019Med='';
        this.year2020Med='';
        this.year2021Med='';

    }
    if(financialsData.hasOwnProperty('YearArrayRx')){

      
           if( this.year2018Rx != '' ){
            if(financialsData.YearArrayRx[3] != 0){
                 this.year2018Rx = financialsData.YearArrayRx[3];
             }else{
                 this.year2018Rx = ''; 
             }
         }else{
             if(financialsData.YearArrayRx[3] != 0){
                 this.year2018Rx = financialsData.YearArrayRx[3];
             }else{
                this.year2018Rx = ''; 
            }
         }
    
         if( this.year2019Rx != '' ){
            if(financialsData.YearArrayRx[2] != 0){
                 this.year2019Rx = financialsData.YearArrayRx[2];
             }else{
                 this.year2019Rx = ''; 
             }
         }else{
             if(financialsData.YearArrayRx[2] != 0){
                 this.year2019Rx = financialsData.YearArrayRx[2];
             }else{
                this.year2019Rx = ''; 
            }
         }
    
         if( this.year2020Rx != '' ){
            if(financialsData.YearArrayRx[1] != 0){
                 this.year2020Rx = financialsData.YearArrayRx[1];
             }else{
                 this.year2020Rx = ''; 
             }
         }else{
             if(financialsData.YearArrayRx[1] != 0){
                 this.year2020Rx = financialsData.YearArrayRx[1];
             }else{
                this.year2020Rx = ''; 
            }
         }
    
         if( this.year2021Rx != '' ){
            if(financialsData.YearArrayRx[0] != 0){
                 this.year2021Rx = financialsData.YearArrayRx[0];
             }else{
                 this.year2021Rx = ''; 
             }
         }else{
             if(financialsData.YearArrayRx[0] != 0){
                 this.year2021Rx = financialsData.YearArrayRx[0];
             }else{
                this.year2021Rx = ''; 
            }
         }
    

        
    }else{
        this.year2018Rx='';
        this.year2019Rx='';
        this.year2020Rx='';
        this.year2021Rx='';
    }
   
    
}


}