import React from 'react';
import { AgreementLayout } from './AgreementLayout';

interface MonthlyReferralAgreementProps {
  onConfirmSent: () => void;
  contractSent: boolean;
}

export const MonthlyReferralAgreement: React.FC<MonthlyReferralAgreementProps> = ({ onConfirmSent, contractSent }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/Monthly Referral Agreement.pdf';
    link.download = 'Monthly Referral Agreement.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AgreementLayout 
      title="Monthly Referral Agreement" 
      onDownload={handleDownload}
      onConfirmSent={onConfirmSent}
      contractSent={contractSent}
    >
      <div className="space-y-4 text-gray-700">
        <p>1. Lead Provision: Lead Lynx will provide the Realtor with double-verified prospects, including all prospect information and a recorded conversation with the prospect.</p>
        <p>2. Leads Volume: The number of leads cannot be determined because these leads are generated through social media advertising and the lead is only available once someone submits the ad form. Lead Lynx aims to provide the realtors with at least 1 lead a month, if more leads are available, Lead Lynx will provide these leads to the Realtor.</p>
        <p>3. Referral Fee: Lead Lynx will charge a 15% referral fee from the net commission on either the seller side or buyer side, depending on which side was referred to the Realtor.</p>
        <p>4. Monthly Subscription: The realtor agrees to pay a monthly subscription fee of $79.99. This is the only amount the realtor pays; there are no other hidden or additional charges.</p>
        <p>5. Cancellation: The realtor can cancel the Monthly subscription at any time. After cancelling, the Realtor can utilize the service for the rest of the month they paid for, and the service will stop after the month is completed.</p>
        <p>6. Non-Refundable: The monthly subscription is a non-refundable payment. The realtor must utilize the month they paid for.</p>
      </div>
    </AgreementLayout>
  );
};