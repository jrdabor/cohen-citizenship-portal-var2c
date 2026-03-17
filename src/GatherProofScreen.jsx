import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from './AppContext.jsx';
import { T, S } from './tokens.js';
import { getRequiredDocs, getSharedDocs, getApplicantDocs, getMockExtraction, getMockExtractionForApplicant } from './mockData.js';
import { CheckIcon, UploadIcon, WarningIcon, SpinnerIcon, ArrowRight } from './Icons.jsx';

/* ── Chain Visualization ─────────────────────────── */

function ChainViz({ nodes, documents, requiredDocs, isFamily, applicants, sharedDocuments }) {
    const [wasComplete, setWasComplete] = React.useState(false);
    const [celebrateIndex, setCelebrateIndex] = React.useState(-1);

    // Single-applicant node status (original)
    const getNodeStatus = (personType) => {
        const personDocs = requiredDocs.filter(d => d.person === personType && d.required);
        if (personDocs.length === 0) return 'complete';
        const uploaded = personDocs.filter(d => documents[d.id]);
        if (uploaded.length === 0) return 'empty';
        if (uploaded.length === personDocs.length) return 'complete';
        return 'partial';
    };

    // Family mode: shared node status
    const getSharedNodeStatus = (personType) => {
        if (!isFamily) return getNodeStatus(personType);
        const sharedDocs = getSharedDocs(nodes.length >= 3 ? 2 : 1);
        const personDocs = sharedDocs.filter(d => d.person === personType && d.required);
        if (personDocs.length === 0) return 'complete';
        const uploaded = personDocs.filter(d => sharedDocuments[d.id]);
        if (uploaded.length === 0) return 'empty';
        if (uploaded.length === personDocs.length) return 'complete';
        return 'partial';
    };

    // Family mode: per-applicant node status
    const getApplicantNodeStatus = (applicant) => {
        const docs = getApplicantDocs(applicant);
        const required = docs.filter(d => d.required);
        if (required.length === 0) return 'complete';
        const uploaded = required.filter(d => applicant.documents?.[d.id]);
        if (uploaded.length === 0) return 'empty';
        if (uploaded.length === required.length) return 'complete';
        return 'partial';
    };

    const getApplicantDocProgress = (applicant) => {
        const docs = getApplicantDocs(applicant);
        const required = docs.filter(d => d.required);
        const uploaded = required.filter(d => applicant.documents?.[d.id]);
        return { uploaded: uploaded.length, total: required.length };
    };

    const personMap = { you: 'you', parent: 'parent', grandparent: 'grandparent', great_grandparent: 'grandparent' };

    // For family: check if all shared + all applicant nodes are complete
    const allComplete = isFamily
        ? nodes.filter(n => n.id !== 'you').every(n => {
            const pt = personMap[n.id] || n.id;
            return getSharedNodeStatus(pt) === 'complete';
        }) && applicants.every(a => getApplicantNodeStatus(a) === 'complete')
        : nodes.every(n => {
            const pt = personMap[n.id] || n.id;
            return getNodeStatus(pt) === 'complete';
        });

    React.useEffect(() => {
        if (allComplete && !wasComplete) {
            setWasComplete(true);
            const totalNodes = isFamily ? nodes.filter(n => n.id !== 'you').length + applicants.length : nodes.length;
            for (let i = 0; i < totalNodes; i++) {
                setTimeout(() => setCelebrateIndex(i), i * 200);
            }
            setTimeout(() => setCelebrateIndex(-1), totalNodes * 200 + 600);
        } else if (!allComplete) {
            setWasComplete(false);
        }
    }, [allComplete]);

    // Shared node rendering (parent, grandparent etc)
    const sharedNodes = isFamily ? nodes.filter(n => n.id !== 'you') : nodes;

    return (
        <div style={{ background: T.card, borderRadius: T.radius, border: `1px solid ${T.bgWarm}`, padding: '24px 20px', position: 'sticky', top: 90 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>Chain of Descent</p>
            {allComplete && (
                <div className="chain-verified-banner" style={{
                    background: T.successBg, border: `1.5px solid ${T.success}`,
                    borderRadius: T.radiusSm, padding: '12px 16px', marginBottom: 16, textAlign: 'center',
                }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: T.success }}>✓ {isFamily ? "Your family's" : 'Your'} chain of descent is verified!</p>
                </div>
            )}

            {/* Shared nodes (rendered top-to-bottom, reversed for descent order) */}
            {sharedNodes.map((node, i) => {
                const pt = personMap[node.id] || node.id;
                const status = isFamily ? getSharedNodeStatus(pt) : getNodeStatus(pt);
                const personDocList = isFamily
                    ? getSharedDocs(nodes.length >= 3 ? 2 : 1).filter(d => d.person === pt && d.required)
                    : requiredDocs.filter(d => d.person === pt && d.required);
                const uploadedCount = personDocList.filter(d => isFamily ? sharedDocuments[d.id] : documents[d.id]).length;
                const isCelebrating = celebrateIndex === i;
                const prevStatus = i > 0
                    ? (isFamily ? getSharedNodeStatus(personMap[sharedNodes[i - 1].id] || sharedNodes[i - 1].id) : getNodeStatus(personMap[sharedNodes[i - 1].id] || sharedNodes[i - 1].id))
                    : null;
                const connectorSolid = prevStatus === 'complete' && status === 'complete';

                return (
                    <div key={node.id}>
                        {i > 0 && (
                            <div style={{
                                width: connectorSolid ? 3 : 2, height: 24, marginLeft: 16,
                                background: connectorSolid ? T.success : 'transparent',
                                borderLeft: connectorSolid ? 'none' : `2px dashed #ccc`,
                                transition: 'all 0.5s ease',
                            }} />
                        )}
                        <div style={{
                            padding: '14px 16px', borderRadius: T.radiusSm,
                            border: status === 'empty' ? `2px dashed #ccc` : status === 'complete' ? `2px solid ${T.success}` : `2px solid ${T.warn}`,
                            background: status === 'complete' ? T.successBg : status === 'partial' ? T.warnBg : 'transparent',
                            transition: 'all 0.4s ease',
                            transform: isCelebrating ? 'scale(1.03)' : 'scale(1)',
                            boxShadow: isCelebrating ? `0 0 12px rgba(26,125,70,0.25)` : status === 'complete' ? `0 1px 4px rgba(26,125,70,0.08)` : 'none',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    border: status === 'complete' ? `2.5px solid ${T.success}` : status === 'partial' ? `2.5px solid ${T.warn}` : `2px dashed #ccc`,
                                    background: status === 'complete' ? T.success : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.3s',
                                }}>
                                    {status === 'complete' && <CheckIcon size={14} color="#fff" />}
                                    {status === 'partial' && <span style={{ fontSize: 10, fontWeight: 700, color: T.warn }}>…</span>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 700, fontSize: 14, color: status === 'empty' ? T.textMut : T.text }}>{node.label}</p>
                                    <p style={{ fontSize: 12, color: status === 'complete' ? T.success : T.textSec, fontWeight: status === 'complete' ? 500 : 400 }}>{node.basis}</p>
                                </div>
                            </div>
                            {personDocList.length > 0 && (
                                <div style={{ marginLeft: 38 }}>
                                    <div style={{ height: 5, background: status === 'empty' ? '#eee' : `${T.bgWarm}`, borderRadius: 3, marginTop: 4 }}>
                                        <div style={{
                                            height: 5, borderRadius: 3,
                                            width: `${(uploadedCount / personDocList.length) * 100}%`,
                                            background: status === 'complete' ? T.success : `linear-gradient(90deg, ${T.warn}, ${T.warn})`,
                                            transition: 'width 0.5s ease',
                                        }} />
                                    </div>
                                    <p style={{ fontSize: 11, color: status === 'complete' ? T.success : T.textMut, marginTop: 4, fontWeight: status === 'complete' ? 600 : 400 }}>{uploadedCount}/{personDocList.length} docs</p>
                                </div>
                            )}
                            {node.isAnchor && status === 'complete' && (
                                <p style={{ marginTop: 6, marginLeft: 38, fontSize: 11, color: T.success, fontWeight: 700, letterSpacing: 0.5 }}>✓ ANCHOR — Born in Canada</p>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Family: horizontal applicant badges below chain */}
            {isFamily && (
                <>
                    <div style={{ borderTop: `1px solid ${T.bgWarm}`, marginTop: 16, paddingTop: 16 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: T.textMut, marginBottom: 10 }}>Applicants</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {applicants.map((applicant) => {
                                const appStatus = getApplicantNodeStatus(applicant);
                                const progress = getApplicantDocProgress(applicant);
                                const bgColor = appStatus === 'complete' ? T.successBg : appStatus === 'partial' ? T.warnBg : T.bg;
                                const borderColor = appStatus === 'complete' ? T.success : appStatus === 'partial' ? T.warn : '#ccc';
                                const textColor = appStatus === 'complete' ? T.success : appStatus === 'partial' ? T.warn : T.textMut;

                                return (
                                    <div key={applicant.id} style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '6px 12px', borderRadius: 20,
                                        border: `1.5px solid ${borderColor}`, background: bgColor,
                                        transition: 'all 0.3s',
                                    }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: appStatus === 'empty' ? T.textMut : T.text }}>{applicant.firstName}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: textColor }}>{progress.uploaded}/{progress.total}</span>
                                        {applicant.isMinor && (
                                            <span style={{ fontSize: 9, fontWeight: 700, color: T.maple, background: `${T.maple}14`, padding: '1px 6px', borderRadius: 4 }}>Minor</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/* ── Document Card ─────────────────────────── */

function DocCard({ doc, uploaded, onUpload }) {
    const [extracting, setExtracting] = useState(false);
    const [extraction, setExtraction] = useState(uploaded?.extraction || null);
    const personColors = { you: T.blue, parent: T.warn, grandparent: T.success, minor: T.maple };
    const personLabels = { you: 'YOU', parent: 'PARENT', grandparent: 'GRANDPARENT', minor: 'MINOR' };

    const handleUpload = () => {
        setExtracting(true);
        setTimeout(() => {
            const ext = doc._getExtraction ? doc._getExtraction() : getMockExtraction(doc.id);
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
                            color: personColors[doc.person] || T.blue, background: `${personColors[doc.person] || T.blue}12`,
                            padding: '2px 8px', borderRadius: 6,
                        }}>{personLabels[doc.person] || doc.person?.toUpperCase()}</span>
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

/* ── Main Screen ─────────────────────────── */

export default function GatherProofScreen() {
    const { state, dispatch } = useApp();
    const { chain, documents, client, intake, applicants, sharedDocuments } = state;
    const isFamily = applicants.length > 1;
    const genCount = chain.generationCount || intake.generationCount || 1;
    const requiredDocs = useMemo(() => getRequiredDocs(genCount, false), [genCount]);
    const sharedDocs = useMemo(() => getSharedDocs(genCount), [genCount]);
    const [joinedWaitlist, setJoinedWaitlist] = useState(state.waitlistJoined);

    // Single-applicant progress
    const uploadedRequired = requiredDocs.filter(d => d.required && documents[d.id]).length;
    const totalRequired = requiredDocs.filter(d => d.required).length;

    // Family progress
    const sharedUploaded = sharedDocs.filter(d => d.required && sharedDocuments[d.id]).length;
    const sharedTotal = sharedDocs.filter(d => d.required).length;
    const perApplicantDocs = getApplicantDocs();
    const perApplicantTotal = perApplicantDocs.filter(d => d.required).length;
    const familyPerApplicantUploaded = applicants.reduce((sum, a) => sum + perApplicantDocs.filter(d => d.required && a.documents?.[d.id]).length, 0);
    const familyPerApplicantTotal = perApplicantTotal * applicants.length;
    const familyTotalUploaded = sharedUploaded + familyPerApplicantUploaded;
    const familyTotalRequired = sharedTotal + familyPerApplicantTotal;

    const allComplete = isFamily
        ? familyTotalUploaded === familyTotalRequired
        : uploadedRequired === totalRequired;

    const handleUpload = (docId, data) => {
        dispatch({ type: 'UPLOAD_DOC', docId, data });
    };

    const handleSharedUpload = (docId, data) => {
        dispatch({ type: 'UPLOAD_SHARED_DOC', docId, data });
    };

    const handleApplicantUpload = (applicantId, docId, data) => {
        dispatch({ type: 'UPLOAD_APPLICANT_DOC', applicantId, docId, data });
    };

    // Single-applicant person groups (original layout)
    const personGroups = [
        { person: 'you', title: 'About You', icon: '🙋' },
        { person: 'parent', title: `About Your ${intake.canadianParent === 'mother' ? 'Mother' : intake.canadianParent === 'father' ? 'Father' : 'Canadian Parent'}`, icon: '👤' },
        { person: 'grandparent', title: 'About Your Grandparent', icon: '👵' },
    ].filter(g => requiredDocs.some(d => d.person === g.person));

    // Family shared doc groups
    const sharedGroups = [
        { person: 'parent', title: `About Your ${intake.canadianParent === 'mother' ? 'Mother' : intake.canadianParent === 'father' ? 'Father' : 'Canadian Parent'}`, icon: '👤' },
        { person: 'grandparent', title: 'About Your Grandparent', icon: '👵' },
    ].filter(g => sharedDocs.some(d => d.person === g.person));

    const progressUploaded = isFamily ? familyTotalUploaded : uploadedRequired;
    const progressTotal = isFamily ? familyTotalRequired : totalRequired;

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
                        <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>
                            {progressUploaded} of {progressTotal} required documents
                            {isFamily && <span style={{ fontSize: 13, fontWeight: 400, color: T.textMut }}> ({sharedUploaded} shared, {familyPerApplicantUploaded} per-applicant)</span>}
                        </span>
                        {allComplete && <span style={{ fontSize: 13, color: T.success, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckIcon size={14} /> All received</span>}
                    </div>
                    <div style={{ height: 8, background: T.bgWarm, borderRadius: 4 }}>
                        <div style={{
                            height: 8, borderRadius: 4, width: `${(progressUploaded / progressTotal) * 100}%`,
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

                {/* ── FAMILY MODE ── */}
                {isFamily ? (
                    <>
                        {/* Zone 1: Shared Family Documents */}
                        <div style={{ marginBottom: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <span style={{ fontSize: 20 }}>👨‍👩‍👧</span>
                                <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 400, color: T.text }}>Shared Family Documents</h2>
                            </div>
                            <p style={{ fontSize: 13, color: T.textMut, marginBottom: 16, marginLeft: 34 }}>These documents apply to all applicants</p>

                            {sharedGroups.map(group => (
                                <div key={group.person} style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                        <span style={{ fontSize: 20 }}>{group.icon}</span>
                                        <h3 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 400, color: T.text }}>{group.title}</h3>
                                    </div>
                                    {sharedDocs.filter(d => d.person === group.person).map(doc => (
                                        <DocCard key={doc.id} doc={doc} uploaded={sharedDocuments[doc.id]} onUpload={handleSharedUpload} />
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Zone 2: Per-Applicant Documents */}
                        {applicants.map(applicant => {
                            const appDocs = getApplicantDocs(applicant);
                            return (
                                <div key={applicant.id} style={{ marginBottom: 32 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                        <span style={{ fontSize: 20 }}>🙋</span>
                                        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 400, color: T.text }}>
                                            {applicant.firstName}'s Documents
                                        </h2>
                                        {applicant.isMinor && (
                                            <span style={{ fontSize: 11, fontWeight: 700, color: T.maple, background: `${T.maple}14`, padding: '2px 10px', borderRadius: 6 }}>Minor</span>
                                        )}
                                    </div>
                                    {appDocs.map(doc => {
                                        // Attach per-applicant extraction function
                                        const docWithExtraction = {
                                            ...doc,
                                            _getExtraction: () => getMockExtractionForApplicant(doc.id, applicant),
                                        };
                                        return (
                                            <DocCard
                                                key={doc.id}
                                                doc={docWithExtraction}
                                                uploaded={applicant.documents?.[doc.id]}
                                                onUpload={(docId, data) => handleApplicantUpload(applicant.id, docId, data)}
                                            />
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </>
                ) : (
                    /* ── SINGLE APPLICANT MODE (unchanged) ── */
                    <>
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
                    </>
                )}

                {allComplete && (
                    <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'confirm' })} style={{
                        ...S.btnPrimary, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28,
                        width: '100%', justifyContent: 'center', fontSize: 16, padding: '16px 32px',
                    }}>
                        Review Your Application <ArrowRight size={18} />
                    </button>
                )}

                {/* Missing docs callout */}
                <div style={{
                    background: T.card, borderRadius: T.radius,
                    border: `1px solid ${T.bgWarm}`, padding: '24px 28px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        <span style={{ fontSize: 24, lineHeight: 1 }}>📂</span>
                        <div>
                            <p style={{ fontWeight: 600, fontSize: 15, color: T.text, marginBottom: 6 }}>Having trouble tracking down a document?</p>
                            <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, marginBottom: 14 }}>
                                Locating old birth certificates, citizenship records, or vital documents — especially from decades ago — can be challenging. We're building a document retrieval service to do the heavy lifting for you.
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
                <ChainViz
                    nodes={chain.nodes}
                    documents={documents}
                    requiredDocs={requiredDocs}
                    isFamily={isFamily}
                    applicants={applicants}
                    sharedDocuments={sharedDocuments}
                />
            </div>
        </div>
    );
}
