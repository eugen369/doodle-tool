import { Injectable, computed, effect, signal } from '@angular/core'
import { Lang, TranslationKey, de, en } from './translations'

const STORAGE_KEY = 'lang'

const DICTIONARIES: Record<Lang, Record<TranslationKey, string>> = { de, en }

@Injectable({ providedIn: 'root' })
export class I18nService {
    readonly lang = signal<Lang>(this.initialLang())

    /** BCP-47-Locale für Datums- und Zahlenformate */
    readonly locale = computed(() => (this.lang() === 'de' ? 'de-DE' : 'en-GB'))

    constructor() {
        effect(() => {
            document.documentElement.lang = this.lang()
        })
    }

    t(key: TranslationKey): string {
        return DICTIONARIES[this.lang()][key]
    }

    toggle(): void {
        const next: Lang = this.lang() === 'de' ? 'en' : 'de'
        this.lang.set(next)
        localStorage.setItem(STORAGE_KEY, next)
    }

    private initialLang(): Lang {
        const saved = localStorage.getItem(STORAGE_KEY)
        return saved === 'en' || saved === 'de' ? saved : 'de'
    }
}
