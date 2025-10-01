'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Play, Pause, VolumeX, Volume2, Plus, Minus, Save, Settings, 
  Moon, Music, FileText, Clock, User, Bed, Sparkles, Brain,
  Activity, TrendingUp, BarChart3, Wand2, RefreshCw
} from 'lucide-react'

// Tipos
interface Sound {
  id: string
  name: string
  description: string
  category: 'nature' | 'ambient' | 'asmr' | 'voice' | 'binaural'
  icon: React.ComponentType<any>
  isPremium: boolean
  audioUrl: string
}

interface MixSound {
  sound: Sound
  volume: number
  echo: number
  side: 'both' | 'left' | 'right'
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
  category: string
  voiceType: 'male' | 'female'
  isPremium: boolean
  audioUrl: string
}

interface SleepSession {
  id: string
  date: Date
  sleepTime?: Date
  wakeTime?: Date
  duration: number
  quality: 1 | 2 | 3 | 4 | 5
  notes?: string
  soundsUsed: string[]
}

interface GeneratedContent {
  title: string
  content: string
  duration: string
  category: 'sleep' | 'relaxation' | 'breathing' | 'meditation'
  voiceType: 'male' | 'female'
}

interface UserStats {
  daysUsed: number
  totalSessions: number
  favoriteSound: string
}

