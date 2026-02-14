
export enum VideoType {
  SHORTS_60S = 'Shorts (60 ثانية)',
  MIN_2 = 'فيديو (2 دقيقة)',
  MIN_3 = 'فيديو (3 دقيقة)',
  MIN_4 = 'فيديو (4 دقيقة)',
  MIN_5 = 'فيديو (5 دقيقة)',
  MIN_6 = 'فيديو (6 دقيقة)',
  MIN_7 = 'فيديو (7 دقيقة)',
  MIN_8 = 'فيديو (8 دقيقة)',
  MIN_9 = 'فيديو (9 دقيقة)',
  MIN_10 = 'فيديو (10 دقيقة)',
}

export enum ScriptGoal {
  VIRAL = 'فيديو سريع الانتشار (Viral)',
  EDUCATIONAL = 'فيديو تعليمي قصصي (Educational)',
  VSL = 'فيديو بيعي (VSL Blueprint)',
  AUTO_CLASSIFY = 'تصنيف تلقائي (Let AI Classify)',
}

export enum ContentFormat {
  VSL = '(vsl)',
  CHALLENGES = 'التحديات والتجارب (Challenges & Experiments)',
  LISTS = 'القائمة / أفضل 5 أشياء (List / Top 5)',
  COMPARISON = 'المقارنة / الأغلى والأرخص (Comparison)',
  MYTH_BUSTING = 'كسر المعتقدات / تصحيح المفاهيم (Myth Busting)',
  WHAT_IF = 'ماذا لو؟ (What If Scenarios)',
  VIRAL_VSL = 'فيديو البيع القصصي / اختبار المنتج (Viral VSL / Product Test)',
  SKETCH = 'الاسكتش / الحوار (Sketch / Dialogue)',
  VLOGS = 'المسابقات / الفلوجات (Competitions / Vlogs)',
  QA = 'الأسئلة / المقابلات (Q&A / Interviews)',
}

export enum ScriptLanguage {
  EGYPTIAN = 'لهجة مصرية',
  SAUDI = 'لهجة سعودية',
  ARABIC = 'لغة عربية (فصحى)',
  ENGLISH = 'لغة انجليزية',
  ENGLISH_SLANG = 'لغة انجليزية عامية',
}

export enum ScriptMode {
  GENERATION = 'generation',
  FORMAT = 'format',
  EVALUATION = 'evaluation',
}

export enum CuriosityLevel {
  BEGINNER = 'مستوى مبتدئ (Beginner)',
  INTERMEDIATE = 'مستوى متوسط (Intermediate)',
  PROFESSIONAL = 'مستوى احترافي (Professional)',
}

export interface SuccessPattern {
  id: string;
  type: ScriptGoal;
  hookStyle: string;
  structure: string;
  pacing: string;
  persuasionTechnique: string;
  verifiedLink?: string;
}

export interface ScriptRequest {
  mode: ScriptMode;
  goal: ScriptGoal;
  selectedFormats?: ContentFormat[]; // تم التغيير ليدعم قائمة من الفورمات
  customTitle?: string;
  topic?: string;
  originalScript?: string;
  videoType: VideoType;
  language: ScriptLanguage;
  curiosityLevel: CuriosityLevel;
  domainContext?: string;
  domainFiles?: { mimeType: string; data: string }[];
  useSuccessfulPatterns?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  learnedPatterns?: SuccessPattern[];
  userStyleNotes?: string[];
}

export interface SavedScript {
  id: string;
  userId: string;
  text: string;
  goal: ScriptGoal;
  style?: string;
  domain?: string;
  date: string;
  status?: 'success' | 'weak';
  views?: string;
  link?: string;
  isVerified?: boolean;
  retentionAnalysis?: string;
}

export interface CurriculumModule {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  icon: string;
}
