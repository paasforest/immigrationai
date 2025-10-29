// Interview Questions Database for Immigration Lawyers
export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  visaType: string;
  context_tips: string[];
  red_flags: string[];
  ideal_elements: string[];
  example_good_answer: string;
  example_bad_answer: string;
  created_at?: string;
  updated_at?: string;
}

export interface InterviewFeedback {
  score: number; // 1-10
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  red_flags_detected: string[];
  consistency_with_sop: boolean;
  key_phrases_used: string[];
  confidence_level: 'low' | 'medium' | 'high';
  clarity_score: number;
  completeness_score: number;
}

export const INTERVIEW_QUESTIONS: { [key: string]: { [key: string]: InterviewQuestion[] } } = {
  us_f1: {
    education: [
      {
        id: 'us_f1_edu_1',
        question: 'Why do you want to study at this university?',
        difficulty: 'medium',
        category: 'education',
        visaType: 'us_f1',
        context_tips: [
          'Officer wants to know if you did research',
          'Looking for specific reasons, not generic praise',
          'Testing your commitment to THIS university'
        ],
        red_flags: [
          'Just said "it\'s a good university"',
          'Mentioned multiple universities (sounds uncertain)',
          'Said "I want to go to US" instead of specific university'
        ],
        ideal_elements: [
          'Specific program/major at the university',
          'Specific professor or research',
          'Specific ranking or achievement',
          'How it aligns with career goals'
        ],
        example_good_answer: `I want to study Computer Science at Carnegie Mellon because they're ranked #1 for AI research. 
I'm particularly interested in Professor Andrew Ng's work on machine learning. After graduation, I plan to return to 
South Africa and work in fintech, where these skills are in high demand.`,
        example_bad_answer: `Carnegie Mellon is a good university and I want to study there.`
      },
      {
        id: 'us_f1_edu_2',
        question: 'What will you study?',
        difficulty: 'easy',
        category: 'education',
        visaType: 'us_f1',
        context_tips: [
          'Officer checking if you know your own major',
          'Looking for clarity and confidence',
          'Testing if you\'re serious about studies'
        ],
        red_flags: [
          'Vague answer or hesitation',
          'Saying "I don\'t know yet"',
          'Mentioning work visa (shows you plan to stay)'
        ],
        ideal_elements: [
          'Specific major/program',
          'Why this field interests you',
          'What you want to do with it'
        ],
        example_good_answer: `I'll be studying Computer Science with a focus on Artificial Intelligence and Machine Learning.`,
        example_bad_answer: `Something in technology or engineering, maybe computers.`
      },
      {
        id: 'us_f1_edu_3',
        question: 'Why not study this in your home country?',
        difficulty: 'hard',
        category: 'education',
        visaType: 'us_f1',
        context_tips: [
          'Officer testing your motivation',
          'Looking for legitimate reasons (not just "US is better")',
          'Checking if you considered alternatives'
        ],
        red_flags: [
          'Insulting your home country',
          'Just saying "US universities are better"',
          'No genuine reason'
        ],
        ideal_elements: [
          'Specific program not available at home',
          'Research opportunities not available',
          'Specific career requirement',
          'But still expressing commitment to home country'
        ],
        example_good_answer: `While South Africa has good universities, Carnegie Mellon's AI research program is 
world-renowned. The faculty, research facilities, and internship opportunities in Silicon Valley are unmatched. This specific 
expertise will help me advance my career when I return to South Africa.`,
        example_bad_answer: `US universities are just better than South African ones.`
      }
    ],
    
    finance: [
      {
        id: 'us_f1_fin_1',
        question: 'How will you finance your studies?',
        difficulty: 'hard',
        category: 'finance',
        visaType: 'us_f1',
        context_tips: [
          'Officer is VERY concerned here',
          'Testing if you have enough money',
          'Looking for credibility of funding source',
          'Checking for work visa intent'
        ],
        red_flags: [
          'Vague answer ("my family will pay")',
          'No specific numbers',
          'Mentioning plan to work (threatens visa)',
          'Funding seems unrealistic'
        ],
        ideal_elements: [
          'Specific amount (tuition + living costs)',
          'Credible funding source (parents, savings, sponsor)',
          'Proof of funds available',
          'NO mention of working to pay'
        ],
        example_good_answer: `My parents will sponsor my studies. We have prepared approximately $80,000 USD covering 
4 years of tuition and living expenses. My father is a director at [Company], and we have bank statements showing 
funds available. I also have a sponsorship from [Organization] covering $15,000 per year.`,
        example_bad_answer: `My family will help and I might work part-time to pay for things.`
      },
      {
        id: 'us_f1_fin_2',
        question: 'Show me your proof of funds.',
        difficulty: 'easy',
        category: 'finance',
        visaType: 'us_f1',
        context_tips: [
          'You should have this in hand',
          'Officer will look at dates carefully',
          'Looking for consistency with story'
        ],
        red_flags: [
          'Funds deposited AFTER visa application',
          'Funds came from unknown source',
          'Contradicts your stated funding source'
        ],
        ideal_elements: [
          'Bank statements 6+ months old',
          'Consistent balance over time',
          'Matches claimed funding amount'
        ],
        example_good_answer: `[Shows bank statements showing $100,000+ in savings account, dated back 6+ months]`,
        example_bad_answer: `I don't have it with me.`
      }
    ],
    
    ties: [
      {
        id: 'us_f1_ties_1',
        question: 'What are your ties to South Africa?',
        difficulty: 'hard',
        category: 'ties',
        visaType: 'us_f1',
        context_tips: [
          'Officer testing if you\'ll overstay',
          'Looking for reasons to RETURN home',
          'Most important question',
          'If you can\'t answer this, likely rejection'
        ],
        red_flags: [
          'Weak ties or none mentioned',
          'Say "I want to stay in US"',
          'No family/job/property ties',
          'Say "I\'ll figure it out after graduation"'
        ],
        ideal_elements: [
          'Family in home country',
          'Job waiting (letter from employer)',
          'Property/savings in home country',
          'Career plans back home',
          'Specific timeline to return'
        ],
        example_good_answer: `My parents and younger brother live in Cape Town. My father works at [Company] and 
my mother is a teacher. We own a home in Camps Bay. Additionally, I have been offered a position as Software Engineer 
at [Company] in Johannesburg starting July 2026, after my graduation. I plan to return and advance their tech capabilities. 
My studies are specifically to gain US expertise to bring back.`,
        example_bad_answer: `I'm not sure yet where I'll live after graduation.`
      }
    ],
    
    background: [
      {
        id: 'us_f1_bg_1',
        question: 'Tell me about your background.',
        difficulty: 'medium',
        category: 'background',
        visaType: 'us_f1',
        context_tips: [
          'Open-ended question to establish rapport',
          'Officer listening for consistency',
          'Checking for red flags'
        ],
        red_flags: [
          'Contradicts SOP or application',
          'Mentions criminal history casually',
          'Shows uncertainty about own background'
        ],
        ideal_elements: [
          'Brief overview of education',
          'Family background',
          'Why you\'re interested in your field',
          'How it connects to your goals'
        ],
        example_good_answer: `I grew up in Cape Town in a middle-class family. Both my parents emphasized education. 
I completed my schooling at [School], then studied Computer Science at [University] in South Africa. During my degree, 
I developed a passion for AI through a research project with Professor [Name]. Now I want to deepen that expertise through 
graduate studies in the US, then return to lead AI initiatives in South Africa.`,
        example_bad_answer: `I'm from South Africa and I want to study.`
      }
    ],
    
    travel: [
      {
        id: 'us_f1_travel_1',
        question: 'Have you traveled abroad before?',
        difficulty: 'easy',
        category: 'travel',
        visaType: 'us_f1',
        context_tips: [
          'Officer checking travel history',
          'Assessing if you\'ve returned from visas before',
          'Evaluating reliability'
        ],
        red_flags: [
          'Overstayed any visa',
          'Multiple visa rejections',
          'Illegal work history'
        ],
        ideal_elements: [
          'Multiple countries visited',
          'Always returned on time',
          'Business/tourist visas held successfully'
        ],
        example_good_answer: `Yes, I\'ve traveled to the UK twice on tourist visas (2019, 2021), visited France for 
a conference (2022), and traveled to Kenya for a family vacation (2023). I returned to South Africa on schedule each time.`,
        example_bad_answer: `I don\'t remember.`
      }
    ]
  },
  
  canada_study: {
    education: [
      {
        id: 'canada_study_edu_1',
        question: 'Why do you want to study in Canada?',
        difficulty: 'medium',
        category: 'education',
        visaType: 'canada_study',
        context_tips: [
          'Officer wants to see genuine interest in Canada',
          'Looking for specific reasons beyond just "good education"',
          'Testing if you understand Canadian values'
        ],
        red_flags: [
          'Generic answer about "good education"',
          'Mentioning wanting to immigrate permanently',
          'No specific knowledge about Canada'
        ],
        ideal_elements: [
          'Specific program or university in Canada',
          'Canadian values or culture alignment',
          'Career goals that benefit from Canadian education',
          'Plan to return home after studies'
        ],
        example_good_answer: `I want to study Environmental Science at University of British Columbia because Canada is a global leader in sustainable development. The program offers unique research opportunities in Arctic studies, which aligns with my goal to address climate change in my home country. Canada's multicultural environment will also help me develop global perspectives I can bring back home.`,
        example_bad_answer: `Canada has good universities and I want to study there.`
      }
    ],
    
    finance: [
      {
        id: 'canada_study_fin_1',
        question: 'How will you support yourself financially in Canada?',
        difficulty: 'hard',
        category: 'finance',
        visaType: 'canada_study',
        context_tips: [
          'Canada requires proof of funds for living expenses',
          'Officer checking if you can afford to study',
          'Looking for realistic financial planning'
        ],
        red_flags: [
          'No specific financial plan',
          'Mentioning working to support studies',
          'Unrealistic financial claims'
        ],
        ideal_elements: [
          'Specific amount for tuition and living costs',
          'Bank statements or sponsorship letters',
          'Realistic budget breakdown',
          'No reliance on working in Canada'
        ],
        example_good_answer: `I have CAD $25,000 per year for living expenses plus tuition fees covered by my parents. We have bank statements showing funds available for 4 years. I also have a partial scholarship from the university covering 30% of tuition. My family owns property in my home country worth CAD $200,000 as additional security.`,
        example_bad_answer: `I'll figure it out when I get there.`
      }
    ]
  },

  australia_student: {
    education: [
      {
        id: 'australia_student_edu_1',
        question: 'Why do you want to study in Australia?',
        difficulty: 'medium',
        category: 'education',
        visaType: 'australia_student',
        context_tips: [
          'Officer wants to see genuine interest in Australia',
          'Looking for specific reasons beyond just "good education"',
          'Testing if you understand Australian values and culture'
        ],
        red_flags: [
          'Generic answer about "good education"',
          'Mentioning wanting to immigrate permanently',
          'No specific knowledge about Australia'
        ],
        ideal_elements: [
          'Specific program or university in Australia',
          'Australian values or culture alignment',
          'Career goals that benefit from Australian education',
          'Plan to return home after studies'
        ],
        example_good_answer: `I want to study Marine Biology at James Cook University because Australia has the Great Barrier Reef, which offers unparalleled research opportunities. The program is world-renowned and aligns with my goal to work in marine conservation in my home country. Australia's diverse marine ecosystems will provide unique learning experiences.`,
        example_bad_answer: `Australia has good universities and I want to study there.`
      }
    ],
    
    finance: [
      {
        id: 'australia_student_fin_1',
        question: 'How will you support yourself financially in Australia?',
        difficulty: 'hard',
        category: 'finance',
        visaType: 'australia_student',
        context_tips: [
          'Australia requires proof of funds for living expenses',
          'Officer checking if you can afford to study',
          'Looking for realistic financial planning'
        ],
        red_flags: [
          'No specific financial plan',
          'Mentioning working to support studies',
          'Unrealistic financial claims'
        ],
        ideal_elements: [
          'Specific amount for tuition and living costs',
          'Bank statements or sponsorship letters',
          'Realistic budget breakdown',
          'No reliance on working in Australia'
        ],
        example_good_answer: `I have AUD $21,000 per year for living expenses plus tuition fees covered by my parents. We have bank statements showing funds available for 3 years. I also have a partial scholarship from the university covering 25% of tuition. My family owns property in my home country worth AUD $300,000 as additional security.`,
        example_bad_answer: `I'll figure it out when I get there.`
      }
    ]
  },

  uk_student: {
    education: [
      {
        id: 'uk_student_edu_1',
        question: 'Why do you want to study in the UK?',
        difficulty: 'medium',
        category: 'education',
        visaType: 'uk_student',
        context_tips: [
          'Officer wants to see genuine interest in the UK',
          'Looking for specific reasons beyond just "good education"',
          'Testing if you understand British values and culture'
        ],
        red_flags: [
          'Generic answer about "good education"',
          'Mentioning wanting to immigrate permanently',
          'No specific knowledge about the UK'
        ],
        ideal_elements: [
          'Specific program or university in the UK',
          'British values or culture alignment',
          'Career goals that benefit from UK education',
          'Plan to return home after studies'
        ],
        example_good_answer: `I want to study International Relations at the London School of Economics because the UK has a rich history of diplomacy and international cooperation. The program offers unique opportunities to learn from world-renowned professors and engage with diverse perspectives. This will help me contribute to international relations in my home country.`,
        example_bad_answer: `The UK has good universities and I want to study there.`
      }
    ],
    
    finance: [
      {
        id: 'uk_student_fin_1',
        question: 'How will you support yourself financially in the UK?',
        difficulty: 'hard',
        category: 'finance',
        visaType: 'uk_student',
        context_tips: [
          'UK requires proof of funds for living expenses',
          'Officer checking if you can afford to study',
          'Looking for realistic financial planning'
        ],
        red_flags: [
          'No specific financial plan',
          'Mentioning working to support studies',
          'Unrealistic financial claims'
        ],
        ideal_elements: [
          'Specific amount for tuition and living costs',
          'Bank statements or sponsorship letters',
          'Realistic budget breakdown',
          'No reliance on working in the UK'
        ],
        example_good_answer: `I have £12,000 per year for living expenses plus tuition fees covered by my parents. We have bank statements showing funds available for 3 years. I also have a partial scholarship from the university covering 20% of tuition. My family owns property in my home country worth £250,000 as additional security.`,
        example_bad_answer: `I'll figure it out when I get there.`
      }
    ]
  },
  
  uk_family: {
    relationship: [
      {
        id: 'uk_family_rel_1',
        question: 'How did you meet your spouse?',
        difficulty: 'medium',
        category: 'relationship',
        visaType: 'uk_family',
        context_tips: [
          'Officer testing if relationship is genuine',
          'Looking for detailed, consistent story',
          'Checking for red flags in relationship timeline'
        ],
        red_flags: [
          'Vague or inconsistent story',
          'Story doesn\'t match application',
          'Suspicious timeline (too fast, too convenient)'
        ],
        ideal_elements: [
          'Specific details about meeting',
          'Timeline that makes sense',
          'Consistent with application details',
          'Shows genuine relationship development'
        ],
        example_good_answer: `We met through mutual friends at a university event in London in 2019. I was visiting my cousin who studies at Imperial College, and my spouse was a PhD student there. We started as friends, then began dating after 6 months. We got married in 2022 after dating for 3 years, and we have photos and messages from throughout our relationship.`,
        example_bad_answer: `We met online and got married.`
      }
    ]
  }
};

