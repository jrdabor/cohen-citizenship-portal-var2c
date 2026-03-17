export const MOCK_PERSONA = {
    applicant: {
        firstName: 'Iliana', lastName: 'Vasquez', email: 'iliana.vasquez@email.com',
        phone: '(310) 555-0147',
        homeAddress: { street: '1842 Sunset Boulevard', unit: 'Apt 4B', city: 'Los Angeles', provinceState: 'California', country: 'United States', postalCode: '90026' },
        dob: '1992-03-15', placeOfBirth: 'Los Angeles, California', countryOfBirth: 'United States',
        gender: 'F', height: "5'7\"", eyeColor: 'Brown',
    },
    canadianParent: {
        fullName: 'Maria Elena Torres Vasquez', maidenName: 'Torres',
        dob: '1965-04-22', placeOfBirth: 'Toronto, Ontario', countryOfBirth: 'Canada',
        registrationNumber: '1965-091-022891',
        marriageDate: 'September 14, 1988', marriagePlace: 'Toronto, Ontario',
        citizenshipStatus: 'canadian_born', citizenshipMethod: 'Born in Canada',
    },
    nonCanadianParent: {
        fullName: 'Carlos Andres Vasquez', dob: '1963-08-10',
        placeOfBirth: 'Bogotá', countryOfBirth: 'Colombia',
        citizenshipStatus: 'non_canadian',
    },
    maternalGrandmother: {
        fullName: 'Lucia Diaz', dob: '1940-05-17',
        placeOfBirth: 'Toronto, Ontario', countryOfBirth: 'Canada',
        registrationNumber: '1940-091-114502', citizenshipStatus: 'canadian_born',
        citizenshipMethod: 'Born in Canada',
    },
    maternalGrandfather: {
        fullName: 'Roberto Carlos Torres', dob: '1938-11-03',
        placeOfBirth: 'Havana', countryOfBirth: 'Cuba',
        citizenshipStatus: 'naturalized', citizenshipMethod: 'Naturalized Canadian',
        citizenshipCertNumber: 'N-4822-1958', dateOfDeath: '2019-02-14',
    },
};

export const INTAKE_QUESTIONS = [
    {
        id: 'born_where', text: "Let's start with the basics — where were you born?",
        options: [
            { label: 'Outside Canada', value: 'outside' },
            { label: 'In Canada', value: 'in_canada' },
        ],
    },
    {
        id: 'which_parent', text: 'Which parent do you believe has Canadian citizenship or Canadian ancestry?',
        options: [
            { label: 'My mother', value: 'mother' },
            { label: 'My father', value: 'father' },
            { label: 'Both parents', value: 'both' },
            { label: "I'm not sure", value: 'unknown' },
        ],
    },
    {
        id: 'parent_born', text: 'Was your Canadian parent born in Canada?',
        options: [
            { label: 'Yes, born in Canada', value: 'yes' },
            { label: 'No, born outside Canada', value: 'no' },
            { label: "I'm not sure", value: 'unsure' },
        ],
    },
    {
        id: 'grandparent_status',
        text: 'Was one of your grandparents born in Canada, or did they become a Canadian citizen?',
        helper: "This includes grandparents who were born in Canada or who became Canadian citizens through naturalization (immigration).",
        options: [
            { label: 'Yes, born in Canada', value: 'born' },
            { label: 'Yes, naturalized as Canadian', value: 'naturalized' },
            { label: 'The connection goes further back', value: 'further' },
            { label: "I'm not sure", value: 'unsure' },
        ],
    },
    {
        id: 'how_far', text: 'Do you know how far back your first Canadian ancestor was?',
        options: [
            { label: 'Great-grandparent (3 generations)', value: '3' },
            { label: '4 or more generations', value: '4plus' },
            { label: "I'm not sure — I need help", value: 'unsure' },
        ],
    },
    {
        id: 'pre_1977',
        text: 'Did any ancestor in your Canadian line become a citizen of another country before February 15, 1977?',
        helper: "Before 1977, acquiring foreign citizenship could cause the loss of Canadian status. This is important for your application.",
        options: [
            { label: 'No, or not that I know of', value: 'no' },
            { label: 'Yes', value: 'yes' },
            { label: "I'm not sure", value: 'unsure' },
        ],
    },
    {
        id: 'quebec',
        text: 'Was any ancestor in your Canadian line born in the province of Quebec?',
        helper: "Quebec birth certificates issued before January 1, 1994 are not accepted by the Canadian government. A replacement certificate may be required.",
        options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
            { label: "I'm not sure", value: 'unsure' },
        ],
    },
    {
        id: 'name_changes',
        text: 'Have you or any ancestor in the chain legally changed their name?',
        helper: "This includes name changes through marriage, divorce, court order, or any other legal process.",
        options: [
            { label: 'No', value: 'no' },
            { label: 'Yes', value: 'yes' },
        ],
    },
    {
        id: 'section_6_check',
        text: 'Would you like a different name, date of birth, or gender to appear on your citizenship certificate than what\'s on your birth certificate?',
        helper: "Your certificate will normally show the details from your birth certificate.",
        options: [
            { label: 'No, my birth certificate details are fine', value: 'no' },
            { label: 'Yes, I\'d like changes', value: 'yes' },
        ],
    },
    {
        id: 'birth_cert_changed',
        text: 'Was your birth certificate ever changed, amended, or replaced?',
        helper: "For example, amended to include a step-parent, reissued by the government, etc. A standard certified copy does not count as changed.",
        options: [
            { label: 'No, it\'s the original record (or a standard certified copy)', value: 'no' },
            { label: 'Yes', value: 'yes' },
        ],
        followUp: { condition: 'yes', type: 'text', prompt: 'Please briefly describe why your birth certificate was changed:' },
    },
    {
        id: 'lived_in_canada', text: 'Have you ever lived in Canada?',
        options: [
            { label: 'No', value: 'no' },
            { label: 'Yes', value: 'yes' },
        ],
        followUp: { condition: 'yes', type: 'date', prompt: 'When did you first move to Canada?' },
    },
    {
        id: 'certificate_preference',
        text: 'Would you prefer a paper certificate or an electronic certificate?',
        helper: "Paper certificates are mailed to addresses in Canada or the US. Electronic certificates are delivered as a PDF via email.",
        options: [
            { label: 'Paper certificate', value: 'paper' },
            { label: 'Electronic certificate', value: 'electronic' },
        ],
    },
];

