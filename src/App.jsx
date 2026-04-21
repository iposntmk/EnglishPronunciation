import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, Volume2, Search, ChevronLeft, RotateCcw, BookOpen, Library, ExternalLink, Play, Square } from 'lucide-react'
import { SOUNDS, VOWEL_GROUPS, CONSONANT_GROUPS } from './data.js'
import { scoreWord } from './scorer.js'

// ─── RACHEL'S ENGLISH LINKS ────────────────────────────────────────────────

const RACHEL_URLS = {
  'iː': 'https://rachelsenglish.com/english-pronounce-ee-vowel/',
  'ɪ':  'https://rachelsenglish.com/english-pronounce-ih-vowel/',
  'ɛ':  'https://rachelsenglish.com/english-pronounce-eh-vowel/',
  'æ':  'https://rachelsenglish.com/english-pronounce-aa-ae-vowel/',
  'ʌ':  'https://rachelsenglish.com/english-pronounce-uh-butter-vowel/',
  'ə':  'https://rachelsenglish.com/english-pronounce-schwa/',
  'ɜː': 'https://rachelsenglish.com/english-pronounce-ur-vowel/',
  'uː': 'https://rachelsenglish.com/english-pronounce-oo-vowel/',
  'ʊ':  'https://rachelsenglish.com/english-pronounce-uh-push-vowel/',
  'ɔː': 'https://rachelsenglish.com/english-pronounce-aw-vowel/',
  'ɑː': 'https://rachelsenglish.com/english-pronounce-ah-vowel/',
  'oʊ': 'https://rachelsenglish.com/english-pronounce-oh-diphthong/',
  'eɪ': 'https://rachelsenglish.com/english-pronounce-ay-diphthong/',
  'aɪ': 'https://rachelsenglish.com/english-pronounce-ai-diphthong/',
  'ɔɪ': 'https://rachelsenglish.com/english-pronounce-oy-diphthong/',
  'aʊ': 'https://rachelsenglish.com/english-pronounce-ow-diphthong/',
  'ɑːr':'https://rachelsenglish.com/pronounce-ar-orn-etc/',
  'ɔːr':'https://rachelsenglish.com/pronounce-word-2/',
  'ɛər':'https://rachelsenglish.com/how-to-pronounce-air/',
  'ɪər':'https://rachelsenglish.com/vowels-ipa-pronunciation-international-phonetic-alphabet/',
  'p':  'https://rachelsenglish.com/english-pronounce-b-p-consonants/',
  'b':  'https://rachelsenglish.com/english-pronounce-b-p-consonants/',
  't':  'https://rachelsenglish.com/english-pronounce-t-d-consonants/',
  'd':  'https://rachelsenglish.com/english-pronounce-t-d-consonants/',
  'k':  'https://rachelsenglish.com/english-pronounce-g-k-consonants/',
  'g':  'https://rachelsenglish.com/english-pronounce-g-k-consonants/',
  'm':  'https://rachelsenglish.com/english-pronounce-m-consonant/',
  'n':  'https://rachelsenglish.com/english-pronounce-n-consonant/',
  'ŋ':  'https://rachelsenglish.com/pronounce-n-n-vs-ng-n/',
  'f':  'https://rachelsenglish.com/english-pronounce-f-v-consonants/',
  'v':  'https://rachelsenglish.com/english-pronounce-f-v-consonants/',
  'θ':  'https://rachelsenglish.com/english-pronounce-th-consonants/',
  'ð':  'https://rachelsenglish.com/english-pronounce-th-consonants/',
  's':  'https://rachelsenglish.com/english-pronounce-s-z-consonants/',
  'z':  'https://rachelsenglish.com/english-pronounce-s-z-consonants/',
  'ʃ':  'https://rachelsenglish.com/english-pronounce-sh-zh-consonants/',
  'ʒ':  'https://rachelsenglish.com/english-pronounce-sh-zh-consonants/',
  'h':  'https://rachelsenglish.com/english-pronounce-h-consonant/',
  'r':  'https://rachelsenglish.com/5-tips-for-r-in-american-english/',
  'j':  'https://rachelsenglish.com/english-pronounce-y-consonant/',
  'w':  'https://rachelsenglish.com/pronounce-w-consonant/',
  'l':  'https://rachelsenglish.com/english-pronounce-l-consonant/',
  'tʃ': 'https://rachelsenglish.com/english-pronounce-ch-jj-sounds/',
  'dʒ': 'https://rachelsenglish.com/english-pronounce-ch-jj-sounds/',
  'ɾ':  'https://rachelsenglish.com/t-pronunciations/',
}

// YouTube search URL for Rachel's English for a given IPA label
function rachelYouTubeSearch(label) {
  return `https://www.youtube.com/results?search_query=rachel%27s+english+${encodeURIComponent(label)}+sound`
}

// ─── PHONEME ENGINE ────────────────────────────────────────────────────────

