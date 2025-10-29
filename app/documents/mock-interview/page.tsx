'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mic, Video, Play, StopCircle, RefreshCw, Loader, MessageSquare, CheckCircle, XCircle, Lightbulb, Star, Download, BarChart3, Users, FileText, Clock, Target, TrendingUp, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { type InterviewQuestion } from '@/lib/interview-coach/questions-database';
// Removed direct OpenAI import - will use backend API instead
import { audioProcessor, type AudioProcessingResult } from '@/lib/interview-coach/audio-processing';

// Define DetailedFeedback type based on AI feedback structure
interface DetailedFeedback {
  overall_score: number;
  category_scores: {
    clarity: number;
    completeness: number;
    confidence: number;
    consistency: number;
    relevance: number;
  };
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  red_flags_detected: string[];
  positive_elements: string[];
  lawyer_notes: string[];
  recommended_practice_areas: string[];
  next_questions_to_practice: string[];
  consistency_with_sop: boolean;
  key_phrases_used: string[];
  confidence_level: 'low' | 'medium' | 'high';
  clarity_score: number;
  completeness_score: number;
}

interface InterviewSession {
  id: string;
  visaType: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  responses: Array<{
    questionId: string;
    userAnswer: string;
    durationSeconds: number;
    feedback: DetailedFeedback;
    timestamp: number;
  }>;
  isRecording: boolean;
  startTime: number;
  endTime?: number;
  clientName?: string;
  lawyerNotes?: string;
}

