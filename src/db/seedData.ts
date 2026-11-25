import type { EligibilityRulesJson } from './schema.ts';
import { EXTRA_CROP_ITEMS } from './extraCropsData.ts';
import { EXTRA_SOIL_ITEMS } from './extraSoilsData.ts';
import { EXTRA_ANIMAL_ITEMS } from './extraAnimalsData.ts';
import { EXTRA_ORGANIC_ITEMS } from './extraOrganicData.ts';
import { EXTRA_INORGANIC_ITEMS } from './extraInorganicData.ts';
import { EXTRA_TECHNOLOGY_ITEMS } from './extraTechnologiesData.ts';

export interface SeedScheme {
  slug: string;
  name: string;
  shortName: string;
  governmentLevel: 'Central' | 'State';
  stateName: string;
  category: string;
  targetCategories: string[];
  overview: string;
  objectives: string[];
  benefits: string;
  eligibilitySummary: string;
  eligibilityRules: EligibilityRulesJson;
  requiredDocuments: string[];
  applicationProcedure: string[];
  officialUrl: string;
  logoUrl: string;
  lastVerifiedDate: string;
  isPopular: boolean;
}

export interface SeedAgricultureItem {
  slug: string;
  section: 'crop' | 'soil' | 'animal' | 'organic' | 'inorganic' | 'technology';
  title: string;
  subtitle: string;
  imageUrl: string;
  summary: string;
  details: Record<string, string>;
  highlights: string[];
}

