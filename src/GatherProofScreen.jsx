import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from './AppContext.jsx';
import { T, S } from './tokens.js';
import { getRequiredDocs, getMockExtraction } from './mockData.js';
import { CheckIcon, UploadIcon, WarningIcon, SpinnerIcon, ArrowRight } from './Icons.jsx';

function ChainViz({ nodes, documents, requiredDocs }) {
    const getNodeStatus = (personType) => {
        const personDocs = requiredDocs.filter(d => d.person === personType && d.required);
        if (personDocs.length === 0) return 'complete';
        const uploaded = personDocs.filter(d => documents[d.id]);
        if (uploaded.length === 0) return 'empty';
        if (uploaded.length === personDocs.length) return 'complete';
        return 'partial';
    };

    const personMap = { you: 'you', parent: 'parent', grandparent: 'grandparent', great_grandparent: 'grandparent' };
    const allComplete = nodes.every(n => {
        const pt = personMap[n.id] || n.id;
        return getNodeStatus(pt) === 'complete';
    });

    const statusColors = { empty: '#ccc', partial: T.warn, complete: T.success, flagged: T.error };
    const statusBg = { empty: 'transparent', partial: T.warnBg, complete: T.successBg, flagged: T.errorBg };

    return (
        <div style={{ background: T.card, borderRadius: T.radius, border: `1px solid ${T.bgWarm}`, padding: '24px 20px', position: 'sticky', top: 90 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>Chain of Descent</p>
            {allComplete && (
                <div style={{ background: T.successBg, border: `1px solid ${T.success}`, borderRadius: T.radiusSm, padding: '12px 16px', marginBottom: 16, textAlign: 'center', animation: 'celebrate 0.6s ease' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: T.success }}>✓ Your chain of descent is verified!</p>
                </div>
            )}
            {nodes.map((node, i) => {
                const pt = personMap[node.id] || node.id;
                const status = getNodeStatus(pt);
                const personDocList = requiredDocs.filter(d => d.person === pt && d.required);
                const uploadedCount = personDocList.filter(d => documents[d.id]).length;
                return (
                    <div key={node.id}>
                        {i > 0 && (
                            <div style={{ width: 2, height: 20, marginLeft: 16, background: (getNodeStatus(personMap[nodes[i - 1].id] || nodes[i - 1].id) === 'complete' && status === 'complete') ? T.success : '#ddd', transition: 'background 0.5s' }} />
                        )}
                        <div style={{
                            padding: '14px 16px', borderRadius: T.radiusSm,
                            border: `2px solid ${statusColors[status]}`,
                            background: statusBg[status],
                            borderStyle: status === 'empty' ? 'dashed' : 'solid',
                            transition: 'all 0.3s',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${statusColors[status]}`, background: status === 'complete' ? T.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {status === 'complete' && <CheckIcon size={12} color="#fff" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 700, fontSize: 14 }}>{node.label}</p>
                                    <p style={{ fontSize: 12, color: T.textSec }}>{node.basis}</p>
                                </div>
                            </div>
                            {personDocList.length > 0 && (
                                <div style={{ marginLeft: 34 }}>
                                    <div style={{ height: 4, background: '#eee', borderRadius: 2, marginTop: 4 }}>
                                        <div style={{ height: 4, background: statusColors[status], borderRadius: 2, width: `${(uploadedCount / personDocList.length) * 100}%`, transition: 'width 0.5s' }} />
                                    </div>
                                    <p style={{ fontSize: 11, color: T.textMut, marginTop: 4 }}>{uploadedCount}/{personDocList.length} docs</p>
                                </div>
                            )}
                            {node.isAnchor && status === 'complete' && (
                                <p style={{ marginTop: 6, marginLeft: 34, fontSize: 11, color: T.success, fontWeight: 600 }}>✓ Anchor</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function DocCard({ doc, uploaded, onUpload }) {
    const [extracting, setExtracting] = useState(false);
    const [extraction, setExtraction] = useState(uploaded?.extraction || null);
    const personColors = { you: T.blue, parent: T.warn, grandparent: T.success };
    const personLabels = { you: 'YOU', parent: 'PARENT', grandparent: 'GRANDPARENT' };

    const handleUpload = () => {
        setExtracting(true);
        setTimeout(() => {
            const ext = getMockExtraction(doc.id);
            setExtraction(ext);
            setExtracting(false);
            onUpload(doc.id, { fileName: `${doc.label.replace(/\s/g, '_').toLowerCase()}.pdf`, extraction: ext });
        }, 1500);
    };

    const isUploaded = !!uploaded || extraction;

    return (
        <div style={{
            background: T.card, borderRadius: T.radius,
            border: isUploaded ? `1.5px solid ${T.success}` : extracting ? `1.5px solid ${T.warn}` : `1px solid ${T.bgWarm}`,
            padding: '20px 24px', marginBottom: 12,
            transition: 'all 0.3s',
            boxShadow: isUploaded ? `0 2px 12px rgba(26,125,70,0.06)` : '0 1px 4px rgba(0,0,0,0.04)',
        }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: extraction ? 14 : 0 }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: isUploaded ? T.successBg : extracting ? T.warnBg : `${T.bgWarm}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.3s',
                }}>
                    {extracting ? <SpinnerIcon size={20} /> : isUploaded ? <CheckIcon size={20} color={T.success} /> : <UploadIcon size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{doc.label}</p>
                        <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                            color: personColors[doc.person], background: `${personColors[doc.person]}12`,
                            padding: '2px 8px', borderRadius: 6,
                        }}>{personLabels[doc.person]}</span>
                        {doc.required ? (
                            <span style={{ fontSize: 11, color: T.accent, fontWeight: 500 }}>Required</span>
                        ) : (
                            <span style={{ fontSize: 11, color: T.textMut, fontStyle: 'italic' }}>Optional</span>
                        )}
                    </div>
                    <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.4 }}>{doc.desc}</p>
                </div>
                {extracting ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <SpinnerIcon size={14} />
                        <span style={{ fontSize: 13, color: T.warn, fontWeight: 500 }}>Reading document...</span>
                    </div>
                ) : isUploaded ? (
                    <span style={{ fontSize: 13, color: T.success, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckIcon size={14} /> Uploaded</span>
                ) : (
                    <button onClick={handleUpload} style={{
                        ...S.btnPrimary, padding: '10px 24px', fontSize: 13,
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                        <UploadIcon size={14} color="#fff" /> Upload
                    </button>
                )}
            </div>

            {/* Extraction results chip grid */}
            {extraction && extraction.length > 0 && (
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 8,
                    paddingTop: 14, borderTop: `1px solid ${T.bgWarm}`,
                }} className="animate-fade-in">
                    {extraction.map((f, i) => (
                        <div key={i} style={{
                            background: T.bg, borderRadius: 8, padding: '6px 12px',
                            border: `1px solid ${T.bgWarm}`, fontSize: 13,
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <span style={{ color: T.textMut, fontWeight: 500 }}>{f.label}:</span>
                            <span style={{ fontWeight: 600, color: T.text }}>{f.value}</span>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: f.confidence === 'high' ? T.success : T.warn, flexShrink: 0 }} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function GatherProofScreen() {
    const { state, dispatch } = useApp();
    const { chain, documents, client, intake } = state;
    const genCount = chain.generationCount || intake.generationCount || 1;
    const requiredDocs = useMemo(() => getRequiredDocs(genCount, false), [genCount]);
    const [joinedWaitlist, setJoinedWaitlist] = useState(state.waitlistJoined);

    const uploadedRequired = requiredDocs.filter(d => d.required && documents[d.id]).length;
    const totalRequired = requiredDocs.filter(d => d.required).length;
    const allComplete = uploadedRequired === totalRequired;

    const handleUpload = (docId, data) => {
        dispatch({ type: 'UPLOAD_DOC', docId, data });
    };

    const personGroups = [
        { person: 'grandparent', title: 'About Your Grandparent', icon: '👵' },
        { person: 'parent', title: `About Your ${intake.canadianParent === 'mother' ? 'Mother' : intake.canadianParent === 'father' ? 'Father' : 'Canadian Parent'}`, icon: '👤' },
        { person: 'you', title: 'About You', icon: '🙋' },
    ].filter(g => requiredDocs.some(d => d.person === g.person));

    return (
        <div style={{ display: 'flex', gap: 32, maxWidth: 1200, margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 64px)' }}>
            {/* Left: Documents */}
            <div style={{ flex: '0 0 63%', maxWidth: '63%' }}>
                {state.sessionReturned && (
                    <div style={{ background: T.blueBg, borderRadius: T.radiusSm, padding: '12px 18px', marginBottom: 20, fontSize: 14, color: T.blue }} className="animate-fade-in">
                        Welcome back, {client.firstName}. Pick up where you left off.
                    </div>
                )}

                {/* Hero section */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 400, marginBottom: 6 }}>Gather your proof</h1>
                    <p style={{ fontSize: 15, color: T.textSec, lineHeight: 1.5 }}>Start with whichever documents you have handy — there's no required order.</p>
                </div>

                {/* Progress bar */}
                <div style={{
                    background: T.card, borderRadius: T.radius,
                    border: allComplete ? `1.5px solid ${T.success}` : `1px solid ${T.bgWarm}`,
                    padding: '20px 24px', marginBottom: 24,
                    transition: 'all 0.3s',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{uploadedRequired} of {totalRequired} required documents</span>
                        {allComplete && <span style={{ fontSize: 13, color: T.success, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckIcon size={14} /> All received</span>}
                    </div>
                    <div style={{ height: 8, background: T.bgWarm, borderRadius: 4 }}>
                        <div style={{
                            height: 8, borderRadius: 4, width: `${(uploadedRequired / totalRequired) * 100}%`,
                            background: allComplete ? T.success : `linear-gradient(90deg, ${T.accent}, ${T.accentLight})`,
                            transition: 'width 0.6s ease',
                        }} />
                    </div>
                </div>

                {allComplete && (
                    <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'confirm' })} style={{
                        ...S.btnPrimary, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28,
                        width: '100%', justifyContent: 'center', fontSize: 16, padding: '16px 32px',
                    }}>
                        Review Your Application <ArrowRight size={18} />
                    </button>
                )}

                {/* Document sections by person */}
                {personGroups.map(group => (
                    <div key={group.person} style={{ marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <span style={{ fontSize: 20 }}>{group.icon}</span>
                            <h2 style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 400, color: T.text }}>{group.title}</h2>
                        </div>
                        {requiredDocs.filter(d => d.person === group.person).map(doc => (
                            <DocCard key={doc.id} doc={doc} uploaded={documents[doc.id]} onUpload={handleUpload} />
                        ))}
                    </div>
                ))}

                {allComplete && (
                    <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'confirm' })} style={{
                        ...S.btnPrimary, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28,
                        width: '100%', justifyContent: 'center', fontSize: 16, padding: '16px 32px',
                    }}>
                        Review Your Application <ArrowRight size={18} />
                    </button>
                )}

                {/* Missing docs callout — now simpler and cleaner */}
                <div style={{
                    background: T.card, borderRadius: T.radius,
                    border: `1px solid ${T.bgWarm}`, padding: '24px 28px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        <span style={{ fontSize: 24, lineHeight: 1 }}>📂</span>
                        <div>
                            <p style={{ fontWeight: 600, fontSize: 15, color: T.text, marginBottom: 6 }}>Missing a document?</p>
                            <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, marginBottom: 14 }}>
                                Don't have everything right now? No problem — save your progress and come back anytime. We're building a document retrieval service that will locate records on your behalf.
                            </p>
                            {joinedWaitlist ? (
                                <span style={{ fontSize: 13, color: T.success, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckIcon size={14} /> You're on the waitlist!</span>
                            ) : (
                                <button onClick={() => { setJoinedWaitlist(true); dispatch({ type: 'SET_STATE', data: { waitlistJoined: true } }); }} style={{ ...S.btnSecondary, padding: '8px 20px', fontSize: 13 }}>
                                    Join the Document Retrieval Waitlist
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Chain */}
            <div style={{ flex: '0 0 35%', maxWidth: '35%' }}>
                <ChainViz nodes={chain.nodes} documents={documents} requiredDocs={requiredDocs} />
            </div>
        </div>
    );
}