export default function MockInterviewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedVisaType, setSelectedVisaType] = useState('');
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [transcript, setTranscript] = useState('');
  const [clientName, setClientName] = useState('');
  const [lawyerNotes, setLawyerNotes] = useState('');
  const [activeTab, setActiveTab] = useState('practice');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const isProfessional = user?.subscriptionPlan === 'professional';
  const isEnterprise = user?.subscriptionPlan === 'enterprise';

  // Transcribe audio using backend API
  const transcribeAudio = async (audioBlob: Blob): Promise<{ transcription: string; duration: number }> => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Please login to use transcription');
    }

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/interview-coach/transcribe-audio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Transcription failed');
      }

      const result = await response.json();
      
      return {
        transcription: result.transcription || result.text || '',
        duration: result.duration || 0
      };
    } catch (error: any) {
      console.error('Transcription error:', error);
      throw new Error(error.message || 'Failed to transcribe audio. Please try again.');
    }
  };

  // Define getFeedback early to ensure it's available to all functions
  const getFeedback = async (transcription: string, duration: number) => {
    // Note: Real AI feedback is handled by the backend API when submitting answers
    // This function provides basic client-side feedback
    const wordCount = transcription.split(' ').length;
    const hasStructure = transcription.toLowerCase().includes('first') || 
                        transcription.toLowerCase().includes('second') ||
                        transcription.toLowerCase().includes('finally');
    
    let feedbackText = '';
    
    if (duration < 30) {
      feedbackText += '⏱️ Your response was quite brief. ';
    } else if (duration > 180) {
      feedbackText += '⏱️ Consider being more concise. ';
    }
    
    if (wordCount < 50) {
      feedbackText += '📝 Try to elaborate more on your points. ';
    }
    
    if (hasStructure) {
      feedbackText += '✅ Good use of structure! ';
    } else {
      feedbackText += '💡 Consider using a structured approach (e.g., STAR method). ';
    }
    
    feedbackText += '👍 Keep practicing!';
    
    setFeedback(feedbackText);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const visaTypes = [
    { value: 'us_f1', label: '🇺🇸 F1 Student Visa (USA)', questions: 5 },
    { value: 'canada_study', label: '🇨🇦 Study Permit (Canada)', questions: 5 },
    { value: 'uk_family', label: '🇬🇧 Family Visa (UK)', questions: 5 },
    { value: 'australia_student', label: '🇦🇺 Student Visa (Australia)', questions: 3 },
    { value: 'new_zealand_student', label: '🇳🇿 Student Visa (New Zealand)', questions: 2 },
    { value: 'germany_student', label: '🇩🇪 Student Visa (Germany)', questions: 2 },
    { value: 'us_b1_b2', label: '🇺🇸 B1/B2 Visitor Visa (USA)', questions: 2 },
    { value: 'canada_express_entry', label: '🇨🇦 Express Entry (Canada)', questions: 2 },
    { value: 'uk_student', label: '🇬🇧 Student Visa (UK)', questions: 0 },
    { value: 'b1_b2_visitor', label: '🇺🇸 B1/B2 Visitor Visa (USA)', questions: 0 },
    { value: 'schengen_c_tourism', label: '🇪🇺 Schengen C (Tourism)', questions: 0 }
  ];

  const startInterview = async () => {
    if (!selectedVisaType || !clientName.trim()) {
      alert('Please select a visa type and enter client name');
      return;
    }

    try {
      // Get questions from backend
      const response = await fetch('http://localhost:4000/api/interview-coach/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visaType: selectedVisaType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start interview session');
      }

      const { question } = await response.json();
      
      // For now, we'll use a single question from the backend
      // In a full implementation, you'd get multiple questions
      const selectedQuestions = [question];

      const session: InterviewSession = {
        id: Date.now().toString(),
        visaType: selectedVisaType,
        questions: selectedQuestions,
        currentQuestionIndex: 0,
        responses: [],
        isRecording: false,
        startTime: Date.now(),
        clientName: clientName.trim()
      };

      setCurrentSession(session);
      setIsInterviewActive(true);
      setShowResults(false);
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview session. Please try again.');
    }

    // Request camera and microphone access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Please allow camera and microphone access to use the mock interview feature.');
    }
  };

  const startRecording = async () => {
    try {
      await audioProcessor.startRecording();
      setIsRecording(true);
      setCurrentSession(prev => prev ? { ...prev, isRecording: true } : null);
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Please allow microphone access to practice');
    }
  };

  const stopRecording = async () => {
    try {
      const audioBlob = await audioProcessor.stopRecording();
      setIsRecording(false);
      setCurrentSession(prev => prev ? { ...prev, isRecording: false } : null);
      
      // Process the audio
      await processAudio(audioBlob);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      setCurrentSession(prev => prev ? { ...prev, isRecording: false } : null);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      setIsAnalyzing(true);
      
      // Transcribe audio using backend API
      const result = await transcribeAudio(audioBlob);
      
      setTranscript(result.transcription);
      setCurrentAnswer(result.transcription);
      
      // Update responses if we have a current session
      if (currentSession && currentSession.questions[currentSession.currentQuestionIndex]) {
        const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
        setCurrentSession(prev => prev ? {
          ...prev,
          responses: [
            ...prev.responses,
            {
              questionId: currentQuestion.id,
              userAnswer: result.transcription,
              timestamp: new Date().toISOString(),
              feedback: {
                overall_score: 0,
                category_scores: { clarity: 0, completeness: 0, confidence: 0, consistency: 0, relevance: 0 },
                strengths: [],
                improvements: [],
                suggestions: [],
                red_flags_detected: [],
                positive_elements: [],
                lawyer_notes: [],
                recommended_practice_areas: [],
                next_questions_to_practice: [],
                consistency_with_sop: false,
                key_phrases_used: [],
                confidence_level: 'medium' as const,
                clarity_score: 0,
                completeness_score: 0
              }
            }
          ]
        } : null);
      }

      // Get AI feedback
      await getFeedback(result.transcription, result.duration);

    } catch (error) {
      console.error('Error processing audio:', error);
      setFeedback('Error processing your response. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentSession || !currentAnswer.trim()) {
      alert('Please provide an answer');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Calculate duration (rough estimate based on answer length)
      const durationSeconds = Math.max(30, Math.floor(currentAnswer.length / 10));

      // Get the current question
      const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
      
      // Get real AI feedback from backend
      const feedbackResponse = await fetch('http://localhost:4000/api/interview-coach/analyze-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          userAnswer: currentAnswer,
          visaType: currentSession.visaType,
          questionContext: {
            context_tips: currentQuestion.context_tips,
            red_flags: currentQuestion.red_flags,
            ideal_elements: currentQuestion.ideal_elements,
            example_good_answer: currentQuestion.example_good_answer,
            example_bad_answer: currentQuestion.example_bad_answer,
          }
        })
      });

      if (!feedbackResponse.ok) {
        throw new Error('Failed to get AI feedback');
      }

      const feedback = await feedbackResponse.json();

      const response = {
        questionId: currentQuestion.id,
        userAnswer: currentAnswer,
        durationSeconds,
        feedback,
        timestamp: Date.now()
      };

      setCurrentSession(prev => prev ? {
        ...prev,
        responses: [...prev.responses, response]
      } : null);

      setCurrentAnswer('');
      nextQuestion();
    } catch (error) {
      console.error('Error analyzing answer:', error);
      alert('Error analyzing answer. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextQuestion = () => {
    if (!currentSession) return;

    const nextIndex = currentSession.currentQuestionIndex + 1;
    if (nextIndex < currentSession.questions.length) {
      setCurrentSession(prev => prev ? { ...prev, currentQuestionIndex: nextIndex } : null);
    } else {
      // Interview completed
      setCurrentSession(prev => prev ? { ...prev, endTime: Date.now() } : null);
      setShowResults(true);
      setIsInterviewActive(false);
    }
  };

  const resetInterview = () => {
    setCurrentSession(null);
    setIsInterviewActive(false);
    setShowResults(false);
    setIsRecording(false);
    setCurrentAnswer('');
    setClientName('');
    setLawyerNotes('');
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };

  const getOverallScore = () => {
    if (!currentSession || currentSession.responses.length === 0) return 0;
    const totalScore = currentSession.responses.reduce((sum, response) => sum + response.feedback.overall_score, 0);
    return Math.round(totalScore / currentSession.responses.length);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Improvement';
  };

  const generateClientReport = (clientName: string, feedbacks: DetailedFeedback[], visaType: string): string => {
    const overallScore = feedbacks.reduce((sum, f) => sum + f.overall_score, 0) / feedbacks.length;
    const totalRedFlags = feedbacks.reduce((sum, f) => sum + f.red_flags_detected.length, 0);
    const totalStrengths = feedbacks.reduce((sum, f) => sum + f.strengths.length, 0);
    
    let report = `IMMIGRATION INTERVIEW PRACTICE REPORT\n`;
    report += `=====================================\n\n`;
    report += `Client Name: ${clientName}\n`;
    report += `Visa Type: ${visaType.toUpperCase()}\n`;
    report += `Date: ${new Date().toLocaleDateString()}\n`;
    report += `Overall Score: ${overallScore.toFixed(1)}/10\n`;
    report += `Total Red Flags: ${totalRedFlags}\n`;
    report += `Total Strengths: ${totalStrengths}\n\n`;
    
    report += `DETAILED ANALYSIS:\n`;
    report += `================\n\n`;
    
    feedbacks.forEach((feedback, index) => {
      report += `Question ${index + 1}:\n`;
      report += `Score: ${feedback.overall_score}/10\n`;
      report += `Strengths: ${feedback.strengths.join(', ')}\n`;
      report += `Improvements: ${feedback.improvements.join(', ')}\n`;
      if (feedback.red_flags_detected.length > 0) {
        report += `Red Flags: ${feedback.red_flags_detected.join(', ')}\n`;
      }
      report += `Suggestions: ${feedback.suggestions.join(', ')}\n\n`;
    });
    
    return report;
  };

  const generatePracticeRecommendations = (feedbacks: DetailedFeedback[], visaType: string) => {
    const allImprovements = feedbacks.flatMap(f => f.improvements);
    const allRedFlags = feedbacks.flatMap(f => f.red_flags_detected);
    const allStrengths = feedbacks.flatMap(f => f.strengths);
    
    // Count frequency of issues
    const improvementCounts: { [key: string]: number } = {};
    allImprovements.forEach(imp => {
      improvementCounts[imp] = (improvementCounts[imp] || 0) + 1;
    });
    
    const priorityAreas = Object.entries(improvementCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([area]) => area);
    
    return {
      priority_areas: priorityAreas.length > 0 ? priorityAreas : ['General communication', 'Specificity', 'Confidence'],
      practice_schedule: [
        'Practice 15-20 minutes daily',
        'Focus on one priority area per session',
        'Record yourself answering common questions',
        'Review and improve based on feedback'
      ],
      lawyer_action_items: [
        'Review client responses for consistency',
        'Address any red flags before submission',
        'Provide specific examples for common questions',
        'Schedule follow-up practice sessions'
      ]
    };
  };

  const downloadClientReport = () => {
    if (!currentSession) return;
    
    const report = generateClientReport(
      currentSession.clientName || 'Client',
      currentSession.responses.map(r => r.feedback),
      currentSession.visaType
    );
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSession.clientName || 'Client'}_Interview_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (showResults && currentSession) {
    const overallScore = getOverallScore();
    const totalRedFlags = currentSession.responses.reduce((sum, r) => sum + r.feedback.red_flags_detected.length, 0);
    const totalStrengths = currentSession.responses.reduce((sum, r) => sum + r.feedback.strengths.length, 0);
    const recommendations = generatePracticeRecommendations(
      currentSession.responses.map(r => r.feedback),
      currentSession.visaType
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Interview Analysis Report
              </h1>
              <div className="flex space-x-2">
                <Button onClick={downloadClientReport} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button onClick={resetInterview}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Interview
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="lawyer">Lawyer Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className={`text-6xl font-bold ${getScoreColor(overallScore)} mb-2`}>
                      {overallScore}/10
                    </div>
                    <div className={`text-xl font-semibold ${getScoreColor(overallScore)} mb-2`}>
                      {getScoreLabel(overallScore)}
                    </div>
                    <div className="text-gray-600">
                      Overall Performance
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-red-600 mb-2">
                      {totalRedFlags}
                    </div>
                    <div className="text-lg font-semibold text-gray-700 mb-2">
                      Red Flags
                    </div>
                    <div className="text-gray-600">
                      Issues to address
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {totalStrengths}
                    </div>
                    <div className="text-lg font-semibold text-gray-700 mb-2">
                      Strengths
                    </div>
                    <div className="text-gray-600">
                      Positive elements
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <span>Performance Breakdown</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentSession.responses.map((response, index) => {
                      const question = currentSession.questions.find(q => q.id === response.questionId);
                      return (
                        <div key={response.questionId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                            <p className="text-sm text-gray-600">{question?.question}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant={response.feedback.overall_score >= 8 ? 'default' : response.feedback.overall_score >= 6 ? 'secondary' : 'destructive'}>
                                {response.feedback.overall_score}/10
                              </Badge>
                              <span className="text-sm text-gray-500">{question?.category}</span>
                              <span className="text-sm text-gray-500">{question?.difficulty}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {response.feedback.red_flags_detected.length > 0 && (
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                            )}
                            {response.feedback.strengths.length > 0 && (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-6">
              {currentSession.responses.map((response, index) => {
                const question = currentSession.questions.find(q => q.id === response.questionId);
                return (
                  <Card key={response.questionId}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Question {index + 1}</span>
                        <Badge variant={response.feedback.overall_score >= 8 ? 'default' : response.feedback.overall_score >= 6 ? 'secondary' : 'destructive'}>
                          {response.feedback.overall_score}/10
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Question:</h4>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{question?.question}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Client's Answer:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{response.userAnswer}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-green-600 mb-2">Strengths:</h4>
                          <ul className="space-y-1">
                            {response.feedback.strengths.map((strength, i) => (
                              <li key={i} className="flex items-start space-x-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-orange-600 mb-2">Areas for Improvement:</h4>
                          <ul className="space-y-1">
                            {response.feedback.improvements.map((improvement, i) => (
                              <li key={i} className="flex items-start space-x-2 text-sm">
                                <X className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h5 className="font-semibold text-blue-900 mb-1">Clarity Score</h5>
                          <div className="flex items-center space-x-2">
                            <div className="w-full bg-blue-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${response.feedback.clarity_score * 10}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{response.feedback.clarity_score}/10</span>
                          </div>
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg">
                          <h5 className="font-semibold text-green-900 mb-1">Completeness Score</h5>
                          <div className="flex items-center space-x-2">
                            <div className="w-full bg-green-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${response.feedback.completeness_score * 10}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{response.feedback.completeness_score}/10</span>
                          </div>
                        </div>
                      </div>

                      {response.feedback.red_flags_detected.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-red-600 mb-2">Red Flags Detected:</h4>
                          <ul className="space-y-1">
                            {response.feedback.red_flags_detected.map((flag, i) => (
                              <li key={i} className="flex items-start space-x-2 text-sm">
                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>{flag}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2">Suggestions:</h4>
                        <ul className="space-y-1">
                          {response.feedback.suggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start space-x-2 text-sm">
                              <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {response.feedback.lawyer_notes.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-purple-600 mb-2">Lawyer Notes:</h4>
                          <ul className="space-y-1">
                            {response.feedback.lawyer_notes.map((note, i) => (
                              <li key={i} className="flex items-start space-x-2 text-sm">
                                <FileText className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                <span>{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-6 h-6 text-green-600" />
                    <span>Practice Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Priority Areas to Focus On:</h4>
                    <div className="space-y-2">
                      {recommendations.priority_areas.map((area, i) => (
                        <div key={i} className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                          <span className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {i + 1}
                          </span>
                          <span>{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Recommended Practice Schedule:</h4>
                    <div className="space-y-2">
                      {recommendations.practice_schedule.map((schedule, i) => (
                        <div key={i} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                          <Clock className="w-5 h-5 text-blue-500" />
                          <span>{schedule}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Lawyer Action Items:</h4>
                    <div className="space-y-2">
                      {recommendations.lawyer_action_items.map((item, i) => (
                        <div key={i} className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                          <FileText className="w-5 h-5 text-purple-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lawyer" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-6 h-6 text-purple-600" />
                    <span>Lawyer Notes & Observations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes for Client
                    </label>
                    <Textarea
                      value={lawyerNotes}
                      onChange={(e) => setLawyerNotes(e.target.value)}
                      placeholder="Add your professional observations and recommendations..."
                      rows={6}
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Client Summary:</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Client Name:</span> {currentSession.clientName}
                      </div>
                      <div>
                        <span className="font-medium">Visa Type:</span> {currentSession.visaType.toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium">Questions Practiced:</span> {currentSession.responses.length}
                      </div>
                      <div>
                        <span className="font-medium">Overall Score:</span> {overallScore}/10
                      </div>
                      <div>
                        <span className="font-medium">Red Flags:</span> {totalRedFlags}
                      </div>
                      <div>
                        <span className="font-medium">Strengths:</span> {totalStrengths}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={downloadClientReport}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Full Report
                    </Button>
                    <Button onClick={() => setActiveTab('overview')} variant="outline">
                      Back to Overview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  if (isInterviewActive && currentSession) {
    const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Interview Practice - {currentSession.clientName || 'You'}
                </h1>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Question {currentSession.currentQuestionIndex + 1} of {currentSession.questions.length}
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentSession.currentQuestionIndex + 1) / currentSession.questions.length) * 100}%` }}
                    ></div>
                  </div>
                  <Button onClick={resetInterview} variant="outline">
                    <StopCircle className="w-4 h-4 mr-2" />
                    End Practice
                  </Button>
                </div>
              </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Interview Question</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{currentQuestion.category}</Badge>
                    <Badge variant={currentQuestion.difficulty === 'easy' ? 'default' : currentQuestion.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {currentQuestion.question}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">💡 What Officer is Really Asking:</h4>
                      <ul className="space-y-1 text-sm text-blue-800">
                        {currentQuestion.context_tips.map((tip, i) => (
                          <li key={i}>• {tip}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-red-900 mb-2">🚨 What NOT to Say:</h4>
                      <ul className="space-y-1 text-sm text-red-800">
                        {currentQuestion.red_flags.slice(0, 3).map((flag, i) => (
                          <li key={i}>• {flag}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">✅ What to Include:</h4>
                      <ul className="space-y-1 text-sm text-green-800">
                        {currentQuestion.ideal_elements.map((element, i) => (
                          <li key={i}>• {element}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Client's Answer:</h4>
                    <Textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Type the client's answer here..."
                      rows={6}
                      disabled={isAnalyzing}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "default"}
                      disabled={isAnalyzing}
                      className="flex-1"
                    >
                      {isRecording ? (
                        <>
                          <StopCircle className="w-4 h-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={submitAnswer}
                      disabled={!currentAnswer.trim() || isAnalyzing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Submit Answer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="w-6 h-6 text-blue-600" />
                  <span>Video Recording</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    {isRecording ? (
                      <div className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-sm">REC</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 bg-gray-600 text-white px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <span className="text-sm">OFF</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-600">
                    <p>💡 <strong>Tip:</strong> Look at the camera when speaking, maintain good posture, and speak clearly.</p>
                  </div>
                  
                  {currentSession.responses.length > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Previous Answers:</h4>
                      <div className="space-y-2">
                        {currentSession.responses.slice(-3).map((response, i) => (
                          <div key={i} className="text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Q{currentSession.responses.length - 3 + i + 1}</span>
                              <Badge variant={response.feedback.overall_score >= 8 ? 'default' : response.feedback.overall_score >= 6 ? 'secondary' : 'destructive'}>
                                {response.feedback.overall_score}/10
                              </Badge>
                            </div>
                            <p className="text-gray-600 truncate">{response.userAnswer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Visa Interview Practice Coach
            </h1>
            <Link href="/dashboard" className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isProfessional && !isEnterprise && (
          <Card className="mb-8 bg-gradient-to-r from-purple-100 to-violet-100 border-2 border-purple-300">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-purple-900 mb-3">
                Unlock Professional Interview Coaching
              </h3>
              <p className="text-purple-800 mb-4">
                The Visa Interview Practice Coach is a premium feature available with our **Professional Plan**.
                Perfect for travel agents, immigration consultants, and individuals preparing for visa interviews.
              </p>
              <Link href="/subscription">
                <Button className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white text-lg px-8 py-3">
                  <Star className="w-5 h-5 mr-2" />
                  Upgrade to Professional Plan
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="w-6 h-6 text-blue-600" />
                  <span>Start Interview Practice Session</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter your name for personalized feedback..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Visa Type
                </label>
                <Select value={selectedVisaType} onValueChange={setSelectedVisaType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose visa type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {visaTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} ({type.questions} questions)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">What you'll get:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Real interview questions from actual consulate officers</li>
                  <li>• AI-powered analysis of your responses</li>
                  <li>• Professional feedback and scoring</li>
                  <li>• Red flag detection and warnings</li>
                  <li>• Detailed practice reports</li>
                  <li>• Personalized improvement recommendations</li>
                </ul>
              </div>

              <Button 
                onClick={startInterview}
                disabled={!selectedVisaType || (!isProfessional && !isEnterprise)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Practice Session
              </Button>

              {!isProfessional && !isEnterprise && (
                <p className="text-sm text-center text-purple-700">
                  Upgrade to Professional Plan to access this feature.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-6 h-6 text-yellow-600" />
                <span>Professional Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Client Management</h4>
                    <p className="text-sm text-gray-600">Track multiple clients and their interview progress</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">AI Analysis</h4>
                    <p className="text-sm text-gray-600">Get detailed feedback on client responses with scoring</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Red Flag Detection</h4>
                    <p className="text-sm text-gray-600">Identify potential issues before the real interview</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Professional Reports</h4>
                    <p className="text-sm text-gray-600">Generate detailed reports for client files</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    5
                  </div>
                  <div>
                    <h4 className="font-medium">Practice Recommendations</h4>
                    <p className="text-sm text-gray-600">Get specific areas to focus on for improvement</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Perfect for Immigration Lawyers:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Prepare clients for visa interviews</li>
                  <li>• Identify weak areas before submission</li>
                  <li>• Generate professional documentation</li>
                  <li>• Track client progress over time</li>
                  <li>• Reduce interview rejection rates</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <span>Interview Best Practices</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">✅ Do This</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Be specific and detailed in answers</li>
                    <li>• Maintain eye contact with the camera</li>
                    <li>• Speak clearly and at a moderate pace</li>
                    <li>• Show confidence and enthusiasm</li>
                    <li>• Prepare specific examples and stories</li>
                    <li>• Practice common questions beforehand</li>
                    <li>• Stay consistent with application details</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">❌ Avoid This</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Giving vague or one-word answers</li>
                    <li>• Looking away from the camera frequently</li>
                    <li>• Speaking too fast or too slow</li>
                    <li>• Showing nervousness or uncertainty</li>
                    <li>• Contradicting information in application</li>
                    <li>• Mentioning plans to stay permanently</li>
                    <li>• Being unprepared for basic questions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}