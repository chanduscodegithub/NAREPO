import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getStatusData from '@salesforce/apex/StatusSnapshotController.getStatusSnapshotData';
import fetchPicklist from '@salesforce/apex/RetentionStatusController.fetchPicklist';
import reportLabel from '@salesforce/label/c.ICM_SCE_Status_Report_Title';
import salesCycleLabel from '@salesforce/label/c.ICM_SalesCycleLabel';
import vpcrCurrentCompanyLabel from '@salesforce/label/c.ICM_VPCR_Current_Company_Title';
import vpcrPreviousCompanyLabel from '@salesforce/label/c.ICM_VPCR_Previous_Company_Title';
import vpcrInformationText from '@salesforce/label/c.ICM_VPCR_Information_Text';
import vpcrNotSentText from '@salesforce/label/c.ICM_VPCR_Not_Yet_Sent_Text';
import getTemplateForExport from '@salesforce/apex/StatusSnapshotController.getTemplateForExport';


export default class vpcrSnapshotCmp extends LightningElement {
    @api role;
    @track reportTitle = '';
    @track salesSeasonLabel = '';
    @track loggedInUserID = '';
    @track loggedInUserName = '';
    @track salesSeason = '';
    @track salesSeasonPicklist;
    @track salesSeasonDefaultMonth ='';

    @track vpcrCurrentCompanyData = [];
    @track isvpcrCurrentCompanyDataEmpty = true;
    @track vpcrPreviousCompanyData = [];
    @track isvpcrPreviousCompanyDataEmpty = true;

    @track vpcrCurrentCompanyLabel = '';
    @track vpcrPreviousCompanyLabel = '';
    @track vpcrInformationText = '';
    @track vpcrNotSentText = '';
    
    @track currentSortDirection = false; //asc = true & des = false
    @track ccCurrentSCESortDirection = true; //asc = true & des = false
    @track previousSortDirection = false; //asc = true & des = false
    @track pcCurrentSCESortDirection = true; //asc = true & des = false

    @track cssDisplay = '';
    @track isButtonDisabled = false;


    @wire(fetchPicklist,{objectPassed: 'Renewal_Status__c',fieldPassed: 'Sales_Cycle__c'})
    salesSeasonPicklistValues(result){
        if(result.data){
           this.salesSeasonPicklist = []; 
           if(result.data !== undefined){
                result.data.forEach(opt=>{
                    this.salesSeasonPicklist.push(opt);
                });
           }
        }else if(result.error){
            this.error = result.error;
        }
    }
    
    salesSeasonChangeHandler(event) {
        //resetting sort direction
        this.activeSections = ['A', 'B'];
        this.currentSortDirection = false; //asc = true & des = false
        this.ccCurrentSCESortDirection = true; //asc = true & des = false
        this.previousSortDirection = false; //asc = true & des = false
        this.pcCurrentSCESortDirection = true; //asc = true & des = false

        this.salesSeason = event.target.value;

        this.vpcrCurrentCompanyData=[];
        this.vpcrPreviousCompanyData=[];
        this.getStatusSnapshotData();
    }
    //Accordion section - begins
    @track activeSections = ['A', 'B'];
    
