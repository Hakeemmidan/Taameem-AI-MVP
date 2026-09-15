import type { Department, DepartmentId, Employee } from '@/lib/types';
import type { RoleId } from './tenants';

/**
 * Three separate institutions. A department id such as `compliance` exists in
 * more than one of them, so departments are always looked up by tenant as well.
 */

const d = (
  tenantId: string,
  id: DepartmentId,
  en: string,
  ar: string,
  shortEn: string,
  shortAr: string,
  headId: string,
  icon: string,
  headcount: number,
): Department => ({ tenantId, id, name: { en, ar }, short: { en: shortEn, ar: shortAr }, headId, icon, headcount });

const e = (
  tenantId: string,
  id: string,
  en: string,
  ar: string,
  titleEn: string,
  titleAr: string,
  department: DepartmentId,
  role: RoleId,
  approver: boolean,
  hue: number,
  joined: string,
  signIn = false,
): Employee => ({
  tenantId,
  id,
  role,
  name: { en, ar },
  title: { en: titleEn, ar: titleAr },
  department,
  approver,
  hue,
  joined,
  signIn,
  email: `${en.split(' ')[0].toLowerCase()}.${en.split(' ').slice(-1)[0].replace('Al-', '').toLowerCase()}@${tenantId === 'TN-BANK' ? 'innovationbank' : tenantId === 'TN-INS' ? 'sahaab' : 'rawdacapital'}.com.sa`,
  phone: `+9665${(id.charCodeAt(2) % 5) + 3}${String(1000000 + id.charCodeAt(4) * 7919).slice(-7)}`,
});

/* ===================================================== Innovation Bank ==== */

const BANK_DEPTS: Department[] = [
  d('TN-BANK', 'compliance', 'Compliance', 'إدارة الالتزام', 'Compliance', 'الالتزام', 'E-001', 'ShieldCheck', 18),
  d('TN-BANK', 'legal', 'Legal Affairs', 'الشؤون القانونية', 'Legal', 'القانونية', 'E-010', 'Scale', 11),
  d('TN-BANK', 'it', 'Information Technology', 'تقنية المعلومات', 'IT', 'التقنية', 'E-020', 'Server', 96),
  d('TN-BANK', 'operations', 'Operations', 'العمليات', 'Operations', 'العمليات', 'E-030', 'Settings2', 142),
  d('TN-BANK', 'risk', 'Risk Management', 'إدارة المخاطر', 'Risk', 'المخاطر', 'E-040', 'AlertTriangle', 24),
  d('TN-BANK', 'audit', 'Internal Audit', 'المراجعة الداخلية', 'Audit', 'المراجعة', 'E-050', 'ClipboardCheck', 15),
  d('TN-BANK', 'retail', 'Retail Banking', 'الخدمات المصرفية للأفراد', 'Retail', 'الأفراد', 'E-060', 'Landmark', 310),
  d('TN-BANK', 'care', 'Customer Care', 'العناية بالعملاء', 'Care', 'العناية', 'E-070', 'Headphones', 128),
  d('TN-BANK', 'aml', 'Financial Crime & AML', 'مكافحة الجرائم المالية', 'AML', 'غسل الأموال', 'E-080', 'Search', 22),
  d('TN-BANK', 'infosec', 'Information Security', 'أمن المعلومات', 'InfoSec', 'أمن المعلومات', 'E-090', 'Lock', 27),
  d('TN-BANK', 'privacy', 'Data & Privacy', 'البيانات والخصوصية', 'Privacy', 'الخصوصية', 'E-100', 'Fingerprint', 9),
  d('TN-BANK', 'hr', 'Human Resources', 'الموارد البشرية', 'HR', 'الموارد البشرية', 'E-110', 'Users', 34),
  d('TN-BANK', 'finance', 'Finance', 'الإدارة المالية', 'Finance', 'المالية', 'E-120', 'Wallet', 41),
  d('TN-BANK', 'marketing', 'Marketing & Communications', 'التسويق والاتصال', 'Marketing', 'التسويق', 'E-130', 'Megaphone', 26),
  d('TN-BANK', 'procurement', 'Procurement & Outsourcing', 'المشتريات والإسناد', 'Procurement', 'المشتريات', 'E-140', 'Package', 17),
];

