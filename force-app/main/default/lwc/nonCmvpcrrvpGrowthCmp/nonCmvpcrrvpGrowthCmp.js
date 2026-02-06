import { LightningElement, track, api } from 'lwc';
import getGrowthData from '@salesforce/apex/GrowthIncentiveCompensationController.getGrowthData';
import getTemplateInXML from '@salesforce/apex/GrowthIncentiveCompensationController.getTemplateInXML';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ICM_SCE_Growth_ObjectPropertyFieldApiName_Mapping from '@salesforce/label/c.ICM_SCE_Growth_ObjectPropertyFieldApiName_Mapping';
import ICM_Growth_Report_Title from '@salesforce/label/c.ICM_Growth_Report_Title';
import ICM_SalesCycleLabel from '@salesforce/label/c.ICM_SalesCycleLabel';
import Print from '@salesforce/label/c.Print';


export default class nonCmvpcrrvpGrowthCmp extends LightningElement {
    @track salesCycle = '';
    @track salesCyclePicklist;
    @track sortByColumnName = 'Opportunity.Account.Name';
    @track sortByOrder = 'ASC';
    @track isgrowthDataListEmpty;
    @track growthDataList = [];
    @track growthRecWrapperList = [];
    @track loggedInUserName = '';
    @track reportTitle = '';
    @track sortByEffectiveDateAsc = false;
    @track sortByCompanyNameAsc = true;
    @track sortByMembershipActivityNameAsc = false;
    @track sortByProductFamilyAsc = false;
    @track sortByProductNameAsc = false;
    @track loggedInUserTimeZone;
    @api loggedInUserRole;
    @track isLoggedInUserRoleSpecialitySVP = false;
    @track loggedInUserId;
    @track cssDisplay;
    @track disablePrintButton;

    label = {
        ICM_Growth_Report_Title,
        ICM_SalesCycleLabel,
        Print
    };

    connectedCallback() {
        //if (this.loggedInUserRole === 'CM VP') {
        if (this.loggedInUserRole === 'Specialty Benefits SVP') {
            this.isLoggedInUserRoleSpecialitySVP = true;
        }
        this.getGrowthData();
    }

    getGrowthData() {
        this.cssDisplay = '';
        getGrowthData({ loggedInUserRole: this.loggedInUserRole, salesCycle: this.salesCycle, sortByColumnName: this.sortByColumnName, sortByOrder: this.sortByOrder })
            .then(result => {
                let growthData = result;
                var salesCyclePicklist = [];
                let growthDataList = [];

                console.log(JSON.stringify(growthData));

                if (growthData !== null && growthData !== undefined) {
                    if (growthData.OpportunityLineItemList !== undefined && growthData.OpportunityLineItemList !== null &&
                        growthData.OpportunityLineItemList.length !== 0) {
                        this.isgrowthDataListEmpty = false;
                        this.disablePrintButton=false;
                        growthDataList = [...growthData.OpportunityLineItemList];
                    }
                    else {
                        this.isgrowthDataListEmpty = true;
                        this.disablePrintButton=true;

                    }
                    if (growthData.picklistFieldMap !== undefined && growthData.picklistFieldMap !== null) {
                        if (growthData.picklistFieldMap.hasOwnProperty('SalesCycle')) {
                            growthData.picklistFieldMap.SalesCycle.forEach(function (element) {

                                salesCyclePicklist.push({ label: element, value: element });


                            });
                        }
                    }
                    this.salesCyclePicklist = salesCyclePicklist;
                    this.growthDataList = growthDataList;
                    this.salesCycle = growthData.salesCycle;
                    this.loggedInUserName = growthData.loggedInUserName;
                    //this.reportTitle = growthData.loggedInUserName + ' -- Incentive Compensation Growth Data Sheet';
                    this.reportTitle = 'Incentive Compensation Growth Data Sheet';
                    this.growthRecWrapperList = this.buildGrowthRecWrapper(growthDataList);
                    this.loggedInUserTimeZone = growthData.loggedInUserTimeZone;
                    this.loggedInUserId = growthData.loggedInUserId;





                }




                this.cssDisplay = 'hidemodel';

            })
            .catch(error => {
                console.log('Error in nonCmvpcrrvpGrowthCmp Cmp ==>' + JSON.stringify(error));
                this.cssDisplay = 'hidemodel';
            });

    }


