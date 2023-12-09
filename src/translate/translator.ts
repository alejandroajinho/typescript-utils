/**
 * ! For the creation of this file we have relied on the GearBot2 translator,
 * ! you can visit the project by clicking on the following URL
 * ! ( https://github.com/gearbot/GearBot-2 )
 */

import { FluentBundle, FluentResource, FluentVariable } from "@fluent/bundle"
import { readdir, readFile, stat } from "fs/promises"
import print from "../logger";

export const TRANSLATION_FAILED = "An error has ocurred while trying to translate the message" // Message to return when translation fails
export const LANGUAGES = [ // All languages as an array
  "zh_CHS", "ar_SA", "bg_BG", "ca_ES", "zh_TW", "cs_CZ", "da_DK", "de_DE", "el_GR", "en_US",
  "es_ES", "fi_FI", "fr_FR", "he_IL", "hu_HU", "is_IS", "it_IT", "ja_JP", "ko_KR", "nl_NL",
  "nb_NO", "pl_PL", "pt_BR", "rm_CH", "ro_RO", "ru_RU", "hr_HR", "sk_SK", "sq_AL", "sv_SE",
  "th_TH", "tr_TR", "ur_PK", "id_ID", "uk_UA", "be_BY", "sl_SI", "et_EE", "lv_LV", "lt_LT",
  "tg_TJ", "fa_IR", "vi_VN", "hy_AM", "eu_ES", "wen_DE", "mk_MK", "st_ZA", "ts_ZA", "tn_ZA",
  "ven_ZA", "xh_ZA", "zu_ZA", "af_ZA", "ka_GE", "fo_FO", "hi_IN", "mt_MT", "se_NO", "gd_GB",
  "yi", "ms_MY", "kk_KZ", "ky_KG", "sw_KE", "tk_TM", "tt_RU", "bn_IN", "pa_IN", "gu_IN", "or_IN",
  "ta_IN", "te_IN", "kn_IN", "ml_IN", "as_IN", "mr_IN", "sa_IN", "mn_MN", "bo_CN", "cy_GB", "kh_KH",
  "lo_LA", "my_MM", "gl_ES", "kok_IN", "sd_IN", "syr_SY", "si_LK", "chr_US", "am_ET", "tmz", "ne_NP",
  "fy_NL", "ps_AF", "fil_PH", "div_MV", "bin_NG", "fuv_NG", "ha_NG", "ibb_NG", "yo_NG", "quz_BO",
  "ns_ZA", "ba_RU", "lb_LU", "kl_GL", "ii_CN", "arn_CL", "moh_CA", "br_FR", "ug_CN", "mi_NZ",
  "oc_FR", "co_FR", "gsw_FR", "sah_RU", "qut_GT", "rw_RW", "wo_SN", "gbz_AF", "ar_IQ", "zh_CN",
  "de_CH", "en_GB", "es_MX", "fr_BE", "it_CH", "nl_BE", "nn_NO", "pt_PT", "ro_MD", "ru_MD", "sv_FI",
  "ur_IN", "az_AZ", "dsb_DE", "se_SE", "ga_IE", "ms_BN", "uz_UZ", "mn_CN", "bo_BT", "iu_CA",
  "tmz_DZ", "ne_IN", "quz_EC", "ti_ET", "ar_EG", "zh_HK", "de_AT", "en_AU", "fr_CA", "sr_SP", "se_FI",
  "quz_PE", "ar_LY", "zh_SG", "de_LU", "en_CA", "es_GT", "fr_CH", "hr_BA", "smj_NO", "ar_DZ", "zh_MO",
  "de_LI", "en_NZ", "es_CR", "fr_LU", "smj_SE", "ar_MA", "en_IE", "es_PA", "fr_MC", "sma_NO", "ar_TN",
  "en_ZA", "es_DO", "fr_029", "sr_BA", "sma_SE", "ar_OM", "en_JA", "es_VE", "fr_RE", "bs_BA", "sms_FI",
  "ar_YE", "en_CB", "es_CO", "fr_CG", "smn_FI", "ar_SY", "en_BZ", "es_PE", "fr_SN", "ar_JO", "en_TT",
  "es_AR", "fr_CM", "ar_LB", "en_ZW", "es_EC", "fr_CI", "ar_KW", "en_PH", "es_CL", "fr_ML", "ar_AE",
  "en_ID", "es_UR", "fr_MA", "ar_BH", "en_HK", "es_PY", "fr_HT", "ar_QA", "en_IN", "es_BO", "en_MY",
  "es_SV", "en_SG", "es_HN", "es_NI", "es_PR", "es_US", "zh_CHT"
] as const
export type LANGUAGE = typeof LANGUAGES[number] // All languages as a type
const appPath = process.cwd() // Actual app path

