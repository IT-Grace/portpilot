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

// Override with OPENAI_MODEL; must support JSON mode (response_format).
const DEFAULT_MODEL = "gpt-5.4-mini";
const OPENAI_TIMEOUT_MS = 60_000;

// Dependency/build manifests worth showing the model, in priority order.
const MANIFEST_FILES = [
  "package.json",
  "requirements.txt",
  "pyproject.toml",
  "go.mod",
  "Cargo.toml",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "Gemfile",
  "composer.json",
  "pubspec.yaml",
  "*.csproj",
];
const MAX_MANIFESTS = 3;
const MAX_MANIFEST_CHARS = 1500;
const MAX_README_CHARS = 4000;
const MAX_PROMPT_FILES = 60;

export class ProjectAnalyzer {
  private openai: OpenAI;
  private octokit: Octokit;
  private model: string;

  constructor(openaiApiKey: string, githubToken: string) {
    this.openai = new OpenAI({
      apiKey: openaiApiKey,
      timeout: OPENAI_TIMEOUT_MS,
      maxRetries: 1,
    });
    this.octokit = new Octokit({ auth: githubToken });
    this.model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
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

      // Only ever link to the repo's real homepage, never an AI guess
      aiAnalysis.demoUrl = repoData.repo?.homepage || undefined;

      return aiAnalysis;
    } catch (error) {
      console.error(`Error analyzing repository ${owner}/${repo}:`, error);
      throw error;
    }
  }

  private async fetchRepositoryData(owner: string, repo: string) {
    const [repoInfo, languages, readme] = await Promise.allSettled([
      this.octokit.repos.get({ owner, repo }),
      this.octokit.repos.listLanguages({ owner, repo }),
      this.getReadme(owner, repo),
    ]);

    return {
      repo: repoInfo.status === "fulfilled" ? repoInfo.value.data : null,
      languages: languages.status === "fulfilled" ? languages.value.data : {},
      readme: readme.status === "fulfilled" ? readme.value : null,
    };
  }

  // GitHub's README endpoint finds README.md, readme.rst, docs/README, etc.
  private async getReadme(owner: string, repo: string): Promise<string | null> {
    try {
      const response = await this.octokit.repos.getReadme({ owner, repo });
      return Buffer.from(response.data.content, "base64").toString("utf-8");
    } catch {
      return null;
    }
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
        .filter((item) => item.type === "blob" && item.path)
        .map((item) => item.path as string)
        .filter((path) => !/(^|\/)(node_modules|vendor|dist|build)\//.test(path));

      const manifests = await this.fetchManifests(owner, repo, files);

      return {
        files,
        manifests,
        hasDockerfile: files.some((f) => /(^|\/)Dockerfile/.test(f)),
        hasTests: files.some((f) =>
          /(^|\/)(tests?|__tests__|spec)\/|\.(test|spec)\.[a-z]+$|_test\.(go|py)$/.test(
            f
          )
        ),
        hasCi: files.some(
          (f) => f.startsWith(".github/workflows/") || f === ".gitlab-ci.yml"
        ),
        frameworks: this.detectFrameworks(files),
      };
    } catch (error) {
      return {
        files: [] as string[],
        manifests: [] as { path: string; content: string }[],
        hasDockerfile: false,
        hasTests: false,
        hasCi: false,
        frameworks: [] as string[],
      };
    }
  }

  // Fetch the most relevant manifests, preferring ones nearest the repo root.
  private async fetchManifests(owner: string, repo: string, files: string[]) {
    const byDepth = [...files].sort(
      (a, b) => a.split("/").length - b.split("/").length
    );
    const paths: string[] = [];
    for (const name of MANIFEST_FILES) {
      const match = byDepth.find((path) => {
        const base = path.split("/").pop()!;
        return name.startsWith("*")
          ? base.endsWith(name.slice(1))
          : base === name;
      });
      if (match) paths.push(match);
      if (paths.length >= MAX_MANIFESTS) break;
    }

    const contents = await Promise.all(
      paths.map((path) => this.getFileContent(owner, repo, path))
    );
    return paths
      .map((path, i) => ({
        path,
        content: contents[i]?.substring(0, MAX_MANIFEST_CHARS) ?? "",
      }))
      .filter((manifest) => manifest.content);
  }

  private detectFrameworks(files: string[]): string[] {
    const frameworks: string[] = [];
    const has = (pattern: RegExp) => files.some((f) => pattern.test(f));

    // Frontend frameworks
    if (has(/(^|\/)next\.config\.(js|mjs|ts)$/)) frameworks.push("Next.js");
    if (has(/\.vue$/)) frameworks.push("Vue.js");
    if (has(/(^|\/)angular\.json$/)) frameworks.push("Angular");
    if (has(/(^|\/)svelte\.config\.(js|ts)$/)) frameworks.push("Svelte");
    if (has(/\.(jsx|tsx)$/)) frameworks.push("React");
    if (has(/(^|\/)vite\.config\.(js|ts|mjs)$/)) frameworks.push("Vite");

    // Backend frameworks
    if (has(/(^|\/)manage\.py$/)) frameworks.push("Django");
    if (has(/(^|\/)config\.ru$/)) frameworks.push("Ruby on Rails");
    if (has(/(^|\/)artisan$/)) frameworks.push("Laravel");

    // Mobile
    if (has(/(^|\/)pubspec\.yaml$/)) frameworks.push("Flutter");
    if (has(/(^|\/)app\.json$/) && has(/(^|\/)android\//))
      frameworks.push("React Native");

    return frameworks;
  }

  private async generateAIAnalysis(
    repoData: any,
    codeAnalysis: Awaited<ReturnType<ProjectAnalyzer["analyzeCodeStructure"]>>
  ): Promise<ProjectAnalysis> {
    const manifests =
      codeAnalysis.manifests
        .map((m) => `--- ${m.path} ---\n${m.content}`)
        .join("\n\n") || "None found";

    const prompt = `
You are writing portfolio content for a developer's GitHub project. Use ONLY the information below. Do not invent features, technologies, users, metrics or URLs that are not supported by it. If the information is thin, write less rather than padding. Write in a clear, professional tone; avoid hype and generic filler such as "demonstrates modern development practices".

Repository Info:
- Name: ${repoData.repo?.name}
- Description: ${repoData.repo?.description || "None"}
- Topics: ${(repoData.repo?.topics || []).join(", ") || "None"}
- Homepage: ${repoData.repo?.homepage || "None"}
- Languages (bytes): ${JSON.stringify(repoData.languages)}
- Stars: ${repoData.repo?.stargazers_count}, Forks: ${repoData.repo?.forks_count}

Code Structure (${codeAnalysis.files.length} files):
- Sample paths: ${codeAnalysis.files.slice(0, MAX_PROMPT_FILES).join(", ")}
- Has Dockerfile: ${codeAnalysis.hasDockerfile}
- Has tests: ${codeAnalysis.hasTests}
- Has CI: ${codeAnalysis.hasCi}
- Detected frameworks: ${codeAnalysis.frameworks.join(", ") || "None"}

Manifests:
${manifests}

README (first ${MAX_README_CHARS} chars):
${repoData.readme?.substring(0, MAX_README_CHARS) || "No README found"}

Respond with a JSON object with exactly these keys:
- "summary": 2-3 sentences on what the project is and does.
- "detailedDescription": 2-4 short paragraphs (separated by \\n\\n) covering purpose, how it is built, and notable implementation details.
- "features": array of 3-6 specific features evidenced by the README, code structure or manifests.
- "techStack": object with any of "framework", "runtime", "packageManager", "database", "styling", "deployment" that are evidenced; omit unknown keys.
- "projectType": one of "web-app", "mobile-app", "cli-tool", "library", "api", "desktop-app", "game", "other".
- "suggestedImages": array of 1-3 objects { "type": one of "dashboard", "mobile", "terminal", "landing", "admin", "interface", "screenshot"; "prompt": a description of a realistic screenshot of this project }.
- "keyInsights": array of 2-3 concrete technical observations.
`;

    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      reasoning_effort: "low",
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error("No response from OpenAI");

    let parsed: any;
    try {
      parsed = JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse AI response:", response);
      throw new Error("Invalid JSON response from AI");
    }

    if (
      typeof parsed.summary !== "string" ||
      typeof parsed.detailedDescription !== "string" ||
      !Array.isArray(parsed.features)
    ) {
      console.error("AI response missing required fields:", response);
      throw new Error("Incomplete response from AI");
    }

    const strings = (value: unknown) =>
      Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : [];

    // Themes render each tech stack value as text, so flatten lists
    // (e.g. ["React", "Vite"]) to a string and drop anything else.
    const techStack: ProjectAnalysis["techStack"] = {};
    if (parsed.techStack && typeof parsed.techStack === "object") {
      for (const [key, value] of Object.entries(parsed.techStack)) {
        const text = Array.isArray(value) ? strings(value).join(", ") : value;
        if (typeof text === "string" && text) {
          techStack[key as keyof ProjectAnalysis["techStack"]] = text;
        }
      }
    }

    return {
      summary: parsed.summary,
      detailedDescription: parsed.detailedDescription,
      features: strings(parsed.features),
      techStack,
      projectType: parsed.projectType || "other",
      suggestedImages: Array.isArray(parsed.suggestedImages)
        ? parsed.suggestedImages
        : [],
      keyInsights: strings(parsed.keyInsights),
    };
  }
}
