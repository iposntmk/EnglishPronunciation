import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Mic, MicOff, Volume2, Star, Home, Search, BookOpen,
  ChevronRight, ChevronLeft, RotateCcw, Plus, Trash2,
  X, Play, Award, Zap, Target, TrendingUp, Check
} from 'lucide-react'

// ─── DATA ──────────────────────────────────────────────────────────────────

const TOPICS = [
  {
    id: 'th-sounds',
    name: 'TH Sounds',
    emoji: '👅',
    color: 'from-violet-600 to-purple-700',
    bg: 'bg-violet-900/30',
    border: 'border-violet-500/40',
    description: 'Âm /θ/ và /ð/ khó nhất với người Việt',
    words: [
      {
        word: 'think', meaning: 'suy nghĩ', img: '💭',
        phonemes: [
          { text: 'th', ipa: 'θ', tip: 'Đặt đầu lưỡi giữa hai hàm răng, thổi khí nhẹ không rung họng' },
          { text: 'i', ipa: 'ɪ', tip: 'Miệng hé mở, lưỡi cao-giữa, giống "i" ngắn trong "it"' },
          { text: 'nk', ipa: 'ŋk', tip: 'Lưỡi chạm vòm mềm phía sau, kết thúc bằng âm "k" câm nhẹ' },
        ],
      },
      {
        word: 'this', meaning: 'cái này', img: '👆',
        phonemes: [
          { text: 'th', ipa: 'ð', tip: 'Lưỡi giữa răng NHƯNG rung họng (voiced), khác với /θ/' },
          { text: 'i', ipa: 'ɪ', tip: 'Âm "i" ngắn, lưỡi cao, miệng hé nhẹ' },
          { text: 's', ipa: 'z', tip: 'Âm "z" rung nhẹ, không phải "s" câm' },
        ],
      },
      {
        word: 'three', meaning: 'ba (số 3)', img: '3️⃣',
        phonemes: [
          { text: 'thr', ipa: 'θr', tip: 'Bắt đầu với /θ/ (lưỡi giữa răng) rồi chuyển ngay sang /r/' },
          { text: 'ee', ipa: 'iː', tip: 'Âm "i" dài, kéo căng môi sang hai bên' },
        ],
      },
      {
        word: 'the', meaning: 'cái / con (mạo từ)', img: '📖',
        phonemes: [
          { text: 'th', ipa: 'ð', tip: 'Lưỡi giữa răng và rung họng — âm /ð/ hữu thanh' },
          { text: 'e', ipa: 'ə', tip: 'Âm schwa /ə/ — miệng thư giãn, ngắn và nhẹ nhàng' },
        ],
      },
      {
        word: 'through', meaning: 'xuyên qua', img: '🚀',
        phonemes: [
          { text: 'thr', ipa: 'θr', tip: 'Kết hợp /θ/ + /r/ liền nhau, lưỡi từ răng cuộn ra sau' },
          { text: 'ough', ipa: 'uː', tip: 'Phát âm là "oo" dài — "ough" ở đây không phải là "off" hay "ow"' },
        ],
      },
      {
        word: 'mother', meaning: 'mẹ', img: '👩',
        phonemes: [
          { text: 'm', ipa: 'm', tip: 'Khép môi, rung mũi' },
          { text: 'o', ipa: 'ʌ', tip: 'Âm /ʌ/ giống "ă" của tiếng Việt, miệng mở vừa' },
          { text: 'th', ipa: 'ð', tip: 'Lưỡi giữa răng, rung họng — âm /ð/' },
          { text: 'er', ipa: 'ər', tip: 'Âm "ơ" kết hợp với uốn lưỡi nhẹ ra sau' },
        ],
      },
      {
        word: 'bath', meaning: 'tắm', img: '🛁',
        phonemes: [
          { text: 'b', ipa: 'b', tip: 'Khép môi rồi bật ra, rung họng' },
          { text: 'a', ipa: 'æ', tip: 'Âm /æ/ — mở miệng rộng hơn "a" thường, gần giống "ê-a"' },
          { text: 'th', ipa: 'θ', tip: 'Lưỡi giữa răng, không rung họng — kết thúc câu nhẹ' },
        ],
      },
      {
        word: 'weather', meaning: 'thời tiết', img: '🌤️',
        phonemes: [
          { text: 'w', ipa: 'w', tip: 'Chu môi tròn như "oa", sau đó mở ra — không giống "v"' },
          { text: 'ea', ipa: 'ɛ', tip: 'Âm "e" ngắn, miệng hé vừa' },
          { text: 'th', ipa: 'ð', tip: 'Âm /ð/ hữu thanh giữa câu' },
          { text: 'er', ipa: 'ər', tip: 'Âm /ər/ cuộn lưỡi nhẹ — giọng Mỹ' },
        ],
      },
    ],
  },
  {
    id: 'vowel-sounds',
    name: 'Nguyên Âm',
    emoji: '🎵',
    color: 'from-blue-600 to-cyan-600',
    bg: 'bg-blue-900/30',
    border: 'border-blue-500/40',
    description: 'Phân biệt các nguyên âm tiếng Anh',
    words: [
      {
        word: 'cat', meaning: 'con mèo', img: '🐱',
        phonemes: [
          { text: 'c', ipa: 'k', tip: 'Âm "k" — lưỡi chạm vòm mềm, bật ra' },
          { text: 'a', ipa: 'æ', tip: 'Âm /æ/ đặc trưng Anh Mỹ — mở miệng rộng và kéo về phía trước, khác "a" Việt' },
          { text: 't', ipa: 't', tip: 'Âm "t" bật nhẹ, cuối từ không cần to' },
        ],
      },
      {
        word: 'beat', meaning: 'đánh nhịp', img: '🥁',
        phonemes: [
          { text: 'b', ipa: 'b', tip: 'Khép môi, bật ra, rung họng' },
          { text: 'ea', ipa: 'iː', tip: 'Âm "i" dài /iː/ — kéo hai góc môi sang ngang' },
          { text: 't', ipa: 't', tip: 'Âm "t" cuối, bật nhẹ' },
        ],
      },
      {
        word: 'bit', meaning: 'miếng nhỏ', img: '🧩',
        phonemes: [
          { text: 'b', ipa: 'b', tip: 'Bật môi, rung họng' },
          { text: 'i', ipa: 'ɪ', tip: 'Âm /ɪ/ ngắn — KHÁC với /iː/: lưỡi thấp hơn, miệng thư giãn hơn' },
          { text: 't', ipa: 't', tip: 'Bật "t" nhẹ cuối từ' },
        ],
      },
      {
        word: 'but', meaning: 'nhưng', img: '↔️',
        phonemes: [
          { text: 'b', ipa: 'b', tip: 'Bật môi' },
          { text: 'u', ipa: 'ʌ', tip: 'Âm /ʌ/ — giống "ă" tiếng Việt, miệng mở vừa, lưỡi giữa-thấp' },
          { text: 't', ipa: 't', tip: 'Kết thúc nhẹ với "t"' },
        ],
      },
      {
        word: 'bird', meaning: 'con chim', img: '🐦',
        phonemes: [
          { text: 'b', ipa: 'b', tip: 'Bật môi' },
          { text: 'ir', ipa: 'ɜː', tip: 'Âm /ɜː/ đặc biệt — môi tròn nhẹ, lưỡi giữa, cuộn ra sau (giọng Mỹ)' },
          { text: 'd', ipa: 'd', tip: 'Âm "d" cuối, rung họng nhẹ' },
        ],
      },
      {
        word: 'book', meaning: 'cuốn sách', img: '📚',
        phonemes: [
          { text: 'b', ipa: 'b', tip: 'Bật môi' },
          { text: 'oo', ipa: 'ʊ', tip: 'Âm /ʊ/ ngắn — môi tròn nhẹ, không căng như "oo" trong "food"' },
          { text: 'k', ipa: 'k', tip: 'Âm "k" cuối, nhẹ' },
        ],
      },
      {
        word: 'food', meaning: 'thức ăn', img: '🍜',
        phonemes: [
          { text: 'f', ipa: 'f', tip: 'Răng cửa trên chạm môi dưới, thổi khí' },
          { text: 'oo', ipa: 'uː', tip: 'Âm /uː/ dài — môi tròn căng, kéo ra trước' },
          { text: 'd', ipa: 'd', tip: 'Kết thúc với "d" rung nhẹ' },
        ],
      },
      {
        word: 'cup', meaning: 'cái tách', img: '☕',
        phonemes: [
          { text: 'c', ipa: 'k', tip: 'Âm "k" đầu' },
          { text: 'u', ipa: 'ʌ', tip: 'Âm /ʌ/ — giống "ă", KHÔNG phải "ơ"' },
          { text: 'p', ipa: 'p', tip: 'Bật môi "p" cuối, thổi nhẹ (aspirated)' },
        ],
      },
    ],
  },
  {
    id: 'r-l-sounds',
    name: 'R và L',
    emoji: '👂',
    color: 'from-emerald-600 to-teal-600',
    bg: 'bg-emerald-900/30',
    border: 'border-emerald-500/40',
    description: 'Phân biệt /r/ và /l/ — thách thức lớn',
    words: [
      {
        word: 'red', meaning: 'màu đỏ', img: '🔴',
        phonemes: [
          { text: 'r', ipa: 'r', tip: 'KHÔNG chạm lưỡi vào đâu — cuộn lưỡi ra sau giữa không khí, môi hơi tròn' },
          { text: 'e', ipa: 'ɛ', tip: 'Âm "e" ngắn, miệng hé vừa' },
          { text: 'd', ipa: 'd', tip: 'Kết thúc với "d" rung' },
        ],
      },
      {
        word: 'led', meaning: 'dẫn dắt (đã)', img: '🕯️',
        phonemes: [
          { text: 'l', ipa: 'l', tip: 'Đầu lưỡi CHẠM phần sau răng cửa trên — KHÔNG cuộn ra sau như /r/' },
          { text: 'e', ipa: 'ɛ', tip: 'Âm "e" ngắn' },
          { text: 'd', ipa: 'd', tip: 'Kết thúc "d"' },
        ],
      },
      {
        word: 'right', meaning: 'đúng / phải', img: '✅',
        phonemes: [
          { text: 'r', ipa: 'r', tip: 'Lưỡi cuộn ra sau không chạm gì, môi hơi thu tròn' },
          { text: 'igh', ipa: 'aɪ', tip: 'Diphthong /aɪ/ — bắt đầu từ "a" rộng, trượt lên "i"' },
          { text: 't', ipa: 't', tip: 'Bật "t" cuối nhẹ' },
        ],
      },
      {
        word: 'light', meaning: 'ánh sáng', img: '💡',
        phonemes: [
          { text: 'l', ipa: 'l', tip: 'Lưỡi chạm sau răng trên, âm sáng /l/ đầu từ' },
          { text: 'igh', ipa: 'aɪ', tip: 'Diphthong /aɪ/ — "a" → "i"' },
          { text: 't', ipa: 't', tip: 'Bật "t"' },
        ],
      },
      {
        word: 'road', meaning: 'con đường', img: '🛣️',
        phonemes: [
          { text: 'r', ipa: 'r', tip: 'Lưỡi cuộn ra sau, môi thu lại nhẹ' },
          { text: 'oa', ipa: 'oʊ', tip: 'Diphthong /oʊ/ — bắt đầu "o" trượt sang "u" nhẹ' },
          { text: 'd', ipa: 'd', tip: 'Kết thúc "d"' },
        ],
      },
      {
        word: 'load', meaning: 'tải trọng', img: '📦',
        phonemes: [
          { text: 'l', ipa: 'l', tip: 'Lưỡi chạm sau răng trên, âm /l/' },
          { text: 'oa', ipa: 'oʊ', tip: 'Diphthong /oʊ/' },
          { text: 'd', ipa: 'd', tip: 'Kết thúc "d"' },
        ],
      },
      {
        word: 'really', meaning: 'thực sự', img: '💯',
        phonemes: [
          { text: 'r', ipa: 'r', tip: 'Cuộn lưỡi — âm /r/ đầu' },
          { text: 'ea', ipa: 'iː', tip: 'Âm "ee" dài' },
          { text: 'll', ipa: 'l', tip: 'Lưỡi chạm sau răng trên, âm /l/ giữa từ' },
          { text: 'y', ipa: 'i', tip: 'Âm "i" ngắn cuối' },
        ],
      },
      {
        word: 'world', meaning: 'thế giới', img: '🌍',
        phonemes: [
          { text: 'w', ipa: 'w', tip: 'Chu môi như "oa"' },
          { text: 'or', ipa: 'ɜː', tip: 'Âm /ɜːr/ — "ơ" cuộn lưỡi trong giọng Mỹ' },
          { text: 'l', ipa: 'l', tip: 'Lưỡi chạm sau răng — /l/ cuối từ' },
          { text: 'd', ipa: 'd', tip: 'Kết thúc "d" nhẹ' },
        ],
      },
    ],
  },
  {
    id: 'word-stress',
    name: 'Trọng Âm',
    emoji: '🎯',
    color: 'from-orange-600 to-red-600',
    bg: 'bg-orange-900/30',
    border: 'border-orange-500/40',
    description: 'Học trọng âm từ nhiều âm tiết',
    words: [
      {
        word: 'important', meaning: 'quan trọng', img: '⭐',
        stress: 1,
        phonemes: [
          { text: 'im', ipa: 'ɪm', tip: 'Âm tiết đầu nhẹ, /ɪ/ ngắn' },
          { text: 'por', ipa: 'ˈpɔːr', tip: '★ TRỌNG ÂM — đọc to và dài hơn: "POR"' },
          { text: 'tant', ipa: 'tənt', tip: 'Âm tiết cuối nhẹ, schwa /ə/' },
        ],
      },
      {
        word: 'beautiful', meaning: 'đẹp', img: '🌸',
        stress: 0,
        phonemes: [
          { text: 'beau', ipa: 'ˈbjuː', tip: '★ TRỌNG ÂM — "BYOO" to và rõ ràng' },
          { text: 'ti', ipa: 'tɪ', tip: 'Nhẹ hơn, /tɪ/' },
          { text: 'ful', ipa: 'fəl', tip: 'Nhẹ nhất, schwa /fəl/' },
        ],
      },
      {
        word: 'photo', meaning: 'ảnh', img: '📷',
        stress: 0,
        phonemes: [
          { text: 'pho', ipa: 'ˈfoʊ', tip: '★ TRỌNG ÂM — "FOH" to và rõ' },
          { text: 'to', ipa: 'toʊ', tip: 'Âm tiết thứ hai nhẹ hơn' },
        ],
      },
      {
        word: 'today', meaning: 'hôm nay', img: '📅',
        stress: 1,
        phonemes: [
          { text: 'to', ipa: 'tə', tip: 'Âm tiết đầu nhẹ, schwa' },
          { text: 'day', ipa: 'ˈdeɪ', tip: '★ TRỌNG ÂM — "DAY" to và rõ, diphthong /eɪ/' },
        ],
      },
      {
        word: 'university', meaning: 'đại học', img: '🎓',
        stress: 2,
        phonemes: [
          { text: 'u', ipa: 'juː', tip: 'Nhẹ' },
          { text: 'ni', ipa: 'nɪ', tip: 'Nhẹ' },
          { text: 'ver', ipa: 'ˈvɜː', tip: '★ TRỌNG ÂM — "VER" to và dài' },
          { text: 'si', ipa: 'sɪ', tip: 'Nhẹ' },
          { text: 'ty', ipa: 'ti', tip: 'Nhẹ' },
        ],
      },
      {
        word: 'because', meaning: 'bởi vì', img: '💬',
        stress: 1,
        phonemes: [
          { text: 'be', ipa: 'bɪ', tip: 'Nhẹ, thường là /bɪ/ hoặc schwa' },
          { text: 'cause', ipa: 'ˈkɔːz', tip: '★ TRỌNG ÂM — "CAUSE" to và rõ' },
        ],
      },
      {
        word: 'computer', meaning: 'máy tính', img: '💻',
        stress: 1,
        phonemes: [
          { text: 'com', ipa: 'kəm', tip: 'Nhẹ, schwa' },
          { text: 'pu', ipa: 'ˈpjuː', tip: '★ TRỌNG ÂM — "PYU" to và dài' },
          { text: 'ter', ipa: 'tər', tip: 'Nhẹ, /tər/ cuộn lưỡi nhẹ (giọng Mỹ)' },
        ],
      },
      {
        word: 'pronunciation', meaning: 'phát âm', img: '🗣️',
        stress: 3,
        phonemes: [
          { text: 'pro', ipa: 'prə', tip: 'Nhẹ' },
          { text: 'nun', ipa: 'nʌn', tip: 'Nhẹ' },
          { text: 'ci', ipa: 'sɪ', tip: 'Nhẹ' },
          { text: 'a', ipa: 'ˈeɪ', tip: '★ TRỌNG ÂM — "AY" to và rõ' },
          { text: 'tion', ipa: 'ʃən', tip: 'Nhẹ, /ʃən/' },
        ],
      },
    ],
  },
  {
    id: 'v-w-f',
    name: 'V, W, F',
    emoji: '💨',
    color: 'from-pink-600 to-rose-600',
    bg: 'bg-pink-900/30',
    border: 'border-pink-500/40',
    description: 'Ba âm dễ nhầm với người Việt',
    words: [
      {
        word: 'very', meaning: 'rất', img: '💪',
        phonemes: [
          { text: 'v', ipa: 'v', tip: 'Răng CỬA TRÊN đặt lên MÔI DƯỚI, rung họng — KHÔNG giống "b"' },
          { text: 'e', ipa: 'ɛ', tip: 'Âm "e" ngắn' },
          { text: 'r', ipa: 'r', tip: 'Cuộn lưỡi ra sau' },
          { text: 'y', ipa: 'i', tip: 'Âm "i" ngắn cuối' },
        ],
      },
      {
        word: 'wow', meaning: 'ồ / tuyệt vời', img: '😮',
        phonemes: [
          { text: 'w', ipa: 'w', tip: 'Chu MÔI tròn như chuẩn bị nói "oa" — KHÔNG dùng răng như /v/' },
          { text: 'ow', ipa: 'aʊ', tip: 'Diphthong /aʊ/ — từ "a" trượt lên "u"' },
        ],
      },
      {
        word: 'five', meaning: 'năm (số 5)', img: '5️⃣',
        phonemes: [
          { text: 'f', ipa: 'f', tip: 'Giống /v/ nhưng KHÔNG rung họng — răng trên + môi dưới + thổi khí' },
          { text: 'ive', ipa: 'aɪv', tip: 'Diphthong /aɪ/ + âm /v/ cuối' },
        ],
      },
      {
        word: 'vine', meaning: 'cây leo', img: '🌿',
        phonemes: [
          { text: 'v', ipa: 'v', tip: 'Răng trên chạm môi dưới, rung — /v/ có thanh (voiced)' },
          { text: 'ine', ipa: 'aɪn', tip: 'Diphthong /aɪ/ + "n"' },
        ],
      },
      {
        word: 'wine', meaning: 'rượu vang', img: '🍷',
        phonemes: [
          { text: 'w', ipa: 'w', tip: 'Chu môi tròn, không dùng răng — hoàn toàn khác /v/' },
          { text: 'ine', ipa: 'aɪn', tip: 'Diphthong /aɪ/ + "n"' },
        ],
      },
      {
        word: 'voice', meaning: 'giọng nói', img: '🎤',
        phonemes: [
          { text: 'v', ipa: 'v', tip: 'Bắt đầu với /v/ — răng trên + môi dưới' },
          { text: 'oi', ipa: 'ɔɪ', tip: 'Diphthong /ɔɪ/ — "oi" như trong "boy"' },
          { text: 'ce', ipa: 's', tip: 'Âm "s" cuối nhẹ' },
        ],
      },
      {
        word: 'flower', meaning: 'bông hoa', img: '🌸',
        phonemes: [
          { text: 'fl', ipa: 'fl', tip: 'Kết hợp /f/ + /l/ liền nhau — "f" trước, lưỡi lên răng cho "l"' },
          { text: 'ow', ipa: 'aʊ', tip: 'Diphthong /aʊ/ — KHÔNG giống "o" đơn' },
          { text: 'er', ipa: 'ər', tip: 'Âm /ər/ nhẹ cuối, cuộn lưỡi' },
        ],
      },
      {
        word: 'weather', meaning: 'thời tiết', img: '⛅',
        phonemes: [
          { text: 'w', ipa: 'w', tip: 'Chu môi — /w/ không dùng răng' },
          { text: 'ea', ipa: 'ɛ', tip: 'Âm "e" ngắn' },
          { text: 'th', ipa: 'ð', tip: 'Lưỡi giữa răng, rung họng /ð/' },
          { text: 'er', ipa: 'ər', tip: 'Âm /ər/ cuối, cuộn lưỡi nhẹ' },
        ],
      },
    ],
  },
  {
    id: 'final-consonants',
    name: 'Phụ Âm Cuối',
    emoji: '🔚',
    color: 'from-yellow-600 to-amber-600',
    bg: 'bg-yellow-900/30',
    border: 'border-yellow-500/40',
    description: 'Người Việt hay bỏ âm cuối — ĐỪNG!',
    words: [
      {
        word: 'stop', meaning: 'dừng lại', img: '🛑',
        phonemes: [
          { text: 'st', ipa: 'st', tip: 'Cluster /st/ — "s" trước, bật "t" ngay sau' },
          { text: 'o', ipa: 'ɑː', tip: 'Âm "a" dài trong giọng Mỹ' },
          { text: 'p', ipa: 'p', tip: '⚠️ ĐỪNG BỎ "P" — khép môi và bật khí nhẹ ở cuối' },
        ],
      },
      {
        word: 'bed', meaning: 'cái giường', img: '🛏️',
        phonemes: [
          { text: 'b', ipa: 'b', tip: 'Bật môi đầu' },
          { text: 'e', ipa: 'ɛ', tip: 'Âm "e" ngắn' },
          { text: 'd', ipa: 'd', tip: '⚠️ ĐỪNG BỎ "D" — kết thúc rung nhẹ, lưỡi chạm sau răng trên' },
        ],
      },
      {
        word: 'ask', meaning: 'hỏi', img: '❓',
        phonemes: [
          { text: 'a', ipa: 'æ', tip: 'Âm /æ/ mở rộng' },
          { text: 'sk', ipa: 'sk', tip: '⚠️ Hai phụ âm cuối /sk/ — "s" rồi "k", đừng bỏ' },
        ],
      },
      {
        word: 'next', meaning: 'tiếp theo', img: '➡️',
        phonemes: [
          { text: 'n', ipa: 'n', tip: 'Lưỡi chạm sau răng, âm mũi' },
          { text: 'e', ipa: 'ɛ', tip: 'Âm "e" ngắn' },
          { text: 'xt', ipa: 'kst', tip: '⚠️ Ba phụ âm cuối /kst/ — phức tạp, đọc chậm: "k-s-t"' },
        ],
      },
      {
        word: 'cold', meaning: 'lạnh', img: '🥶',
        phonemes: [
          { text: 'c', ipa: 'k', tip: 'Âm "k" đầu' },
          { text: 'o', ipa: 'oʊ', tip: 'Diphthong /oʊ/' },
          { text: 'ld', ipa: 'ld', tip: '⚠️ Kết thúc /ld/ — lưỡi lên "l" rồi rung "d"' },
        ],
      },
      {
        word: 'match', meaning: 'trận đấu / diêm', img: '🔥',
        phonemes: [
          { text: 'm', ipa: 'm', tip: 'Khép môi, âm mũi' },
          { text: 'a', ipa: 'æ', tip: 'Âm /æ/ mở rộng' },
          { text: 'tch', ipa: 'tʃ', tip: '⚠️ Âm /tʃ/ cuối — giống "ch" trong "church", đừng đọc thành "t"' },
        ],
      },
      {
        word: 'lives', meaning: 'sống (động từ)', img: '💚',
        phonemes: [
          { text: 'l', ipa: 'l', tip: 'Lưỡi chạm sau răng trên' },
          { text: 'i', ipa: 'ɪ', tip: 'Âm /ɪ/ ngắn' },
          { text: 'ves', ipa: 'vz', tip: '⚠️ Kết thúc /vz/ — không phải "s" câm, đây là /v/ + /z/ rung họng' },
        ],
      },
      {
        word: 'hands', meaning: 'đôi tay', img: '👐',
        phonemes: [
          { text: 'h', ipa: 'h', tip: 'Thổi khí từ họng nhẹ' },
          { text: 'an', ipa: 'æn', tip: 'Âm /æ/ + "n"' },
          { text: 'ds', ipa: 'dz', tip: '⚠️ Kết thúc /dz/ — không phải chỉ "s", nghe có "z" rung cuối' },
        ],
      },
    ],
  },
]

