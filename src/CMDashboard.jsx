import React, { useState } from 'react';
import { useApp } from './AppContext.jsx';
import { T, S } from './tokens.js';
import { CheckIcon, WarningIcon, SendIcon, UserIcon, ArrowLeft, XIcon } from './Icons.jsx';

export default function CMDashboard() {
    const { state, dispatch } = useApp();
    const { client, documents, chain, intake, confirmEdits, review, applicants, sharedDocuments, messages } = state;
    const isFamily = applicants.length > 1;
    const [flagTitle, setFlagTitle] = useState('');
    const [flagMessage, setFlagMessage] = useState('');
    const [flagSeverity, setFlagSeverity] = useState('attention');
    const [flagTarget, setFlagTarget] = useState('Confirm Details');
    const [flagApplicantId, setFlagApplicantId] = useState('shared');
    const [showExtracted, setShowExtracted] = useState(false);
    const [msgText, setMsgText] = useState('');

    const allFlags = review.flags || [];
    const sharedFlags = review.sharedFlags || [];
    const applicantFlags = isFamily
        ? applicants.flatMap(a => (a.reviewFlags || []).map(f => ({ ...f, applicantId: a.id, applicantName: a.firstName })))
        : [];
    const totalFlagCount = allFlags.length + sharedFlags.length + applicantFlags.length;

    const handleAddFlag = () => {
        if (!flagTitle.trim()) return;
        const flag = { id: Date.now(), title: flagTitle, message: flagMessage, severity: flagSeverity, target: flagTarget, status: 'open' };

        if (isFamily && flagApplicantId !== 'shared' && flagApplicantId !== 'general') {
            const updatedApplicants = applicants.map(a =>
                a.id === flagApplicantId
                    ? { ...a, reviewFlags: [...(a.reviewFlags || []), flag] }
                    : a
            );
            dispatch({ type: 'SET_APPLICANTS', data: updatedApplicants });
        } else if (isFamily && flagApplicantId === 'shared') {
            dispatch({ type: 'SET_REVIEW', data: { sharedFlags: [...sharedFlags, flag] } });
        } else {
            dispatch({ type: 'SET_REVIEW', data: { flags: [...allFlags, flag] } });
        }
        setFlagTitle(''); setFlagMessage('');
    };

    const handleApprove = () => {
        const confirmMsg = isFamily
            ? `Approve all ${applicants.length} applicants in the ${client.lastName} family application?`
            : `Approve ${client.firstName} ${client.lastName}'s application?`;
        if (window.confirm(confirmMsg)) {
            dispatch({ type: 'SET_REVIEW', data: { status: 'approved' } });
            dispatch({ type: 'SET_SCREEN', screen: 'review' });
        }
    };

    const handleSendFlags = () => {
        dispatch({ type: 'SET_REVIEW', data: { status: 'changes_requested' } });
        dispatch({ type: 'SET_SCREEN', screen: 'review' });
    };

    const handleBackToClient = () => {
        if (totalFlagCount > 0 && review.status !== 'changes_requested') {
            const choice = window.confirm(
                `You have ${totalFlagCount} unsent flag${totalFlagCount > 1 ? 's' : ''}. Send them to the client before going back?`
            );
            if (choice) {
                handleSendFlags();
                return;
            }
        }
        dispatch({ type: 'SET_SCREEN', screen: 'review' });
    };

    const handleSendMessage = () => {
        if (!msgText.trim()) return;
        dispatch({ type: 'ADD_MESSAGE', msg: { sender: 'cm', senderName: 'Victoria Rukaite', text: msgText.trim() } });
        setMsgText('');
    };

    // Total doc count
    const docCount = isFamily
        ? Object.keys(sharedDocuments).length + applicants.reduce((s, a) => s + Object.keys(a.documents || {}).length, 0)
        : Object.keys(documents).length;

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 64px)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <button onClick={handleBackToClient}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: T.accent, fontWeight: 600 }}>
                    <ArrowLeft size={16} color={T.accent} /> Back to Client View
                </button>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: T.textMut, background: T.bgWarm, padding: '6px 16px', borderRadius: 20 }}>Case Manager Dashboard</span>
            </div>

            {/* ── Client File Summary ── */}
            <div style={{ ...S.card, padding: '28px 32px', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: T.accentPale, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserIcon size={24} color={T.accent} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{client.firstName} {client.lastName}</h2>
                        <p style={{ fontSize: 14, color: T.textSec }}>
                            {isFamily ? `Family application — ${applicants.length} applicants` : 'Citizenship by Descent'}
                        </p>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <p style={{ fontSize: 13, color: T.textMut }}>Status</p>
                        <span style={{ fontSize: 14, fontWeight: 700, color: review.status === 'approved' ? T.success : review.status === 'changes_requested' ? T.warn : T.accent }}>
                            {review.status === 'approved' ? 'Approved' : review.status === 'changes_requested' ? 'Changes Requested' : 'Under Review'}
                        </span>
                    </div>
                </div>

                {/* Family members list */}
                {isFamily && (
                    <div style={{ background: T.bg, borderRadius: T.radiusSm, padding: '14px 18px', marginBottom: 16 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Applicants</p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {applicants.map(a => (
                                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.card, borderRadius: 8, padding: '6px 14px', border: `1px solid ${T.bgWarm}` }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{a.firstName} {a.lastName}</span>
                                    {a.isMinor && <span style={{ fontSize: 10, fontWeight: 700, color: T.maple, background: `${T.maple}14`, padding: '1px 6px', borderRadius: 4 }}>Minor</span>}
                                    <span style={{ fontSize: 12, color: T.textMut }}>({a.relationship})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Summary stats */}
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ padding: '12px 18px', background: T.bg, borderRadius: T.radiusSm, flex: 1 }}>
                        <p style={{ fontSize: 28, fontWeight: 700, color: T.accent }}>{docCount}</p>
                        <p style={{ fontSize: 13, color: T.textMut }}>Documents uploaded</p>
                    </div>
                    <div style={{ padding: '12px 18px', background: T.bg, borderRadius: T.radiusSm, flex: 1 }}>
                        <p style={{ fontSize: 28, fontWeight: 700, color: T.accent }}>{chain.nodes?.length || 0}</p>
                        <p style={{ fontSize: 13, color: T.textMut }}>Chain nodes</p>
                    </div>
                    <div style={{ padding: '12px 18px', background: T.bg, borderRadius: T.radiusSm, flex: 1 }}>
                        <p style={{ fontSize: 28, fontWeight: 700, color: totalFlagCount > 0 ? T.warn : T.success }}>{totalFlagCount}</p>
                        <p style={{ fontSize: 13, color: T.textMut }}>Active flags</p>
                    </div>
                </div>
            </div>

            {/* ── Extracted Data (collapsible, collapsed by default) ── */}
            <div style={{ ...S.card, marginBottom: 24, overflow: 'hidden' }}>
                <button onClick={() => setShowExtracted(!showExtracted)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                    padding: '20px 28px', background: 'transparent', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: 0 }}>Extracted Data</h3>
                    <span style={{ fontSize: 18, color: T.textMut, transition: 'transform 0.2s', transform: showExtracted ? 'rotate(180deg)' : 'none' }}>▾</span>
                </button>
                {showExtracted && (
                    <div style={{ padding: '0 28px 24px', borderTop: `1px solid ${T.bgWarm}` }} className="animate-fade-in">
                        {isFamily && applicants.map(a => {
                            const appDocs = a.documents || {};
                            const allExtracted = Object.values(appDocs).filter(d => d.extraction?.length > 0);
                            return (
                                <div key={a.id} style={{ marginTop: 16 }}>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 8 }}>
                                        {a.firstName}'s Data
                                        {a.isMinor && <span style={{ fontSize: 11, color: T.maple, marginLeft: 8 }}>(Minor)</span>}
                                    </p>
                                    {allExtracted.length === 0 ? <p style={{ fontSize: 13, color: T.textMut }}>No extracted data</p> : (
                                        allExtracted.map((doc, i) => (
                                            <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                                                {doc.extraction.map((f, j) => (
                                                    <span key={j} style={{ fontSize: 13, background: T.bg, border: `1px solid ${T.bgWarm}`, padding: '4px 10px', borderRadius: 6 }}>
                                                        <span style={{ color: T.textMut }}>{f.label}:</span> <strong>{f.value}</strong>
                                                    </span>
                                                ))}
                                            </div>
                                        ))
                                    )}
                                </div>
                            );
                        })}
                        <div style={{ marginTop: 16 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 8 }}>{isFamily ? 'Shared Documents' : 'Extracted Data'}</p>
                            {Object.entries(isFamily ? sharedDocuments : documents).filter(([, d]) => d.extraction?.length > 0).map(([docId, doc]) => (
                                <div key={docId} style={{ marginBottom: 12 }}>
                                    <p style={{ fontSize: 13, color: T.textMut, fontWeight: 600, marginBottom: 6 }}>{docId.replace(/_/g, ' ')}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {doc.extraction.map((f, j) => (
                                            <span key={j} style={{ fontSize: 13, background: T.bg, border: `1px solid ${T.bgWarm}`, padding: '4px 10px', borderRadius: 6 }}>
                                                <span style={{ color: T.textMut }}>{f.label}:</span> <strong>{f.value}</strong>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {Object.entries(isFamily ? sharedDocuments : documents).filter(([, d]) => d.extraction?.length > 0).length === 0 && (
                                <p style={{ fontSize: 13, color: T.textMut }}>No extracted data yet</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Review Actions ── */}
            <div style={{ ...S.card, padding: '28px 32px', marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 20 }}>Review Actions</h3>

                {/* Approve button */}
                <button onClick={handleApprove} style={{
                    ...S.btnPrimary, padding: '14px 28px', fontSize: 15, marginBottom: 24, width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                    <CheckIcon size={18} color="#fff" /> Approve {isFamily ? 'Family Application' : 'Application'}
                </button>
                {isFamily && (
                    <p style={{ fontSize: 12, color: T.textMut, textAlign: 'center', marginTop: -16, marginBottom: 24 }}>
                        This will approve all {applicants.length} applicants in the {client.lastName} family
                    </p>
                )}

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <div style={{ flex: 1, height: 1, background: T.bgWarm }} />
                    <span style={{ fontSize: 13, color: T.textMut, fontWeight: 500 }}>or flag items for client attention</span>
                    <div style={{ flex: 1, height: 1, background: T.bgWarm }} />
                </div>

                {/* Flag form */}
                <div style={{ background: T.bg, borderRadius: T.radiusSm, padding: '20px 24px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                            <label style={S.label}>Title *</label>
                            <input style={S.inputBase} value={flagTitle} onChange={e => setFlagTitle(e.target.value)} placeholder="e.g., Name mismatch on parent birth cert" />
                        </div>
                        <div style={{ flex: '0 0 140px' }}>
                            <label style={S.label}>Severity</label>
                            <select style={{ ...S.inputBase, cursor: 'pointer' }} value={flagSeverity} onChange={e => setFlagSeverity(e.target.value)}>
                                <option value="attention">Attention</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                            <label style={S.label}>Target Section</label>
                            <select style={{ ...S.inputBase, cursor: 'pointer' }} value={flagTarget} onChange={e => setFlagTarget(e.target.value)}>
                                <option value="Confirm Details">Confirm Details</option>
                                <option value="Gather Proof">Gather Proof</option>
                                <option value="General">General</option>
                            </select>
                        </div>
                        {isFamily && (
                            <div style={{ flex: 1 }}>
                                <label style={S.label}>Applicant</label>
                                <select style={{ ...S.inputBase, cursor: 'pointer' }} value={flagApplicantId} onChange={e => setFlagApplicantId(e.target.value)}>
                                    <optgroup label="Shared">
                                        <option value="shared">Shared Documents</option>
                                        <option value="general">General</option>
                                    </optgroup>
                                    <optgroup label="Per Applicant">
                                        {applicants.map(a => (
                                            <option key={a.id} value={a.id}>{a.firstName} {a.lastName}{a.isMinor ? ' (Minor)' : ''}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>
                        )}
                    </div>
                    <label style={S.label}>Instructions for Client</label>
                    <textarea style={{ ...S.inputBase, minHeight: 60, resize: 'vertical' }} value={flagMessage} onChange={e => setFlagMessage(e.target.value)} placeholder="Explain what needs to be corrected..." />
                    <button onClick={handleAddFlag} disabled={!flagTitle.trim()} style={{
                        ...S.btnSecondary, padding: '8px 20px', fontSize: 13, marginTop: 12,
                        opacity: flagTitle.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <WarningIcon size={14} /> + Add Flag
                    </button>
                </div>

                {/* Current flags */}
                {totalFlagCount > 0 && (
                    <div style={{ marginBottom: 20 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: T.textMut, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                            Current Flags ({totalFlagCount})
                        </p>
                        {allFlags.map(f => <FlagItem key={f.id} flag={f} />)}
                        {isFamily && sharedFlags.length > 0 && (
                            <>
                                <p style={{ fontSize: 11, fontWeight: 700, color: T.textMut, marginTop: 12, marginBottom: 6 }}>SHARED</p>
                                {sharedFlags.map(f => <FlagItem key={f.id} flag={f} />)}
                            </>
                        )}
                        {applicantFlags.map(f => <FlagItem key={f.id} flag={f} label={f.applicantName} />)}
                    </div>
                )}

                {/* Send Flags to Client button — only when there are flags */}
                {totalFlagCount > 0 && review.status !== 'changes_requested' && (
                    <button onClick={handleSendFlags} style={{
                        ...S.btnPrimary, width: '100%', padding: '14px 28px', fontSize: 15,
                        background: T.warn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                        <SendIcon size={16} /> Send {totalFlagCount} Flag{totalFlagCount > 1 ? 's' : ''} to Client
                    </button>
                )}
                {review.status === 'changes_requested' && totalFlagCount > 0 && (
                    <p style={{ fontSize: 13, color: T.success, fontWeight: 600, textAlign: 'center' }}>
                        ✓ Flags sent to client
                    </p>
                )}
            </div>

            {/* ── Messages ── */}
            <div style={{ ...S.card, padding: '24px 28px' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 16 }}>Messages</h3>

                {(!messages || messages.length === 0) ? (
                    <p style={{ fontSize: 14, color: T.textMut, fontStyle: 'italic', marginBottom: 16 }}>No messages yet.</p>
                ) : (
                    <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
                        {messages.map(m => (
                            <div key={m.id} style={{
                                display: 'flex', justifyContent: m.sender === 'client' ? 'flex-start' : 'flex-end',
                                marginBottom: 8,
                            }}>
                                <div style={{
                                    maxWidth: '75%', padding: '10px 16px', borderRadius: 14,
                                    background: m.sender === 'client' ? T.bg : T.accent,
                                    color: m.sender === 'client' ? T.text : '#fff',
                                    fontSize: 14, lineHeight: 1.5,
                                }}>
                                    <p style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, marginBottom: 4 }}>
                                        {m.sender === 'client' ? `${client.firstName}` : 'Victoria Rukaite'}
                                    </p>
                                    {m.text}
                                    <p style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>
                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        value={msgText}
                        onChange={e => setMsgText(e.target.value)}
                        placeholder="Send a message as Victoria..."
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        style={{ ...S.inputBase, flex: 1 }}
                    />
                    <button onClick={handleSendMessage} disabled={!msgText.trim()} style={{
                        ...S.btnPrimary, padding: '8px 16px', opacity: msgText.trim() ? 1 : 0.5,
                        display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                        <SendIcon size={14} /> Send
                    </button>
                </div>
            </div>
        </div>
    );
}

function FlagItem({ flag, label }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
            borderBottom: `1px solid ${T.bgWarm}`,
        }}>
            <span style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                color: flag.severity === 'critical' ? T.error : T.warn,
                background: flag.severity === 'critical' ? '#FEE2E2' : T.warnBg,
                padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap',
            }}>{flag.severity}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.text, flex: 1 }}>
                {label && <span style={{ fontSize: 12, color: T.textMut, marginRight: 6 }}>({label})</span>}
                {flag.title}
            </span>
            <span style={{
                fontSize: 12, fontWeight: 600,
                color: flag.status === 'resolved' ? T.success : T.textMut,
            }}>{flag.status === 'resolved' ? '✓ Resolved' : 'Open'}</span>
        </div>
    );
}