const B = 'TN-BANK';
const BANK_PEOPLE: Employee[] = [
  e(B, 'E-001', 'Sarah Abdullah Al-Rashid', 'سارة عبدالله الرشيد', 'Chief Compliance Officer', 'رئيس إدارة الالتزام', 'compliance', 'cco', true, 168, '2016-03-01', true),
  e(B, 'E-002', 'Faisal Nasser Al-Otaibi', 'فيصل ناصر العتيبي', 'Compliance Manager', 'مدير الالتزام', 'compliance', 'manager', true, 210, '2018-09-12', true),
  e(B, 'E-003', 'Nouf Saad Al-Qahtani', 'نوف سعد القحطاني', 'Regulatory Reporting Officer', 'أخصائي التقارير الرقابية', 'compliance', 'officer', false, 288, '2020-01-05', true),
  e(B, 'E-004', 'Mishal Turki Al-Harbi', 'مشعل تركي الحربي', 'Compliance Analyst', 'محلل التزام', 'compliance', 'officer', false, 24, '2022-06-19'),
  e(B, 'E-010', 'Khalid Ibrahim Al-Suwailem', 'خالد إبراهيم السويلم', 'Head of Legal', 'رئيس الشؤون القانونية', 'legal', 'dept_head', true, 246, '2014-11-02'),
  e(B, 'E-011', 'Hessa Mohammed Al-Dossari', 'حصة محمد الدوسري', 'Senior Legal Counsel', 'مستشار قانوني أول', 'legal', 'dept_head', true, 320, '2019-04-14'),
  e(B, 'E-012', 'Ziyad Fahad Al-Mutairi', 'زياد فهد المطيري', 'Contracts Counsel', 'مستشار العقود', 'legal', 'dept_head', false, 42, '2021-08-30'),
  e(B, 'E-020', 'Abdulaziz Saleh Al-Ghamdi', 'عبدالعزيز صالح الغامدي', 'Chief Information Officer', 'رئيس تقنية المعلومات', 'it', 'dept_head', true, 200, '2015-02-08'),
  e(B, 'E-021', 'Rana Yousef Al-Zahrani', 'رنا يوسف الزهراني', 'Head of Core Banking Systems', 'رئيس أنظمة البنك الأساسية', 'it', 'dept_head', true, 300, '2017-10-22', true),
  e(B, 'E-022', 'Bandar Majed Al-Subaie', 'بندر ماجد السبيعي', 'Integration Lead', 'قائد فريق التكامل', 'it', 'dept_head', false, 190, '2020-05-11'),
  e(B, 'E-023', 'Layan Tariq Al-Amri', 'ليان طارق العمري', 'Business Analyst', 'محلل أعمال', 'it', 'dept_head', false, 335, '2023-02-01'),
  e(B, 'E-030', 'Saud Abdulrahman Al-Anzi', 'سعود عبدالرحمن العنزي', 'Head of Operations', 'رئيس العمليات', 'operations', 'dept_head', true, 28, '2013-07-15'),
  e(B, 'E-031', 'Maha Salem Al-Juhani', 'مها سالم الجهني', 'Service Delivery Manager', 'مدير تقديم الخدمة', 'operations', 'dept_head', true, 350, '2018-03-26'),
  e(B, 'E-032', 'Yazeed Hamad Al-Shehri', 'يزيد حمد الشهري', 'Branch Operations Supervisor', 'مشرف عمليات الفروع', 'operations', 'dept_head', false, 60, '2021-01-18'),
  e(B, 'E-040', 'Reem Khalid Al-Nasser', 'ريم خالد الناصر', 'Chief Risk Officer', 'رئيس إدارة المخاطر', 'risk', 'dept_head', true, 278, '2016-09-05'),
  e(B, 'E-041', 'Nawaf Ali Al-Balawi', 'نواف علي البلوي', 'Operational Risk Manager', 'مدير المخاطر التشغيلية', 'risk', 'dept_head', false, 218, '2019-12-01'),
  e(B, 'E-050', 'Talal Saad Al-Hamdan', 'طلال سعد الحمدان', 'Head of Internal Audit', 'رئيس المراجعة الداخلية', 'audit', 'auditor', true, 12, '2012-04-23', true),
  e(B, 'E-051', 'Jawaher Nasser Al-Yami', 'جواهر ناصر اليامي', 'Senior Auditor', 'مراجع أول', 'audit', 'auditor', false, 312, '2020-10-04'),
  e(B, 'E-060', 'Meshari Abdullah Al-Turki', 'مشاري عبدالله التركي', 'Head of Retail Banking', 'رئيس الخدمات المصرفية للأفراد', 'retail', 'dept_head', true, 176, '2015-06-30'),
  e(B, 'E-061', 'Afnan Waleed Al-Malki', 'أفنان وليد المالكي', 'Product Manager, Accounts', 'مدير منتج الحسابات', 'retail', 'dept_head', false, 330, '2021-11-07'),
  e(B, 'E-070', 'Ghada Sultan Al-Ajmi', 'غادة سلطان العجمي', 'Head of Customer Care', 'رئيس العناية بالعملاء', 'care', 'dept_head', true, 292, '2017-01-16', true),
  e(B, 'E-071', 'Rakan Badr Al-Osaimi', 'راكان بدر العصيمي', 'Complaints Unit Supervisor', 'مشرف وحدة الشكاوى', 'care', 'dept_head', true, 36, '2019-08-25'),
  e(B, 'E-072', 'Shatha Omar Al-Sharif', 'شذى عمر الشريف', 'Contact Centre Team Lead', 'قائد فريق مركز الاتصال', 'care', 'dept_head', false, 340, '2022-02-13'),
  e(B, 'E-080', 'Sultan Mohammed Al-Rasheed', 'سلطان محمد الرشيد', 'Head of Financial Crime', 'رئيس مكافحة الجرائم المالية', 'aml', 'dept_head', true, 8, '2014-05-19'),
  e(B, 'E-081', 'Aseel Fahad Al-Dakhil', 'أسيل فهد الداخل', 'Deputy MLRO', 'نائب مسؤول الإبلاغ عن غسل الأموال', 'aml', 'dept_head', true, 305, '2018-11-11'),
  e(B, 'E-082', 'Anas Raed Al-Twaijri', 'أنس رائد التويجري', 'Transaction Monitoring Analyst', 'محلل مراقبة العمليات', 'aml', 'dept_head', false, 196, '2021-04-04'),
  e(B, 'E-090', 'Waleed Saud Al-Babtain', 'وليد سعود البابطين', 'Chief Information Security Officer', 'رئيس أمن المعلومات', 'infosec', 'dept_head', true, 226, '2016-12-12'),
  e(B, 'E-091', 'Dana Hisham Al-Sudairy', 'دانة هشام السديري', 'Security Operations Lead', 'قائد عمليات الأمن', 'infosec', 'dept_head', false, 264, '2020-07-20'),
  e(B, 'E-100', 'Norah Abdulaziz Al-Fahad', 'نورة عبدالعزيز الفهد', 'Data Protection Officer', 'مسؤول حماية البيانات', 'privacy', 'dept_head', true, 284, '2023-09-03'),
  e(B, 'E-101', 'Omar Bandar Al-Muhaisen', 'عمر بندر المحيسن', 'Data Governance Analyst', 'محلل حوكمة البيانات', 'privacy', 'dept_head', false, 204, '2022-10-17'),
  e(B, 'E-110', 'Munira Saleh Al-Saleh', 'منيرة صالح الصالح', 'Head of Human Resources', 'رئيس الموارد البشرية', 'hr', 'dept_head', true, 316, '2013-02-25'),
  e(B, 'E-111', 'Tariq Nayef Al-Qahtani', 'طارق نايف القحطاني', 'Learning & Development Manager', 'مدير التدريب والتطوير', 'hr', 'dept_head', false, 48, '2019-05-06'),
  e(B, 'E-120', 'Badr Ibrahim Al-Sadhan', 'بدر إبراهيم السدحان', 'Chief Financial Officer', 'الرئيس المالي', 'finance', 'dept_head', true, 152, '2012-08-09'),
  e(B, 'E-121', 'Arwa Mansour Al-Harbi', 'أروى منصور الحربي', 'Financial Controller', 'المراقب المالي', 'finance', 'dept_head', false, 296, '2018-06-18'),
  e(B, 'E-130', 'Tala Faisal Al-Rajhi', 'تالا فيصل الراجحي', 'Head of Marketing', 'رئيس التسويق', 'marketing', 'dept_head', true, 326, '2019-02-11'),
  e(B, 'E-131', 'Salman Adel Al-Otaibi', 'سلمان عادل العتيبي', 'Digital Content Lead', 'قائد المحتوى الرقمي', 'marketing', 'dept_head', false, 20, '2022-09-05'),
  e(B, 'E-140', 'Hisham Nasser Al-Qudaimi', 'هشام ناصر القديمي', 'Head of Procurement', 'رئيس المشتريات', 'procurement', 'dept_head', true, 232, '2016-04-27'),
  e(B, 'E-141', 'Bushra Adel Al-Mousa', 'بشرى عادل الموسى', 'Vendor Management Officer', 'أخصائي إدارة الموردين', 'procurement', 'dept_head', false, 308, '2021-07-12'),
];

