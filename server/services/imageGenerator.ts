import fs from "fs/promises";
import OpenAI from "openai";
import path from "path";

interface GeneratedImage {
  url: string;
  localPath: string;
  type: string;
  prompt: string;
}

export class ImageGenerator {
  private openai: OpenAI;
  private imageStoragePath: string;

  constructor(
    openaiApiKey: string,
    storagePath: string = "./public/generated-images"
  ) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.imageStoragePath = storagePath;
  }

  async generateProjectImages(
    projectName: string,
    projectType: string,
    imagePrompts: Array<{ type: string; prompt: string }>
  ): Promise<GeneratedImage[]> {
    const results: GeneratedImage[] = [];

    // Ensure storage directory exists
    await fs.mkdir(this.imageStoragePath, { recursive: true });

    for (const { type, prompt } of imagePrompts) {
      try {
        const enhancedPrompt = this.enhancePrompt(prompt, projectType);
        const imageUrl = await this.generateSingleImage(enhancedPrompt);

        if (imageUrl) {
          const localPath = await this.saveImageLocally(
            imageUrl,
            projectName,
            type
          );
          results.push({
            url: imageUrl,
            localPath,
            type,
            prompt: enhancedPrompt,
          });
        }
      } catch (error) {
        console.error(
          `Failed to generate ${type} image for ${projectName}:`,
          error
        );
      }
    }

    return results;
  }

  private enhancePrompt(basePrompt: string, projectType: string): string {
    const styleEnhancements = {
      "web-app":
        "screenshot of a modern web application displayed in a clean browser interface, professional UI design with modern typography, subtle shadows, and organized layout. High resolution, realistic application interface",
      "mobile-app":
        "high-quality mobile app screenshot in an iPhone or Android device mockup, showing a clean, intuitive mobile interface with proper mobile UI patterns, modern app design elements",
      "cli-tool":
        "screenshot of a terminal/command line interface with dark background, colorful syntax highlighting, showing actual command output and usage examples, professional developer environment",
      dashboard:
        "screenshot of a professional web dashboard interface showing data visualizations, charts, metrics, and clean modern UI components in a realistic browser environment",
      api: "screenshot of API documentation interface or developer portal, showing code examples, endpoints, and technical documentation in a clean, modern design",
      library:
        "screenshot of a code library documentation page or GitHub repository interface, showing code examples, installation instructions, and professional documentation layout",
    };

    const baseStyle =
      styleEnhancements[projectType as keyof typeof styleEnhancements] ||
      "high-quality screenshot of a software application interface with professional, modern design";

    return `Create a ${baseStyle} for: ${basePrompt}. Make it look like an authentic application screenshot with realistic UI elements, proper spacing, modern typography, and professional visual design. Use a clean, contemporary aesthetic with good contrast and visual hierarchy. Format as a realistic screenshot that would appear in a portfolio.`;
  }

  private async generateSingleImage(prompt: string): Promise<string | null> {
    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1792x1024", // 16:9 aspect ratio
        quality: "standard",
        style: "natural",
      });

      return response.data?.[0]?.url || null;
    } catch (error) {
      console.error("DALL-E generation failed:", error);
      return null;
    }
  }

  private async saveImageLocally(
    imageUrl: string,
    projectName: string,
    imageType: string
  ): Promise<string> {
    // Use native fetch (Node.js 18+) instead of node-fetch
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Failed to fetch generated image");

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = `${projectName}-${imageType}-${Date.now()}.png`;
    const filePath = path.join(this.imageStoragePath, fileName);

    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  async generateRealScreenshot(
    demoUrl: string,
    projectName: string
  ): Promise<string | null> {
    // This would use Playwright or Puppeteer to take actual screenshots
    // Implementation depends on whether the project has a live demo URL
    return null; // Placeholder
  }
}
