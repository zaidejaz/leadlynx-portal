import React, { useRef, useState } from 'react';
import { AgreementLayout } from './AgreementLayout';

interface OneTimeReferralAgreementProps {
  onConfirmSent: () => void;
  contractSent: boolean;
}

export const OneTimeReferralAgreement: React.FC<OneTimeReferralAgreementProps> = ({ onConfirmSent, contractSent }) => {
  const pdfRef = useRef<HTMLObjectElement>(null);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/One Time Referral Agreement.pdf';
    link.download = 'One Time Referral Agreement.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AgreementLayout 
      title="LeadLynx Referral Agreement" 
      onDownload={handleDownload}
      onConfirmSent={onConfirmSent}
      contractSent={contractSent}
    >
      <div className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <div className="h-[700px] overflow-auto">
          <object
            ref={pdfRef}
            data={`/One Time Referral Agreement.pdf#zoom=100`}
            type="application/pdf"
            width="100%"
            height="100%"
            className="w-full h-full"
          >
            <p>Your browser does not support PDFs.</p>
          </object>
        </div>
      </div>
    </AgreementLayout>
  );
};