/* ================================================== Sahaab Insurance ====== */

const INS_DEPTS: Department[] = [
  d('TN-INS', 'compliance', 'Compliance', 'إدارة الالتزام', 'Compliance', 'الالتزام', 'E-201', 'ShieldCheck', 7),
  d('TN-INS', 'claims', 'Claims', 'إدارة المطالبات', 'Claims', 'المطالبات', 'E-210', 'FileCheck2', 96),
  d('TN-INS', 'underwriting', 'Underwriting', 'الاكتتاب', 'Underwriting', 'الاكتتاب', 'E-220', 'PenLine', 48),
  d('TN-INS', 'actuarial', 'Actuarial & Pricing', 'الاكتوارية والتسعير', 'Actuarial', 'الاكتوارية', 'E-230', 'ChartCandlestick', 9),
  d('TN-INS', 'care', 'Policyholder Care', 'العناية بحملة الوثائق', 'Care', 'العناية', 'E-240', 'Headphones', 62),
  d('TN-INS', 'legal', 'Legal Affairs', 'الشؤون القانونية', 'Legal', 'القانونية', 'E-250', 'Scale', 6),
  d('TN-INS', 'it', 'Information Technology', 'تقنية المعلومات', 'IT', 'التقنية', 'E-260', 'Server', 34),
  d('TN-INS', 'risk', 'Risk Management', 'إدارة المخاطر', 'Risk', 'المخاطر', 'E-270', 'AlertTriangle', 8),
  d('TN-INS', 'audit', 'Internal Audit', 'المراجعة الداخلية', 'Audit', 'المراجعة', 'E-280', 'ClipboardCheck', 5),
  d('TN-INS', 'infosec', 'Information Security', 'أمن المعلومات', 'InfoSec', 'أمن المعلومات', 'E-290', 'Lock', 11),
  d('TN-INS', 'privacy', 'Data & Privacy', 'البيانات والخصوصية', 'Privacy', 'الخصوصية', 'E-295', 'Fingerprint', 3),
  d('TN-INS', 'operations', 'Operations', 'العمليات', 'Operations', 'العمليات', 'E-300', 'Settings2', 40),
  d('TN-INS', 'finance', 'Finance', 'الإدارة المالية', 'Finance', 'المالية', 'E-310', 'Wallet', 18),
  d('TN-INS', 'marketing', 'Marketing', 'التسويق', 'Marketing', 'التسويق', 'E-320', 'Megaphone', 9),
  d('TN-INS', 'hr', 'Human Resources', 'الموارد البشرية', 'HR', 'الموارد البشرية', 'E-330', 'Users', 12),
];

