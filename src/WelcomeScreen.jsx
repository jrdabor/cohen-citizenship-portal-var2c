import React from 'react';
import { useApp } from './AppContext.jsx';
import { T, S } from './tokens.js';
import { LeafIcon, ChatIcon, UploadIcon, ShieldIcon, ArrowRight } from './Icons.jsx';

export default function WelcomeScreen() {
    const { state, dispatch } = useApp();
    const name = state.client.firstName || 'there';

    const steps = [
        { icon: <ChatIcon size={22} color={T.accent} />, title: 'Tell us your story', desc: 'A few questions to map your path to citizenship. ~5 minutes.' },
        { icon: <UploadIcon size={22} color={T.accent} />, title: 'Upload your documents', desc: 'Birth certificates, IDs, and family records — at your own pace.' },
        { icon: <ShieldIcon size={22} color={T.accent} />, title: 'Review and submit', desc: 'Our team reviews everything, you sign, we handle the rest.' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <div style={{ maxWidth: 700, width: '100%', textAlign: 'center' }} className="animate-fade-in-up">
                {/* Logo */}
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 16, background: T.accent, marginBottom: 28 }}>
                    <LeafIcon size={32} color="#fff" />
                </div>

                {/* Welcome badge */}
                <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: T.warn, background: T.warnBg, padding: '6px 16px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        ★ Welcome, {name}
                    </span>
                </div>

                {/* Hero */}
                <h1 style={{ ...S.h1, fontSize: 48, marginBottom: 16 }}>Trace your family's connection to Canada</h1>
                <p style={{ fontSize: 18, color: T.textSec, lineHeight: 1.6, maxWidth: 560, margin: '0 auto 40px' }}>
                    As a Canadian citizen by descent, you already hold citizenship — this application provides the official proof. We'll handle the paperwork.
                </p>

                {/* Steps card */}
                <div style={{ ...S.card, textAlign: 'left', padding: '32px 36px', marginBottom: 32 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: T.textMut, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24 }}>What to expect</p>
                    {steps.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: 18, alignItems: 'flex-start', padding: '18px 0', borderTop: i ? `1px solid ${T.bgWarm}` : 'none' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: T.accentPale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {step.icon}
                            </div>
                            <div>
                                <p style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 4 }}>{step.title}</p>
                                <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.5 }}>{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <button
                    onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'intake' })}
                    style={{ ...S.btnPrimary, fontSize: 18, padding: '18px 48px', display: 'inline-flex', alignItems: 'center', gap: 10 }}
                >
                    Begin Your Application <ArrowRight size={20} />
                </button>
                <p style={{ fontSize: 14, color: T.textMut, marginTop: 14 }}>Most clients finish in about 20 minutes</p>

                {/* Info callout */}
                <div style={{ marginTop: 36, padding: '16px 24px', borderRadius: T.radiusSm, background: T.blueBg, border: `1px solid ${T.blue}22`, textAlign: 'left' }}>
                    <p style={{ fontSize: 14, color: T.blue, lineHeight: 1.6 }}>
                        💡 Have your birth certificate and any family documents nearby. Don't have everything? No problem — you can always come back and add more later.
                    </p>
                </div>
            </div>
        </div>
    );
}
