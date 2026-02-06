import { LightningElement, track, api } from 'lwc';
import vpcrNotSentText from '@salesforce/label/c.ICM_VPCR_Not_Yet_Sent_Text';


export default class VpcrSnapshotChildRowCmp extends LightningElement {
    @track vpcrRec;
    @api key;
    @api 
        get vpcrData() {
            return this.vpcrRec;
        }
        set vpcrData(value) {
            if (!this.onLoad) {
                this.setVPCRData(value);
            } else {
                this.vpcrRec = value;
            }
    }
    @track isGrowthSCEDifferent = false;
    @track isRetentionSCEDifferent = false;
    @track isGrowthNotSent = false;
    @track isRetentionNotSent = false;
    @track isGrowthDataEmpty = false;
    @track isRetentionDataEmpty = false;
    @track concatGrowthSCEs = '';
    @track concatRetentionSCEs = '';
    @track totalGrowthProducts = 0;
    @track totalRetentionProducts = 0;
    @track notSentText;

    setVPCRData(value) {
        let vpcrRec = {};
        this.vpcrRec = value;
        vpcrRec = Object.assign({}, this.vpcrRec);
        this.totalGrowthProducts = 0;
        this.totalRetentionProducts = 0;
        if (!this.isBlank(this.vpcrRec.growthNoOfProductsNotYetSent)) {
            this.totalGrowthProducts = this.totalGrowthProducts + Number(this.vpcrRec.growthNoOfProductsNotYetSent);
        }
        if (!this.isBlank(this.vpcrRec.growthNoOfProductsSent)) {
            this.totalGrowthProducts = this.totalGrowthProducts + Number(this.vpcrRec.growthNoOfProductsSent);
        }
        if (this.totalGrowthProducts === 0) {
            this.isGrowthDataEmpty = true;
        }else{
            this.isGrowthDataEmpty = false;
        }
        if (!this.isBlank(this.vpcrRec.retentionNoOfProductsNotYetSent)) {
            this.totalRetentionProducts = this.totalRetentionProducts + Number(this.vpcrRec.retentionNoOfProductsNotYetSent);
        }
        if (!this.isBlank(this.vpcrRec.retentionNoOfProductsSent)) {
            this.totalRetentionProducts = this.totalRetentionProducts + Number(this.vpcrRec.retentionNoOfProductsSent);
        }
        if (this.totalRetentionProducts === 0) {
            this.isRetentionDataEmpty = true;
        }else{
            this.isRetentionDataEmpty = false;
        }
        this.concatGrowthSCEs =this.vpcrRec.growthSCEReceivingCompensation;
        if ((!this.isBlank(this.vpcrRec.growthSCEReceivingCompensation) && this.vpcrRec.currentSCE != this.vpcrRec.growthSCEReceivingCompensation) 
            || !this.isBlank(this.vpcrRec.growthAdditionalSCEReceivingCompensation)) {
            this.isGrowthSCEDifferent = true;
            if (!this.isBlank(this.vpcrRec.growthAdditionalSCEReceivingCompensation)) {
                this.concatGrowthSCEs = this.concatGrowthSCEs + ', ' + this.vpcrRec.growthAdditionalSCEReceivingCompensation;
            }
        } else {
            this.isGrowthSCEDifferent = false;
            if (this.isBlank(this.vpcrRec.growthSCEReceivingCompensation)) {
                if (this.totalGrowthProducts > 0) {
                    this.isGrowthNotSent = true;
                    this.concatGrowthSCEs = this.notSentText;
                } else {
                    this.isGrowthNotSent = false;
                    this.concatGrowthSCEs = '';
                }
            }else{
                this.isGrowthNotSent = false;
            }            
        }
        this.concatRetentionSCEs =this.vpcrRec.retentionSCEReceivingCompensation;
        if ((!this.isBlank(this.vpcrRec.retentionSCEReceivingCompensation) && this.vpcrRec.currentSCE != this.vpcrRec.retentionSCEReceivingCompensation) 
        || !this.isBlank(this.vpcrRec.retentionAdditionalSCEReceivingCompensation)) {
                this.isRetentionSCEDifferent = true;
                if (!this.isBlank(this.vpcrRec.retentionAdditionalSCEReceivingCompensation)) {
                    this.concatRetentionSCEs =this.concatRetentionSCEs + ', ' + this.vpcrRec.retentionAdditionalSCEReceivingCompensation;
                }
        } else {
            this.isRetentionSCEDifferent = false;
            if (this.isBlank(this.vpcrRec.retentionSCEReceivingCompensation)) {
                if (this.totalRetentionProducts > 0) {
                    this.isRetentionNotSent = true;
                    this.concatRetentionSCEs = this.notSentText;
                } else {
                    this.isRetentionNotSent = false;
                    this.concatRetentionSCEs = '';
                }
            }else{
                this.isRetentionNotSent = false;
            } 
        }
    }

