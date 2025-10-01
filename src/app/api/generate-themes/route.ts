import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mood } = body

    // Validar parâmetros
    if (!mood || typeof mood !== 'string') {
      return NextResponse.json(
        { error: 'Parâmetro mood é obrigatório' },
        { status: 400 }
      )
    }

    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 600))

    // Gerar temas baseados no humor do usuário
    const generateThemes = (mood: string) => {
      const moodLower = mood.toLowerCase()
      
      // Temas baseados em diferentes estados emocionais
      const themeMap: { [key: string]: string[] } = {
        // Estados de ansiedade/estresse
        ansioso: ['Respiração Calmante', 'Jardim Zen', 'Ondas Tranquilas', 'Floresta Silenciosa', 'Paz Interior'],
        estressado: ['Alívio Profundo', 'Montanha Serena', 'Chuva Suave', 'Descanso Mental', 'Libertação'],
        nervoso: ['Estabilidade', 'Terra Firme', 'Respiração Profunda', 'Segurança Interior', 'Calma Absoluta'],
        preocupado: ['Confiança', 'Deixar Ir', 'Presente Momento', 'Aceitação', 'Serenidade'],
        
        // Estados de tristeza/melancolia
        triste: ['Acolhimento', 'Luz Interior', 'Esperança Renovada', 'Coração Aquecido', 'Cura Emocional'],
        melancólico: ['Nostalgia Suave', 'Memórias Douradas', 'Abraço Cósmico', 'Ternura', 'Compreensão'],
        solitário: ['Conexão Universal', 'Companhia Interior', 'Amor Próprio', 'Presença Divina', 'União'],
        
        // Estados de cansaço/exaustão
        cansado: ['Descanso Profundo', 'Recuperação Total', 'Energia Renovada', 'Sono Reparador', 'Revitalização'],
        exausto: ['Pausa Sagrada', 'Restauração', 'Alívio Completo', 'Descanso Merecido', 'Renovação'],
        esgotado: ['Recarga Energética', 'Pausa Necessária', 'Cura do Cansaço', 'Descanso Profundo', 'Restauração'],
        
        // Estados de agitação/hiperatividade
        agitado: ['Aquietamento', 'Mente Calma', 'Serenidade Profunda', 'Estabilidade', 'Paz Mental'],
        inquieto: ['Tranquilidade', 'Mente Quieta', 'Estabilidade Interior', 'Calma Profunda', 'Serenidade'],
        hiperativo: ['Desaceleração', 'Ritmo Natural', 'Calma Interior', 'Equilíbrio', 'Tranquilidade'],
        
        // Estados positivos que precisam de manutenção
        feliz: ['Gratidão', 'Alegria Serena', 'Contentamento', 'Paz Radiante', 'Harmonia'],
        grato: ['Abundância', 'Reconhecimento', 'Bênçãos', 'Apreciação', 'Contentamento'],
        esperançoso: ['Futuro Brilhante', 'Possibilidades', 'Confiança', 'Otimismo Sereno', 'Fé'],
        
        // Estados de confusão/incerteza
        confuso: ['Clareza Mental', 'Direção Interior', 'Sabedoria', 'Discernimento', 'Compreensão'],
        perdido: ['Encontrar o Caminho', 'Orientação Interior', 'Propósito', 'Direção', 'Guia Interior'],
        incerto: ['Confiança Interior', 'Intuição', 'Sabedoria Interna', 'Certeza do Coração', 'Fé Interior']
      }

      // Procurar por palavras-chave no humor
      let matchedThemes: string[] = []
      
      for (const [key, themes] of Object.entries(themeMap)) {
        if (moodLower.includes(key)) {
          matchedThemes = [...matchedThemes, ...themes]
        }
      }

      // Se não encontrou correspondências específicas, usar temas gerais baseados em palavras-chave
      if (matchedThemes.length === 0) {
        if (moodLower.includes('dor') || moodLower.includes('machucado')) {
          matchedThemes = ['Cura Emocional', 'Alívio da Dor', 'Conforto', 'Acolhimento', 'Restauração']
        } else if (moodLower.includes('raiva') || moodLower.includes('irritado')) {
          matchedThemes = ['Liberação da Raiva', 'Perdão', 'Paz Interior', 'Compreensão', 'Serenidade']
        } else if (moodLower.includes('medo') || moodLower.includes('assustado')) {
          matchedThemes = ['Coragem', 'Segurança', 'Proteção', 'Confiança', 'Força Interior']
        } else if (moodLower.includes('amor') || moodLower.includes('carinho')) {
          matchedThemes = ['Amor Próprio', 'Compaixão', 'Ternura', 'Coração Aberto', 'Bondade']
        } else {
          // Temas universais para qualquer humor
          matchedThemes = [
            'Paz Interior', 'Respiração Consciente', 'Momento Presente', 
            'Aceitação', 'Serenidade', 'Equilíbrio', 'Harmonia', 
            'Tranquilidade', 'Calma Profunda', 'Bem-estar'
          ]
        }
      }

      // Remover duplicatas e retornar até 8 temas
      const uniqueThemes = [...new Set(matchedThemes)]
      return uniqueThemes.slice(0, 8)
    }

    const themes = generateThemes(mood)

    return NextResponse.json(
      { themes },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error: any) {
    console.error('Erro ao gerar temas:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error.message || 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}