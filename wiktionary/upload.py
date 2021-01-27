import csv, re, pywikibot, stanza
from wdp import Word, export_words, format_entries
from wdp.upload import upload_formatted_entries

site = pywikibot.Site(code='en', fam='wiktionary')
site.login()

lang_code = 'inc-kho' # custom code, created by me as a Wiktionary admin since ISO doesn't have it
lang_name = 'Kholosi'

nlp = stanza.Pipeline(lang='en', processors='tokenize,mwt,pos,lemma')

words = []
codes = {
    'Prs.': 'fa',
    'Skt.': 'sa',
    'Eng.': 'en',
    'Ar.': 'ar',
    'Arabic': 'ar',
    'Larestani': 'lrl',
    'Larestan': 'lrl',
    'Balochi': 'bal',
    'Gulf Arabic': 'afb',
    'Trk.': 'tr',
}

with open("lexicon.csv") as fin:
    reader = csv.reader(fin)
    header = None
    for i, row in enumerate(reader):
        # make a nice readable header: entry dict
        if i == 0:
            header = row
            continue
        data = dict(zip(header, row))

        # time to start parsing our entry data! this is a page name
        word = Word(data["Transcription"])
        
        # ETYMOLOGY
        # parsing my convention of recording etymology
        # this is kind of messy given my lack of foresight in formatting this in the original data!
        #
        # Wiktionary prefers original script to be linked to in an etymology, but I only have
        # transcriptions in my data. Thankfully, there is a way to convert Sanskrit translit
        # to Devanagari script (the little "subst:chars" bit below) on-wiki so I use that when I can.

        etyms = re.findall(r"(Prs.|Skt.|Eng.|Ar.|Arabic|Larestani?|Balochi|Gulf Arabic|Trk.) (.*?)( \(| or|,|\?| \+| \"| '|$)", data["Etymology"])
        etymology = data["Etymology"]
        for match in etyms:
            # replace "Skt. word" => "{{inh"
            lang, term = match[0], match[1]
            term = term.replace('r̥', 'ṛ')
            parsed = [
                "{{" + f"{('inh' if lang == 'Skt.' else 'bor')}",
                "inc-kho",
                codes[lang],
                f"{{{{subst:chars|sa|{term.replace('́', '')}}}}}" if lang == 'Skt.' else "",
                f"tr={term}}}}}"
            ]
            etymology = etymology.replace(f"{lang} {term}", '|'.join(parsed))
            
        if etymology: etymology = 'From ' + etymology + '.'
        word.set_etymology(etymology)

        # PRONUNCIATION
        word.add_pronunciation('/' + data["Phonetic IPA"] + '/', 'ipa') # this is actually phonemic but whatever
        for match in re.findall(r"(\[.*?\])", data["IPA 2"]): # THIS IS PHONETIC!
            word.add_pronunciation(match, 'ipa')
        
        # DEFINITIONS
        #
        # The main issue here is linking the definition properly.
        # On Wiktionary, it is standard practice (but not required!) to link
        # to the English words in the definitions for a non-English language.
        # I automate this using a lemmatiser for English (Stanford stanza's model)
        # which requires some string manipulation.
        for x in data["Meaning"].split(";"):
            for definition in x.split(","):
                definition = definition.strip()
                w = nlp(definition).sentences[0].words # ah yes computational linguistics (just lemmatising for making links)
                offset = 0
                for x in w:
                    if x.text in '()': continue
                    print(w)
                    start, end = x.misc.split('|')
                    start = int(start.split('=')[1])
                    end = int(end.split('=')[1])
                    replace = f'[[{x.lemma}|{x.text}]]' if x.lemma != x.text else f'[[{x.text}]]'
                    definition = definition[:start + offset] + replace + definition[end + offset:]
                    offset += len(replace) - len(x.text)
                word.add_definition(definition, data["Part of Speech"])

        # REFERENCES
        #
        # I have an etymological reference to the Comparative Dictionary of
        # the Indo-Aryan Languages for Sanskrit-derived terms in my data.
        # I parse those out and add a reference to it using Wiktionary's
        # on-wiki template for CDIAL.
        refs = ['* {{R:inc-kho:Arora}}']
        if 'CDIAL' in data["Etymology"]:
            for number in re.findall(r"\(CDIAL (.*?)\)", data["Etymology"]):
                refs.append(f"* {{{{R:CDIAL|2={number}}}}}")
        word.set_references('\n'.join(refs))
        words.append(word)

print(len(words))
export_words(words, 'kholosi.zip')
upload_formatted_entries(format_entries(words, lang_code, lang_name), lang_name, page_prefix='User:AryamanA/Kholosi/')