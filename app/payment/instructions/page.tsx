import { Suspense } from 'react';

interface PaymentInstructionsProps {
  searchParams: {
    account_number?: string;
    plan?: string;
    billing?: string;
  };
}

function PaymentInstructionsContent({ searchParams }: PaymentInstructionsProps) {
  const { account_number, plan, billing } = searchParams;

  if (!account_number || !plan || !billing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Not Found</h1>
          <p className="text-gray-600">The payment details could not be found.</p>
        </div>
      </div>
    );
  }

  // Get plan pricing
  const planPricing = {
    starter: { monthly: 149, annual: 1490 },
    entry: { monthly: 299, annual: 2990 },
    professional: { monthly: 699, annual: 6990 },
    enterprise: { monthly: 1499, annual: 14990 },
  };
  
  const amount = planPricing[plan as keyof typeof planPricing][billing as 'monthly' | 'annual'];
  const planDisplay = `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${billing === 'monthly' ? 'Monthly' : 'Annual'}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Instructions
          </h1>
          <p className="text-gray-600">
            Complete your payment using the details below
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Payment Details</h2>
          <div className="space-y-2">
            <p><strong>Account Number:</strong> {account_number}</p>
            <p><strong>Plan:</strong> {planDisplay}</p>
            <p><strong>Amount:</strong> R{amount.toFixed(2)}</p>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Bank Details</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Bank:</strong> ABSA Bank</p>
              <p><strong>Account Name:</strong> immigrationai</p>
              <p><strong>Account Number:</strong> 4115223741</p>
              <p><strong>Branch Code:</strong> 632005</p>
              <p><strong>Reference:</strong> {account_number}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentInstructionsPage({ searchParams }: PaymentInstructionsProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment instructions...</p>
        </div>
      </div>
    }>
      <PaymentInstructionsContent searchParams={searchParams} />
    </Suspense>
  );
}