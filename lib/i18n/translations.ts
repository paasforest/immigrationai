/**
 * ImmigrationAI — Client Portal Translation Dictionary
 *
 * Languages: English (en), French (fr), Portuguese (pt), Arabic (ar),
 *            Spanish (es), Mandarin Chinese (zh)
 *
 * Scope: Client-facing UI only — intake form, case portal, notifications.
 * Professional dashboard is English-only (business standard).
 *
 * To add a new language: add the ISO code to SUPPORTED_LANGUAGES and
 * add corresponding strings to each translation key.
 *
 * To add a new string: add the key to TranslationKey and fill in all 6 languages.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', dir: 'ltr' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', dir: 'ltr' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', dir: 'ltr' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

// ─────────────────────────────────────────────────────────────────────────────
// Translation dictionary
// ─────────────────────────────────────────────────────────────────────────────
export const translations: Record<string, Record<LanguageCode, string>> = {

  // ── Navigation / General ──────────────────────────────────────────────────
  'nav.home':               { en: 'Home', fr: 'Accueil', pt: 'Início', ar: 'الرئيسية', es: 'Inicio', zh: '首页' },
  'nav.findSpecialist':     { en: 'Find a Specialist', fr: 'Trouver un spécialiste', pt: 'Encontrar especialista', ar: 'ابحث عن متخصص', es: 'Buscar especialista', zh: '寻找专家' },
  'nav.login':              { en: 'Log In', fr: 'Se connecter', pt: 'Entrar', ar: 'تسجيل الدخول', es: 'Iniciar sesión', zh: '登录' },
  'nav.getStarted':         { en: 'Get Started', fr: 'Commencer', pt: 'Começar', ar: 'ابدأ الآن', es: 'Empezar', zh: '开始' },

  // ── Intake Form ───────────────────────────────────────────────────────────
  'intake.title':           { en: 'Start Your Immigration Journey', fr: 'Commencez votre parcours d\'immigration', pt: 'Inicie sua jornada de imigração', ar: 'ابدأ رحلتك للهجرة', es: 'Inicia tu proceso de inmigración', zh: '开始您的移民之旅' },
  'intake.subtitle':        { en: 'Tell us about your case and we\'ll match you with the right specialist.', fr: 'Parlez-nous de votre cas et nous vous mettrons en contact avec le bon spécialiste.', pt: 'Conte-nos sobre seu caso e vamos conectá-lo ao especialista certo.', ar: 'أخبرنا عن حالتك وسنوصلك بالمتخصص المناسب.', es: 'Cuéntenos su caso y lo conectaremos con el especialista adecuado.', zh: '告诉我们您的情况，我们将为您匹配合适的专家。' },
  'intake.name':            { en: 'Full Name', fr: 'Nom complet', pt: 'Nome completo', ar: 'الاسم الكامل', es: 'Nombre completo', zh: '全名' },
  'intake.email':           { en: 'Email Address', fr: 'Adresse e-mail', pt: 'Endereço de e-mail', ar: 'البريد الإلكتروني', es: 'Correo electrónico', zh: '电子邮件地址' },
  'intake.phone':           { en: 'Phone Number', fr: 'Numéro de téléphone', pt: 'Número de telefone', ar: 'رقم الهاتف', es: 'Número de teléfono', zh: '电话号码' },
  'intake.currentCountry':  { en: 'Current Country', fr: 'Pays actuel', pt: 'País atual', ar: 'الدولة الحالية', es: 'País actual', zh: '当前所在国家' },
  'intake.destination':     { en: 'Destination Country', fr: 'Pays de destination', pt: 'País de destino', ar: 'الدولة المقصودة', es: 'País de destino', zh: '目标国家' },
  'intake.service':         { en: 'Type of Service Needed', fr: 'Type de service requis', pt: 'Tipo de serviço necessário', ar: 'نوع الخدمة المطلوبة', es: 'Tipo de servicio necesario', zh: '所需服务类型' },
  'intake.description':     { en: 'Tell us about your situation', fr: 'Parlez-nous de votre situation', pt: 'Conte-nos sobre sua situação', ar: 'أخبرنا عن وضعك', es: 'Cuéntenos su situación', zh: '告诉我们您的情况' },
  'intake.urgency':         { en: 'How urgent is your case?', fr: 'Quelle est l\'urgence de votre cas ?', pt: 'Qual é a urgência do seu caso?', ar: 'ما مدى إلحاح حالتك؟', es: '¿Qué tan urgente es su caso?', zh: '您的案例有多紧急？' },
  'intake.urgencyNormal':   { en: 'Normal — no specific deadline', fr: 'Normal — pas de délai précis', pt: 'Normal — sem prazo específico', ar: 'عادي — لا يوجد موعد نهائي محدد', es: 'Normal — sin fecha límite específica', zh: '普通 — 没有特定截止日期' },
  'intake.urgencySoon':     { en: 'Soon — within 3–6 months', fr: 'Bientôt — dans 3 à 6 mois', pt: 'Em breve — em 3 a 6 meses', ar: 'قريبًا — خلال 3 إلى 6 أشهر', es: 'Pronto — en 3 a 6 meses', zh: '较快 — 3到6个月内' },
  'intake.urgencyUrgent':   { en: 'Urgent — within 1–3 months', fr: 'Urgent — dans 1 à 3 mois', pt: 'Urgente — em 1 a 3 meses', ar: 'عاجل — خلال 1 إلى 3 أشهر', es: 'Urgente — en 1 a 3 meses', zh: '紧急 — 1到3个月内' },
  'intake.urgencyEmergency':{ en: 'Emergency — within 30 days', fr: 'Urgence — dans 30 jours', pt: 'Emergência — em 30 dias', ar: 'طارئ — خلال 30 يومًا', es: 'Emergencia — en 30 días', zh: '紧急 — 30天内' },
  'intake.language':        { en: 'Your preferred language', fr: 'Votre langue préférée', pt: 'Seu idioma preferido', ar: 'لغتك المفضلة', es: 'Su idioma preferido', zh: '您的首选语言' },
  'intake.submit':          { en: 'Submit Request', fr: 'Soumettre la demande', pt: 'Enviar pedido', ar: 'إرسال الطلب', es: 'Enviar solicitud', zh: '提交申请' },
  'intake.submitting':      { en: 'Submitting...', fr: 'Envoi en cours...', pt: 'Enviando...', ar: 'جار الإرسال...', es: 'Enviando...', zh: '提交中...' },
  'intake.successTitle':    { en: 'Request Submitted Successfully', fr: 'Demande soumise avec succès', pt: 'Pedido enviado com sucesso', ar: 'تم إرسال الطلب بنجاح', es: 'Solicitud enviada con éxito', zh: '申请提交成功' },
  'intake.successBody':     { en: 'A specialist will review your case and be in touch within 24–48 hours.', fr: 'Un spécialiste examinera votre dossier et vous contactera sous 24 à 48 heures.', pt: 'Um especialista analisará seu caso e entrará em contato em 24 a 48 horas.', ar: 'سيقوم متخصص بمراجعة حالتك والتواصل معك خلال 24 إلى 48 ساعة.', es: 'Un especialista revisará su caso y se comunicará con usted en 24 a 48 horas.', zh: '专家将在24至48小时内审查您的案例并与您联系。' },
  'intake.required':        { en: 'This field is required', fr: 'Ce champ est obligatoire', pt: 'Este campo é obrigatório', ar: 'هذا الحقل مطلوب', es: 'Este campo es obligatorio', zh: '此字段为必填项' },

  // ── Case Portal (Client View) ─────────────────────────────────────────────
  'case.myCase':            { en: 'My Case', fr: 'Mon dossier', pt: 'Meu caso', ar: 'قضيتي', es: 'Mi caso', zh: '我的案例' },
  'case.status':            { en: 'Case Status', fr: 'Statut du dossier', pt: 'Status do caso', ar: 'حالة القضية', es: 'Estado del caso', zh: '案例状态' },
  'case.documents':         { en: 'Documents', fr: 'Documents', pt: 'Documentos', ar: 'المستندات', es: 'Documentos', zh: '文件' },
  'case.messages':          { en: 'Messages', fr: 'Messages', pt: 'Mensagens', ar: 'الرسائل', es: 'Mensajes', zh: '消息' },
  'case.tasks':             { en: 'Tasks', fr: 'Tâches', pt: 'Tarefas', ar: 'المهام', es: 'Tareas', zh: '任务' },
  'case.timeline':          { en: 'Timeline', fr: 'Calendrier', pt: 'Cronograma', ar: 'الجدول الزمني', es: 'Cronograma', zh: '时间线' },
  'case.yourSpecialist':    { en: 'Your Specialist', fr: 'Votre spécialiste', pt: 'Seu especialista', ar: 'متخصصك', es: 'Su especialista', zh: '您的专家' },
  'case.uploadDoc':         { en: 'Upload Document', fr: 'Télécharger un document', pt: 'Enviar documento', ar: 'رفع مستند', es: 'Subir documento', zh: '上传文件' },
  'case.sendMessage':       { en: 'Send Message', fr: 'Envoyer un message', pt: 'Enviar mensagem', ar: 'إرسال رسالة', es: 'Enviar mensaje', zh: '发送消息' },
  'case.noMessages':        { en: 'No messages yet', fr: 'Pas encore de messages', pt: 'Nenhuma mensagem ainda', ar: 'لا توجد رسائل بعد', es: 'No hay mensajes aún', zh: '暂无消息' },
  'case.typingPlaceholder': { en: 'Type a message...', fr: 'Tapez un message...', pt: 'Digite uma mensagem...', ar: 'اكتب رسالة...', es: 'Escribe un mensaje...', zh: '输入消息...' },

  // ── Status labels ─────────────────────────────────────────────────────────
  'status.pending':         { en: 'Pending', fr: 'En attente', pt: 'Pendente', ar: 'قيد الانتظار', es: 'Pendiente', zh: '待处理' },
  'status.active':          { en: 'Active', fr: 'Actif', pt: 'Ativo', ar: 'نشط', es: 'Activo', zh: '进行中' },
  'status.submitted':       { en: 'Submitted', fr: 'Soumis', pt: 'Enviado', ar: 'مُقدَّم', es: 'Enviado', zh: '已提交' },
  'status.approved':        { en: 'Approved', fr: 'Approuvé', pt: 'Aprovado', ar: 'موافق عليه', es: 'Aprobado', zh: '已批准' },
  'status.rejected':        { en: 'Rejected', fr: 'Rejeté', pt: 'Rejeitado', ar: 'مرفوض', es: 'Rechazado', zh: '已拒绝' },
  'status.onHold':          { en: 'On Hold', fr: 'En suspens', pt: 'Em espera', ar: 'معلق', es: 'En espera', zh: '暂停' },
  'status.closed':          { en: 'Closed', fr: 'Clôturé', pt: 'Encerrado', ar: 'مغلق', es: 'Cerrado', zh: '已关闭' },

  // ── Document categories (for translated checklist) ────────────────────────
  'doc.identity':           { en: 'Identity', fr: 'Identité', pt: 'Identidade', ar: 'الهوية', es: 'Identidad', zh: '身份' },
  'doc.financial':          { en: 'Financial', fr: 'Financier', pt: 'Financeiro', ar: 'المالي', es: 'Financiero', zh: '财务' },
  'doc.employment':         { en: 'Employment', fr: 'Emploi', pt: 'Emprego', ar: 'التوظيف', es: 'Empleo', zh: '就业' },
  'doc.academic':           { en: 'Academic', fr: 'Académique', pt: 'Acadêmico', ar: 'الأكاديمي', es: 'Académico', zh: '学历' },
  'doc.policelearance':     { en: 'Police Clearance', fr: 'Casier judiciaire', pt: 'Antecedentes criminais', ar: 'شهادة حسن السيرة', es: 'Antecedentes penales', zh: '无犯罪记录证明' },
  'doc.medical':            { en: 'Medical', fr: 'Médical', pt: 'Médico', ar: 'طبي', es: 'Médico', zh: '医疗' },
  'doc.sponsorship':        { en: 'Sponsorship', fr: 'Parrainage', pt: 'Patrocínio', ar: 'الكفالة', es: 'Patrocinio', zh: '担保' },
  'doc.credentials':        { en: 'Credentials', fr: 'Qualifications', pt: 'Credenciais', ar: 'المؤهلات', es: 'Credenciales', zh: '资质' },
  'doc.required':           { en: 'Required', fr: 'Obligatoire', pt: 'Obrigatório', ar: 'مطلوب', es: 'Requerido', zh: '必需' },
  'doc.optional':           { en: 'Optional', fr: 'Facultatif', pt: 'Opcional', ar: 'اختياري', es: 'Opcional', zh: '可选' },
  'doc.certTranslation':    { en: 'Certified translation required', fr: 'Traduction certifiée requise', pt: 'Tradução certificada necessária', ar: 'مطلوب ترجمة معتمدة', es: 'Se requiere traducción certificada', zh: '需要经认证的翻译' },

  // ── Notifications ─────────────────────────────────────────────────────────
  'notif.caseAccepted':     { en: 'Your case has been accepted by a specialist', fr: 'Votre dossier a été accepté par un spécialiste', pt: 'Seu caso foi aceito por um especialista', ar: 'تم قبول قضيتك من قبل متخصص', es: 'Su caso ha sido aceptado por un especialista', zh: '您的案例已被专家受理' },
  'notif.docRequired':      { en: 'A document has been requested', fr: 'Un document a été demandé', pt: 'Um documento foi solicitado', ar: 'تم طلب مستند', es: 'Se ha solicitado un documento', zh: '已请求提供文件' },
  'notif.statusChanged':    { en: 'Your case status has been updated', fr: 'Le statut de votre dossier a été mis à jour', pt: 'O status do seu caso foi atualizado', ar: 'تم تحديث حالة قضيتك', es: 'El estado de su caso ha sido actualizado', zh: '您的案例状态已更新' },
  'notif.newMessage':       { en: 'You have a new message', fr: 'Vous avez un nouveau message', pt: 'Você tem uma nova mensagem', ar: 'لديك رسالة جديدة', es: 'Tiene un nuevo mensaje', zh: '您有一条新消息' },

  // ── Portal Dashboard ─────────────────────────────────────────────────────
  'portal.noCasesTitle':    { en: 'No cases yet', fr: 'Aucun dossier pour l\'instant', pt: 'Nenhum caso ainda', ar: 'لا توجد قضايا بعد', es: 'Aún no hay casos', zh: '暂无案例' },
  'portal.noCasesBody':     { en: 'Your consultant will create your case. Nothing to do yet!', fr: 'Votre consultant créera votre dossier. Rien à faire pour l\'instant !', pt: 'Seu consultor criará seu caso. Nada a fazer por enquanto!', ar: 'سينشئ مستشارك قضيتك. لا يوجد شيء تفعله الآن!', es: 'Su consultor creará su caso. ¡Nada que hacer aún!', zh: '您的顾问将创建您的案例。暂时不需要任何操作！' },
  'portal.pendingDocs':     { en: 'Pending Documents', fr: 'Documents en attente', pt: 'Documentos pendentes', ar: 'المستندات المعلقة', es: 'Documentos pendientes', zh: '待处理文件' },
  'portal.moreItems':       { en: 'more items', fr: 'autres éléments', pt: 'mais itens', ar: 'عناصر أخرى', es: 'más elementos', zh: '更多项目' },
  'portal.appProgress':     { en: 'Application Progress', fr: 'Progression de la demande', pt: 'Progresso da candidatura', ar: 'تقدم الطلب', es: 'Progreso de la solicitud', zh: '申请进度' },
  'portal.overallProgress': { en: 'Overall Progress', fr: 'Progression globale', pt: 'Progresso geral', ar: 'التقدم الإجمالي', es: 'Progreso general', zh: '总体进度' },
  'portal.activeCases':     { en: 'Active Cases', fr: 'Dossiers actifs', pt: 'Casos ativos', ar: 'القضايا النشطة', es: 'Casos activos', zh: '进行中案例' },
  'portal.pendingItems':    { en: 'Pending Items', fr: 'Éléments en attente', pt: 'Itens pendentes', ar: 'العناصر المعلقة', es: 'Elementos pendientes', zh: '待处理项目' },
  'portal.unreadMessages':  { en: 'Unread Messages', fr: 'Messages non lus', pt: 'Mensagens não lidas', ar: 'الرسائل غير المقروءة', es: 'Mensajes no leídos', zh: '未读消息' },
  'portal.specialist':      { en: 'Your Specialist', fr: 'Votre spécialiste', pt: 'Seu especialista', ar: 'متخصصك', es: 'Su especialista', zh: '您的专家' },
  'portal.caseStatus':      { en: 'Case Status', fr: 'Statut du dossier', pt: 'Status do caso', ar: 'حالة القضية', es: 'Estado del caso', zh: '案例状态' },
  'portal.timeline':        { en: 'Timeline', fr: 'Calendrier', pt: 'Cronograma', ar: 'الجدول الزمني', es: 'Cronograma', zh: '时间线' },

  // ── Case Portal Stages ───────────────────────────────────────────────────
  'stage.created':          { en: 'Case Created', fr: 'Dossier créé', pt: 'Caso criado', ar: 'تم إنشاء القضية', es: 'Caso creado', zh: '案例已创建' },
  'stage.documents':        { en: 'Documents Collected', fr: 'Documents collectés', pt: 'Documentos coletados', ar: 'المستندات المجمعة', es: 'Documentos recopilados', zh: '文件已收集' },
  'stage.submitted':        { en: 'Application Submitted', fr: 'Demande soumise', pt: 'Pedido enviado', ar: 'تم تقديم الطلب', es: 'Solicitud enviada', zh: '申请已提交' },
  'stage.decision':         { en: 'Decision', fr: 'Décision', pt: 'Decisão', ar: 'القرار', es: 'Decisión', zh: '决定' },
  'stage.current':          { en: 'Current stage', fr: 'Étape actuelle', pt: 'Etapa atual', ar: 'المرحلة الحالية', es: 'Etapa actual', zh: '当前阶段' },

  // ── Messages Portal ───────────────────────────────────────────────────────
  'messages.title':         { en: 'Messages', fr: 'Messages', pt: 'Mensagens', ar: 'الرسائل', es: 'Mensajes', zh: '消息' },
  'messages.subtitle':      { en: 'Communicate with your immigration consultant', fr: 'Communiquez avec votre consultant en immigration', pt: 'Comunique-se com seu consultor de imigração', ar: 'تواصل مع مستشار الهجرة الخاص بك', es: 'Comuníquese con su consultor de inmigración', zh: '与您的移民顾问沟通' },
  'messages.yourCases':     { en: 'Your Cases', fr: 'Vos dossiers', pt: 'Seus casos', ar: 'قضاياك', es: 'Sus casos', zh: '您的案例' },
  'messages.search':        { en: 'Search cases...', fr: 'Rechercher des dossiers...', pt: 'Pesquisar casos...', ar: 'البحث عن قضايا...', es: 'Buscar casos...', zh: '搜索案例...' },
  'messages.selectCase':    { en: 'Select a case to view messages', fr: 'Sélectionnez un dossier pour voir les messages', pt: 'Selecione um caso para ver as mensagens', ar: 'حدد قضية لعرض الرسائل', es: 'Seleccione un caso para ver mensajes', zh: '选择案例查看消息' },
  'messages.consultantSee': { en: 'Your consultant can see everything you send here', fr: 'Votre consultant peut voir tout ce que vous envoyez ici', pt: 'Seu consultor pode ver tudo que você enviar aqui', ar: 'يمكن لمستشارك رؤية كل ما ترسله هنا', es: 'Su consultor puede ver todo lo que envíe aquí', zh: '您的顾问可以看到您在这里发送的所有内容' },
  'messages.updated':       { en: 'Updated', fr: 'Mis à jour', pt: 'Atualizado', ar: 'تم التحديث', es: 'Actualizado', zh: '已更新' },
  'messages.backToCases':   { en: 'Back to Cases', fr: 'Retour aux dossiers', pt: 'Voltar aos casos', ar: 'العودة إلى القضايا', es: 'Volver a los casos', zh: '返回案例' },
  'messages.noCases':       { en: 'No cases found', fr: 'Aucun dossier trouvé', pt: 'Nenhum caso encontrado', ar: 'لم يتم العثور على قضايا', es: 'No se encontraron casos', zh: '未找到案例' },

  // ── General UI ────────────────────────────────────────────────────────────
  'ui.save':                { en: 'Save', fr: 'Enregistrer', pt: 'Salvar', ar: 'حفظ', es: 'Guardar', zh: '保存' },
  'ui.cancel':              { en: 'Cancel', fr: 'Annuler', pt: 'Cancelar', ar: 'إلغاء', es: 'Cancelar', zh: '取消' },
  'ui.submit':              { en: 'Submit', fr: 'Soumettre', pt: 'Enviar', ar: 'إرسال', es: 'Enviar', zh: '提交' },
  'ui.loading':             { en: 'Loading...', fr: 'Chargement...', pt: 'Carregando...', ar: 'جار التحميل...', es: 'Cargando...', zh: '加载中...' },
  'ui.error':               { en: 'Something went wrong. Please try again.', fr: 'Une erreur s\'est produite. Veuillez réessayer.', pt: 'Algo deu errado. Por favor, tente novamente.', ar: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.', es: 'Algo salió mal. Por favor, inténtelo de nuevo.', zh: '出了点问题，请再试一次。' },
  'ui.back':                { en: 'Back', fr: 'Retour', pt: 'Voltar', ar: 'رجوع', es: 'Atrás', zh: '返回' },
  'ui.viewAll':             { en: 'View All', fr: 'Voir tout', pt: 'Ver tudo', ar: 'عرض الكل', es: 'Ver todo', zh: '查看全部' },
  'ui.close':               { en: 'Close', fr: 'Fermer', pt: 'Fechar', ar: 'إغلاق', es: 'Cerrar', zh: '关闭' },
  'ui.next':                { en: 'Next', fr: 'Suivant', pt: 'Próximo', ar: 'التالي', es: 'Siguiente', zh: '下一步' },
  'ui.previous':            { en: 'Previous', fr: 'Précédent', pt: 'Anterior', ar: 'السابق', es: 'Anterior', zh: '上一步' },
  'ui.yes':                 { en: 'Yes', fr: 'Oui', pt: 'Sim', ar: 'نعم', es: 'Sí', zh: '是' },
  'ui.no':                  { en: 'No', fr: 'Non', pt: 'Não', ar: 'لا', es: 'No', zh: '否' },
};

/**
 * Get a translated string.
 * Falls back to English if the key or language is not found.
 */
export function t(key: string, lang: LanguageCode = 'en'): string {
  const entry = translations[key];
  if (!entry) return key; // Return key as fallback so missing strings are obvious
  return entry[lang] ?? entry['en'] ?? key;
}

/**
 * Get the text direction for a language.
 */
export function getTextDir(lang: LanguageCode): 'ltr' | 'rtl' {
  const found = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
  return (found?.dir ?? 'ltr') as 'ltr' | 'rtl';
}

/**
 * Detect language from browser or stored preference.
 * Returns a supported language code, defaulting to 'en'.
 */
export function detectLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'en';

  // 1. Check localStorage preference
  const stored = localStorage.getItem('preferredLanguage') as LanguageCode | null;
  if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) return stored;

  // 2. Browser language
  const browserLang = navigator.language?.split('-')[0] as LanguageCode;
  if (SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) return browserLang;

  return 'en';
}