const PHONEME_INFO = {
  'θ':  { tip: 'Đặt đầu lưỡi giữa hai hàm răng, thổi khí không rung họng', hard: true },
  'ð':  { tip: 'Lưỡi giữa răng nhưng rung họng (voiced)', hard: true },
  'r':  { tip: 'Cuộn lưỡi ra sau không chạm gì, môi hơi tròn', hard: true },
  'l':  { tip: 'Đầu lưỡi chạm sau răng cửa trên', hard: false },
  'æ':  { tip: 'Mở miệng rộng, kéo về phía trước — "cat, bad"', hard: true },
  'ɪ':  { tip: 'Âm /i/ ngắn — lưỡi cao, miệng thư giãn hơn /iː/', hard: false },
  'iː': { tip: 'Âm /i/ dài, kéo hai góc môi sang ngang', hard: false },
  'ʌ':  { tip: 'Giống "ă" Việt, miệng mở vừa, lưỡi giữa-thấp', hard: true },
  'ɜː': { tip: 'Môi tròn nhẹ, lưỡi giữa, cuộn ra sau — "bird, word"', hard: true },
  'ɑː': { tip: 'Âm "a" dài, mở miệng rộng', hard: false },
  'ɔː': { tip: 'Môi tròn, miệng mở vừa — "saw, call"', hard: false },
  'ʊ':  { tip: 'Âm /u/ ngắn, môi tròn nhẹ — "book, good"', hard: true },
  'uː': { tip: 'Âm /u/ dài, môi tròn căng — "food, moon"', hard: false },
  'ə':  { tip: 'Schwa — âm trung hòa, miệng hoàn toàn thư giãn', hard: false },
  'ər': { tip: 'Schwa + cuộn lưỡi nhẹ (giọng Mỹ)', hard: false },
  'eɪ': { tip: 'Diphthong: "e" trượt lên "i" — "day, make"', hard: false },
  'aɪ': { tip: 'Diphthong: "a" rộng trượt lên "i" — "night, like"', hard: false },
  'aʊ': { tip: 'Diphthong: "a" trượt lên "u" — "now, out"', hard: false },
  'oʊ': { tip: 'Diphthong: "o" trượt lên "u" — "go, road"', hard: false },
  'ɔɪ': { tip: 'Diphthong: "oi" trong "boy, voice"', hard: false },
  'ɛər':{ tip: 'Diphthong: /ɛ/ + /ər/ — "there, where"', hard: false },
  'ɪər':{ tip: 'Diphthong: /ɪ/ + /ər/ — "here, ear"', hard: false },
  'ɑːr':{ tip: 'Âm "a" dài + cuộn lưỡi — "car, large"', hard: false },
  'ɔːr':{ tip: 'Âm "ô" tròn + cuộn lưỡi — "more, door"', hard: false },
  'ɾ':  { tip: 'Flap — /t/ hoặc /d/ giữa nguyên âm trong giọng Mỹ, như "d" nhanh', hard: true },
  'v':  { tip: 'Răng cửa trên đặt lên môi dưới, rung họng', hard: true },
  'w':  { tip: 'Chu môi tròn như "oa", không dùng răng', hard: true },
  'f':  { tip: 'Răng trên + môi dưới, thổi khí không rung', hard: false },
  'ŋ':  { tip: 'Lưỡi chạm vòm mềm phía sau, âm mũi', hard: false },
  'ŋk': { tip: 'Lưỡi chạm vòm mềm + bật k nhẹ cuối', hard: false },
  'ŋg': { tip: 'Lưỡi chạm vòm mềm + g rung', hard: false },
  'ʃ':  { tip: 'Chu môi nhẹ, thổi khí — "sh" trong "ship"', hard: false },
  'tʃ': { tip: 'Kết hợp t + ʃ — "ch" trong "church"', hard: false },
  'dʒ': { tip: 'Kết hợp d + ʒ — "j" trong "judge"', hard: false },
  'ʒ':  { tip: 'Giống "sh" nhưng rung họng — "s" trong "measure"', hard: true },
  'n':  { tip: 'Lưỡi chạm sau răng trên, âm mũi', hard: false },
  'm':  { tip: 'Khép môi, rung mũi', hard: false },
  'p':  { tip: 'Bật môi, thổi khí (aspirated)', hard: false },
  'b':  { tip: 'Bật môi, rung họng', hard: false },
  't':  { tip: 'Lưỡi chạm sau răng trên, bật ra', hard: false },
  'd':  { tip: 'Lưỡi chạm sau răng, rung họng', hard: false },
  'k':  { tip: 'Lưỡi chạm vòm mềm, bật ra', hard: false },
  'g':  { tip: 'Lưỡi chạm vòm mềm, rung họng', hard: false },
  's':  { tip: 'Đầu lưỡi gần răng trên, thổi khí', hard: false },
  'z':  { tip: 'Giống /s/ nhưng rung họng', hard: false },
  'h':  { tip: 'Thổi khí từ họng nhẹ nhàng', hard: false },
  'j':  { tip: 'Âm "y" đầu — lưỡi cao, miệng hé', hard: false },
}

