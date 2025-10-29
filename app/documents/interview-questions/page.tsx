'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, BookOpen, Target, AlertTriangle, CheckCircle, Clock, Star, Download, BarChart3, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getQuestionsByVisaType, getQuestionStats, type InterviewQuestion } from '@/lib/interview-coach/questions-database';

export default function InterviewQuestionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedVisaType, setSelectedVisaType] = useState('select_visa_type');
  const [selectedCategory, setSelectedCategory] = useState('all_categories');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all_difficulties');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState<InterviewQuestion[]>([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);

  const isProfessional = user?.subscriptionPlan === 'professional';
  const isEnterprise = user?.subscriptionPlan === 'enterprise';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const visaTypes = [
    { value: 'us_f1', label: '🇺🇸 F1 Student Visa (USA)', count: 5 },
    { value: 'canada_study', label: '🇨🇦 Study Permit (Canada)', count: 5 },
    { value: 'uk_family', label: '🇬🇧 Family Visa (UK)', count: 5 },
    { value: 'australia_student', label: '🇦🇺 Student Visa (Australia)', count: 3 },
    { value: 'new_zealand_student', label: '🇳🇿 Student Visa (New Zealand)', count: 2 },
    { value: 'germany_student', label: '🇩🇪 Student Visa (Germany)', count: 2 },
    { value: 'us_b1_b2', label: '🇺🇸 B1/B2 Visitor Visa (USA)', count: 2 },
    { value: 'canada_express_entry', label: '🇨🇦 Express Entry (Canada)', count: 2 },
    { value: 'uk_student', label: '🇬🇧 Student Visa (UK)', count: 0 },
    { value: 'b1_b2_visitor', label: '🇺🇸 B1/B2 Visitor Visa (USA)', count: 0 },
    { value: 'schengen_c_tourism', label: '🇪🇺 Schengen C (Tourism)', count: 0 }
  ];

  const categories = [
    'education', 'finance', 'ties', 'background', 'travel', 'relationship'
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    if (selectedVisaType && selectedVisaType !== 'select_visa_type') {
      const questions = getQuestionsByVisaType(selectedVisaType);
      const allQuestions = Object.values(questions).flat();
      
      let filtered = allQuestions;

      // Filter by category (skip if "all_categories" is selected)
      if (selectedCategory && selectedCategory !== 'all_categories') {
        filtered = filtered.filter(q => q.category === selectedCategory);
      }

      // Filter by difficulty (skip if "all_difficulties" is selected)
      if (selectedDifficulty && selectedDifficulty !== 'all_difficulties') {
        filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
      }

      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(q => 
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.context_tips.some(tip => tip.toLowerCase().includes(searchQuery.toLowerCase())) ||
          q.ideal_elements.some(element => element.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      setFilteredQuestions(filtered);
    } else {
      setFilteredQuestions([]);
    }
  }, [selectedVisaType, selectedCategory, selectedDifficulty, searchQuery]);

  const getDifficultyColor = (difficulty: string) => {
    const diff = difficulties.find(d => d.value === difficulty);
    return diff ? diff.color : 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      education: BookOpen,
      finance: Target,
      ties: Users,
      background: FileText,
      travel: Clock,
      relationship: Users
    };
    const Icon = icons[category] || BookOpen;
    return <Icon className="w-4 h-4" />;
  };

  const downloadQuestions = () => {
    if (!selectedVisaType || filteredQuestions.length === 0) return;

    const content = filteredQuestions.map((q, i) => `
Question ${i + 1}: ${q.question}
Category: ${q.category}
Difficulty: ${q.difficulty}
Visa Type: ${q.visaType}

What Officer is Really Asking:
${q.context_tips.map(tip => `• ${tip}`).join('\n')}

What NOT to Say:
${q.red_flags.map(flag => `• ${flag}`).join('\n')}

What to Include:
${q.ideal_elements.map(element => `• ${element}`).join('\n')}

Good Answer Example:
${q.example_good_answer}

Bad Answer Example:
${q.example_bad_answer}

${'='.repeat(80)}
`).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedVisaType}_interview_questions_${new Date().toISOString().split('T')[0]}.txt`;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Interview Questions Database
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
                Unlock Professional Question Database
              </h3>
              <p className="text-purple-800 mb-4">
                Access our comprehensive database of real interview questions used by consulate officers.
                Perfect for immigration lawyers preparing clients for visa interviews.
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Questions</TabsTrigger>
            <TabsTrigger value="practice">Practice Mode</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-6 h-6 text-blue-600" />
                  <span>Search & Filter Questions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visa Type
                    </label>
                    <Select value={selectedVisaType} onValueChange={setSelectedVisaType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visa type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="select_visa_type">Select visa type...</SelectItem>
                        {visaTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label} ({type.count} questions)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_categories">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger>
                        <SelectValue placeholder="All difficulties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_difficulties">All Difficulties</SelectItem>
                        {difficulties.map((diff) => (
                          <SelectItem key={diff.value} value={diff.value}>
                            {diff.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search
                    </label>
                    <Input
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {selectedVisaType && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {filteredQuestions.length} questions
                    </div>
                    <Button onClick={downloadQuestions} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Questions
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedVisaType && (
              <div className="space-y-4">
                {filteredQuestions.map((question, index) => (
                  <Card key={question.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Question {index + 1}
                            </h3>
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                            <Badge variant="outline" className="flex items-center space-x-1">
                              {getCategoryIcon(question.category)}
                              <span>{question.category}</span>
                            </Badge>
                          </div>
                          
                          <p className="text-gray-700 mb-4 text-lg">
                            {question.question}
                          </p>

                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <h4 className="font-semibold text-blue-900 mb-1">What Officer is Really Asking:</h4>
                              <ul className="space-y-1 text-blue-800">
                                {question.context_tips.slice(0, 2).map((tip, i) => (
                                  <li key={i}>• {tip}</li>
                                ))}
                                {question.context_tips.length > 2 && (
                                  <li className="text-blue-600">...and {question.context_tips.length - 2} more</li>
                                )}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold text-red-900 mb-1">What NOT to Say:</h4>
                              <ul className="space-y-1 text-red-800">
                                {question.red_flags.slice(0, 2).map((flag, i) => (
                                  <li key={i}>• {flag}</li>
                                ))}
                                {question.red_flags.length > 2 && (
                                  <li className="text-red-600">...and {question.red_flags.length - 2} more</li>
                                )}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold text-green-900 mb-1">What to Include:</h4>
                              <ul className="space-y-1 text-green-800">
                                {question.ideal_elements.slice(0, 2).map((element, i) => (
                                  <li key={i}>• {element}</li>
                                ))}
                                {question.ideal_elements.length > 2 && (
                                  <li className="text-green-600">...and {question.ideal_elements.length - 2} more</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => setSelectedQuestion(question)}
                          variant="outline"
                          className="ml-4"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredQuestions.length === 0 && selectedVisaType && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions found</h3>
                      <p className="text-gray-600">Try adjusting your filters or search terms.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="practice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-6 h-6 text-green-600" />
                  <span>Practice Mode</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Practice Mode Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    Practice answering questions with AI feedback and scoring.
                  </p>
                  <Link href="/documents/mock-interview">
                    <Button>
                      <Star className="w-4 h-4 mr-2" />
                      Try Mock Interview Coach
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            {selectedVisaType ? (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                      <span>Question Statistics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const stats = getQuestionStats(selectedVisaType);
                      return (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Questions:</span>
                            <span className="font-semibold">{stats.totalQuestions}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Categories:</span>
                            <span className="font-semibold">{stats.categories}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Easy:</span>
                              <span className="font-semibold">{stats.difficultyBreakdown.easy}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Medium:</span>
                              <span className="font-semibold">{stats.difficultyBreakdown.medium}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Hard:</span>
                              <span className="font-semibold">{stats.difficultyBreakdown.hard}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Questions with Red Flags:</span>
                            <span className="font-semibold">{stats.questionsWithRedFlags}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                      <span>Red Flag Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Questions with red flags are critical for interview preparation. 
                        These questions often lead to visa rejections if not answered properly.
                      </p>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-orange-900 mb-2">Focus Areas:</h4>
                        <ul className="text-sm text-orange-800 space-y-1">
                          <li>• Practice these questions extensively</li>
                          <li>• Prepare specific examples</li>
                          <li>• Avoid common pitfalls</li>
                          <li>• Get professional feedback</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Visa Type</h3>
                  <p className="text-gray-600">Choose a visa type to view statistics and analytics.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Question Detail Modal */}
        {selectedQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    <span>Question Details</span>
                  </CardTitle>
                  <Button
                    onClick={() => setSelectedQuestion(null)}
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className={getDifficultyColor(selectedQuestion.difficulty)}>
                    {selectedQuestion.difficulty}
                  </Badge>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    {getCategoryIcon(selectedQuestion.category)}
                    <span>{selectedQuestion.category}</span>
                  </Badge>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {selectedQuestion.question}
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>What Officer is Really Asking</span>
                    </h4>
                    <ul className="space-y-2 text-blue-800">
                      {selectedQuestion.context_tips.map((tip, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-900 mb-3 flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span>What NOT to Say</span>
                    </h4>
                    <ul className="space-y-2 text-red-800">
                      {selectedQuestion.red_flags.map((flag, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>What to Include</span>
                  </h4>
                  <ul className="space-y-2 text-green-800">
                    {selectedQuestion.ideal_elements.map((element, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{element}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3">✅ Good Answer Example</h4>
                    <div className="bg-green-50 p-4 rounded-lg text-sm text-green-900">
                      {selectedQuestion.example_good_answer}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-600 mb-3">❌ Bad Answer Example</h4>
                    <div className="bg-red-50 p-4 rounded-lg text-sm text-red-900">
                      {selectedQuestion.example_bad_answer}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
