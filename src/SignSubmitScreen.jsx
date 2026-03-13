import React, { useState } from 'react';
import { useApp } from './AppContext.jsx';
import { T, S } from './tokens.js';
import { CheckIcon, DownloadIcon, ClockIcon, WarningIcon, ArrowRight } from './Icons.jsx';

export default function SignSubmitScreen() {
    const { state, dispatch } = useApp();
    const [checklist, setChecklist] = useState({ form1: false, form2: false, photos: false, fee: false });
    const [showPhotoSpecs, setShowPhotoSpecs] = useState(false);
    const { mailedForms, signingProgress } = state;

    const toggle = (k) => setChecklist(c => ({ ...c, [k]: !c[k] }));

    const estimatedDate = (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 11);
        return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    })();

    const formsReceived = signingProgress.formsReceived;
    const timeline = [
        { label: 'Application prepared', detail: 'Your forms and documents are ready.', done: true },
        { label: 'Case Manager approved', detail: 'Reviewed by Victoria Rukaite.', done: true },
        { label: 'Signed forms received', detail: mailedForms && !formsReceived ? 'Your forms are on their way to our office.' : formsReceived ? 'We\'ve received your signed forms at our office.' : 'Awaiting your signed forms.', done: formsReceived, active: mailedForms && !formsReceived },
        { label: 'Submitted to IRCC', detail: 'Your application has been submitted to the government.', done: signingProgress.submittedToIRCC },
        { label: 'Acknowledgement of Receipt', detail: 'IRCC confirms they\'ve received your application. ~2–4 weeks after submission.', done: signingProgress.aorReceived },
        { label: 'Application approved', detail: 'Your citizenship certificate has been issued. ~9–11 months from submission.', done: signingProgress.approved },
    ];

    return (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
            {/* Section A: Sign & Mail */}
            <h1 style={{ ...S.h1, fontSize: 36, marginBottom: 8 }}>Sign & Mail Your Forms</h1>
            <p style={{ fontSize: 16, color: T.textSec, marginBottom: 32, lineHeight: 1.6 }}>Follow these steps to complete your application.</p>

            {!mailedForms && (<>
                {/* Step 1 */}
                <StepCard number={1} title="Download your completed forms">
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <button onClick={() => { }} style={{ ...S.btnSecondary, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}>
                            <DownloadIcon size={16} /> Download CIT-0001 (PDF)
                        </button>
                        <button onClick={() => { }} style={{ ...S.btnSecondary, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}>
                            <DownloadIcon size={16} /> Download IMM 5476 (PDF)
                        </button>
                    </div>
                    <p style={{ fontSize: 13, color: T.textMut, marginTop: 8 }}>These forms have been pre-filled with your information. Do not modify them.</p>
                </StepCard>

                {/* Step 2 */}
                <StepCard number={2} title="Print both forms">
                    <p style={{ fontSize: 14, color: T.textSec }}>Print on standard letter-size paper (8.5" × 11").</p>
                </StepCard>

                {/* Step 3 */}
                <StepCard number={3} title="Sign the forms in black ink">
                    <p style={{ fontSize: 14, color: T.textSec, marginBottom: 4 }}>CIT-0001: Sign on page 9, inside the signature box.</p>
                    <p style={{ fontSize: 14, color: T.textSec, marginBottom: 12 }}>IMM 5476: Sign Section E on page 4.</p>
                    <div style={{ background: T.warnBg, border: `1px solid ${T.warn}33`, borderRadius: T.radiusSm, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <WarningIcon size={18} color={T.warn} />
                        <p style={{ fontSize: 13, color: T.warn, lineHeight: 1.5, fontWeight: 500 }}>
                            Do not sign until instructed. Signatures must be less than 90 days old when IRCC receives the application. Your Case Manager will confirm when to sign.
                        </p>
                    </div>
                </StepCard>

                {/* Step 4 */}
                <StepCard number={4} title="Check the declaration boxes">
                    <p style={{ fontSize: 14, color: T.textSec }}>CIT-0001 Section 16: Read and check each of the five declaration checkboxes on page 8.</p>
                </StepCard>

                {/* Step 5 */}
                <StepCard number={5} title="Prepare your mailing envelope">
                    <div style={{ marginBottom: 12 }}>
                        {[
                            { key: 'form1', label: 'Signed CIT-0001 form' },
                            { key: 'form2', label: 'Signed IMM 5476 form' },
                            { key: 'photos', label: 'Two passport-size photos (Canadian spec: 50mm × 70mm)' },
                            { key: 'fee', label: 'Government fee receipt ($75 CAD)' },
                        ].map(item => (
                            <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer', fontSize: 14, color: T.text }}>
                                <input type="checkbox" checked={checklist[item.key]} onChange={() => toggle(item.key)} style={{ width: 18, height: 18, accentColor: T.accent }} />
                                {item.label}
                            </label>
                        ))}
                    </div>

                    <details style={{ background: T.bgWarm, borderRadius: T.radiusSm, padding: '12px 16px', cursor: 'pointer', marginBottom: 12 }}>
                        <summary style={{ fontWeight: 600, fontSize: 13, color: T.text }}>📸 Photo Specifications</summary>
                        <div style={{ marginTop: 8, fontSize: 13, color: T.textSec, lineHeight: 1.8 }}>
                            <p>• Size: 50mm × 70mm (2" × 2¾")</p>
                            <p>• Face height: 31–36mm</p>
                            <p>• Background: Plain white</p>
                            <p>• Expression: Neutral, eyes open, mouth closed</p>
                            <p>• Taken within last 6 months</p>
                            <p>• Back of one photo: name, DOB, studio name/address, date taken</p>
                            <p style={{ color: T.warn, fontWeight: 500, marginTop: 4 }}>⚠ US citizen note: Standard US passport photos are too small. Request Canadian dimensions specifically.</p>
                        </div>
                    </details>

                    <div style={{ background: T.bgWarm, borderRadius: T.radiusSm, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontWeight: 600, fontSize: 13 }}>Government Processing Fee</p>
                            <p style={{ fontSize: 12, color: T.textSec }}>$75 CAD per application</p>
                        </div>
                        <a href="https://ircc.canada.ca" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: T.blue, textDecoration: 'none' }}>Pay on IRCC →</a>
                    </div>
                </StepCard>

                {/* Step 6 */}
                <StepCard number={6} title="Mail to our office">
                    <div style={{ background: T.accentPale, borderRadius: T.radiusSm, padding: '16px 20px', marginBottom: 8 }}>
                        <p style={{ fontWeight: 700, fontSize: 15, color: T.accent }}>Cohen Immigration Law</p>
                        <p style={{ fontSize: 14, color: T.accent, lineHeight: 1.6 }}>
                            1000 Rue De La Gauchetière Ouest<br />Suite 2400<br />Montréal, QC H3B 4W5<br />Canada
                        </p>
                    </div>
                    <p style={{ fontSize: 13, color: T.textSec }}>Send via tracked mail. We recommend USPS Priority Mail or FedEx.</p>
                </StepCard>

                {/* Step 7 */}
                <StepCard number={7} title="Email a scanned copy">
                    <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.5 }}>
                        For safekeeping, please also email a scanned copy of your signed forms to <strong>victoria@cohenimmigration.com</strong>
                    </p>
                </StepCard>

                {/* I've mailed CTA */}
                <button
                    onClick={() => dispatch({ type: 'SET_STATE', data: { mailedForms: true } })}
                    style={{ ...S.btnPrimary, width: '100%', marginTop: 8, marginBottom: 48 }}
                >
                    I've mailed my forms
                </button>
            </>)}

            {mailedForms && (
                <div style={{ ...S.card, background: T.successBg, border: `1px solid ${T.success}`, padding: '16px 24px', marginBottom: 32, display: 'flex', alignItems: 'flex-start', gap: 12 }} className="animate-fade-in">
                    <CheckIcon size={18} color={T.success} />
                    <div>
                        <p style={{ fontWeight: 700, fontSize: 15, color: T.success }}>Your signed forms are on their way!</p>
                        <p style={{ fontSize: 13, color: T.textSec, marginTop: 2, lineHeight: 1.5 }}>We'll mark them as received once they arrive at our office, usually within 3–5 business days. You can track your progress below.</p>
                    </div>
                </div>
            )}

            {/* Section B: Progress Tracker */}
            <h2 style={{ ...S.h2, marginBottom: 24 }}>Application Progress</h2>
            <div style={{ marginBottom: 32 }}>
                {timeline.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                background: step.done ? T.success : step.active ? T.warnBg : 'transparent',
                                border: `2px solid ${step.done ? T.success : step.active ? T.warn : '#ddd'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {step.done ? <CheckIcon size={14} color="#fff" /> : step.active ? <ClockIcon size={14} color={T.warn} /> : <ClockIcon size={14} color="#ccc" />}
                            </div>
                            {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 24, background: step.done ? T.success : '#ddd' }} />}
                        </div>
                        <div style={{ paddingBottom: 20 }}>
                            <p style={{ fontWeight: 600, fontSize: 15, color: step.done ? T.success : step.active ? T.warn : T.text }}>{i + 1}. {step.label} {step.active && <span style={{ fontSize: 12, fontWeight: 500 }}>— In transit</span>}</p>
                            <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5 }}>{step.detail}</p>
                        </div>
                    </div>
                ))}
            </div>

            <p style={{ fontSize: 14, color: T.textMut, marginBottom: 32 }}>
                Based on current processing times, we expect your citizenship certificate by <strong>{estimatedDate}</strong>.
            </p>

            {/* Passport upsell */}
            <div style={{ ...S.card, background: 'linear-gradient(135deg, #1B3A2D 0%, #2D5F45 100%)', color: '#fff', padding: '28px 32px' }}>
                <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>🍁 Canadian Passport Services</p>
                <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.9, marginBottom: 16 }}>
                    After you receive your citizenship certificate, you can apply for a Canadian passport. Cohen Immigration Law can help with that too.
                </p>
                <button style={{ ...S.btnPrimary, background: '#fff', color: T.accent, fontWeight: 700 }}>
                    Learn About Passport Services →
                </button>
            </div>


        </div>
    );
}

function StepCard({ number, title, children }) {
    return (
        <div style={{ ...S.card, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{number}</div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 10 }}>{title}</h3>
                    {children}
                </div>
            </div>
        </div>
    );
}
