import { SECTION_ORDER } from '@/types';
import type { SectionKey } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GuidedPromptGroup {
  groupTitle: string;
  prompts: string[];
  isPersonalized?: boolean;
  isBcbaOnly?: boolean;
}

export interface DefaultIndicator {
  id: string;
  label: string;
  unit: 'count' | 'duration' | 'tag';
}

export interface SectionConfig {
  key: SectionKey;
  sectionNumber: number;
  title: string;
  purpose: string;
  recordingValue: 0 | 1 | 2 | 3 | 4 | 5;
  recordingNote: string;
  freeTextPrompt: string;
  notApplicableForRecording: boolean;
  hasQuickTap: boolean;
  allowsCustomIndicators: boolean;
  isSupposition: boolean;
  guidedPrompts: GuidedPromptGroup[];
  defaultIndicators: DefaultIndicator[];
  aiNeeds: string[];
}

// ─── Section definitions ──────────────────────────────────────────────────────

const demographics: SectionConfig = {
  key: 'demographics',
  sectionNumber: 1,
  title: 'Demographics & Referral Info',
  purpose: 'Populate the header table of the assessment document',
  recordingValue: 0,
  recordingNote: '',
  freeTextPrompt: '',
  notApplicableForRecording: true,
  hasQuickTap: false,
  allowsCustomIndicators: false,
  isSupposition: false,
  guidedPrompts: [],
  defaultIndicators: [],
  aiNeeds: ['Client demographics', 'Referral source', 'Insurance information'],
};

const presenting_concerns: SectionConfig = {
  key: 'presenting_concerns',
  sectionNumber: 2,
  title: 'Presenting Concerns',
  purpose: "Capture the caregiver's primary concerns that are driving the referral for ABA services",
  recordingValue: 5,
  recordingNote: 'Highest value section to record. Caregiver speaks most freely here.',
  freeTextPrompt:
    'Add clinical impressions, severity context, or anything the caregiver shared that isn\'t captured in the recording. Correct any transcript inaccuracies here.',
  notApplicableForRecording: false,
  hasQuickTap: false,
  allowsCustomIndicators: false,
  isSupposition: false,
  guidedPrompts: [
    {
      groupTitle: 'Opening / chief complaint',
      prompts: [
        "What are the main reasons you're seeking ABA services for [client name] right now?",
        "What behaviors or difficulties are most concerning to you at home?",
        'How long have these concerns been present?',
        'Has anything changed recently that made the concerns feel more urgent?',
      ],
    },
    {
      groupTitle: 'Functional impact',
      prompts: [
        "How do these behaviors affect your child's daily life at home?",
        'Are these behaviors causing problems at school or in the community?',
        'How do these behaviors affect other family members?',
        'Has your child been asked to leave a program, school placement, or childcare due to behavior?',
      ],
    },
    {
      groupTitle: 'Prior services',
      prompts: [
        'Has [client name] received ABA therapy before? If yes, where and for how long?',
        'What other services is your child currently receiving? (Speech, OT, PT, school ESE)',
        "What has worked in the past? What hasn't worked?",
      ],
    },
    {
      groupTitle: 'Diagnostic history',
      prompts: [
        'When was your child diagnosed? By whom?',
        'Do you have a copy of the diagnostic evaluation (CDE) we can attach?',
        'Are there any other diagnoses we should be aware of?',
      ],
    },
    {
      groupTitle: 'School placement',
      prompts: [
        'What school does your child attend? What grade or classroom type?',
        'Is your child in an ESE/special education placement or general education?',
        'Does your child have an IEP? Can we get a copy?',
      ],
    },
    {
      groupTitle: 'Personalized',
      isPersonalized: true,
      prompts: ['Does the child have any known allergies?'],
    },
  ],
  defaultIndicators: [],
  aiNeeds: [
    'Primary presenting behaviors',
    'Duration and onset of concerns',
    'Prior ABA history (yes/no, duration)',
    'Current concurrent services',
    'Diagnosis and ICD-10',
    'School setting / ESE placement',
    "Caregiver's primary goal",
  ],
};

