import json
import subprocess
import sys
import re

# Configuration
START_INDEX = 0  # 시작할 문장 인덱스 (예: 50번째부터 시작하려면 49로 설정)
INPUT_FILE = 'public/data/integrated/03_고급반_제26-40과.json'
OUTPUT_FILE = 'public/data/integrated/03_고급반_제26-40과.json'
DEBUG_PROMPT = True  # 프롬프트 디버깅 모드

# Field configuration with menu options
FIELD_OPTIONS = {
    '1': {'key': 'sentence', 'name': 'Chinese Sentence (sentence)', 'prompt_template': 'Chinese: {chinese_sentence} / Task: Verify if the Chinese sentence is correct. Reply with ONLY the correct Chinese sentence, nothing else.'},
    '2': {'key': 'pinyin', 'name': 'Pinyin (pinyin)', 'prompt_template': 'Chinese: {chinese_sentence} / Current pinyin: {current_pinyin} / Task: Verify if pinyin is correct. Reply with ONLY the correct pinyin, nothing else.'},
    '3': {'key': 'korean', 'name': 'Korean Translation (korean)', 'prompt_template': 'Chinese: {chinese_sentence} / Current Korean: {current_korean} / Task: Verify if the Korean translation is correct. Reply with ONLY the correct Korean translation, nothing else.'},
    '4': {'key': 'english', 'name': 'English Translation (english)', 'prompt_template': 'Chinese: {chinese_sentence} / Current English: {current_english} / Task: Verify if the English translation is correct. Reply with ONLY the correct English translation, nothing else.'},
    '5': {'key': 'japanese', 'name': 'Japanese Translation (japanese)', 'prompt_template': 'Chinese: {chinese_sentence} / Current Japanese: {current_japanese} / Task: Verify if the Japanese translation is correct. Reply with ONLY the correct Japanese translation, nothing else.'},
    '6': {'key': 'japanese_romaji', 'name': 'Japanese Romaji/Description (japanese_romaji)', 'prompt_template': 'Chinese: {chinese_sentence} / Current Japanese Romaji/Description: {current_japanese_romaji} / Task: Verify if the Japanese romaji or description is correct. Reply with ONLY the correct Japanese romaji or description, nothing else.'},
    '7': {'key': 'translation', 'name': 'Translation', 'prompt_template': 'Chinese: {chinese_sentence} / Current Translation: {current_translation} / Task: Verify if the translation is correct. Reply with ONLY the correct translation, nothing else.'}
}

def display_field_menu():
    """Display interactive menu for field selection"""
    print("\n" + "="*60)
    print("📋 SELECT FIELD TO VERIFY/CORRECT")
    print("="*60)
    for key, value in FIELD_OPTIONS.items():
        print(f"  [{key}] {value['name']}")
    print("  [0] Exit program")
    print("="*60)

def get_field_selection():
    """Get user's field selection"""
    while True:
        display_field_menu()
        choice = input("\nEnter your choice (0-7): ").strip()

        if choice == '0':
            print("👋 Exiting program...")
            sys.exit(0)

        if choice in FIELD_OPTIONS:
            return FIELD_OPTIONS[choice]

        print("❌ Invalid choice. Please select 0-7.")

# Load the JSON file
with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Get field selection from user
selected_field = get_field_selection()
field_key = selected_field['key']
field_name = selected_field['name']
prompt_template = selected_field['prompt_template']

print(f"\n✅ Selected field: {field_name}")
print(f"📝 Starting verification from sentence index {START_INDEX}...\n")

# Function to extract clean response from Claude's output
def extract_clean_response(text):
    """
    Extract clean response from Claude's output, removing explanations and formatting
    """
    text = text.strip()

    # Remove common prefixes
    text = re.sub(r'^(Your answer|Pinyin|Answer|Response|Korean|English|Japanese|Chinese)[:\s]*', '', text, flags=re.IGNORECASE)

    # Split into lines and get first non-empty line
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    if not lines:
        return ""

    # Take the first line as it should be the answer
    first_line = lines[0]

    # Remove markdown formatting
    first_line = re.sub(r'\*\*', '', first_line)
    first_line = re.sub(r'`', '', first_line)
    first_line = first_line.strip()

    # Basic validation: should not be empty and not contain meta-language
    if (len(first_line) >= 1 and
        not any(word in first_line.lower() for word in [
            'verify', 'check', 'please', 'respond', 'provide',
            'however', 'happy', 'help', 'want', 'could', 'would', 'should'
        ])):
        return first_line

    return ""