const I = 'TN-INS';
const INS_PEOPLE: Employee[] = [
  e(I, 'E-201', 'Lama Abdulmohsen Al-Barrak', 'لمى عبدالمحسن البراك', 'Chief Compliance Officer', 'رئيس إدارة الالتزام', 'compliance', 'cco', true, 30, '2017-05-14', true),
  e(I, 'E-202', 'Ibrahim Saleh Al-Zamil', 'إبراهيم صالح الزامل', 'Compliance Manager', 'مدير الالتزام', 'compliance', 'manager', true, 214, '2019-10-02', true),
  e(I, 'E-203', 'Hind Faisal Al-Shammari', 'هند فيصل الشمري', 'Regulatory Reporting Officer', 'أخصائي التقارير الرقابية', 'compliance', 'officer', false, 300, '2021-03-08', true),
  e(I, 'E-210', 'Abdulrahman Saad Al-Ruwaili', 'عبدالرحمن سعد الرويلي', 'Head of Claims', 'رئيس إدارة المطالبات', 'claims', 'dept_head', true, 190, '2014-08-17', true),
  e(I, 'E-211', 'Wijdan Majed Al-Otaibi', 'وجدان ماجد العتيبي', 'Motor Claims Supervisor', 'مشرف مطالبات المركبات', 'claims', 'dept_head', true, 336, '2019-01-21'),
  e(I, 'E-212', 'Fahad Nasser Al-Qarni', 'فهد ناصر القرني', 'Medical Claims Supervisor', 'مشرف المطالبات الطبية', 'claims', 'dept_head', false, 46, '2020-09-13'),
  e(I, 'E-220', 'Amal Turki Al-Hazmi', 'أمل تركي الحازمي', 'Head of Underwriting', 'رئيس الاكتتاب', 'underwriting', 'dept_head', true, 274, '2016-02-29'),
  e(I, 'E-221', 'Saleh Abdullah Al-Nafea', 'صالح عبدالله النافع', 'Motor Underwriting Manager', 'مدير اكتتاب المركبات', 'underwriting', 'dept_head', false, 84, '2021-06-06'),
  e(I, 'E-230', 'Rayan Majed Al-Suhaimi', 'ريان ماجد السهيمي', 'Appointed Actuary', 'الخبير الاكتواري المعتمد', 'actuarial', 'dept_head', true, 258, '2018-04-10'),
  e(I, 'E-231', 'Bushra Khalid Al-Faraj', 'بشرى خالد الفرج', 'Pricing Analyst', 'محلل تسعير', 'actuarial', 'dept_head', false, 318, '2022-01-24'),
  e(I, 'E-240', 'Noura Sultan Al-Dawsari', 'نورة سلطان الدوسري', 'Head of Policyholder Care', 'رئيس العناية بحملة الوثائق', 'care', 'dept_head', true, 296, '2018-07-30'),
  e(I, 'E-241', 'Turki Hamad Al-Enezi', 'تركي حمد العنزي', 'Complaints Unit Supervisor', 'مشرف وحدة الشكاوى', 'care', 'dept_head', true, 16, '2020-11-15'),
  e(I, 'E-250', 'Dalal Ibrahim Al-Kathiri', 'دلال إبراهيم الكثيري', 'Head of Legal', 'رئيس الشؤون القانونية', 'legal', 'dept_head', true, 342, '2017-09-11'),
  e(I, 'E-260', 'Mohammed Ali Al-Ghamdi', 'محمد علي الغامدي', 'Head of Information Technology', 'رئيس تقنية المعلومات', 'it', 'dept_head', true, 206, '2016-06-20', true),
  e(I, 'E-261', 'Sara Waleed Al-Mutlaq', 'سارة وليد المطلق', 'Applications Manager', 'مدير التطبيقات', 'it', 'dept_head', false, 288, '2021-02-14'),
  e(I, 'E-270', 'Yousef Rashed Al-Hamad', 'يوسف راشد الحمد', 'Chief Risk Officer', 'رئيس إدارة المخاطر', 'risk', 'dept_head', true, 222, '2015-12-01'),
  e(I, 'E-280', 'Aljohara Nasser Al-Sultan', 'الجوهرة ناصر السلطان', 'Head of Internal Audit', 'رئيس المراجعة الداخلية', 'audit', 'auditor', true, 310, '2016-10-09', true),
  e(I, 'E-290', 'Meshal Omar Al-Shaya', 'مشعل عمر الشايع', 'Chief Information Security Officer', 'رئيس أمن المعلومات', 'infosec', 'dept_head', true, 234, '2019-03-03'),
  e(I, 'E-295', 'Reema Adel Al-Bassam', 'ريما عادل البسام', 'Data Protection Officer', 'مسؤول حماية البيانات', 'privacy', 'dept_head', true, 280, '2023-08-21'),
  e(I, 'E-300', 'Nawaf Saud Al-Muqrin', 'نواف سعود المقرن', 'Head of Operations', 'رئيس العمليات', 'operations', 'dept_head', true, 54, '2015-04-05'),
  e(I, 'E-310', 'Haya Mansour Al-Duaij', 'هيا منصور الدعيج', 'Chief Financial Officer', 'الرئيس المالي', 'finance', 'dept_head', true, 328, '2014-01-19'),
  e(I, 'E-320', 'Rakan Fahad Al-Sabti', 'راكان فهد السبتي', 'Head of Marketing', 'رئيس التسويق', 'marketing', 'dept_head', true, 12, '2020-02-27'),
  e(I, 'E-330', 'Latifa Saad Al-Rubaish', 'لطيفة سعد الربيش', 'Head of Human Resources', 'رئيس الموارد البشرية', 'hr', 'dept_head', true, 302, '2018-12-12'),
];

