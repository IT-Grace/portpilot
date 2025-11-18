import { Octokit } from "@octokit/rest";
import OpenAI from "openai";

interface ProjectAnalysis {
  summary: string;
  detailedDescription: string;
  features: string[];
  techStack: {
    framework?: string;
    runtime?: string;
    packageManager?: string;
    database?: string;
    styling?: string;
    deployment?: string;
  };
  projectType:
    | "web-app"
    | "mobile-app"
    | "cli-tool"
    | "library"
    | "api"
    | "desktop-app"
    | "game"
    | "other";
  suggestedImages: {
    type:
      | "dashboard"
      | "mobile"
      | "terminal"
      | "landing"
      | "admin"
      | "interface"
      | "screenshot";
    prompt: string;
  }[];
  demoUrl?: string;
  keyInsights: string[];
}

export class ProjectAnalyzer {
  private openai: OpenAI;
  private octokit: Octokit;

  constructor(openaiApiKey: string, githubToken: string) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.octokit = new Octokit({ auth: githubToken });
  }

  async analyzeRepository(
    owner: string,
    repo: string
  ): Promise<ProjectAnalysis> {
    try {
      // 1. Fetch repository metadata
      const repoData = await this.fetchRepositoryData(owner, repo);

      // 2. Analyze code structure
      const codeAnalysis = await this.analyzeCodeStructure(owner, repo);

      // 3. Generate AI analysis
      const aiAnalysis = await this.generateAIAnalysis(repoData, codeAnalysis);

      return aiAnalysis;
    } catch (error) {
      console.error(`Error analyzing repository ${owner}/${repo}:`, error);
      throw error;
    }
  }

  private async fetchRepositoryData(owner: string, repo: string) {
    const [repoInfo, languages, readme, packageJson] = await Promise.allSettled(
      [
        this.octokit.repos.get({ owner, repo }),
        this.octokit.repos.listLanguages({ owner, repo }),
        this.getFileContent(owner, repo, "README.md"),
        this.getFileContent(owner, repo, "package.json"), //TODO: THIS MIGHT NOT BE ENOUGH
      ]
    );

    return {
      repo: repoInfo.status === "fulfilled" ? repoInfo.value.data : null,
      languages: languages.status === "fulfilled" ? languages.value.data : {},
      readme: readme.status === "fulfilled" ? readme.value : null,
      packageJson:
        packageJson.status === "fulfilled" ? packageJson.value : null,
    };
  }

  private async getFileContent(
    owner: string,
    repo: string,
    path: string
  ): Promise<string | null> {
    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if ("content" in response.data) {
        return Buffer.from(response.data.content, "base64").toString("utf-8");
      }
      return null;
    } catch {
      return null;
    }
  }

  private async analyzeCodeStructure(owner: string, repo: string) {
    try {
      // Get repository tree structure
      const tree = await this.octokit.git.getTree({
        owner,
        repo,
        tree_sha: "HEAD",
        recursive: "true",
      });

      const files = tree.data.tree
        .filter((item) => item.type === "blob")
        .map((item) => item.path)
        .slice(0, 50); // Limit to first 50 files

      return {
        files,
        hasDockerfile: files.some((f) => f?.includes("Dockerfile")),
        hasTests: files.some((f) => f?.includes("test") || f?.includes("spec")),
        hasCi: files.some(
          (f) => f?.includes(".github/workflows") || f?.includes(".ci")
        ),
        frameworks: this.detectFrameworks(files),
      };
    } catch (error) {
      return {
        files: [],
        hasDockerfile: false,
        hasTests: false,
        hasCi: false,
        frameworks: [],
      };
    }
  }

  private detectFrameworks(files: string[]): string[] {
    const frameworks: string[] = [];

    // Frontend frameworks
    if (files.some((f) => f?.includes("next.config") || f?.includes("pages/")))
      frameworks.push("Next.js");
    if (
      files.some(
        (f) => f?.includes("vite.config") || f?.includes("src/App.vue")
      )
    )
      frameworks.push("Vue.js");
    if (
      files.some((f) => f?.includes("angular.json") || f?.includes("src/app/"))
    )
      frameworks.push("Angular");
    if (
      files.some((f) => f?.includes("src/App.js") || f?.includes("src/App.tsx"))
    )
      frameworks.push("React");

    // Backend frameworks
    if (
      files.some(
        (f) => f?.includes("app.py") || f?.includes("requirements.txt")
      )
    )
      frameworks.push("Flask/Django");
    if (files.some((f) => f?.includes("server.js") || f?.includes("app.js")))
      frameworks.push("Express.js");
    if (files.some((f) => f?.includes("Gemfile") || f?.includes("config.ru")))
      frameworks.push("Ruby on Rails");

    // Mobile
    if (files.some((f) => f?.includes("pubspec.yaml")))
      frameworks.push("Flutter");
    if (files.some((f) => f?.includes("App.js") && f?.includes("android/")))
      frameworks.push("React Native");

    return frameworks;
  }

  private async generateAIAnalysis(
    repoData: any,
    codeAnalysis: any
  ): Promise<ProjectAnalysis> {
    const prompt = `
You are an expert software analyst creating compelling portfolio content. Analyze this GitHub repository and provide comprehensive, professional analysis:

Repository Info:
- Name: ${repoData.repo?.name}
- Description: ${repoData.repo?.description}
- Languages: ${JSON.stringify(repoData.languages, null, 2)}
- Stars: ${repoData.repo?.stargazers_count}
- Forks: ${repoData.repo?.forks_count}

Code Structure:
- Files: ${codeAnalysis.files.slice(0, 20).join(", ")}
- Has Docker: ${codeAnalysis.hasDockerfile}
- Has Tests: ${codeAnalysis.hasTests}
- Detected Frameworks: ${codeAnalysis.frameworks.join(", ")}

README Content (first 2000 chars):
${repoData.readme?.substring(0, 2000) || "No README found"}

Package.json (if available):
${repoData.packageJson?.substring(0, 1000) || "No package.json found"}

Please provide a JSON response with:
1. summary: A compelling, professional 3-4 sentence description that highlights the project's value proposition and key capabilities. Make it sound impressive and polished.
2. detailedDescription: A comprehensive 4-6 paragraph description covering project overview, technical implementation, key features, architecture decisions, and impact/benefits. This will be shown in a detailed modal dialog.
3. features: Array of 4-6 specific, technical features extracted from code analysis and README (e.g., "Real-time data synchronization", "RESTful API integration", "Responsive mobile-first design")
4. techStack: Detailed tech stack with specific versions/tools when possible
5. projectType: Classification (web-app, mobile-app, cli-tool, library, api, desktop-app, game, other)
6. suggestedImages: Array of 2-3 detailed image prompts for generating realistic application screenshots:
   - For web apps: dashboard/main interface, features page, mobile view
   - For mobile apps: main screen, feature screens, UI interactions
   - For tools/libraries: terminal/console output, code examples, documentation
   Make prompts very specific about UI elements, colors, layout, and functionality shown
7. keyInsights: Technical highlights about architecture, performance, scalability, or innovation
8. demoUrl: If homepage exists, use it; otherwise suggest a likely demo URL pattern

Create content that makes this project stand out in a professional portfolio. Focus on technical depth and business value.

Format as valid JSON matching the ProjectAnalysis interface.
`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error("No response from OpenAI");

    try {
      return JSON.parse(response) as ProjectAnalysis;
    } catch (error) {
      console.error("Failed to parse AI response:", response);
      throw new Error("Invalid JSON response from AI");
    }
  }
}