export default function ASMRFlowApp() {
  // Estados principais
  const [currentView, setCurrentView] = useState<'home' | 'library' | 'mixer' | 'stories' | 'timer' | 'profile' | 'sleep-monitor' | 'ai-generator'>('home')
  const [currentMix, setCurrentMix] = useState<MixSound[]>([])
  const [savedMixes, setSavedMixes] = useState<SavedMix[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentlyPlayingSound, setCurrentlyPlayingSound] = useState<string | null>(null)
  const [currentStory, setCurrentStory] = useState<Story | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  
  // Timer states
  const [timerActive, setTimerActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerMinutes, setTimerMinutes] = useState(20)
  
  // Sleep tracking states
  const [sleepTracking, setSleepTracking] = useState(false)
  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>([])
  const [currentSleepSession, setCurrentSleepSession] = useState<Partial<SleepSession> | null>(null)
  
  // AI Generator states
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [userMood, setUserMood] = useState('')
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([])
  const [meditationThemes, setMeditationThemes] = useState<string[]>([])
  
  // User stats
  const [userStats, setUserStats] = useState<UserStats>({
    daysUsed: 15,
    totalSessions: 42,
    favoriteSound: 'Chuva na Floresta'
  })

  // Audio refs
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  // Sons disponíveis
  const sounds: Sound[] = [
    {
      id: 'rain-forest',
      name: 'Chuva na Floresta',
      description: 'Som relaxante de chuva caindo em uma floresta densa',
      category: 'nature',
      icon: Music,
      isPremium: false,
      audioUrl: 'https://www.soundjay.com/misc/sounds/rain-01.wav'
    },
    {
      id: 'ocean-waves',
      name: 'Ondas do Oceano',
      description: 'Ondas suaves batendo na praia ao entardecer',
      category: 'nature',
      icon: Music,
      isPremium: false,
      audioUrl: 'https://www.soundjay.com/misc/sounds/ocean-01.wav'
    },
    {
      id: 'white-noise',
      name: 'Ruído Branco',
      description: 'Som constante e uniforme para mascarar outros ruídos',
      category: 'ambient',
      icon: Music,
      isPremium: false,
      audioUrl: 'https://www.soundjay.com/misc/sounds/white-noise.wav'
    },
    {
      id: 'fireplace',
      name: 'Lareira Crepitante',
      description: 'Som aconchegante de madeira queimando na lareira',
      category: 'ambient',
      icon: Music,
      isPremium: true,
      audioUrl: 'https://www.soundjay.com/misc/sounds/fire-01.wav'
    },
    {
      id: 'whisper-asmr',
      name: 'Sussurros ASMR',
      description: 'Sussurros suaves e relaxantes para induzir o sono',
      category: 'asmr',
      icon: Music,
      isPremium: true,
      audioUrl: 'https://www.soundjay.com/misc/sounds/whisper.wav'
    },
    {
      id: 'binaural-theta',
      name: 'Ondas Theta',
      description: 'Frequências binaurais para relaxamento profundo',
      category: 'binaural',
      icon: Music,
      isPremium: true,
      audioUrl: 'https://www.soundjay.com/misc/sounds/binaural.wav'
    }
  ]

  // Histórias disponíveis
  const stories: Story[] = [
    {
      id: 'enchanted-forest',
      title: 'A Floresta Encantada',
      duration: '15 min',
      category: 'Fantasia',
      voiceType: 'female',
      isPremium: false,
      audioUrl: 'https://www.soundjay.com/misc/sounds/story1.wav'
    },
    {
      id: 'space-journey',
      title: 'Jornada Espacial',
      duration: '20 min',
      category: 'Ficção Científica',
      voiceType: 'male',
      isPremium: true,
      audioUrl: 'https://www.soundjay.com/misc/sounds/story2.wav'
    },
    {
      id: 'peaceful-meadow',
      title: 'O Prado Tranquilo',
      duration: '12 min',
      category: 'Natureza',
      voiceType: 'female',
      isPremium: false,
      audioUrl: 'https://www.soundjay.com/misc/sounds/story3.wav'
    }
  ]

  // Funções de áudio
  const playSound = (sound: Sound) => {
    if (sound.isPremium && !isPremium) {
      alert('Este som é exclusivo para usuários Premium!')
      return
    }

    // Para demonstração, vamos simular o áudio
    setCurrentlyPlayingSound(sound.id)
    setTimeout(() => setCurrentlyPlayingSound(null), 3000)
  }

  const addToMix = (sound: Sound) => {
    if (sound.isPremium && !isPremium) {
      alert('Este som é exclusivo para usuários Premium!')
      return
    }

    const newMixSound: MixSound = {
      sound,
      volume: 70,
      echo: 0,
      side: 'both',
      isPlaying: false
    }

    setCurrentMix(prev => [...prev, newMixSound])
  }

  const removeFromMix = (index: number) => {
    setCurrentMix(prev => prev.filter((_, i) => i !== index))
  }

  const updateMixSound = (index: number, updates: Partial<MixSound>) => {
    setCurrentMix(prev => prev.map((mixSound, i) => 
      i === index ? { ...mixSound, ...updates } : mixSound
    ))
  }

  const playMix = () => {
    setIsPlaying(true)
    setCurrentMix(prev => prev.map(mixSound => ({ ...mixSound, isPlaying: true })))
  }

  const pauseMix = () => {
    setIsPlaying(false)
    setCurrentMix(prev => prev.map(mixSound => ({ ...mixSound, isPlaying: false })))
  }

  const stopAllAudio = () => {
    setIsPlaying(false)
    setCurrentlyPlayingSound(null)
    setCurrentStory(null)
    setCurrentMix(prev => prev.map(mixSound => ({ ...mixSound, isPlaying: false })))
  }

  const saveMix = (name: string) => {
    const newMix: SavedMix = {
      id: Date.now().toString(),
      name,
      sounds: [...currentMix],
      createdAt: new Date()
    }
    setSavedMixes(prev => [...prev, newMix])
  }

  const playStory = (story: Story) => {
    if (story.isPremium && !isPremium) {
      alert('Esta história é exclusiva para usuários Premium!')
      return
    }

    setCurrentStory(story)
    setTimeout(() => setCurrentStory(null), 5000) // Simula fim da história
  }

  // Timer functions
  const startTimer = (minutes: number) => {
    setTimerActive(true)
    setTimeLeft(minutes * 60)
    
    // Auto-play current mix if available
    if (currentMix.length > 0) {
      playMix()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Sleep tracking functions
  const startSleepTracking = () => {
    const newSession: Partial<SleepSession> = {
      id: Date.now().toString(),
      date: new Date(),
      sleepTime: new Date(),
      soundsUsed: currentMix.map(m => m.sound.name)
    }
    
    setCurrentSleepSession(newSession)
    setSleepTracking(true)
    
    if (currentMix.length > 0) {
      playMix()
    }
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

  const calculateSleepStats = () => {
    if (sleepSessions.length === 0) {
      return { averageQuality: 0, averageDuration: 0, totalSessions: 0, totalHours: 0 }
    }

    const totalQuality = sleepSessions.reduce((sum, session) => sum + session.quality, 0)
    const totalDuration = sleepSessions.reduce((sum, session) => sum + session.duration, 0)
    
    return {
      averageQuality: totalQuality / sleepSessions.length,
      averageDuration: totalDuration / sleepSessions.length,
      totalSessions: sleepSessions.length,
      totalHours: totalDuration / 60
    }
  }

  // AI Generator functions
  const generatePersonalizedContent = async (
    category: 'sleep' | 'relaxation' | 'breathing' | 'meditation',
    theme: string,
    duration: number,
    voiceType: 'male' | 'female'
  ) => {
    setIsGenerating(true)
    
    // Simular geração de conteúdo
    setTimeout(() => {
      const content: GeneratedContent = {
        title: `${category === 'sleep' ? 'História para Dormir' : 'Sessão de ' + category} - ${theme}`,
        content: `Uma experiência personalizada de ${category} focada em ${theme}. Este conteúdo foi criado especialmente para você, considerando suas preferências e histórico de uso. Relaxe e deixe-se levar por esta jornada única de ${duration} minutos.`,
        duration: `${duration} min`,
        category,
        voiceType
      }
      
      setGeneratedContent(content)
      setIsGenerating(false)
    }, 2000)
  }

  const generateRecommendations = () => {
    const recommendations = [
      'Baseado no seu histórico, recomendamos sons de chuva entre 22h-23h',
      'Você tem melhor qualidade de sono com sessões de 20-25 minutos',
      'Tente combinar ondas theta com sons da natureza para relaxamento profundo',
      'Suas sessões são mais eficazes quando você usa o timer',
      'Considere histórias de fantasia - elas se alinham com seu perfil de relaxamento'
    ]
    
    setAiRecommendations(recommendations.slice(0, 3))
  }

  const generateThemesForMood = (mood: string) => {
    const themes = [
      'Jardim Secreto', 'Viagem nas Nuvens', 'Cabana na Montanha',
      'Praia ao Luar', 'Floresta Mística', 'Vale dos Sonhos',
      'Castelo nas Estrelas', 'Rio Tranquilo', 'Campo de Lavanda'
    ]
    
    setMeditationThemes(themes.slice(0, 6))
  }

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false)
            stopAllAudio()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => clearInterval(interval)
  }, [timerActive, timeLeft])

  // Generate initial recommendations
  useEffect(() => {
    generateRecommendations()
  }, [])

  // Renderização do componente
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <header className="p-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Moon className="w-8 h-8 text-yellow-300" />
            <h1 className="text-2xl font-bold">ASMRFlow</h1>
          </div>
          
          <nav className="flex space-x-4">
            {[
              { id: 'home', label: 'Início', icon: Moon },
              { id: 'library', label: 'Biblioteca', icon: Music },
              { id: 'mixer', label: 'Mixer', icon: Settings },
              { id: 'stories', label: 'Histórias', icon: FileText },
              { id: 'timer', label: 'Timer', icon: Clock },
              { id: 'profile', label: 'Perfil', icon: User },
              { id: 'sleep-monitor', label: 'Sono', icon: Bed },
              { id: 'ai-generator', label: 'IA', icon: Wand2 }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id as any)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === id ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4 inline mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {currentView === 'home' && (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <Bed className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <h3 className="text-xl font-semibold mb-2">Dormir Rápido</h3>
                <p className="text-white/70 mb-4">Inicie um timer com sons relaxantes</p>
                <button
                  onClick={() => startTimer(20)}
                  className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Começar (20 min)
                </button>
              </div>

              <div className="bg-white/10 rounded-xl p-6 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-xl font-semibold mb-2">Mix Personalizado</h3>
                <p className="text-white/70 mb-4">Crie sua combinação perfeita</p>
                <button
                  onClick={() => setCurrentView('mixer')}
                  className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Criar Mix
                </button>
              </div>

              <div className="bg-white/10 rounded-xl p-6 text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <h3 className="text-xl font-semibold mb-2">Conteúdo IA</h3>
                <p className="text-white/70 mb-4">Histórias e temas gerados por IA</p>
                <button
                  onClick={() => setCurrentView('ai-generator')}
                  className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Explorar
                </button>
              </div>
            </div>

            {/* Featured Sounds */}
            <div className="bg-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Sons em Destaque</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sounds.slice(0, 8).map((sound) => (
                  <div
                    key={sound.id}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => playSound(sound)}
                  >
                    <sound.icon className="w-8 h-8 mb-2 text-yellow-300" />
                    <h3 className="font-semibold text-sm">{sound.name}</h3>
                    <p className="text-white/60 text-xs mt-1">{sound.description.slice(0, 40)}...</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Player Controls */}
            {currentMix.length > 0 && (
              <div className="bg-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Reproduzindo</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={isPlaying ? pauseMix : playMix}
                      className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={stopAllAudio}
                      className="bg-red-500/20 hover:bg-red-500/30 p-3 rounded-lg transition-colors"
                    >
                      <VolumeX className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {currentMix.map((mixSound, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <mixSound.sound.icon className="w-5 h-5 text-yellow-300" />
                        <span className="font-medium">{mixSound.sound.name}</span>
                        {mixSound.isPlaying && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4" />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mixSound.volume}
                          onChange={(e) => updateMixSound(index, { volume: parseInt(e.target.value) })}
                          className="w-20"
                        />
                        <button
                          onClick={() => removeFromMix(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'library' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Biblioteca de Sons</h2>
            
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['all', 'nature', 'ambient', 'asmr', 'voice', 'binaural'].map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    category === 'all' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {category === 'all' ? 'Todos' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Sound Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sounds.map((sound) => (
                <div
                  key={sound.id}
                  className={`bg-white/10 rounded-xl p-6 hover:bg-white/20 transition-colors cursor-pointer ${
                    sound.isPremium && !isPremium ? 'opacity-50' : ''
                  }`}
                  onClick={() => playSound(sound)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <sound.icon className="w-12 h-12 text-yellow-300" />
                    {sound.isPremium && (
                      <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">PREMIUM</span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{sound.name}</h3>
                  <p className="text-white/70 mb-4">{sound.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      sound.category === 'nature' ? 'bg-green-500/20 text-green-300' :
                      sound.category === 'ambient' ? 'bg-blue-500/20 text-blue-300' :
                      sound.category === 'asmr' ? 'bg-purple-500/20 text-purple-300' :
                      sound.category === 'voice' ? 'bg-pink-500/20 text-pink-300' :
                      sound.category === 'binaural' ? 'bg-orange-500/20 text-orange-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {sound.category}
                    </span>
                    
                    {currentlyPlayingSound === sound.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-semibold">Tocando</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToMix(sound)}
                        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-colors"
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        Mix
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'mixer' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Mixer de Sons</h2>
            
            {/* Current Mix */}
            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Seu Mix Atual</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={isPlaying ? pauseMix : playMix}
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 inline mr-2" /> : <Play className="w-5 h-5 inline mr-2" />}
                    {isPlaying ? 'Pausar' : 'Tocar'}
                  </button>
                  <button
                    onClick={stopAllAudio}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    <VolumeX className="w-5 h-5 inline mr-2" />
                    Parar
                  </button>
                  <button
                    onClick={() => saveMix(`Mix ${savedMixes.length + 1}`)}
                    className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    Salvar
                  </button>
                </div>
              </div>

              {currentMix.length === 0 ? (
                <p className="text-white/60 text-center py-8">Adicione sons à sua mix clicando em "Mix" na biblioteca</p>
              ) : (
                <div className="space-y-4">
                  {currentMix.map((mixSound, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <mixSound.sound.icon className="w-8 h-8 text-yellow-300" />
                          <div>
                            <h4 className="font-semibold">{mixSound.sound.name}</h4>
                            <p className="text-white/60 text-sm">{mixSound.sound.description}</p>
                          </div>
                          {mixSound.isPlaying && <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>}
                        </div>
                        <button
                          onClick={() => removeFromMix(index)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Volume</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={mixSound.volume}
                            onChange={(e) => updateMixSound(index, { volume: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <span className="text-xs text-white/60">{mixSound.volume}%</span>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Eco</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={mixSound.echo}
                            onChange={(e) => updateMixSound(index, { echo: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <span className="text-xs text-white/60">{mixSound.echo}%</span>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Lado</label>
                          <select
                            value={mixSound.side}
                            onChange={(e) => updateMixSound(index, { side: e.target.value as 'both' | 'left' | 'right' })}
                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
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
            </div>

            {/* Saved Mixes */}
            {savedMixes.length > 0 && (
              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Mixes Salvos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedMixes.map((savedMix) => (
                    <div key={savedMix.id} className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{savedMix.name}</h4>
                      <p className="text-white/60 text-sm mb-3">
                        {savedMix.sounds.length} sons • Criado em {savedMix.createdAt.toLocaleDateString()}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {savedMix.sounds.slice(0, 3).map((sound, idx) => (
                          <span key={idx} className="bg-white/10 px-2 py-1 rounded text-xs">
                            {sound.sound.name}
                          </span>
                        ))}
                        {savedMix.sounds.length > 3 && (
                          <span className="text-white/60 text-xs">+{savedMix.sounds.length - 3} mais</span>
                        )}
                      </div>
                      <button
                        onClick={() => setCurrentMix(savedMix.sounds)}
                        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Carregar Mix
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'stories' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Histórias para Dormir</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className={`bg-white/10 rounded-xl p-6 hover:bg-white/20 transition-colors cursor-pointer ${
                    story.isPremium && !isPremium ? 'opacity-50' : ''
                  }`}
                  onClick={() => playStory(story)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="w-8 h-8 text-blue-300" />
                    {story.isPremium && (
                      <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">PREMIUM</span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
                  <p className="text-white/70 mb-4">{story.duration} • {story.category}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      story.voiceType === 'female' ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {story.voiceType === 'female' ? 'Feminina' : 'Masculina'}
                    </span>
                    
                    {currentStory?.id === story.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-semibold">Narrando</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => playStory(story)}
                        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Play className="w-4 h-4 inline mr-1" />
                        Ouvir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'timer' && (
          <div className="max-w-md mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold">Timer de Sono</h2>
            
            <div className="bg-white/10 rounded-xl p-8">
              <div className="text-6xl font-mono mb-8">
                {timerActive ? formatTime(timeLeft) : formatTime(timerMinutes * 60)}
              </div>
              
              {!timerActive ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Duração (minutos)</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 20)}
                      className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white text-center text-xl"
                    />
                  </div>
                  
                  <button
                    onClick={() => startTimer(timerMinutes)}
                    className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors w-full"
                  >
                    <Play className="w-6 h-6 inline mr-2" />
                    Iniciar Timer
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={isPlaying ? pauseMix : playMix}
                      className="bg-blue-500 hover:bg-blue-600 p-4 rounded-lg transition-colors"
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                    </button>
                    
                    <button
                      onClick={() => {
                        setTimerActive(false)
                        setTimeLeft(0)
                        stopAllAudio()
                      }}
                      className="bg-red-500 hover:bg-red-600 p-4 rounded-lg transition-colors"
                    >
                      <VolumeX className="w-8 h-8" />
                    </button>
                  </div>
                  
                  <p className="text-white/70">Timer ativo - relaxe e durma bem!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Seu Perfil</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Estatísticas</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Dias usando o app:</span>
                    <span className="font-semibold">{userStats.daysUsed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de sessões:</span>
                    <span className="font-semibold">{userStats.totalSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Som favorito:</span>
                    <span className="font-semibold">{userStats.favoriteSound}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Premium</h3>
                <div className="text-center">
                  <div className={`text-4xl mb-4 ${isPremium ? 'text-yellow-400' : 'text-white/50'}`}>
                    {isPremium ? '⭐' : '☆'}
                  </div>
                  <p className={`mb-4 ${isPremium ? 'text-white' : 'text-white/70'}`}>
                    {isPremium ? 'Você tem acesso premium!' : 'Desbloqueie sons exclusivos e recursos avançados'}
                  </p>
                  {!isPremium && (
                    <button
                      onClick={() => setIsPremium(true)}
                      className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Upgrade para Premium
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'sleep-monitor' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Monitoramento de Sono</h2>
            
            {/* Sleep Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <div className="text-2xl font-bold">{calculateSleepStats().averageQuality.toFixed(1)}</div>
                <div className="text-white/70">Qualidade Média</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold">{calculateSleepStats().averageDuration.toFixed(0)}min</div>
                <div className="text-white/70">Duração Média</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="text-2xl font-bold">{calculateSleepStats().totalSessions}</div>
                <div className="text-white/70">Total de Sessões</div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                <div className="text-2xl font-bold">{calculateSleepStats().totalHours.toFixed(0)}h</div>
                <div className="text-white/70">Horas Totais</div>
              </div>
            </div>

            {/* Sleep Sessions */}
            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Histórico de Sono</h3>
              
              {sleepSessions.length === 0 ? (
                <p className="text-white/60 text-center py-8">Nenhuma sessão registrada ainda</p>
              ) : (
                <div className="space-y-4">
                  {sleepSessions.map((session) => (
                    <div key={session.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold">{session.date.toLocaleDateString()}</div>
                          <div className="text-white/60 text-sm">
                            {session.duration} minutos • Qualidade: {'⭐'.repeat(session.quality)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white/60">
                            {session.sleepTime?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                            {session.wakeTime?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                      
                      {session.notes && (
                        <p className="text-white/70 text-sm mb-2">{session.notes}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {session.soundsUsed.map((sound, idx) => (
                          <span key={idx} className="bg-white/10 px-2 py-1 rounded text-xs">
                            {sound}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sleep Tracking */}
            {sleepTracking ? (
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 text-center">
                <Bed className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <h3 className="text-xl font-semibold mb-2">Monitoramento Ativo</h3>
                <p className="text-white/70 mb-4">
                  Iniciado em {currentSleepSession?.sleepTime?.toLocaleTimeString()}
                </p>
                <button
                  onClick={() => setSleepTracking(false)}
                  className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancelar Monitoramento
                </button>
              </div>
            ) : (
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <Bed className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <h3 className="text-xl font-semibold mb-2">Pronto para Dormir?</h3>
                <p className="text-white/70 mb-4">
                  Inicie o monitoramento para registrar sua sessão de sono
                </p>
                <button
                  onClick={startSleepTracking}
                  className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Iniciar Monitoramento
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'ai-generator' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Gerador de Conteúdo IA</h2>
            
            {/* Generate Content */}
            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Gerar História Personalizada</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Conteúdo</label>
                  <select
                    value={generatedContent?.category || 'sleep'}
                    onChange={(e) => setGeneratedContent(prev => prev ? {...prev, category: e.target.value as any} : null)}
                    className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
                  >
                    <option value="sleep">História para Dormir</option>
                    <option value="relaxation">Relaxamento</option>
                    <option value="breathing">Respiração Guiada</option>
                    <option value="meditation">Meditação</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Voz</label>
                  <select
                    value={generatedContent?.voiceType || 'female'}
                    onChange={(e) => setGeneratedContent(prev => prev ? {...prev, voiceType: e.target.value as any} : null)}
                    className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
                  >
                    <option value="female">Feminina</option>
                    <option value="male">Masculina</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Tema ou Palavras-chave</label>
                <input
                  type="text"
                  placeholder="Ex: floresta encantada, viagem espacial, paz interior..."
                  value={userMood}
                  onChange={(e) => setUserMood(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder-white/50"
                />
              </div>
              
              <button
                onClick={() => generatePersonalizedContent(
                  generatedContent?.category || 'sleep',
                  userMood || 'relaxamento profundo',
                  15,
                  generatedContent?.voiceType || 'female'
                )}
                disabled={isGenerating}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 inline mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 inline mr-2" />
                    Gerar Conteúdo
                  </>
                )}
              </button>
              
              {generatedContent && (
                <div className="mt-6 p-4 bg-white/5 rounded-lg">
                  <h4 className="font-semibold mb-2">{generatedContent.title}</h4>
                  <p className="text-white/70 text-sm mb-3">
                    {generatedContent.duration} • {generatedContent.voiceType === 'female' ? 'Voz Feminina' : 'Voz Masculina'}
                  </p>
                  <p className="text-white/80">{generatedContent.content}</p>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Recomendações Personalizadas</h3>
              
              {aiRecommendations.length === 0 ? (
                <p className="text-white/60 text-center py-4">Gerando recomendações baseadas no seu histórico...</p>
              ) : (
                <div className="space-y-3">
                  {aiRecommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-white/80">{rec}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <button
                onClick={generateRecommendations}
                className="mt-4 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Atualizar Recomendações
              </button>
            </div>

            {/* Themes */}
            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Temas de Meditação</h3>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Digite seu humor atual..."
                  value={userMood}
                  onChange={(e) => setUserMood(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white placeholder-white/50"
                />
              </div>
              
              <button
                onClick={() => generateThemesForMood(userMood)}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold transition-colors mb-4"
              >
                <Wand2 className="w-4 h-4 inline mr-2" />
                Gerar Temas
              </button>
              
              {meditationThemes.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {meditationThemes.map((theme, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-3 text-center">
                      <span className="text-white/80">{theme}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}