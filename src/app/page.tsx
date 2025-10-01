'use client'

import { useState, useEffect, useRef } from 'react'
import { Moon, Heart, Music, Play, Pause, Volume2, VolumeX, Settings, User, Clock, Flame, FileText, Share, Save, Plus, Minus, RotateCcw, Calendar, Circle, Mic, Wind, Droplets, Keyboard, Coffee, Waves, Activity, BarChart3, TrendingUp, Zap, Eye, EyeOff, Bed } from 'lucide-react'

// Tipos para o aplicativo
interface Sound {
  id: string
  name: string
  icon: any
  category: 'nature' | 'ambient' | 'voice' | 'asmr' | 'binaural'
  isPremium?: boolean
  frequency: number
  waveType: OscillatorType
  description: string
  binauralFreq?: number // Para sons binaurais
}

interface MixSound {
  sound: Sound
  volume: number
  echo: number
  side: 'both' | 'left' | 'right'
  audioContext?: AudioContext
  oscillator?: OscillatorNode
  oscillator2?: OscillatorNode // Para sons binaurais
  gainNode?: GainNode
  isPlaying: boolean
}

interface SavedMix {
  id: string
  name: string
  sounds: MixSound[]
  createdAt: Date
}

interface Story {
  id: string
  title: string
  duration: string
  category: 'sleep' | 'relaxation' | 'breathing'
  isPremium?: boolean
  voiceType: 'female' | 'male'
  content: string
}

interface SleepSession {
  id: string
  date: Date
  duration: number // em minutos
  quality: 1 | 2 | 3 | 4 | 5 // 1-5 estrelas
  soundsUsed: string[]
  notes?: string
  sleepTime?: Date
  wakeTime?: Date
}

interface SleepStats {
  averageQuality: number
  totalSessions: number
  averageDuration: number
  favoriteSound: string
  weeklyTrend: number[]
  bestDay: string
  totalHours: number
}

// Dados dos sons ASMR expandidos com sons binaurais e melhorados
const sounds: Sound[] = [
  { 
    id: '1', 
    name: 'Chuva Suave', 
    icon: Droplets, 
    category: 'nature',
    frequency: 200,
    waveType: 'sawtooth',
    description: 'Som relaxante de chuva leve com reverb natural'
  },
  { 
    id: '2', 
    name: 'Vento na Floresta', 
    icon: Wind, 
    category: 'nature',
    frequency: 150,
    waveType: 'sawtooth',
    description: 'Brisa suave entre as árvores com variações naturais'
  },
  { 
    id: '3', 
    name: 'Lareira Crepitante', 
    icon: Flame, 
    category: 'ambient',
    frequency: 100,
    waveType: 'square',
    description: 'Fogo crepitando com estalos realistas'
  },
  { 
    id: '4', 
    name: 'Teclado Mecânico', 
    icon: Keyboard, 
    category: 'ambient', 
    isPremium: true,
    frequency: 800,
    waveType: 'square',
    description: 'Digitação rítmica com switches mecânicos'
  },
  { 
    id: '5', 
    name: 'Papel Amassando', 
    icon: FileText, 
    category: 'ambient',
    frequency: 400,
    waveType: 'triangle',
    description: 'Som crocante de papel com texturas variadas'
  },
  { 
    id: '6', 
    name: 'Gotas d\'Água', 
    icon: Droplets, 
    category: 'nature',
    frequency: 300,
    waveType: 'sine',
    description: 'Pingos suaves com eco natural'
  },
  { 
    id: '7', 
    name: 'Sussurros Femininos', 
    icon: Mic, 
    category: 'asmr', 
    isPremium: true,
    frequency: 250,
    waveType: 'sine',
    description: 'Voz feminina suave com respiração relaxante'
  },
  { 
    id: '8', 
    name: 'Ondas do Mar', 
    icon: Waves, 
    category: 'nature',
    frequency: 180,
    waveType: 'sawtooth',
    description: 'Ondas quebrando com sons de ressaca'
  },
  { 
    id: '9', 
    name: 'Ventilador', 
    icon: Wind, 
    category: 'ambient',
    frequency: 120,
    waveType: 'sawtooth',
    description: 'Ruído branco constante e suave'
  },
  { 
    id: '10', 
    name: 'Sussurros Masculinos', 
    icon: Mic, 
    category: 'asmr', 
    isPremium: true,
    frequency: 180,
    waveType: 'sine',
    description: 'Voz masculina profunda e tranquilizante'
  },
  { 
    id: '11', 
    name: 'Respiração Feminina', 
    icon: Heart, 
    category: 'asmr',
    frequency: 220,
    waveType: 'sine',
    description: 'Respiração calma com ritmo natural'
  },
  { 
    id: '12', 
    name: 'Respiração Masculina', 
    icon: Heart, 
    category: 'asmr',
    frequency: 160,
    waveType: 'sine',
    description: 'Respiração grave e profunda'
  },
  { 
    id: '13', 
    name: 'Café Pingando', 
    icon: Coffee, 
    category: 'ambient',
    frequency: 350,
    waveType: 'triangle',
    description: 'Som de café sendo coado lentamente'
  },
  { 
    id: '14', 
    name: 'Voz Feminina Cantarolando', 
    icon: Music, 
    category: 'asmr', 
    isPremium: true,
    frequency: 280,
    waveType: 'sine',
    description: 'Melodia suave cantarolada sem palavras'
  },
  { 
    id: '15', 
    name: 'Voz Masculina Cantarolando', 
    icon: Music, 
    category: 'asmr', 
    isPremium: true,
    frequency: 140,
    waveType: 'sine',
    description: 'Tom grave e melodioso relaxante'
  },
  // Novos sons binaurais para sono profundo
  { 
    id: '16', 
    name: 'Delta Waves (1-4Hz)', 
    icon: Zap, 
    category: 'binaural', 
    isPremium: true,
    frequency: 100,
    waveType: 'sine',
    binauralFreq: 2,
    description: 'Ondas cerebrais para sono profundo'
  },
  { 
    id: '17', 
    name: 'Theta Waves (4-8Hz)', 
    icon: Zap, 
    category: 'binaural', 
    isPremium: true,
    frequency: 150,
    waveType: 'sine',
    binauralFreq: 6,
    description: 'Ondas para relaxamento profundo e meditação'
  },
  { 
    id: '18', 
    name: 'Alpha Waves (8-12Hz)', 
    icon: Zap, 
    category: 'binaural',
    frequency: 200,
    waveType: 'sine',
    binauralFreq: 10,
    description: 'Ondas para relaxamento consciente'
  },
  { 
    id: '19', 
    name: 'Ruído Rosa', 
    icon: Volume2, 
    category: 'ambient',
    frequency: 250,
    waveType: 'sawtooth',
    description: 'Frequências balanceadas para sono reparador'
  },
  { 
    id: '20', 
    name: 'Ruído Marrom', 
    icon: Volume2, 
    category: 'ambient',
    frequency: 80,
    waveType: 'sawtooth',
    description: 'Som grave e envolvente para concentração'
  }
]

