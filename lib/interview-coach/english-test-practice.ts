export const ENGLISH_TESTS = {
  ielts: {
    name: 'IELTS (International English Language Testing System)',
    short_name: 'IELTS',
    required_for: ['canada_study', 'uk_family', 'australia_study', 'ireland_study'],
    sections: ['listening', 'reading', 'writing', 'speaking'],
    scoring: {
      min: 0,
      max: 9,
      passing_band: {
        'canada_study': 6.0,
        'uk_family': 5.5,
        'australia_study': 5.5,
        'ireland_study': 5.0
      }
    },
    test_duration_minutes: 170,
    speaking_duration_minutes: 11,
    cost_usd: 300
  },
  
  toefl: {
    name: 'TOEFL iBT (Test of English as a Foreign Language)',
    short_name: 'TOEFL',
    required_for: ['us_f1', 'canada_study'],
    sections: ['reading', 'listening', 'speaking', 'writing'],
    scoring: {
      min: 0,
      max: 120,
      passing_score: {
        'us_f1': 80, // varies by university
        'canada_study': 83
      }
    },
    test_duration_minutes: 180,
    speaking_duration_minutes: 17,
    cost_usd: 280
  },
  
  celpip: {
    name: 'CELPIP (Canadian English Language Proficiency Index Program)',
    short_name: 'CELPIP',
    required_for: ['canada_study'],
    sections: ['listening', 'reading', 'writing', 'speaking'],
    scoring: {
      min: 0,
      max: 12,
      passing_level: {
        'canada_study': 7 // CLB 7 equivalent to IELTS 6.0
      }
    },
    test_duration_minutes: 120,
    speaking_duration_minutes: 16,
    cost_usd: 300
  }
};

// IELTS Speaking Test Questions by Band Level
export const IELTS_SPEAKING_QUESTIONS = {
  part1: {
    name: 'Personal Introduction (4-5 minutes)',
    description: 'The examiner asks you questions about yourself, your home, work, studies, and interests.',
    topics: [
      'Hometown and where you live',
      'Work and career',
      'Studies and education',
      'Family',
      'Hobbies and interests',
      'Plans for the future'
    ],
    example_questions: [
      'Tell me about your hometown.',
      'What do you do for work/study?',
      'What are your hobbies?',
      'What are your future plans?',
      'Do you like living in your city?',
      'What do you like most about your job?',
      'How do you spend your weekends?',
      'What kind of music do you like?'
    ]
  },
  
  part2: {
    name: 'Individual Long Turn (3-4 minutes)',
    description: 'You get a topic card and speak for 1-2 minutes about it. You have 1 minute to prepare.',
    example_topics: [
      'Describe a person who has been an important influence on your life',
      'Describe a place you have visited that was important to you',
      'Describe a skill you have learned',
      'Describe a time when you felt proud',
      'Describe a book you have read recently',
      'Describe a memorable journey you have taken',
      'Describe a piece of technology you use regularly',
      'Describe a festival or celebration in your country'
    ]
  },
  
  part3: {
    name: 'Discussion (4-5 minutes)',
    description: 'Deeper discussion about the Part 2 topic with more abstract questions.',
    example_follow_ups: [
      'Why is this person/place important to you?',
      'What impact did this have on your life?',
      'Do you think others would agree with you?',
      'What would you do differently now?',
      'How has this changed over time?',
      'What are the advantages and disadvantages?',
      'How do you think this will change in the future?',
      'What role does this play in society?'
    ]
  }
};

// TOEFL Speaking Test Structure
export const TOEFL_SPEAKING_SECTIONS = {
  task1: {
    name: 'Personal Choice (15 seconds prep, 45 seconds speak)',
    description: 'Choose between two options and explain your choice',
    example: 'Do you prefer studying alone or with others? Explain why.',
    tips: [
      'Choose one option clearly',
      'Give 2-3 specific reasons',
      'Use personal examples',
      'Speak for the full 45 seconds'
    ]
  },
  
  task2: {
    name: 'Personal Preference (15 seconds prep, 45 seconds speak)',
    description: 'Express your opinion on a general topic',
    example: 'Some people like adventure and risk. Others prefer safety and security. Which do you prefer?',
    tips: [
      'State your preference clearly',
      'Give specific reasons',
      'Use examples from your experience',
      'Stay focused on the topic'
    ]
  },
  
  task3: {
    name: 'Campus Situation + Opinion (30 seconds read, 30 seconds prep, 60 seconds speak)',
    description: 'Read about a campus situation, listen to a discussion, then explain the student\'s opinion',
    example: 'Reading: Campus announcement about new study rooms\nListening: Student discussing it\nYour task: Explain the student\'s opinion about the announcement',
    tips: [
      'Summarize the situation briefly',
      'Focus on the student\'s opinion',
      'Include specific details from the conversation',
      'Use your own words'
    ]
  },
  
  task4: {
    name: 'Academic Content (30 seconds read, 30 seconds prep, 60 seconds speak)',
    description: 'Read about an academic concept, listen to a lecture, then explain the concept using examples',
    example: 'Reading: Definition of "Selective Attention"\nListening: Professor giving examples\nYour task: Explain what selective attention is using examples',
    tips: [
      'Define the concept clearly',
      'Use the examples from the lecture',
      'Connect the examples to the definition',
      'Show understanding of the concept'
    ]
  }
};

