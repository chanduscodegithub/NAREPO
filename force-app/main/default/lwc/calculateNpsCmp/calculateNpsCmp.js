/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 04-02-2024
 * @last modified by  : Spoorthy
**/
import { LightningElement, api, wire, track } from 'lwc';
import ICM_Calculate_NPS_Title from '@salesforce/label/c.ICM_Calculate_NPS_Title';
import calculateNpsData from '@salesforce/apex/calculateNpsController.clientSurveyResultsData';
import fetchPicklist from '@salesforce/apex/calculateNpsController.fetchPicklist';

import ICM_No_Records_NPS from '@salesforce/label/c.ICM_No_Records_NPS';
import ICM_NPS_Footnote from '@salesforce/label/c.ICM_NPS_Footnote';

import getTemplateInXML from '@salesforce/apex/calculateNpsController.getTemplateInXML';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CalculateNpsCmp extends LightningElement {
    @api reportTitle;
    @api backEndData;
    @api regionPicklist;
    @api isCalculateNpsListEmpty;
    @track salesCycle = '';
    isLoad = true;
    @api isRvpUser;
    @api noRecordsMessage;
    @api loggedInUserRole;
    @track disablePrintButton = false;
    @api npsFootNote;
    @track sortCompanyAsc = false;
    @track sortCurrentNetPromoterAsc = true;
    @track sortPriorNetPromoterAsc = true;
    @track sortCurrentSceAsc = true;
    @track sortByColumnName = '';
    @track sortByOrder = '';
    // @track sortCurrentScoreAsc = true;
    // @track sortPriorScoreAsc = true;

    //----------ICM 2021 enhancements - SAMARTH----------
    @track ROLE_SBSCE = 'Specialty Benefits SCE';
    @track isSbSceUser = false;
    @track ROLE_CMSCE = 'CM SCE';
    @track ROLE_SCMSCE = 'Surest CM SCE';
    @track ROLE_SCMSVP = 'Surest CM SVP';
    @track isCmSceUser = false; 
    //----------ICM 2021 enhancements - SAMARTH----------

    connectedCallback() {
        if (this.role === this.ROLE_SBSCE) {
            this.isSbSceUser = true;
        }

        if (this.role === this.ROLE_CMSCE || this.role === this.ROLE_SCMSCE || this.role === this.ROLE_SCMSVP) {
            this.isCmSceUser = true;
        }

        this.isLoad = true;
        this.npsFootNote = ICM_NPS_Footnote;
        this.reportTitle = ICM_Calculate_NPS_Title;
        this.noRecordsMessage = ICM_No_Records_NPS;
        this.getCalculateNpsDate();
    }

    getCalculateNpsDate() {
        this.isLoad = true;
        console.log('Inside getCalculateNpsDate');
        calculateNpsData({ SalesCycle: this.salesCycle, SortByColumnName: this.sortByColumnName, SortByOrder: this.sortByOrder })
            .then(result => {
                console.log('result after then'+result);
                var flag;
                if (result !== null && result !== undefined && result.length !== 0 && result[0].hasOwnProperty("accountName")) {
                    
                    this.salesCycle = result[0].salesCycleBackEnd;
                    this.backEndData = result;

                    if (result[0].userRole === 'rvp') {
                        this.isRvpUser = true;
                    }
                    else {
                        this.isRvpUser = false;
                    }
                    //alert(result.length);
                    console.log('result'+result);
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].currentYearRecordId === undefined || result[i].currentYearRecordId === null) {
                            flag = true;
                        }
                        else {
                            flag = false;
                            break;
                        }
                    }

                    if (flag === true) {
                        this.isCalculateNpsListEmpty = true;
                        this.disablePrintButton = true;
                    }
                    else {
                        this.isCalculateNpsListEmpty = false;
                        this.disablePrintButton = false;
                    }
                }
                else {
                    if (result[0].userRole === 'rvp') {
                        this.isRvpUser = true;
                    }
                    else {
                        this.isRvpUser = false;
                    }

                    this.salesCycle = result[0].salesCycleBackEnd;
                    this.disablePrintButton = true;
                    this.isCalculateNpsListEmpty = true;
                }
                this.isLoad = false;
            })
            .catch(error => {
                console.log('Error in Calculate Nps Data' + error);
                console.log('Error in Calculate Nps Data' + JSON.stringify(error));
                this.isLoad = false;
            })
    }
    @wire(fetchPicklist)
    regionPicklistValues(result) {
        if (result.data) {
            this.regionPicklist = [];
            if (result.data !== undefined) {
                //  console.log(result.data);
                result.data.forEach(opt => {
                    //   console.log('opt ' + opt);
                    this.regionPicklist.push(opt);
                });
            }
        }
        else if (result.error) {
            this.error = result.error;
        }
    }

    filterBasedOnPicklistValue(event) {
        this.salesCycle = event.target.value;
        this.sortByOrder = '';
        this.sortByColumnName = '';
        this.sortCompanyAsc = false;
        this.sortCurrentNetPromoterAsc = true;
        this.sortPriorNetPromoterAsc = true;
        this.sortCurrentSceAsc = true;
        this.getCalculateNpsDate();
        // this.sortCurrentScoreAsc = true;
        // this.sortPriorScoreAsc = true;
    }

    sortFields(event) {
        var selectedItem = event.currentTarget;
        var selectedItemToBeSorted = selectedItem.dataset.record;
        var fieldItagsWithAuraAttrMap = '{"Account__r.Name":"sortCompanyAsc","currentNetPromoter":"sortCurrentNetPromoterAsc","priorNetPromoter":"sortPriorNetPromoterAsc","currentSce":"sortCurrentSceAsc"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[selectedItemToBeSorted];

        if (sortFieldCompName === 'sortCompanyAsc') {
            if (this.sortCompanyAsc === true) {
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortCompanyAsc = false;
                this.getCalculateNpsDate();
            }
            else {
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortCompanyAsc = true;
                this.getCalculateNpsDate();
            }

        }
        // if (sortFieldCompName === 'sortCurrentScoreAsc') {
        //     if (this.sortCurrentScoreAsc === true) {
        //         this.sortByOrder = 'ASC';
        //         this.sortByColumnName = selectedItemToBeSorted;
        //         this.sortCurrentScoreAsc = false;
        //         this.getCalculateNpsDate();
        //     }
        //     else {
        //         this.sortByOrder = 'DESC';
        //         this.sortByColumnName = selectedItemToBeSorted;
        //         this.sortCurrentScoreAsc = true;
        //         this.getCalculateNpsDate();
        //     }

        // }
        // if (sortFieldCompName === 'sortPriorScoreAsc') {
        //     if (this.sortPriorScoreAsc === true) {
        //         this.sortByOrder = 'ASC';
        //         this.sortByColumnName = selectedItemToBeSorted;
        //         this.sortPriorScoreAsc = false;
        //         this.getCalculateNpsDate();
        //     }
        //     else {
        //         this.sortByOrder = 'DESC';
        //         this.sortByColumnName = selectedItemToBeSorted;
        //         this.sortPriorScoreAsc = true;
        //         this.getCalculateNpsDate();
        //     }

        // }
        if (sortFieldCompName === 'sortCurrentNetPromoterAsc') {
            if (this.sortCurrentNetPromoterAsc === true) {
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortCurrentNetPromoterAsc = false;
                this.getCalculateNpsDate();
            }
            else {
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortCurrentNetPromoterAsc = true;
                this.getCalculateNpsDate();
            }

        }
        if (sortFieldCompName === 'sortPriorNetPromoterAsc') {
            if (this.sortPriorNetPromoterAsc === true) {
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortPriorNetPromoterAsc = false;
                this.getCalculateNpsDate();
            }
            else {
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortPriorNetPromoterAsc = true;
                this.getCalculateNpsDate();
            }

        }
        if (sortFieldCompName === 'sortCurrentSceAsc') {
            if (this.sortCurrentSceAsc === true) {
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortCurrentSceAsc = false;
                this.getCalculateNpsDate();
            }
            else {
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortCurrentSceAsc = true;
                this.getCalculateNpsDate();
            }

        }
    }












    exportRecords() {
        this.cssDisplay = '';
        getTemplateInXML({ loggedInUserRole: this.loggedInUserRole })
            .then(result => {
                console.log('User role in print ' + this.loggedInUserRole);
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
                hiddenElement.download = 'Customer Satisfaction Data Sheet ' + salesCycleValue + ' ' + today + '.xls';
                document.body.appendChild(hiddenElement); // Required for FireFox browser



                hiddenElement.click();
                const event = new ShowToastEvent({
                    title: '',
                    message: 'Customer Satisfaction Data Sheet Exported Successfully',
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
        console.log('User Role in print ' + queriedData[0].userRole);
        let totalRows = '';
        let count = 0;
        /*let highlightStyleId = "s72";
        let nonHighlightStyleId = "s71";*/
        let highlightStyleId = "s79";
        let nonHighlightStyleId = "s78";
        if (queriedData[0].userRole !== 'rvp') {
            console.log('Entering non-rvp print');
            for (let i in queriedData) {
                if (queriedData[i].currentYearRecordId != undefined) {
                    let eachRow = rowToReccurse;
                    count = count + 1;
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        // if (!this.isBlank(queriedData[i]['currentYearLikelihood'])) {
                        if (queriedData[i].currentYearRecordId != undefined) {
                            if (key === 'accountName') {
                                if (queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) {
                                    value = queriedData[i][key];
                                }

                            }
                            else if (key === 'currentYearLikelihood') {
                                if (queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) {
                                    value = queriedData[i][key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                }

                            }
                            else if (key === 'previousYearLikelihood') {
                                if (queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) {
                                    value = queriedData[i][key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                }

                            }
                            //-------------------------ICM2021 - SAMARTH-------------------------
                            else if (key === 'currentOverallSatisfactionWithSceScore') {
                                if (queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) {
                                    value = queriedData[i][key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                }

                            }
                            else if (key === 'priorOverallSatisfactionWithSceScore') {
                                if (queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) {
                                    value = queriedData[i][key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                }

                            }
                            //-------------------------ICM2021 - SAMARTH-------------------------
                            else if (key === 'cmStartDate') {
                                if (queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) {
                                    value = queriedData[i][key];
                                }

                            } else if (key === 'cmEndDate') {
                                if (queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) {
                                    value = queriedData[i][key];
                                }
                                if ((queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) && queriedData[i]['fullyTermedClient'] === true) {
                                    value += ' - Termed Client';
                                }
                                else if (queriedData[i]['fullyTermedClient'] === true) {
                                    value += 'Termed Client';
                                }

                            }
                        }
                        value = value != null ? value : '';
                        value = value.toString();
                        value = this.replaceXmlSpecialCharacters(value);
                        eachRow = eachRow.split(replaceItagName).join(value);
                    }
                    totalRows += eachRow;
                }
            }
        }
        else if (queriedData[0].userRole === 'rvp') {
            console.log('Entering rvp print');
            for (let i in queriedData) {
                if (queriedData[i].currentYearRecordId != undefined && queriedData[i].isSpecialityBenefit == false) {
                    let eachRow = rowToReccurse;
                    count = count + 1;
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        // if (!this.isBlank(queriedData[i]['currentYearLikelihood'])) {
                        if (queriedData[i].currentYearRecordId != undefined && queriedData[i].isSpecialityBenefit == false) {
                            if (key === 'accountName') {
                                if (queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) {
                                    value = queriedData[i][key];
                                }

                            }
                            else if (key === 'currentSce') {
                                if (queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) {
                                    value = queriedData[i][key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                }

                            }
                            else if (key === 'currentYearLikelihood') {
                                if (queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) {
                                    value = queriedData[i][key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                }

                            }
                            else if (key === 'currentNetPromoterType') {
                                if (queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) {
                                    value = queriedData[i][key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                }

                            }
                            else if (key === 'previousYearLikelihood') {
                                if (queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) {
                                    value = queriedData[i][key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                }

                            }
                            else if (key === 'previousNetPromoterType') {
                                if (queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) {
                                    value = queriedData[i][key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                }

                            }
                            else if (key === 'cmStartDate') {
                                if (queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) {
                                    value = queriedData[i][key];
                                }

                            } else if (key === 'cmEndDate') {
                                if (queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) {
                                    value = queriedData[i][key];
                                }
                                if ((queriedData[i].hasOwnProperty(key) &&
                                    !this.isBlank(queriedData[i][key])) && queriedData[i]['fullyTermedClient'] === true) {
                                    value += ' - Termed Client';
                                }
                                else if (queriedData[i]['fullyTermedClient'] === true) {
                                    value += 'Termed Client';
                                }

                            }
                        }
                        value = value != null ? value : '';
                        value = value.toString();
                        value = this.replaceXmlSpecialCharacters(value);
                        eachRow = eachRow.split(replaceItagName).join(value);
                    }
                    totalRows += eachRow;
                }
            }
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + totalRows + xmlWsectTag.substring(endHeaderIdx);
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