// Histórias e sessões expandidas
const stories: Story[] = [
  { 
    id: '1', 
    title: 'Floresta Encantada', 
    duration: '15 min', 
    category: 'sleep',
    voiceType: 'female',
    content: 'Imagine-se caminhando por uma floresta mágica, onde cada passo te leva mais fundo no relaxamento...'
  },
  { 
    id: '2', 
    title: 'Respiração 4-7-8', 
    duration: '10 min', 
    category: 'breathing',
    voiceType: 'female',
    content: 'Inspire por 4 segundos... segure por 7... expire por 8... sinta seu corpo relaxando completamente...'
  },
  { 
    id: '3', 
    title: 'Viagem às Estrelas', 
    duration: '20 min', 
    category: 'sleep', 
    isPremium: true,
    voiceType: 'male',
    content: 'Flutue pelo cosmos infinito, deixando todas as preocupações para trás enquanto navega entre as estrelas...'
  },
  { 
    id: '4', 
    title: 'Meditação Guiada', 
    duration: '12 min', 
    category: 'relaxation',
    voiceType: 'female',
    content: 'Encontre seu centro interior, respirando profundamente e conectando-se com a paz que existe dentro de você...'
  },
  { 
    id: '5', 
    title: 'Conto do Jardim Secreto', 
    duration: '18 min', 
    category: 'sleep', 
    isPremium: true,
    voiceType: 'female',
    content: 'Descubra um jardim escondido onde flores sussurram segredos de tranquilidade e paz...'
  },
  { 
    id: '6', 
    title: 'Respiração Profunda Masculina', 
    duration: '8 min', 
    category: 'breathing',
    voiceType: 'male',
    content: 'Com uma voz grave e tranquilizante, deixe-se guiar por uma jornada de respiração consciente...'
  },
  { 
    id: '7', 
    title: 'Oceano de Calma', 
    duration: '25 min', 
    category: 'sleep',
    voiceType: 'male',
    content: 'Mergulhe nas profundezas de um oceano sereno, onde cada onda te leva mais fundo no sono...'
  },
  { 
    id: '8', 
    title: 'Sussurros da Natureza', 
    duration: '14 min', 
    category: 'relaxation',
    voiceType: 'female',
    content: 'Escute os segredos que a natureza sussurra ao vento, trazendo paz para sua mente...'
  }
]

