# Information Security Policy
# سياسة أمن المعلومات

| | |
| --- | --- |
| Institution | Innovation Bank · بنك الابتكار |
| Code | POL-SEC-011 |
| Version | 11.0 |
| Owner | Information Security · أمن المعلومات |
| Approved by | Board Risk & Compliance Committee · لجنة المخاطر والالتزام المنبثقة من المجلس |
| Effective | 2025-02-01 |
| Next review | 2026-02-01 |
| Regulators | SAMA, NCA |
| Clauses | 12 |

> Controls protecting the confidentiality, integrity and availability of the bank’s information and systems.
>
> الضوابط التي تحمي سرية معلومات البنك وأنظمته وسلامتها وتوافرها.

## 1. Access Control — ضبط الوصول

### 1.1 Least privilege — أقل صلاحية

Access shall be granted on the principle of least privilege and only for as long as the business need exists.

تُمنح الصلاحيات وفق مبدأ أقل صلاحية ولمدة وجود الحاجة العملية فقط.

`tags: infosec, access`

### 1.2 Multi-factor authentication — المصادقة متعددة العوامل

Multi-factor authentication is mandatory for all remote access, privileged accounts and access to systems holding personal data.

المصادقة متعددة العوامل إلزامية لجميع حالات الوصول عن بُعد والحسابات المميزة والوصول إلى الأنظمة التي تحوي بيانات شخصية.

`tags: infosec, access, mfa`

### 1.3 Access review — مراجعة الصلاحيات

User access rights shall be reviewed by the system owner every ninety days, and privileged access every thirty days.

يراجع مالك النظام صلاحيات المستخدمين كل تسعين يوماً، والصلاحيات المميزة كل ثلاثين يوماً.

`tags: infosec, access, review, timeframe`

### 1.4 Joiners, movers, leavers — الالتحاق والنقل والمغادرة

Access shall be revoked on the same working day an employee leaves the bank or changes role.

تُلغى الصلاحيات في يوم العمل ذاته الذي يغادر فيه الموظف البنك أو يتغير فيه دوره.

`tags: infosec, access, hr, timeframe`

## 2. Protecting Data — حماية البيانات

### 2.1 Encryption in transit — التشفير أثناء النقل

All data in transit over public networks shall be encrypted using protocols approved by the security architecture standard.

تُشفر جميع البيانات المنقولة عبر الشبكات العامة باستخدام بروتوكولات معتمدة في معيار البنية الأمنية.

`tags: infosec, encryption`

### 2.2 Encryption at rest — التشفير أثناء التخزين

Personal and financial data at rest shall be encrypted, and encryption keys shall be managed in a hardware security module.

تُشفر البيانات الشخصية والمالية المخزنة، وتُدار مفاتيح التشفير في وحدة أمان مادية.

`tags: infosec, encryption, keys`

### 2.3 Logging — تسجيل الأحداث

Security-relevant events shall be logged centrally, protected from alteration, and retained for at least eighteen months.

تُسجل الأحداث ذات الأثر الأمني مركزياً وتُحمى من التعديل وتُحفظ لمدة ثمانية عشر شهراً على الأقل.

`tags: infosec, logging, retention, audit-trail`

### 2.4 Segregation of environments — فصل البيئات

Production data shall not be copied into development or test environments unless it has been masked.

لا تُنسخ بيانات الإنتاج إلى بيئات التطوير أو الاختبار ما لم تُخفَ معالمها.

`tags: infosec, environments, pdpl`

## 3. Resilience and Response — الصمود والاستجابة

### 3.1 Vulnerability management — إدارة الثغرات

Critical vulnerabilities shall be remediated within fifteen days of discovery and high vulnerabilities within thirty days.

تُعالج الثغرات الحرجة خلال خمسة عشر يوماً من اكتشافها والثغرات المرتفعة خلال ثلاثين يوماً.

`tags: infosec, vulnerability, timeframe`

### 3.2 Penetration testing — اختبار الاختراق

Internet-facing services shall be penetration tested at least annually and after every major change.

تُختبر الخدمات المتاحة عبر الإنترنت اختبار اختراق سنوياً على الأقل وبعد كل تغيير جوهري.

`tags: infosec, testing, timeframe`

### 3.3 Incident response — الاستجابة للحوادث

A cyber incident shall be declared, classified and reported to the Saudi Central Bank in line with the applicable incident reporting instructions.

يُعلن الحادث السيبراني ويُصنف ويُبلَّغ به البنك المركزي السعودي وفق تعليمات الإبلاغ عن الحوادث السارية.

`tags: infosec, incident, sama, reporting`

### 3.4 Change management — إدارة التغيير

No change may be deployed to production without an approved change record, a test result and a rollback plan.

لا يجوز نشر أي تغيير في بيئة الإنتاج دون سجل تغيير معتمد ونتيجة اختبار وخطة تراجع.

`tags: infosec, change, evidence`
