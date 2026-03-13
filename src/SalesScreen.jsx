import React, { useState } from 'react';
import { useApp } from './AppContext.jsx';
import { T, S } from './tokens.js';

export default function SalesScreen() {
    const { dispatch } = useApp();
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        street: '', unit: '', city: '', provinceState: '', country: 'United States', postalCode: '',
        mailingSame: true, mailStreet: '', mailUnit: '', mailCity: '', mailState: '', mailCountry: '', mailPostal: '',
        cardNumber: '', cardExpiry: '', cardCvv: '',
    });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const canSubmit = form.firstName && form.lastName && form.email && form.phone && form.street && form.city && form.provinceState && form.postalCode;

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch({
            type: 'SET_CLIENT',
            data: {
                firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone,
                homeAddress: { street: form.street, unit: form.unit, city: form.city, provinceState: form.provinceState, country: form.country, postalCode: form.postalCode },
                mailingAddress: form.mailingSame ? null : { street: form.mailStreet, unit: form.mailUnit, city: form.mailCity, provinceState: form.mailState, country: form.mailCountry, postalCode: form.mailPostal },
                mailingSameAsHome: form.mailingSame,
            },
        });
        dispatch({ type: 'SET_SCREEN', screen: 'welcome' });
    };

    const inputStyle = { ...S.inputBase, marginBottom: 0 };
    const rowStyle = { display: 'flex', gap: 12 };
    const fieldStyle = { flex: 1, marginBottom: 16 };

    return (
        <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 500 }} className="animate-fade-in-up">
                {/* Agent badge */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: T.textMut, background: T.bgWarm, padding: '6px 16px', borderRadius: 20 }}>Sales Agent View</span>
                </div>

                <div style={{ ...S.card, padding: '36px 36px 28px' }}>
                    <h1 style={{ ...S.h2, textAlign: 'center', marginBottom: 8 }}>New Client Intake</h1>
                    <p style={{ textAlign: 'center', color: T.textSec, fontSize: 15, marginBottom: 28 }}>Collect client information and payment</p>

                    {/* Line item */}
                    <div style={{ background: T.accentPale, borderRadius: T.radiusSm, padding: '14px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: T.accent }}>Citizenship by Descent Application</span>
                        <span style={{ fontSize: 18, fontWeight: 700, color: T.accent }}>$1,500.00 USD</span>
                    </div>

                    <button type="button" onClick={() => setForm({
                        firstName: 'Iliana', lastName: 'Vasquez', email: 'iliana@email.com', phone: '(310) 555-0147',
                        street: '1842 Sunset Boulevard', unit: 'Apt 4B', city: 'Los Angeles', provinceState: 'California', country: 'United States', postalCode: '90026',
                        mailingSame: true, mailStreet: '', mailUnit: '', mailCity: '', mailState: '', mailCountry: '', mailPostal: '',
                        cardNumber: '4242 4242 4242 4242', cardExpiry: '12 / 28', cardCvv: '123',
                    })} style={{
                        background: T.blueBg, color: T.blue, border: `1px solid ${T.blue}33`,
                        borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', marginBottom: 20, display: 'block', width: '100%',
                    }}>
                        ⚡ Autofill for Demo
                    </button>

                    {/* Name */}
                    <div style={rowStyle}>
                        <div style={fieldStyle}>
                            <label style={S.label}>First Name *</label>
                            <input style={inputStyle} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Iliana" />
                        </div>
                        <div style={fieldStyle}>
                            <label style={S.label}>Last Name *</label>
                            <input style={inputStyle} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Vasquez" />
                        </div>
                    </div>

                    {/* Contact */}
                    <div style={rowStyle}>
                        <div style={fieldStyle}>
                            <label style={S.label}>Email *</label>
                            <input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="iliana@email.com" />
                        </div>
                        <div style={fieldStyle}>
                            <label style={S.label}>Phone *</label>
                            <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(310) 555-0147" />
                        </div>
                    </div>

                    {/* Home Address */}
                    <div style={{ marginBottom: 4 }}>
                        <label style={{ ...S.label, fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 12 }}>Home Address</label>
                    </div>
                    <div style={fieldStyle}>
                        <label style={S.label}>Street *</label>
                        <input style={inputStyle} value={form.street} onChange={e => set('street', e.target.value)} placeholder="1842 Sunset Boulevard" />
                    </div>
                    <div style={rowStyle}>
                        <div style={fieldStyle}>
                            <label style={S.label}>Unit</label>
                            <input style={inputStyle} value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="Apt 4B" />
                        </div>
                        <div style={fieldStyle}>
                            <label style={S.label}>City *</label>
                            <input style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Los Angeles" />
                        </div>
                    </div>
                    <div style={rowStyle}>
                        <div style={fieldStyle}>
                            <label style={S.label}>State / Province *</label>
                            <input style={inputStyle} value={form.provinceState} onChange={e => set('provinceState', e.target.value)} placeholder="California" />
                        </div>
                        <div style={fieldStyle}>
                            <label style={S.label}>Country</label>
                            <input style={inputStyle} value={form.country} onChange={e => set('country', e.target.value)} />
                        </div>
                        <div style={fieldStyle}>
                            <label style={S.label}>ZIP / Postal *</label>
                            <input style={inputStyle} value={form.postalCode} onChange={e => set('postalCode', e.target.value)} placeholder="90026" />
                        </div>
                    </div>

                    {/* Mailing */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: form.mailingSame ? 24 : 16, cursor: 'pointer', fontSize: 14, color: T.textSec }}>
                        <input type="checkbox" checked={form.mailingSame} onChange={e => set('mailingSame', e.target.checked)} style={{ width: 16, height: 16, accentColor: T.accent }} />
                        Mailing address is the same as home address
                    </label>

                    {!form.mailingSame && (
                        <div style={{ marginBottom: 24, paddingLeft: 8, borderLeft: `2px solid ${T.bgWarm}` }} className="animate-fade-in">
                            <label style={{ ...S.label, fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 12 }}>Mailing Address</label>
                            <div style={fieldStyle}><label style={S.label}>Street *</label><input style={inputStyle} value={form.mailStreet} onChange={e => set('mailStreet', e.target.value)} /></div>
                            <div style={rowStyle}>
                                <div style={fieldStyle}><label style={S.label}>Unit</label><input style={inputStyle} value={form.mailUnit} onChange={e => set('mailUnit', e.target.value)} /></div>
                                <div style={fieldStyle}><label style={S.label}>City *</label><input style={inputStyle} value={form.mailCity} onChange={e => set('mailCity', e.target.value)} /></div>
                            </div>
                            <div style={rowStyle}>
                                <div style={fieldStyle}><label style={S.label}>State *</label><input style={inputStyle} value={form.mailState} onChange={e => set('mailState', e.target.value)} /></div>
                                <div style={fieldStyle}><label style={S.label}>Country</label><input style={inputStyle} value={form.mailCountry} onChange={e => set('mailCountry', e.target.value)} /></div>
                                <div style={fieldStyle}><label style={S.label}>ZIP *</label><input style={inputStyle} value={form.mailPostal} onChange={e => set('mailPostal', e.target.value)} /></div>
                            </div>
                        </div>
                    )}

                    {/* Payment */}
                    <div style={{ marginBottom: 4 }}>
                        <label style={{ ...S.label, fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 12 }}>Payment Information</label>
                    </div>
                    <div style={fieldStyle}>
                        <label style={S.label}>Card Number</label>
                        <input style={inputStyle} value={form.cardNumber} onChange={e => set('cardNumber', e.target.value)} placeholder="4242 4242 4242 4242" />
                    </div>
                    <div style={rowStyle}>
                        <div style={fieldStyle}>
                            <label style={S.label}>Expiry</label>
                            <input style={inputStyle} value={form.cardExpiry} onChange={e => set('cardExpiry', e.target.value)} placeholder="MM / YY" />
                        </div>
                        <div style={fieldStyle}>
                            <label style={S.label}>CVV</label>
                            <input style={inputStyle} value={form.cardCvv} onChange={e => set('cardCvv', e.target.value)} placeholder="123" />
                        </div>
                    </div>

                    <button type="submit" disabled={!canSubmit} style={{ ...S.btnPrimary, width: '100%', marginTop: 8, opacity: canSubmit ? 1 : 0.5 }}>
                        Pay $1,500.00 USD
                    </button>
                </div>
            </form>
        </div>
    );
}
