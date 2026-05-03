export interface GeneratedFile {
  path: string;
  content: string;
}

export interface ProjectGeneration {
  projectName: string;
  files: GeneratedFile[];
}

export class OpenAIService {
  static async generateProject(prompt: string, apiKey: string): Promise<ProjectGeneration> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo', // Ensure we use a model that supports JSON mode
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: `You are an expert AI software architect. Generate a complete, working software project based on the user's prompt.
            You MUST return ONLY valid JSON matching this exact structure:
            {
              "projectName": "app-name",
              "files": [
                { "path": "package.json", "content": "{...}" },
                { "path": "src/index.ts", "content": "..." }
              ]
            }
            Ensure all necessary configuration files and source code are included so the project can be run immediately. Use standard best practices.`
          },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate project from OpenAI');
    }
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content) as ProjectGeneration;
  }
}