export default function ASMRFlow() {
  const [currentView, setCurrentView] = useState<'home' | 'library' | 'mixer' | 'stories' | 'timer' | 'profile' | 'sleep-monitor'>('home')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentMix, setCurrentMix] = useState<MixSound[]>([])
  const [savedMixes, setSavedMixes] = useState<SavedMix[]>([])
  const [timerMinutes, setTimerMinutes] = useState(20)
  const [timerActive, setTimerActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const [currentlyPlayingSound, setCurrentlyPlayingSound] = useState<string | null>(null)
  const [currentStory, setCurrentStory] = useState<Story | null>(null)
  const [userStats, setUserStats] = useState({
    daysUsed: 7,
    totalSessions: 23,
    favoriteSound: 'Chuva Suave'
  })

  // Estados para monitoramento de sono
  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>([
    {
      id: '1',
      date: new Date(Date.now() - 86400000), // ontem
      duration: 480, // 8 horas
      quality: 4,
      soundsUsed: ['Chuva Suave', 'Delta Waves'],
      notes: 'Dormi muito bem com os sons binaurais'
    },
    {
      id: '2',
      date: new Date(Date.now() - 172800000), // 2 dias atrás
      duration: 420, // 7 horas
      quality: 3,
      soundsUsed: ['Ondas do Mar'],
      notes: 'Acordei algumas vezes durante a noite'
    },
    {
      id: '3',
      date: new Date(Date.now() - 259200000), // 3 dias atrás
      duration: 510, // 8.5 horas
      quality: 5,
      soundsUsed: ['Theta Waves', 'Ruído Rosa'],
      notes: 'Melhor noite de sono da semana!'
    }
  ])
  const [currentSleepSession, setCurrentSleepSession] = useState<Partial<SleepSession> | null>(null)
  const [sleepTracking, setSleepTracking] = useState(false)

  const timerRef = useRef<NodeJS.Timeout>()
  const storyUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioContextsRef = useRef<Set<AudioContext>>(new Set())

  // Calcular estatísticas de sono
  const calculateSleepStats = (): SleepStats => {
    if (sleepSessions.length === 0) {
      return {
        averageQuality: 0,
        totalSessions: 0,
        averageDuration: 0,
        favoriteSound: 'Nenhum',
        weeklyTrend: [0, 0, 0, 0, 0, 0, 0],
        bestDay: 'Nenhum',
        totalHours: 0
      }
    }

    const totalQuality = sleepSessions.reduce((sum, session) => sum + session.quality, 0)
    const totalDuration = sleepSessions.reduce((sum, session) => sum + session.duration, 0)
    
    // Contar sons mais usados
    const soundCount: { [key: string]: number } = {}
    sleepSessions.forEach(session => {
      session.soundsUsed.forEach(sound => {
        soundCount[sound] = (soundCount[sound] || 0) + 1
      })
    })
    
    const favoriteSound = Object.keys(soundCount).reduce((a, b) => 
      soundCount[a] > soundCount[b] ? a : b, 'Nenhum'
    )

    // Tendência semanal (últimos 7 dias)
    const weeklyTrend = Array(7).fill(0)
    const now = new Date()
    sleepSessions.forEach(session => {
      const daysDiff = Math.floor((now.getTime() - session.date.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff < 7) {
        weeklyTrend[6 - daysDiff] = session.quality
      }
    })

    // Melhor dia da semana
    const dayQuality: { [key: string]: number[] } = {}
    sleepSessions.forEach(session => {
      const dayName = session.date.toLocaleDateString('pt-BR', { weekday: 'long' })
      if (!dayQuality[dayName]) dayQuality[dayName] = []
      dayQuality[dayName].push(session.quality)
    })
    
    let bestDay = 'Nenhum'
    let bestAverage = 0
    Object.keys(dayQuality).forEach(day => {
      const average = dayQuality[day].reduce((a, b) => a + b, 0) / dayQuality[day].length
      if (average > bestAverage) {
        bestAverage = average
        bestDay = day
      }
    })

    return {
      averageQuality: totalQuality / sleepSessions.length,
      totalSessions: sleepSessions.length,
      averageDuration: totalDuration / sleepSessions.length,
      favoriteSound,
      weeklyTrend,
      bestDay,
      totalHours: totalDuration / 60
    }
  }

  // Função para criar áudio sintético melhorado com suporte binaural
  const createAudioElement = (sound: Sound): { audioContext: AudioContext, oscillator: OscillatorNode, oscillator2?: OscillatorNode, gainNode: GainNode } => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      // Adicionar à lista de contextos para gerenciamento
      audioContextsRef.current.add(audioContext)
      
      oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime)
      oscillator.type = sound.waveType
      
      // Configurar volume inicial com fade-in suave
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 2)
      
      // Para sons binaurais, criar segundo oscillator
      let oscillator2: OscillatorNode | undefined
      if (sound.binauralFreq && sound.category === 'binaural') {
        oscillator2 = audioContext.createOscillator()
        oscillator2.frequency.setValueAtTime(sound.frequency + sound.binauralFreq, audioContext.currentTime)
        oscillator2.type = sound.waveType
        
        // Criar nós separados para cada ouvido
        const leftGain = audioContext.createGain()
        const rightGain = audioContext.createGain()
        const merger = audioContext.createChannelMerger(2)
        
        leftGain.gain.setValueAtTime(0, audioContext.currentTime)
        leftGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 2)
        rightGain.gain.setValueAtTime(0, audioContext.currentTime)
        rightGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 2)
        
        // Conectar oscillators aos canais separados
        oscillator.connect(leftGain)
        oscillator2.connect(rightGain)
        leftGain.connect(merger, 0, 0)
        rightGain.connect(merger, 0, 1)
        merger.connect(audioContext.destination)
      } else {
        // Conectar normalmente para sons não-binaurais
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
      }
      
      return { audioContext, oscillator, oscillator2, gainNode }
    } catch (error) {
      console.error('Erro ao criar AudioContext:', error)
      throw error
    }
  }

  // Função para limpar recursos de áudio de forma segura
  const cleanupAudioContext = async (audioContext: AudioContext) => {
    if (!audioContext) return
    
    try {
      if (audioContext.state !== 'closed') {
        await new Promise(resolve => setTimeout(resolve, 50))
        if (audioContext.state !== 'closed') {
          await audioContext.close()
        }
      }
    } catch (error) {
      console.debug('AudioContext cleanup:', error)
    } finally {
      audioContextsRef.current.delete(audioContext)
    }
  }

  // Timer functionality
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false)
      setIsPlaying(false)
      stopAllAudio()
      speakMessage("Agora descanse... bons sonhos", 'female')
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [timerActive, timeLeft])

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      const cleanupPromises = Array.from(audioContextsRef.current).map(cleanupAudioContext)
      Promise.all(cleanupPromises).finally(() => {
        audioContextsRef.current.clear()
      })
      
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel()
      }
    }
  }, [])

  // Função para falar mensagem usando Web Speech API
  const speakMessage = (message: string, voiceType: 'female' | 'male' = 'female') => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 0.7
      utterance.pitch = voiceType === 'female' ? 1.2 : 0.8
      utterance.volume = 0.8
      
      const voices = speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voiceType === 'female' 
          ? voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') || voice.pitch > 1
          : voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('man') || voice.pitch < 1
      )
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      speechSynthesis.speak(utterance)
      storyUtteranceRef.current = utterance
    }
  }

  const startTimer = (minutes: number) => {
    setTimerMinutes(minutes)
    setTimeLeft(minutes * 60)
    setTimerActive(true)
    setIsPlaying(true)
    if (currentMix.length > 0) {
      playMix()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Função para tocar um som individual melhorada
  const playSound = (sound: Sound) => {
    if (sound.isPremium && !isPremium) return

    if (currentlyPlayingSound) {
      stopSound(currentlyPlayingSound)
    }

    if (currentlyPlayingSound === sound.id) {
      setCurrentlyPlayingSound(null)
      setIsPlaying(false)
      return
    }

    try {
      const { audioContext, oscillator, oscillator2, gainNode } = createAudioElement(sound)
      
      const mixSound: MixSound = {
        sound,
        volume: 50,
        echo: 0,
        side: 'both',
        audioContext,
        oscillator,
        oscillator2,
        gainNode,
        isPlaying: true
      }
      
      setCurrentMix(prev => {
        const filtered = prev.filter(ms => ms.sound.id !== sound.id)
        return [...filtered, mixSound]
      })
      
      oscillator.start()
      if (oscillator2) oscillator2.start()
      setCurrentlyPlayingSound(sound.id)
      setIsPlaying(true)
      
      // Auto-parar após 30 segundos para demonstração
      setTimeout(() => {
        if (currentlyPlayingSound === sound.id) {
          stopSound(sound.id)
        }
      }, 30000)
      
    } catch (error) {
      console.error('Erro ao tocar som:', error)
    }
  }

  // Função para parar um som específico
  const stopSound = async (soundId: string) => {
    setCurrentMix(prev => {
      return prev.map(mixSound => {
        if (mixSound.sound.id === soundId && mixSound.isPlaying) {
          if (mixSound.oscillator) {
            try {
              mixSound.oscillator.stop()
            } catch (error) {
              console.debug('Oscillator stop error:', error)
            }
          }
          if (mixSound.oscillator2) {
            try {
              mixSound.oscillator2.stop()
            } catch (error) {
              console.debug('Oscillator2 stop error:', error)
            }
          }
          
          if (mixSound.audioContext) {
            cleanupAudioContext(mixSound.audioContext)
          }
          
          return { ...mixSound, isPlaying: false, audioContext: undefined, oscillator: undefined, oscillator2: undefined, gainNode: undefined }
        }
        return mixSound
      }).filter(mixSound => mixSound.isPlaying || mixSound.sound.id !== soundId)
    })
    
    if (currentlyPlayingSound === soundId) {
      setCurrentlyPlayingSound(null)
      setIsPlaying(false)
    }
  }

  // Função para tocar mix melhorada
  const playMix = () => {
    currentMix.forEach((mixSound) => {
      if (!mixSound.isPlaying) {
        try {
          const { audioContext, oscillator, oscillator2, gainNode } = createAudioElement(mixSound.sound)
          
          // Aplicar configurações do mix
          gainNode.gain.setValueAtTime(0, audioContext.currentTime)
          gainNode.gain.linearRampToValueAtTime(mixSound.volume / 100 * 0.3, audioContext.currentTime + 1)
          
          oscillator.start()
          if (oscillator2) oscillator2.start()
          
          mixSound.audioContext = audioContext
          mixSound.oscillator = oscillator
          mixSound.oscillator2 = oscillator2
          mixSound.gainNode = gainNode
          mixSound.isPlaying = true
          
        } catch (error) {
          console.error('Erro ao tocar som do mix:', error)
        }
      }
    })
    setIsPlaying(true)
  }

  // Função para pausar mix
  const pauseMix = async () => {
    const cleanupPromises = currentMix.map(async (mixSound) => {
      if (mixSound.isPlaying) {
        if (mixSound.oscillator) {
          try {
            mixSound.oscillator.stop()
          } catch (error) {
            console.debug('Oscillator pause error:', error)
          }
        }
        if (mixSound.oscillator2) {
          try {
            mixSound.oscillator2.stop()
          } catch (error) {
            console.debug('Oscillator2 pause error:', error)
          }
        }
        
        if (mixSound.audioContext) {
          await cleanupAudioContext(mixSound.audioContext)
        }
        
        mixSound.isPlaying = false
        mixSound.audioContext = undefined
        mixSound.oscillator = undefined
        mixSound.oscillator2 = undefined
        mixSound.gainNode = undefined
      }
    })
    
    await Promise.all(cleanupPromises)
    setIsPlaying(false)
  }

  // Função para parar todos os áudios
  const stopAllAudio = async () => {
    const cleanupPromises = currentMix.map(async (mixSound) => {
      if (mixSound.isPlaying) {
        if (mixSound.oscillator) {
          try {
            mixSound.oscillator.stop()
          } catch (error) {
            console.debug('Oscillator stop error:', error)
          }
        }
        if (mixSound.oscillator2) {
          try {
            mixSound.oscillator2.stop()
          } catch (error) {
            console.debug('Oscillator2 stop error:', error)
          }
        }
        
        if (mixSound.audioContext) {
          await cleanupAudioContext(mixSound.audioContext)
        }
      }
    })
    
    const allCleanupPromises = [
      ...cleanupPromises,
      ...Array.from(audioContextsRef.current).map(cleanupAudioContext)
    ]
    
    await Promise.all(allCleanupPromises)
    audioContextsRef.current.clear()
    
    if (storyUtteranceRef.current) {
      speechSynthesis.cancel()
    }
    
    setIsPlaying(false)
    setCurrentlyPlayingSound(null)
    setCurrentStory(null)
    setCurrentMix([])
  }

  // Função para tocar história
  const playStory = (story: Story) => {
    if (story.isPremium && !isPremium) return

    stopAllAudio()

    if (currentStory?.id === story.id) {
      setCurrentStory(null)
      speechSynthesis.cancel()
      return
    }

    speakMessage(story.content, story.voiceType)
    setCurrentStory(story)
    setIsPlaying(true)
  }

  const addToMix = (sound: Sound) => {
    if (currentMix.length >= 5) return
    if (sound.isPremium && !isPremium) return
    
    if (currentMix.some(ms => ms.sound.id === sound.id)) return
    
    const newMixSound: MixSound = {
      sound,
      volume: 50,
      echo: 0,
      side: 'both',
      isPlaying: false
    }
    setCurrentMix([...currentMix, newMixSound])
  }

  const removeFromMix = async (index: number) => {
    const mixSound = currentMix[index]
    if (mixSound.isPlaying) {
      if (mixSound.oscillator) {
        try {
          mixSound.oscillator.stop()
        } catch (error) {
          console.debug('Oscillator remove error:', error)
        }
      }
      if (mixSound.oscillator2) {
        try {
          mixSound.oscillator2.stop()
        } catch (error) {
          console.debug('Oscillator2 remove error:', error)
        }
      }
      
      if (mixSound.audioContext) {
        await cleanupAudioContext(mixSound.audioContext)
      }
    }
    setCurrentMix(currentMix.filter((_, i) => i !== index))
  }

  const updateMixSound = (index: number, updates: Partial<MixSound>) => {
    const updated = currentMix.map((mixSound, i) => {
      if (i === index) {
        const updatedMixSound = { ...mixSound, ...updates }
        if (updatedMixSound.isPlaying && updatedMixSound.gainNode && updates.volume !== undefined) {
          try {
            updatedMixSound.gainNode.gain.setValueAtTime(updates.volume / 100 * 0.3, updatedMixSound.audioContext!.currentTime)
          } catch (error) {
            console.debug('Volume update error:', error)
          }
        }
        return updatedMixSound
      }
      return mixSound
    })
    setCurrentMix(updated)
  }

  const saveMix = (name: string) => {
    if (currentMix.length === 0) return
    
    const newMix: SavedMix = {
      id: Date.now().toString(),
      name,
      sounds: currentMix.map(ms => ({ ...ms, isPlaying: false, audioContext: undefined, oscillator: undefined, oscillator2: undefined, gainNode: undefined })),
      createdAt: new Date()
    }
    setSavedMixes([...savedMixes, newMix])
  }

  // Funções para monitoramento de sono
  const startSleepTracking = () => {
    setCurrentSleepSession({
      id: Date.now().toString(),
      date: new Date(),
      sleepTime: new Date(),
      soundsUsed: currentMix.map(ms => ms.sound.name)
    })
    setSleepTracking(true)
  }

  const endSleepTracking = (quality: 1 | 2 | 3 | 4 | 5, notes?: string) => {
    if (!currentSleepSession) return

    const wakeTime = new Date()
    const duration = Math.floor((wakeTime.getTime() - (currentSleepSession.sleepTime?.getTime() || 0)) / (1000 * 60))

    const completedSession: SleepSession = {
      ...currentSleepSession as SleepSession,
      duration,
      quality,
      notes,
      wakeTime
    }

    setSleepSessions(prev => [completedSession, ...prev])
    setCurrentSleepSession(null)
    setSleepTracking(false)
  }

  // Componente da tela inicial
  const HomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center mr-4">
              <Moon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                ASMRFlow
              </h1>
              <p className="text-lg text-purple-200">Sono & Relaxamento</p>
            </div>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Encontre a paz interior com sons ASMR personalizados para dormir, relaxar e reduzir a ansiedade
          </p>
        </div>

        {/* Botões principais */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <button
            onClick={() => {
              setCurrentView('timer')
              startTimer(20)
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 p-8 rounded-3xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <Moon className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Quero dormir rápido</h3>
            <p className="text-blue-100">Timer de 20 minutos com sons relaxantes</p>
          </button>

          <button
            onClick={() => setCurrentView('library')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-8 rounded-3xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <Heart className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Quero relaxar</h3>
            <p className="text-purple-100">Biblioteca completa de sons ASMR</p>
          </button>

          <button
            onClick={() => setCurrentView('mixer')}
            className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 p-8 rounded-3xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <Music className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Quero criar meu mix</h3>
            <p className="text-pink-100">Combine até 5 sons personalizados</p>
          </button>
        </div>

        {/* Seções adicionais */}
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => setCurrentView('stories')}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 p-6 rounded-2xl transition-all duration-300 border border-white/20"
          >
            <FileText className="w-8 h-8 mb-3 text-purple-400" />
            <h4 className="text-xl font-semibold mb-2">Histórias & Sessões Guiadas</h4>
            <p className="text-gray-300">Contos narrados e respirações guiadas</p>
          </button>

          <button
            onClick={() => setCurrentView('sleep-monitor')}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 p-6 rounded-2xl transition-all duration-300 border border-white/20"
          >
            <Activity className="w-8 h-8 mb-3 text-green-400" />
            <h4 className="text-xl font-semibold mb-2">Monitoramento de Sono</h4>
            <p className="text-gray-300">Acompanhe a qualidade do seu sono</p>
          </button>

          <button
            onClick={() => setCurrentView('profile')}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 p-6 rounded-2xl transition-all duration-300 border border-white/20"
          >
            <User className="w-8 h-8 mb-3 text-blue-400" />
            <h4 className="text-xl font-semibold mb-2">Meu Perfil</h4>
            <p className="text-gray-300">Estatísticas e conquistas pessoais</p>
          </button>
        </div>

        {/* Premium banner */}
        {!isPremium && (
          <div className="mt-12 bg-gradient-to-r from-yellow-600 to-orange-600 p-6 rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-2">🌟 Desbloqueie o Premium</h3>
            <p className="mb-4">Sons binaurais, histórias exclusivas e monitoramento avançado</p>
            <button
              onClick={() => setIsPremium(true)}
              className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
            >
              Experimentar Grátis
            </button>
          </div>
        )}

        {/* Controle de áudio global */}
        {isPlaying && (
          <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => isPlaying ? stopAllAudio() : (currentMix.length > 0 ? playMix() : null)}
                className="bg-purple-600 hover:bg-purple-700 p-3 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <div className="text-sm">
                <p className="font-semibold">
                  {currentStory ? currentStory.title : 
                   currentlyPlayingSound ? sounds.find(s => s.id === currentlyPlayingSound)?.name :
                   currentMix.length > 0 ? `Mix (${currentMix.filter(ms => ms.isPlaying).length} sons)` : 'Tocando...'}
                </p>
                <p className="text-gray-400">ASMRFlow ativo</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Componente da biblioteca de sons melhorado
  const LibraryScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Biblioteca de Sons ASMR</h2>
          <button
            onClick={() => setCurrentView('home')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
          >
            ← Voltar
          </button>
        </div>

        {/* Filtros por categoria */}
        <div className="flex flex-wrap gap-3 mb-8">
          {['all', 'nature', 'ambient', 'asmr', 'binaural'].map((category) => (
            <button
              key={category}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors capitalize"
            >
              {category === 'all' ? 'Todos' : 
               category === 'asmr' ? 'ASMR Vozes' : 
               category === 'binaural' ? 'Sons Binaurais' : category}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sounds.map((sound) => (
            <div key={sound.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <sound.icon className={`w-8 h-8 mr-3 ${
                    sound.category === 'binaural' ? 'text-green-400' : 'text-purple-400'
                  }`} />
                  <div>
                    <h3 className="font-semibold">{sound.name}</h3>
                    <p className="text-sm text-gray-400 capitalize">
                      {sound.category === 'binaural' ? 'Binaural' : sound.category}
                    </p>
                    {sound.binauralFreq && (
                      <p className="text-xs text-green-300">{sound.binauralFreq}Hz diferença</p>
                    )}
                  </div>
                </div>
                {sound.isPremium && !isPremium && (
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                    Premium
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-300 mb-4">{sound.description}</p>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => playSound(sound)}
                  disabled={sound.isPremium && !isPremium}
                  className={`flex items-center px-4 py-2 rounded-full transition-colors ${
                    sound.isPremium && !isPremium
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : currentlyPlayingSound === sound.id
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {currentlyPlayingSound === sound.id ? 
                    <Pause className="w-4 h-4 mr-2" /> : 
                    <Play className="w-4 h-4 mr-2" />
                  }
                  {currentlyPlayingSound === sound.id ? 'Pausar' : 'Tocar'}
                </button>

                <button
                  onClick={() => addToMix(sound)}
                  disabled={sound.isPremium && !isPremium}
                  className={`p-2 rounded-full transition-colors ${
                    sound.isPremium && !isPremium
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Componente do criador de mix
  const MixerScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Criador de Mix Sonoro</h2>
          <button
            onClick={() => setCurrentView('home')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
          >
            ← Voltar
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Mix atual */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4">Seu Mix ({currentMix.length}/5)</h3>
            
            {currentMix.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Adicione sons da biblioteca para criar seu mix personalizado
              </p>
            ) : (
              <div className="space-y-4">
                {currentMix.map((mixSound, index) => (
                  <div key={index} className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">{mixSound.sound.name}</span>
                      <button
                        onClick={() => removeFromMix(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Volume: {mixSound.volume}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mixSound.volume}
                          onChange={(e) => updateMixSound(index, { volume: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Eco: {mixSound.echo}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mixSound.echo}
                          onChange={(e) => updateMixSound(index, { echo: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Lado do Fone</label>
                        <select
                          value={mixSound.side}
                          onChange={(e) => updateMixSound(index, { side: e.target.value as 'both' | 'left' | 'right' })}
                          className="w-full bg-white/20 rounded-lg px-3 py-2"
                        >
                          <option value="both">Ambos</option>
                          <option value="left">Esquerdo</option>
                          <option value="right">Direito</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentMix.length > 0 && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => isPlaying ? pauseMix() : playMix()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 rounded-full font-semibold transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5 inline mr-2" /> : <Play className="w-5 h-5 inline mr-2" />}
                  {isPlaying ? 'Pausar Mix' : 'Tocar Mix'}
                </button>
                
                <button
                  onClick={() => {
                    const name = prompt('Nome do seu mix:')
                    if (name) saveMix(name)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full transition-colors"
                >
                  <Save className="w-5 h-5" />
                </button>
                
                <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full transition-colors">
                  <Share className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Sons disponíveis */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4">Sons Disponíveis</h3>
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {sounds.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => addToMix(sound)}
                  disabled={currentMix.length >= 5 || (sound.isPremium && !isPremium) || currentMix.some(ms => ms.sound.id === sound.id)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                    currentMix.length >= 5 || (sound.isPremium && !isPremium) || currentMix.some(ms => ms.sound.id === sound.id)
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center">
                    <sound.icon className="w-5 h-5 mr-3" />
                    <span>{sound.name}</span>
                  </div>
                  {sound.isPremium && !isPremium && (
                    <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs">Premium</span>
                  )}
                  {currentMix.some(ms => ms.sound.id === sound.id) && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">Adicionado</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mixes salvos */}
        {savedMixes.length > 0 && (
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4">Mixes Salvos</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedMixes.map((mix) => (
                <div key={mix.id} className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-semibold mb-2">{mix.name}</h4>
                  <p className="text-sm text-gray-400 mb-3">{mix.sounds.length} sons</p>
                  <button
                    onClick={() => setCurrentMix(mix.sounds.map(s => ({ ...s, isPlaying: false })))}
                    className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg transition-colors"
                  >
                    Carregar Mix
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Componente de histórias e sessões
  const StoriesScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Histórias & Sessões Guiadas</h2>
          <button
            onClick={() => setCurrentView('home')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
          >
            ← Voltar
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div key={story.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    story.category === 'sleep' ? 'bg-blue-500' :
                    story.category === 'breathing' ? 'bg-green-500' : 'bg-purple-500'
                  }`}>
                    {story.category === 'sleep' ? <Moon className="w-6 h-6" /> :
                     story.category === 'breathing' ? <Circle className="w-6 h-6" /> :
                     <Heart className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{story.title}</h3>
                    <p className="text-sm text-gray-400">{story.duration}</p>
                    <p className="text-xs text-purple-300">
                      Voz {story.voiceType === 'female' ? 'Feminina' : 'Masculina'}
                    </p>
                  </div>
                </div>
                {story.isPremium && !isPremium && (
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                    Premium
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-300 mb-4 line-clamp-3">{story.content}</p>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => playStory(story)}
                  disabled={story.isPremium && !isPremium}
                  className={`flex items-center px-6 py-3 rounded-full transition-colors ${
                    story.isPremium && !isPremium
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : currentStory?.id === story.id
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {currentStory?.id === story.id ? 
                    <Pause className="w-4 h-4 mr-2" /> : 
                    <Play className="w-4 h-4 mr-2" />
                  }
                  {currentStory?.id === story.id ? 'Pausar' : 'Iniciar'}
                </button>

                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  story.category === 'sleep' ? 'bg-blue-500/20 text-blue-300' :
                  story.category === 'breathing' ? 'bg-green-500/20 text-green-300' :
                  'bg-purple-500/20 text-purple-300'
                }`}>
                  {story.category === 'sleep' ? 'Sono' :
                   story.category === 'breathing' ? 'Respiração' : 'Relaxamento'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Componente do timer
  const TimerScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Timer de Sono Inteligente</h2>
          <button
            onClick={() => setCurrentView('home')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
          >
            ← Voltar
          </button>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          {/* Timer display */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 mb-8 border border-white/20">
            <div className="text-8xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {timerActive ? formatTime(timeLeft) : `${timerMinutes}:00`}
            </div>
            
            <p className="text-xl text-gray-300 mb-8">
              {timerActive ? 'Relaxe e deixe os sons te levarem ao sono...' : 'Escolha o tempo para sua sessão de relaxamento'}
            </p>

            {!timerActive ? (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[20, 40, 60].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => setTimerMinutes(minutes)}
                    className={`py-4 px-6 rounded-2xl font-semibold transition-all ${
                      timerMinutes === minutes
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {minutes} min
                  </button>
                ))}
              </div>
            ) : (
              <div className="mb-8">
                <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((timerMinutes * 60 - timeLeft) / (timerMinutes * 60)) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4">
              {!timerActive ? (
                <>
                  <button
                    onClick={() => startTimer(timerMinutes)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-4 rounded-2xl font-semibold transition-all hover:scale-105"
                  >
                    <Play className="w-6 h-6 inline mr-2" />
                    Iniciar Sessão
                  </button>
                  
                  {!sleepTracking && (
                    <button
                      onClick={startSleepTracking}
                      className="bg-green-600 hover:bg-green-700 px-6 py-4 rounded-2xl font-semibold transition-all"
                    >
                      <Bed className="w-6 h-6 inline mr-2" />
                      Monitorar Sono
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => isPlaying ? pauseMix() : playMix()}
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={() => {
                      setTimerActive(false)
                      setTimeLeft(0)
                      stopAllAudio()
                    }}
                    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Monitoramento de sono ativo */}
          {sleepTracking && (
            <div className="bg-green-600/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-green-400/30">
              <h3 className="text-xl font-bold mb-4 text-green-300">Monitoramento de Sono Ativo</h3>
              <p className="text-green-200 mb-4">
                Iniciado às {currentSleepSession?.sleepTime?.toLocaleTimeString()}
              </p>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((quality) => (
                  <button
                    key={quality}
                    onClick={() => {
                      const notes = prompt('Como foi seu sono? (opcional)')
                      endSleepTracking(quality as 1 | 2 | 3 | 4 | 5, notes || undefined)
                    }}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl transition-colors"
                  >
                    {quality} ⭐
                  </button>
                ))}
              </div>
              <p className="text-sm text-green-300 mt-2">Clique para avaliar e finalizar</p>
            </div>
          )}

          {/* Sons ativos */}
          {currentMix.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4">Sons Ativos</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {currentMix.map((mixSound, index) => (
                  <span key={index} className={`px-4 py-2 rounded-full text-sm ${
                    mixSound.isPlaying ? 'bg-green-600/30 text-green-300' : 'bg-purple-600/30 text-purple-300'
                  }`}>
                    {mixSound.sound.name} ({mixSound.volume}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Componente do monitoramento de sono
  const SleepMonitorScreen = () => {
    const sleepStats = calculateSleepStats()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Monitoramento de Sono</h2>
            <button
              onClick={() => setCurrentView('home')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
            >
              ← Voltar
            </button>
          </div>

          {/* Estatísticas principais */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-8 h-8 mr-3 text-blue-400" />
                <h3 className="text-lg font-semibold">Qualidade Média</h3>
              </div>
              <p className="text-3xl font-bold text-blue-400">
                {sleepStats.averageQuality.toFixed(1)}/5
              </p>
              <p className="text-sm text-gray-400">⭐ Últimas {sleepStats.totalSessions} noites</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <Clock className="w-8 h-8 mr-3 text-green-400" />
                <h3 className="text-lg font-semibold">Duração Média</h3>
              </div>
              <p className="text-3xl font-bold text-green-400">
                {Math.floor(sleepStats.averageDuration / 60)}h {Math.floor(sleepStats.averageDuration % 60)}m
              </p>
              <p className="text-sm text-gray-400">Por noite</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-8 h-8 mr-3 text-purple-400" />
                <h3 className="text-lg font-semibold">Total de Horas</h3>
              </div>
              <p className="text-3xl font-bold text-purple-400">
                {Math.floor(sleepStats.totalHours)}h
              </p>
              <p className="text-sm text-gray-400">Sono monitorado</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <Music className="w-8 h-8 mr-3 text-yellow-400" />
                <h3 className="text-lg font-semibold">Som Favorito</h3>
              </div>
              <p className="text-lg font-bold text-yellow-400">
                {sleepStats.favoriteSound}
              </p>
              <p className="text-sm text-gray-400">Mais usado</p>
            </div>
          </div>

          {/* Gráfico de tendência semanal */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
            <h3 className="text-xl font-bold mb-6">Tendência Semanal</h3>
            <div className="flex items-end justify-between h-32 gap-2">
              {sleepStats.weeklyTrend.map((quality, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-gradient-to-t from-purple-600 to-blue-400 rounded-t-lg w-full transition-all duration-500"
                    style={{ height: `${(quality / 5) * 100}%` }}
                  ></div>
                  <p className="text-xs text-gray-400 mt-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][index]}
                  </p>
                  <p className="text-xs text-white font-semibold">
                    {quality > 0 ? quality : '-'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico de sessões */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-6">Histórico de Sono</h3>
            <div className="space-y-4">
              {sleepSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Bed className="w-5 h-5 mr-3 text-blue-400" />
                      <span className="font-semibold">
                        {session.date.toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < session.quality ? 'text-yellow-400' : 'text-gray-600'
                          }`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>
                      <p><strong>Duração:</strong> {Math.floor(session.duration / 60)}h {session.duration % 60}m</p>
                      <p><strong>Sons usados:</strong> {session.soundsUsed.join(', ')}</p>
                    </div>
                    {session.notes && (
                      <div>
                        <p><strong>Observações:</strong> {session.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {sleepSessions.length === 0 && (
              <div className="text-center py-8">
                <Bed className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400 mb-4">Nenhuma sessão de sono registrada ainda</p>
                <button
                  onClick={() => setCurrentView('timer')}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-full transition-colors"
                >
                  Iniciar Primeira Sessão
                </button>
              </div>
            )}
          </div>

          {/* Insights e dicas */}
          <div className="mt-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30">
            <h3 className="text-xl font-bold mb-4">💡 Insights Personalizados</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="mb-2">
                  <strong>Melhor dia:</strong> {sleepStats.bestDay}
                </p>
                <p className="mb-2">
                  <strong>Recomendação:</strong> {
                    sleepStats.averageQuality >= 4 
                      ? 'Continue com sua rotina atual!'
                      : sleepStats.averageQuality >= 3
                      ? 'Tente usar sons binaurais para melhorar a qualidade.'
                      : 'Considere ajustar seu ambiente de sono e usar mais sons relaxantes.'
                  }
                </p>
              </div>
              <div>
                <p className="mb-2">
                  <strong>Dica:</strong> {
                    sleepStats.favoriteSound.includes('Delta') || sleepStats.favoriteSound.includes('Theta')
                      ? 'Sons binaurais estão funcionando bem para você!'
                      : 'Experimente sons binaurais Delta Waves para sono mais profundo.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Componente do perfil
  const ProfileScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Meu Perfil</h2>
          <button
            onClick={() => setCurrentView('home')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
          >
            ← Voltar
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Estatísticas */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-blue-400" />
              Estatísticas
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-300">Dias usando o app</p>
                <p className="text-2xl font-bold text-blue-400">{userStats.daysUsed}</p>
              </div>
              <div>
                <p className="text-gray-300">Total de sessões</p>
                <p className="text-2xl font-bold text-purple-400">{userStats.totalSessions}</p>
              </div>
              <div>
                <p className="text-gray-300">Som favorito</p>
                <p className="text-lg font-semibold text-green-400">{userStats.favoriteSound}</p>
              </div>
            </div>
          </div>

          {/* Conquistas */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Circle className="w-6 h-6 mr-2 text-yellow-400" />
              Conquistas
            </h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-yellow-500/20 rounded-xl">
                <Circle className="w-8 h-8 mr-3 text-yellow-400" />
                <div>
                  <p className="font-semibold">Primeira Semana</p>
                  <p className="text-sm text-gray-300">Usou o app por 7 dias</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-purple-500/20 rounded-xl">
                <Circle className="w-8 h-8 mr-3 text-purple-400" />
                <div>
                  <p className="font-semibold">Criador de Mixes</p>
                  <p className="text-sm text-gray-300">Criou seu primeiro mix</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-blue-500/20 rounded-xl">
                <Circle className="w-8 h-8 mr-3 text-blue-400" />
                <div>
                  <p className="font-semibold">Noites Tranquilas</p>
                  <p className="text-sm text-gray-300">20 sessões de sono</p>
                </div>
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Settings className="w-6 h-6 mr-2 text-gray-400" />
              Configurações
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Modo Premium</span>
                <button
                  onClick={() => setIsPremium(!isPremium)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    isPremium ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    isPremium ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Notificações</span>
                <button className="w-12 h-6 bg-green-500 rounded-full">
                  <div className="w-5 h-5 bg-white rounded-full translate-x-6"></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Modo Escuro</span>
                <button className="w-12 h-6 bg-green-500 rounded-full">
                  <div className="w-5 h-5 bg-white rounded-full translate-x-6"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mixes salvos */}
        {savedMixes.length > 0 && (
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4">Seus Mixes Salvos</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedMixes.map((mix) => (
                <div key={mix.id} className="bg-white/10 rounded-xl p-4">
                  <h4 className="font-semibold mb-2">{mix.name}</h4>
                  <p className="text-sm text-gray-400 mb-2">{mix.sounds.length} sons</p>
                  <p className="text-xs text-gray-500">
                    Criado em {mix.createdAt.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Renderização principal
  return (
    <div className="min-h-screen">
      {currentView === 'home' && <HomeScreen />}
      {currentView === 'library' && <LibraryScreen />}
      {currentView === 'mixer' && <MixerScreen />}
      {currentView === 'stories' && <StoriesScreen />}
      {currentView === 'timer' && <TimerScreen />}
      {currentView === 'sleep-monitor' && <SleepMonitorScreen />}
      {currentView === 'profile' && <ProfileScreen />}
    </div>
  )
}