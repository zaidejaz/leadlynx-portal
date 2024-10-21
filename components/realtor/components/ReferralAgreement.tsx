import React, { useState, useEffect } from 'react';
import { MonthlyReferralAgreement } from './MonthlyReferralAgreement';
import { OneTimeReferralAgreement } from './OneTimeReferralAgreement';
import { toast } from "sonner";

interface ReferralAgreementProps {
  signUpCategory: string;
  contractSent: boolean;
  onConfirmSent: () => Promise<void>;
}

export const ReferralAgreement: React.FC<ReferralAgreementProps> = ({
  signUpCategory,
  contractSent,
  onConfirmSent
}) => {
  console.log("ReferralAgreement props:", { signUpCategory, contractSent }) // Debug log

  useEffect(() => {
    console.log("ReferralAgreement mounted/updated with:", { signUpCategory, contractSent }) // Debug log
  }, [signUpCategory, contractSent])

  const handleConfirmSent = async () => {
    try {
      await onConfirmSent();
      toast.success("Contract status updated successfully.");
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