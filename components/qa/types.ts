export interface LeadQA {
    id: string;
    leadId: string;
    submissionDate: Date;
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
    additionalNotes: string | null;
    submissionCount: number;
    recording: string | null;
    createdAt: Date;
    updatedAt: Date;
  }