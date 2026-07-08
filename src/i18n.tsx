import { createContext, useContext, useState, type ReactNode } from 'react'

export type Lang = 'en-US' | 'pt-BR'

const dict = {
  'en-US': {
    'app.title': 'BJJ Journey',
    'app.tagline': 'Your jiu-jitsu story, one roll at a time',
    'panel.yourName': 'Your name',
    'panel.yourNamePlaceholder': 'e.g. Carlos Gracie',
    'panel.addEvent': 'Add event',
    'panel.events': 'Your events',
    'panel.noEvents': 'No events yet. Add your first one above — oss!',
    'form.type': 'What happened?',
    'form.date': 'When?',
    'form.school': 'School / team',
    'form.schoolPlaceholder': 'e.g. Alliance, Gracie Barra…',
    'form.belt': 'Belt',
    'form.stripe': 'Stripe number',
    'form.competitionName': 'Competition',
    'form.competitionPlaceholder': 'e.g. IBJJF Worlds, local open…',
    'form.result': 'Result',
    'form.wins': 'Wins',
    'form.notes': 'Notes',
    'form.notesPlaceholder': 'Anything worth remembering…',
    'form.photo': 'Photo',
    'form.removePhoto': 'Remove photo',
    'form.save': 'Add to timeline',
    'form.update': 'Save changes',
    'form.cancel': 'Cancel',
    'form.edit': 'Edit',
    'form.delete': 'Delete',
    'form.confirmDelete': 'Delete this event?',
    'type.start': 'Started training',
    'type.school': 'Changed school',
    'type.stripe': 'New stripe',
    'type.belt': 'New belt',
    'type.competition': 'Competition',
    'type.injury': 'Injury / time off',
    'type.seminar': 'Seminar',
    'type.milestone': 'Milestone',
    'form.instructor': 'Instructor',
    'form.instructorPlaceholder': 'e.g. Rickson Gracie…',
    'form.milestoneTitle': 'What was it?',
    'form.milestonePlaceholder': 'e.g. first submission, 100th class…',
    'tl.seminar': 'Seminar with {name}',
    'belt.white': 'White',
    'belt.grey-white': 'Grey-white',
    'belt.grey': 'Grey',
    'belt.grey-black': 'Grey-black',
    'belt.yellow-white': 'Yellow-white',
    'belt.yellow': 'Yellow',
    'belt.yellow-black': 'Yellow-black',
    'belt.orange-white': 'Orange-white',
    'belt.orange': 'Orange',
    'belt.orange-black': 'Orange-black',
    'belt.green-white': 'Green-white',
    'belt.green': 'Green',
    'belt.green-black': 'Green-black',
    'belt.blue': 'Blue',
    'belt.purple': 'Purple',
    'belt.brown': 'Brown',
    'belt.black': 'Black',
    'belt.coral': 'Coral',
    'belt.red-white': 'Red-white',
    'belt.red': 'Red',
    'belt.groupAdult': 'Adult',
    'belt.groupKids': 'Kids',
    'result.gold': 'Gold',
    'result.silver': 'Silver',
    'result.bronze': 'Bronze',
    'result.participated': 'Competed',
    'tl.title': 'My Brazilian Jiu Jitsu Journey',
    'tl.start': 'Started training at {school}',
    'tl.startNoSchool': 'Started training jiu-jitsu',
    'tl.school': 'Joined {school}',
    'tl.stripe': '{n} stripe on the {belt} belt',
    'tl.degree': '{n} degree on the {belt} belt',
    'tl.belt': 'Promoted to {belt} belt',
    'tl.wins': '{n} wins',
    'tl.win': '1 win',
    'tl.empty': 'Your timeline will show up here.\nAdd events on the left to begin.',
    'stats.competitions': '{n} competitions',
    'stats.competition': '1 competition',
    'tl.trainingFor': '{years} on the mats',
    'tl.year': '1 year',
    'tl.years': '{n} years',
    'tl.month': '1 month',
    'tl.months': '{n} months',
    'export.button': 'Export image',
    'export.sharing': 'Rendering…',
    'export.footer': 'made with BJJ Journey',
    'backup.title': 'Backup',
    'backup.download': 'Download backup',
    'backup.restore': 'Restore backup',
    'backup.invalid': 'Invalid backup file.',
    'footer.by': 'made by',
    'footer.source': 'source code',
    'share.button': 'Share link',
    'share.copied': 'Link copied!',
    'shared.banner': "You're viewing a shared timeline.",
    'shared.import': 'Save to my device',
    'shared.close': 'Close',
    'shared.create': 'Create my own journey',
    'shared.confirmReplace':
      'This will replace your current timeline. Continue?',
    'ordinal.1': '1st',
    'ordinal.2': '2nd',
    'ordinal.3': '3rd',
    'ordinal.4': '4th',
    'ordinal.5': '5th',
    'ordinal.6': '6th',
  },
  'pt-BR': {
    'app.title': 'BJJ Journey',
    'app.tagline': 'Sua história no jiu-jitsu, um rola de cada vez',
    'panel.yourName': 'Seu nome',
    'panel.yourNamePlaceholder': 'ex. Carlos Gracie',
    'panel.addEvent': 'Adicionar evento',
    'panel.events': 'Seus eventos',
    'panel.noEvents': 'Nenhum evento ainda. Adicione o primeiro acima — oss!',
    'form.type': 'O que aconteceu?',
    'form.date': 'Quando?',
    'form.school': 'Academia / equipe',
    'form.schoolPlaceholder': 'ex. Alliance, Gracie Barra…',
    'form.belt': 'Faixa',
    'form.stripe': 'Número do grau',
    'form.competitionName': 'Campeonato',
    'form.competitionPlaceholder': 'ex. Mundial IBJJF, open local…',
    'form.result': 'Resultado',
    'form.wins': 'Vitórias',
    'form.notes': 'Observações',
    'form.notesPlaceholder': 'Algo que vale lembrar…',
    'form.photo': 'Foto',
    'form.removePhoto': 'Remover foto',
    'form.save': 'Adicionar à linha do tempo',
    'form.update': 'Salvar alterações',
    'form.cancel': 'Cancelar',
    'form.edit': 'Editar',
    'form.delete': 'Excluir',
    'form.confirmDelete': 'Excluir este evento?',
    'type.start': 'Comecei a treinar',
    'type.school': 'Troquei de academia',
    'type.stripe': 'Novo grau',
    'type.belt': 'Nova faixa',
    'type.competition': 'Campeonato',
    'type.injury': 'Lesão / pausa',
    'type.seminar': 'Seminário',
    'type.milestone': 'Marco',
    'form.instructor': 'Professor',
    'form.instructorPlaceholder': 'ex. Rickson Gracie…',
    'form.milestoneTitle': 'O que foi?',
    'form.milestonePlaceholder': 'ex. primeira finalização, aula nº 100…',
    'tl.seminar': 'Seminário com {name}',
    'belt.white': 'Branca',
    'belt.grey-white': 'Cinza-branca',
    'belt.grey': 'Cinza',
    'belt.grey-black': 'Cinza-preta',
    'belt.yellow-white': 'Amarela-branca',
    'belt.yellow': 'Amarela',
    'belt.yellow-black': 'Amarela-preta',
    'belt.orange-white': 'Laranja-branca',
    'belt.orange': 'Laranja',
    'belt.orange-black': 'Laranja-preta',
    'belt.green-white': 'Verde-branca',
    'belt.green': 'Verde',
    'belt.green-black': 'Verde-preta',
    'belt.blue': 'Azul',
    'belt.purple': 'Roxa',
    'belt.brown': 'Marrom',
    'belt.black': 'Preta',
    'belt.coral': 'Coral',
    'belt.red-white': 'Vermelha-branca',
    'belt.red': 'Vermelha',
    'belt.groupAdult': 'Adulto',
    'belt.groupKids': 'Infantil',
    'result.gold': 'Ouro',
    'result.silver': 'Prata',
    'result.bronze': 'Bronze',
    'result.participated': 'Competiu',
    'tl.title': 'Minha Jornada no Jiu-Jitsu',
    'tl.start': 'Comecei a treinar na {school}',
    'tl.startNoSchool': 'Comecei a treinar jiu-jitsu',
    'tl.school': 'Entrei na {school}',
    'tl.stripe': '{n} grau na faixa {belt}',
    'tl.degree': '{n} grau na faixa {belt}',
    'tl.belt': 'Graduação: faixa {belt}',
    'tl.wins': '{n} vitórias',
    'tl.win': '1 vitória',
    'tl.empty':
      'Sua linha do tempo vai aparecer aqui.\nAdicione eventos à esquerda para começar.',
    'stats.competitions': '{n} campeonatos',
    'stats.competition': '1 campeonato',
    'tl.trainingFor': '{years} de tatame',
    'tl.year': '1 ano',
    'tl.years': '{n} anos',
    'tl.month': '1 mês',
    'tl.months': '{n} meses',
    'export.button': 'Exportar imagem',
    'export.sharing': 'Gerando…',
    'export.footer': 'feito com BJJ Journey',
    'backup.title': 'Backup',
    'backup.download': 'Baixar backup',
    'backup.restore': 'Restaurar backup',
    'backup.invalid': 'Arquivo de backup inválido.',
    'footer.by': 'feito por',
    'footer.source': 'código fonte',
    'share.button': 'Copiar link',
    'share.copied': 'Link copiado!',
    'shared.banner': 'Você está vendo uma linha do tempo compartilhada.',
    'shared.import': 'Salvar no meu dispositivo',
    'shared.close': 'Fechar',
    'shared.create': 'Criar minha própria jornada',
    'shared.confirmReplace':
      'Isso vai substituir sua linha do tempo atual. Continuar?',
    'ordinal.1': '1º',
    'ordinal.2': '2º',
    'ordinal.3': '3º',
    'ordinal.4': '4º',
    'ordinal.5': '5º',
    'ordinal.6': '6º',
  },
} as const

export type TKey = keyof (typeof dict)['en-US']

interface I18nContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TKey, vars?: Record<string, string | number>) => string
  formatDate: (iso: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

const LANG_KEY = 'bjjourney:lang'

function detectLang(): Lang {
  const saved = localStorage.getItem(LANG_KEY)
  if (saved === 'en-US' || saved === 'pt-BR') return saved
  return 'pt-BR'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)

  const setLang = (l: Lang) => {
    localStorage.setItem(LANG_KEY, l)
    setLangState(l)
  }

  const t = (key: TKey, vars?: Record<string, string | number>) => {
    let text: string = dict[lang][key] ?? dict['en-US'][key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replaceAll(`{${k}}`, String(v))
      }
    }
    return text
  }

  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number)
    return new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(
      new Date(y, m - 1, d),
    )
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t, formatDate }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
