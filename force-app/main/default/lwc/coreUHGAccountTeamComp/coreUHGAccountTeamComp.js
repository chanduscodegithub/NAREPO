import { LightningElement, api, wire } from 'lwc';



export default class CoreUHGAccountTeamComp extends LightningElement {
    isCoreUHGTeamDateListEmpty = true;
    jsonData = {};
    accCoreData;
    coreTeamData;

    @api accountTeamNewData;
    @api specialtyBenefitInvolved;
    @api isspecialtyBenefitInvolvedEmpty = false;

    @api contactRoleMap;

    @api
    get uhgAccountTeamEnhancementList(){
        return this.accountTeamNewData;
    }
    set uhgAccountTeamEnhancementList(value){
        this.accountTeamNewData = value;
    }


    @api
    get corporationOverviewData() {
        return this.accCoreData;
    }
    set corporationOverviewData(value) {
        this.accCoreData = value;
    }

    @api
    get coreUHGTeamData() {
        return this.coreTeamData;
    }
    set coreUHGTeamData(value) {
        this.coreTeamData = value;
    }
}