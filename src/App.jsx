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

// Pre-load voices (Chrome mobile requires this)
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
    utt.lang = 'en-US'
    utt.rate = 0.8
    utt.pitch = 1
    const voices = syn.getVoices()
    const pick = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'))
      || voices.find(v => v.lang === 'en-US')
      || voices.find(v => v.lang.startsWith('en'))
    if (pick) utt.voice = pick
    syn.speak(utt)
  }

  const voices = syn.getVoices()
  if (voices.length > 0) {
    doSpeak()
  } else {
    // Voices not loaded yet — wait for them
    syn.onvoiceschanged = () => { syn.onvoiceschanged = null; doSpeak() }
    // Fallback timeout in case onvoiceschanged never fires
    setTimeout(() => { if (syn.getVoices().length > 0) doSpeak() }, 300)
  }
}

function getSupportedMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
  ]
  return candidates.find(t => MediaRecorder.isTypeSupported(t)) || ''
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
  'ʊər':{ tip: 'Diphthong: /ʊ/ + /ər/ — "tour, sure"', hard: false },
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

// word → [[text_chunk, ipa_symbol], ...]  (tips looked up from PHONEME_INFO)
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
  child:[['ch','tʃ'],['i','aɪ'],['ld','ld']],
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
  future:[['fu','fjuː'],['ture','tʃər']],
  get:[['g','g'],['e','ɛ'],['t','t']],
  girl:[['g','g'],['ir','ɜː'],['l','l']],
  give:[['g','g'],['ive','ɪv']],
  good:[['g','g'],['oo','ʊ'],['d','d']],
  great:[['gr','gr'],['ea','eɪ'],['t','t']],
  hand:[['h','h'],['a','æ'],['nd','nd']],
  happy:[['hap','hæp'],['py','pi']],
  hard:[['h','h'],['ar','ɑːr'],['d','d']],
  have:[['h','h'],['a','æ'],['ve','v']],
  hello:[['hel','hɛl'],['lo','oʊ']],
  help:[['h','h'],['e','ɛ'],['lp','lp']],
  here:[['h','h'],['ere','ɪər']],
  high:[['h','h'],['igh','aɪ']],
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
  learn:[['l','l'],['ear','ɜː'],['n','n']],
  led:[['l','l'],['e','ɛ'],['d','d']],
  life:[['l','l'],['i','aɪ'],['fe','f']],
  light:[['l','l'],['igh','aɪ'],['t','t']],
  like:[['l','l'],['i','aɪ'],['ke','k']],
  little:[['lit','lɪt'],['tle','əl']],
  live:[['l','l'],['i','ɪ'],['ve','v']],
  load:[['l','l'],['oa','oʊ'],['d','d']],
  long:[['l','l'],['o','ɔː'],['ng','ŋ']],
  look:[['l','l'],['oo','ʊ'],['k','k']],
  love:[['l','l'],['ove','ʌv']],
  make:[['m','m'],['a','eɪ'],['ke','k']],
  man:[['m','m'],['a','æ'],['n','n']],
  match:[['m','m'],['a','æ'],['tch','tʃ']],
  measure:[['mea','mɛ'],['sure','ʒər']],
  mother:[['m','m'],['o','ʌ'],['th','ð'],['er','ər']],
  much:[['m','m'],['u','ʌ'],['ch','tʃ']],
  music:[['mu','mjuː'],['sic','zɪk']],
  name:[['n','n'],['a','eɪ'],['me','m']],
  nature:[['na','neɪ'],['ture','tʃər']],
  need:[['n','n'],['ee','iː'],['d','d']],
  next:[['n','n'],['e','ɛ'],['xt','kst']],
  night:[['n','n'],['igh','aɪ'],['t','t']],
  nothing:[['no','nʌ'],['th','θ'],['ing','ɪŋ']],
  now:[['n','n'],['ow','aʊ']],
  often:[['of','ɔː'],['ten','tən']],
  old:[['o','oʊ'],['ld','ld']],
  only:[['on','oʊn'],['ly','li']],
  other:[['o','ʌ'],['th','ð'],['er','ər']],
  out:[['ou','aʊ'],['t','t']],
  people:[['peo','piː'],['ple','pəl']],
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
  road:[['r','r'],['oa','oʊ'],['d','d']],
  run:[['r','r'],['u','ʌ'],['n','n']],
  same:[['s','s'],['a','eɪ'],['me','m']],
  say:[['s','s'],['ay','eɪ']],
  school:[['sch','sk'],['ool','uːl']],
  she:[['sh','ʃ'],['e','iː']],
  should:[['sh','ʃ'],['oul','ʊ'],['d','d']],
  sister:[['sis','sɪs'],['ter','tər']],
  sound:[['s','s'],['ou','aʊ'],['nd','nd']],
  speak:[['sp','sp'],['ea','iː'],['k','k']],
  start:[['st','st'],['ar','ɑːr'],['t','t']],
  stop:[['st','st'],['o','ɑː'],['p','p']],
  study:[['stu','stʌ'],['dy','di']],
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
  turn:[['t','t'],['ur','ɜː'],['n','n']],
  under:[['un','ʌn'],['der','dər']],
  university:[['u','juː'],['ni','nɪ'],['ver','vɜː'],['si','sɪ'],['ty','ti']],
  very:[['v','v'],['er','ɛr'],['y','i']],
  vine:[['v','v'],['i','aɪ'],['ne','n']],
  voice:[['v','v'],['oi','ɔɪ'],['ce','s']],
  want:[['w','w'],['an','ɑːn'],['t','t']],
  water:[['wa','wɔː'],['ter','tər']],
  weather:[['w','w'],['ea','ɛ'],['th','ð'],['er','ər']],
  well:[['w','w'],['e','ɛ'],['ll','l']],
  what:[['wh','w'],['a','ɑː'],['t','t']],
  when:[['wh','w'],['en','ɛn']],
  where:[['wh','w'],['ere','ɛər']],
  which:[['wh','w'],['ich','ɪtʃ']],
  who:[['wh','h'],['o','uː']],
  why:[['wh','w'],['y','aɪ']],
  will:[['w','w'],['i','ɪ'],['ll','l']],
  wine:[['w','w'],['i','aɪ'],['ne','n']],
  with:[['w','w'],['i','ɪ'],['th','θ']],
  without:[['with','wɪð'],['out','aʊt']],
  word:[['w','w'],['or','ɜː'],['d','d']],
  world:[['w','w'],['or','ɜː'],['l','l'],['d','d']],
  wow:[['w','w'],['ow','aʊ']],
  write:[['wr','r'],['i','aɪ'],['te','t']],
  year:[['y','j'],['ear','ɪər']],
  you:[['y','j'],['ou','uː']],
  your:[['y','j'],['our','ɔːr']],
}