// CELPIP Speaking Test Structure
export const CELPIP_SPEAKING_SECTIONS = {
  task1: {
    name: 'Giving Advice (30 seconds prep, 90 seconds speak)',
    description: 'Give advice to someone in a specific situation',
    example: 'Your friend is moving to a new city for work. Give them advice about finding accommodation.',
    tips: [
      'Be practical and helpful',
      'Give 3-4 specific pieces of advice',
      'Use clear, direct language',
      'Consider different aspects of the situation'
    ]
  },
  
  task2: {
    name: 'Talking about a Personal Experience (30 seconds prep, 60 seconds speak)',
    description: 'Describe a personal experience related to the topic',
    example: 'Talk about a time when you had to solve a difficult problem.',
    tips: [
      'Use the past tense correctly',
      'Include specific details',
      'Explain what you learned',
      'Keep it relevant to the topic'
    ]
  },
  
  task3: {
    name: 'Describing a Scene (30 seconds prep, 60 seconds speak)',
    description: 'Describe what you see in a picture',
    example: 'Look at this picture and describe what you see.',
    tips: [
      'Describe from left to right or top to bottom',
      'Include people, objects, and activities',
      'Use present continuous tense',
      'Be specific and detailed'
    ]
  },
  
  task4: {
    name: 'Making Predictions (30 seconds prep, 60 seconds speak)',
    description: 'Make predictions about what might happen next',
    example: 'Look at this picture and predict what might happen next.',
    tips: [
      'Use future tense and modal verbs',
      'Base predictions on what you see',
      'Give logical reasons',
      'Consider different possibilities'
    ]
  },
  
  task5: {
    name: 'Comparing and Persuading (30 seconds prep, 60 seconds speak)',
    description: 'Compare two options and persuade someone to choose one',
    example: 'Compare two vacation destinations and persuade your friend to choose one.',
    tips: [
      'Present both options fairly',
      'Give clear reasons for your preference',
      'Use persuasive language',
      'Consider your friend\'s interests'
    ]
  },
  
  task6: {
    name: 'Dealing with a Difficult Situation (30 seconds prep, 60 seconds speak)',
    description: 'Explain how you would handle a difficult situation',
    example: 'Your colleague is always late for meetings. How would you handle this situation?',
    tips: [
      'Be diplomatic and professional',
      'Suggest practical solutions',
      'Consider the other person\'s perspective',
      'Use appropriate language for the workplace'
    ]
  },
  
  task7: {
    name: 'Expressing Opinions (30 seconds prep, 90 seconds speak)',
    description: 'Express your opinion on a topic and support it with reasons',
    example: 'Do you think social media has a positive or negative impact on society?',
    tips: [
      'State your opinion clearly',
      'Give 2-3 strong reasons',
      'Use examples to support your points',
      'Consider counterarguments'
    ]
  }
};

