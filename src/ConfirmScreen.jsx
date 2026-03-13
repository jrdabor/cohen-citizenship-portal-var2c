import React, { useState, useMemo } from 'react';
import { useApp } from './AppContext.jsx';
import { T, S } from './tokens.js';
import { MOCK_PERSONA, getMockExtraction } from './mockData.js';
import { CheckIcon, PencilIcon, ArrowRight } from './Icons.jsx';

function EditableField({ label, value, source, onChange, highlight, verify }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value || '');
    const needsInput = !value && !val;

    const save = () => { setEditing(false); onChange(val); };

    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${T.bgWarm}` }}>
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: T.textMut, marginBottom: 4 }}>{label}</p>
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
                            <span style={{ fontSize: 11, color: T.warn, fontWeight: 600, background: T.warnBg, padding: '2px 8px', borderRadius: 6 }}>✎ Your input needed</span>
                        )}
                        {verify && !needsInput && (
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

export default function ConfirmScreen() {
    const { state, dispatch } = useApp();
    const { client, documents, chain, intake, confirmEdits } = state;
    const P = MOCK_PERSONA;
    const genCount = chain.generationCount || 1;

    const getVal = (field, fallback) => confirmEdits[field] !== undefined ? confirmEdits[field] : fallback;
    const setVal = (field, value) => dispatch({ type: 'SET_CONFIRM_EDIT', field, value });

    // Count auto-filled vs manual
    const autoFilled = Object.values(documents).filter(d => d.extraction?.length > 0)
        .reduce((n, d) => n + d.extraction.length, 0);
    const manualCount = Object.keys(confirmEdits).length;

    const birthExt = documents.applicant_birth_cert?.extraction || [];
    const idExt = documents.applicant_id_1?.extraction || [];
    const parentExt = documents.parent_birth_cert?.extraction || [];
    const marriageExt = documents.parent_marriage_cert?.extraction || [];
    const gpExt = documents.grandparent_birth_cert?.extraction || [];

    const getExtValue = (ext, label) => ext.find(e => e.label === label)?.value || '';

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
                    {Math.max(0, 8 - manualCount)} fields need your input
                </span>
            </div>

            {/* Card 1: About You */}
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

            {/* Card 2: Canadian Parent */}
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
                <EditableField label="Date of Marriage" value={getVal('parentMarriageDate', getExtValue(marriageExt, 'Date of Marriage') || P.canadianParent.marriageDate)} source={documents.parent_marriage_cert ? 'Marriage cert' : null} onChange={v => setVal('parentMarriageDate', v)} />
                <EditableField label="Place of Marriage" value={getVal('parentMarriagePlace', getExtValue(marriageExt, 'Place of Marriage') || P.canadianParent.marriagePlace)} source={documents.parent_marriage_cert ? 'Marriage cert' : null} onChange={v => setVal('parentMarriagePlace', v)} />
                <EditableField label="Date of Death" value={getVal('parentDeathDate', '')} onChange={v => setVal('parentDeathDate', v)} />
            </div>

            {/* Card 3: Non-Canadian Parent */}
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

            {/* Card 4: Grandparent (if 2+ gen) */}
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

            {/* Card 5: Certificate & Rep */}
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
                    { label: 'Application details confirmed', ok: true },
                ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: T.successBg, border: `1px solid ${T.success}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckIcon size={12} />
                        </div>
                        <span style={{ fontSize: 14, color: T.text }}>{item.label}</span>
                    </div>
                ))}
                <p style={{ fontSize: 13, color: T.textMut, marginTop: 12 }}>
                    {autoFilled} of {autoFilled + 8} fields auto-filled from your documents. {manualCount} fields completed by you.
                </p>
            </div>

            <button onClick={() => {
                dispatch({ type: 'SET_REVIEW', data: { status: 'checking', checkStep: 0 } });
                dispatch({ type: 'SET_SCREEN', screen: 'review' });
            }} style={{ ...S.btnPrimary, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 17 }}>
                Submit for Review <ArrowRight size={20} />
            </button>
            <p style={{ fontSize: 13, color: T.textMut, textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
                Your application will be reviewed by your Case Manager before anything is sent to the government. You will have a chance to make corrections if needed.
            </p>
        </div>
    );
}
