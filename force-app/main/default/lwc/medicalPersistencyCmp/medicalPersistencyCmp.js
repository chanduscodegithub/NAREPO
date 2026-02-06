import { LightningElement, api, wire, track } from 'lwc';
import ICM_Medical_Persistency_Title from '@salesforce/label/c.ICM_Medical_Persis';
import medicalPersistencyData from '@salesforce/apex/medicalPersistencyController.medicalPersistencyData2';
import fetchPicklist from '@salesforce/apex/medicalPersistencyController.fetchPicklist';
import ICM_No_Records_Persistency from '@salesforce/label/c.ICM_No_Records_Persistency';
import ICM_Persistency_Footnote from '@salesforce/label/c.ICM_Persistency_Footnote';
import getTemplateInXML from '@salesforce/apex/medicalPersistencyController.getTemplateInXML';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class MedicalPersistencyCmp extends LightningElement {
    @api reportTitle;
    @api backEndData;
    @api isMedicalPersistencyListEmpty;
    @track salesCycle = '';
    @api regionPicklist;
    // @api thisYear;
    // @api prevYear;
    isLoad = true;
    @api isVpcr;
    @track sortByOrder = '';

    @api noRecordsMessage;
    @api persistenctyFootNote;
    @track disablePrintButton;

    connectedCallback() {
        this.isLoad = true;
        this.reportTitle = ICM_Medical_Persistency_Title;
        this.persistenctyFootNote = ICM_Persistency_Footnote;
        this.noRecordsMessage = ICM_No_Records_Persistency;
        this.getMedicalPersistencyData();
    }

    getMedicalPersistencyData() {
        this.isLoad = true;
        medicalPersistencyData({SalesCycle : this.salesCycle, SortByOrder : this.sortByOrder})
            .then(result => {
                console.log('result '+result);
                if (result !== null && result !== undefined && result.length !== 0 && result[0].hasOwnProperty("accountName")) {
                    console.log('Entering result if');
                    this.salesCycle = result[0].salesCycleBackEnd;
                    // this.thisYear = result[0].thisYear;
                    // this.prevYear = result[0].prevYear;
                    this.backEndData = result;
                    this.isVpcr = result[0].isVpcr;
                    this.isMedicalPersistencyListEmpty = false;
                    this.disablePrintButton = false;
                    console.log('this.isVpcr '+this.isVpcr);
                }
                else{
                    console.log('Entering result else');
                    this.salesCycle = result[0].salesCycleBackEnd;
                    this.isMedicalPersistencyListEmpty = true;
                    this.disablePrintButton = true;
                }
                this.isLoad = false;
            })
            .catch(error => {
                console.log('Error in Medical Persistency Data' + JSON.stringify(error));
                this.isLoad = false;
            })
    }

    @wire(fetchPicklist)
    regionPicklistValues(result) {
        if (result.data) {
            this.regionPicklist = [];
            if (result.data !== undefined) {
                console.log(result.data);
                result.data.forEach(opt => {
                    console.log('opt '+opt);
                    this.regionPicklist.push(opt);
                });
            }
        }
        else if (result.error) {
            this.error = result.error;
        }
    }

    filterBasedOnPicklistValue(event){
        this.salesCycle = event.target.value;
        //console.log('salesCycle in picklist event handler'+this.salesCycle);
        this.getMedicalPersistencyData();
    }

    sortFields(event){
        console.log('inside sort');
        var selectedItem = event.currentTarget;
        console.log('selectedItem '+selectedItem);

        var selectedItemToBeSorted = selectedItem.dataset.record;
        console.log('selectedItemToBeSorted '+selectedItemToBeSorted);

        var fieldItagsWithAuraAttrMap = '{"AccountFirm__r.Name":"sortCompanyAsc"}';
        console.log('fieldItagsWithAuraAttrMap '+fieldItagsWithAuraAttrMap);

        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        console.log('sortFieldCompNameMap '+sortFieldCompNameMap);

        var sortFieldCompName = sortFieldCompNameMap[selectedItemToBeSorted];
        console.log('sortFieldCompName '+sortFieldCompName);

        if (sortFieldCompName === 'sortCompanyAsc') {
            if (this.sortCompanyAsc === true) {
                this.sortByOrder = 'ASC';
                this.sortCompanyAsc = false;
                this.getMedicalPersistencyData();
            }
            else {
                this.sortByOrder = 'DESC';
                this.sortCompanyAsc = true;
                this.getMedicalPersistencyData();
            }

        }
    }

    exportRecords(){
        this.cssDisplay = '';
        getTemplateInXML({ loggedInUserRole: this.loggedInUserRole })
            .then(result => {
                let responseData = result;
                let objectItagesMap = responseData.objectItags;
                let xmlWsectTag = responseData.xmlString;
                let xmlTempleteString = '';
                let rowCount = 3;
                let salesCycle = this.salesCycle;
                let salesCycleSplitByCommaStr = salesCycle.split(',')[1].trim();
                let salesCycleDateFormatted = this.formatDateWithHyphenSeparate(salesCycleSplitByCommaStr);
                let salesCycleValue = salesCycle.split(',')[0] + ', ' + salesCycleDateFormatted;
                console.log(result);

                for (let objectName in objectItagesMap) {
                    if (objectItagesMap.hasOwnProperty(objectName)) {
                        if (objectName === 'Header') {
                            console.log('objectName ' + objectName);
                            for (let k in objectItagesMap[objectName]) {

                                if (k !== undefined) {
                                    let key = objectItagesMap[objectName][k];
                                    let replaceItagName = '%%' + objectName + '.' + key + '@@';
                                    let value = '';

                                    if (key === 'salesCycle') {
                                        value = salesCycle;
                                    }
                                    else if (key === 'currentDateTime') {
                                        value = this.formatDateTime('');
                                    }
                                    value = value != null ? value : '';
                                    value = value.toString();
                                    value = this.replaceXmlSpecialCharacters(value);

                                    xmlWsectTag = xmlWsectTag.split(replaceItagName).join(value);
                                }
                            }
                        } 
                        
                        else {
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
                            console.log('startItag' + startItag + ' : endItag : ' + endItag);

                            let startIndex = xmlWsectTag.lastIndexOf(startItag);
                            let endIndex = xmlWsectTag.indexOf(endItag);

                            let stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0" ss:Height="29.25">', startIndex);
                            let endHeaderIdx = xmlWsectTag.indexOf('</Row>', endIndex);
                            endHeaderIdx += '</Row>'.length;
                            let rowToReccurse = xmlWsectTag.substring(stHeaderIdx, endHeaderIdx);



                            xmlTempleteString = this.returnChildRows(rowToReccurse, xmlWsectTag, this.backEndData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount);
                        }

                    }
                }



                let today = this.formatDate('');
                let hiddenElement = document.createElement('a');
                hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTempleteString);
                //hiddenElement.href = 'data:text/xls;charset=utf-8;base64,' + this.base64Encode( xmlTempleteString );
                hiddenElement.target = '_self'; // 
                hiddenElement.download = 'Medical Persistency Data Sheet ' + salesCycleValue + ' ' + today + '.xls';
                document.body.appendChild(hiddenElement); // Required for FireFox browser



                hiddenElement.click();
                const event = new ShowToastEvent({
                    title: '',
                    message: 'Medical Persistency Data Sheet Exported Successfully',
                });
                this.dispatchEvent(event);

                this.cssDisplay = 'hidemodel';
            })
            .catch(error => {
                console.log('Error ==>' + JSON.stringify(error));
                console.log('Error ==>' + error);
                this.cssDisplay = 'hidemodel';
            });
        //}

    }

    returnChildRows(rowToReccurse, xmlWsectTag, queriedData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount) {
        let totalRows = '';
        let count = 0;
        /*let highlightStyleId = "s72";
        let nonHighlightStyleId = "s71";*/
        let highlightStyleId = "s79";
        let nonHighlightStyleId = "s78";
        for (let i in queriedData) {
            console.log('Entering outer for');
            let eachRow = rowToReccurse;
            count = count + 1;
            //rowCount = rowCount + 1;

            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                let value = '';

                 if (key === 'accountName') {
                    if (queriedData[i].hasOwnProperty(key) &&
                    !this.isBlank(queriedData[i][key])) {
                    value = queriedData[i][key];
                    } 
                    
                 }
                else if (key === 'previousYearGlMembership') {
                    if (queriedData[i].hasOwnProperty(key) &&
                    !this.isBlank(queriedData[i][key])) {
                    
                    value = queriedData[i][key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    } 
                    
                 }
                 else if (key === 'currentYearGlMembership') {
                    if (queriedData[i].hasOwnProperty(key) &&
                    !this.isBlank(queriedData[i][key])) {
                        value = queriedData[i][key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    } 
                     
                 }
                 else if (key === 'transferIn') {
                    if (queriedData[i].hasOwnProperty(key) &&
                    !this.isBlank(queriedData[i][key])) {
                        value = queriedData[i][key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    } 
                     
                 }
                 else if (key === 'transferOut') {
                    if (queriedData[i].hasOwnProperty(key) &&
                    !this.isBlank(queriedData[i][key])) {
                        value = queriedData[i][key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    } 
                    
                 }else if (key === 'adjustedPreviousYearGlMembership') {
                    if (queriedData[i].hasOwnProperty(key) &&
                    !this.isBlank(queriedData[i][key])) {
                        value = queriedData[i][key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    } 
                    
                 }else if (key === 'adjustedCurrentYearGlMembership') {
                    if (queriedData[i].hasOwnProperty(key) &&
                    !this.isBlank(queriedData[i][key])) {
                        value = queriedData[i][key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    } 
                    
                 }else if (key === 'medicalPersistency') {
                    if (queriedData[i].hasOwnProperty(key) &&
                    !this.isBlank(queriedData[i][key])) {
                    value = queriedData[i][key];
                    value = queriedData[i][key];
                    value = value.replace("%","");
                    value = value/100;
                    value = parseFloat(value).toFixed(4);
                    } 
                    
                 }else if (key === 'cmStartDate') {
                    if (queriedData[i].hasOwnProperty(key) &&
                    !this.isBlank(queriedData[i][key])) {
                    value = queriedData[i][key];
                    } 
                    
                 }else if (key === 'cmEndDate') {
                    if (queriedData[i].hasOwnProperty(key) &&
                    !this.isBlank(queriedData[i][key])) {
                    value = queriedData[i][key];
                    } 
                    
                 }


                value = value != null ? value : '';
                value = value.toString();
                value = this.replaceXmlSpecialCharacters(value);

                eachRow = eachRow.split(replaceItagName).join(value);
            }

            totalRows += eachRow;
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + totalRows + xmlWsectTag.substring(endHeaderIdx);
        //xmlWsectTag = xmlWsectTag.split('##RowVal@@').join(rowCount);
        return xmlWsectTag;
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
        dateToFormat = yyyy + '' + mm + '' + dd;
        return dateToFormat;
    }

    formatDateTime(inputDateTime) {
        let returnFormattedDateTime = inputDateTime;
        let dateTime;
        if (inputDateTime === '' || inputDateTime === undefined) {
            dateTime = new Date().toLocaleString("en-US");
            dateTime = new Date(dateTime);
            dateTime = dateTime.toLocaleString();

        }
        else {
            dateTime = new Date(inputDateTime).toLocaleString("en-US", { timeZone: this.loggedInUserTimeZone });
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

    convertDateFormat(date) {
        let returnValue;
        if (date !== null && date !== undefined && date !== '') {
            let formattedDateArray = date.split('-');
            let dt = formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2]
            let month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1]
            let year = formattedDateArray[0];
            returnValue = month + '/' + dt + '/' + year;

        } else {
            returnValue = '';
        }
        return returnValue;
    }

    highlightICDataExtractedStatus(effectiveDate) {
        let highlightICDataExtractedStatus = false;
        if (!this.isBlank(effectiveDate)) {
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            let effctvDt = this.parseDate(effectiveDate);
            if (effctvDt < currentDate) {
                highlightICDataExtractedStatus = true;
            }
        } else {
            highlightICDataExtractedStatus = true;
        }
        return highlightICDataExtractedStatus;
    }

    parseDate(inputDate) {
        var parts = inputDate.match(/(\d+)/g);
        // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
        return new Date(parts[0], parts[1] - 1, parts[2]); // months are 0-based
    }

    isBlank(strVal) {
        var isStrBlank = true;
        if (strVal !== undefined && strVal != null && strVal !== '') {
            isStrBlank = false;
        }
        return isStrBlank;
    }

}