import { createContext, useReducer, useContext } from 'react';
import { getRequiredDocs } from './mockData.js';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

const initialState = {
    screen: 'sales', // sales | welcome | intake | gather | confirm | review | sign | cmDashboard
    previousScreen: null,
    client: {
        firstName: '', lastName: '', email: '', phone: '',
        homeAddress: { street: '', unit: '', city: '', provinceState: '', country: '', postalCode: '' },
        mailingAddress: null, mailingSameAsHome: true,
        dob: '', placeOfBirth: '', countryOfBirth: '', gender: '', height: '', eyeColor: '',
        otherNames: '', hasLivedInCanada: false, dateEnteredCanada: '',
        languagePreference: 'English', certificateType: 'Paper', uciNumber: 'NA',
        wantsNameChange: false, birthCertChanged: false, birthCertExplanation: '',
    },
    intake: {
        answers: {},
        currentQuestionIndex: 0,
        chatHistory: [],
        isComplete: false,
        canadianParent: null,
        generationCount: 0,
        showFollowUp: false,
        followUpValue: '',
        showEligibilityCallout: false,
        showSummary: false,
    },
    chain: {
        nodes: [],
        status: 'incomplete',
        generationCount: 0,
    },
    documents: {},
    confirmEdits: {},
    review: {
        status: 'none', // none | checking | waiting | changes_requested | approved
        flags: [],
        checkStep: 0,
    },
    messages: [],
    waitlistJoined: false,
    mailedForms: false,
    sessionReturned: false,
    signingProgress: {
        formsReceived: false,
        submittedToIRCC: false,
        aorReceived: false,
        approved: false,
    },
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_SCREEN': {
            return { ...state, previousScreen: state.screen, screen: action.screen };
        }
        case 'SET_CLIENT': {
            return { ...state, client: { ...state.client, ...action.data } };
        }
        case 'SET_INTAKE': {
            return { ...state, intake: { ...state.intake, ...action.data } };
        }
        case 'ADD_CHAT': {
            return { ...state, intake: { ...state.intake, chatHistory: [...state.intake.chatHistory, action.msg] } };
        }
        case 'SET_CHAIN': {
            return { ...state, chain: { ...state.chain, ...action.data } };
        }
        case 'UPDATE_CHAIN_NODE': {
            const nodes = state.chain.nodes.map(n => n.id === action.id ? { ...n, ...action.data } : n);
            return { ...state, chain: { ...state.chain, nodes } };
        }
        case 'UPLOAD_DOC': {
            const docs = { ...state.documents, [action.docId]: { ...action.data, uploadedAt: new Date().toISOString() } };
            return { ...state, documents: docs };
        }
        case 'SET_CONFIRM_EDIT': {
            return { ...state, confirmEdits: { ...state.confirmEdits, [action.field]: action.value } };
        }
        case 'SET_REVIEW': {
            return { ...state, review: { ...state.review, ...action.data } };
        }
        case 'ADD_MESSAGE': {
            return { ...state, messages: [...state.messages, { ...action.msg, id: Date.now(), createdAt: new Date().toISOString() }] };
        }
        case 'RESOLVE_FLAG': {
            const flags = state.review.flags.map(f => f.id === action.id ? { ...f, status: 'resolved' } : f);
            return { ...state, review: { ...state.review, flags } };
        }
        case 'SET_STATE': {
            return { ...state, ...action.data };
        }
        default:
            return state;
    }
}

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
}
