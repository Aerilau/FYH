(() => {
  const HOST_ATTRIBUTE = 'data-procrastipet-work-nudge';
  const DISPLAY_MS = 9000;
  const WORK_KEYWORDS = [
    // Productivity Tools & Software
    'google docs', 'google sheets', 'google slides', 'exam', 'microsoft word', 'microsoft excel',
    'powerpoint', 'notion', 'trello', 'jira', 'asana', 'slack', 'microsoft teams',
    'zoom', 'canvas', 'blackboard', 'overleaf', 'figma', 'github', 'gitlab', 'linkedin',
    // Academic & Writing Terms
    'essay', 'thesis', 'assignment', 'homework', 'syllabus', 'citation', 'bibliography',
    'abstract', 'manuscript', 'dissertation', 'curriculum', 'rubric', 'paraphrase',
    'plagiarism', 'peer review', 'literature review', 'lab report', 'study guide',
    // Exams & Study Terminology
    'midterm', 'final exam', 'quiz', 'flashcards', 'memorize', 'study plan', 'cramming',
    'lecture notes', 'textbook', 'revision', 'practice test', 'gpa', 'transcript',
    // Corporate & Office Terminology
    'deadline', 'deliverable', 'invoice', 'quarterly', 'report', 'spreadsheet',
    'meeting minutes', 'agenda', 'presentation', 'action items', 'workflow', 'stakeholder',
    'key deliverables', 'milestone', 'project scope', 'onboarding', 'performance review',
    // Technical & Business Tasks
    'algorithm', 'code review', 'debugging', 'data analysis', 'documentation',
    'pull request', 'financial forecast', 'budget allocation', 'business plan',
    'market research', 'case study', 'proposal', 'executive summary', 'kpi', 'okr',
    // Common Action Phrases & UI Strings
    'submit assignment', 'turn in', 'file upload', 'save changes', 'share document',
    'export pdf', 'print preview', 'table of contents', 'track changes', 'spell check',
    'enter text here', 'version history', 'create issue', 'schedule meeting'
  ];
  const keywordPattern = new RegExp(`\\b(?:${WORK_KEYWORDS.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')).join('|')})\\b`, 'i');
  let shown = false;
  let host;
  let activeCard;
  let observer;
  let scanTimer;
  let removeTimer;

  function dismiss() {
    if (!host?.isConnected) return;
    clearTimeout(removeTimer);
    activeCard?.classList.add('is-leaving');
    const currentHost = host;
    removeTimer = window.setTimeout(() => {
      currentHost.remove();
      if (host === currentHost) {
        host = undefined;
        activeCard = undefined;
      }
    }, 240);
  }

  function show() {
    if (host?.isConnected || document.querySelector(`[${HOST_ATTRIBUTE}]`)) return;
    host = document.createElement('div');
    host.setAttribute(HOST_ATTRIBUTE, '');
    host.setAttribute('popover', 'manual');
    host.style.cssText = 'position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;z-index:2147483647!important;display:block!important;pointer-events:none!important;contain:layout style!important;isolation:isolate!important;';

    const shadow = host.attachShadow({ mode: 'closed' });
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = chrome.runtime.getURL('styles.css');
    shadow.append(stylesheet);

    const overlay = document.createElement('div');
    overlay.className = 'work-visit';
    const card = document.createElement('section');
    activeCard = card;
    card.className = 'work-card';
    card.setAttribute('role', 'alert');
    card.setAttribute('aria-live', 'assertive');

    const dialogue = document.createElement('div');
    dialogue.className = 'work-dialogue';
    const message = document.createElement('span');
    message.textContent = 'Hey, stop being a nerd, chill out.';
    const close = document.createElement('button');
    close.className = 'work-dismiss';
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss work reminder');
    close.textContent = '×';
    close.addEventListener('click', dismiss);
    dialogue.append(message, close);

    const sprite = document.createElement('img');
    sprite.className = 'work-snorlax';
    sprite.src = chrome.runtime.getURL('assets/work-snorlax.png');
    sprite.alt = 'Snorlax stretching with both arms raised';

    card.append(dialogue, sprite);
    overlay.append(card);
    shadow.append(overlay);
    document.documentElement.append(host);
    try { host.showPopover(); } catch { host.removeAttribute('popover'); }
    window.setTimeout(dismiss, DISPLAY_MS);
  }

  function scanPage() {
    if (shown) return;
    const text = `${document.title}\n${location.href}\n${document.body?.innerText || ''}`;
    if (!keywordPattern.test(text)) return;
    shown = true;
    observer?.disconnect();
    show();
  }

  scanPage();
  if (!shown && document.documentElement) {
    observer = new MutationObserver(() => {
      clearTimeout(scanTimer);
      scanTimer = window.setTimeout(scanPage, 700);
    });
    observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
  }
})();
