import { LightningElement, api, wire, track } from 'lwc';
import csRecordsApex from '@salesforce/apex/ClientStrategyController.getQuestionsAndAnswers';
import saveClientStrategyData from '@salesforce/apex/ClientStrategyController.saveClientStrategyData';
import getMedicalMemberCount from '@salesforce/apex/ClientStrategyController.getMedicalMemberCount';
import markComplete from '@salesforce/apex/ClientStrategyController.markCompleteChecked';
import markAsComplete from '@salesforce/apex/ClientStrategyController.markAsComplete';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ClientStrategyAlertNotAccess from '@salesforce/label/c.Client_Strategy_Alert_Message_for_Not_Having_Access';
import ClientStrategyCompletedMsg from '@salesforce/label/c.Client_Strategy_Completed_Pop_Message';
import ClientStrategyInstructionText from '@salesforce/label/c.Client_Strategy_Instruction_Text';
import LightningConfirm from 'lightning/confirm';
import LightningAlert from 'lightning/alert';
import isEditAllowed from '@salesforce/apex/ClientStrategyController.isEditAllowed';
import hasEditAccess from '@salesforce/apex/ClientStrategyController.hasEditAccess';
import getTimeFrames from '@salesforce/apex/ClientStrategyController.getTimeFrames';
import TIME_ZONE from '@salesforce/i18n/timeZone';


export default class ClientStrategyMainComp extends LightningElement {

  userTimeZone = TIME_ZONE;
  isLoad = true;
  isEditMode = false;
  showClientStrategy = true;
  displayAlternateSection = true;
  dataFromApex;
  labelVsApiMap;
  printDataList;
  importantfeatureCompWriteIn;
  importantfeatureCompValue = '';
  importantfeatureCompwriteInValue = '';
  glp1ObesityCompValue = '';
  glp1ObesityCompWriteIn;
  glp1ObesityCompwriteInValue = '';
  openKitCompValue = '';
  openKitCompWriteIn;
  openKitCompwriteInValue = '';
  wellnessProgOfferCompValue = '';
  wellnessProgOfferCompWriteIn;
  wellnessProgOfferwriteInValue = '';
  valueStorySuppCompValue = '';
  valueStorySuppCompWriteIn;
  valueStorySuppwriteInValue = '';
  doesntuhcOptumCompValue = '';  //22/09
  doesntuhcOptumCompWriteIn;
  doesntuhcOptumwriteInValue = '';
  cssquestionclass='question-name';
  @track canEdit = false;
  @track editAllowed = false;
  @track isCompleted = false;
  @track questionAndAnswerData;
  @track questionAndAnswerRecords;
  @api recordId;
  @track dateOptions = [];
  @track isUserAuthorized = false;
  @track error;
  @track unansweredQuestions = [];
  @track status;
  @track timestamp;           
  @track completionDateTime;
  @track compValueSet = [];

    @track showModal = false;
    @track modalTitle = '';
    @track modalMessage = '';
    @track modalConfirmLabel = 'Confirm';
    @track modalShowCancel = false;
    modalType;