function lookupWord(word) {
  const w = word.toLowerCase().trim().replace(/[^a-z]/g, '')
  const raw = WORD_IPA_RAW[w]
  if (raw) {
    return raw.map(([text, ipa]) => ({
      text,
      ipa,
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

    // Trigraphs
    if (!found) try2('tch', 'tʃ')
    if (!found) try2('dge', 'dʒ')
    if (!found) try2('igh', 'aɪ')
    if (!found) try2('ght', 't')
    if (!found && rest.startsWith('tion')) { out.push({ text: 'tion', ipa: 'ʃən' }); i += 4; found = true }
    if (!found && rest.startsWith('sion')) { out.push({ text: 'sion', ipa: 'ʒən' }); i += 4; found = true }
    if (!found && rest.startsWith('ture')) { out.push({ text: 'ture', ipa: 'tʃər' }); i += 4; found = true }
    // Digraphs
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
    // Vowel digraphs
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
    .map(p => ({
      ...p,
      tip: PHONEME_INFO[p.ipa]?.tip || `Âm /${p.ipa}/`,
      isHard: PHONEME_INFO[p.ipa]?.hard || false,
    }))
}

// Levenshtein alignment: returns, for each position in src, the matched dst element (or null)
function levenshteinAlign(src, dst) {
  const m = src.length, n = dst.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      const cost = src[i - 1] === dst[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost)
    }
  const align = new Array(m).fill(null)
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i-1][j-1] + (src[i-1] === dst[j-1] ? 0 : 1)) {
      align[i - 1] = dst[j - 1]; i--; j--
    } else if (j > 0 && dp[i][j] === dp[i][j-1] + 1) {
      j--
    } else {
      i--
    }
  }
  return align
}

