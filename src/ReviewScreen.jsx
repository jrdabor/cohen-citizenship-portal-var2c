import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext.jsx';
import { T, S } from './tokens.js';
import { CheckIcon, SpinnerIcon, WarningIcon, ArrowRight, SendIcon, ClockIcon, ShieldIcon } from './Icons.jsx';

/* ── Shared: Victoria Card + Message Thread (unified) ── */
function VictoriaMessagePanel({ messages, client, msgText, setMsgText, handleSendMessage, subtitle }) {
    return (
        <div style={{ ...S.card, overflow: 'hidden', marginTop: 28 }}>
            {/* Victoria header */}
            <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${T.bgWarm}` }}>
                <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: T.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0,
                }}>VR</div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Victoria Rukaite</p>
                    <p style={{ fontSize: 13, color: T.textSec }}>{subtitle || 'Your Case Manager'}</p>
                </div>
                <span style={{
                    fontSize: 11, fontWeight: 600, color: T.success, background: T.successBg,
                    padding: '3px 10px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 4,
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.success, display: 'inline-block' }} /> Available
                </span>
            </div>

            {/* Messages area */}
            <div style={{ padding: '16px 24px' }}>
                {(!messages || messages.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '16px 0 12px' }}>
                        <p style={{ fontSize: 14, color: T.textMut, fontStyle: 'italic' }}>No messages yet.</p>
                        <p style={{ fontSize: 12, color: T.textMut, marginTop: 4 }}>We typically respond within one business day.</p>
                    </div>
                ) : (
                    <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 12 }}>
                        {messages.map(m => (
                            <div key={m.id} style={{
                                display: 'flex', justifyContent: m.sender === 'client' ? 'flex-end' : 'flex-start',
                                marginBottom: 8,
                            }}>
                                <div style={{
                                    maxWidth: '75%', padding: '10px 16px', borderRadius: 14,
                                    background: m.sender === 'client' ? T.accent : T.bg,
                                    color: m.sender === 'client' ? '#fff' : T.text,
                                    fontSize: 14, lineHeight: 1.5,
                                }}>
                                    {m.sender !== 'client' && (
                                        <p style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, marginBottom: 2 }}>Victoria Rukaite</p>
                                    )}
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        value={msgText}
                        onChange={e => setMsgText(e.target.value)}
                        placeholder="Send a message to Victoria..."
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        style={{ ...S.inputBase, flex: 1, borderRadius: 20, padding: '10px 18px' }}
                    />
                    <button onClick={handleSendMessage} disabled={!msgText.trim()} style={{
                        width: 40, height: 40, borderRadius: '50%', border: 'none',
                        background: msgText.trim() ? T.accent : T.bgWarm,
                        color: '#fff', cursor: msgText.trim() ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s',
                        flexShrink: 0,
                    }}>
                        <SendIcon size={16} color={msgText.trim() ? '#fff' : T.textMut} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ReviewScreen() {
    const { state, dispatch } = useApp();
    const { review, client, applicants, messages } = state;
    const isFamily = applicants.length > 1;
    const [animStep, setAnimStep] = useState(review.checkStep || 0);
    const [msgText, setMsgText] = useState('');

    const checkSteps = [
        { label: 'Document completeness', key: 'completeness' },
        { label: 'Data consistency', key: 'consistency' },
        { label: 'Edge case screening', key: 'edge' },
        { label: 'Preparing case file for review', key: 'prepare' },
    ];

    // Auto-advance check animation
    useEffect(() => {
        if (review.status !== 'checking') return;
        const timer = setTimeout(() => {
            if (animStep < checkSteps.length - 1) {
                setAnimStep(s => s + 1);
                dispatch({ type: 'SET_REVIEW', data: { checkStep: animStep + 1 } });
            } else {
                dispatch({ type: 'SET_REVIEW', data: { status: 'waiting' } });
            }
        }, 1400);
        return () => clearTimeout(timer);
    }, [review.status, animStep]);

    // Flags handling
    const allFlags = review.flags || [];
    const sharedFlags = review.sharedFlags || [];
    const applicantFlags = isFamily
        ? applicants.map(a => ({ applicant: a, flags: a.reviewFlags || [] })).filter(g => g.flags.length > 0)
        : [];
    const totalFlags = allFlags.length + sharedFlags.length + (isFamily ? applicants.reduce((s, a) => s + (a.reviewFlags || []).length, 0) : 0);
    const unresolvedFlags = allFlags.filter(f => f.status !== 'resolved').length
        + sharedFlags.filter(f => f.status !== 'resolved').length
        + (isFamily ? applicants.reduce((s, a) => s + (a.reviewFlags || []).filter(f => f.status !== 'resolved').length, 0) : 0);
    const allResolved = totalFlags > 0 && unresolvedFlags === 0;

    const handleResubmit = () => {
        dispatch({ type: 'SET_REVIEW', data: { status: 'checking', checkStep: 0 } });
        setAnimStep(0);
    };

    const handleSendMessage = () => {
        if (!msgText.trim()) return;
        dispatch({ type: 'ADD_MESSAGE', msg: { sender: 'client', text: msgText.trim() } });
        setMsgText('');
    };

    return (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px', minHeight: 'calc(100vh - 64px)' }}>

            {/* ─── Checking (animated) ─── */}
            {review.status === 'checking' && (
                <div style={{ ...S.card, textAlign: 'center', padding: '48px 32px' }} className="animate-fade-in-up">
                    <SpinnerIcon size={40} />
                    <h1 style={{ ...S.h2, fontSize: 28, marginTop: 24, marginBottom: 12 }}>Preparing your case file…</h1>
                    <p style={{ fontSize: 15, color: T.textSec, marginBottom: 32 }}>Running automated checks before {isFamily ? "your family's files go" : 'your file goes'} to review.</p>
                    <div style={{ textAlign: 'left', maxWidth: 340, margin: '0 auto' }}>
                        {checkSteps.map((step, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                                opacity: i > animStep ? 0.3 : 1,
                                transition: 'opacity 0.4s',
                            }} className={i === animStep ? 'animate-fade-in' : ''}>
                                {i < animStep ? <CheckIcon size={18} /> : i === animStep ? <SpinnerIcon size={16} /> : <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #ccc', display: 'inline-block' }} />}
                                <span style={{ fontSize: 14, color: i <= animStep ? T.text : T.textMut, fontWeight: i === animStep ? 600 : 400 }}>{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Waiting ─── */}
            {review.status === 'waiting' && (
                <div className="animate-fade-in-up">
                    <div style={{ ...S.card, padding: '36px 32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.accentPale, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${T.accent}`, flexShrink: 0 }}>
                                <ShieldIcon size={28} color={T.accent} />
                            </div>
                            <div>
                                <h1 style={{ ...S.h2, fontSize: 24, marginBottom: 4 }}>
                                    {isFamily ? "Your family's application is under review" : 'Your application is under review'}
                                </h1>
                                <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.5 }}>
                                    {isFamily
                                        ? `Victoria will review all ${applicants.length} applicants' files and reach out if anything needs attention. Typical turnaround is 1–2 business days.`
                                        : "Victoria Rukaite is reviewing your documents and forms."
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Automated check results */}
                        <div style={{ background: T.bg, borderRadius: T.radiusSm, padding: '16px 20px', marginBottom: 20 }}>
                            {[
                                { label: 'Completeness check', status: 'done' },
                                { label: 'Consistency check', status: 'done' },
                                { label: 'Edge case analysis', status: 'done' },
                                { label: 'Case Manager review', status: 'in_progress' },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                                    borderBottom: i < 3 ? `1px solid ${T.bgWarm}` : 'none',
                                }}>
                                    {item.status === 'done' ? (
                                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: T.success, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <CheckIcon size={12} color="#fff" />
                                        </div>
                                    ) : (
                                        <div className="pulse-subtle" style={{
                                            width: 22, height: 22, borderRadius: '50%', background: T.warnBg,
                                            border: `1.5px solid ${T.warn}`, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            <ClockIcon size={11} color={T.warn} />
                                        </div>
                                    )}
                                    <span style={{ fontSize: 14, color: item.status === 'done' ? T.text : T.text, flex: 1, fontWeight: item.status === 'in_progress' ? 500 : 400 }}>{item.label}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: item.status === 'done' ? T.success : T.warn }}>
                                        {item.status === 'done' ? '✓ Done' : 'In progress'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <p style={{ fontSize: 13, color: T.textMut, textAlign: 'center' }}>Most reviews are completed within 1–2 business days.</p>
                    </div>

                    {/* Unified Victoria + messages */}
                    <VictoriaMessagePanel
                        messages={messages} client={client}
                        msgText={msgText} setMsgText={setMsgText}
                        handleSendMessage={handleSendMessage}
                        subtitle="Case Manager · Cohen Immigration Law"
                    />
                </div>
            )}

            {/* ─── Changes Requested ─── */}
            {review.status === 'changes_requested' && (
                <div className="animate-fade-in-up">
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <WarningIcon size={24} />
                        <h1 style={{ ...S.h2, fontSize: 24 }}>
                            Victoria has flagged {totalFlags} item{totalFlags !== 1 ? 's' : ''} for {isFamily ? "your family's" : 'your'} attention
                        </h1>
                    </div>
                    <p style={{ fontSize: 15, color: T.textSec, marginBottom: 28, lineHeight: 1.6 }}>
                        Your Case Manager has reviewed {isFamily ? "your family's files" : 'your file'} and flagged some items that need attention. Address each one below, then re-submit.
                    </p>

                    {/* Flags */}
                    {allFlags.map(flag => (
                        <FlagCard key={flag.id} flag={flag} dispatch={dispatch} />
                    ))}

                    {isFamily && sharedFlags.length > 0 && (
                        <div style={{ marginBottom: 4 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: T.textMut, marginBottom: 12 }}>Shared Documents</p>
                            {sharedFlags.map(flag => (
                                <FlagCard key={flag.id} flag={flag} dispatch={dispatch} />
                            ))}
                        </div>
                    )}

                    {applicantFlags.map(({ applicant, flags }) => (
                        <div key={applicant.id} style={{ marginBottom: 4 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: T.textMut, marginBottom: 12 }}>
                                {applicant.firstName}'s Flags
                                {applicant.isMinor && <span style={{ color: T.maple, marginLeft: 6 }}>(Minor)</span>}
                            </p>
                            {flags.map(flag => (
                                <FlagCard key={flag.id} flag={flag} dispatch={dispatch} />
                            ))}
                        </div>
                    ))}

                    {/* Re-submit */}
                    <button onClick={handleResubmit} disabled={!allResolved} style={{
                        ...S.btnPrimary, width: '100%', marginTop: 20, marginBottom: 8,
                        opacity: allResolved ? 1 : 0.5,
                        cursor: allResolved ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontSize: 16, padding: '16px 32px',
                    }}>
                        Re-submit for Review <ArrowRight size={18} />
                    </button>
                    {!allResolved && (
                        <p style={{ fontSize: 13, color: T.warn, textAlign: 'center', marginBottom: 8 }}>Resolve all flags before re-submitting</p>
                    )}

                    {/* Unified Victoria + messages */}
                    <VictoriaMessagePanel
                        messages={messages} client={client}
                        msgText={msgText} setMsgText={setMsgText}
                        handleSendMessage={handleSendMessage}
                    />
                </div>
            )}

            {/* ─── Approved ─── */}
            {review.status === 'approved' && (
                <div className="animate-fade-in-up" style={{ textAlign: 'center' }}>
                    <div style={{ ...S.card, padding: '48px 32px' }}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: T.successBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: `3px solid ${T.success}` }}>
                            <CheckIcon size={36} color={T.success} />
                        </div>
                        <h1 style={{ ...S.h2, fontSize: 28, marginBottom: 12 }}>
                            {isFamily ? "Your Family\u2019s Application Has Been Approved!" : 'Your Application Has Been Approved!'}
                        </h1>
                        <p style={{ fontSize: 16, color: T.textSec, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 32px' }}>
                            {isFamily
                                ? `All ${applicants.length} applicants have been reviewed and approved. Your case files are ready for the final step — signing and mailing the government forms.`
                                : "Your Case Manager has confirmed everything looks good. Your file is ready for the final step — signing and mailing the government forms."
                            }
                        </p>
                        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'sign' })} style={{
                            ...S.btnPrimary, fontSize: 17, padding: '16px 40px', display: 'inline-flex', alignItems: 'center', gap: 8,
                        }}>
                            Sign & Submit <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Flag Card ── */