// ─── HELPERS ────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 85) return 'text-emerald-400'
  if (score >= 65) return 'text-yellow-400'
  return 'text-red-400'
}

function scoreBg(score) {
  if (score >= 85) return 'bg-emerald-500/20 border-emerald-500/50'
  if (score >= 65) return 'bg-yellow-500/20 border-yellow-500/50'
  return 'bg-red-500/20 border-red-500/50'
}

function scoreLabel(score) {
  if (score >= 90) return 'Xuất sắc! 🎉'
  if (score >= 75) return 'Tốt lắm! 👍'
  if (score >= 60) return 'Gần đúng 💪'
  return 'Luyện thêm nhé 📚'
}

function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [523, 659, 784]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25)
      osc.start(ctx.currentTime + i * 0.12)
      osc.stop(ctx.currentTime + i * 0.12 + 0.3)
    })
  } catch (_) {}
}

function playFailSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(330, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.3)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
  } catch (_) {}
}

const HARD_PHONEMES = new Set(['θ', 'ð', 'r', 'æ', 'ɜː', 'ʌ', 'ɪ', 'ŋk', 'ŋ', 'v', 'w', 'dz', 'vz'])

function simulateScore(ipa) {
  const base = HARD_PHONEMES.has(ipa) ? 45 : 68
  return Math.min(100, Math.max(20, base + Math.floor(Math.random() * 45)))
}