  label = {ClientStrategyAlertNotAccess};
  label1 = {ClientStrategyCompletedMsg};
  label2 = {ClientStrategyInstructionText};
  valueFactorFullLabelMap = {
        "Affordability programs": "Affordability programs (e.g., payment integrity; site of service steerage; out-of-network management; medical necessity).", "Behavioral health programs": "Behavioral health programs", "Client experience and support": "Client experience and support",
        "Clinical management programs": "Clinical management programs", "Data analysis and reporting": "Data, analysis and reporting", "Fees and credits": "Fees and credits", "Guarantees": "Guarantees", "Integration across programs": "Integration across programs (e.g., pharmacy, behavioral health, dental, vision).",
        "Member experience and engagement": "Member experience and engagement (e.g., advocacy, digital tools, communications).", "Network design": "Network design", "Network discounts": "Network discounts", "Pharmacy programs": "Pharmacy programs", "Plan design": "Plan design", "Wellness programs": "Wellness programs",
        "Network Access": "Network Access", "Brand Image": "Brand Image", "Innovation": "Innovation", "Product breadth": "Product breadth (dental, vision, sup health, financial accounts, retiree, etc.).", "Administrative capabilities": "Administrative capabilities (claims processing, eligibility, enrollment).",
        "ESG Issues": "UHG’s focus on Environmental, Social, and Governance (ESG) issues (e.g., health equity, DE&I, data privacy/security, environmental impact on health).", "CDHP full replacement":"CDHP full replacement - offer as the only plan design option to 75% or more of population.","Voluntary benefits":"Voluntary benefits - expand array of employee-paid benefit offerings.",
        "Value-based benefits":" Value-based benefits - build incentives into the plan design by offering lower cost-sharing or premiums for employees who take specific health-related actions (e.g., use COEs, use telehealth, adhere to chronic condition treatment plan).",
        "Quality/Cost tiering":"Quality/Cost tiering - offer plan with tiering by provider quality and/or cost (e.g., Premium providers).","POS tiering":"POS tiering - offer plan with tiering by place of service (e.g., freestanding outpatient facilities vs. hospital-based).",
        "Reference-based pricing":"Reference-based pricing - add to plan designs to set cap on amount covered for certain services that have wide price variations, after which employee pays all.","Intermittent workforce":"Intermittent workforce - offer health benefit plans designed specifically for part-time and gig economy workers.",
        "Employee affordability":"Employee affordability - offer lower cost plan designs and/or reduce employee cost-sharing to improve employee health plan affordability (e.g., reduce employee share of premiums, deductibles, out-of-pocket maximums).","Co-Pay insurance":"Co-Pay plan - offer employees co-pay insurance options (e.g., Surest).",
        "ICHRA plan":"ICHRA plan (Individual Coverage Health Reimbursement Arrangement) - employer provides employees with tax-free funds to purchase their own individual health insurance plans.",
        "Virtual First Solution":"Virtual First Solution - use network designs in which virtual PCPs lead patient care coordination in virtual care settings (e.g., Virtual First).","Traditional PCP Coordinated Care":"Traditional PCP Coordinated Care - use network designs in which PCPs lead patient care coordination in traditional care settings.",
        "Site of Care Steerage":"Site of Care Steerage - use network design to steer employees to more cost-effective sites of care, freestanding non-hospital settings - labs, radiology centers, surgery centers, onsite clinics.","Direct Contracting with a Provider":"Direct Contracting with a Provider or Quality Vendor - contract directly with a provider or vendor like Garner or Embold.",
        "Advanced Primary Care Strategy":"Advanced Primary Care (APC) Strategy - adopt a care model which enables providers to offer comprehensive management of whole-person needs, inclusive of behavioral health, SDOH, etc., offered through primary care at on-site/near-site health centers or through direct contract primary care models in a select market.",
        "Streamlined Narrow Networks":"Narrow Networks in Certain Markets","ACO Centric Networks":"ACO Centric Networks","Prioritized Access":"Prioritized Access - requires prioritized, employer specific access to appointments at specific providers or health systems.",
        "Healthy workplace":"Healthy workplace - offer onsite fitness centers, walking trails, healthy environment, healthy food, etc.","On-site / near site clinics":"On-site / near site clinics - offer health clinic(s) located within or near the worksite.","Onsite health specialist":"Onsite health specialist - onsite resource who provides coaching, wellness information, condition management, benefits advocacy, etc.",
        "Cancer Screening and Support Programs":"Cancer Screening and Support Programs - promote prevention and early detection, case management, and/or Centers of Excellence to ensure high-quality care, and other types of support such as caregiver resources and workplace programs.","Medication-assisted weight loss":"Weight Management Programs - offer weight loss program that combines medication therapy, with counseling and nutrition support.",
        "Women’s health solutions":"Women’s health solutions - offer adolescence, infertility, maternity, menopause solutions.","Concierge advocacy":"Concierge/advocacy - invest in higher-level advocacy solutions to improve the employee experience and increase overall engagement.","Tools/technologies":"Tools/technologies - use apps, websites, tools and other technologies to improve employee health and engagement.",
        "Engagement Platform Adoption":"Engagement Platform Adoption - use websites/apps to centralize all health and well-being resources into a single hub in a more personalized and relevant way.", "Digital condition mgmt":"Digital condition mgmt - provide employees with wearables or other digital therapeutic devices that manage chronic conditions.",
        "Diversity, equity, and inclusion":"Diversity, equity, and inclusion - take formal action to create an inclusive work environment (e.g., employee resource groups in place, training, pronouns in signature blocks, etc.).","LGBTQ+ support":"LGBTQ+ support - offer LGBTQ+ inclusive benefit design, personalized support, and clinical solutions (e.g., gender affirming care, transition support and advocacy, access to affirming providers, etc.).",
        "Social Determinants of Health":"Social Determinants of Health - invest in formal solutions to support employees who face disruption to or lack of transportation, food, housing, etc.","Health Equity":"Health Equity - offer inclusive benefit designs and clinical solutions that drive differentiated health outcomes in diverse populations (e.g., expand benefits to cover all types of families, access to specific solutions for communities, etc.).",
        "Preventive drug lists":"Preventive drug lists - offer preventive drug list (e.g., $0 drugs in chronic disease states).","Prescription savings outreach":"Prescription savings outreach - communicate prescription savings with employees via letter, email or text.","Point of Sale Rebates":"Point of Sale Rebates - share rebate value with members on their rebate eligible claims.",
        "Critical affordability drug lists":"Critical affordability drug lists - include critical classes like asthma recue inhalers, EpiPens, insulin, etc. in critical affordability drug list.","Cash price into member benefit":"Integration of cash price into member benefit (lowest of 4) - implement program to include cash price.",
        "Affordability solutions":"Affordability solutions - offer pharmacy affordability solutions like manufacturer copay card programs and patient assistance programs.", "Stop loss cover for high-cost therapy":"Stop loss coverage for high-cost therapies - add stop loss coverage protection for high cost drugs like gene and cell therapies.",
        "Transparent non-traditional PBM":"Transparent PBM - use non-traditional PBM that focuses on increased transparency in contracting and reduced reliance on rebates in drug purchasing and formulary decisions.","Biosimilar steerage":"Biosimilar steerage - promote the use of biosimilars through various initiatives (e.g., formulary preference, adjust PBM contracts, employee education, lower tier).",
        "Specialty Pharmacy – carve out":"Specialty Pharmacy - carve out specialty pharmacy for drugs that run through the health plan.",
        "Integrated plan administration":"Integrated plan administration - simplify the employee experience by integrating pharmacy plan administration (contract, eligibility, billing, banking, account team, SPD/SBC production etc.).", "Member experience integration":"Member experience - simplify the employee experience by offering an integrated customer service/advocacy, integrated ID card, integrated web/mobile experience, etc.",
        "Member savings opportunities":"Member Savings Opportunities - drive affordability for members through proactive outreach from advocates and digital communications.","Integrated benefits provider":"Integrated benefits provider - simplify employee experience by integrating medical with other benefits like prescription benefits, behavioral health and banking.",
        "Integrated Med/Pharmacy digital":"Integrated Medical/Pharmacy digital experience - offer employees an integrated medical and pharmacy digital experience.","Electronic prescribing integration":"Electronic prescribing integration - integrate pharmacy member cost and clinical requirements to educate providers.","Integrated specialty management":"Integrated specialty management across medical/pharmacy - integrate specialty management across medical and pharmacy.",
        "Specialty pharmacy network solution":"Exclusive specialty pharmacy network solution - offer exclusive specialty pharmacy network solution.",
        "Cardiac COE":"Cardiac COE - offer Center of Excellence for cardiovascular care.","Fertility Family Forming COE":"Fertility / Family Forming COE - offer Center of Excellence for infertility care.","Neonatal COE":"Neonatal COE - offer Center of Excellence for neonatal conditions.","Kidney COE":"Kidney COE - offer Center of Excellence for chronic kidney disease.",
        "Musculoskeletal Spine & Joint COE":"Musculoskeletal/Spine & Joint COE - offer Center of Excellence for musculoskeletal/spine and joints.","Maternity COE":"Maternity COE - offer Center of Excellence for maternity care.","Mental Health/Substance Disorder":"Mental Health/Substance Use Disorder COE - offer Center of Excellence for mental health/substance use disorder.",
        "Transgender Health COE":"Transgender Health COE - offer Center of Excellence for transgender health.", "Cancer COE":"Cancer COE - offer Center of Excellence for cancer treatment.","Bariatric COE":"Bariatric COE - offer Center of Excellence for bariatric surgery.","Weight Management COE":"Weight Management COE - offer Center of Excellence for weight management (other than bariatric surgery).",
        "EAP Modernization":"EAP Modernization - convert traditional EAP into a more innovative, on-demand behavioral well-being, coaching and talk therapy, etc.","Family Special Needs":"Family Special Needs - offer education, navigation, support to parents of children with special needs.","Peer Support":"Peer Support - enlist, train and deploy employees who have personally experienced severe mental illness and/or substance use to be a resource for employees.",
        "Online tools–apps,videos,webinars":"Online tools - apps, videos, webinars.","Virtual coaching,counseling,therapy":"Virtual coaching, counseling, therapy.","Onsite coaching,counseling,therapy":"Onsite coaching, counseling, therapy.","Burnout,stress management programs":"Burnout, stress management programs.","Pediatric focused mental health sup":"Pediatric-focused mental health support for youth and families.",
        "Behavioral Health Engagement":"Behavioral Health Engagement - has strategies in place to drive behavioral health engagement.",
        "Linkage to business measures":"Linkage to business measures - formally link health benefits performance to business measures such as productivity, absenteeism, profitability.","Data warehouse":"Data warehouse - manage their own health care data warehouse and advanced analytics to drive health strategies and decisions.","SDOH and health equity":"Social Determinants of Health Data - utilize data related to SDOH and health equity to identify health inequities in their population.",
        "Population health management report":"Population health management reporting - involve the HR department in formally in tracking and reporting of employee health and safety management.",
        "Biometric Screenings":"Biometric Screenings","Health Risk Assessment":"Health Risk Assessment","Cancer Screenings":"Cancer Screenings","Tobacco Cessation Programs":"Tobacco Cessation Programs","Physical activity challenges":"Physical activity challenges","Weight management programs":"Weight management programs",
        "Wellness / Lifestyle Coaching":"Wellness / Lifestyle Coaching (Digital or telephonic)","Sleep Management Programs":"Sleep Management Programs","Other wellness incentives":"If incentives are offered for other programs or activities not listed in the chart above, please specify what those programs or activities are."
    };

  //on load function
  connectedCallback() {
        this.getClientStrategyRecords();
        this.updateDateOptions();
        this.checkMemberEligibility();

        hasEditAccess({ companyId: this.recordId })
            .then(result => {
                this.canEdit = result;
                console.log('CanEdit',JSON.stringify(this.canEdit));
            })
            .catch(error => {
               // console.error('Error checking edit access:', error);
                this.canEdit = false;
            });
  }
  
  //Edit Access allow
  @wire(isEditAllowed)
    wiredEditAllowed({ error, data }) {
        if (data !== undefined) {
            this.editAllowed = data;  // true/false from Apex
        } else if (error) {
          //  console.error('Error fetching edit window:', error);
            this.editAllowed = false;
        }
    }

    //Give access only if uhc total, private exchange, surest direct account for client strategy 
    checkMemberEligibility() {
        getMedicalMemberCount({ recordId: this.recordId })
            .then(result => {
                this.memberCount = result.memberCount;
                const override = result.override;
                const accountType = result.accountType;
                const isExcluded = accountType === 'Private Exchange' || accountType === 'Surest Only';

                if (override) {
                    this.isUserAuthorized = true; 
                } else if (!isExcluded && this.memberCount >= 1500) {
                  //  else if (this.memberCount >= 1500) {
                    this.isUserAuthorized = true;
                } 
                else {
                    this.isUserAuthorized = false;
                }
                this.showClientStrategy = this.isUserAuthorized;
                this.isLoad = false;
            })
            .catch(error => {
              //  console.error('Error fetching member count', error);
                this.isLoad = false;
                this.isUserAuthorized = false;
            });
    }

