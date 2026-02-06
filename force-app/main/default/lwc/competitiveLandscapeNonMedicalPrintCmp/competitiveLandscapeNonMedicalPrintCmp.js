import { LightningElement, api, track } from 'lwc';
import Print from '@salesforce/label/c.Print';
import ClientManagement from '@salesforce/label/c.Client_Management';
import ClientDevelopment from '@salesforce/label/c.Client_Development';
import getTemplateInXML from '@salesforce/apex/CompetitiveLandscape_OthersClass.getTemplateInXML';
import getTemplateInXMLOtherProducts from '@salesforce/apex/Competitive_Other_Prod_Controller.getTemplateInXMLOtherProducts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class CompetitiveLandscapeNonMedicalPrintCmp extends LightningElement {

    @api accountType;
    @api disablePrintButton;
    @api accountId;
    @track cssDisplay = 'hidemodel';
    @api isOtherProductPrint = false;

    label = {
        Print, ClientManagement, ClientDevelopment
    };


    getCompetitorRecListByProduct(dataList, productName) {
        let returnList = [];
        let competitorRecListByProduct = [];
        let nationalAccountCompetitorList = [];
        let totalCompetitorList = [];
        let competitorRecList = [];
        // console.log('dataList 1 = ',JSON.stringify(dataList));
        // console.log('productName 1 = ',JSON.stringify(productName));

        competitorRecListByProduct = dataList.filter(x => x.Competitorclassification__c !== undefined && x.Competitorclassification__c === productName);

        if (!this.isListEmpty(competitorRecListByProduct)) {
            if (productName === 'Pharmacy') {

                nationalAccountCompetitorList = competitorRecListByProduct.filter(x => x.CompetitorAccount__r !== undefined && x.CompetitorAccount__r.Name != undefined &&
                    x.CompetitorAccount__r.Name === 'Optum Rx');
                competitorRecList = competitorRecListByProduct.filter(x => x.CompetitorAccount__r !== undefined && x.CompetitorAccount__r.Name != undefined && x.CompetitorAccount__r.Name !== 'Total' && x.CompetitorAccount__r.Name !== 'Optum Rx');
                totalCompetitorList = competitorRecListByProduct.filter(x => x.CompetitorAccount__r !== undefined && x.CompetitorAccount__r.Name != undefined && x.CompetitorAccount__r.Name === 'Total');


            } else if (productName === 'Dental' || productName === 'Vision') {

                nationalAccountCompetitorList = competitorRecListByProduct.filter(x => x.CompetitorAccount__r !== undefined && x.CompetitorAccount__r.Name != undefined && x.CompetitorAccount__r.Name === 'National Accounts');
                competitorRecList = competitorRecListByProduct.filter(x => x.CompetitorAccount__r !== undefined && x.CompetitorAccount__r.Name != undefined && x.CompetitorAccount__r.Name !== 'Total' && x.CompetitorAccount__r.Name !== 'National Accounts');
                totalCompetitorList = competitorRecListByProduct.filter(x => x.CompetitorAccount__r !== undefined && x.CompetitorAccount__r.Name != undefined && x.CompetitorAccount__r.Name === 'Total');


            } else if (productName === 'Other') {
                nationalAccountCompetitorList = competitorRecListByProduct.filter(x => x.CompetitorAccount__r !== undefined && x.CompetitorAccount__r.Name != undefined && x.CompetitorAccount__r.Name === 'UHC-Optum');
                competitorRecList = competitorRecListByProduct.filter(x => x.CompetitorAccount__r !== undefined && x.CompetitorAccount__r.Name != undefined && x.CompetitorAccount__r.Name !== 'Total' && x.CompetitorAccount__r.Name !== 'UHC-Optum');
            }

            if (!this.isListEmpty(nationalAccountCompetitorList)) {
                nationalAccountCompetitorList.forEach(function (element) {
                    returnList.push(element);
                });

            }
            if (!this.isListEmpty(competitorRecList)) {
                competitorRecList.forEach(function (element) {
                    returnList.push(element);
                });
            }
            if (!this.isListEmpty(totalCompetitorList) && competitorRecListByProduct.length > 1) {
                returnList.push(totalCompetitorList[0]);
            }

        }

        // console.log('returnList 1 == ',JSON.stringify(returnList));
        return returnList;
    }



    getOtherCompetitorRecListByProductOrCarrier(dataList, viewBy, otherProductPicklist) {
        let returnList = [];
        let productOrCarrierByMap = {};
        console.log('dataList in Other = ', JSON.stringify(dataList));
        // console.log('viewBy in Other = ',JSON.stringify(viewBy));
        // console.log('otherProductPicklist in Other = ',JSON.stringify(otherProductPicklist));

        if (!this.isListEmpty(dataList) && !this.isBlank(viewBy)) {

            if (viewBy === 'Carrier') {
                for (let i in dataList) {
                    if (dataList[i].hasOwnProperty('CompetitorAccount__r') &&
                        dataList[i].CompetitorAccount__r.hasOwnProperty('Name') &&
                        !this.isBlank(dataList[i].CompetitorAccount__r.Name)) {
                        let productList = [];
                        if (!this.isMapEmpty(productOrCarrierByMap) &&
                            productOrCarrierByMap.hasOwnProperty(dataList[i].CompetitorAccount__r.Name)) {
                            productOrCarrierByMap[dataList[i].CompetitorAccount__r.Name].forEach(function (element) {
                                productList.push(element);
                            });

                            if (dataList[i].hasOwnProperty('Type_of_Products_Services_Provided__c')
                                && !this.isBlank(dataList[i].Type_of_Products_Services_Provided__c)) {
                                productList.push(dataList[i].Type_of_Products_Services_Provided__c);
                            } else if (productList.indexOf('') === -1) {
                                productList.push('');
                            }
                        } else {
                            if (dataList[i].hasOwnProperty('Type_of_Products_Services_Provided__c')
                                && !this.isBlank(dataList[i].Type_of_Products_Services_Provided__c)) {
                                productList.push(dataList[i].Type_of_Products_Services_Provided__c);
                            } else {
                                productList.push('');
                            }
                        }
                        productOrCarrierByMap[dataList[i].CompetitorAccount__r.Name] = productList;
                    }

                }

                if (!this.isMapEmpty(productOrCarrierByMap)) {

                    for (let eachCarrier in productOrCarrierByMap) {
                        let otherCompetitorWrapper = {};
                        let otherProduct = '';
                        let comments = '';
                        otherCompetitorWrapper.competitorAccountName = eachCarrier;

                        if (!this.isListEmpty(productOrCarrierByMap[eachCarrier])
                            && productOrCarrierByMap[eachCarrier].length === 1 &&
                            productOrCarrierByMap[eachCarrier].indexOf('') === -1) {
                            otherProduct = productOrCarrierByMap[eachCarrier][0];
                        } else {
                            let sortedProductList = productOrCarrierByMap[eachCarrier].sort();
                            otherProduct = sortedProductList.join('; ');
                            //otherProduct= sortedProductList.join(';');
                        }
                        otherCompetitorWrapper.typeOfProductsOrServicesProvided = otherProduct;
                        let competitorListByEachCarrier = dataList.filter(x => x.CompetitorAccount__r !== undefined
                            && x.CompetitorAccount__r.Name !== undefined && x.CompetitorAccount__r.Name === eachCarrier
                            && x.Comments__c !== undefined && x.Comments__c !== null && x.Comments__c !== '');
                        if (!this.isListEmpty(competitorListByEachCarrier)) {
                            comments = competitorListByEachCarrier[0].Comments__c;
                        }
                        otherCompetitorWrapper.comments = comments;

                        returnList.push(otherCompetitorWrapper);
                    }
                }

            } else if (viewBy === 'Product') {
                for (let i in dataList) {
                    if (dataList[i].hasOwnProperty('Type_of_Products_Services_Provided__c') &&
                        !this.isBlank(dataList[i].Type_of_Products_Services_Provided__c) &&
                        dataList[i].hasOwnProperty('CompetitorAccount__r') &&
                        dataList[i].CompetitorAccount__r.hasOwnProperty('Name') &&
                        !this.isBlank(dataList[i].CompetitorAccount__r.Name)) {
                        let competitorList = [];
                        if (!this.isMapEmpty(productOrCarrierByMap) &&
                            productOrCarrierByMap.hasOwnProperty(dataList[i].Type_of_Products_Services_Provided__c)) {
                            productOrCarrierByMap[dataList[i].Type_of_Products_Services_Provided__c].forEach(function (element) {
                                competitorList.push(element);
                            });


                            competitorList.push(dataList[i].CompetitorAccount__r.Name);

                        } else {
                            competitorList.push(dataList[i].CompetitorAccount__r.Name);
                        }
                        productOrCarrierByMap[dataList[i].Type_of_Products_Services_Provided__c] = competitorList;
                    }


                }

                for (let j in otherProductPicklist) {
                    let otherCompetitorWrapper = {};
                    let carrier = '';
                    let eachOtherProduct = otherProductPicklist[j];
                    otherCompetitorWrapper.typeOfProductsOrServicesProvided = eachOtherProduct;
                    if (!this.isMapEmpty(productOrCarrierByMap) && productOrCarrierByMap.hasOwnProperty(eachOtherProduct)) {
                        if (!this.isListEmpty(productOrCarrierByMap[eachOtherProduct])
                            && productOrCarrierByMap[eachOtherProduct].length === 1 &&
                            productOrCarrierByMap[eachOtherProduct].indexOf('') === -1) {
                            carrier = productOrCarrierByMap[eachOtherProduct][0];
                        } else {
                            let sortedCarrierList = productOrCarrierByMap[eachOtherProduct].sort();
                            carrier = sortedCarrierList.join('; ');
                            //carrier= sortedCarrierList.join(';');
                        }
                    }
                    otherCompetitorWrapper.competitorAccountName = carrier;
                    returnList.push(otherCompetitorWrapper);
                }

            }





        }
        // console.log('returnList = ',JSON.stringify(returnList));
        return returnList;
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

    print() {
        this.cssDisplay = '';
        // added if else as a part of #3495 competitive Landscape other section enhancement
        if (this.isOtherProductPrint) {
            getTemplateInXMLOtherProducts({ accountId: this.accountId, accountType: this.accountType })
                .then(result => {
                    console.log("print result = ", JSON.stringify(result));
                    let sortArray = ['Yes', 'No'];
                    let responseData = result;
                    let objectItagesMap = responseData.objectItags;
                    let xmlWsectTag = responseData.xmlString;
                    let xmlTempleteString = '';
                    let rowCount = 11;
                    let competitorData = responseData.competitorData;
                    //let competitorDataOther = responseData.competitorDataOther;
                    let otherProductPicklist = responseData.otherProductPicklist;
                    let HeaderData = competitorData[0];
                    let companyName = HeaderData["Account__r"]["Name"];
                    let staticRowCountBeforePageBreak1 = 11;
                    let staticRowCountBeforePageBreak2 = 3;
                    let othrPrdctsViewByCarrierPgBrkRowNo = 0;
                    let othrPrdctsViewByPrdctPgBrkRowNo = 0;
                    console.log("print competitorData = ", JSON.stringify(competitorData));

                    // if (competitorData.length > 0) {
                    //     let count = 0;
                    //     competitorData.forEach((record) => {
                    //         record.Competitorclassification__c == 'Other';
                    //         count++;
                    //     })
                    //     if (count > 2) {
                    //         competitorData.sort((a, b) => {
                    //             const aIndex = a.Point_Solution__c ? sortArray.indexOf(a.Point_Solution__c) : sortArray.length;
                    //             const bIndex = b.Point_Solution__c ? sortArray.indexOf(b.Point_Solution__c) : sortArray.length;
                    //             if (aIndex !== bIndex) {
                    //                 return aIndex - bIndex;
                    //             } else {
                    //                 return sortArray.indexOf(a.Point_Solution__c) - sortArray.indexOf(b.Point_Solution__c);
                    //             }
                    //         });
                    //     }
                    // }
                    //-----------------Changes for #3495 By Varun----------------//
                    if (competitorData.length > 0) {
                        competitorData.forEach((record) => {
                            if (record.Competitorclassification__c == 'Other' && record.hasOwnProperty('Type_of_File__c')) {
                                record.Type_of_File__c = String(record.Type_of_File__c.split(';').sort()).replaceAll(';', '; ');
                            }

                        })
                    }
                    //-----------------Changes for #3495 By Varun----------------//
                    for (let objectName in objectItagesMap) {
                        if (objectItagesMap.hasOwnProperty(objectName)) {
                            if (objectName === 'Header') {
                                for (let k in objectItagesMap[objectName]) {


                                    let key = objectItagesMap[objectName][k];
                                    let replaceItagName = '%%' + objectName + '.' + key + '@@';
                                    let value = '';

                                    if (key === 'companyName') {
                                        value = companyName;
                                    } else if (key === 'currentDateTime') {


                                        value = this.formatDateTime('');

                                    }
                                    value = value != null ? value : '';
                                    value = value.toString();
                                    value = this.replaceXmlSpecialCharacters(value);



                                    xmlWsectTag = xmlWsectTag.split(replaceItagName).join(value);

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

                                let stHeaderIdx;
                                let competitorRecList = [];


                                if (objectName === 'PharmacyCompetitorRec') {

                                    stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="23.5" ss:StyleID="s65">');
                                    competitorRecList = this.getCompetitorRecListByProduct(competitorData, 'Pharmacy');


                                } else if (objectName === 'DentalCompetitorRec') {

                                    if (this.accountType === this.label.ClientManagement) {
                                        stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0" ss:Height="27">', startIndex);
                                    } else if (this.accountType === this.label.ClientDevelopment) {
                                        stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="23">');
                                    }

                                    competitorRecList = this.getCompetitorRecListByProduct(competitorData, 'Dental');

                                } else if (objectName === 'VisionCompetitorRec') {
                                    if (this.accountType === this.label.ClientManagement) {
                                        stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0" ss:Height="26.5">', startIndex);
                                    } else if (this.accountType === this.label.ClientDevelopment) {
                                        stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="25">');
                                    }

                                    competitorRecList = this.getCompetitorRecListByProduct(competitorData, 'Vision');

                                } else if (objectName === 'OtherCompetitorRecByCarrier') {
                                    stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="60">');
                                    /*if(this.accountType===this.label.ClientManagement){
                                        stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="60">');
                                    }else if(this.accountType===this.label.ClientDevelopment){
                                        stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0" ss:Height="23">',startIndex);
                                    }*/

                                    //competitorRecList = this.getOtherCompetitorRecListByProductOrCarrier(this.getCompetitorRecListByProduct(competitorData, 'Other'), 'Carrier', otherProductPicklist);
                                    competitorRecList = this.getCompetitorRecListByProduct(competitorData, 'Other');

                                } else if (objectName === 'OtherCompetitorRecByProductOrService') {
                                    stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="45">');
                                    /*if(this.accountType===this.label.ClientManagement){
                                        stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="29">');
                                    }else if(this.accountType===this.label.ClientDevelopment){
                                        stHeaderIdx = xmlWsectTag.indexOf(' <Row ss:AutoFitHeight="0" ss:Height="26">');
                                    }*/

                                    // competitorRecList = this.getOtherCompetitorRecListByProductOrCarrier(this.getCompetitorRecListByProduct(competitorData, 'Other'), 'Product', otherProductPicklist);
                                    competitorRecList = this.getCompetitorRecListByProduct(competitorData, 'Other');

                                }

                                let endHeaderIdx = xmlWsectTag.indexOf('</Row>', endIndex);
                                endHeaderIdx += '</Row>'.length;
                                let rowToReccurse = xmlWsectTag.substring(stHeaderIdx, endHeaderIdx);


                                /*if (objectName !== 'OtherCompetitorRecByProductOrService' && this.isListEmpty(competitorRecList)) {
                                    xmlWsectTag = xmlWsectTag.split(rowToReccurse).join('');
                                } else if (objectName === 'OtherCompetitorRecByProductOrService' && this.isListEmpty(competitorRecList)) {
                                    xmlWsectTag = xmlWsectTag.split(rowToReccurse).join('');
                                   // xmlTempleteString = xmlWsectTag;
                                } */
                                if (this.isListEmpty(competitorRecList)) {
                                    xmlWsectTag = xmlWsectTag.split(rowToReccurse).join('');
                                }

                                else {
                                    //console.log(JSON.stringify(competitorRecList));
                                    xmlWsectTag = this.returnChildRows(rowToReccurse, xmlWsectTag, competitorRecList, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx);
                                    //xmlWsectTag = xmlTempleteString;
                                    //console.log('xmlWsectTag==>'+xmlWsectTag);
                                    if (objectName === 'PharmacyCompetitorRec' || objectName === 'DentalCompetitorRec' ||
                                        objectName === 'VisionCompetitorRec') {
                                        othrPrdctsViewByCarrierPgBrkRowNo += competitorRecList.length;
                                    } else if (objectName === 'OtherCompetitorRecByCarrier') {
                                        othrPrdctsViewByPrdctPgBrkRowNo += competitorRecList.length;
                                    }
                                }

                            }

                        }
                    }

                    othrPrdctsViewByCarrierPgBrkRowNo += staticRowCountBeforePageBreak1;
                    othrPrdctsViewByPrdctPgBrkRowNo = othrPrdctsViewByPrdctPgBrkRowNo + othrPrdctsViewByCarrierPgBrkRowNo + staticRowCountBeforePageBreak2;
                    xmlWsectTag = xmlWsectTag.split('##othrPrdctsViewByCarrierPgBrkRowNo@@').join(othrPrdctsViewByCarrierPgBrkRowNo);
                    xmlWsectTag = xmlWsectTag.split('##othrPrdctsViewByPrdctPgBrkRowNo@@').join(othrPrdctsViewByPrdctPgBrkRowNo);
                    xmlTempleteString = xmlWsectTag;
                    //xmlTempleteString = xmlTempleteString.split('##RowVal@@').join(rowCount);
                    let today = this.formatDate('');
                    let hiddenElement = document.createElement('a');
                    hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTempleteString);
                    //hiddenElement.href = 'data:text/xls;charset=utf-8;base64,' + this.base64Encode( xmlTempleteString );
                    hiddenElement.target = '_self'; // 
                    hiddenElement.download = 'CompetitiveLandscape ' + companyName + ' ' + today + '.xls';
                    document.body.appendChild(hiddenElement); // Required for FireFox browser



                    hiddenElement.click();
                    const event = new ShowToastEvent({
                        title: '',
                        message: 'Competitor Data Exported Successfully',
                    });
                    this.dispatchEvent(event);

                    this.cssDisplay = 'hidemodel';
                })
                .catch(error => {
                    console.log('Error ==>' + JSON.stringify(error));
                    this.cssDisplay = 'hidemodel';
                });
        }
        else {
            getTemplateInXML({ accountId: this.accountId, accountType: this.accountType })
                .then(result => {
                    console.log("print result = ", JSON.stringify(result));
                    let sortArray = ['Yes', 'No'];
                    let responseData = result;
                    let objectItagesMap = responseData.objectItags;
                    let xmlWsectTag = responseData.xmlString;
                    let xmlTempleteString = '';
                    let rowCount = 11;
                    let competitorData = responseData.competitorData;
                    //let competitorDataOther = responseData.competitorDataOther;
                    let otherProductPicklist = responseData.otherProductPicklist;
                    let HeaderData = competitorData[0];
                    let companyName = HeaderData["Account__r"]["Name"];
                    let staticRowCountBeforePageBreak1 = 11;
                    let staticRowCountBeforePageBreak2 = 3;
                    let othrPrdctsViewByCarrierPgBrkRowNo = 0;
                    let othrPrdctsViewByPrdctPgBrkRowNo = 0;
                    console.log("print competitorData = ", JSON.stringify(competitorData));

                    if (competitorData.length > 0) {
                        let count = 0;
                        competitorData.forEach((record) => {
                            record.Competitorclassification__c == 'Other';
                            count++;
                        })
                        if (count > 2) {
                            competitorData.sort((a, b) => {
                                const aIndex = a.Point_Solution__c ? sortArray.indexOf(a.Point_Solution__c) : sortArray.length;
                                const bIndex = b.Point_Solution__c ? sortArray.indexOf(b.Point_Solution__c) : sortArray.length;
                                if (aIndex !== bIndex) {
                                    return aIndex - bIndex;
                                } else {
                                    return sortArray.indexOf(a.Point_Solution__c) - sortArray.indexOf(b.Point_Solution__c);
                                }
                            });
                        }
                    }

                    for (let objectName in objectItagesMap) {
                        if (objectItagesMap.hasOwnProperty(objectName)) {
                            if (objectName === 'Header') {
                                for (let k in objectItagesMap[objectName]) {


                                    let key = objectItagesMap[objectName][k];
                                    let replaceItagName = '%%' + objectName + '.' + key + '@@';
                                    let value = '';

                                    if (key === 'companyName') {
                                        value = companyName;
                                    } else if (key === 'currentDateTime') {


                                        value = this.formatDateTime('');

                                    }
                                    value = value != null ? value : '';
                                    value = value.toString();
                                    value = this.replaceXmlSpecialCharacters(value);



                                    xmlWsectTag = xmlWsectTag.split(replaceItagName).join(value);

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

                                let stHeaderIdx;
                                let competitorRecList = [];


                                if (objectName === 'PharmacyCompetitorRec') {

                                    stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="23.5" ss:StyleID="s65">');
                                    competitorRecList = this.getCompetitorRecListByProduct(competitorData, 'Pharmacy');


                                } else if (objectName === 'DentalCompetitorRec') {

                                    if (this.accountType === this.label.ClientManagement) {
                                        stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0" ss:Height="27">', startIndex);
                                    } else if (this.accountType === this.label.ClientDevelopment) {
                                        stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="23">');
                                    }

                                    competitorRecList = this.getCompetitorRecListByProduct(competitorData, 'Dental');

                                } else if (objectName === 'VisionCompetitorRec') {
                                    if (this.accountType === this.label.ClientManagement) {
                                        stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0" ss:Height="26.5">', startIndex);
                                    } else if (this.accountType === this.label.ClientDevelopment) {
                                        stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="25">');
                                    }

                                    competitorRecList = this.getCompetitorRecListByProduct(competitorData, 'Vision');

                                } else if (objectName === 'OtherCompetitorRecByCarrier') {
                                    stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="60">');
                                    /*if(this.accountType===this.label.ClientManagement){
                                        stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="60">');
                                    }else if(this.accountType===this.label.ClientDevelopment){
                                        stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0" ss:Height="23">',startIndex);
                                    }*/

                                    //competitorRecList = this.getOtherCompetitorRecListByProductOrCarrier(this.getCompetitorRecListByProduct(competitorData, 'Other'), 'Carrier', otherProductPicklist);
                                    competitorRecList = this.getCompetitorRecListByProduct(competitorData, 'Other');

                                } else if (objectName === 'OtherCompetitorRecByProductOrService') {
                                    stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="45">');
                                    /*if(this.accountType===this.label.ClientManagement){
                                        stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="29">');
                                    }else if(this.accountType===this.label.ClientDevelopment){
                                        stHeaderIdx = xmlWsectTag.indexOf(' <Row ss:AutoFitHeight="0" ss:Height="26">');
                                    }*/

                                    // competitorRecList = this.getOtherCompetitorRecListByProductOrCarrier(this.getCompetitorRecListByProduct(competitorData, 'Other'), 'Product', otherProductPicklist);
                                    competitorRecList = this.getCompetitorRecListByProduct(competitorData, 'Other');

                                }

                                let endHeaderIdx = xmlWsectTag.indexOf('</Row>', endIndex);
                                endHeaderIdx += '</Row>'.length;
                                let rowToReccurse = xmlWsectTag.substring(stHeaderIdx, endHeaderIdx);


                                /*if (objectName !== 'OtherCompetitorRecByProductOrService' && this.isListEmpty(competitorRecList)) {
                                    xmlWsectTag = xmlWsectTag.split(rowToReccurse).join('');
                                } else if (objectName === 'OtherCompetitorRecByProductOrService' && this.isListEmpty(competitorRecList)) {
                                    xmlWsectTag = xmlWsectTag.split(rowToReccurse).join('');
                                   // xmlTempleteString = xmlWsectTag;
                                } */
                                if (this.isListEmpty(competitorRecList)) {
                                    xmlWsectTag = xmlWsectTag.split(rowToReccurse).join('');
                                }

                                else {
                                    //console.log(JSON.stringify(competitorRecList));
                                    xmlWsectTag = this.returnChildRows(rowToReccurse, xmlWsectTag, competitorRecList, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx);
                                    //xmlWsectTag = xmlTempleteString;
                                    //console.log('xmlWsectTag==>'+xmlWsectTag);
                                    if (objectName === 'PharmacyCompetitorRec' || objectName === 'DentalCompetitorRec' ||
                                        objectName === 'VisionCompetitorRec') {
                                        othrPrdctsViewByCarrierPgBrkRowNo += competitorRecList.length;
                                    } else if (objectName === 'OtherCompetitorRecByCarrier') {
                                        othrPrdctsViewByPrdctPgBrkRowNo += competitorRecList.length;
                                    }
                                }

                            }

                        }
                    }

                    othrPrdctsViewByCarrierPgBrkRowNo += staticRowCountBeforePageBreak1;
                    othrPrdctsViewByPrdctPgBrkRowNo = othrPrdctsViewByPrdctPgBrkRowNo + othrPrdctsViewByCarrierPgBrkRowNo + staticRowCountBeforePageBreak2;
                    xmlWsectTag = xmlWsectTag.split('##othrPrdctsViewByCarrierPgBrkRowNo@@').join(othrPrdctsViewByCarrierPgBrkRowNo);
                    xmlWsectTag = xmlWsectTag.split('##othrPrdctsViewByPrdctPgBrkRowNo@@').join(othrPrdctsViewByPrdctPgBrkRowNo);
                    xmlTempleteString = xmlWsectTag;
                    //xmlTempleteString = xmlTempleteString.split('##RowVal@@').join(rowCount);
                    let today = this.formatDate('');
                    let hiddenElement = document.createElement('a');
                    hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTempleteString);
                    //hiddenElement.href = 'data:text/xls;charset=utf-8;base64,' + this.base64Encode( xmlTempleteString );
                    hiddenElement.target = '_self'; // 
                    hiddenElement.download = 'CompetitiveLandscape ' + companyName + ' ' + today + '.xls';
                    document.body.appendChild(hiddenElement); // Required for FireFox browser



                    hiddenElement.click();
                    const event = new ShowToastEvent({
                        title: '',
                        message: 'Competitor Data Exported Successfully',
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

    returnChildRows(rowToReccurse, xmlWsectTag, competitorData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx) {

        let totalRows = '';
        let count = 0;
        let competitorNameStyleId = 's67';
        let totalCompetitorNameStyleId = 's92';
        // console.log('xmlWsectTag start = ',xmlWsectTag);
        console.log('rowToReccurse start = ', JSON.stringify(rowToReccurse));
        console.log('xmlWsectTag start = ', JSON.stringify(xmlWsectTag));
        console.log('competitorData start = ', JSON.stringify(competitorData));
        console.log('objectName start = ', JSON.stringify(objectName));
        console.log('objectItagesMap start = ', JSON.stringify(objectItagesMap));
        console.log('stHeaderIdx start = ', JSON.stringify(stHeaderIdx));
        console.log('endHeaderIdx start = ', JSON.stringify(endHeaderIdx));

        for (let i in competitorData) {
            let eachRow = rowToReccurse;
            count = count + 1;

            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                let value = '';
                console.log('replaceItagName = ', JSON.stringify(replaceItagName));
                console.log('key = ', JSON.stringify(key));
                if (key === 'CompetitorAccount__r.Name') {

                    var competitorAccountObj = competitorData[i]['CompetitorAccount__r'];
                    if (competitorAccountObj != null && competitorAccountObj != undefined) {
                        value = competitorAccountObj.Name;

                    }

                } else if (key === 'NumberOfMembersHeld__c' && !this.isBlank(competitorData[i][key]) && competitorData[i][key].toString().length > 3) {
                    value = parseFloat(competitorData[i][key]).toLocaleString('en');
                } else {
                    value = competitorData[i][key];
                }


                if (key === 'ofMembersHeld__c') {
                    value += '%';
                } else if (key === 'PrimaryIncumbent__c' || key === 'SecondaryIncumbent__c') {
                    if (competitorData[i].hasOwnProperty('CompetitorAccount__r')
                        && competitorData[i].CompetitorAccount__r.hasOwnProperty('Name')
                        && competitorData[i].CompetitorAccount__r.Name !== 'Total') {
                        if (value === true) {
                            value = 'Yes';
                        } else {
                            value = 'No';
                        }
                    } else {
                        value = '';
                    }

                }


                value = value != null ? value : '';
                value = value.toString();
                value = this.replaceXmlSpecialCharacters(value);

                if (eachRow.indexOf('##competitorNameStyleId@@') !== -1) {
                    if (competitorData[i].hasOwnProperty('CompetitorAccount__r')
                        && competitorData[i].CompetitorAccount__r.hasOwnProperty('Name')
                        && competitorData[i].CompetitorAccount__r.Name === 'Total') {
                        eachRow = eachRow.split('##competitorNameStyleId@@').join(totalCompetitorNameStyleId);
                    } else {
                        eachRow = eachRow.split('##competitorNameStyleId@@').join(competitorNameStyleId);
                    }



                }


                eachRow = eachRow.split(replaceItagName).join(value);
            }
            console.log('total rows = ', JSON.stringify(totalRows));
            console.log('eachRow = ', JSON.stringify(eachRow));
            totalRows += eachRow;
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + totalRows + xmlWsectTag.substring(endHeaderIdx);
        //xmlWsectTag = xmlWsectTag.split('##RowVal@@').join(rowCount);
        // console.log('xmlWsectTag start end = ',xmlWsectTag);
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