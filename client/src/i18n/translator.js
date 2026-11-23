import translations from './translations.json'

const languageIndexes = {
    th: 0,
    zh: 1,
    ja: 2,
}

const translatableAttributes = [
    'placeholder',
    'title',
    'aria-label',
    'alt',
]

const blockedSelector = [
    'script',
    'style',
    'noscript',
    'textarea',
    'input',
    'svg',
    'canvas',
    'code',
    'pre',
    '[data-no-translate="true"]',
    '[data-translate="no"]',
    '[contenteditable="true"]',
    '.notranslate',
].join(', ')

const textRecords = new WeakMap()
const attributeRecords = new WeakMap()

const normalizeText = (value) => value.replace(/\s+/g, ' ').trim()

export const translateText = (value, language = 'en') => {
    if (language === 'en' || !value) return value

    const normalized = normalizeText(value)
    const translation = translations[normalized]
    const languageIndex = languageIndexes[language]

    if (!translation || languageIndex === undefined) return value

    return Array.isArray(translation)
        ? translation[languageIndex] || value
        : value
}

const isBlockedElement = (element) => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return true

    return Boolean(element.closest(blockedSelector))
}

const translateTextNode = (node, language) => {
    if (!node || node.nodeType !== Node.TEXT_NODE) return

    const parent = node.parentElement

    if (!parent || isBlockedElement(parent)) return

    const currentText = node.nodeValue || ''
    const previousRecord = textRecords.get(node)

    let originalText = currentText

    if (
        previousRecord &&
        (
            currentText === previousRecord.original ||
            currentText === previousRecord.translated
        )
    ) {
        originalText = previousRecord.original
    }

    const translatedText = translateText(originalText, language)

    textRecords.set(node, {
        original: originalText,
        translated: translatedText,
    })

    if (currentText !== translatedText) {
        node.nodeValue = translatedText
    }
}

const translateAttribute = (element, attribute, language) => {
    if (!element || isBlockedElement(element)) return

    const currentValue = element.getAttribute(attribute)

    if (!currentValue) return

    let records = attributeRecords.get(element)

    if (!records) {
        records = {}
        attributeRecords.set(element, records)
    }

    const previousRecord = records[attribute]

    let originalValue = currentValue

    if (
        previousRecord &&
        (
            currentValue === previousRecord.original ||
            currentValue === previousRecord.translated
        )
    ) {
        originalValue = previousRecord.original
    }

    const translatedValue = translateText(originalValue, language)

    records[attribute] = {
        original: originalValue,
        translated: translatedValue,
    }

    if (currentValue !== translatedValue) {
        element.setAttribute(attribute, translatedValue)
    }
}

const translateElement = (element, language) => {
    if (isBlockedElement(element)) return

    translatableAttributes.forEach((attribute) => {
        translateAttribute(element, attribute, language)
    })
}

const translateSubtree = (root, language) => {
    if (!root) return

    if (root.nodeType === Node.TEXT_NODE) {
        translateTextNode(root, language)
        return
    }

    if (
        root.nodeType !== Node.ELEMENT_NODE &&
        root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE &&
        root.nodeType !== Node.DOCUMENT_NODE
    ) {
        return
    }

    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
    )

    let currentNode = walker.currentNode

    if (currentNode.nodeType === Node.ELEMENT_NODE) {
        translateElement(currentNode, language)
    } else if (currentNode.nodeType === Node.TEXT_NODE) {
        translateTextNode(currentNode, language)
    }

    while (walker.nextNode()) {
        currentNode = walker.currentNode

        if (currentNode.nodeType === Node.ELEMENT_NODE) {
            translateElement(currentNode, language)
        } else if (currentNode.nodeType === Node.TEXT_NODE) {
            translateTextNode(currentNode, language)
        }
    }
}

export const translateDocument = (language = 'en') => {
    if (typeof document === 'undefined' || !document.body) return

    translateSubtree(document.body, language)
}

export const startTranslationObserver = (language = 'en') => {
    if (typeof document === 'undefined' || !document.body) {
        return () => {}
    }

    translateDocument(language)

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    translateSubtree(node, language)
                })

                return
            }

            if (mutation.type === 'characterData') {
                translateTextNode(mutation.target, language)
                return
            }

            if (mutation.type === 'attributes') {
                translateAttribute(
                    mutation.target,
                    mutation.attributeName,
                    language
                )
            }
        })
    })

    observer.observe(document.body, {
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: translatableAttributes,
        subtree: true,
    })

    return () => observer.disconnect()
}