  //get the all question and answer and display in ui
  getClientStrategyRecords() {
    csRecordsApex({ accRecordId: this.recordId }) 
       .then(result => {
            this.isLoad = false;
            this.printDataList = [];
            this.dataFromApex = result[0];
          //  console.log('dataFromApex>>',JSON.stringify(this.dataFromApex));
            this.questionAndAnswerData = this.dataFromApex.sdConfigList;
          //  console.log('questionandanseromApex>>',JSON.stringify(this.questionAndAnswerData));
            this.questionAndAnswerRecords = (!this.dataFromApex.csDataList[0]) ? {} : this.dataFromApex.csDataList[0];
            this.labelVsApiMap = this.dataFromApex.labelVsApiMap;
            this.status = this.questionAndAnswerRecords.Status__c;
          /*  if (this.questionAndAnswerRecords.Completion_Date_Time__c) {
            const dt = new Date(this.questionAndAnswerRecords.Completion_Date_Time__c);

            this.timestamp = new Intl.DateTimeFormat('en-US', {year: 'numeric',
               month: 'numeric',day: 'numeric',hour: '2-digit',minute: '2-digit',hour12: true, timeZone: 'UTC'}).format(dt);
            } else {
                this.timestamp = '';
            } */


            if (this.questionAndAnswerRecords.Completion_Date_Time__c) {
                this.completionDateTime = this.questionAndAnswerRecords.Completion_Date_Time__c;
            } else {
                this.completionDateTime = null;
            }


            if (this.questionAndAnswerRecords.Status__c !== 'Completed') {
                this.isCompleted = false; // form not completed → show buttons
            } else {
                this.isCompleted = true;  // form completed → hide buttons
            }

            let tempSectionNameArray = [];
            this.questionAndAnswerData.forEach((quest, index) => {
                quest.renderThisQuestion = (quest.renderThisQuestion == null || quest.renderThisQuestion == undefined) ? true : quest.renderThisQuestion;
                quest.multiPicklistSelectedLabel = 'Response Selection';
                //Conditional rendering for picklist, multipicklist and textbox
                if (quest.Type__c == 'Picklist') {
                    quest.isPicklistField = true;
                }
                else if (quest.Type__c == 'MultiPicklist') {
                    quest.isMultiPicklistField = true;
                }
                else if (quest.Type__c == 'Textbox') {
                    quest.isTextField = true;
                }
                else if (quest.Type__c == 'SmallText') { //22/09
                    quest.isSmallTextField = true;
                }
                else if (quest.Type__c == 'Percentage') {
                    quest.isPercentageField = true;
                }
                else if (quest.Type__c == 'Checkbox') {
                    quest.isCheckboxField = true;
                    quest.recordValue = [];
                }


                //For populating field value in UI - Iterating actual data list
                    if (this.questionAndAnswerRecords != null && this.questionAndAnswerRecords != undefined) {
                        Object.keys(this.questionAndAnswerRecords).forEach((fieldApi) => {
                            if (fieldApi == 'Important_Features_Write_In__c') {
                                this.importantfeatureCompWriteIn = this.questionAndAnswerRecords[fieldApi];
                            }
                            if (fieldApi == 'GLP_1_Reqs_Write_In__c') {
                                this.glp1ObesityCompWriteIn = this.questionAndAnswerRecords[fieldApi];
                            }
                            if (fieldApi == 'Annual_Open_Kit_Shared_Write_In__c') {
                                this.openKitCompWriteIn = this.questionAndAnswerRecords[fieldApi];
                            }
                            if (fieldApi == 'Wellness_Programs_Offered_Write_In__c') {
                                this.wellnessProgOfferCompWriteIn = this.questionAndAnswerRecords[fieldApi];
                            }
                            if (fieldApi == 'Value_Story_Supp_Other_Write_In__c') {
                                this.valueStorySuppCompWriteIn = this.questionAndAnswerRecords[fieldApi];
                            }
                            if (fieldApi == 'Doesnt_UHC_Optum_reason_Write_In__c') {  //22/09
                                this.valueStorySuppCompWriteIn = this.questionAndAnswerRecords[fieldApi];
                            }

                            if (quest.Api__c == fieldApi) { //22/09
                                if (quest.isPicklistField || quest.isTextField || quest.isSmallTextField || quest.isPercentageField) {
                                    quest.recordValue = this.questionAndAnswerRecords[fieldApi];
                                   // console.log('quest.recordValuecurrecy>>'+quest.recordValue);
                                    //Show Write In box if 'Other' is selected
                                 /*   if (quest.isCurrencyField) {
                                        if (quest.recordValue) {
                                            quest.recordValue = '$' + quest.recordValue;
                                            console.log('quest.recordValuecurrec222y>>'+quest.recordValue);
                                        }
                                    } */

                                    if (quest.recordValue == 'Other') {
                                        quest.showWriteIn = true;
                                    }
                                }
                                if (quest.isMultiPicklistField) {
                                    if (this.questionAndAnswerRecords[fieldApi] != null && this.questionAndAnswerRecords[fieldApi] != undefined) {
                                        quest.recordValue = this.questionAndAnswerRecords[fieldApi].split(';');
                                       // console.log('quest.recordValuemulitple'+quest.recordValue);

                                    }
                                    //Show Write In box if 'Other' is selected
                                    if (quest.recordValue.includes('Other')  && (quest.Write_In__c != null && quest.Write_In__c != '' && quest.Write_In__c != undefined)) {
                                        quest.showWriteIn = true;
                                    }
                                }
                                if (quest.isCheckboxField) {
                                    if (this.questionAndAnswerRecords[fieldApi] != null && this.questionAndAnswerRecords[fieldApi] != undefined) {
                                        quest.recordValue = this.questionAndAnswerRecords[fieldApi].split(';');
                                       // console.log('quest.recordValue@@229'+quest.recordValue);
                                    }
                                    /*else{
                                        quest.recordValue = [];
                                        console.log('quest.recordValue@@233'+quest.recordValue);
                                    } */ 
                                    //Show Write In box if 'Other' is selected
                                    if (quest.recordValue.includes('Other')) {
                                        quest.showWriteIn = true;
                                    }
                                }
                                
                            }

                            //Populate Write In value
                            if (quest.Write_In__c != null && quest.Write_In__c != undefined && quest.Write_In__c == fieldApi) {
                                quest.writeInValue = this.questionAndAnswerRecords[fieldApi];
                            }
                        });
                    }

                    //Child Component Data - Start
                    if (quest.Child_Component__c) {
                        if (quest.Child_Component_Datatype__c == 'Text') {
                            let tempArrayToJson = [];
                            let tempFieldSetArray = quest.Child_Component_Field_Set__c.split(';');
                            console.log('templ>>',JSON.stringify(tempFieldSetArray)); 
                            let alteredLabel;
                            let prodType;

                            Object.keys(this.labelVsApiMap).forEach((lab) => {
                                let matchFound = tempFieldSetArray.some(field => field.includes(lab));
                                if (matchFound) {
                                    //console.log('templ11>>',JSON.stringify(tempFieldSetArray)); 
                                    //Current Value of the field
                                    let currentFieldVal;

                                    if (this.questionAndAnswerRecords != null && this.questionAndAnswerRecords != undefined) {
                                        Object.keys(this.questionAndAnswerRecords).forEach((rec) => {
                                            if (this.labelVsApiMap[lab] == rec) {
                                                currentFieldVal = this.questionAndAnswerRecords[rec];
                                               // console.log('templ22>>',JSON.stringify(currentFieldVal));

                             /*   const percentFields = ['Earned_Full_Incentive__c','Earned_Partial_Incentive__c', 'Did_Not_Earn_Incentive__c' ];

                                            if (
                                                !this.isEditMode &&
                                                percentFields.includes(this.labelVsApiMap[lab])
                                            ) {
                                                if (currentFieldVal !== null && currentFieldVal !== undefined && currentFieldVal !== '') {
                                                    currentFieldVal = `${currentFieldVal}%`;
                                                }
                                            }  */

                                            }
                                        })
                                    }
                                   // console.log('Found Label: ${lab}, API: ${this.labelVsApiMap[lab]}, Current Value: ${currentFieldVal}');

                                    if (quest.Question__c == 'What is the approximate percentage of employees that earned the incentive amount each year? (include best estimate if unknown, total below should equal 100)') {
                                        alteredLabel = lab.replace('Wellness PerValue ', '');
                                        console.log('templ45>>',JSON.stringify(alteredLabel)); 
                                    }
                                    //Creating an object with field label, api, options and current value
                                    let tempObj2 = {
                                        originalLabel: lab,
                                        labelVal: alteredLabel,
                                        apiVal: this.labelVsApiMap[lab],
                                        currentVal: currentFieldVal,
                                        productType: prodType,
                                        ispercent: alteredLabel == 'NA - New program' ? false:true
                                    };

                                    tempArrayToJson.push(tempObj2);
                                   // console.log('temp2>>',JSON.stringify(tempArrayToJson)); 

                                    const priorityOrder = [ 'Earned_Full_Incentive__c', 'Earned_Partial_Incentive__c', 'Did_Not_Earn_Incentive__c', 'NA_New_program__c' ];
                                    tempArrayToJson.sort(function (a, b) {
                                        const indexA = priorityOrder.indexOf(a.apiVal);
                                        const indexB = priorityOrder.indexOf(b.apiVal);

                                        if (indexA !== -1 && indexB !== -1) {
                                            return indexA - indexB;
                                        }
                                        if (indexA !== -1) return -1;
                                        if (indexB !== -1) return 1;

                                        //console.log('tempArrayToJson set 1'+ tempFieldSetArray.indexOf(a.originalLabel) - tempFieldSetArray.indexOf(b.originalLabel));
                                        return tempFieldSetArray.indexOf(a.originalLabel) - tempFieldSetArray.indexOf(b.originalLabel);
                                    });
                                    

                                    //childComponentMetadata is sent to child component 
                                    console.log('tempArrayToJson child component ' + JSON.stringify(tempArrayToJson))
                                    quest.childComponentMetadata = tempArrayToJson;
                                }
                            })
                        }

                        if (quest.Child_Component_Datatype__c == 'Radio') {
                           // console.log('enterradio@@');
                            let tempArrayToJson = [];
                            let tempFieldSetArray = quest.Child_Component_Field_Set__c.split(';');
                            let tempOptionsArray = quest.Child_Component_Options__c.split(';');
                            let alteredLabel;
                           //console.log(' Field Set (radio1):', JSON.stringify(this.labelVsApiMap));
                           //console.log(' Field Set (radio2):', JSON.stringify(tempFieldSetArray));
                            Object.keys(this.labelVsApiMap).forEach((lab) => {
                                let matchFound = tempFieldSetArray.some(field => field.includes(lab));
                                //if (matchFound) {
                                    if (tempFieldSetArray.includes(lab)) {
                                    //Constructing child component options' Key:Value pair
                                    let tempArray = [];
                                    tempOptionsArray.forEach((key) => {
                                        let tempObj1 = [{ label: '', value: key }];
                                        tempArray.push(tempObj1);
                                    });

                                    //Current Value of the field
                                    let currentFieldVal;
                                    if (this.questionAndAnswerRecords != null && this.questionAndAnswerRecords != undefined) {
                                        Object.keys(this.questionAndAnswerRecords).forEach((rec) => {
                                            if (this.labelVsApiMap[lab] == rec) {
                                                currentFieldVal = this.questionAndAnswerRecords[rec];
                                            }
                                        })
                                    }

                                    if (quest.Question__c == 'How important are the following factors when this client assesses the overall value of UnitedHealthcare?') {
                                        alteredLabel = lab.replace('Value Factor ', '');
                                    }
                                    else if (quest.Question__c == 'Benefit Design & Cost Share Strategies') {
                                        alteredLabel = lab.replace('BDCSS ', '');
                                    }
                                    else if (quest.Question__c == 'Network Design Strategies') {
                                        alteredLabel = lab.replace('NDS ', '');
                                    }else if (quest.Question__c == 'Clinical, Wellbeing & Engagement Strategies') {
                                        alteredLabel = lab.replace('CWES ', '');
                                    }
                                    else if (quest.Question__c == 'Which of the following best describes your organization’s approach to each Pharmacy Strategy?') {
                                        alteredLabel = lab.replace('Pharmacy Strategies ', '');
                                    }
                                    else if (quest.Question__c == 'How important are the following pharmacy elements to the client when evaluating the Rx solution?') {
                                        alteredLabel = lab.replace('Pharmacy Elements ', '');
                                    }
                                    else if (quest.Question__c == 'Which of the following best describes your organization’s approach to each Complex Medical Condition Support / Center of Excellence Strategy?') {
                                        alteredLabel = lab.replace('Medical Elements ', '');
                                    }
                                    else if (quest.Question__c == 'Which of the following best describes your organization’s approach to each Emotional/Behavioral Health Strategy?') {
                                        alteredLabel = lab.replace('BHStrategy ', '');
                                    }
                                    else if (quest.Question__c == 'Which of the following best describes your organization’s approach to each Measurement Strategy?') {
                                        alteredLabel = lab.replace('Measurement Strategy ', '');
                                    }
                                    else if (quest.Question__c == 'Which of the following wellness program initiatives does the client offer?') {
                                        alteredLabel = lab.replace('Wellness Strategy ', '');
                                    }


                                    //Creating an object with field label, api, options and current value
                                    let tempObj2 = {
                                        originalLabel: lab,
                                        labelVal: this.valueFactorFullLabelMap[lab],
                                        apiVal: this.labelVsApiMap[lab],
                                        optionsVal: tempArray,
                                        currentVal: currentFieldVal
                                    };

                                    tempArrayToJson.push(tempObj2);
                                  //  console.log('tempObj2 (Radio>>):', JSON.stringify(tempObj2));
                                    tempArrayToJson.sort(function (a, b) {
                                   //     console.log('tempArrayToJson set 2'+ tempFieldSetArray.indexOf(a.originalLabel) - tempFieldSetArray.indexOf(b.originalLabel));
                                        return tempFieldSetArray.indexOf(a.originalLabel) - tempFieldSetArray.indexOf(b.originalLabel);
                                    });

                                    //childComponentMetadata is sent to child component 
                                    quest.childComponentMetadata = tempArrayToJson;
                                  //  console.log(' tempArrayToJson:', JSON.stringify(tempArrayToJson));
                                }
                            });
                           // console.log('exitradio@@');
                        }



                        if (quest.Child_Component_Datatype__c == 'Table') {
                            //let tempOptionsArray = quest.Child_Component_Options__c.split(';');
                            let apiValueString;
                            let currentFieldVal;

                            //Table has only one field. Obtaining the api of that field
                            for (let i in this.labelVsApiMap) {
                                if (i == quest.Child_Component_Field_Set__c) {
                                    apiValueString = this.labelVsApiMap[i];
                                }
                            }

                            //Obtaining current value of the field
                            if (this.questionAndAnswerRecords != null && this.questionAndAnswerRecords != undefined) {
                                for (let i in this.questionAndAnswerRecords) {
                                    if (i == apiValueString) {
                                        currentFieldVal = this.questionAndAnswerRecords[i];
                                    }
                                }
                            }

                            //Creating an object with field api and current value
                            let tempObj = {
                                apiVal: apiValueString,
                                currentVal: currentFieldVal
                            };

                            //childComponentMetadata is sent to child component
                            quest.childComponentMetadata = tempObj;
                        }
                        

                    }


                    //Dependency Logic - Start
                    if (quest.Is_Dependent_Question__c == true) {
                        
                        quest.renderThisQuestion = false;
                        let count = 0;
                        let isDependency1 = false;

                        //Checking how many dependent questions are present
                        if (quest.Controlling_Question_1__c != null && quest.Controlling_Question_1__c != undefined) {
                            count++;
                        }

                        //Iterating actual records
                        if (this.questionAndAnswerRecords != null && this.questionAndAnswerRecords != undefined) {
                            Object.keys(this.questionAndAnswerRecords).forEach((recs) => {
                                /*Checking for three conditions - 
                                1. Controlling question is present or not 
                                2. Actual data's question (question inside loop) is equal to controlling question
                                3. Actual data's question's answer is equal to controlling value*/
                                if ((quest.Controlling_Question_1__c != null && quest.Controlling_Question_1__c != undefined) &&
                                    recs == quest.Controlling_Question_1__r.Api__c && this.questionAndAnswerRecords[recs] &&
                                    (this.questionAndAnswerRecords[recs] == quest.Controlling_Value_1__r.Value__c ||
                                        this.questionAndAnswerRecords[recs].includes(quest.Controlling_Value_1__r.Value__c))) {
                                    isDependency1 = true;
                                }
                            });


                            if (count == 1 && isDependency1) {
                                quest.renderThisQuestion = true;
                            }

                        }
                    }
                    //Dependency logic - End


                    //Displaying section name
                    if (quest.Section_Name__c != null && quest.Section_Name__c != undefined) {
                        if ((!tempSectionNameArray.includes(quest.Section_Name__c))) {
                            quest.displaySection = true;
                            tempSectionNameArray.push(quest.Section_Name__c);
                        }
                        else {
                            quest.displaySection = false;
                        }
                    }



                    Object.keys(quest).forEach((objKey) => {
                        if (objKey == 'Sales_Debrief_Config_Answers__r') {
                            //Sorting options based on index
                            quest[objKey].sort((a, b) => {
                                return a.Index__c - b.Index__c;
                            });

                            let optArray = [];

                            //Adding "None" option only for Picklist fields
                            if (quest.isPicklistField) {
                                optArray.push({
                                    label: "--None--",
                                    value: "",
                                    selected: true
                                });
                            }

                            //Iterating options and inserting them by creating new property
                            quest[objKey].forEach((ans) => {
                                Object.keys(ans).forEach((key) => {
                                    if (key == 'Value__c') {
                                        let tempObj = { label: ans[key], value: ans[key] };
                                        optArray.push(tempObj);
                                        quest.Options = optArray;
                                    }
                                });
                            });
                        }
                    });

            });


        //   let tempSectionNameArray = [];
                //looping questionAndAnswerData again to display section name and gather data for print 
                this.questionAndAnswerData.forEach((quest, index) => {
                    let tempString = '';

                    if (quest.Api__c == 'Important_Network_features__c') {
                        if (quest.recordValue != null && quest.recordValue != undefined) {
                            this.importantfeatureCompValue = quest.recordValue;
                            this.importantfeatureCompwriteInValue = (quest.writeInValue) ? ` - ${quest.writeInValue}` : '';
                        }
                    }

                    if (quest.Api__c == 'GLP_1_obesity_management_reqs__c') {
                        if (quest.recordValue != null && quest.recordValue != undefined) {
                            this.glp1ObesityCompValue = quest.recordValue;
                            this.glp1ObesityCompwriteInValue = (quest.writeInValue) ? ` - ${quest.writeInValue}` : '';
                        }
                    }

                    if (quest.Api__c == 'Annual_open_enrollment_kit_shared__c') {
                        if (quest.recordValue != null && quest.recordValue != undefined) {
                            this.openKitCompValue = quest.recordValue;
                            this.openKitCompwriteInValue = (quest.writeInValue) ? ` - ${quest.writeInValue}` : '';
                        }
                    }

                    if (quest.Api__c == 'Wellness_program_offered_to__c') {
                        if (quest.recordValue != null && quest.recordValue != undefined) {
                            this.wellnessProgOfferCompValue = quest.recordValue;
                            this.wellnessProgOfferCompwriteInValue = (quest.writeInValue) ? ` - ${quest.writeInValue}` : '';
                        }
                    }


                    if (quest.Api__c == 'Value_story_support_in_client_convos__c') {
                        if (quest.recordValue != null && quest.recordValue != undefined) {
                            this.valueStorySuppCompValue = quest.recordValue;
                            this.valueStorySuppCompwriteInValue = (quest.writeInValue) ? ` - ${quest.writeInValue}` : '';
                        }
                    }

                    if (quest.Api__c == 'Non_UHC_Optum_wellness_reasons__c') {   //22/09
                        if (quest.recordValue != null && quest.recordValue != undefined) {
                            this.doesntuhcOptumCompValue = quest.recordValue;
                            this.doesntuhcOptumCompwriteInValue = (quest.writeInValue) ? ` - ${quest.writeInValue}` : '';
                        }
                    }


                    //For getting values of child components to Print
                    if (quest.Child_Component__c && quest.Type__c == null) {
                        let fieldSet = [];
                        let tempArrayofObjects = [];
                        let tempArrayofObjects2 = [];
                        let apiFieldSet = [];

                        fieldSet = quest.Child_Component_Field_Set__c.split(';');

                        Object.keys(this.labelVsApiMap).forEach((lab) => {
                            if (fieldSet.includes(lab)) {
                                tempArrayofObjects.push({
                                    'label': lab,
                                    'value': this.labelVsApiMap[lab]
                                });
                            }
                        })

                        tempArrayofObjects.sort(function (a, b) {
                          //  console.log('fieldset set 3'+ fieldSet.indexOf(a.label) - fieldSet.indexOf(b.label));
                            return fieldSet.indexOf(a.label) - fieldSet.indexOf(b.label);
                        });

                        for (let tObj in tempArrayofObjects) {
                            apiFieldSet.push(tempArrayofObjects[tObj].value);
                        }

                        if (this.questionAndAnswerRecords != null && this.questionAndAnswerRecords != undefined) {
                            Object.keys(this.questionAndAnswerRecords).forEach((rec) => {
                                if (apiFieldSet.includes(rec)) {
                                    let labelVal = Object.keys(this.labelVsApiMap).find(key => this.labelVsApiMap[key] === rec);
                                    let tempString2 = `<b>${labelVal} -</b> ${this.questionAndAnswerRecords[rec]}<br/>`;
                                    tempArrayofObjects2.push({
                                        'api': rec,
                                        'value': tempString2
                                    });
                                }
                            });

                            tempArrayofObjects2.sort(function (a, b) {
                              //  console.log('apifieldset set 4'+ apiFieldSet.indexOf(a.api) - apiFieldSet.indexOf(b.api));
                                return apiFieldSet.indexOf(a.api) - apiFieldSet.indexOf(b.api);
                            });

                            for (let tobj2 in tempArrayofObjects2) {
                                tempString += tempArrayofObjects2[tobj2].value;
                            }
                        }

                    }

                    //Print Start
                    let sectionNameFinal = quest.displaySection ? quest.Section_Name__c : '';
                    let answerFinal;
                    let writeInPrint;
                    if (quest.recordValue != null && quest.recordValue != undefined) {
                    if (quest.isMultiPicklistField || quest.isCheckboxField) {
                        answerFinal = quest.recordValue.toString();
                    } else {
                        answerFinal = quest.recordValue;
                    }
                    } else if (quest.Child_Component__c && quest.Type__c == null) {
                        answerFinal = tempString;
                    } else {
                        answerFinal = '';
                    }


                    //<b>Please Specify: </b>
                    if (quest.showWriteIn && quest.writeInValue != null && quest.writeInValue != undefined) {
                        writeInPrint = `${quest.writeInValue}`;
                    }
                    else {
                        writeInPrint = '';
                    }

                    let printObj = {
                        sectionName: sectionNameFinal,
                        question: quest.Question__c,
                        answer: answerFinal,
                        writeInValue: writeInPrint,
                        shortForm: quest.Short_Form__c,
                        apiName: quest.Api__c,
                        rendered: quest.renderThisQuestion
                    };

                    if (quest.displayAlternateSection) {
                        printObj = {
                            sectionName: quest.Section_Name__c,
                            question: '',
                            answer: '',
                            writeInValue: '',
                            shortForm: quest.Short_Form__c,
                            apiName: quest.Api__c,
                            rendered: true
                        }
                    }

                    //Print End
                    if (quest.Write_In__c != null && quest.Write_In__c != undefined) {
                        if (quest.writeInValue != null && quest.writeInValue != undefined) {
                            quest.charLength = quest.writeInValue.length;
                        }
                        else {
                            quest.charLength = 0;
                        }
                    }
                    else {
                        if (quest.recordValue != null && quest.recordValue != undefined) {
                            quest.charLength = quest.recordValue.length;
                        }
                        else {
                            quest.charLength = 0;
                       }
                    }

                });

            })
            .catch(error => {
                this.error = error;
               // console.log('error@@'+JSON.stringify(this.error));
                this.isLoad = false;
            });
  }