// Country-specific English test requirements
export const COUNTRY_ENGLISH_REQUIREMENTS = {
  canada: {
    study_permit: {
      ielts: { overall: 6.0, each_band: 5.5 },
      toefl: { overall: 83, writing: 20, speaking: 20, listening: 20, reading: 20 },
      celpip: { overall: 7, each_skill: 7 }
    },
    work_permit: {
      ielts: { overall: 5.0, each_band: 4.0 },
      celpip: { overall: 5, each_skill: 5 }
    },
    express_entry: {
      ielts: { overall: 6.0, each_band: 5.5 },
      celpip: { overall: 7, each_skill: 7 }
    }
  },
  uk: {
    student_visa: {
      ielts: { overall: 5.5, each_band: 5.5 },
      toefl: { overall: 72, writing: 17, speaking: 20, listening: 17, reading: 18 }
    },
    family_visa: {
      ielts: { overall: 4.0, each_band: 4.0 },
      toefl: { overall: 60, writing: 15, speaking: 18, listening: 15, reading: 15 }
    },
    work_visa: {
      ielts: { overall: 6.0, each_band: 5.5 },
      toefl: { overall: 80, writing: 20, speaking: 20, listening: 20, reading: 20 }
    }
  },
  australia: {
    student_visa: {
      ielts: { overall: 5.5, each_band: 5.0 },
      toefl: { overall: 46, writing: 14, speaking: 14, listening: 12, reading: 12 }
    },
    skilled_visa: {
      ielts: { overall: 6.0, each_band: 5.0 },
      toefl: { overall: 60, writing: 18, speaking: 18, listening: 18, reading: 18 }
    },
    partner_visa: {
      ielts: { overall: 4.5, each_band: 4.0 },
      toefl: { overall: 32, writing: 14, speaking: 14, listening: 12, reading: 12 }
    }
  },
  ireland: {
    study_visa: {
      ielts: { overall: 5.0, each_band: 4.5 },
      toefl: { overall: 61, writing: 15, speaking: 15, listening: 15, reading: 15 }
    },
    work_permit: {
      ielts: { overall: 6.0, each_band: 5.5 },
      toefl: { overall: 80, writing: 20, speaking: 20, listening: 20, reading: 20 }
    }
  },
  usa: {
    f1_student: {
      toefl: { overall: 80, each_section: 20 }, // varies by university
      ielts: { overall: 6.5, each_band: 6.0 } // varies by university
    },
    b1_b2_visitor: {
      ielts: { overall: 4.0, each_band: 4.0 },
      toefl: { overall: 60, writing: 15, speaking: 18, listening: 15, reading: 15 }
    },
    h1b_work: {
      ielts: { overall: 6.0, each_band: 5.5 },
      toefl: { overall: 80, writing: 20, speaking: 20, listening: 20, reading: 20 }
    }
  },
  new_zealand: {
    student_visa: {
      ielts: { overall: 5.5, each_band: 5.0 },
      toefl: { overall: 46, writing: 14, speaking: 14, listening: 12, reading: 12 }
    },
    skilled_migrant: {
      ielts: { overall: 6.5, each_band: 6.0 },
      toefl: { overall: 80, writing: 20, speaking: 20, listening: 20, reading: 20 }
    },
    partner_visa: {
      ielts: { overall: 4.5, each_band: 4.0 },
      toefl: { overall: 32, writing: 14, speaking: 14, listening: 12, reading: 12 }
    }
  },
  germany: {
    student_visa: {
      ielts: { overall: 5.5, each_band: 5.0 },
      toefl: { overall: 60, writing: 18, speaking: 18, listening: 18, reading: 18 }
    },
    work_visa: {
      ielts: { overall: 6.0, each_band: 5.5 },
      toefl: { overall: 80, writing: 20, speaking: 20, listening: 20, reading: 20 }
    }
  },
  netherlands: {
    student_visa: {
      ielts: { overall: 6.0, each_band: 5.5 },
      toefl: { overall: 80, writing: 20, speaking: 20, listening: 20, reading: 20 }
    },
    work_visa: {
      ielts: { overall: 6.0, each_band: 5.5 },
      toefl: { overall: 80, writing: 20, speaking: 20, listening: 20, reading: 20 }
    }
  },
  singapore: {
    student_pass: {
      ielts: { overall: 6.0, each_band: 5.5 },
      toefl: { overall: 80, writing: 20, speaking: 20, listening: 20, reading: 20 }
    },
    work_permit: {
      ielts: { overall: 6.0, each_band: 5.5 },
      toefl: { overall: 80, writing: 20, speaking: 20, listening: 20, reading: 20 }
    }
  },
  uae: {
    student_visa: {
      ielts: { overall: 5.5, each_band: 5.0 },
      toefl: { overall: 60, writing: 18, speaking: 18, listening: 18, reading: 18 }
    },
    work_visa: {
      ielts: { overall: 6.0, each_band: 5.5 },
      toefl: { overall: 80, writing: 20, speaking: 20, listening: 20, reading: 20 }
    }
  },
  japan: {
    student_visa: {
      ielts: { overall: 5.5, each_band: 5.0 },
      toefl: { overall: 60, writing: 18, speaking: 18, listening: 18, reading: 18 }
    },
    work_visa: {
      ielts: { overall: 6.0, each_band: 5.5 },
      toefl: { overall: 80, writing: 20, speaking: 20, listening: 20, reading: 20 }
    }
  },
  south_korea: {
    student_visa: {
      ielts: { overall: 5.5, each_band: 5.0 },
      toefl: { overall: 60, writing: 18, speaking: 18, listening: 18, reading: 18 }
    },
    work_visa: {
      ielts: { overall: 6.0, each_band: 5.5 },
      toefl: { overall: 80, writing: 20, speaking: 20, listening: 20, reading: 20 }
    }
  }
};

// Export helper functions
export function getTestRequirements(country: string, visaType: string) {
  return COUNTRY_ENGLISH_REQUIREMENTS[country]?.[visaType] || null;
}

export function getTestForCountry(country: string, visaType: string) {
  const requirements = getTestRequirements(country, visaType);
  if (!requirements) return null;
  
  const availableTests = Object.keys(requirements);
  return availableTests.map(test => ({
    test,
    ...ENGLISH_TESTS[test],
    requirements: requirements[test]
  }));
}

export function getIELTSQuestions(part: number) {
  return IELTS_SPEAKING_QUESTIONS[`part${part}`];
}

export function getTOEFLQuestions(task: number) {
  return TOEFL_SPEAKING_SECTIONS[`task${task}`];
}

export function getCELPIPQuestions(task: number) {
  return CELPIP_SPEAKING_SECTIONS[`task${task}`];
}


