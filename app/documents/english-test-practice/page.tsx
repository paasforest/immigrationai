'use client';

import { useState, useEffect } from 'react';
import { 
  Mic, 
  Play, 
  StopCircle, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  BookOpen,
  Globe,
  Award,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { 
  ENGLISH_TESTS, 
  IELTS_SPEAKING_QUESTIONS, 
  TOEFL_SPEAKING_SECTIONS,
  CELPIP_SPEAKING_SECTIONS,
  getTestForCountry,
  getIELTSQuestions,
  getTOEFLQuestions,
  getCELPIPQuestions
} from '@/lib/interview-coach/english-test-practice';
import { useAuth } from '@/contexts/AuthContext';

interface SpeakingPracticeState {
  testType: 'ielts' | 'toefl' | 'celpip';
  part: number;
  questionIndex: number;
  timeRemaining: number;
  isRecording: boolean;
  isPlaying: boolean;
  preparationTime: number;
  isPreparing: boolean;
}

export default function EnglishTestPracticePage() {
  const { user } = useAuth();
  const [state, setState] = useState<SpeakingPracticeState>({
    testType: 'ielts',
    part: 1,
    questionIndex: 0,
    timeRemaining: 45,
    isRecording: false,
    isPlaying: false,
    preparationTime: 30,
    isPreparing: false
  });

  const [selectedCountry, setSelectedCountry] = useState('canada');
  const [selectedVisaType, setSelectedVisaType] = useState('study_permit');
  const [sessionsUsed, setSessionsUsed] = useState(0); // Track usage for Entry plan

  // Check subscription limits
  const isProfessional = user?.subscriptionPlan === 'professional';
  const isEnterprise = user?.subscriptionPlan === 'enterprise';
  const isEntry = user?.subscriptionPlan === 'entry';
  const isStarter = user?.subscriptionPlan === 'starter';
  
  // Determine available test types based on subscription
  const getAvailableTestTypes = () => {
    if (isProfessional || isEnterprise) return ['ielts', 'toefl', 'celpip'];
    if (isEntry) return ['ielts']; // Entry plan only gets IELTS
    return []; // Starter plan gets no English test practice
  };

  const availableTestTypes = getAvailableTestTypes();

  // Check if user has reached their monthly limit
  const hasReachedLimit = isEntry && sessionsUsed >= 5;

  // Timer effect - moved to top to avoid hooks order issues
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.isPreparing && state.preparationTime > 0) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          preparationTime: prev.preparationTime - 1
        }));
      }, 1000);
    } else if (state.isRecording && state.timeRemaining > 0) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [state.isPreparing, state.isRecording, state.preparationTime, state.timeRemaining]);

  // Show usage limit warning for Entry plan users
  if (hasReachedLimit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Monthly Limit Reached
            </h1>
            <p className="text-xl text-gray-600">
              You&apos;ve used all 5 practice sessions this month
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Upgrade to Professional for Unlimited Practice
            </h2>
            
            <p className="text-gray-600 mb-6">
              Get unlimited English test practice sessions with all test types.
            </p>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-lg mb-2">Professional Plan - R699/month</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Unlimited practice sessions</li>
                <li>• All test types (IELTS, TOEFL, CELPIP)</li>
                <li>• Advanced AI feedback</li>
                <li>• Progress tracking</li>
              </ul>
            </div>

            <a 
              href="/subscription"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Upgrade Now
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Show upgrade prompt for users without access
  if (isStarter || (availableTestTypes.length === 0 && !isEnterprise)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            English Test Practice
          </h1>
          <p className="text-xl text-gray-600">
            Practice IELTS, TOEFL & CELPIP speaking with AI scoring
          </p>
          
          {/* Usage counter for Entry plan */}
          {isEntry && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">
                Sessions used: {sessionsUsed}/5 this month
              </span>
            </div>
          )}
        </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Upgrade Required
            </h2>
            
            <p className="text-gray-600 mb-6">
              English Test Practice is available on Entry and Professional plans.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">Entry Plan - R299/month</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• IELTS Speaking Practice</li>
                  <li>• AI Scoring & Feedback</li>
                  <li>• 5 practice sessions/month</li>
                </ul>
              </div>
              <div className="border rounded-lg p-6 bg-gradient-to-br from-purple-50 to-blue-50">
                <h3 className="font-semibold text-lg mb-2">Professional Plan - R699/month</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• All test types (IELTS, TOEFL, CELPIP)</li>
                  <li>• Unlimited practice sessions</li>
                  <li>• Advanced AI feedback</li>
                  <li>• Progress tracking</li>
                </ul>
              </div>
            </div>

            <a 
              href="/subscription"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              View Plans & Upgrade
            </a>
          </div>
        </div>
      </div>
    );
  }


  const startPreparation = () => {
    setState(prev => ({
      ...prev,
      isPreparing: true,
      preparationTime: 30
    }));
  };

  const startRecording = () => {
    setState(prev => ({
      ...prev,
      isRecording: true,
      isPreparing: false,
      timeRemaining: state.testType === 'ielts' ? 45 : 60
    }));
  };

  const stopRecording = () => {
    setState(prev => ({
      ...prev,
      isRecording: false
    }));
  };

  const nextQuestion = () => {
    const questions = getQuestionsForTest(state.testType, state.part);
    setState(prev => ({
      ...prev,
      questionIndex: (prev.questionIndex + 1) % questions.length,
      timeRemaining: state.testType === 'ielts' ? 45 : 60,
      isRecording: false,
      isPreparing: false,
      preparationTime: 30
    }));
  };

  const getQuestionsForTest = (testType: string, part: number) => {
    switch (testType) {
      case 'ielts':
        return getIELTSQuestions(part)?.example_questions || [];
      case 'toefl':
        return [getTOEFLQuestions(part)?.example || ''];
      case 'celpip':
        return [getCELPIPQuestions(part)?.example || ''];
      default:
        return [];
    }
  };

  const getCurrentQuestion = () => {
    const questions = getQuestionsForTest(state.testType, state.part);
    return questions[state.questionIndex] || '';
  };

  const getTestInfo = () => {
    return ENGLISH_TESTS[state.testType];
  };

  const getTestRequirements = () => {
    return getTestForCountry(selectedCountry, selectedVisaType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎙️ English Language Test Practice
          </h1>
          <p className="text-gray-600">
            Practice speaking for IELTS, TOEFL, or CELPIP tests with AI-powered feedback
          </p>
          
          {/* Usage counter for Entry plan */}
          {isEntry && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">
                Sessions used: {sessionsUsed}/5 this month
              </span>
            </div>
          )}
        </div>

        {/* Country & Visa Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">📍 Your Target Country & Visa</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select 
                value={selectedCountry} 
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="canada">🇨🇦 Canada</option>
                <option value="uk">🇬🇧 United Kingdom</option>
                <option value="australia">🇦🇺 Australia</option>
                <option value="ireland">🇮🇪 Ireland</option>
                <option value="usa">🇺🇸 United States</option>
                <option value="new_zealand">🇳🇿 New Zealand</option>
                <option value="germany">🇩🇪 Germany</option>
                <option value="netherlands">🇳🇱 Netherlands</option>
                <option value="singapore">🇸🇬 Singapore</option>
                <option value="uae">🇦🇪 UAE</option>
                <option value="japan">🇯🇵 Japan</option>
                <option value="south_korea">🇰🇷 South Korea</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visa Type</label>
              <select 
                value={selectedVisaType} 
                onChange={(e) => setSelectedVisaType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="study_permit">Study Permit</option>
                <option value="work_permit">Work Permit</option>
                <option value="family_visa">Family Visa</option>
                <option value="f1_student">F1 Student Visa</option>
                <option value="b1_b2_visitor">B1/B2 Visitor Visa</option>
                <option value="h1b_work">H1B Work Visa</option>
                <option value="express_entry">Express Entry</option>
                <option value="skilled_visa">Skilled Visa</option>
                <option value="partner_visa">Partner Visa</option>
                <option value="skilled_migrant">Skilled Migrant</option>
                <option value="student_pass">Student Pass</option>
                <option value="student_visa">Student Visa</option>
              </select>
            </div>
          </div>
          
          {/* Test Requirements */}
          {getTestRequirements() && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Required English Tests:</h4>
              <div className="space-y-2">
                {getTestRequirements()?.map((test, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{test.name}</span>
                    <div className="flex items-center space-x-2">
                      {test.requirements.overall && (
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Overall: {test.requirements.overall}
                        </span>
                      )}
                      {test.requirements.each_band && (
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                          Each Band: {test.requirements.each_band}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Test Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* IELTS - Available to Entry and Professional */}
          <div 
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all ${
              state.testType === 'ielts' ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-lg'
            } ${!availableTestTypes.includes('ielts') ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => availableTestTypes.includes('ielts') && setState({...state, testType: 'ielts', part: 1, questionIndex: 0})}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">🎯 IELTS Speaking</h3>
                <p className="text-sm text-gray-600">3 Parts, 11-14 minutes</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Band Score:</span>
                <span className="font-semibold">1-9</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-semibold">11-14 min</span>
              </div>
              <div className="flex justify-between">
                <span>Cost:</span>
                <span className="font-semibold">$300</span>
              </div>
            </div>
          </div>

          {/* TOEFL - Available to Professional only */}
          <div 
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all ${
              state.testType === 'toefl' ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
            } ${!availableTestTypes.includes('toefl') ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => availableTestTypes.includes('toefl') && setState({...state, testType: 'toefl', part: 1, questionIndex: 0})}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Mic className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">🎤 TOEFL Speaking</h3>
                <p className="text-sm text-gray-600">4 Tasks, 17 minutes</p>
                {!availableTestTypes.includes('toefl') && (
                  <p className="text-xs text-orange-600 mt-1">Professional Plan Required</p>
                )}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Score:</span>
                <span className="font-semibold">0-30</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-semibold">17 min</span>
              </div>
              <div className="flex justify-between">
                <span>Cost:</span>
                <span className="font-semibold">$280</span>
              </div>
            </div>
          </div>

          {/* CELPIP - Available to Professional only */}
          <div 
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all ${
              state.testType === 'celpip' ? 'ring-2 ring-green-500 shadow-lg' : 'hover:shadow-lg'
            } ${!availableTestTypes.includes('celpip') ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => availableTestTypes.includes('celpip') && setState({...state, testType: 'celpip', part: 1, questionIndex: 0})}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">🍁 CELPIP Speaking</h3>
                <p className="text-sm text-gray-600">7 Tasks, 16 minutes</p>
                {!availableTestTypes.includes('celpip') && (
                  <p className="text-xs text-orange-600 mt-1">Professional Plan Required</p>
                )}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Level:</span>
                <span className="font-semibold">1-12</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-semibold">16 min</span>
              </div>
              <div className="flex justify-between">
                <span>Cost:</span>
                <span className="font-semibold">$300</span>
              </div>
            </div>
          </div>
        </div>

        {/* Practice Interface */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Part/Task Selector */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Select Part/Task:</h3>
            <div className="flex flex-wrap gap-3">
              {state.testType === 'ielts' && [1, 2, 3].map(part => (
                <button
                  key={part}
                  onClick={() => setState({...state, part, questionIndex: 0})}
                  className={`px-6 py-3 rounded-lg font-semibold transition ${
                    state.part === part
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Part {part}
                </button>
              ))}
              {state.testType === 'toefl' && [1, 2, 3, 4].map(task => (
                <button
                  key={task}
                  onClick={() => setState({...state, part: task, questionIndex: 0})}
                  className={`px-6 py-3 rounded-lg font-semibold transition ${
                    state.part === task
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Task {task}
                </button>
              ))}
              {state.testType === 'celpip' && [1, 2, 3, 4, 5, 6, 7].map(task => (
                <button
                  key={task}
                  onClick={() => setState({...state, part: task, questionIndex: 0})}
                  className={`px-6 py-3 rounded-lg font-semibold transition ${
                    state.part === task
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Task {task}
                </button>
              ))}
            </div>
          </div>

          {/* Question Card */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-600 p-6 rounded-lg">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-purple-600 mb-2 uppercase">
                  {state.testType === 'ielts' && `Part ${state.part} - ${getIELTSQuestions(state.part)?.name}`}
                  {state.testType === 'toefl' && `Task ${state.part} - ${getTOEFLQuestions(state.part)?.name}`}
                  {state.testType === 'celpip' && `Task ${state.part} - ${getCELPIPQuestions(state.part)?.name}`}
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  {state.testType === 'ielts' && getIELTSQuestions(state.part)?.description}
                  {state.testType === 'toefl' && getTOEFLQuestions(state.part)?.description}
                  {state.testType === 'celpip' && getCELPIPQuestions(state.part)?.description}
                </p>
              </div>
              
              <div className="bg-white border border-purple-200 p-6 rounded-lg">
                <p className="text-lg font-semibold text-gray-900">
                  {getCurrentQuestion()}
                </p>
              </div>
            </div>
          </div>

          {/* Timer and Controls */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Preparation Timer */}
              <div className="text-center">
                <div className="mb-4">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Preparation Time</p>
                  <div className="text-4xl font-bold text-blue-600">
                    {state.isPreparing ? `00:${state.preparationTime.toString().padStart(2, '0')}` : '00:30'}
                  </div>
                </div>
                {!state.isPreparing && !state.isRecording && (
                  <button
                    onClick={startPreparation}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Start Preparation
                  </button>
                )}
              </div>

              {/* Speaking Timer */}
              <div className="text-center">
                <div className="mb-4">
                  <Mic className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Speaking Time</p>
                  <div className="text-4xl font-bold text-purple-600">
                    {state.isRecording ? `00:${state.timeRemaining.toString().padStart(2, '0')}` : `00:${getTestInfo().speaking_duration_minutes}`}
                  </div>
                </div>
                {state.isPreparing && state.preparationTime === 0 && (
                  <button
                    onClick={startRecording}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    Start Recording
                  </button>
                )}
                {state.isRecording && (
                  <button
                    onClick={stopRecording}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Stop Recording
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4">💡 Tips for this question:</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {state.testType === 'ielts' && state.part === 1 && (
                  <>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-sm">Give natural, personal answers</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-sm">Use complete sentences (not one-word answers)</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-sm">Speak at natural pace (not too fast or slow)</span>
                    </div>
                  </>
                )}
                {state.testType === 'ielts' && state.part === 2 && (
                  <>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-sm">Use all your 1-2 minutes (aim for at least 1 minute)</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-sm">Speak fluently with minimal pauses</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-sm">Include specific examples and details</span>
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-2">
                {state.testType === 'toefl' && (
                  <>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-sm">Be specific and give examples</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-sm">Use clear organization</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-sm">Speak for the full time allowed</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={nextQuestion}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              🔄 Practice Next Question
            </button>
            <button
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              📊 Get AI Feedback
            </button>
          </div>
        </div>

        {/* Recent Practice Sessions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">📈 Recent Practice Sessions</h3>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold">IELTS Part 1 - Hometown</p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Score: 7.5/9</span>
                  <span className="text-sm text-gray-500">3 hours ago</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">
                  🔊 Play
                </button>
                <button className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                  📊 View Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


