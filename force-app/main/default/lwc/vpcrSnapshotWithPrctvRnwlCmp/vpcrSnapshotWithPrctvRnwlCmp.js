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
        if (this.template.querySelector(".section-header-style-vpcr-snapshot") === null || this.hasRendered === true)
        return;
        this.hasRendered = true;
        let style = document.createElement("style");
        style.innerText = `    
                     .section-header-vpcr-snapshot .slds-accordion__summary-heading{
                         background-color: rgba(210, 223, 247, 0.7) !important; 
                         padding: 4px 10px;
                         border-radius: 3px;
                         font-weight: 600;
                         font-size: 15px;
                     }    
                 `;
        this.template.querySelector(".section-header-style-vpcr-snapshot").appendChild(style);
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
                console.log('result==>'+JSON.stringify(result));
                if (!this.isListEmpty(result.vpcrCurrentData)) {
                    this.vpcrCurrentCompanyData = result.vpcrCurrentData;
                }
                if (!this.isListEmpty(result.vpcrPreviousData)) {
                    this.vpcrPreviousCompanyData = result.vpcrPreviousData;
                }
                if (!this.isListEmpty(result.vpcrProactiveRenewalData)) {
                    this.setProactiveRenewalData(result.vpcrProactiveRenewalData);
                }
               

                if (!this.isListEmpty(this.vpcrCurrentCompanyData)) {
                    //this.vpcrCurrentCompanyData = result.vpcrCurrentData;

                    this.sortData('company','asc', 'current'); //default sort by company asc
                    this.isvpcrCurrentCompanyDataEmpty = false;
                } else {
                    this.vpcrCurrentCompanyData = [];
                    this.isvpcrCurrentCompanyDataEmpty = true;
                }
                if (!this.isListEmpty(this.vpcrPreviousCompanyData)) {
                    //this.vpcrPreviousCompanyData = result.vpcrPreviousData;
                    this.sortData('company','asc', 'previous'); //default sort by company asc
                    this.isvpcrPreviousCompanyDataEmpty = false;
                } else {
                    this.vpcrPreviousCompanyData = [];
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
        this.cssDisplay = '';
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
        this.cssDisplay = '';
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
        this.cssDisplay = '';
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
        this.cssDisplay = 'hidemodel';
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
            this.vpcrCurrentCompanyData=[];
            this.vpcrCurrentCompanyData = parseData;
        }
        if (section === 'previous') {
            this.vpcrPreviousCompanyData=[];
            this.vpcrPreviousCompanyData = parseData;
        }
    }
    exportHandler1() {
        this.cssDisplay = '';
       
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
                                if( this.isGrowthSentDataEmpty ){
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
                    xmlTemplateString = xmlTemplateString.split('<CURRCOMP>').join('<Row ss:AutoFitHeight="0" ss:Height="26">');
                    xmlTemplateString = xmlTemplateString.split('</CURRCOMP>').join('</Row>');
                    xmlTemplateString = xmlTemplateString.split('<PREVCOMP>').join('<Row ss:AutoFitHeight="0" ss:Height="26">');
                    xmlTemplateString = xmlTemplateString.split('</PREVCOMP>').join('</Row>');

                    

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
    parseValue(x) {
        if (this.isBlank(x)) {
            return 0;
        } else {
            return parseInt(x);
        }
    }
    returnChildRows(rowToReccurse, xmlWsectTag, snapshotData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx) {

        let totalRows = '';
        let count = 0;
        let salesPersonHighlightStyleId = "s150";
        let salesPersonNonHighlightStyleId = "s151";
        let notSentHighlight = "s153";
        for (let i in snapshotData) {
			
                let eachRow = rowToReccurse;
                count = count + 1;
                for (let k in objectItagesMap[objectName]) {
                   
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
                        if(key==='proactiveRenewalSCEReceivingCompensation'){
                        if (snapshotData[i].hasOwnProperty('proactiveRenewalIncentiveStatus')
                    && !this.isBlank(snapshotData[i].proactiveRenewalIncentiveStatus)) {
                        
                        if(snapshotData[i].proactiveRenewalIncentiveStatus.indexOf('Pending Qualification')!== -1){
                            eachRow = eachRow.split('##prsceRcvngCmpnstnStatusStyleId@@').join('s152');
                            value='Pending Qualification';
                          }else if(snapshotData[i].proactiveRenewalIncentiveStatus.indexOf('Fully Validated')!== -1){
                                if(snapshotData[i].hasOwnProperty('opportunityOwnerId') && !this.isBlank(snapshotData[i].opportunityOwnerId)
                                && snapshotData[i].hasOwnProperty('accountOwnerId') && !this.isBlank(snapshotData[i].accountOwnerId)
                                && snapshotData[i].opportunityOwnerId!== snapshotData[i].accountOwnerId){
                                    eachRow = eachRow.split('##prsceRcvngCmpnstnStatusStyleId@@').join(salesPersonHighlightStyleId);
                                }else{
                                    eachRow = eachRow.split('##prsceRcvngCmpnstnStatusStyleId@@').join(salesPersonNonHighlightStyleId);
                                }
                            
                          }
                    } 
                    else {

                        eachRow = eachRow.split('##prsceRcvngCmpnstnStatusStyleId@@').join(salesPersonNonHighlightStyleId);

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
                totalRows += eachRow;
            
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

    isListEmpty(lst) {
        let isListEmpty = true;
        if (lst !== null && lst !== undefined && lst.length !== 0) {
            isListEmpty = false;
        }

        return isListEmpty;

    
    

    }
    isMapEmpty(map1) {
        for (let key in map1) {
            if (map1.hasOwnProperty(key)) return false;
        }
        return true;
    }
    setProactiveRenewalData(proactiveRenewalDataList){
        let vpcrCurrentCompanyData=[...this.vpcrCurrentCompanyData];
        let vpcrPreviousCompanyData=[...this.vpcrPreviousCompanyData];
        this.vpcrCurrentCompanyData=[];
        this.vpcrPreviousCompanyData=[];

        let vpcrCurrentCompanyDataMap=this.buildMap(vpcrCurrentCompanyData);

        let vpcrPreviousCompanyDataMap=this.buildMap(vpcrPreviousCompanyData);

        for(let i in proactiveRenewalDataList){
            let rec=Object.assign({},proactiveRenewalDataList[i]);
            let lst=[];
            if(rec.hasOwnProperty('Account')
                && rec.Account.hasOwnProperty('CMVPCRRVP__c')
                && rec.hasOwnProperty('CM_VPCR_RVP__c')
                && rec.CM_VPCR_RVP__c === rec.Account.CMVPCRRVP__c){
                    if(this.isListEmpty(vpcrCurrentCompanyData)){
                        vpcrCurrentCompanyData.push(
                            this.buildProactiveRenewalRecJSON(rec,true,null));

                    }else{
                        let accountName='';
                        let accountOwnerName='';
                        let opportnityOwnerName='';
                        if(rec.hasOwnProperty('Account') 
                        && rec.Account.hasOwnProperty('Name')){
                            accountName=rec.Account.Name;
                        }
                        if(rec.hasOwnProperty('Account') && rec.Account.hasOwnProperty('Owner')
                        && rec.Account.Owner.hasOwnProperty('Name')){
                            accountOwnerName=rec.Account.Owner.Name;
                        }if(rec.hasOwnProperty('Owner') && rec.Owner.hasOwnProperty('Name') &&
                        !this.isBlank(rec.Owner.Name)){
                            opportnityOwnerName=rec.Owner.Name;
                        }
                        
                            
                        let flag=false;

                        /*for(let j=0;j<vpcrCurrentCompanyData.length&&!flag;j++){
                            let vpcrCurrentRec=vpcrPreviousCompanyData[j];
                            if(vpcrCurrentRec.hasOwnProperty('company') && vpcrCurrentRec.hasOwnProperty('currentSCE')
                                && vpcrCurrentRec.company===accountName && vpcrCurrentRec.currentSCE===accountOwnerName){
                                    vpcrCurrentCompanyData[j]=this.buildProactiveRenewalRecJSON(rec,false,vpcrCurrentRec)
                                    flag=true;
                            }
                        }*/
                        let key=accountName+'_'+accountOwnerName;
                        if(!this.isMapEmpty(vpcrCurrentCompanyDataMap) && vpcrCurrentCompanyDataMap.hasOwnProperty(key)){
                        if(rec.hasOwnProperty('Proactive_Renewal_Incentive_Status__c') && !this.isBlank(rec.Proactive_Renewal_Incentive_Status__c)){
                            lst=[...vpcrCurrentCompanyDataMap[key]];
                            if(rec.Proactive_Renewal_Incentive_Status__c.indexOf('Pending Qualification')!== -1){
                                let filteredList=lst.filter(element => (element.concatenatedSCERcvngCmpnstn !== undefined
                                    && element.concatenatedSCERcvngCmpnstn!==null && element.concatenatedSCERcvngCmpnstn==='')  &&
                                        (element.totalProducts !== undefined
                                            && element.totalProducts!==null && Number(element.totalProducts)>0)
                                        );
                                if(!this.isListEmpty(filteredList) && filteredList[0].hasOwnProperty('index')
                                    && !this.isBlank(filteredList[0].index)){
                                        vpcrCurrentCompanyData[filteredList[0].index]=this.buildProactiveRenewalRecJSON(rec,false,vpcrCurrentCompanyData[filteredList[0].index]);
                                        flag=true;
                                }

                            }else if(rec.Proactive_Renewal_Incentive_Status__c.indexOf('Fully Validated')!== -1 && opportnityOwnerName!=''){
                                let filteredList=lst.filter(element => (element.concatenatedSCERcvngCmpnstn !== undefined
                                    && element.concatenatedSCERcvngCmpnstn!==null && element.concatenatedSCERcvngCmpnstn===opportnityOwnerName)
                                        );
                                if(!this.isListEmpty(filteredList) && filteredList[0].hasOwnProperty('index')
                                    && !this.isBlank(filteredList[0].index)){
                                        vpcrCurrentCompanyData[filteredList[0].index]=this.buildProactiveRenewalRecJSON(rec,false,vpcrCurrentCompanyData[filteredList[0].index]);
                                        flag=true;
                                }else{
                                    let filteredList1=lst.filter(element => (element.concatenatedSCERcvngCmpnstn !== undefined
                                        && element.concatenatedSCERcvngCmpnstn!==null && element.concatenatedSCERcvngCmpnstn.indexOf(opportnityOwnerName)!==-1)
                                            );
                                    if(!this.isListEmpty(filteredList1) && filteredList1[0].hasOwnProperty('index')
                                        && !this.isBlank(filteredList1[0].index)){
                                            vpcrCurrentCompanyData[filteredList1[0].index]=this.buildProactiveRenewalRecJSON(rec,false,vpcrCurrentCompanyData[filteredList1[0].index]);
                                            flag=true;
                                    }

                                }


                            }else{
                                flag=true;
                            }

                        }
                        

                        }
                        
                        if(!flag)
                        {
                            vpcrCurrentCompanyData.push(
                                this.buildProactiveRenewalRecJSON(rec,true,null));
                        }
                    }
            }else{
                if(this.isListEmpty(vpcrPreviousCompanyData)){
                    vpcrPreviousCompanyData.push(
                        this.buildProactiveRenewalRecJSON(rec,true,null));

                }else{
                    let accountName='';
                        let accountOwnerName='';
                        let opportnityOwnerName='';
                        if(rec.hasOwnProperty('Account') 
                        && rec.Account.hasOwnProperty('Name')){
                            accountName=rec.Account.Name;
                        }
                        if(rec.hasOwnProperty('Account') && rec.Account.hasOwnProperty('Owner')
                        && rec.Account.Owner.hasOwnProperty('Name')){
                            accountOwnerName=rec.Account.Owner.Name;
                        }if(rec.hasOwnProperty('Owner') && rec.Owner.hasOwnProperty('Name') &&
                        !this.isBlank(rec.Owner.Name)){
                            opportnityOwnerName=rec.Owner.Name;
                        }
                    
                  
                    let flag=false;

                    /*for(let j=0;j<vpcrPreviousCompanyData.length&&!flag;j++){
                        let vpcrPreviousRec=vpcrPreviousCompanyData[j];
                        if(vpcrPreviousRec.hasOwnProperty('company') && vpcrPreviousRec.hasOwnProperty('currentSCE')
                            && vpcrPreviousRec.company===accountName && vpcrPreviousRec.currentSCE===accountOwnerName){
                                vpcrPreviousCompanyData[j]=this.buildProactiveRenewalRecJSON(rec,false,vpcrPreviousRec)
                                flag=true;
                        }
                    }*/
                    let key=accountName+'_'+accountOwnerName;
                        if(!this.isMapEmpty(vpcrPreviousCompanyDataMap) && vpcrPreviousCompanyDataMap.hasOwnProperty(key)){
                        if(rec.hasOwnProperty('Proactive_Renewal_Incentive_Status__c') && !this.isBlank(rec.Proactive_Renewal_Incentive_Status__c)){
                            lst=[...vpcrPreviousCompanyDataMap[key]];
                            if(rec.Proactive_Renewal_Incentive_Status__c.indexOf('Pending Qualification')!== -1){
                                let filteredList=lst.filter(element => (element.concatenatedSCERcvngCmpnstn !== undefined
                                    && element.concatenatedSCERcvngCmpnstn!==null && element.concatenatedSCERcvngCmpnstn==='')  &&
                                        (element.totalProducts !== undefined
                                            && element.totalProducts!==null && Number(element.totalProducts)>0)
                                        );
                                if(!this.isListEmpty(filteredList) && filteredList[0].hasOwnProperty('index')
                                    && !this.isBlank(filteredList[0].index)){
                                        vpcrPreviousCompanyData[filteredList[0].index]=this.buildProactiveRenewalRecJSON(rec,false,vpcrPreviousCompanyData[filteredList[0].index]);
                                        flag=true;
                                }

                            }else if(rec.Proactive_Renewal_Incentive_Status__c.indexOf('Fully Validated')!== -1 && opportnityOwnerName!=''){
                                let filteredList=lst.filter(element => (element.concatenatedSCERcvngCmpnstn !== undefined
                                    && element.concatenatedSCERcvngCmpnstn!==null && element.concatenatedSCERcvngCmpnstn===opportnityOwnerName)
                                        );
                                if(!this.isListEmpty(filteredList) && filteredList[0].hasOwnProperty('index')
                                    && !this.isBlank(filteredList[0].index)){
                                        vpcrPreviousCompanyData[filteredList[0].index]=this.buildProactiveRenewalRecJSON(rec,false,vpcrPreviousCompanyData[filteredList[0].index]);
                                        flag=true;
                                }else{
                                    let filteredList1=lst.filter(element => (element.concatenatedSCERcvngCmpnstn !== undefined
                                        && element.concatenatedSCERcvngCmpnstn!==null && element.concatenatedSCERcvngCmpnstn.indexOf(opportnityOwnerName)!==-1)
                                            );
                                    if(!this.isListEmpty(filteredList1) && filteredList1[0].hasOwnProperty('index')
                                        && !this.isBlank(filteredList1[0].index)){
                                            vpcrPreviousCompanyData[filteredList1[0].index]=this.buildProactiveRenewalRecJSON(rec,false,vpcrPreviousCompanyData[filteredList1[0].index]);
                                            flag=true;
                                    }

                                }


                            }else{
                                flag=true;
                            }

                        }
                        

                        }
                    
                    if(!flag)
                    {
                        vpcrPreviousCompanyData.push(
                            this.buildProactiveRenewalRecJSON(rec,true,null));
                    }
                }

            }

        }

        this.vpcrCurrentCompanyData=vpcrCurrentCompanyData;
        this.vpcrPreviousCompanyData=vpcrPreviousCompanyData;

    }

    buildProactiveRenewalRecJSON(prctvRnwlRec,isNew,rec){
        let returnObj={};
        if(!isNew){
            returnObj=Object.assign({},rec);
        }
        
        if(prctvRnwlRec.hasOwnProperty('Owner') && 
        prctvRnwlRec.Owner.hasOwnProperty('Name')){
            returnObj.proactiveRenewalSCEReceivingCompensation=prctvRnwlRec.Owner.Name;
        }else{
            returnObj.proactiveRenewalSCEReceivingCompensation='';
        }
        if(prctvRnwlRec.hasOwnProperty('Proactive_Renewal_Incentive_Status__c')){
            returnObj.proactiveRenewalIncentiveStatus=prctvRnwlRec.Proactive_Renewal_Incentive_Status__c;
        }else{
            returnObj.proactiveRenewalIncentiveStatus='';
        }
        if(prctvRnwlRec.hasOwnProperty('Account') && 
        prctvRnwlRec.Account.hasOwnProperty('OwnerId')){
            returnObj.accountOwnerId=prctvRnwlRec.Account.OwnerId;
        }else{
            returnObj.accountOwnerId='';
        }
        if(prctvRnwlRec.hasOwnProperty('OwnerId')){
            returnObj.opportunityOwnerId=prctvRnwlRec.OwnerId;
        }else{
            returnObj.opportunityOwnerId='';
        }
        if(isNew){
        if(prctvRnwlRec.hasOwnProperty('Account') && 
        prctvRnwlRec.Account.hasOwnProperty('Name')){
            returnObj.company=prctvRnwlRec.Account.Name;
        }else{
            returnObj.company='';
        }
        if(prctvRnwlRec.hasOwnProperty('Account')
        && prctvRnwlRec.Account.hasOwnProperty('Owner') &&
        prctvRnwlRec.Account.Owner.hasOwnProperty('Name')){
            returnObj.currentSCE=prctvRnwlRec.Account.Owner.Name;
        }else{
            returnObj.currentSCE='';
        }
        
        returnObj.companyID='';
        returnObj.companyLink='';
        returnObj.growthNoOfProductsNotYetSent='0';
        returnObj.growthNoOfProductsSent='0';
        returnObj.growthSCEReceivingCompensation='';
        returnObj.growthAdditionalSCEReceivingCompensation='';
        returnObj.retentionNoOfProductsNotYetSent='0';
        returnObj.retentionNoOfProductsSent='0';
        returnObj.retentionSCEReceivingCompensation='';
        returnObj.retentionAdditionalSCEReceivingCompensation='';
            
        }
        return returnObj;

    }

    buildMap1(dataList){
        let returnMap={};

        for(let i in dataList){
            let key='';
            let isGrowthSCERcvngCmpnstnBlank=true;
            let isRetentionSCERcvngCmpnstnBlank=true;
            let growthSCERcvngCmpnstn='';
            let retentionSCERcvngCmpnstn='';
            let notSentTxtAppended=false;
            if(dataList[i].hasOwnProperty('company')){
                key+=dataList[i].company;
            }
            if(dataList[i].hasOwnProperty('currentSCE')){
                key+='_'+dataList[i].currentSCE;
            }
            if((dataList[i].hasOwnProperty('growthSCEReceivingCompensation') &&  !this.isBlank(dataList[i].growthSCEReceivingCompensation))
            || (dataList[i].hasOwnProperty('growthAdditionalSCEReceivingCompensation') &&  !this.isBlank(dataList[i].growthAdditionalSCEReceivingCompensation))){
                isGrowthSCERcvngCmpnstnBlank=false;
                if(dataList[i].hasOwnProperty('growthSCEReceivingCompensation') &&  !this.isBlank(dataList[i].growthSCEReceivingCompensation)){
                    growthSCERcvngCmpnstn=dataList[i].growthSCEReceivingCompensation;
                }
                if(dataList[i].hasOwnProperty('growthAdditionalSCEReceivingCompensation') &&  !this.isBlank(dataList[i].growthAdditionalSCEReceivingCompensation)){
                    growthSCERcvngCmpnstn+=','+dataList[i].growthAdditionalSCEReceivingCompensation;
                }
                key+='_'+growthSCERcvngCmpnstn;
                returnMap[key]=i;
            }
            if((dataList[i].hasOwnProperty('retentionSCEReceivingCompensation') &&  !this.isBlank(dataList[i].retentionSCEReceivingCompensation))
            || (dataList[i].hasOwnProperty('retentionAdditionalSCEReceivingCompensation') &&  !this.isBlank(dataList[i].retentionAdditionalSCEReceivingCompensation))){
                isRetentionSCERcvngCmpnstnBlank=false;
                if(dataList[i].hasOwnProperty('retentionSCEReceivingCompensation') &&  !this.isBlank(dataList[i].retentionSCEReceivingCompensation)){
                    retentionSCERcvngCmpnstn=dataList[i].retentionSCEReceivingCompensation;
                }
                if(dataList[i].hasOwnProperty('retentionAdditionalSCEReceivingCompensation') &&  !this.isBlank(dataList[i].retentionAdditionalSCEReceivingCompensation)){
                    retentionSCERcvngCmpnstn+=','+dataList[i].retentionAdditionalSCEReceivingCompensation;
                }
                if(retentionSCERcvngCmpnstn!==growthSCERcvngCmpnstn){
                    key+='_'+retentionSCERcvngCmpnstn;
                    returnMap[key]=i;
                }
            }
            if(isGrowthSCERcvngCmpnstnBlank){
                let totalGrowthProducts=0;
                if(dataList[i].hasOwnProperty('growthNoOfProductsNotYetSent') &&
                 !isNaN(dataList[i].growthNoOfProductsNotYetSent)){
                    totalGrowthProducts+=dataList[i].growthNoOfProductsNotYetSent;
                }
                if(dataList[i].hasOwnProperty('growthNoOfProductsSent') &&
                 !isNaN(dataList[i].growthNoOfProductsSent)){
                    totalGrowthProducts+=dataList[i].growthNoOfProductsSent;
                }
                if(totalGrowthProducts>0){
                    notSentTxtAppended=true;
                    key+='_Not Sent';
                    returnMap[key]=i;
                }
            }
            if(isRetentionSCERcvngCmpnstnBlank && notSentTxtAppended){
                let totalRetentionProducts=0;
                if(dataList[i].hasOwnProperty('retentionNoOfProductsNotYetSent') &&
                 !isNaN(dataList[i].retentionNoOfProductsNotYetSent)){
                    totalRetentionProducts+=dataList[i].retentionNoOfProductsNotYetSent;
                }
                if(dataList[i].hasOwnProperty('retentionNoOfProductsSent') &&
                 !isNaN(dataList[i].retentionNoOfProductsSent)){
                    totalRetentionProducts+=dataList[i].retentionNoOfProductsSent;
                }
                if(totalRetentionProducts>0){
                    
                    key+='_Not Sent';
                    returnMap[key]=i;
                }

            }


        }
        return returnMap;

    }

    buildMap(dataList){
        let returnMap={};

        for(let i in dataList){
            let key='';
            let isGrowthSCERcvngCmpnstnBlank=true;
            let isRetentionSCERcvngCmpnstnBlank=true;
            let growthSCERcvngCmpnstn='';
            let retentionSCERcvngCmpnstn='';
            let notSentTxtAppended=false;
            let lst=[];
            
            if(dataList[i].hasOwnProperty('company')){
                key+=dataList[i].company;
            }
            if(dataList[i].hasOwnProperty('currentSCE')){
                key+='_'+dataList[i].currentSCE;
            }
            if((dataList[i].hasOwnProperty('growthSCEReceivingCompensation') &&  !this.isBlank(dataList[i].growthSCEReceivingCompensation))
            || (dataList[i].hasOwnProperty('growthAdditionalSCEReceivingCompensation') &&  !this.isBlank(dataList[i].growthAdditionalSCEReceivingCompensation))){
                isGrowthSCERcvngCmpnstnBlank=false;
                let obj1={};
                if(dataList[i].hasOwnProperty('growthSCEReceivingCompensation') &&  !this.isBlank(dataList[i].growthSCEReceivingCompensation)){
                    growthSCERcvngCmpnstn=dataList[i].growthSCEReceivingCompensation;
                    obj1.sceRcvngCmpnstn=dataList[i].growthSCEReceivingCompensation;
                    
                }else{
                    obj1.sceRcvngCmpnstn='';
                }
                
                if(dataList[i].hasOwnProperty('growthAdditionalSCEReceivingCompensation') &&  !this.isBlank(dataList[i].growthAdditionalSCEReceivingCompensation)){
                    growthSCERcvngCmpnstn+=','+dataList[i].growthAdditionalSCEReceivingCompensation;
                    obj1.additionalSCERcvngCmpnstn=dataList[i].growthSCEReceivingCompensation;
                }else{
                    obj1.additionalSCERcvngCmpnstn='';
                }
                obj1.index=i;
                obj1.totalProducts='NA';
                obj1.concatenatedSCERcvngCmpnstn=growthSCERcvngCmpnstn;
                if(!returnMap.hasOwnProperty(key)){
                    lst.push(obj1);

                }else{
                    lst=[...returnMap[key]];
                    lst.push(obj1);
                }
                
                returnMap[key]=lst;
            }
            if((dataList[i].hasOwnProperty('retentionSCEReceivingCompensation') &&  !this.isBlank(dataList[i].retentionSCEReceivingCompensation))
            || (dataList[i].hasOwnProperty('retentionAdditionalSCEReceivingCompensation') &&  !this.isBlank(dataList[i].retentionAdditionalSCEReceivingCompensation))){
                isRetentionSCERcvngCmpnstnBlank=false;
                let obj1={};
                if(dataList[i].hasOwnProperty('retentionSCEReceivingCompensation') &&  !this.isBlank(dataList[i].retentionSCEReceivingCompensation)){
                    retentionSCERcvngCmpnstn=dataList[i].retentionSCEReceivingCompensation;
                    obj1.sceRcvngCmpnstn=dataList[i].retentionSCEReceivingCompensation;
                    
                }else{
                    obj1.sceRcvngCmpnstn='';
                }
                if(dataList[i].hasOwnProperty('retentionAdditionalSCEReceivingCompensation') &&  !this.isBlank(dataList[i].retentionAdditionalSCEReceivingCompensation)){
                    retentionSCERcvngCmpnstn+=','+dataList[i].retentionAdditionalSCEReceivingCompensation;
                    obj1.additionalSCERcvngCmpnstn=dataList[i].retentionAdditionalSCEReceivingCompensation;
                }else{
                    obj1.additionalSCERcvngCmpnstn='';
                }
                obj1.index=i;
                obj1.totalProducts='NA';
                obj1.concatenatedSCERcvngCmpnstn=retentionSCERcvngCmpnstn;
                if(retentionSCERcvngCmpnstn!==growthSCERcvngCmpnstn){
                    if(!returnMap.hasOwnProperty(key)){
                        lst.push(obj1);
    
                    }else{
                        lst=[...returnMap[key]];
                        lst.push(obj1);
                    }
                    
                    returnMap[key]=lst;
                }
            }
            if(isGrowthSCERcvngCmpnstnBlank){
                let totalGrowthProducts=0;
                if(dataList[i].hasOwnProperty('growthNoOfProductsNotYetSent') &&
                 !isNaN(dataList[i].growthNoOfProductsNotYetSent)){
                    totalGrowthProducts+=dataList[i].growthNoOfProductsNotYetSent;
                }
                if(dataList[i].hasOwnProperty('growthNoOfProductsSent') &&
                 !isNaN(dataList[i].growthNoOfProductsSent)){
                    totalGrowthProducts+=dataList[i].growthNoOfProductsSent;
                }
                if(totalGrowthProducts>0){
                    notSentTxtAppended=true;
                    let obj1={};
                    obj1.sceRcvngCmpnstn='';
                    obj1.additionalSCERcvngCmpnstn='';
                    obj1.index=i;
                    obj1.totalProducts=totalGrowthProducts.toString();
                    obj1.concatenatedSCERcvngCmpnstn='';
                    if(!returnMap.hasOwnProperty(key)){
                        lst.push(obj1);
    
                    }else{
                        lst=[...returnMap[key]];
                        lst.push(obj1);
                    }
                    
                    returnMap[key]=lst;
                }
            }
            if(isRetentionSCERcvngCmpnstnBlank && !notSentTxtAppended){
                let totalRetentionProducts=0;
                if(dataList[i].hasOwnProperty('retentionNoOfProductsNotYetSent') &&
                 !isNaN(dataList[i].retentionNoOfProductsNotYetSent)){
                    totalRetentionProducts+=dataList[i].retentionNoOfProductsNotYetSent;
                }
                if(dataList[i].hasOwnProperty('retentionNoOfProductsSent') &&
                 !isNaN(dataList[i].retentionNoOfProductsSent)){
                    totalRetentionProducts+=dataList[i].retentionNoOfProductsSent;
                }
                if(totalRetentionProducts>0){
                    
                    let obj1={};
                    obj1.sceRcvngCmpnstn='';
                    obj1.additionalSCERcvngCmpnstn='';
                    obj1.index=i;
                    obj1.totalProducts=totalRetentionProducts.toString();
                    obj1.concatenatedSCERcvngCmpnstn='';
                    if(!returnMap.hasOwnProperty(key)){
                        lst.push(obj1);
    
                    }else{
                        lst=[...returnMap[key]];
                        lst.push(obj1);
                    }
                    
                    returnMap[key]=lst;
                }

            }


        }

        return returnMap;
    }

    exportHandler() {
        
        this.cssDisplay = '';
       
            getTemplateForExport({role: this.role})
                .then(result => {
                    let responseData = result;
                    let objectItagesMap = responseData.objectItags;
                    let xmlWsectTag = responseData.xmlString;
                    let xmlTempleteString = '';
                    
                    
                   xmlWsectTag = xmlWsectTag.replace('%%ReportTitle@@', this.reportTitle);
                   xmlWsectTag = xmlWsectTag.replace('%%SalesSeason@@', this.salesSeason);
                   xmlWsectTag = xmlWsectTag.replace('%%vpcrCurrentCompanyLabel@@', this.vpcrCurrentCompanyLabel);
                   xmlWsectTag = xmlWsectTag.replace('%%vpcrPreviousCompanyLabel@@', this.vpcrPreviousCompanyLabel);
                   xmlWsectTag = xmlWsectTag.replace('%%DataDate@@',  this.formatDateTime(''));
                   xmlWsectTag = xmlWsectTag.replace('%%vpcrInformationText@@', this.vpcrInformationText);
                    
                    let salesCycle = this.salesSeason;
                    let salesCycleSplitByCommaStr = salesCycle.split(',')[1].trim();
                    let salesCycleDateFormatted = this.formatDateWithHyphenSeparate(salesCycleSplitByCommaStr);
                    let salesCycleValue = salesCycle.split(',')[0] + ', ' + salesCycleDateFormatted;
                    console.log(result);

                    for (let objectName in objectItagesMap) {
                        if (objectItagesMap.hasOwnProperty(objectName)) {
                            
                                let itagSets = objectItagesMap[objectName];
                                let startItag = '';
                                let endItag = '';
                                let setCount = 0;
                                for (let itagStrIndex in itagSets) {
                                    
                                        setCount = setCount + 1;
                                        if (setCount === 1) {
                                            startItag = itagSets[itagStrIndex];
                                        }
                                        if (setCount === itagSets.length) {
                                            endItag = itagSets[itagStrIndex];
                                        }
                                    

                                }
                                startItag = '%%' + objectName + '.' + startItag + '@@';
                                endItag = '%%' + objectName + '.' + endItag + '@@';
                                console.log('startItag' + startItag + ' : endItag : ' + endItag);

                                let startIndex = xmlWsectTag.lastIndexOf(startItag);
                                let endIndex = xmlWsectTag.indexOf(endItag);

                                let stHeaderIdx;
                                let statusSnapshotRecList = [];
                                if (objectName === 'CURR') {
                                    
                                    stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="26">');
                                    statusSnapshotRecList = [...this.vpcrCurrentCompanyData];
                          
                                }
                                else if (objectName === 'PREV') {
                                    stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0" ss:Height="26">', startIndex);
                                    statusSnapshotRecList = [...this.vpcrPreviousCompanyData];
                                   
                                }

                                let endHeaderIdx = xmlWsectTag.indexOf('</Row>', endIndex);
                                endHeaderIdx += '</Row>'.length;
                                let rowToReccurse = xmlWsectTag.substring(stHeaderIdx, endHeaderIdx);

                                if (this.isListEmpty(statusSnapshotRecList)) {
                                   xmlWsectTag = xmlWsectTag.split(rowToReccurse).join('');
                               }else{
                                   xmlWsectTag = this.returnChildRows(rowToReccurse, xmlWsectTag, statusSnapshotRecList, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx);
                               }

                                
                               
                            

                        }
                    }


                    xmlTempleteString=xmlWsectTag;
                    let today = this.formatDate('');
                 
                    let hiddenElement = document.createElement('a');
                    hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTempleteString);
                    hiddenElement.target = '_self';
                    hiddenElement.download = 'Status Snapshot ' + salesCycleValue + ' ' + today + '.xls';
                    document.body.appendChild(hiddenElement); // Required for FireFox browser



                    hiddenElement.click();
                    const event = new ShowToastEvent({
                        title: '',
                        message: 'Status Snapshot Exported Successfully',
                    });
                    this.dispatchEvent(event);

                    this.cssDisplay = 'hidemodel';
                })
                .catch(error => {
                    console.log('Error ==>' + JSON.stringify(error));
                    this.cssDisplay = 'hidemodel';
                });
        

    }
}