// Original single-applicant doc list (unchanged for backward compat)
export function getRequiredDocs(genCount, hasNameChange) {
    const docs = [
        { id: 'applicant_birth_cert', label: 'Your birth certificate', desc: 'Certified copy of your birth certificate', person: 'you', required: true },
        { id: 'applicant_id_1', label: 'Photo ID (primary)', desc: "Driver's license or government-issued photo ID", person: 'you', required: true },
        { id: 'applicant_id_2', label: 'Photo ID (secondary)', desc: 'Passport or second government-issued ID', person: 'you', required: true },
        { id: 'parent_birth_cert', label: "Parent's birth certificate", desc: 'Certified copy of your Canadian parent\'s birth certificate', person: 'parent', required: true },
        { id: 'parent_marriage_cert', label: "Parents' marriage certificate", desc: 'If parents were married', person: 'parent', required: false },
    ];
    if (genCount >= 2) {
        docs.push(
            { id: 'grandparent_birth_cert', label: "Grandparent's birth certificate", desc: 'Certified copy of your grandparent\'s birth certificate or citizenship certificate', person: 'grandparent', required: true },
            { id: 'grandparent_marriage_cert', label: "Grandparent's marriage certificate", desc: 'If applicable', person: 'grandparent', required: false },
        );
    }
    if (hasNameChange) {
        docs.push({ id: 'name_change_doc', label: 'Name change document', desc: 'Legal name change certificate or court order', person: 'you', required: true });
    }
    return docs;
}

// Family mode: shared docs (parent/grandparent docs uploaded once for the family)
export function getSharedDocs(genCount) {
    const docs = [
        { id: 'parent_birth_cert', label: "Parent's birth certificate", desc: "Certified copy of your Canadian parent's birth certificate", person: 'parent', required: true },
        { id: 'parent_marriage_cert', label: "Parents' marriage certificate", desc: 'If parents were married', person: 'parent', required: false },
    ];
    if (genCount >= 2) {
        docs.push(
            { id: 'grandparent_birth_cert', label: "Grandparent's birth certificate", desc: "Certified copy of your grandparent's birth certificate or citizenship certificate", person: 'grandparent', required: true },
            { id: 'grandparent_marriage_cert', label: "Grandparent's marriage certificate", desc: 'If applicable', person: 'grandparent', required: false },
        );
    }
    return docs;
}

// Family mode: per-applicant docs (each person needs their own)
export function getApplicantDocs(applicant) {
    const isMinor = applicant?.isMinor;
    return [
        { id: 'birth_cert', label: isMinor ? 'Birth certificate' : 'Your birth certificate', desc: 'Certified copy of birth certificate', person: isMinor ? 'minor' : 'you', required: true },
        { id: 'id_1', label: 'Photo ID (primary)', desc: "Driver's license or government-issued photo ID", person: isMinor ? 'minor' : 'you', required: true },
        { id: 'id_2', label: 'Photo ID (secondary)', desc: 'Passport or second government-issued ID', person: isMinor ? 'minor' : 'you', required: true },
    ];
}

