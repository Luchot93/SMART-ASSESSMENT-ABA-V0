import { DatabaseZap } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';
import type { ClientProfile } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const GENDER_OPTIONS   = ['Male', 'Female', 'Non-binary', 'Other'];
const RELATION_OPTIONS = ['Parent', 'Guardian', 'Caregiver', 'Grandparent', 'Other'];
const SETTING_OPTIONS  = ['Home', 'School', 'Clinic', 'Community', 'Telehealth'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAge(dob: string): string {
  if (!dob) return '—';
  const [y, m, d] = dob.split('-').map(Number);
  const birth = new Date(y, m - 1, d);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--;
  return `${age} yrs`;
}

// ─── Label style ──────────────────────────────────────────────────────────────

const LABEL: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: 'var(--text-secondary)',
  marginBottom: 4,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Wrapper that spans all columns */
function FullRow({ children }: { children: React.ReactNode }) {
  return <div className="col-span-full">{children}</div>;
}

/** Three equal columns inside the 2-col outer grid */
function ThreeCol({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full grid grid-cols-1 sm:grid-cols-3 gap-3">
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface DemographicsFormProps {
  sessionId: string;
}

export const DemographicsForm = ({ sessionId }: DemographicsFormProps) => {
  const session = useSessionStore(
    (s) => s.sessions.find((sess) => sess.id === sessionId) ?? null,
  );
  const updateClientProfile = useSessionStore((s) => s.updateClientProfile);
  const updateClientName    = useSessionStore((s) => s.updateClientName);

  if (!session) return null;

  const { clientName, bcbaName, clientProfile: p } = session;
  const patch = (fields: Partial<ClientProfile>) => updateClientProfile(sessionId, fields);

  return (
    <div className="flex flex-col gap-4 py-2">

      {/* ── Info note ─────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5"
        style={{ background: 'rgba(0,212,174,0.06)', border: '1px solid var(--accent-teal-border)' }}
      >
        <DatabaseZap size={13} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
        <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
          Complete this section before the interview begins. No recording needed.
        </span>
      </div>

      {/* ── Form grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* Row 1: Name | DOB | Age */}
        <ThreeCol>
          <div>
            <label style={LABEL}>Client Full Name *</label>
            <input
              className="demo-input"
              type="text"
              value={clientName}
              onChange={(e) => updateClientName(sessionId, e.target.value)}
            />
          </div>
          <div>
            <label style={LABEL}>Date of Birth *</label>
            <input
              className="demo-input"
              type="date"
              value={p.dob}
              onChange={(e) => patch({ dob: e.target.value })}
            />
          </div>
          <div>
            <label style={LABEL}>Age</label>
            <input
              className="demo-input"
              type="text"
              value={calcAge(p.dob)}
              readOnly
            />
          </div>
        </ThreeCol>

        {/* Row 2: Gender | Diagnosis | ICD-10 */}
        <ThreeCol>
          <div>
            <label style={LABEL}>Gender</label>
            <select
              className="demo-input"
              value={p.gender}
              onChange={(e) => patch({ gender: e.target.value })}
            >
              {GENDER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL}>Diagnosis *</label>
            <input
              className="demo-input"
              type="text"
              value={p.diagnosis}
              onChange={(e) => patch({ diagnosis: e.target.value })}
            />
          </div>
          <div>
            <label style={LABEL}>ICD-10 Code</label>
            <input
              className="demo-input"
              type="text"
              value={p.icd10}
              onChange={(e) => patch({ icd10: e.target.value })}
            />
          </div>
        </ThreeCol>

        {/* Row 3: Medicaid ID | Assessment Type | Assessment Date */}
        <ThreeCol>
          <div>
            <label style={LABEL}>Medicaid ID *</label>
            <input
              className="demo-input"
              type="text"
              value={p.medicaidId}
              onChange={(e) => patch({ medicaidId: e.target.value })}
            />
          </div>
          <div>
            <label style={LABEL}>Assessment Type</label>
            <div
              className="flex overflow-hidden rounded-lg"
              style={{ border: '1px solid var(--border-default)', height: 36 }}
            >
              {(['Initial', 'Reassessment'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="flex-1 text-[12px] font-medium transition-all duration-150"
                  style={{
                    background: p.assessmentType === opt ? 'var(--accent-teal)' : 'var(--surface-card)',
                    color: p.assessmentType === opt ? '#fff' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => patch({ assessmentType: opt })}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={LABEL}>Assessment Date *</label>
            <input
              className="demo-input"
              type="date"
              value={p.assessmentDate}
              onChange={(e) => patch({ assessmentDate: e.target.value })}
            />
          </div>
        </ThreeCol>

        {/* Row 4: Parent/Guardian | Relationship | Preferred Language */}
        <ThreeCol>
          <div>
            <label style={LABEL}>Parent / Guardian Name(s)</label>
            <input
              className="demo-input"
              type="text"
              value={p.parentGuardianNames}
              onChange={(e) => patch({ parentGuardianNames: e.target.value })}
            />
          </div>
          <div>
            <label style={LABEL}>Relationship</label>
            <select
              className="demo-input"
              value={p.relationship}
              onChange={(e) => patch({ relationship: e.target.value })}
            >
              {RELATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL}>Preferred Language</label>
            <input
              className="demo-input"
              type="text"
              value={p.preferredLanguage}
              onChange={(e) => patch({ preferredLanguage: e.target.value })}
            />
          </div>
        </ThreeCol>

        {/* Row 5: Address (full width) */}
        <FullRow>
          <label style={LABEL}>Address</label>
          <input
            className="demo-input"
            type="text"
            value={p.address}
            onChange={(e) => patch({ address: e.target.value })}
          />
        </FullRow>

        {/* Row 6: Phone | Referring Physician */}
        <div>
          <label style={LABEL}>Phone Number</label>
          <input
            className="demo-input"
            type="text"
            value={p.phone}
            onChange={(e) => patch({ phone: e.target.value })}
          />
        </div>
        <div>
          <label style={LABEL}>Referring Physician</label>
          <input
            className="demo-input"
            type="text"
            value={p.referringProvider}
            onChange={(e) => patch({ referringProvider: e.target.value })}
          />
        </div>

        {/* Row 7: Reason for Referral (full width, 2-row textarea) */}
        <FullRow>
          <label style={LABEL}>Reason for Referral</label>
          <textarea
            className="demo-input"
            rows={2}
            value={p.reasonForReferral}
            onChange={(e) => patch({ reasonForReferral: e.target.value })}
          />
        </FullRow>

        {/* Row 8: Intervention Settings chips (full width) */}
        <FullRow>
          <label style={LABEL}>Intervention Settings</label>
          <div className="flex flex-wrap gap-2 pt-1">
            {SETTING_OPTIONS.map((opt) => {
              const selected = p.interventionSettings.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  className="rounded-full px-3 py-1 text-[12px] font-medium transition-all duration-150"
                  style={{
                    background: selected ? 'var(--accent-teal)' : 'var(--surface-card)',
                    color: selected ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${selected ? 'var(--accent-teal)' : 'var(--border-default)'}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    const next = selected
                      ? p.interventionSettings.filter((s) => s !== opt)
                      : [...p.interventionSettings, opt];
                    patch({ interventionSettings: next });
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </FullRow>

        {/* Row 9: BCBA Author (disabled) */}
        <div>
          <label style={LABEL}>BCBA Author</label>
          <input
            className="demo-input"
            type="text"
            value={bcbaName}
            disabled
          />
        </div>

      </div>
    </div>
  );
};

export default DemographicsForm;