const WORD_IPA_RAW = {
  about:[['a','ə'],['b','b'],['ou','aʊ'],['t','t']],
  after:[['a','æ'],['f','f'],['ter','tər']],
  again:[['a','ə'],['g','g'],['ai','eɪ'],['n','n']],
  all:[['all','ɔːl']],
  also:[['al','ɔːl'],['so','soʊ']],
  always:[['al','ɔːl'],['ways','weɪz']],
  another:[['an','ə'],['oth','ʌð'],['er','ər']],
  answer:[['an','æn'],['swer','sər']],
  ask:[['a','æ'],['sk','sk']],
  back:[['b','b'],['a','æ'],['ck','k']],
  bad:[['b','b'],['a','æ'],['d','d']],
  bath:[['b','b'],['a','æ'],['th','θ']],
  beautiful:[['beau','bjuː'],['ti','tɪ'],['ful','fəl']],
  because:[['be','bɪ'],['cause','kɔːz']],
  bed:[['b','b'],['e','ɛ'],['d','d']],
  bird:[['b','b'],['ir','ɜː'],['d','d']],
  book:[['b','b'],['oo','ʊ'],['k','k']],
  both:[['b','b'],['o','oʊ'],['th','θ']],
  brother:[['br','br'],['o','ʌ'],['th','ð'],['er','ər']],
  but:[['b','b'],['u','ʌ'],['t','t']],
  call:[['c','k'],['all','ɔːl']],
  can:[['c','k'],['a','æ'],['n','n']],
  cat:[['c','k'],['a','æ'],['t','t']],
  careful:[['care','kɛər'],['ful','fəl']],
  chair:[['ch','tʃ'],['air','ɛər']],
  child:[['ch','tʃ'],['i','aɪ'],['ld','ld']],
  city:[['ci','sɪ'],['ty','ɾi']],
  cold:[['c','k'],['o','oʊ'],['ld','ld']],
  come:[['c','k'],['ome','ʌm']],
  computer:[['com','kəm'],['pu','pjuː'],['ter','tər']],
  cup:[['c','k'],['u','ʌ'],['p','p']],
  day:[['d','d'],['ay','eɪ']],
  different:[['dif','dɪf'],['fer','fər'],['ent','ənt']],
  do:[['d','d'],['o','uː']],
  dog:[['d','d'],['o','ɑː'],['g','g']],
  each:[['ea','iː'],['ch','tʃ']],
  earth:[['ear','ɜː'],['th','θ']],
  eat:[['ea','iː'],['t','t']],
  enjoy:[['en','ɪn'],['joy','dʒɔɪ']],
  enough:[['e','ɪ'],['nough','nʌf']],
  every:[['ev','ɛv'],['er','ər'],['y','i']],
  face:[['f','f'],['a','eɪ'],['ce','s']],
  family:[['fam','fæm'],['i','ɪ'],['ly','li']],
  father:[['fa','fɑː'],['th','ð'],['er','ər']],
  feel:[['f','f'],['ee','iː'],['l','l']],
  find:[['f','f'],['i','aɪ'],['nd','nd']],
  five:[['f','f'],['ive','aɪv']],
  flower:[['fl','fl'],['ow','aʊ'],['er','ər']],
  food:[['f','f'],['oo','uː'],['d','d']],
  friend:[['fr','fr'],['ie','ɛ'],['nd','nd']],
  funny:[['fun','fʌn'],['ny','i']],
  future:[['fu','fjuː'],['ture','tʃər']],
  get:[['g','g'],['e','ɛ'],['t','t']],
  giant:[['gi','dʒaɪ'],['ant','ənt']],
  girl:[['g','g'],['ir','ɜː'],['l','l']],
  give:[['g','g'],['ive','ɪv']],
  good:[['g','g'],['oo','ʊ'],['d','d']],
  great:[['gr','gr'],['ea','eɪ'],['t','t']],
  hand:[['h','h'],['a','æ'],['nd','nd']],
  happy:[['hap','hæp'],['py','pi']],
  hard:[['h','h'],['ar','ɑːr'],['d','d']],
  have:[['h','h'],['a','æ'],['ve','v']],
  hear:[['h','h'],['ear','ɪər']],
  heart:[['h','h'],['ear','ɑːr'],['t','t']],
  hello:[['hel','hɛl'],['lo','oʊ']],
  help:[['h','h'],['e','ɛ'],['lp','lp']],
  here:[['h','h'],['ere','ɪər']],
  high:[['h','h'],['igh','aɪ']],
  hippo:[['hip','hɪp'],['po','oʊ']],
  home:[['h','h'],['ome','oʊm']],
  house:[['h','h'],['ou','aʊ'],['se','z']],
  how:[['h','h'],['ow','aʊ']],
  important:[['im','ɪm'],['por','pɔːr'],['tant','tənt']],
  just:[['j','dʒ'],['u','ʌ'],['st','st']],
  keep:[['k','k'],['ee','iː'],['p','p']],
  know:[['kn','n'],['ow','oʊ']],
  knowledge:[['know','nɑː'],['ledge','lɪdʒ']],
  language:[['lan','læŋ'],['guage','gwɪdʒ']],
  large:[['l','l'],['ar','ɑːr'],['ge','dʒ']],
  last:[['l','l'],['a','æ'],['st','st']],
  lazy:[['la','leɪ'],['zy','zi']],
  learn:[['l','l'],['ear','ɜː'],['n','n']],
  lemon:[['lem','lɛm'],['on','ən']],
  light:[['l','l'],['igh','aɪ'],['t','t']],
  like:[['l','l'],['i','aɪ'],['ke','k']],
  little:[['lit','lɪt'],['tle','əl']],
  live:[['l','l'],['i','ɪ'],['ve','v']],
  lollipop:[['lol','lɑːl'],['li','ɪ'],['pop','pɑːp']],
  look:[['l','l'],['oo','ʊ'],['k','k']],
  loud:[['l','l'],['ou','aʊ'],['d','d']],
  love:[['l','l'],['ove','ʌv']],
  make:[['m','m'],['a','eɪ'],['ke','k']],
  man:[['m','m'],['a','æ'],['n','n']],
  match:[['m','m'],['a','æ'],['tch','tʃ']],
  measure:[['mea','mɛ'],['sure','ʒər']],
  moon:[['m','m'],['oo','uː'],['n','n']],
  more:[['m','m'],['ore','ɔːr']],
  mother:[['m','m'],['o','ʌ'],['th','ð'],['er','ər']],
  much:[['m','m'],['u','ʌ'],['ch','tʃ']],
  music:[['mu','mjuː'],['sic','zɪk']],
  name:[['n','n'],['a','eɪ'],['me','m']],
  nature:[['na','neɪ'],['ture','tʃər']],
  near:[['n','n'],['ear','ɪər']],
  need:[['n','n'],['ee','iː'],['d','d']],
  next:[['n','n'],['e','ɛ'],['xt','kst']],
  nice:[['n','n'],['i','aɪ'],['ce','s']],
  night:[['n','n'],['igh','aɪ'],['t','t']],
  notes:[['n','n'],['otes','oʊts']],
  nothing:[['no','nʌ'],['th','θ'],['ing','ɪŋ']],
  now:[['n','n'],['ow','aʊ']],
  often:[['of','ɔː'],['ten','tən']],
  old:[['o','oʊ'],['ld','ld']],
  only:[['on','oʊn'],['ly','li']],
  open:[['o','oʊ'],['pen','pən']],
  other:[['o','ʌ'],['th','ð'],['er','ər']],
  out:[['ou','aʊ'],['t','t']],
  people:[['peo','piː'],['ple','pəl']],
  phone:[['ph','f'],['one','oʊn']],
  photo:[['pho','foʊ'],['to','toʊ']],
  place:[['pl','pl'],['a','eɪ'],['ce','s']],
  please:[['pl','pl'],['ea','iː'],['se','z']],
  problem:[['pro','prɑː'],['blem','bləm']],
  pronunciation:[['pro','prə'],['nun','nʌn'],['ci','sɪ'],['a','eɪ'],['tion','ʃən']],
  put:[['p','p'],['u','ʊ'],['t','t']],
  question:[['que','kwɛs'],['tion','tʃən']],
  read:[['r','r'],['ea','iː'],['d','d']],
  really:[['r','r'],['ea','iː'],['ll','l'],['y','i']],
  red:[['r','r'],['e','ɛ'],['d','d']],
  right:[['r','r'],['igh','aɪ'],['t','t']],
  ring:[['r','r'],['ing','ɪŋ']],
  road:[['r','r'],['oa','oʊ'],['d','d']],
  run:[['r','r'],['u','ʌ'],['n','n']],
  same:[['s','s'],['a','eɪ'],['me','m']],
  say:[['s','s'],['ay','eɪ']],
  school:[['sch','sk'],['ool','uːl']],
  she:[['sh','ʃ'],['e','iː']],
  should:[['sh','ʃ'],['oul','ʊ'],['d','d']],
  sister:[['sis','sɪs'],['ter','tər']],
  sleep:[['sl','sl'],['ee','iː'],['p','p']],
  small:[['sm','sm'],['all','ɔːl']],
  soft:[['s','s'],['o','ɔː'],['ft','ft']],
  song:[['s','s'],['ong','ɔːŋ']],
  sound:[['s','s'],['ou','aʊ'],['nd','nd']],
  south:[['s','s'],['ou','aʊ'],['th','θ']],
  speak:[['sp','sp'],['ea','iː'],['k','k']],
  start:[['st','st'],['ar','ɑːr'],['t','t']],
  stop:[['st','st'],['o','ɑː'],['p','p']],
  story:[['sto','stɔːr'],['y','i']],
  study:[['stu','stʌ'],['dy','di']],
  sweater:[['sw','sw'],['eat','ɛt'],['er','ər']],
  table:[['ta','teɪ'],['ble','bəl']],
  take:[['t','t'],['a','eɪ'],['ke','k']],
  teacher:[['tea','tiː'],['cher','tʃər']],
  that:[['th','ð'],['a','æ'],['t','t']],
  the:[['th','ð'],['e','ə']],
  their:[['th','ð'],['eir','ɛər']],
  them:[['th','ð'],['em','ɛm']],
  then:[['th','ð'],['en','ɛn']],
  there:[['th','ð'],['ere','ɛər']],
  these:[['th','ð'],['ese','iːz']],
  they:[['th','ð'],['ey','eɪ']],
  thing:[['th','θ'],['ing','ɪŋ']],
  think:[['th','θ'],['i','ɪ'],['nk','ŋk']],
  this:[['th','ð'],['i','ɪ'],['s','z']],
  those:[['th','ð'],['ose','oʊz']],
  though:[['th','ð'],['ough','oʊ']],
  three:[['thr','θr'],['ee','iː']],
  through:[['thr','θr'],['ough','uː']],
  time:[['t','t'],['i','aɪ'],['me','m']],
  today:[['to','tə'],['day','deɪ']],
  together:[['to','tə'],['geth','gɛð'],['er','ər']],
  treasure:[['trea','trɛ'],['sure','ʒər']],
  tree:[['tr','tr'],['ee','iː']],
  turn:[['t','t'],['ur','ɜː'],['n','n']],
  under:[['un','ʌn'],['der','dər']],
  university:[['u','juː'],['ni','nɪ'],['ver','vɜː'],['si','sɪ'],['ty','ti']],
  usual:[['u','juː'],['su','ʒu'],['al','əl']],
  vegetable:[['veg','vɛdʒ'],['e','ɪ'],['ta','tə'],['ble','bəl']],
  very:[['v','v'],['er','ɛr'],['y','i']],
  vine:[['v','v'],['i','aɪ'],['ne','n']],
  vision:[['vi','vɪ'],['sion','ʒən']],
  vital:[['vi','vaɪ'],['tal','təl']],
  voice:[['v','v'],['oi','ɔɪ'],['ce','s']],
  want:[['w','w'],['an','ɑːn'],['t','t']],
  water:[['wa','wɔː'],['ter','ɾər']],
  weather:[['w','w'],['ea','ɛ'],['th','ð'],['er','ər']],
  well:[['w','w'],['e','ɛ'],['ll','l']],
  what:[['wh','w'],['a','ɑː'],['t','t']],
  when:[['wh','w'],['en','ɛn']],
  where:[['wh','w'],['ere','ɛər']],
  which:[['wh','w'],['ich','ɪtʃ']],
  who:[['wh','h'],['o','uː']],
  why:[['wh','w'],['y','aɪ']],
  will:[['w','w'],['i','ɪ'],['ll','l']],
  wish:[['w','w'],['ish','ɪʃ']],
  with:[['w','w'],['i','ɪ'],['th','θ']],
  without:[['with','wɪð'],['out','aʊt']],
  wonderful:[['won','wʌn'],['der','dər'],['ful','fəl']],
  word:[['w','w'],['or','ɜː'],['d','d']],
  world:[['w','w'],['or','ɜː'],['l','l'],['d','d']],
  wow:[['w','w'],['ow','aʊ']],
  write:[['wr','r'],['i','aɪ'],['te','t']],
  year:[['y','j'],['ear','ɪər']],
  yogurt:[['yo','joʊ'],['gurt','gərt']],
  you:[['y','j'],['ou','uː']],
  your:[['y','j'],['our','ɔːr']],
  yummy:[['yum','jʌm'],['my','i']],
  zebra:[['ze','ziː'],['bra','brə']],
  better:[['bet','bɛt'],['ter','ɾər']],
  muddy:[['mud','mʌd'],['dy','i']],
  // words in SOUNDS data not previously covered
  bee:[['b','b'],['ee','iː']],
  feet:[['f','f'],['ee','iː'],['t','t']],
  fish:[['f','f'],['i','ɪ'],['sh','ʃ']],
  sit:[['s','s'],['i','ɪ'],['t','t']],
  bit:[['b','b'],['i','ɪ'],['t','t']],
  quick:[['qu','kw'],['i','ɪ'],['ck','k']],
  egg:[['e','ɛ'],['gg','g']],
  bag:[['b','b'],['a','æ'],['g','g']],
  black:[['bl','bl'],['a','æ'],['ck','k']],
  bus:[['b','b'],['u','ʌ'],['s','s']],
  duck:[['d','d'],['u','ʌ'],['ck','k']],
  banana:[['ba','bə'],['na','næ'],['na','nə']],
  blue:[['bl','bl'],['ue','uː']],
  ball:[['b','b'],['all','ɔːl']],
  hot:[['h','h'],['o','ɑː'],['t','t']],
  clock:[['cl','kl'],['o','ɑː'],['ck','k']],
  dollar:[['d','d'],['o','ɑː'],['ll','l'],['ar','ər']],
  go:[['g','g'],['o','oʊ']],
  bike:[['b','b'],['i','aɪ'],['ke','k']],
  boy:[['b','b'],['oy','ɔɪ']],
  oil:[['oi','ɔɪ'],['l','l']],
  car:[['c','k'],['ar','ɑːr']],
  door:[['d','d'],['oor','ɔːr']],
  pretty:[['pr','pr'],['ett','ɪt'],['y','i']],
  plant:[['pl','pl'],['a','æ'],['nt','nt']],
  baby:[['ba','beɪ'],['by','bi']],
  big:[['b','b'],['i','ɪ'],['g','g']],
  tiny:[['ti','taɪ'],['ny','ni']],
  turtle:[['tur','tɜː'],['tle','təl']],
  dinner:[['din','dɪn'],['ner','nər']],
  date:[['d','d'],['a','eɪ'],['te','t']],
  deep:[['d','d'],['ee','iː'],['p','p']],
  candy:[['can','kæn'],['dy','di']],
  cane:[['c','k'],['a','eɪ'],['ne','n']],
  kind:[['k','k'],['i','aɪ'],['nd','nd']],
  giggly:[['gig','gɪg'],['gly','li']],
  meek:[['m','m'],['ee','iː'],['k','k']],
  mouse:[['m','m'],['ou','aʊ'],['se','s']],
  new:[['n','n'],['ew','juː']],
  necklace:[['neck','nɛk'],['lace','lɪs']],
  furry:[['fur','fɜː'],['ry','ri']],
  nose:[['n','n'],['o','oʊ'],['se','z']],
  shiny:[['sh','ʃ'],['i','aɪ'],['ny','ni']],
  shoes:[['sh','ʃ'],['oes','uːz']],
  prickly:[['pr','pr'],['i','ɪ'],['ck','k'],['ly','li']],
  branch:[['br','br'],['a','æ'],['n','n'],['ch','tʃ']],
  whale:[['wh','w'],['a','eɪ'],['le','l']],
  cheddar:[['ch','tʃ'],['e','ɛ'],['dd','d'],['ar','ər']],
  cheese:[['ch','tʃ'],['ee','iː'],['se','z']],
  church:[['ch','tʃ'],['ur','ɜː'],['ch','tʃ']],
  gentle:[['gen','dʒɛn'],['tle','təl']],
  city_tap:[['ci','sɪ'],['ty','ɾi']],
  butter:[['but','bʌt'],['ter','ɾər']],
  before:[['be','bɪ'],['fore','fɔːr']],
  breathe:[['br','br'],['eathe','iːð']],
  morning:[['mor','mɔːr'],['ning','nɪŋ']],
  learning:[['learn','lɜːrn'],['ing','ɪŋ']],
}

