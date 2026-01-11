import json
import subprocess
import sys
import re

# Configuration
START_INDEX = 0  # 시작할 문장 인덱스 (예: 50번째부터 시작하려면 49로 설정)
INPUT_FILE = 'public/data/integrated/03_고급반_제26-40과.json'
OUTPUT_FILE = 'public/data/integrated/03_고급반_제26-40과.json'
DEBUG_PROMPT = True  # 프롬프트 디버깅 모드

# Load the JSON file
with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Function to extract only pinyin from Claude's response
def extract_pinyin(text):
    """
    Extract only the pinyin from Claude's response, removing explanations and other text
    """
    text = text.strip()

    # Remove common prefixes
    text = re.sub(r'^(Your answer|Pinyin|Answer|Response)[:\s]*', '', text, flags=re.IGNORECASE)

    # Split into lines and get first non-empty line
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    if not lines:
        return ""

    # Take the first line as it should be the pinyin
    first_line = lines[0]

    # Remove markdown formatting
    first_line = re.sub(r'\*\*', '', first_line)
    first_line = re.sub(r'`', '', first_line)
    first_line = first_line.strip()

    # Check if it looks like valid pinyin:
    # - Contains only letters (with optional tone marks), spaces, and apostrophes
    # - Has at least one space (multi-syllable)
    # - No English words that indicate it's an explanation
    if (re.match(r'^[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s\']+$', first_line) and
        ' ' in first_line and
        len(first_line) >= 3 and
        not any(word in first_line.lower() for word in [
            'verify', 'check', 'correct', 'chinese', 'sentence', 'please',
            'respond', 'answer', 'provide', 'matches', 'however', 'happy',
            'help', 'want', 'could', 'would', 'should', 'message'
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

                # Get the Chinese sentence and pinyin fields
                chinese_sentence = sentence.get('sentence', '')
                current_pinyin = sentence.get('pinyin', '')

                if not chinese_sentence:
                    print(f"No Chinese sentence found for sentence #{sentence_index + 1}")
                    sentence_index += 1
                    continue

                print(f"\n[Sentence #{sentence_index + 1}]")
                print(f"Chinese: {chinese_sentence}")
                print(f"Current pinyin: {current_pinyin}")

                # Create prompt for Claude to verify and correct pinyin
                prompt = f"Chinese: {chinese_sentence} / Current pinyin: {current_pinyin} / Task: Verify if pinyin is correct. Reply with ONLY the correct pinyin, nothing else."

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

                        # Extract only pinyin from the response
                        pinyin_result = extract_pinyin(output)
                        print(f"Extracted pinyin: {pinyin_result}")

                        # Only update if we got a valid result AND it's different
                        if pinyin_result:
                            if pinyin_result != current_pinyin:
                                sentence['pinyin'] = pinyin_result
                                print(f"✏️ Updated pinyin: {current_pinyin} → {pinyin_result}")
                                count += 1

                                # Save the updated data after each update
                                with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                                    json.dump(data, f, ensure_ascii=False, indent=4)
                                print(f"💾 Saved after updating sentence #{sentence_index + 1}")
                            else:
                                print(f"✓ Pinyin is correct, no update needed")
                        else:
                            print(f"⚠️ Failed to extract valid pinyin, skipping update")
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