export const INITIAL_SCHEMES: SeedScheme[] = [
  {
    slug: 'pm-kisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    shortName: 'PM-KISAN',
    governmentLevel: 'Central',
    stateName: 'All India',
    category: 'Income Support',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
    overview:
      'PM-KISAN is a Central Sector scheme by the Ministry of Agriculture & Farmers Welfare that provides supplemental income support to landholding farmer families across India to meet agricultural input and domestic needs.',
    objectives: [
      'Supplement the financial needs of landholding farmers in procuring various agricultural inputs.',
      'Ensure proper crop health and appropriate yields commensurate with anticipated farm income.',
      'Protect small and marginal farmers from falling into informal debt traps for seasonal cultivation expenses.',
    ],
    benefits:
      'Direct income support of ₹6,000 per year per eligible farmer family, transferred directly to Aadhaar-seeded bank accounts in three equal installments of ₹2,000 every four months.',
    eligibilitySummary:
      'Cultivable landholding farmer families across India (subject to standard exclusion criteria such as institutional landholders, serving/retired higher-grade government employees, and income tax payers).',
    eligibilityRules: {
      states: ['All India'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Large (> 10 ha)'],
      minLandAcres: 0.1,
      notes: [
        'Farmer family must hold cultivable land as per state/UT land records.',
        'Landless agricultural labourers without cultivable land title are generally not eligible under landholding criteria.',
        'Aadhaar e-KYC and Aadhaar-seeded active bank account are mandatory for Direct Benefit Transfer.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card (mandatory for e-KYC)',
      'Landholding ownership records (RTC / Pahani / Khatauni)',
      'Aadhaar-linked Bank Account Passbook & IFSC details',
      'Active Mobile Number for OTP verification',
    ],
    applicationProcedure: [
      'Visit the official PM-KISAN portal (pmkisan.gov.in) or visit your nearest Common Service Centre (CSC) / State Nodal Officer.',
      'Select "New Farmer Registration" and enter your Aadhaar number, mobile number, and state details.',
      'Fill in landholding survey/khata details and upload supporting land records as requested by state verification rules.',
      'Complete Aadhaar e-KYC online or via biometric CSC authentication and track beneficiary status on the portal.',
    ],
    officialUrl: 'https://pmkisan.gov.in/',
    logoUrl: '/src/assets/images/schemes/pm-kisan.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: true,
  },
  {
    slug: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    shortName: 'PMFBY',
    governmentLevel: 'Central',
    stateName: 'All India',
    category: 'Crop Insurance',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Landless / Tenant'],
    overview:
      'PMFBY provides comprehensive insurance coverage and financial support to farmers against crop loss or damage arising out of unforeseen natural calamities, pests, and diseases from pre-sowing to post-harvest.',
    objectives: [
      'Provide insurance coverage and financial support to farmers in the event of failure of notified crops due to natural calamities, pests, or diseases.',
      'Stabilize the income of farmers to ensure their continuance in farming.',
      'Encourage farmers to adopt innovative and modern agricultural practices.',
    ],
    benefits:
      'Affordable uniform maximum farmer premium rates: 2% of sum insured for Kharif crops, 1.5% for Rabi crops, and 5% for annual commercial/horticultural crops, with remaining actuarial premium subsidized by Central and State Governments.',
    eligibilitySummary:
      'All farmers including sharecroppers and tenant farmers growing notified crops in notified areas during Kharif and Rabi seasons are eligible to enroll on a voluntary basis.',
    eligibilityRules: {
      states: ['All India'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Large (> 10 ha)', 'Landless / Tenant'],
      notes: [
        'Applies to notified crops in notified districts/taluks announced by the State Government each season.',
        'Both loanee farmers (KCC borrowers) and non-loanee farmers (including tenant/sharecroppers with valid tenancy proof) can enroll.',
        'Enrollment must be completed before the seasonal cut-off date announced by the State Government.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Land Record (RTC / Khasra) or valid Tenancy/Sharecropper Agreement',
      'Sowing Declaration / Crop Cultivation Certificate',
      'Bank Account Passbook details',
    ],
    applicationProcedure: [
      'Visit pmfby.gov.in, your nearest CSC, or the bank branch where your crop loan/account is maintained.',
      'Choose "Farmer Corner" and register or log in with your mobile number.',
      'Select the season (Kharif/Rabi), state, district, notified crop, and sown area.',
      'Upload required land/tenancy documents, pay the subsidized farmer premium share, and save the policy receipt.',
    ],
    officialUrl: 'https://pmfby.gov.in/',
    logoUrl: '/src/assets/images/schemes/pmfby.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: true,
  },
  {
    slug: 'kcc',
    name: 'Kisan Credit Card (KCC) Scheme',
    shortName: 'KCC',
    governmentLevel: 'Central',
    stateName: 'All India',
    category: 'Agricultural Credit',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Landless / Tenant'],
    overview:
      'The Kisan Credit Card scheme provides farmers with timely and adequate short-term institutional credit for crop cultivation, post-harvest expenses, consumption needs, and working capital for allied activities like dairy and fisheries.',
    objectives: [
      'Meet short-term credit requirements for cultivation of crops and post-harvest marketing expenses.',
      'Provide working capital for maintenance of farm assets and allied agriculture activities (dairy, poultry, fisheries).',
      'Reduce dependence on high-interest informal moneylenders through affordable institutional credit.',
    ],
    benefits:
      'Revolving cash credit facility with flexible withdrawal and repayment, eligible for Government interest subvention and prompt repayment incentive on short-term crop loans up to ₹3 lakh as per prevailing RBI/Government norms.',
    eligibilitySummary:
      'Owner cultivators, tenant farmers, oral lessees, sharecroppers, and Self-Help Groups / Joint Liability Groups of farmers engaged in agriculture or allied activities.',
    eligibilityRules: {
      states: ['All India'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Large (> 10 ha)', 'Landless / Tenant'],
      notes: [
        'Available to individual farmers, joint borrowers, tenant farmers, sharecroppers, and animal husbandry/fisheries farmers.',
        'Collateral-free KCC loans up to prescribed RBI limits apply as per bank verification.',
        'Sanctioned limit is based on Scale of Finance fixed for the district and crop area.',
      ],
    },
    requiredDocuments: [
      'Filled KCC Application Form',
      'Identity & Address Proof (Aadhaar Card / Voter ID / PAN)',
      'Land ownership records or certified tenancy proof',
      'Passport-size photographs',
    ],
    applicationProcedure: [
      'Visit your nearest Public Sector Bank, Regional Rural Bank (RRB), Cooperative Bank branch, or apply via CSC / PM-KISAN KCC portal.',
      'Submit the KCC application form along with identity proof and land/allied activity records.',
      'The bank verifies land records, crops grown, and existing credit history to sanction the credit limit.',
      'Receive your RuPay KCC card and operate the revolving credit limit for seasonal farming expenses.',
    ],
    officialUrl: 'https://www.myscheme.gov.in/',
    logoUrl: '/src/assets/images/schemes/kcc.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: true,
  },
  {
    slug: 'soil-health-card',
    name: 'Soil Health Card (SHC) Scheme',
    shortName: 'Soil Health Card',
    governmentLevel: 'Central',
    stateName: 'All India',
    category: 'Soil Management',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
    overview:
      'The Soil Health Card Scheme assesses soil nutrient status across agricultural land and issues farmers a Soil Health Card containing crop-wise recommendations for nutrients and fertilizers.',
    objectives: [
      'Diagnose soil fertility status (macro-nutrients N, P, K, secondary nutrient S, micronutrients Zn, Fe, Cu, Mn, B, and pH/EC/OC).',
      'Promote balanced and judicious use of chemical fertilizers alongside organic manures.',
      'Improve long-term soil health and lower input costs for farmers.',
    ],
    benefits:
      'Free/subsidized scientific soil testing and personalized Soil Health Card with crop-specific fertilizer and soil amendment dosage guidance.',
    eligibilitySummary:
      'All farmers holding agricultural land across India can submit soil samples or participate through State Agriculture Department collection drives.',
    eligibilityRules: {
      states: ['All India'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Large (> 10 ha)'],
      minLandAcres: 0.1,
      notes: [
        'Available to all cultivators through State Agriculture Universities, Krishi Vigyan Kendras (KVKs), and Soil Testing Laboratories.',
        'Samples are collected from grid/farm plots and tested for 12 key soil parameters.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card / Farmer ID',
      'Land Survey / Khata Number details',
      'Mobile number for SMS updates and portal download',
    ],
    applicationProcedure: [
      'Contact your local Agriculture Extension Centre, Village Agriculture Worker, or nearest Krishi Vigyan Kendra (KVK).',
      'Register your farm plot details for soil sample collection or submit a collected sample following standard depth guidelines.',
      'Once tested at the Soil Testing Lab, download or collect your Soil Health Card via soilhealth.dac.gov.in.',
    ],
    officialUrl: 'https://soilhealth.dac.gov.in/',
    logoUrl: '/src/assets/images/schemes/soil-health-card.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: true,
  },
  {
    slug: 'pm-kusum',
    name: 'Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM)',
    shortName: 'PM-KUSUM',
    governmentLevel: 'Central',
    stateName: 'All India',
    category: 'Solar & Irrigation',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
    overview:
      'PM-KUSUM promotes clean energy in agriculture by providing financial support for standalone solar-powered irrigation pumps, solarization of existing grid-connected pumps, and decentralized solar power plants on barren/cultivable land.',
    objectives: [
      'Ensure daytime, reliable irrigation power for farmers independent of erratic grid supply or expensive diesel.',
      'De-dieselize the farm sector and reduce irrigation costs.',
      'Enable farmers to earn supplemental income by selling surplus solar power to DISCOMs where applicable.',
    ],
    benefits:
      'Capital subsidy support from Central and State Governments (typically 30% Central + 30% State subsidy for eligible standalone/grid solar pumps, with bank loan options for part of the remaining farmer share, subject to state implementing agency norms).',
    eligibilitySummary:
      'Individual farmers, groups of farmers, FPOs, cooperatives, and Water User Associations with agricultural land and valid water source/irrigation requirement (implemented via State Nodal Agencies).',
    eligibilityRules: {
      states: ['All India'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Large (> 10 ha)'],
      minLandAcres: 0.25,
      notes: [
        'Component-B supports standalone off-grid solar agriculture pumps (up to 7.5 HP standard support).',
        'Component-C supports solarization of existing grid-connected agricultural pumps.',
        'Farmers must apply ONLY through official State Implementing Agencies listed on pmkusum.mnre.gov.in to avoid fraudulent websites.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Agricultural Land Ownership Record (RTC / Patta)',
      'Existing Electricity Connection / Borewell / Water Source Proof',
      'Bank Account Details and Passport Photograph',
    ],
    applicationProcedure: [
      'Visit pmkusum.mnre.gov.in to identify your official State Nodal Agency.',
      'Apply online on the authorized State Implementing Agency portal when beneficiary windows open.',
      'Complete technical feasibility verification of the borewell/water source and deposit the farmer contribution share.',
      'Empaneled vendors install and commission the solar pump system after verification.',
    ],
    officialUrl: 'https://pmkusum.mnre.gov.in/',
    logoUrl: '/src/assets/images/schemes/pm-kusum.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: true,
  },
  {
    slug: 'pmksy-per-drop-more-crop',
    name: 'Pradhan Mantri Krishi Sinchayee Yojana — Per Drop More Crop (PMKSY)',
    shortName: 'PMKSY Micro-Irrigation',
    governmentLevel: 'Central',
    stateName: 'All India',
    category: 'Irrigation',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)'],
    overview:
      'Per Drop More Crop (PDMC) under PMKSY promotes precision water conservation at the farm level through financial assistance for Drip and Sprinkler micro-irrigation systems.',
    objectives: [
      'Enhance water use efficiency at the farm level through micro-irrigation technologies.',
      'Increase crop productivity and reduce fertilizer leaching and labour costs.',
      'Expand cultivable area under assured protective irrigation.',
    ],
    benefits:
      'Subsidized financial assistance for installing drip or sprinkler systems—higher subsidy percentages are typically earmarked for Small & Marginal farmers compared to other farmers, subject to State Horticulture/Agriculture norms.',
    eligibilitySummary:
      'Farmers with cultivable land and an assured water source (borewell, open well, farm pond, or canal) applying through their State Agriculture or Horticulture portal.',
    eligibilityRules: {
      states: ['All India'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
      minLandAcres: 0.2,
      notes: [
        'Requires an existing water source on the farm plot.',
        'Subsidy ceiling usually applies up to 5 hectares per beneficiary family as per guidelines.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & State Farmer Registration ID',
      'Land Record (RTC / Mutation Copy)',
      'Water Source Certificate / Borewell Details',
      'Quotation from registered micro-irrigation vendor & Bank Passbook',
    ],
    applicationProcedure: [
      'Register on your State Micro-Irrigation / Horticulture / Agriculture portal.',
      'Submit plot dimensions, crop type, and water source documentation along with a vendor estimate.',
      'After departmental technical inspection and work order approval, install the drip/sprinkler system.',
      'Subsidy is released directly to the farmer or registered vendor post physical verification.',
    ],
    officialUrl: 'https://pmksy.gov.in/',
    logoUrl: '/src/assets/images/schemes/pmksy-per-drop-more-crop.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  // ALL 28 INDIAN STATES AGRICULTURE SCHEMES
  {
    slug: 'andhra-pradesh-annadata-sukhibhava',
    name: 'Annadata Sukhibhava — YSR Rythu Bharosa Scheme',
    shortName: 'Annadata Sukhibhava',
    governmentLevel: 'State',
    stateName: 'Andhra Pradesh',
    category: 'Income Support',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Landless / Tenant'],
    overview:
      'Flagship farmer investment support programme by the Government of Andhra Pradesh providing annual direct financial assistance to landholding and registered tenant farmers before cropping seasons.',
    objectives: [
      'Provide timely crop investment support to reduce seasonal borrowing from informal lenders.',
      'Extend financial assistance to genuine tenant cultivators holding Crop Cultivator Rights Cards (CCRC).',
      'Supplement Central PM-KISAN payouts for comprehensive household farm stability.',
    ],
    benefits:
      'Financial assistance of ₹20,000 per year per eligible farmer family (₹14,000 State contribution combined with ₹6,000 under PM-KISAN), transferred via Direct Benefit Transfer in installments.',
    eligibilitySummary:
      'Resident cultivating farmer families in Andhra Pradesh holding agricultural land or valid Crop Cultivator Rights Cards (CCRC) with Aadhaar-seeded bank accounts.',
    eligibilityRules: {
      states: ['Andhra Pradesh'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Landless / Tenant'],
      notes: [
        'Tenant farmers in Andhra Pradesh must possess a valid CCRC issued through village secretariats.',
        'Aadhaar e-KYC and active NPCI-mapped bank account are mandatory for DBT credit.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card (with mobile OTP / biometric e-KYC)',
      'Pattadar Passbook / Land Record or valid CCRC (for tenant farmers)',
      'Aadhaar-seeded Bank Account Passbook',
      'Rice Card / Household verification at Village Secretariat (Grama Sachivalayam)',
    ],
    applicationProcedure: [
      'Visit annadathasukhibhava.ap.gov.in to verify your Aadhaar and farmer registration status under "Know Your Status".',
      'Update land records or apply for CCRC / e-KYC at your nearest Village Secretariat (Rythu Bharosa Kendra).',
      'Submit grievance or new addition requests through the Grama/Ward Secretariat portal before the seasonal cut-off.',
    ],
    officialUrl: 'https://annadathasukhibhava.ap.gov.in/',
    logoUrl: '/src/assets/images/schemes/andhra-pradesh-annadata-sukhibhava.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'arunachal-pradesh-atma-nirbhar-krishi-yojana',
    name: 'Atma Nirbhar Krishi Yojana (ANKY)',
    shortName: 'Atma Nirbhar Krishi',
    governmentLevel: 'State',
    stateName: 'Arunachal Pradesh',
    category: 'Farm Mechanization',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)'],
    overview:
      'State-sponsored credit-linked subsidy programme by the Government of Arunachal Pradesh empowering farmers and Self-Help Groups with farm machinery, scientific cultivation, and double-cropping support.',
    objectives: [
      'Promote modern farm mechanization and double cropping across hill and valley districts of Arunachal Pradesh.',
      'Combine institutional bank credit with upfront capital subsidy to lower equipment costs.',
      'Build self-reliant agricultural production clusters and agro-processing units.',
    ],
    benefits:
      'Credit-linked financial model with 45% State Government subsidy, 45% institutional bank loan, and 10% beneficiary contribution for approved agricultural machinery and farm development components.',
    eligibilitySummary:
      'Bonafide farmers, Farmer Producer Groups, and rural SHGs in Arunachal Pradesh recommended by District Agriculture Officers and partner banks.',
    eligibilityRules: {
      states: ['Arunachal Pradesh'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
      minLandAcres: 0.25,
      notes: [
        'Applies across agriculture and allied cultivation clusters identified by District Agriculture Officers.',
        'Requires joint appraisal with State-empaneled scheduled banks for the 45% loan component.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card and ST / Permanent Resident Certificate of Arunachal Pradesh',
      'Land Possession Certificate (LPC) / Gram Sabha Certification',
      'Bank Account Details & Project Proposal for Machinery/Cultivation',
      'Kisan Credit Card / Bank No-Dues Certificate',
    ],
    applicationProcedure: [
      'Visit agri.arunachal.gov.in or contact your District Agriculture Officer (DAO) for current-year ANKY guidelines.',
      'Submit the application with LPC, Aadhaar, and machinery/input quotation at the Block/District Agriculture Office.',
      'After field verification and bank loan sanction, the 45% State subsidy is released into the beneficiary loan account.',
    ],
    officialUrl: 'https://agri.arunachal.gov.in/',
    logoUrl: '/src/assets/images/schemes/arunachal-pradesh-atma-nirbhar-krishi-yojana.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'assam-mukhyamantri-krishi-sa-sajuli',
    name: 'Mukhyamantri Krishi Sa-Sajuli Yojana (MMKSSY)',
    shortName: 'Krishi Sa-Sajuli',
    governmentLevel: 'State',
    stateName: 'Assam',
    category: 'Farm Mechanization',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)'],
    overview:
      'Assam State Government farmer welfare scheme providing direct cash assistance to small and marginal cultivators to procure essential farming tools and hand implements.',
    objectives: [
      'Reduce manual drudgery by enabling marginal farmers to purchase durable agricultural tools.',
      'Increase timeliness of sowing, weeding, and harvesting operations across Assam.',
      'Strengthen small farm productivity through direct bank transfers.',
    ],
    benefits:
      'Direct financial assistance of ₹5,000 per eligible farmer family credited directly into Aadhaar-linked bank accounts for purchasing agricultural tools and implements.',
    eligibilitySummary:
      'Resident small and marginal farmers of Assam aged 21 years and above actively engaged in cultivation and verified by District Agriculture Offices.',
    eligibilityRules: {
      states: ['Assam'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)'],
      minLandAcres: 0.1,
      notes: [
        'Limited to one beneficiary per farming household; government employees and income tax payers are excluded.',
        'Priority is accorded to small and marginal cultivators verified by Agricultural Extension Assistants.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card / Voter ID of Assam',
      'Land Patta / Cultivation Proof verified by Gaon Burah or Revenue Circle',
      'Bank Account Passbook with IFSC',
      'Passport-size Photograph and Filled Application Form',
    ],
    applicationProcedure: [
      'Collect guidelines via assam.mygov.in or your local Agricultural Extension Assistant (AEA) / Krishi Bhavan office.',
      'Submit the prescribed application form with land cultivation proof and bank details at the Gaon Panchayat / Block Agriculture Office.',
      'Upon district-level screening and beneficiary list approval, ₹5,000 is credited directly via DBT.',
    ],
    officialUrl: 'https://assam.mygov.in/',
    logoUrl: '/src/assets/images/schemes/assam-mukhyamantri-krishi-sa-sajuli.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'bihar-krishi-input-anudan-dbt',
    name: 'Bihar Krishi Input Anudan & DBT Agriculture Schemes',
    shortName: 'Bihar DBT Agriculture',
    governmentLevel: 'State',
    stateName: 'Bihar',
    category: 'Crop Relief & Inputs',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Landless / Tenant'],
    overview:
      'Unified digital DBT platform of the Department of Agriculture, Government of Bihar, delivering crop input calamity compensation, diesel irrigation subsidies, and certified seed/machinery grants.',
    objectives: [
      'Compensate Bihar farmers rapidly for crop losses caused by floods, drought, or unseasonal rainfall.',
      'Provide subsidized diesel support for supplemental Kharif/Rabi irrigation and quality certified seeds.',
      'Ensure transparent Aadhaar-verified direct bank transfers without intermediaries.',
    ],
    benefits:
      'Per-hectare input subsidy grants for flood/drought-affected notified blocks (separate slabs for rainfed, irrigated, and perennial crops up to 2 hectares), plus diesel irrigation and seed subsidies via DBT.',
    eligibilitySummary:
      'Registered farmers in Bihar (including Raiyat landholders and verified non-Raiyat / sharecropper cultivators) holding a Bihar Agriculture Registration ID.',
    eligibilityRules: {
      states: ['Bihar'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Landless / Tenant'],
      notes: [
        'A 13-digit Bihar Farmer Registration ID from dbtagriculture.bihar.gov.in is mandatory before applying.',
        'Input grant windows open specifically for notified calamity-affected Panchayats/Blocks.',
      ],
    },
    requiredDocuments: [
      'Bihar Farmer Registration Number & Aadhaar Card',
      'LPC (Land Possession Certificate) / Land Revenue Receipt (for Raiyat farmers)',
      'Self-Declaration / Ward Sadasya counter-signed form (for Non-Raiyat cultivators)',
      'NPCI Aadhaar-linked Bank Account Details',
    ],
    applicationProcedure: [
      'Register online at dbtagriculture.bihar.gov.in using Aadhaar authentication to generate your 13-digit Farmer Registration ID.',
      'Log in to select active schemes such as Krishi Input Anudan, Diesel Anudan, or Seed Subsidy.',
      'Upload land/cultivation documents, submit via OTP verification, and track approval on the portal.',
    ],
    officialUrl: 'https://dbtagriculture.bihar.gov.in/',
    logoUrl: '/src/assets/images/schemes/bihar-krishi-input-anudan-dbt.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'chhattisgarh-krishak-unnati-yojana',
    name: 'Chhattisgarh Krishak Unnati Yojana',
    shortName: 'Krishak Unnati',
    governmentLevel: 'State',
    stateName: 'Chhattisgarh',
    category: 'Income Support',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
    overview:
      'Flagship state agricultural input-assistance scheme by the Government of Chhattisgarh guaranteeing remunerative returns per acre and incentivizing crop diversification across paddy, pulses, oilseeds, and millets.',
    objectives: [
      'Provide assured per-acre input assistance grants to enhance net farm income in Chhattisgarh.',
      'Promote crop diversification toward pulses, oilseeds, maize, millets, and cotton.',
      'Integrate land records and cooperative society procurement seamlessly through AgriStack.',
    ],
    benefits:
      'Direct per-acre financial input assistance transferred via DBT to registered farmers selling paddy or diversifying into approved Kharif crops as per annual State Cabinet norms.',
    eligibilitySummary:
      'Permanent resident farmers of Chhattisgarh registered under the state farmer registry and cooperative procurement societies with verified cultivable land records.',
    eligibilityRules: {
      states: ['Chhattisgarh'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Large (> 10 ha)'],
      minLandAcres: 0.1,
      notes: [
        'Requires digital crop survey (Girdawari) and registration through Cooperative Societies / Unified Farmer Portal.',
        'Eligible diversified non-paddy crops also qualify for state input assistance.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & Chhattisgarh Residence Proof',
      'Land Record (B-1 Khatoni / Khasra P-II)',
      'Loan Book (Rin Pustika) & Cooperative Society Registration',
      'Aadhaar-seeded Bank Account Passbook',
    ],
    applicationProcedure: [
      'Visit agriportal.cg.nic.in or your local Primary Agricultural Credit Cooperative Society (PACS) / Choice Centre.',
      'Complete farmer registration, digital crop area verification, and Aadhaar e-KYC.',
      'Input assistance benefits are credited directly to linked bank accounts post seasonal procurement verification.',
    ],
    officialUrl: 'https://agriportal.cg.nic.in/',
    logoUrl: '/src/assets/images/schemes/chhattisgarh-krishak-unnati-yojana.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'goa-shetkari-adhar-nidhi',
    name: 'Goa Shetkari Adhar Nidhi Scheme',
    shortName: 'Shetkari Adhar Nidhi',
    governmentLevel: 'State',
    stateName: 'Goa',
    category: 'Crop Relief & Inputs',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Landless / Tenant'],
    overview:
      'Dedicated state compensation and risk-support scheme by the Directorate of Agriculture, Government of Goa, protecting farmers against crop, produce, and farm-asset damage from unseasonal rain, floods, or cyclones.',
    objectives: [
      'Provide swift state-funded compensation beyond standard disaster relief norms for Goa cultivators.',
      'Protect farmers against losses to standing paddy, horticulture crops, and essential machinery.',
      'Encourage enrollment in the Goa Krishi Card ecosystem for streamlined agricultural subsidies.',
    ],
    benefits:
      'Need-based financial compensation per hectare/crop loss assessment transferred via DBT for damaged standing crops, harvested produce, agricultural inputs, and damaged tools.',
    eligibilitySummary:
      'Resident farmers cultivating land in Goa (preferably holding a valid Goa Krishi Card) whose crops or inputs are damaged by notified natural calamities.',
    eligibilityRules: {
      states: ['Goa'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Landless / Tenant'],
      notes: [
        'Field panchnama inspection by Taluka Zonal Agricultural Officers (ZAOs) verifies crop damage extent.',
        'Farmers holding a Goa Krishi Card receive priority DBT processing.',
      ],
    },
    requiredDocuments: [
      'Goa Krishi Card & Aadhaar Card',
      'Land Ownership (Form I & XIV) or Tenancy Declaration',
      'Panchnama / Damage Report verified by Zonal Agricultural Officer',
      'Bank Account Mandate Form & Passbook Copy',
    ],
    applicationProcedure: [
      'Report crop or input loss promptly to your Taluka Zonal Agricultural Office (ZAO) or via agri.goa.gov.in.',
      'Facilitate the field inspection panchnama conducted by departmental officials.',
      'Once approved by the Directorate of Agriculture, compensation is transferred directly to your bank account.',
    ],
    officialUrl: 'https://www.agri.goa.gov.in/',
    logoUrl: '/src/assets/images/schemes/goa-shetkari-adhar-nidhi.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'gujarat-ikhedut-agriculture-portal',
    name: 'Gujarat i-Khedut Agriculture Welfare & Mechanization Schemes',
    shortName: 'i-Khedut Gujarat',
    governmentLevel: 'State',
    stateName: 'Gujarat',
    category: 'Farm Mechanization',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
    overview:
      'Single-window digital subsidy platform operated by the Agriculture, Farmers Welfare & Co-operation Department, Government of Gujarat, covering over 100 schemes for farm machinery, irrigation, seeds, and horticulture.',
    objectives: [
      'Provide transparent online access to all Gujarat State agriculture, horticulture, and livestock subsidies.',
      'Offer capital assistance on tractors, power tillers, tarpaulins, godowns, and Kisan Parivahan vehicles.',
      'Ensure merit-based digital lottery selection and direct bank transfer of subsidy amounts.',
    ],
    benefits:
      'Tiered capital subsidies (typically 40% to 75% depending on farmer category and component) on tractors, farm implements, crop storage, micro-irrigation, polyhouses, and quality seeds.',
    eligibilitySummary:
      'Farmers possessing valid agricultural land records (8-A Khata) in Gujarat, including SC/ST, small, marginal, and women farmers prioritized for higher subsidy slabs.',
    eligibilityRules: {
      states: ['Gujarat'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Large (> 10 ha)'],
      minLandAcres: 0.1,
      notes: [
        'Separate annual application windows open for Agriculture, Horticulture, Animal Husbandry, and Fisheries components.',
        'Beneficiary must hold a valid 8-A / 7-12 Gujarat land extract.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & Gujarat Mobile Number',
      'Land Record Extract (7/12 and 8-A Khata)',
      'Bank Passbook / Cancelled Cheque',
      'Caste Certificate (for SC/ST higher subsidy slab) or Ration Card',
    ],
    applicationProcedure: [
      'Visit ikhedut.gujarat.gov.in (or i-Khedut 2.0) and open "Apply Online in Schemes".',
      'Select the open component (Agriculture / Horticulture / Mechanization), fill in 8-A Khata details, and submit online.',
      'Print the application receipt, submit physical verification copies to your Gram Sevak / Taluka office, and procure equipment from empaneled dealers upon approval.',
    ],
    officialUrl: 'https://ikhedut.gujarat.gov.in/',
    logoUrl: '/src/assets/images/schemes/gujarat-ikhedut-agriculture-portal.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'haryana-mera-pani-meri-virasat',
    name: 'Mera Pani Meri Virasat (Crop Diversification Incentive Scheme)',
    shortName: 'Mera Pani Meri Virasat',
    governmentLevel: 'State',
    stateName: 'Haryana',
    category: 'Crop Diversification',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
    overview:
      'Water-conservation and crop diversification scheme by the Government of Haryana incentivizing farmers to replace water-intensive paddy cultivation with less water-consuming Kharif crops.',
    objectives: [
      'Arrest groundwater depletion across critical dark-zone blocks of Haryana.',
      'Motivate farmers to adopt maize, cotton, bajra, pulses, oilseeds, horticulture, or agroforestry.',
      'Protect farmer incomes during transition through guaranteed per-acre DBT incentives and MSP procurement.',
    ],
    benefits:
      'Direct financial incentive of ₹7,000 per acre (with enhanced State updates up to ₹8,000/acre where notified) credited via DBT after physical verification on Meri Fasal Mera Byora, plus subsidized micro-irrigation support.',
    eligibilitySummary:
      'Farmers in Haryana who registered paddy land in the previous Kharif season and diversify their plots into alternative approved crops or fallow conservation.',
    eligibilityRules: {
      states: ['Haryana'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Large (> 10 ha)'],
      minLandAcres: 0.2,
      notes: [
        'Registration on Meri Fasal Mera Byora (fasal.haryana.gov.in) during the seasonal window is compulsory.',
        'Satellite and patwari field verification confirm non-paddy sowing before DBT payout.',
      ],
    },
    requiredDocuments: [
      'Parivar Pehchan Patra (PPP / Family ID) & Aadhaar Card',
      'Jamabandi / Khewat-Khatoni Land Details',
      'Meri Fasal Mera Byora Registration Receipt',
      'PPP-verified Aadhaar-linked Bank Account',
    ],
    applicationProcedure: [
      'Log in to fasal.haryana.gov.in using your Parivar Pehchan Patra (PPP) or mobile OTP.',
      'Register your agricultural land khasra numbers under Mera Pani Meri Virasat and select the alternative diversified crop.',
      'Await physical field verification; the incentive is released directly to your linked bank account in installments.',
    ],
    officialUrl: 'https://fasal.haryana.gov.in/',
    logoUrl: '/src/assets/images/schemes/haryana-mera-pani-meri-virasat.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'himachal-pradesh-prakritik-kheti-khushhal-kisan',
    name: 'Prakritik Kheti Khushhal Kisan Yojana (PK3Y)',
    shortName: 'Prakritik Kheti HP',
    governmentLevel: 'State',
    stateName: 'Himachal Pradesh',
    category: 'Organic & Natural Farming',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)'],
    overview:
      'Himachal Pradesh State Government mission promoting chemical-free Subhash Palekar Natural Farming (SPNF) across temperate, sub-tropical, and rainfed hill farms to boost soil fertility and reduce chemical input expenditure.',
    objectives: [
      'Lower cultivation costs for hill farmers by replacing chemical fertilizers and pesticides with on-farm bio-inputs.',
      'Support indigenous cow rearing (Pahadi cow), Jeevamrit drums, and cow-shed flooring for urine collection.',
      'Develop certified chemical-free produce chains with higher market realization.',
    ],
    benefits:
      'Subsidies up to ₹25,000 for indigenous cow purchase/shed support, 75% assistance on natural farming resource drums/kits (up to ₹750 per drum), and free training through ATMA extension staff.',
    eligibilitySummary:
      'Resident farmers and orchardists across all districts of Himachal Pradesh willing to adopt chemical-free natural farming practices on their landholdings.',
    eligibilityRules: {
      states: ['Himachal Pradesh'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
      farmingTypes: ['Organic', 'Mixed (Organic & Modern)', 'Traditional / Rainfed'],
      notes: [
        'Covers grain, vegetable, pulse, and apple/fruit orchard cultivators in Himachal Pradesh.',
        'Farmers receive Cetara / SPNF certification support for naturally grown produce.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & Bonafide Himachali Certificate',
      'Land Record (Jamabandi / Tatima)',
      'Bank Account Passbook Details',
      'Registration with Local Block ATMA / Agriculture Officer',
    ],
    applicationProcedure: [
      'Visit agriculture.hp.gov.in or contact your Block Technology Manager (BTM) under the District ATMA / Agriculture office.',
      'Complete the natural farming orientation session and enroll your farm plot under PK3Y.',
      'Submit kit/shed/indigenous-cow subsidy forms with verified bills; subsidy is credited directly to your bank account.',
    ],
    officialUrl: 'https://agriculture.hp.gov.in/',
    logoUrl: '/src/assets/images/schemes/himachal-pradesh-prakritik-kheti-khushhal-kisan.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'jharkhand-krishi-rin-mafi-yojana',
    name: 'Jharkhand Krishi Rin Mafi Yojana (JKRMY)',
    shortName: 'Jharkhand Rin Mafi',
    governmentLevel: 'State',
    stateName: 'Jharkhand',
    category: 'Agricultural Credit',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)'],
    overview:
      'Debt-relief programme by the Department of Agriculture, Animal Husbandry & Cooperative, Government of Jharkhand, waiving eligible short-term crop loans of indebted small and marginal farmers to restore institutional creditworthiness.',
    objectives: [
      'Relieve indebted farmers from overdue Kisan Credit Card (KCC) crop loan burdens.',
      'Restore eligibility for fresh institutional crop credit without resorting to moneylenders.',
      'Strengthen household economic security and prevent agrarian distress across Jharkhand.',
    ],
    benefits:
      'Direct crop loan waiver benefit up to ₹50,000 per eligible KCC borrower household (with enhanced state cabinet scope up to ₹2,00,000 for qualifying standard accounts as notified), credited directly to the lending bank loan account.',
    eligibilitySummary:
      'Permanent resident farmers of Jharkhand aged 18+ holding standard Kisan Credit Card (KCC) short-term crop loan accounts with Aadhaar e-KYC and valid Ration Card.',
    eligibilityRules: {
      states: ['Jharkhand'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)'],
      notes: [
        'Applies one standard KCC crop loan account per farming family as per cut-off date criteria.',
        'Aadhaar biometric e-KYC at Pragya Kendra (CSC) is mandatory to release loan waiver settlement.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & Jharkhand Ration Card',
      'Kisan Credit Card (KCC) Loan Account Passbook',
      'Land Record (Khata / Khatiyan)',
      'Active Mobile Number for OTP Verification',
    ],
    applicationProcedure: [
      'Visit jkrmy.jharkhand.gov.in or your nearest Pragya Kendra (CSC) / lending bank branch.',
      'Check if your KCC account appears in the bank-uploaded beneficiary list using your Aadhaar or KCC number.',
      'Complete Aadhaar e-KYC authentication and deposit nominal ₹1 verification fee; waiver amount settles directly with the bank.',
    ],
    officialUrl: 'https://jkrmy.jharkhand.gov.in/',
    logoUrl: '/src/assets/images/schemes/jharkhand-krishi-rin-mafi-yojana.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'karnataka-krishi-bhagya-raita-mitra',
    name: 'Karnataka Krishi Bhagya & Raita Mitra Agricultural Schemes',
    shortName: 'Krishi Bhagya',
    governmentLevel: 'State',
    stateName: 'Karnataka',
    category: 'Irrigation',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)'],
    overview:
      'Flagship dryland rainwater-harvesting and farm support programme implemented through the Department of Agriculture (Raita Mitra / FRUITS), Government of Karnataka, stabilizing rainfed yields across drought-prone taluks.',
    objectives: [
      'Harvest monsoon runoff in lined farm ponds (Krishi Honda) for life-saving supplemental crop irrigation.',
      'Provide subsidized polythene tarpaulin lining, micro-irrigation sets, diesel pumpsets, and shade-nets.',
      'Integrate farmer subsidies seamlessly via Karnataka FRUITS ID for transparent DBT disbursal.',
    ],
    benefits:
      'Subsidy up to 80% for General category farmers and 90% for SC/ST farmers toward farm pond (Krishi Honda) excavation, polythene lining, wire fencing, micro-irrigation sets, and pump sets as per Karnataka Agriculture norms.',
    eligibilitySummary:
      'Resident farmers of Karnataka holding agricultural land in notified rainfed taluks with a valid FRUITS Farmer ID (fid.karnataka.gov.in).',
    eligibilityRules: {
      states: ['Karnataka'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
      minLandAcres: 1.0,
      notes: [
        'Karnataka FRUITS registration ID is required to apply across state agriculture schemes.',
        'Farm pond dimensions and subsidy slabs vary by holding size and taluk agro-climatic zone.',
      ],
    },
    requiredDocuments: [
      'FRUITS ID & Aadhaar Card',
      'Land Record (RTC / Pahani)',
      'Caste Certificate (for 90% SC/ST subsidy slab)',
      'Aadhaar-linked Bank Passbook Details',
    ],
    applicationProcedure: [
      'Visit raitamitra.karnataka.gov.in or your local Raitha Samparka Kendra (RSK) with your FRUITS ID and RTC.',
      'Submit the Krishi Bhagya / Departmental Subsidy application during active Hobli/Taluk enrollment.',
      'Upon spot inspection and work completion verification, the subsidy is released via DBT.',
    ],
    officialUrl: 'https://raitamitra.karnataka.gov.in/',
    logoUrl: '/src/assets/images/schemes/karnataka-krishi-bhagya-raita-mitra.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'kerala-subhiksha-keralam-programme',
    name: 'Subhiksha Keralam Food Self-Sufficiency & Crop Support',
    shortName: 'Subhiksha Keralam',
    governmentLevel: 'State',
    stateName: 'Kerala',
    category: 'Horticulture & Inputs',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Landless / Tenant'],
    overview:
      'Comprehensive state agricultural mission by the Department of Agriculture Development & Farmers’ Welfare, Government of Kerala, expanding cultivation across fallow lands, homesteads, and group farms for rice, vegetables, tubers, and bananas.',
    objectives: [
      'Bring fallow agricultural land back under productive food-crop cultivation across all Kerala panchayats.',
      'Support Kudumbashree groups, youth collectives, and smallholders with planting material and irrigation inputs.',
      'Strengthen food security and value-added agro-processing in Kerala.',
    ],
    benefits:
      'Area-based cultivation incentives and input subsidies for fallow-land paddy, vegetable, tuber, and banana cultivation, plus free/subsidized vegetable seed kits, organic manures, and solar/drip infrastructure via AIMS portal.',
    eligibilitySummary:
      'Individual farmers, lease cultivators, Kudumbashree farming groups, and farmer collectives in Kerala registered through Krishi Bhavan / AIMS portal.',
    eligibilityRules: {
      states: ['Kerala'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Landless / Tenant'],
      notes: [
        'Implemented jointly by State Agriculture Department (Krishi Bhavans) and Local Self Government institutions.',
        'Landless collectives and Kudumbashree joint liability groups leasing fallow plots are also eligible.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & Kerala AIMS Portal Registration',
      'Land Tax Receipt / Lease Agreement for Fallow Land',
      'Bank Account Passbook & Krishi Bhavan Farmer Recommendation',
    ],
    applicationProcedure: [
      'Register on Kerala Agriculture Portal (keralaagriculture.gov.in) / AIMS or visit your Panchayat Krishi Bhavan.',
      'Enroll your cultivation plan (paddy, vegetables, tubers, or fallow land revival) with your Agricultural Officer.',
      'Receive input kits directly and DBT incentives after Krishi Bhavan field verification.',
    ],
    officialUrl: 'https://keralaagriculture.gov.in/',
    logoUrl: '/src/assets/images/schemes/kerala-subhiksha-keralam-programme.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'madhya-pradesh-mukhyamantri-kisan-kalyan',
    name: 'Madhya Pradesh Mukhyamantri Kisan Kalyan Yojana (MMKKY)',
    shortName: 'MP Kisan Kalyan',
    governmentLevel: 'State',
    stateName: 'Madhya Pradesh',
    category: 'Income Support',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
    overview:
      'State-funded direct income support scheme by the Government of Madhya Pradesh that tops up the Central PM-KISAN payout to guarantee enhanced annual financial stability for farming households.',
    objectives: [
      'Provide additional state financial assistance alongside PM-KISAN for seed, fertilizer, and cultivation expenses.',
      'Make Madhya Pradesh farming households financially resilient against input price fluctuations.',
      'Ensure transparent revenue-record verification through MP SAARA & Samagra portals.',
    ],
    benefits:
      'Additional state grant of ₹6,000 per year (in three installments of ₹2,000) to eligible MP farmers, providing a combined ₹12,000 annually when paired with PM-KISAN.',
    eligibilitySummary:
      'Permanent resident landholding farmers of Madhya Pradesh who are verified active beneficiaries under PM-KISAN with Samagra e-KYC.',
    eligibilityRules: {
      states: ['Madhya Pradesh'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Large (> 10 ha)'],
      minLandAcres: 0.1,
      notes: [
        'Beneficiary must hold an active PM-KISAN registration and Samagra ID linked to Aadhaar.',
        'Patwari and Tehsil verification on SAARA MP portal keeps beneficiary records current.',
      ],
    },
    requiredDocuments: [
      'PM-KISAN Registration ID & Aadhaar Card',
      'Samagra ID of Madhya Pradesh',
      'Land Record (Khasra / B1 Khatauni)',
      'DBT-enabled Bank Account Details',
    ],
    applicationProcedure: [
      'Verify your PM-KISAN & Khasra linkage via saara.mp.gov.in or through your Gram Panchayat / Patwari office.',
      'Complete Samagra Aadhaar e-KYC and PM-KISAN registration if applying as a new landholder.',
      'Track Mukhyamantri Kisan Kalyan installment status directly on the SAARA portal.',
    ],
    officialUrl: 'https://saara.mp.gov.in/',
    logoUrl: '/src/assets/images/schemes/madhya-pradesh-mukhyamantri-kisan-kalyan.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'maharashtra-namo-shetkari-mahasanman-nidhi',
    name: 'Maharashtra Namo Shetkari Mahasanman Nidhi Yojana',
    shortName: 'Namo Shetkari',
    governmentLevel: 'State',
    stateName: 'Maharashtra',
    category: 'Income Support',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
    overview:
      'State income-support initiative by the Government of Maharashtra matching the Central PM-KISAN grant rupee-for-rupee to double annual cash support for farming families across the state.',
    objectives: [
      'Provide reliable supplemental income to Maharashtra landholding farmers across Kharif and Rabi seasons.',
      'Complement MahaDBT farm mechanization and micro-irrigation programmes.',
      'Credit installments directly via Aadhaar-seeded Direct Benefit Transfer.',
    ],
    benefits:
      'Direct state income support of ₹6,000 per year (three installments of ₹2,000), raising combined PM-KISAN + State assistance to ₹12,000 per eligible farmer family annually.',
    eligibilitySummary:
      'Resident farmers of Maharashtra who hold cultivable agricultural land (7/12 extract) and are registered, e-KYC verified PM-KISAN beneficiaries.',
    eligibilityRules: {
      states: ['Maharashtra'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Large (> 10 ha)'],
      minLandAcres: 0.1,
      notes: [
        'Active PM-KISAN beneficiaries in Maharashtra with updated land seeding and e-KYC are enrolled automatically.',
        'Farmers can also apply for MahaDBT agricultural machinery, drip, and seed subsidies via mahadbt.maharashtra.gov.in.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & PM-KISAN Registration',
      'Land Record (7/12 Utara & 8-A Extract)',
      'Aadhaar-linked Bank Passbook',
      'Active Mobile Number',
    ],
    applicationProcedure: [
      'Ensure your PM-KISAN profile, 7/12 land seeding, and Aadhaar e-KYC are verified at your Talathi / Krishi Sahayak office.',
      'Check payment status or apply for complementary Maharashtra agricultural subsidies on mahadbt.maharashtra.gov.in.',
      'Installments are credited automatically via DBT alongside seasonal releases.',
    ],
    officialUrl: 'https://mahadbt.maharashtra.gov.in/',
    logoUrl: '/src/assets/images/schemes/maharashtra-namo-shetkari-mahasanman-nidhi.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'manipur-horticulture-soil-conservation-support',
    name: 'Manipur Agriculture, Organic Spice & Soil Conservation Mission',
    shortName: 'Manipur Agri Mission',
    governmentLevel: 'State',
    stateName: 'Manipur',
    category: 'Organic & Natural Farming',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)'],
    overview:
      'State agricultural & horticultural support framework by the Government of Manipur focusing on valley/hill rice intensification, organic high-value spices (Hathei chilli, ginger, turmeric), and terrace soil-water conservation.',
    objectives: [
      'Protect hill slopes with bench terracing, rainwater harvesting, and soil conservation works.',
      'Boost income from certified organic Manipur specialty spices, fruits, and aromatic crops.',
      'Provide subsidized HYV paddy seeds, farm tools, and post-harvest drying units.',
    ],
    benefits:
      'Subsidized planting materials, organic certification support, micro-irrigation/water harvesting tanks, and soil-conservation land development grants delivered through State Agriculture & Horticulture Departments.',
    eligibilitySummary:
      'Resident farmers, Farmer Producer Companies (FPCs), and SHGs across hill and valley districts of Manipur verified by District Agriculture Officers.',
    eligibilityRules: {
      states: ['Manipur'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
      notes: [
        'Special cluster support operates for organic ginger, turmeric, pineapple, and indigenous Chakhao black rice.',
        'Applications are processed through District Agriculture & Horticulture offices.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & Manipur Domicile / Landholding Proof',
      'Village Authority / Gram Panchayat Cultivation Certificate',
      'Bank Account Passbook & Recent Photograph',
    ],
    applicationProcedure: [
      'Visit agrimanipur.mn.gov.in to review seasonal seed, mechanization, and organic cluster announcements.',
      'Submit your application form with land/cultivation certificates at the concerned District Agriculture Office.',
      'Receive input kits, soil-conservation sanction, or DBT assistance after departmental verification.',
    ],
    officialUrl: 'https://agrimanipur.mn.gov.in/',
    logoUrl: '/src/assets/images/schemes/manipur-horticulture-soil-conservation-support.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'meghalaya-focus-farmer-collectivization',
    name: 'Meghalaya FOCUS & FOCUS+ (Farmers’ Collectivization Scheme)',
    shortName: 'Meghalaya FOCUS+',
    governmentLevel: 'State',
    stateName: 'Meghalaya',
    category: 'Income Support',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Landless / Tenant'],
    overview:
      'Meghalaya’s flagship farmer welfare and collectivization programme empowering smallholder farming households and Producer Groups across Khasi, Jaintia, and Garo Hills with direct working capital and market linkages.',
    objectives: [
      'Organize hilly smallholders into registered Producer Groups (PGs) for collective bargaining and value addition.',
      'Provide direct cash transfers to individual farming households under FOCUS+.',
      'Scale production of Lakadong turmeric, ginger, black pepper, honey, and livestock.',
    ],
    benefits:
      'Collective working capital grant of ₹5,000 per producer household within registered Producer Groups under FOCUS, plus an additional ₹5,000 direct household benefit via DBT under FOCUS+.',
    eligibilitySummary:
      'Resident farming and livestock-rearing households of Meghalaya registered as members of a village Producer Group (PG) verified by Block Mission Management Units.',
    eligibilityRules: {
      states: ['Meghalaya'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Landless / Tenant'],
      notes: [
        'Farmers enroll through a village Producer Group (minimum 10 members) for collective FOCUS grants.',
        'FOCUS+ extends direct financial assistance to verified individual Producer Group member households.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card / EPIC Voter ID of Meghalaya',
      'FOCUS / Producer Group Membership Card',
      'Bank Account Details of Household & Producer Group',
      'Village Headman / BMMU Verification Record',
    ],
    applicationProcedure: [
      'Visit meghalaya.gov.in or your nearest Block Mission Management Unit (BMMU) / IVCS centre.',
      'Join or form a village Producer Group engaged in crops, spices, or livestock.',
      'Submit household bank and KYC details for FOCUS+ verification and DBT transfer.',
    ],
    officialUrl: 'https://meghalaya.gov.in/',
    logoUrl: '/src/assets/images/schemes/meghalaya-focus-farmer-collectivization.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'mizoram-bana-kaih-agriculture-support',
    name: 'Mizoram Bana Kaih (Handholding Scheme) Agriculture Support',
    shortName: 'Bana Kaih Mizoram',
    governmentLevel: 'State',
    stateName: 'Mizoram',
    category: 'Agricultural Credit',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Landless / Tenant'],
    overview:
      'Flagship state economic handholding and agricultural upliftment programme by the Government of Mizoram supporting farmers, ginger/turmeric/broomstick cultivators, and agri-entrepreneurs with guaranteed credit and price support.',
    objectives: [
      'Replace shifting jhum practices with settled, profitable cultivation and post-harvest agro-processing.',
      'Provide collateral-free institutional credit backed by state government guarantees and interest subvention.',
      'Ensure assured procurement support for key hill cash crops (ginger, turmeric, broomstick, chilli).',
    ],
    benefits:
      'Collateral-free credit support with up to 100% interest subvention for timely repayments, Chief Minister’s Special Package grants for progress partners, and assured minimum support price procurement for key cash crops.',
    eligibilitySummary:
      'Bonafide cultivators, progressive farmers, cooperatives, and rural agri-entrepreneurs residing in Mizoram selected under District Handholding Committees.',
    eligibilityRules: {
      states: ['Mizoram'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Landless / Tenant'],
      notes: [
        'Support price procurement and agri-credit components coordinate through the Mizoram Department of Agriculture.',
        'Requires valid land pass / village council certification and project viability screening.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & Residential Certificate (Mizoram)',
      'Land Pass / LSC or Village Council Farming Certificate',
      'Project / Crop Activity Plan & Bank Account Passbook',
    ],
    applicationProcedure: [
      'Check seasonal guidelines at agri.mizoram.gov.in or your District Agriculture Office.',
      'Submit your Bana Kaih / Agricultural Support application with bank and project details at the Block/District Committee.',
      'Upon approval and bank sanction, access subsidized credit, interest subvention, or procurement support.',
    ],
    officialUrl: 'https://agri.mizoram.gov.in/',
    logoUrl: '/src/assets/images/schemes/mizoram-bana-kaih-agriculture-support.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'nagaland-organic-rainfed-agriculture-support',
    name: 'Nagaland Rainfed Crop Diversification & Organic Farming Support',
    shortName: 'Nagaland Agri',
    governmentLevel: 'State',
    stateName: 'Nagaland',
    category: 'Organic & Natural Farming',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)'],
    overview:
      'State agricultural development programme led by the Department of Agriculture, Government of Nagaland, empowering hill farmers with quality seeds, terrace rice & millet expansion, oilseed cultivation, and organic certification.',
    objectives: [
      'Increase food grain and oilseed self-sufficiency across terrace and rainfed jhum areas.',
      'Promote chemical-free organic cultivation of Naga King Chilli, ginger, millets, and soybean.',
      'Provide Agro-Met weather advisories and custom farm tools suited for hill agriculture.',
    ],
    benefits:
      'Subsidized HYV seeds, bio-fertilizers, terrace irrigation channels, small hill-farm machinery subsidies, and cluster organic certification assistance via District Agriculture Offices.',
    eligibilitySummary:
      'Active resident farmers, Village Development Boards (VDBs), and Farmer Interest Groups across all districts of Nagaland.',
    eligibilityRules: {
      states: ['Nagaland'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
      notes: [
        'Implemented through Village Development Boards, DAO offices, and cluster FPOs.',
        'Covers settled terrace paddy, maize, pulses, oilseeds, and organic spice clusters.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & Indigenous Inhabitant / Residence Proof',
      'Village Council / VDB Farming Recommendation',
      'Bank Account Details & Farmer Registration Form',
    ],
    applicationProcedure: [
      'Visit agriculture.nagaland.gov.in for current departmental circulars, seed availability, and Agro-Met advisories.',
      'Apply through your Village Council / Sub-Divisional Agriculture Office (SDAO) or District Agriculture Office (DAO).',
      'Collect sanctioned inputs or receive DBT benefits post cluster verification.',
    ],
    officialUrl: 'https://agriculture.nagaland.gov.in/',
    logoUrl: '/src/assets/images/schemes/nagaland-organic-rainfed-agriculture-support.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'odisha-cm-kisan-yojana',
    name: 'Odisha Mukhyamantri Kisan (CM-KISAN) Yojana',
    shortName: 'CM-KISAN Odisha',
    governmentLevel: 'State',
    stateName: 'Odisha',
    category: 'Income Support',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Landless / Tenant'],
    overview:
      'Flagship state farmer welfare scheme by the Government of Odisha providing assured seasonal financial assistance to small and marginal farmers plus livelihood capital to landless agricultural households.',
    objectives: [
      'Provide timely agricultural input support ahead of Kharif (Akshaya Tritiya) and Rabi (Nuakhai) seasons.',
      'Support landless agricultural households with livelihood activities such as goat rearing, poultry, fishery, or mushroom units.',
      'Complement PM-KISAN with seamless Krushak Odisha portal verification.',
    ],
    benefits:
      'Financial assistance of ₹4,000 per year in two equal installments of ₹2,000 each for eligible small & marginal farmers, and ₹12,500 livelihood assistance in three installments for landless agricultural households.',
    eligibilitySummary:
      'Permanent resident small/marginal farmer families and landless agricultural labourers in Odisha registered on the Krushak Odisha / CM-KISAN portal (excluding government/PSU employees and income-tax payers).',
    eligibilityRules: {
      states: ['Odisha'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Landless / Tenant'],
      notes: [
        'Small & marginal landholders receive cultivation assistance; landless households receive livelihood unit assistance.',
        'Aadhaar e-KYC on cmkisan.odisha.gov.in is mandatory for DBT release.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & Ration Card',
      'Record of Rights (RoR / Patta) for landholders',
      'Krushak Odisha Farmer ID',
      'Aadhaar-seeded Bank Account Details',
    ],
    applicationProcedure: [
      'Visit cmkisan.odisha.gov.in and check beneficiary status or click "Apply New / Update e-KYC".',
      'Ensure your farmer profile is registered on the Krushak Odisha database via Mo Seba Kendra / PACS.',
      'Track seasonal DBT credit around Akshaya Tritiya and Nuakhai directly on the CM-KISAN portal.',
    ],
    officialUrl: 'https://cmkisan.odisha.gov.in/',
    logoUrl: '/src/assets/images/schemes/odisha-cm-kisan-yojana.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'punjab-pani-bachao-machinery-subsidy',
    name: 'Punjab Pani Bachao Paisa Kamao & Farm Mechanization Portal',
    shortName: 'Punjab Agri & PBPK',
    governmentLevel: 'State',
    stateName: 'Punjab',
    category: 'Crop Diversification',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
    overview:
      'State agricultural conservation and mechanization framework by the Department of Agriculture & Farmers’ Welfare, Government of Punjab, featuring Direct Benefit Transfer of Electricity (Pani Bachao Paisa Kamao), DSR incentives, and subsidized Crop Residue Management machinery.',
    objectives: [
      'Conserve Punjab’s declining groundwater table by incentivizing efficient tube-well power usage and Direct Seeded Rice (DSR).',
      'Eliminate stubble burning through 50%–80% subsidies on Happy Seeders, Super Seeders, and Mulchers.',
      'Deliver fast online subsidy sanctions via the Punjab Agriculture Department portal.',
    ],
    benefits:
      'Cash incentives directly to farmer bank accounts for saving baseline tube-well electricity under Pani Bachao Paisa Kamao and per-acre DSR adoption incentives, plus 50% individual / 80% CHC subsidies on Crop Residue Management machinery.',
    eligibilitySummary:
      'Resident farmers, Cooperative Societies, and Custom Hiring Centres in Punjab holding valid land records and tube-well connections (where applicable).',
    eligibilityRules: {
      states: ['Punjab'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Large (> 10 ha)'],
      minLandAcres: 0.25,
      notes: [
        'Machinery subsidy applications open annually before Kharif/Rabi via agrimachinerypb.com / agri.punjab.gov.in.',
        'Direct Seeded Rice (DSR) requires field portal registration and physical/satellite verification.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & Punjab Residence Proof',
      'Jamabandi / Fard Land Record',
      'PSPCL Tube-Well Passbook (for Pani Bachao Paisa Kamao)',
      'Bank Account Details & Anaaj Kharid Registration',
    ],
    applicationProcedure: [
      'Visit agri.punjab.gov.in (or agrimachinerypb.com) to select open machinery, DSR, or water-saving schemes.',
      'Register your farm details, tube-well connection or machinery choice, and upload Jamabandi records.',
      'Post verification by Agriculture Department officers, incentives and subsidies are transferred via DBT.',
    ],
    officialUrl: 'https://agri.punjab.gov.in/',
    logoUrl: '/src/assets/images/schemes/punjab-pani-bachao-machinery-subsidy.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'rajasthan-rajkisan-sathi-schemes',
    name: 'Rajasthan RajKisan Sathi Agricultural Subsidy Schemes',
    shortName: 'RajKisan Sathi',
    governmentLevel: 'State',
    stateName: 'Rajasthan',
    category: 'Irrigation',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
    overview:
      'Unified paperless digital farmer welfare portal by the Government of Rajasthan offering direct subsidies on farm ponds (Khet Talai), water-storage diggis, irrigation pipelines, barbed-wire crop fencing (Tarbandi), and farm machinery.',
    objectives: [
      'Strengthen water security in arid and semi-arid districts via subsidized Khet Talai, Diggi, and pipelines.',
      'Protect standing crops from stray wildlife via Tarbandi fencing subsidies.',
      'Deliver transparent, SSO & Jan Aadhaar integrated DBT subsidies across all 50+ districts of Rajasthan.',
    ],
    benefits:
      'Capital subsidies typically ranging from 50% to 75% (higher ceilings for small/marginal/SC/ST farmers) on Khet Talai farm ponds (up to ₹63,000–₹1,35,000), Diggis, irrigation pipelines, Tarbandi crop fencing (up to ₹40,000–₹48,000), and Krishi Yantra implements.',
    eligibilitySummary:
      'Farmers domiciled in Rajasthan holding valid Jan Aadhaar ID and cultivable land Jamabandi records meeting scheme-specific minimum acreage.',
    eligibilityRules: {
      states: ['Rajasthan'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Large (> 10 ha)'],
      minLandAcres: 0.75,
      notes: [
        'Applications require Rajasthan SSO ID and Jan Aadhaar Card.',
        'Minimum land criteria vary by component (e.g., 0.3–1.5 hectares for Khet Talai or Tarbandi).',
      ],
    },
    requiredDocuments: [
      'Jan Aadhaar Card & Aadhaar Card',
      'Rajasthan SSO ID Login',
      'Latest Jamabandi Land Record & Field Map (Naksha Trace)',
      'Bank Account linked to Jan Aadhaar',
    ],
    applicationProcedure: [
      'Visit rajkisan.rajasthan.gov.in or an e-Mitra kiosk and sign in with your Rajasthan SSO ID.',
      'Choose "Apply for Subsidy" under Agriculture / Horticulture (Khet Talai, Pipeline, Tarbandi, or Krishi Yantra).',
      'Upload Jamabandi and Naksha Trace; receive administrative sanction and DBT payout after post-installation geo-verification.',
    ],
    officialUrl: 'https://rajkisan.rajasthan.gov.in/',
    logoUrl: '/src/assets/images/schemes/rajasthan-rajkisan-sathi-schemes.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'sikkim-mukhyamantri-krishi-atma-nirbhar',
    name: 'Sikkim Mukhyamantri Krishi Atma Nirbhar Yojana (MKANY)',
    shortName: 'Krishi Atma Nirbhar SK',
    governmentLevel: 'State',
    stateName: 'Sikkim',
    category: 'Organic & Natural Farming',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)'],
    overview:
      'Pioneering organic production-incentive scheme by the Agriculture Department, Government of Sikkim, rewarding organic cultivators with direct financial incentives per quantity of certified food grains, spices, vegetables, and pulses produced.',
    objectives: [
      'Incentivize commercial organic crop yields across India’s first 100% Organic State.',
      'Ensure remunerative returns for paddy, buckwheat, maize, ginger, large cardamom, turmeric, and vegetables.',
      'Promote rural self-reliance and sustainable organic farming among Sikkim youth and smallholders.',
    ],
    benefits:
      'Direct financial production incentives per kilogram/quintal of harvested and marketed organic produce (rice, maize, buckwheat, ginger, turmeric, pulses, vegetables) alongside organic bio-inputs support via Sikkim Agriculture Department.',
    eligibilitySummary:
      'Resident farmers of Sikkim possessing Sikkim Subject / COI and cultivable land actively producing notified organic crops verified by Block/District Agriculture Inspectors.',
    eligibilityRules: {
      states: ['Sikkim'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
      farmingTypes: ['Organic', 'Traditional / Rainfed', 'Mixed (Organic & Modern)'],
      notes: [
        'Covers both subsistence and commercial organic produce certified through Sikkim State Organic Certification Agency (SSOCA).',
        'Verification is carried out at GPU/Block agriculture centres during harvest seasons.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & Sikkim Subject / Certificate of Identification (COI)',
      'Land Record (Parcha / Khatiyan)',
      'Organic Certification / GPU Farmer Verification Form',
      'Bank Account Passbook Details',
    ],
    applicationProcedure: [
      'Visit agri.sikkim.gov.in or your GPU Agriculture Village Level Worker (VLW) / Block Administrative Centre.',
      'Register crop area and seasonal harvest quantities under MKANY guidelines.',
      'Following field yield verification by departmental officials, incentives are transferred via DBT.',
    ],
    officialUrl: 'https://agri.sikkim.gov.in/',
    logoUrl: '/src/assets/images/schemes/sikkim-mukhyamantri-krishi-atma-nirbhar.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'tamil-nadu-tnagrisnet-uzhavar-schemes',
    name: 'Tamil Nadu Farmers’ Welfare & Uzhavar Subsidy Schemes (TNAGRISNET)',
    shortName: 'TNAGRISNET / Uzhavar',
    governmentLevel: 'State',
    stateName: 'Tamil Nadu',
    category: 'Horticulture & Inputs',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Landless / Tenant'],
    overview:
      'Integrated state agricultural portal and welfare programmes (Kalaignarin All Village Integrated Agriculture Development Programme, Kuruvai Special Package, Micro-Irrigation & Free Farm Power) run by the Tamil Nadu Agriculture & Farmers Welfare Department.',
    objectives: [
      'Deliver transparent input subsidies for paddy, millets, pulses, micro-irrigation, and farm machinery across every village panchayat.',
      'Provide free farm electricity, solar pumpset subsidies, and Kuruvai/Samba special input kits.',
      'Connect farmers digitally with extension officers via Uzhavan mobile app and TNAGRISNET.',
    ],
    benefits:
      '100% micro-irrigation subsidy for Small & Marginal farmers (75% for others), subsidized Kuruvai/Samba certified seeds & bio-fertilizers, 40%–50% agricultural machinery subsidy, and free agricultural electricity tariff.',
    eligibilitySummary:
      'Resident farmers cultivating agricultural land in Tamil Nadu with valid Chitta / Adangal records registered via TNAGRISNET / Uzhavan portal.',
    eligibilityRules: {
      states: ['Tamil Nadu'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Landless / Tenant'],
      notes: [
        'Small & marginal farmers qualify for up to 100% state-topped micro-irrigation support.',
        'Beneficiary registration via Uzhavan App or Village Agricultural Extension Centres simplifies seasonal claims.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & Smart Ration Card',
      'Chitta and Adangal Land Records (FMB Sketch for irrigation)',
      'Small/Marginal Farmer Certificate (from Tahsildar/VAO)',
      'Bank Passbook Copy',
    ],
    applicationProcedure: [
      'Visit www.tnagrisnet.tn.gov.in or log into the Uzhavan App / Block Assistant Director of Agriculture (ADA) office.',
      'Register for open components (Micro-Irrigation, Kuruvai Package, Farm Machinery, or Kalaignar Village Development).',
      'Upload Chitta/Adangal details; subsidies are disbursed post field verification by Agricultural Officers.',
    ],
    officialUrl: 'https://www.tnagrisnet.tn.gov.in/',
    logoUrl: '/src/assets/images/schemes/tamil-nadu-tnagrisnet-uzhavar-schemes.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'telangana-rythu-bharosa-scheme',
    name: 'Telangana Rythu Bharosa Crop Investment Support Scheme',
    shortName: 'Rythu Bharosa TS',
    governmentLevel: 'State',
    stateName: 'Telangana',
    category: 'Income Support',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
    overview:
      'Telangana’s flagship per-acre seasonal crop investment support programme providing direct financial assistance before Kharif (Vanakalam) and Rabi (Yasangi) seasons to eliminate pre-sowing debt.',
    objectives: [
      'Provide assured per-acre seasonal investment support directly to cultivating landowners for seeds, fertilizers, and labour.',
      'Prevent small and marginal farmers from borrowing at high interest rates ahead of monsoon sowing.',
      'Complement Telangana’s Rythu Bima farmer life insurance coverage.',
    ],
    benefits:
      'Seasonal direct benefit transfer of ₹12,000 per acre per year (₹6,000 per acre per Kharif/Vanakalam and Rabi/Yasangi season) directly to Aadhaar-linked bank accounts of eligible cultivable landowners.',
    eligibilitySummary:
      'Resident farmers owning cultivable agricultural land in Telangana recorded in State Revenue/Bhu Bharati land records (excluding non-agricultural, barren, and commercial plots).',
    eligibilityRules: {
      states: ['Telangana'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Large (> 10 ha)'],
      minLandAcres: 0.1,
      notes: [
        'Applies strictly to cultivable agricultural land verified by revenue and Mandal Agriculture Officers.',
        'Landless agricultural labourer families are covered separately under Telangana’s Indiramma Athmeeya Bharosa initiative.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Digital Pattadar Passbook / Bhu Bharati Land Title',
      'Bank Account Passbook (Aadhaar-seeded)',
      'Mandal Agriculture Extension Officer (AEO) Verification',
    ],
    applicationProcedure: [
      'Visit rythubharosa.telangana.gov.in or your local Rythu Vedika / Mandal Agriculture Extension Officer (AEO).',
      'Confirm your digital Pattadar Passbook acreage and bank account details during pre-season verification.',
      'Once approved, seasonal per-acre support is deposited automatically via DBT before Kharif and Rabi sowing.',
    ],
    officialUrl: 'https://rythubharosa.telangana.gov.in/',
    logoUrl: '/src/assets/images/schemes/telangana-rythu-bharosa-scheme.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'tripura-cm-agriculture-mechanisation',
    name: 'Tripura Chief Minister Agriculture Mechanisation & Seed Support',
    shortName: 'Tripura Agri Mech',
    governmentLevel: 'State',
    stateName: 'Tripura',
    category: 'Farm Mechanization',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)'],
    overview:
      'State agricultural development scheme by the Department of Agriculture & Farmers’ Welfare, Government of Tripura, providing substantial machinery subsidies, HYV paddy/oilseed kits, and solar pump support for smallholders and tribal farmers.',
    objectives: [
      'Boost cropping intensity and labour efficiency across Tripura by subsidizing power tillers, paddy transplanters, and sprayers.',
      'Supply high-yielding and climate-resilient seeds alongside balanced soil-nutrition kits.',
      'Reduce post-harvest losses through mini rice mills and storage support.',
    ],
    benefits:
      'Subsidies ranging from 50% to 75% on power tillers, rotary tillers, sprayers, threshers, and pump sets, plus subsidized paddy, pulse, and mustard minikits via Agri-Subdivision offices.',
    eligibilitySummary:
      'Small, marginal, and tribal farmers residing in Tripura actively cultivating crops with valid RoR/Khatian or Forest Rights land title.',
    eligibilityRules: {
      states: ['Tripura'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)'],
      minLandAcres: 0.1,
      notes: [
        'Farmers apply through District/Sub-Divisional Agriculture Sector offices and state DBT lists.',
        'Covers both individual cultivators and registered Farmer Producer Groups.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & PRTC / Tripura Ration Card',
      'Land Record (Khatian / RoR or RoFR Patta)',
      'Bank Account Passbook & Two Photographs',
    ],
    applicationProcedure: [
      'Visit agri.tripura.gov.in or your local Agriculture Sector / Panchayat Agri-Assistant office.',
      'Submit the machinery/input subsidy application with land Khatian and Aadhaar copy.',
      'Collect the approved machine/inputs from authorized dealers after Sector Officer verification.',
    ],
    officialUrl: 'https://agri.tripura.gov.in/',
    logoUrl: '/src/assets/images/schemes/tripura-cm-agriculture-mechanisation.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'uttar-pradesh-agriculture-dbt-subsidy',
    name: 'UP Agriculture DBT Seed, Solar Pump & Farm Machinery Subsidy',
    shortName: 'UP Agriculture DBT',
    governmentLevel: 'State',
    stateName: 'Uttar Pradesh',
    category: 'Farm Mechanization',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
    overview:
      'Integrated farmer DBT subsidy platform of the Department of Agriculture, Government of Uttar Pradesh, delivering online token-based grants for farm implements, solar pumps, certified seeds, and agricultural diversification.',
    objectives: [
      'Make certified HYV wheat, paddy, pulse, and oilseed seeds affordable through 50% DBT subsidies.',
      'Empower UP farmers with subsidized rotavators, laser land levellers, combine harvesters, and solar water pumps.',
      'Eliminate manual queues through transparent online farmer registration and Labharthi Shuchi tracking.',
    ],
    benefits:
      '50% to 80% subsidy on agricultural implements, Custom Hiring Centres, solar irrigation pumps (2 HP to 10 HP), and up to 50% DBT cash back on certified seeds purchased at government seed stores.',
    eligibilitySummary:
      'Resident farmers of Uttar Pradesh registered on the UP Agriculture Portal holding Khatauni land records and Aadhaar-seeded bank accounts.',
    eligibilityRules: {
      states: ['Uttar Pradesh'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Large (> 10 ha)'],
      minLandAcres: 0.1,
      notes: [
        'Requires UP Agriculture Farmer Registration ID (Kisan Panjikaran) generated on agriculture.up.gov.in.',
        'Implements and solar pump bookings operate via online token generation / e-lottery windows.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & Mobile Number',
      'UP Land Record (Khatauni)',
      'UP Agriculture Registration Number',
      'Aadhaar-linked Bank Passbook',
    ],
    applicationProcedure: [
      'Visit agriculture.up.gov.in and complete "Farmer Registration (Kisan Panjikaran)" if not already registered.',
      'Generate an online token/booking for Agricultural Implements, Solar Pump, or Seed Subsidy during open booking windows.',
      'Upload purchase invoice/verification proof; subsidy is transferred directly to your bank account via DBT.',
    ],
    officialUrl: 'https://agriculture.up.gov.in/',
    logoUrl: '/src/assets/images/schemes/uttar-pradesh-agriculture-dbt-subsidy.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'uttarakhand-millet-mission-hill-agri',
    name: 'Uttarakhand State Millet Mission & Hill Agriculture Schemes',
    shortName: 'Uttarakhand Agri',
    governmentLevel: 'State',
    stateName: 'Uttarakhand',
    category: 'Crop Diversification',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)'],
    overview:
      'State agricultural promotion programme by the Department of Agriculture, Government of Uttarakhand, supporting mountain & plain farmers with Uttarakhand Millet Mission procurement (Mandua & Jhangora), polyhouse subsidies, and hill farm tools.',
    objectives: [
      'Revive traditional nutritious hill millets (Mandua/Ragi and Jhangora/Barnyard Millet) with assured MSP procurement.',
      'Provide lightweight power weeders, chaff cutters, and polyhouses tailored to small terrace holdings.',
      'Protect hill crops against wild animals through state-supported solar fencing and soil conservation.',
    ],
    benefits:
      '80% subsidy on certified millet seeds/inputs and assured MSP procurement for Mandua & Jhangora, plus 50%–80% subsidy on lightweight hill agricultural machinery, polyhouses, and micro-irrigation.',
    eligibilitySummary:
      'Resident farmers across all 13 hill and plain districts of Uttarakhand registered at their Nyaya Panchayat / Block Agriculture Office or State Agriculture portal.',
    eligibilityRules: {
      states: ['Uttarakhand'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)'],
      notes: [
        'Special priority and higher subsidy slabs apply to hill districts and women Self-Help Groups.',
        'Millet procurement operates through cooperative societies in notified mountain blocks.',
      ],
    },
    requiredDocuments: [
      'Aadhaar Card & Uttarakhand Domicile Proof',
      'Land Record (Khatauni)',
      'Bank Account Passbook (DBT enabled)',
      'Cooperative / Krishi Kendra Enrollment Form',
    ],
    applicationProcedure: [
      'Visit agriculture.uk.gov.in or your local Block Agriculture / Krishi Raksha Unit office.',
      'Apply for State Millet Mission seeds, hill machinery, or polyhouse subsidies with Khatauni documents.',
      'Sell surplus Mandua/Jhangora at notified cooperative centres or receive machinery subsidies directly via DBT.',
    ],
    officialUrl: 'https://agriculture.uk.gov.in/',
    logoUrl: '/src/assets/images/schemes/uttarakhand-millet-mission-hill-agri.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
  {
    slug: 'west-bengal-krishak-bandhu-scheme',
    name: 'West Bengal Krishak Bandhu (Assured Income & Social Security) Scheme',
    shortName: 'Krishak Bandhu WB',
    governmentLevel: 'State',
    stateName: 'West Bengal',
    category: 'Income Support',
    targetCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Landless / Tenant'],
    overview:
      'Flagship farmer welfare and life-security programme of the Government of West Bengal guaranteeing twice-yearly financial assistance based on landholding alongside universal death-benefit protection for cultivator families.',
    objectives: [
      'Provide assured seasonal financial support ahead of Kharif and Rabi cultivation in West Bengal.',
      'Include recorded Bargadars (sharecroppers) and patta holders within formal income support.',
      'Offer immediate ₹2,00,000 social-security protection to bereaved farming families.',
    ],
    benefits:
      'Annual financial assistance up to ₹10,000 per year for farmers holding 1 acre or more (pro-rata ₹4,000 minimum per year for holdings below 1 acre, paid in two equal Kharif & Rabi installments), plus ₹2,00,000 one-time death benefit for registered farmers aged 18–60.',
    eligibilitySummary:
      'Resident farmers, recorded Bargadars (sharecroppers), and Patta holders in West Bengal possessing valid land records (RoR / Parcha) and Voter ID (EPIC).',
    eligibilityRules: {
      states: ['West Bengal'],
      farmerCategories: ['Marginal (< 1 ha)', 'Small (1-2 ha)', 'Semi-Medium (2-4 ha)', 'Medium (4-10 ha)', 'Landless / Tenant'],
      notes: [
        'Recorded Bargadars (sharecroppers) with valid Bargadar Certificate qualify alongside landowner farmers.',
        'Beneficiary status is trackable directly by Voter ID (EPIC) or Aadhaar on krishakbandhu.wb.gov.in.',
      ],
    },
    requiredDocuments: [
      'Voter Identity Card (EPIC) & Aadhaar Card',
      'Land Record (Porcha / RoR) or Bargadar / Patta Certificate',
      'Active Bank Passbook Copy',
      'Passport-size Photograph & Mobile Number',
    ],
    applicationProcedure: [
      'Visit a Duare Sarkar camp or your Block Assistant Director of Agriculture (ADA) office with land Parcha, EPIC, and Aadhaar.',
      'Submit the filled Krishak Bandhu enrollment form; track beneficiary status online at krishakbandhu.wb.gov.in using Voter ID.',
      'Installments are credited automatically via DBT before Kharif and Rabi seasons.',
    ],
    officialUrl: 'https://krishakbandhu.wb.gov.in/',
    logoUrl: '/src/assets/images/schemes/west-bengal-krishak-bandhu-scheme.png',
    lastVerifiedDate: '2026-10-15',
    isPopular: false,
  },
];

export const INITIAL_AGRICULTURE_ITEMS: SeedAgricultureItem[] = [
  // CROPS — CEREALS & MILLETS
  {
    slug: 'paddy-rice',
    section: 'crop',
    title: 'Paddy (Rice)',
    subtitle: 'Cereals & Millets · Kharif & Summer Staple Crop',
    imageUrl: '/src/assets/images/crop_paddy_rice_1794924032597.jpg',
    summary:
      'Paddy is India’s primary food grain crop grown widely across irrigated plains, river deltas, and coastal regions under warm, humid conditions.',
    details: {
      'Crop Category': 'Cereals & Millets',
      'Suitable Climate': 'Warm and humid (20°C – 37°C) with 100–200 cm annual rainfall or assured irrigation.',
      'Soil Requirements': 'Deep clay loam or alluvial soils with good water retention capacity and pH 5.5 – 7.0.',
      'Main Season': 'Kharif (June – November); Rabi / Summer in southern and eastern irrigated belts.',
      'Cultivation Tip': 'Adopt System of Rice Intensification (SRI) or Alternate Wetting and Drying (AWD) to save 25–30% water.',
      'Crop Management': 'Maintain 2–5 cm standing water during vegetative growth; monitor for stem borer and blast disease.',
    },
    highlights: ['High water efficiency with SRI method', 'Green manuring before transplanting boosts yield', 'Check PMFBY notified crop status'],
  },
  {
    slug: 'wheat',
    section: 'crop',
    title: 'Wheat',
    subtitle: 'Cereals & Millets · Major Rabi Cereal Crop',
    imageUrl: '/src/assets/images/crop_wheat_field_1794924033298.jpg',
    summary:
      'Wheat is India’s principal winter (Rabi) cereal crop thriving in cool vegetative weather and warm, dry grain-ripening conditions.',
    details: {
      'Crop Category': 'Cereals & Millets',
      'Suitable Climate': 'Cool growing season (10°C – 15°C) and bright warm harvest weather (21°C – 26°C).',
      'Soil Requirements': 'Fertile well-drained loam and clay loam soils with neutral pH (6.0 – 7.5).',
      'Main Season': 'Rabi (Sowing: November; Harvesting: March – April).',
      'Cultivation Tip': 'Use Zero-Till Seed Drill after paddy harvest to save diesel and sow timely before terminal heat.',
      'Crop Management': 'Critical irrigation at Crown Root Initiation (20–25 days after sowing) and grain filling stages.',
    },
    highlights: ['Crown Root Initiation irrigation is vital', 'Timely November sowing maximizes grain weight', 'Zero-tillage saves cost'],
  },
  {
    slug: 'ragi-finger-millet',
    section: 'crop',
    title: 'Ragi (Finger Millet)',
    subtitle: 'Cereals & Millets · Climate-Resilient Dryland Millet',
    imageUrl: '/src/assets/images/crop_ragi_millet_1794924033643.jpg',
    summary:
      'Ragi is a highly nutritious, drought-hardy millet staple widely cultivated in southern Karnataka rainfed and semi-arid districts.',
    details: {
      'Crop Category': 'Cereals & Millets',
      'Suitable Climate': 'Tropical and sub-tropical warm climate (25°C – 32°C); thrives in 50–100 cm rainfall.',
      'Soil Requirements': 'Red loamy, sandy loam, and well-drained alluvial soils (pH 5.0 – 8.0).',
      'Main Season': 'Kharif (July – November); irrigated summer crop in January – April.',
      'Cultivation Tip': 'Intercrop with red gram (Tur) or field bean (Avare) for better soil nitrogen and risk diversification.',
      'Crop Management': 'Perform inter-cultivation at 20 and 35 days after sowing to conserve soil moisture.',
    },
    highlights: ['Drought tolerant millet crop', 'Rich in calcium and dietary fiber', 'Ideal for rainfed farms'],
  },
  {
    slug: 'maize-corn',
    section: 'crop',
    title: 'Maize (Corn)',
    subtitle: 'Cereals & Millets · Versatile Food, Feed & Industrial Grain',
    imageUrl: '/src/assets/images/crop_maize_corn_1794924034752.jpg',
    summary:
      'Maize is a high-yielding cereal grown across Kharif, Rabi, and Spring seasons for food grain, poultry feed, silage, and starch industries.',
    details: {
      'Crop Category': 'Cereals & Millets',
      'Suitable Climate': 'Warm sunny weather (21°C – 30°C) with 50–90 cm well-distributed rainfall; frost-sensitive.',
      'Soil Requirements': 'Deep, fertile, well-drained sandy loam to silt loam soils (pH 5.5 – 7.5).',
      'Main Season': 'Kharif (June – October); Rabi (October – February) in peninsular and eastern India.',
      'Cultivation Tip': 'Sow on ridges to prevent waterlogging during heavy monsoon spells and improve root aeration.',
      'Crop Management': 'Monitor early for Fall Armyworm in the leaf whorl; ensure adequate irrigation at tasseling and silking.',
    },
    highlights: ['High yield potential in Kharif & Rabi', 'Avoid standing water in early stage', 'Strong poultry feed demand'],
  },
  {
    slug: 'jowar-sorghum',
    section: 'crop',
    title: 'Jowar (Sorghum)',
    subtitle: 'Cereals & Millets · Hardy Dryland Food & Fodder Millet',
    imageUrl: '/src/assets/images/crop_jowar_sorghum_1794924034981.jpg',
    summary:
      'Jowar is a drought-tolerant cereal staple across North Karnataka and Maharashtra, valued both for grain nutrition and quality cattle fodder.',
    details: {
      'Crop Category': 'Cereals & Millets',
      'Suitable Climate': 'Warm semi-arid climate (25°C – 35°C) with 40–75 cm rainfall.',
      'Soil Requirements': 'Deep black cotton soils (Rabi) and medium red or sandy loams (Kharif), pH 6.0 – 8.0.',
      'Main Season': 'Kharif (June – October) and Rabi (September – January).',
      'Cultivation Tip': 'Use compartmental bunding before Rabi sowing on black soils to conserve residual monsoon moisture.',
      'Crop Management': 'Early sowing helps escape shoot fly damage; thin seedlings at 15 days for uniform spacing.',
    },
    highlights: ['Dual-purpose grain and dry fodder crop', 'Thrives on residual soil moisture', 'Low water requirement'],
  },
  {
    slug: 'bajra-pearl-millet',
    section: 'crop',
    title: 'Bajra (Pearl Millet)',
    subtitle: 'Cereals & Millets · Heat & Drought Resilient Grain',
    imageUrl: '/src/assets/images/crop_bajra_millet_1794924035515.jpg',
    summary:
      'Bajra withstands high temperatures and low rainfall better than almost any other cereal, making it vital for arid and semi-arid farming.',
    details: {
      'Crop Category': 'Cereals & Millets',
      'Suitable Climate': 'Hot, dry climate (28°C – 38°C) with 30–60 cm rainfall.',
      'Soil Requirements': 'Light sandy, sandy loam, and shallow red soils with good drainage (pH 6.0 – 8.0).',
      'Main Season': 'Kharif (June – September) and Summer irrigated in some regions.',
      'Cultivation Tip': 'Adopt ridge-and-furrow sowing and intercrop with green gram or moth bean to stabilize farm returns.',
      'Crop Management': 'Use downy mildew-resistant hybrids and avoid excessive nitrogen application.',
    },
    highlights: ['Extreme heat & drought tolerance', 'Rich in iron and zinc', 'Fast 75–90 day maturity'],
  },
  {
    slug: 'barley-jau',
    section: 'crop',
    title: 'Barley (Jau)',
    subtitle: 'Cereals & Millets · Salt & Drought Tolerant Rabi Cereal',
    imageUrl: '/src/assets/images/crop_barley_jau_1794924035794.jpg',
    summary:
      'Barley is a hardy winter cereal that yields reliably in saline, alkaline, and moisture-limited soils where wheat struggles.',
    details: {
      'Crop Category': 'Cereals & Millets',
      'Suitable Climate': 'Cool dry growing season (12°C – 22°C) during tillering and warm sunny ripening (25°C – 30°C).',
      'Soil Requirements': 'Sandy loam to saline-alkaline soils with moderate drainage (pH 6.5 – 8.5).',
      'Main Season': 'Rabi (Sowing: November; Harvesting: March – April).',
      'Cultivation Tip': 'Choose 2-row malt varieties for brewing/industrial contracts or 6-row varieties for grain and green fodder.',
      'Crop Management': 'Requires only 1–2 protective irrigations at active tillering and grain filling stages.',
    },
    highlights: ['Outperforms wheat in saline soils', 'Minimal irrigation need', 'Valued for malt & animal feed'],
  },
  {
    slug: 'foxtail-little-millet',
    section: 'crop',
    title: 'Foxtail & Little Millets (Navane / Samai)',
    subtitle: 'Cereals & Millets · Nutri-Cereals for Marginal Rainfed Lands',
    imageUrl: '/src/assets/images/crop_foxtail_millet_1794924036082.jpg',
    summary:
      'Foxtail millet (Navane) and Little millet (Samai) mature in just 75–90 days on shallow gravelly soils with minimal inputs and fetch growing Nutri-Cereal demand.',
    details: {
      'Crop Category': 'Cereals & Millets',
      'Suitable Climate': 'Warm semi-arid to sub-humid climate (24°C – 34°C) with 35–70 cm rainfall.',
      'Soil Requirements': 'Shallow red loamy, gravelly, and light sandy soils with good drainage (pH 5.5 – 7.5).',
      'Main Season': 'Kharif (June – September) and late-monsoon contingency crop in July – August.',
      'Cultivation Tip': 'Sow in lines 22.5 cm apart instead of broadcasting so inter-cultivation weeding is easy and uniform.',
      'Crop Management': 'Thin crowded seedlings at 15 days; harvest promptly at 80% panicle yellowing to avoid shattering.',
    },
    highlights: ['Short 75–90 day contingency crop', 'Low-glycemic superfood grain', 'Thrives with low fertilizer cost'],
  },

  // CROPS — PULSES
  {
    slug: 'tur-pigeon-pea',
    section: 'crop',
    title: 'Tur / Red Gram (Pigeon Pea)',
    subtitle: 'Pulses · Nitrogen-Fixing Rainfed Pulse Crop',
    imageUrl: '/src/assets/images/crop_tur_pigeonpea_1794924036410.jpg',
    summary:
      'Red gram is a deep-rooted pulse crop that enriches soil nitrogen naturally and supports dryland farm incomes in Karnataka and Maharashtra.',
    details: {
      'Crop Category': 'Pulses',
      'Suitable Climate': 'Warm semi-arid climate (20°C – 35°C) with 60–100 cm rainfall; sensitive to waterlogging.',
      'Soil Requirements': 'Well-drained black cotton or red loamy soils (pH 6.0 – 7.5).',
      'Main Season': 'Kharif (June – January).',
      'Cultivation Tip': 'Treat seeds with Rhizobium culture and Trichoderma before sowing to improve root nodulation.',
      'Crop Management': 'Nipping terminal buds at 45–50 days promotes branching and higher pod set.',
    },
    highlights: ['Fixes atmospheric nitrogen in soil', 'Avoid water stagnation in fields', 'Great intercrop with millets or cotton'],
  },
  {
    slug: 'bengal-gram-chickpea',
    section: 'crop',
    title: 'Bengal Gram (Chickpea / Chana)',
    subtitle: 'Pulses · Major Rabi Legume Crop',
    imageUrl: '/src/assets/images/crop_chickpea_chana_1794924036954.jpg',
    summary:
      'Bengal gram is India’s largest Rabi pulse crop, grown widely on conserved soil moisture after Kharif harvest without heavy irrigation.',
    details: {
      'Crop Category': 'Pulses',
      'Suitable Climate': 'Cool, dry winter climate (15°C – 25°C); sensitive to frost and heavy late rains.',
      'Soil Requirements': 'Well-drained black cotton and sandy loam soils without salinity (pH 6.0 – 7.8).',
      'Main Season': 'Rabi (October – March).',
      'Cultivation Tip': 'Avoid fine powdery tilth; slightly cloddy seedbed helps conserve soil moisture and reduce wilt.',
      'Crop Management': 'One light protective irrigation at pre-flowering (45 days) or pod development doubles yield in dry winters.',
    },
    highlights: ['Thrives on residual soil moisture', 'Improves soil fertility for next crop', 'Monitor for pod borer'],
  },
  {
    slug: 'green-gram-black-gram',
    section: 'crop',
    title: 'Green Gram (Moong) & Black Gram (Urad)',
    subtitle: 'Pulses · Short-Duration Catch & Intercrops',
    imageUrl: '/src/assets/images/crop_moong_urad_1794924037244.jpg',
    summary:
      'Moong and Urad mature in 60–75 days, making them ideal short-duration pulses for Kharif intercropping or summer rice-fallow cultivation.',
    details: {
      'Crop Category': 'Pulses',
      'Suitable Climate': 'Warm tropical weather (25°C – 35°C); avoid heavy rain during pod ripening.',
      'Soil Requirements': 'Well-drained loamy to black soils free of waterlogging (pH 6.2 – 7.5).',
      'Main Season': 'Kharif (June – September) and Summer (February – May).',
      'Cultivation Tip': 'Sow yellow mosaic virus-resistant varieties and treat seeds with Rhizobium and PSB biofertilizers.',
      'Crop Management': 'Keep fields weed-free during the first 25 days; harvest when 80% of pods turn dark.',
    },
    highlights: ['Short 65-day crop cycle', 'Adds organic nitrogen via leaf fall', 'Ideal between major cereal seasons'],
  },
  {
    slug: 'lentil-horsegram',
    section: 'crop',
    title: 'Lentil (Masoor) & Horsegram (Kulthi)',
    subtitle: 'Pulses · Winter & Hardy Dryland Legumes',
    imageUrl: '/src/assets/images/crop_lentil_horsegram_1794924037700.jpg',
    summary:
      'Lentil thrives as a winter crop in northern and central plains, while Horsegram (Huruli) is unmatched for late-season sowing on poor, dry Karnataka soils.',
    details: {
      'Crop Category': 'Pulses',
      'Suitable Climate': 'Lentil: cool winter (15°C – 25°C). Horsegram: warm dry semi-arid weather (22°C – 32°C).',
      'Soil Requirements': 'Loamy alluvial soils for Lentil; even shallow gravelly red soils suit Horsegram (pH 5.5 – 7.8).',
      'Main Season': 'Lentil: Rabi (Oct – March). Horsegram: Late Kharif / Rabi (Aug – Dec).',
      'Cultivation Tip': 'Sow Horsegram as an intercrop in young mango/coconut orchards or after late September showers.',
      'Crop Management': 'Treat seeds with Rhizobium and Trichoderma to guard against collar rot and root wilt.',
    },
    highlights: ['Horsegram thrives on minimal late rain', 'Enriches soil nitrogen naturally', 'Dual food & green fodder value'],
  },

  // CROPS — OILSEEDS
  {
    slug: 'groundnut-peanut',
    section: 'crop',
    title: 'Groundnut (Peanut)',
    subtitle: 'Oilseeds · Major Kharif & Summer Edible Oilseed',
    imageUrl: '/src/assets/images/crop_groundnut_peanut_1794924038008.jpg',
    summary:
      'Groundnut is a nitrogen-fixing legume oilseed grown across red and sandy soils for edible oil, protein-rich kernels, and nutritious haulms.',
    details: {
      'Crop Category': 'Oilseeds',
      'Suitable Climate': 'Warm tropical climate (25°C – 32°C) with 50–80 cm rainfall and dry weather at harvest.',
      'Soil Requirements': 'Loose, friable, well-drained sandy loam or red loamy soil so pegs can penetrate easily (pH 6.0 – 7.0).',
      'Main Season': 'Kharif (June – October) and Rabi/Summer irrigated (December – April).',
      'Cultivation Tip': 'Apply Gypsum (200 kg/acre) at flowering/pegging stage near the root zone for well-filled pods.',
      'Crop Management': 'Avoid disturbing soil after pegging starts; use sprinkler irrigation on light red soils.',
    },
    highlights: ['Gypsum at flowering boosts pod filling', 'Loose soil aids peg penetration', 'Fodder haulms nourish cattle'],
  },
  {
    slug: 'sunflower',
    section: 'crop',
    title: 'Sunflower',
    subtitle: 'Oilseeds · Photo-Insensitive Short-Duration Oilseed',
    imageUrl: '/src/assets/images/crop_sunflower_field_1794924038921.jpg',
    summary:
      'Sunflower grows across all three seasons due to day-length insensitivity, serving as a flexible oilseed crop in Karnataka and Andhra Pradesh.',
    details: {
      'Crop Category': 'Oilseeds',
      'Suitable Climate': 'Moderate warm climate (20°C – 30°C); tolerant to mild drought once established.',
      'Soil Requirements': 'Deep well-drained loamy and black soils (pH 6.5 – 8.0); avoid acidic waterlogged soils.',
      'Main Season': 'Kharif, Rabi, and Spring/Summer (90–100 days duration).',
      'Cultivation Tip': 'Keep bee boxes near fields or gently hand-pollinate heads during morning hours to improve seed setting.',
      'Crop Management': 'Apply Boron foliar spray at ray-floret stage if soil is boron-deficient; protect heads from birds.',
    },
    highlights: ['Can be sown in any season', 'Bee pollination increases seed fill', 'Short 95-day maturity'],
  },
  {
    slug: 'soybean',
    section: 'crop',
    title: 'Soybean',
    subtitle: 'Oilseeds · High-Protein Rainfed Kharif Crop',
    imageUrl: '/src/assets/images/crop_soybean_pods_1794924039051.jpg',
    summary:
      'Soybean is a dual oil-and-protein legume crop extensively cultivated across central and northern Karnataka and Madhya Pradesh during Kharif.',
    details: {
      'Crop Category': 'Oilseeds',
      'Suitable Climate': 'Warm humid monsoon weather (22°C – 32°C) with 60–90 cm rainfall.',
      'Soil Requirements': 'Well-drained fertile black cotton or clay loam soils (pH 6.0 – 7.5).',
      'Main Season': 'Kharif (June – October).',
      'Cultivation Tip': 'Use Broad Bed and Furrow (BBF) planters to drain excess monsoon water and maintain moisture during dry spells.',
      'Crop Management': 'Check germination % before sowing since soybean seed viability drops quickly in humid storage.',
    },
    highlights: ['40% protein and 20% oil content', 'BBF method prevents waterlogging', 'Enriches soil for Rabi wheat/gram'],
  },
  {
    slug: 'mustard-rapeseed',
    section: 'crop',
    title: 'Mustard (Rapeseed-Mustard)',
    subtitle: 'Oilseeds · Major Rabi Winter Oilseed',
    imageUrl: '/src/assets/images/crop_mustard_field_1794924038975.jpg',
    summary:
      'Mustard is India’s primary winter oilseed crop grown across northern plains and non-traditional dryland belts for pungent edible oil.',
    details: {
      'Crop Category': 'Oilseeds',
      'Suitable Climate': 'Cool dry growing season (10°C – 25°C) with clear sunny days.',
      'Soil Requirements': 'Sandy loam to clay loam soils with good drainage (pH 6.0 – 7.5).',
      'Main Season': 'Rabi (October – March).',
      'Cultivation Tip': 'Maintain optimum plant spacing via thinning at 15–20 days; apply Sulphur for higher oil percentage.',
      'Crop Management': 'Watch for painted bug at seedling stage and mustard aphids during cloudy winter days.',
    },
    highlights: ['Sulphur improves oil percentage', 'Low irrigation requirement', 'Ideal Rabi rotation crop'],
  },
  {
    slug: 'sesame-castor',
    section: 'crop',
    title: 'Sesame (Til) & Castor',
    subtitle: 'Oilseeds · Heat-Hardy Edible & Industrial Oilseeds',
    imageUrl: '/src/assets/images/crop_sesame_castor_1794924038134.jpg',
    summary:
      'Sesame yields high-value export edible oil in just 80–90 days, while Castor is an exceptionally deep-rooted industrial oilseed suited to dry red soils.',
    details: {
      'Crop Category': 'Oilseeds',
      'Suitable Climate': 'Warm dry tropical climate (25°C – 36°C); sensitive to prolonged waterlogging.',
      'Soil Requirements': 'Well-drained sandy loam and red loamy soils (pH 5.5 – 8.0).',
      'Main Season': 'Kharif (June – September) and Summer irrigated (Feb – May) for Sesame.',
      'Cultivation Tip': 'Mix tiny sesame seeds with fine dry sand (1:4) for even spacing; nip castor main spikes to encourage side racemes.',
      'Crop Management': 'Harvest sesame when lower capsules turn yellow-brown to minimize seed shattering.',
    },
    highlights: ['45–50% high-value oil in sesame', 'Castor resists severe mid-season drought', 'Strong export & industrial demand'],
  },
  {
    slug: 'linseed-safflower',
    section: 'crop',
    title: 'Linseed (Flax) & Safflower (Kusum)',
    subtitle: 'Oilseeds · Residual-Moisture Rabi Oilseeds',
    imageUrl: '/src/assets/images/crop_safflower_linseed_1794924039719.jpg',
    summary:
      'Safflower is a spiny, deep-rooted winter crop prized in North Karnataka/Maharashtra black soils for heart-healthy oil, alongside Omega-3 rich Linseed.',
    details: {
      'Crop Category': 'Oilseeds',
      'Suitable Climate': 'Cool dry Rabi winters (15°C – 28°C); tolerant to frost and dry winds.',
      'Soil Requirements': 'Deep moisture-retentive black soils (Safflower) and clay loams (Linseed), pH 6.0 – 8.0.',
      'Main Season': 'Rabi (September – February / March).',
      'Cultivation Tip': 'Plant Safflower as a border guard crop around Bengal Gram to deter stray cattle and earn extra oilseed income.',
      'Crop Management': 'Watch for aphids during early branching; apply Sulphur basally for improved oil content.',
    },
    highlights: ['Thrives on residual black-soil moisture', 'Safflower acts as natural border crop', 'Rich in polyunsaturated & Omega-3 oils'],
  },

  // CROPS — CASH & FIBRE
  {
    slug: 'sugarcane',
    section: 'crop',
    title: 'Sugarcane',
    subtitle: 'Cash & Fibre · Long-Duration Irrigated Commercial Crop',
    imageUrl: '/src/assets/images/crop_sugarcane_stalks_1794924040179.jpg',
    summary:
      'Sugarcane is a major agro-industrial cash crop cultivated in irrigated river basins of Karnataka, Maharashtra, and Uttar Pradesh.',
    details: {
      'Crop Category': 'Cash & Fibre',
      'Suitable Climate': 'Long warm humid growing phase (25°C – 35°C) followed by cool dry ripening weather for sugar accumulation.',
      'Soil Requirements': 'Deep, rich, well-drained loamy or heavy alluvial soils (pH 6.0 – 7.5).',
      'Main Season': 'Adsali (July – August), Pre-seasonal (Oct – Nov), and Suru/Spring (Jan – March); 10–14 months cycle.',
      'Cultivation Tip': 'Adopt wide-row planting (4–5 ft) with subsurface drip irrigation and trash mulching to cut water use by 40%.',
      'Crop Management': 'Earth up rows at 90–120 days to prevent lodging; intercrop short-duration onion or green gram initially.',
    },
    highlights: ['Wide-row + drip saves 40% water', 'Trash mulching conserves moisture', 'Supports ratoon cropping'],
  },
  {
    slug: 'cotton',
    section: 'crop',
    title: 'Cotton',
    subtitle: 'Cash & Fibre · Primary Natural Fibre Crop',
    imageUrl: '/src/assets/images/crop_cotton_bolls_1794924039277.jpg',
    summary:
      'Cotton (“White Gold”) is India’s leading fibre crop thriving on deep moisture-retentive black soils with warm sunny boll-opening weather.',
    details: {
      'Crop Category': 'Cash & Fibre',
      'Suitable Climate': 'Warm climate (25°C – 35°C) with at least 180 frost-free days and dry weather at boll bursting.',
      'Soil Requirements': 'Deep black cotton soils (Regur) and well-drained alluvial loams (pH 6.0 – 8.0).',
      'Main Season': 'Kharif (May – December / January).',
      'Cultivation Tip': 'Install pheromone traps (4–5 per acre) early to monitor Pink Bollworm and avoid indiscriminate spraying.',
      'Crop Management': 'Prevent waterlogging at seedling stage and pick clean dry bolls separately for better market grade.',
    },
    highlights: ['Pheromone traps help manage bollworm', 'Clean picking boosts lint price', 'Thrives on black cotton soil'],
  },
  {
    slug: 'jute-mesta',
    section: 'crop',
    title: 'Jute & Mesta',
    subtitle: 'Cash & Fibre · Biodegradable Natural Bast Fibre Crops',
    imageUrl: '/src/assets/images/crop_jute_mesta_1794924041083.jpg',
    summary:
      'Known as the Golden Fibre, Jute grows in humid eastern river plains while hardy Mesta adapts to drier peninsular soils for sacking, cordage, and eco-packaging.',
    details: {
      'Crop Category': 'Cash & Fibre',
      'Suitable Climate': 'Warm humid weather (24°C – 37°C) with 120–180 cm rainfall for Jute; drier semi-arid belts suit Mesta.',
      'Soil Requirements': 'Fertile new grey alluvial soils (Jute) and light red/loamy soils (Mesta), pH 5.5 – 7.5.',
      'Main Season': 'Pre-Kharif / Kharif (March – August).',
      'Cultivation Tip': 'Harvest at small-pod stage (120 days) for finest fibre strength and use microbial CRIJAF SONA retting powder.',
      'Crop Management': 'Ret bundles in slow-flowing clean water for 10–14 days to extract bright golden fibre.',
    },
    highlights: ['100% biodegradable packaging fibre', 'Microbial retting cuts water time', 'Mesta tolerates drier uplands'],
  },

  // CROPS — PLANTATION & SPICES
  {
    slug: 'coconut',
    section: 'crop',
    title: 'Coconut',
    subtitle: 'Plantation & Spices · Perennial Coastal & Maidan Tree Crop',
    imageUrl: '/src/assets/images/crop_coconut_grove_1794924041853.jpg',
    summary:
      'Coconut provides year-round nuts, coir, tender water, and copra income across coastal and southern plains of Karnataka, Kerala, and Tamil Nadu.',
    details: {
      'Crop Category': 'Plantation & Spices',
      'Suitable Climate': 'Warm humid tropical climate (22°C – 34°C) with evenly distributed rainfall or basin/drip irrigation.',
      'Soil Requirements': 'Deep sandy loam, coastal alluvium, red loamy, or laterite soils at least 1.2 m deep (pH 5.5 – 7.5).',
      'Main Season': 'Perennial; planting best at onset of monsoon (June – July).',
      'Cultivation Tip': 'Grow intercrops like pepper, cocoa, banana, or turmeric between mature palms to double per-acre income.',
      'Crop Management': 'Apply organic compost in circular basins and manage Rhinoceros beetle with pheromone traps.',
    },
    highlights: ['Multi-tier intercropping compatible', 'Year-round perennial returns', 'Mulch basins in summer'],
  },
  {
    slug: 'arecanut',
    section: 'crop',
    title: 'Arecanut',
    subtitle: 'Plantation & Spices · High-Value Malnad & Plains Crop',
    imageUrl: '/src/assets/images/crop_arecanut_palm_1794924101869.jpg',
    summary:
      'Arecanut is a shade-loving tropical palm cultivated extensively in Malnad, coastal, and central Karnataka regions.',
    details: {
      'Crop Category': 'Plantation & Spices',
      'Suitable Climate': 'Warm humid climate (18°C – 35°C) with good drainage and protection from scorching western sun.',
      'Soil Requirements': 'Deep well-drained laterite, red loam, or alluvial soils (pH 5.5 – 7.0); never tolerate water stagnation.',
      'Main Season': 'Perennial; seedlings planted May – June with shade crops like banana.',
      'Cultivation Tip': 'Ensure deep drainage trenches in heavy-rainfall Malnad gardens to prevent Koleroga (fruit rot).',
      'Crop Management': 'Practice timely Bordeaux mixture spraying before monsoon peaks as advised by horticulture officers.',
    },
    highlights: ['Needs proper drainage channels', 'Grow banana for young palm shade', 'Drip irrigation boosts nut set'],
  },
  {
    slug: 'coffee-arabica-robusta',
    section: 'crop',
    title: 'Coffee (Arabica & Robusta)',
    subtitle: 'Plantation & Spices · Shade-Grown Western Ghats Crop',
    imageUrl: '/src/assets/images/crop_coffee_plantation_1794924101837.jpg',
    summary:
      'Indian coffee is uniquely grown under a two-tier native forest shade canopy across Kodagu, Chikkamagaluru, and Hassan hills.',
    details: {
      'Crop Category': 'Plantation & Spices',
      'Suitable Climate': 'Cool humid hill climate: Arabica (15°C – 25°C, 700–1600 m); Robusta (20°C – 30°C, 500–1000 m).',
      'Soil Requirements': 'Deep, fertile, humus-rich, slightly acidic forest loams (pH 5.5 – 6.5).',
      'Main Season': 'Perennial; blossom showers in March–April; harvesting Nov – March.',
      'Cultivation Tip': 'Maintain silver oak and native dadap shade trees and intercrop black pepper on shade standards.',
      'Crop Management': 'Apply agricultural lime based on soil pH testing and prune bushes promptly after harvest.',
    },
    highlights: ['Shade-grown ecological biodiversity', 'Intercrop with black pepper & cardamom', 'Soil pH management is critical'],
  },
  {
    slug: 'chilli-turmeric',
    section: 'crop',
    title: 'Chilli & Turmeric',
    subtitle: 'Plantation & Spices · High-Demand Spice Crops',
    imageUrl: '/src/assets/images/crop_chilli_turmeric_1794924103429.jpg',
    summary:
      'Dry chilli (such as Byadagi) and turmeric are high-value spice crops offering strong returns when grown on raised beds with drip irrigation.',
    details: {
      'Crop Category': 'Plantation & Spices',
      'Suitable Climate': 'Warm humid to semi-arid climate (20°C – 32°C); dry sunny weather aids chilli drying and colour.',
      'Soil Requirements': 'Well-drained rich red loamy or black soils high in organic matter (pH 6.0 – 7.2).',
      'Main Season': 'Turmeric: May – June planting (8–9 months). Chilli: Kharif (June–July) and Rabi irrigated.',
      'Cultivation Tip': 'Use raised beds with plastic/straw mulch and drip fertigation to prevent rhizome rot and thrips.',
      'Crop Management': 'Monitor chilli for thrips and mites (leaf curl); treat turmeric seed rhizomes before planting.',
    },
    highlights: ['Raised beds prevent rhizome rot', 'High export & spice market demand', 'Solar drying preserves colour'],
  },
  {
    slug: 'black-pepper-cardamom',
    section: 'crop',
    title: 'Black Pepper & Cardamom',
    subtitle: 'Plantation & Spices · Export-Grade Western Ghats Spices',
    imageUrl: '/src/assets/images/crop_pepper_cardamom_1794924103604.jpg',
    summary:
      'Black pepper ("King of Spices") climbs on arecanut palms or silver oak shade trees, while small cardamom ("Queen of Spices") thrives under humid evergreen hill canopies.',
    details: {
      'Crop Category': 'Plantation & Spices',
      'Suitable Climate': 'Warm humid tropical hills (15°C – 32°C) with 150–300 cm rainfall and filtered shade.',
      'Soil Requirements': 'Deep, well-drained humus-rich forest loams and laterites (pH 5.0 – 6.5).',
      'Main Season': 'Perennial; planting in June – July; harvesting Dec – March (Pepper) and Aug – Dec (Cardamom).',
      'Cultivation Tip': 'Apply Trichoderma-enriched neem cake around vine basins before monsoon to prevent Phytophthora quick wilt.',
      'Crop Management': 'Maintain shade regulation (40–50% light) and ensure sloped drainage trenches.',
    },
    highlights: ['Intercrops seamlessly in coffee & arecanut', 'Strong export spice prices', 'Trichoderma guards against quick wilt'],
  },
  {
    slug: 'ginger-garlic',
    section: 'crop',
    title: 'Ginger & Garlic',
    subtitle: 'Plantation & Spices · High-Value Culinary & Medicinal Crops',
    imageUrl: '/src/assets/images/crop_ginger_garlic_1794924103986.jpg',
    summary:
      'Ginger thrives in warm humid raised beds and coconut/arecanut interspaces, while Garlic flourishes in cool Rabi plains with friable loamy soil.',
    details: {
      'Crop Category': 'Plantation & Spices',
      'Suitable Climate': 'Ginger: warm humid (22°C – 32°C) with partial shade. Garlic: cool vegetative weather (12°C – 24°C).',
      'Soil Requirements': 'Friable, well-drained sandy loam or rich red loam high in humus (pH 6.0 – 7.0).',
      'Main Season': 'Ginger: April – May planting (8 months). Garlic: Rabi (October – March).',
      'Cultivation Tip': 'Mulch ginger beds thickly with green leaves right after planting to suppress weeds and boost rhizome sprouting.',
      'Crop Management': 'Strictly avoid waterlogging in ginger to stop Pythium soft rot; cure garlic bulbs in shade before storage.',
    },
    highlights: ['Green leaf mulching doubles ginger sprouting', 'Ideal coconut/arecanut intercrop', 'Proper curing keeps garlic 6+ months'],
  },

  // CROPS — VEGETABLES & FRUITS
  {
    slug: 'tomato',
    section: 'crop',
    title: 'Tomato',
    subtitle: 'Vegetables & Fruits · Short-Cycle High-Yield Vegetable',
    imageUrl: '/src/assets/images/crop_tomato_vines_1794924104238.jpg',
    summary:
      'Tomato is a major horticultural vegetable grown across Karnataka and India in open fields and polyhouses for fresh and processing markets.',
    details: {
      'Crop Category': 'Vegetables & Fruits',
      'Suitable Climate': 'Moderate warm climate (18°C – 28°C); extreme heat (>35°C) reduces flower fruit-set.',
      'Soil Requirements': 'Well-drained fertile sandy loam to red loam soils rich in organic matter (pH 6.0 – 7.0).',
      'Main Season': 'Year-round across Kharif, Rabi, and Summer (110–130 days total cycle).',
      'Cultivation Tip': 'Use staking/trellising and drip irrigation with silver-black mulch to keep fruits clean and cut blight.',
      'Crop Management': 'Install yellow sticky traps for whiteflies (leaf curl vector) and rotate away from solanaceous crops.',
    },
    highlights: ['Staking increases clean marketable fruit', 'Mulching reduces weed & blight', 'Eligible for PMKSY drip support'],
  },
  {
    slug: 'onion-potato',
    section: 'crop',
    title: 'Onion & Potato',
    subtitle: 'Vegetables & Fruits · Essential Bulb & Tuber Crops',
    imageUrl: '/src/assets/images/crop_onion_potato_1794924104396.jpg',
    summary:
      'Onion and potato are vital staple vegetables requiring well-aerated soils and careful curing/storage to minimize post-harvest losses.',
    details: {
      'Crop Category': 'Vegetables & Fruits',
      'Suitable Climate': 'Onion prefers mild cool vegetative growth and dry warm curing; Potato needs cool nights (15°C – 20°C) for tuberization.',
      'Soil Requirements': 'Friable, well-drained sandy loam to medium loam soils free of clods (pH 5.8 – 7.2).',
      'Main Season': 'Kharif, Late Kharif, and Rabi (Onion); Rabi / Hill Kharif (Potato).',
      'Cultivation Tip': 'Stop irrigation 12–15 days before onion harvest and cure bulbs in shade for better storage life.',
      'Crop Management': 'Use certified disease-free seed tubers for potato and earth up ridges at 30 days to prevent green tubers.',
    },
    highlights: ['Proper curing extends onion shelf life', 'Certified tubers prevent bacterial wilt', 'Balanced potash improves tuber/bulb quality'],
  },
  {
    slug: 'mango-banana',
    section: 'crop',
    title: 'Mango & Banana',
    subtitle: 'Vegetables & Fruits · Major Commercial Fruit Crops',
    imageUrl: '/src/assets/images/crop_mango_banana_1794924104293.jpg',
    summary:
      'Mango (Alphonso, Banganapalli, Mallika) and Banana (Grand Naine, Yelakki) anchor horticultural farm incomes across India.',
    details: {
      'Crop Category': 'Vegetables & Fruits',
      'Suitable Climate': 'Tropical/sub-tropical warm climate (22°C – 35°C); banana needs high moisture and wind protection.',
      'Soil Requirements': 'Deep well-drained alluvial or red loamy soils (pH 6.0 – 7.5); avoid high water table for mango.',
      'Main Season': 'Banana: Year-round tissue-culture planting (11–13 months). Mango: Monsoon planting; summer harvest.',
      'Cultivation Tip': 'Plant tissue-culture banana suckers with drip fertigation and windbreak trees along orchard borders.',
      'Crop Management': 'Prune mango canopy after harvest for sunlight penetration and bag fruits against fruit fly.',
    },
    highlights: ['Tissue-culture banana gives uniform bunches', 'Drip fertigation boosts fruit size', 'High horticultural value'],
  },
  {
    slug: 'pomegranate-grapes',
    section: 'crop',
    title: 'Pomegranate & Grapes',
    subtitle: 'Vegetables & Fruits · Arid-Friendly High-Export Orchards',
    imageUrl: '/src/assets/images/crop_pomegranate_grapes_1794924105719.jpg',
    summary:
      'Pomegranate (Bhagwa) and Table/Raisin Grapes generate top horticultural profits across semi-arid districts of Karnataka and Maharashtra using precision drip irrigation.',
    details: {
      'Crop Category': 'Vegetables & Fruits',
      'Suitable Climate': 'Hot dry summers and mild winters (20°C – 38°C); low humidity during fruiting cuts fungal rot.',
      'Soil Requirements': 'Well-drained medium black, red loamy, or gravelly calcareous soils (pH 6.5 – 8.0).',
      'Main Season': 'Perennial orchards; regulated into Hasta, Mrig, or Ambe bahar flowering cycles via pruning and stress management.',
      'Cultivation Tip': 'Use drip fertigation with soluble Potash and Boron; install anti-hail/bird nets where affordable.',
      'Crop Management': 'Maintain strict orchard sanitation and pruning to control bacterial blight in pomegranate and downy mildew in grapes.',
    },
    highlights: ['High returns in semi-arid districts', 'Bahar regulation targets peak market prices', 'Drip fertigation maximizes fruit grade'],
  },
  {
    slug: 'brinjal-okra-cucurbits',
    section: 'crop',
    title: 'Brinjal, Okra & Cucurbits (Gourds)',
    subtitle: 'Vegetables & Fruits · Continuous Cash-Flow Market Vegetables',
    imageUrl: '/src/assets/images/crop_brinjal_okra_1794924106010.jpg',
    summary:
      'Brinjal, Okra (Bhindi), and cucurbits (Ridge gourd, Bitter gourd, Cucumber) start yielding in 45–60 days and provide twice-weekly cash harvests for smallholders.',
    details: {
      'Crop Category': 'Vegetables & Fruits',
      'Suitable Climate': 'Warm humid to moderate climate (22°C – 35°C) with full sunlight.',
      'Soil Requirements': 'Fertile sandy loam to medium black soil enriched with well-rotted compost (pH 5.8 – 7.5).',
      'Main Season': 'Kharif, Rabi, and Summer (year-round in frost-free plains).',
      'Cultivation Tip': 'Grow cucurbits on bamboo/wire pandal trellises with drip irrigation to produce straight, spot-free gourds.',
      'Crop Management': 'Install pheromone traps for brinjal shoot & fruit borer and cue-lure traps for gourd fruit flies.',
    },
    highlights: ['First harvest in just 45–60 days', 'Pandal trellising doubles gourd quality', 'Steady weekly vegetable income'],
  },
  ...EXTRA_CROP_ITEMS,

  // SOILS — MAJOR UPLAND & PLAINS SOILS
  {
    slug: 'red-soil',
    section: 'soil',
    title: 'Red Loamy & Sandy Soils',
    subtitle: 'Major Upland & Plains Soils · Porous, Iron-Rich Soils',
    imageUrl: '/src/assets/images/soil_red_loam_1794924106285.jpg',
    summary:
      'Widely found across southern and central Karnataka, Tamil Nadu, Telangana, and Deccan plateaus, red soils drain quickly and respond well to organic matter and micro-irrigation.',
    details: {
      'Category': 'Major Upland & Plains Soils',
      'Key Characteristics': 'Reddish colour from iron oxides; porous, friable sandy-loam to clay-loam texture; typically low in nitrogen, phosphorus, and humus.',
      'Water Retention': 'Low to moderate; dries rapidly after rain and benefits strongly from mulching, farm ponds, and drip irrigation.',
      'Suitable Crops': 'Ragi, Groundnut, Red Gram (Tur), Maize, Castor, Vegetables, Mango, and Coconut.',
      'Soil Health Advice': 'Incorporate compost/FYM regularly, add rock phosphate or SSP, and get Soil Health Card testing every 2 years.',
    },
    highlights: ['Responds well to organic compost', 'Ideal for drip irrigation', 'Dominant across South Karnataka & Deccan'],
  },
  {
    slug: 'black-cotton-soil',
    section: 'soil',
    title: 'Black Cotton Soil (Regur / Vertisols)',
    subtitle: 'Major Upland & Plains Soils · Deep Moisture-Retentive Clay',
    imageUrl: '/src/assets/images/soil_black_cotton_1794924106668.jpg',
    summary:
      'Rich in montmorillonite clay, lime, and magnesium, black soils swell when wet and form deep self-ploughing cracks when dry, retaining moisture deep in the profile for rainfed farming.',
    details: {
      'Category': 'Major Upland & Plains Soils',
      'Key Characteristics': 'High clay content (40–60%), dark grey-black colour; rich in calcium, magnesium, and potash, but low in nitrogen and organic carbon.',
      'Water Retention': 'Very high moisture-holding capacity; sticky when wet and prone to waterlogging during heavy monsoon.',
      'Suitable Crops': 'Cotton, Jowar (Sorghum), Tur, Bengal Gram, Soybean, Sunflower, Wheat, and Sugarcane.',
      'Soil Health Advice': 'Use broad-bed and furrow (BBF) planting for drainage, do summer deep ploughing, and apply gypsum if sodicity occurs.',
    },
    highlights: ['High moisture retention for Rabi crops', 'Needs surface drainage in heavy rain', 'Dominant in North Karnataka & Maharashtra'],
  },
  {
    slug: 'alluvial-soil',
    section: 'soil',
    title: 'Alluvial Soil',
    subtitle: 'Major Upland & Plains Soils · Fertile River-Deposited Soil',
    imageUrl: '/src/assets/images/soil_alluvial_silt_1794924107844.jpg',
    summary:
      'Deposited by river systems across plains and valleys (Indo-Gangetic plains and river deltas like Cauvery and Krishna), alluvial soils are India’s most productive agricultural soils.',
    details: {
      'Category': 'Major Upland & Plains Soils',
      'Key Characteristics': 'Sandy-loam to silt-clay texture (Khadar new alluvium & Bhangar old alluvium); rich in potash and lime, moderate in phosphorus.',
      'Water Retention': 'Good internal drainage with balanced capillary moisture availability across root zones.',
      'Suitable Crops': 'Paddy, Wheat, Sugarcane, Maize, Pulses, Mustard, Banana, and Horticultural Vegetables.',
      'Soil Health Advice': 'Rotate cereals with pulses and add green manure crops like Dhaincha or Sunhemp to prevent organic carbon depletion.',
    },
    highlights: ['High natural fertility', 'Supports 2–3 cropping cycles per year', 'Easy to plough and level'],
  },
  {
    slug: 'loamy-garden-silt-soil',
    section: 'soil',
    title: 'Loamy Garden & Silt Clay Soil',
    subtitle: 'Major Upland & Plains Soils · Balanced Sand-Silt-Clay Structure',
    imageUrl: '/src/assets/images/soil_loamy_garden_1794924106681.jpg',
    summary:
      'Balanced loamy soils combine the aeration of sand, moisture holding of silt, and nutrient binding of clay—making them the gold standard for vegetables, fruits, and field crops.',
    details: {
      'Category': 'Major Upland & Plains Soils',
      'Key Characteristics': 'Roughly 40% sand, 40% silt, 20% clay; crumbly granular structure, neutral pH (6.2 – 7.5), and high Cation Exchange Capacity.',
      'Water Retention': 'Ideal balance between water storage and excess drainage, preventing root rot while resisting dry spells.',
      'Suitable Crops': 'Tomato, Onion, Potato, Chilli, Turmeric, Maize, Pulses, and Polyhouse Horticulture.',
      'Soil Health Advice': 'Preserve tilth by minimizing heavy tractor compaction when wet and replenishing 3–4 tonnes/acre compost annually.',
    },
    highlights: ['Ideal drainage + moisture balance', 'High fertilizer use efficiency', 'Easiest soil for vegetables & tubers'],
  },

  // SOILS — COASTAL & HILL SOILS
  {
    slug: 'laterite-soil',
    section: 'soil',
    title: 'Laterite Soil',
    subtitle: 'Coastal & Hill Soils · Acidic High-Rainfall Soil',
    imageUrl: '/src/assets/images/soil_laterite_brick_1794924107791.jpg',
    summary:
      'Formed under heavy monsoon rainfall and high temperatures in the Western Ghats, Malnad, coastal Karnataka, and Kerala, laterite soils are leached of bases and naturally acidic.',
    details: {
      'Category': 'Coastal & Hill Soils',
      'Key Characteristics': 'Acidic pH (4.5 – 6.0), rich in iron and aluminium oxides, deficient in lime, nitrogen, and available phosphorus.',
      'Water Retention': 'Rapidly draining and porous; hardens when exposed to air and requires erosion protection on slopes.',
      'Suitable Crops': 'Arecanut, Coffee, Tea, Cashew, Black Pepper, Rubber, Pineapple, and Banana.',
      'Soil Health Advice': 'Apply agricultural lime or dolomite based on Soil Health Card pH test and build contour bunds/trenches on sloping terrain.',
    },
    highlights: ['Acidic pH requires lime management', 'Thrives with plantation & spice crops', 'Use contour trenches to curb runoff'],
  },
  {
    slug: 'coastal-sandy-deltaic-soil',
    section: 'soil',
    title: 'Coastal Sandy & Deltaic Soils',
    subtitle: 'Coastal & Hill Soils · Maritime & Estuary Soils',
    imageUrl: '/src/assets/images/soil_coastal_sandy_1794924107254.jpg',
    summary:
      'Distributed along the Konkan, Karavali, Malabar, and eastern coastal belts, coastal sandy soils have low water-holding capacity while deltaic pockets are fertile and moist.',
    details: {
      'Category': 'Coastal & Hill Soils',
      'Key Characteristics': 'Coarse sandy to silty texture; low organic matter in beach sands; prone to localized tidal salinity near estuaries.',
      'Water Retention': 'Very low in sandy strips (high percolation); high water table during monsoon.',
      'Suitable Crops': 'Coconut, Cashew, Arecanut, Paddy (salt-tolerant varieties), Sweet Potato, and Vegetables.',
      'Soil Health Advice': 'Apply coir pith compost, tank silt, and green leaf manure heavily; mulch coconut basins to conserve fresh moisture.',
    },
    highlights: ['Coir pith & organic mulch boost retention', 'Protect fresh groundwater from sea intrusion', 'Well suited to coconut & cashew'],
  },
  {
    slug: 'mountain-forest-soil',
    section: 'soil',
    title: 'Mountain & Forest Humus Soil',
    subtitle: 'Coastal & Hill Soils · Organic-Rich Highland Soil',
    imageUrl: '/src/assets/images/soil_mountain_forest_1794924108601.jpg',
    summary:
      'Found on hilly slopes of the Western Ghats (Kodagu, Chikkamagaluru), Nilgiris, and Himalayan foothills, mountain soils are rich in forest leaf litter and humus.',
    details: {
      'Category': 'Coastal & Hill Soils',
      'Key Characteristics': 'Loamy and silty on valley floors, coarse on upper slopes; high organic matter, slightly acidic (pH 5.2 – 6.5).',
      'Water Retention': 'Good infiltration and moisture holding where vegetative cover and shade canopy are intact.',
      'Suitable Crops': 'Arabica & Robusta Coffee, Cardamom, Black Pepper, Tea, Apples/Temperate Fruits, Ginger, and Hill Paddy.',
      'Soil Health Advice': 'Maintain shade trees, practice zero-tillage on steep gradients, and use vegetative grass barriers to prevent topsoil erosion.',
    },
    highlights: ['Naturally high humus content', 'Requires soil-conservation terracing', 'Supports high-value spice & estate crops'],
  },
  {
    slug: 'sub-mountain-terai-soil',
    section: 'soil',
    title: 'Sub-Mountain Terai Soil',
    subtitle: 'Coastal & Hill Soils · Moist Marshy Foothill Alluvium',
    imageUrl: '/src/assets/images/soil_terai_submountain_1794924108537.jpg',
    summary:
      'Distributed along sub-Himalayan foothills and wet valley seepage zones, Terai soils have a shallow water table, high nitrogen/organic matter, and lush vegetative productivity.',
    details: {
      'Category': 'Coastal & Hill Soils',
      'Key Characteristics': 'Deep silty loam to clay loam; rich in nitrogen and organic carbon, often deficient in Zinc and available Phosphorus.',
      'Water Retention': 'Naturally high moisture year-round due to foothill seepage; lower pockets need monsoon surface drainage.',
      'Suitable Crops': 'Paddy, Sugarcane, Wheat, Maize, Jute, Poplar Agroforestry, and Mint/Medicinal Herbs.',
      'Soil Health Advice': 'Supplement Zinc Sulphate (especially before paddy) and build shallow drainage ditches to protect winter crops.',
    },
    highlights: ['Naturally rich in organic nitrogen', 'Supports high-yield paddy & sugarcane', 'Needs Zinc supplementation'],
  },

  // SOILS — PROBLEM SOILS & RECLAMATION
  {
    slug: 'saline-alkaline-soil',
    section: 'soil',
    title: 'Saline & Alkaline (Usar / Kallar) Soils',
    subtitle: 'Problem Soils & Reclamation · Salt-Affected Soils',
    imageUrl: '/src/assets/images/soil_saline_alkaline_1794924108154.jpg',
    summary:
      'Common in arid canal-command areas with poor drainage or over-irrigation, saline soils contain excess soluble salts while alkaline (sodic) soils have excess exchangeable sodium (pH > 8.5).',
    details: {
      'Category': 'Problem Soils & Reclamation',
      'Key Characteristics': 'Saline (EC > 4 dS/m, white salt crust); Alkaline/Sodic (pH > 8.5, hard crust, poor infiltration and dark puddles).',
      'Water Retention': 'Impaired root water uptake due to osmotic salt stress in saline soil; severe water stagnation in sodic soil.',
      'Suitable Crops': 'Salt-tolerant Barley, Paddy, Sugarbeet, Dhaincha, Cotton, and Ber/Amla after partial reclamation.',
      'Soil Health Advice': 'For Saline: provide subsurface drainage and leach salts with good water. For Alkaline: apply Gypsum + organic FYM + Dhaincha green manure.',
    },
    highlights: ['Gypsum reclaims alkaline/sodic soils', 'Subsurface drainage flushes soluble salts', 'Avoid over-irrigation in canal commands'],
  },
  {
    slug: 'peaty-marshy-soil',
    section: 'soil',
    title: 'Peaty & Marshy (Kari) Soils',
    subtitle: 'Problem Soils & Reclamation · Waterlogged High-Organic Soil',
    imageUrl: '/src/assets/images/soil_peaty_marshy_1794924108852.jpg',
    summary:
      'Found in waterlogged coastal depressions and heavy-rain basins (such as Kuttanad in Kerala and coastal pockets), peaty soils accumulate 20–40% partially decomposed organic matter.',
    details: {
      'Category': 'Problem Soils & Reclamation',
      'Key Characteristics': 'Dark black, heavy, strongly acidic (pH 3.5 – 5.0) due to anaerobic decomposition and sulphides; rich in organic carbon but low in potash and phosphate.',
      'Water Retention': 'Permanently saturated or seasonally submerged.',
      'Suitable Crops': 'Deep-water or flood-tolerant Paddy, Lotus/Makhana, and drained raised-bed vegetables/bananas.',
      'Soil Health Advice': 'Construct raised bunds and drainage channels, apply agricultural lime to counter acidity, and supplement Potash and Zinc.',
    },
    highlights: ['Very high organic carbon', 'Requires drainage & liming before sowing', 'Supports specialized wetland paddy'],
  },
  {
    slug: 'calcareous-chalky-soil',
    section: 'soil',
    title: 'Calcareous (Chalky / Lime-Rich) Soil',
    subtitle: 'Problem Soils & Reclamation · High Free Calcium Carbonate Soil',
    imageUrl: '/src/assets/images/soil_calcareous_chalky_1794924108666.jpg',
    summary:
      'Common in semi-arid Deccan and Indo-Gangetic pockets, calcareous soils contain >15% free calcium carbonate (lime nodules), raising pH (7.8–8.5) and locking up Iron, Phosphorus, and Zinc.',
    details: {
      'Category': 'Problem Soils & Reclamation',
      'Key Characteristics': 'Light grey-brown to pale chalky texture; alkaline pH (7.8 – 8.5) causing iron chlorosis (yellow young leaves) and phosphorus fixation.',
      'Water Retention': 'Moderate; prone to surface crusting after rain if organic matter is low.',
      'Suitable Crops': 'Pomegranate, Grapes, Cotton, Bengal Gram, Sorghum, Sugarcane, and Date Palm with micronutrient care.',
      'Soil Health Advice': 'Apply elemental Sulphur or Gypsum alongside heavy FYM/compost, band-place phosphatic fertilizer, and spray chelated EDTA-Fe/Zn.',
    },
    highlights: ['High lime locks up Iron & Phosphorus', 'Chelated Fe & Zn sprays cure yellowing', 'Compost buffers alkaline pH'],
  },

  // SOILS — ARID & DESERT SOILS
  {
    slug: 'arid-desert-soil',
    section: 'soil',
    title: 'Arid & Desert Sandy Soils',
    subtitle: 'Arid & Desert Soils · Low-Rainfall Alkaline Sandy Soil',
    imageUrl: '/src/assets/images/soil_arid_desert_1794924108963.jpg',
    summary:
      'Occurring in low-rainfall western Rajasthan, parts of Gujarat, and rain-shadow dry belts, arid soils are sandy, alkaline, and often contain subsurface calcium carbonate (kankar) layers.',
    details: {
      'Category': 'Arid & Desert Soils',
      'Key Characteristics': '90%+ sand fraction, low humus and nitrogen, normal to high phosphate, and calcareous kankar pans below the surface.',
      'Water Retention': 'Very low moisture retention with high wind erosion risk.',
      'Suitable Crops': 'Bajra (Pearl Millet), Moth Bean, Guar, Cumin, Sesame, Pomegranate, Ber, and Date Palm.',
      'Soil Health Advice': 'Use shelterbelt tree rows against wind erosion, drip irrigation with organic mulch, and drought-hardy millet/pulse rotations.',
    },
    highlights: ['Needs windbreaks & cover residue', 'Drip irrigation prevents deep percolation loss', 'Ideal for Bajra, Guar & Cumin'],
  },

  // FARM ANIMALS — DAIRY LIVESTOCK
  {
    slug: 'dairy-cattle',
    section: 'animal',
    title: 'Dairy Cattle (Indigenous & Crossbred)',
    subtitle: 'Dairy Livestock · Milk Production & Integrated Farming',
    imageUrl: '/src/assets/images/animal_dairy_cattle_1794924149926.jpg',
    summary:
      'Indigenous breeds (Hallikar, Malnad Gidda, Gir, Sahiwal, Red Sindhi) and crossbred HF/Jersey cows provide steady daily dairy income alongside valuable farmyard manure and urine.',
    details: {
      'Category': 'Dairy Livestock',
      'Housing & Hygiene': 'Well-ventilated dry shed facing east-west with non-slip sloped flooring, proper drainage, and clean drinking water 24/7.',
      'Feeding Balance': 'Mix 20–25 kg green fodder (Napier/Maize/Lucerne), 5–6 kg dry straw, mineral mixture (40–50g/day), and concentrate matched to milk yield.',
      'Health Care': 'Timely vaccination against FMD, HS, and BQ; regular deworming every 3–4 months and mastitis screening.',
      'Scheme Support': 'Eligible for working capital loans under KCC Animal Husbandry and Rashtriya Gokul Mission breeding services.',
    },
    highlights: ['Daily cash flow diversification', 'Produces manure & urine for organic farming', 'Eligible under KCC Allied Activities'],
  },
  {
    slug: 'buffalo-rearing',
    section: 'animal',
    title: 'Buffalo Rearing (Murrah, Surti & Pandharpuri)',
    subtitle: 'Dairy Livestock · High-Butterfat Milk & Hardy Livestock',
    imageUrl: '/src/assets/images/animal_murrah_buffalo_1794924149951.jpg',
    summary:
      'Buffaloes efficiently convert coarse agricultural roughages into rich milk (6.5–8% butterfat) that commands premium prices at village dairy cooperatives.',
    details: {
      'Category': 'Dairy Livestock',
      'Housing & Cooling': 'Provide spacious shade, clean wallowing tank or mist sprinklers in summer because buffaloes have fewer sweat glands.',
      'Feeding Balance': '15–25 kg green fodder, dry roughage, cottonseed cake/concentrate, and area-specific mineral supplements.',
      'Breeding & Health': 'Utilize Artificial Insemination (AI) from State Veterinary Centres for Murrah/Pandharpuri breed improvement and vaccinate against HS & FMD.',
      'Scheme Support': 'Supported via dairy cooperative societies, KCC dairy limits, and National Livestock Mission (NLM) schemes.',
    },
    highlights: ['Higher milk fat & SNF returns', 'Efficient converter of crop roughage', 'Strong dairy cooperative demand'],
  },
  {
    slug: 'fodder-azolla-silage',
    section: 'animal',
    title: 'Fodder Production, Azolla & Silage Conservation',
    subtitle: 'Dairy Livestock · Year-Round Protein & Dry-Season Nutrition',
    imageUrl: '/src/assets/images/animal_fodder_silage_1794924150394.jpg',
    summary:
      'Cultivating perennial CO-4/Super Napier grass alongside shallow Azolla bio-ponds and maize silage bags slashes dairy concentrate bills by 20–30% while keeping summer milk yields steady.',
    details: {
      'Category': 'Dairy Livestock',
      'Green Fodder Mix': 'Grow 75% cereal fodder (Super Napier, Maize, Fodder Sorghum) + 25% protein legume fodder (Lucerne, Cowpea, Hedge Lucerne).',
      'Azolla Bio-Feed': 'Shallow shaded 6x4 ft pond produces 1–1.5 kg/day of 25%-protein Azolla fern to mix directly into cow and poultry rations.',
      'Silage Making': 'Pack chopped green maize/sorghum into airtight silage bags/pits for 45 days during surplus monsoon months to feed all summer.',
      'Cost Impact': 'Chaff-cutting dry and green fodder reduces wastage by 30% and improves rumen digestion.',
    },
    highlights: ['Azolla cuts concentrate cost by 20%', 'Silage preserves green nutrition all summer', 'Chaff cutters prevent 30% fodder waste'],
  },

  // FARM ANIMALS — SMALL RUMINANTS
  {
    slug: 'goat-sheep-rearing',
    section: 'animal',
    title: 'Goat Rearing (Osmanabadi, Sirohi & Jamunapari)',
    subtitle: 'Small Ruminants · Low-Investment Dryland Livestock',
    imageUrl: '/src/assets/images/animal_goat_rearing_1794924151169.jpg',
    summary:
      'Known as the "poor man’s cow", goats (Osmanabadi, Sirohi, Barbari, Jamunapari) thrive on tree fodder and bushes, offering rapid multiplication and high liquidity for small farmers.',
    details: {
      'Category': 'Small Ruminants',
      'Shelter Design': 'Elevated slatted floor or dry well-drained earthen floor protected from monsoon dampness and cold night drafts.',
      'Nutrition': 'Rotational browsing on fodder trees (Subabul, Glyricidia, Neem), leguminous hay, and 150–250g concentrate for pregnant/lactating does.',
      'Health Care': 'Mandatory vaccination against PPR (Peste des Petits Ruminants) and Enterotoxaemia (ET), plus seasonal deworming.',
      'Economic Role': 'Quick liquidity during crop lean seasons and high-value organic pelleted manure.',
    },
    highlights: ['Ideal for small & dryland farmers', 'Fast reproduction (often twins)', 'Low housing capital required'],
  },
  {
    slug: 'sheep-rearing',
    section: 'animal',
    title: 'Sheep Rearing (Deccani, Bannur & Nellore)',
    subtitle: 'Small Ruminants · Meat, Wool & Soil Penning Income',
    imageUrl: '/src/assets/images/animal_sheep_rearing_1794924151326.jpg',
    summary:
      'Sheep breeds like Bannur (Mandya), Deccani, and Nellore are well adapted to semi-arid grazing pastures and provide meat, coarse wool, and nutrient-rich manure through night penning in fields.',
    details: {
      'Category': 'Small Ruminants',
      'Housing & Flock Care': 'Simple open-sided paddock with dry raised bedding; separate lambing pens to reduce neonatal lamb mortality.',
      'Feeding & Grazing': '6–8 hours rotational pasture grazing supplemented with Stylo/Hedge Lucerne and mineral salt blocks.',
      'Health Care': 'Vaccinate against Sheep Pox, Blue Tongue, ET, and PPR; treat foot rot before monsoon.',
      'Scheme Support': 'Eligible under National Livestock Mission (NLM) entrepreneur sheep & goat breeding subsidies.',
    },
    highlights: ['Sheep penning enriches fallow fields', 'Bannur/Nellore prized for meat quality', 'Thrives on semi-arid grasslands'],
  },

  // FARM ANIMALS — POULTRY & AVIAN
  {
    slug: 'rural-poultry',
    section: 'animal',
    title: 'Backyard & Commercial Poultry',
    subtitle: 'Poultry & Avian · Fast-Turnaround Egg & Meat Production',
    imageUrl: '/src/assets/images/animal_rural_poultry_1794924151544.jpg',
    summary:
      'Hardy dual-purpose backyard breeds (Swarnadhara, Giriraja, Vanaraja, Kadaknath) thrive on kitchen/farm grain scraps and foraging, while commercial broilers/layers scale farm enterprises.',
    details: {
      'Category': 'Poultry & Avian',
      'Coop & Brooding': 'Predator-proof wire-mesh night shelter with dry rice-husk litter and warm brooder bulbs for chicks during first 3 weeks.',
      'Feeding': 'Balanced chick/grower mash combined with Azolla, chopped greens, and kitchen scraps in backyard systems.',
      'Biosecurity & Vaccines': 'Vaccinate timely against Ranikhet (Newcastle — Lasota/R2B) and Marek’s/IBD; keep clean waterers daily.',
      'Economic Role': 'Fastest cash turnover (6–8 weeks for meat; 20+ weeks for eggs) and strong Women SHG livelihood model.',
    },
    highlights: ['Fastest return on livestock capital', 'Azolla cuts poultry feed cost by 15–20%', 'Hardy desi/improved dual breeds'],
  },
  {
    slug: 'duck-quail-farming',
    section: 'animal',
    title: 'Duck & Japanese Quail Farming',
    subtitle: 'Poultry & Avian · Integrated Wetland & High-Density Birds',
    imageUrl: '/src/assets/images/animal_duck_quail_1794924151119.jpg',
    summary:
      'Ducks (Khaki Campbell, Indian Runner) pair seamlessly with paddy fields and fish ponds by eating snails and weeds, while Japanese Quail require tiny space and lay eggs within 6–7 weeks.',
    details: {
      'Category': 'Poultry & Avian',
      'Integration': 'Duck-cum-fish and duck-cum-paddy systems reduce weed/pest burden and fertilize pond plankton naturally.',
      'Housing': 'Ducks need dry night shelter near shallow water channels; quails can be reared in multi-tier cages in small sheds.',
      'Feeding & Health': 'High disease resistance compared to chickens; vaccinate ducks against Duck Plague and Duck Cholera.',
      'Economic Role': 'Low mortality, high egg productivity (250–300 eggs/year in Khaki Campbell), and niche delicacy demand.',
    },
    highlights: ['Ducks control paddy snails & insects', 'Quails mature in just 6–7 weeks', 'Naturally hardy against common ailments'],
  },

  // FARM ANIMALS — ALLIED LIVESTOCK & AQUACULTURE
  {
    slug: 'inland-fish-farming',
    section: 'animal',
    title: 'Inland Fish Farming & Composite Aquaculture',
    subtitle: 'Allied Livestock & Aquaculture · Farm Pond Fish Culture',
    imageUrl: '/src/assets/images/animal_fish_farming_1794924152211.jpg',
    summary:
      'Farm ponds built under Krishi Bhagya or MGNREGA can generate substantial extra income through composite carp culture (Catla, Rohu, Mrigal) or tilapia/pangasius rearing.',
    details: {
      'Category': 'Allied Livestock & Aquaculture',
      'Species Mix': 'Surface feeder (Catla), column feeder (Rohu), and bottom feeder (Mrigal/Common Carp) utilize all pond water layers efficiently.',
      'Water & Pond Prep': 'Maintain 1.5–2 m water depth, lime pond bottom before stocking, and fertilize with cow dung to grow natural plankton.',
      'Feeding & Care': 'Supplement plankton with floating pelleted feed or 1:1 rice bran + groundnut oilcake; check dissolved oxygen early morning.',
      'Scheme Support': 'Supported under Pradhan Mantri Matsya Sampada Yojana (PMMSY) and KCC Fisheries.',
    },
    highlights: ['Monetizes irrigation farm ponds', 'Subsidy support under PMMSY', 'Harvestable in 8–10 months'],
  },
  {
    slug: 'apiculture-beekeeping',
    section: 'animal',
    title: 'Apiculture (Honeybee Keeping & Pollination)',
    subtitle: 'Allied Livestock & Aquaculture · Zero-Land Income & Crop Yield Booster',
    imageUrl: '/src/assets/images/animal_apiculture_bees_1794924153154.jpg',
    summary:
      'Rearing Indian hive bees (Apis cerana indica) or European bees (Apis mellifera) yields pure honey, beeswax, and propolis while boosting cross-pollinated crop yields by 20–40%.',
    details: {
      'Category': 'Allied Livestock & Aquaculture',
      'Apiary Placement': 'Keep wooden bee boxes in shaded orchards/borders near flowering Sunflower, Mustard, Coffee, Cardamom, or Drumstick.',
      'Management': 'Inspect colonies every 10–15 days, provide sugar syrup only during severe dearth, and avoid spraying chemical insecticides during bloom.',
      'Pollination Benefit': 'Improves fruit set and seed filling in oilseeds, pulses, vegetables, mango, and coconut orchards.',
      'Scheme Support': 'Promoted under National Beekeeping & Honey Mission (NBHM) through KVKs and Horticulture Departments.',
    },
    highlights: ['Boosts oilseed & orchard pollination', 'Requires minimal land area', 'Supported under National Honey Mission'],
  },
  {
    slug: 'piggery-rabbit-farming',
    section: 'animal',
    title: 'Piggery & Rabbit Rearing',
    subtitle: 'Allied Livestock & Aquaculture · High Feed-Conversion Enterprises',
    imageUrl: '/src/assets/images/animal_piggery_rabbits_1794924152348.jpg',
    summary:
      'Scientific piggery (Large White Yorkshire, Hampshire) offers unmatched feed-to-meat conversion and large litter sizes, while broiler rabbit farming (New Zealand White) utilizes kitchen/forage greens cleanly.',
    details: {
      'Category': 'Allied Livestock & Aquaculture',
      'Housing & Sanitation': 'Concrete sloped pens with wallowing drain for pigs; raised wire-mesh hutches in cool ventilated sheds for rabbits.',
      'Feeding': 'Pigs utilize maize/grain mash, brewery waste, and boiled vegetable scraps; rabbits thrive on Lucerne, cabbage leaves, and pellets.',
      'Health Care': 'Vaccinate pigs against Classical Swine Fever (CSF) and FMD; protect rabbits from coccidiosis and heat stress (>34°C).',
      'Scheme Support': 'Eligible for National Livestock Mission (NLM) breed-farm subsidies and rural entrepreneurship credit.',
    },
    highlights: ['High feed conversion efficiency', 'Large litter sizes accelerate scale', 'Suitable for peri-urban & rural farms'],
  },
  {
    slug: 'sericulture-silkworm',
    section: 'animal',
    title: 'Sericulture (Mulberry Silkworm Rearing)',
    subtitle: 'Allied Livestock & Aquaculture · High-Frequency Silk Cocoon Income',
    imageUrl: '/src/assets/images/animal_sericulture_silkworm_1794924152098.jpg',
    summary:
      'Cultivating V1 Mulberry gardens to rear Bivoltine and Crossbreed silkworms generates 5–6 cocoon harvests per year, anchoring small-farmer livelihoods across Karnataka and southern India.',
    details: {
      'Category': 'Allied Livestock & Aquaculture',
      'Mulberry & Rearing House': 'Maintain well-ventilated hygienic shoot-rearing shed with 25°C–28°C temperature control and ant/rodent barriers.',
      'Hygiene & Disinfection': 'Disinfect rearing trays and stands thoroughly before every batch and dust bed disinfectants (Vijetha/Ankush) during moults.',
      'Cocoon Marketing': 'Sell graded cocoons transparently in Government Silk Cocoon Markets (e-auction in Ramanagara, Siddlaghatta, Kollegal).',
      'Scheme Support': 'Subsidies for mulberry plantation, drip irrigation, and rearing sheds under Silk Samagra & State Sericulture Departments.',
    },
    highlights: ['5–6 harvests every year', 'By-product mulberry shoots feed dairy cows', 'Supported under Silk Samagra'],
  },
  {
    slug: 'integrated-duck-fish-prawn',
    section: 'animal',
    title: 'Integrated Duck-Fish-Paddy & Freshwater Prawn',
    subtitle: 'Allied Livestock & Aquaculture · Circular Pond & Wetland Farming',
    imageUrl: '/src/assets/images/animal_duck_fish_prawn_1794924152412.jpg',
    summary:
      'Combining ducks or Scampi freshwater prawns (Macrobrachium rosenbergii) with carp fish ponds multiplies farm-pond revenue without chemical pond fertilizers.',
    details: {
      'Category': 'Allied Livestock & Aquaculture',
      'Circular Synergy': 'Ducks aerate pond water while swimming and their droppings fertilize natural fish plankton, cutting fish feed needs by 40%.',
      'Prawn Polyculture': 'Bottom-dwelling Scampi prawns co-exist peacefully with surface/column Carps (Catla & Rohu) in sweet-water ponds.',
      'Management': 'Keep 100–120 ducks per acre of pond and monitor dissolved oxygen and water pH (7.0–8.0) weekly.',
      'Scheme Support': 'Eligible for integrated aquaculture assistance under Pradhan Mantri Matsya Sampada Yojana (PMMSY).',
    },
    highlights: ['Zero wasted feed in circular pond', 'High-value freshwater scampi prawns', 'Subsidized under PMMSY'],
  },

  // ORGANIC FARMING — ORGANIC MANURES
  {
    slug: 'composting-vermicompost',
    section: 'organic',
    title: 'Composting & Vermicomposting',
    subtitle: 'Organic Manures · Converting Farm Waste into Living Humus',
    imageUrl: '/src/assets/images/organic_compost_jeevamrutha_1794923391262.jpg',
    summary:
      'Vermicomposting uses surface-feeding earthworms (Eisenia fetida, Eudrilus eugeniae) to transform crop residues and cow dung into nutrient-dense humus castings in 45–60 days.',
    details: {
      'Category': 'Organic Manures',
      'Materials Needed': 'Partially decomposed cow dung (15 days old), chopped farm weeds/straw, and clean water to keep 50–60% moisture.',
      'Process': 'Fill shaded beds/pits in layers, introduce worms, cover with gunny sacks to keep dark and cool, and harvest fine dark castings.',
      'Nutrient Value': 'Supplies NPK plus micronutrients, humic acid, plant growth hormones, and beneficial soil microbes.',
      'Application': 'Apply 1.5–2 tonnes/acre in field crops or 2–5 kg per fruit tree basin mixed with topsoil.',
    },
    highlights: ['Cuts chemical fertilizer dependency', 'Improves soil porosity & microbes', 'Income opportunity selling castings & worms'],
  },
  {
    slug: 'farmyard-enriched-compost',
    section: 'organic',
    title: 'Farmyard Manure (FYM), NADEP & Enriched Compost',
    subtitle: 'Organic Manures · Aerobic & Phosphorus-Enriched Manure',
    imageUrl: '/src/assets/images/organic_fym_nadep_1794924154372.jpg',
    summary:
      'Proper aerobic composting (NADEP tank or trench method) eliminates weed seeds and pathogens while enriching ordinary cattle dung with Rock Phosphate and Trichoderma for higher crop response.',
    details: {
      'Category': 'Organic Manures',
      'Method': 'Alternate layers of crop residue, cow dung slurry, and topsoil in perforated brick NADEP tanks or shaded pits; turn once at 45 days.',
      'Enrichment': 'Add 5% Rock Phosphate + Phosphate Solubilizing Bacteria (PSB) + Trichoderma viride to make Phospho-compost.',
      'Common Mistake': 'Never leave fresh dung exposed in open sun/rain heaps—leaching and heat destroy up to 50% of its nitrogen.',
      'Benefits': 'Builds long-term Soil Organic Carbon (SOC) and buffers soil against drought stress.',
    },
    highlights: ['Aerobic tanks prevent nitrogen loss', 'Trichoderma enrichment suppresses root rot', 'Builds lasting soil organic carbon'],
  },
  {
    slug: 'biochar-kunapajala-liquid',
    section: 'organic',
    title: 'Biochar, Kunapajala & Liquid Organic Formulations',
    subtitle: 'Organic Manures · Long-Term Soil Carbon & Fast Liquid Nutrition',
    imageUrl: '/src/assets/images/organic_biochar_liquid_1794924153378.jpg',
    summary:
      'Pyrolyzing woody farm stalks into Biochar creates permanent carbon sponges in soil, while traditional fermented Kunapajala and Vermiwash deliver rapid plant-available nutrients.',
    details: {
      'Category': 'Organic Manures',
      'Biochar Charging': 'Make charcoal from cotton/tur stalks in low-oxygen kilns, then soak it in Jeevamrutha or compost tea for 15 days before mixing into soil.',
      'Vermiwash & Kunapajala': 'Collect nutrient-rich Vermiwash leachate from vermicompost beds or prepare Herbal Kunapajala (fermented oilcake, pulse flour, cow urine, wild weeds) for 5% foliar sprays.',
      'Soil Benefit': 'Biochar holds moisture and fertilizer ions in light red soils for decades without leaching.',
      'Crop Use': 'Ideal for drip/drench application in vegetables, banana, turmeric, and coconut orchards.',
    },
    highlights: ['Biochar permanently boosts water holding', 'Vermiwash acts as mild pest deterrent', 'Converts woody stalks without smoke'],
  },

  // ORGANIC FARMING — BIOFERTILIZERS & GREEN MANURE
  {
    slug: 'green-manuring-cover-crops',
    section: 'organic',
    title: 'Green Manuring & Cover Crops',
    subtitle: 'Biofertilizers & Green Manure · Growing Nitrogen in the Field',
    imageUrl: '/src/assets/images/organic_green_manure_1794924155076.jpg',
    summary:
      'Growing fast-biomass legumes like Dhaincha (Sesbania), Sunhemp, or Cowpea before the main crop and ploughing them into moist soil at flowering adds 40–60 kg/ha of natural nitrogen.',
    details: {
      'Category': 'Biofertilizers & Green Manure',
      'Top Green Manures': 'In-situ: Dhaincha, Sunhemp, Horsegram, Pillipesara. Ex-situ green leaf: Glyricidia, Pongamia, Subabul planted on field bunds.',
      'Incorporation Timing': 'Plough in at 45–50 days (just before flowering) when stems are tender and decompose within 10–15 days.',
      'Soil Benefits': 'Suppresses early weeds, prevents monsoon topsoil erosion, and improves saline/alkaline soil reclamation.',
      'Best For': 'Paddy puddling fields, Sugarcane inter-rows, and orchard basins.',
    },
    highlights: ['Adds 40–60 kg/ha biological nitrogen', 'Bund Glyricidia gives perpetual leaf manure', 'Reclaims salt-affected paddy soils'],
  },
  {
    slug: 'biofertilizers-microbial',
    section: 'organic',
    title: 'Biofertilizers (Rhizobium, Azotobacter, PSB & Mycorrhiza)',
    subtitle: 'Biofertilizers & Green Manure · Living Microbial Inoculants',
    imageUrl: '/src/assets/images/organic_biofertilizers_1794924155825.jpg',
    summary:
      'Biofertilizers are low-cost microbial cultures that fix atmospheric nitrogen or unlock bound soil phosphorus and potash directly around crop roots.',
    details: {
      'Category': 'Biofertilizers & Green Manure',
      'Key Types': 'Rhizobium (for pulses & groundnut), Azotobacter / Azospirillum (for cereals, millets & vegetables), PSB (Phosphorus Solubilizer), KMB (Potash Mobilizer), VAM/Mycorrhiza.',
      'Application Method': 'Use for seed treatment (slurry with cooled jaggery water before sowing), seedling root dip, or mix with moist compost for soil drench.',
      'Care Rule': 'Store biofertilizer packets in cool shade; NEVER mix directly with chemical fungicides or hot dry Urea.',
      'Benefit': 'Saves 20–25% of chemical N & P costs and strengthens root architecture.',
    },
    highlights: ['Seed treatment costs under ₹100/acre', 'Unlocks fixed soil phosphorus', 'Do not mix with chemical fungicides'],
  },

  // ORGANIC FARMING — NATURAL FARMING
  {
    slug: 'natural-farming-jeevamrutha',
    section: 'organic',
    title: 'Natural Farming (Jeevamrutha, Beejamrutha & Mulching)',
    subtitle: 'Natural Farming · Zero-External-Input Microbial Ecology',
    imageUrl: '/src/assets/images/organic_natural_farming_1794924155446.jpg',
    summary:
      'Natural farming stimulates native soil earthworms and beneficial microbes using indigenous cow dung, cow urine, jaggery, pulse flour, and live/straw mulching without synthetic chemicals.',
    details: {
      'Category': 'Natural Farming',
      'Beejamrutha (Seed Treat)': 'Coat seeds with solution of local cow dung, cow urine, lime, and virgin bund soil to prevent seed-borne rot.',
      'Jeevamrutha (Soil Tonic)': 'Ferment 10 kg fresh cow dung, 10 L cow urine, 2 kg jaggery, 2 kg pulse flour, and handful of bund soil in 200 L water for 48–72 hours; apply every 15 days.',
      'Acchadana & Whapasa': 'Maintain thick straw/live pulse mulch to lower soil temperature, conserve moisture, and balance soil air-water pores.',
      'Scheme Note': 'Promoted under National Mission on Natural Farming (NMNF) & Bharatiya Prakritik Krishi Paddhati.',
    },
    highlights: ['Zero synthetic chemical inputs', 'Drastically cuts cultivation cost', 'Protects soil moisture & earthworms'],
  },
  {
    slug: 'conservation-ag-agroforestry',
    section: 'organic',
    title: 'Conservation Agriculture & Agroforestry',
    subtitle: 'Natural Farming · Minimal Tillage, Live Bunds & Tree Integration',
    imageUrl: '/src/assets/images/organic_agroforestry_1794924155202.jpg',
    summary:
      'Combining minimum soil disturbance, permanent crop residue cover, and boundary timber/fruit trees (Silver Oak, Melia dubia, Drumstick, Neem) protects farms against climate extremes.',
    details: {
      'Category': 'Natural Farming',
      '3 Core Principles': '1. Minimal mechanical ploughing; 2. Permanent soil mulch/residue cover; 3. Diverse crop-legume rotations.',
      'Agroforestry Models': 'Plant Moringa, Curry Leaf, Neem, Honge (Pongamia), or Melia dubia along farm bunds for shade, biomass mulch, and timber savings.',
      'Soil Erosion Shield': 'Reduces wind and rain topsoil loss by up to 80% on sloped dryland holdings.',
      'Carbon & Income': 'Generates secondary timber, fuelwood, and fodder without sacrificing main field crop area.',
    },
    highlights: ['Cuts diesel & tractor tillage costs', 'Bund trees give timber & leaf mulch', 'Protects against erratic monsoon runoff'],
  },

  // ORGANIC FARMING — ORGANIC PEST & CROP SYSTEMS
  {
    slug: 'botanical-biopesticides',
    section: 'organic',
    title: 'Botanical Biopesticides, Traps & Panchagavya',
    subtitle: 'Organic Pest & Crop Systems · Non-Toxic Plant Protection',
    imageUrl: '/src/assets/images/organic_botanical_pest_1794924156000.jpg',
    summary:
      'Preventive pest management combines Neem seed kernel extract (NSKE 5%), Neemastram, Dashaparni Ark, pheromone traps, sticky traps, and biological agents like Trichoderma and Pseudomonas.',
    details: {
      'Category': 'Organic Pest & Crop Systems',
      'Botanical Sprays': 'NSKE 5% (crushed neem seed soaked overnight) or Neemastram repels sucking pests and leaf-eating caterpillars without harming bees.',
      'Bio-Control Agents': 'Trichoderma viride / Pseudomonas fluorescens for wilt & root rot; Trichogramma egg cards & NPV for bollworms/pod borers.',
      'Panchagavya': 'Fermented blend of 5 cow products + tender coconut/banana acts as foliar growth booster and immunity enhancer at 3% dilution.',
      'Physical Traps': 'Install yellow/blue sticky traps for whiteflies/thrips and pheromone lures (4–5/acre) for fruit borers.',
    },
    highlights: ['Safe for honeybees & earthworms', 'Zero chemical residue for export markets', 'Pheromone traps give early pest alert'],
  },
  {
    slug: 'crop-rotation-trap-cropping',
    section: 'organic',
    title: 'Ecological Crop Rotation, Intercropping & Trap Crops',
    subtitle: 'Organic Pest & Crop Systems · Biodiversity-Driven Resilience',
    imageUrl: '/src/assets/images/organic_crop_rotation_1794924156340.jpg',
    summary:
      'Rotating deep-rooted legumes with shallow-rooted cereals and planting border trap crops breaks pest/disease cycles naturally while stabilizing farm income.',
    details: {
      'Category': 'Organic Pest & Crop Systems',
      'Rotation Rule': 'Alternate Cereals/Millets (high nitrogen demand) with Pulses/Oilseeds (nitrogen fixing); never grow Solanaceae (Tomato/Chilli/Brinjal) back-to-back.',
      'Trap Cropping': 'Plant Marigold rows inside Tomato/Chilli to trap fruit borers and nematodes; plant Mustard around Cabbage for diamondback moth.',
      'Multi-Tier Intercrop': 'Grow Maize + Cowpea, Tur + Ragi, or Coconut + Banana + Pepper + Pineapple to maximize sunlight & income per acre.',
      'Benefit': 'Reduces total crop failure risk during erratic monsoons and improves organic certification compliance.',
    },
    highlights: ['Breaks soil-borne disease cycles', 'Marigold borders cut nematode attack', 'Stabilizes income in erratic rain'],
  },
  {
    slug: 'organic-certification-npop-pgs',
    section: 'organic',
    title: 'Organic Certification (NPOP, PGS-India & Jaivik Bharat)',
    subtitle: 'Organic Pest & Crop Systems · Premium Market Access & Traceability',
    imageUrl: '/src/assets/images/organic_certification_pgs_1794924156573.jpg',
    summary:
      'Official organic certification lets farmers verify chemical-free cultivation and command 15–30% premium prices in domestic retail and global export markets.',
    details: {
      'Category': 'Organic Pest & Crop Systems',
      'PGS-India (Domestic Group)': 'Participatory Guarantee System (pgsindia-ncof.gov.in) enables 5+ nearby farmers to peer-certify plots at zero/low cost for local & national markets.',
      'NPOP (Third-Party / Export)': 'National Programme for Organic Production via APEDA-accredited agencies required for international organic spice, coffee, and millet exports.',
      'Conversion Period': 'Maintain clean farm diary logs (seed source, compost dates, bio-sprays) and buffer zones during 24–36 month conversion.',
      'Scheme Support': 'PKVY (Paramparagat Krishi Vikas Yojana) clusters subsidize PGS certification, inputs, and packaging.',
    },
    highlights: ['PGS-India lowers cost for small groups', 'NPOP opens international export buyers', 'Maintain clean field logs for audit'],
  },

  // INORGANIC FARMING — PRIMARY MACRONUTRIENTS
  {
    slug: 'nitrogenous-fertilizers',
    section: 'inorganic',
    title: 'Nitrogenous Fertilizers (Neem-Coated Urea, Ammonium Sulphate)',
    subtitle: 'Primary Macronutrients · Vegetative Growth & Chlorophyll',
    imageUrl: '/src/assets/images/inorganic_nitrogen_urea_1794924186848.jpg',
    summary:
      'Nitrogen drives leaf growth, tillering, and protein synthesis. Because Urea leaches and volatilizes easily, split application and Neem-coated granules are essential for efficiency.',
    details: {
      'Category': 'Primary Macronutrients',
      'Major Grades': 'Neem-Coated Urea (46% N) — slow release reduces leaching; Ammonium Sulphate (20.6% N + 24% S) — ideal for alkaline/sulphur-deficient soils; Calcium Ammonium Nitrate (CAN 25% N).',
      'Best Practice': 'NEVER dump entire Urea dose at sowing; apply in 2–3 splits synchronized with active tillering, vegetative growth, and panicle initiation.',
      'Leaf Colour Chart': 'Use a Leaf Colour Chart (LCC) in paddy/wheat to decide if top-dressing Urea is actually needed.',
      'Overuse Risk': 'Excess nitrogen makes plants lush and weak, attracting stem borers, aphids, blast disease, and lodging.',
    },
    highlights: ['Split Urea in 2–3 doses to stop waste', 'Neem-coating slows nitrogen leaching', 'Overuse attracts sucking pests & lodging'],
  },
  {
    slug: 'phosphatic-fertilizers',
    section: 'inorganic',
    title: 'Phosphatic Fertilizers (DAP, SSP & Rock Phosphate)',
    subtitle: 'Primary Macronutrients · Root Establishment, Flowering & Seed Set',
    imageUrl: '/src/assets/images/inorganic_phosphate_dap_1794924187137.jpg',
    summary:
      'Phosphorus builds strong early roots, aids energy transfer (ATP), stimulates flowering, and accelerates grain maturity. Unlike nitrogen, phosphorus stays stationary in soil and must be applied at sowing.',
    details: {
      'Category': 'Primary Macronutrients',
      'Major Grades': 'DAP (18% N, 46% P₂O₅); Single Super Phosphate / SSP (16% P₂O₅ + 11% Sulphur + 19% Calcium); Rock Phosphate (best in acidic soils).',
      'When to Prefer SSP': 'SSP is superior and more economical for Oilseeds (Groundnut, Mustard, Soybean) and Pulses because it supplies free Sulphur and Calcium.',
      'Placement Rule': 'Apply 100% of phosphorus as basal dose placed 4–5 cm below or beside the seed furrow—never broadcast on top late in the season.',
      'Efficiency Tip': 'Mix SSP/DAP with FYM/compost and PSB biofertilizer to prevent soil iron/calcium from locking up phosphorus.',
    },
    highlights: ['Apply full P dose basally at sowing', 'SSP gives bonus Sulphur for oilseeds', 'Placement near roots boosts uptake'],
  },
  {
    slug: 'potassic-complex-fertilizers',
    section: 'inorganic',
    title: 'Potassic & Complex Water-Soluble NPK Fertilizers',
    subtitle: 'Primary Macronutrients · Disease Resistance, Drought Tolerance & Fruit Quality',
    imageUrl: '/src/assets/images/inorganic_potash_npk_1794924187285.jpg',
    summary:
      'Potassium regulates plant water stomata, strengthens stalks against lodging, and boosts sugar, starch, and colour quality in fruits, tubers, and sugarcane.',
    details: {
      'Category': 'Primary Macronutrients',
      'Straight Potash': 'Muriate of Potash / MOP (60% K₂O) for cereals & field crops; Sulphate of Potash / SOP (50% K₂O + 17% S) for chloride-sensitive Tobacco, Potato, Grapes, and Banana.',
      'Complex Granular': 'NPK 10:26:26, 12:32:16, 20:20:0:13 simplify balanced basal application.',
      'Water-Soluble (Fertigation)': '19:19:19, 12:61:0 (MAP), 0:52:34 (MKP), and 13:0:45 (Potassium Nitrate) dissolved through drip venturi for stage-specific nutrition.',
      'Deficiency Sign': 'Yellowing and scorching along older leaf margins (tip burn) indicates Potassium deficiency.',
    },
    highlights: ['Boosts drought & disease tolerance', 'Use SOP instead of MOP for grapes/potato', 'Water-soluble NPK suits drip fertigation'],
  },
  {
    slug: 'nano-urea-nano-dap',
    section: 'inorganic',
    title: 'Nano Urea & Nano DAP (Foliar Nano-Fertilizers)',
    subtitle: 'Primary Macronutrients · High-Efficiency Liquid Nano-Nutrition',
    imageUrl: '/src/assets/images/inorganic_nano_urea_1794924188355.jpg',
    summary:
      'Nano-particle liquid fertilizers (20–50 nm) enter plant leaf stomata directly during foliar sprays, sharply lowering transport bulk, groundwater nitrate leaching, and subsidy waste.',
    details: {
      'Category': 'Primary Macronutrients',
      'Dosage & Dilution': 'Mix 2–4 ml of Liquid Nano Urea or Nano DAP per litre of clean water (500 ml bottle replaces ~1 bag of conventional Urea for top-dressing).',
      'Timing': 'Spray Nano DAP at 30–35 days (active branching) and Nano Urea at active tillering + pre-flowering stages; avoid midday heat.',
      'Important Rule': 'Keep basal soil phosphorus/organic compost intact—Nano fertilizers work best as precision top-dressing supplements.',
      'Application Tech': 'Compatible with battery knapsack sprayers and Kisan Agri-Drones.',
    },
    highlights: ['Easy to carry 500 ml bottle vs 45 kg bag', '80%+ foliar absorption efficiency', 'Reduces soil & groundwater leaching'],
  },

  // INORGANIC FARMING — SECONDARY & MICRONUTRIENTS
  {
    slug: 'secondary-nutrients',
    section: 'inorganic',
    title: 'Secondary Nutrients (Sulphur, Calcium & Magnesium)',
    subtitle: 'Secondary & Micronutrients · Oil Content, Cell Strength & Photosynthesis',
    imageUrl: '/src/assets/images/inorganic_secondary_nutrients_1794924187966.jpg',
    summary:
      'Often overlooked in NPK-only routines, Sulphur, Calcium, and Magnesium are required in substantial quantities—especially by oilseeds, pulses, and high-yield horticulture.',
    details: {
      'Category': 'Secondary & Micronutrients',
      'Sulphur (S)': 'Essential for oil synthesis in Groundnut, Soybean, Mustard, and pungency in Onion/Garlic; supplied via Gypsum, SSP, or Bentonite Sulphur.',
      'Calcium (Ca)': 'Prevents blossom-end rot in Tomato and empty pods ("pops") in Groundnut; apply Gypsum at Groundnut pegging stage (35–40 DAS).',
      'Magnesium (Mg)': 'Central atom of chlorophyll; deficiency causes interveinal yellowing on older leaves. Corrected using Magnesium Sulphate (Epsom salt) or Dolomite in acidic soils.',
    },
    highlights: ['Sulphur boosts oilseed oil percentage', 'Gypsum prevents empty groundnut pods', 'Dolomite supplies Ca + Mg in acidic soil'],
  },
  {
    slug: 'micronutrient-management',
    section: 'inorganic',
    title: 'Micronutrients (Zinc, Boron, Iron & Manganese)',
    subtitle: 'Secondary & Micronutrients · Solving Hidden Hunger in Crops',
    imageUrl: '/src/assets/images/inorganic_micronutrients_1794924188767.jpg',
    summary:
      'Even slight deficiencies of Zinc, Boron, or Iron severely cap yields despite heavy NPK dosing. Soil Health Card tests detect these "hidden hungers" accurately.',
    details: {
      'Category': 'Secondary & Micronutrients',
      'Zinc (Zn)': 'Most widespread deficiency in India (causes Khaira disease in Paddy and stunted internodes in Maize). Apply Zinc Sulphate (21% or 33%) basally or 0.5% foliar spray.',
      'Boron (B)': 'Critical for pollen fertility, flower retention, and preventing fruit cracking in Pomegranate, Tomato, Coconut, and Pulses. Use Borax/Solubor carefully at low doses.',
      'Iron (Fe) & Manganese (Mn)': 'Yellowing of youngest leaves on calcareous black soils indicates Iron chlorosis; correct with Ferrous Sulphate + organic compost or chelated EDTA-Fe spray.',
      'Caution': 'Micronutrients have a narrow margin between deficiency and toxicity—never exceed recommended grams/acre.',
    },
    highlights: ['Zinc Sulphate prevents Paddy Khaira', 'Boron stops flower drop & fruit cracking', 'Chelated sprays cure young-leaf chlorosis'],
  },
  {
    slug: 'soil-amendments-lime-gypsum',
    section: 'inorganic',
    title: 'Soil Amendments (Agricultural Lime, Gypsum & Pyrite)',
    subtitle: 'Secondary & Micronutrients · Correcting Acidic & Alkaline Soil pH',
    imageUrl: '/src/assets/images/inorganic_lime_gypsum_1794924188784.jpg',
    summary:
      'Chemical fertilizers cannot work efficiently if soil pH is too acidic (<5.5) or too alkaline (>8.5). Correcting pH with Lime or Gypsum unlocks existing soil nutrients.',
    details: {
      'Category': 'Secondary & Micronutrients',
      'Acidic Soil (Lime/Dolomite)': 'In Malnad/coastal laterite soils (pH < 5.5), apply Agricultural Lime (Calcium Carbonate) or Dolomite 15–20 days before sowing.',
      'Sodic Soil (Gypsum/Pyrite)': 'In hard-crusted sodic soils (pH > 8.5), spread Gypsum (Calcium Sulphate) as per soil-test Gypsum Requirement and leach with water.',
      'Efficiency Payoff': 'Bringing soil pH into 6.2–7.2 raises NPK fertilizer recovery by 25–40% immediately.',
      'Caution': 'Never mix Lime directly with Urea or Ammonium Sulphate in storage or at spreading—nitrogen escapes as ammonia gas.',
    },
    highlights: ['Lime unlocks nutrients in Malnad soils', 'Gypsum softens hard sodic soils', 'Never mix lime directly with Urea'],
  },

  // INORGANIC FARMING — INM & SAFE STEWARDSHIP
  {
    slug: 'integrated-nutrient-management',
    section: 'inorganic',
    title: 'Integrated Nutrient Management (INM) & Soil Health Card',
    subtitle: 'INM & Safe Stewardship · 4R Nutrient Stewardship Principle',
    imageUrl: '/src/assets/images/inorganic_fertilizer_stewardship_1794923392076.jpg',
    summary:
      'INM combines organic manures (FYM/compost), biofertilizers, and soil-tested chemical fertilizers following the 4R rule: Right Source, Right Rate, Right Time, and Right Place.',
    details: {
      'Category': 'INM & Safe Stewardship',
      'Soil Health Card': 'Collect representative soil samples (15 cm depth in zig-zag pattern) every 2 years to receive exact crop-wise NPK + micronutrient prescriptions.',
      'Synergy Principle': 'Organic matter holds chemical nutrients in the root zone, prevents fertilizer burn, and doubles fertilizer use efficiency.',
      'Economic Gain': 'Cuts wasteful excess DAP/Urea spending while sustaining long-term soil pH and microbial life.',
    },
    highlights: ['Follows 4R Nutrient Stewardship', 'Soil Health Card eliminates guesswork', 'Combines FYM + Biofertilizer + NPK'],
  },
  {
    slug: 'safe-agrochemical-handling',
    section: 'inorganic',
    title: 'Safe Agrochemical Handling, Toxicity Labels & PHI',
    subtitle: 'INM & Safe Stewardship · Farmer Health, Pollinators & Food Safety',
    imageUrl: '/src/assets/images/inorganic_safe_handling_1794924188715.jpg',
    summary:
      'Responsible handling of insecticides, fungicides, and herbicides—respecting colour toxicity triangles, protective gear, and Pre-Harvest Intervals—protects farmer health and crop marketability.',
    details: {
      'Category': 'INM & Safe Stewardship',
      'Toxicity Colour Code': 'Red (Extremely Toxic), Yellow (Highly Toxic), Blue (Moderately Toxic), Green (Slightly Toxic) — always prefer Green/Blue alternatives first.',
      'Protective Gear (PPE)': 'Wear chemical-resistant gloves, mask/respirator, goggles, long-sleeved shirt, and boots while measuring, mixing, or spraying.',
      'Safe Spraying Rules': 'Spray early morning or late evening when wind is calm; walk cross-wind; NEVER spray insecticides during peak honeybee bloom.',
      'PHI & Disposal': 'Strictly observe Pre-Harvest Interval (PHI) days printed on the bottle before picking produce; triple-rinse empty bottles and never wash sprayers in village ponds.',
    },
    highlights: ['Respect toxicity colour triangles', 'Observe Pre-Harvest Interval (PHI)', 'Protect bees by avoiding bloom-time sprays'],
  },
  {
    slug: 'controlled-release-fertigation',
    section: 'inorganic',
    title: 'Controlled-Release Fertilizers (CRF) & Stage-Wise Fertigation',
    subtitle: 'INM & Safe Stewardship · Precision Nutrient Timing for Higher Profit',
    imageUrl: '/src/assets/images/inorganic_crf_fertigation_1794924189699.jpg',
    summary:
      'Polymer/sulphur-coated Controlled-Release Fertilizers and stage-wise drip fertigation schedules feed crops exactly according to vegetative, flowering, and fruit-bulking demand.',
    details: {
      'Category': 'INM & Safe Stewardship',
      'Controlled-Release Granules': 'Polymer/Sulphur-coated Urea releases nitrogen steadily over 60–90 days, cutting volatilization and single-shot labour in paddy, orchards, and turf.',
      'Stage-Wise Drip Chart': 'Vegetative (19:19:19 + Urea), Flowering/Rooting (12:61:0 MAP + Boron), Fruit/Bulb Bulking (0:52:34 MKP & 13:0:45 Potassium Nitrate).',
      'Water Quality Check': 'Always verify EC and pH of fertigation mix and avoid mixing Calcium Nitrate with Phosphates or Sulphates in the same tank (causes clogging precipitate).',
      'Economic Gain': 'Reduces total chemical input usage by 25–30% while boosting export fruit brix and shelf life.',
    },
    highlights: ['Never mix Calcium Nitrate with Phosphates', 'Cuts nutrient leaching by 30%', 'Matches fertilizer to crop growth stage'],
  },

  // TECHNOLOGIES — IRRIGATION TECHNOLOGIES
  {
    slug: 'drip-irrigation-tech',
    section: 'technology',
    title: 'Drip Irrigation & Fertigation',
    subtitle: 'Irrigation Technologies · Precision Root-Zone Water & Nutrient Delivery',
    imageUrl: '/src/assets/images/hero_drip_irrigation_crops_1794853262136.jpg',
    summary:
      'Drip irrigation delivers water and dissolved nutrients slowly drop-by-drop directly to the plant root zone, cutting evaporation, deep percolation, and weed growth dramatically.',
    details: {
      'Category': 'Irrigation Technologies',
      'Water & Yield Impact': 'Saves 40–60% water compared to flood irrigation and raises crop yield by 20–40% through uniform root moisture.',
      'Fertigation Advantage': 'Injecting water-soluble fertilizers via venturi reduces fertilizer losses by up to 30% and lowers labour cost.',
      'Best For': 'Vegetables, Banana, Sugarcane, Cotton, Grapes, Mango, Coconut, Arecanut, and Chilli.',
      'Maintenance & Subsidy': 'Flush laterals every 15 days and clean sand/screen filters regularly. Subsidized under PMKSY — Per Drop More Crop.',
    },
    highlights: ['40–60% water savings over flooding', 'Precision venturi fertigation', 'Subsidized under PMKSY Per Drop More Crop'],
  },
  {
    slug: 'sprinkler-irrigation-tech',
    section: 'technology',
    title: 'Sprinkler & Micro-Sprinkler Irrigation',
    subtitle: 'Irrigation Technologies · Uniform Rainfall-Like Crop Watering',
    imageUrl: '/src/assets/images/tech_sprinkler_irrigation_1794924189340.jpg',
    summary:
      'Portable, semi-permanent, and micro-sprinkler systems distribute pressurized water evenly across field crops without requiring expensive laser land leveling.',
    details: {
      'Category': 'Irrigation Technologies',
      'Water & Yield Impact': 'Saves 30–40% water compared to surface flooding while washing dust off leaves and moderating micro-climate heat.',
      'Best For': 'Groundnut, Ragi, Wheat, Bengal Gram, Onion, Potato, Leafy Greens, and Fodder crops on undulating or sandy soils.',
      'Micro-Sprinklers': 'Ideal for closely spaced orchards, nurseries, and ginger/turmeric beds needing cool humid canopies.',
      'Subsidy Support': 'Eligible for micro-irrigation subsidies under PMKSY through State Agriculture & Horticulture portals.',
    },
    highlights: ['Works well on undulating slopes', 'Ideal for groundnut, pulses & millets', 'Prevents frost & heat-stress damage'],
  },
  {
    slug: 'solar-pumps-automated-irrigation',
    section: 'technology',
    title: 'Solar Water Pumps & Automated Irrigation Timers',
    subtitle: 'Irrigation Technologies · Clean Daytime Energy & Smart Valves',
    imageUrl: '/src/assets/images/tech_solar_pumps_1794924189727.jpg',
    summary:
      'Solar photovoltaic pumps (2 HP to 10 HP DC/AC) eliminate diesel bills and unpredictable night-time grid power, while automated timers/solenoid valves schedule irrigation accurately.',
    details: {
      'Category': 'Irrigation Technologies',
      'Solar Pump Benefits': 'Provides reliable daytime pumping aligned with drip/sprinkler operations and virtually zero recurring fuel cost for 20+ years.',
      'Smart Automation': 'Timer controllers and GSM/mobile-operated motor starters protect borewell pumps from dry-run and voltage spikes.',
      'Best For': 'Off-grid farms, farm ponds, borewells, and multi-block drip orchards.',
      'Scheme Support': 'Substantial capital subsidy available under PM-KUSUM (Component B standalone & Component C feeder solarization).',
    },
    highlights: ['Zero diesel or daytime power outages', 'Mobile GSM motor controllers prevent burnout', 'Supported under PM-KUSUM scheme'],
  },

  // TECHNOLOGIES — PROTECTED CULTIVATION
  {
    slug: 'greenhouse-polyhouse',
    section: 'technology',
    title: 'Greenhouse, Polyhouse & Shade-Net Farming',
    subtitle: 'Protected Cultivation · Climate-Shielded High-Value Crops',
    imageUrl: '/src/assets/images/tech_polyhouse_shadenet_1794924189933.jpg',
    summary:
      'Naturally ventilated polyhouses and UV-stabilized shade-net houses regulate temperature, humidity, and insect entry, enabling off-season crops and export-grade quality.',
    details: {
      'Category': 'Protected Cultivation',
      'Structures': 'Naturally Ventilated Polyhouse (for Coloured Capsicum, Seedless Cucumber, Tomato, Rose, Gerbera); 50% Shade-Net House (for nurseries, coriander, leafy greens).',
      'Yield Advantage': 'Produces 3–5x higher yield per unit area with dramatically lower insect pest and hail/heavy-rain damage.',
      'Key Management': 'Must use drip fertigation, insect-proof 40-mesh nets, and soil solarization to prevent root-knot nematodes.',
      'Scheme Support': 'Eligible for capital subsidies under Mission for Integrated Development of Horticulture (MIDH / NHM).',
    },
    highlights: ['3–5x yield per square meter', 'Protects against hail, heat & whiteflies', 'Subsidy support under MIDH / NHM'],
  },
  {
    slug: 'hydroponics-vertical-farming',
    section: 'technology',
    title: 'Hydroponics, Aeroponics & Vertical Farming',
    subtitle: 'Protected Cultivation · Soilless Precision Water-Recirculating Systems',
    imageUrl: '/src/assets/images/tech_protected_hydroponics_1794923391449.jpg',
    summary:
      'Soilless cultivation grows leafy greens, herbs, strawberries, and disease-free seed potatoes in recirculating mineral nutrient solutions using up to 90% less water than open fields.',
    details: {
      'Category': 'Protected Cultivation',
      'Methods': 'NFT (Nutrient Film Technique) pipes for lettuce/basil; Dutch buckets for vine crops; Aeroponic mist towers for clean seed-potato mini-tubers; Hydroponic green fodder trays for dairy.',
      'Precision Control': 'Requires daily monitoring of solution EC (nutrient strength) and pH (5.5–6.5).',
      'Water Savings': 'Closed-loop recirculation saves 85–90% water and eliminates soil-borne weeds and wilt pathogens.',
      'Practical Rural Use': 'Low-cost 7-day hydroponic maize fodder units provide fresh green cattle feed even during severe drought.',
    },
    highlights: ['Uses up to 90% less water', 'Zero soil-borne wilt or weeds', '7-day hydroponic fodder aids dairy farms'],
  },

  // TECHNOLOGIES — AGRICULTURAL MACHINERY
  {
    slug: 'precision-ag-machinery',
    section: 'technology',
    title: 'Farm Machinery (Tractors, Seed Drills, Rotavators & Harvesters)',
    subtitle: 'Agricultural Machinery · Cutting Drudgery & Ensuring Timely Sowing',
    imageUrl: '/src/assets/images/hero_modern_farming_machinery_1794853261714.jpg',
    summary:
      'Modern mechanization—from power tillers and Happy Seeders to paddy transplanters and combine harvesters—ensures critical sowing/harvest windows are met despite rural labour shortages.',
    details: {
      'Category': 'Agricultural Machinery',
      'Land & Sowing': 'Rotavators, Power Tillers/Weeders (great for narrow inter-rows), Zero-Till / Happy Seeders (sows wheat directly into paddy stubble without burning), and Multi-crop Planters.',
      'Transplanting & Harvest': 'Mechanical Paddy Transplanters, Brush Cutters, Reapers, Chaff Cutters, and Combine Harvesters.',
      'Custom Hiring': 'Small farmers need not buy costly machines—rent per hour affordably via Krishi Yantradhare / CHC (Custom Hiring Centres).',
      'Scheme Support': 'Machinery subsidies provided under Sub-Mission on Agricultural Mechanization (SMAM) and State Farm Mechanization schemes.',
    },
    highlights: ['Happy Seeder stops stubble burning', 'Rent hourly via Custom Hiring Centres', 'Subsidized under SMAM & State portals'],
  },

  // TECHNOLOGIES — PRECISION & DIGITAL AGRICULTURE
  {
    slug: 'agri-drones-laser-leveling',
    section: 'technology',
    title: 'Agricultural Drones (Kisan Drones) & Laser Land Leveling',
    subtitle: 'Precision & Digital Agriculture · Aerial Spraying & Precision Fields',
    imageUrl: '/src/assets/images/tech_kisan_drone_1794924190743.jpg',
    summary:
      'Kisan Drones spray nano-urea and crop protection inputs over 1 acre in just 7–10 minutes with 90% less water, while Laser Land Levelers create perfectly flat fields for uniform irrigation.',
    details: {
      'Category': 'Precision & Digital Agriculture',
      'Kisan Drones': 'Uniform micron-droplet spraying reduces chemical exposure to farm workers, accesses tall Sugarcane/Maize canopies, and operates quickly before rain.',
      'Laser Land Leveling': 'Laser-guided scraper levels fields within ±2 cm tolerance, saving 20–25% irrigation water and ensuring uniform germination.',
      'Safety & Rules': 'Drone spraying must follow DGCA RPTO pilot guidelines and recommended nozzle flow rates.',
      'Scheme Support': 'Supported under Namo Drone Didi (Women SHGs) and SMAM drone grant schemes.',
    },
    highlights: ['Sprays 1 acre in 7–10 minutes', 'Laser leveling cuts irrigation water by 25%', 'Promoted via Namo Drone Didi & SMAM'],
  },
  {
    slug: 'iot-sensors-digital-mandi',
    section: 'technology',
    title: 'IoT Soil Sensors, Weather Advisories & e-NAM Digital Mandis',
    subtitle: 'Precision & Digital Agriculture · Data-Driven Farming & Transparent Markets',
    imageUrl: '/src/assets/images/tech_iot_sensors_enam_1794924191026.jpg',
    summary:
      'Digital tools—including soil moisture tensiometers, hyperlocal IMD Meghdoot weather forecasts, and e-NAM electronic mandis—help farmers decide when to irrigate, spray, and sell at fair prices.',
    details: {
      'Category': 'Precision & Digital Agriculture',
      'Field Sensors & Weather': 'Soil moisture & EC sensors prevent over-watering; Agromet apps (Meghdoot, Damini lightning alert, Kisan Suvidha) provide 5-day block-level forecasts.',
      'Digital Market Access': 'e-NAM (National Agriculture Market) and Karnataka ReMS enable transparent online assaying and competitive electronic bidding across mandis.',
      'AI & Satellite Scouting': 'Satellite NDVI crop-health maps help spot nutrient or pest patches early across large farms.',
      'Farmer Benefit': 'Reduces post-harvest price exploitation and input wastage through timely decisions.',
    },
    highlights: ['e-NAM enables transparent online bidding', 'Weather apps protect against unseasonal rain', 'Moisture sensors prevent water wastage'],
  },

  // TECHNOLOGIES — FOREIGN & GLOBAL AGTECH
  {
    slug: 'israel-precision-sdi-desalination',
    section: 'technology',
    title: 'Israel: Subsurface Drip Irrigation (SDI), Desalination & Hydro-Sensors',
    subtitle: 'Foreign & Global AgTech · Arid-Land Water Mastery',
    imageUrl: '/src/assets/images/tech_israel_dutch_precision_1794923394615.jpg',
    summary:
      'Pioneered in Israel’s arid Negev desert, pressure-compensated Subsurface Drip Irrigation (buried 20–40 cm deep), sap-flow plant sensors, and brackish-water desalination maximize every drop of water.',
    details: {
      'Category': 'Foreign & Global AgTech',
      'Country / Origin': 'Israel (Volcani Institute & Negev Precision Irrigation Systems)',
      'Core Innovation': 'Pressure-compensated buried drip emitters + root-zone tensiometers & stem dendrometers that trigger automated fertigation pulses only when plant cells signal water deficit.',
      'Real-World Impact': 'Saves up to 65% water versus flood irrigation, stops surface evaporation, and keeps inter-rows dry and weed-free.',
      'Adoption in India': 'Implemented across Indo-Israeli Centres of Excellence (CoEs) in Karnataka (Kolar, Dharwad, Bagalkot) for mango, pomegranate, and vegetables.',
    },
    highlights: ['Indo-Israeli Centres of Excellence in India', 'Zero surface evaporation loss', 'Plant-sensor driven fertigation'],
  },
  {
    slug: 'dutch-climate-greenhouses',
    section: 'technology',
    title: 'Netherlands: Climate-Controlled Glasshouses & CO₂ Enrichment',
    subtitle: 'Foreign & Global AgTech · Ultra-High-Density Protected Farming',
    imageUrl: '/src/assets/images/tech_dutch_glasshouse_1794924191068.jpg',
    summary:
      'Dutch Venlo glasshouses recycle 95% of irrigation runoff, inject purified CO₂ to accelerate photosynthesis, and deploy beneficial biological insects—achieving 10x higher tomato yields per acre.',
    details: {
      'Category': 'Foreign & Global AgTech',
      'Country / Origin': 'Netherlands (Wageningen UR & Westland Horticulture Clusters)',
      'Core Innovation': 'Automated climate computers balancing thermal energy screens, rockwool closed-loop hydroponics, UV water sterilization, and biological pest predators.',
      'Real-World Impact': 'Produces ~500+ tonnes of tomatoes/hectare with less than 4 litres of water per kg of fruit (vs 60+ litres in open fields).',
      'Adoption in India': 'Adapted in Indian FPO commercial polyhouses and Centre of Excellence floriculture/capsicum nurseries.',
    },
    highlights: ['Up to 10x yield per unit land', '95% closed-loop water recycling', 'Uses predatory insects over sprays'],
  },
  {
    slug: 'japan-robotic-transplanters-factories',
    section: 'technology',
    title: 'Japan: GPS Rice Transplanters, LED Plant Factories & Optical Sorting',
    subtitle: 'Foreign & Global AgTech · Compact Mechanization & Zero-Defect Quality',
    imageUrl: '/src/assets/images/tech_japan_transplanter_1794924191323.jpg',
    summary:
      'Facing ageing rural workforces and small plots, Japan engineered ultra-compact 4–8 row ride-on GPS rice transplanters, multi-tier LED indoor farms, and AI optical fruit graders.',
    details: {
      'Category': 'Foreign & Global AgTech',
      'Country / Origin': 'Japan (NARO & Compact Smallholder Engineering)',
      'Core Innovation': 'Mat-nursery robotic rice transplanters, multi-tier climate-sealed LED Plant Factories, and near-infrared (NIR) non-destructive fruit sweetness/defect sorters.',
      'Real-World Impact': 'Transplants 1 acre of paddy uniformly in under 1 hour with 60% less labour and grades export fruit without bruising.',
      'Adoption in India': 'Japanese-model paddy transplanters are widely rented through Indian Custom Hiring Centres and Krishi Yantradhare.',
    },
    highlights: ['Built specifically for small farm plots', 'NIR sensors test fruit sweetness inside', '1 acre paddy transplanted in 45 mins'],
  },
  {
    slug: 'usa-eu-rtk-autosteer-vrt',
    section: 'technology',
    title: 'USA & Europe: RTK-GPS Autosteer Tractors & Variable Rate Technology (VRT)',
    subtitle: 'Foreign & Global AgTech · Centimetre-Accurate Field Operations',
    imageUrl: '/src/assets/images/tech_rtk_autosteer_vrt_1794924191446.jpg',
    summary:
      'Real-Time Kinematic (RTK) GPS steering guides tractors within 2 cm accuracy to eliminate overlap during sowing and spraying, while VRT spreaders adjust seed and fertilizer doses meter-by-meter.',
    details: {
      'Category': 'Foreign & Global AgTech',
      'Country / Origin': 'United States & Germany (ISOBUS Precision Machinery Standards)',
      'Core Innovation': 'RTK satellite base stations + combine yield monitors + ISOBUS prescription maps that dynamically open/close sprayer nozzles and fertilizer valves.',
      'Real-World Impact': 'Cuts seed, diesel, and chemical overlap waste by 10–18% and prevents soil compaction outside permanent wheel tracks (Controlled Traffic Farming).',
      'Adoption in India': 'Emerging in large Sugarcane/Potato estates, FPO seed-production hubs, and custom tractor-service startups.',
    },
    highlights: ['2 cm GPS pass-to-pass accuracy', 'Eliminates double-spraying overlap', 'Controlled Traffic Farming spares root soil'],
  },
  {
    slug: 'autonomous-ai-weeding-robotics',
    section: 'technology',
    title: 'Global Robotics: AI Optical Weeding Robots, Laser Weeders & Harvesters',
    subtitle: 'Foreign & Global AgTech · Chemical-Free Autonomous Field Robotics',
    imageUrl: '/src/assets/images/tech_foreign_ag_robotics_1794923392821.jpg',
    summary:
      'Autonomous solar-electric field rovers from Europe, Israel, and the US use computer-vision cameras to distinguish crops from weeds in milliseconds—zapping weeds mechanically or via precision micro-lasers.',
    details: {
      'Category': 'Foreign & Global AgTech',
      'Country / Origin': 'Switzerland, France, USA & Australia',
      'Core Innovation': 'Edge-AI camera vision + mechanical intra-row hoeing blades or high-precision targeted laser pulses ("See & Spray" or zero-herbicide laser weeding).',
      'Real-World Impact': 'Slashes chemical herbicide usage by 80–95% while replacing back-breaking manual hand weeding in vegetable and row crops.',
      'Adoption Pathway': 'Rented out via Robot-as-a-Service (RaaS) FPO models and high-value organic vegetable clusters.',
    },
    highlights: ['Cuts herbicide usage by up to 90%', 'Solar-electric zero-emission rovers', 'Protects soil microbes from chemicals'],
  },
  {
    slug: 'eu-satellite-ndvi-digital-twin',
    section: 'technology',
    title: 'Europe (Copernicus) & USA: Satellite NDVI Scouting & Digital Twin Farms',
    subtitle: 'Foreign & Global AgTech · Space-to-Field Crop Intelligence',
    imageUrl: '/src/assets/images/tech_satellite_ndvi_1794924191931.jpg',
    summary:
      'Multi-spectral Sentinel-2 satellite imagery and hyperspectral drones measure plant chlorophyll stress (NDVI/NDRE) every 5 days—spotting drought, pest outbreaks, or nitrogen gaps days before human eyes notice.',
    details: {
      'Category': 'Foreign & Global AgTech',
      'Country / Origin': 'European Union (ESA Copernicus) & North America',
      'Core Innovation': '10-metre satellite vegetation indices integrated with weather models and evapotranspiration maps to build a live "Digital Twin" of each field.',
      'Real-World Impact': 'Enables rapid PMFBY crop-loss assessment, early nitrogen correction zones, and accurate regional yield forecasting.',
      'Adoption in India': 'Powers ISRO/MNCFC national crop monitoring, PMFBY remote-sensing claim settlements, and smartphone advisory apps.',
    },
    highlights: ['Detects crop stress before eyes see it', 'Supports faster PMFBY insurance claims', 'Free Sentinel imagery powers farm apps'],
  },
  {
    slug: 'us-australian-center-pivot',
    section: 'technology',
    title: 'USA & Australia: Mechanized Center-Pivot Irrigation & Telemetry',
    subtitle: 'Foreign & Global AgTech · Large-Scale Low-Pressure Precision Watering',
    imageUrl: '/src/assets/images/tech_center_pivot_1794924191676.jpg',
    summary:
      'Wheeled truss sprinklers rotate around a central borewell/canal pivot using Variable Rate Irrigation (VRI) nozzles and cellular telemetry to irrigate 50–150 acres with minimal labour.',
    details: {
      'Category': 'Foreign & Global AgTech',
      'Country / Origin': 'United States (Great Plains) & Australia',
      'Core Innovation': 'Low-energy drop-nozzle spans hovering just above the canopy (LEPA) + GPS sector control that shuts off water over rocky patches or farm roads.',
      'Real-World Impact': 'Achieves 85–90% irrigation uniformity across sandy soils and rolling terrain with single-farmer smartphone supervision.',
      'Adoption Pathway': 'Suited to cooperative FPO contiguous blocks, seed-multiplication farms, fodder estates, and corporate contract farms.',
    },
    highlights: ['85–90% uniform water application', 'Low-pressure canopy drops save power', 'Ideal for FPO contiguous field blocks'],
  },
  {
    slug: 'global-blockchain-cold-chain',
    section: 'technology',
    title: 'Global Supply Chain: Blockchain Traceability & Solar Cold Storage',
    subtitle: 'Foreign & Global AgTech · Cutting Post-Harvest Loss & Winning Export Trust',
    imageUrl: '/src/assets/images/tech_solar_cold_chain_1794924192974.jpg',
    summary:
      'European/Japanese farm-to-fork QR blockchain ledgers verify harvest dates and pesticide-free logs, while off-grid phase-change solar cold rooms preserve perishable fruits and vegetables right at the farm gate.',
    details: {
      'Category': 'Foreign & Global AgTech',
      'Country / Origin': 'European Union, Singapore, Kenya & India Co-Development',
      'Core Innovation': 'Off-grid thermal-battery solar cold rooms (keeping 4°C–8°C for 36+ hours without diesel) paired with IoT temperature loggers and QR blockchain certificates.',
      'Real-World Impact': 'Cuts post-harvest fruit/vegetable spoilage from 25–30% down to under 5% and prevents distress selling at harvest glut prices.',
      'Adoption in India': 'Backed by Agriculture Infrastructure Fund (AIF) and MIDH cold-chain capital subsidies for FPOs.',
    },
    highlights: ['Cuts post-harvest spoilage below 5%', 'Zero diesel solar thermal cold rooms', 'Subsidized under Agri Infra Fund (AIF)'],
  },
  ...EXTRA_SOIL_ITEMS,
  ...EXTRA_ANIMAL_ITEMS,
  ...EXTRA_ORGANIC_ITEMS,
  ...EXTRA_INORGANIC_ITEMS,
  ...EXTRA_TECHNOLOGY_ITEMS,
];