const self_help: SectionConfig = {
  key: 'self_help',
  sectionNumber: 3,
  title: 'Self-Help Skills',
  purpose: "Document the client's current level of independence across self-care routines",
  recordingValue: 4,
  recordingNote: 'Good section to record. Caregivers describe self-help routines conversationally.',
  freeTextPrompt:
    'Add prompt-level observations from direct observation, clinical impressions of independence level, and any discrepancies between what the caregiver reported and what was observed.',
  notApplicableForRecording: false,
  hasQuickTap: false,
  allowsCustomIndicators: false,
  isSupposition: false,
  guidedPrompts: [
    {
      groupTitle: 'Toileting',
      prompts: [
        'Is [client name] toilet trained? Does he/she have accidents?',
        'Does he/she need reminders to use the bathroom, or does he/she initiate independently?',
        'Can he/she manage clothing and hygiene (wiping, flushing, handwashing) independently?',
      ],
    },
    {
      groupTitle: 'Feeding',
      prompts: [
        'Does your child feed themselves independently? With utensils?',
        'Are there any food restrictions, textures refused, or mealtime behaviors?',
        'Does mealtime require prompting to stay seated, use utensils, or stay on task?',
      ],
    },
    {
      groupTitle: 'Dressing',
      prompts: [
        'Can your child dress and undress independently?',
        'Does he/she require help with buttons, zippers, or shoes?',
        'Does getting dressed cause any behavioral challenges?',
      ],
    },
    {
      groupTitle: 'Hygiene',
      prompts: [
        'Can your child brush their teeth independently or with prompting?',
        'What about bathing or showering — how much help is needed?',
        'Does hygiene require a visual schedule or step-by-step support?',
      ],
    },
    {
      groupTitle: 'Sleep',
      prompts: [
        'Does your child sleep independently? Are there bedtime behavior challenges?',
        'What does the bedtime routine look like? How long does it take?',
      ],
    },
  ],
  defaultIndicators: [],
  aiNeeds: [
    'Toileting status',
    'Feeding independence',
    'Dressing independence',
    'Hygiene assistance needed',
    'Prompt types used',
    'Behavioral challenges during self-help',
  ],
};

const daily_living: SectionConfig = {
  key: 'daily_living',
  sectionNumber: 4,
  title: 'Daily Living Skills',
  purpose: 'Assess direction-following, routine adherence, attention, and community functioning',
  recordingValue: 4,
  recordingNote: 'Good section to record. Direction-following challenges come out naturally.',
  freeTextPrompt:
    'Add clinical observations from the session: actual attention span observed, prompts given, transitions attempted. Note any gap between caregiver\'s report and direct observation.',
  notApplicableForRecording: false,
  hasQuickTap: false,
  allowsCustomIndicators: false,
  isSupposition: false,
  guidedPrompts: [
    {
      groupTitle: 'Following directions',
      prompts: [
        "Can [client name] follow a one-step direction reliably? For example, 'pick up your backpack'?",
        "What about two-step directions — like 'wash your hands and come to the table'?",
        'Does he/she need directions repeated? How many times before complying?',
        'Does the type of task matter — preferred vs. non-preferred?',
      ],
    },
    {
      groupTitle: 'Routines and transitions',
      prompts: [
        'Does your child have predictable daily routines? How does he/she follow them?',
        'How does your child handle transitions between activities?',
        'Does he/she need warnings before transitions? Does that help?',
        'Are there specific transitions that are particularly difficult?',
      ],
    },
    {
      groupTitle: 'Attention and task engagement',
      prompts: [
        'How long can your child sit and attend to a structured task?',
        'What kinds of tasks hold his/her attention? What causes disengagement?',
        'Does your child require one-on-one adult presence to complete tasks?',
      ],
    },
    {
      groupTitle: 'Home responsibilities',
      prompts: [
        'Are there any household chores or responsibilities your child participates in?',
        'Does your child help clear the table, make their bed, or assist with simple tasks?',
      ],
    },
    {
      groupTitle: 'Community skills',
      prompts: [
        'How does your child do in community settings like the grocery store or restaurants?',
        'Are there behaviors that make community outings difficult?',
      ],
    },
  ],
  defaultIndicators: [],
  aiNeeds: [
    '1-step direction compliance',
    '2-step direction compliance',
    'Transition difficulty level',
    'Attention span estimate',
    'Prompt type and frequency required',
    'Specific challenging routines',
  ],
};

