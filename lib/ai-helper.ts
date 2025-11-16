/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/ai-helper.ts - Fallback AI system
export class AIHelper {
  private static adviceTemplates = {
    study: [
      "Focus on understanding concepts rather than memorization. This will help you in the long run.",
      "Create a consistent study schedule. Even 1-2 hours daily is better than cramming.",
      "Practice with previous year papers and sample questions to understand the exam pattern.",
      "Form study groups with classmates to discuss difficult topics and share knowledge.",
      "Don't hesitate to ask your professors for clarification on topics you find challenging."
    ],
    time: [
      "Use a planner or digital calendar to organize your tasks and deadlines.",
      "Break large projects into smaller, manageable tasks with specific deadlines.",
      "Prioritize your assignments based on due dates and importance.",
      "Avoid multitasking - focus on one subject or task at a time for better efficiency.",
      "Schedule regular breaks to avoid burnout and maintain productivity."
    ],
    general: [
      "Balance your academic work with extracurricular activities for overall development.",
      "Take care of your physical and mental health - it's crucial for academic success.",
      "Build relationships with professors and seniors who can guide you.",
      "Participate in class discussions and practical sessions actively.",
      "Start preparing for exams well in advance to reduce last-minute stress."
    ]
  };

  static generateFallbackAdvice(question: string, context: any): string {
    const lowerQuestion = question.toLowerCase();
    
    // Categorize the question
    let category: 'study' | 'time' | 'general' = 'general';
    
    if (lowerQuestion.includes('study') || lowerQuestion.includes('exam') || 
        lowerQuestion.includes('subject') || lowerQuestion.includes('learn')) {
      category = 'study';
    } else if (lowerQuestion.includes('time') || lowerQuestion.includes('schedule') ||
               lowerQuestion.includes('manage') || lowerQuestion.includes('balance')) {
      category = 'time';
    }

    // Get relevant templates
    const templates = [...this.adviceTemplates[category], ...this.adviceTemplates.general];
    
    // Select 2-3 random but relevant templates
    const selectedTemplates = this.shuffleArray(templates).slice(0, 3);
    
    return `Hello! As a senior ${context.discipline} student from batch ${context.batch}, here's my advice:

${selectedTemplates.join('\n\n')}

Remember that every student's journey is unique. Adapt these suggestions to what works best for you!`;
  }

  static generateFallbackSummary(advices: string[]): string {
    if (advices.length === 0) {
      return "No advice available yet. Senior students haven't shared their insights - check back later!";
    }

    const keyThemes = this.analyzeThemes(advices);
    
    return `# Advice Summary from ${advices.length} Senior Students

## Key Insights from Your Seniors:

${keyThemes.map(theme => `• ${theme}`).join('\n')}

## Most Common Recommendations:
1. **Stay Consistent** - Regular study beats last-minute cramming
2. **Practice Regularly** - Apply knowledge through projects and exercises  
3. **Seek Help** - Don't hesitate to ask professors and peers
4. **Manage Time** - Balance academics with personal life effectively

## Words of Wisdom:
"${this.getRandomWisdom()}"

Use this advice as guidance, but remember to find your own path to success!`;
  }

  private static shuffleArray(array: any[]): any[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  private static analyzeThemes(advices: string[]): string[] {
    const themes = new Set<string>();
    
    advices.forEach(advice => {
      if (advice.toLowerCase().includes('study') || advice.toLowerCase().includes('learn')) {
        themes.add('Focus on consistent learning habits');
      }
      if (advice.toLowerCase().includes('time') || advice.toLowerCase().includes('schedule')) {
        themes.add('Effective time management is crucial');
      }
      if (advice.toLowerCase().includes('practice') || advice.toLowerCase().includes('project')) {
        themes.add('Practical application reinforces learning');
      }
      if (advice.toLowerCase().includes('professor') || advice.toLowerCase().includes('help')) {
        themes.add('Don\'t hesitate to seek guidance');
      }
      if (advice.toLowerCase().includes('balance') || advice.toLowerCase().includes('health')) {
        themes.add('Maintain work-life balance');
      }
    });

    // Add default themes if none found
    if (themes.size === 0) {
      themes.add('Consistent effort leads to better results');
      themes.add('Practical experience complements theoretical knowledge');
      themes.add('Seeking help when needed shows strength, not weakness');
    }

    return Array.from(themes);
  }

  private static getRandomWisdom(): string {
    const wisdom = [
      "The expert in anything was once a beginner.",
      "Success is the sum of small efforts repeated day in and day out.",
      "Don't let what you cannot do interfere with what you can do.",
      "The beautiful thing about learning is that no one can take it away from you.",
      "Education is the most powerful weapon which you can use to change the world."
    ];
    return wisdom[Math.floor(Math.random() * wisdom.length)];
  }
}