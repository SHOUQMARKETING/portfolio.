import type {FolderId, Lang, WorkSectionId} from '../types/portfolio';

export interface FolderConfig {
  id: FolderId;
  bg: string;
  fg: string;
  ln: string;
  o: number;
  ph: string;
}

export const FOLDERS: FolderConfig[] = [
  {id: 'social', bg: '#EBD9DD', fg: '#4E172A', ln: 'rgba(112,32,57,.07)', o: 7, ph: 'rgba(112,32,57,.14)'},
  {id: 'content', bg: '#CCABB4', fg: '#4E172A', ln: 'rgba(78,23,42,.08)', o: 7, ph: 'rgba(78,23,42,.16)'},
  {id: 'ugc', bg: '#702039', fg: '#FFFFFF', ln: 'rgba(255,255,255,.07)', o: 57, ph: 'rgba(255,255,255,.18)'},
  {id: 'about', bg: '#581A2E', fg: '#FFFFFF', ln: 'rgba(255,255,255,.06)', o: 7, ph: 'rgba(255,255,255,.2)'},
];

export const SERVICE_FOLDER_MAP: WorkSectionId[] = ['social', 'content', 'ugc'];

export interface ToolItem {
  n: string;
  r: Record<Lang, string>;
  a: string;
  b: string;
  g: string;
}

export const TOOLS: ToolItem[] = [
  {
    n: 'Claude',
    r: {ar: 'مساعدة بالذكاء الاصطناعي وتطوير المحتوى', en: 'AI Assistance & Content Development'},
    a: '#94324F',
    b: '#5C1B30',
    g: '<g stroke="#fff" stroke-width="4.5" stroke-linecap="round"><path d="M24 6v36M6 24h36M11.3 11.3l25.4 25.4M36.7 11.3L11.3 36.7"/></g>',
  },
  {
    n: 'ChatGPT',
    r: {ar: 'توليد الأفكار الإبداعية وكتابة النصوص', en: 'Creative Ideation & Copywriting'},
    a: '#7D2644',
    b: '#4A1526',
    g: '<g fill="none" stroke="#fff" stroke-width="3"><rect x="14" y="5" width="20" height="38" rx="10"/><rect x="14" y="5" width="20" height="38" rx="10" transform="rotate(60 24 24)"/><rect x="14" y="5" width="20" height="38" rx="10" transform="rotate(120 24 24)"/></g>',
  },
  {
    n: 'Notion',
    r: {ar: 'التخطيط والتنظيم', en: 'Planning & Organization'},
    a: '#702039',
    b: '#4E172A',
    g: '<rect x="9" y="8" width="30" height="32" rx="5" fill="none" stroke="#fff" stroke-width="3.5"/><path d="M17 33V16l14 16V16" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  {
    n: 'Trello',
    r: {ar: 'إدارة المشاريع والمهام', en: 'Project & Task Management'},
    a: '#8A2C4C',
    b: '#581A2E',
    g: '<rect x="8" y="8" width="32" height="32" rx="6" fill="none" stroke="#fff" stroke-width="3.5"/><rect x="14" y="14" width="8" height="20" rx="2" fill="#fff"/><rect x="26" y="14" width="8" height="11" rx="2" fill="#fff"/>',
  },
  {
    n: 'Buffer',
    r: {ar: 'جدولة السوشال ميديا', en: 'Social Media Scheduling'},
    a: '#66203A',
    b: '#3E1223',
    g: '<path d="M24 7l18 8.5L24 24 6 15.5z" fill="#fff"/><path d="M6 24l18 8.5L42 24M6 32.5L24 41l18-8.5" fill="none" stroke="#fff" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>',
  },
];

export interface ContactItem {
  n: Record<Lang, string>;
  v: string;
  u: string;
  a: string;
  b: string;
  g: string;
}

