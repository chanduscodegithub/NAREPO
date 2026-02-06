/* eslint-disable no-constant-condition */
/* eslint-disable no-alert */
/* eslint-disable vars-on-top */
/* eslint-disable no-console */
import {
    LightningElement,
    api,
    track,
    wire
} from 'lwc';
import {
    NavigationMixin
} from 'lightning/navigation';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import currentProductRecordFromApex from '@salesforce/apex/CurrentProductsRestructuredController.getProductMixRecord';
import getCurrentProfile from '@salesforce/apex/CurrentProductsRestructuredController.currentProfile';
import saveRecords from '@salesforce/apex/CurrentProductsRestructuredController.saveRecords';
import additionalComments from '@salesforce/apex/CurrentProductsRestructuredController.additionalComments';


// import autoSize from '@salesforce/resourceUrl/autoSize';
// import { loadStyle, loadScript } from 'lightning/platformResourceLoader';

import {
    getObjectInfo
} from 'lightning/uiObjectInfoApi';
import CURRENT_PRODUCT from '@salesforce/schema/ProductMix__c';

import {
    getPicklistValues
} from 'lightning/uiObjectInfoApi';
//---------------------------------SUMMARY---------------------------------
import FundingArrangements from '@salesforce/schema/ProductMix__c.Funding_Arrangements__c';
import GlobalProducts from '@salesforce/schema/ProductMix__c.Global_Products__c';//#3958
import TieredBenefits from '@salesforce/schema/ProductMix__c.Tiered_Benefits__c';
import Pharmacy from '@salesforce/schema/ProductMix__c.Pharmacy__c';
import Surest from '@salesforce/schema/ProductMix__c.Surest__c';
import Dental from '@salesforce/schema/ProductMix__c.Dental__c';
import Vision from '@salesforce/schema/ProductMix__c.Vision__c';
import SupplementalHealth from '@salesforce/schema/ProductMix__c.Supplemental_Health__c';
import Life from '@salesforce/schema/ProductMix__c.Life__c';
import Disability from '@salesforce/schema/ProductMix__c.Disability__c';
import FinancialAccounts from '@salesforce/schema/ProductMix__c.Financial_Accounts__c';
import PaymentIntegrity from '@salesforce/schema/ProductMix__c.Payment_Integrity__c';
import PetInsurance from '@salesforce/schema/ProductMix__c.Pet_Insurance_FIGO__c';

import CareManagement from '@salesforce/schema/ProductMix__c.Care_Management__c';
import CentersOfExcellence from '@salesforce/schema/ProductMix__c.Centers_of_Excellence__c';
import DecisionSupport from '@salesforce/schema/ProductMix__c.Decision_Support__c';
import DiseaseManagement from '@salesforce/schema/ProductMix__c.Disease_Management__c';
import WomensHealth from '@salesforce/schema/ProductMix__c.Women_s_Health__c';
import WorksiteWellness from '@salesforce/schema/ProductMix__c.Worksite_Wellness__c';
import WellnessAndWellnessCoaching from '@salesforce/schema/ProductMix__c.Wellness_and_Wellness_Coaching__c';
import RallyClient from '@salesforce/schema/ProductMix__c.Rally_Client_above_base__c';
import IncentiveProducts from '@salesforce/schema/ProductMix__c.Incentive_Products__c';
import MedicalNecessity from '@salesforce/schema/ProductMix__c.Medical_Necessity__c';
import BehavioralHealth from '@salesforce/schema/ProductMix__c.Behavioral_Health__c';
import EapDomestic from '@salesforce/schema/ProductMix__c.EAP_Domestic__c';
import EapGlobal from '@salesforce/schema/ProductMix__c.EAP_Global__c';
import RetireeProducts from '@salesforce/schema/ProductMix__c.Retiree_Products__c';
import uhcHub from '@salesforce/schema/ProductMix__c.Retiree_Products__c';
//---------------------------------SUMMARY---------------------------------


//---------------------------------SUPPLEMENTAL HEALTH---------------------------------
import AccidentProtection from '@salesforce/schema/ProductMix__c.Accident_Protection__c';
import CriticalIllnes from '@salesforce/schema/ProductMix__c.Critical_Illness__c';
import HospitalIndemnity from '@salesforce/schema/ProductMix__c.Hospital_Indemnity__c';

import BasicLife from '@salesforce/schema/ProductMix__c.Basic_Life__c';
import DependentLife from '@salesforce/schema/ProductMix__c.Dependent_Life__c';
import SupplementalLife from '@salesforce/schema/ProductMix__c.Supplemental_Life__c';
import ShortTermDisability from '@salesforce/schema/ProductMix__c.Short_Term_Disability__c';
import LongTermDisability from '@salesforce/schema/ProductMix__c.Long_Term_Disability__c';
import AbsenceManagement from '@salesforce/schema/ProductMix__c.Absence_Managaement__c';
//---------------------------------SUPPLEMENTAL HEALTH---------------------------------


//---------------------------------FINANCIAL ACCOUNT---------------------------------
import CommuterExpenseReimbursement from '@salesforce/schema/ProductMix__c.Commuter_Expense_Reimbursement_Account__c';
import FlexibleSpendingAccount from '@salesforce/schema/ProductMix__c.Flexible_Spending_Account_FSA__c';
import HealthIncentiveAccount from '@salesforce/schema/ProductMix__c.Health_Incentive_Account_HIA__c';

import HealthReimbursmentAccount from '@salesforce/schema/ProductMix__c.Health_Reimbursement_Account_HRA__c';
import HealthSavingsAccount from '@salesforce/schema/ProductMix__c.Health_Savings_Account_HSA__c';
import RetireeReimbursmentAccount from '@salesforce/schema/ProductMix__c.Retiree_Reimbursement_Account_RRA__c';
//---------------------------------FINANCIAL ACCOUNT---------------------------------


//---------------------------------CARE MANAGEMENT DETAILS---------------------------------
import PersonalHealthSupportProgram from '@salesforce/schema/ProductMix__c.Personal_Health_Support_PHS_Program__c';
import Advocate4Me from '@salesforce/schema/ProductMix__c.Advocate4Me__c';
import ComplexCare from '@salesforce/schema/ProductMix__c.Complex_Care_Concierge_C3__c';
//---------------------------------CARE MANAGEMENT DETAILS---------------------------------

