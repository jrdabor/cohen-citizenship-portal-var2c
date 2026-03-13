import React, { useState } from 'react';
import { useApp } from './AppContext.jsx';
import { T, S } from './tokens.js';
import { CheckIcon, WarningIcon, SendIcon, ArrowLeft } from './Icons.jsx';

export default function CMDashboard() {
    const { state, dispatch } = useApp();
    const { client, chain, documents, review, messages } = state;
    const [flagTarget, setFlagTarget] = useState('');
    const [flagMsg, setFlagMsg] = useState('');
    const [pendingFlags, setPendingFlags] = useState([]);
    const [cmMsg, setCmMsg] = useState('');
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);

    const docNames = Object.keys(documents).map(id => {
        const labels = { applicant_birth_cert: 'Applicant Birth Cert', applicant_id_1: 'Photo ID (Primary)', applicant_id_2: 'Photo ID (Secondary)', parent_birth_cert: "Parent's Birth Cert", parent_marriage_cert: 'Marriage Certificate', grandparent_birth_cert: "Grandparent's Birth Cert", grandparent_marriage_cert: "Grandparent's Marriage Cert", name_change_doc: 'Name Change Document' };
        return labels[id] || id;
    });
    const targetOptions = [...docNames, 'Full Name', 'Date of Birth', 'Registration Number', 'Address', 'General note'];

    const addFlag = () => {
        if (!flagTarget || !flagMsg) return;
        setPendingFlags(f => [...f, { id: Date.now(), target: flagTarget, message: flagMsg, status: 'open', goTo: flagTarget.includes('cert') || flagTarget.includes('ID') || flagTarget.includes('Photo') ? 'gather' : 'confirm' }]);
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

    const isResubmitted = review.status === 'waiting' && review.flags.length > 0;

    return (
        <div style={{ minHeight: '100vh', background: '#f0f0ec' }}>
            {/* CM Header */}
            <div style={{ background: T.accent, padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Cohen Immigration Law — Case Manager Dashboard</p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Logged in as: Victoria Rukaite</p>
                </div>
                <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: state.previousScreen || 'review' })} style={{ ...S.btnSecondary, borderColor: '#fff', color: '#fff', padding: '8px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ArrowLeft size={14} color="#fff" /> Back to Client View
                </button>
            </div>

            <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
                {/* Client File */}
                <div style={{ ...S.card, marginBottom: 24 }}>
                    <h2 style={{ ...S.h3, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        📋 Client File
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px', fontSize: 14 }}>
                        <div><span style={{ color: T.textMut }}>Client: </span><strong>{client.firstName} {client.lastName}</strong></div>
                        <div><span style={{ color: T.textMut }}>Status: </span>
                            <span style={{ padding: '2px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: review.status === 'approved' ? T.successBg : review.status === 'changes_requested' ? T.warnBg : T.blueBg, color: review.status === 'approved' ? T.success : review.status === 'changes_requested' ? T.warn : T.blue }}>
                                {review.status === 'approved' ? 'Approved' : review.status === 'changes_requested' ? 'Changes Requested' : 'In Review'}
                            </span>
                        </div>
                        <div><span style={{ color: T.textMut }}>Submitted: </span>{new Date().toLocaleDateString()}</div>
                        <div><span style={{ color: T.textMut }}>Chain: </span>{chain.generationCount}-generation</div>
                        <div><span style={{ color: T.textMut }}>Certificate: </span>{client.certificateType || 'Paper'}</div>
                        <div><span style={{ color: T.textMut }}>Documents: </span>{Object.keys(documents).length} uploaded</div>
                    </div>

                    {/* Documents list */}
                    <div style={{ marginTop: 20 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: T.textMut, marginBottom: 8 }}>DOCUMENTS SUBMITTED</p>
                        {Object.entries(documents).map(([id, doc]) => (
                            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13 }}>
                                <CheckIcon size={14} />
                                <span>{docNames[Object.keys(documents).indexOf(id)] || id}</span>
                                <span style={{ fontSize: 11, color: T.textMut, marginLeft: 'auto' }}>{doc.fileName}</span>
                            </div>
                        ))}
                    </div>

                    {/* Key fields */}
                    <div style={{ marginTop: 20 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: T.textMut, marginBottom: 8 }}>APPLICATION SUMMARY</p>
                        <div style={{ fontSize: 13, color: T.text, lineHeight: 2 }}>
                            <p>Name: <strong>{client.firstName} {client.lastName}</strong></p>
                            <p>DOB: <strong>{client.dob || 'From documents'}</strong></p>
                            <p>Email: <strong>{client.email}</strong></p>
                            <p>Phone: <strong>{client.phone}</strong></p>
                        </div>
                    </div>
                </div>

                {/* Re-submission notice */}
                {isResubmitted && (
                    <div style={{ ...S.card, borderLeft: `4px solid ${T.blue}`, marginBottom: 24 }} className="animate-fade-in">
                        <p style={{ fontWeight: 700, color: T.blue, marginBottom: 12 }}>📬 Re-submitted for review</p>
                        <p style={{ fontSize: 13, color: T.textSec, marginBottom: 16 }}>Previous flags:</p>
                        {review.flags.map(f => (
                            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13 }}>
                                <CheckIcon size={14} color={T.success} />
                                <span style={{ color: T.textSec }}>{f.target}: </span>
                                <span>{f.message}</span>
                                <span style={{ marginLeft: 'auto', fontSize: 11, color: T.success, fontWeight: 600 }}>Client marked as fixed</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Review Actions */}
                <div style={{ ...S.card, marginBottom: 24 }}>
                    <h2 style={{ ...S.h3, marginBottom: 20 }}>Review Actions</h2>

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
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Flag items for client attention:</p>
                    <div style={{ marginBottom: 12 }}>
                        <label style={S.label}>Target</label>
                        <select value={flagTarget} onChange={e => setFlagTarget(e.target.value)} style={{ ...S.inputBase, cursor: 'pointer' }}>
                            <option value="">Select a document or field...</option>
                            {targetOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label style={S.label}>Message</label>
                        <textarea value={flagMsg} onChange={e => setFlagMsg(e.target.value)} rows={3} placeholder="Describe the issue..." style={{ ...S.inputBase, resize: 'vertical' }} />
                    </div>
                    <button onClick={addFlag} disabled={!flagTarget || !flagMsg} style={{ ...S.btnSecondary, padding: '8px 20px', fontSize: 13, opacity: flagTarget && flagMsg ? 1 : 0.5, marginBottom: 16 }}>
                        + Add Flag
                    </button>

                    {/* Pending flags */}
                    {pendingFlags.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: T.textMut, marginBottom: 8 }}>Current flags:</p>
                            {pendingFlags.map(f => (
                                <div key={f.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', background: T.warnBg, borderRadius: T.radiusSm, marginBottom: 8, fontSize: 13 }}>
                                    <WarningIcon size={14} />
                                    <div>
                                        <strong>{f.target}</strong>
                                        <p style={{ color: T.textSec }}>{f.message}</p>
                                    </div>
                                </div>
                            ))}
                            <button onClick={sendFlags} style={{ ...S.btnPrimary, width: '100%', marginTop: 8, fontSize: 14 }}>
                                Send {pendingFlags.length} Flag{pendingFlags.length > 1 ? 's' : ''} to Client
                            </button>
                        </div>
                    )}
                </div>

                {/* Messages */}
                <div style={{ ...S.card }}>
                    <h3 style={{ ...S.h3, fontSize: 15, marginBottom: 16 }}>Messages</h3>
                    <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 12 }}>
                        {messages.length === 0 && <p style={{ fontSize: 13, color: T.textMut, fontStyle: 'italic' }}>No messages yet.</p>}
                        {messages.map(m => (
                            <div key={m.id} style={{ marginBottom: 12, display: 'flex', flexDirection: m.senderType === 'case_manager' ? 'row-reverse' : 'row', gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.senderType === 'case_manager' ? T.accent : T.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                                    {m.senderName[0]}
                                </div>
                                <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: 12, background: m.senderType === 'case_manager' ? T.accentPale : T.blueBg, fontSize: 14 }}>
                                    <p style={{ fontSize: 11, color: T.textMut, marginBottom: 4, fontWeight: 600 }}>{m.senderName}</p>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input value={cmMsg} onChange={e => setCmMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendCMMessage()} placeholder="Send a message as Victoria..." style={{ ...S.inputBase, flex: 1 }} />
                        <button onClick={sendCMMessage} style={{ ...S.btnPrimary, padding: '10px 16px' }}><SendIcon /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