/* ==================================================== Rawda Capital ======= */

const CAP_DEPTS: Department[] = [
  d('TN-CAP', 'compliance', 'Compliance & AML', 'الالتزام ومكافحة غسل الأموال', 'Compliance', 'الالتزام', 'E-401', 'ShieldCheck', 6),
  d('TN-CAP', 'dealing', 'Dealing & Brokerage', 'التعامل والوساطة', 'Dealing', 'التعامل', 'E-410', 'TrendingUp', 34),
  d('TN-CAP', 'assetmgmt', 'Asset Management', 'إدارة الأصول', 'Asset Mgmt', 'إدارة الأصول', 'E-420', 'Wallet', 22),
  d('TN-CAP', 'research', 'Research & Advisory', 'البحوث والمشورة', 'Research', 'البحوث', 'E-430', 'BookText', 11),
  d('TN-CAP', 'custody', 'Custody', 'الحفظ', 'Custody', 'الحفظ', 'E-440', 'Lock', 9),
  d('TN-CAP', 'operations', 'Operations & Settlement', 'العمليات والتسوية', 'Operations', 'العمليات', 'E-450', 'Settings2', 26),
  d('TN-CAP', 'legal', 'Legal Affairs', 'الشؤون القانونية', 'Legal', 'القانونية', 'E-460', 'Scale', 4),
  d('TN-CAP', 'it', 'Information Technology', 'تقنية المعلومات', 'IT', 'التقنية', 'E-470', 'Server', 19),
  d('TN-CAP', 'risk', 'Risk Management', 'إدارة المخاطر', 'Risk', 'المخاطر', 'E-480', 'AlertTriangle', 5),
  d('TN-CAP', 'audit', 'Internal Audit', 'المراجعة الداخلية', 'Audit', 'المراجعة', 'E-485', 'ClipboardCheck', 3),
  d('TN-CAP', 'infosec', 'Information Security', 'أمن المعلومات', 'InfoSec', 'أمن المعلومات', 'E-490', 'Lock', 7),
  d('TN-CAP', 'privacy', 'Data & Privacy', 'البيانات والخصوصية', 'Privacy', 'الخصوصية', 'E-495', 'Fingerprint', 2),
  d('TN-CAP', 'finance', 'Finance', 'الإدارة المالية', 'Finance', 'المالية', 'E-500', 'Wallet', 8),
  d('TN-CAP', 'hr', 'Human Resources', 'الموارد البشرية', 'HR', 'الموارد البشرية', 'E-510', 'Users', 4),
];

