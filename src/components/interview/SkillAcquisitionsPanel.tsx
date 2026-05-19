import { Lightbulb } from 'lucide-react';
import { FreeTextNotes } from './FreeTextNotes';

interface SkillAcquisitionsPanelProps {
  sessionId: string;
}

export const SkillAcquisitionsPanel = ({ sessionId }: SkillAcquisitionsPanelProps) => (
  <div className="flex flex-col gap-4 py-3">
    <div
      className="flex items-start gap-2.5 rounded-lg px-4 py-3"
      style={{
        background: 'rgba(96,165,250,0.08)',
        border: '1px solid rgba(96,165,250,0.20)',
        borderRadius: 8,
      }}
    >
      <Lightbulb
        size={16}
        style={{ color: '#60A5FA', flexShrink: 0, marginTop: 1 }}
      />
      <p className="text-[13px]" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        This section is being defined with BCBA input. Use the notes field below to describe
        skill acquisition targets and maladaptive behaviors to reduce through the treatment plan.
        The final UI will be updated after BCBA validation.
      </p>
    </div>
    <FreeTextNotes sessionId={sessionId} sectionKey="skill_acquisitions" />
  </div>
);

export default SkillAcquisitionsPanel;
