import React, { useState, useRef, useEffect } from 'react';
import { useApp } from './AppContext.jsx';
import { T, S } from './tokens.js';
import { CheckIcon, WarningIcon, SendIcon, ArrowLeft } from './Icons.jsx';

const SAMPLE_FLAGS = {
    "Grandparent's Birth Cert": "The grandparent's birth certificate appears to be partially illegible. Could you obtain a clearer copy or a certified replacement?",
    "Grandparent's Marriage Cert": "The grandparent's marriage certificate is needed to verify the name linkage in the chain. Please upload if available.",
    "Parent's Birth Cert": "The registration number extracted from the document doesn't match the expected format. Please verify the number on your parent's birth certificate and re-upload if a digit was cut off.",
    "Marriage Certificate": "A marriage certificate would help verify the name change between your mother's birth certificate and your birth certificate. Please upload if available.",
    "Applicant Birth Cert": "The applicant's birth certificate appears to be missing parent birthplace information. Please verify the document is the long-form version.",
    "Photo ID (Primary)": "The primary photo ID appears to be expired. Please upload a current, valid government-issued ID.",
    "Photo ID (Secondary)": "The secondary ID does not clearly show your date of birth. Please upload a clearer copy or a different ID.",
    "Full Name": "Please review and correct the flagged information on the Confirm Details screen.",
    "Date of Birth": "Please review and correct the flagged information on the Confirm Details screen.",
    "Registration Number": "The registration number format doesn't match what we'd expect for the province and year of birth. Please double-check the original document.",
    "Address": "Please review and correct the flagged information on the Confirm Details screen.",
    "General note": "Please review and correct the flagged information on the Confirm Details screen.",
};

