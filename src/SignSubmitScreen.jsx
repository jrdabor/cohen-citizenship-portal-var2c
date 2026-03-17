import React, { useState } from 'react';
import { useApp } from './AppContext.jsx';
import { T, S } from './tokens.js';
import { DownloadIcon, CheckIcon, ClockIcon, ArrowRight, MapleLeaf } from './Icons.jsx';

/* ── Expandable Card ── */
function ExpandableCard({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{ border: `1px solid ${T.bgWarm}`, borderRadius: T.radiusSm, marginBottom: 12 }}>
            <button onClick={() => setOpen(!open)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, color: T.text, textAlign: 'left',
            }}>
                {title}
                <span style={{ fontSize: 18, color: T.textMut, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
            </button>
            {open && <div style={{ padding: '0 18px 18px', borderTop: `1px solid ${T.bgWarm}` }}>{children}</div>}
        </div>
    );
}

export default function SignSubmitScreen() {
    const { state, dispatch } = useApp();
    const { client, mailedForms, signingProgress, applicants } = state;
    const isFamily = applicants.length > 1;
    const [activeTab, setActiveTab] = useState(applicants[0]?.id || 'primary');
    const activeApplicant = applicants.find(a => a.id === activeTab) || applicants[0] || { firstName: client.firstName, lastName: client.lastName };
    const applicantCount = applicants.length || 1;

    const handleMailed = () => {
        dispatch({ type: 'SET_STATE', data: { mailedForms: true } });
    };

    // Estimated completion: ~11 months from now
    const est = new Date();
    est.setMonth(est.getMonth() + 11);
    const estString = est.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const milestones = [
        { label: 'Application prepared', desc: isFamily ? "Your family's forms and documents are ready." : 'Your forms and documents are ready.', done: true },
        { label: 'Case Manager approved', desc: 'Reviewed by Victoria Rukaite.', done: true },
        { label: 'Signed forms received', desc: mailedForms ? 'Your forms are on their way to our office.' : 'Mail your signed forms to our office.', done: false, inTransit: mailedForms },
        { label: 'Submitted to IRCC', desc: isFamily ? "Your family's applications will be submitted to the government." : 'Your application will be submitted to the government.', done: false },
        { label: 'Acknowledgement of Receipt', desc: 'IRCC confirms receipt. ~2–4 weeks after submission.', done: false },
        { label: isFamily ? 'Applications approved' : 'Application approved', desc: isFamily ? 'Your citizenship certificates will be issued. ~9–11 months.' : 'Your citizenship certificate will be issued. ~9–11 months.', done: false },
    ];

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', minHeight: 'calc(100vh - 64px)' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
                <MapleLeaf size={48} />
                <h1 style={{ ...S.h1, fontSize: 40, marginBottom: 8, marginTop: 16 }}>Sign & Submit</h1>
                <p style={{ fontSize: 16, color: T.textSec, lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
                    {isFamily
                        ? `Your family's application has been approved! Download each applicant's forms, sign them, and mail everything together.`
                        : "Your application has been approved! Download your forms, sign them, and mail them to the government."
                    }
                </p>
            </div>

            {/* ─── Pre-mailing steps (collapse after mailing) ─── */}
            {!mailedForms ? (
                <>
                    {/* Family tabs */}
                    {isFamily && (
                        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: `2px solid ${T.bgWarm}`, justifyContent: 'center' }}>
                            {applicants.map(a => (
                                <button key={a.id} onClick={() => setActiveTab(a.id)} style={{
                                    padding: '10px 20px', fontSize: 14, fontWeight: 600,
                                    border: 'none', borderBottom: activeTab === a.id ? `3px solid ${T.accent}` : '3px solid transparent',
                                    background: activeTab === a.id ? T.accentPale : 'transparent',
                                    color: activeTab === a.id ? T.accent : T.textSec,
                                    cursor: 'pointer', borderRadius: '8px 8px 0 0',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                }}>
                                    {a.firstName}
                                    {a.isMinor && <span style={{ fontSize: 10, color: T.maple }}>(Minor)</span>}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Per-applicant section */}
                    <div style={{ ...S.card, padding: '28px 32px', marginBottom: 24 }} className="animate-fade-in-up" key={activeTab}>
                        <h2 style={{ ...S.h3, marginBottom: 24 }}>
                            {isFamily ? `${activeApplicant.firstName}'s Forms` : 'Your Government Forms'}
                        </h2>

                        {/* Step 1: Download */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 28 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.accentPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: T.accent, flexShrink: 0 }}>1</div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600, fontSize: 16, color: T.text, marginBottom: 8 }}>Download {isFamily ? `${activeApplicant.firstName}'s` : 'your'} pre-filled forms</p>
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                                    <button style={{ ...S.btnSecondary, display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px' }}>
                                        <DownloadIcon size={16} /> Download {activeApplicant.firstName}'s CIT-0001 (PDF)
                                    </button>
                                    <button style={{ ...S.btnSecondary, display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px' }}>
                                        <DownloadIcon size={16} /> Download {activeApplicant.firstName}'s IMM 5476 (PDF)
                                    </button>
                                </div>
                                <p style={{ fontSize: 13, color: T.textMut, fontStyle: 'italic' }}>These forms have been pre-filled with your information. Do not modify them.</p>
                            </div>
                        </div>

                        {/* Step 2: Sign */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 28 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.accentPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: T.accent, flexShrink: 0 }}>2</div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600, fontSize: 16, color: T.text, marginBottom: 12 }}>Sign the forms in black ink</p>
                                <div style={{ fontSize: 14, color: T.textSec, lineHeight: 1.8 }}>
                                    <p>• <strong>CIT-0001:</strong> Sign on page 9, inside the signature box.</p>
                                    <p>• <strong>IMM 5476:</strong> Sign Section E on page 4.</p>
                                    {isFamily && activeApplicant.isMinor && (
                                        <p style={{ color: T.maple, fontWeight: 600, marginTop: 8 }}>
                                            ⚠ Since {activeApplicant.firstName} is a minor, a parent or legal guardian must sign on their behalf.
                                        </p>
                                    )}
                                </div>
                                <div style={{ background: T.warnBg, borderRadius: T.radiusSm, padding: '12px 16px', marginTop: 12, borderLeft: `3px solid ${T.warn}` }}>
                                    <p style={{ fontSize: 13, color: T.warn, fontWeight: 600, lineHeight: 1.6 }}>
                                        ⚠ Do not sign until instructed. Signatures must be less than 90 days old when IRCC receives the application. Your Case Manager will confirm when to sign.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Declaration checkboxes */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.accentPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: T.accent, flexShrink: 0 }}>3</div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600, fontSize: 16, color: T.text, marginBottom: 8 }}>Check the declaration boxes</p>
                                <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6 }}>
                                    CIT-0001 Section 16: Read and check each of the five declaration checkboxes on page 8.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ─── Shared section (mailing) ─── */}
                    <div style={{ ...S.card, padding: '28px 32px', marginBottom: 24 }}>
                        {/* Step 4: Prepare mailing envelope */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 28 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.accentPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: T.accent, flexShrink: 0 }}>4</div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600, fontSize: 16, color: T.text, marginBottom: 16 }}>Prepare your mailing envelope</p>

                                <div style={{ marginBottom: 16 }}>
                                    {[
                                        `All signed CIT-0001 forms (${applicantCount} applicant${applicantCount > 1 ? 's' : ''})`,
                                        `All signed IMM 5476 forms (${applicantCount} applicant${applicantCount > 1 ? 's' : ''})`,
                                        `Two passport-size photos per applicant (Canadian spec: 50mm × 70mm)`,
                                        `Government fee receipt ($75 CAD × ${applicantCount} = $${75 * applicantCount} CAD)`,
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                                            <div style={{ width: 18, height: 18, borderRadius: 3, border: `1.5px solid ${T.textMut}`, flexShrink: 0 }} />
                                            <span style={{ fontSize: 14, color: T.text }}>{item}</span>
                                        </div>
                                    ))}
                                </div>

                                {isFamily && (
                                    <p style={{ fontSize: 13, color: T.accent, fontWeight: 500, marginBottom: 12 }}>
                                        Include all {applicantCount} applicants' forms in the same package.
                                    </p>
                                )}

                                {/* Expandable photo specs */}
                                <ExpandableCard title="📷 Photo specifications">
                                    <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.8, paddingTop: 12 }}>
                                        <p>• <strong>Size:</strong> 50mm × 70mm (2" × 2¾")</p>
                                        <p>• <strong>Background:</strong> White or light-coloured</p>
                                        <p>• <strong>Expression:</strong> Neutral, mouth closed</p>
                                        <p>• <strong>Face visibility:</strong> Full face, no sunglasses or hats</p>
                                        <p>• <strong>Print quality:</strong> High-resolution, taken within last 12 months</p>
                                        <p>• <strong>Quantity:</strong> 2 identical photos per applicant</p>
                                        <p style={{ marginTop: 8, fontStyle: 'italic' }}>Photos must be endorsed by a guarantor (Selfies not accepted)</p>
                                    </div>
                                </ExpandableCard>

                                {/* Government fee card */}
                                <ExpandableCard title="💳 Government processing fee">
                                    <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.8, paddingTop: 12 }}>
                                        <p>Fee: <strong>$75 CAD</strong> per applicant ({applicantCount} × $75 = <strong>${75 * applicantCount} CAD</strong>)</p>
                                        <p style={{ marginTop: 8 }}>Pay online through IRCC's official portal and include the receipt with your mailing.</p>
                                        <a href="https://eservices.cic.gc.ca/epay/order.do?category=1" target="_blank" rel="noopener noreferrer"
                                            style={{ display: 'inline-block', marginTop: 8, color: T.accent, fontWeight: 600, fontSize: 14 }}>
                                            Pay IRCC Fee Online →
                                        </a>
                                    </div>
                                </ExpandableCard>
                            </div>
                        </div>

                        {/* Step 5: Mail to office */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 28 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.accentPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: T.accent, flexShrink: 0 }}>5</div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600, fontSize: 16, color: T.text, marginBottom: 12 }}>Mail to our office</p>
                                <div style={{ background: T.bg, borderRadius: T.radiusSm, padding: '18px 22px', marginBottom: 12 }}>
                                    <p style={{ fontSize: 14, fontWeight: 500, color: T.textMut, marginBottom: 4 }}>Mail to:</p>
                                    <p style={{ fontSize: 16, fontWeight: 600, color: T.text, lineHeight: 1.6 }}>
                                        Cohen Immigration Law<br />
                                        123 Bay Street, Suite 1200<br />
                                        Toronto, ON M5J 2T2
                                    </p>
                                </div>
                                <p style={{ fontSize: 13, color: T.textSec }}>Send via tracked mail. We recommend USPS Priority Mail or FedEx.</p>
                            </div>
                        </div>

                        {/* Step 6: Email scan */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 24 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.accentPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: T.accent, flexShrink: 0 }}>6</div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600, fontSize: 16, color: T.text, marginBottom: 8 }}>Email a scanned copy</p>
                                <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6 }}>
                                    For safekeeping, email a scanned copy of all signed forms to{' '}
                                    <a href="mailto:victoria@cohenimmigration.com" style={{ color: T.accent, fontWeight: 600 }}>victoria@cohenimmigration.com</a>
                                </p>
                            </div>
                        </div>

                        {/* I've mailed my forms button */}
                        <button onClick={handleMailed} style={{
                            ...S.btnPrimary, width: '100%', fontSize: 16, padding: '16px 32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}>
                            ✉ I've mailed my forms <ArrowRight size={18} />
                        </button>
                    </div>
                </>
            ) : (
                /* ─── Post-mailing success card (compact) ─── */
                <div style={{ background: T.successBg, border: `1.5px solid ${T.success}`, borderRadius: T.radiusSm, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }} className="animate-fade-in">
                    <CheckIcon size={18} color={T.success} />
                    <div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: T.success, marginBottom: 2 }}>Your signed forms are on their way!</p>
                        <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5 }}>We'll mark them as received once they arrive at our office, usually within 3–5 business days.</p>
                    </div>
                </div>
            )}

            {/* ─── Progress Tracker ─── */}
            <div style={{ ...S.card, padding: '28px 32px', marginBottom: 24 }}>
                <h3 style={{ ...S.h3, marginBottom: 20 }}>{isFamily ? "Your Family's" : 'Your'} Application Progress</h3>
                <div style={{ position: 'relative' }}>
                    {milestones.map((m, i) => {
                        const isNext = !m.done && !m.inTransit && (i === 0 || milestones[i - 1].done || milestones[i - 1].inTransit);
                        const nextM = milestones[i + 1];
                        const isLast = i === milestones.length - 1;

                        // Line color: green if both current and next are done, amber if current done and next is in-transit, gray otherwise
                        let lineColor = T.bgWarm;
                        let lineStyle = 'dashed';
                        if (!isLast) {
                            if (m.done && nextM?.done) { lineColor = T.success; lineStyle = 'solid'; }
                            else if (m.done && nextM?.inTransit) { lineColor = T.warn; lineStyle = 'solid'; }
                            else if (m.done) { lineColor = T.success; lineStyle = 'solid'; }
                        }

                        return (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 14,
                                paddingBottom: isLast ? 0 : 8,
                                opacity: m.done || m.inTransit || isNext ? 1 : 0.4,
                                position: 'relative',
                            }}>
                                {/* Circle + connecting line */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: m.done ? T.success : m.inTransit ? T.warnBg : T.bgWarm,
                                        border: m.done ? 'none' : m.inTransit ? `2px solid ${T.warn}` : `2px solid ${T.bgWarm}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        position: 'relative', zIndex: 1,
                                    }}>
                                        {m.done ? <CheckIcon size={16} color="#fff" /> : m.inTransit ? <ClockIcon size={14} color={T.warn} /> : <span style={{ fontSize: 12, color: T.textMut }}>{i + 1}</span>}
                                    </div>
                                    {/* Connecting line to next milestone */}
                                    {!isLast && (
                                        <div style={{
                                            width: 2, flex: 1, minHeight: 28,
                                            borderLeft: `2px ${lineStyle} ${lineColor}`,
                                            marginTop: 2,
                                        }} />
                                    )}
                                </div>
                                {/* Label + description */}
                                <div style={{ paddingTop: 4, paddingBottom: isLast ? 0 : 12 }}>
                                    <span style={{ fontSize: 15, fontWeight: m.done || m.inTransit || isNext ? 600 : 400, color: m.done ? T.success : m.inTransit ? T.warn : isNext ? T.text : T.textMut, display: 'block' }}>
                                        {m.label}
                                    </span>
                                    <span style={{ fontSize: 13, color: T.textMut, lineHeight: 1.5 }}>{m.desc}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div style={{ background: T.blueBg, borderRadius: T.radiusSm, padding: '12px 16px', marginTop: 16 }}>
                    <p style={{ fontSize: 13, color: T.blue, lineHeight: 1.5 }}>
                        Based on current processing times, we expect your citizenship certificate{isFamily ? 's' : ''} by <strong>{estString}</strong>.
                    </p>
                </div>
            </div>

            {/* ─── Passport Upsell Card ─── */}
            <div style={{
                background: T.accent, borderRadius: T.radius, padding: '28px 32px',
                color: '#fff', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.06 }}><MapleLeaf size={120} color="#fff" /></div>
                <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><MapleLeaf size={22} color="#fff" /> Canadian Passport Services</p>
                <p style={{ fontSize: 15, opacity: 0.9, lineHeight: 1.6, marginBottom: 20 }}>
                    After you receive your citizenship certificate, you can apply for a Canadian passport. Cohen Immigration Law can help with that too.
                </p>
                <button style={{
                    padding: '12px 24px', borderRadius: 8, border: '2px solid rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                }}
                    onMouseOver={e => { e.target.style.background = 'rgba(255,255,255,0.3)'; }}
                    onMouseOut={e => { e.target.style.background = 'rgba(255,255,255,0.15)'; }}
                >
                    Learn About Passport Services →
                </button>
            </div>
        </div>
    );
}
