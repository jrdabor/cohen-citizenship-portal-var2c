import React, { useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext.jsx';
import { T, S } from './tokens.js';
import { CheckIcon, ShieldIcon, WarningIcon, SpinnerIcon, SendIcon, ClockIcon, ArrowRight } from './Icons.jsx';

function CMMessagePanel() {
    const { state, dispatch } = useApp();
    const [msg, setMsg] = useState('');
    const endRef = useRef(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [state.messages]);

    const send = () => {
        if (!msg.trim()) return;
        dispatch({ type: 'ADD_MESSAGE', msg: { senderType: 'client', senderName: state.client.firstName || 'Client', content: msg.trim() } });
        setMsg('');
    };

    return (
        <div style={{ ...S.card, marginTop: 24, padding: 0, overflow: 'hidden' }}>
            {/* CM header strip */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 24px',
                borderBottom: `1px solid ${T.bgWarm}`,
                background: `linear-gradient(135deg, ${T.accentPale}, ${T.card})`,
            }}>
                <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(27,58,45,0.2)',
                }}>VR</div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 15, color: T.text }}>Victoria Rukaite</p>
                    <p style={{ fontSize: 13, color: T.textSec }}>Your Case Manager</p>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: T.successBg, padding: '4px 12px', borderRadius: 20,
                }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.success }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.success }}>Available</span>
                </div>
            </div>

            {/* Messages area */}
            <div style={{ padding: '16px 24px', minHeight: 80, maxHeight: 260, overflowY: 'auto' }}>
                {state.messages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <p style={{ fontSize: 14, color: T.textMut, fontStyle: 'italic' }}>No messages yet</p>
                        <p style={{ fontSize: 12, color: T.textMut, marginTop: 4 }}>We typically respond within one business day.</p>
                    </div>
                )}
                {state.messages.map(m => (
                    <div key={m.id} style={{
                        marginBottom: 12, display: 'flex',
                        flexDirection: m.senderType === 'client' ? 'row-reverse' : 'row', gap: 8,
                    }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: m.senderType === 'client' ? T.blue : T.accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0,
                        }}>{m.senderName[0]}</div>
                        <div style={{
                            maxWidth: '70%', padding: '10px 14px', borderRadius: 14,
                            background: m.senderType === 'client' ? T.blueBg : T.accentPale,
                            fontSize: 14, color: T.text,
                        }}>
                            <p style={{ fontSize: 11, color: T.textMut, marginBottom: 3, fontWeight: 600 }}>{m.senderName}</p>
                            {m.content}
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            {/* Input strip */}
            <div style={{
                display: 'flex', gap: 8,
                padding: '12px 24px 16px',
                borderTop: `1px solid ${T.bgWarm}`,
                background: '#fafafa',
            }}>
                <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Send a message to Victoria..." style={{ ...S.inputBase, flex: 1, borderRadius: 24, padding: '10px 20px' }} />
                <button onClick={send} style={{
                    ...S.btnPrimary, padding: '10px 16px', display: 'flex', alignItems: 'center',
                    borderRadius: 24, width: 44, height: 44, justifyContent: 'center',
                }}><SendIcon /></button>
            </div>
        </div>
    );
}