    connectedCallback() {
        this.notSentText = vpcrNotSentText;
        this.totalGrowthProducts =0;
        this.totalRetentionProducts = 0;
        if (!this.isBlank(this.vpcrRec.growthNoOfProductsNotYetSent)) {
            this.totalGrowthProducts = this.totalGrowthProducts + Number(this.vpcrRec.growthNoOfProductsNotYetSent);
        }
        if (!this.isBlank(this.vpcrRec.growthNoOfProductsSent)) {
            this.totalGrowthProducts = this.totalGrowthProducts + Number(this.vpcrRec.growthNoOfProductsSent);
        }
        if (this.totalGrowthProducts === 0) {
            this.isGrowthDataEmpty = true;
        }else{
            this.isGrowthDataEmpty = false;
        }
        if (!this.isBlank(this.vpcrRec.retentionNoOfProductsNotYetSent)) {
            this.totalRetentionProducts = this.totalRetentionProducts + Number(this.vpcrRec.retentionNoOfProductsNotYetSent);
        }
        if (!this.isBlank(this.vpcrRec.retentionNoOfProductsSent)) {
            this.totalRetentionProducts = this.totalRetentionProducts + Number(this.vpcrRec.retentionNoOfProductsSent);
        }
        if (this.totalRetentionProducts === 0) {
            this.isRetentionDataEmpty = true;
        }else{
            this.isRetentionDataEmpty = false;
        }
        this.concatGrowthSCEs =this.vpcrRec.growthSCEReceivingCompensation;
        if ((!this.isBlank(this.vpcrRec.growthSCEReceivingCompensation) && this.vpcrRec.currentSCE != this.vpcrRec.growthSCEReceivingCompensation) 
            || !this.isBlank(this.vpcrRec.growthAdditionalSCEReceivingCompensation)) {
            this.isGrowthSCEDifferent = true;
            if (!this.isBlank(this.vpcrRec.growthAdditionalSCEReceivingCompensation)) {
                this.concatGrowthSCEs = this.concatGrowthSCEs + ', ' + this.vpcrRec.growthAdditionalSCEReceivingCompensation;
            }
        } else {
            this.isGrowthSCEDifferent = false;
            if (this.isBlank(this.vpcrRec.growthSCEReceivingCompensation)) {
                if (this.totalGrowthProducts > 0) {
                    this.isGrowthNotSent = true;
                    this.concatGrowthSCEs = this.notSentText;
                } else {
                    this.isGrowthNotSent = false;
                    this.concatGrowthSCEs = '';
                }
            }else{
                this.isGrowthNotSent = false;
            }             
        }
        this.concatRetentionSCEs =this.vpcrRec.retentionSCEReceivingCompensation;
        if ((!this.isBlank(this.vpcrRec.retentionSCEReceivingCompensation) && this.vpcrRec.currentSCE != this.vpcrRec.retentionSCEReceivingCompensation) 
        || !this.isBlank(this.vpcrRec.retentionAdditionalSCEReceivingCompensation)) {
                this.isRetentionSCEDifferent = true;
                if (!this.isBlank(this.vpcrRec.retentionAdditionalSCEReceivingCompensation)) {
                    this.concatRetentionSCEs =this.concatRetentionSCEs + ', ' + this.vpcrRec.retentionAdditionalSCEReceivingCompensation;
                }
        } else {
            this.isRetentionSCEDifferent = false;
            if (this.isBlank(this.vpcrRec.retentionSCEReceivingCompensation)) {
                if (this.totalRetentionProducts > 0) {
                    this.isRetentionNotSent = true;
                    this.concatRetentionSCEs = this.notSentText;
                } else {
                    this.isRetentionNotSent = false;
                    this.concatRetentionSCEs = '';
                }
            }else{
                this.isRetentionNotSent = false;
            } 
        }

    }
    isBlank(strVal) {
        var isStrBlank = true;
        if (strVal !== undefined && strVal != null && strVal !== '') {
            isStrBlank = false;
        }
        return isStrBlank;
    }
}