const safety: SectionConfig = {
  key: 'safety',
  sectionNumber: 5,
  title: 'Safety Concerns',
  purpose: 'Identify safety risks that must be documented, prioritized, and addressed in the treatment plan',
  recordingValue: 5,
  recordingNote: 'Critical section to record. Caregivers describe incidents with vivid detail.',
  freeTextPrompt:
    'Add BCBA clinical severity ratings per behavior. Note behaviors directly observed during session. Flag any discrepancy between reported frequency and clinical impression. Include overall risk level assessment.',
  notApplicableForRecording: false,
  hasQuickTap: false,
  allowsCustomIndicators: false,
  isSupposition: false,
  guidedPrompts: [
    {
      groupTitle: 'Elopement',
      prompts: [
        'Has your child ever run away or left a supervised area without permission?',
        'How often does this happen? Where does it typically occur?',
        'Has this created a dangerous situation?',
        'Does your child understand traffic safety and the concept of staying with an adult?',
      ],
    },
    {
      groupTitle: 'Aggression',
      prompts: [
        'Does your child ever hit, kick, bite, or scratch others?',
        'Who are the typical targets — caregivers, siblings, peers, or strangers?',
        'What typically triggers aggressive behavior?',
        'Has anyone been injured?',
      ],
    },
    {
      groupTitle: 'Self-injurious behavior (SIB)',
      prompts: [
        'Does your child ever hurt themselves — head-banging, hitting themselves, biting their own hand?',
        'How frequent and how intense is this behavior?',
        'Have there been any injuries from self-injury?',
      ],
    },
    {
      groupTitle: 'Property destruction',
      prompts: [
        'Does your child throw objects, break things, or destroy property?',
        'How often? Has anyone been hurt by thrown objects?',
      ],
    },
    {
      groupTitle: 'Emotional dysregulation / tantrums',
      prompts: [
        "How does your child react when frustrated or when things don't go as expected?",
        "What does a 'meltdown' look like? How long do they typically last?",
        'What helps de-escalate the situation?',
      ],
    },
    {
      groupTitle: 'Supervision requirements',
      prompts: [
        'Does your child require constant adult supervision for safety?',
        'Can your child be left alone briefly without safety concerns?',
        'Are there specific situations where you feel your child is at risk?',
      ],
    },
  ],
  defaultIndicators: [],
  aiNeeds: [
    'Elopement (yes/no + frequency)',
    'Aggression (yes/no + topography + target)',
    'SIB (yes/no + topography)',
    'Property destruction (yes/no)',
    'Tantrum profile (frequency, duration, triggers)',
    'Supervision level required',
    'Prior injuries or incidents',
  ],
};

const communication: SectionConfig = {
  key: 'communication',
  sectionNumber: 6,
  title: 'Communication',
  purpose: "Establish the client's current communication profile across modality, function, and social use",
  recordingValue: 5,
  recordingNote: 'Strong section to record. If client present, may capture live speech samples.',
  freeTextPrompt:
    "Describe the client's primary communication modality, expressive and receptive language level, functional requesting ability, and social communication deficits. Note what happens when communication breaks down.",
  notApplicableForRecording: false,
  hasQuickTap: false,
  allowsCustomIndicators: false,
  isSupposition: false,
  guidedPrompts: [
    {
      groupTitle: 'Communication modality',
      prompts: [
        'How does your child communicate? Verbally, with pictures, a device, sign language, or some combination?',
        'If verbal — does he/she use single words, short phrases, or full sentences?',
        'Is the speech intelligible to unfamiliar people?',
      ],
    },
    {
      groupTitle: 'Functional requesting',
      prompts: [
        'Can your child ask for things he/she wants? How?',
        'Does your child ask for help when needed, or does he/she get frustrated instead?',
        "Can your child say 'no' or refuse appropriately, or does it come out as a behavior?",
      ],
    },
    {
      groupTitle: 'Expressive language',
      prompts: [
        'Can your child label or name familiar objects, people, or places?',
        'Does your child spontaneously comment on things, or mainly respond to questions?',
        'Does your child use language to share information, tell stories, or describe events?',
      ],
    },
    {
      groupTitle: 'Receptive language / comprehension',
      prompts: [
        'Does your child understand what you say to him/her?',
        'Does he/she follow directions without needing gestures or visual cues?',
        "Does your child understand 'wh-' questions — who, what, where?",
      ],
    },
    {
      groupTitle: 'Social communication',
      prompts: [
        'Does your child initiate conversations or play with others?',
        'Does your child make eye contact during communication?',
        'Does your child take turns in conversation?',
        "Does your child respond when his/her name is called?",
      ],
    },
    {
      groupTitle: 'AAC / devices',
      prompts: [
        'Is your child currently using any augmentative communication device or PECS?',
        'Who set that up? Is it working?',
      ],
    },
  ],
  defaultIndicators: [],
  aiNeeds: [
    'Communication modality (verbal/AAC/PECS/nonverbal)',
    'If verbal: word level (single word/phrases/sentences)',
    'Functional requesting (yes/no/limited)',
    'Receptive language level',
    'Social communication deficits',
    'Behavior as communication (yes/no)',
    'FCT need identified (yes/no)',
  ],
};