export const CONTACTS: ContactItem[] = [
  {
    n: {ar: 'واتساب', en: 'WhatsApp'},
    v: '0536435416',
    u: 'https://wa.me/966536435416',
    a: '#94324F',
    b: '#5C1B30',
    g: '<path d="M24 7a17 17 0 1 0 8.6 31.6L41 41l-2.6-8.3A17 17 0 0 0 24 7z" fill="none" stroke="#fff" stroke-width="3.5" stroke-linejoin="round"/><path d="M18 17c0 7 6 13 13 13l2-3-4-2-2 1.5c-2-1-4-3-5-5l1.5-2-2-4z" fill="#fff"/>',
  },
  {
    n: {ar: 'تيك توك', en: 'TikTok'},
    v: '@shouq.marketing',
    u: 'https://www.tiktok.com/@shouq.marketing',
    a: '#7D2644',
    b: '#4A1526',
    g: '<path d="M26 8v20.5a6 6 0 1 1-6-6M26 8c0 5 3.5 8 8 8" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  {
    n: {ar: 'لينكدإن', en: 'LinkedIn'},
    v: 'shouq-bazuhier',
    u: 'https://www.linkedin.com/in/shouq-bazuhier-38a997368',
    a: '#702039',
    b: '#4E172A',
    g: '<rect x="9" y="19" width="6" height="19" rx="1.5" fill="#fff"/><circle cx="12" cy="12" r="3.6" fill="#fff"/><path d="M21 38V19h6v3c1.5-2.5 4-3.5 6.5-3.5C38 18.5 40 21.5 40 26v12h-6V27c0-2.2-1-3.4-3-3.4s-4 1.4-4 4V38z" fill="#fff"/>',
  },
  {
    n: {ar: 'X (تويتر)', en: 'X (Twitter)'},
    v: '@shouqnwiq',
    u: 'https://x.com/shouqnwiq',
    a: '#8A2C4C',
    b: '#581A2E',
    g: '<path d="M10 8h10l18 32H28z" fill="#fff"/><path d="M38 8L10 40" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>',
  },
];

export const LOGO =
  'data:image/png;base64,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';

export interface TranslationPack {
  abp: string[];
  pm: string[];
  fin: string;
  hn: string;
  mm: string;
  mc: string;
  cue: string;
  th: string;
  tt: string;
  tp: string;
  sp: string;
  nw: string;
  ns: string;
  nc: string;
  tag: string;
  desc: string;
  loc: string;
  f: [string, string, string][];
  ph: string;
  ab: [string, string][];
  sl: string;
  sv: [string, string[]][];
  ch: string;
  cp: string;
  cn: string;
  ui: {
    addProject: string;
    editProjects: string;
    doneEditing: string;
    edit: string;
    remove: string;
    videoBadge: string;
    photosVideosCount: (n: number) => string;
    modalAddTitle: string;
    modalEditTitle: string;
    sectionLabel: string;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    mediaLabel: string;
    dropHint: string;
    chooseFiles: string;
    orUrl: string;
    addUrl: string;
    save: string;
    saving: string;
    uploading: string;
    cancel: string;
    close: string;
    prev: string;
    next: string;
    setCover: string;
    coverBadge: string;
    emptyMediaError: string;
    emptyTitleError: string;
    openWorks: string;
    coverLogoLabel: string;
    chooseLogo: string;
    removeLogo: string;
    worksMediaLabel: string;
    ugcMediaLabel: string;
    videoLinkPlaceholder: string;
    openVideoLink: string;
  };
}

