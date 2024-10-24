import React, { useRef } from 'react';
import { AgreementLayout } from './AgreementLayout';

interface MonthlyReferralAgreementProps {
  onConfirmSent: () => void;
  contractSent: boolean;
}

export const MonthlyReferralAgreement: React.FC<MonthlyReferralAgreementProps> = ({ onConfirmSent, contractSent }) => {
  const pdfRef = useRef<HTMLObjectElement>(null);

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
      title="LeadLynx Referral Agreement" 
      onDownload={handleDownload}
      onConfirmSent={onConfirmSent}
      contractSent={contractSent}
    >
      <div className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <div className="h-[700px] overflow-auto">
          <object
            ref={pdfRef}
            data={`/Monthly Referral Agreement.pdf#zoom=100`}
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