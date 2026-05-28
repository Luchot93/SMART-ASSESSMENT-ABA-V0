import type { Session } from '@/types';
import { SECTION_ORDER } from '@/types';

export function exportAssessment(
  session: Session,
  callbacks: {
    showToast: (msg: string) => void;
    markSessionComplete: (sessionId: string) => void;
    navigate: (path: string) => void;
  },
): void {
  const date = new Date().toISOString().slice(0, 10);
  const safeName = session.clientName.replace(/[\s.]+/g, '_');
  const filename = `${safeName}_InitialAssessment_${date}.json`;

  // Build structured payload from approved/skipped sections
  const sectionsPayload: Record<string, unknown> = {};
  for (const key of SECTION_ORDER) {
    const s = session.sections[key];
    if (s.approvalState === 'approved' || s.approvalState === 'skipped') {
      sectionsPayload[key] = {
        title: s.title,
        approvalState: s.approvalState,
        content: s.draftContent ?? '',
        notes: s.notes,
        transcript: s.transcript ?? null,
        transcriptFlagged: s.transcriptFlagged,
      };
    }
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    client: {
      name: session.clientName,
      ...session.clientProfile,
    },
    bcba: session.bcbaName,
    sessionId: session.id,
    sections: sectionsPayload,
  };

  // Trigger browser download
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Toast + side effects
  callbacks.showToast(`Assessment exported — ${filename}`);
  callbacks.markSessionComplete(session.id);

  setTimeout(() => {
    callbacks.navigate('/assessments');
  }, 1500);
}
