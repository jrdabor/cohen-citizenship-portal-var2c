import React, { useState, useMemo } from 'react';
import { useApp } from './AppContext.jsx';
import { T, S } from './tokens.js';
import { MOCK_PERSONA, getMockExtraction, getMockExtractionForApplicant } from './mockData.js';
import { CheckIcon, PencilIcon, ArrowRight } from './Icons.jsx';

function EditableField({ label, value, source, onChange, highlight, verify }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value || '');
    const [verified, setVerified] = useState(false);
    const needsInput = !value && !val;

    const save = () => { setEditing(false); setVerified(true); onChange(val); };

    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: `1px solid ${T.bgWarm}`,
            background: needsInput ? T.warnBg : 'transparent',
            marginLeft: needsInput ? -16 : 0, marginRight: needsInput ? -16 : 0,
            borderRadius: needsInput ? 6 : 0,
            transition: 'background 0.3s',
        }}>
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: needsInput ? T.warn : T.textMut, marginBottom: 4, fontWeight: needsInput ? 600 : 400 }}>{label}</p>
                {editing ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input value={val} onChange={e => setVal(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && save()}
                            style={{ ...S.inputBase, padding: '6px 10px', fontSize: 14 }} />
                        <button onClick={save} style={{ fontSize: 12, color: T.accent, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Save</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: 15, fontWeight: 500, color: needsInput ? T.warn : T.text }}>
                            {val || value || '—'}
                        </p>
                        {!needsInput && source && (
                            <span style={{ fontSize: 11, color: T.success, fontWeight: 600, background: T.successBg, padding: '2px 8px', borderRadius: 6 }}>✓ {source}</span>
                        )}
                        {needsInput && (
                            <span style={{ fontSize: 11, color: T.warn, fontWeight: 600, background: '#fff', padding: '2px 8px', borderRadius: 6, border: `1px solid ${T.warn}` }}>✎ Your input needed</span>
                        )}
                        {verify && !verified && !needsInput && (
                            <span style={{ fontSize: 11, color: T.warn, fontWeight: 500, background: T.warnBg, padding: '2px 8px', borderRadius: 6 }}>Please verify</span>
                        )}
                    </div>
                )}
            </div>
            {!editing && (
                <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.6 }}
                    onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.6}>
                    <PencilIcon />
                </button>
            )}
        </div>
    );
}