const self_stim: SectionConfig = {
  key: 'self_stim',
  sectionNumber: 7,
  title: 'Self-Stimulatory Behavior',
  purpose: 'Identify and describe stereotypic/self-stimulatory behaviors for clinical documentation and treatment planning',
  recordingValue: 3,
  recordingNote: 'Useful to record, but direct observation matters more.',
  freeTextPrompt:
    'Describe stim behaviors directly observed: topography, context, and hypothesized function. Note any stim behaviors the caregiver reported that were not observed. Use clinical terminology.',
  notApplicableForRecording: false,
  hasQuickTap: false,
  allowsCustomIndicators: false,
  isSupposition: false,
  guidedPrompts: [
    {
      groupTitle: 'Topography identification',
      prompts: [
        'Does your child have any repetitive behaviors — things they do over and over that seem automatic?',
        'For example: hand-flapping, rocking, spinning objects, lining things up, repeating phrases, or unusual sounds?',
        'What exactly does the behavior look like? Can you demonstrate or describe it?',
      ],
    },
    {
      groupTitle: 'Function and context',
      prompts: [
        'When does this behavior happen most — when excited, anxious, bored, or overstimulated?',
        'Does it increase when demands are placed, or when the environment is unpredictable?',
        'Does it seem to help your child calm down, or does it seem uncontrollable?',
      ],
    },
    {
      groupTitle: 'Impact',
      prompts: [
        'Does this behavior interfere with learning or participation in activities?',
        'Does it concern others (teachers, peers, community members)?',
        'Does it ever cause injury (e.g. repetitive hand-biting, head-banging used as stim)?',
      ],
    },
    {
      groupTitle: 'Duration and frequency',
      prompts: [
        'How often does this behavior occur in a typical day?',
        'Can your child stop the behavior when asked? For how long?',
      ],
    },
  ],
  defaultIndicators: [],
  aiNeeds: [
    'Stim behaviors present (yes/no)',
    'Topography of each stim behavior',
    'Hypothesized function',
    'Frequency and intensity',
    'Whether behaviors interfere with task engagement',
    'Whether redirection is effective',
  ],
};

const medical_necessity: SectionConfig = {
  key: 'medical_necessity',
  sectionNumber: 8,
  title: 'Medical Necessity',
  purpose: 'Build the clinical justification for ABA services and document CPT codes with recommended hours',
  recordingValue: 3,
  recordingNote: 'Record caregiver questions only. BCBA fills clinical sub-panel after caregiver leaves.',
  freeTextPrompt:
    'Write the clinical medical necessity justification: list primary behaviors causing functional impairment, settings affected, risk if services not provided, and skill deficits requiring intervention. Enter CPT codes and recommended hours/week. This is your clinical voice.',
  notApplicableForRecording: false,
  hasQuickTap: false,
  allowsCustomIndicators: false,
  isSupposition: false,
  guidedPrompts: [
    {
      groupTitle: 'Functional impact of behaviors',
      prompts: [
        "How do [client name]'s behaviors affect his/her ability to participate in daily life at home, school, and in the community?",
        'Are these behaviors preventing your child from accessing education or social experiences?',
        'Has your child been excluded from activities, programs, or settings because of behavior?',
      ],
    },
    {
      groupTitle: 'Risk without services',
      prompts: [
        'What do you think would happen if your child did not receive ABA services?',
        'Are you concerned about safety at home without structured support?',
        'Has behavior escalated recently, or are you seeing regression without services?',
      ],
    },
    {
      groupTitle: 'Progress and skill deficits',
      prompts: [
        "What skills is your child missing that other children his/her age have mastered?",
        'Are there things your child needs to learn that would significantly improve quality of life?',
      ],
    },
    {
      groupTitle: 'BCBA clinical notes — CPT codes',
      isBcbaOnly: true,
      prompts: [
        '97151 — Behavior Identification Assessment: ___ hours',
        '97153 — Adaptive Behavior Treatment (direct, without caregiver): ___ hours/week',
        '97155 — Adaptive Behavior Treatment with protocol modification (BCBA supervision): ___ hours/week',
        '97156 — Family adaptive behavior treatment guidance (caregiver training): ___ hours/week',
      ],
    },
  ],
  defaultIndicators: [],
  aiNeeds: [
    'Primary behaviors causing functional impairment',
    'Settings impacted (home/school/community)',
    'Risk statement if services not provided',
    'Skill deficits requiring intervention',
    'CPT codes and recommended hours/units',
  ],
};