# Loop through sentences with counter
count = 0
sentence_index = 0
should_exit = False

for content in data['contents']:
    if should_exit:
        break
    for lesson_content in content['content']:
        if should_exit:
            break
        for subcategory in lesson_content['subcategories']:
            if should_exit:
                break
            for sentence in subcategory['sentences']:
                # Skip sentences before START_INDEX
                if sentence_index < START_INDEX:
                    sentence_index += 1
                    continue

                # Get the Chinese sentence and current field value
                chinese_sentence = sentence.get('sentence', '')
                current_value = sentence.get(field_key, '')
                current_pinyin = sentence.get('pinyin', '')

                if not chinese_sentence:
                    print(f"No Chinese sentence found for sentence #{sentence_index + 1}")
                    sentence_index += 1
                    continue

                print(f"\n[Sentence #{sentence_index + 1}]")
                print(f"Chinese: {chinese_sentence}")
                print(f"Current {field_name}: {current_value}")

                # Prepare context data for prompt template
                context = {
                    'chinese_sentence': chinese_sentence,
                    'current_pinyin': sentence.get('pinyin', ''),
                    'current_korean': sentence.get('korean', ''),
                    'current_english': sentence.get('english', ''),
                    'current_japanese': sentence.get('japanese', ''),
                    'current_japanese_romaji': sentence.get('japanese_romaji', ''),
                    'current_translation': sentence.get('translation', '')
                }

                # Create prompt using the template
                prompt = prompt_template.format(**context)

                if DEBUG_PROMPT and sentence_index < 2:
                    print(f"\n📝 Debug - Full prompt being sent:")
                    print(f"'{prompt}'")
                    print(f"📝 End of prompt\n")

                try:
                    # Try using stdin instead of -p flag
                    result = subprocess.run(['claude.cmd'],
                                            input=prompt,
                                            capture_output=True, text=True,
                                            encoding='utf-8', errors='ignore')

                    if DEBUG_PROMPT and sentence_index < 2:
                        print(f"📝 Debug - stderr: {result.stderr}")
                        print(f"📝 Debug - returncode: {result.returncode}")

                    if result.stdout:
                        output = result.stdout.strip()
                        print(f"Claude raw output: {output}")

                        # Check for rate limit message
                        if "5-hour limit reached" in output or "resets" in output:
                            print(f"\n⚠️ Rate limit reached at sentence index {sentence_index}")
                            print(f"Resume from index {sentence_index} by setting START_INDEX = {sentence_index}")
                            should_exit = True
                            break

                        # Extract clean response
                        clean_result = extract_clean_response(output)
                        print(f"Extracted result: {clean_result}")

                        # Only update if we got a valid result AND it's different
                        if clean_result:
                            if clean_result != current_value:
                                sentence[field_key] = clean_result
                                print(f"✏️ Updated {field_name}: {current_value} → {clean_result}")
                                count += 1

                                # Save the updated data after each update
                                with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                                    json.dump(data, f, ensure_ascii=False, indent=4)
                                print(f"💾 Saved after updating sentence #{sentence_index + 1}")
                            else:
                                print(f"✓ {field_name} is correct, no update needed")
                        else:
                            print(f"⚠️ Failed to extract valid result, skipping update")
                    else:
                        print("Error: No output received")

                except (FileNotFoundError, UnicodeDecodeError) as e:
                    print(f"Error: {e}")

                if should_exit:
                    break

                sentence_index += 1
                print("---")

                # Uncomment to stop after N sentences for testing
                # if count >= 3:
                #     print(f"\n⏹️ Stopping after {count} sentences for testing")
                #     should_exit = True
                #     break

# Save the updated data back to the JSON file
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

if should_exit:
    print(f"\n❗ Execution stopped after processing {sentence_index} sentences.")
    print(f"📌 To resume, set START_INDEX = {sentence_index} in the script")
else:
    print(f"\n✅ File processing completed! Updated {count} sentences.")

print(f"💾 File saved: {OUTPUT_FILE}")