//------------------------------------------CENTERS OF EXCELLENCE------------------------------------------
import BariatricResourceServices from '@salesforce/schema/ProductMix__c.Bariatric_Resource_Services__c';
import CancerResourceServices from '@salesforce/schema/ProductMix__c.Cancer_Resource_Services__c';
import CancerSupportProgram from '@salesforce/schema/ProductMix__c.Cancer_Support_Program__c';

import KidneyResourceServices from '@salesforce/schema/ProductMix__c.Kidney_Resource_Services__c';
import OrthopedicSolutions from '@salesforce/schema/ProductMix__c.Orthopedic_Solutions__c';
import TransplantResourceServices from '@salesforce/schema/ProductMix__c.Transplant_Resource_Services__c';
//------------------------------------------CENTERS OF EXCELLENCE------------------------------------------

//------------------------------------------DECISION SUPPORT------------------------------------------
import Buoy from '@salesforce/schema/ProductMix__c.Buoy__c';
import ErDecisionSupport from '@salesforce/schema/ProductMix__c.ER_Decision_Support__c';
import NurselineProgram from '@salesforce/schema/ProductMix__c.Nurseline_Program__c';

import SecondOpinionServices from '@salesforce/schema/ProductMix__c.Second_Opinion_Services_2nd_MD__c';
import SurgicalManagementSolution from '@salesforce/schema/ProductMix__c.Surgical_Management_Solution_SMS__c';
//------------------------------------------DECISION SUPPORT------------------------------------------

//------------------------------------------DECISION MANAGEMENT------------------------------------------
import AsthmaProgram from '@salesforce/schema/ProductMix__c.Asthma_Program__c';
import CoronaryArteryDiseaseProgram from '@salesforce/schema/ProductMix__c.Coronary_Artery_Disease_Program__c';
import HeartFailureProgram from '@salesforce/schema/ProductMix__c.Heart_Failure_Program__c';
import UMREmergingCare from '@salesforce/schema/ProductMix__c.UMR_Emerging_CARE__c'; //Added by Vignesh

import DiabetesProgram from '@salesforce/schema/ProductMix__c.Diabetes_Program__c';
import ChronicObstructivePulmonaryDisease from '@salesforce/schema/ProductMix__c.Chronic_Obstructive_Pulmonary_Disease__c';
import UMROngoingConditionCare from '@salesforce/schema/ProductMix__c.UMR_Ongoing_Condition_CARE__c'; //Added by Vignesh
//------------------------------------------DECISION MANAGEMENT------------------------------------------

//------------------------------------------WOMENS HEALTH------------------------------------------
import FertilitySolutions from '@salesforce/schema/ProductMix__c.Fertility_Solutions__c';
import NeonatalResourceServices from '@salesforce/schema/ProductMix__c.Neonatal_Resource_Services__c';
import MavenMaternity from '@salesforce/schema/ProductMix__c.Maven_Maternity__c'; //Added by Vignesh
import DoulaSupportPrograms from '@salesforce/schema/ProductMix__c.Doula_Support_programs__c'; //Added by Vignesh
import UMRMaternityCare from '@salesforce/schema/ProductMix__c.UMR_Maternity_CARE__c'; //Added by Vignesh
//------------------------------------------WOMENS HEALTH------------------------------------------

//------------------------------------------WORKSITE WELLNESS------------------------------------------

import AdultFluClinic from '@salesforce/schema/ProductMix__c.Adult_Flu_Clinic__c';
import BiometricScreening from '@salesforce/schema/ProductMix__c.Biometric_Screening__c';
import OnsiteFitness from '@salesforce/schema/ProductMix__c.Onsite_Fitness__c';
import OptumOnsite from '@salesforce/schema/ProductMix__c.Optum_Onsite_Health_Promotion_Specialist__c';

//------------------------------------------WORKSITE WELLNESS------------------------------------------

//------------------------------------------WELLNESS AND WELLNESS------------------------------------------
import SmokingCessation from '@salesforce/schema/ProductMix__c.Smoking_Cessation__c';
import RealAppeal from '@salesforce/schema/ProductMix__c.Real_Appeal__c';
import Stride from '@salesforce/schema/ProductMix__c.Stride__c';
import WellnessRally from '@salesforce/schema/ProductMix__c.Wellness_Rally__c'; //Added by Vignesh

import UhcMotion from '@salesforce/schema/ProductMix__c.UHC_Motion__c';
import WellnessCoaching from '@salesforce/schema/ProductMix__c.Wellness_Coaching__c';
import UMRWellnessCare from '@salesforce/schema/ProductMix__c.UMR_Wellness_CARE__c'; //Added by Vignesh
//------------------------------------------WELLNESS AND WELLNESS------------------------------------------

//--------------------------------------------------------NETWORK DETAILS--------------------------------------------------------
import SharedSavingsProgram from '@salesforce/schema/ProductMix__c.Shared_Savings_Program_Facility_R_C__c';
//--------------------------------------------------------NETWORK DETAILS--------------------------------------------------------

//--------------------------------------------------------MEDICAL NECESSITY--------------------------------------------------------
import SiteOfServiceOutPatient from '@salesforce/schema/ProductMix__c.Site_of_Service_SOS_Outpatient_Facility__c';
import SiteOfService from '@salesforce/schema/ProductMix__c.Site_of_Service_SOS_Office_Based__c';

import Arthroscopy from '@salesforce/schema/ProductMix__c.Arthroscopy__c';
import FootSurgery from '@salesforce/schema/ProductMix__c.Foot_Surgery__c';
import Infertility from '@salesforce/schema/ProductMix__c.Infertility__c';
import Radiology from '@salesforce/schema/ProductMix__c.Radiology_Services__c';
import Cardiology from '@salesforce/schema/ProductMix__c.Cardiology_Services__c';
import CancerGuidance from '@salesforce/schema/ProductMix__c.Cancer_Guidance_Program__c';
//--------------------------------------------------------MEDICAL NECESSITY--------------------------------------------------------

//--------------------------------------------------------OTHER PRODUCTS--------------------------------------------------------
import EcrsClient from '@salesforce/schema/ProductMix__c.ECRS_client__c';
import EcrsType from '@salesforce/schema/ProductMix__c.ECRS_Type__c';

import EngagementSolutionsClient from '@salesforce/schema/ProductMix__c.Engagement_Solutions_Client__c';
import EngagementSolutionsTier from '@salesforce/schema/ProductMix__c.Engagement_Solutions_Tier__c';
import UhcCobraAdministration from '@salesforce/schema/ProductMix__c.UHC_Cobra_Administration__c';
import StopLoss from '@salesforce/schema/ProductMix__c.Stop_Loss__c';
//--------------------------------------------------------OTHER PRODUCTS--------------------------------------------------------

