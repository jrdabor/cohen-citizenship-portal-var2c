import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext.jsx';
import { T, S } from './tokens.js';
import { LeafIcon } from './Icons.jsx';
import SalesScreen from './SalesScreen.jsx';
import WelcomeScreen from './WelcomeScreen.jsx';
import IntakeScreen from './IntakeScreen.jsx';
import GatherProofScreen from './GatherProofScreen.jsx';
import ConfirmScreen from './ConfirmScreen.jsx';
import ReviewScreen from './ReviewScreen.jsx';
import SignSubmitScreen from './SignSubmitScreen.jsx';
import CMDashboard from './CMDashboard.jsx';

const STEPS = [
  { id: 'intake', label: 'Tell Your Story' },
  { id: 'gather', label: 'Gather Proof' },
  { id: 'confirm', label: 'Confirm Details' },
  { id: 'review', label: 'Team Review' },
  { id: 'sign', label: 'Sign & Submit' },
];

function StepBar() {
  const { state, dispatch } = useApp();
  const { screen, intake, chain, review } = state;
  const [showBackModal, setShowBackModal] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);

  const stepOrder = STEPS.map(s => s.id);
  const currentIdx = stepOrder.indexOf(screen);

  const canClick = (stepId) => {
    if (state.mailedForms) return false; // Lock all nav after mailing
    if (screen === 'intake') return false; // No clicking during intake
    if (stepId === 'intake') return false; // Never clickable after completion
    if (screen === 'review' && review.status === 'waiting') return false; // Can't navigate during waiting

    const targetIdx = stepOrder.indexOf(stepId);
    if (targetIdx < 0) return false;

    // Can go forward to confirm if chain complete
    if (stepId === 'confirm' && chain.status !== 'complete' && chain.status !== 'flagged') {
      // Allow if all docs uploaded or already past gather
      if (currentIdx < stepOrder.indexOf('confirm') && Object.keys(state.documents).length === 0) return false;
    }

    // Can go to review only if submitted
    if (stepId === 'review' && review.status === 'none') return false;
    // Can go to sign only if approved
    if (stepId === 'sign' && review.status !== 'approved') return false;

    // Flagged state: can go to gather or confirm
    if (review.status === 'changes_requested' && (stepId === 'gather' || stepId === 'confirm')) return true;

    return true;
  };

  const handleStepClick = (stepId) => {
    if (!canClick(stepId)) return;

    // Back-navigation warning from Confirm to Gather
    if (screen === 'confirm' && stepId === 'gather') {
      setPendingNav(stepId);
      setShowBackModal(true);
      return;
    }

    dispatch({ type: 'SET_SCREEN', screen: stepId });
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {STEPS.map((step, i) => {
          const isActive = screen === step.id;
          const isDone = currentIdx > i || (step.id === 'intake' && intake.isComplete) || state.mailedForms;
          const clickable = canClick(step.id);

          return (
            <React.Fragment key={step.id}>
              {i > 0 && <div style={{ width: 24, height: 1, background: isDone ? T.success : '#ddd' }} />}
              <button
                onClick={() => handleStepClick(step.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 20,
                  border: isActive ? `2px solid ${T.accent}` : `1px solid ${isDone ? T.success : '#ddd'}`,
                  background: isActive ? T.accentPale : isDone ? T.successBg : 'transparent',
                  color: isActive ? T.accent : isDone ? T.success : T.textMut,
                  fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                  cursor: clickable ? 'pointer' : 'default',
                  opacity: clickable || isActive ? 1 : 0.6,
                  transition: 'all 0.2s',
                }}
              >
                {isDone && !isActive && <span style={{ fontSize: 11 }}>✓</span>}
                <span style={{ fontSize: 11, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', background: isActive ? T.accent : 'transparent', color: isActive ? '#fff' : 'inherit', display: isDone && !isActive ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                {step.label}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {showBackModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowBackModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: T.radius, padding: '32px 36px', maxWidth: 460, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} className="animate-fade-in">
            <h3 style={{ ...S.h2, fontSize: 22, marginBottom: 12 }}>Go back to documents?</h3>
            <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.7, marginBottom: 24 }}>
              Going back to upload documents may update fields on your application. Any manual edits you've made will be preserved, but auto-filled fields may change if you upload new documents.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowBackModal(false)} style={{ ...S.btnSecondary, padding: '10px 24px' }}>Stay Here</button>
              <button onClick={() => { setShowBackModal(false); dispatch({ type: 'SET_SCREEN', screen: pendingNav }); }} style={{ ...S.btnPrimary, padding: '10px 24px' }}>Go Back</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Header() {
  const { state, dispatch } = useApp();
  const showStepBar = !['sales', 'welcome'].includes(state.screen) && state.screen !== 'cmDashboard';
  const showHeader = state.screen !== 'sales' && state.screen !== 'cmDashboard';

  if (!showHeader) return null;

  return (
    <header style={{
      background: T.card, borderBottom: `1px solid ${T.bgWarm}`, padding: '10px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LeafIcon size={20} />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Cohen Immigration Law</p>
          <p style={{ fontSize: 11, color: T.textMut }}>Citizenship by Descent Portal</p>
        </div>
      </div>

      {showStepBar && <StepBar />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {state.client.firstName && (
          <span style={{ fontSize: 13, color: T.textSec }}>{state.client.firstName} {state.client.lastName}</span>
        )}
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'cmDashboard' })}
          style={{
            padding: '6px 14px', borderRadius: 8,
            border: `1px solid ${T.bgWarm}`, background: T.bgWarm,
            fontSize: 12, fontWeight: 600, color: T.textSec,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseOver={e => { e.target.style.background = T.accent; e.target.style.color = '#fff'; e.target.style.borderColor = T.accent; }}
          onMouseOut={e => { e.target.style.background = T.bgWarm; e.target.style.color = T.textSec; e.target.style.borderColor = T.bgWarm; }}
        >
          CM Dashboard
        </button>
      </div>
    </header>
  );
}

function AppContent() {
  const { state } = useApp();

  const screens = {
    sales: <SalesScreen />,
    welcome: <WelcomeScreen />,
    intake: <IntakeScreen />,
    gather: <GatherProofScreen />,
    confirm: <ConfirmScreen />,
    review: <ReviewScreen />,
    sign: <SignSubmitScreen />,
    cmDashboard: <CMDashboard />,
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <Header />
      {screens[state.screen] || <WelcomeScreen />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
