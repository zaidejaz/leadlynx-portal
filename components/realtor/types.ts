export interface Lead {
    id: string;
    leadId: string;
    prospectName: string;
    prospectContact: string;
    propertyAddress: string;
    bedrooms: number | null;
    bathrooms: number | null;
    underAgentContract: boolean;
    status: string;
    comments: string | null;
    canChangeStatus: boolean;
  }