function lookupWord(word) {
  const w = word.toLowerCase().trim().replace(/[^a-z]/g, '')
  const raw = WORD_IPA_RAW[w]
  if (raw) {
    return raw.map(([text, ipa]) => ({
      text, ipa,
      tip: PHONEME_INFO[ipa]?.tip || `Âm /${ipa}/`,
      isHard: PHONEME_INFO[ipa]?.hard || false,
    }))
  }
  return g2p(w)
}

function g2p(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return [{ text: word, ipa: '?', tip: 'Không tìm thấy trong từ điển', isHard: false }]
  const out = []
  let i = 0
  const voiced_th_words = new Set(['the','this','that','there','they','them','their','these','those','though','with','other','mother','father','brother','whether','weather','another','together','smooth','breathe'])
  const isVoicedThWord = voiced_th_words.has(w)

  while (i < w.length) {
    const rest = w.slice(i)
    const prev = i > 0 ? w[i - 1] : ''
    const next = w[i + 1] || ''
    let found = false
    const try2 = (pat, ipa) => {
      if (rest.startsWith(pat)) { out.push({ text: pat, ipa }); i += pat.length; found = true }
    }
    if (!found) try2('tch', 'tʃ')
    if (!found) try2('dge', 'dʒ')
    if (!found) try2('igh', 'aɪ')
    if (!found) try2('ght', 't')
    if (!found && rest.startsWith('tion')) { out.push({ text: 'tion', ipa: 'ʃən' }); i += 4; found = true }
    if (!found && rest.startsWith('sion')) { out.push({ text: 'sion', ipa: 'ʒən' }); i += 4; found = true }
    if (!found && rest.startsWith('ture')) { out.push({ text: 'ture', ipa: 'tʃər' }); i += 4; found = true }
    if (!found && rest.startsWith('th')) { out.push({ text: 'th', ipa: (isVoicedThWord || i > 0) ? 'ð' : 'θ' }); i += 2; found = true }
    if (!found) try2('sh', 'ʃ')
    if (!found) try2('ch', 'tʃ')
    if (!found) try2('ph', 'f')
    if (!found && rest.startsWith('wh')) { out.push({ text: 'wh', ipa: next === 'o' ? 'h' : 'w' }); i += 2; found = true }
    if (!found) try2('ck', 'k')
    if (!found && rest.startsWith('ng')) { out.push({ text: 'ng', ipa: 'aeiou'.includes(w[i + 2] || '') ? 'ŋg' : 'ŋ' }); i += 2; found = true }
    if (!found) try2('qu', 'kw')
    if (!found) try2('kn', 'n')
    if (!found) try2('wr', 'r')
    if (!found && rest.startsWith('mb') && i === w.length - 2) { out.push({ text: 'mb', ipa: 'm' }); i += 2; found = true }
    if (!found) try2('ee', 'iː')
    if (!found) try2('ea', 'iː')
    if (!found) try2('ai', 'eɪ')
    if (!found) try2('ay', 'eɪ')
    if (!found) try2('oa', 'oʊ')
    if (!found) try2('oi', 'ɔɪ')
    if (!found) try2('oy', 'ɔɪ')
    if (!found) try2('oo', 'uː')
    if (!found) try2('ou', 'aʊ')
    if (!found) try2('ow', 'aʊ')
    if (!found) try2('ew', 'juː')
    if (!found) try2('ue', 'uː')
    if (!found) try2('au', 'ɔː')
    if (!found) try2('aw', 'ɔː')
    if (!found) try2('er', 'ər')
    if (!found) try2('ir', 'ɜː')
    if (!found) try2('ur', 'ɜː')
    if (!found) try2('or', 'ɔːr')
    if (!found) try2('ar', 'ɑːr')
    if (!found) {
      const c = w[i]
      let ipa = c
      if (c === 'a') ipa = 'æ'
      else if (c === 'e') ipa = i === w.length - 1 ? null : 'ɛ'
      else if (c === 'i') ipa = 'ɪ'
      else if (c === 'o') ipa = 'ɑː'
      else if (c === 'u') ipa = 'ʌ'
      else if (c === 'y') ipa = i === 0 ? 'j' : 'i'
      else if (c === 'c') ipa = 'eiy'.includes(next) ? 's' : 'k'
      else if (c === 'g') ipa = 'eiy'.includes(next) ? 'dʒ' : 'g'
      else if (c === 's') ipa = 'aeiou'.includes(prev) && 'aeiou'.includes(next) ? 'z' : 's'
      else if (c === 'x') ipa = 'ks'
      else if (c === 'z') ipa = 'z'
      if (ipa !== null) out.push({ text: c, ipa })
      i++
    }
  }
  return out
    .filter(p => p.ipa && p.ipa !== '∅')
    .map(p => ({ ...p, tip: PHONEME_INFO[p.ipa]?.tip || `Âm /${p.ipa}/`, isHard: PHONEME_INFO[p.ipa]?.hard || false }))
}


