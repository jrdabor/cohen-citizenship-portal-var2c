import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from './AppContext.jsx';
import { T, S } from './tokens.js';
import { INTAKE_QUESTIONS, getRequiredDocs, getSharedDocs, getApplicantDocs } from './mockData.js';
import { CheckIcon, ArrowRight } from './Icons.jsx';

function isMinorFromDob(dob) {
    if (!dob) return false;
    const d = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age < 18;
}

// Chain Sidebar (right column)
function ChainSidebar({ nodes, isComplete }) {
    return (
        <div style={{ background: T.card, borderRadius: T.radius, border: `1px solid ${T.bgWarm}`, padding: '24px 20px', position: 'sticky', top: 90 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>Chain of Descent</p>
            {nodes.map((node, i) => (
                <div key={node.id} className="animate-fade-in">
                    {i > 0 && <div style={{ width: 2, height: 20, background: isComplete ? T.success : '#ddd', marginLeft: 16, transition: 'background 0.5s' }} />}
                    <div style={{
                        padding: '14px 16px', borderRadius: T.radiusSm, marginBottom: 0,
                        border: node.isAnchor ? `2px solid ${T.success}` : `1px solid ${T.bgWarm}`,
                        background: node.isAnchor ? T.successBg : '#fff',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%', border: `2px solid ${node.isAnchor ? T.success : '#ccc'}`,
                                background: node.isAnchor ? T.success : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                {node.isAnchor && <CheckIcon size={14} color="#fff" />}
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{node.label}</p>
                                <p style={{ fontSize: 13, color: T.textSec }}>{node.sublabel}</p>
                                <p style={{ fontSize: 12, color: T.textMut }}>{node.basis}</p>
                            </div>
                        </div>
                        {node.isAnchor && (
                            <div style={{ marginTop: 8, marginLeft: 38, fontSize: 12, color: T.success, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <CheckIcon size={12} /> Anchor — {node.anchorReason}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {nodes.length === 0 && <p style={{ fontSize: 14, color: T.textMut, fontStyle: 'italic' }}>Your chain will appear as you answer questions...</p>}
        </div>
    );
}

// Typing indicator
function TypingIndicator() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 18px', background: T.card, borderRadius: '16px 16px 16px 4px', border: `1px solid ${T.bgWarm}`, width: 'fit-content', marginBottom: 12 }}>
            <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
        </div>
    );
}

// Eligibility callout
function EligibilityCallout() {
    return (
        <div className="animate-fade-in" style={{ background: T.accentPale, borderRadius: 14, padding: '16px 20px', marginBottom: 16, borderLeft: `4px solid ${T.success}` }}>
            <p style={{ fontSize: 14, color: T.accent, lineHeight: 1.6, fontWeight: 500 }}>
                Under the recent changes to Canada's Citizenship Act, you're eligible for citizenship by descent regardless of how many generations your family lived outside Canada. Let's keep going.
            </p>
        </div>
    );
}

/* ── Applicant Details Form (shown after chain questions for family flows) ── */
function ApplicantDetailsForm({ count, onSubmit, primaryLastName }) {
    const emptyApplicant = () => ({ firstName: '', lastName: primaryLastName || '', dob: '', relationship: 'child' });
    const [applicants, setApplicants] = useState(() => Array.from({ length: count }, emptyApplicant));

    const update = (idx, field, value) => {
        setApplicants(a => a.map((x, i) => i === idx ? { ...x, [field]: value } : x));
    };

    const allFilled = applicants.every(a => a.firstName && a.lastName && a.dob);

    const handleAutofill = () => {
        const demoData = [
            { firstName: 'Diego', lastName: primaryLastName || 'Vasquez', dob: '1995-07-22', relationship: 'sibling' },
            { firstName: 'Sofia', lastName: primaryLastName || 'Vasquez', dob: '2012-11-08', relationship: 'child' },
            { firstName: 'Marco', lastName: primaryLastName || 'Vasquez', dob: '1990-06-15', relationship: 'spouse' },
        ];
        setApplicants(prev =>
            prev.map((_, i) => i < demoData.length ? demoData[i] : emptyApplicant())
        );
    };

    return (
        <div className="animate-fade-in-up" style={{ marginTop: 20, marginBottom: 20 }}>
            <div style={{
                background: T.card, border: `1px solid ${T.bgWarm}`, borderRadius: T.radius,
                padding: '28px 28px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <p style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 4 }}>
                            You mentioned there {count === 1 ? 'is 1 additional applicant' : `are ${count} additional applicants`}. Let's get their details.
                        </p>
                        <p style={{ fontSize: 13, color: T.textMut }}>We'll collect documents for each applicant in the next step.</p>
                    </div>
                    <button type="button" onClick={handleAutofill} style={{
                        background: T.blueBg, color: T.blue, border: `1px solid ${T.blue}33`,
                        borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>
                        ⚡ Autofill
                    </button>
                </div>

                {applicants.map((a, i) => (
                    <div key={i} style={{
                        borderTop: `1px solid ${T.bgWarm}`, paddingTop: 20, marginTop: i > 0 ? 12 : 0, marginBottom: 16,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: T.textMut }}>
                                Applicant {i + 2}
                            </p>
                            {a.dob && isMinorFromDob(a.dob) && (
                                <span style={{ fontSize: 11, fontWeight: 700, color: T.maple, background: `${T.maple}14`, padding: '2px 8px', borderRadius: 4 }}>Minor</span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                            <div style={{ flex: 1 }}>
                                <label style={S.label}>First Name *</label>
                                <input style={S.inputBase} value={a.firstName} onChange={e => update(i, 'firstName', e.target.value)} placeholder="First name" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={S.label}>Last Name *</label>
                                <input style={S.inputBase} value={a.lastName} onChange={e => update(i, 'lastName', e.target.value)} placeholder="Last name" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                                <label style={S.label}>Date of Birth * (YYYY-MM-DD)</label>
                                <input type="date" style={S.inputBase} value={a.dob} onChange={e => update(i, 'dob', e.target.value)} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={S.label}>Relationship</label>
                                <select style={{ ...S.inputBase, cursor: 'pointer' }} value={a.relationship} onChange={e => update(i, 'relationship', e.target.value)}>
                                    <option value="child">Child</option>
                                    <option value="sibling">Sibling</option>
                                    <option value="spouse">Spouse</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => onSubmit(applicants)}
                    disabled={!allFilled}
                    style={{
                        ...S.btnPrimary, width: '100%', marginTop: 8, opacity: allFilled ? 1 : 0.5,
                        cursor: allFilled ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                >
                    Continue <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}

export default function IntakeScreen() {
    const { state, dispatch } = useApp();
    const { intake, client, applicants, additionalApplicantCount } = state;
    const isFamily = applicants.length > 1;
    const hasAdditional = additionalApplicantCount > 0;
    const [isTyping, setIsTyping] = useState(false);
    const [chainNodes, setChainNodes] = useState([]);
    const [showEligibility, setShowEligibility] = useState(false);
    const [currentQ, setCurrentQ] = useState(null);
    const [questionQueue, setQuestionQueue] = useState([]);
    const [showFollowUp, setShowFollowUp] = useState(false);
    const [followUpText, setFollowUpText] = useState('');
    const [showApplicantForm, setShowApplicantForm] = useState(false); // new: show applicant details form
    const [showSummary, setShowSummary] = useState(false);
    const [genCount, setGenCount] = useState(0);
    const [canadianParent, setCanadianParent] = useState('');
    const [hasNameChange, setHasNameChange] = useState(false);
    const chatEndRef = useRef(null);
    const hasInitRef = useRef(false);
    const [chatHistory, setChatHistory] = useState([]);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, []);

    // Route questions based on answers
    const getNextQuestionId = (currentId, answer) => {
        switch (currentId) {
            case 'born_where':
                return answer === 'in_canada' ? 'certificate_preference' : 'which_parent';
            case 'which_parent':
                return 'parent_born';
            case 'parent_born':
                if (answer === 'yes') return 'pre_1977';
                return 'grandparent_status';
            case 'grandparent_status':
                if (answer === 'further') return 'how_far';
                return 'pre_1977';
            case 'how_far':
                return 'pre_1977';
            case 'pre_1977':
                return 'quebec';
            case 'quebec':
                return 'name_changes';
            case 'name_changes':
                return 'section_6_check';
            case 'section_6_check':
                return 'birth_cert_changed';
            case 'birth_cert_changed':
                return 'lived_in_canada';
            case 'lived_in_canada':
                return 'certificate_preference';
            case 'certificate_preference':
                return null; // end
            default:
                return null;
        }
    };

    // Fire first question (guard against React StrictMode double-fire)
    useEffect(() => {
        if (hasInitRef.current) return;
        hasInitRef.current = true;
        showQuestion('born_where');
    }, []);

    const showQuestion = (qId) => {
        const q = INTAKE_QUESTIONS.find(x => x.id === qId);
        if (!q) {
            // Chain questions done — show applicant form if family, otherwise summary
            if (hasAdditional) {
                setShowApplicantForm(true);
            } else {
                setShowSummary(true);
            }
            return;
        }
        setIsTyping(true);
        scrollToBottom();
        setTimeout(() => {
            setIsTyping(false);
            setCurrentQ(q);
            setChatHistory(h => [...h, { type: 'question', ...q }]);
            scrollToBottom();
        }, 700);
    };

    const handleAnswer = (q, option) => {
        // Record answer
        setChatHistory(h => [...h, { type: 'answer', text: option.label, qId: q.id, value: option.value }]);
        setCurrentQ(null);

        // Update chain nodes based on answer
        updateChain(q.id, option.value);

        // Check for follow-up
        if (q.followUp && option.value === q.followUp.condition) {
            setShowFollowUp(true);
            scrollToBottom();
            return;
        }

        // Next question
        const nextId = getNextQuestionId(q.id, option.value);
        if (!nextId) {
            if (hasAdditional) {
                setTimeout(() => setShowApplicantForm(true), 500);
            } else {
                setTimeout(() => setShowSummary(true), 500);
            }
            scrollToBottom();
        } else {
            setTimeout(() => showQuestion(nextId), 300);
        }
    };

    const handleFollowUpSubmit = () => {
        const lastAnswer = chatHistory[chatHistory.length - 1];
        setChatHistory(h => [...h, { type: 'answer', text: followUpText, qId: lastAnswer.qId + '_followup' }]);
        setShowFollowUp(false);

        if (lastAnswer.qId === 'birth_cert_changed') {
            dispatch({ type: 'SET_CLIENT', data: { birthCertChanged: true, birthCertExplanation: followUpText } });
        }
        if (lastAnswer.qId === 'lived_in_canada') {
            dispatch({ type: 'SET_CLIENT', data: { hasLivedInCanada: true, dateEnteredCanada: followUpText } });
        }

        setFollowUpText('');
        const nextId = getNextQuestionId(lastAnswer.qId, lastAnswer.value);
        if (!nextId) {
            if (hasAdditional) {
                setTimeout(() => setShowApplicantForm(true), 500);
            } else {
                setTimeout(() => setShowSummary(true), 500);
            }
        } else {
            setTimeout(() => showQuestion(nextId), 300);
        }
        scrollToBottom();
    };

    const updateChain = (qId, value) => {
        if (qId === 'born_where' && value === 'outside') {
            setChainNodes([{ id: 'you', label: 'You', sublabel: client.firstName || 'You', basis: 'By descent', isAnchor: false }]);
        }
        if (qId === 'born_where' && value === 'in_canada') {
            setChainNodes([{ id: 'you', label: 'You', sublabel: client.firstName || 'You', basis: 'Born in Canada', isAnchor: true, anchorReason: 'Born in Canada' }]);
            setGenCount(0);
        }
        if (qId === 'which_parent') {
            const parentLabel = value === 'mother' ? 'Your Mother' : value === 'father' ? 'Your Father' : 'Your Canadian Parent';
            setCanadianParent(value);
            setChainNodes(n => [...n.filter(x => x.id === 'you'), { id: 'parent', label: parentLabel, sublabel: parentLabel, basis: 'By descent', isAnchor: false }]);
        }
        if (qId === 'parent_born' && value === 'yes') {
            setGenCount(1);
            setChainNodes(n => n.map(x => x.id === 'parent' ? { ...x, basis: 'Born in Canada', isAnchor: true, anchorReason: 'Born in Canada' } : x));
        }
        if (qId === 'parent_born' && (value === 'no' || value === 'unsure')) {
            setChainNodes(n => n.map(x => x.id === 'parent' ? { ...x, basis: 'By descent' } : x));
        }
        if (qId === 'grandparent_status') {
            if (value === 'born' || value === 'naturalized') {
                setGenCount(2);
                setShowEligibility(true);
                const anchorReason = value === 'born' ? 'Born in Canada' : 'Naturalized Canadian';
                setChainNodes(n => [...n, { id: 'grandparent', label: 'Your Grandparent', sublabel: 'Your Grandparent', basis: anchorReason, isAnchor: true, anchorReason }]);
            }
            if (value === 'unsure') {
                setGenCount(2);
                setChainNodes(n => [...n, { id: 'grandparent', label: 'Your Grandparent', sublabel: 'Your Grandparent', basis: 'Status unknown', isAnchor: false }]);
            }
        }
        if (qId === 'how_far') {
            const gc = value === '3' ? 3 : 4;
            setGenCount(gc);
            setShowEligibility(true);
            setChainNodes(n => {
                const base = n.filter(x => x.id !== 'grandparent');
                const extra = [{ id: 'grandparent', label: 'Your Grandparent', sublabel: 'Your Grandparent', basis: 'By descent', isAnchor: false }];
                if (gc >= 3) extra.push({ id: 'great_grandparent', label: 'Great-Grandparent', sublabel: 'Great-Grandparent', basis: 'Born in Canada', isAnchor: true, anchorReason: 'Born in Canada' });
                return [...base, ...extra];
            });
        }
        if (qId === 'name_changes' && value === 'yes') setHasNameChange(true);
        if (qId === 'certificate_preference') {
            dispatch({ type: 'SET_CLIENT', data: { certificateType: value === 'paper' ? 'Paper' : 'Electronic' } });
        }
    };

    // Handle applicant details submission from the form
    const handleApplicantDetailsSubmit = (applicantDetails) => {
        // Build the full applicants array: primary + additional
        const fullApplicants = [
            applicants[0] || {
                id: 'primary', firstName: client.firstName, lastName: client.lastName,
                dob: '', relationship: 'self', isMinor: false, documents: {},
                confirmEdits: {}, reviewFlags: [], status: 'gather',
            },
            ...applicantDetails.map((a, i) => ({
                id: `applicant_${i + 2}`,
                firstName: a.firstName,
                lastName: a.lastName,
                dob: a.dob,
                relationship: a.relationship,
                isMinor: isMinorFromDob(a.dob),
                documents: {},
                confirmEdits: {},
                reviewFlags: [],
                status: 'gather',
            })),
        ];
        dispatch({ type: 'SET_APPLICANTS', data: fullApplicants });
        setShowApplicantForm(false);
        setShowSummary(true);
        scrollToBottom();
    };

    const handleContinue = () => {
        // Store intake results
        const finalGenCount = genCount || 1;
        dispatch({
            type: 'SET_INTAKE',
            data: { isComplete: true, canadianParent, generationCount: finalGenCount },
        });
        dispatch({
            type: 'SET_CHAIN',
            data: { nodes: chainNodes, generationCount: finalGenCount, status: 'incomplete' },
        });
        dispatch({ type: 'SET_SCREEN', screen: 'gather' });
    };

    const requiredDocCount = getRequiredDocs(genCount || 1, hasNameChange).filter(d => d.required).length;

    // Recalculate isFamily after potential applicant form submission
    const currentIsFamily = applicants.length > 1;

    // Family doc count: shared docs + per-applicant docs × number of applicants
    const familyDocCount = currentIsFamily
        ? getSharedDocs(genCount || 1).filter(d => d.required).length + getApplicantDocs().filter(d => d.required).length * applicants.length
        : requiredDocCount;

    return (
        <div style={{ display: 'flex', gap: 32, maxWidth: 1200, margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 64px)' }}>
            {/* Left: Chat */}
            <div style={{ flex: '0 0 63%', maxWidth: '63%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h1 style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 400 }}>Tell us about your family</h1>
                    <button onClick={() => { setChatHistory([]); setChainNodes([]); setCurrentQ(null); setShowSummary(false); setShowApplicantForm(false); setShowEligibility(false); setGenCount(0); setTimeout(() => showQuestion('born_where'), 100); }} style={{ fontSize: 13, color: T.textMut, background: 'none', border: 'none', cursor: 'pointer' }}>↺ Start Over</button>
                </div>

                <div style={{ paddingBottom: 24 }}>
                    {chatHistory.map((item, i) => {
                        if (item.type === 'question') {
                            return (
                                <div key={i} className="animate-fade-in" style={{ marginBottom: 12, maxWidth: '85%' }}>
                                    <div style={{ background: T.card, border: `1px solid ${T.bgWarm}`, borderRadius: '16px 16px 16px 4px', padding: '14px 20px' }}>
                                        <p style={{ fontSize: 15, color: T.text, lineHeight: 1.6 }}>{item.text}</p>
                                        {item.helper && <p style={{ fontSize: 13, color: T.textMut, marginTop: 8, lineHeight: 1.5, fontStyle: 'italic' }}>{item.helper}</p>}
                                    </div>
                                    {/* Show eligibility callout after grandparent_status */}
                                    {item.id === 'grandparent_status' && showEligibility && i < chatHistory.length - 1 && chatHistory[i + 1]?.value !== 'further' &&
                                        <div style={{ marginTop: 12 }}><EligibilityCallout /></div>
                                    }
                                </div>
                            );
                        }
                        if (item.type === 'answer') {
                            return (
                                <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }} className="animate-fade-in">
                                    <div style={{ background: T.accent, color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '10px 20px', fontSize: 15, fontWeight: 500, maxWidth: '70%' }}>
                                        {item.text}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })}

                    {/* Show eligibility after how_far answers */}
                    {showEligibility && chatHistory.length > 0 && chatHistory[chatHistory.length - 1]?.qId === 'how_far' && <EligibilityCallout />}

                    {isTyping && <TypingIndicator />}

                    {/* Active question pills */}
                    {currentQ && !isTyping && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }} className="animate-fade-in">
                            {currentQ.options.map(opt => (
                                <button key={opt.value} onClick={() => handleAnswer(currentQ, opt)} style={{
                                    padding: '10px 20px', borderRadius: 24, border: `1.5px solid ${T.accent}`, background: 'transparent',
                                    color: T.accent, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                    onMouseOver={e => { e.target.style.background = T.accent; e.target.style.color = '#fff'; }}
                                    onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.color = T.accent; }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Follow-up input */}
                    {showFollowUp && (
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }} className="animate-fade-in">
                            <input
                                value={followUpText}
                                onChange={e => setFollowUpText(e.target.value)}
                                placeholder="Type your answer..."
                                onKeyDown={e => e.key === 'Enter' && followUpText && handleFollowUpSubmit()}
                                style={{ ...S.inputBase, flex: 1 }}
                                autoFocus
                            />
                            <button onClick={handleFollowUpSubmit} disabled={!followUpText} style={{ ...S.btnPrimary, padding: '10px 20px', opacity: followUpText ? 1 : 0.5 }}>Continue</button>
                        </div>
                    )}

                    {/* Applicant details form (family flow, shown after chain questions) */}
                    {showApplicantForm && !showSummary && (
                        <ApplicantDetailsForm
                            count={additionalApplicantCount}
                            onSubmit={handleApplicantDetailsSubmit}
                            primaryLastName={client.lastName}
                        />
                    )}

                    {/* Summary card */}
                    {showSummary && (
                        <div className="animate-fade-in-up" style={{ marginTop: 24 }}>
                            <div style={{ background: T.card, border: `2px solid ${T.success}`, borderRadius: T.radius, padding: '28px 28px 24px', boxShadow: '0 4px 24px rgba(26,125,70,0.08)' }}>
                                <p style={{ fontSize: 14, fontWeight: 600, color: T.success, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>✦ Your path to citizenship</p>
                                {chainNodes.map((node, i) => (
                                    <div key={node.id}>
                                        {i > 0 && <div style={{ width: 2, height: 16, background: T.success, marginLeft: 14 }} />}
                                        <div style={{
                                            padding: '12px 16px', borderRadius: T.radiusSm,
                                            border: node.isAnchor ? `2px solid ${T.success}` : `1px solid ${T.bgWarm}`,
                                            background: node.isAnchor ? T.successBg : '#fff', marginBottom: 0,
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${node.isAnchor ? T.success : '#ccc'}`, background: node.isAnchor ? T.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {node.isAnchor && <CheckIcon size={12} color="#fff" />}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 700, fontSize: 14 }}>{node.label}</p>
                                                    <p style={{ fontSize: 12, color: T.textSec }}>{node.basis}</p>
                                                </div>
                                            </div>
                                            {node.isAnchor && (
                                                <p style={{ marginTop: 6, marginLeft: 34, fontSize: 12, color: T.success, fontWeight: 600 }}>✓ Anchor — {node.anchorReason}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div style={{ marginTop: 20, padding: '14px 18px', background: T.accentPale, borderRadius: T.radiusSm }}>
                                    <p style={{ fontSize: 14, color: T.accent, lineHeight: 1.6 }}>
                                        {currentIsFamily ? (
                                            <>Based on what you've told us, <strong>all {applicants.length} applicants</strong> appear to be eligible for Canadian citizenship by descent through your <strong>{canadianParent || 'parent'}</strong>. We'll need <strong>{familyDocCount} documents total</strong> to complete your family's applications — you can upload them at your own pace.</>
                                        ) : (
                                            <>Based on what you've told us, you appear to be eligible for Canadian citizenship by descent through your <strong>{canadianParent || 'parent'}</strong>. We'll need <strong>{requiredDocCount} documents</strong> to verify your chain — you can upload them at your own pace.</>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
                                <button onClick={handleContinue} style={{ ...S.btnPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    Continue to Your Application <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Right: Chain sidebar */}
            <div style={{ flex: '0 0 35%', maxWidth: '35%' }}>
                {!showSummary && <ChainSidebar nodes={chainNodes} isComplete={false} />}
            </div>
        </div>
    );
}