//------------------------------------------------------ADDITIONAL DETAILS------------------------------------------------------
import UhcUmrTelehealth from '@salesforce/schema/ProductMix__c.UHC_UMR_Telehealth_Solutions__c';
import UhcUmrMemberService from '@salesforce/schema/ProductMix__c.UHC_UMR_Member_Service_and_Tools__c';
import UmrCobra from '@salesforce/schema/ProductMix__c.UMR_COBRA_Services__c';
import MemberServiceVendor from '@salesforce/schema/ProductMix__c.Member_Service_Vendor__c';

//------------------------------------------------------ADDITIONAL DETAILS------------------------------------------------------

//------------------------------------------------------RECORD INFORMATION------------------------------------------------------
import CareMgmtDecisionSupprt from '@salesforce/schema/ProductMix__c.Care_Mgmt_Decision_Supprt_Women_s_Health__c';
//------------------------------------------------------RECORD INFORMATION------------------------------------------------------

//------------------------------------------------------SYSTEM INFORMATION------------------------------------------------------
import CurrentProductName from '@salesforce/schema/ProductMix__c.Current_Product_Name__c';
import CreatedBy from '@salesforce/schema/ProductMix__c.CreatedById';

import Name from '@salesforce/schema/ProductMix__c.Name';
import Company from '@salesforce/schema/ProductMix__c.AccountFirm__c';
import LastModifiedBy from '@salesforce/schema/ProductMix__c.LastModifiedById';

import CreatedDate from '@salesforce/schema/ProductMix__c.CreatedDate';
import ModifiedDate from '@salesforce/schema/ProductMix__c.LastModifiedDate';
//------------------------------------------------------SYSTEM INFORMATION------------------------------------------------------

import getClientPlatformValue from '@salesforce/apex/CurrentProductsRestructuredController.getClientPlatformValue';

export default class currentProductsCmp extends NavigationMixin(LightningElement) {
    //@track activeSections = ['SUMMARY INFORMATION - MEDICAL \\ RX \\ SPECIALTY BENEFITS \\ RETIREE:', 'SUMMARY INFORMATION - OPTUM PRODUCTS:', 'OTHER PRODUCTS AND SERVICES (from various sources)'];
    activeSections = [];
    @track sectionNames = [];
    @api recordId;
    @api isCurrentProductEmpty;
    @api currentProfileName;
    @api isSystemAdmin;
    @api isEditDisabled;
    @api isSaveCancelDisabled;
    hasRendered = false;
    @track ProductMix__c = {};
    @api cpList;

    @api createdBy;
    @api modifiedBy;

    @api createdDate;
    @api modifiedDate;

    @api createdDateFinal;
    @api modifiedDateFinal;

    @api accountName;

    @api createdByWithDate;
    @api modifiedByWithDate;

    @track kidneyResourceServices;
    @track advocate4Me;
    @track phsProgram;
    @track smokingCessation;
    @track orthopedicSolutions;
    @track nurselineProgram;
    @track radiologyServices;
    @track cardiologyServices;
    @track sharedSavingsProgram;
    @track fundingArrangements;
    @track globalProducts; //#3958

    @track openModal = false;
    @track addnComments;

    @track cssDisplay = '';

    @api cpValue;
    @api isCpValueUmr;


    @wire(getObjectInfo, {
        objectApiName: CURRENT_PRODUCT
    })
    currentProductInfo;