export default function CMDashboard() {
    const { state, dispatch } = useApp();
    const { client, chain, documents, review, messages } = state;
    const [flagTarget, setFlagTarget] = useState('');
    const [flagMsg, setFlagMsg] = useState('');
    const [pendingFlags, setPendingFlags] = useState([]);
    const [cmMsg, setCmMsg] = useState('');
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const msgEndRef = useRef(null);

    useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const docNames = Object.keys(documents).map(id => {
        const labels = { applicant_birth_cert: 'Applicant Birth Cert', applicant_id_1: 'Photo ID (Primary)', applicant_id_2: 'Photo ID (Secondary)', parent_birth_cert: "Parent's Birth Cert", parent_marriage_cert: 'Marriage Certificate', grandparent_birth_cert: "Grandparent's Birth Cert", grandparent_marriage_cert: "Grandparent's Marriage Cert", name_change_doc: 'Name Change Document' };
        return labels[id] || id;
    });
    const targetOptions = [...docNames, 'Full Name', 'Date of Birth', 'Registration Number', 'Address', 'General note'];

    const addFlag = () => {
        if (!flagTarget || !flagMsg) return;
        setPendingFlags(f => [...f, { id: Date.now(), target: flagTarget, message: flagMsg, status: 'open', goTo: flagTarget.includes('Cert') || flagTarget.includes('cert') || flagTarget.includes('ID') || flagTarget.includes('Photo') ? 'gather' : 'confirm' }]);
        setFlagTarget(''); setFlagMsg('');
    };

    const sendFlags = () => {
        dispatch({ type: 'SET_REVIEW', data: { status: 'changes_requested', flags: [...review.flags, ...pendingFlags] } });
        setPendingFlags([]);
    };

    const approve = () => {
        dispatch({ type: 'SET_REVIEW', data: { status: 'approved' } });
        setShowApproveConfirm(false);
    };

    const sendCMMessage = () => {
        if (!cmMsg.trim()) return;
        dispatch({ type: 'ADD_MESSAGE', msg: { senderType: 'case_manager', senderName: 'Victoria Rukaite', content: cmMsg.trim() } });
        setCmMsg('');
    };

    // Auto-fill flag message when target is selected
    const handleTargetChange = (val) => {
        setFlagTarget(val);
        if (SAMPLE_FLAGS[val]) {
            setFlagMsg(SAMPLE_FLAGS[val]);
        }
    };

    const isResubmitted = review.status === 'waiting' && review.flags.length > 0;

    return (
        <div style={{ minHeight: '100vh', background: T.bg }}>
            {/* CM Header — inverted dark bar to signal role change */}
            <div style={{
                background: `linear-gradient(135deg, ${T.accent}, #0F2219)`,
                padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            }}>
                <div>
                    <p style={{ color: '#fff', fontFamily: T.fontDisplay, fontWeight: 400, fontSize: 18 }}>Cohen Immigration Law</p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: T.font }}>Case Manager Dashboard</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 12, fontWeight: 700,
                        }}>VR</div>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Victoria Rukaite</span>
                    </div>
                    <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: state.previousScreen || 'review' })} style={{
                        ...S.btnSecondary, borderColor: 'rgba(255,255,255,0.4)', color: '#fff',
                        padding: '6px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
                        background: 'rgba(255,255,255,0.08)',
                    }}>
                        <ArrowLeft size={12} color="#fff" /> Client View
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: 840, margin: '0 auto', padding: '32px 24px' }}>
                {/* Client File Card */}
                <div style={{
                    ...S.card, marginBottom: 24,
                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 400, color: T.text }}>Client File</h2>
                        <span style={{
                            padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: review.status === 'approved' ? T.successBg : review.status === 'changes_requested' ? T.warnBg : T.blueBg,
                            color: review.status === 'approved' ? T.success : review.status === 'changes_requested' ? T.warn : T.blue,
                        }}>
                            {review.status === 'approved' ? '✓ Approved' : review.status === 'changes_requested' ? '⚠ Changes Requested' : '● In Review'}
                        </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px', fontSize: 14 }}>
                        <div><span style={{ color: T.textMut }}>Client: </span><strong>{client.firstName} {client.lastName}</strong></div>
                        <div><span style={{ color: T.textMut }}>Submitted: </span>{new Date().toLocaleDateString()}</div>
                        <div><span style={{ color: T.textMut }}>Chain: </span>{chain.generationCount}-generation</div>
                        <div><span style={{ color: T.textMut }}>Certificate: </span>{client.certificateType || 'Paper'}</div>
                        <div><span style={{ color: T.textMut }}>Email: </span>{client.email}</div>
                        <div><span style={{ color: T.textMut }}>Phone: </span>{client.phone}</div>
                    </div>

                    {/* Documents list */}
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.bgWarm}` }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Documents ({Object.keys(documents).length})</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            {Object.entries(documents).map(([id, doc]) => (
                                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', fontSize: 13 }}>
                                    <CheckIcon size={12} />
                                    <span>{docNames[Object.keys(documents).indexOf(id)] || id}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Re-submission notice */}
                {isResubmitted && (
                    <div style={{ ...S.card, borderLeft: `4px solid ${T.blue}`, marginBottom: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }} className="animate-fade-in">
                        <p style={{ fontWeight: 700, color: T.blue, marginBottom: 12, fontFamily: T.fontDisplay, fontSize: 18 }}>Re-submitted for review</p>
                        <p style={{ fontSize: 13, color: T.textSec, marginBottom: 12 }}>The client has addressed the following flags:</p>
                        {review.flags.map(f => (
                            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13 }}>
                                <CheckIcon size={12} color={T.success} />
                                <span style={{ color: T.textSec }}>{f.target}: </span>
                                <span style={{ color: T.text }}>{f.message.substring(0, 80)}...</span>
                                <span style={{ marginLeft: 'auto', fontSize: 11, color: T.success, fontWeight: 600 }}>Resolved</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Review Actions */}
                <div style={{
                    ...S.card, marginBottom: 24,
                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                }}>
                    <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 400, color: T.text, marginBottom: 20 }}>Review Actions</h2>

                    {/* Approve */}
                    {!showApproveConfirm ? (
                        <button onClick={() => setShowApproveConfirm(true)} style={{ ...S.btnPrimary, background: T.success, width: '100%', marginBottom: 20, fontSize: 16 }}>
                            ✓ Approve Application
                        </button>
                    ) : (
                        <div style={{ background: T.successBg, border: `1px solid ${T.success}`, borderRadius: T.radiusSm, padding: '16px 20px', marginBottom: 20 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 12 }}>Are you sure? This will notify the client to proceed to signing.</p>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={approve} style={{ ...S.btnPrimary, background: T.success, padding: '8px 24px', fontSize: 14 }}>Yes, Approve</button>
                                <button onClick={() => setShowApproveConfirm(false)} style={{ ...S.btnSecondary, padding: '8px 24px', fontSize: 14 }}>Cancel</button>
                            </div>
                        </div>
                    )}

                    <div style={{ textAlign: 'center', fontSize: 13, color: T.textMut, marginBottom: 20 }}>— or —</div>

                    {/* Flag form */}
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: T.text }}>Flag items for client attention:</p>
                    <div style={{ marginBottom: 12 }}>
                        <label style={S.label}>Target</label>
                        <select value={flagTarget} onChange={e => handleTargetChange(e.target.value)} style={{ ...S.inputBase, cursor: 'pointer' }}>
                            <option value="">Select a document or field...</option>
                            {targetOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label style={S.label}>Message</label>
                        <textarea value={flagMsg} onChange={e => setFlagMsg(e.target.value)} rows={3} placeholder="Describe the issue for the client..." style={{ ...S.inputBase, resize: 'vertical' }} />
                    </div>
                    <button onClick={addFlag} disabled={!flagTarget || !flagMsg} style={{ ...S.btnSecondary, padding: '8px 20px', fontSize: 13, opacity: flagTarget && flagMsg ? 1 : 0.5, marginBottom: 16 }}>
                        + Add Flag
                    </button>

                    {/* Pending flags */}
                    {pendingFlags.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Pending flags ({pendingFlags.length})</p>
                            {pendingFlags.map(f => (
                                <div key={f.id} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                    padding: '12px 16px', background: T.warnBg, borderRadius: T.radiusSm,
                                    marginBottom: 8, fontSize: 13, border: `1px solid rgba(180,83,9,0.15)`,
                                }}>
                                    <WarningIcon size={14} />
                                    <div style={{ flex: 1 }}>
                                        <strong>{f.target}</strong>
                                        <p style={{ color: T.textSec, marginTop: 2, lineHeight: 1.5 }}>{f.message}</p>
                                    </div>
                                </div>
                            ))}
                            <button onClick={sendFlags} style={{ ...S.btnPrimary, width: '100%', marginTop: 8, fontSize: 14 }}>
                                Send {pendingFlags.length} Flag{pendingFlags.length > 1 ? 's' : ''} to Client
                            </button>
                        </div>
                    )}
                </div>

                {/* Messages — unified panel matching client-side style */}
                <div style={{
                    ...S.card, padding: 0, overflow: 'hidden',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                }}>
                    <div style={{
                        padding: '16px 24px', borderBottom: `1px solid ${T.bgWarm}`,
                        background: `linear-gradient(135deg, ${T.accentPale}, ${T.card})`,
                    }}>
                        <h3 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 400, color: T.text }}>Messages with Client</h3>
                    </div>
                    <div style={{ padding: '16px 24px', minHeight: 80, maxHeight: 300, overflowY: 'auto' }}>
                        {messages.length === 0 && (
                            <p style={{ fontSize: 13, color: T.textMut, fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>No messages yet.</p>
                        )}
                        {messages.map(m => (
                            <div key={m.id} style={{ marginBottom: 12, display: 'flex', flexDirection: m.senderType === 'case_manager' ? 'row-reverse' : 'row', gap: 8 }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: m.senderType === 'case_manager' ? T.accent : T.blue,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0,
                                }}>{m.senderName[0]}</div>
                                <div style={{
                                    maxWidth: '70%', padding: '10px 14px', borderRadius: 14,
                                    background: m.senderType === 'case_manager' ? T.accentPale : T.blueBg, fontSize: 14,
                                }}>
                                    <p style={{ fontSize: 11, color: T.textMut, marginBottom: 3, fontWeight: 600 }}>{m.senderName}</p>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        <div ref={msgEndRef} />
                    </div>
                    <div style={{
                        display: 'flex', gap: 8, padding: '12px 24px 16px',
                        borderTop: `1px solid ${T.bgWarm}`, background: '#fafafa',
                    }}>
                        <input value={cmMsg} onChange={e => setCmMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendCMMessage()} placeholder="Send a message as Victoria..." style={{ ...S.inputBase, flex: 1, borderRadius: 24, padding: '10px 20px' }} />
                        <button onClick={sendCMMessage} style={{
                            ...S.btnPrimary, padding: '10px 16px', display: 'flex', alignItems: 'center',
                            borderRadius: 24, width: 44, height: 44, justifyContent: 'center',
                        }}><SendIcon /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