function FlagCard({ flag, dispatch }) {
    const resolved = flag.status === 'resolved';
    return (
        <div style={{
            borderRadius: T.radiusSm,
            padding: '16px 20px',
            marginBottom: 12,
            background: resolved ? T.successBg : T.card,
            border: resolved ? `1px solid ${T.success}` : `1px solid ${T.bgWarm}`,
            borderLeftWidth: 4,
            borderLeftColor: resolved ? T.success : T.warn,
            borderLeftStyle: 'solid',
            opacity: resolved ? 0.7 : 1,
            transition: 'all 0.3s ease',
        }}>
            {/* Target label */}
            <p style={{ fontSize: 12, fontWeight: 500, color: T.textMut, marginBottom: 6, letterSpacing: 0.3 }}>{flag.target}</p>

            {/* Title */}
            <p style={{ fontSize: 15, fontWeight: 600, color: resolved ? T.textSec : T.text, marginBottom: flag.message ? 6 : 0 }}>{flag.title}</p>

            {/* Full CM instructions */}
            {flag.message && (
                <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, marginBottom: 12 }}>{flag.message}</p>
            )}

            {/* Actions or resolved badge */}
            {resolved ? (
                <span style={{ fontSize: 13, color: T.success, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckIcon size={14} color={T.success} /> Resolved
                </span>
            ) : (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {flag.target?.includes('Gather Proof') && (
                        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'gather' })} style={{
                            background: 'transparent', border: `1.5px solid ${T.bgWarm}`, borderRadius: 6,
                            padding: '6px 14px', fontSize: 12, fontWeight: 600, color: T.text,
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = T.bgWarm; e.currentTarget.style.color = T.text; }}
                        >Go to Gather Proof</button>
                    )}
                    {flag.target?.includes('Confirm') && (
                        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'confirm' })} style={{
                            background: 'transparent', border: `1.5px solid ${T.bgWarm}`, borderRadius: 6,
                            padding: '6px 14px', fontSize: 12, fontWeight: 600, color: T.text,
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = T.bgWarm; e.currentTarget.style.color = T.text; }}
                        >Go to Confirm Details</button>
                    )}
                    <button onClick={() => dispatch({ type: 'RESOLVE_FLAG', id: flag.id })} style={{
                        background: 'transparent', border: `1.5px solid ${T.success}`, borderRadius: 6,
                        padding: '6px 14px', fontSize: 12, fontWeight: 600, color: T.success,
                        cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = T.successBg; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                    >Mark as Fixed</button>
                </div>
            )}
        </div>
    );
}