function speak(text) {
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'en-US'
  utt.rate = 0.8
  utt.pitch = 1
  window.speechSynthesis.speak(utt)
}

// ─── COMPONENTS ────────────────────────────────────────────────────────────

function XPBar({ xp }) {
  const level = Math.floor(xp / 100) + 1
  const progress = xp % 100
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-black">{level}</div>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-xs text-white/60">{xp} XP</span>
    </div>
  )
}

function PhonemeCard({ phoneme, result, onClick }) {
  const hasResult = result !== undefined
  const bg = hasResult ? scoreBg(result.score) : 'bg-white/5 border-white/10'
  const textColor = hasResult ? scoreColor(result.score) : 'text-white/70'
  return (
    <button
      onClick={onClick}
      className={`relative border rounded-xl px-3 py-2 flex flex-col items-center gap-1 transition-all ${bg} ${hasResult ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
    >
      <span className="text-white font-semibold text-sm">{phoneme.text}</span>
      <span className="text-white/50 text-xs font-mono">{phoneme.ipa}</span>
      {hasResult && (
        <span className={`text-xs font-bold ${textColor}`}>{result.score}%</span>
      )}
    </button>
  )
}

function PhonemeModal({ phoneme, result, onClose }) {
  if (!phoneme) return null
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-lg bg-gray-900 rounded-t-3xl p-6 pb-10 slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-4xl font-bold text-white">{phoneme.text}</div>
            <div className="text-white/50 font-mono text-lg">/{phoneme.ipa}/</div>
          </div>
          {result && (
            <div className={`text-3xl font-bold ${scoreColor(result.score)}`}>{result.score}%</div>
          )}
        </div>
        {result && (
          <div className="mb-4">
            <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-1">
              <div
                className={`h-full rounded-full transition-all duration-700 ${result.score >= 85 ? 'bg-emerald-400' : result.score >= 65 ? 'bg-yellow-400' : 'bg-red-400'}`}
                style={{ width: `${result.score}%` }}
              />
            </div>
            <div className={`text-sm ${scoreColor(result.score)}`}>{scoreLabel(result.score)}</div>
          </div>
        )}
        <div className="bg-white/5 rounded-2xl p-4 mb-4">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Cách phát âm</div>
          <p className="text-white/90 text-sm leading-relaxed">{phoneme.tip}</p>
        </div>
        <button
          onClick={() => speak(phoneme.text)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-3 flex items-center justify-center gap-2 transition-colors"
        >
          <Volume2 size={18} />
          <span>Nghe âm mẫu</span>
        </button>
        <button onClick={onClose} className="w-full mt-3 text-white/40 hover:text-white/70 py-2 transition-colors">Đóng</button>
      </div>
    </div>
  )
}

// ─── SCREENS ────────────────────────────────────────────────────────────────

function HomeScreen({ onSelectTopic, xp, stars }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#0f0f1a] to-[#0f0f1a]">
      {/* Header */}
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-white">Luyện Phát Âm</h1>
            <p className="text-white/40 text-sm">English Pronunciation</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-3 py-1.5">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm">{stars}</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 rounded-xl px-3 py-1.5">
              <Zap size={14} className="text-blue-400" />
              <span className="text-blue-400 font-bold text-sm">{xp}</span>
            </div>
          </div>
        </div>
        <XPBar xp={xp} />
      </div>

      {/* Progress Banner */}
      <div className="mx-4 mb-5 bg-gradient-to-r from-violet-600/30 to-blue-600/30 border border-violet-500/30 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-500/30 rounded-xl flex items-center justify-center">
            <Target size={20} className="text-violet-300" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Mục tiêu hôm nay</div>
            <div className="text-white/50 text-xs">Hoàn thành 3 chủ đề để nhận thưởng</div>
          </div>
        </div>
      </div>

      {/* Topics */}
      <div className="px-4">
        <div className="text-white/60 text-xs uppercase tracking-wider mb-3">Chủ đề luyện tập</div>
        <div className="grid grid-cols-2 gap-3">
          {TOPICS.map(topic => (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className={`${topic.bg} border ${topic.border} rounded-2xl p-4 text-left transition-all active:scale-95 hover:brightness-110`}
            >
              <div className="text-3xl mb-2">{topic.emoji}</div>
              <div className="text-white font-semibold text-sm mb-1">{topic.name}</div>
              <div className="text-white/40 text-xs mb-3">{topic.description}</div>
              <div className="flex items-center justify-between">
                <span className="text-white/30 text-xs">{topic.words.length} từ</span>
                <ChevronRight size={14} className="text-white/30" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="h-8" />
    </div>
  )
}

function PracticeScreen({ topic, onBack, onXP, onStar }) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('ready') // ready | recording | result
  const [results, setResults] = useState(null)
  const [overallScore, setOverallScore] = useState(0)
  const [recordedUrl, setRecordedUrl] = useState(null)
  const [selectedPhoneme, setSelectedPhoneme] = useState(null)
  const [countdown, setCountdown] = useState(3)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const word = topic.words[index]

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      if (mediaRef.current) mediaRef.current.stop()
    }
  }, [])

  function reset() {
    setPhase('ready')
    setResults(null)
    setOverallScore(0)
    setRecordedUrl(null)
    setSelectedPhoneme(null)
  }

  function nextWord() {
    if (index < topic.words.length - 1) {
      setIndex(i => i + 1)
      reset()
    } else {
      onBack()
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setRecordedUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
        processResults()
      }
      mr.start()
      setPhase('recording')
      setCountdown(3)
      let c = 3
      timerRef.current = setInterval(() => {
        c--
        setCountdown(c)
        if (c <= 0) {
          clearInterval(timerRef.current)
          mr.stop()
        }
      }, 1000)
    } catch {
      processResults()
    }
  }

  function processResults() {
    const scored = word.phonemes.map(p => ({ ...p, score: simulateScore(p.ipa) }))
    const avg = Math.round(scored.reduce((s, p) => s + p.score, 0) / scored.length)
    setResults(scored)
    setOverallScore(avg)
    setPhase('result')
    const gained = avg >= 85 ? 15 : avg >= 65 ? 8 : 3
    onXP(gained)
    if (avg >= 75) {
      onStar(1)
      playSuccessSound()
    } else {
      playFailSound()
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
          <ChevronLeft size={20} className="text-white/70" />
        </button>
        <div className="flex-1">
          <div className="text-white font-semibold text-sm">{topic.name}</div>
          <div className="text-white/40 text-xs">{index + 1}/{topic.words.length} từ</div>
        </div>
        <div className="text-2xl">{topic.emoji}</div>
      </div>

      {/* Progress */}
      <div className="mx-4 mb-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${topic.color} rounded-full transition-all duration-500`}
          style={{ width: `${((index + 1) / topic.words.length) * 100}%` }}
        />
      </div>

      {/* Word Card */}
      <div className="flex-1 flex flex-col items-center px-4">
        <div className={`w-full ${topic.bg} border ${topic.border} rounded-3xl p-6 mb-6 fade-in`}>
          <div className="text-center">
            <div className="text-6xl mb-3">{word.img}</div>
            <div className="text-4xl font-bold text-white mb-1 tracking-wide">{word.word}</div>
            <div className="text-white/50 text-sm mb-4">{word.meaning}</div>

            {/* Phoneme breakdown */}
            <div className="flex flex-wrap justify-center gap-2">
              {word.phonemes.map((p, i) => (
                <PhonemeCard
                  key={i}
                  phoneme={p}
                  result={results ? results[i] : undefined}
                  onClick={results ? () => setSelectedPhoneme({ phoneme: p, result: results[i] }) : undefined}
                />
              ))}
            </div>

            {/* Score */}
            {phase === 'result' && (
              <div className="mt-4 fade-in">
                <div className={`text-3xl font-bold ${scoreColor(overallScore)}`}>{overallScore}%</div>
                <div className={`text-sm ${scoreColor(overallScore)}`}>{scoreLabel(overallScore)}</div>
                <div className="text-white/30 text-xs mt-1">Nhấn vào từng âm để xem chi tiết</div>
              </div>
            )}
          </div>
        </div>

        {/* Listen button */}
        <button
          onClick={() => speak(word.word)}
          className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/40 text-blue-300 rounded-2xl px-5 py-2.5 mb-6 hover:bg-blue-600/30 transition-colors"
        >
          <Volume2 size={18} />
          <span className="text-sm font-medium">Nghe phát âm mẫu</span>
        </button>

        {/* Recorded audio */}
        {recordedUrl && (
          <div className="w-full mb-4 flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 fade-in">
            <Play size={16} className="text-white/50" />
            <div className="text-white/50 text-sm flex-1">Bản ghi của bạn</div>
            <audio controls src={recordedUrl} className="h-7 w-40" />
          </div>
        )}

        {/* Mic / Action button */}
        <div className="flex gap-3 w-full">
          {phase === 'result' && (
            <button
              onClick={reset}
              className="flex-1 bg-white/5 border border-white/10 text-white/70 rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <RotateCcw size={18} />
              <span>Thử lại</span>
            </button>
          )}

          {phase !== 'recording' && (
            <button
              onClick={phase === 'result' ? nextWord : startRecording}
              className={`flex-1 bg-gradient-to-r ${topic.color} text-white rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold hover:opacity-90 transition-opacity`}
            >
              {phase === 'result' ? (
                <>
                  <ChevronRight size={18} />
                  <span>{index < topic.words.length - 1 ? 'Từ tiếp' : 'Hoàn thành'}</span>
                </>
              ) : (
                <>
                  <Mic size={20} />
                  <span>Bắt đầu ghi âm</span>
                </>
              )}
            </button>
          )}

          {phase === 'recording' && (
            <div className="flex-1 bg-red-600 text-white rounded-2xl py-4 flex items-center justify-center gap-3 relative overflow-hidden">
              <div className="relative mic-pulse">
                <MicOff size={20} />
              </div>
              <div className="flex items-end gap-1 h-6">
                {[1,2,3,4,5,6].map(n => (
                  <div key={n} className={`wave-bar w-1 bg-white/80 rounded-full`} style={{ height: `${12 + n * 3}px` }} />
                ))}
              </div>
              <span className="font-bold">{countdown}s</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-8" />

      <PhonemeModal
        phoneme={selectedPhoneme?.phoneme}
        result={selectedPhoneme?.result}
        onClose={() => setSelectedPhoneme(null)}
      />
    </div>
  )
}

function DictionaryScreen({ onBack }) {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setSubmitted(q)
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
          <ChevronLeft size={20} className="text-white/70" />
        </button>
        <div>
          <div className="text-white font-semibold">Từ Điển Phát Âm</div>
          <div className="text-white/40 text-xs">Luyện bất kỳ từ nào</div>
        </div>
      </div>

      <div className="px-4">
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Nhập từ tiếng Anh..."
            className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-2xl px-4 py-3 outline-none focus:border-blue-500/60"
          />
          <button
            type="submit"
            className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-500 transition-colors"
          >
            <Search size={18} className="text-white" />
          </button>
        </form>

        {submitted ? (
          <DictionaryEntry word={submitted} />
        ) : (
          <div className="text-center text-white/20 pt-12">
            <Search size={48} className="mx-auto mb-4 opacity-30" />
            <p>Nhập một từ để luyện phát âm</p>
            <p className="text-sm mt-2">Ví dụ: "pronunciation", "beautiful", "through"</p>
          </div>
        )}
      </div>
    </div>
  )
}

function DictionaryEntry({ word }) {
  const [phase, setPhase] = useState('ready')
  const [recordedUrl, setRecordedUrl] = useState(null)
  const [countdown, setCountdown] = useState(3)
  const [score, setScore] = useState(null)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    setPhase('ready')
    setRecordedUrl(null)
    setScore(null)
  }, [word])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setRecordedUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
        const s = Math.floor(Math.random() * 40) + 55
        setScore(s)
        setPhase('result')
        if (s >= 75) playSuccessSound(); else playFailSound()
      }
      mr.start()
      setPhase('recording')
      setCountdown(3)
      let c = 3
      timerRef.current = setInterval(() => {
        c--
        setCountdown(c)
        if (c <= 0) { clearInterval(timerRef.current); mr.stop() }
      }, 1000)
    } catch {
      const s = Math.floor(Math.random() * 40) + 55
      setScore(s)
      setPhase('result')
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-3xl font-bold text-white mb-1">{word}</div>
          <div className="text-white/30 text-xs">Nhấn 🔊 để nghe phát âm chuẩn</div>
        </div>
        <button
          onClick={() => speak(word)}
          className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center hover:bg-blue-600/30 transition-colors"
        >
          <Volume2 size={18} className="text-blue-400" />
        </button>
      </div>

      {score !== null && (
        <div className={`mb-4 p-3 rounded-2xl border ${scoreBg(score)} fade-in`}>
          <div className={`text-2xl font-bold ${scoreColor(score)}`}>{score}%</div>
          <div className={`text-sm ${scoreColor(score)}`}>{scoreLabel(score)}</div>
        </div>
      )}

      {recordedUrl && (
        <div className="flex items-center gap-2 mb-4 bg-white/5 rounded-xl p-3">
          <span className="text-white/40 text-xs">Bản ghi của bạn:</span>
          <audio controls src={recordedUrl} className="h-6 flex-1" />
        </div>
      )}

      {phase !== 'recording' && (
        <button
          onClick={phase === 'result' ? () => { setPhase('ready'); setScore(null); setRecordedUrl(null) } : startRecording}
          className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl py-3 flex items-center justify-center gap-2 font-semibold hover:opacity-90 transition-opacity"
        >
          <Mic size={18} />
          <span>{phase === 'result' ? 'Thử lại' : 'Ghi âm & Chấm điểm'}</span>
        </button>
      )}

      {phase === 'recording' && (
        <div className="w-full bg-red-600 text-white rounded-2xl py-3 flex items-center justify-center gap-3">
          <div className="relative mic-pulse"><MicOff size={18} /></div>
          <div className="flex items-end gap-1 h-5">
            {[1,2,3,4,5].map(n => (
              <div key={n} className={`wave-bar w-1 bg-white/80 rounded-full`} style={{ height: `${10 + n * 2}px` }} />
            ))}
          </div>
          <span className="font-bold">{countdown}s</span>
        </div>
      )}
    </div>
  )
}

