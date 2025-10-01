import OpenAI from 'openai'

// Configuração da OpenAI para uso no servidor
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// Interface para geração de conteúdo
export interface GeneratedContent {
  title: string
  content: string
  duration: string
  category: 'sleep' | 'relaxation' | 'breathing' | 'meditation'
  voiceType: 'female' | 'male'
}

// Interface para sons personalizados
export interface GeneratedSound {
  name: string
  description: string
  category: 'nature' | 'ambient' | 'asmr' | 'binaural'
  frequency: number
  waveType: OscillatorType
  binauralFreq?: number
}

// Função para gerar histórias e meditações personalizadas
export async function generateMeditationContent(
  type: 'sleep' | 'relaxation' | 'breathing' | 'meditation',
  theme: string,
  duration: number,
  voiceType: 'female' | 'male' = 'female'
): Promise<GeneratedContent> {
  try {
    const prompt = `Crie uma ${type === 'sleep' ? 'história para dormir' : 
                                type === 'breathing' ? 'sessão de respiração guiada' :
                                type === 'meditation' ? 'meditação guiada' : 'sessão de relaxamento'} 
    com o tema "${theme}".
    
    Duração aproximada: ${duration} minutos
    Voz: ${voiceType === 'female' ? 'feminina' : 'masculina'}
    
    Requisitos:
    - Linguagem calma, suave e relaxante
    - Ritmo lento e pausado
    - Instruções claras e simples
    - Foco na respiração e relaxamento
    - Adequado para ${type === 'sleep' ? 'induzir o sono' : 'reduzir ansiedade e estresse'}
    
    Retorne APENAS o texto da narração, sem títulos ou formatação extra.
    O texto deve ser fluido e natural para ser lido por síntese de voz.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em mindfulness, meditação e terapia do sono. Crie conteúdo relaxante e terapêutico em português brasileiro.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    })

    const content = response.choices[0]?.message?.content || ''
    
    // Gerar título baseado no tema
    const titleResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Crie títulos curtos e atraentes para sessões de relaxamento e meditação.'
        },
        {
          role: 'user',
          content: `Crie um título curto e atraente para uma ${type === 'sleep' ? 'história para dormir' : 
                                                                type === 'breathing' ? 'sessão de respiração' :
                                                                type === 'meditation' ? 'meditação guiada' : 'sessão de relaxamento'} 
                   com tema "${theme}". Máximo 4 palavras.`
        }
      ],
      max_tokens: 50,
      temperature: 0.8
    })

    const title = titleResponse.choices[0]?.message?.content?.replace(/"/g, '') || theme

    return {
      title,
      content,
      duration: `${duration} min`,
      category: type,
      voiceType
    }
  } catch (error) {
    console.error('Erro ao gerar conteúdo:', error)
    
    // Fallback com conteúdo padrão
    return {
      title: `${theme} - Relaxamento`,
      content: `Respire profundamente... inspire pelo nariz... expire pela boca... 
                Sinta seu corpo relaxando completamente... cada músculo se soltando... 
                Deixe todos os pensamentos fluírem como nuvens no céu... 
                Você está em um lugar seguro e tranquilo... permita-se descansar...`,
      duration: `${duration} min`,
      category: type,
      voiceType
    }
  }
}

// Função para gerar descrições de sons personalizadas
export async function generateSoundDescription(
  soundName: string,
  category: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Crie descrições curtas e atraentes para sons ASMR e de relaxamento.'
        },
        {
          role: 'user',
          content: `Crie uma descrição curta (máximo 60 caracteres) para o som "${soundName}" da categoria "${category}". 
                   Foque nos benefícios relaxantes e na experiência sensorial.`
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    })

    return response.choices[0]?.message?.content || `Som relaxante de ${soundName.toLowerCase()}`
  } catch (error) {
    console.error('Erro ao gerar descrição:', error)
    return `Som relaxante de ${soundName.toLowerCase()}`
  }
}

// Função para gerar recomendações personalizadas
export async function generatePersonalizedRecommendations(
  userPreferences: {
    favoriteSound: string
    averageQuality: number
    totalSessions: number
    bestDay: string
  }
): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em sono e relaxamento. Forneça recomendações personalizadas baseadas nos dados do usuário.'
        },
        {
          role: 'user',
          content: `Baseado nos dados do usuário:
                   - Som favorito: ${userPreferences.favoriteSound}
                   - Qualidade média do sono: ${userPreferences.averageQuality}/5
                   - Total de sessões: ${userPreferences.totalSessions}
                   - Melhor dia: ${userPreferences.bestDay}
                   
                   Forneça 3 recomendações específicas para melhorar o sono e relaxamento.
                   Cada recomendação deve ter no máximo 80 caracteres.`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    })

    const content = response.choices[0]?.message?.content || ''
    return content.split('\n').filter(line => line.trim()).slice(0, 3)
  } catch (error) {
    console.error('Erro ao gerar recomendações:', error)
    return [
      'Experimente sons binaurais para sono mais profundo',
      'Mantenha uma rotina consistente de horários',
      'Combine respiração guiada com seus sons favoritos'
    ]
  }
}

// Função para gerar temas de meditação baseados no humor
export async function generateMeditationThemes(mood: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Sugira temas de meditação e relaxamento baseados no estado emocional do usuário.'
        },
        {
          role: 'user',
          content: `O usuário está se sentindo: "${mood}". 
                   Sugira 5 temas específicos para meditação/relaxamento que ajudem com esse estado.
                   Cada tema deve ter no máximo 3 palavras.`
        }
      ],
      max_tokens: 200,
      temperature: 0.8
    })

    const content = response.choices[0]?.message?.content || ''
    return content.split('\n').filter(line => line.trim()).slice(0, 5)
  } catch (error) {
    console.error('Erro ao gerar temas:', error)
    return ['Paz Interior', 'Respiração Calma', 'Natureza Serena', 'Mente Tranquila', 'Energia Positiva']
  }
}

export default openai