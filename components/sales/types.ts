export interface Realtor {
    id: string;
    agentCode: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    brokerage: string;
    state: string;
    isActive: boolean;
    centralZipCode: string;
    radius: number;
    signUpCategory: string;
    teamMembers: number | null;
    zipCodes: string[];
    contactSigned: boolean;
}

export interface SalesSummary {
    monthly: number;
    individual: number;
    individualPro: number;
    team: number;
    brokerage: number;
    totalRevenue: number;
    dailyData: {
        [key: string]: {
            monthly: number;
            individual: number;
            individualPro: number;
            team: number;
            brokerage: number;
            totalRevenue: number;
        }
    };
}