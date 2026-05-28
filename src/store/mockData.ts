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
  skillGoals: [],
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

// ─── Session 1: Marcus D. — in_progress, 10 of 10 interview sections ────────

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
  sectionsWithData: 10,
  totalInterviewSections: 10,
  sectionsApproved: 0,
  sections: makeSections({
    demographics: {
      completionState: 'complete',
    },

    presenting_concerns: {
      completionState: 'complete',
      recordingDurationSeconds: 612,
      notes:
        'Parents report significant task avoidance and daily transition struggles. Severity: moderate-severe. Escalation over past 6 months since starting first grade. Prior ABA age 4 (6 mo) — discontinued due to relocation.',
      transcript:
        'BCBA: So to start, can you tell me what are the main reasons you reached out for ABA services for Marcus right now?\n' +
        "CAREGIVER: Yeah, so the biggest thing is the meltdowns. Every single morning getting him ready for school is a battle. He refuses to get dressed, he won't come to the table for breakfast, and when we finally get to the door he just drops to the floor and screams.\n" +
        'BCBA: How long has that morning routine been this difficult?\n' +
        "CAREGIVER: Probably since he was three. He's seven now, so — four years. It's not gotten better. If anything it's gotten worse since he started first grade.\n" +
        'BCBA: What does a meltdown look like at its worst?\n' +
        "CAREGIVER: He'll cry, he'll drop to the floor, he'll sometimes hit me or my husband when we try to redirect him. Not hard enough to really hurt, but it's scary and it's exhausting. And then we're all starting the day already upset.\n" +
        'BCBA: How many times a day would you say something like that happens, not just mornings?\n' +
        "CAREGIVER: Oh, it's not just mornings. Anytime there's a transition. If he's on the iPad and we say it's time for dinner — meltdown. Homework time — meltdown. Getting in the bath — meltdown. I'd say probably four to six times a day where it really escalates.\n" +
        'BCBA: And how long do those episodes typically last?\n' +
        "CAREGIVER: If we wait it out, maybe fifteen minutes. If we give in and let him stay on the iPad, it stops faster. But we know we're not supposed to do that.\n" +
        "BCBA: You're right that that can reinforce the behavior — we'll definitely talk through that. What does task refusal look like outside of transitions? Like during homework or chores?\n" +
        "CAREGIVER: He just completely shuts down. He'll go limp, won't make eye contact, won't respond. Or he'll run to his room and lock the door. We've had to take the lock off his door because of that.\n" +
        'BCBA: Has anything changed recently that made the concerns feel more urgent?\n' +
        "CAREGIVER: His teacher called us last month. She said the refusal is happening at school too now. He was fine in kindergarten — small class, predictable day. First grade is bigger and louder and he can't handle it. She's had to call us to come pick him up twice.\n" +
        'BCBA: Has he ever been asked to leave a program or classroom placement because of behavior?\n' +
        "CAREGIVER: Not officially. But his teacher kind of hinted that they're having a meeting about his placement at the end of the year if things don't improve. That's honestly what pushed us to call you.\n" +
        'BCBA: That context is really helpful. Has Marcus received any ABA services before?\n' +
        'CAREGIVER: He had about six months when he was four. It stopped when we moved and we never got back into it. He made progress then — I think that\'s why we waited so long to come back. We kept thinking he\'d "catch up."\n' +
        'BCBA: What do you remember working on in that earlier round of services?\n' +
        "CAREGIVER: Following directions, mostly. And some communication stuff — he wasn't talking much at four. He's verbal now, but still short phrases mostly.\n" +
        'BCBA: What other services is he currently getting?\n' +
        "CAREGIVER: Speech therapy, once a week at school. That's it. We were doing OT but our insurance stopped covering it and we couldn't afford to pay out of pocket.\n" +
        'BCBA: On a scale of one to ten, how much is all of this impacting your family right now?\n' +
        "CAREGIVER: An eight. Maybe a nine on bad days. My husband and I are fighting more because we're so tired. His little sister is scared of him when he melts down. We don't go out much anymore because we never know when it's going to happen.\n" +
        "BCBA: That's a lot to carry. What would feel different — like what would a good outcome of services look like to you?\n" +
        "CAREGIVER: Honestly? I just want mornings to not be a war. I want him to be able to say 'I don't want to do this' instead of melting down. And I want to not dread bedtime every night.\n" +
        'BCBA: Those are really clear and meaningful goals. We can absolutely build a plan around all of that.',
      draftState: 'blank',
      lastSavedAt: T_MARCUS,
    },

    self_help: {
      completionState: 'complete',
      notes:
        'Toilet trained (day and night). Feeds independently with spoon and fork — minimal spilling. Dressing: can manage loose-fitting clothes independently; buttons, zippers, and snaps require verbal prompting and occasional hand-over-hand. Hygiene: tooth brushing and hand-washing require step-by-step verbal cues — does not initiate independently. Hair combing requires full physical assistance. Bathing requires caregiver sequencing support. Does not pack school bag or prepare materials without prompting.',
      transcript:
        'BCBA: Tell me about how Marcus manages getting himself ready — dressing, hygiene, that kind of thing.\n' +
        "CAREGIVER: He can put on a t-shirt and sweatpants by himself, but anything with buttons or zippers he needs help. He just gives up on those.\n" +
        "BCBA: What about brushing his teeth or washing his hands?\n" +
        "CAREGIVER: He'll do it if I stand there and tell him each step. 'Turn on the water. Put soap on your hands. Rub them together.' But if I leave the room it doesn't happen.\n" +
        "BCBA: Does he remind himself, or does he need you to initiate it?\n" +
        "CAREGIVER: I always have to start it. He'd skip it every day if I didn't.\n" +
        "BCBA: What about eating?\n" +
        "CAREGIVER: That's actually fine. He uses a fork and spoon, no problem. He won't try new foods though — very limited diet.\n" +
        "BCBA: Any toileting concerns?\n" +
        "CAREGIVER: No, that's been solid for a couple of years. Day and night.",
      draftState: 'blank',
      lastSavedAt: T_MARCUS,
    },

    daily_living: {
      completionState: 'complete',
      notes:
        '1-step directions: independent in familiar contexts. 2-step: requires repetition or gestural cue, ~60% compliance without support. Attention on non-preferred structured tasks: 5–7 min before behavioral disruption; preferred tasks: up to 20 min. Uses visual schedule at school with moderate success — home visual schedule not yet in place. Cannot manage time, money, or community safety independently. Does not complete household chores without step-by-step prompting. Navigates home safely.',
      transcript:
        "BCBA: When you give Marcus a simple instruction at home, like 'put your shoes by the door' — does he follow it?\n" +
        "CAREGIVER: Usually, yeah. One thing at a time he can do. It's when you chain things together that it falls apart.\n" +
        "BCBA: So if you said 'put your shoes away and then come sit at the table'?\n" +
        "CAREGIVER: He'd put the shoes away and then get distracted. Or he'd just not do either and walk away.\n" +
        "BCBA: How long can he stay focused on something he doesn't want to do — like homework?\n" +
        "CAREGIVER: Maybe five minutes on a good day before the complaining starts. Seven if we're lucky. He can sit with Minecraft for an hour straight.\n" +
        "BCBA: Does his school use any visual supports?\n" +
        "CAREGIVER: Yes, his teacher has a picture schedule on his desk. She says it helps, but he still needs reminders to check it.\n" +
        "BCBA: Do you use anything like that at home?\n" +
        "CAREGIVER: We've tried. We made a morning chart once but gave up after a week because of the meltdowns. We'd like to try again with some guidance.",
      draftState: 'blank',
      lastSavedAt: T_MARCUS,
    },

    safety: {
      completionState: 'complete',
      notes:
        'Elopement: moderate risk — 2 confirmed attempts in past month, both during dysregulation near front door. No traffic exposure to date. Aggression: mild open-hand hitting directed at primary caregiver during iPad redirection — no injuries. SIB: not present. Weapons/hazards: none reported. Supervision level: constant. Secondary door lock recommended.',
      transcript:
        "BCBA: Let's talk about safety. Has Marcus ever tried to leave the house without permission?\n" +
        "CAREGIVER: Twice this month. Both times he was upset about something — once about the iPad, once because I said we weren't going to the park. He just bolted for the front door.\n" +
        "BCBA: Did he get outside?\n" +
        "CAREGIVER: The first time I caught him at the door. The second time he actually got it open and stepped onto the porch before I got to him. That scared me a lot.\n" +
        "BCBA: Is there a street close by?\n" +
        "CAREGIVER: Yes, right at the end of the driveway. It's not a busy road but still.\n" +
        "BCBA: Have you added any locks or barriers?\n" +
        "CAREGIVER: We have a chain lock up high now. He can't reach it yet.\n" +
        "BCBA: Good. What about aggression — does he ever hit or kick?\n" +
        "CAREGIVER: He's hit me a few times when I take the iPad away. Open hand, not a fist. It doesn't really hurt but it's not okay.\n" +
        "BCBA: Has he hurt himself intentionally — hitting his head, biting himself?\n" +
        "CAREGIVER: No, nothing like that. I've never seen that.\n" +
        "BCBA: Any sharp objects, medications, or other hazards he has access to?\n" +
        "CAREGIVER: No. We keep all of that locked up.",
      draftState: 'blank',
      lastSavedAt: T_MARCUS,
    },

    communication: {
      completionState: 'complete',
      notes:
        'Verbal, primarily 3–4 word phrases (e.g., "want juice," "no school," "give me iPad"). MLU ~3.5 morphemes. Intelligibility ~80% to unfamiliar listeners. Spontaneous language mostly requesting and protesting — minimal initiating of conversation or commenting. Does not ask for help verbally — relies on crying, hitting, or leading caregiver by hand. No AAC system in place. FCT clinically indicated. Speech therapy 1x/wk at school.',
      transcript:
        "BCBA: Tell me about how Marcus communicates. Does he use words?\n" +
        "CAREGIVER: Yes, he talks. But it's mostly short things — 'want juice,' 'no bath,' 'watch iPad.' Not really sentences.\n" +
        "BCBA: Does he start conversations, or does he mostly respond when you talk to him?\n" +
        "CAREGIVER: He'll ask for things he wants. But he doesn't really come up and say 'hey Mom, I saw something funny today.' It's mostly just requests or protests.\n" +
        "BCBA: When he can't get what he wants or doesn't understand something, what does he do?\n" +
        "CAREGIVER: He'll whine, then cry, then hit if it goes on long enough. Or he'll just grab my hand and drag me to whatever he wants. He never says 'help' or 'I don't understand.'\n" +
        "BCBA: Has anyone suggested a communication device or picture system?\n" +
        "CAREGIVER: His speech therapist mentioned it once but said to keep trying with verbal first. We don't have anything like that.\n" +
        "BCBA: How well do people outside the family understand him?\n" +
        "CAREGIVER: Maybe eight out of ten times if they're paying attention. His teacher understands him pretty well now but it took a few weeks.",
      draftState: 'blank',
      lastSavedAt: T_MARCUS,
    },

    self_stim: {
      completionState: 'complete',
      notes:
        'Echolalia: functional and non-functional. Scripts phrases from YouTube and cartoon videos throughout the day — increases when dysregulated. Hand flapping: observed during excitement and anticipation (e.g., before preferred activities). Lining up objects (toy cars, crayons, shoes): high-frequency during unstructured time — Marcus becomes distressed if arrangement is disrupted. No injurious stims reported. Behaviors do not currently impair learning when managed contextually. Not identified as priority reduction targets — monitoring only.',
      transcript:
        "BCBA: Does Marcus have any repetitive behaviors or routines that stand out to you?\n" +
        "CAREGIVER: Oh, yes. The lining up. He lines everything up — his cars, his crayons, his shoes by the door. Everything has to be in a specific order.\n" +
        "BCBA: What happens if something gets moved?\n" +
        "CAREGIVER: Full meltdown. His little sister knocked over his cars once and he screamed for twenty minutes. He had to put every single one back in the exact same spot.\n" +
        "BCBA: Does he flap his hands at all?\n" +
        "CAREGIVER: When he's excited — like if we say we're going to McDonald's or when his favorite show comes on. He flaps and sometimes jumps up and down.\n" +
        "BCBA: What about repeating things he's heard — from TV or things other people say?\n" +
        "CAREGIVER: All the time. He'll quote the same YouTube video over and over. Sometimes it seems random, but other times I think he's using it to express something. Like if he's upset he'll say a line from a show where a character is upset.\n" +
        "BCBA: Does that ever interfere with him communicating what he actually needs?\n" +
        "CAREGIVER: Sometimes yes. You can't always tell if he's scripting or trying to say something real.",
      draftState: 'blank',
      lastSavedAt: T_MARCUS,
    },

    medical_necessity: {
      completionState: 'complete',
      notes:
        'ASD Level 2 (F84.0) diagnosed by Dr. R. Morales, MD — April 2026 (most recent confirmation). Prior diagnosis documented at age 3. No current standardized adaptive behavior scores on file — Vineland-3 to be administered at intake. Prior ABA: 6 months at age 4, discontinued due to family relocation — no discharge summary available. Current co-treatments: speech-language therapy 1x/week (school-based). OT discontinued — insurance lapsed. Requested service intensity: 20 hr/wk RBT direct instruction + 2 hr/wk BCBA supervision + 1 hr/wk caregiver training. Behaviors (task refusal, elopement, aggression) impair participation in educational and home settings and meet criteria for medical necessity under ABA benefit.',
      draftState: 'blank',
      lastSavedAt: T_MARCUS,
    },

    skill_acquisitions: {
      completionState: 'partial',
      skillGoals: [
        {
          id: 'sg-marcus-1',
          targetSkill: 'Following two-step directions',
          operationalDefinition:
            'Client independently completes two sequential verbal instructions (e.g., "Pick up your backpack and bring it to the door") within 10 seconds of the directive, without repetition or gestural prompting.',
          definitionIsAiGenerated: false,
          definitionIsLoading: false,
          teachingStrategies: ['dtt', 'behavioral_momentum', 'least_to_most'],
          teachingStrategiesOther: '',
          promptingLevel: 'verbal',
          promptingLevelCombination: '',
          baselinePercent: '20',
          baselineOpportunities: '10',
          baselinePromptingDesc: 'verbal',
          masteryCriteriaPercent: '80',
          masteryCriteriaSessions: '3',
          masteryCriteriaSettings: '2',
          masteryCriteriaPrompting: 'independent',
          generalizationNotes:
            'Skill will be practiced across multiple people, settings, materials, and environments to promote maintenance and generalization of acquired skills.',
        },
        {
          id: 'sg-marcus-2',
          targetSkill: 'Functional Communication Training (FCT) — protest',
          operationalDefinition:
            'Client uses a verbal phrase or AAC output (e.g., "No thank you," "I need a break") to refuse or protest a non-preferred task or transition, instead of engaging in challenging behavior.',
          definitionIsAiGenerated: false,
          definitionIsLoading: false,
          teachingStrategies: ['fct', 'errorless_teaching', 'differential_reinforcement'],
          teachingStrategiesOther: '',
          promptingLevel: 'verbal',
          promptingLevelCombination: '',
          baselinePercent: '0',
          baselineOpportunities: '10',
          baselinePromptingDesc: 'full physical',
          masteryCriteriaPercent: '80',
          masteryCriteriaSessions: '3',
          masteryCriteriaSettings: '2',
          masteryCriteriaPrompting: 'independent',
          generalizationNotes:
            'Skill will be practiced across multiple people, settings, materials, and environments to promote maintenance and generalization of acquired skills.',
        },
      ],
      draftState: 'blank',
      lastSavedAt: T_MARCUS,
    },

    behavior_targets: {
      completionState: 'complete',
      notes:
        'Task Refusal: operationally defined as verbal refusal ("no," "stop"), going limp, dropping to floor, or leaving the work area within 10 seconds of a directive without initiating compliance. Does not include complaining that transitions to compliance within 10 seconds. Baseline: ~8 occurrences per observed session per caregiver report.\n\nElopement: operationally defined as moving toward or through an exterior door or gate without adult permission or a caregiver-initiated transition cue. Excludes movement within the home. Baseline: ~3 attempts per week per caregiver report.\n\nAggression: operationally defined as open-hand hitting directed at a caregiver during redirection from preferred items (primarily iPad). Mild intensity — no injury reported. Baseline: ~2–3 incidents per week. Monitoring only at this time — will be elevated to primary target if frequency increases.',
      indicators: [
        { id: 'b1', label: 'Task refusal', count: 8, isCustom: true, unit: 'count' },
        { id: 'b2', label: 'Elopement attempt', count: 3, isCustom: true, unit: 'count' },
        { id: 'b3', label: 'Aggression (hitting)', count: 2, isCustom: true, unit: 'count' },
      ],
      transcript:
        "BCBA: Let's make sure we have really clear definitions for Marcus's behaviors so the team can measure them consistently. Starting with task refusal — what does the very beginning of that look like?\n" +
        "CAREGIVER: Usually he just says 'no' or 'stop.' Then if we push he'll go limp and slide off his chair. Or he walks away and goes to his room.\n" +
        "BCBA: Is there a point where he starts complaining but then actually does the task anyway?\n" +
        "CAREGIVER: Sometimes yeah — he'll grumble but eventually do it. That's different from when he fully shuts down.\n" +
        "BCBA: Good distinction. So we'd count refusal only when he doesn't follow through within maybe ten seconds?\n" +
        "CAREGIVER: That seems right.\n" +
        "BCBA: For elopement — is it only going toward outside doors, or does bolting to his room count?\n" +
        "CAREGIVER: I'd say just outside. Running to his room is annoying but it's not unsafe.\n" +
        "BCBA: Agreed. And the hitting — how often does that happen compared to the other two?\n" +
        "CAREGIVER: Less often. Maybe two or three times a week, only when I'm taking something away.\n" +
        "BCBA: And only toward you, not his sister or his dad?\n" +
        "CAREGIVER: Mostly me. His dad occasionally. Never his sister.",
      draftState: 'blank',
      lastSavedAt: T_MARCUS,
    },

    crisis_plan: {
      completionState: 'complete',
      notes:
        'No imminent risk of serious self-harm. Elopement is the primary safety concern. Caregiver de-escalation protocol: (1) secure exterior doors immediately; (2) reduce all active demands — do not re-issue directives during episode; (3) move to a neutral space and wait; (4) do not provide access to denied item (iPad) during or immediately following episode. For aggression: create physical distance, avoid restraint unless injury imminent, document incident. Emergency threshold: 911 if Marcus exits property unsupervised and cannot be immediately retrieved, or if aggression results in injury. BCBA to provide written protocol card at intake. Quarterly safety review scheduled.',
      transcript:
        "BCBA: I want to make sure you have a clear plan for when things escalate. Right now when he's in the middle of a meltdown — what do you do?\n" +
        "CAREGIVER: Mostly we just try to stay calm and wait it out. Sometimes we try to redirect him but that usually makes it worse.\n" +
        "BCBA: That instinct to wait is actually correct. The key thing is not to give access to whatever was denied — the iPad, the activity — because that teaches him the meltdown works.\n" +
        "CAREGIVER: We know. It's just so hard when it's been going on for fifteen minutes and you just need to get out the door.\n" +
        "BCBA: Completely understandable. We'll work on building his tolerance so those episodes get shorter. For elopement — if he gets to the door, what's the protocol?\n" +
        "CAREGIVER: We grab him. But he's getting faster.\n" +
        "BCBA: The chain lock up high is the right call for now. We'd also recommend a door alarm — a simple chime so you always know when an exterior door opens, even if you're in another room.\n" +
        "CAREGIVER: Oh, that's a good idea. We don't have that.\n" +
        "BCBA: At what point would you call 911?\n" +
        "CAREGIVER: If he actually got out to the street and I couldn't catch him, definitely. Or if he hurt someone badly.\n" +
        "BCBA: Those are exactly the right thresholds. I'll put that in writing for you so the whole family is on the same page.",
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