const skill_acquisitions: SectionConfig = {
  key: 'skill_acquisitions',
  sectionNumber: 9,
  title: 'Skill Acquisitions',
  purpose: 'Document skill acquisition targets and maladaptive behaviors targeted for reduction',
  recordingValue: 3,
  recordingNote: 'Section UI is in development — use notes field for now.',
  freeTextPrompt:
    'Use the goal builder below to document each skill target, or add clinical notes here.',
  notApplicableForRecording: false,
  hasQuickTap: false,
  allowsCustomIndicators: false,
  isSupposition: false,
  guidedPrompts: [
    {
      groupTitle: 'Skill identification',
      prompts: [
        "What skills would most improve [client]'s independence at home right now?",
        "What daily living skills is [client] working toward — dressing, toileting, feeding?",
        "What communication skills would reduce the most frustration for [client]?",
        "Are there safety skills that are urgent — crossing streets, stranger danger, emergency response?",
        "What social skills would help [client] connect with peers or family?",
      ],
    },
    {
      groupTitle: 'Baseline & current level',
      prompts: [
        "Does [client] attempt this skill at all, or is it not yet in their repertoire?",
        "How many times out of 10 does [client] do this correctly right now?",
        "What level of prompting does [client] currently need to complete this skill?",
        "Has [client] shown this skill in the past and lost it, or is it a new target?",
      ],
    },
    {
      groupTitle: 'Generalization context',
      prompts: [
        "Does [client] only show this skill in certain places or with certain people?",
        "Is this a skill the caregiver can practice at home between sessions?",
        "What environments are most important — home, school, community?",
      ],
    },
  ],
  defaultIndicators: [],
  aiNeeds: [
    'Skill acquisition targets (list)',
    'Maladaptive behaviors targeted for reduction',
    'Connection between skills gained and behaviors reduced',
  ],
};

const behavior_targets: SectionConfig = {
  key: 'behavior_targets',
  sectionNumber: 10,
  title: 'Behavior Targets',
  purpose: 'Capture operationally defined behavior targets with baseline data and ABC analysis',
  recordingValue: 5,
  recordingNote: 'Highest value section for recording + quick-tap together.',
  freeTextPrompt:
    'For each behavior: write or refine the operational definition in clinical language. Note hypothesized function from ABC analysis. Add baseline data from quick-tap counts. Flag any behaviors observed during session that weren\'t reported by caregiver.',
  notApplicableForRecording: false,
  hasQuickTap: true,
  allowsCustomIndicators: true,
  isSupposition: false,
  guidedPrompts: [
    {
      groupTitle: 'Operational definition (repeat for each behavior)',
      prompts: [
        'Describe exactly what [behavior] looks like — what do you see the child doing?',
        "What counts as one instance of this behavior?",
        'Is there a minimum duration before it counts? (e.g. crying for 30+ seconds = tantrum)',
        "What doesn't count? (e.g. accidental vs. intentional)",
      ],
    },
    {
      groupTitle: 'Baseline frequency',
      prompts: [
        'How many times does this happen in a typical session or day?',
        'Is it getting better, worse, or staying the same?',
      ],
    },
    {
      groupTitle: 'Triggers / antecedents',
      prompts: [
        'What usually happens right before this behavior?',
        'Are there specific people, places, activities, or times of day that trigger it?',
        'Does it happen more when demands are placed, when attention is withdrawn, or unpredictably?',
      ],
    },
    {
      groupTitle: 'Consequence / what happens after',
      prompts: [
        'What do you typically do when this behavior happens?',
        'What does your child get or avoid when this behavior occurs?',
      ],
    },
    {
      groupTitle: 'Impact',
      prompts: ['How does this behavior affect your child and your family?'],
    },
  ],
  defaultIndicators: [
    { id: 'ant-demand', label: 'Antecedent: Demand placed', unit: 'tag' },
    { id: 'ant-transition', label: 'Antecedent: Transition', unit: 'tag' },
    { id: 'ant-attention', label: 'Antecedent: Attention withdrawn', unit: 'tag' },
  ],
  aiNeeds: [
    'Behavior name',
    'Operational definition (exact topographic description)',
    'Baseline data (x per session/day/week)',
    'Function (escape/attention/access/automatic)',
    'Current consequence/caregiver response',
  ],
};

