// Conversion enhancement components for pricing page

export const ValueComparison = () => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-200">
    <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
      💰 Save Thousands vs Hiring a Consultant
    </h3>
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-red-600 mb-1">R5,000 - R20,000</div>
        <div className="text-sm text-gray-600">Immigration Consultant</div>
        <div className="text-xs text-gray-500 mt-1">Per application</div>
      </div>
      <div className="bg-white rounded-lg p-4 text-center border-2 border-blue-500">
        <div className="text-2xl font-bold text-green-600 mb-1">R299 - R1,499</div>
        <div className="text-sm text-gray-600">Immigration AI</div>
        <div className="text-xs text-gray-500 mt-1">Per month (unlimited)</div>
      </div>
      <div className="bg-white rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-blue-600 mb-1">Save 90%+</div>
        <div className="text-sm text-gray-600">With our platform</div>
        <div className="text-xs text-gray-500 mt-1">Plus 24/7 access</div>
      </div>
    </div>
  </div>
);

export const SocialProof = () => (
  <div className="text-center mb-8">
    <div className="flex items-center justify-center space-x-8 mb-4">
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">1,250+</div>
        <div className="text-sm text-gray-600">Happy Users</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">4.8/5</div>
        <div className="text-sm text-gray-600">Average Rating</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">5,000+</div>
        <div className="text-sm text-gray-600">Documents Generated</div>
      </div>
    </div>
    <div className="flex items-center justify-center space-x-1 text-yellow-500 mb-2">
      {'★★★★★'.split('').map((star, i) => (
        <span key={i} className="text-2xl">{star}</span>
      ))}
    </div>
    <p className="text-sm text-gray-600 italic">
      &quot;Saved me R8,000 compared to hiring a consultant. Got my UK visa approved!&quot; - Sarah M.
    </p>
  </div>
);

export const AnnualSavingsBanner = ({ savings }: { savings: number }) => (
  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-4 mb-6 text-center">
    <div className="flex items-center justify-center space-x-2">
      <span className="text-2xl">🎉</span>
      <div>
        <div className="font-bold text-lg">Save {savings}% with Annual Plan!</div>
        <div className="text-sm text-green-100">Get 2 months free + priority support</div>
      </div>
    </div>
  </div>
);

export const UrgencyElement = () => (
  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-center">
    <div className="flex items-center justify-center space-x-2 text-orange-800">
      <span className="text-xl">⏰</span>
      <div>
        <div className="font-semibold">Limited Time: 20% Off Annual Plans</div>
        <div className="text-sm text-orange-600">Offer ends soon - Lock in your savings today!</div>
      </div>
    </div>
  </div>
);

export const PayPerUseOption = () => (
  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
    <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
      💳 Need Just One Document? Try Pay-Per-Use
    </h3>
    <div className="text-center mb-4">
      <div className="text-3xl font-bold text-purple-600 mb-1">R99</div>
      <div className="text-sm text-gray-600">Per document (one-time payment)</div>
    </div>
    <div className="text-center">
      <p className="text-sm text-gray-700 mb-4">
        Perfect if you only need one SOP or cover letter. No subscription required!
      </p>
      <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold">
        Choose Pay-Per-Use
      </button>
    </div>
  </div>
);
