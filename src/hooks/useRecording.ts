import { useCallback, useEffect, useRef, useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import type { RecordingState, SectionKey } from '@/types';

// ─── Simulated transcripts per section ───────────────────────────────────────

const TRANSCRIPTS: Partial<Record<SectionKey, string>> = {
  presenting_concerns:
    'CAREGIVER: Our biggest concern right now is the aggression. He hits and bites when he\'s frustrated, and it\'s becoming a safety issue at school — they\'ve called us twice this month already.\n\n' +
    'BCBA: How long has the aggression been happening, and have there been any changes recently that might have made things more intense?\n\n' +
    'CAREGIVER: It started about six months ago when we moved. He really struggled with the school transition. Before that he had tantrums but no hitting.',

  self_help:
    'CAREGIVER: He can dress himself mostly, but buttons and zippers are really hard. He still needs full help with showering — he doesn\'t understand the steps in order.\n\n' +
    'BCBA: Does he ever initiate self-care on his own, or does every step need a verbal prompt from you?\n\n' +
    'CAREGIVER: He never initiates. I have to walk him through every single step. But once I prompt him he usually follows through — it\'s just the starting that\'s the problem.',

  daily_living:
    'CAREGIVER: She helps set the table sometimes, but anything more complex is really hard. She can microwave simple things but forgets to check if food is hot.\n\n' +
    'BCBA: What about community skills — grocery shopping, restaurants, using public transportation?\n\n' +
    'CAREGIVER: The grocery store is really hard. She gets overwhelmed by all the sensory input and wants to leave immediately. We haven\'t tried a restaurant in about a year.',

  safety:
    'CAREGIVER: He has absolutely no road safety awareness — he will run into traffic without looking. And he will go with strangers. He has no sense of danger whatsoever, it terrifies me.\n\n' +
    'BCBA: Has there been any elopement from the home or from school that you\'re aware of?\n\n' +
    'CAREGIVER: Yes, twice from school last year. They have new protocols in place but I am still scared it will happen again. He is fast and he is quiet about it.',

  communication:
    'CAREGIVER: She speaks in short phrases, maybe three or four words. She can ask for things she wants but she cannot really have a back-and-forth conversation. Answering questions is very hard for her.\n\n' +
    'BCBA: How does she communicate when she cannot find the words? Does she gesture, use pictures, or does she get frustrated?\n\n' +
    'CAREGIVER: She gets very frustrated — she\'ll start crying or hitting things. We tried PECS before but she lost interest pretty quickly. Her speech therapist is working on it now.',

  self_stim:
    'CAREGIVER: The main thing is the hand flapping — it happens constantly when he\'s excited or anxious. He also rocks back and forth a lot when he\'s sitting. The teachers have started asking about it.\n\n' +
    'BCBA: Does the stimming interfere with his learning or his social interactions at school?\n\n' +
    'CAREGIVER: The teachers say it distracts the other kids and he misses instructions because he\'s focused on the flapping. But trying to stop it completely makes him so upset.',

  medical_necessity:
    'BCBA: Can you walk me through what a typical very difficult day looks like? I want to document the functional impairment clearly for medical necessity.\n\n' +
    'CAREGIVER: A bad day starts with refusal to get out of bed, then a meltdown about clothing, then a two-hour crying episode when we arrive at school. By 10 AM everyone is exhausted.\n\n' +
    'BCBA: And how many days per week would you say look like that?\n\n' +
    'CAREGIVER: At least three out of five. The other two are okay but still have incidents. We have tried occupational therapy, counseling, social skills groups — nothing has been enough on its own.',

  behavior_targets:
    'CAREGIVER: The hitting is the most dangerous — it leaves marks. He also bites, but that\'s less frequent. And the screaming in public is really limiting what our family can do.\n\n' +
    'BCBA: When the hitting happens, what\'s usually going on right before it? Can you walk me through a recent specific example?\n\n' +
    'CAREGIVER: Yesterday he wanted screen time but it was dinner time. I said no and he hit me on the arm three times very fast. And then immediately he was completely calm, like nothing happened.',

  crisis_plan:
    'CAREGIVER: We have a plan — we made it with his previous BCBA. If he\'s escalating we remove him from the environment and use the weighted blanket. Calling 911 is only if someone is going to get seriously hurt.\n\n' +
    'BCBA: Has the crisis plan ever been activated, and did it work when you used it?\n\n' +
    'CAREGIVER: We\'ve used it twice. The first time worked really well. The second time he was too escalated and we ended up calling our neighbor to help us keep him physically safe.',
};

const getFallbackTranscript = (key: SectionKey) =>
  TRANSCRIPTS[key] ??
  'CAREGIVER: There\'s quite a lot to cover in this area. It\'s been an ongoing challenge for our family.\n\n' +
    'BCBA: Can you tell me more about what a typical week looks like in this area?\n\n' +
    'CAREGIVER: It varies a lot. Some weeks are manageable but others are really difficult — I would say at least three or four days a week there\'s a significant issue.';

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseRecordingReturn {
  recordingState: RecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  undoStop: () => void;
  isPendingStop: boolean;
  durationSeconds: number;
  error: string | null;
}

export const useRecording = (sessionId: string, sectionKey: SectionKey): UseRecordingReturn => {
  const section = useSessionStore(
    (s) => s.sessions.find((sess) => sess.id === sessionId)?.sections[sectionKey] ?? null,
  );
  const setRecordingState = useSessionStore((s) => s.setRecordingState);
  const setRecordingDuration = useSessionStore((s) => s.setRecordingDuration);
  const setTranscript = useSessionStore((s) => s.setTranscript);

  const [durationSeconds, setDurationSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPendingStop, setIsPendingStop] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationRef = useRef(0);

  const recordingState: RecordingState = section?.recordingState ?? 'idle';

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (savingTimerRef.current) clearTimeout(savingTimerRef.current);
      if (pendingStopTimerRef.current) clearTimeout(pendingStopTimerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  // ── Actual stop (called after undo window expires) ──────────────────────────
  const doActualStop = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    const mr = mediaRecorderRef.current;
    const finalDuration = durationRef.current;

    const finish = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setRecordingDuration(sessionId, sectionKey, finalDuration);
      setRecordingState(sessionId, sectionKey, 'saving');
      savingTimerRef.current = setTimeout(() => {
        setTranscript(sessionId, sectionKey, getFallbackTranscript(sectionKey));
      }, 1500);
    };

    if (mr && mr.state !== 'inactive') {
      mr.onstop = finish;
      mr.stop();
    } else {
      finish();
    }
  }, [sessionId, sectionKey, setRecordingDuration, setRecordingState, setTranscript]);

  // ── Public API ──────────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.start(1000);
      durationRef.current = 0;
      setDurationSeconds(0);
      setRecordingState(sessionId, sectionKey, 'recording');

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDurationSeconds((d) => d + 1);
      }, 1000);
    } catch (err) {
      const isPermission = err instanceof Error && err.name === 'NotAllowedError';
      setError(
        isPermission
          ? 'Microphone access denied. Allow microphone access in your browser settings and try again.'
          : 'Could not start recording. Please check your microphone and try again.',
      );
    }
  }, [sessionId, sectionKey, setRecordingState]);

  const stopRecording = useCallback(() => {
    if (recordingState !== 'recording') return;
    setIsPendingStop(true);
    pendingStopTimerRef.current = setTimeout(() => {
      setIsPendingStop(false);
      doActualStop();
    }, 5000);
  }, [recordingState, doActualStop]);

  const undoStop = useCallback(() => {
    if (pendingStopTimerRef.current) clearTimeout(pendingStopTimerRef.current);
    setIsPendingStop(false);
    // MediaRecorder is still running — recording continues seamlessly
  }, []);

  return { recordingState, startRecording, stopRecording, undoStop, isPendingStop, durationSeconds, error };
};