    //Show Year
    updateDateOptions() {
       /* const currentDate = new Date();
        const currentYear = currentDate.getFullYear(); */
   /* const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    let strategyYear;
    if (currentMonth >= 10 && currentMonth <= 12) {
        strategyYear = currentYear + 1;
    } else {
        strategyYear = currentYear;
    }
        this.selectedCycle =`${strategyYear}`;       
        const ssChange = new CustomEvent('salesseasonchange', { detail: this.selectedCycle });
        this.dispatchEvent(ssChange); */
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1; // JS months are 0–11

        getTimeFrames()
            .then(result => {
                console.log('result11',JSON.stringify(this.result));
                if (result && result.length > 0) {
                    const startMonth = result[0].Start_Month__c;
                    const endMonth   = result[0].End_Month__c;

                    let strategyYear;
                    if (currentMonth >= startMonth && currentMonth <= endMonth) {
                        strategyYear = currentYear + 1;
                    } else {
                        strategyYear = currentYear;
                    }

                    this.selectedCycle = `${strategyYear}`;
                    const ssChange = new CustomEvent('salesseasonchange', { detail: this.selectedCycle });
                    this.dispatchEvent(ssChange);
                }
            })
            .catch(error => {
                console.error('Error fetching timeframe metadata', error);
            });
    

    }