const PHONE_SIMILAR = {
  'θ': ['s','f','t','d'], 'ð': ['d','z','v','ð'],
  'r': ['l','w','ər'],    'l': ['r','n'],
  'æ': ['ɛ','ʌ','ɑː'],   'ɪ': ['iː','ɛ'],
  'ʌ': ['æ','ɑː','ə'],   'v': ['b','f','w'],
  'w': ['v','b'],         'ʒ': ['ʃ','z'],
  'ɜː':['ər','ɔː'],       'ʊ': ['uː','ʌ'],
}
function phoneSimilarity(a, b) {
  if (a === b) return 1
  if (PHONE_SIMILAR[a]?.includes(b) || PHONE_SIMILAR[b]?.includes(a)) return 0.25
  return 0.05
}

function diagnoseFromSpeech(targetWord, spokenText, targetPhonemes) {
  const target = targetWord.toLowerCase().trim()
  const spoken = (spokenText || '').toLowerCase().replace(/[^a-z\s]/g, '').trim()

  if (!spoken) {
    return {
      phonemes: targetPhonemes.map(p => ({ ...p, score: 0, note: 'Không nhận diện được' })),
      overall: 0, spokenWord: null,
    }
  }

  // Check if spoken contains or equals target
  const firstSpokenWord = spoken.split(/\s+/)[0]
  if (firstSpokenWord === target || spoken === target) {
    const ph = targetPhonemes.map(p => ({ ...p, score: 85 + Math.floor(Math.random() * 15), note: null }))
    return { phonemes: ph, overall: Math.round(ph.reduce((s, p) => s + p.score, 0) / ph.length), spokenWord: spoken }
  }

  // Find the closest word in spoken text to target
  const candidates = spoken.split(/\s+/)
  let bestWord = candidates[0]
  let bestDist = Infinity
  for (const cand of candidates) {
    const d = levDist(cand, target)
    if (d < bestDist) { bestDist = d; bestWord = cand }
  }

  const spokenPhonemes = lookupWord(bestWord)
  const targetIPAs = targetPhonemes.map(p => p.ipa)
  const spokenIPAs = spokenPhonemes.map(p => p.ipa)
  const alignment = levenshteinAlign(targetIPAs, spokenIPAs)

  const scored = targetPhonemes.map((p, idx) => {
    const got = alignment[idx]
    if (!got) return { ...p, score: 15, note: `Âm /${p.ipa}/ bị bỏ qua` }
    if (got === p.ipa) return { ...p, score: 85 + Math.floor(Math.random() * 15), note: null }
    const sim = phoneSimilarity(p.ipa, got)
    return {
      ...p, score: Math.round(sim * 80),
      note: `Nghe như /${got}/ — cần /${p.ipa}/`,
      spokenIpa: got,
    }
  })

  const overall = Math.round(scored.reduce((s, p) => s + p.score, 0) / scored.length)
  return { phonemes: scored, overall, spokenWord: bestWord }
}