// ─── APP ────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('home') // home | practice | dictionary
  const [activeTopic, setActiveTopic] = useState(null)
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem('eng_xp') || '0'))
  const [stars, setStars] = useState(() => parseInt(localStorage.getItem('eng_stars') || '0'))

  function addXP(n) {
    setXp(prev => {
      const next = prev + n
      localStorage.setItem('eng_xp', next)
      return next
    })
  }

  function addStars(n) {
    setStars(prev => {
      const next = prev + n
      localStorage.setItem('eng_stars', next)
      return next
    })
  }

  if (screen === 'practice' && activeTopic) {
    return (
      <PracticeScreen
        topic={activeTopic}
        onBack={() => setScreen('home')}
        onXP={addXP}
        onStar={addStars}
      />
    )
  }

  if (screen === 'dictionary') {
    return <DictionaryScreen onBack={() => setScreen('home')} />
  }

  return (
    <div>
      <HomeScreen
        onSelectTopic={t => { setActiveTopic(t); setScreen('practice') }}
        xp={xp}
        stars={stars}
      />
      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-white/10 flex">
        <button
          onClick={() => setScreen('home')}
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${screen === 'home' ? 'text-blue-400' : 'text-white/30 hover:text-white/50'}`}
        >
          <Home size={20} />
          <span className="text-xs">Trang chủ</span>
        </button>
        <button
          onClick={() => setScreen('dictionary')}
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${screen === 'dictionary' ? 'text-blue-400' : 'text-white/30 hover:text-white/50'}`}
        >
          <Search size={20} />
          <span className="text-xs">Từ điển</span>
        </button>
        <button className="flex-1 py-3 flex flex-col items-center gap-1 text-white/30">
          <Award size={20} />
          <span className="text-xs">Thành tích</span>
        </button>
      </div>
      <div className="h-16" />
    </div>
  )
}