    salesCycleChangeHandler(event) {
        this.salesCycle = event.target.value;
        this.sortByColumnName = 'Opportunity.Account.Name';
        this.sortByOrder = 'ASC';
        this.sortByEffectiveDateAsc = false;
        this.sortByCompanyNameAsc = true;
        this.sortByMembershipActivityNameAsc = false;
        this.sortByProductFamilyAsc = false;
        this.sortByProductNameAsc = false;
        this.growthDataList = [];
        this.getGrowthData();

    }


    getListFromValueSeparatedStr(valueSeparatedStr, valueSeparator) {
        var returnList = [];
        if (!this.isBlank(valueSeparatedStr)) {
            if (valueSeparatedStr.indexOf(valueSeparator) !== -1) {
                returnList = valueSeparatedStr.split(valueSeparator);
            }
            else {
                returnList = valueSeparatedStr;
            }
        }
        return returnList;
    }

    isMapEmpty(map1) {
        for (let key in map1) {
            if (map1.hasOwnProperty(key)) return false;
        }
        return true;
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



    buildGrowthRecWrapper(dataList) {
        let returnList = [];
        let apiNameObjPropMappingList = [];
        let apiNameObjPropMap = {};

        if (!this.isListEmpty(dataList)) {
            apiNameObjPropMappingList = this.getListFromValueSeparatedStr(ICM_SCE_Growth_ObjectPropertyFieldApiName_Mapping, ';');
            for (let i in apiNameObjPropMappingList) {
                if (i !== undefined) {
                    if (apiNameObjPropMappingList[i].indexOf(':') !== -1) {
                        let eachapiNameObjPropMapping = apiNameObjPropMappingList[i].split(':');
                        apiNameObjPropMap[eachapiNameObjPropMapping[1]] = eachapiNameObjPropMapping[0];
                    }

                }

            }
            if (!this.isMapEmpty(apiNameObjPropMap)) {
                for (let j in dataList) {
                    if (j !== undefined) {
                        let jsonData = {};
                        for (let k in apiNameObjPropMap) {
                            if (k.indexOf('.') !== -1) {
                                let fieldApiNameSeparatedByDotArr = [];
                                fieldApiNameSeparatedByDotArr.push(k.substring(0, k.indexOf('.')));
                                fieldApiNameSeparatedByDotArr.push(k.substring(k.indexOf('.') + 1));
                                let fieldApiNameSeparatedByDot = [...fieldApiNameSeparatedByDotArr];
                                if (dataList[j].hasOwnProperty(fieldApiNameSeparatedByDot[0])) {
                                    if (fieldApiNameSeparatedByDot[1].indexOf('.') !== -1) {
                                        let fieldApiNameSeparatedByDot1 = fieldApiNameSeparatedByDot[1].split('.');
                                        if (dataList[j][fieldApiNameSeparatedByDot[0]].hasOwnProperty(fieldApiNameSeparatedByDot1[0])) {
                                            if (dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot1[0]].hasOwnProperty(fieldApiNameSeparatedByDot1[1])) {
                                                console.log('k==>' + k);
                                                jsonData[apiNameObjPropMap[k]] = dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot1[0]][fieldApiNameSeparatedByDot1[1]];
                                            } else {
                                                jsonData[apiNameObjPropMap[k]] = '';
                                            }
                                        } else {
                                            jsonData[apiNameObjPropMap[k]] = '';
                                        }

                                    } else {
                                        if (dataList[j][fieldApiNameSeparatedByDot[0]].hasOwnProperty(fieldApiNameSeparatedByDot[1])) {
                                            jsonData[apiNameObjPropMap[k]] = dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot[1]];
                                        } else {
                                            jsonData[apiNameObjPropMap[k]] = '';
                                        }
                                    }

                                } else {
                                    jsonData[apiNameObjPropMap[k]] = '';
                                }

                            } else {
                                if (dataList[j].hasOwnProperty(k)) {
                                    jsonData[apiNameObjPropMap[k]] = dataList[j][k];
                                } else {
                                    jsonData[apiNameObjPropMap[k]] = '';
                                }
                            }

                        }

                        if (!this.isMapEmpty(jsonData)) {
                            returnList.push(jsonData);
                        }

                    }



                }
            }

        }




        return returnList;
    }

    sortFields(event) {

        var selectedItem = event.currentTarget;
        var selectedItemToBeSorted = selectedItem.dataset.record;

        var fieldItagsWithPropMap = '{"Opportunity.EffectiveDate__c":"sortByEffectiveDateAsc","Opportunity.Account.Name":"sortByCompanyNameAsc","Opportunity.Name":"sortByMembershipActivityNameAsc","Product2.Family":"sortByProductFamilyAsc","Product2.Name":"sortByProductNameAsc"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithPropMap);
        var sortFieldCompName = sortFieldCompNameMap[selectedItemToBeSorted];
        if (sortFieldCompName === 'sortByEffectiveDateAsc') {
            if (this.sortByEffectiveDateAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByEffectiveDateAsc = false;
                this.getGrowthData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByEffectiveDateAsc = true;
                this.getGrowthData();

            }

        } else if (sortFieldCompName === 'sortByCompanyNameAsc') {
            if (this.sortByCompanyNameAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCompanyNameAsc = false;
                this.getGrowthData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCompanyNameAsc = true;
                this.getGrowthData();

            }

        } else if (sortFieldCompName === 'sortByMembershipActivityNameAsc') {
            if (this.sortByMembershipActivityNameAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByMembershipActivityNameAsc = false;
                this.getGrowthData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByMembershipActivityNameAsc = true;
                this.getGrowthData();

            }

        } else if (sortFieldCompName === 'sortByProductFamilyAsc') {
            if (this.sortByProductFamilyAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByProductFamilyAsc = false;
                this.getGrowthData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByProductFamilyAsc = true;
                this.getGrowthData();

            }

        }else if (sortFieldCompName === 'sortByProductNameAsc') {
            if (this.sortByProductNameAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByProductNameAsc = false;
                this.getGrowthData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByProductNameAsc = true;
                this.getGrowthData();

            }

        }

    }

    print() {
        //this.cssDisplay = '';
        /*if (this.isgrowthDataListEmpty) {
            const event = new ShowToastEvent({
                title: '',
                message: 'No records to print.',
            });
            this.dispatchEvent(event);
            this.cssDisplay = 'hidemodel';
        } else {*/
            
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


                            } else {
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



                                xmlTempleteString = this.returnChildRows(rowToReccurse, xmlWsectTag, this.growthRecWrapperList, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount);
                            }

                        }
                    }



                    let today = this.formatDate('');
                    let hiddenElement = document.createElement('a');
                    hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTempleteString);
                    //hiddenElement.href = 'data:text/xls;charset=utf-8;base64,' + this.base64Encode( xmlTempleteString );
                    hiddenElement.target = '_self'; // 
                    hiddenElement.download = 'Growth Data Sheet ' + salesCycleValue + ' ' + today + '.xls';
                    document.body.appendChild(hiddenElement); // Required for FireFox browser



                    hiddenElement.click();
                    const event = new ShowToastEvent({
                        title: '',
                        message: 'Growth Data Sheet Exported Successfully',
                    });
                    this.dispatchEvent(event);

                    this.cssDisplay = 'hidemodel';
                })
                .catch(error => {
                    console.log('Error ==>' + JSON.stringify(error));
                    this.cssDisplay = 'hidemodel';
                });
        //}

    }

    returnChildRows(rowToReccurse, xmlWsectTag, growthData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount) {

        let totalRows = '';
        let count = 0;
        /*let highlightStyleId = "s72";
        let nonHighlightStyleId = "s71";*/
        let highlightStyleId = "s79";
        let nonHighlightStyleId = "s78";
        for (let i in growthData) {
            let eachRow = rowToReccurse;
            count = count + 1;
            rowCount = rowCount + 1;
            /*var replaceItagName = '%%'+objectName+'.'+'Serial_No'+'@@';
                eachRow = eachRow.split(replaceItagName).join(count);*/
            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                let value = '';

                if (key === 'effectiveDate') {
                    if (growthData[i].hasOwnProperty(key) &&
                        !this.isBlank(growthData[i][key])) {
                        value = this.convertDateFormat(growthData[i][key]);
                    }
                } else if (key === 'newMembership' && !this.isBlank(growthData[i][key]) && growthData[i][key].toString().length > 3) {
                    value = parseFloat(growthData[i][key]).toLocaleString('en');
                    console.log('newMembership==>' + value);
                } else if (key === 'dateSentToIncentiveCompTeam') {
                    let icSentStatusStyleId;
                    if (growthData[i].hasOwnProperty(key)
                        && !this.isBlank(growthData[i][key])) {
                        icSentStatusStyleId = nonHighlightStyleId;
                        value = this.formatDateTime(growthData[i][key]);


                    } else {
                        icSentStatusStyleId = highlightStyleId;
                        value = 'Not Sent - Action Needed';

                    }
                    eachRow = eachRow.split('##icSentStatusStyleId@@').join(icSentStatusStyleId);
                } else if (key === 'dateIncentiveCompTeamExtractedData') {
                    let icDataExtractedStatusStyleId;
                    if (growthData[i].hasOwnProperty(key)
                        && !this.isBlank(growthData[i][key])) {
                        icDataExtractedStatusStyleId = nonHighlightStyleId;
                        value = this.formatDateTime(growthData[i][key]);


                    } else {
                        value = 'Not Yet Extracted';
                        if (growthData[i].hasOwnProperty('effectiveDate') && !this.isBlank(growthData[i].effectiveDate)
                            && this.highlightICDataExtractedStatus(growthData[i].effectiveDate)
                            && growthData[i].hasOwnProperty('dateSentToIncentiveCompTeam')
                            && !this.isBlank(growthData[i].dateSentToIncentiveCompTeam)) {
                            icDataExtractedStatusStyleId = highlightStyleId;
                        } else {
                            icDataExtractedStatusStyleId = 's100';
                        }

                    }
                    eachRow = eachRow.split('##icDataExtractedStatusStyleId@@').join(icDataExtractedStatusStyleId);

                } else if (key === 'productName') {
                    if (growthData[i].hasOwnProperty(key)
                        && !this.isBlank(growthData[i][key])) {
                        if (growthData[i].productName === 'Total' && growthData[i].hasOwnProperty('productLine')
                            && !this.isBlank(growthData[i].productLine)) {

                            value = growthData[i].productLine;
                        } else {
                            value = growthData[i][key];
                        }

                    }

                } else if (key === 'medicalSVPOrSCE') {
                    if (growthData[i].hasOwnProperty('opportunityOwnerId') && !this.isBlank(this.loggedInUserId)
                        && !this.isBlank(growthData[i].opportunityOwnerId) && growthData[i].opportunityOwnerId === this.loggedInUserId) {
                        //value should be blank
                    } else if (growthData[i].hasOwnProperty('opportunityOwnerName') && !this.isBlank(growthData[i].opportunityOwnerName)) {
                        value = growthData[i].opportunityOwnerName;
                    }
                }else if (key === 'productFamily') {
                    if (!growthData[i].hasOwnProperty(key)
                        || this.isBlank(growthData[i][key])) {
                        if (growthData[i].hasOwnProperty('productName') && growthData[i].productName === 'Total' && growthData[i].hasOwnProperty('productLine')
                            && !this.isBlank(growthData[i].productLine)) {

                            value = growthData[i].productLine;
                        } 

                    }else {
                        value = growthData[i][key];
                    }

                } 
                else {
                    value = growthData[i][key];
                }


                value = value != null ? value : '';
                value = value.toString();
                value = this.replaceXmlSpecialCharacters(value);

                if (key === 'willSalesIncentivesBeSplit') {
                    if (growthData[i].hasOwnProperty('willSalesIncentivesBeSplit')
                        && !this.isBlank(growthData[i].willSalesIncentivesBeSplit) && growthData[i].willSalesIncentivesBeSplit === 'Yes') {
                        eachRow = eachRow.split('##salesIncentivesBeSplitStyleId@@').join(highlightStyleId);
                    } else {
                        eachRow = eachRow.split('##salesIncentivesBeSplitStyleId@@').join("s100");
                    }
                }


                eachRow = eachRow.split(replaceItagName).join(value);
            }

            totalRows += eachRow;
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + totalRows + xmlWsectTag.substring(endHeaderIdx);
        xmlWsectTag = xmlWsectTag.split('##RowVal@@').join(rowCount);
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

}