export const T: Record<Lang, TranslationPack> = {
  ar: {
    abp: [
      'أنا شوق، أؤمن أن خلف كل فكرة حكاية تستحق أن تُروى، وخلف كل علامة تجارية هوية تستحق أن تُرى',
      'أحب أن أبحث عمّا يجعل *الفــكـــرة* مختلفة، وأحوّلها إلى محتوى يجمع بين *الإبـــداع* والهدف',
      'أرى التسويق مساحة للابتكار، والكلمات وسيلة لصناعة الانطباع، والمحتوى فرصة لترك *أثــــر* يتجاوز لحظة المشاهدة',
      'لا أبحث عن مجرد محتوى يُنشر، بل عن فكرة تصل، وتحكي، وتبقى',
    ],
    pm: ['على قَدْرِ أهلِ العزمِ تأتي العزائمُ', 'وتأتي على قَدْرِ الكرامِ المكارمُ', 'ــــــ المتنبي ــــــ'],
    fin: 'انتهت صفحات الملف، ولكن تبدأ الحكاية معكم',
    hn: 'للتواصل اضغط على الأيقونة',
    mm: 'القائمة',
    mc: 'إغلاق',
    cue: 'مرّر للأسفل',
    th: 'الأدوات',
    tt: 'الأدوات التي أعمل بها',
    tp: 'مؤقت · تُضاف من معلوماتك',
    sp: 'مؤقت',
    nw: 'ملف الأعمال',
    ns: 'الخدمات',
    nc: 'تواصل معي',
    tag: 'من فكرة تُلهم، إلى محتوى يصنع أثرًا',
    desc: 'أصنع وأدير محتوى رقميًا يجمع بين الفكرة والاستراتيجية، ليعكس هوية العلامة التجارية ويخدم أهدافها',
    loc: 'جدة، السعودية',
    f: [
      ['إدارة السوشال ميديا', 'إدارة وسائل التواصل الاجتماعي', 'إدارة حسابات التواصل الاجتماعي'],
      ['صناعة المحتوى', 'صناعة المحتوى', 'صناعة المحتوى وكتابة النصوص والأفكار الإبداعية'],
      ['محتوى UGC', 'تصوير وتجربة المنتجات', 'تجارب المنتجات ومحتوى UGC'],
      ['من أنا', 'من أنا', 'شوق، Social Media Manager & Content Creator، جدة'],
    ],
    ph: 'مساحة لأعمالك هنا · أضيفي صورك وفيديوهاتك في هذا القسم',
    ab: [
      ['التخصص', 'التسويق الإلكتروني'],
      ['المهارات', 'مؤقت · تُضاف من معلوماتك'],
      ['طريقتي في العمل', 'مؤقت · تُضاف من معلوماتك'],
    ],
    sl: 'الأعمال',
    sv: [
      ['إدارة وسائل التواصل الاجتماعي', ['بناء استراتيجية المحتوى', 'كتابة المحتوى', 'جدولة المنشورات', 'إدارة الحسابات', 'تحليل الأداء']],
      ['صناعة المحتوى', ['أفكار المحتوى', 'كتابة السكربتات', 'تصميم الكاروسيل', 'إعداد خطط المحتوى الشهرية']],
      ['تصوير وتجربة المنتجات', ['فتح وتجربة المنتجات', 'فيديوهات إعلانية', 'كتابة الأفكار والسكريبت', 'تصوير صور للمنتجات', 'محتوى Reels وTikTok']],
    ],
    ch: 'لنعمل معًا',
    cp: 'لديك علامة تجارية أو فكرة تحتاج إلى محتوى؟ يسعدني أن نبدأ التعاون',
    cn: 'وسائل التواصل تُضاف هنا · مؤقت',
    ui: {
      addProject: '+ إضافة مشروع',
      editProjects: 'إدارة المشاريع',
      doneEditing: 'معاينة الملف',
      edit: 'تعديل',
      remove: 'حذف',
      videoBadge: 'فيديو',
      photosVideosCount: (n: number) => `${n} ملفات`,
      modalAddTitle: 'إضافة مشروع جديد',
      modalEditTitle: 'تعديل المشروع',
      sectionLabel: 'القسم الخاص بالمشروع',
      titleAr: 'عنوان المشروع (بالعربية)',
      titleEn: 'عنوان المشروع (بالإنجليزية - اختياري)',
      descAr: 'وصف مختصر للمشروع (اختياري)',
      descEn: 'وصف بالإنجليزية (اختياري)',
      mediaLabel: 'الصور والفيديوهات',
      dropHint: 'اسحبي الصور أو الفيديوهات هنا، أو اختاريها من جهازك',
      chooseFiles: 'اختيار صور / فيديوهات',
      orUrl: 'أو أضيفي رابط صورة أو فيديو مباشرة',
      addUrl: 'إضافة الرابط',
      save: 'حفظ المشروع',
      saving: 'جاري الحفظ...',
      uploading: 'جاري رفع الملفات...',
      cancel: 'إلغاء',
      close: 'إغلاق',
      prev: 'السابق',
      next: 'التالي',
      setCover: 'تعيين كغلاف',
      coverBadge: 'الغلاف',
      emptyMediaError: 'يرجى إضافة صورة أو فيديو واحد على الأقل',
      emptyTitleError: 'يرجى كتابة عنوان للمشروع',
      openWorks: 'فتح',
      coverLogoLabel: 'شعار الحساب (صورة الغلاف)',
      chooseLogo: 'اختيار شعار الحساب',
      removeLogo: 'إزالة الشعار',
      worksMediaLabel: 'أعمال الحساب (صور وفيديوهات)',
      ugcMediaLabel: 'فيديوهات UGC',
      videoLinkPlaceholder: 'رابط الفيديو (اختياري)',
      openVideoLink: 'فتح الرابط',
    },
  },
  en: {
    abp: [
      'I’m Shouq. I believe behind every idea there’s a story worth telling, and behind every brand an identity worth seeing',
      'I love finding what makes an *idea* different, and turning it into content that blends *creativity* with purpose',
      'I see marketing as a space for innovation, words as a way to shape impressions, and content as a chance to leave an *impact* that outlasts the moment of viewing',
      'I’m not after content that simply gets published, but an idea that reaches, tells, and stays',
    ],
    pm: ['على قَدْرِ أهلِ العزمِ تأتي العزائمُ', 'وتأتي على قَدْرِ الكرامِ المكارمُ', 'ــــــ Al-Mutanabbi ــــــ'],
    fin: 'The portfolio pages end here, but the story begins with you',
    hn: 'To get in touch, tap an icon',
    mm: 'Menu',
    mc: 'Close',
    cue: 'Scroll down',
    th: 'Tools',
    tt: 'Tools I work with',
    tp: 'Placeholder · to be added from your details',
    sp: 'Placeholder',
    nw: 'Portfolio',
    ns: 'Services',
    nc: 'Contact me',
    tag: 'From an idea that inspires, to content that makes an impact',
    desc: 'I create and manage digital content that blends idea and strategy, to reflect a brand’s identity and serve its goals',
    loc: 'Jeddah, Saudi Arabia',
    f: [
      ['Social Media', 'Social Media Management', 'Managing social media accounts'],
      ['Content Creation', 'Content Creation', 'Content creation, copywriting, and creative ideas'],
      ['UGC Content', 'Product Shoots & Try-Outs', 'Product experiences and UGC content'],
      ['About Me', 'About Me', 'Shouq, Social Media Manager & Content Creator, Jeddah'],
    ],
    ph: 'Space for your work · Add photos and videos to this section',
    ab: [
      ['Specialization', 'Digital marketing'],
      ['Skills', 'Placeholder · to be added from your details'],
      ['How I work', 'Placeholder · to be added from your details'],
    ],
    sl: 'Work',
    sv: [
      ['Social Media Management', ['Content strategy', 'Content writing', 'Post scheduling', 'Account management', 'Performance analysis']],
      ['Content Creation', ['Content ideas', 'Script writing', 'Carousel design', 'Monthly content plans']],
      ['Product Shoots & Try-Outs', ['Unboxing and trying products', 'Ad videos', 'Ideas and scripts', 'Product photography', 'Reels and TikTok content']],
    ],
    ch: 'Let’s work together',
    cp: 'Have a brand or an idea that needs content? I’d be glad to collaborate',
    cn: 'Contact channels will be added here · Placeholder',
    ui: {
      addProject: '+ Add Project',
      editProjects: 'Manage Projects',
      doneEditing: 'Preview Mode',
      edit: 'Edit',
      remove: 'Delete',
      videoBadge: 'Video',
      photosVideosCount: (n: number) => `${n} items`,
      modalAddTitle: 'Add New Project',
      modalEditTitle: 'Edit Project',
      sectionLabel: 'Project Section',
      titleAr: 'Project Title (Arabic)',
      titleEn: 'Project Title (English - optional)',
      descAr: 'Short Brief (Arabic - optional)',
      descEn: 'Short Brief (English - optional)',
      mediaLabel: 'Photos & Videos',
      dropHint: 'Drag photos or videos here, or choose files from your device',
      chooseFiles: 'Choose Photos / Videos',
      orUrl: 'Or paste an image or video URL',
      addUrl: 'Add URL',
      save: 'Save Project',
      saving: 'Saving...',
      uploading: 'Uploading media...',
      cancel: 'Cancel',
      close: 'Close',
      prev: 'Previous',
      next: 'Next',
      setCover: 'Set as cover',
      coverBadge: 'Cover',
      emptyMediaError: 'Please add at least one photo or video',
      emptyTitleError: 'Please enter a project title',
      openWorks: 'Open',
      coverLogoLabel: 'Account Logo (Cover)',
      chooseLogo: 'Choose Account Logo',
      removeLogo: 'Remove Logo',
      worksMediaLabel: 'Account Works (Photos & Videos)',
      ugcMediaLabel: 'UGC Videos',
      videoLinkPlaceholder: 'Video link (optional)',
      openVideoLink: 'Open link',
    },
  },
};