    connectedCallback() {
        this.vpcrCurrentCompanyLabel = vpcrCurrentCompanyLabel;
        this.vpcrPreviousCompanyLabel = vpcrPreviousCompanyLabel;
        this.vpcrInformationText = vpcrInformationText;
        this.vpcrNotSentText = vpcrNotSentText;
        this.reportTitle = reportLabel;
        this.getStatusSnapshotData();
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
    
    //FETCHING DATA - Begins
    getStatusSnapshotData() {
        this.cssDisplay ='';
        getStatusData({salesSeason: this.salesSeason})
        .then(result => {
                
                //console.log('Success==>' + JSON.stringify(result,null,2));
                this.loggedInUserID = result.loggedInUserID;
                this.loggedInUserName = result.loggedInUserName;
                //this.reportTitle = this.loggedInUserName + ' -- ' + reportLabel;
                this.salesSeasonLabel = salesCycleLabel;
                this.salesSeason = result.salesSeason;
                
                if (result.vpcrCurrentData !== null && result.vpcrCurrentData !== undefined && result.vpcrCurrentData.length != 0) {
                    this.vpcrCurrentCompanyData = result.vpcrCurrentData;
                    this.sortData('company','asc', 'current'); //default sort by company asc
                    this.isvpcrCurrentCompanyDataEmpty = false;
                } else {
                    this.vpcrCurrentCompanyData = '';
                    this.isvpcrCurrentCompanyDataEmpty = true;
                }
                if (result.vpcrPreviousData !== null && result.vpcrPreviousData !== undefined && result.vpcrPreviousData.length != 0) {
                    this.vpcrPreviousCompanyData = result.vpcrPreviousData;
                    this.sortData('company','asc', 'previous'); //default sort by company asc
                    this.isvpcrPreviousCompanyDataEmpty = false;
                } else {
                    this.vpcrPreviousCompanyData = '';
                    this.isvpcrPreviousCompanyDataEmpty = true;
                }
                if (this.isvpcrCurrentCompanyDataEmpty && this.isvpcrPreviousCompanyDataEmpty) {
                    this.isButtonDisabled = true;
                } else {
                    this.isButtonDisabled = false;
                }
                this.cssDisplay = 'hidemodel';
                //console.log('vpcrCurrent ==>' + JSON.stringify(this.vpcrCurrentCompanyData,null,2));
                //console.log('vpcrPrevious ==>' + JSON.stringify(this.vpcrPreviousCompanyData,null,2));

            }).catch(error => {
                console.log('Error==>' + JSON.stringify(error,null,2));
                this.cssDisplay = 'hidemodel';
        });
    }
    handleCurrentSortdata(event) {
        this.cssDisplay ='';
        // field name
        if (this.currentSortDirection === true) {
            this.sortData('company','asc', 'current');
            this.currentSortDirection = false;
        } else {
            this.sortData('company','des', 'current');
            this.currentSortDirection = true;
        }
        this.cssDisplay = 'hidemodel';  
    }
    handlePreviousSortdata(event) {
        this.cssDisplay ='';
        // field name
        if (this.previousSortDirection === true) {
            this.sortData('company','asc', 'previous');
            this.previousSortDirection = false;
        } else {
            this.sortData('company','des', 'previous');
            this.previousSortDirection = true;
        }
        this.cssDisplay = 'hidemodel';  
    }
    handleCCCurrentSCESortdata(event) {
        this.cssDisplay ='';
        // field name
        if (this.ccCurrentSCESortDirection === true) {
            this.sortData('currentSCE','asc', 'current');
            this.ccCurrentSCESortDirection = false;
        } else {
            this.sortData('currentSCE','des', 'current');
            this.ccCurrentSCESortDirection = true;
        } 
        this.cssDisplay = 'hidemodel'; 
    }
    handlePCCurrentSCESortdata(event) {
        this.cssDisplay ='';
        // field name
        if (this.pcCurrentSCESortDirection === true) {
            this.sortData('currentSCE','asc', 'previous');
            this.pcCurrentSCESortDirection = false;
        } else {
            this.sortData('currentSCE','des', 'previous');
            this.pcCurrentSCESortDirection = true;
        }
        this.cssDisplay = 'hidemodel';  
    }
    sortData(fieldname, direction, section) {
        // serialize the data before calling sort function
        let parseData ='';
        if (section === 'current') {
            parseData = JSON.parse(JSON.stringify(this.vpcrCurrentCompanyData));
        }
        if (section === 'previous') {
            parseData = JSON.parse(JSON.stringify(this.vpcrPreviousCompanyData));
        }
        //console.log(fieldname + ' -- ' + direction + ' -- ' + section);
        //console.log(' data ** ' + JSON.stringify(parseData,null,2));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };

        // cheking reverse direction 
        let isReverse = direction === 'asc' ? 1: -1;

        // sorting data 
        if (parseData != null && parseData != undefined && parseData.length !=0) {
            parseData.sort((x, y) => {
                x = keyValue(x) ? keyValue(x) : ''; // handling null values
                y = keyValue(y) ? keyValue(y) : '';
    
                // sorting values based on direction
                return isReverse * ((x > y) - (y > x));
            });
        }


        // set the sorted data to data table data
        if (section === 'current') {
            this.vpcrCurrentCompanyData = parseData;
        }
        if (section === 'previous') {
            this.vpcrPreviousCompanyData = parseData;
        }
    }
    exportHandler() {
        this.cssDisplay = '';
        if (this.isvpcrCurrentCompanyDataEmpty === true && this.isvpcrPreviousCompanyDataEmpty=== true) {
            const event = new ShowToastEvent({
                title: '',
                message: 'No records to print.',
            });
            this.dispatchEvent(event);
            this.cssDisplay = 'hidemodel';
        } else {
            getTemplateForExport({role: this.role})
                .then(result => {
                    var xmlString = result.xmlString;
                    xmlString = xmlString.replace('%%ReportTitle@@', this.reportTitle);
                    xmlString = xmlString.replace('%%SalesSeason@@', this.salesSeason);
                    xmlString = xmlString.replace('%%vpcrCurrentCompanyLabel@@', this.vpcrCurrentCompanyLabel);
                    xmlString = xmlString.replace('%%vpcrPreviousCompanyLabel@@', this.vpcrPreviousCompanyLabel);
                    xmlString = xmlString.replace('%%DataDate@@',  this.formatDateTime(''));
                    xmlString = xmlString.replace('%%vpcrInformationText@@', this.vpcrInformationText);

                    let salesCycle = this.salesSeason;
                    let salesCycleSplitByCommaStr = salesCycle.split(',')[1].trim();
                    let salesCycleDateFormatted = this.formatDateWithHyphenSeparate(salesCycleSplitByCommaStr);
                    let salesCycleValue = salesCycle.split(',')[0] + ', ' + salesCycleDateFormatted;
                    let xmlTemplateString = '';
                    let objectItagesMap = result.objectItags;
                    let rowCount = 12;

                    for (let objectName in objectItagesMap) {
                        if (objectItagesMap.hasOwnProperty(objectName)) {
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

                            let startIndex = xmlString.lastIndexOf(startItag);
                            let endIndex = xmlString.indexOf(endItag);
                            let stHeaderIdx = 0;
                            let endHeaderIdx = 0;
                            let rowToReccurse = '';
                            if (objectName === 'CURR') {
                                stHeaderIdx = xmlString.lastIndexOf('<CURRCOMP>', startIndex);
                                endHeaderIdx = xmlString.indexOf('</CURRCOMP>', endIndex);
                                endHeaderIdx += '</CURRCOMP>'.length;
                                rowToReccurse = xmlString.substring(stHeaderIdx, endHeaderIdx);
                                if( this.isvpcrCurrentCompanyDataEmpty ){
                                    xmlString =   xmlString.split(rowToReccurse).join('');
                                    xmlTemplateString=xmlString;
                                }else{
                                    xmlTemplateString = this.returnChildRows(rowToReccurse, xmlString, this.vpcrCurrentCompanyData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount);
                                    rowCount += this.vpcrCurrentCompanyData.length;
                                    xmlString = xmlTemplateString;
                                }
                            }
                            if (objectName === 'PREV') {
                                stHeaderIdx = xmlString.lastIndexOf('<PREVCOMP>', startIndex);
                                endHeaderIdx = xmlString.indexOf('</PREVCOMP>', endIndex);
                                endHeaderIdx += '</PREVCOMP>'.length;
                                rowToReccurse = xmlString.substring(stHeaderIdx, endHeaderIdx);
                                if( this.isvpcrPreviousCompanyDataEmpty ){
                                    xmlString =   xmlString.split(rowToReccurse).join('');
                                    xmlTemplateString=xmlString;
                                }else{
                                    xmlTemplateString = this.returnChildRows(rowToReccurse, xmlString, this.vpcrPreviousCompanyData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount);
                                    rowCount += this.vpcrPreviousCompanyData.length;
                                    xmlString = xmlTemplateString;
                                }
                            }
                        }
                    }
                    xmlTemplateString = xmlTemplateString.split('<CURRCOMP>').join('<Row>');
                    xmlTemplateString = xmlTemplateString.split('</CURRCOMP>').join('</Row>');
                    xmlTemplateString = xmlTemplateString.split('<PREVCOMP>').join('<Row>');
                    xmlTemplateString = xmlTemplateString.split('</PREVCOMP>').join('</Row>');

                    xmlTemplateString = xmlTemplateString.split('##RowVal@@').join(rowCount);

                    let hiddenElement = document.createElement('a');
                    hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTemplateString);
                    hiddenElement.target = '_self'; // 
                    hiddenElement.download = 'Growth and Renewal Status Snapshot '+ salesCycleValue + ' ' +  this.formatDate('') + '.xls'; // CSV file Name* you can change it.[only name not .csv] 
                    document.body.appendChild(hiddenElement); // Required for FireFox browser
                    
                    hiddenElement.click();
                    const event = new ShowToastEvent({
                        title: '',
                        message: 'Growth and Renewal Status Snapshot Exported Successfully',
                    });
                    this.dispatchEvent(event);
                    this.cssDisplay = 'hidemodel';
                }).catch(error => {
                    console.log('Error==>' + JSON.stringify(error, null, 2));
                    this.cssDisplay = 'hidemodel';
            });
        }
    }
    parseValue(x) {
        if (this.isBlank(x)) {
            return 0;
        } else {
            return parseInt(x);
        }
    }
    returnChildRows(rowToReccurse, xmlWsectTag, snapshotData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount) {

        let totalRows = '';
        let count = 0;
        let salesPersonHighlightStyleId = "s87";
        let salesPersonNonHighlightStyleId = "s79";
        let notSentHighlight = "s77";
        for (let i in snapshotData) {
			if (i !== undefined) {
                let eachRow = rowToReccurse;
                count = count + 1;
                for (let k in objectItagesMap[objectName]) {
                    if (k !== undefined) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = snapshotData[i][key];
                        //handling TotalNoOfProducts by adding #productssent & #productsnotsent -- 00002576
                        if (key === 'growthNoOfProducts') {
                            value = this.parseValue(snapshotData[i].growthNoOfProductsSent) + this.parseValue(snapshotData[i].growthNoOfProductsNotYetSent) ;
                        }
                        if (key === 'retentionNoOfProducts') {
                            value = this.parseValue(snapshotData[i].retentionNoOfProductsSent) + this.parseValue(snapshotData[i].retentionNoOfProductsNotYetSent) ;
                        }
                    
                        //concatenation SCEs -- 00002576
                        if (key === 'growthSCEsReceivingCompensation') {
                            if (snapshotData[i].hasOwnProperty('growthAdditionalSCEReceivingCompensation')
                                && !this.isBlank(snapshotData[i].growthAdditionalSCEReceivingCompensation)) {
                                value = '' + snapshotData[i].growthSCEReceivingCompensation + ', ' + snapshotData[i].growthAdditionalSCEReceivingCompensation;
                            } else {
                                if (snapshotData[i].hasOwnProperty('growthSCEReceivingCompensation')
                                    && !this.isBlank(snapshotData[i].growthSCEReceivingCompensation)) {
                                    value = '' + snapshotData[i].growthSCEReceivingCompensation;
                                } else {
                                    if (this.parseValue(snapshotData[i].growthNoOfProductsSent) > 0 
                                    ||  this.parseValue(snapshotData[i].growthNoOfProductsNotYetSent) > 0) {
                                        value = this.vpcrNotSentText;
                                        eachRow = eachRow.split('##gsalesPersonStyleId@@').join(notSentHighlight);
                                    } 
                                }
                            }
                        }
                        if (key === 'retentionSCEsReceivingCompensation') {
                            if (snapshotData[i].hasOwnProperty('retentionAdditionalSCEReceivingCompensation')
                                && !this.isBlank(snapshotData[i].retentionAdditionalSCEReceivingCompensation)) {
                                value = '' + snapshotData[i].retentionSCEReceivingCompensation + ', ' + snapshotData[i].retentionAdditionalSCEReceivingCompensation;
                            } else {
                                if (snapshotData[i].hasOwnProperty('retentionSCEReceivingCompensation')
                                    && !this.isBlank(snapshotData[i].retentionSCEReceivingCompensation)) {
                                    value = '' + snapshotData[i].retentionSCEReceivingCompensation;
                                } else {
                                    if (this.parseValue(snapshotData[i].retentionNoOfProductsSent) > 0 
                                        ||  this.parseValue(snapshotData[i].retentionNoOfProductsNotYetSent) > 0) {
                                        value = this.vpcrNotSentText;
                                        eachRow = eachRow.split('##rsalesPersonStyleId@@').join(notSentHighlight);

                                    } 
                                }
                            }

                        }

                        // Replacing zeroes wtih blanks
                        if (key === 'growthNoOfProducts' || key === 'retentionNoOfProducts') { 
                            if (parseInt(value) === 0) { 
                                value = '';
                            } else {
                                value = value != null ? value : '';
                                value = value.toString();
                                value = this.replaceXmlSpecialCharacters(value);    
                            }
                        } 
                            
                        value = value != null ? value : '';
                        value = value.toString();
                        value = this.replaceXmlSpecialCharacters(value);    
                    

                        if (key === 'growthSCEsReceivingCompensation') {
                            if (snapshotData[i].hasOwnProperty('growthAdditionalSCEReceivingCompensation')
                            && !this.isBlank(snapshotData[i].growthAdditionalSCEReceivingCompensation)) {
                                eachRow = eachRow.split('##gsalesPersonStyleId@@').join(salesPersonHighlightStyleId);
                            } else if (snapshotData[i].hasOwnProperty('growthSCEReceivingCompensation')
                                && !this.isBlank(snapshotData[i].growthSCEReceivingCompensation) && snapshotData[i].hasOwnProperty('currentSCE')
                                && !this.isBlank(snapshotData[i].currentSCE) && snapshotData[i].growthSCEReceivingCompensation !== snapshotData[i].currentSCE) {
                                eachRow = eachRow.split('##gsalesPersonStyleId@@').join(salesPersonHighlightStyleId);
                            } else {
                                eachRow = eachRow.split('##gsalesPersonStyleId@@').join(salesPersonNonHighlightStyleId);
                            }
                        }
                        if (key === 'retentionSCEsReceivingCompensation') {

                            if (snapshotData[i].hasOwnProperty('retentionAdditionalSCEReceivingCompensation')
                            && !this.isBlank(snapshotData[i].retentionAdditionalSCEReceivingCompensation)) {
                                eachRow = eachRow.split('##rsalesPersonStyleId@@').join(salesPersonHighlightStyleId);
                            } else if (snapshotData[i].hasOwnProperty('retentionSCEReceivingCompensation')
                                && !this.isBlank(snapshotData[i].retentionSCEReceivingCompensation) && snapshotData[i].hasOwnProperty('currentSCE')
                                && !this.isBlank(snapshotData[i].currentSCE) && snapshotData[i].retentionSCEReceivingCompensation !== snapshotData[i].currentSCE) {
                                eachRow = eachRow.split('##rsalesPersonStyleId@@').join(salesPersonHighlightStyleId);
                            } else {
                                eachRow = eachRow.split('##rsalesPersonStyleId@@').join(salesPersonNonHighlightStyleId);
                            }
                        }

                        eachRow = eachRow.split(replaceItagName).join(value);

                    }
                }
                totalRows += eachRow;
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

    isBlank(strVal) {
        var isStrBlank = true;
        if (strVal !== undefined && strVal != null && strVal !== '') {
            isStrBlank = false;
        }
        return isStrBlank;
    }

}