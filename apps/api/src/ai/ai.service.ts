import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerateDescriptionDto } from './dto/generate-description.dto';

@Injectable()
export class AiService {
  private readonly client: OpenAI | null;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
  }

  async generateDescription(payload: GenerateDescriptionDto) {
    if (!this.client) {
      return {
        text: this.buildFallbackDescription(payload),
        source: 'fallback',
      };
    }

    const prompt = this.buildPrompt(payload);

    const response = await this.client.responses.create({
      model: 'gpt-4o-mini',
      input: prompt,
    });

    const text = response.output_text?.[0] || this.buildFallbackDescription(payload);

    return {
      text: text.trim(),
      source: 'openai',
    };
  }

  private buildPrompt({ dishName, cuisineType, ingredients, tone }: GenerateDescriptionDto) {
    return `Actúa como copywriter de aplicaciones de delivery estilo DoorDash.
Plato: ${dishName}
Tipo de cocina: ${cuisineType ?? 'general'}
Ingredientes/claves: ${ingredients ?? 'no especificados'}
Tono: ${tone ?? 'apetitoso, directo y descriptivo'}

Genera una descripción comercial de máximo 40 palabras que resalte textura, sabor y beneficios.`;
  }

  private buildFallbackDescription({ dishName }: GenerateDescriptionDto) {
    return `${dishName} preparado con ingredientes frescos y servido al estilo Delivery Ocotepeque. Ideal para cuando quieres un antojo rápido y lleno de sabor.`;
  }
}