    handleOptionChange(event) {
        this.selectedCycle = event.detail.value;
    }

    handleEdit() {
        this.isLoad = true;
        setTimeout(() => {
            this.isLoad = false;
            }, 2000);
        this.isEditMode = true;
    }

    handleCancel() {
        this.getClientStrategyRecords();
        this.isEditMode = false;
    }


 /*  async handleCompletionButton() {
    try {
        const result = await markComplete({ recordId: this.recordId, year : this.selectedCycle });

        if (result.success) {
            const confirmResult = await LightningConfirm.open({
                message: 'Are you sure you want to mark this form as complete? Once confirmed, the form will be locked and no further edits will be possible. Please ensure that all required information is accurate and finalized before proceeding.',
                variant: 'header',
                label: 'Confirmation',
                theme: 'success'
            });
            

            if (confirmResult) {
                markAsComplete({ recordId: this.recordId,year : this.selectedCycle })
            .then(() => {
                this.isCompleted = true;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Form marked as completed.',
                        variant: 'success'
                    })
                );
                this.getClientStrategyRecords();
            })
            .catch(error => {
                console.error(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Failed to mark form as complete.',
                        variant: 'error'
                    })
                );
            });

                 
                this.isCompleted = (result.status === 'Completed');
            }
        } else {
            this.unansweredQuestions = result.unansweredFields;
            await LightningAlert.open({
                message: 'All required questions must be answered before you can complete the Client Strategy Form. The unanswered questions are highlighted below. Please review and provide responses to the highlighted fields, then try completing the form again.',
                theme: 'error',
                label: 'Form cannot be marked as complete'
            });
       

            this.highlightUnansweredFields();
        }
        } catch (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }   */