// Original single-applicant mock extraction (unchanged)
export function getMockExtraction(docId) {
    const P = MOCK_PERSONA;
    const map = {
        applicant_birth_cert: [
            { label: 'Surname', value: P.applicant.lastName, confidence: 'high' },
            { label: 'Given Name(s)', value: P.applicant.firstName, confidence: 'high' },
            { label: 'Date of Birth', value: P.applicant.dob, confidence: 'high' },
            { label: 'Place of Birth', value: P.applicant.placeOfBirth, confidence: 'high' },
            { label: 'Sex', value: P.applicant.gender, confidence: 'high' },
            { label: 'Parent 1', value: P.canadianParent.fullName, confidence: 'medium' },
            { label: 'Parent 2', value: P.nonCanadianParent.fullName, confidence: 'medium' },
        ],
        applicant_id_1: [
            { label: 'Full Name', value: `${P.applicant.firstName} ${P.applicant.lastName}`, confidence: 'high' },
            { label: 'Date of Birth', value: P.applicant.dob, confidence: 'high' },
            { label: 'Height', value: P.applicant.height, confidence: 'high' },
            { label: 'Eye Color', value: P.applicant.eyeColor, confidence: 'high' },
            { label: 'Expiry', value: '2028-03-15', confidence: 'high' },
        ],
        applicant_id_2: [
            { label: 'Full Name', value: `${P.applicant.firstName} ${P.applicant.lastName}`, confidence: 'high' },
            { label: 'Date of Birth', value: P.applicant.dob, confidence: 'high' },
            { label: 'Nationality', value: 'United States', confidence: 'high' },
            { label: 'Expiry', value: '2029-06-20', confidence: 'high' },
        ],
        parent_birth_cert: [
            { label: 'Full Name', value: 'Maria Elena Torres', confidence: 'high' },
            { label: 'Date of Birth', value: P.canadianParent.dob, confidence: 'high' },
            { label: 'Place of Birth', value: P.canadianParent.placeOfBirth, confidence: 'high' },
            { label: 'Registration #', value: P.canadianParent.registrationNumber, confidence: 'high' },
        ],
        parent_marriage_cert: [
            { label: 'Party 1', value: 'Maria Elena Torres', confidence: 'high' },
            { label: 'Party 2', value: P.nonCanadianParent.fullName, confidence: 'high' },
            { label: 'Date of Marriage', value: P.canadianParent.marriageDate, confidence: 'high' },
            { label: 'Place of Marriage', value: P.canadianParent.marriagePlace, confidence: 'high' },
        ],
        grandparent_birth_cert: [
            { label: 'Full Name', value: P.maternalGrandmother.fullName, confidence: 'high' },
            { label: 'Date of Birth', value: P.maternalGrandmother.dob, confidence: 'high' },
            { label: 'Place of Birth', value: P.maternalGrandmother.placeOfBirth, confidence: 'high' },
            { label: 'Registration #', value: P.maternalGrandmother.registrationNumber, confidence: 'high' },
        ],
        grandparent_marriage_cert: [
            { label: 'Party 1', value: P.maternalGrandmother.fullName, confidence: 'high' },
            { label: 'Party 2', value: P.maternalGrandfather.fullName, confidence: 'high' },
            { label: 'Date', value: 'June 3, 1959', confidence: 'medium' },
        ],
        name_change_doc: [
            { label: 'Previous Name', value: 'N/A', confidence: 'medium' },
            { label: 'New Name', value: 'N/A', confidence: 'medium' },
        ],
    };
    return map[docId] || [];
}

// Family mode: per-applicant mock extraction (uses applicant's own name/DOB)
export function getMockExtractionForApplicant(docId, applicant) {
    if (!applicant) return [];
    const P = MOCK_PERSONA;
    const firstName = applicant.firstName || 'Applicant';
    const lastName = applicant.lastName || 'Unknown';
    const dob = applicant.dob || '';

    const map = {
        birth_cert: [
            { label: 'Surname', value: lastName, confidence: 'high' },
            { label: 'Given Name(s)', value: firstName, confidence: 'high' },
            { label: 'Date of Birth', value: dob, confidence: 'high' },
            { label: 'Place of Birth', value: applicant.isMinor ? 'Los Angeles, California' : 'Los Angeles, California', confidence: 'high' },
            { label: 'Sex', value: applicant.isMinor ? 'F' : (firstName === 'Diego' ? 'M' : 'F'), confidence: 'high' },
            { label: 'Parent 1', value: P.canadianParent.fullName, confidence: 'medium' },
            { label: 'Parent 2', value: P.nonCanadianParent.fullName, confidence: 'medium' },
        ],
        id_1: [
            { label: 'Full Name', value: `${firstName} ${lastName}`, confidence: 'high' },
            { label: 'Date of Birth', value: dob, confidence: 'high' },
            { label: 'Height', value: applicant.isMinor ? "4'11\"" : (firstName === 'Diego' ? "5'10\"" : "5'7\""), confidence: 'high' },
            { label: 'Eye Color', value: 'Brown', confidence: 'high' },
            { label: 'Expiry', value: '2028-06-15', confidence: 'high' },
        ],
        id_2: [
            { label: 'Full Name', value: `${firstName} ${lastName}`, confidence: 'high' },
            { label: 'Date of Birth', value: dob, confidence: 'high' },
            { label: 'Nationality', value: 'United States', confidence: 'high' },
            { label: 'Expiry', value: '2029-06-20', confidence: 'high' },
        ],
    };
    return map[docId] || [];
}