function levDist(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i || j))
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[m][n]
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
  const [micError, setMicError] = useState(null)
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
    setMicError(null)
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
    setMicError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mimeType = getSupportedMimeType()
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      mediaRef.current = mr
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        setRecordedUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
        processResults()
      }
      mr.start(100) // collect chunks every 100ms
      setPhase('recording')
      setCountdown(3)
      let c = 3
      timerRef.current = setInterval(() => {
        c--
        setCountdown(c)
        if (c <= 0) {
          clearInterval(timerRef.current)
          if (mr.state !== 'inactive') mr.stop()
        }
      }, 1000)
    } catch (err) {
      const denied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
      setMicError(denied ? 'Bạn cần cho phép truy cập microphone' : 'Không thể mở microphone')
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

        {/* Mic error */}
        {micError && (
          <div className="w-full mb-4 bg-red-500/10 border border-red-500/40 rounded-2xl px-4 py-3 fade-in">
            <p className="text-red-400 text-sm text-center">⚠️ {micError}</p>
          </div>
        )}

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
  const [phase, setPhase] = useState('ready') // ready | listening | result
  const [micError, setMicError] = useState(null)
  const [diagnosis, setDiagnosis] = useState(null)
  const [selectedIdx, setSelectedIdx] = useState(null)
  const recognitionRef = useRef(null)
  const phonemes = lookupWord(word)

  useEffect(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch (_) {}
    }
    setPhase('ready')
    setMicError(null)
    setDiagnosis(null)
    setSelectedIdx(null)
  }, [word])

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setMicError('Trình duyệt không hỗ trợ nhận diện giọng nói. Dùng Chrome hoặc Edge.')
      return
    }
    setMicError(null)
    setDiagnosis(null)
    setSelectedIdx(null)

    const rec = new SR()
    recognitionRef.current = rec
    rec.lang = 'en-US'
    rec.continuous = false
    rec.interimResults = false
    rec.maxAlternatives = 5

    rec.onresult = (e) => {
      // Try all alternatives, pick the one closest to target
      const alts = Array.from(e.results[0]).map(r => r.transcript)
      const target = word.toLowerCase()
      const best = alts.reduce((a, b) => levDist(a.toLowerCase(), target) <= levDist(b.toLowerCase(), target) ? a : b)
      const result = diagnoseFromSpeech(word, best, phonemes)
      setDiagnosis(result)
      setPhase('result')
      if (result.overall >= 75) playSuccessSound(); else playFailSound()
    }

    rec.onerror = (e) => {
      setPhase('ready')
      if (e.error === 'not-allowed') setMicError('Bạn cần cho phép truy cập microphone')
      else if (e.error === 'no-speech') setMicError('Không nghe thấy — hãy nói to hơn và thử lại')
      else if (e.error === 'network') setMicError('Lỗi mạng — cần internet để nhận diện giọng nói')
      else setMicError(`Lỗi: ${e.error}`)
    }

    rec.onend = () => {
      if (phase === 'listening') setPhase('ready')
    }

    try {
      rec.start()
      setPhase('listening')
    } catch (err) {
      setMicError('Không thể bắt đầu nhận diện giọng nói')
    }
  }

  function stopListening() {
    try { recognitionRef.current?.stop() } catch (_) {}
    setPhase('ready')
  }

  const overall = diagnosis?.overall ?? null
  const diagPhonemes = diagnosis?.phonemes ?? phonemes

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 fade-in">
      {/* Word header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-3xl font-bold text-white mb-1">{word}</div>
          {diagnosis?.spokenWord && (
            <div className="text-white/50 text-sm fade-in">
              Đã nghe: <span className="text-blue-300 font-medium">"{diagnosis.spokenWord}"</span>
            </div>
          )}
        </div>
        <button
          onClick={() => speak(word)}
          className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center hover:bg-blue-600/30 transition-colors flex-shrink-0"
        >
          <Volume2 size={18} className="text-blue-400" />
        </button>
      </div>

      {/* Phoneme breakdown */}
      <div className="mb-4">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-2">
          {diagnosis ? 'Phân tích từng âm vị — nhấn để xem chi tiết' : 'Phân tích IPA'}
        </div>
        <div className="flex flex-wrap gap-2">
          {diagPhonemes.map((p, idx) => {
            const score = diagnosis ? p.score : null
            const bg = score !== null ? scoreBg(score) : (p.isHard ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-white/10')
            const textCol = score !== null ? scoreColor(score) : (p.isHard ? 'text-orange-300' : 'text-white/70')
            return (
              <button
                key={idx}
                onClick={() => diagnosis && setSelectedIdx(idx === selectedIdx ? null : idx)}
                className={`border rounded-xl px-3 py-2 flex flex-col items-center gap-1 transition-all ${bg} ${diagnosis ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}
              >
                <span className="text-white font-semibold text-sm">{p.text}</span>
                <span className="text-white/40 font-mono text-xs">/{p.ipa}/</span>
                {score !== null && (
                  <span className={`text-xs font-bold ${textCol}`}>{score}%</span>
                )}
                {p.isHard && !diagnosis && (
                  <span className="text-orange-400 text-xs">★</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Expanded phoneme detail */}
      {selectedIdx !== null && diagPhonemes[selectedIdx] && (
        <div className={`mb-4 rounded-2xl p-4 border fade-in ${scoreBg(diagPhonemes[selectedIdx].score)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold text-lg">/{diagPhonemes[selectedIdx].ipa}/</span>
            <span className={`text-xl font-bold ${scoreColor(diagPhonemes[selectedIdx].score)}`}>
              {diagPhonemes[selectedIdx].score}%
            </span>
          </div>
          {diagPhonemes[selectedIdx].note && (
            <div className="text-red-300 text-sm mb-2 font-medium">⚠️ {diagPhonemes[selectedIdx].note}</div>
          )}
          <p className="text-white/80 text-sm leading-relaxed">{diagPhonemes[selectedIdx].tip}</p>
          <button
            onClick={() => speak(diagPhonemes[selectedIdx].text)}
            className="mt-3 flex items-center gap-1.5 text-blue-400 text-xs hover:text-blue-300 transition-colors"
          >
            <Volume2 size={13} /> Nghe âm /{diagPhonemes[selectedIdx].ipa}/
          </button>
        </div>
      )}

      {/* Overall score */}
      {overall !== null && (
        <div className={`mb-4 p-3 rounded-2xl border flex items-center justify-between ${scoreBg(overall)} fade-in`}>
          <div className={`text-sm font-medium ${scoreColor(overall)}`}>{scoreLabel(overall)}</div>
          <div className={`text-2xl font-bold ${scoreColor(overall)}`}>{overall}%</div>
        </div>
      )}

      {/* Error */}
      {micError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/40 rounded-xl p-3 fade-in">
          <p className="text-red-400 text-sm">⚠️ {micError}</p>
        </div>
      )}

      {/* Action button */}
      {phase === 'listening' ? (
        <button
          onClick={stopListening}
          className="w-full bg-red-600 text-white rounded-2xl py-3 flex items-center justify-center gap-3"
        >
          <div className="relative mic-pulse"><MicOff size={18} /></div>
          <div className="flex items-end gap-1 h-5">
            {[1,2,3,4,5].map(n => (
              <div key={n} className="wave-bar w-1 bg-white/80 rounded-full" style={{ height: `${10 + n * 2}px` }} />
            ))}
          </div>
          <span className="font-semibold">Đang nghe... (nhấn dừng)</span>
        </button>
      ) : (
        <button
          onClick={phase === 'result' ? () => { setDiagnosis(null); setSelectedIdx(null); setPhase('ready') } : startListening}
          className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl py-3 flex items-center justify-center gap-2 font-semibold hover:opacity-90 transition-opacity"
        >
          <Mic size={18} />
          <span>{phase === 'result' ? 'Thử lại' : 'Nói & Phân tích phoneme'}</span>
        </button>
      )}

      {phase === 'ready' && !diagnosis && (
        <p className="text-center text-white/25 text-xs mt-3">
          Dùng Chrome/Edge • Cần internet để nhận diện giọng nói
        </p>
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
