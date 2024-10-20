import React, { useState } from 'react';
import { MonthlyReferralAgreement } from './MonthlyReferralAgreement';
import { OneTimeReferralAgreement } from './OneTimeReferralAgreement';
import { updateRealtorInfo } from '../actions';
import { toast } from "sonner";

interface ReferralAgreementProps {
  signUpCategory: string;
  initialContractSent: boolean;
}

export const ReferralAgreement: React.FC<ReferralAgreementProps> = ({ 
  signUpCategory, 
  initialContractSent 
}) => {
  const [contractSent, setContractSent] = useState(initialContractSent);

  const handleConfirmSent = async () => {
    try {
      const result = await updateRealtorInfo('contractSent', true);
      if (result.success) {
        setContractSent(true);
        toast.success("Contract status updated successfully.");
      } else {
        throw new Error(result.error || 'Failed to update contract status');
      }
    } catch (error) {
      console.error('Error updating contract status:', error);
      toast.error("Failed to update contract status. Please try again.");
    }
  };

  if (signUpCategory === 'monthly') {
    return (
      <MonthlyReferralAgreement
        onConfirmSent={handleConfirmSent}
        contractSent={contractSent}
      />
    );
  } else {
    return (
      <OneTimeReferralAgreement
        onConfirmSent={handleConfirmSent}
        contractSent={contractSent}
        signUpCategory={signUpCategory as 'individual' | 'individualPro' | 'team' | 'brokerage'}
      />
    );
  }
};