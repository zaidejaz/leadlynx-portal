export interface Lead {
    id: string;
    leadId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    emailAddress: string | null;
    propertyAddress: string;
    city: string;
    state: string;
    zipCode: string;
    isHomeOwner: boolean;
    propertyValue: number;
    hasRealtorContract: boolean;
    status: string;
    submissionDate: string;
    assignments: LeadAssignment[];
    recording?: string;
    bedrooms?: number;
    bathrooms?: number;
    comments?: string;
}

export interface Realtor {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    agentCode: string;
    brokerage: string;
    state: string;
    centralZipCode: string;
    radius: number;
    signUpCategory: string;
    zipCodes: string[];
    isActive: boolean;
    contactSigned: boolean;
    contractSent: boolean;
}

export interface LeadAssignment {
    id: string;
    agentCode: string;
    realtorFirstName: string;
    realtorLastName: string;
    dateSent: string;
    leadId: string;
    comments?: string;
    status: string;
    callbackTime?: string;
}

export interface Notification {
    id: string;
    message: string;
    createdAt: string;
}