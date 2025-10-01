import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { favoriteSound, averageQuality, totalSessions, bestDay } = body

    // Validar parâmetros
    if (typeof averageQuality !== 'number' || typeof totalSessions !== 'number') {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      )
    }

    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 800))

    // Gerar recomendações baseadas nos dados do usuário
    const generateRecommendations = (favoriteSound: string, averageQuality: number, totalSessions: number, bestDay: string) => {
      const recommendations = []

      // Recomendações baseadas na qualidade do sono
      if (averageQuality >= 4) {
        recommendations.push('Sua qualidade de sono está excelente! Continue com sua rotina atual.')
        recommendations.push('Considere compartilhar suas técnicas com amigos que têm dificuldades para dormir.')
      } else if (averageQuality >= 3) {
        recommendations.push('Experimente sons binaurais Delta Waves para sono mais profundo.')
        recommendations.push('Tente manter um horário mais consistente para dormir.')
      } else {
        recommendations.push('Considere criar um ambiente mais escuro e silencioso para dormir.')
        recommendations.push('Experimente técnicas de respiração 4-7-8 antes de dormir.')
        recommendations.push('Evite telas pelo menos 1 hora antes de dormir.')
      }

      // Recomendações baseadas no som favorito
      if (favoriteSound && favoriteSound.includes('Chuva') || favoriteSound.includes('Água')) {
        recommendations.push('Sons de água funcionam bem para você. Experimente "Ondas do Mar" ou "Gotas d\'Água".')
      } else if (favoriteSound && (favoriteSound.includes('Delta') || favoriteSound.includes('Theta'))) {
        recommendations.push('Sons binaurais são eficazes para você. Explore outras frequências como Alpha Waves.')
      } else if (favoriteSound && (favoriteSound.includes('Vento') || favoriteSound.includes('Floresta'))) {
        recommendations.push('Você responde bem a sons da natureza. Experimente combiná-los com sussurros ASMR.')
      } else if (favoriteSound && (favoriteSound.includes('Sussurros') || favoriteSound.includes('ASMR'))) {
        recommendations.push('Vozes ASMR funcionam para você. Experimente histórias narradas para dormir.')
      }

      // Recomendações baseadas no número de sessões
      if (totalSessions >= 20) {
        recommendations.push('Você é um usuário dedicado! Considere explorar o gerador de conteúdo IA.')
        recommendations.push('Experimente criar mixes personalizados combinando seus sons favoritos.')
      } else if (totalSessions >= 10) {
        recommendations.push('Você está desenvolvendo uma boa rotina. Tente usar o timer de sono regularmente.')
      } else {
        recommendations.push('Continue explorando diferentes sons para encontrar o que funciona melhor.')
        recommendations.push('Experimente usar o app por pelo menos 20 minutos antes de dormir.')
      }

      // Recomendações baseadas no melhor dia
      if (bestDay && bestDay !== 'Nenhum') {
        recommendations.push(`${bestDay} é seu melhor dia de sono. Analise o que faz diferente neste dia.`)
        recommendations.push('Tente replicar a rotina do seu melhor dia em outros dias da semana.')
      }

      // Recomendações gerais de bem-estar
      const generalTips = [
        'Mantenha seu quarto entre 18-22°C para melhor qualidade de sono.',
        'Experimente um banho morno 1-2 horas antes de dormir.',
        'Considere usar uma máscara de olhos para bloquear completamente a luz.',
        'Pratique gratidão antes de dormir - pense em 3 coisas boas do seu dia.',
        'Evite cafeína após 14h para não interferir no sono.',
        'Experimente aromaterapia com lavanda ou camomila.',
        'Mantenha um diário de sono para identificar padrões.',
        'Considere exercícios leves de alongamento antes de dormir.'
      ]

      // Adicionar algumas dicas gerais aleatórias
      const randomTips = generalTips.sort(() => 0.5 - Math.random()).slice(0, 2)
      recommendations.push(...randomTips)

      // Retornar no máximo 6 recomendações
      return recommendations.slice(0, 6)
    }

    const recommendations = generateRecommendations(
      favoriteSound || 'Nenhum', 
      averageQuality, 
      totalSessions, 
      bestDay || 'Nenhum'
    )

    return NextResponse.json(
      { recommendations },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error: any) {
    console.error('Erro ao gerar recomendações:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error.message || 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}