    //---------------------------------------------------------SUMMARY---------------------------------------------------------
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: FundingArrangements
    })
    fundingArrangementsValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: GlobalProducts
    })
    globalProductValues;

    @track tieredBenefitsValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: TieredBenefits
    })
    getTieredBenefitsValues(result) {
        if (result.data) {
            this.tieredBenefitsValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track pharmacyValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: Pharmacy
    })
    getpharmacyValues(result) {
        if (result.data) {
            this.pharmacyValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track surestValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: Surest
    })
    getsurestValues(result) {
        if (result.data) {
            this.surestValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track dentalValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: Dental
    })
    getdentalValues(result) {
        if (result.data) {
            this.dentalValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track visionValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: Vision
    })
    getvisionValues(result) {
        if (result.data) {
            this.visionValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track supplementalHealthValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: SupplementalHealth
    })
    getsupplementalHealthValues(result) {
        if (result.data) {
            this.supplementalHealthValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track lifeValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: Life
    })
    getlifeValues(result) {
        if (result.data) {
            this.lifeValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track disabilityValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: Disability
    })
    getdisabilityValues(result) {
        if (result.data) {
            this.disabilityValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track paymentIntegrityValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: PaymentIntegrity
    })
    getPaymentIntegrityValues(result) {
        if (result.data) {
            this.paymentIntegrityValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track petInsuranceValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: PetInsurance
    })
    getPetInsuranceValues(result) {
        if (result.data) {
            this.petInsuranceValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track financialAccountsValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: FinancialAccounts
    })
    getfinancialAccountsValues(result) {
        if (result.data) {
            this.financialAccountsValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }


    @track careManagementValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: CareManagement
    })
    getcareManagementValues(result) {
        if (result.data) {
            this.careManagementValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track centersOfExcellenceValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: CentersOfExcellence
    })
    getcentersOfExcellenceValues(result) {
        if (result.data) {
            this.centersOfExcellenceValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track decisionSupportValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: DecisionSupport
    })
    getdecisionSupportValues(result) {
        if (result.data) {
            this.decisionSupportValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track diseaseManagementValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: DiseaseManagement
    })
    getdiseaseManagementValues(result) {
        if (result.data) {
            this.diseaseManagementValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track womensHealthValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: WomensHealth
    })
    getwomensHealthValues(result) {
        if (result.data) {
            this.womensHealthValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track worksiteWellnessValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: WorksiteWellness
    })
    getworksiteWellnessValues(result) {
        if (result.data) {
            this.worksiteWellnessValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track wellnessAndWellnessCoachingValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: WellnessAndWellnessCoaching
    })
    getwellnessAndWellnessCoachingValues(result) {
        if (result.data) {
            this.wellnessAndWellnessCoachingValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track rallyClientValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: RallyClient
    })
    getrallyClientValues(result) {
        if (result.data) {
            this.rallyClientValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track incentiveProductsValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: IncentiveProducts
    })
    getincentiveProductsValues(result) {
        if (result.data) {
            this.incentiveProductsValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track medicalNecessityValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: MedicalNecessity
    })
    getmedicalNecessityValues(result) {
        if (result.data) {
            this.medicalNecessityValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track behavioralHealthValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: BehavioralHealth
    })
    getbehavioralHealthValues(result) {
        if (result.data) {
            this.behavioralHealthValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track eapDomesticValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: EapDomestic
    })
    geteapDomesticValues(result) {
        if (result.data) {
            this.eapDomesticValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track eapGlobalValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: EapGlobal
    })
    geteapGlobalValues(result) {
        if (result.data) {
            this.eapGlobalValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track retireeProductsValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: RetireeProducts
    })
    getretireeProductsValues(result) {
        if (result.data) {
            this.retireeProductsValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    
    @track uhcHubValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: uhcHub
    })
    getuhcHubvalues(result) {
        if (result.data) {
            this.uhcHubValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    //---------------------------------------------------------SUMMARY---------------------------------------------------------


    //---------------------------------------------------------SUPPLEMENTAL HEALTH---------------------------------------------------------
    @track accidentProtectionValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: AccidentProtection
    })
    getaccidentProtectionValues(result) {
        if (result.data) {
            this.accidentProtectionValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track criticalIllnesValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: CriticalIllnes
    })
    getcriticalIllnesValues(result) {
        if (result.data) {
            this.criticalIllnesValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track hospitalIndemnityValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: HospitalIndemnity
    })
    gethospitalIndemnityValues(result) {
        if (result.data) {
            this.hospitalIndemnityValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }


    @track basicLifeValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: BasicLife
    })
    getbasicLifeValues(result) {
        if (result.data) {
            this.basicLifeValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track dependentLifeValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: DependentLife
    })
    getdependentLifeValues(result) {
        if (result.data) {
            this.dependentLifeValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track supplementalLifeValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: SupplementalLife
    })
    getsupplementalLifeValues(result) {
        if (result.data) {
            this.supplementalLifeValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track shortTermDisabilityValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: ShortTermDisability
    })
    getshortTermDisabilityValues(result) {
        if (result.data) {
            this.shortTermDisabilityValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track longTermDisabilityValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: LongTermDisability
    })
    getlongTermDisabilityValues(result) {
        if (result.data) {
            this.longTermDisabilityValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track absenceManagementValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: AbsenceManagement
    })
    getabsenceManagementValues(result) {
        if (result.data) {
            this.absenceManagementValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    //---------------------------------------------------------SUPPLEMENTAL HEALTH---------------------------------------------------------


    //---------------------------------------------------------FINANCIAL ACCOUNTS---------------------------------------------------------
    @track commuterExpenseReimbursementValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: CommuterExpenseReimbursement
    })
    getcommuterExpenseReimbursementValues(result) {
        if (result.data) {
            this.commuterExpenseReimbursementValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track flexibleSpendingAccountValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: FlexibleSpendingAccount
    })
    getflexibleSpendingAccountValues(result) {
        if (result.data) {
            this.flexibleSpendingAccountValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track healthIncentiveAccountValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: HealthIncentiveAccount
    })
    gethealthIncentiveAccountValues(result) {
        if (result.data) {
            this.healthIncentiveAccountValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }


    @track healthReimbursmentAccountValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: HealthReimbursmentAccount
    })
    gethealthReimbursmentAccountValues(result) {
        if (result.data) {
            this.healthReimbursmentAccountValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track healthSavingsAccountValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: HealthSavingsAccount
    })
    gethealthSavingsAccountValues(result) {
        if (result.data) {
            this.healthSavingsAccountValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track retireeReimbursmentAccountValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: RetireeReimbursmentAccount
    })
    getretireeReimbursmentAccountValues(result) {
        if (result.data) {
            this.retireeReimbursmentAccountValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    //---------------------------------------------------------FINANCIAL ACCOUNTS---------------------------------------------------------


    //---------------------------------------------------------CARE MANAGEMENT DETAILS---------------------------------------------------------
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: PersonalHealthSupportProgram
    })
    personalHealthSupportProgramValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: Advocate4Me
    })
    advocate4MeValues;

    @track complexCareValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: ComplexCare
    })
    getComplexCareValues(result) {
        if (result.data) {
            this.complexCareValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }
    //---------------------------------------------------------CARE MANAGEMENT DETAILS---------------------------------------------------------


    //-----------------------------------------------------CENTERS OF EXCELLENCE-----------------------------------------------------
    @track bariatricResourceServicesValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: BariatricResourceServices
    })
    getbariatricResourceServicesValues(result) {
        if (result.data) {
            this.bariatricResourceServicesValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track cancerResourceServicesValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: CancerResourceServices
    })
    getcancerResourceServicesValues(result) {
        if (result.data) {
            this.cancerResourceServicesValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track cancerSupportProgramValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: CancerSupportProgram
    })
    getcancerSupportProgramValues(result) {
        if (result.data) {
            this.cancerSupportProgramValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: KidneyResourceServices
    })
    kidneyResourceServicesValues;

    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: OrthopedicSolutions
    })
    orthopedicSolutionsValues;

    @track transplantResourceServicesValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: TransplantResourceServices
    })
    gettransplantResourceServicesValues(result) {
        if (result.data) {
            this.transplantResourceServicesValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }
    //-----------------------------------------------------CENTERS OF EXCELLENCE-----------------------------------------------------


    //-----------------------------------------------------DECISION SUPPORT-----------------------------------------------------
    @track BuoyValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: Buoy
    })
    getBuoyValues(result) {
        if (result.data) {
            this.BuoyValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track ErDecisionSupportValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: ErDecisionSupport
    })
    getErDecisionSupportValues(result) {
        if (result.data) {
            this.ErDecisionSupportValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: NurselineProgram
    })
    NurselineProgramValues;

    @track SecondOpinionServicesValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: SecondOpinionServices
    })
    getSecondOpinionServicesValues(result) {
        if (result.data) {
            this.SecondOpinionServicesValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track SurgicalManagementSolutionValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: SurgicalManagementSolution
    })
    getSurgicalManagementSolutionValues(result) {
        if (result.data) {
            this.SurgicalManagementSolutionValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    //-----------------------------------------------------DECISION SUPPORT-----------------------------------------------------


    //-----------------------------------------------------DECISION MANAGEMENT-----------------------------------------------------
    @track asthmaProgramValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: AsthmaProgram
    })
    getasthmaProgramValues(result) {
        if (result.data) {
            this.asthmaProgramValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track coronaryArteryDiseaseProgramValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: CoronaryArteryDiseaseProgram
    })
    getcoronaryArteryDiseaseProgramValues(result) {
        if (result.data) {
            this.coronaryArteryDiseaseProgramValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track heartFailureProgramValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: HeartFailureProgram
    })
    getheartFailureProgramValues(result) {
        if (result.data) {
            this.heartFailureProgramValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }


    @track diabetesProgramValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: DiabetesProgram
    })
    getdiabetesProgramValues(result) {
        if (result.data) {
            this.diabetesProgramValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track chronicObstructivePulmonaryDiseaseValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: ChronicObstructivePulmonaryDisease
    })
    getchronicObstructivePulmonaryDiseaseValues(result) {
        if (result.data) {
            this.chronicObstructivePulmonaryDiseaseValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }
     //Added by Vignesh
     @track UMROngoingConditionCAREValues;
     @wire(getPicklistValues, {
         recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
         fieldApiName: UMROngoingConditionCare
     })
     getUMROngoingConditionCAREValues(result) {
         if (result.data) {
             this.UMROngoingConditionCAREValues = [{
                 label: '--None--',
                 value: '',
                 selected: true
             }, ...result.data.values];
         } else if (result.error) {
             alert('ERROR');
         }
     }
 
     @track UMREmergingCAREValues;
     @wire(getPicklistValues, {
         recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
         fieldApiName: UMREmergingCare
     })
     getUMREmergingCAREValues(result) {
         if (result.data) {
             this.UMREmergingCAREValues = [{
                 label: '--None--',
                 value: '',
                 selected: true
             }, ...result.data.values];
         } else if (result.error) {
             alert('ERROR');
         }
     }
    //-----------------------------------------------------DECISION MANAGEMENT-----------------------------------------------------


    //------------------------------------------WOMENS HEALTH------------------------------------------
    @track fertilitySolutionsValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: FertilitySolutions
    })
    getfertilitySolutionsValues(result) {
        if (result.data) {
            this.fertilitySolutionsValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track neonatalResourceServicesValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: NeonatalResourceServices
    })
    getneonatalResourceServicesValues(result) {
        if (result.data) {
            this.neonatalResourceServicesValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }
     //Added by Vignesh
     @track MavenMaternityValues;
     @wire(getPicklistValues, {
         recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
         fieldApiName: MavenMaternity
     })
     getMavenMaternityValues(result) {
         if (result.data) {
             this.MavenMaternityValues = [{
                 label: '--None--',
                 value: '',
                 selected: true
             }, ...result.data.values];
         } else if (result.error) {
             alert('ERROR');
         }
     }
     
     @track UMRMaternityCAREValues;
     @wire(getPicklistValues, {
         recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
         fieldApiName: UMRMaternityCare
     })
     getUMRMaternityCAREValues(result) {
         if (result.data) {
             this.UMRMaternityCAREValues = [{
                 label: '--None--',
                 value: '',
                 selected: true
             }, ...result.data.values];
         } else if (result.error) {
             alert('ERROR');
         }
     }
 
     @track DoulaSupportprogramsValues;
     @wire(getPicklistValues, {
         recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
         fieldApiName: DoulaSupportPrograms
     })
     getDoulaSupportprogramsValues(result) {
         if (result.data) {
             this.DoulaSupportprogramsValues = [{
                 label: '--None--',
                 value: '',
                 selected: true
             }, ...result.data.values];
         } else if (result.error) {
             alert('ERROR');
         }
     }
    //------------------------------------------WOMENS HEALTH------------------------------------------

    // import AdultFluClinic from '@salesforce/schema/ProductMix__c.Adult_Flu_Clinic__c';
    // import BiometricScreening from '@salesforce/schema/ProductMix__c.Biometric_Screening__c';
    // import OnsiteFitness from '@salesforce/schema/ProductMix__c.Onsite_Fitness__c';
    // import OptumOnsite from '@salesforce/schema/ProductMix__c.Optum_Onsite_Health_Promotion_Specialist__c';

    //------------------------------------------WORKSITE WELLNESS------------------------------------------

    @track adultFluClinicValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: AdultFluClinic
    })
    getAdultFluClinicValues(result) {
        if (result.data) {
            this.adultFluClinicValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track biometricScreeningValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: BiometricScreening
    })
    getBiometricScreeningValues(result) {
        if (result.data) {
            this.biometricScreeningValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track onsiteFitnessValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: OnsiteFitness
    })
    getOnsiteFitnessValues(result) {
        if (result.data) {
            this.onsiteFitnessValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track optumOnsiteValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: OptumOnsite
    })
    getOptumOnsiteValues(result) {
        if (result.data) {
            this.optumOnsiteValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    //------------------------------------------WORKSITE WELLNESS------------------------------------------


    //------------------------------------------WELLNESS AND WELLNESS------------------------------------------
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: SmokingCessation
    })
    smokingCessationValues;

    @track realAppealValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: RealAppeal
    })
    getrealAppealValues(result) {
        if (result.data) {
            this.realAppealValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track strideValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: Stride
    })
    getStrideValuesValues(result) {
        if (result.data) {
            this.strideValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track uhcMotionValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: UhcMotion
    })
    getuhcMotionValues(result) {
        if (result.data) {
            this.uhcMotionValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track wellnessCoachingValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: WellnessCoaching
    })
    getwellnessCoachingValues(result) {
        if (result.data) {
            this.wellnessCoachingValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }
     //Added by Vignesh
     @track WellnessRallyValues;
     @wire(getPicklistValues, {
         recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
         fieldApiName: WellnessRally
     })
     getWellnessRallyValues(result) {
         if (result.data) {
             this.WellnessRallyValues = [{
                 label: '--None--',
                 value: '',
                 selected: true
             }, ...result.data.values];
         } else if (result.error) {
             alert('ERROR');
         }
     }
 
     @track UMRWellnessCAREValues;
     @wire(getPicklistValues, {
         recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
         fieldApiName: UMRWellnessCare
     })
     getUMRWellnessCAREValues(result) {
         if (result.data) {
             this.UMRWellnessCAREValues = [{
                 label: '--None--',
                 value: '',
                 selected: true
             }, ...result.data.values];
         } else if (result.error) {
             alert('ERROR');
         }
     }
    //------------------------------------------WELLNESS AND WELLNESS------------------------------------------

    //--------------------------------------------------------NETWORK DETAILS--------------------------------------------------------
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: SharedSavingsProgram
    })
    sharedSavingsProgramValues;
    //--------------------------------------------------------NETWORK DETAILS--------------------------------------------------------

    //--------------------------------------------------------MEDICAL NECESSITY--------------------------------------------------------
    @track siteOfServiceOutPatientValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: SiteOfServiceOutPatient
    })
    getsiteOfServiceOutPatientValues(result) {
        if (result.data) {
            this.siteOfServiceOutPatientValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track siteOfServiceValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: SiteOfService
    })
    getsiteOfServiceValues(result) {
        if (result.data) {
            this.siteOfServiceValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track arthroscopyValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: Arthroscopy
    })
    getarthroscopyValues(result) {
        if (result.data) {
            this.arthroscopyValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track footSurgeryValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: FootSurgery
    })
    getfootSurgeryValues(result) {
        if (result.data) {
            this.footSurgeryValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track infertilityValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: Infertility
    })
    getinfertilityValues(result) {
        if (result.data) {
            this.infertilityValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }


    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: Radiology
    })
    radiologyValues;

    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: Cardiology
    })
    cardiologyValues;

    @track cancerGuidanceValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: CancerGuidance
    })
    getCancerGuidanceValuesValues(result) {
        if (result.data) {
            this.cancerGuidanceValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }
    //--------------------------------------------------------MEDICAL NECESSITY--------------------------------------------------------

    //--------------------------------------------------------OTHER PRODUCTS--------------------------------------------------------
    @track ecrsClientValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: EcrsClient
    })
    getecrsClientValues(result) {
        if (result.data) {
            this.ecrsClientValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track ecrsTypeValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: EcrsType
    })
    getecrsTypeValues(result) {
        if (result.data) {
            this.ecrsTypeValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track engagementSolutionsClientValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: EngagementSolutionsClient
    })
    getengagementSolutionsClientValues(result) {
        if (result.data) {
            this.engagementSolutionsClientValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track engagementSolutionsTierValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: EngagementSolutionsTier
    })
    getengagementSolutionsTierValues(result) {
        if (result.data) {
            this.engagementSolutionsTierValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track uhcCobraAdministrationValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: UhcCobraAdministration
    })
    getuhcCobraAdministrationValues(result) {
        if (result.data) {
            this.uhcCobraAdministrationValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track stopLossValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: StopLoss
    })
    getstopLossValues(result) {
        if (result.data) {
            this.stopLossValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }
    //--------------------------------------------------------OTHER PRODUCTS--------------------------------------------------------

    //------------------------------------------------------ADDITIONAL DETAILS------------------------------------------------------
    @track uhcUmrTelehealthValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: UhcUmrTelehealth
    })
    getuhcUmrTelehealthValues(result) {
        if (result.data) {
            this.uhcUmrTelehealthValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    //Added CR - 3847
    @track memberServiceVendor;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: MemberServiceVendor
    })
    getMemberServiceVendorValues(result) {
        if (result.data) {
            this.memberServiceVendor = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }

    @track uhcUmrMemberServiceValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: UhcUmrMemberService
    })
    getuhcUmrMemberServiceValues(result) {
        if (result.data) {
            this.uhcUmrMemberServiceValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }


    @track umrCobraValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: UmrCobra
    })
    getumrCobraValues(result) {
        if (result.data) {
            this.umrCobraValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }
    //------------------------------------------------------ADDITIONAL DETAILS------------------------------------------------------

    //------------------------------------------------------RECORD INFORMATION------------------------------------------------------
    @track careMgmtDecisionSupprtValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: CareMgmtDecisionSupprt
    })
    getcareMgmtDecisionSupprtValues(result) {
        if (result.data) {
            this.careMgmtDecisionSupprtValues = [{
                label: '--None--',
                value: '',
                selected: true
            }, ...result.data.values];
        } else if (result.error) {
            alert('ERROR');
        }
    }
    //------------------------------------------------------RECORD INFORMATION------------------------------------------------------

    //------------------------------------------------------SYSTEM INFORMATION------------------------------------------------------
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: CurrentProductName
    })
    currentProductNameValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: CreatedBy
    })
    createdByValues;

    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: Name
    })
    nameValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: Company
    })
    companyValues;
    @wire(getPicklistValues, {
        recordTypeId: '$currentProductInfo.data.defaultRecordTypeId',
        fieldApiName: LastModifiedBy
    })
    lastModifiedByValues;
    //------------------------------------------------------SYSTEM INFORMATION------------------------------------------------------
    @api isMedNesTrue;
    @api isSupplHealthTrue;
    @api isLifeTrue;
    @api isDisabilityTrue;
    @api isFinAccTrue;
    @api isCareMgmtTrue;
    @api isCmplxCondtnTrue;
    @api isDescnSupprtTrue;
    @api isDiseaseMgmtTrue;
    @api isWomensHealthTrue;
    @api isWandWTrue;
    @api isWorksiteWellnessTrue;

    connectedCallback() {
        
        this.cssDisplay = '';
        //this.sectionNames.push('SUMMARY INFORMATION - MEDICAL \\ RX \\ SPECIALTY BENEFITS \\ RETIREE:', 'SUMMARY INFORMATION - OPTUM PRODUCTS:');
        //this.activeSections = this.sectionNames;
        this.getCurrentProductRecord();
        this.getCurrentUserId();
        this.isEditDisabled = false;
        this.isSaveCancelDisabled = true;
        this.getCpValue();

        // loadScript(this, autoSize) //+ '/autoSize.js'
        // .then(() => {
        //     alert('External Library loaded');
        //     autosize(document.getElementById("note"));
        // })
        // .catch(error => {
        //     console.log('error loading external library --> ' + JSON.stringify(error));
        // });
    }

    navigateToObjectHome() {
        // Navigate to the Account record page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'Account',
                actionName: 'view',
            },
        });
    }

    recordPageUrl;

    getCurrentUserId() {
        getCurrentProfile({})
            .then(result => {
                if (result !== null && result !== undefined) {
                    this.currentProfileName = result;

                    if (this.currentProfileName === 'System Administrator') {
                        this.isSystemAdmin = true;
                    } else {
                        this.isSystemAdmin = false;
                    }
                } else {

                }
            })
            .catch(error => {
                console.log('error profile --> ' + JSON.stringify(error));
            });
    }

    getCpValue() {
        getClientPlatformValue({ RecordId: this.recordId })
            .then(result => {
                console.log('cpValue result ' + JSON.stringify(result));
                this.cpValue = JSON.stringify(result);
                if (this.cpValue.includes('UMR')) {
                    this.isCpValueUmr = true;
                }
                else {
                    this.isCpValueUmr = false;
                }
            })
            .catch(error => {
                console.log('error --> ' + JSON.stringify(error));
                this.cssDisplay = 'hidemodel';
            });
    }

    getCurrentProductRecord() {
        currentProductRecordFromApex({
            RecordId: this.recordId
        })
            .then(result => {
                if (result !== null && result !== undefined) {
                    this.activeSections = ['SUMMARY INFORMATION - MEDICAL \\ RX \\ SPECIALTY BENEFITS \\ RETIREE:', 'SUMMARY INFORMATION - OPTUM PRODUCTS:'];

                    this.ProductMix__c = result;
                    if (result.Financial_Accounts__c == 'Yes') {
                        this.activeSections.push('DETAILS - FINANCIAL ACCOUNTS (from Merit Renewal Details):');
                        this.isFinAccTrue = true;
                    }
                    else {
                        this.isFinAccTrue = false;
                    }


                    if (result.Care_Management__c == 'Yes') {
                        this.activeSections.push('DETAILS - CARE MANAGEMENT (from BTB System and Merit sales data):');
                        this.isCareMgmtTrue = true;
                    }
                    else {
                        this.isCareMgmtTrue = false;
                    }


                    if (result.Centers_of_Excellence__c == 'Yes') {
                        this.activeSections.push('DETAILS - COMPLEX CONDITIONS (CENTERS OF EXCELLENCE) (from BTB System):');
                        this.isCmplxCondtnTrue = true;
                    }
                    else {
                        this.isCmplxCondtnTrue = false;
                    }


                    if (result.Decision_Support__c == 'Yes') {
                        this.activeSections.push('DETAILS - DECISION SUPPORT (from BTB System and Merit sales data):');
                        this.isDescnSupprtTrue = true;
                    }
                    else {
                        this.isDescnSupprtTrue = false;
                    }


                    if (result.Disease_Management__c == 'Yes') {
                        this.activeSections.push('DETAILS - DISEASE MANAGEMENT (from BTB System):');
                        this.isDiseaseMgmtTrue = true;
                    }
                    else {
                        this.isDiseaseMgmtTrue = false;
                    }


                    if (result.Women_s_Health__c == 'Yes') {
                        this.activeSections.push("DETAILS - WOMEN'S HEALTH (from BTB System):");
                        this.isWomensHealthTrue = true;
                    }
                    else {
                        this.isWomensHealthTrue = false;
                    }

                    if (result.Worksite_Wellness__c == 'Yes') {
                        this.activeSections.push("DETAILS - WORKSITE WELLNESS (from Merit sales data):");
                        this.isWorksiteWellnessTrue = true;
                    }
                    else {
                        this.isWorksiteWellnessTrue = false;
                    }

                    if (result.Wellness_and_Wellness_Coaching__c == 'Yes') {
                        this.activeSections.push('DETAILS - WELLNESS AND WELLNESS COACHING (from BTB System and Merit sales data):');
                        this.isWandWTrue = true;
                    }
                    else {
                        this.isWandWTrue = false;
                    }


                    if (result.Medical_Necessity__c == 'Yes') {
                        this.activeSections.push('DETAILS - MEDICAL NECESSITY ADD ON PROGRAMS (from BTB System):');
                        this.isMedNesTrue = true;
                    }
                    else {
                        this.isMedNesTrue = false;
                    }


                    if (result.Supplemental_Health__c == 'Yes') {
                        this.activeSections.push('DETAILS - SUPPLEMENTAL HEALTH, LIFE AND DISABILITY (from Specialty Benefits):');
                        this.isSupplHealthTrue = true;
                    }
                    else {
                        this.isSupplHealthTrue = false;
                    }


                    if (result.Life__c == 'Yes') {
                        this.activeSections.push('DETAILS - SUPPLEMENTAL HEALTH, LIFE AND DISABILITY (from Specialty Benefits):');
                        this.isLifeTrue = true;
                    }
                    else {
                        this.isLifeTrue = false;
                    }


                    if (result.Disability__c == 'Yes') {
                        this.activeSections.push('DETAILS - SUPPLEMENTAL HEALTH, LIFE AND DISABILITY (from Specialty Benefits):');
                        this.isDisabilityTrue = true;
                    }
                    else {
                        this.isDisabilityTrue = false;
                    }

                    this.cpList = Object.assign({}, this.ProductMix__c);
                    this.isCurrentProductEmpty = false;

                    this.createdBy = result.CreatedBy.Name;
                    this.modifiedBy = result.LastModifiedBy.Name;
                    this.accountName = result.AccountFirm__r.Name;

                    //createdByWithDate modifiedByWithDate
                    const options = {
                        year: 'numeric', month: 'numeric', day: 'numeric',
                        hour: 'numeric', minute: 'numeric',
                        hour12: true,
                        timeZone: 'America/New_York'
                    };

                    let cd = new Date(result.CreatedDate);
                    this.createdDate = new Intl.DateTimeFormat('en-US', options).format(cd);
                    this.createdDateFinal = this.createdDate.replace(',', '');

                    let md = new Date(result.LastModifiedDate);
                    this.modifiedDate = new Intl.DateTimeFormat('en-US', options).format(md);
                    this.modifiedDateFinal = this.modifiedDate.replace(',', '');

                    this.createdByWithDate = this.createdBy + ', ' + this.createdDateFinal;
                    this.modifiedByWithDate = this.modifiedBy + ', ' + this.modifiedDateFinal;


                    if (result.Kidney_Resource_Services__c !== null && result.Kidney_Resource_Services__c !== undefined) {
                        this.kidneyResourceServices = result.Kidney_Resource_Services__c.split(';');
                    } else {
                        this.kidneyResourceServices = '';
                    }

                    if (result.Advocate4Me__c !== null && result.Advocate4Me__c !== undefined) {
                        this.advocate4Me = result.Advocate4Me__c.split(';');
                    } else {
                        this.advocate4Me = '';
                    }

                    if (result.Personal_Health_Support_PHS_Program__c !== null && result.Personal_Health_Support_PHS_Program__c !== undefined) {
                        this.phsProgram = result.Personal_Health_Support_PHS_Program__c.split(';');
                    } else {
                        this.phsProgram = '';
                    }

                    if (result.Smoking_Cessation__c !== null && result.Smoking_Cessation__c !== undefined) {
                        this.smokingCessation = result.Smoking_Cessation__c.split(';');
                    } else {
                        this.smokingCessation = '';
                    }

                    if (result.Orthopedic_Solutions__c !== null && result.Orthopedic_Solutions__c !== undefined) {
                        this.orthopedicSolutions = result.Orthopedic_Solutions__c.split(';');
                    } else {
                        this.orthopedicSolutions = '';
                    }

                    if (result.Nurseline_Program__c !== null && result.Nurseline_Program__c !== undefined) {
                        this.nurselineProgram = result.Nurseline_Program__c.split(';');
                    } else {
                        this.nurselineProgram = '';
                    }

                    if (result.Radiology_Services__c !== null && result.Radiology_Services__c !== undefined) {
                        this.radiologyServices = result.Radiology_Services__c.split(';');
                    } else {
                        this.radiologyServices = '';
                    }

                    if (result.Cardiology_Services__c !== null && result.Cardiology_Services__c !== undefined) {
                        this.cardiologyServices = result.Cardiology_Services__c.split(';');
                    } else {
                        this.cardiologyServices = '';
                    }

                    if (result.Shared_Savings_Program_Facility_R_C__c !== null && result.Shared_Savings_Program_Facility_R_C__c !== undefined) {
                        this.sharedSavingsProgram = result.Shared_Savings_Program_Facility_R_C__c.split(';');
                    } else {
                        this.sharedSavingsProgram = '';
                    }

                    if (result.Funding_Arrangements__c !== null && result.Funding_Arrangements__c !== undefined) {
                        this.fundingArrangements = result.Funding_Arrangements__c.split(';');
                    } else {
                        this.fundingArrangements = '';
                    }
                    ///-----#3958---------
                     if (result.Global_Products__c !== null && result.Global_Products__c !== undefined) {
                        this.globalProducts = result.Global_Products__c.split(';');
                    } else {
                        this.globalProducts = '';
                    }
                    ///-----#3958---------


                } else {
                    this.isCurrentProductEmpty = true;
                }
                this.cssDisplay = 'hidemodel';
            })
            .catch(error => {
                console.log('error --> ' + JSON.stringify(error));
                this.cssDisplay = 'hidemodel';
            });
    }

    handleEdit() {
        this.isEditDisabled = true;
        this.isSaveCancelDisabled = false;
    }

    handleSave() {
        this.cssDisplay = '';
        this.isEditDisabled = false;
        this.isSaveCancelDisabled = true;
        this.saveCurrentProductRecords();
    }

    handleCancel() {
        this.isEditDisabled = false;
        this.isSaveCancelDisabled = true;
        this.ProductMix__c = Object.assign({}, this.cpList);
    }

    handleInputChange(event) {
        this.ProductMix__c[event.target.dataset.id] = event.target.value;
    }

    saveCurrentProductRecords() {
        saveRecords({
            ProductMix: this.ProductMix__c
        })
            .then(result => {
                this.getCurrentProductRecord();
            })
            .catch(error => {
                console.log('error --> ' + JSON.stringify(error));
            });
    }

    showModal() {
        this.openModal = true;
    }
    closeModal() {
        this.addnComments = '';
        this.openModal = false;
    }

    onChangeAddnComments(event) {
        this.addnComments = event.target.value;
    }

    sendMail() {
        if (this.addnComments === null || this.addnComments === undefined || this.addnComments === '') {
            console.log('Inside main if');
            const evt = new ShowToastEvent({
                title: 'Error',
                message: 'Cannot send an empty message',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        } else {
            console.log('Inside main else');
            var trimmedString = this.addnComments.trim();
            console.log('trimmedString ' + trimmedString);
            console.log('trimmedString length ' + trimmedString.length);

            var str1 = this.addnComments.replace('<p>', '');
            var str2 = str1.replace('</p>', '');
            var str3 = str2.replace('<br/>', '');
            var str4 = str3.trim();

            if (str4.length === 0) {
                console.log('Inside inner if');
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message: 'Cannot send an empty message',
                    variant: 'error',
                });
                this.dispatchEvent(evt);
            }
            else {
                console.log('Inside inner else');
                this.addnComments = this.addnComments.replace(/\n/g,'<br/>\n');
                additionalComments({
                    comments: this.addnComments, RecordId: this.recordId
                })
                    .then(result => {
                        this.addnComments = '';

                        const evt = new ShowToastEvent({
                            title: 'Success',
                            message: 'Mail has been sent successfully',
                            variant: 'success',
                        });
                        this.dispatchEvent(evt);

                        this.closeModal();
                    })
                    .catch(error => {
                        console.log('Error addn comments ' + JSON.stringify(error));
                    });
            }
        }
    }

    handleHyperlinkClick(event) {
        let targetId = event.target.dataset.targetId;
        let target = this.template.querySelector(`[data-id="${targetId}"]`);
        target.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "start"
        });
        //this.activeSections =[];
        this.activeSections.push(target.Name);

        // console.log('Section Names '+this.sectionNames);
        // //this.activeSections = this.sectionNames;
        // console.log('Active Sections '+this.activeSections);
        // //this.activeSections = ['SUMMARY INFORMATION - MEDICAL \\ RX \\ SPECIALTY BENEFITS \\ RETIREE:', 'SUMMARY INFORMATION - OPTUM PRODUCTS:', 'OTHER PRODUCTS AND SERVICES (from various sources)',target.name];
        // //console.log('Active Sections '+this.activeSections);
        // //this.activeSections = [target.name];
    }

    renderedCallback() {
        if (this.hasRendered) return;
        this.hasRendered = true;
    
        const style = document.createElement('style');
        style.innerText = `
         .AdditionalComments textarea{
            height:110px;
          }
        `;
        this.template.querySelector('.cssElement').appendChild(style);
      }
}