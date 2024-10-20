import React from 'react';
import { AgreementLayout } from './AgreementLayout';

interface OneTimeReferralAgreementProps {
  onConfirmSent: () => void;
  contractSent: boolean;
  signUpCategory: 'individual' | 'individualPro' | 'team' | 'brokerage';
}

export const OneTimeReferralAgreement: React.FC<OneTimeReferralAgreementProps> = ({ onConfirmSent, contractSent, signUpCategory }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/One Time Referral Agreement.pdf';
    link.download = 'One Time Referral Agreement.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSetupFee = () => {
    switch (signUpCategory) {
      case 'individual': return '$299';
      case 'individualPro': return '$499';
      case 'team': return '$4,399';
      case 'brokerage': return '$10,999';
      default: return '';
    }
  };

  const getLeadProvision = () => {
    if (signUpCategory === 'individual') return '6 leads in 6 months';
    if (signUpCategory === 'individualPro') return '12 leads in 6 months';
    return '';
  };

  return (
    <AgreementLayout 
      title="One Time Referral Agreement" 
      onDownload={handleDownload}
      onConfirmSent={onConfirmSent}
      contractSent={contractSent}
    >
      <div className="space-y-4 text-gray-700">
        <p>1. Lead Provision: Lead Lynx will provide the Realtor with {getLeadProvision()}. These leads will be double-verified, including all prospect information and a recorded conversation with the prospect.</p>
        <p>2. Referral Fee: Lead Lynx will charge a 15% referral fee from the gross commission on either the seller side or buyer side, depending on which side was referred to the Realtor.</p>
        <p>3. Setup Fee: The Realtor agrees to pay Lead Lynx a one-time non-refundable setup fee of {getSetupFee()}.</p>
        <p>4. Outcome Disclaimer: Realtor acknowledges that the outcome of the leads provided cannot be guaranteed. Market fluctuations and other external factors may influence the number of prospects and their conversion rates.</p>
        <p>5. Referral Coverage Period: The Realtor agrees that the coverage period for referrals will start as soon as they provide Lead Lynx with the signed referral agreement.</p>
        <p>6. Refund Policy: After you sign the referral agreement and send it back to us and your account is activated (which takes about 7-14 days), if we are unable to provide you with any lead within next 60 days, we will refund your money back.</p>
      </div>
    </AgreementLayout>
  );
};