const crisis_plan: SectionConfig = {
  key: 'crisis_plan',
  sectionNumber: 11,
  title: 'Crisis Plan',
  purpose: 'Document the clinical crisis behavior definition, escalation pattern, de-escalation protocol, and emergency contacts',
  recordingValue: 4,
  recordingNote:
    'Strong section to record. Always type emergency contacts in free-text — never rely on transcript alone.',
  freeTextPrompt:
    'Type emergency contact name, relationship, and phone number explicitly — do not rely on transcript. Write the clinical crisis behavior definition, escalation cycle stages, and specific de-escalation protocol. Note any medical conditions that affect crisis response.',
  notApplicableForRecording: false,
  hasQuickTap: false,
  allowsCustomIndicators: false,
  isSupposition: false,
  guidedPrompts: [
    {
      groupTitle: 'Crisis behavior identification',
      prompts: [
        "What does a crisis look like for [client name]? What's the most intense behavior he/she exhibits?",
        'Has your child ever been in a situation that felt truly dangerous — to himself or others?',
        'Has your child ever required physical restraint or emergency services?',
      ],
    },
    {
      groupTitle: 'Escalation pattern',
      prompts: [
        "Is there a pattern you've noticed before a crisis? What are the early warning signs?",
        "What does a 'building up' phase look like before the worst behavior?",
        'How long does escalation typically take before reaching peak?',
      ],
    },
    {
      groupTitle: 'De-escalation strategies',
      prompts: [
        "What helps during a crisis — what makes it better or shorter?",
        "Are there things that make it worse? Things you've been told not to do?",
        'What environment changes help (quiet space, removal of demands, specific person)?',
      ],
    },
    {
      groupTitle: 'Post-crisis',
      prompts: [
        'What does your child need after a crisis to recover?',
        'How long does it take before your child is back to baseline?',
      ],
    },
    {
      groupTitle: 'Emergency contacts and protocol',
      prompts: [
        'Who should be called if a crisis occurs during a session?',
        'Is there a physician or psychiatrist to contact?',
        'Under what circumstances should emergency services (911) be called?',
        'Are there any medical conditions (seizures, cardiac) we should be aware of?',
      ],
    },
    {
      groupTitle: 'Restraint / restrictive procedures',
      prompts: [
        'Has your child ever been physically restrained? By whom and under what circumstances?',
        'Are there any current behavioral or safety protocols in place at school we should align with?',
      ],
    },
  ],
  defaultIndicators: [],
  aiNeeds: [
    'Crisis behavior definition',
    'Escalation warning signs',
    'De-escalation strategies (what works)',
    'Things that worsen the crisis (avoid)',
    'Post-crisis recovery needs',
    'Emergency contact name and relationship',
    'Circumstances for calling 911',
    'Whether restraint has been used',
  ],
};

// ─── Exports ─────────────────────────────────────────────────────────────────

export const SECTION_CONFIG: Record<SectionKey, SectionConfig> = {
  demographics,
  presenting_concerns,
  self_help,
  daily_living,
  safety,
  communication,
  self_stim,
  medical_necessity,
  skill_acquisitions,
  behavior_targets,
  crisis_plan,
};

export const getSectionConfig = (key: SectionKey): SectionConfig => SECTION_CONFIG[key];

export const getSectionOrder = (): SectionKey[] => SECTION_ORDER;

export const getSectionsWithQuickTap = (): SectionKey[] =>
  Object.values(SECTION_CONFIG)
    .filter((s) => s.hasQuickTap)
    .map((s) => s.key);

export const getSuppositionSections = (): SectionKey[] =>
  Object.values(SECTION_CONFIG)
    .filter((s) => s.isSupposition)
    .map((s) => s.key);
