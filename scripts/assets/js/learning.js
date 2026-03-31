document.addEventListener('DOMContentLoaded', () => {
    const state = {
        courseId: 'javascript',
        currentTab: 'lecture',
        editor: null,
        scrapedTopics: [],
        hasStarted: false,
        topicUrlIndexMap: new Map(),
        currentTopicIndex: null,
        compilerLanguage: 'javascript',
        pendingCompilerCode: '',
        compilerDrafts: {}
    };

    const overlay = document.getElementById('course-entry-overlay');
    const startBtn = document.getElementById('start-course-btn');
    const overlayTitle = document.getElementById('overlay-course-title');
    const lessonList = document.getElementById('lesson-list');
    const lectureContent = document.getElementById('lecture-content');
    const currentLesson = document.getElementById('current-lesson');
    const courseContentViewer = document.getElementById('course-content-viewer');
    const quizContainer = document.getElementById('topic-quiz-container');
    const exerciseList = document.getElementById('exercise-list');
    const projectWorkspace = document.getElementById('project-workspace');
    const languageSelect = document.getElementById('compiler-language-select');
    const stdinInput = document.getElementById('compiler-stdin');
    const clearOutputBtn = document.getElementById('clear-output-btn');

    const COURSE_TITLE_MAP = {
        'html': 'HTML Learning',
        'css': 'CSS Learning',
        'js': 'JavaScript Learning',
        'javascript': 'JavaScript Learning',
        'typescript': 'TypeScript Learning',
        'python': 'Python Learning',
        'java': 'Java Learning',
        'c': 'C Learning',
        'cpp': 'C++ Learning',
        'react': 'React Learning',
        'nodejs': 'Node.js Learning',
        'django': 'Django Learning',
        'sql': 'SQL Learning',
        'mongodb': 'MongoDB Learning',
        'postgresql': 'PostgreSQL Learning',
        'git': 'Git Learning',
        'docker': 'Docker Learning',
        'aws': 'AWS Learning'
    };

    const COMPILER_CONFIG = {
        javascript: {
            monaco: 'javascript',
            pistonLanguage: 'javascript',
            template: [
                '// JavaScript example',
                'function greet(name) {',
                '  return `Hello, ${name}!`;',
                '}',
                '',
                'console.log(greet("Learner"));'
            ].join('\n')
        },
        python: {
            monaco: 'python',
            pistonLanguage: 'python3',
            template: [
                '# Python example',
                'def greet(name):',
                '    return f"Hello, {name}!"',
                '',
                'print(greet("Learner"))'
            ].join('\n')
        },
        typescript: {
            monaco: 'typescript',
            pistonLanguage: 'typescript',
            template: [
                '// TypeScript example',
                'function greet(name: string): string {',
                '  return `Hello, ${name}!`;',
                '}',
                '',
                'console.log(greet("Learner"));'
            ].join('\n')
        },
        java: {
            monaco: 'java',
            pistonLanguage: 'java',
            template: [
                'public class Main {',
                '  public static void main(String[] args) {',
                '    System.out.println("Hello, Learner!");',
                '  }',
                '}'
            ].join('\n')
        },
        c: {
            monaco: 'c',
            pistonLanguage: 'c',
            template: [
                '#include <stdio.h>',
                '',
                'int main() {',
                '    printf("Hello, Learner!\\n");',
                '    return 0;',
                '}'
            ].join('\n')
        },
        cpp: {
            monaco: 'cpp',
            pistonLanguage: 'cpp',
            template: [
                '#include <iostream>',
                'using namespace std;',
                '',
                'int main() {',
                '    cout << "Hello, Learner!" << endl;',
                '    return 0;',
                '}'
            ].join('\n')
        },
        csharp: {
            monaco: 'csharp',
            pistonLanguage: 'csharp',
            template: [
                'using System;',
                '',
                'class Program {',
                '    static void Main() {',
                '        Console.WriteLine("Hello, Learner!");',
                '    }',
                '}'
            ].join('\n')
        },
        go: {
            monaco: 'go',
            pistonLanguage: 'go',
            template: [
                'package main',
                '',
                'import "fmt"',
                '',
                'func main() {',
                '    fmt.Println("Hello, Learner!")',
                '}'
            ].join('\n')
        },
        rust: {
            monaco: 'rust',
            pistonLanguage: 'rust',
            template: [
                'fn main() {',
                '    println!("Hello, Learner!");',
                '}'
            ].join('\n')
        },
        php: {
            monaco: 'php',
            pistonLanguage: 'php',
            template: [
                '<?php',
                'echo "Hello, Learner!\\n";'
            ].join('\n')
        },
        ruby: {
            monaco: 'ruby',
            pistonLanguage: 'ruby',
            template: [
                'puts "Hello, Learner!"'
            ].join('\n')
        }
    };

    Object.keys(COMPILER_CONFIG).forEach((language) => {
        state.compilerDrafts[language] = COMPILER_CONFIG[language].template;
    });

    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' } });

    require(['vs/editor/editor.main'], () => {
        const initialCompiler = COMPILER_CONFIG[state.compilerLanguage];
        state.editor = monaco.editor.create(document.getElementById('monaco-editor-container'), {
            value: state.compilerDrafts[state.compilerLanguage] || initialCompiler.template,
            language: initialCompiler.monaco,
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false }
        });

        state.editor.onDidChangeModelContent(() => {
            state.compilerDrafts[state.compilerLanguage] = state.editor.getValue();
        });

        if (state.pendingCompilerCode) {
            state.editor.setValue(state.pendingCompilerCode);
            state.compilerDrafts[state.compilerLanguage] = state.pendingCompilerCode;
            state.pendingCompilerCode = '';
        }
    });

    const tabs = document.querySelectorAll('.tab');
    const panes = document.querySelectorAll('.content-pane');

    function activateTab(targetId) {
        tabs.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));

        const selectedTab = document.querySelector(`.tab[data-tab="${targetId}"]`);
        const pane = document.getElementById(`tab-${targetId}`);

        if (selectedTab) selectedTab.classList.add('active');
        if (pane) pane.classList.add('active');

        state.currentTab = targetId;
        if (targetId === 'compiler' && state.editor) {
            setTimeout(() => state.editor.layout(), 100);
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;
            activateTab(targetId);
        });
    });

    const runBtn = document.getElementById('run-code-btn');
    const terminalOutput = document.getElementById('terminal-output');

    function switchCompilerLanguage(language) {
        const compiler = COMPILER_CONFIG[language] || COMPILER_CONFIG.javascript;

        if (state.editor) {
            state.compilerDrafts[state.compilerLanguage] = state.editor.getValue();
        }

        state.compilerLanguage = language;

        if (!state.editor) return;

        const model = state.editor.getModel();
        if (model) {
            monaco.editor.setModelLanguage(model, compiler.monaco);
        }

        state.editor.setValue(state.compilerDrafts[language] || compiler.template);
    }

    function setCompilerCode(code) {
        if (state.editor) {
            state.editor.setValue(code);
            state.compilerDrafts[state.compilerLanguage] = code;
            return;
        }

        state.pendingCompilerCode = code;
        state.compilerDrafts[state.compilerLanguage] = code;
    }

    function buildTaskStarterCode(kind, taskTitle, topicTitle) {
        const title = String(taskTitle || '').trim();
        const topic = String(topicTitle || 'this topic').trim();

        if (state.compilerLanguage === 'python') {
            return [
                `# ${kind.toUpperCase()}: ${title}`,
                `# Topic: ${topic}`,
                '',
                'def solve():',
                '    result = "Implement your logic here"',
                '    return result',
                '',
                'if __name__ == "__main__":',
                '    print(solve())'
            ].join('\n');
        }

        if (state.compilerLanguage === 'java') {
            return [
                `// ${kind.toUpperCase()}: ${title}`,
                `// Topic: ${topic}`,
                'public class Main {',
                '  public static void main(String[] args) {',
                '    System.out.println("Implement your solution here");',
                '  }',
                '}'
            ].join('\n');
        }

        if (state.compilerLanguage === 'c') {
            return [
                `/* ${kind.toUpperCase()}: ${title} */`,
                `/* Topic: ${topic} */`,
                '#include <stdio.h>',
                '',
                'int main() {',
                '    printf("Implement your solution here\\n");',
                '    return 0;',
                '}'
            ].join('\n');
        }

        if (state.compilerLanguage === 'cpp') {
            return [
                `// ${kind.toUpperCase()}: ${title}`,
                `// Topic: ${topic}`,
                '#include <iostream>',
                'using namespace std;',
                '',
                'int main() {',
                '    cout << "Implement your solution here" << endl;',
                '    return 0;',
                '}'
            ].join('\n');
        }

        return [
            `// ${kind.toUpperCase()}: ${title}`,
            `// Topic: ${topic}`,
            '',
            'function solve() {',
            '  const result = "Implement your logic here";',
            '  return result;',
            '}',
            '',
            'console.log(solve());'
        ].join('\n');
    }

    function openTaskInCompiler(kind, taskTitle, topicTitle) {
        const code = buildTaskStarterCode(kind, taskTitle, topicTitle);
        setCompilerCode(code);
        activateTab('compiler');
    }

    function appendToTerminal(text, className = '') {
        const line = document.createElement('div');
        line.innerText = text;
        if (className === 'error') line.style.color = '#ef4444';
        if (className === 'success') line.style.color = '#10b981';
        if (className === 'system-msg') line.style.color = '#94a3b8';
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    async function runCodeInCompiler(code, language) {
        const compiler = COMPILER_CONFIG[language] || COMPILER_CONFIG.javascript;
        const stdin = stdinInput?.value || '';

        const response = await fetch('/api/compiler/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: compiler.pistonLanguage,
                version: '*',
                code,
                stdin
            })
        });

        if (!response.ok) {
            const errorPayload = await response.json().catch(() => ({}));
            const message = errorPayload?.error || `Compiler API error (${response.status})`;
            throw new Error(message);
        }

        return response.json();
    }

    if (clearOutputBtn) {
        clearOutputBtn.addEventListener('click', () => {
            terminalOutput.innerHTML = '<span class="system-msg">> Output cleared.</span>';
        });
    }

    if (languageSelect) {
        languageSelect.addEventListener('change', (event) => {
            switchCompilerLanguage(event.target.value);
        });
    }

    if (runBtn) {
        runBtn.addEventListener('click', async () => {
            if (!state.editor) {
                appendToTerminal('Editor is still loading...', 'error');
                return;
            }

            const code = state.editor.getValue();
            terminalOutput.innerHTML = '';
            appendToTerminal(`> Executing ${state.compilerLanguage} code...`, 'system-msg');

            runBtn.disabled = true;
            try {
                const result = await runCodeInCompiler(code, state.compilerLanguage);
                const compileOutput = result?.compile || {};
                const runOutput = result?.run || {};

                if (compileOutput.stdout) {
                    appendToTerminal('> Compile output:', 'system-msg');
                    compileOutput.stdout.trim().split('\n').forEach(line => appendToTerminal(line));
                }

                if (compileOutput.stderr) {
                    appendToTerminal('> Compile errors:', 'error');
                    compileOutput.stderr.trim().split('\n').forEach(line => appendToTerminal(line, 'error'));
                }

                if (runOutput.stdout) {
                    runOutput.stdout.trim().split('\n').forEach(line => appendToTerminal(line));
                }

                if (runOutput.stderr) {
                    appendToTerminal('> Runtime errors:', 'error');
                    runOutput.stderr.trim().split('\n').forEach(line => appendToTerminal(line, 'error'));
                }

                if (typeof runOutput.code === 'number') {
                    appendToTerminal(`> Exit code: ${runOutput.code}`, runOutput.code === 0 ? 'success' : 'error');
                }

                if (!runOutput.stdout && !runOutput.stderr) {
                    appendToTerminal('> No output.', 'system-msg');
                }

                appendToTerminal('> Execution finished.', 'success');
            } catch (error) {
                if (state.compilerLanguage === 'javascript') {
                    try {
                        const output = [];
                        const originalLog = console.log;
                        console.log = (...args) => output.push(args.join(' '));
                        eval(code);
                        console.log = originalLog;

                        output.forEach(line => appendToTerminal(line));
                        appendToTerminal('> Execution finished (local JS fallback).', 'success');
                    } catch (fallbackError) {
                        appendToTerminal(`Error: ${fallbackError.message}`, 'error');
                    }
                } else {
                    appendToTerminal(`Error: ${error.message}`, 'error');
                    appendToTerminal('Tip: Check server and internet connectivity for compiler execution.', 'system-msg');
                }
            } finally {
                runBtn.disabled = false;
            }
        });
    }

    const speakBtn = document.getElementById('ask-ai-btn');
    if (speakBtn) {
        speakBtn.addEventListener('click', () => {
            addChatMessage('How do I understand this topic better?', 'user');
            addChatMessage('Read the topic summary first, then review examples, and practice one small snippet in the compiler tab.', 'ai');
        });
    }

    function addChatMessage(text, sender) {
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.innerHTML = `<p>${text}</p>`;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function escapeHtml(text) {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalizeTopicUrl(url) {
        if (!url) return '';
        try {
            const parsed = new URL(url, 'https://www.geeksforgeeks.org');
            return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, '').toLowerCase();
        } catch {
            return String(url).trim().replace(/\/$/, '').toLowerCase();
        }
    }

    function formatLinkLabel(rawText) {
        const clean = scrubBranding((rawText || '').replace(/\s+/g, ' ').trim());
        return clean || 'Open resource';
    }

    function parseTopicResources(topic) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(topic.htmlContent || '', 'text/html');
        const links = Array.from(doc.querySelectorAll('a'));

        const resources = {
            quizzes: [],
            exercises: [],
            projects: []
        };

        const pushUnique = (bucket, entry) => {
            if (!entry.url || bucket.some(item => item.url === entry.url)) return;
            bucket.push(entry);
        };

        links.forEach((anchor) => {
            const href = (anchor.getAttribute('href') || '').trim();
            if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

            let absoluteUrl = href;
            if (href.startsWith('/')) {
                absoluteUrl = `https://www.geeksforgeeks.org${href}`;
            }

            const label = formatLinkLabel(anchor.textContent);
            const haystack = `${label} ${absoluteUrl}`.toLowerCase();
            const entry = { title: label, url: absoluteUrl };

            if (/quiz|mcq|test/.test(haystack)) {
                pushUnique(resources.quizzes, entry);
            } else if (/project|build|app|system|dashboard|clone/.test(haystack)) {
                pushUnique(resources.projects, entry);
            } else if (/exercise|practice|problem|challenge|example|question|coding/.test(haystack)) {
                pushUnique(resources.exercises, entry);
            }
        });

        return resources;
    }

    function splitSentences(text) {
        return String(text || '')
            .replace(/\s+/g, ' ')
            .split(/(?<=[.!?])\s+/)
            .map((item) => item.trim())
            .filter((item) => item.length > 35 && item.length < 220);
    }

    function createTopicQuiz(topic) {
        const sentences = splitSentences(topic.textContent || topic.summary || '');
        const base = sentences.length ? sentences : [
            `${topic.title} is a key topic in ${state.courseId} and should be understood with examples.`,
            `Practice and implementation improve understanding of ${topic.title}.`,
            `Core concepts in ${topic.title} are used in real-world development.`
        ];

        const selected = base.slice(0, Math.min(5, base.length));
        const fallbackPool = base.length > 1 ? base : [
            `Incorrect statement about ${topic.title}.`,
            `Another unrelated statement about ${topic.title}.`,
            `A misleading fact about ${topic.title}.`
        ];

        return selected.map((sentence, index) => {
            const incorrect = fallbackPool.filter(item => item !== sentence).slice(0, 3);
            while (incorrect.length < 3) {
                incorrect.push(`This option is not correct for ${topic.title}.`);
            }

            const options = [sentence, ...incorrect]
                .map((option) => option.length > 120 ? `${option.slice(0, 117)}...` : option)
                .sort(() => Math.random() - 0.5);

            return {
                question: `Q${index + 1}. Which statement is correct about ${topic.title}?`,
                options,
                answer: sentence.length > 120 ? `${sentence.slice(0, 117)}...` : sentence
            };
        });
    }

    function renderQuiz(topic, resources) {
        if (!quizContainer) return;

        const generatedQuiz = createTopicQuiz(topic);

        const quizCards = generatedQuiz.map((item, index) => {
            const optionsHtml = item.options.map((option, optionIndex) => {
                return `
                    <label style="display:block;padding:8px 10px;border:1px solid #334155;border-radius:8px;margin-bottom:8px;cursor:pointer;">
                        <input type="radio" name="quiz-${index}" value="${escapeHtml(option)}" style="margin-right:8px;">
                        <span>${escapeHtml(option)}</span>
                    </label>
                `;
            }).join('');

            return `
                <div class="card" style="margin-bottom:14px;">
                    <h4 style="margin:0 0 10px 0;">${escapeHtml(item.question)}</h4>
                    <div>${optionsHtml}</div>
                    <button class="btn-small" data-quiz-check="${index}" style="margin-top:6px;">Check Answer</button>
                    <div id="quiz-result-${index}" style="margin-top:8px;font-size:13px;color:#cbd5e1;"></div>
                </div>
            `;
        }).join('');

        const extraPractice = resources.quizzes.slice(0, 6).map((quiz, index) => {
            return `<li>Practice ${index + 1}: ${escapeHtml(quiz.title)}</li>`;
        }).join('') || '<li>More topic quiz practice will be generated as you switch lessons.</li>';

        quizContainer.innerHTML = `
            <div class="card" style="margin-bottom:14px;">
                <h3 style="margin:0 0 8px 0;">Topic Quiz: ${escapeHtml(topic.title)}</h3>
                <p style="margin:0;color:#94a3b8;">Questions are generated from scraped topic content.</p>
            </div>
            ${quizCards}
            <div class="card">
                <h4 style="margin:0 0 10px 0;">More In-Site Quiz Practice</h4>
                <ul style="margin:0;padding-left:20px;line-height:1.8;">${extraPractice}</ul>
            </div>
        `;

        generatedQuiz.forEach((item, index) => {
            const btn = quizContainer.querySelector(`[data-quiz-check="${index}"]`);
            if (!btn) return;

            btn.addEventListener('click', () => {
                const selected = quizContainer.querySelector(`input[name="quiz-${index}"]:checked`);
                const resultEl = document.getElementById(`quiz-result-${index}`);
                if (!resultEl) return;

                if (!selected) {
                    resultEl.style.color = '#f59e0b';
                    resultEl.textContent = 'Please select an option first.';
                    return;
                }

                if (selected.value === item.answer) {
                    resultEl.style.color = '#22c55e';
                    resultEl.textContent = 'Correct ✅';
                } else {
                    resultEl.style.color = '#ef4444';
                    resultEl.textContent = `Not correct. Correct answer: ${item.answer}`;
                }
            });
        });
    }

    function renderExercises(topic, resources) {
        if (!exerciseList) return;

        const items = resources.exercises.slice(0, 10);

        const topicWords = (topic.title || state.courseId)
            .split(/\s+/)
            .map((word) => word.trim())
            .filter(Boolean);

        const generatedExercises = [
            `Write a short explanation of ${topic.title} in your own words and include one practical use case.`,
            `Implement a basic ${topic.title} example in the compiler and verify the output with 3 test cases.`,
            `Refactor your solution to improve readability and add edge-case handling for ${topic.title}.`,
            `Create a mini challenge using ${topicWords.slice(0, 2).join(' ')} concepts and solve it.`
        ];

        const derivedExercises = items.map((exercise, index) => {
            return `Practice ${index + 1}: ${exercise.title}`;
        });

        const merged = [...generatedExercises, ...derivedExercises].slice(0, 10);

        const list = merged.map((exercise, index) => {
            return `
                <li style="margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:12px;">
                    <span>Exercise ${index + 1}: ${escapeHtml(exercise)}</span>
                    <button class="btn-small" data-exercise-code="${index}" style="white-space:nowrap;">Code in Compiler</button>
                </li>
            `;
        }).join('');

        exerciseList.innerHTML = `
            <div class="card">
                <h3 style="margin-top:0;">Topic Exercises (In-Website)</h3>
                <p style="color:#94a3b8;">No redirection required. Practice directly in this learning workspace.</p>
                <ul style="padding-left:20px; line-height:1.7; margin: 8px 0 0 0;">${list}</ul>
            </div>
        `;

        exerciseList.querySelectorAll('[data-exercise-code]').forEach((button) => {
            button.addEventListener('click', () => {
                const index = Number(button.getAttribute('data-exercise-code'));
                const selectedExercise = merged[index] || `Exercise ${index + 1}`;
                openTaskInCompiler('exercise', selectedExercise, topic.title);
            });
        });
    }

    function renderProjects(topic, resources) {
        if (!projectWorkspace) return;

        const projects = resources.projects.slice(0, 8);
        if (projects.length > 0) {
            const projectItems = projects.map((project, index) => {
                return `
                    <li style="margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:12px;">
                        <span>Project ${index + 1}: ${escapeHtml(project.title)}</span>
                        <button class="btn-small" data-project-code="${index}" style="white-space:nowrap;">Code in Compiler</button>
                    </li>
                `;
            }).join('');

            projectWorkspace.innerHTML = `
                <div class="card">
                    <h3 style="margin-top:0;">Topic Projects (In-Website)</h3>
                    <p style="color:#94a3b8;">Build these directly here using lecture + compiler tabs.</p>
                    <ul style="padding-left:20px; line-height:1.8; margin: 8px 0 0 0;">${projectItems}</ul>
                </div>
            `;

            projectWorkspace.querySelectorAll('[data-project-code]').forEach((button) => {
                button.addEventListener('click', () => {
                    const index = Number(button.getAttribute('data-project-code'));
                    const selectedProject = projects[index]?.title || `Project ${index + 1}`;
                    openTaskInCompiler('project', selectedProject, topic.title);
                });
            });
            return;
        }

        projectWorkspace.innerHTML = `
            <div class="card">
                <h3 style="margin-top:0;">Project for ${escapeHtml(topic.title)}</h3>
                <p style="color:#94a3b8;">No direct project links were found, so here is a topic-focused project idea:</p>
                <ol style="line-height:1.8; padding-left:20px;">
                    <li>Build a mini app demonstrating ${escapeHtml(topic.title)} concepts.</li>
                    <li>Create input/output flow and validations for user interaction.</li>
                    <li>Add one advanced feature and write brief usage notes.</li>
                    <li>Test with sample cases and improve edge-case handling.</li>
                </ol>
                <button class="btn-small" id="fallback-project-code-btn" style="margin-top:10px;">Code in Compiler</button>
            </div>
        `;

        const fallbackButton = document.getElementById('fallback-project-code-btn');
        if (fallbackButton) {
            fallbackButton.addEventListener('click', () => {
                openTaskInCompiler('project', `Build a mini app for ${topic.title}`, topic.title);
            });
        }
    }

    function renderTopicPractice(topic) {
        const resources = parseTopicResources(topic);
        renderQuiz(topic, resources);
        renderExercises(topic, resources);
        renderProjects(topic, resources);
    }

    function scrubBranding(text) {
        return String(text || '')
            .replace(/geeksforgeeks/gi, 'Learning Portal')
            .replace(/\bGFG\b/g, 'Learning Portal');
    }

    function scrubBrandingInDocument(doc) {
        const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
        const textNodes = [];

        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        textNodes.forEach((node) => {
            if (!node.nodeValue) return;
            node.nodeValue = scrubBranding(node.nodeValue);
        });
    }

    function sanitizeCourseHtml(rawHtml) {
        if (!rawHtml) return '<p>No content available.</p>';
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');

        doc.querySelectorAll('script, style, iframe, video, audio, source').forEach((node) => node.remove());

        doc.querySelectorAll('a').forEach((anchor) => {
            const rawHref = anchor.getAttribute('href') || '';
            let href = rawHref;
            if (href.startsWith('/')) {
                href = `https://www.geeksforgeeks.org${href}`;
            }

            const normalized = normalizeTopicUrl(href);
            if (normalized && (normalized.includes('geeksforgeeks.org') || state.topicUrlIndexMap.has(normalized))) {
                anchor.setAttribute('href', `#topic:${encodeURIComponent(normalized)}`);
            } else {
                anchor.setAttribute('href', '#');
            }

            anchor.removeAttribute('target');
            anchor.removeAttribute('rel');
        });

        scrubBrandingInDocument(doc);
        return doc.body.innerHTML;
    }

    function activateLessonByIndex(index) {
        const targetItem = lessonList.querySelector(`.lesson-item[data-topic-index="${index}"]`);
        if (targetItem) {
            lessonList.querySelectorAll('.lesson-item').forEach(item => item.classList.remove('active'));
            targetItem.classList.add('active');
        }
    }

    function normalizeCourseId(rawCourseId) {
        const normalized = (rawCourseId || 'javascript').toLowerCase();
        if (normalized === 'js') return 'javascript';
        if (normalized === 'node-js') return 'nodejs';
        if (normalized === 'react-js') return 'react';
        if (normalized === 'postgre-sql') return 'postgresql';
        if (normalized === 'html5') return 'html';
        if (normalized === 'css3') return 'css';
        if (normalized === 'ts') return 'typescript';
        if (normalized === 'c-programming') return 'c';
        return normalized;
    }

    async function fetchCourseContent() {
        const urlParams = new URLSearchParams(window.location.search);
        const requestedCourse = urlParams.get('course');
        state.courseId = normalizeCourseId(requestedCourse);

        if (overlayTitle) {
            overlayTitle.innerText = COURSE_TITLE_MAP[requestedCourse] || COURSE_TITLE_MAP[state.courseId] || 'Course Learning';
        }

        try {
            const scrapedRes = await fetch(`/api/courses/${state.courseId}/content`);
            if (!scrapedRes.ok) {
                throw new Error(`Unable to fetch course content (${scrapedRes.status})`);
            }

            state.scrapedTopics = await scrapedRes.json();
            state.topicUrlIndexMap = new Map(
                state.scrapedTopics.map((topic, index) => [normalizeTopicUrl(topic.url), index])
            );
            renderLessonList();
        } catch (error) {
            lessonList.innerHTML = '';
            lectureContent.innerHTML = '<h1>No course content available</h1><p>Please refresh the content data and try again.</p>';
            console.error(error);
        }
    }

    function renderLessonList() {
        lessonList.innerHTML = '';

        if (!Array.isArray(state.scrapedTopics) || state.scrapedTopics.length === 0) {
            lectureContent.innerHTML = '<h1>No topics found</h1><p>This course has no text topics yet.</p>';
            return;
        }

        const header = document.createElement('li');
        header.className = 'level-header';
        header.style.background = 'linear-gradient(90deg, rgba(59, 130, 246, 0.2), transparent)';
        header.innerHTML = '<i class="fa-solid fa-book-open"></i> COURSE TOPICS';
        lessonList.appendChild(header);

        state.scrapedTopics.forEach((topic, index) => {
            const li = document.createElement('li');
            li.classList.add('lesson-item');
            li.dataset.topicIndex = String(index);
            li.innerHTML = `<i class="fa-solid fa-book" style="color: var(--primary);"></i> ${topic.title}`;
            li.addEventListener('click', () => {
                document.querySelectorAll('.lesson-item').forEach(item => item.classList.remove('active'));
                li.classList.add('active');
                loadScrapedTopic(index);
            });
            lessonList.appendChild(li);
        });

        const firstLesson = lessonList.querySelector('.lesson-item');
        if (firstLesson && state.hasStarted) {
            firstLesson.click();
        }
    }

    function loadScrapedTopic(index) {
        const topic = state.scrapedTopics[index];
        if (!topic) return;
        state.currentTopicIndex = index;

        if (currentLesson) {
            currentLesson.innerText = topic.title;
        }

        let sourceHost = 'Web Source';
        try {
            sourceHost = topic.url ? new URL(topic.url).hostname : 'Web Source';
        } catch {
            sourceHost = 'Web Source';
        }

        const topicText = scrubBranding(topic.textContent || topic.summary || 'No text content available for this topic.');
        const articleHtml = sanitizeCourseHtml(topic.htmlContent);

        if (courseContentViewer) {
            courseContentViewer.innerHTML = `
                <div style="display:inline-block; padding: 4px 12px; background: #2563eb; color: white; border-radius: 20px; font-size: 0.8rem; font-weight: bold; margin-bottom: 15px;">
                    <i class="fa-solid fa-book"></i> COURSE CONTENT
                </div>
                <h2 style="margin: 0 0 8px 0;">${topic.title}</h2>
                <div>${articleHtml}</div>
            `;
            courseContentViewer.scrollTop = 0;
        }

        lectureContent.innerHTML = `
            <div class="deep-dive-badge" style="display:inline-block; padding: 4px 12px; background: #2563eb; color: white; border-radius: 20px; font-size: 0.8rem; font-weight: bold; margin-bottom: 15px;">
                <i class="fa-solid fa-graduation-cap"></i> TOPIC SUMMARY
            </div>
            <h1>${topic.title}</h1>
            <div style="background: rgba(255,255,255,0.02); padding: 25px; border-radius: 12px; border: 1px solid #334155; line-height: 1.8; white-space: pre-wrap;">${escapeHtml(topicText)}</div>
        `;

        lectureContent.scrollTop = 0;
        renderTopicPractice(topic);
    }

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            state.hasStarted = true;
            if (overlay) overlay.classList.add('hidden');

            const firstLesson = document.querySelector('.lesson-item');
            if (firstLesson) firstLesson.click();
        });
    }

    if (courseContentViewer) {
        courseContentViewer.addEventListener('click', (event) => {
            const anchor = event.target.closest('a');
            if (!anchor) return;
            event.preventDefault();

            const href = anchor.getAttribute('href') || '';
            if (!href.startsWith('#topic:')) return;

            const normalizedUrl = decodeURIComponent(href.replace('#topic:', ''));
            const topicIndex = state.topicUrlIndexMap.get(normalizedUrl);
            if (topicIndex === undefined) return;

            activateLessonByIndex(topicIndex);
            loadScrapedTopic(topicIndex);
        });
    }

    const toggleTheme = document.getElementById('toggle-theme');
    if (toggleTheme) {
        toggleTheme.addEventListener('click', () => {
            alert('Dark mode is active.');
        });
    }

    fetchCourseContent();
});