export class TranslatorError extends Error {
  static defaultCode = "TranslatorError"
  static defaultName = "TranslatorError"
  code: string

  constructor(message: string, options?: {
    cause?: string,
    code?: string,
    name?: string
  }) {
    super(message, options)
    this.code = options?.code || TranslatorError.defaultCode
    this.name = options?.name || TranslatorError.defaultName
  }
}

export class Translator<TranslationKey extends string> {
  translations: Map<LANGUAGE, FluentBundle>
  defaultLanguage: LANGUAGE

  constructor(defaultLanguage: LANGUAGE) {
    this.translations = new Map()
    this.defaultLanguage = defaultLanguage
  }

  // Initializes the translator loading languages from files
  init(translationsDirectory: string) {
    return new Promise(async (resolve, reject) => {
      let directories = await readdir(translationsDirectory).catch(() => {
        reject(new TranslatorError(`An error has ocurred while accessing to ${translationsDirectory}`, { code: "INVALID_TRANSLATIONS_DIRECTORY" }))
      })
      if (!directories) return

      for (const directory of directories) {
        let directory_data = await stat(`${appPath}/${translationsDirectory}/${directory}`).catch(error => print.warn(`Could not read data from file ${directory}`))
        if (!directory_data) continue

        if (!LANGUAGES.includes(directory as LANGUAGE)) {
          print.warn(`Omiting ${directory} as it is not a valid language identifier`)
          continue
        }

        print.debug(`Loading tanslations for ${directory}`)

        let bundle = new FluentBundle(directory)
        let translationFiles = await readdir(`${appPath}/${translationsDirectory}/${directory}`).catch(() => {
          reject(new TranslatorError(`Could not read files from ${directory}`, { code: "INVALID_LANGAUGE_DIRECTORY" }))
        })
        if (!translationFiles) return


        for (const file of translationFiles) {
          let fileData = await readFile(`${appPath}/${translationsDirectory}/${directory}/${file}`).catch(() => print.warn(`Could not read file ${file}`))
          if (!fileData) continue

          let resource = new FluentResource(fileData.toString())
          let errors = bundle.addResource(resource)

          if (errors.length) return reject(new TranslatorError(`Could not build bundle for ${file}`, { code: "RESOURCE_ERROR" }))
        }
        this.translations.set(directory as LANGUAGE, bundle)
      }

      print.info(`Successfully loaded ${this.translations.size} language(s)`)
    })
  }

  // Gets the message to translate
  getMessage(message: TranslationKey, language: LANGUAGE, args?: Record<string, FluentVariable>): string {
    let translations = this.translations.get(language)
    if (!translations) {
      print.warn(`Could not find translations for ${language}, falling back to ${this.defaultLanguage}`)
      translations = this.translations.get(this.defaultLanguage)
      if (!translations) {
        return TRANSLATION_FAILED
      }
    }

    let translation = translations.getMessage(message)
    if (translation && translation.value) {
      return translations.formatPattern(translation.value, args)
    } else {
      return TRANSLATION_FAILED
    }
  }
}