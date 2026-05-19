import type { Section, SectionKey, Session } from '@/types';
import { SECTION_ORDER, SECTION_TITLES } from '@/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

const emptySection = (key: SectionKey): Section => ({
  key,
  title: SECTION_TITLES[key],
  completionState: 'empty',
  notes: '',
  indicators: [],
  recordingState: 'idle',
  recordingDurationSeconds: 0,
  transcript: null,
  transcriptFlagged: false,
  hasConflict: false,
  draftContent: null,
  aiOriginalContent: null,
  draftState: 'blank',
  approvalState: 'pending',
  lastSavedAt: null,
});

const makeSection = (key: SectionKey, overrides: Partial<Section> = {}): Section => {
  const base = emptySection(key);
  const merged = { ...base, ...overrides };
  // Auto-derive recordingState when a transcript is present and not explicitly overridden
  if (overrides.transcript && !overrides.recordingState) {
    merged.recordingState = 'transcript_ready';
  }
  return merged;
};

const makeSections = (
  overrides: Partial<Record<SectionKey, Partial<Section>>> = {},
): Record<SectionKey, Section> =>
  Object.fromEntries(
    SECTION_ORDER.map((key) => [key, makeSection(key, overrides[key] ?? {})]),
  ) as Record<SectionKey, Section>;

