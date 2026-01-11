#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Enhanced translation system for Chinese lessons
"""

import json
import re

# Enhanced translation dictionary for common patterns
TRANSLATION_DICT = {
    # Lesson 31: 제안 표현 (Suggestions)
    "我们走吧": {
        "pinyin": "wǒ men zǒu ba",
        "korean": "우리 갑시다",
        "english": "Let's go",
        "words": {
            "words": ["我们", "走", "吧"],
            "pinyin": ["wǒ men", "zǒu", "ba"],
            "korean": ["우리", "가다", "하자"],
            "traditional": ["我們", "走", "吧"],
            "meaning_and_reading": ["우리 아, 우리 문", "갈 주", "하자 파"]
        }
    },
    "休息一下吧": {
        "pinyin": "xiū xi yī xià ba",
        "korean": "좀 쉽시다",
        "english": "Let's take a rest",
        "words": {
            "words": ["休息", "一下", "吧"],
            "pinyin": ["xiū xi", "yī xià", "ba"],
            "korean": ["휴식", "좀", "하자"],
            "traditional": ["休息", "一下", "吧"],
            "meaning_and_reading": ["쉴 휴, 쉴 식", "하나 일, 아래 하", "하자 파"]
        }
    },
    "吃饭吧": {
        "pinyin": "chī fàn ba",
        "korean": "밥을 먹자",
        "english": "Let's eat",
        "words": {
            "words": ["吃饭", "吧"],
            "pinyin": ["chī fàn", "ba"],
            "korean": ["밥먹다", "하자"],
            "traditional": ["吃飯", "吧"],
            "meaning_and_reading": ["먹을 흘, 밥 반", "하자 파"]
        }
    },
    "别担心吧": {
        "pinyin": "bié dān xīn ba",
        "korean": "걱정하지 말아요",
        "english": "Don't worry",
        "words": {
            "words": ["别", "担心", "吧"],
            "pinyin": ["bié", "dān xīn", "ba"],
            "korean": ["말다", "걱정", "하자"],
            "traditional": ["別", "擔心", "吧"],
            "meaning_and_reading": ["다를 별", "메다 담, 마음 심", "하자 파"]
        }
    },
    
    # Add more common words and patterns
    "一起去吧": {
        "pinyin": "yī qǐ qù ba",
        "korean": "함께 갑시다",
        "english": "Let's go together"
    },
    "试试看吧": {
        "pinyin": "shì shi kàn ba",
        "korean": "시도해 봅시다",
        "english": "Let's try it"
    },
    
    # Lesson 32: 동시 행동 (Simultaneous actions)
    "一边吃饭一边看电视": {
        "pinyin": "yī biān chī fàn yī biān kàn diàn shì",
        "korean": "밥을 먹으면서 텔레비전을 본다",
        "english": "Eat while watching TV"
    },
    "一边走一边说话": {
        "pinyin": "yī biān zǒu yī biān shuō huà",
        "korean": "걸으면서 이야기한다",
        "english": "Talk while walking"
    },
    
    # Add more patterns as needed...
}

# Common word translations
WORD_DICT = {
    "我们": {"pinyin": "wǒ men", "korean": "우리", "traditional": "我們", "meaning": "우리 아, 우리 문"},
    "走": {"pinyin": "zǒu", "korean": "가다", "traditional": "走", "meaning": "갈 주"},
    "吧": {"pinyin": "ba", "korean": "하자", "traditional": "吧", "meaning": "하자 파"},
    "休息": {"pinyin": "xiū xi", "korean": "휴식", "traditional": "休息", "meaning": "쉴 휴, 쉴 식"},
    "一下": {"pinyin": "yī xià", "korean": "좀", "traditional": "一下", "meaning": "하나 일, 아래 하"},
    "吃饭": {"pinyin": "chī fàn", "korean": "밥먹다", "traditional": "吃飯", "meaning": "먹을 흘, 밥 반"},
    "别": {"pinyin": "bié", "korean": "말다", "traditional": "別", "meaning": "다를 별"},
    "担心": {"pinyin": "dān xīn", "korean": "걱정", "traditional": "擔心", "meaning": "메다 담, 마음 심"},
    "一起": {"pinyin": "yī qǐ", "korean": "함께", "traditional": "一起", "meaning": "하나 일, 일어날 기"},
    "去": {"pinyin": "qù", "korean": "가다", "traditional": "去", "meaning": "갈 거"},
    "试试": {"pinyin": "shì shi", "korean": "시도하다", "traditional": "試試", "meaning": "시험 시"},
    "看": {"pinyin": "kàn", "korean": "보다", "traditional": "看", "meaning": "볼 간"},
    "一边": {"pinyin": "yī biān", "korean": "~하면서", "traditional": "一邊", "meaning": "하나 일, 가 변"},
    "电视": {"pinyin": "diàn shì", "korean": "텔레비전", "traditional": "電視", "meaning": "번개 전, 볼 시"},
    "说话": {"pinyin": "shuō huà", "korean": "이야기하다", "traditional": "說話", "meaning": "말씀 설, 말 화"},
}

def generate_enhanced_translations(chinese_sentence, word_breakdown):
    """Generate enhanced translations with better quality"""
    
    # Check if we have a direct translation
    if chinese_sentence in TRANSLATION_DICT:
        translation_data = TRANSLATION_DICT[chinese_sentence]
        result = {
            "pinyin": translation_data["pinyin"],
            "korean": translation_data["korean"],
            "english": translation_data["english"],
            "words": translation_data.get("words", generate_word_analysis_enhanced(word_breakdown))
        }
        return result
    
    # Generate based on word patterns
    pinyin_parts = []
    korean_parts = []
    english_parts = []
    
    for word in word_breakdown:
        if word in WORD_DICT:
            word_data = WORD_DICT[word]
            pinyin_parts.append(word_data["pinyin"])
            korean_parts.append(word_data["korean"])
            english_parts.append(word)  # Keep Chinese for now if no English pattern
        else:
            pinyin_parts.append(f"({word}_pinyin)")
            korean_parts.append(f"({word}_korean)")
            english_parts.append(word)
    
    # Create basic translations
    result = {
        "pinyin": " ".join(pinyin_parts),
        "korean": " ".join(korean_parts),
        "english": f"(English translation needed for: {chinese_sentence})",
        "words": generate_word_analysis_enhanced(word_breakdown)
    }
    
    return result

def generate_word_analysis_enhanced(word_breakdown):
    """Generate enhanced word analysis"""
    words_data = {
        "words": word_breakdown,
        "pinyin": [],
        "korean": [],
        "traditional": [],
        "meaning_and_reading": []
    }
    
    for word in word_breakdown:
        if word in WORD_DICT:
            word_data = WORD_DICT[word]
            words_data["pinyin"].append(word_data["pinyin"])
            words_data["korean"].append(word_data["korean"])
            words_data["traditional"].append(word_data["traditional"])
            words_data["meaning_and_reading"].append(word_data["meaning"])
        else:
            words_data["pinyin"].append(f"({word}_pinyin)")
            words_data["korean"].append(f"({word}_korean)")
            words_data["traditional"].append(word)
            words_data["meaning_and_reading"].append(f"({word}_meaning)")
    
    return words_data

def enhance_json_translations(json_file_path):
    """Enhance translations in the existing JSON file"""
    
    print("Loading JSON file...")
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    enhanced_count = 0
    
    print("Enhancing translations...")
    for lesson in data["contents"]:
        if lesson["lesson"] >= 31:  # Only enhance lessons 31-90
            for content in lesson["content"]:
                for subcategory in content["subcategories"]:
                    for sentence in subcategory["sentences"]:
                        chinese_sentence = sentence["sentence"]
                        
                        # Extract word breakdown from existing words array
                        word_breakdown = sentence["words"]["words"]
                        
                        # Generate enhanced translations
                        enhanced = generate_enhanced_translations(chinese_sentence, word_breakdown)
                        
                        # Update the sentence data
                        sentence["pinyin"] = enhanced["pinyin"]
                        sentence["korean"] = enhanced["korean"]
                        sentence["english"] = enhanced["english"]
                        sentence["words"] = enhanced["words"]
                        
                        enhanced_count += 1
    
    print(f"Enhanced {enhanced_count} sentences")
    
    # Save the enhanced JSON
    enhanced_file_path = json_file_path.replace(".json", "_enhanced.json")
    with open(enhanced_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    print(f"Saved enhanced file: {enhanced_file_path}")
    return enhanced_file_path

def main():
    json_file_path = r"D:\Coding\chinesestudy\public\data\integrated\05_패턴_제1-90과.json"
    enhanced_file = enhance_json_translations(json_file_path)
    print(f"Enhancement complete: {enhanced_file}")

if __name__ == "__main__":
    main()