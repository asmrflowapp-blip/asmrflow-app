import { NextRequest, NextResponse } from 'next/server'
import { 
  generateMeditationContent, 
  generatePersonalizedRecommendations, 
  generateMeditationThemes,
  generateSoundDescription 
} from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'generateContent':
        const { type, theme, duration, voiceType } = params
        const content = await generateMeditationContent(type, theme, duration, voiceType)
        return NextResponse.json({ success: true, data: content })

      case 'generateRecommendations':
        const { userPreferences } = params
        const recommendations = await generatePersonalizedRecommendations(userPreferences)
        return NextResponse.json({ success: true, data: recommendations })

      case 'generateThemes':
        const { mood } = params
        const themes = await generateMeditationThemes(mood)
        return NextResponse.json({ success: true, data: themes })

      case 'generateSoundDescription':
        const { soundName, category } = params
        const description = await generateSoundDescription(soundName, category)
        return NextResponse.json({ success: true, data: description })

      default:
        return NextResponse.json({ success: false, error: 'Ação não reconhecida' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Erro na API OpenAI:', error)
    
    // Retornar erro específico baseado no tipo
    if (error.message.includes('Chave da API OpenAI inválida')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Chave da API OpenAI inválida ou não configurada' 
      }, { status: 401 })
    } else if (error.message.includes('Cota da API OpenAI excedida')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cota da API OpenAI excedida. Verifique seu plano e faturamento.' 
      }, { status: 429 })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      }, { status: 500 })
    }
  }
}