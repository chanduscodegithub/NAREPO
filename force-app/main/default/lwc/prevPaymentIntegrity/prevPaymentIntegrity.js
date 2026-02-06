/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 05-15-2024
 * @last modified by  : Spoorthy
**/
import { LightningElement, api } from 'lwc';

export default class PrevPaymentIntegrity extends LightningElement {

    @api soldCaseDataCopy;
    @api prevOption;
}