// Export functions to get questions by visa type
export function getQuestionsByVisaType(visaType: string): { [key: string]: InterviewQuestion[] } {
  return INTERVIEW_QUESTIONS[visaType] || {};
}

export function getQuestionsByCategory(visaType: string, category: string): InterviewQuestion[] {
  const questions = INTERVIEW_QUESTIONS[visaType] || {};
  return questions[category] || [];
}

export function getAllQuestionsForVisaType(visaType: string): InterviewQuestion[] {
  const questions = INTERVIEW_QUESTIONS[visaType] || {};
  return Object.values(questions).flat();
}

export function getRandomQuestion(visaType: string, category?: string): InterviewQuestion | null {
  const questions = category ? getQuestionsByCategory(visaType, category) : getAllQuestionsForVisaType(visaType);
  if (questions.length === 0) return null;
  return questions[Math.floor(Math.random() * questions.length)];
}

// Lawyer-specific functions
export function getQuestionsByDifficulty(visaType: string, difficulty: 'easy' | 'medium' | 'hard'): InterviewQuestion[] {
  const allQuestions = getAllQuestionsForVisaType(visaType);
  return allQuestions.filter(q => q.difficulty === difficulty);
}

export function getQuestionsByRedFlags(visaType: string): InterviewQuestion[] {
  const allQuestions = getAllQuestionsForVisaType(visaType);
  return allQuestions.filter(q => q.red_flags.length > 0);
}

// Statistics for lawyers
export function getQuestionStats(visaType: string) {
  const allQuestions = getAllQuestionsForVisaType(visaType);
  const categories = Object.keys(INTERVIEW_QUESTIONS[visaType] || {});
  
  return {
    totalQuestions: allQuestions.length,
    categories: categories.length,
    difficultyBreakdown: {
      easy: allQuestions.filter(q => q.difficulty === 'easy').length,
      medium: allQuestions.filter(q => q.difficulty === 'medium').length,
      hard: allQuestions.filter(q => q.difficulty === 'hard').length
    },
    questionsWithRedFlags: allQuestions.filter(q => q.red_flags.length > 0).length
  };
}
