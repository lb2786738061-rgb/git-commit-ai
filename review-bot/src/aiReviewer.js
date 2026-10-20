import OpenAI from 'openai';

export class AIReviewer {
  constructor(openaiConfig, reviewConfig) {
    this.openai = new OpenAI({
      apiKey: openaiConfig.apiKey,
      baseURL: openaiConfig.apiBase
    });
    this.model = openaiConfig.model;
    this.config = reviewConfig;
  }

  async review(diff, title, description) {
    // Check diff size
    if (diff.length > this.config.maxDiffSize) {
      return this.generateSkippedMessage('Diff too large to review');
    }

    // Filter blacklisted files
    const filteredDiff = this.filterBlacklistedFiles(diff);
    if (!filteredDiff) {
      return this.generateSkippedMessage('Only blacklisted files changed');
    }

    // Generate review
    const review = await this.generateAIReview(filteredDiff, title, description);

    return review;
  }

  filterBlacklistedFiles(diff) {
    if (this.config.blacklistedFiles.length === 0) {
      return diff;
    }

    const diffBlocks = diff.split(/(?=^diff --git )/m);
    const filtered = diffBlocks.filter(block => {
      const match = block.match(/^diff --git a\/(.+?) b\//);
      if (!match) return true;
      const filePath = match[1];
      return !this.config.blacklistedFiles.some(pattern =>
        filePath.includes(pattern) || filePath.match(pattern)
      );
    });

    return filtered.length > 0 ? filtered.join('') : null;
  }

  async generateAIReview(diff, title, description) {
    const language = this.config.language;
    const severity = this.config.severity;

    const systemPrompt = this.getSystemPrompt(language, severity);
    const userPrompt = this.getUserPrompt(diff, title, description);

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      return response.choices[0].message.content || this.generateDefaultReview();
    } catch (error) {
      console.error('[AI] Error generating review:', error);
      return this.generateErrorMessage(error.message);
    }
  }

  getSystemPrompt(language, severity) {
    const langMap = {
      'en': 'English',
      'zh': 'Chinese',
      'ja': 'Japanese'
    };

    const langName = langMap[language] || language;

    let severityLevel = '';
    if (severity === 'low') {
      severityLevel = 'be lenient and focus only on critical issues';
    } else if (severity === 'high') {
      severityLevel = 'be thorough and check even minor issues';
    } else {
      severityLevel = 'focus on important issues while being practical';
    }

    return `You are an expert code reviewer. Your task is to review pull request changes and provide constructive feedback.

Review criteria:
1. **Code Quality**: Check for clean, maintainable code
2. **Potential Bugs**: Identify logical errors, edge cases, null/undefined handling
3. **Performance**: Suggest optimizations if applicable
4. **Security**: Point out security vulnerabilities (SQL injection, XSS, etc.)
5. **Best Practices**: Ensure the code follows language/framework best practices

Guidelines:
- Write your review in ${langName}
- ${severityLevel}
- Be specific with line numbers and code examples
- Provide actionable suggestions
- Use a friendly, constructive tone
- Format your response in Markdown with clear sections

Response format:
\`\`\`markdown
## 🤖 AI Code Review

### Summary
[Brief summary of your overall assessment]

### 🔴 Critical Issues
[List any critical bugs or security issues with line references]

### 🟡 Suggestions
[List suggestions for improvements with code examples]

### 💡 Best Practices
[Any best practice recommendations]

### ✅ Good Practices
[Mention what was done well]
\`\`\``;
  }

  getUserPrompt(diff, title, description) {
    return `Review this pull request:

**Title**: ${title}
**Description**: ${description || 'No description provided'}

**Changes**:
\`\`\`diff
${diff}
\`\`\`

Please provide a comprehensive code review following the format specified in the system prompt.`;
  }

  generateSkippedMessage(reason) {
    return `## 🤖 AI Code Review

⚠️ **Review Skipped**: ${reason}

This review was automatically skipped because the changes don't meet the review criteria.

If you want a manual review, please request it from your team.`;
  }

  generateDefaultReview() {
    return `## 🤖 AI Code Review

✅ **No Issues Found**

The code looks good! No critical issues were detected in this pull request.

Keep up the good work! 👍`;
  }

  generateErrorMessage(error) {
    return `## 🤖 AI Code Review

❌ **Review Failed**

An error occurred while generating the review: ${error}

Please check the bot configuration and try again.`;
  }
}