/* ── Applicant Tab Bar ── */
function ApplicantTabs({ applicants, activeId, onSelect, getNotificationCount }) {
    return (
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: `2px solid ${T.bgWarm}`, paddingBottom: 0 }}>
            {applicants.map(a => {
                const isActive = a.id === activeId;
                const count = getNotificationCount?.(a) || 0;
                return (
                    <button
                        key={a.id}
                        onClick={() => onSelect(a.id)}
                        style={{
                            padding: '10px 20px', fontSize: 14, fontWeight: 600,
                            border: 'none', borderBottom: isActive ? `3px solid ${T.accent}` : '3px solid transparent',
                            background: isActive ? T.accentPale : 'transparent',
                            color: isActive ? T.accent : T.textSec,
                            cursor: 'pointer', borderRadius: '8px 8px 0 0',
                            display: 'flex', alignItems: 'center', gap: 8,
                            transition: 'all 0.2s',
                        }}
                    >
                        {a.firstName}
                        {a.isMinor && <span style={{ fontSize: 10, fontWeight: 700, color: T.maple, background: `${T.maple}12`, padding: '1px 6px', borderRadius: 4 }}>(Minor)</span>}
                        {count > 0 && (
                            <span style={{
                                width: 18, height: 18, borderRadius: '50%', background: T.error,
                                color: '#fff', fontSize: 10, fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>{count}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

export default function ConfirmScreen() {
    const { state, dispatch } = useApp();
    const { client, documents, chain, intake, confirmEdits, applicants, sharedDocuments } = state;
    const isFamily = applicants.length > 1;
    const P = MOCK_PERSONA;
    const genCount = chain.generationCount || 1;

    const [activeTab, setActiveTab] = useState(applicants[0]?.id || 'primary');
    const activeApplicant = applicants.find(a => a.id === activeTab) || applicants[0];

    // Shared edits (parent, grandparent, cert fields)
    const getVal = (field, fallback) => confirmEdits[field] !== undefined ? confirmEdits[field] : fallback;
    const setVal = (field, value) => dispatch({ type: 'SET_CONFIRM_EDIT', field, value });

    // Per-applicant edits
    const getAppVal = (applicant, field, fallback) => {
        const edits = applicant?.confirmEdits || {};
        return edits[field] !== undefined ? edits[field] : fallback;
    };
    const setAppVal = (applicantId, field, value) => {
        dispatch({ type: 'SET_APPLICANT_CONFIRM_EDIT', applicantId, field, value });
    };

    // Get extraction data for a specific applicant (family mode)
    const getApplicantExtraction = (applicant) => {
        if (!isFamily) return null;
        const birthExt = applicant.documents?.birth_cert?.extraction || [];
        const idExt = applicant.documents?.id_1?.extraction || [];
        return { birthExt, idExt };
    };

    // Single-applicant extractions (original)
    const birthExt = documents.applicant_birth_cert?.extraction || [];
    const idExt = documents.applicant_id_1?.extraction || [];
    const parentExt = isFamily ? (sharedDocuments.parent_birth_cert?.extraction || []) : (documents.parent_birth_cert?.extraction || []);
    const marriageExt = isFamily ? (sharedDocuments.parent_marriage_cert?.extraction || []) : (documents.parent_marriage_cert?.extraction || []);
    const gpExt = isFamily ? (sharedDocuments.grandparent_birth_cert?.extraction || []) : (documents.grandparent_birth_cert?.extraction || []);

    const getExtValue = (ext, label) => ext.find(e => e.label === label)?.value || '';

    // Count auto-filled vs manual
    const autoFilled = isFamily
        ? [...Object.values(sharedDocuments), ...applicants.flatMap(a => Object.values(a.documents || {}))].filter(d => d?.extraction?.length > 0).reduce((n, d) => n + d.extraction.length, 0)
        : Object.values(documents).filter(d => d.extraction?.length > 0).reduce((n, d) => n + d.extraction.length, 0);
    const manualCount = Object.keys(confirmEdits).length + (isFamily ? applicants.reduce((s, a) => s + Object.keys(a.confirmEdits || {}).length, 0) : 0);
    const fieldsNeeded = 0;

    // Notification count per applicant (stub — always 0 since fieldsNeeded is hardcoded to 0)
    const getNotificationCount = (applicant) => 0;

    /* ── Render About You card for a single applicant ── */
    const renderAboutYou = (applicant) => {
        if (!isFamily) {
            // Single-applicant: original rendering
            return (
                <div style={{ ...S.card, marginBottom: 20 }} className="animate-fade-in-up">
                    <h2 style={{ ...S.h3, marginBottom: 16 }}>About You</h2>
                    <EditableField label="Full Name" value={getVal('fullName', `${getExtValue(birthExt, 'Given Name(s)') || client.firstName} ${getExtValue(birthExt, 'Surname') || client.lastName}`)} source="Birth cert" onChange={v => setVal('fullName', v)} />
                    <EditableField label="Date of Birth" value={getVal('dob', getExtValue(birthExt, 'Date of Birth') || client.dob)} source="Birth cert" onChange={v => setVal('dob', v)} />
                    <EditableField label="Place of Birth" value={getVal('placeOfBirth', getExtValue(birthExt, 'Place of Birth') || client.placeOfBirth)} source="Birth cert" onChange={v => setVal('placeOfBirth', v)} />
                    <EditableField label="Country of Birth" value={getVal('countryOfBirth', P.applicant.countryOfBirth)} source="Birth cert" onChange={v => setVal('countryOfBirth', v)} />
                    <EditableField label="Gender" value={getVal('gender', getExtValue(birthExt, 'Sex') || client.gender || 'F')} source="Birth cert" onChange={v => setVal('gender', v)} />
                    <EditableField label="Height" value={getVal('height', getExtValue(idExt, 'Height') || client.height)} source={getExtValue(idExt, 'Height') ? "Driver's license" : null} onChange={v => setVal('height', v)} />
                    <EditableField label="Eye Color" value={getVal('eyeColor', getExtValue(idExt, 'Eye Color') || client.eyeColor)} source={getExtValue(idExt, 'Eye Color') ? "Driver's license" : null} onChange={v => setVal('eyeColor', v)} />
                    <EditableField label="Other Names Used" value={getVal('otherNames', '')} onChange={v => setVal('otherNames', v)} />
                    <EditableField label="Email" value={getVal('email', client.email)} source="Sales" onChange={v => setVal('email', v)} />
                    <EditableField label="Phone" value={getVal('phone', client.phone)} source="Sales" onChange={v => setVal('phone', v)} />
                    <EditableField label="Home Address" value={getVal('homeAddr', `${client.homeAddress.street}${client.homeAddress.unit ? ', ' + client.homeAddress.unit : ''}, ${client.homeAddress.city}, ${client.homeAddress.provinceState} ${client.homeAddress.postalCode}`)} source="Sales" onChange={v => setVal('homeAddr', v)} />
                    <EditableField label="Birth Certificate Changed/Replaced?" value={getVal('birthCertChanged', client.birthCertChanged ? 'Yes' : 'No')} source="Intake" onChange={v => setVal('birthCertChanged', v)} />
                    {(client.birthCertChanged || getVal('birthCertChanged', '') === 'Yes') && (
                        <EditableField label="Birth Certificate Explanation" value={getVal('birthCertExplanation', client.birthCertExplanation)} source="Intake" onChange={v => setVal('birthCertExplanation', v)} />
                    )}
                    <EditableField label="Lived in Canada?" value={getVal('livedInCanada', client.hasLivedInCanada ? 'Yes' : 'No')} source="Intake" onChange={v => setVal('livedInCanada', v)} />
                </div>
            );
        }

        // Family mode: per-applicant About You
        const ext = getApplicantExtraction(applicant);
        const aBirthExt = ext?.birthExt || [];
        const aIdExt = ext?.idExt || [];
        const isPrimary = applicant.id === 'primary';

        return (
            <div style={{ ...S.card, marginBottom: 20 }} className="animate-fade-in-up" key={applicant.id + '-about'}>
                <h2 style={{ ...S.h3, marginBottom: 16 }}>About {isPrimary ? 'You' : applicant.firstName}</h2>
                {applicant.isMinor && (
                    <div style={{ background: T.blueBg, borderRadius: T.radiusSm, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: T.blue }}>
                        This application is being completed by a parent/guardian on behalf of a minor (under 18).
                    </div>
                )}
                <EditableField label="Full Name" value={getAppVal(applicant, 'fullName', `${getExtValue(aBirthExt, 'Given Name(s)') || applicant.firstName} ${getExtValue(aBirthExt, 'Surname') || applicant.lastName}`)} source="Birth cert" onChange={v => setAppVal(applicant.id, 'fullName', v)} />
                <EditableField label="Date of Birth" value={getAppVal(applicant, 'dob', getExtValue(aBirthExt, 'Date of Birth') || applicant.dob)} source="Birth cert" onChange={v => setAppVal(applicant.id, 'dob', v)} />
                <EditableField label="Place of Birth" value={getAppVal(applicant, 'placeOfBirth', getExtValue(aBirthExt, 'Place of Birth') || (isPrimary ? P.applicant.placeOfBirth : 'Los Angeles, California'))} source="Birth cert" onChange={v => setAppVal(applicant.id, 'placeOfBirth', v)} />
                <EditableField label="Country of Birth" value={getAppVal(applicant, 'countryOfBirth', 'United States')} source="Birth cert" onChange={v => setAppVal(applicant.id, 'countryOfBirth', v)} />
                <EditableField label="Gender" value={getAppVal(applicant, 'gender', getExtValue(aBirthExt, 'Sex') || (applicant.firstName === 'Diego' ? 'M' : 'F'))} source="Birth cert" onChange={v => setAppVal(applicant.id, 'gender', v)} />
                <EditableField label="Height" value={getAppVal(applicant, 'height', getExtValue(aIdExt, 'Height') || '')} source={getExtValue(aIdExt, 'Height') ? "Photo ID" : null} onChange={v => setAppVal(applicant.id, 'height', v)} />
                <EditableField label="Eye Color" value={getAppVal(applicant, 'eyeColor', getExtValue(aIdExt, 'Eye Color') || '')} source={getExtValue(aIdExt, 'Eye Color') ? "Photo ID" : null} onChange={v => setAppVal(applicant.id, 'eyeColor', v)} />
                <EditableField label="Other Names Used" value={getAppVal(applicant, 'otherNames', '')} onChange={v => setAppVal(applicant.id, 'otherNames', v)} />
                {isPrimary && (
                    <>
                        <EditableField label="Email" value={getAppVal(applicant, 'email', client.email)} source="Sales" onChange={v => setAppVal(applicant.id, 'email', v)} />
                        <EditableField label="Phone" value={getAppVal(applicant, 'phone', client.phone)} source="Sales" onChange={v => setAppVal(applicant.id, 'phone', v)} />
                        <EditableField label="Home Address" value={getAppVal(applicant, 'homeAddr', `${client.homeAddress.street}${client.homeAddress.unit ? ', ' + client.homeAddress.unit : ''}, ${client.homeAddress.city}, ${client.homeAddress.provinceState} ${client.homeAddress.postalCode}`)} source="Sales" onChange={v => setAppVal(applicant.id, 'homeAddr', v)} />
                    </>
                )}
            </div>
        );
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
            <h1 style={{ ...S.h1, fontSize: 36, marginBottom: 8 }}>Confirm your application</h1>
            <p style={{ fontSize: 16, color: T.textSec, marginBottom: 8, lineHeight: 1.6 }}>
                We've pre-filled most of your application from your documents. Review the details below and fill in anything we've marked.
            </p>
            <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
                <span style={{ fontSize: 13, color: T.success, fontWeight: 600, background: T.successBg, padding: '4px 12px', borderRadius: 8 }}>
                    {autoFilled} fields auto-filled
                </span>
                <span style={{ fontSize: 13, color: T.warn, fontWeight: 600, background: T.warnBg, padding: '4px 12px', borderRadius: 8 }}>
                    {fieldsNeeded} field{fieldsNeeded !== 1 ? 's' : ''} need{fieldsNeeded === 1 ? 's' : ''} your input
                </span>
            </div>

            {/* Family tabs */}
            {isFamily && (
                <ApplicantTabs
                    applicants={applicants}
                    activeId={activeTab}
                    onSelect={setActiveTab}
                    getNotificationCount={getNotificationCount}
                />
            )}

            {/* Card 1: About You (per-applicant) */}
            {isFamily ? renderAboutYou(activeApplicant) : renderAboutYou(null)}

            {/* Card 2: Canadian Parent (shared) */}
            <div style={{ ...S.card, marginBottom: 20 }} className="animate-fade-in-up">
                <h2 style={{ ...S.h3, marginBottom: 16 }}>About Your {intake.canadianParent === 'mother' ? 'Mother' : intake.canadianParent === 'father' ? 'Father' : 'Canadian Parent'}</h2>
                <EditableField label="Full Name" value={getVal('parentName', getExtValue(parentExt, 'Full Name') || P.canadianParent.fullName)} source="Birth cert" onChange={v => setVal('parentName', v)} />
                <EditableField label="Other Names (maiden name, etc.)" value={getVal('parentOtherNames', P.canadianParent.maidenName || '')} onChange={v => setVal('parentOtherNames', v)} />
                <EditableField label="Date of Birth" value={getVal('parentDob', getExtValue(parentExt, 'Date of Birth') || P.canadianParent.dob)} source="Birth cert" onChange={v => setVal('parentDob', v)} />
                <EditableField label="Place of Birth" value={getVal('parentPlaceOfBirth', getExtValue(parentExt, 'Place of Birth') || P.canadianParent.placeOfBirth)} source="Birth cert" onChange={v => setVal('parentPlaceOfBirth', v)} />
                <EditableField label="Country of Birth" value={getVal('parentCountry', P.canadianParent.countryOfBirth)} source="Birth cert" onChange={v => setVal('parentCountry', v)} />
                <EditableField label="Birth Cert Registration #" value={getVal('parentRegNum', getExtValue(parentExt, 'Registration #') || P.canadianParent.registrationNumber)} source="Birth cert" onChange={v => setVal('parentRegNum', v)} verify />
                <EditableField label="Relationship to You" value={getVal('parentRelationship', 'Biological parent')} source="Default" onChange={v => setVal('parentRelationship', v)} />
                <EditableField label="How They Became Canadian" value={getVal('parentCitMethod', P.canadianParent.citizenshipMethod)} source="Auto-derived" onChange={v => setVal('parentCitMethod', v)} />
                <EditableField label="Date of Marriage" value={getVal('parentMarriageDate', getExtValue(marriageExt, 'Date of Marriage') || P.canadianParent.marriageDate)} source={isFamily ? (sharedDocuments.parent_marriage_cert ? 'Marriage cert' : null) : (documents.parent_marriage_cert ? 'Marriage cert' : null)} onChange={v => setVal('parentMarriageDate', v)} />
                <EditableField label="Place of Marriage" value={getVal('parentMarriagePlace', getExtValue(marriageExt, 'Place of Marriage') || P.canadianParent.marriagePlace)} source={isFamily ? (sharedDocuments.parent_marriage_cert ? 'Marriage cert' : null) : (documents.parent_marriage_cert ? 'Marriage cert' : null)} onChange={v => setVal('parentMarriagePlace', v)} />
                <EditableField label="Date of Death" value={getVal('parentDeathDate', '')} onChange={v => setVal('parentDeathDate', v)} />
            </div>

            {/* Card 3: Non-Canadian Parent (shared) */}
            <div style={{ ...S.card, marginBottom: 20 }} className="animate-fade-in-up">
                <h2 style={{ ...S.h3, marginBottom: 16 }}>About Your {intake.canadianParent === 'mother' ? 'Father' : 'Mother'}</h2>
                <EditableField label="Full Name" value={getVal('ncParentName', P.nonCanadianParent.fullName)} source="Your birth cert" onChange={v => setVal('ncParentName', v)} />
                <EditableField label="Other Names" value={getVal('ncParentOther', '')} onChange={v => setVal('ncParentOther', v)} />
                <EditableField label="Date of Birth" value={getVal('ncParentDob', P.nonCanadianParent.dob)} onChange={v => setVal('ncParentDob', v)} />
                <EditableField label="Country of Birth" value={getVal('ncParentCountry', P.nonCanadianParent.countryOfBirth)} onChange={v => setVal('ncParentCountry', v)} />
                <EditableField label="Citizenship Status" value={getVal('ncParentCit', 'Not a Canadian citizen')} source="Pre-set" onChange={v => setVal('ncParentCit', v)} />
                <EditableField label="Relationship to You" value={getVal('ncParentRel', 'Biological parent')} source="Default" onChange={v => setVal('ncParentRel', v)} />
                <EditableField label="Date of Marriage" value={getVal('ncParentMarriage', getVal('parentMarriageDate', P.canadianParent.marriageDate))} source="Auto-synced" onChange={v => setVal('ncParentMarriage', v)} />
                <EditableField label="Date of Death" value={getVal('ncParentDeath', '')} onChange={v => setVal('ncParentDeath', v)} />
            </div>

            {/* Card 4: Grandparent (if 2+ gen, shared) */}
            {genCount >= 2 && (
                <div style={{ ...S.card, marginBottom: 20 }} className="animate-fade-in-up">
                    <h2 style={{ ...S.h3, marginBottom: 16 }}>About Your Grandparent</h2>
                    <EditableField label="Full Name" value={getVal('gpName', getExtValue(gpExt, 'Full Name') || P.maternalGrandmother.fullName)} source="Birth cert" onChange={v => setVal('gpName', v)} />
                    <EditableField label="Other Names" value={getVal('gpOther', '')} onChange={v => setVal('gpOther', v)} />
                    <EditableField label="Date of Birth" value={getVal('gpDob', getExtValue(gpExt, 'Date of Birth') || P.maternalGrandmother.dob)} source="Birth cert" onChange={v => setVal('gpDob', v)} />
                    <EditableField label="Country of Birth" value={getVal('gpCountry', P.maternalGrandmother.countryOfBirth)} source="Birth cert" onChange={v => setVal('gpCountry', v)} />
                    <EditableField label="Birth Cert Registration #" value={getVal('gpRegNum', getExtValue(gpExt, 'Registration #') || P.maternalGrandmother.registrationNumber)} source="Birth cert" onChange={v => setVal('gpRegNum', v)} verify />
                    <EditableField label="How Obtained Citizenship" value={getVal('gpCitMethod', P.maternalGrandmother.citizenshipMethod)} source="Auto-derived" onChange={v => setVal('gpCitMethod', v)} />
                    <EditableField label="Date of Death" value={getVal('gpDeath', '')} onChange={v => setVal('gpDeath', v)} />
                </div>
            )}

            {/* Card 5: Certificate & Rep (shared) */}
            <div style={{ ...S.card, marginBottom: 20 }} className="animate-fade-in-up">
                <h2 style={{ ...S.h3, marginBottom: 16 }}>Your Certificate & Representative</h2>
                <EditableField label="Certificate Type" value={getVal('certType', client.certificateType || 'Paper')} source="Intake" onChange={v => setVal('certType', v)} />
                <EditableField label="Language" value={getVal('language', 'English')} source="Default" onChange={v => setVal('language', v)} />
                <div style={{ padding: '12px 0', borderBottom: `1px solid ${T.bgWarm}` }}>
                    <p style={{ fontSize: 13, color: T.textMut, marginBottom: 4 }}>Representative</p>
                    <p style={{ fontSize: 15, fontWeight: 500, color: T.text }}>Olivia Cohen, Cohen Immigration Law</p>
                    <span style={{ fontSize: 11, color: T.textMut, fontStyle: 'italic' }}>Read-only</span>
                </div>
                <div style={{ background: T.blueBg, borderRadius: T.radiusSm, padding: '12px 16px', marginTop: 16 }}>
                    <p style={{ fontSize: 13, color: T.blue, lineHeight: 1.5 }}>
                        Once you appoint a representative, all government correspondence will be directed to Cohen Immigration Law, not to you directly. We will keep you updated at every step through this portal.
                    </p>
                </div>
            </div>

            {/* Pre-submit checklist */}
            <div style={{ ...S.card, marginBottom: 24 }}>
                <h3 style={{ ...S.h3, marginBottom: 16 }}>Pre-Submission Checklist</h3>
                {[
                    { label: 'All required documents uploaded', ok: true },
                    { label: 'Chain of descent verified', ok: true },
                    { label: isFamily ? 'All applicants\' details confirmed' : 'Application details confirmed', ok: fieldsNeeded === 0 },
                ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: item.ok ? T.successBg : T.warnBg, border: `1px solid ${item.ok ? T.success : T.warn}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.ok ? <CheckIcon size={12} /> : <span style={{ fontSize: 11, color: T.warn }}>—</span>}
                        </div>
                        <span style={{ fontSize: 14, color: item.ok ? T.text : T.warn }}>{item.label}</span>
                    </div>
                ))}
                <p style={{ fontSize: 13, color: T.textMut, marginTop: 12 }}>
                    {autoFilled} fields auto-filled from your documents. {manualCount} fields completed by you.{isFamily ? ` Across all ${applicants.length} applicants.` : ''}
                </p>
            </div>

            <button onClick={() => {
                dispatch({ type: 'SET_REVIEW', data: { status: 'checking', checkStep: 0 } });
                dispatch({ type: 'SET_SCREEN', screen: 'review' });
            }} disabled={fieldsNeeded > 0} style={{
                ...S.btnPrimary, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 17,
                opacity: fieldsNeeded > 0 ? 0.5 : 1,
                cursor: fieldsNeeded > 0 ? 'not-allowed' : 'pointer',
            }}>
                Submit for Review <ArrowRight size={20} />
            </button>
            {fieldsNeeded > 0 && (
                <p style={{ fontSize: 13, color: T.warn, textAlign: 'center', marginTop: 10 }}>
                    Complete all required fields to continue.
                </p>
            )}
            {fieldsNeeded === 0 && (
                <p style={{ fontSize: 13, color: T.textMut, textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
                    Your application will be reviewed by your Case Manager before anything is sent to the government. You will have a chance to make corrections if needed.
                </p>
            )}
        </div>
    );
}