export default function ReviewScreen() {
    const { state, dispatch } = useApp();
    const { review } = state;
    const [checksDone, setChecksDone] = useState([false, false, false]);

    // Automated checks animation
    useEffect(() => {
        if (review.status === 'checking') {
            const timers = [
                setTimeout(() => setChecksDone(c => [true, c[1], c[2]]), 1500),
                setTimeout(() => setChecksDone(c => [c[0], true, c[2]]), 3000),
                setTimeout(() => setChecksDone([true, true, true]), 4500),
                setTimeout(() => dispatch({ type: 'SET_REVIEW', data: { status: 'waiting' } }), 5000),
            ];
            return () => timers.forEach(clearTimeout);
        }
    }, [review.status]);

    const checks = [
        { label: 'Completeness check', done: checksDone[0] },
        { label: 'Consistency check', done: checksDone[1] },
        { label: 'Edge case analysis', done: checksDone[2] },
    ];

    const openFlags = review.flags.filter(f => f.status === 'open');
    const allFlagsResolved = review.flags.length > 0 && openFlags.length === 0;

    // Checking state
    if (review.status === 'checking') {
        return (
            <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
                <ShieldIcon size={48} color={T.accent} />
                <h1 style={{ ...S.h2, marginTop: 16, marginBottom: 24 }}>Running pre-submission checks...</h1>
                <div style={{ textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
                    {checks.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${T.bgWarm}` }} className="animate-fade-in">
                            {c.done ? <CheckIcon size={20} /> : <SpinnerIcon size={20} />}
                            <span style={{ fontSize: 15, color: c.done ? T.success : T.text, fontWeight: c.done ? 600 : 400 }}>{c.label}</span>
                            {c.done && <span style={{ marginLeft: 'auto', fontSize: 13, color: T.success }}>✓ Done</span>}
                        </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
                        <ClockIcon size={20} color={T.textMut} />
                        <span style={{ fontSize: 15, color: T.textMut }}>Case Manager review</span>
                        <span style={{ marginLeft: 'auto', fontSize: 13, color: T.textMut }}>Queued</span>
                    </div>
                </div>
            </div>
        );
    }

    // Approved
    if (review.status === 'approved') {
        return (
            <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: T.successBg, border: `3px solid ${T.success}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, animation: 'celebrate 0.6s ease' }}>
                    <CheckIcon size={36} color={T.success} />
                </div>
                <h1 style={{ ...S.h1, fontSize: 36, marginBottom: 12 }}>Your application has been approved by our team!</h1>
                <p style={{ fontSize: 16, color: T.textSec, marginBottom: 32, lineHeight: 1.6 }}>
                    Everything looks great. The final step is to sign and mail your forms.
                </p>
                <div style={{ ...S.card, textAlign: 'left', marginBottom: 24 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: T.textMut, marginBottom: 12 }}>APPLICATION SUMMARY</p>
                    <div style={{ fontSize: 14, color: T.text, lineHeight: 2 }}>
                        <p><strong>Type:</strong> Citizenship by Descent</p>
                        <p><strong>Chain:</strong> {state.chain.generationCount}-generation</p>
                        <p><strong>Certificate:</strong> {state.client.certificateType}</p>
                        <p><strong>Documents:</strong> {Object.keys(state.documents).length} submitted</p>
                    </div>
                </div>
                <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'sign' })} style={{ ...S.btnPrimary, fontSize: 17, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    Proceed to Sign & Submit <ArrowRight size={20} />
                </button>
                <CMMessagePanel />
            </div>
        );
    }

    // Changes Requested
    if (review.status === 'changes_requested') {
        return (
            <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <WarningIcon size={28} color={T.warn} />
                    <h1 style={{ ...S.h2 }}>Victoria has flagged {openFlags.length} item{openFlags.length !== 1 ? 's' : ''} for your attention</h1>
                </div>

                {review.flags.map(flag => (
                    <div key={flag.id} style={{ ...S.card, marginBottom: 16, borderLeft: `4px solid ${flag.status === 'resolved' ? T.success : T.warn}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: T.textMut, marginBottom: 4 }}>{flag.target}</p>
                                <p style={{ fontSize: 15, color: T.text, lineHeight: 1.5 }}>{flag.message}</p>
                            </div>
                            {flag.status === 'resolved' ? (
                                <span style={{ fontSize: 12, color: T.success, fontWeight: 600, background: T.successBg, padding: '4px 10px', borderRadius: 6, whiteSpace: 'nowrap' }}>✓ Fixed</span>
                            ) : null}
                        </div>
                        {flag.status === 'open' && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: flag.goTo || 'gather' })} style={{ ...S.btnSecondary, padding: '6px 14px', fontSize: 12 }}>
                                    Go to {flag.goTo === 'confirm' ? 'Confirm Details' : 'Gather Proof'}
                                </button>
                                <button onClick={() => dispatch({ type: 'RESOLVE_FLAG', id: flag.id })} style={{ ...S.btnSecondary, padding: '6px 14px', fontSize: 12, borderColor: T.success, color: T.success }}>
                                    Mark as Fixed
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                <button
                    onClick={() => dispatch({ type: 'SET_REVIEW', data: { status: 'checking' } })}
                    disabled={!allFlagsResolved}
                    style={{ ...S.btnPrimary, width: '100%', marginTop: 12, opacity: allFlagsResolved ? 1 : 0.5 }}
                >
                    Re-submit for Review
                </button>

                <CMMessagePanel />
            </div>
        );
    }

    // Waiting (default)
    return (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
            <ShieldIcon size={48} color={T.accent} />
            <h1 style={{ ...S.h2, marginTop: 16, marginBottom: 8 }}>Your application is under review</h1>
            <p style={{ fontSize: 15, color: T.textSec, marginBottom: 28, lineHeight: 1.6 }}>
                Victoria Rukaite is reviewing your documents and forms.
            </p>

            {/* Checks summary */}
            <div style={{ textAlign: 'left', maxWidth: 400, margin: '0 auto 28px' }}>
                {['Completeness check', 'Consistency check', 'Edge case analysis'].map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                        <CheckIcon size={16} /> <span style={{ fontSize: 14, color: T.success }}>{c}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 12, color: T.success }}>✓ Done</span>
                    </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                    <SpinnerIcon size={16} /> <span style={{ fontSize: 14, color: T.text }}>Case Manager review</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: T.warn }}>In progress</span>
                </div>
            </div>

            <p style={{ fontSize: 14, color: T.textMut, marginBottom: 24 }}>Most reviews are completed within 1–2 business days.</p>

            <CMMessagePanel />
        </div>
    );
}