// ─── AUDIO HELPERS ────────────────────────────────────────────────────────

function getSupportedMimeType() {
  const candidates = ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/ogg','audio/mp4']
  return candidates.find(t => MediaRecorder.isTypeSupported(t)) || ''
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices()
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
}

function speak(text) {
  const syn = window.speechSynthesis
  if (!syn) return
  syn.cancel()
  const doSpeak = () => {
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'en-US'; utt.rate = 0.8; utt.pitch = 1
    const voices = syn.getVoices()
    const pick = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'))
      || voices.find(v => v.lang === 'en-US')
      || voices.find(v => v.lang.startsWith('en'))
    if (pick) utt.voice = pick
    syn.speak(utt)
  }
  const voices = syn.getVoices()
  if (voices.length > 0) { doSpeak() }
  else { syn.onvoiceschanged = () => { syn.onvoiceschanged = null; doSpeak() }; setTimeout(() => { if (syn.getVoices().length > 0) doSpeak() }, 300) }
}

// ─── UI HELPERS ───────────────────────────────────────────────────────────

function scoreColor(s) { return s >= 85 ? 'text-emerald-400' : s >= 65 ? 'text-yellow-400' : 'text-red-400' }
function scoreBg(s) { return s >= 85 ? 'bg-emerald-500/20 border-emerald-500/50' : s >= 65 ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-red-500/20 border-red-500/50' }
function scoreLabel(s) { return s >= 90 ? 'Xuất sắc! 🎉' : s >= 75 ? 'Tốt lắm! 👍' : s >= 60 ? 'Gần đúng 💪' : 'Luyện thêm nhé 📚' }

// ─── PRONUNCIATION PRACTICE (shared) ─────────────────────────────────────


function PronunciationPractice({ word, meaning, emoji, onBack }) {
  const phonemes = lookupWord(word)
  // phases: ready → recording → scoring → result
  const [phase, setPhase] = useState('ready')
  const [errorMsg, setErrorMsg] = useState(null)
  const [result, setResult] = useState(null)
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [recordingUrl, setRecordingUrl] = useState(null)
  const [isPlayingBack, setIsPlayingBack] = useState(false)
  const mrRef = useRef(null)
  const streamRef = useRef(null)
  const speechRef = useRef(null)
  const audioRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => () => {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl)
  }, [recordingUrl])

  const startBlobRecording = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        streamRef.current = stream
        const mimeType = getSupportedMimeType()
        const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {})
        mrRef.current = mr
        const chunks = []
        mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
        mr.onstop = async () => {
          stream.getTracks().forEach(t => t.stop())
          if (chunks.length === 0) { setErrorMsg('Không ghi được âm thanh. Thử lại.'); setPhase('ready'); return }
          const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' })
          setRecordingUrl(URL.createObjectURL(blob))
          setPhase('scoring')
          try {
            const data = await scoreWord(blob, phonemes)
            setResult(data); setPhase('result')
          } catch (err) {
            setErrorMsg(`Lỗi chấm điểm: ${err.message}`); setPhase('ready')
          }
        }
        mr.start(100)
        setPhase('recording')
        timeoutRef.current = setTimeout(() => {
          if (mrRef.current?.state === 'recording') mrRef.current.stop()
        }, 5000)
      })
      .catch(err => {
        const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
        setErrorMsg(isDenied
          ? 'Chưa cấp quyền microphone — nhấn icon 🔒 trên thanh địa chỉ và bật Microphone.'
          : `Lỗi microphone: ${err.message}`)
      })
  }, [phonemes])

  const startRecording = useCallback(() => {
    setRecordingUrl(null)
    setErrorMsg(null)
    startBlobRecording()
  }, [startBlobRecording])

  const stopRecording = () => {
    clearTimeout(timeoutRef.current)
    if (mrRef.current?.state === 'recording') mrRef.current.stop()
  }

  const reset = () => {
    clearTimeout(timeoutRef.current)
    if (mrRef.current?.state !== 'inactive') mrRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    setPhase('ready'); setResult(null); setSelectedIdx(null)
    setRecordingUrl(null); setIsPlayingBack(false); setErrorMsg(null)
  }

  const playbackRecording = () => {
    if (!recordingUrl || !audioRef.current) return
    if (isPlayingBack) {
      audioRef.current.pause(); audioRef.current.currentTime = 0; setIsPlayingBack(false); return
    }
    audioRef.current.src = recordingUrl
    audioRef.current.onended = () => setIsPlayingBack(false)
    audioRef.current.play().then(() => setIsPlayingBack(true)).catch(() => setIsPlayingBack(false))
  }

  const sel = selectedIdx !== null && result ? result.phonemes[selectedIdx] : null

  return (
    <div className="flex flex-col h-full">
      <audio ref={audioRef} className="hidden" />

      {/* Tiêu đề từ + IPA breakdown */}
      <div className="text-center py-6 px-4">
        <div className="text-5xl mb-2">{emoji}</div>
        <button onClick={() => speak(word)} className="text-3xl font-bold text-white hover:text-blue-300 transition-colors flex items-center gap-2 mx-auto">
          {word}
          <Volume2 size={22} className="text-white/40" />
        </button>
        <div className="text-white/50 text-sm mt-1">{meaning}</div>

        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {phonemes.map((p, idx) => {
            const r = result?.phonemes[idx]
            const hasScore = r && result?.spokenWord !== null
            const bg = hasScore ? scoreBg(r.score) : 'bg-white/5 border-white/10'
            const tc = hasScore ? scoreColor(r.score) : 'text-white/60'
            return (
              <button key={idx}
                onClick={() => hasScore && setSelectedIdx(selectedIdx === idx ? null : idx)}
                className={`border rounded-xl px-3 py-2 flex flex-col items-center gap-0.5 transition-all ${bg} ${hasScore ? 'cursor-pointer active:scale-95' : 'cursor-default'} ${selectedIdx === idx ? 'ring-2 ring-white/40' : ''}`}
              >
                <span className="text-white font-semibold text-sm">{p.text}</span>
                <span className="text-white/40 font-mono text-xs">/{p.ipa}/</span>
                {hasScore && <span className={`text-xs font-bold ${tc}`}>{r.score}%</span>}
                {p.isHard && !hasScore && <span className="text-yellow-400 text-xs">★</span>}
              </button>
            )
          })}
        </div>

        {sel && (
          <div className={`mt-3 mx-4 rounded-2xl p-3 border text-left ${scoreBg(sel.score)}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-semibold">{sel.text} <span className="text-white/40 font-mono text-sm">/{sel.ipa}/</span></span>
              <span className={`font-bold ${scoreColor(sel.score)}`}>{sel.score}%</span>
            </div>
            {sel.note && <p className="text-red-300 text-sm mb-1">{sel.note}</p>}
            <p className="text-white/70 text-sm">{sel.tip}</p>
          </div>
        )}
      </div>

      {/* Kết quả tổng */}
      {result && (
        <div className="mx-4 mb-4 rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Kết quả:</span>
            <span className="text-white/40 text-sm">Từ: "{result.spokenWord || '—'}"</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${result.overall >= 85 ? 'bg-emerald-400' : result.overall >= 65 ? 'bg-yellow-400' : 'bg-red-400'}`}
                style={{ width: `${result.overall}%` }} />
            </div>
            <span className={`font-bold text-lg ${scoreColor(result.overall)}`}>{result.overall}%</span>
          </div>
          <p className={`text-sm mt-1 ${scoreColor(result.overall)}`}>{scoreLabel(result.overall)}</p>
          <p className="text-white/40 text-xs mt-1">Nhấn vào từng âm để xem chi tiết</p>
        </div>
      )}

      {/* Nút điều khiển */}
      <div className="px-4 pb-6 mt-auto flex flex-col gap-3">

        {errorMsg && (
          <div className="bg-red-500/15 border border-red-500/40 rounded-2xl px-4 py-3 flex items-start gap-3">
            <span className="text-red-400 text-lg mt-0.5">⚠️</span>
            <p className="text-red-300 text-sm leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Bước 1: ready */}
        {phase === 'ready' && (
          <button onClick={startRecording}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl py-4 flex items-center justify-center gap-3 text-lg font-semibold active:scale-95 transition-transform">
            <Mic size={24} />
            Bắt đầu ghi âm
          </button>
        )}

        {/* Bước 2: recording */}
        {phase === 'recording' && (
          <button onClick={stopRecording} className="w-full bg-red-600/20 border border-red-500/50 rounded-2xl py-4 flex items-center justify-center gap-3 text-red-400 active:scale-95 transition-transform">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="font-semibold">Đang ghi âm... nhấn để dừng</span>
          </button>
        )}

        {/* Bước 3: scoring — chạy mô hình local */}
        {phase === 'scoring' && (
          <>
            {recordingUrl && (
              <button onClick={playbackRecording}
                className={`w-full rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform border ${isPlayingBack ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-green-600/20 border-green-500/30 text-green-300'}`}>
                {isPlayingBack ? <Square size={16} /> : <Play size={16} />}
                {isPlayingBack ? 'Dừng' : 'Nghe lại bản ghi'}
              </button>
            )}
            <div className="w-full rounded-2xl py-3 bg-white/5 border border-white/10 text-white/50 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              Đang phân tích phát âm...
            </div>
            <button onClick={reset} className="w-full bg-white/5 border border-white/10 text-white/50 rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <RotateCcw size={18} />
              Thử lại
            </button>
          </>
        )}

        {/* Bước 4: result */}
        {phase === 'result' && (
          <>
            <div className="flex gap-2">
              {recordingUrl && (
                <button onClick={playbackRecording}
                  className={`flex-1 rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform border ${isPlayingBack ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-green-600/20 border-green-500/30 text-green-300'}`}>
                  {isPlayingBack ? <Square size={16} /> : <Play size={16} />}
                  {isPlayingBack ? 'Dừng' : 'Nghe lại'}
                </button>
              )}
              <button onClick={() => speak(word)} className="flex-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <Volume2 size={16} />
                Nghe mẫu
              </button>
            </div>
            <button onClick={reset} className="w-full bg-white/5 border border-white/10 text-white/50 rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <RotateCcw size={18} />
              Thử lại
            </button>
          </>
        )}

        {/* Nghe mẫu ở ready/recording */}
        {(phase === 'ready' || phase === 'recording') && (
          <button onClick={() => speak(word)} className="w-full bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Volume2 size={18} />
            Nghe mẫu
          </button>
        )}

      </div>
    </div>
  )
}

// ─── SCREENS ──────────────────────────────────────────────────────────────

function SoundLibraryScreen({ onSelectSound, onGoDict }) {
  const [tab, setTab] = useState('vowels')
  const groups = tab === 'vowels' ? VOWEL_GROUPS : CONSONANT_GROUPS
  const sounds = SOUNDS.filter(s => tab === 'vowels' ? s.type === 'vowel' : s.type === 'consonant')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#0f0f1a] to-[#0f0f1a] pb-24">
      {/* Header */}
      <div className="px-4 pt-10 pb-4">
        <h1 className="text-2xl font-bold text-white">Sound Library</h1>
        <p className="text-white/40 text-sm">48 âm chuẩn tiếng Anh</p>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4 flex gap-2">
        {['vowels','consonants'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-2xl font-semibold text-sm transition-all ${tab === t ? 'bg-white text-gray-900' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
            {t === 'vowels' ? `Nguyên Âm (${SOUNDS.filter(s=>s.type==='vowel').length})` : `Phụ Âm (${SOUNDS.filter(s=>s.type==='consonant').length})`}
          </button>
        ))}
      </div>

      {/* Sound groups */}
      {groups.map(g => {
        const groupSounds = sounds.filter(s => s.group === g.key)
        if (!groupSounds.length) return null
        return (
          <div key={g.key} className="mb-6">
            <div className="px-4 mb-3 flex items-center gap-2">
              <span className="text-white/80 font-semibold text-sm">{g.label}</span>
              <span className="text-white/30 text-xs">{groupSounds.length} âm</span>
            </div>
            <div className="px-4 grid grid-cols-4 gap-2">
              {groupSounds.map(s => (
                <button key={s.id} onClick={() => onSelectSound(s)}
                  className={`relative rounded-2xl p-3 flex flex-col items-center gap-1 bg-gradient-to-b ${s.grad} active:scale-95 transition-transform shadow-lg`}>
                  <span className="text-white font-bold text-base">{s.label}</span>
                  <span className="text-white/60 font-mono text-xs">/{s.ipa}/</span>
                  {s.hard && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-yellow-400 rounded-full" />}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SoundDetailScreen({ sound, onBack, onPracticeWord }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#0f0f1a] to-[#0f0f1a] pb-10">
      {/* Back */}
      <div className="px-4 pt-6 pb-2 flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <span className="text-white/50 text-sm">{sound.group}</span>
      </div>

      {/* Sound card */}
      <div className={`mx-4 rounded-3xl p-6 bg-gradient-to-br ${sound.grad} mb-6`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-5xl font-bold text-white">{sound.label}</div>
            <div className="text-white/70 font-mono text-xl">/{sound.ipa}/</div>
          </div>
          <button onClick={() => speak(sound.words[0].word)} className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center active:scale-95 transition-transform">
            <Volume2 size={26} className="text-white" />
          </button>
        </div>
        {sound.hard && <span className="inline-block bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-xs rounded-lg px-2 py-0.5">★ Khó với người Việt</span>}
        <div className="mt-4 bg-white/10 rounded-2xl p-3">
          <p className="text-white/90 text-sm leading-relaxed">{sound.tip}</p>
        </div>
      </div>

      {/* Rachel's English links */}
      <div className="px-4 mb-6">
        <div className="text-white/60 text-xs uppercase tracking-wider mb-3 font-semibold">Học thêm</div>
        <div className="flex flex-col gap-2">
          {RACHEL_URLS[sound.ipa] && (
            <a href={RACHEL_URLS[sound.ipa]} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 hover:bg-white/10 transition-colors active:scale-98">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-rose-400 text-xs font-bold">RE</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-white/80 text-sm font-medium">Rachel's English</div>
                <div className="text-white/40 text-xs">Hướng dẫn chi tiết âm /{sound.ipa}/</div>
              </div>
              <ExternalLink size={14} className="text-white/30" />
            </a>
          )}
          <a href={rachelYouTubeSearch(sound.label)} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 hover:bg-white/10 transition-colors active:scale-98">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 flex items-center justify-center flex-shrink-0">
              <Play size={14} className="text-red-400 fill-red-400" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-white/80 text-sm font-medium">YouTube — Rachel's English</div>
              <div className="text-white/40 text-xs">Video hướng dẫn âm {sound.label}</div>
            </div>
            <ExternalLink size={14} className="text-white/30" />
          </a>
        </div>
      </div>

      {/* Practice words */}
      <div className="px-4">
        <div className="text-white/60 text-xs uppercase tracking-wider mb-3 font-semibold">Luyện tập với từ</div>
        <div className="flex flex-col gap-3">
          {sound.words.map(w => (
            <button key={w.word} onClick={() => onPracticeWord(w)}
              className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 active:scale-98 hover:bg-white/8 transition-all text-left">
              <span className="text-3xl">{w.emoji}</span>
              <div className="flex-1">
                <div className="text-white font-semibold">{w.word}</div>
                <div className="text-white/40 text-sm">{w.meaning}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={e => { e.stopPropagation(); speak(w.word) }} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <Volume2 size={14} className="text-white/60" />
                </button>
                <div className="text-white/20 text-lg">›</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function PracticeWordScreen({ word, meaning, emoji, onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#0f0f1a] to-[#0f0f1a]">
      <div className="px-4 pt-6 pb-2 flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <span className="text-white/50 text-sm">Luyện phát âm</span>
      </div>
      <PronunciationPractice word={word} meaning={meaning} emoji={emoji} onBack={onBack} />
    </div>
  )
}

function DictionaryScreen({ onBack }) {
  const [query, setQuery] = useState('')
  const [activeWord, setActiveWord] = useState(null)
  const inputRef = useRef(null)

  const handleSearch = (e) => {
    e.preventDefault()
    const w = query.trim().toLowerCase().split(/\s+/)[0]
    if (w) setActiveWord(w)
  }

  if (activeWord) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#0f0f1a] to-[#0f0f1a]">
        <div className="px-4 pt-6 pb-2 flex items-center gap-3">
          <button onClick={() => setActiveWord(null)} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/70">
            <ChevronLeft size={20} />
          </button>
          <span className="text-white/50 text-sm">Từ điển phát âm</span>
        </div>
        <PronunciationPractice word={activeWord} meaning="" emoji="📖" onBack={() => setActiveWord(null)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#0f0f1a] to-[#0f0f1a] pb-24">
      <div className="px-4 pt-10 pb-4">
        <h1 className="text-2xl font-bold text-white">Từ Điển Phát Âm</h1>
        <p className="text-white/40 text-sm">Nhập từ để chẩn đoán phát âm</p>
      </div>
      <form onSubmit={handleSearch} className="px-4 mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Nhập từ tiếng Anh..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
            />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-5 font-semibold transition-colors">
            Tra
          </button>
        </div>
      </form>

      {/* Suggestions */}
      <div className="px-4">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-3">Thử ngay</div>
        <div className="flex flex-wrap gap-2">
          {['think','this','three','voice','bird','water','measure','good','beautiful','through','very','world'].map(w => (
            <button key={w} onClick={() => setActiveWord(w)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm hover:bg-white/10 transition-colors active:scale-95">
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────

function BottomNav({ screen, onNavigate }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-white/10 flex z-40">
      {[
        { id: 'library', icon: Library, label: 'Sound Library' },
        { id: 'dictionary', icon: BookOpen, label: 'Từ Điển' },
      ].map(({ id, icon: Icon, label }) => (
        <button key={id} onClick={() => onNavigate(id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${screen === id ? 'text-white' : 'text-white/30 hover:text-white/60'}`}>
          <Icon size={22} strokeWidth={screen === id ? 2.5 : 1.5} />
          <span className="text-xs">{label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('library')
  const [selectedSound, setSelectedSound] = useState(null)
  const [practiceWord, setPracticeWord] = useState(null)

  const handleSelectSound = (sound) => { setSelectedSound(sound); setScreen('soundDetail') }
  const handlePracticeWord = (w) => { setPracticeWord(w); setScreen('practiceWord') }
  const handleNavigate = (s) => { setScreen(s); setSelectedSound(null); setPracticeWord(null) }

  return (
    <div className="max-w-md mx-auto bg-[#0f0f1a] min-h-screen relative">
      {screen === 'library' && (
        <SoundLibraryScreen onSelectSound={handleSelectSound} onGoDict={() => handleNavigate('dictionary')} />
      )}
      {screen === 'soundDetail' && selectedSound && (
        <SoundDetailScreen sound={selectedSound} onBack={() => setScreen('library')} onPracticeWord={handlePracticeWord} />
      )}
      {screen === 'practiceWord' && practiceWord && (
        <PracticeWordScreen word={practiceWord.word} meaning={practiceWord.meaning} emoji={practiceWord.emoji} onBack={() => setScreen('soundDetail')} />
      )}
      {screen === 'dictionary' && (
        <DictionaryScreen onBack={() => handleNavigate('library')} />
      )}
      {(screen === 'library' || screen === 'dictionary') && (
        <BottomNav screen={screen} onNavigate={handleNavigate} />
      )}
    </div>
  )
}
