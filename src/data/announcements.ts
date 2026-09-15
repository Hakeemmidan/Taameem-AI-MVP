import type { Announcement } from '@/lib/types';
import type { SectorId } from './tenants';

/**
 * What the regulators published. A letter only reaches an institution whose
 * sector it actually binds, so a bank never sees an Insurance Authority
 * circular and an insurer never sees a market conduct amendment.
 */
export const ANNOUNCEMENTS: Announcement[] = [
  /* ------------------------------------------------------------ banks --- */
  {
    id: 'ANN-2026-0912',
    reference: 'SAMA/BC/2026/41',
    sectors: ['bank'],
    regulator: 'sama',
    title: {
      en: 'Instructions for Handling Customer Complaints — second edition',
      ar: 'تعليمات معالجة شكاوى العملاء — الإصدار الثاني',
    },
    issued: '2026-09-12',
    received: '2026-09-12T09:05:00',
    deadline: '2026-11-11',
    appliesTo: {
      en: 'Banks, finance companies and payment service providers licensed by the Saudi Central Bank.',
      ar: 'البنوك وشركات التمويل ومقدمو خدمات المدفوعات المرخصون من البنك المركزي السعودي.',
    },
    status: 'new',
    pages: 9,
    sourceFile: 'SAMA_BC_2026_41_Customer-Complaints-Instructions-2nd-Edition_AR.pdf',
    body: [
      { ref: 'p.0', text: { ar: 'بناءً على الصلاحيات الممنوحة للبنك المركزي السعودي بموجب نظامه ونظام مراقبة البنوك، وسعياً لرفع جودة معالجة شكاوى العملاء لدى الجهات الخاضعة لرقابته وإشرافه، يصدر البنك المركزي الإصدار الثاني من تعليمات معالجة شكاوى العملاء، على أن يُعمل بها اعتباراً من التاريخ المحدد في المادة العاشرة.', en: 'Pursuant to the powers granted to the Saudi Central Bank under its Law and the Banking Control Law, and in order to raise the quality of customer complaint handling at supervised entities, the Central Bank issues the second edition of the Instructions for Handling Customer Complaints, effective from the date set out in Article Ten.' } },
      { ref: 'م-1', text: { ar: 'المادة الأولى — النطاق: تسري هذه التعليمات على جميع البنوك وشركات التمويل ومقدمي خدمات المدفوعات المرخصين، وعلى الشكاوى الواردة من العملاء الأفراد والمنشآت متناهية الصغر والصغيرة، أياً كانت قناة استلامها، بما في ذلك الشكاوى الواردة عبر مزودي الخدمات المسندة.', en: 'Article One — Scope: These instructions apply to all licensed banks, finance companies and payment service providers, and to complaints received from individual customers and micro and small enterprises, through any channel of receipt, including complaints received through outsourced service providers.' } },
      { ref: 'م-2', text: { ar: 'المادة الثانية — التعريفات: يُقصد بيوم العمل أي يوم تكون فيه الجهة مفتوحة للعمل باستثناء العطل الرسمية ونهاية الأسبوع. ويُقصد بالشكوى أي تعبير عن عدم الرضا يقدمه العميل بشأن منتج أو خدمة أو رسم أو سلوك موظف، سواء كانت مبررة أم لا.', en: 'Article Two — Definitions: A working day means any day on which the entity is open for business, excluding official holidays and weekends. A complaint means any expression of dissatisfaction submitted by a customer regarding a product, service, fee or employee conduct, whether justified or not.' } },
      { ref: 'م-3-أ', text: { ar: 'المادة الثالثة (أ) — يجب على الجهة معالجة شكوى العميل وإنهاؤها خلال مدة لا تتجاوز خمسة أيام عمل من تاريخ استلامها، بدلاً من المدة المنصوص عليها في الإصدار الأول.', en: 'Article Three (a) — The entity must handle and close a customer complaint within a period not exceeding five working days from the date of receipt, replacing the period stated in the first edition.' } },
      { ref: 'م-3-ب', text: { ar: 'المادة الثالثة (ب) — يجب إشعار العميل برقم مرجعي للشكوى فور استلامها عبر رسالة نصية إلى رقم الجوال المسجل، على أن يتضمن الإشعار المدة المتوقعة للمعالجة.', en: 'Article Three (b) — The customer must be notified of a complaint reference number immediately upon receipt, by text message to the registered mobile number, and the notification must state the expected handling period.' } },
      { ref: 'م-3-ج', text: { ar: 'المادة الثالثة (ج) — يجوز تمديد مدة المعالجة مرة واحدة ولمدة لا تتجاوز خمسة أيام عمل إضافية في الشكاوى التي تتطلب التحقيق مع طرف ثالث، شريطة إشعار العميل بالسبب وبالموعد الجديد قبل انقضاء المدة الأصلية.', en: 'Article Three (c) — The handling period may be extended once, for no more than five additional working days, for complaints requiring investigation with a third party, provided the customer is notified of the reason and the new date before the original period expires.' } },
      { ref: 'م-4', text: { ar: 'المادة الرابعة — يجب أن يتضمن نظام إدارة الشكاوى لدى الجهة عدّاداً آلياً لأيام العمل لكل شكوى، وتنبيهاً آلياً للموظف المسؤول ولرئيسه المباشر قبل انقضاء المدة بيوم عمل واحد.', en: 'Article Four — The complaints management system must include an automated working-day counter for each complaint, and an automated alert to the responsible employee and their direct manager one working day before the period expires.' } },
      { ref: 'م-5', text: { ar: 'المادة الخامسة — يحظر إغلاق الشكوى دون إبلاغ العميل بنتيجتها وأسبابها وبحقه في رفع الشكوى إلى البنك المركزي في حال عدم رضاه، ويجب أن يحتفظ سجل الشكوى بما يثبت هذا الإبلاغ.', en: 'Article Five — Closing a complaint is prohibited without informing the customer of the outcome, its reasons and the right to raise the complaint with the Central Bank if dissatisfied; the record must retain evidence of that notification.' } },
      { ref: 'م-6', text: { ar: 'المادة السادسة — يجب على الجهة رفع تقرير ربع سنوي إلى البنك المركزي يتضمن عدد الشكاوى المستلمة والمغلقة ومتوسط مدة المعالجة ونسبة الشكاوى المتجاوزة للمدة، خلال خمسة عشر يوماً من نهاية كل ربع.', en: 'Article Six — A quarterly report must be submitted to the Central Bank stating complaints received and closed, the average handling period and the percentage exceeding the period, within fifteen days of quarter end.' } },
      { ref: 'م-7', text: { ar: 'المادة السابعة — يجب تدريب جميع الموظفين الذين يتعاملون مع العملاء على هذه التعليمات خلال ستين يوماً من تاريخ العمل بها، والاحتفاظ بسجلات التدريب لغرض التفتيش.', en: 'Article Seven — All customer-facing employees must be trained on these instructions within sixty days of the effective date, and training records retained for inspection.' } },
      { ref: 'م-8', text: { ar: 'المادة الثامنة — يجب تحديث جميع القوالب والنصوص الموجهة للعملاء التي تشير إلى مدد معالجة الشكاوى، بما في ذلك الرسائل النصية وشاشات التطبيق وصفحات الموقع الإلكتروني وشروط الخدمة، بما يتوافق مع المدة الجديدة.', en: 'Article Eight — All customer-facing templates and texts referring to complaint handling periods must be updated, including text messages, application screens, website pages and terms of service.' } },
      { ref: 'م-9', text: { ar: 'المادة التاسعة — تتحمل الجهة المسؤولية الكاملة عن الشكاوى الواردة عبر مزودي الخدمات المسندة، ويجب أن تتضمن عقود الإسناد التزام المزود بتحويل الشكوى في يوم العمل ذاته.', en: 'Article Nine — The entity bears full responsibility for complaints received through outsourced providers, and outsourcing contracts must oblige the provider to transfer the complaint on the same working day.' } },
      { ref: 'م-10', text: { ar: 'المادة العاشرة — يُعمل بهذه التعليمات بعد ستين يوماً من تاريخ نشرها، وتحل محل الإصدار الأول الصادر في عام ١٤٤٥هـ.', en: 'Article Ten — These instructions come into force sixty days after publication and supersede the first edition issued in 1445H.' } },
    ],
  },
  {
    id: 'ANN-2026-0901',
    reference: 'SAMA/OB/2026/12',
    sectors: ['bank'],
    regulator: 'sama',
    title: { en: 'Open Banking Service Providers: Reporting Template', ar: 'مقدمو خدمات الانفتاح المصرفي: نموذج التقارير' },
    issued: '2026-09-01',
    received: '2026-09-01T11:20:00',
    deadline: '2026-10-31',
    appliesTo: { en: 'Payment service providers and account information service providers.', ar: 'مقدمو خدمات المدفوعات ومقدمو خدمات معلومات الحساب.' },
    status: 'in_progress',
    pages: 11,
    sourceFile: 'SAMA_OB_2026_12_Open-Banking-Reporting-Template_AR.pdf',
    body: [
      { ref: 'م-1', text: { ar: 'يجب على مقدمي الخدمة رفع تقرير شهري بعدد طلبات الوصول إلى بيانات الحساب ونسب النجاح ومتوسط زمن الاستجابة، وفق النموذج المرفق.', en: 'Service providers must submit a monthly report of account information access requests, success rates and average response time, using the attached template.' } },
      { ref: 'م-2', text: { ar: 'يجب الحصول على موافقة صريحة من العميل قبل كل وصول إلى بيانات حسابه، وحفظ سجل بالموافقات لمدة لا تقل عن خمس سنوات.', en: 'Explicit customer consent must be obtained before each access to account data, and a record of consents retained for no less than five years.' } },
      { ref: 'م-3', text: { ar: 'يجب أن يتمكن العميل من سحب موافقته في أي وقت عبر القناة نفسها، وأن يسري السحب خلال يوم عمل واحد.', en: 'A customer must be able to withdraw consent at any time through the same channel, and the withdrawal must take effect within one working day.' } },
    ],
  },

  /* -------------------------------------------------------- insurance --- */
  {
    id: 'ANN-2026-0910',
    reference: 'IA/CIR/2026/22',
    sectors: ['insurance'],
    regulator: 'ia',
    title: { en: 'Motor Claims Settlement Periods and Notification', ar: 'مدد تسوية مطالبات المركبات والإشعار' },
    issued: '2026-09-10',
    received: '2026-09-10T08:30:00',
    deadline: '2026-11-09',
    appliesTo: {
      en: 'Insurance companies writing motor business and the claims service providers acting for them.',
      ar: 'شركات التأمين التي تكتتب في تأمين المركبات ومقدمو خدمات المطالبات العاملون لحسابها.',
    },
    status: 'new',
    pages: 7,
    sourceFile: 'IA_CIR_2026_22_Motor-Claims-Settlement-Periods_AR.pdf',
    body: [
      { ref: 'p.0', text: { ar: 'بناءً على الصلاحيات الممنوحة لهيئة التأمين بموجب نظامها، وحرصاً على حماية حقوق حملة الوثائق والمستفيدين، تصدر الهيئة هذا التعميم بشأن مدد تسوية مطالبات المركبات وإشعار أصحابها، على أن يُعمل به بعد ستين يوماً من تاريخ نشره.', en: 'Pursuant to the powers granted to the Insurance Authority under its Law, and to protect the rights of policyholders and beneficiaries, the Authority issues this circular on motor claim settlement periods and claimant notification, effective sixty days from publication.' } },
      { ref: 'م-1', text: { ar: 'المادة الأولى — النطاق: يسري هذا التعميم على جميع شركات التأمين المرخصة التي تكتتب في تأمين المركبات، وعلى مزودي خدمات المطالبات ومقدري الخسائر العاملين لحسابها.', en: 'Article One — Scope: This circular applies to all licensed insurance companies writing motor business, and to the claims service providers and loss assessors acting on their behalf.' } },
      { ref: 'م-2-أ', text: { ar: 'المادة الثانية (أ) — يجب على الشركة تسوية مطالبة المركبات المكتملة للفرد خلال عشرة أيام عمل من تاريخ اكتمال المستندات، بدلاً من خمسة عشر يوم عمل.', en: 'Article Two (a) — A complete individual motor claim must be settled within ten working days of the date the documents are complete, instead of fifteen working days.' } },
      { ref: 'م-2-ب', text: { ar: 'المادة الثانية (ب) — يجب إشعار مقدم المطالبة برقم المطالبة وبالمدة المتوقعة للتسوية عبر رسالة نصية فور تسجيلها.', en: 'Article Two (b) — The claimant must be notified of the claim number and the expected settlement period by text message immediately upon registration.' } },
      { ref: 'م-3', text: { ar: 'المادة الثالثة — يجب على الشركة دفع الجزء غير المتنازع عليه من المطالبة خلال خمسة أيام عمل من إقرار المسؤولية، دون انتظار الاتفاق على باقي المبلغ.', en: 'Article Three — The undisputed part of a claim must be paid within five working days of liability being admitted, without waiting for agreement on the remainder.' } },
      { ref: 'م-4', text: { ar: 'المادة الرابعة — يجب أن يتضمن قرار رفض المطالبة بند الوثيقة المستند إليه ونصه باللغة العربية، وإشعار مقدم المطالبة بحقه في رفع شكواه إلى الهيئة.', en: 'Article Four — A decision to decline a claim must state the policy clause relied on and its text in Arabic, and inform the claimant of the right to raise a complaint with the Authority.' } },
      { ref: 'م-5', text: { ar: 'المادة الخامسة — يجب أن يحتسب نظام المطالبات لدى الشركة أيام العمل آلياً لكل مطالبة، وأن ينبّه المسؤول ومديره قبل انقضاء المدة بيوم عمل.', en: 'Article Five — The claims system must count working days automatically for each claim and alert the owner and their manager one working day before the period expires.' } },
      { ref: 'م-6', text: { ar: 'المادة السادسة — يجب على الشركة رفع تقرير ربع سنوي إلى الهيئة يتضمن عدد المطالبات ومتوسط مدة التسوية ونسبة المطالبات المرفوضة وأسباب الرفض.', en: 'Article Six — A quarterly report must be submitted to the Authority stating claim volumes, the average settlement period, the rejection rate and the reasons for rejection.' } },
      { ref: 'م-7', text: { ar: 'المادة السابعة — تتحمل الشركة المسؤولية الكاملة عن أعمال مقدري الخسائر ومزودي خدمات المطالبات، ويجب أن تتضمن عقودهم التزاماً بالمدد الواردة في هذا التعميم.', en: 'Article Seven — The company bears full responsibility for the work of loss assessors and claims service providers, and their contracts must contain an undertaking to meet the periods in this circular.' } },
      { ref: 'م-8', text: { ar: 'المادة الثامنة — يجب تحديث جميع النصوص الموجهة لحملة الوثائق التي تشير إلى مدد التسوية، بما في ذلك الرسائل النصية وشاشات التطبيق وصفحات الموقع.', en: 'Article Eight — All policyholder-facing texts referring to settlement periods must be updated, including text messages, application screens and website pages.' } },
    ],
  },
  {
    id: 'ANN-2026-0905',
    reference: 'IA/CIR/2026/17',
    sectors: ['insurance'],
    regulator: 'ia',
    title: { en: 'Motor Insurance Pricing Controls', ar: 'ضوابط تسعير تأمين المركبات' },
    issued: '2026-09-05',
    received: '2026-09-05T08:12:00',
    deadline: '2026-10-20',
    appliesTo: { en: 'Insurance companies writing motor business.', ar: 'شركات التأمين التي تكتتب في تأمين المركبات.' },
    status: 'in_progress',
    pages: 6,
    sourceFile: 'IA_CIR_2026_17_Motor-Pricing-Controls_AR.pdf',
    body: [
      { ref: 'م-1', text: { ar: 'تلتزم شركات التأمين بأن تكون أسعار المنتجات عادلة وغير مبالغ فيها، وأن تُبنى على أسس اكتوارية وقواعد اكتتاب سليمة مدعومة ببيانات وتجارب موثوقة.', en: 'Insurance companies must ensure product prices are fair and not excessive, built on sound actuarial and underwriting bases supported by reliable data and experience.' } },
      { ref: 'م-2', text: { ar: 'لا يجوز للشركة الاعتماد على الأسعار التي تطبقها الشركات الأخرى فقط، وعليها تزويد الهيئة بالأسس المستخدمة في تحديد الأسعار.', en: 'A company may not rely solely on the prices applied by other companies, and must provide the Authority with the bases used to set prices.' } },
      { ref: 'م-3', text: { ar: 'يجب اعتماد عوامل التسعير من الخبير الاكتواري المعتمد قبل استخدامها، وتوثيق أثر كل عامل على السعر النهائي.', en: 'Rating factors must be approved by the appointed actuary before use, and the effect of each factor on the final price documented.' } },
    ],
  },

  /* ---------------------------------------------------- capital market --- */
  {
    id: 'ANN-2026-0908',
    reference: 'CMA/RES/2026/3-6',
    sectors: ['capital'],
    regulator: 'cma',
    title: { en: 'Amendments to the Market Conduct Regulations', ar: 'تعديلات على لائحة سلوكيات السوق' },
    issued: '2026-09-08',
    received: '2026-09-08T08:40:00',
    deadline: '2026-12-07',
    appliesTo: {
      en: 'Capital market institutions and listed companies.',
      ar: 'مؤسسات السوق المالية والشركات المدرجة.',
    },
    status: 'new',
    pages: 14,
    sourceFile: 'CMA_RES_2026_3-6_Market-Conduct-Amendments_AR.pdf',
    body: [
      { ref: 'p.0', text: { ar: 'بناءً على نظام السوق المالية الصادر بالمرسوم الملكي رقم (م/30)، قرر مجلس هيئة السوق المالية تعديل لائحة سلوكيات السوق وفق الصيغة المرفقة، ويُعمل بها بعد تسعين يوماً من تاريخ نشرها.', en: 'Pursuant to the Capital Market Law issued by Royal Decree (M/30), the Board of the Capital Market Authority resolved to amend the Market Conduct Regulations in the attached form, effective ninety days from publication.' } },
      { ref: 'م-1', text: { ar: 'المادة الأولى — تُعدّل قائمة المصطلحات بإضافة تعريف «المعلومة الجوهرية غير المنشورة» و«قائمة المطلعين»، وفقاً للنص المرفق.', en: 'Article One — The list of defined terms is amended to add definitions of “unpublished material information” and “insider list”, in accordance with the attached text.' } },
      { ref: 'م-2', text: { ar: 'المادة الثانية — يجب على مؤسسة السوق المالية مراجعة تنبيهات نظام مراقبة السوق خلال يوم عمل واحد من صدورها، وتوثيق نتيجة المراجعة لكل تنبيه.', en: 'Article Two — A capital market institution must review market surveillance alerts within one working day of generation, and document the outcome of the review for each alert.' } },
      { ref: 'م-3', text: { ar: 'المادة الثالثة — يجب إنشاء قائمة مطلعين لكل تفويض يتضمن معلومات جوهرية غير منشورة، تتضمن اسم كل شخص وتاريخ ووقت إضافته وسبب اطلاعه.', en: 'Article Three — An insider list must be created for every mandate involving unpublished material information, recording each person, the date and time they were added, and the reason for their access.' } },
      { ref: 'م-4', text: { ar: 'المادة الرابعة — يجب الإفصاح عن أي تعارض مصالح محتمل للعميل كتابةً قبل تقديم التوصية، وتوثيق الإفصاح في ملف العميل.', en: 'Article Four — Any potential conflict of interest must be disclosed to the client in writing before a recommendation is made, and the disclosure documented in the client file.' } },
      { ref: 'م-5', text: { ar: 'المادة الخامسة — يجب أن تتم جميع مراسلات التعامل مع العملاء عبر قنوات مسجلة، وأن تُحفظ التسجيلات والسجلات لمدة عشر سنوات.', en: 'Article Five — All client dealing communications must take place over recorded channels, and the recordings and records retained for ten years.' } },
      { ref: 'م-6', text: { ar: 'المادة السادسة — يجب الحصول على موافقة مسبقة مكتوبة من إدارة الالتزام على كل تعامل شخصي لموظف في ورقة مالية مدرجة، وحفظ الموافقات.', en: 'Article Six — Written pre-approval from the compliance function is required for every personal deal by an employee in a listed security, and approvals must be retained.' } },
      { ref: 'م-7', text: { ar: 'المادة السابعة — تلتزم الشركات المدرجة بالإفصاح عن التطورات الجوهرية فور حدوثها وقبل بدء جلسة التداول التالية.', en: 'Article Seven — Listed companies must disclose material developments as soon as they occur and before the start of the next trading session.' } },
      { ref: 'م-8', text: { ar: 'المادة الثامنة — يجب رفع تقرير نصف سنوي إلى الهيئة يتضمن عدد التنبيهات وحالات الاشتباه المصعّدة والإجراءات المتخذة.', en: 'Article Eight — A semi-annual report must be submitted to the Authority stating alert volumes, escalated suspicions and the action taken.' } },
    ],
  },

  /* ------------------------------------------------------ all sectors --- */
  {
    id: 'ANN-2026-0828',
    reference: 'SDAIA/PDPL/2026/8',
    sectors: ['bank', 'insurance', 'capital'],
    regulator: 'sdaia',
    title: {
      en: 'Controls for Transferring Personal Data Outside the Kingdom',
      ar: 'ضوابط نقل البيانات الشخصية خارج المملكة',
    },
    issued: '2026-08-28',
    received: '2026-08-28T10:00:00',
    deadline: '2026-11-26',
    appliesTo: { en: 'All controllers processing personal data of individuals inside the Kingdom.', ar: 'جميع جهات التحكم التي تعالج بيانات شخصية لأفراد داخل المملكة.' },
    status: 'reported',
    pages: 8,
    sourceFile: 'SDAIA_PDPL_2026_8_Cross-Border-Transfer-Controls_AR.pdf',
    body: [
      { ref: 'م-1', text: { ar: 'لا يجوز نقل البيانات الشخصية خارج المملكة إلا بعد إجراء تقييم لأثر النقل وتوثيقه، والتحقق من أن الجهة المستقبلة توفر مستوى حماية لا يقل عن المستوى المقرر في النظام.', en: 'Personal data may not be transferred outside the Kingdom until a transfer impact assessment has been performed and documented, and the receiving party verified to provide a level of protection no lower than the Law requires.' } },
      { ref: 'م-2', text: { ar: 'يجب الاحتفاظ بسجل لجميع عمليات النقل خارج المملكة يتضمن الغرض والفئات المنقولة والجهة المستقبلة وتاريخ النقل.', en: 'A register of all cross-border transfers must be maintained, stating the purpose, the categories transferred, the receiving party and the transfer date.' } },
      { ref: 'م-3', text: { ar: 'يجب مراجعة تقييم أثر النقل سنوياً وعند أي تغيير جوهري في الخدمة أو الجهة المستقبلة.', en: 'The transfer impact assessment must be reviewed annually and on any material change to the service or the receiving party.' } },
    ],
  },
];

export const announcementById = (id: string) => ANNOUNCEMENTS.find((a) => a.id === id);

/** Only the letters that bind this institution's sector. */
export const announcementsFor = (sector: SectorId) => ANNOUNCEMENTS.filter((a) => a.sectors.includes(sector));

/** The letter each institution opens first. */
export const LIVE_ANNOUNCEMENT: Record<string, string> = {
  'TN-BANK': 'ANN-2026-0912',
  'TN-INS': 'ANN-2026-0910',
  'TN-CAP': 'ANN-2026-0908',
};
