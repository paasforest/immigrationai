const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const interviewQuestions = [
  // US F1 Student Visa Questions
  {
    visaType: 'us_f1',
    category: 'education',
    difficulty: 'medium',
    question: 'Why do you want to study at this university?',
    contextTips: [
      'Officer wants to know if you did research',
      'Looking for specific reasons, not generic praise',
      'Testing your commitment to THIS university'
    ],
    redFlags: [
      'Just said "it\'s a good university"',
      'Mentioned multiple universities (sounds uncertain)',
      'Said "I want to go to US" instead of specific university'
    ],
    idealElements: [
      'Specific program/major at the university',
      'Specific professor or research',
      'Specific ranking or achievement',
      'How it aligns with career goals'
    ],
    exampleGoodAnswer: `I want to study Computer Science at Carnegie Mellon because they're ranked #1 for AI research. I'm particularly interested in Professor Andrew Ng's work on machine learning. After graduation, I plan to return to South Africa and work in fintech, where these skills are in high demand.`,
    exampleBadAnswer: `Carnegie Mellon is a good university and I want to study there.`
  },
  {
    visaType: 'us_f1',
    category: 'education',
    difficulty: 'easy',
    question: 'What will you study?',
    contextTips: [
      'Officer checking if you know your own major',
      'Looking for clarity and confidence',
      'Testing if you\'re serious about studies'
    ],
    redFlags: [
      'Vague answer or hesitation',
      'Saying "I don\'t know yet"',
      'Mentioning work visa (shows you plan to stay)'
    ],
    idealElements: [
      'Specific major/program',
      'Why this field interests you',
      'What you want to do with it'
    ],
    exampleGoodAnswer: `I'll be studying Computer Science with a focus on Artificial Intelligence and Machine Learning.`,
    exampleBadAnswer: `Something in technology or engineering, maybe computers.`
  },
  {
    visaType: 'us_f1',
    category: 'finance',
    difficulty: 'hard',
    question: 'How will you finance your studies?',
    contextTips: [
      'Officer is VERY concerned here',
      'Testing if you have enough money',
      'Looking for credibility of funding source',
      'Checking for work visa intent'
    ],
    redFlags: [
      'Vague answer ("my family will pay")',
      'No specific numbers',
      'Mentioning plan to work (threatens visa)',
      'Funding seems unrealistic'
    ],
    idealElements: [
      'Specific amount (tuition + living costs)',
      'Credible funding source (parents, savings, sponsor)',
      'Proof of funds available',
      'NO mention of working to pay'
    ],
    exampleGoodAnswer: `My parents will sponsor my studies. We have prepared approximately $80,000 USD covering 4 years of tuition and living expenses. My father is a director at [Company], and we have bank statements showing funds available. I also have a sponsorship from [Organization] covering $15,000 per year.`,
    exampleBadAnswer: `My family will help and I might work part-time to pay for things.`
  },
  {
    visaType: 'us_f1',
    category: 'ties',
    difficulty: 'hard',
    question: 'What are your ties to South Africa?',
    contextTips: [
      'Officer testing if you\'ll overstay',
      'Looking for reasons to RETURN home',
      'Most important question',
      'If you can\'t answer this, likely rejection'
    ],
    redFlags: [
      'Weak ties or none mentioned',
      'Say "I want to stay in US"',
      'No family/job/property ties',
      'Say "I\'ll figure it out after graduation"'
    ],
    idealElements: [
      'Family in home country',
      'Job waiting (letter from employer)',
      'Property/savings in home country',
      'Career plans back home',
      'Specific timeline to return'
    ],
    exampleGoodAnswer: `My parents and younger brother live in Cape Town. My father works at [Company] and my mother is a teacher. We own a home in Camps Bay. Additionally, I have been offered a position as Software Engineer at [Company] in Johannesburg starting July 2026, after my graduation. I plan to return and advance their tech capabilities. My studies are specifically to gain US expertise to bring back.`,
    exampleBadAnswer: `I'm not sure yet where I'll live after graduation.`
  },
  // Canada Study Permit Questions
  {
    visaType: 'canada_study',
    category: 'education',
    difficulty: 'medium',
    question: 'Why did you choose Canada for your studies?',
    contextTips: [
      'Officer wants to see genuine interest in Canada',
      'Looking for specific reasons beyond generic answers',
      'Testing commitment to Canadian education system'
    ],
    redFlags: [
      'Generic "Canada is good" answer',
      'Mentioning work opportunities primarily',
      'Saying "it was easier to get into"'
    ],
    idealElements: [
      'Specific Canadian university strengths',
      'Research opportunities in Canada',
      'How Canadian education aligns with goals',
      'Interest in Canadian culture/society'
    ],
    exampleGoodAnswer: `I chose Canada because the University of Toronto has one of the world's leading AI research programs, particularly in machine learning. The collaborative research environment and access to cutting-edge technology align perfectly with my goal to advance AI applications in healthcare. Canada's multicultural society also appeals to me as it reflects the global nature of technology.`,
    exampleBadAnswer: `Canada has good universities and it's easier to get a visa.`
  },
  {
    visaType: 'canada_study',
    category: 'finance',
    difficulty: 'hard',
    question: 'How will you support yourself during your studies?',
    contextTips: [
      'Officer needs to see financial stability',
      'Looking for realistic funding sources',
      'Testing if you understand Canadian costs'
    ],
    redFlags: [
      'Unrealistic funding amounts',
      'Relying on part-time work only',
      'No clear funding source'
    ],
    idealElements: [
      'Specific funding amount',
      'Multiple funding sources',
      'Understanding of Canadian living costs',
      'Backup funding plans'
    ],
    exampleGoodAnswer: `I have secured funding through multiple sources: my parents' savings of CAD $60,000, a scholarship from the university worth CAD $15,000 per year, and my own savings of CAD $10,000. This totals CAD $85,000 for my 2-year program, which covers tuition of CAD $45,000 and living expenses of CAD $40,000. I also have a letter of support from my uncle in Toronto who can provide emergency assistance if needed.`,
    exampleBadAnswer: `I'll work part-time and my family will help.`
  },
  {
    visaType: 'canada_study',
    category: 'education',
    difficulty: 'easy',
    question: 'What will you study in Canada?',
    contextTips: [
      'Officer checking if you know your program',
      'Looking for clarity and confidence',
      'Testing if you\'re serious about studies'
    ],
    redFlags: [
      'Vague answer or hesitation',
      'Saying "I don\'t know yet"',
      'Mentioning work visa (shows you plan to stay)'
    ],
    idealElements: [
      'Specific program/major',
      'Why this field interests you',
      'What you want to do with it'
    ],
    exampleGoodAnswer: `I'll be studying Computer Science with a specialization in Artificial Intelligence at the University of British Columbia. I'm particularly interested in machine learning applications in healthcare, and UBC has excellent research facilities and faculty in this area.`,
    exampleBadAnswer: `Something in technology or engineering, maybe computers.`
  },
  {
    visaType: 'canada_study',
    category: 'ties',
    difficulty: 'hard',
    question: 'What are your ties to your home country?',
    contextTips: [
      'Officer testing if you\'ll overstay',
      'Looking for reasons to RETURN home',
      'Most important question for study permits'
    ],
    redFlags: [
      'Weak ties or none mentioned',
      'Say "I want to stay in Canada"',
      'No family/job/property ties',
      'Say "I\'ll figure it out after graduation"'
    ],
    idealElements: [
      'Family in home country',
      'Job waiting (letter from employer)',
      'Property/savings in home country',
      'Career plans back home',
      'Specific timeline to return'
    ],
    exampleGoodAnswer: `My parents and younger sister live in Lagos. My father works at [Company] and my mother is a teacher. We own a home in Victoria Island. Additionally, I have been offered a position as Software Engineer at [Company] in Lagos starting July 2026, after my graduation. I plan to return and advance their tech capabilities. My studies are specifically to gain Canadian expertise to bring back to Nigeria's growing tech sector.`,
    exampleBadAnswer: `I'm not sure yet where I'll live after graduation.`
  },
  {
    visaType: 'canada_study',
    category: 'background',
    difficulty: 'medium',
    question: 'Tell me about your academic background.',
    contextTips: [
      'Open-ended question to establish rapport',
      'Officer listening for consistency',
      'Checking for red flags'
    ],
    redFlags: [
      'Contradicts application',
      'Mentions academic dishonesty',
      'Shows uncertainty about own background'
    ],
    idealElements: [
      'Brief overview of education',
      'Academic achievements',
      'Why you\'re interested in your field',
      'How it connects to your goals'
    ],
    exampleGoodAnswer: `I completed my Bachelor's in Computer Science at the University of Lagos with a 3.8 GPA. During my degree, I developed a passion for AI through a research project with Professor [Name] on machine learning applications. I graduated with honors and was awarded the Best Student in Computer Science. Now I want to deepen that expertise through graduate studies in Canada.`,
    exampleBadAnswer: `I studied computer science and I want to study more.`
  },
  {
    visaType: 'canada_study',
    category: 'travel',
    difficulty: 'easy',
    question: 'Have you traveled abroad before?',
    contextTips: [
      'Officer checking travel history',
      'Assessing if you\'ve returned from visas before',
      'Evaluating reliability'
    ],
    redFlags: [
      'Overstayed any visa',
      'Multiple visa rejections',
      'Illegal work history'
    ],
    idealElements: [
      'Multiple countries visited',
      'Always returned on time',
      'Business/tourist visas held successfully'
    ],
    exampleGoodAnswer: `Yes, I've traveled to the UK twice on tourist visas (2019, 2021), visited France for a conference (2022), and traveled to Kenya for a family vacation (2023). I returned to Nigeria on schedule each time.`,
    exampleBadAnswer: `I don't remember.`
  },
  // UK Family Visa Questions
  {
    visaType: 'uk_family',
    category: 'relationship',
    difficulty: 'hard',
    question: 'How did you meet your partner?',
    contextTips: [
      'Officer testing if relationship is genuine',
      'Looking for specific details',
      'Checking consistency with application'
    ],
    redFlags: [
      'Vague or inconsistent story',
      'Can\'t remember basic details',
      'Story doesn\'t match application'
    ],
    idealElements: [
      'Specific details about meeting',
      'Timeline of relationship',
      'How relationship developed',
      'Evidence of genuine connection'
    ],
    exampleGoodAnswer: `We met in 2019 at a tech conference in London where I was presenting my research on AI. Sarah was working as a data scientist at a UK company. We started talking about our shared interest in machine learning, exchanged contact information, and began a long-distance relationship. We've visited each other 8 times over the past 4 years, and I have all the flight receipts and photos to prove it.`,
    exampleBadAnswer: `We met online and started talking.`
  },
  // Australia Student Visa Questions
  {
    visaType: 'australia_student',
    category: 'education',
    difficulty: 'medium',
    question: 'Why did you choose Australia for your studies?',
    contextTips: [
      'Officer wants to see genuine interest in Australia',
      'Looking for specific reasons beyond generic answers',
      'Testing commitment to Australian education system'
    ],
    redFlags: [
      'Generic "Australia is good" answer',
      'Mentioning work opportunities primarily',
      'Saying "it was easier to get into"'
    ],
    idealElements: [
      'Specific Australian university strengths',
      'Research opportunities in Australia',
      'How Australian education aligns with goals',
      'Interest in Australian culture/society'
    ],
    exampleGoodAnswer: `I chose Australia because the University of Melbourne has one of the world's leading programs in environmental science, particularly in climate change research. The collaborative research environment and access to unique Australian ecosystems align perfectly with my goal to advance environmental solutions. Australia's multicultural society also appeals to me as it reflects the global nature of environmental challenges.`,
    exampleBadAnswer: `Australia has good universities and it's easier to get a visa.`
  },
  {
    visaType: 'australia_student',
    category: 'finance',
    difficulty: 'hard',
    question: 'How will you support yourself during your studies in Australia?',
    contextTips: [
      'Officer needs to see financial stability',
      'Looking for realistic funding sources',
      'Testing if you understand Australian costs'
    ],
    redFlags: [
      'Unrealistic funding amounts',
      'Relying on part-time work only',
      'No clear funding source'
    ],
    idealElements: [
      'Specific funding amount',
      'Multiple funding sources',
      'Understanding of Australian living costs',
      'Backup funding plans'
    ],
    exampleGoodAnswer: `I have secured funding through multiple sources: my parents' savings of AUD $80,000, a scholarship from the university worth AUD $20,000 per year, and my own savings of AUD $15,000. This totals AUD $115,000 for my 2-year program, which covers tuition of AUD $60,000 and living expenses of AUD $55,000. I also have a letter of support from my uncle in Sydney who can provide emergency assistance if needed.`,
    exampleBadAnswer: `I'll work part-time and my family will help.`
  },
  {
    visaType: 'australia_student',
    category: 'ties',
    difficulty: 'hard',
    question: 'What are your ties to your home country?',
    contextTips: [
      'Officer testing if you\'ll overstay',
      'Looking for reasons to RETURN home',
      'Most important question for study permits'
    ],
    redFlags: [
      'Weak ties or none mentioned',
      'Say "I want to stay in Australia"',
      'No family/job/property ties',
      'Say "I\'ll figure it out after graduation"'
    ],
    idealElements: [
      'Family in home country',
      'Job waiting (letter from employer)',
      'Property/savings in home country',
      'Career plans back home',
      'Specific timeline to return'
    ],
    exampleGoodAnswer: `My parents and younger sister live in Lagos. My father works at [Company] and my mother is a teacher. We own a home in Victoria Island. Additionally, I have been offered a position as Environmental Scientist at [Company] in Lagos starting July 2026, after my graduation. I plan to return and advance their environmental initiatives. My studies are specifically to gain Australian expertise to bring back to Nigeria's growing environmental sector.`,
    exampleBadAnswer: `I'm not sure yet where I'll live after graduation.`
  },
  // New Zealand Student Visa Questions
  {
    visaType: 'new_zealand_student',
    category: 'education',
    difficulty: 'medium',
    question: 'Why did you choose New Zealand for your studies?',
    contextTips: [
      'Officer wants to see genuine interest in New Zealand',
      'Looking for specific reasons beyond generic answers',
      'Testing commitment to New Zealand education system'
    ],
    redFlags: [
      'Generic "New Zealand is good" answer',
      'Mentioning work opportunities primarily',
      'Saying "it was easier to get into"'
    ],
    idealElements: [
      'Specific New Zealand university strengths',
      'Research opportunities in New Zealand',
      'How New Zealand education aligns with goals',
      'Interest in New Zealand culture/society'
    ],
    exampleGoodAnswer: `I chose New Zealand because the University of Auckland has one of the world's leading programs in marine biology, particularly in conservation research. The unique marine ecosystems and research facilities align perfectly with my goal to advance marine conservation. New Zealand's commitment to environmental protection also appeals to me as it reflects my values.`,
    exampleBadAnswer: `New Zealand has good universities and it's easier to get a visa.`
  },
  {
    visaType: 'new_zealand_student',
    category: 'finance',
    difficulty: 'hard',
    question: 'How will you support yourself during your studies in New Zealand?',
    contextTips: [
      'Officer needs to see financial stability',
      'Looking for realistic funding sources',
      'Testing if you understand New Zealand costs'
    ],
    redFlags: [
      'Unrealistic funding amounts',
      'Relying on part-time work only',
      'No clear funding source'
    ],
    idealElements: [
      'Specific funding amount',
      'Multiple funding sources',
      'Understanding of New Zealand living costs',
      'Backup funding plans'
    ],
    exampleGoodAnswer: `I have secured funding through multiple sources: my parents' savings of NZD $70,000, a scholarship from the university worth NZD $15,000 per year, and my own savings of NZD $12,000. This totals NZD $97,000 for my 2-year program, which covers tuition of NZD $50,000 and living expenses of NZD $47,000. I also have a letter of support from my cousin in Auckland who can provide emergency assistance if needed.`,
    exampleBadAnswer: `I'll work part-time and my family will help.`
  },
  // Germany Student Visa Questions
  {
    visaType: 'germany_student',
    category: 'education',
    difficulty: 'medium',
    question: 'Why did you choose Germany for your studies?',
    contextTips: [
      'Officer wants to see genuine interest in Germany',
      'Looking for specific reasons beyond generic answers',
      'Testing commitment to German education system'
    ],
    redFlags: [
      'Generic "Germany is good" answer',
      'Mentioning work opportunities primarily',
      'Saying "it was easier to get into"'
    ],
    idealElements: [
      'Specific German university strengths',
      'Research opportunities in Germany',
      'How German education aligns with goals',
      'Interest in German culture/society'
    ],
    exampleGoodAnswer: `I chose Germany because the Technical University of Munich has one of the world's leading programs in engineering, particularly in renewable energy research. The collaborative research environment and access to cutting-edge technology align perfectly with my goal to advance sustainable energy solutions. Germany's commitment to renewable energy also appeals to me as it reflects my career goals.`,
    exampleBadAnswer: `Germany has good universities and it's easier to get a visa.`
  },
  {
    visaType: 'germany_student',
    category: 'finance',
    difficulty: 'hard',
    question: 'How will you support yourself during your studies in Germany?',
    contextTips: [
      'Officer needs to see financial stability',
      'Looking for realistic funding sources',
      'Testing if you understand German costs'
    ],
    redFlags: [
      'Unrealistic funding amounts',
      'Relying on part-time work only',
      'No clear funding source'
    ],
    idealElements: [
      'Specific funding amount',
      'Multiple funding sources',
      'Understanding of German living costs',
      'Backup funding plans'
    ],
    exampleGoodAnswer: `I have secured funding through multiple sources: my parents' savings of €60,000, a scholarship from the university worth €10,000 per year, and my own savings of €8,000. This totals €78,000 for my 2-year program, which covers tuition of €40,000 and living expenses of €38,000. I also have a letter of support from my uncle in Munich who can provide emergency assistance if needed.`,
    exampleBadAnswer: `I'll work part-time and my family will help.`
  },
  // US B1/B2 Visitor Visa Questions
  {
    visaType: 'us_b1_b2',
    category: 'purpose',
    difficulty: 'medium',
    question: 'What is the purpose of your visit to the United States?',
    contextTips: [
      'Officer testing if you have legitimate purpose',
      'Looking for specific details',
      'Checking consistency with application'
    ],
    redFlags: [
      'Vague or unclear purpose',
      'Mentioning work or study',
      'Saying "I want to stay"'
    ],
    idealElements: [
      'Specific purpose (tourism, business, family visit)',
      'Clear timeline',
      'Evidence of return plans',
      'Consistent with application'
    ],
    exampleGoodAnswer: `I'm visiting the United States for tourism purposes. I plan to visit New York, Washington DC, and Los Angeles for 3 weeks to see famous landmarks, museums, and experience American culture. I have a detailed itinerary, hotel bookings, and a return ticket to Nigeria on [date]. I also have a letter from my employer confirming my leave and return to work.`,
    exampleBadAnswer: `I want to visit the US and maybe look for work.`
  },
  {
    visaType: 'us_b1_b2',
    category: 'ties',
    difficulty: 'hard',
    question: 'What are your ties to your home country?',
    contextTips: [
      'Officer testing if you\'ll overstay',
      'Looking for reasons to RETURN home',
      'Most important question for visitor visas'
    ],
    redFlags: [
      'Weak ties or none mentioned',
      'Say "I want to stay in US"',
      'No family/job/property ties',
      'Say "I\'ll figure it out"'
    ],
    idealElements: [
      'Family in home country',
      'Job waiting (letter from employer)',
      'Property/savings in home country',
      'Career plans back home',
      'Specific timeline to return'
    ],
    exampleGoodAnswer: `My parents and younger brother live in Lagos. My father works at [Company] and my mother is a teacher. We own a home in Victoria Island. Additionally, I have a stable job as a Software Engineer at [Company] in Lagos, and I have a letter from my employer confirming my leave and return to work. I also have bank statements showing my savings and investments in Nigeria.`,
    exampleBadAnswer: `I'm not sure yet where I'll live after my visit.`
  },
  // Canada Express Entry Questions
  {
    visaType: 'canada_express_entry',
    category: 'skills',
    difficulty: 'medium',
    question: 'What skills do you bring to Canada?',
    contextTips: [
      'Officer testing if you have valuable skills',
      'Looking for specific skills that benefit Canada',
      'Checking if you understand Canadian needs'
    ],
    redFlags: [
      'Vague or generic skills',
      'Skills not in demand in Canada',
      'No evidence of skills'
    ],
    idealElements: [
      'Specific skills in demand',
      'Evidence of experience',
      'How skills benefit Canada',
      'Plans to contribute'
    ],
    exampleGoodAnswer: `I bring expertise in software development, particularly in artificial intelligence and machine learning. I have 5 years of experience developing AI solutions for healthcare, which is a growing field in Canada. I also have experience in team leadership and project management. I plan to contribute to Canada's tech sector by working for a Canadian company and potentially starting my own AI company.`,
    exampleBadAnswer: `I have some computer skills.`
  },
  {
    visaType: 'canada_express_entry',
    category: 'integration',
    difficulty: 'medium',
    question: 'How do you plan to integrate into Canadian society?',
    contextTips: [
      'Officer testing if you understand Canadian culture',
      'Looking for specific integration plans',
      'Checking if you\'re committed to Canada'
    ],
    redFlags: [
      'Vague or no integration plans',
      'No mention of Canadian values',
      'Plans that don\'t make sense'
    ],
    idealElements: [
      'Specific integration activities',
      'Understanding of Canadian values',
      'Plans to learn English/French',
      'Community involvement plans'
    ],
    exampleGoodAnswer: `I plan to integrate into Canadian society by learning French to complement my English, joining local community groups, and volunteering with organizations that align with my values. I also plan to participate in cultural events and festivals to learn about Canadian traditions. I want to contribute to my local community through my professional skills and eventually become a Canadian citizen.`,
    exampleBadAnswer: `I'll just work and live there.`
  },
  {
    visaType: 'uk_family',
    category: 'relationship',
    difficulty: 'medium',
    question: 'What do you know about your partner\'s life in the UK?',
    contextTips: [
      'Officer testing genuine relationship',
      'Looking for specific knowledge',
      'Checking if you really know them'
    ],
    redFlags: [
      'Very vague answers',
      'Can\'t name their workplace',
      'Don\'t know their daily routine'
    ],
    idealElements: [
      'Specific details about their work',
      'Knowledge of their daily life',
      'Their friends and family',
      'Their future plans'
    ],
    exampleGoodAnswer: `Sarah works as a Senior Data Scientist at Microsoft in London. She lives in a flat in Canary Wharf and commutes by tube. She's close with her sister who lives in Manchester, and they visit each other monthly. She's planning to buy a house in the next two years and wants to start a family. I know her colleagues and have met her best friend Emma several times.`,
    exampleBadAnswer: `She works in tech and lives in London.`
  },
  {
    visaType: 'uk_family',
    category: 'finance',
    difficulty: 'hard',
    question: 'How will you support yourself in the UK?',
    contextTips: [
      'Officer needs to see financial stability',
      'Looking for realistic funding sources',
      'Testing if you understand UK costs'
    ],
    redFlags: [
      'Unrealistic funding amounts',
      'Relying on partner only',
      'No clear funding source'
    ],
    idealElements: [
      'Specific funding amount',
      'Multiple funding sources',
      'Understanding of UK living costs',
      'Backup funding plans'
    ],
    exampleGoodAnswer: `I have secured funding through multiple sources: my partner's salary of £45,000 per year, my own savings of £15,000, and a job offer as a Software Engineer at [Company] in London starting in 3 months with a salary of £35,000. This totals £95,000 per year, which covers our living expenses of £30,000 and leaves us with savings. I also have a letter of support from my partner's employer.`,
    exampleBadAnswer: `My partner will support me.`
  },
  {
    visaType: 'uk_family',
    category: 'ties',
    difficulty: 'medium',
    question: 'What are your plans for the future in the UK?',
    contextTips: [
      'Officer testing genuine intentions',
      'Looking for realistic plans',
      'Checking if you understand UK life'
    ],
    redFlags: [
      'Vague or unrealistic plans',
      'No mention of contributing to UK',
      'Plans that don\'t make sense'
    ],
    idealElements: [
      'Specific career plans',
      'How you\'ll contribute to UK',
      'Long-term goals',
      'Integration plans'
    ],
    exampleGoodAnswer: `I plan to work as a Software Engineer in London, contributing to the UK's tech sector. I want to eventually start my own AI company, creating jobs for British citizens. I also plan to volunteer with local charities and integrate into the community. My long-term goal is to become a British citizen and raise a family here.`,
    exampleBadAnswer: `I want to live in the UK and work.`
  },
  {
    visaType: 'uk_family',
    category: 'background',
    difficulty: 'easy',
    question: 'Tell me about your background.',
    contextTips: [
      'Open-ended question to establish rapport',
      'Officer listening for consistency',
      'Checking for red flags'
    ],
    redFlags: [
      'Contradicts application',
      'Mentions criminal history casually',
      'Shows uncertainty about own background'
    ],
    idealElements: [
      'Brief overview of education/work',
      'Family background',
      'Why you\'re interested in UK',
      'How it connects to your goals'
    ],
    exampleGoodAnswer: `I grew up in Lagos in a middle-class family. Both my parents emphasized education. I completed my Bachelor's in Computer Science at the University of Lagos, then worked as a Software Engineer at [Company] for 3 years. During this time, I met my partner Sarah at a tech conference. Now I want to join her in the UK and contribute to the British tech sector.`,
    exampleBadAnswer: `I'm from Nigeria and I want to go to the UK.`
  }
];

async function seedQuestions() {
  try {
    console.log('🌱 Seeding interview questions...');
    
    for (const question of interviewQuestions) {
      await prisma.interviewQuestion.create({
        data: {
          visaType: question.visaType,
          category: question.category,
          difficulty: question.difficulty,
          question: question.question,
          contextTips: question.contextTips,
          redFlags: question.redFlags,
          idealElements: question.idealElements,
          exampleGoodAnswer: question.exampleGoodAnswer,
          exampleBadAnswer: question.exampleBadAnswer
        }
      });
    }
    
    console.log('✅ Successfully seeded interview questions!');
    console.log(`📊 Added ${interviewQuestions.length} questions`);
    
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedQuestions();



