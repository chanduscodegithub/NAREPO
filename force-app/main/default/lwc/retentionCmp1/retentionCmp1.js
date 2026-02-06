/* eslint-disable no-constant-condition */
/* eslint-disable no-alert */
/* eslint-disable vars-on-top */
/* eslint-disable no-console */
import { LightningElement, wire, track, api } from 'lwc';
import GetAllRenewalData from '@salesforce/apex/RetentionStatusController.GetAllRenewalData';
import proactiveRenewal from '@salesforce/apex/RenewalController.proactiveRenewal';
import fetchPicklist from '@salesforce/apex/RetentionStatusController.fetchPicklist';
import getTemplateInXML from '@salesforce/apex/RetentionStatusController.getTemplateInXML';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RetentionCmp1 extends LightningElement {
    @track cssDisplay = '';
    isLoad = true; //for loader

    @track error;
    @track regionPicklist; //picklist values (like month and year) come from custom MDT to apex, apex to JS
    @track RenewalStatusData; //data coming from apex controller RetentionStatusController.GetAllRenewalData
    @track reportTitle; //data coming from custom label to apex, apex to JS
    @track salesCycleLabelName; //data coming from custom label to apex, apex to JS
    @track ReportHeader;
    @track salesCycle = ''; //passed as parameter to apex method
    @track sortByColumnName = ''; //passed as parameter to apex method
    @track sortByOrder = ''; //passed as parameter to apex method
    @track isretentionDataListEmpty;
    @track sortEffectiveDateAsc = true;
    @track sortCompanyAsc = false;
    @track sortProductTypeAsc = true;


    @track disablePrintButton;
    @track retentionDataFetched;
    @track renewalDataFetched;

    @track proActiveRenewalData; //Variable created to store ProActive renewal data which will be used for print functionality....
    isSort = false;
    //isLoad = true; //for loader


    @track activeSections = ['A', 'B'];

    @api role = '';
    @track ROLE_SCE = 'CM SCE';
    @track ROLE_SVP = 'CD SVP';
    @track ROLE_SPCLTY = 'Specialty Benefits SVP';
    @track ROLE_SBSCE = 'Specialty Benefits SCE'; //SAMARTH
    @track isSbSceUser = false; //FOR SBSCE USER - SAMARTH

    /*@wire(GetAllRenewalData)
    RenewalStatusData;*/
    connectedCallback() { //executes first (similar to constructor)
        //---------FOR SBSCE USER - SAMARTH---------
        if(this.role === this.ROLE_SBSCE){
            this.isSbSceUser = true;
        }
        //---------FOR SBSCE USER - SAMARTH---------
        console.log('Inside Constructor');
        this.isLoad = true;
        this.getRetentionData();
    }

    renderedCallback() {
        if (this.template.querySelector(".section-header-style") === null || this.hasRendered === true)
        return;
        this.hasRendered = true;
        let style = document.createElement("style");
        style.innerText = `     
                     .section-header .slds-accordion__summary-heading{
                         background-color: hsla(219, 49%, 67%, 0.79);
                         padding: 4px 10px;
                         border-radius: 3px;
                         font-weight: 600;
                         font-size: 15px;
                     }    
                 `;
        this.template.querySelector(".section-header-style").appendChild(style);
    }


    getRetentionData() {
        this.isLoad = true;
        //this.cssDisplay = '';
        console.log('Inside getRetentionData');

        GetAllRenewalData({ SalesCycle: this.salesCycle, sortByColumnName: this.sortByColumnName, sortByOrder: this.sortByOrder })
            .then(result => {
                let retentionData = result; //data returned from apex controller
                console.log('Retention Data ' + JSON.stringify(retentionData));

                if (retentionData !== null && retentionData !== undefined && retentionData.length !== 0 && retentionData[0].hasOwnProperty("CompanyName")) {
                    console.log('Inside Retention comp if');
                    // "hasOwnProperty" returns a boolean indicating whether the object has the specified property as its own property (as opposed to inheriting it)
                    // this.regionPicklist=true;
                    this.isretentionDataListEmpty = false;
                    this.RenewalStatusData = result;
                    this.salesCycleLabelName = this.RenewalStatusData[0].ICMCycleLabel;
                    this.ReportHeader = this.RenewalStatusData[0].ICMHeaderLabel;
                    this.salesCycle = this.RenewalStatusData[0].salesCycle;
                    this.reportTitle = this.RenewalStatusData[0].ICMHeaderLabel;

                    this.disablePrintButton = false;
                    this.retentionDataFetched = true;

                    // this.sortEffectiveDateAsc=false;
                }
                else if (retentionData !== null && retentionData !== undefined && retentionData.length !== 0) {
                    console.log('Inside Retention comp else if');
                    this.isretentionDataListEmpty = true;
                    this.RenewalStatusData = result;
                    this.salesCycleLabelName = this.RenewalStatusData[0].ICMCycleLabel;
                    this.ReportHeader = this.RenewalStatusData[0].ICMHeaderLabel;
                    this.salesCycle = this.RenewalStatusData[0].salesCycle;
                    this.reportTitle = this.RenewalStatusData[0].ICMHeaderLabel;

                    this.disablePrintButton = true;

                }
                else {
                    console.log('Inside Retention comp else');
                    this.isretentionDataListEmpty = true;

                    this.disablePrintButton = true;

                }

                //ICM 2021 - SAMARTH
                if(this.isSbSceUser === false){ 
                    this.getProActiveRenewalData();
                }
                else{
                    this.isLoad = false;
                }
                //ICM 2021 - SAMARTH

                //this.cssDisplay = 'hidemodel';
            })
            .catch(error => {
                console.log('Error in Retention Cmp ==>' + JSON.stringify(error));
                this.isLoad = false;
                this.disablePrintButton = true;

                //ICM 2021 - SAMARTH
                if(this.isSbSceUser === false){ 
                    this.getProActiveRenewalData();
                }
                //ICM 2021 - SAMARTH

                //this.cssDisplay = 'hidemodel';               
            });

    }

    getProActiveRenewalData() {
        console.log('Inside getProActiveRenewalData');
        proactiveRenewal({ SalesCycle: this.salesCycle, sortByColumnName: this.sortByColumnName, sortByOrder: this.sortByOrder })
            .then(result => {
                this.proActiveRenewalData = result;
                if (result !== null && result !== undefined && result.length !== 0 && result[0].hasOwnProperty("MembershipActivityName")) {
                    this.disablePrintButton = false;
                }
                else {
                    if (this.getRetentionData.retentionDataFetched === true) {
                        console.log('this.getRetentionData.retentionDataFetched ' + this.getRetentionData.retentionDataFetched);
                        this.disablePrintButton = false;
                    }
                }
                this.isLoad = false;
            })
            .catch(error => {
                console.log('Error in Proactive renewal Data ==>' + JSON.stringify(error));
                this.disablePrintButton = true;
                this.isLoad = false;
                //this.cssDisplay = 'hidemodel';
            });
    }

    filterBasedOnPicklistValue(event) {
        console.log('inside picklist change method');
        this.salesCycle = event.target.value;
        this.getRetentionData();
        
        if(this.isSbSceUser === false){
            this.template.querySelector('c-renewal-sce').salesCycleFromParent(event.target.value); //for passing picklist value from parent to child
        }
    }

    handleDataFromProactiveRenewal(event) {
        let evntData = event.detail;
        this.proActiveRenewalData = evntData.proActiveRenewalData;
        //console.log('this.proActiveRenewalData inside event handler ' + JSON.stringify(this.proActiveRenewalData));

        if (evntData.isSort === true) {
            this.isLoad = true;
            //this.cssDisplay = '';
        }
        else if (evntData.isSort === false) {
            this.isLoad = false;
            //this.cssDisplay = 'hidemodel';
        }
        this.isLoad = false;
        //this.cssDisplay = 'hidemodel';
    }

    @wire(fetchPicklist, { objectPassed: 'Renewal_Status__c', fieldPassed: 'Sales_Cycle__c' })
    regionPicklistValues(result) {
        if (result.data) {
            this.regionPicklist = [];
            if (result.data !== undefined) {
                // console.log(result.data);
                result.data.forEach(opt => {
                    this.regionPicklist.push(opt);
                });
            }
        }
        else if (result.error) {
            this.error = result.error;
        }
    }

    sortFields(event) { // USED FOR SORTING PURPOSE
        var selectedItem = event.currentTarget; //identifies the current target for the event, as the event traverses the DOM (particular column in this case)
        var selectedItemToBeSorted = selectedItem.dataset.record;  //dataset.record  ?

        var fieldItagsWithAuraAttrMap = '{"Efective_Date__c":"sortEffectiveDateAsc","Company__r.name":"sortCompanyAsc","Product_Line__c":"sortProductTypeAsc"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[selectedItemToBeSorted];
        if (sortFieldCompName === 'sortEffectiveDateAsc') {
            //alert("Efficient");
            if (this.sortEffectiveDateAsc === true) {
                //console.log('Inside If');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortEffectiveDateAsc = false;
                this.getRetentionData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortEffectiveDateAsc = true;
                this.getRetentionData();
            }

        }
        else if (sortFieldCompName === 'sortCompanyAsc') {
            // alert("Company");
            if (this.sortCompanyAsc === true) {
                //console.log('Inside If');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortCompanyAsc = false;
                this.getRetentionData();

            }
            else {
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortCompanyAsc = true;
                this.getRetentionData();
            }
        }
        else if (sortFieldCompName === 'sortProductTypeAsc') {
            if (this.sortProductTypeAsc === true) {
                //console.log('Inside If');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortProductTypeAsc = false;
                this.getRetentionData();
            }
            else {
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortProductTypeAsc = true;
                this.getRetentionData();

            }
        }
        // if ((this.RenewalStatusData !== undefined) || (this.proActiveRenewalData !== undefined)) {
        //     this.disablePrintButton = false; //show print button if there is any data
        // } else {
        //     this.disablePrintButton = true; //show print button if there is any data
        // }
    }


    print() {
        this.isLoad = true;
        //this.cssDisplay = '';
        if (!this.isretentionDataListEmpty || (this.proActiveRenewalData !== undefined && this.proActiveRenewalData.length > 0)) { // if the table is not empty (data is present)
            console.log('retentionDataList is not empty');

            //-----SAMARTH-----
            let tempRole;
            if(this.isSbSceUser === true){
                tempRole = 'SBSCE';
            }
            else{
                tempRole = 'SCE';
            }
            //-----SAMARTH-----

            getTemplateInXML({ loggedInUserRole: tempRole }) //Changed parameter from 'SCE' to tempRole - SAMARTH
                .then(result => {
                    console.log('Inside if');
                    let responseData = result;
                    let objectItagesMap = responseData.objectItags;
                    let xmlWsectTag = responseData.xmlString;
                    let xmlTempleteString = '';
                    let rowCount = 3;
                    let salesCycle = this.salesCycle;
                    let salesCycleSplitByCommaStr = salesCycle.split(',')[1].trim();
                    let salesCycleDateFormatted = this.formatDateWithHyphenSeparate(salesCycleSplitByCommaStr);
                    let salesCycleValue = salesCycle.split(',')[0] + ', ' + salesCycleDateFormatted;
                    //console.log(result);

                    for (let objectName in objectItagesMap) {
                        if (objectItagesMap.hasOwnProperty(objectName)) {
                            if (objectName === 'Header') {
                                for (let k in objectItagesMap[objectName]) {

                                    if (k !== undefined) {
                                        let key = objectItagesMap[objectName][k];
                                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                                        let value = '';

                                        if (key === 'salesCycle') {
                                            value = salesCycle;
                                        } else if (key === 'currentDateTime') {


                                            value = this.formatDateTime('');

                                        }
                                        value = value != null ? value : '';
                                        value = value.toString();
                                        value = this.replaceXmlSpecialCharacters(value);



                                        xmlWsectTag = xmlWsectTag.split(replaceItagName).join(value);
                                    }
                                }


                            } else if (objectName === 'eachdata') {
                                let itagSets = objectItagesMap[objectName];
                                let startItag = '';
                                let endItag = '';
                                let setCount = 0;
                                for (let itagStrIndex in itagSets) {
                                    if (itagStrIndex !== undefined) {
                                        setCount = setCount + 1;
                                        if (setCount === 1) {
                                            startItag = itagSets[itagStrIndex];
                                        }
                                        if (setCount === itagSets.length) {
                                            endItag = itagSets[itagStrIndex];
                                        }
                                    }

                                }
                                startItag = '%%' + objectName + '.' + startItag + '@@';
                                endItag = '%%' + objectName + '.' + endItag + '@@';
                                //console.log('startItag' + startItag + ' : endItag : ' + endItag);

                                let startIndex = xmlWsectTag.lastIndexOf(startItag);
                                let endIndex = xmlWsectTag.indexOf(endItag);

                                let stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0" ss:Height="29.25">', startIndex);
                                let endHeaderIdx = xmlWsectTag.indexOf('</Row>', endIndex);
                                endHeaderIdx += '</Row>'.length;
                                let rowToReccurse = xmlWsectTag.substring(stHeaderIdx, endHeaderIdx);

                                xmlTempleteString = this.returnChildRows(rowToReccurse, xmlWsectTag, this.RenewalStatusData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount);
                                xmlWsectTag = xmlTempleteString;
                            } else if (objectName === 'proActiveRenewal') {
                                let itagSets = objectItagesMap[objectName];
                                let startItag = '';
                                let endItag = '';
                                let setCount = 0;
                                for (let itagStrIndex in itagSets) {
                                    if (itagStrIndex !== undefined) {
                                        setCount = setCount + 1;
                                        if (setCount === 1) {
                                            startItag = itagSets[itagStrIndex];
                                        }
                                        if (setCount === itagSets.length) {
                                            endItag = itagSets[itagStrIndex];
                                        }
                                    }

                                }
                                startItag = '%%' + objectName + '.' + startItag + '@@';
                                endItag = '%%' + objectName + '.' + endItag + '@@';
                                //console.log('startItag' + startItag + ' : endItag : ' + endItag);

                                let startIndex = xmlWsectTag.lastIndexOf(startItag);
                                let endIndex = xmlWsectTag.indexOf(endItag);

                                let stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0" ss:Height="29.29">', startIndex);
                                let endHeaderIdx = xmlWsectTag.indexOf('</Row>', endIndex);
                                endHeaderIdx += '</Row>'.length;
                                let rowToReccurse = xmlWsectTag.substring(stHeaderIdx, endHeaderIdx);

                                xmlTempleteString = this.returnChildRows(rowToReccurse, xmlWsectTag, this.RenewalStatusData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount);
                            }

                        }
                    }



                    let today = this.formatDate('');
                    let hiddenElement = document.createElement('a');
                    hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTempleteString);
                    //hiddenElement.href = 'data:text/xls;charset=utf-8;base64,' + this.base64Encode( xmlTempleteString );
                    hiddenElement.target = '_self'; // 
                    hiddenElement.download = 'Renewal Data Sheet ' + salesCycleValue + ' ' + today + '.xls';
                    document.body.appendChild(hiddenElement); // Required for FireFox browser



                    hiddenElement.click();
                    const event = new ShowToastEvent({
                        title: '',
                        message: 'Renewal Data Sheet Exported Successfully',
                    });
                    this.dispatchEvent(event);

                    this.isLoad = false;
                    //this.cssDisplay = 'hidemodel';
                    console.log('bottom of print try block');
                })
                .catch(error => {
                    console.log('Error ==>' + JSON.stringify(error));
                    this.isLoad = false;
                    //this.cssDisplay = 'hidemodel';
                });
        } else {
            const event = new ShowToastEvent({
                title: '',
                message: 'No records to print.',
            });
            this.dispatchEvent(event);
            this.isLoad = false;
        }


    }
    returnChildRows(rowToReccurse, xmlWsectTag, retentionData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount) {

        let totalRows = '';
        let count = 0;
        let highlightStyleId = "s72";
        let addRedColorFontCss = 's85';
        let nonHighlightStyleId = "s71";
        let alignTextLeft = 's79';
        let addBlackColorFontLeftAlign = 's84';
        if (objectName === 'eachdata') {
            for (let i in retentionData) {
                if (i !== undefined) {
                    let eachRow = rowToReccurse;
                    count = count + 1;
                    rowCount = rowCount + 1;
                    //alert(rowCount);
                    /*var replaceItagName = '%%'+objectName+'.'+'Serial_No'+'@@';
                        eachRow = eachRow.split(replaceItagName).join(count);*/
                    for (let k in objectItagesMap[objectName]) {
                        if (k !== undefined) {
                            let key = objectItagesMap[objectName][k];
                            let replaceItagName = '%%' + objectName + '.' + key + '@@';
                            let value = '';

                            if (key === 'ReadyToSendDate') {
                                let icSentStatusStyleId;
                                if (retentionData[i][key] === 'Not Sent - Action Needed') {
                                    icSentStatusStyleId = addRedColorFontCss;
                                    value = retentionData[i][key];

                                } else {
                                    icSentStatusStyleId = addBlackColorFontLeftAlign;
                                    value = retentionData[i][key];

                                }
                                eachRow = eachRow.split('##icSentStatusStyleId@@').join(icSentStatusStyleId);
                            }
                            else if (key === 'ReadyToExtractDate') {
                                let icDataExtractedStatusStyleId;
                                if (retentionData[i][key] === 'Not Yet Extracted') {

                                    value = retentionData[i][key];
                                    // eslint-disable-next-line dot-notation
                                    if (retentionData[i]['HighLightExtractedDate'] === 'Yes') {
                                        icDataExtractedStatusStyleId = addRedColorFontCss;
                                    } else {
                                        icDataExtractedStatusStyleId = addBlackColorFontLeftAlign;
                                    }

                                } else {
                                    icDataExtractedStatusStyleId = nonHighlightStyleId;
                                    value = retentionData[i][key];

                                }
                                eachRow = eachRow.split('##icDataExtractedStatusStyleId@@').join(icDataExtractedStatusStyleId);

                            }
                            else {
                                value = retentionData[i][key];
                            }
                            value = value != null ? value : '';
                            value = value.toString();
                            value = this.replaceXmlSpecialCharacters(value);
                            if (key === 'SalesSplitExist') {
                                if (retentionData[i][key] === 'Yes') {

                                    eachRow = eachRow.split('##salesIncentivesBeSplitStyleId@@').join(addRedColorFontCss);
                                } else {
                                    eachRow = eachRow.split('##salesIncentivesBeSplitStyleId@@').join(addBlackColorFontLeftAlign);
                                }

                            }

                            eachRow = eachRow.split(replaceItagName).join(value);
                        }
                    }

                    totalRows += eachRow;
                }
            }
            xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + totalRows + xmlWsectTag.substring(endHeaderIdx);
            xmlWsectTag = xmlWsectTag.split('##RowVal@@').join(rowCount);
            return xmlWsectTag;

        } else if (objectName === 'proActiveRenewal') {
            //Else logic goes here for Printing Proactive renewal Data
            for (let i in this.proActiveRenewalData) {
                //Logic goes here to print the data in second table...
                if (i !== undefined) {
                    let eachRow = rowToReccurse;
                    count = count + 1;
                    rowCount = rowCount + 1;
                    //alert(rowCount);
                    /*var replaceItagName = '%%'+objectName+'.'+'Serial_No'+'@@';
                        eachRow = eachRow.split(replaceItagName).join(count);*/
                    for (let k in objectItagesMap[objectName]) {
                        if (k !== undefined) {
                            let key = objectItagesMap[objectName][k];
                            let replaceItagName = '%%' + objectName + '.' + key + '@@';
                            let value = '';

                            if (key === 'AreDocumentsAttached') {
                                let icAreDocumentsAttachedStyleId;
                                if (this.proActiveRenewalData[i][key] === 'No') {
                                    if (this.proActiveRenewalData[i]['IncentiveStatus'] !== null && this.proActiveRenewalData[i]['IncentiveStatus'] !== undefined && this.proActiveRenewalData[i]['IncentiveStatus'].indexOf('Fully Validated') !== -1) {
                                        icAreDocumentsAttachedStyleId = addBlackColorFontLeftAlign;
                                        value = this.proActiveRenewalData[i][key];
                                    } else {
                                        icAreDocumentsAttachedStyleId = addRedColorFontCss;
                                        value = this.proActiveRenewalData[i][key];
                                    }

                                } else {
                                    icAreDocumentsAttachedStyleId = addBlackColorFontLeftAlign;
                                    value = this.proActiveRenewalData[i][key];

                                }
                                eachRow = eachRow.split('##icAreDocumentsAttachedStyleId@@').join(icAreDocumentsAttachedStyleId);

                            } else if (key === 'IncentiveStatus') {
                                let icIncentiveStatusStyleId;
                                if (this.proActiveRenewalData[i][key].indexOf('Pending Qualification') !== -1) {
                                    icIncentiveStatusStyleId = addRedColorFontCss;
                                    value = this.proActiveRenewalData[i][key];

                                } else {
                                    icIncentiveStatusStyleId = addBlackColorFontLeftAlign;
                                    value = this.proActiveRenewalData[i][key];

                                }
                                eachRow = eachRow.split('##icIncentiveStatusStyleId@@').join(icIncentiveStatusStyleId);
                            } else {
                                value = this.proActiveRenewalData[i][key];
                            }
                            value = value != null ? value : '';
                            value = value.toString();
                            value = this.replaceXmlSpecialCharacters(value);

                            eachRow = eachRow.split(replaceItagName).join(value);
                        }
                    }

                    totalRows += eachRow;
                }
            }
            xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + totalRows + xmlWsectTag.substring(endHeaderIdx);
            xmlWsectTag = xmlWsectTag.split('##RowVal@@').join(rowCount);
            return xmlWsectTag;
        }
    }
    replaceXmlSpecialCharacters(value) {
        let returnValue;
        if (value !== null && value !== undefined && value.length > 0) {
            value = value.replace(/&/g, '&amp;');
            value = value.replace(/>/g, '&gt;');
            value = value.replace(/</g, '&lt;');
            returnValue = value;
        } else {
            returnValue = '';
        }
        return returnValue;
    }
    formatDateTime(inputDateTime) {
        let returnFormattedDateTime = inputDateTime;
        let dateTime;
        if (inputDateTime === '' || inputDateTime === undefined) {
            dateTime = new Date().toLocaleString("en-US");
            dateTime = new Date(dateTime);
            dateTime = dateTime.toLocaleString();
        }

        if (dateTime !== undefined && dateTime != null && dateTime !== '') {
            let dateTimeValueFormatted;
            let dateTimeSeparatedArray;
            let timeSeparatedArray;
            if (dateTime.indexOf(',') !== -1) {
                dateTimeSeparatedArray = dateTime.split(',');
                //dateTimeValueFormatted=dateTimeSeparatedArray[0]+' '+dateTimeSeparatedArray[1];
                //returnFormattedDateTime=dateTimeValueFormatted;
                dateTimeValueFormatted = dateTimeSeparatedArray[0] + ' ';
                if (dateTimeSeparatedArray[1].indexOf(':') !== -1) {
                    timeSeparatedArray = dateTimeSeparatedArray[1].split(':');

                    let hr = timeSeparatedArray[0];
                    let mnt = timeSeparatedArray[1];
                    let period = timeSeparatedArray[2].split(' ')[1];

                    dateTimeValueFormatted = dateTimeValueFormatted +
                        hr + ':' + mnt + ' ' + period;

                    returnFormattedDateTime = dateTimeValueFormatted;
                }
            }
        }
        return returnFormattedDateTime;
    }
    formatDateWithHyphenSeparate(inputDate) {
        let dateToFormat;
        if (inputDate === '' || inputDate === undefined) {
            dateToFormat = new Date();
        }
        else {
            dateToFormat = new Date(inputDate);
        }
        let dd = dateToFormat.getDate();
        let mm = dateToFormat.getMonth() + 1; //January is 0!
        let yyyy = dateToFormat.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        //dateToFormat = mm + '/' + dd + '/' + yyyy;
        dateToFormat = mm + '-' + dd + '-' + yyyy;
        return dateToFormat;
    }
    formatDate(inputDate) {
        let dateToFormat;
        if (inputDate === '' || inputDate === undefined) {
            dateToFormat = new Date();
        }
        let dd = dateToFormat.getDate();
        let mm = dateToFormat.getMonth() + 1; //January is 0!
        let yyyy = dateToFormat.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        //dateToFormat = mm + '/' + dd + '/' + yyyy;
        dateToFormat = yyyy + '' + mm + '' + dd;
        return dateToFormat;
    }

}