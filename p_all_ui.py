import json
import subprocess
import re
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
from threading import Thread
import os
import glob

class UniversalDataVerifierUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Universal Data Verifier")
        self.root.geometry("1000x850")

        # Data
        self.data = None
        self.sentences = []
        self.current_index = 0
        self.pending_requests = {}  # Track async requests
        self.current_file = None

        # Field configuration
        self.available_fields = [
            'sentence', 'pinyin', 'korean', 'english',
            'japanese', 'japanese_romaji', 'translation'
        ]

        # Prompt templates for each field type
        self.prompt_templates = {
            'sentence': 'Chinese: {chinese_sentence} / Task: Verify if the Chinese sentence is correct. Reply with ONLY the correct Chinese sentence, nothing else.',
            'pinyin': 'Chinese: {chinese_sentence} / Current pinyin: {current_pinyin} / Task: Verify if pinyin is correct. Reply with ONLY the correct pinyin, nothing else.',
            'korean': 'Chinese: {chinese_sentence} / Current Korean: {current_korean} / Task: Verify if the Korean translation is correct. Reply with ONLY the correct Korean translation, nothing else.',
            'english': 'Chinese: {chinese_sentence} / Current English: {current_english} / Task: Verify if the English translation is correct. Reply with ONLY the correct English translation, nothing else.',
            'japanese': 'Chinese: {chinese_sentence} / Current Japanese: {current_japanese} / Task: Verify if the Japanese translation is correct. Reply with ONLY the correct Japanese translation, nothing else.',
            'japanese_romaji': 'Chinese: {chinese_sentence} / Current Japanese Romaji/Description: {current_japanese_romaji} / Task: Verify if the Japanese romaji or description is correct. Reply with ONLY the correct Japanese romaji or description, nothing else.',
            'translation': 'Chinese: {chinese_sentence} / Current Translation: {current_translation} / Task: Verify if the translation is correct. Reply with ONLY the correct translation, nothing else.'
        }

        # Get available JSON files
        self.json_files = sorted(glob.glob('public/data/integrated/*.json'))

        # Create UI first
        self.create_ui()

        # Load initial file if available
        if self.json_files:
            self.file_combo.set(os.path.basename(self.json_files[0]))
            self.load_data()

    def load_data(self):
        """Load JSON data and flatten sentences"""
        try:
            # Get selected file from combobox
            selected_file = self.file_combo.get()
            self.current_file = os.path.join('public/data/integrated', selected_file)

            with open(self.current_file, 'r', encoding='utf-8') as f:
                self.data = json.load(f)

            # Flatten sentences with references to original objects
            self.sentences = []
            for content in self.data['contents']:
                for lesson_content in content['content']:
                    for subcategory in lesson_content['subcategories']:
                        for sentence in subcategory['sentences']:
                            self.sentences.append({
                                'sentence_obj': sentence,  # Reference to original
                                'chinese': sentence.get('sentence', ''),
                                'pinyin': sentence.get('pinyin', ''),
                                'translation': sentence.get('translation', '')
                            })

            # Load first sentence if available
            if self.sentences:
                self.load_sentence(0)
            else:
                messagebox.showinfo("Info", "No sentences found in this file")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to load data: {e}")
            if not self.current_file:
                self.root.quit()

    def create_ui(self):
        """Create the user interface"""
        # Main container
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)

        # File selection frame
        file_frame = ttk.Frame(main_frame)
        file_frame.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 10))

        ttk.Label(file_frame, text="Select File:", font=('Arial', 12, 'bold')).pack(side=tk.LEFT, padx=(0, 10))

        # File combobox
        file_names = [os.path.basename(f) for f in self.json_files]
        self.file_combo = ttk.Combobox(file_frame, values=file_names, state='readonly', width=50, font=('Arial', 11))
        self.file_combo.pack(side=tk.LEFT, padx=(0, 10))
        self.file_combo.bind('<<ComboboxSelected>>', lambda _: self.on_file_selected())

        # Load button
        ttk.Button(file_frame, text="Load", command=self.load_data).pack(side=tk.LEFT)

        # Field selection frame
        field_frame = ttk.Frame(main_frame)
        field_frame.grid(row=1, column=0, sticky=(tk.W, tk.E), pady=(0, 10))

        ttk.Label(field_frame, text="Verify Field:", font=('Arial', 12, 'bold')).pack(side=tk.LEFT, padx=(0, 10))

        # Field combobox
        self.field_combo = ttk.Combobox(field_frame, values=self.available_fields,
                                        state='readonly', width=20, font=('Arial', 11))
        self.field_combo.set('pinyin')  # Default to pinyin
        self.field_combo.pack(side=tk.LEFT, padx=(0, 10))
        self.field_combo.bind('<<ComboboxSelected>>', lambda _: self.on_field_selected())

        # Custom prompt button
        ttk.Button(field_frame, text="Edit Prompt", command=self.edit_prompt).pack(side=tk.LEFT, padx=(0, 10))

        # Current prompt label (truncated)
        self.prompt_preview = ttk.Label(field_frame, text="", foreground="gray", font=('Arial', 9))
        self.prompt_preview.pack(side=tk.LEFT, padx=(0, 10))

        # Progress label
        self.progress_label = ttk.Label(main_frame, text="", font=('Arial', 14, 'bold'))
        self.progress_label.grid(row=2, column=0, sticky=tk.W, pady=(10, 10))

        # Chinese sentence (reference)
        ttk.Label(main_frame, text="Chinese Sentence (Reference):", font=('Arial', 13, 'bold')).grid(
            row=3, column=0, sticky=tk.W, pady=(5, 2))
        self.chinese_text = scrolledtext.ScrolledText(main_frame, height=2, wrap=tk.WORD, font=('Arial', 16))
        self.chinese_text.grid(row=4, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        self.chinese_text.config(state=tk.DISABLED)

        # Current field value (target for verification)
        self.field_label = ttk.Label(main_frame, text="Current Value:", font=('Arial', 13, 'bold'))
        self.field_label.grid(row=5, column=0, sticky=tk.W, pady=(5, 2))
        self.current_field_text = scrolledtext.ScrolledText(main_frame, height=2, wrap=tk.WORD, font=('Arial', 16))
        self.current_field_text.grid(row=6, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        self.current_field_text.config(state=tk.DISABLED)

        # Context fields (additional reference)
        ttk.Label(main_frame, text="Context (for reference):", font=('Arial', 13, 'bold')).grid(
            row=7, column=0, sticky=tk.W, pady=(5, 2))
        self.context_text = scrolledtext.ScrolledText(main_frame, height=3, wrap=tk.WORD, font=('Arial', 12))
        self.context_text.grid(row=8, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        self.context_text.config(state=tk.DISABLED)

        # Send button
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=9, column=0, pady=(10, 10))

        # Style for larger button
        style = ttk.Style()
        style.configure('Large.TButton', font=('Arial', 12, 'bold'), padding=10)

        self.send_button = ttk.Button(button_frame, text="Send to Claude (Verify Field)",
                                      command=self.send_to_claude, style='Large.TButton')
        self.send_button.pack(side=tk.LEFT, padx=5)

        self.status_label = ttk.Label(button_frame, text="", foreground="blue", font=('Arial', 13))
        self.status_label.pack(side=tk.LEFT, padx=10)

        # Result section
        ttk.Label(main_frame, text="Claude Response:", font=('Arial', 13, 'bold')).grid(
            row=10, column=0, sticky=tk.W, pady=(10, 2))
        self.result_text = scrolledtext.ScrolledText(main_frame, height=6, wrap=tk.WORD, font=('Arial', 13))
        self.result_text.grid(row=11, column=0, sticky=(tk.W, tk.E), pady=(0, 10))

        # Navigation buttons
        nav_frame = ttk.Frame(main_frame)
        nav_frame.grid(row=12, column=0, pady=(10, 0))

        self.prev_button = ttk.Button(nav_frame, text="← Previous", command=self.previous_sentence,
                                      width=18, style='Large.TButton')
        self.prev_button.pack(side=tk.LEFT, padx=5)

        self.next_button = ttk.Button(nav_frame, text="Next →", command=self.next_sentence,
                                      width=18, style='Large.TButton')
        self.next_button.pack(side=tk.LEFT, padx=5)

        # Configure text widget row to expand
        main_frame.rowconfigure(4, weight=1)
        main_frame.rowconfigure(6, weight=1)
        main_frame.rowconfigure(8, weight=1)
        main_frame.rowconfigure(11, weight=2)

        # Update prompt preview
        self.update_prompt_preview()

        # Bind keyboard shortcuts
        self.root.bind('<Left>', lambda e: self.previous_sentence())
        self.root.bind('<Right>', lambda e: self.next_sentence())
        self.root.bind('<Return>', lambda e: self.send_to_claude())
        self.root.bind('<KP_Enter>', lambda e: self.send_to_claude())  # Numpad Enter

    def on_file_selected(self):
        """Handle file selection from combobox"""
        self.load_data()

    def on_field_selected(self):
        """Handle field selection from combobox"""
        self.update_prompt_preview()
        # Reload current sentence to update displayed field
        if self.sentences:
            self.load_sentence(self.current_index)

    def update_prompt_preview(self):
        """Update the prompt preview label"""
        field = self.field_combo.get()
        if field in self.prompt_templates:
            template = self.prompt_templates[field]
            # Truncate for preview
            preview = template[:80] + "..." if len(template) > 80 else template
            self.prompt_preview.config(text=preview)

    def edit_prompt(self):
        """Open dialog to edit prompt template for current field"""
        field = self.field_combo.get()
        if field not in self.prompt_templates:
            messagebox.showwarning("Warning", f"No template found for field: {field}")
            return

        # Create dialog
        dialog = tk.Toplevel(self.root)
        dialog.title(f"Edit Prompt Template - {field}")
        dialog.geometry("700x400")

        ttk.Label(dialog, text=f"Edit prompt template for '{field}':",
                  font=('Arial', 12, 'bold')).pack(padx=10, pady=10)

        # Instruction label
        instruction = ("Available placeholders: {chinese_sentence}, {current_pinyin}, {current_korean}, "
                      "{current_english}, {current_japanese}, {current_japanese_romaji}, {current_translation}\n"
                      "Use {current_FIELDNAME} for the field being verified.")
        ttk.Label(dialog, text=instruction, foreground="gray", wraplength=650).pack(padx=10, pady=5)

        # Text editor
        text_editor = scrolledtext.ScrolledText(dialog, wrap=tk.WORD, font=('Arial', 11))
        text_editor.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)
        text_editor.insert(1.0, self.prompt_templates[field])

        # Buttons
        button_frame = ttk.Frame(dialog)
        button_frame.pack(pady=10)

        def save_prompt():
            new_prompt = text_editor.get(1.0, tk.END).strip()
            if new_prompt:
                self.prompt_templates[field] = new_prompt
                self.update_prompt_preview()
                messagebox.showinfo("Success", f"Prompt template for '{field}' updated!")
                dialog.destroy()

        def reset_prompt():
            # Reset to default (you can expand this with defaults dict)
            text_editor.delete(1.0, tk.END)
            text_editor.insert(1.0, self.prompt_templates[field])

        ttk.Button(button_frame, text="Save", command=save_prompt).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Cancel", command=dialog.destroy).pack(side=tk.LEFT, padx=5)

    def load_sentence(self, index):
        """Load sentence at given index"""
        if index < 0 or index >= len(self.sentences):
            return

        self.current_index = index
        sentence_data = self.sentences[index]
        sentence_obj = sentence_data['sentence_obj']

        # Get selected field
        selected_field = self.field_combo.get()

        # Update progress
        self.progress_label.config(text=f"Sentence {index + 1} / {len(self.sentences)}")

        # Update Chinese text (always show as reference)
        self.chinese_text.config(state=tk.NORMAL)
        self.chinese_text.delete(1.0, tk.END)
        self.chinese_text.insert(1.0, sentence_obj.get('sentence', ''))
        self.chinese_text.config(state=tk.DISABLED)

        # Update field label
        self.field_label.config(text=f"Current {selected_field.title()}:")

        # Update current field value (the one being verified)
        self.current_field_text.config(state=tk.NORMAL)
        self.current_field_text.delete(1.0, tk.END)
        field_value = sentence_obj.get(selected_field, '')
        self.current_field_text.insert(1.0, field_value)
        self.current_field_text.config(state=tk.DISABLED)

        # Build context information (other fields for reference)
        context_parts = []
        context_fields = ['pinyin', 'korean', 'english', 'japanese', 'translation']
        for field in context_fields:
            if field != selected_field and sentence_obj.get(field):
                context_parts.append(f"{field.title()}: {sentence_obj.get(field)}")

        self.context_text.config(state=tk.NORMAL)
        self.context_text.delete(1.0, tk.END)
        self.context_text.insert(1.0, "\n".join(context_parts))
        self.context_text.config(state=tk.DISABLED)

        # Clear result if not pending
        if index not in self.pending_requests:
            self.result_text.delete(1.0, tk.END)
            self.status_label.config(text="")
        else:
            self.status_label.config(text="⏳ Request pending...", foreground="orange")

        # Update button states
        self.prev_button.config(state=tk.NORMAL if index > 0 else tk.DISABLED)
        self.next_button.config(state=tk.NORMAL if index < len(self.sentences) - 1 else tk.DISABLED)

    def previous_sentence(self):
        """Go to previous sentence"""
        if self.current_index > 0:
            self.load_sentence(self.current_index - 1)

    def next_sentence(self):
        """Go to next sentence"""
        if self.current_index < len(self.sentences) - 1:
            self.load_sentence(self.current_index + 1)

    def send_to_claude(self):
        """Send current sentence to Claude for verification (async)"""
        sentence_data = self.sentences[self.current_index]
        sentence_obj = sentence_data['sentence_obj']
        selected_field = self.field_combo.get()

        # Get template for selected field
        if selected_field not in self.prompt_templates:
            messagebox.showwarning("Warning", f"No prompt template for field: {selected_field}")
            return

        # Prepare context data for prompt template
        context = {
            'chinese_sentence': sentence_obj.get('sentence', ''),
            'current_pinyin': sentence_obj.get('pinyin', ''),
            'current_korean': sentence_obj.get('korean', ''),
            'current_english': sentence_obj.get('english', ''),
            'current_japanese': sentence_obj.get('japanese', ''),
            'current_japanese_romaji': sentence_obj.get('japanese_romaji', ''),
            'current_translation': sentence_obj.get('translation', '')
        }

        current_field_value = sentence_obj.get(selected_field, '')
        if not current_field_value:
            messagebox.showwarning("Warning", f"No value found for field: {selected_field}")
            return

        # Format prompt with context
        try:
            prompt = self.prompt_templates[selected_field].format(**context)
        except KeyError as e:
            messagebox.showerror("Error", f"Invalid placeholder in template: {e}")
            return

        # Mark as pending
        self.pending_requests[self.current_index] = {
            'field': selected_field,
            'original_value': current_field_value
        }
        self.status_label.config(text="⏳ Sending request...", foreground="orange")
        self.send_button.config(state=tk.DISABLED)

        # Run async request in background thread
        Thread(target=self._send_request_thread, args=(prompt, self.current_index), daemon=True).start()

    def _send_request_thread(self, prompt, sentence_index):
        """Background thread to send request to Claude"""
        try:
            result = subprocess.run(['claude.cmd'],
                                    input=prompt,
                                    capture_output=True,
                                    text=True,
                                    encoding='utf-8',
                                    errors='ignore',
                                    timeout=30)

            output = result.stdout.strip() if result.stdout else "No response received"

            # Schedule UI update on main thread
            self.root.after(0, lambda: self._handle_response(output, sentence_index))

        except subprocess.TimeoutExpired:
            self.root.after(0, lambda: self._handle_error("Request timed out", sentence_index))
        except Exception as e:
            self.root.after(0, lambda: self._handle_error(str(e), sentence_index))

    def _handle_response(self, output, sentence_index):
        """Handle Claude response (called on main thread)"""
        # Get pending request info
        pending_info = self.pending_requests.get(sentence_index)
        if not pending_info:
            return

        field = pending_info['field']
        original_value = pending_info['original_value']

        # Remove from pending
        del self.pending_requests[sentence_index]

        # Only update UI if still on the same sentence
        if sentence_index == self.current_index:
            self.result_text.delete(1.0, tk.END)
            self.result_text.insert(1.0, f"Raw Response:\n{output}\n\n")

            # Extract result based on field type
            extracted_result = self.extract_result(output, field)

            if extracted_result:
                self.result_text.insert(tk.END, f"Extracted {field.title()}:\n{extracted_result}\n\n")

                sentence_data = self.sentences[sentence_index]

                if extracted_result != original_value:
                    # Update the data
                    sentence_data['sentence_obj'][field] = extracted_result

                    # Save to file
                    self.save_data()

                    self.result_text.insert(tk.END, f"✅ Updated: {original_value} → {extracted_result}\n", "success")
                    self.result_text.tag_config("success", foreground="green", font=('Arial', 13, 'bold'))

                    # Refresh current view
                    self.load_sentence(sentence_index)

                    self.status_label.config(text="✅ Updated and saved", foreground="green")
                else:
                    self.result_text.insert(tk.END, f"✓ {field.title()} is correct, no update needed\n", "unchanged")
                    self.result_text.tag_config("unchanged", foreground="blue", font=('Arial', 13, 'bold'))
                    self.status_label.config(text="✓ No changes needed", foreground="blue")
            else:
                self.result_text.insert(tk.END, f"⚠️ Failed to extract valid {field}\n", "error")
                self.result_text.tag_config("error", foreground="red", font=('Arial', 13, 'bold'))
                self.status_label.config(text="⚠️ Extraction failed", foreground="red")

            self.send_button.config(state=tk.NORMAL)

    def _handle_error(self, error_msg, sentence_index):
        """Handle error (called on main thread)"""
        if sentence_index in self.pending_requests:
            del self.pending_requests[sentence_index]

        if sentence_index == self.current_index:
            self.result_text.delete(1.0, tk.END)
            self.result_text.insert(1.0, f"Error: {error_msg}")
            self.status_label.config(text="❌ Error", foreground="red")
            self.send_button.config(state=tk.NORMAL)

    def extract_result(self, text, field):
        """Extract the result from Claude's response based on field type"""
        text = text.strip()

        # Remove common prefixes
        text = re.sub(r'^(Your answer|Answer|Response)[:\s]*', '', text, flags=re.IGNORECASE)

        # Split into lines and get first non-empty line
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        if not lines:
            return ""

        # Take the first line as the result
        first_line = lines[0]

        # Remove markdown formatting
        first_line = re.sub(r'\*\*', '', first_line)
        first_line = re.sub(r'`', '', first_line)
        first_line = first_line.strip()

        # Field-specific validation
        if field == 'pinyin':
            return self._validate_pinyin(first_line)
        elif field == 'sentence':
            return self._validate_chinese(first_line)
        elif field in ['korean', 'english', 'japanese', 'japanese_romaji', 'translation']:
            return self._validate_translation(first_line)
        else:
            # Generic validation - just return if it's not too short and doesn't contain common error words
            if (len(first_line) >= 2 and
                not any(word in first_line.lower() for word in [
                    'verify', 'check', 'please', 'respond', 'however',
                    'help', 'want', 'could', 'would', 'should', 'message', 'sorry'
                ])):
                return first_line

        return ""

    def _validate_pinyin(self, text):
        """Validate if text looks like valid pinyin"""
        if (re.match(r'^[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s\']+$', text) and
            len(text) >= 3 and
            not any(word in text.lower() for word in [
                'verify', 'check', 'correct', 'chinese', 'sentence', 'please',
                'respond', 'answer', 'provide', 'matches', 'however', 'happy',
                'help', 'want', 'could', 'would', 'should', 'message'
            ])):
            return text
        return ""

    def _validate_chinese(self, text):
        """Validate if text looks like valid Chinese"""
        # Check if contains Chinese characters
        if re.search(r'[\u4e00-\u9fff]', text) and len(text) >= 1:
            return text
        return ""

    def _validate_translation(self, text):
        """Validate if text looks like valid translation (Korean, English, Japanese, etc.)"""
        # Basic validation - just check length and avoid common error words
        if (len(text) >= 2 and
            not any(word in text.lower() for word in [
                'verify', 'check', 'please', 'respond', 'however',
                'want', 'could', 'would', 'should', 'sorry', 'cannot'
            ])):
            return text
        return ""

    def save_data(self):
        """Save updated data to JSON file"""
        try:
            if not self.current_file:
                messagebox.showerror("Save Error", "No file is currently loaded")
                return
            with open(self.current_file, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, ensure_ascii=False, indent=4)
        except Exception as e:
            messagebox.showerror("Save Error", f"Failed to save data: {e}")

def main():
    root = tk.Tk()
    app = UniversalDataVerifierUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()