const C = 'TN-CAP';
const CAP_PEOPLE: Employee[] = [
  e(C, 'E-401', 'Maha Abdulaziz Al-Tuwaijri', 'مها عبدالعزيز التويجري', 'Head of Compliance & MLRO', 'رئيس الالتزام ومسؤول الإبلاغ', 'compliance', 'cco', true, 156, '2018-01-08', true),
  e(C, 'E-402', 'Saud Ibrahim Al-Ghannam', 'سعود إبراهيم الغنام', 'Compliance Manager', 'مدير الالتزام', 'compliance', 'manager', true, 242, '2020-06-15', true),
  e(C, 'E-403', 'Shahad Nayef Al-Qahtani', 'شهد نايف القحطاني', 'Compliance Officer', 'أخصائي التزام', 'compliance', 'officer', false, 322, '2022-04-03', true),
  e(C, 'E-410', 'Abdullah Mansour Al-Rashoud', 'عبدالله منصور الرشود', 'Head of Dealing', 'رئيس التعامل', 'dealing', 'dept_head', true, 184, '2016-11-20', true),
  e(C, 'E-411', 'Rawan Turki Al-Shaikh', 'روان تركي الشيخ', 'Senior Dealer', 'متعامل أول', 'dealing', 'dept_head', false, 292, '2019-09-01'),
  e(C, 'E-420', 'Ziyad Abdulrahman Al-Hoshan', 'زياد عبدالرحمن الحوشان', 'Head of Asset Management', 'رئيس إدارة الأصول', 'assetmgmt', 'dept_head', true, 212, '2017-03-27'),
  e(C, 'E-421', 'Nadia Salem Al-Khalidi', 'نادية سالم الخالدي', 'Portfolio Manager', 'مدير محافظ', 'assetmgmt', 'dept_head', false, 314, '2021-05-10'),
  e(C, 'E-430', 'Faris Hamad Al-Dakheel', 'فارس حمد الدخيل', 'Head of Research', 'رئيس البحوث', 'research', 'dept_head', true, 40, '2019-02-18'),
  e(C, 'E-440', 'Lulwah Fahad Al-Rasheed', 'لولوة فهد الرشيد', 'Head of Custody', 'رئيس الحفظ', 'custody', 'dept_head', true, 334, '2018-08-06'),
  e(C, 'E-450', 'Tariq Saleh Al-Jarallah', 'طارق صالح الجارالله', 'Head of Operations & Settlement', 'رئيس العمليات والتسوية', 'operations', 'dept_head', true, 68, '2016-05-23'),
  e(C, 'E-460', 'Areej Nasser Al-Qadi', 'أريج ناصر القاضي', 'Head of Legal', 'رئيس الشؤون القانونية', 'legal', 'dept_head', true, 346, '2019-11-04'),
  e(C, 'E-470', 'Majed Bandar Al-Waleed', 'ماجد بندر الوليد', 'Head of Information Technology', 'رئيس تقنية المعلومات', 'it', 'dept_head', true, 198, '2017-07-17', true),
  e(C, 'E-480', 'Hessa Omar Al-Sanea', 'حصة عمر الصانع', 'Chief Risk Officer', 'رئيس إدارة المخاطر', 'risk', 'dept_head', true, 286, '2018-10-29'),
  e(C, 'E-485', 'Khalid Saud Al-Meshal', 'خالد سعود المشعل', 'Head of Internal Audit', 'رئيس المراجعة الداخلية', 'audit', 'auditor', true, 6, '2017-12-11', true),
  e(C, 'E-490', 'Dania Raed Al-Harthi', 'دانية رائد الحارثي', 'Chief Information Security Officer', 'رئيس أمن المعلومات', 'infosec', 'dept_head', true, 250, '2020-03-30'),
  e(C, 'E-495', 'Omar Faisal Al-Buraik', 'عمر فيصل البريك', 'Data Protection Officer', 'مسؤول حماية البيانات', 'privacy', 'dept_head', true, 268, '2023-06-19'),
  e(C, 'E-500', 'Sultana Adel Al-Onaizan', 'سلطانة عادل العنيزان', 'Chief Financial Officer', 'الرئيس المالي', 'finance', 'dept_head', true, 306, '2016-09-14'),
  e(C, 'E-510', 'Bader Nayef Al-Suwaidan', 'بدر نايف السويدان', 'Head of Human Resources', 'رئيس الموارد البشرية', 'hr', 'dept_head', true, 26, '2019-06-24'),
];

/* ======================================================= combined ========= */

export const DEPARTMENTS: Department[] = [...BANK_DEPTS, ...INS_DEPTS, ...CAP_DEPTS];
export const EMPLOYEES: Employee[] = [...BANK_PEOPLE, ...INS_PEOPLE, ...CAP_PEOPLE];

/** Employee ids are unique across institutions, so this needs no tenant. */
export const byId = (id: string) => EMPLOYEES.find((x) => x.id === id);

/** Department ids repeat across institutions, so this always needs a tenant. */
export const dept = (tenantId: string, id: string) => DEPARTMENTS.find((x) => x.tenantId === tenantId && x.id === id);

export const departmentsOf = (tenantId: string) => DEPARTMENTS.filter((x) => x.tenantId === tenantId);
export const peopleOf = (tenantId: string) => EMPLOYEES.filter((x) => x.tenantId === tenantId);
export const inDept = (tenantId: string, id: string) => EMPLOYEES.filter((x) => x.tenantId === tenantId && x.department === id);
export const headOf = (tenantId: string, id: string) => byId(dept(tenantId, id)?.headId ?? '');

/** Who the sign-in screen offers for each institution. */
export const signInList = (tenantId: string) => peopleOf(tenantId).filter((x) => x.signIn);