const at = (daysAgo: number, h: number, m: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

// ─── Session 1: Marcus D. — in_progress, 6 of 10 interview sections ─────────

const T_MARCUS = at(0, 9, 15);

const marcusSession: Session = {
  id: 'session-marcus',
  clientId: 'client-marcus',
  clientName: 'Marcus D.',
  bcbaId: 'bcba-chen',
  bcbaName: 'Dr. Chen, BCBA',
  status: 'in_progress',
  createdAt: T_MARCUS,
  updatedAt: T_MARCUS,
  consentGranted: true,
  consentGrantedAt: T_MARCUS,
  clientProfile: {
    dob: '2018-06-15',
    phone: '(813) 555-0147',
    address: '1204 Bayside Ave, Tampa, FL 33606',
    referralDate: '2026-04-22',
    insurerName: 'Aetna BCN',
    memberId: 'AET-00183920',
    groupNumber: 'GRP-44821',
    referringProvider: 'Dr. R. Morales, MD',
    diagnosis: 'Autism Spectrum Disorder, Level 2 (F84.0)',
    gender: 'Male',
    icd10: 'F84.0',
    medicaidId: 'FL-MCD-29473810',
    assessmentType: 'Initial',
    assessmentDate: '2026-05-19',
    parentGuardianNames: 'Maria & David D.',
    relationship: 'Parent',
    preferredLanguage: 'English',
    reasonForReferral: 'Referred by Dr. R. Morales due to escalating behavioral challenges including task refusal, transition meltdowns, and caregiver-directed aggression. ABA evaluation and treatment planning requested.',
    interventionSettings: ['Home', 'Community'],
  },
  sectionsWithData: 6,
  totalInterviewSections: 10,
  sectionsApproved: 0,
  sections: makeSections({
    demographics: {
      completionState: 'complete',
    },
    presenting_concerns: {
      completionState: 'complete',
      notes:
        'Parents report significant task avoidance and daily transition struggles. Severity: moderate-severe.',
      transcript:
        'CAREGIVER: The main things are the meltdowns when we transition — every morning to school is a battle. And he refuses tasks constantly.\n' +
        'BCBA: How long have these concerns been present?\n' +
        "CAREGIVER: Since he was about 3. It's been getting worse.",
      draftState: 'blank',
      lastSavedAt: T_MARCUS,
    },
    self_help: {
      completionState: 'complete',
      notes:
        'Toilet trained. Feeds independently with utensils. Needs verbal prompts for dressing. Hygiene requires step-by-step visual support.',
      draftState: 'blank',
      lastSavedAt: T_MARCUS,
    },
    daily_living: {
      completionState: 'partial',
      notes:
        '1-step directions: independent. 2-step: requires repetition. Attention span ~5–7 minutes on structured tasks.',
      draftState: 'blank',
      lastSavedAt: T_MARCUS,
    },
    safety: {
      completionState: 'complete',
      notes:
        'Elopement: moderate risk. Aggression: mild, caregiver is primary target. SIB: not present. Supervision: constant.',
      transcript:
        "CAREGIVER: He's run out the front door twice this month. And he'll hit me when I try to redirect him from the iPad.\n" +
        'BCBA: Has anyone been injured?\n' +
        'CAREGIVER: No, not seriously.',
      draftState: 'blank',
      lastSavedAt: T_MARCUS,
    },
    communication: {
      completionState: 'complete',
      notes:
        'Verbal, 3–4 word phrases. MLU approximately 3.5. Intelligibility ~80% to unfamiliar listener. FCT needed — currently uses behavior to refuse.',
      transcript:
        "CAREGIVER: He talks but not full sentences. He'll say 'want juice' or 'no school'.\n" +
        'BCBA: Does he ask for help?\n' +
        'CAREGIVER: He just cries or hits instead.',
      draftState: 'blank',
      lastSavedAt: T_MARCUS,
    },
    behavior_targets: {
      completionState: 'partial',
      notes: 'Task refusal: operational def TBD. Elopement: operational def TBD.',
      indicators: [
        { id: 'b1', label: 'Task refusal', count: 8, isCustom: true, unit: 'count' },
        { id: 'b2', label: 'Elopement attempt', count: 3, isCustom: true, unit: 'count' },
      ],
      draftState: 'blank',
      lastSavedAt: T_MARCUS,
    },
  }),
};

// ─── Session 2: Sofia R. — ready_to_review, all 11 sections complete ────────

const T_SOFIA = at(0, 8, 0);

const sofiaDrafts: Partial<Record<SectionKey, string>> = {
  presenting_concerns:
    'Sofia R. is a 6-year-old female diagnosed with Autism Spectrum Disorder, Level 2 (DSM-5). Caregivers report 4–6 tantrum episodes daily averaging 15–20 minutes in duration. Primary behavioral triggers include activity transitions and denied access to preferred items, most notably screen time. Physical aggression directed at her 9-year-old sibling occurs with moderate frequency during shared-screen conflicts. Elopement presents as a moderate-to-high safety risk, with 4 confirmed incidents in the past 30 days, including one instance in which Sofia reached the end of the driveway before being stopped by a neighbor. Caregivers report overall family distress at 8 out of 10, indicating clinically significant impact on daily home functioning.',

  self_help:
    'Sofia demonstrates partial independence in self-help skill domains. She is independently toilet trained during daytime hours; nighttime continence remains unreliable. She self-feeds using spoon and fork with minimal prompting. Dressing skills are emerging but require adult assistance with fasteners including buttons and zippers. Hygiene routines (tooth brushing, hair care) require full physical prompting and do not occur spontaneously. Overall self-help skills remain below age expectations across multiple domains.',

  daily_living:
    'Sofia follows single-step directions independently in familiar contexts. Two-step directions require repetition and gestural cueing with inconsistent compliance across settings. She navigates within her home environment safely but does not independently manage time, money, or community safety tasks. Sustained attention to structured activities averages 8–10 minutes with preferred instructional materials. Generalization of daily living skills beyond familiar environments has not been confirmed.',

  safety:
    'Elopement is the primary safety concern. Sofia has attempted to leave the home unsupervised on 4 occasions within the past 30 days, typically following screen time removal. One incident resulted in community exposure at the end of the driveway; caregivers have since installed secondary door hardware at height. Physical aggression toward her sibling occurs with moderate frequency but has not resulted in significant injury. No self-injurious behavior is currently reported. Constant caregiver supervision is required across all indoor settings, with direct 1:1 supervision maintained outdoors.',

  communication:
    'Sofia is a verbal communicator using 2–4 word phrases functionally. Echolalia is present in both functional and non-functional forms. She produces approximations of "yes" and "no" with variable accuracy. PECS Phase 3 is established at home. Functional Communication Training (FCT) is in early stages and has not yet produced a consistent communicative replacement for challenging behavior. No AAC device is currently in use. When verbal communication fails, Sofia communicates through behavioral means including physical guidance of the caregiver and crying.',

  self_stim:
    'Sofia engages in two primary non-injurious repetitive motor behaviors: hand flapping during preferred activities and body rocking during transitions. Both behaviors occur with high frequency throughout the day and increase in intensity during anticipatory arousal and transition periods. Neither behavior poses a direct safety risk. Stimulatory behaviors are contextually managed during structured instructional sessions and are not identified as priority reduction targets at this time.',

  medical_necessity:
    'Sofia carries a primary diagnosis of Autism Spectrum Disorder, Level 2 (DSM-5), confirmed by Dr. K. Patel, MD, dated January 2023. Standardized assessment (Vineland-3 Adaptive Behavior Composite: 62) documents significant deficits in social communication, adaptive behavior, and daily living skills. Sofia received prior ABA services at 10 hr/wk, discontinued 8 months ago. Current co-treatments include occupational therapy (1x/week) and speech-language therapy (1x/week). The frequency, severity, and pervasiveness of presenting behaviors — including elopement, physical aggression, and significant adaptive skill deficits — substantiate the medical necessity for intensive, individualized ABA intervention.',

  skill_acquisitions:
    'Priority skill acquisition targets identified through caregiver interview include: (1) expanding PECS use toward verbal requesting of preferred items and activities; (2) increasing consistent responding to name across settings and communication partners; (3) developing parallel play skills with sibling in structured contexts. Previously mastered skills (per prior ABA service records) include color matching, object sorting, and 1-step command compliance. Generalization of previously mastered skills across novel settings has not been systematically confirmed and will be assessed during the initial treatment phase.',

  behavior_targets:
    'The following behaviors are identified as priority reduction targets:\n\nTantrum Behavior — operationally defined as any continuous crying episode lasting more than 30 seconds accompanied by floor drop and/or physical aggression. Antecedent warning: vocal whining lasting approximately 10 seconds. Primary maintaining function: escape from demands and access to tangibles (screen time). Baseline frequency per caregiver report: 4–6 episodes per day.\n\nElopement — operationally defined as any instance of moving toward or exiting a doorway, gate, or property boundary without explicit caregiver permission or transition cue. Primary antecedent: screen time removal. Baseline frequency: approximately 4 attempts per month. A functional behavior assessment will be completed within the first 30 days of service.',

  crisis_plan:
    'Caregiver de-escalation protocol for tantrum behavior: reduce all ongoing demands, remove audience, and offer access to a neutral preferred item in a designated calm space. Access to the denied item (screen time) should not be provided during the episode to avoid reinforcing the behavior. For elopement prevention: secondary door locks installed at height are in place; visual boundary cues for yard access are recommended.\n\nEmergency threshold for 911 contact: (1) Sofia exits the property unaccompanied and cannot be immediately retrieved; or (2) aggression escalates to the point of injury risk for sibling or caregiver. No PRN psychiatric medications for behavioral emergencies are currently prescribed. This crisis protocol will be reviewed and updated at each 90-day reassessment.',
};

const sofiaSession: Session = {
  id: 'session-sofia',
  clientId: 'client-sofia',
  clientName: 'Sofia R.',
  bcbaId: 'bcba-chen',
  bcbaName: 'Dr. Chen, BCBA',
  status: 'ready_to_review',
  createdAt: T_SOFIA,
  updatedAt: T_SOFIA,
  consentGranted: true,
  consentGrantedAt: T_SOFIA,
  clientProfile: {
    dob: '2019-03-12',
    phone: '(813) 555-0293',
    address: '3311 Oakwood Dr, Brandon, FL 33511',
    referralDate: '2026-03-10',
    insurerName: 'Florida Blue PPO',
    memberId: 'FLB-0029341',
    groupNumber: 'GRP-88102',
    referringProvider: 'Dr. K. Patel, MD',
    diagnosis: 'Autism Spectrum Disorder, Level 2 (F84.0)',
    gender: 'Female',
    icd10: 'F84.0',
    medicaidId: 'FL-MCD-38821047',
    assessmentType: 'Initial',
    assessmentDate: '2026-03-15',
    parentGuardianNames: 'Elena & Marcus R.',
    relationship: 'Parent',
    preferredLanguage: 'English',
    reasonForReferral: 'Referred by Dr. K. Patel due to significant behavioral challenges including tantrums, elopement, and sibling-directed aggression. ABA evaluation requested.',
    interventionSettings: ['Home', 'School'],
  },
  sectionsWithData: 10,
  totalInterviewSections: 10,
  sectionsApproved: 0,
  sections: makeSections({
    demographics: {
      completionState: 'complete',
      notes:
        'Sofia R., DOB 03/12/2019 (age 6). Client ID: client-sofia. ASD Level 2 (DSM-5, dx 01/2023, Dr. Patel). Insurance: Blue Cross PPO. Referred by parents and pediatrician. Service setting: home.',
      draftState: 'blank',
      lastSavedAt: T_SOFIA,
    },
    presenting_concerns: {
      completionState: 'complete',
      notes:
        'Parents report 4–6 tantrum episodes daily (15–20 min avg). Primary triggers: transitions and denied access to preferred items. Elopement: moderate risk, 2–3 incidents/week. Sibling-directed aggression during shared-screen conflicts. Family distress: moderate-severe.',
      transcript:
        'CAREGIVER: She screams and throws herself on the floor every time we switch activities. It happens maybe 5 times a day.\n' +
        'BCBA: What do tantrums look like at their worst?\n' +
        "CAREGIVER: Crying, hitting the floor, sometimes hitting her sister. Last week she ran out the back door when I turned off the TV.\n" +
        'BCBA: How long do episodes typically last?\n' +
        "CAREGIVER: Fifteen to twenty minutes if we wait it out. Less if we give her what she wants, but we're trying not to do that.\n" +
        "BCBA: On a scale of 1–10, how much is this impacting daily life?\n" +
        "CAREGIVER: Honestly, an 8. We're exhausted.",
      draftState: 'drafted',
      draftContent: sofiaDrafts.presenting_concerns!,
      aiOriginalContent: sofiaDrafts.presenting_concerns!,
      lastSavedAt: T_SOFIA,
    },
    self_help: {
      completionState: 'complete',
      notes:
        'Partially toilet trained — daytime independent, nighttime unreliable. Feeds with spoon/fork with minimal prompting. Dressing: requires assistance with buttons and zippers. Hygiene: requires full physical prompting for teeth and hair.',
      draftState: 'drafted',
      draftContent: sofiaDrafts.self_help!,
      aiOriginalContent: sofiaDrafts.self_help!,
      lastSavedAt: T_SOFIA,
    },
    daily_living: {
      completionState: 'complete',
      notes:
        'Follows single-step directions independently. Two-step requires cueing and repetition. Navigates home safely. Does not manage money, time, or community safety skills independently. Attends to structured tasks 8–10 min with preferred materials.',
      draftState: 'drafted',
      draftContent: sofiaDrafts.daily_living!,
      aiOriginalContent: sofiaDrafts.daily_living!,
      lastSavedAt: T_SOFIA,
    },
    safety: {
      completionState: 'complete',
      notes:
        'Elopement: moderate-high risk, 4 incidents in past 30 days. No SIB. Physical aggression toward siblings: moderate frequency. No weapons access. Caregiver supervision: constant indoors, direct 1:1 outdoors.',
      transcript:
        "CAREGIVER: She got out the back door four times this month. We had to put a second lock at the top.\n" +
        'BCBA: Any community safety incidents?\n' +
        'CAREGIVER: Once she ran to the end of the driveway. A neighbor stopped her.\n' +
        'BCBA: Does she show any self-injurious behavior?\n' +
        "CAREGIVER: No, nothing like that. Just hitting her sister.\n" +
        'BCBA: Is the sibling at risk of injury?\n' +
        "CAREGIVER: She's 9, so she can usually get away, but it's upsetting for both of them.",
      draftState: 'drafted',
      draftContent: sofiaDrafts.safety!,
      aiOriginalContent: sofiaDrafts.safety!,
      lastSavedAt: T_SOFIA,
    },
    communication: {
      completionState: 'complete',
      notes:
        'Verbal, 2–4 word phrases. Echolalia present (functional and non-functional). Approximations of yes/no. PECS Phase 3 in place at home. FCT: early stages. No AAC device currently in use.',
      transcript:
        "CAREGIVER: She'll say things like 'want cookie' or 'no bath'. But she can't really have a conversation.\n" +
        'BCBA: Does she use pictures or devices to communicate?\n' +
        "CAREGIVER: We have the picture cards from her old therapist. She uses them sometimes.\n" +
        "BCBA: What happens when she can't communicate what she wants?\n" +
        "CAREGIVER: She gets frustrated and has a meltdown, or she'll just grab your hand and drag you.\n" +
        'BCBA: Does she ask for help?\n' +
        "CAREGIVER: Not verbally. She'll just stand there and cry.",
      draftState: 'drafted',
      draftContent: sofiaDrafts.communication!,
      aiOriginalContent: sofiaDrafts.communication!,
      lastSavedAt: T_SOFIA,
    },
    self_stim: {
      completionState: 'complete',
      notes:
        'Hand flapping during preferred activities (high frequency). Body rocking during transitions. Both non-injurious. Occurs multiple times per hour. Does not significantly impair learning when managed. No vocal stimming reported.',
      draftState: 'drafted',
      draftContent: sofiaDrafts.self_stim!,
      aiOriginalContent: sofiaDrafts.self_stim!,
      lastSavedAt: T_SOFIA,
    },
    medical_necessity: {
      completionState: 'complete',
      notes:
        'ASD Level 2 per DSM-5 (Dr. Patel, 01/2023). Vineland-3 ABC: 62. Significant deficits in social communication, adaptive behavior, and daily living. Prior ABA: 10 hr/wk discontinued 8 months ago. Current co-treatments: OT 1x/wk, ST 1x/wk.',
      draftState: 'drafted',
      draftContent: sofiaDrafts.medical_necessity!,
      aiOriginalContent: sofiaDrafts.medical_necessity!,
      lastSavedAt: T_SOFIA,
    },
    skill_acquisitions: {
      completionState: 'complete',
      notes:
        'Priority targets: requesting preferred items (PECS → verbal), responding to name consistently, parallel play with sibling. Mastered (prior therapy): color matching, object sorting, 1-step commands. Generalization across settings not confirmed.',
      draftState: 'in_dev',
      draftContent: sofiaDrafts.skill_acquisitions!,
      aiOriginalContent: sofiaDrafts.skill_acquisitions!,
      lastSavedAt: T_SOFIA,
    },
    behavior_targets: {
      completionState: 'complete',
      notes:
        'Tantrum: defined as crying >30 sec + floor drop or aggression. Elopement: defined as moving toward or through an exit without permission.',
      transcript:
        `BCBA: Walk me through what a tantrum looks like from the beginning.\n` +
        `CAREGIVER: She starts whining, then if we don't respond she drops to the floor and starts crying and hitting things.\n` +
        `BCBA: Is there a warning sign?\n` +
        `CAREGIVER: The whining is always there first. Maybe 10 seconds.\n` +
        `BCBA: For elopement — is there a pattern to when it happens?\n` +
        `CAREGIVER: Screen time ending is the biggest one. She'll bolt the second you turn it off.`,
      indicators: [
        { id: 'bi-sofia-1', label: 'Tantrum episode', count: 5, isCustom: false, unit: 'count' },
        { id: 'bi-sofia-2', label: 'Elopement attempt', count: 2, isCustom: true, unit: 'count' },
      ],
      draftState: 'drafted',
      draftContent: sofiaDrafts.behavior_targets!,
      aiOriginalContent: sofiaDrafts.behavior_targets!,
      lastSavedAt: T_SOFIA,
    },
    crisis_plan: {
      completionState: 'complete',
      notes:
        'Caregiver de-escalation: reduce demands, offer preferred item, wait in safe space. Elopement prevention: second door lock, visual boundary cues. Emergency threshold: 911 if elopement results in community exposure or if aggression escalates to self-harm. No PRN medications for behavioral emergencies.',
      transcript:
        'BCBA: Do you have any current crisis protocol in place?\n' +
        "CAREGIVER: Not formally. We just try to stay calm and wait it out.\n" +
        'BCBA: Have you ever needed to call emergency services?\n' +
        'CAREGIVER: No. I hope it never comes to that.\n' +
        "BCBA: We'll formalize a plan you can post at home. The key signal for 911 would be if she gets out of the yard or hurts herself.\n" +
        "CAREGIVER: That makes sense. I'd feel better having something written down.",
      draftState: 'drafted',
      draftContent: sofiaDrafts.crisis_plan!,
      aiOriginalContent: sofiaDrafts.crisis_plan!,
      lastSavedAt: T_SOFIA,
    },
  }),
};

// ─── Session 3: Jaylen T. — complete, all sections approved ─────────────────

const T_JAYLEN = at(1, 14, 30);

const jaylenDrafts: Partial<Record<SectionKey, string>> = {
  demographics:
    'Jaylen T. is a 7-year-old male (DOB: 05/22/2016) referred to ABA services by his parents and pediatrician due to a primary diagnosis of Autism Spectrum Disorder, Level 2 (DSM-5). Jaylen is insured through Aetna HMO. Services will be provided in the home and community settings under the supervision of Dr. Torres, BCBA. Jaylen currently attends a self-contained special education classroom.',

  presenting_concerns:
    'Jaylen is a 7-year-old male referred by his parents due to concerns related to Autism Spectrum Disorder, including significant difficulties with social engagement, emotional regulation, and functional communication within structured environments. His parents report that behaviors including physical aggression toward caregivers and elopement attempts have significantly impacted his participation in home routines and educational settings. Current frequency of physical aggression is reported at 2–4 incidents per week, with elopement attempts occurring 3–5 times per week, primarily during transition periods and following removal of preferred items.',

  self_help:
    'Jaylen demonstrates age-appropriate toileting skills and self-feeds independently using utensils. He requires moderate verbal prompting for dressing, particularly with fasteners and multi-step hygiene sequences. Daily hygiene tasks (tooth brushing, hand washing, bathing) are completed with step-by-step verbal cuing from caregivers. Generalization of self-care skills across non-preferred settings and novel caregivers remains a priority target area.',

  daily_living:
    'Jaylen independently follows one-step directions and completes familiar routines with visual schedule support. Two-step directions require repetition and gestural prompting in approximately 60% of trials. He can safely navigate his home environment and school building. He does not yet independently manage time, money, or community safety tasks. Sustained attention to structured tasks averages 8–12 minutes with preferred instructional materials.',

  safety:
    'Jaylen presents with a moderate-to-high elopement risk. Caregivers report 3–5 elopement attempts per week, typically occurring during transition periods or following removal of preferred items. Physical aggression toward caregivers occurs at moderate frequency (2–4 instances per week), manifesting as hitting and kicking during demand presentations. No self-injurious behavior is currently reported. Constant caregiver supervision is required across all settings.',

  communication:
    'Jaylen is a verbal communicator who uses 4–6 word utterances functionally. His mean length of utterance (MLU) is estimated at 4.2 morphemes. Intelligibility to unfamiliar listeners is approximately 85%. Jaylen demonstrates emerging conversational skills but requires significant caregiver support for reciprocal exchanges. Functional Communication Training (FCT) is indicated to establish an appropriate communicative replacement for challenging behavior. No augmentative and alternative communication (AAC) system is currently in use.',

  self_stim:
    'Jaylen engages in non-injurious repetitive motor behaviors including hand flapping, spinning objects, and vocal repetition of scripted phrases from preferred videos. These behaviors occur with moderate-to-high frequency throughout the day and increase during periods of sensory overstimulation and transition. While non-injurious, they can impact social integration and responsiveness to instructional cues and are noted as contextual targets for response interruption and redirection.',

  medical_necessity:
    `Jaylen carries a primary diagnosis of Autism Spectrum Disorder, Level 2 (DSM-5), confirmed by Dr. Williams, PhD, dated March 2022. Standardized assessment (ADOS-2, Module 3; Vineland-3) indicates significant deficits in social communication, adaptive behavior, and daily living skills (Vineland-3 Adaptive Behavior Composite: 58). Jaylen's current level of functioning requires intensive, individualized ABA intervention to address skill deficits and reduce the frequency and severity of interfering behaviors that limit participation in educational and community settings. Current co-treatments include speech-language therapy (2x/week) and occupational therapy (1x/week).`,

  skill_acquisitions:
    'Priority skill acquisition targets identified through caregiver interview and direct observation include: (1) requesting preferred items and activities using complete verbal phrases; (2) responding to name and following multi-step instructions across settings; (3) initiating and maintaining peer interactions in structured play contexts; and (4) identifying and expressing emotional states using a developmentally appropriate feelings vocabulary. Previously mastered skills include color identification, shape matching, one-step direction following, and basic self-care tasks with prompting.',

  behavior_targets:
    'The following interfering behaviors are identified as priority reduction targets: (1) Physical Aggression — operationally defined as any instance of hitting, kicking, or biting directed at a caregiver or peer with sufficient contact to cause or risk bodily harm; (2) Elopement — operationally defined as any instance of moving toward or through an exit without permission, or leaving a designated area without a caregiver-initiated transition cue. A functional behavior assessment will be completed within the first 30 days of service to inform the behavior intervention plan.',

  crisis_plan:
    'In the event of physical aggression that poses imminent risk of injury, caregivers will implement the following protocol: (1) ensure personal safety through spatial distancing; (2) remove audience and reduce environmental demands; (3) offer a neutral redirect or access to a preferred calming item. Emergency services (911) will be contacted if Jaylen leaves the property unaccompanied, sustains or inflicts a significant injury, or if behavior cannot be safely managed by caregivers. No psychiatric medications are currently prescribed for behavioral emergencies. This crisis protocol will be reviewed and updated at each 90-day reassessment.',
};

const jaylenSession: Session = {
  id: 'session-jaylen',
  clientId: 'client-jaylen',
  clientName: 'Jaylen T.',
  bcbaId: 'bcba-torres',
  bcbaName: 'Dr. Torres, BCBA',
  status: 'complete',
  createdAt: T_JAYLEN,
  updatedAt: T_JAYLEN,
  consentGranted: true,
  consentGrantedAt: T_JAYLEN,
  clientProfile: {
    dob: '2016-05-22',
    phone: '(727) 555-0412',
    address: '892 Clearwater Blvd, Clearwater, FL 33755',
    referralDate: '2026-01-18',
    insurerName: 'Aetna HMO',
    memberId: 'AET-00741209',
    groupNumber: 'GRP-30055',
    referringProvider: 'Dr. A. Williams, PhD',
    diagnosis: 'Autism Spectrum Disorder, Level 2 (F84.0)',
    gender: 'Male',
    icd10: 'F84.0',
    medicaidId: 'FL-MCD-74120983',
    assessmentType: 'Reassessment',
    assessmentDate: '2026-01-25',
    parentGuardianNames: 'Denise & Marcus T.',
    relationship: 'Parent',
    preferredLanguage: 'English',
    reasonForReferral: 'Referred by Dr. A. Williams due to ASD-related behavioral challenges affecting educational and home settings. Physical aggression and elopement identified as primary concerns.',
    interventionSettings: ['Home', 'Community', 'School'],
  },
  sectionsWithData: 10,
  totalInterviewSections: 10,
  sectionsApproved: 11,
  sections: makeSections(
    Object.fromEntries(
      SECTION_ORDER.map((key) => [
        key,
        {
          completionState: 'complete',
          notes: jaylenDrafts[key] ?? '',
          draftContent: jaylenDrafts[key] ?? null,
          aiOriginalContent: jaylenDrafts[key] ?? null,
          draftState: 'drafted',
          approvalState: 'approved',
          lastSavedAt: T_JAYLEN,
        } satisfies Partial<Section>,
      ]),
    ) as Partial<Record<SectionKey, Partial<Section>>>,
  ),
};

// ─── Session 4: Emma W. — in_progress, 3 sections ───────────────────────────

const T_EMMA = at(1, 11, 0);

const emmaSession: Session = {
  id: 'session-emma',
  clientId: 'client-emma',
  clientName: 'Emma W.',
  bcbaId: 'bcba-torres',
  bcbaName: 'Dr. Torres, BCBA',
  status: 'in_progress',
  createdAt: T_EMMA,
  updatedAt: T_EMMA,
  consentGranted: false,
  consentGrantedAt: null,
  clientProfile: {
    dob: '2019-11-30',
    phone: '(813) 555-0554',
    address: '567 Magnolia Ct, Riverview, FL 33578',
    referralDate: '2026-04-30',
    insurerName: 'Cigna PPO',
    memberId: 'CIG-00294822',
    groupNumber: 'GRP-71034',
    referringProvider: 'Dr. L. Torres, MD',
    diagnosis: 'Autism Spectrum Disorder, Level 1 (F84.0)',
    gender: 'Female',
    icd10: 'F84.0',
    medicaidId: '',
    assessmentType: 'Initial',
    assessmentDate: '',
    parentGuardianNames: '',
    relationship: 'Parent',
    preferredLanguage: 'English',
    reasonForReferral: '',
    interventionSettings: [],
  },
  sectionsWithData: 3,
  totalInterviewSections: 10,
  sectionsApproved: 0,
  sections: makeSections({
    presenting_concerns: {
      completionState: 'partial',
      notes:
        'Parents report social withdrawal and restricted interests. School team flagged repetitive questioning patterns. Anxiety in unstructured settings noted by both home and school observers.',
      draftState: 'blank',
      lastSavedAt: T_EMMA,
    },
    safety: {
      completionState: 'partial',
      notes:
        'No elopement. No aggression. No SIB. Parent notes occasional breath-holding when distressed. Requires monitoring — no safety plan indicated at this time.',
      draftState: 'blank',
      lastSavedAt: T_EMMA,
    },
    behavior_targets: {
      completionState: 'partial',
      notes:
        'Repetitive questioning: operational def in progress. Breath-holding: monitoring only per parent request.',
      indicators: [
        {
          id: 'be1',
          label: 'Repetitive questioning episode',
          count: 4,
          isCustom: true,
          unit: 'count',
        },
        {
          id: 'be2',
          label: 'Breath-holding episode',
          count: 1,
          isCustom: true,
          unit: 'count',
        },
      ],
      draftState: 'blank',
      lastSavedAt: T_EMMA,
    },
  }),
};

// ─── Export ──────────────────────────────────────────────────────────────────

export const mockSessions: Session[] = [
  marcusSession,
  sofiaSession,
  jaylenSession,
  emmaSession,
];