    async handleCompletionButton() {
    try {
        const result = await markComplete({ recordId: this.recordId,year : this.selectedCycle });

        if (result.success) {
            this.modalTitle = 'Confirmation';
                this.modalMessage =
                    'Are you sure you want to mark this form as complete? Once confirmed, the form will be locked and no further edits will be possible. Please ensure that all required information is accurate and finalized before proceeding.';
                this.modalConfirmLabel = 'Continue';
                this.modalShowCancel = true;
                this.modalType = 'confirm';
                this.showModal = true;
            
        } else {
            this.unansweredQuestions = result.unansweredFields;
            await LightningAlert.open({
                message: 'All required questions must be answered before you can complete the Client Strategy Form. The unanswered questions are highlighted below. Please review and provide responses to the highlighted fields, then try completing the form again.',
                theme: 'error',
                label: 'Form cannot be marked as complete'
            });
       

            this.highlightUnansweredFields();
        }
        } catch (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    handleModalCancel() {
        this.showModal = false;
    }


handleModalConfirm() {
        this.showModal = false;

        if (this.modalType === 'confirm') {
            // Confirm action
            markAsComplete({ recordId: this.recordId,year : this.selectedCycle })
                .then(() => {
                    this.isCompleted = true;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Form marked as completed.',
                            variant: 'success'
                        })
                    );
                    this.getClientStrategyRecords();
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Failed to mark form as complete.',
                            variant: 'error'
                        })
                    );
                });
        }
        // If it's alert type, just close
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }

   //unanswered question ui highlighted
    highlightUnansweredFields() {
        let listOfValueFacttor =['How important are the following factors when this client assesses the overall value of UnitedHealthcare?','Affordability_programs__c', 'Behavioral_health_programs__c', 'Client_experience_and_support__c', 'Clinical_management_programs__c',
    'Data_analysis_and_reporting__c', 'Fees_and_credits__c', 'Guarantees__c', 'Integration_across_programs__c', 'Member_experience_and_engagement__c', 'Network_design__c', 'Network_discounts__c',
    'Pharmacy_programs__c', 'Plan_design__c', 'Wellness_programs__c', 'Network_Access__c', 'Brand_Image__c', 'Innovation__c', 'Product_breadth__c', 'Administrative_capabilities__c', 'ESG_Issues__c'];

        let benefitDesignandCostShare = ['Benefit Design & Cost Share Strategies', 'CDHP_full_replacement__c', 'Voluntary_benefits__c', 'Value_based_benefits__c', 'Quality_Cost_tiering__c', 'POS_tiering__c', 'Reference_based_pricing__c', 'Intermittent_workforce__c',
    'Employee_affordability__c', 'Co_Pay_insurance__c', 'ICHRA_plan__c']

    let networkDesignStrag = ['Network Design Strategies', 'Virtual_First_Solution__c', 'Traditional_PCP_Coordinated_Care__c', 'Site_of_Care_Steerage__c', 'Direct_Contracting_with_a_Provider__c', 
    'Advanced_Primary_Care_Strategy__c', 'Streamlined_Narrow_Networks__c', 'ACO_Centric_Networks__c', 'Prioritized_Access__c']

    let clinicalWellbeingStrag = ['Clinical, Wellbeing & Engagement Strategies', 'Healthy_workplace__c',
    'On_site_near_site_clinics__c', 'Onsite_health_specialist__c', 'Cancer_Screening_and_Support_Programs__c', 'Medication_assisted_weight_loss__c', 'Women_s_health_solutions__c', 'Concierge_advocacy__c',
    'Tools_technologies__c', 'Engagement_Platform_Adoption__c', 'Digital_condition_mgmt__c', 'Diversity_equity_and_inclusion__c', 'LGBTQ_support__c', 'Social_Determinants_of_Health__c', 'Health_Equity__c']

    let pharmacyStrag = ['Pharmacy Strategies', 'Preventive_drug_lists__c', 'Prescription_savings_outreach__c', 'Point_of_Sale_Rebates__c', 'Critical_affordability_drug_lists__c', 
    'Cash_price_into_member_benefit__c', 'Affordability_solutions__c', 'Stop_loss_cover_for_high_cost_therapy__c', 'Transparent_non_traditional_PBM__c', 'Biosimilar_steerage__c', 'Specialty_Pharmacy_carve_out__c']

    let pharmacyElementRx = ['How important are the following pharmacy elements to the client when evaluating the Rx solution?', 'Integrated_plan_administration__c', 'Member_experience_integration__c', 'Member_savings_opportunities__c', 'Integrated_benefits_provider__c', 'Integrated_Med_Pharmacy_digital__c', 'Electronic_prescribing_integration__c', 
    'Integrated_specialty_management__c', 'Specialty_pharmacy_network_solution__c']

    let complexMedConditionSupport = ['Complex Medical Condition Support / Centers of Excellence', 'Cardiac_COE__c', 'Fertility_Family_Forming_COE__c', 'Neonatal_COE__c', 'Kidney_COE__c', 'Musculoskeletal_Spine_Joint_COE__c', 
    'Maternity_COE__c', 'Mental_Health_Substance_Disorder__c', 'Transgender_Health_COE__c', 'Cancer_COE__c', 'Bariatric_COE__c', 'Weight_Management_COE__c']

    let emotionalBehavHealthStrag = ['Emotional/Behavioral Health Strategies', 'EAP_Modernization__c', 'Family_Special_Needs__c', 
    'Peer_Support__c', 'Online_tools_apps_videos_webinars__c', 'Virtual_coaching_counseling_therapy__c', 'Onsite_coaching_counseling_therapy__c', 'Burnout_stress_management_programs__c', 'Pediatric_focused_mental_health_sup__c',
    'Behavioral_Health_Engagement__c']

    let measurementStrag = ['Measurement Strategies', 'Linkage_to_business_measures__c', 'Data_warehouse__c', 'SDOH_and_health_equity__c', 'Population_health_management_report__c']

    let wellnessProgClientOfer = ['Which of the following wellness program initiatives does the client offer?', 'Biometric_screenings__c', 'Health_risk_assessment__c', 'Cancer_screenings__c', 'Tobacco_cessation_programs__c', 'Physical_activity_challenges__c', 'Weight_management_programs__c',
    'Wellness_lifestyle_coaching__c', 'Sleep_management_programs__c']

    let incentiveAmount = ['What is the approximate percentage of employees that earned the incentive amount each year? (include best estimate if unknown, total below should equal 100)', 'Earned_Full_Incentive__c', 'Earned_Partial_Incentive__c', 'Did_Not_Earn_Incentive__c', 'NA_New_program__c']

        this.isEditMode = true;
        setTimeout(() => {
            for (const field of this.unansweredQuestions) {

                console.log('field>mand',JSON.stringify(field));
                const element = this.template.querySelector(`[data-api="${field}"]`);
                if (element) {
                    element.setCustomValidity("This Field is Mandatory");
                    element.reportValidity();
                    element.classList.add('highlight-question');
                    //this.cssquestionclass = 'highlight-question';
                }

                if(listOfValueFacttor.includes(field)){
                const questionEl = this.template.querySelector(`[data-question-api="${listOfValueFacttor[0]}"]`);
                if (questionEl) {
                    questionEl.classList.add("highlight-question");
                }
                }

                if(benefitDesignandCostShare.includes(field)){
                const questionEl = this.template.querySelector(`[data-question-api="${benefitDesignandCostShare[0]}"]`);
                if (questionEl) {
                    questionEl.classList.add("highlight-question");
                }
                }

                if(networkDesignStrag.includes(field)){
                const questionEl = this.template.querySelector(`[data-question-api="${networkDesignStrag[0]}"]`);
                if (questionEl) {
                    questionEl.classList.add("highlight-question");
                }
                }

                if(clinicalWellbeingStrag.includes(field)){
                const questionEl = this.template.querySelector(`[data-question-api="${clinicalWellbeingStrag[0]}"]`);
                if (questionEl) {
                    questionEl.classList.add("highlight-question");
                }
                }

                if(pharmacyStrag.includes(field)){
                const questionEl = this.template.querySelector(`[data-question-api="${pharmacyStrag[0]}"]`);
                if (questionEl) {
                    questionEl.classList.add("highlight-question");
                }
                }

                if(pharmacyElementRx.includes(field)){
                const questionEl = this.template.querySelector(`[data-question-api="${pharmacyElementRx[0]}"]`);
                if (questionEl) {
                    questionEl.classList.add("highlight-question");
                }
                }

                if(complexMedConditionSupport.includes(field)){
                const questionEl = this.template.querySelector(`[data-question-api="${complexMedConditionSupport[0]}"]`);
                if (questionEl) {
                    questionEl.classList.add("highlight-question");
                }
                }

                if(emotionalBehavHealthStrag.includes(field)){
                const questionEl = this.template.querySelector(`[data-question-api="${emotionalBehavHealthStrag[0]}"]`);
                if (questionEl) {
                    questionEl.classList.add("highlight-question");
                }
                }

                if(measurementStrag.includes(field)){
                const questionEl = this.template.querySelector(`[data-question-api="${measurementStrag[0]}"]`);
                if (questionEl) {
                    questionEl.classList.add("highlight-question");
                }
                }

                if(wellnessProgClientOfer.includes(field)){
                const questionEl = this.template.querySelector(`[data-question-api="${wellnessProgClientOfer[0]}"]`);
                if (questionEl) {
                    questionEl.classList.add("highlight-question");
                }
                }

                if(incentiveAmount.includes(field)){
                const questionEl = this.template.querySelector(`[data-question-api="${incentiveAmount[0]}"]`);
                if (questionEl) {
                    
                    questionEl.classList.add("highlight-question");
                  //  questionEl.setCustomValidity("This Field is Mandatory");
                  //  questionEl.reportValidity();
                }
                }

            }
        }, 2000);
        
    }


   // Save Method
    handleSave() {
       
        this.isLoad = true;
        this.isEditMode = false;


        Object.keys(this.questionAndAnswerRecords).forEach(fieldApi => {
            if (this.dataFromApex.nonUpdateableFields && this.dataFromApex.nonUpdateableFields.includes(fieldApi) && !['Id'].includes(fieldApi)) {
                delete this.questionAndAnswerRecords[fieldApi];
            }
        });

        let payload = { ...this.questionAndAnswerRecords };
        Object.keys(payload).forEach(key => {
            if (Array.isArray(payload[key])) {
                payload[key] = payload[key].join(';');
            }
        });  
        

        saveClientStrategyData({ dataToSave: payload, accRecordId: this.recordId})
            .then((result) => {
                this.questionAndAnswerRecords = null;
                this.getClientStrategyRecords();

                const event = new ShowToastEvent({
                    title: 'Success',
                    message: 'Your changes have been saved successfully',
                    variant: 'success'
                });
                this.dispatchEvent(event);
            })
            .catch((error) => {
                console.log('error ' + JSON.stringify(error));

                const event = new ShowToastEvent({
                    title: 'Error',
                    message: 'Error while saving changes',
                    variant: 'error'
                });
                this.dispatchEvent(event);

                this.getClientStrategyRecords();

                this.isLoad = false;
            });

    }


     handleChange(event) {
        let tempObj = {};
        let currentValue = event.target.value;
        let apiName = event.target.dataset.api;

        if (this.questionAndAnswerRecords == null || this.questionAndAnswerRecords == undefined) {
            this.questionAndAnswerRecords = {};
        }

        

        if (event.target.dataset.valuetype == 'MultiPicklist') {
            let tempString = '';
            let multiValue = event.target.value;


            for (let i = 0; i <= multiValue.length - 1; i++) {
                tempString += multiValue[i] + ';';
            }
            tempString = tempString.slice(0, -1);
            this.questionAndAnswerRecords[event.target.dataset.api] = tempString;

        } 
        else {
            this.questionAndAnswerRecords[event.target.dataset.api] = event.target.value;
        }


        if (event.target.dataset.valuetype == 'Checkbox') {
            let tempString = '';
            let multiValue = event.target.value;


            for (let i = 0; i <= multiValue.length - 1; i++) {
                tempString += multiValue[i] + ';';
            }
            tempString = tempString.slice(0, -1);
            this.questionAndAnswerRecords[event.target.dataset.api] = tempString;

        } 
        else {
            this.questionAndAnswerRecords[event.target.dataset.api] = event.target.value;
        }

        if (event.target.dataset.labelval == 'Write In') {
            this.questionAndAnswerRecords[event.target.dataset.writein] = event.target.value;

            if (event.target.dataset.writein == 'Important_Features_Write_In__c') {
                if (event.target.value != null && event.target.value != undefined && event.target.value != '') {
                    this.importantfeatureCompwriteInValue = (event.target.value) ? ` - ${event.target.value}` : '';
                }
                else {
                    this.importantfeatureCompwriteInValue = '';
                }
                //this.medTopCompwriteInValue = event.target.value;
            }

             if (event.target.dataset.writein == 'GLP_1_Reqs_Write_In__c') {
                if (event.target.value != null && event.target.value != undefined && event.target.value != '') {
                    this.glp1ObesityCompwriteInValue = (event.target.value) ? ` - ${event.target.value}` : '';
                }
                else {
                    this.glp1ObesityCompwriteInValue = '';
                }
                //this.medTopCompwriteInValue = event.target.value;
            }

            if (event.target.dataset.writein == 'Annual_Open_Kit_Shared_Write_In__c') {
                if (event.target.value != null && event.target.value != undefined && event.target.value != '') {
                    this.openKitCompwriteInValue = (event.target.value) ? ` - ${event.target.value}` : '';
                }
                else {
                    this.openKitCompwriteInValue = '';
                }
                //this.medTopCompwriteInValue = event.target.value;
            }

            if (event.target.dataset.writein == 'Wellness_Programs_Offered_Write_In__c') {
                if (event.target.value != null && event.target.value != undefined && event.target.value != '') {
                    this.wellnessProgOfferCompwriteInValue = (event.target.value) ? ` - ${event.target.value}` : '';
                }
                else {
                    this.wellnessProgOfferCompwriteInValue = '';
                }
                //this.medTopCompwriteInValue = event.target.value;
            }

            if (event.target.dataset.writein == 'Value_Story_Supp_Other_Write_In__c') {
                if (event.target.value != null && event.target.value != undefined && event.target.value != '') {
                    this.valueStorySuppCompwriteInValue = (event.target.value) ? ` - ${event.target.value}` : '';
                }
                else {
                    this.valueStorySuppCompwriteInValue = '';
                }
                //this.medTopCompwriteInValue = event.target.value;
            }

            if (event.target.dataset.writein == 'Doesnt_UHC_Optum_reason_Write_In__c') {  //22/09
                if (event.target.value != null && event.target.value != undefined && event.target.value != '') {
                    this.doesntuhcOptumCompwriteInValue = (event.target.value) ? ` - ${event.target.value}` : '';
                }
                else {
                    this.doesntuhcOptumCompwriteInValue = '';
                }
                //this.medTopCompwriteInValue = event.target.value;
            }

        }

        this.questionAndAnswerData.forEach((quest, index) => {

            if ((quest.Write_In__c && event.target.dataset.writein) && quest.Write_In__c == event.target.dataset.writein) {
                quest.writeInValue = event.target.value;
            }

            if (quest.Api__c == event.target.dataset.api && quest.Type__c != 'Textbox') {
                if ((currentValue == 'Other' || currentValue.includes('Other')) && (quest.Write_In__c != null && quest.Write_In__c != '' && quest.Write_In__c != undefined)) {
                    quest.showWriteIn = true;
                }
                else {
                    quest.showWriteIn = false; //Hide Textbox
                    quest.writeInValue = ''; //Purge Write In value in UI
                    this.questionAndAnswerRecords[quest.Write_In__c] = ''; //Clear Write In value in backend 
                }
            }
     
            //Added for Depends question data remove
            if (quest.Api__c == event.target.dataset.api && quest.Type__c != 'Textbox') {
                if ((currentValue == 'For treatment of obesity' || currentValue == 'Yes') && (quest.Write_In__c != null && quest.Write_In__c != '' && quest.Write_In__c != undefined)) {
                    
                }
                else {
                    this.questionAndAnswerRecords[quest.Write_In__c] = ''; //Clear Write In value in backend 
                }
            }
            console.log('apic>>',event.target.dataset.api )
            if (quest.Api__c == event.target.dataset.api && quest.Type__c != 'Textbox') {
               if (currentValue == 'No' && quest.Api__c == 'Wellness_program_offered__c') {
                    let fieldsToClear = [ 'Program_administrator_vendor__c', 'Wellness_program_duration__c', 'Wellness_program_offered_to__c',
                'Participation_in_wellness_program__c', 'Non_UHC_Optum_wellness_reasons__c', 'Max_annual_employee_reward__c', 'Max_annual_spouse_partner_reward__c',
                'How_are_Rewards_distributed__c', 'Other_reward_distribution_method__c','Earned_Full_Incentive__c','Earned_Partial_Incentive__c', 'Did_Not_Earn_Incentive__c'
            ];

            fieldsToClear.forEach(field => {
                console.log('theclear>>',JSON.stringify(this.field));
                this.questionAndAnswerRecords[field] = '';
            });

                } 
            }

            let flag123 = false;
            if (quest.Write_In__c != null && quest.Write_In__c != undefined) {
                if (quest.writeInValue == undefined || quest.writeInValue == '') {
                    quest.charLength = 0;
                }
                else {
                    if (quest.Write_In__c == event.target.dataset.writein) {
                        quest.charLength = event.target.value.length;
                    }
                }
                flag123 = true;
            }
            else if (quest.Api__c == event.target.dataset.api && !flag123) {
                quest.charLength = event.target.value.length;
            }


            let flag = false;
            if (quest.Is_Dependent_Question__c == true && quest.Api__c != event.target.dataset.api) {
                if (quest.Controlling_Question_1__c != null && quest.Controlling_Question_1__c != undefined) {
                    flag = true;

                    let cq1 = this.template.querySelector(`[data-api="${quest.Controlling_Question_1__r.Api__c}"]`);
                    let cq1Value;

                    if (cq1 != null) {
                        cq1Value = cq1.value;
                    }
                    else {
                        cq1Value = '';
                    }

                    if (cq1Value == quest.Controlling_Value_1__r.Value__c || (cq1Value?.includes && cq1Value.includes(quest.Controlling_Value_1__r.Value__c))) {
                        this.questionAndAnswerData[index].isDependency1 = true;
                    }
                    else {
                        this.questionAndAnswerData[index].isDependency1 = false;
                    }
                }

                if (flag) {

                        if (this.questionAndAnswerData[index].isDependency1) {
                            this.questionAndAnswerData[index].renderThisQuestion = true;
                        }
                        else {
                            this.questionAndAnswerData[index].renderThisQuestion = false;
                            this.questionAndAnswerData[index].recordValue = '';

                        }
                    
                }


            }


            });
     }


     dataFromChildComponent(event) {
        this.questionAndAnswerRecords[event.detail.fieldApiName] = event.detail.fieldValue;
    }

    //display the sub-section in ui
    renderedCallback(){  //22/09
        if (!this.isLoad) {

            if (this.questionAndAnswerData != null && this.questionAndAnswerData != undefined) {
                this.questionAndAnswerData.forEach((quest, index) => {

                let firstClass = this.template.querySelector(`[data-apiclass="${quest.Question__c}"]`);
                let secondClass = this.template.querySelector(`[data-alternateapiclass="${quest.Question__c}"]`);
                // Displaying Section before the Question to render
                if (quest.Api__c === 'Max_annual_employee_reward__c') {
                    let tempString = `Reward Amounts`;
                  //  firstClass.innerHTML = tempString;
                    if (firstClass) {
                        firstClass.innerHTML = tempString;
                    }

                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                }

               else if (quest.Api__c === 'How_are_Rewards_distributed__c') {
                    let tempString = `Reward Distribution`;
                    //firstClass.innerHTML = tempString;
                    if (firstClass) {
                        firstClass.innerHTML = tempString;
                    }

                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                }


               else if (quest.Api__c === 'Client_attitude_on_engagement__c') {
                    let tempString = `Communication Strategies`;
                    //firstClass.innerHTML = tempString;
                    if (firstClass) {
                        firstClass.innerHTML = tempString;
                    }

                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                }

               else if (quest.Api__c === 'Value_story_support_in_client_convos__c') {
                    let tempString = `Value Story`;
                    //firstClass.innerHTML = tempString;
                    if (firstClass) {
                        firstClass.innerHTML = tempString;
                    }

                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                }

               else if (quest.Api__c === 'Competitive_landscape_updated__c') {
                    let tempString = `Competitive Landscape`;
                    //firstClass.innerHTML = tempString;
                    if (firstClass) {
                        firstClass.innerHTML = tempString;
                    }
                    let noteString = `<br/><span style="font-size:12px; color:#666;">As part of this documentation project, please review and update the “Competitive Landscape” sections in the “Details” tab of the account record to be sure the correct medical, specialty and other product vendors are displayed.</span>`;

                    firstClass.innerHTML = tempString + noteString;
                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;   // + " - Note: Keep this updated quarterly";
                    }
                }

               else if (quest.Api__c === 'Annual_open_enrollment_kit_shared__c') {
                    let tempString = `Annual Open Enrollment`;
                    //firstClass.innerHTML = tempString;
                    if (firstClass) {
                        firstClass.innerHTML = tempString;
                    }

                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                }
                // 22/09
               else if (quest.Question__c === 'Benefit Design & Cost Share Strategies - Group 1') {
                    let tempString = `Benefit Design & Cost Share Strategiess`;
                    //firstClass.innerHTML = tempString;
                    if (firstClass) {
                        firstClass.innerHTML = tempString;
                    }

                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                }

                /*if (quest.Question__c === 'For each of the following Network Design Strategies, please indicate your organization’s current or planned approach?') {
                    let tempString = `Network Design Strategies`;
                    firstClass.innerHTML = tempString;

                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                } */
                // 22/09
               else if (quest.Question__c === 'Clinical, Wellbeing & Engagement Strategies - Group 1') {
                    let tempString = `Clinical, Wellbeing & Engagement Strategies`;
                    //firstClass.innerHTML = tempString;
                    if (firstClass) {
                        firstClass.innerHTML = tempString;
                    }

                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                }

               else if (quest.Api__c === 'How_is_client_covering_GLP_1s__c') {
                    let tempString = `GLP-1 Strategies`;
                    //firstClass.innerHTML = tempString;
                    if (firstClass) {
                        firstClass.innerHTML = tempString;
                    }

                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                }
                // 22/09
               else if (quest.Question__c === 'Pharmacy Strategies - Group 1') {
                    let tempString = `Pharmacy Strategies`;
                    //firstClass.innerHTML = tempString;
                    if (firstClass) {
                        firstClass.innerHTML = tempString;
                    }

                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                }

               else if (quest.Question__c === 'How important are the following pharmacy elements to the client when evaluating the Rx solution?') {
                    let tempString = `Importance of Pharmacy Elements`;
                    //firstClass.innerHTML = tempString;
                    if (firstClass) {
                        firstClass.innerHTML = tempString;
                    }

                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                }

                /*if (quest.Question__c === 'Which of the following best describes your organization’s approach to each Complex Medical Condition Support / Center of Excellence Strategy?') {
                    let tempString = `Complex Medical Condition Support / Centers of Excellence`;
                    firstClass.innerHTML = tempString;

                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                } 

                if (quest.Question__c === 'Which of the following best describes your organization’s approach to each Emotional/Behavioral Health Strategy?') {
                    let tempString = `Emotional/Behavioral Health Strategies`;
                    firstClass.innerHTML = tempString;

                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                }

                if (quest.Question__c === 'Which of the following best describes your organization’s approach to each Measurement Strategy?') {
                    let tempString = `Measurement Strategies`;
                    firstClass.innerHTML = tempString;

                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                } */

               else if (quest.Question__c === 'Which of the following wellness program initiatives does the client offer?') {
                    let tempString = `Incentives`;
                    //firstClass.innerHTML = tempString;
                    if (firstClass) {
                        firstClass.innerHTML = tempString;
                    }

                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                }

            

                });
            }
        }
    }


    

}